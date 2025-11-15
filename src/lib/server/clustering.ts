// Bug de-duplication using pgvector cosine similarity
// Groups similar bug reports into IssueClusters

import { prisma } from '$lib/db';

const SIMILARITY_THRESHOLD = 0.75; // Cosine similarity threshold (0-1, higher = more similar) - lowered from 0.85
const MIN_CLUSTER_SIZE = 2; // Minimum reviews needed to form a cluster

interface ReviewWithEmbedding {
	id: string;
	body: string;
	appId: string;
	aiCategory: string | null;
	embedding: string; // PostgreSQL vector as string
}

/**
 * Cluster reviews for a specific app using pgvector cosine similarity
 * Only clusters bug reports (aiCategory === 'Bug Report')
 */
export async function clusterReviewsForApp(appId: string): Promise<{ clustersCreated: number; reviewsClustered: number }> {
	const startTime = Date.now();
	console.log(`🔍 Starting clustering for app ${appId}...`);

	// Debug: Check total reviews for this app
	const totalReviews = await prisma.review.count({
		where: { appId }
	});
	console.log(`📊 Total reviews for app: ${totalReviews}`);
	
	// Debug: Check reviews with embeddings
	const reviewsWithEmbeddings = await prisma.$queryRaw<Array<{ count: bigint }>>`
		SELECT COUNT(*) as count
		FROM "Review" r
		WHERE r."appId" = ${appId}
			AND r.embedding IS NOT NULL
	`;
	const embeddingCount = Number(reviewsWithEmbeddings[0]?.count || 0);
	console.log(`📊 Reviews with embeddings: ${embeddingCount}`);
	
	// Debug: Check bug reports
	const bugReports = await prisma.review.count({
		where: {
			appId,
			aiCategory: 'Bug Report'
		}
	});
	console.log(`📊 Bug reports: ${bugReports}`);
	
	// Get all unclustered reviews with embeddings for this app
	// Only cluster bug reports
	const unclusteredReviews = await prisma.$queryRaw<ReviewWithEmbedding[]>`
		SELECT 
			r.id,
			r.body,
			r."appId",
			r."aiCategory",
			r.embedding::text as embedding
		FROM "Review" r
		WHERE r."appId" = ${appId}
			AND r."clusterId" IS NULL
			AND r.embedding IS NOT NULL
			AND r."aiCategory" = 'Bug Report'
		ORDER BY r."createdAt" DESC
	`;

	console.log(`📊 Unclustered bug reports with embeddings: ${unclusteredReviews.length}`);

	if (unclusteredReviews.length < MIN_CLUSTER_SIZE) {
		console.log(`⏭️ Not enough reviews to cluster (${unclusteredReviews.length} < ${MIN_CLUSTER_SIZE})`);
		if (totalReviews > 0 && embeddingCount === 0) {
			console.log(`💡 Tip: Reviews exist but no embeddings found. Make sure embeddings are being generated during ingestion.`);
		}
		if (totalReviews > 0 && bugReports === 0) {
			console.log(`💡 Tip: Reviews exist but none are categorized as "Bug Report". Check AI analysis.`);
		}
		return { clustersCreated: 0, reviewsClustered: 0 };
	}

	console.log(`📊 Found ${unclusteredReviews.length} unclustered bug reports with embeddings`);

	let clustersCreated = 0;
	let reviewsClustered = 0;
	const processedReviewIds = new Set<string>();

	// For each unprocessed review, find similar reviews
	for (const review of unclusteredReviews) {
		if (processedReviewIds.has(review.id)) {
			continue; // Already clustered
		}

		// Find similar reviews using cosine distance (optimized query)
		// Use pgvector's <=> operator for efficient similarity search
		// Include the seed review itself in the cluster
		const similarReviews = await prisma.$queryRaw<Array<{ id: string; similarity: number }>>`
			SELECT 
				r2.id,
				1 - (r1.embedding <=> r2.embedding) as similarity
			FROM "Review" r1, "Review" r2
			WHERE r1.id = ${review.id}
				AND r2."appId" = ${appId}
				AND r2."clusterId" IS NULL
				AND r2.embedding IS NOT NULL
				AND r2."aiCategory" = 'Bug Report'
				AND (1 - (r1.embedding <=> r2.embedding)) >= ${SIMILARITY_THRESHOLD}
			ORDER BY similarity DESC
			LIMIT 20
		`;

		console.log(`🔍 Review ${review.id.substring(0, 8)}... found ${similarReviews.length} similar reviews (threshold: ${SIMILARITY_THRESHOLD})`);
		if (similarReviews.length > 0) {
			console.log(`   Top similarities: ${similarReviews.slice(0, 3).map(r => r.similarity.toFixed(3)).join(', ')}`);
		}

		// Need at least MIN_CLUSTER_SIZE reviews (including the seed review)
		// If we found (MIN_CLUSTER_SIZE - 1) similar reviews, that's enough (seed + similar = MIN_CLUSTER_SIZE)
		if (similarReviews.length < (MIN_CLUSTER_SIZE - 1)) {
			continue; // Not enough similar reviews
		}

		// Create cluster - include seed review + similar reviews
		const clusterReviewIds = [review.id, ...similarReviews.map(r => r.id)];
		const clusterReviews = await prisma.review.findMany({
			where: { id: { in: clusterReviewIds } },
			select: { body: true, aiSummary: true }
		});

		// Generate cluster title from reviews - improved algorithm
		let clusterTitle = 'Bug Report';
		try {
			// Collect all summaries and topics
			const summaries = clusterReviews
				.map(r => r.aiSummary || r.body)
				.filter(Boolean);
			
			if (summaries.length > 0) {
				// Try to find common keywords across summaries
				const words = summaries
					.flatMap(s => s.toLowerCase().split(/\s+/))
					.filter(w => w.length > 3) // Filter short words
					.filter(w => !['the', 'this', 'that', 'with', 'from', 'when', 'where'].includes(w));
				
				// Count word frequency
				const wordCounts = new Map<string, number>();
				words.forEach(word => {
					wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
				});
				
				// Get top 2-3 most common words
				const topWords = Array.from(wordCounts.entries())
					.sort((a, b) => b[1] - a[1])
					.slice(0, 3)
					.map(([word]) => word);
				
				if (topWords.length > 0) {
					// Create title from top words + first summary snippet
					const titleFromWords = topWords.join(' ').substring(0, 40);
					const firstSummarySnippet = summaries[0].substring(0, 30);
					clusterTitle = `${titleFromWords}: ${firstSummarySnippet}`.substring(0, 60);
				} else {
					// Fallback to first summary
					clusterTitle = summaries[0].length > 60 
						? summaries[0].substring(0, 57) + '...'
						: summaries[0];
				}
			}
		} catch (error) {
			console.error('⚠️ Failed to generate cluster title, using default:', error);
		}

		// Create IssueCluster with error handling
		try {
			const cluster = await prisma.issueCluster.create({
				data: {
					appId: appId,
					title: clusterTitle,
					category: 'Bug Report',
					status: 'open'
				}
			});

			// Assign all similar reviews to this cluster
			await prisma.review.updateMany({
				where: { id: { in: clusterReviewIds } },
				data: { clusterId: cluster.id }
			});

			clustersCreated++;
			reviewsClustered += clusterReviewIds.length;
			// Mark all reviews as processed (including seed review)
			clusterReviewIds.forEach(id => processedReviewIds.add(id));

			console.log(`✅ Created cluster "${clusterTitle.substring(0, 50)}..." with ${clusterReviewIds.length} reviews`);
		} catch (clusterError) {
			console.error(`❌ Failed to create cluster for review ${review.id}:`, clusterError);
			// Continue processing other reviews even if one cluster fails
		}
	}

	const duration = ((Date.now() - startTime) / 1000).toFixed(2);
	console.log(`🎉 Clustering complete: ${clustersCreated} clusters, ${reviewsClustered} reviews clustered in ${duration}s`);
	return { clustersCreated, reviewsClustered };
}

/**
 * Cluster reviews for all apps (for cron job)
 */
export async function clusterAllApps(): Promise<{ appsProcessed: number; totalClusters: number; totalReviews: number }> {
	const apps = await prisma.app.findMany({
		select: { id: true }
	});

	let totalClusters = 0;
	let totalReviews = 0;

	for (const app of apps) {
		try {
			const result = await clusterReviewsForApp(app.id);
			totalClusters += result.clustersCreated;
			totalReviews += result.reviewsClustered;
		} catch (error) {
			console.error(`❌ Error clustering app ${app.id}:`, error);
		}
	}

	return {
		appsProcessed: apps.length,
		totalClusters,
		totalReviews
	};
}

