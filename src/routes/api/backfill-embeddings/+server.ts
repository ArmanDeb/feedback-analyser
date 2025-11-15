// Backfill embeddings for existing reviews that don't have them
// Useful after adding embedding support to existing reviews

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/db';
import { generateEmbedding, formatVectorForPostgres } from '$lib/server/embeddings';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const appId = url.searchParams.get('appId');
		
		// Get reviews without embeddings
		const reviewsWithoutEmbeddings = await prisma.review.findMany({
			where: {
				...(appId ? { appId } : {}),
				embedding: null,
				body: { not: null }
			},
			select: {
				id: true,
				body: true,
				appId: true
			},
			take: 100 // Process in batches
		});

		console.log(`🔄 Found ${reviewsWithoutEmbeddings.length} reviews without embeddings`);

		let processed = 0;
		let failed = 0;

		for (const review of reviewsWithoutEmbeddings) {
			try {
				if (!review.body || review.body.trim().length === 0) {
					continue;
				}

				const embedding = await generateEmbedding(review.body);
				
				if (embedding) {
					await prisma.$executeRaw`
						UPDATE "Review" 
						SET "embedding" = ${formatVectorForPostgres(embedding)}::vector
						WHERE "id" = ${review.id}
					`;
					processed++;
					console.log(`✅ [${processed}/${reviewsWithoutEmbeddings.length}] Added embedding for review ${review.id}`);
				} else {
					failed++;
					console.log(`⚠️ Failed to generate embedding for review ${review.id}`);
				}
			} catch (error) {
				failed++;
				console.error(`❌ Error processing review ${review.id}:`, error);
			}
		}

		return json({
			success: true,
			processed,
			failed,
			total: reviewsWithoutEmbeddings.length,
			timestamp: new Date().toISOString()
		});
	} catch (error: any) {
		console.error('❌ Backfill failed:', error);
		return json(
			{
				success: false,
				error: error.message,
				timestamp: new Date().toISOString()
			},
			{ status: 500 }
		);
	}
};

