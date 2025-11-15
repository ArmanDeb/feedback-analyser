// Utility functions for review ingestion
import { prisma } from '$lib/db';
import { analyzeReview } from './ai'; // Legacy single-model (fallback)
import { analyzeReviewsBatch } from './ai-batch'; // Legacy batch (fallback)
import { analyzeReviewsChainedBatch } from './ai-chained'; // New chained pipeline
import { generateEmbedding, formatVectorForPostgres } from './embeddings';

// Dynamic import for app-store-scraper to avoid SSR issues
async function getStoreScraper() {
	const storeModule = await import('app-store-scraper');
	// Handle both CommonJS and ES module exports
	return (storeModule.default && typeof storeModule.default.reviews === 'function') 
		? storeModule.default 
		: storeModule;
}

async function scrapeAppStoreReviews(appId: string, limit: number = 50) {
	try {
		const store = await getStoreScraper();
		
		console.log(`🔍 Store scraper type:`, typeof store);
		console.log(`🔍 Store.reviews type:`, typeof store.reviews);
		
		if (typeof store.reviews !== 'function') {
			throw new Error(`store.reviews is not a function. Got: ${typeof store.reviews}`);
		}
		
		// Use string value directly since ES module import doesn't expose sort enum
		const reviews = await store.reviews({
			id: appId,
			sort: 'mostRecent', // Equivalent to store.sort.RECENT
			page: 0
		});
		
		return reviews.slice(0, limit).map((review: any) => {
			// Handle different date fields (updated or date)
			let reviewDate = new Date();
			if (review.updated) {
				reviewDate = new Date(review.updated);
			} else if (review.date) {
				reviewDate = new Date(review.date);
			}
			
			return {
				storeId: review.id?.toString() || `${reviewDate.getTime()}-${review.id}`,
				rating: review.score || 0,
				body: review.text || '',
				author: review.userName || null,
				createdAt: reviewDate
			};
		});
	} catch (error) {
		console.error(`Error scraping App Store reviews for ${appId}:`, error);
		return [];
	}
}

