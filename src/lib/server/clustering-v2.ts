// Multi-Stage Clustering System - Production Grade
// Stage 1: Filter by AI Category (never cluster Bug Report with Feature Request)
// Stage 2: Cluster by Embedding (within filtered group)
// Stage 3: AI Naming (GPT-4o generates canonical title)
// Cluster Vectors: Store cluster embedding for fast matching

import { prisma } from '$lib/db';
import { generateClusterTitle } from './ai-cluster-naming';
import { generateEmbedding, formatVectorForPostgres } from './embeddings';

const SIMILARITY_THRESHOLD = 0.75; // Cosine similarity threshold (0-1)
const MIN_CLUSTER_SIZE = 2; // Minimum reviews needed to form a cluster

interface ReviewWithEmbedding {
	id: string;
	body: string;
	appId: string;
	aiCategory: string | null;
	aiSummary: string | null;
	embedding: string; // PostgreSQL vector as string
}

/**
 * Multi-stage clustering for a specific app
 * 
 * Stage 1: Filter by category (Bug Report, Feature Request, Complaint)
 * Stage 2: Cluster by embedding similarity within each category
 * Stage 3: AI naming for each cluster
 */
export async function clusterReviewsForAppV2(
	appId: string
): Promise<{ clustersCreated: number; reviewsClustered: number }> {
	const startTime = Date.now();
	console.log(`🔍 Starting multi-stage clustering for app ${appId}...`);

	// Get all unclustered reviews with embeddings
	const unclusteredReviews = await prisma.$queryRaw<ReviewWithEmbedding[]>`
		SELECT 
			r.id,
			r.body,
			r."appId",
			r."aiCategory",
			r."aiSummary",
			r.embedding::text as embedding
		FROM "Review" r
		WHERE r."appId" = ${appId}
			AND r."clusterId" IS NULL
			AND r.embedding IS NOT NULL
			AND r."aiCategory" IS NOT NULL
			AND r."aiCategory" IN ('Bug Report', 'Feature Request', 'Complaint')
		ORDER BY r."createdAt" DESC
	`;

	console.log(`📊 Found ${unclusteredReviews.length} unclustered actionable reviews`);

	if (unclusteredReviews.length < MIN_CLUSTER_SIZE) {
		console.log(`⏭️ Not enough reviews to cluster (${unclusteredReviews.length} < ${MIN_CLUSTER_SIZE})`);
		return { clustersCreated: 0, reviewsClustered: 0 };
	}

	// STAGE 1: Filter by category
	const reviewsByCategory = new Map<string, ReviewWithEmbedding[]>();
	for (const review of unclusteredReviews) {
		const category = review.aiCategory || 'Unknown';
		if (!reviewsByCategory.has(category)) {
			reviewsByCategory.set(category, []);
		}
		reviewsByCategory.get(category)!.push(review);
	}

	console.log(`📊 Stage 1: Filtered by category:`);
	for (const [category, reviews] of reviewsByCategory.entries()) {
		console.log(`   ${category}: ${reviews.length} reviews`);
	}

	let clustersCreated = 0;
	let reviewsClustered = 0;
	const processedReviewIds = new Set<string>();

	// Process each category separately
	for (const [category, categoryReviews] of reviewsByCategory.entries()) {
		if (categoryReviews.length < MIN_CLUSTER_SIZE) {
			continue; // Not enough reviews in this category
		}

		console.log(`\n🔍 Stage 2: Clustering ${category} reviews...`);

		// STAGE 2: Cluster by embedding similarity within this category
		for (const review of categoryReviews) {
			if (processedReviewIds.has(review.id)) {
				continue; // Already clustered
			}

			// Find similar reviews within the same category
			const similarReviews = await prisma.$queryRaw<Array<{ id: string; similarity: number }>>`
				SELECT 
					r2.id,
					1 - (r1.embedding <=> r2.embedding) as similarity
				FROM "Review" r1, "Review" r2
				WHERE r1.id = ${review.id}
					AND r2."appId" = ${appId}
					AND r2."clusterId" IS NULL
					AND r2.embedding IS NOT NULL
					AND r2."aiCategory" = ${category}
					AND (1 - (r1.embedding <=> r2.embedding)) >= ${SIMILARITY_THRESHOLD}
				ORDER BY similarity DESC
				LIMIT 20
			`;

			// Need at least MIN_CLUSTER_SIZE reviews (including seed)
			if (similarReviews.length < (MIN_CLUSTER_SIZE - 1)) {
				continue; // Not enough similar reviews
			}

			// Create cluster - include seed review + similar reviews
			const clusterReviewIds = [review.id, ...similarReviews.map(r => r.id)];
			const clusterReviews = await prisma.review.findMany({
				where: { id: { in: clusterReviewIds } },
				select: { body: true, aiSummary: true }
			});

			// STAGE 3: AI Naming - Generate canonical title
			let clusterTitle = `${category} Cluster`;
			try {
				const aiTitle = await generateClusterTitle(
					clusterReviews,
					category as 'Bug Report' | 'Feature Request' | 'Complaint'
				);
				if (aiTitle) {
					clusterTitle = aiTitle;
					console.log(`   ✅ AI generated title: "${clusterTitle}"`);
				} else {
					console.log(`   ⚠️ AI naming failed, using fallback`);
					// Fallback to keyword-based title
					const summaries = clusterReviews
						.map(r => r.aiSummary || r.body)
						.filter(Boolean);
					if (summaries.length > 0) {
						const words = summaries[0]
							.toLowerCase()
							.split(/\s+/)
							.filter(w => w.length > 3)
							.slice(0, 5);
						clusterTitle = words.join(' ').substring(0, 60);
					}
				}
			} catch (error) {
				console.error(`   ❌ AI naming error:`, error);
				// Fallback title
				clusterTitle = `${category}: ${clusterReviews[0]?.aiSummary?.substring(0, 40) || 'Issue'}`;
			}

			// Generate cluster embedding for fast matching
			let clusterEmbeddingVector = null;
			try {
				clusterEmbeddingVector = await generateEmbedding(clusterTitle);
				if (clusterEmbeddingVector) {
					console.log(`   ✅ Generated cluster embedding`);
				}
			} catch (error) {
				console.error(`   ⚠️ Failed to generate cluster embedding:`, error);
			}

			// Create IssueCluster
			try {
				// First create cluster without embedding (Prisma doesn't support vector directly)
				const cluster = await prisma.issueCluster.create({
					data: {
						appId: appId,
						title: clusterTitle,
						category: category,
						status: 'open'
					}
				});

				// Update cluster embedding separately if available
				if (clusterEmbeddingVector) {
					try {
						await prisma.$executeRaw`
							UPDATE "IssueCluster" 
							SET "clusterEmbedding" = ${formatVectorForPostgres(clusterEmbeddingVector)}::vector
							WHERE "id" = ${cluster.id}
						`;
					} catch (embedError) {
						console.error(`   ⚠️ Failed to update cluster embedding:`, embedError);
					}
				}

				// Assign all reviews to this cluster
				await prisma.review.updateMany({
					where: { id: { in: clusterReviewIds } },
					data: { clusterId: cluster.id }
				});

				clustersCreated++;
				reviewsClustered += clusterReviewIds.length;
				clusterReviewIds.forEach(id => processedReviewIds.add(id));

				console.log(`   ✅ Created cluster "${clusterTitle}" with ${clusterReviewIds.length} reviews`);
			} catch (clusterError) {
				console.error(`   ❌ Failed to create cluster:`, clusterError);
			}
		}
	}

	const duration = ((Date.now() - startTime) / 1000).toFixed(2);
	console.log(`\n🎉 Multi-stage clustering complete:`);
	console.log(`   Clusters created: ${clustersCreated}`);
	console.log(`   Reviews clustered: ${reviewsClustered}`);
	console.log(`   Duration: ${duration}s`);

	return { clustersCreated, reviewsClustered };
}

