// Netlify Cron Job: Ingest reviews from App Store and Play Store
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/db';
import { analyzeReview } from '$lib/server/ai';

// Dynamic import for app-store-scraper to avoid SSR issues
async function getStoreScraper() {
	const storeModule = await import('app-store-scraper');
	// Handle both CommonJS and ES module exports
	return (storeModule.default && typeof storeModule.default.reviews === 'function') 
		? storeModule.default 
		: storeModule;
}

// Simple Play Store scraper (basic implementation)
// Note: For production, consider using a more robust solution like play-scraper or puppeteer
async function scrapePlayStoreReviews(appId: string, limit: number = 50) {
	// This is a placeholder - app-store-scraper only supports iOS
	// For Android, you'd need a different library or API
	// For now, we'll return empty array and handle iOS only
	return [];
}

async function scrapeAppStoreReviews(appId: string, limit: number = 50) {
	try {
		const store = await getStoreScraper();
		
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

export const GET: RequestHandler = async ({ url, request }) => {
	// Verify cron secret (set in Netlify environment variables)
	const authHeader = request.headers.get('authorization');
	const cronSecret = process.env.CRON_SECRET;
	
	if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	
	try {
		// Fetch all apps
		const apps = await prisma.app.findMany({
			select: {
				id: true,
				appId: true,
				platform: true
			}
		});
		
		let totalProcessed = 0;
		let totalNewReviews = 0;
		
		for (const app of apps) {
			try {
				let reviews: Array<{
					storeId: string;
					rating: number;
					body: string;
					author: string | null;
					createdAt: Date;
				}> = [];
				
				if (app.platform === 'ios') {
					reviews = await scrapeAppStoreReviews(app.appId, 50);
				} else if (app.platform === 'android') {
					// Android scraping not implemented yet - placeholder
					console.log(`Skipping Android app ${app.appId} - not implemented`);
					continue;
				}
				
				// Save new reviews (skip duplicates) with AI analysis
				for (const review of reviews) {
					try {
						// Analyze review with AI before saving
						let aiAnalysis = null;
						if (review.body && review.body.trim().length > 0) {
							try {
								aiAnalysis = await analyzeReview(review.body);
								if (aiAnalysis) {
									console.log(`✅ Analyzed review: ${aiAnalysis.category} - ${aiAnalysis.topic}`);
								}
							} catch (aiError) {
								console.error(`⚠️ AI analysis failed for review ${review.storeId}:`, aiError);
								// Continue without AI data if analysis fails
							}
						}

						await prisma.review.create({
							data: {
								appId: app.id,
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
						totalNewReviews++;
					} catch (error: any) {
						// Skip duplicate reviews (unique constraint violation)
						if (error.code !== 'P2002') {
							console.error(`Error saving review for app ${app.id}:`, error);
						}
					}
				}
				
				totalProcessed++;
			} catch (error) {
				console.error(`Error processing app ${app.id}:`, error);
			}
		}
		
		return json({
			success: true,
			appsProcessed: totalProcessed,
			newReviews: totalNewReviews,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		console.error('Error in ingestion cron:', error);
		return json(
			{ error: 'Internal server error', details: String(error) },
			{ status: 500 }
		);
	}
};