export async function ingestReviewsForApp(
	appDbId: string,
	appStoreId: string,
	platform: string
): Promise<{ newReviews: number }> {
	let newReviews = 0;
	
	try {
		console.log(`🔍 Starting review ingestion for app ${appDbId} (${appStoreId}, ${platform})`);
		
		let reviews: Array<{
			storeId: string;
			rating: number;
			body: string;
			author: string | null;
			createdAt: Date;
		}> = [];
		
		if (platform === 'ios') {
			console.log(`📱 Fetching iOS reviews for app ID: ${appStoreId}`);
			reviews = await scrapeAppStoreReviews(appStoreId, 50);
			console.log(`✅ Scraped ${reviews.length} reviews`);
		} else if (platform === 'android') {
			// Android scraping not implemented yet
			console.log(`Skipping Android app ${appStoreId} - not implemented`);
			return { newReviews: 0 };
		}
		
		// Save new reviews with AI analysis
		console.log(`💾 Saving ${reviews.length} reviews to database...`);
		// AI analysis enabled - set SKIP_AI_ANALYSIS=true in .env to disable for faster testing
		const skipAI = process.env.SKIP_AI_ANALYSIS === 'true';
		
		// Chained AI analysis (Router -> Specialist models)
		// Use chained pipeline if enabled, otherwise fallback to batch
		const USE_CHAINED_AI = process.env.USE_CHAINED_AI !== 'false'; // Default to true
		let aiAnalyses: Array<any> = [];
		
		if (!skipAI && reviews.length > 0) {
			console.log(`🧠 Analyzing ${reviews.length} reviews using ${USE_CHAINED_AI ? 'chained' : 'batch'} pipeline...`);
			const reviewBodies = reviews.map(r => r.body || '').filter(Boolean);
			
			if (USE_CHAINED_AI) {
				// Use chained pipeline (Router -> Specialist)
				try {
					aiAnalyses = await analyzeReviewsChainedBatch(reviewBodies);
					console.log(`✅ Chained analysis complete: ${aiAnalyses.filter(Boolean).length}/${reviewBodies.length} analyzed`);
				} catch (error) {
					console.error(`❌ Chained analysis failed, falling back to batch:`, error);
					// Fallback to batch
					const BATCH_SIZE = 30;
					for (let i = 0; i < reviewBodies.length; i += BATCH_SIZE) {
						const batch = reviewBodies.slice(i, i + BATCH_SIZE);
						try {
							const batchResults = await analyzeReviewsBatch(batch);
							aiAnalyses.push(...batchResults);
						} catch (batchError) {
							aiAnalyses.push(...new Array(batch.length).fill(null));
						}
					}
				}
			} else {
				// Use legacy batch pipeline
				const BATCH_SIZE = 30;
				for (let i = 0; i < reviewBodies.length; i += BATCH_SIZE) {
					const batch = reviewBodies.slice(i, i + BATCH_SIZE);
					console.log(`📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(reviewBodies.length / BATCH_SIZE)} (${batch.length} reviews)`);
					
					try {
						const batchResults = await analyzeReviewsBatch(batch);
						aiAnalyses.push(...batchResults);
						console.log(`✅ Batch ${Math.floor(i / BATCH_SIZE) + 1} complete: ${batchResults.filter(Boolean).length}/${batch.length} analyzed`);
					} catch (error) {
						console.error(`❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, error);
						aiAnalyses.push(...new Array(batch.length).fill(null));
					}
				}
			}
			
			// Pad with nulls if needed (for empty reviews)
			while (aiAnalyses.length < reviews.length) {
				aiAnalyses.push(null);
			}
		} else {
			aiAnalyses = new Array(reviews.length).fill(null);
		}
		
		for (let i = 0; i < reviews.length; i++) {
			const review = reviews[i];
			// Declare variables outside try block so they're accessible in catch
			let aiAnalysis = aiAnalyses[i] || null;
			let embeddingVector = null;
			
			// Map chained analysis format to database format if needed
			if (aiAnalysis && aiAnalysis.actionability) {
				// Chained analysis format - already compatible, but ensure all fields exist
				aiAnalysis = {
					category: aiAnalysis.category,
					urgency: aiAnalysis.urgency,
					topic: aiAnalysis.topic || '',
					summary: aiAnalysis.summary || ''
				};
			}
			
			try {

				// Generate embedding for clustering (Phase 3)
				if (review.body && review.body.trim().length > 0) {
					try {
						embeddingVector = await generateEmbedding(review.body);
						if (embeddingVector) {
							console.log(`🔢 [${i+1}/${reviews.length}] Generated embedding`);
						}
					} catch (embedError) {
						console.error(`⚠️ [${i+1}/${reviews.length}] Embedding generation failed:`, embedError);
						// Continue without embedding if generation fails
					}
				}

				// Create review first (Prisma handles ID generation)
				const createdReview = await prisma.review.create({
					data: {
						appId: appDbId,
						storeId: review.storeId,
						rating: review.rating,
						body: review.body,
						author: review.author,
						createdAt: review.createdAt,
						// AI Analysis fields
						aiCategory: aiAnalysis?.category || null,
						aiUrgency: aiAnalysis?.urgency || null,
						aiTopic: aiAnalysis?.topic || null,
						aiSummary: aiAnalysis?.summary || null
					}
				});
				
				// Update embedding separately if available (raw SQL for vector type)
				if (embeddingVector) {
					try {
						await prisma.$executeRaw`
							UPDATE "Review" 
							SET "embedding" = ${formatVectorForPostgres(embeddingVector)}::vector
							WHERE "id" = ${createdReview.id}
						`;
						console.log(`💾 [${i+1}/${reviews.length}] Saved review ${review.storeId} with embedding`);
					} catch (embedUpdateError) {
						console.error(`⚠️ [${i+1}/${reviews.length}] Failed to update embedding:`, embedUpdateError);
					}
				} else {
					console.log(`💾 [${i+1}/${reviews.length}] Saved review ${review.storeId} without embedding`);
				}
				
				newReviews++;
			} catch (error: any) {
				// Handle duplicate reviews - update them with embeddings/AI if missing
				if (error.code === 'P2002') {
					console.log(`⏭️ [${i+1}/${reviews.length}] Review exists, checking if update needed: ${review.storeId}`);
					
					// Get existing review ID (can't select embedding directly due to Unsupported type)
					const existingReview = await prisma.review.findUnique({
						where: {
							appId_storeId: {
								appId: appDbId,
								storeId: review.storeId
							}
						},
						select: {
							id: true,
							aiCategory: true
						}
					});
					
					if (existingReview) {
						// Check if embedding exists using raw SQL (can't use Prisma select for Unsupported types)
						const embeddingCheck = await prisma.$queryRaw<Array<{ has_embedding: boolean }>>`
							SELECT (embedding IS NOT NULL) as has_embedding
							FROM "Review"
							WHERE "id" = ${existingReview.id}
						`;
						const hasEmbedding = embeddingCheck[0]?.has_embedding || false;
						
						// Update embedding if missing (embeddingVector is now accessible from outer scope)
						if (!hasEmbedding && embeddingVector) {
							try {
								await prisma.$executeRaw`
									UPDATE "Review" 
									SET "embedding" = ${formatVectorForPostgres(embeddingVector)}::vector
									WHERE "id" = ${existingReview.id}
								`;
								console.log(`✅ [${i+1}/${reviews.length}] Added embedding to existing review`);
							} catch (embedError) {
								console.error(`⚠️ [${i+1}/${reviews.length}] Failed to update embedding:`, embedError);
							}
						}
						
						// Update AI analysis if missing (aiAnalysis is now accessible from outer scope)
						if (!existingReview.aiCategory && aiAnalysis) {
							try {
								await prisma.review.update({
									where: { id: existingReview.id },
									data: {
										aiCategory: aiAnalysis.category || null,
										aiUrgency: aiAnalysis.urgency || null,
										aiTopic: aiAnalysis.topic || null,
										aiSummary: aiAnalysis.summary || null
									}
								});
								console.log(`✅ [${i+1}/${reviews.length}] Added AI analysis to existing review`);
							} catch (aiError) {
								console.error(`⚠️ [${i+1}/${reviews.length}] Failed to update AI analysis:`, aiError);
							}
						}
					}
				} else {
					console.error(`❌ [${i+1}/${reviews.length}] Error saving review:`, error.message);
					console.error(`   Review data:`, { storeId: review.storeId, rating: review.rating, bodyLength: review.body?.length });
				}
			}
		}
		
		console.log(`✅ Successfully saved ${newReviews} new reviews`);
	} catch (error) {
		console.error(`Error processing app ${appDbId}:`, error);
		throw error;
	}
	
	return { newReviews };
}