/**
 * Match new review to existing clusters using cluster vectors
 * This is faster than comparing against all individual reviews
 */
export async function matchReviewToClusters(
	reviewId: string,
	appId: string,
	category: string
): Promise<string | null> {
	// Get review embedding
	const review = await prisma.$queryRaw<Array<{ embedding: string }>>`
		SELECT embedding::text as embedding
		FROM "Review"
		WHERE id = ${reviewId}
			AND embedding IS NOT NULL
		LIMIT 1
	`;

	if (!review || review.length === 0) {
		return null;
	}

	// Find matching clusters using cluster embeddings
	const matchingClusters = await prisma.$queryRaw<Array<{ id: string; similarity: number }>>`
		SELECT 
			c.id,
			1 - (r.embedding <=> c."clusterEmbedding") as similarity
		FROM "Review" r, "IssueCluster" c
		WHERE r.id = ${reviewId}
			AND c."appId" = ${appId}
			AND c."category" = ${category}
			AND c."clusterEmbedding" IS NOT NULL
			AND (1 - (r.embedding <=> c."clusterEmbedding")) >= ${SIMILARITY_THRESHOLD}
		ORDER BY similarity DESC
		LIMIT 1
	`;

	if (matchingClusters && matchingClusters.length > 0) {
		return matchingClusters[0].id;
	}

	return null;
}

/**
 * Cluster reviews for all apps (for cron job)
 */
export async function clusterAllAppsV2(): Promise<{
	appsProcessed: number;
	totalClusters: number;
	totalReviews: number;
}> {
	const apps = await prisma.app.findMany({
		select: { id: true }
	});

	let totalClusters = 0;
	let totalReviews = 0;

	for (const app of apps) {
		try {
			const result = await clusterReviewsForAppV2(app.id);
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

