// App detail page - show reviews
import type { PageServerLoad, Actions } from './$types';
import { redirect, error, fail } from '@sveltejs/kit';
import { prisma } from '$lib/db';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/signin');
	}
	
	const app = await prisma.app.findFirst({
		where: {
			id: params.id,
			userId: locals.user.id
		},
		include: {
			_count: {
				select: { reviews: true }
			}
		}
	});
	
	if (!app) {
		throw error(404, 'App not found');
	}
	
	const isOnboarding = url.searchParams.get('onboarding') === 'true';
	const reviewCount = app._count.reviews;
	const hasClusters = await prisma.issueCluster.count({ where: { appId: app.id } }) > 0;
	
	// Determine if we should show onboarding flow
	const showOnboarding = isOnboarding && reviewCount === 0;
	const showFirstLook = reviewCount > 0 && !hasClusters; // Show first look if reviews exist but no clusters yet
	
	// Fetch clusters with review counts and stats
	const clusters = await prisma.issueCluster.findMany({
		where: { appId: app.id },
		include: {
			_count: {
				select: { reviews: true }
			},
			reviews: {
				take: 5, // Show first 5 reviews per cluster
				orderBy: [
					{ aiUrgency: 'desc' }, // Critical/High first
					{ createdAt: 'desc' }
				],
				select: {
					id: true,
					body: true,
					rating: true,
					author: true,
					createdAt: true,
					aiUrgency: true,
					aiTopic: true
				}
			}
		},
		orderBy: [
			{ status: 'asc' }, // 'open' first
			{ createdAt: 'desc' }
		]
	});
	
	// Calculate cluster stats (average urgency, total reviews, etc.)
	const clustersWithStats = clusters.map(cluster => {
		const urgencies = cluster.reviews
			.map(r => r.aiUrgency)
			.filter(Boolean) as string[];
		
		const urgencyCounts = urgencies.reduce((acc, urg) => {
			acc[urg] = (acc[urg] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);
		
		const hasCritical = urgencyCounts['Critical'] > 0;
		const hasHigh = urgencyCounts['High'] > 0;
		const avgRating = cluster.reviews.length > 0
			? cluster.reviews.reduce((sum, r) => sum + r.rating, 0) / cluster.reviews.length
			: 0;
		
		return {
			...cluster,
			stats: {
				hasCritical,
				hasHigh,
				urgencyCounts,
				avgRating: Math.round(avgRating * 10) / 10
			}
		};
	});
	
	// Also fetch unclustered reviews (for display)
	const unclusteredReviews = await prisma.review.findMany({
		where: {
			appId: app.id,
			clusterId: null
		},
		orderBy: { createdAt: 'desc' },
		take: 50
	});
	
	const fetchedCount = url.searchParams.get('fetched');
	const clusteredCount = url.searchParams.get('clustered');
	
	return {
		app,
		clusters: clustersWithStats,
		unclusteredReviews,
		fetchedCount: fetchedCount ? parseInt(fetchedCount) : null,
		clusteredCount: clusteredCount ? parseInt(clusteredCount) : null,
		showOnboarding,
		showFirstLook,
		reviewCount
	};
};

export const actions: Actions = {
	delete: async ({ params, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}
		
		// Verify the app belongs to the user
		const app = await prisma.app.findFirst({
			where: {
				id: params.id,
				userId: locals.user.id
			}
		});
		
		if (!app) {
			return fail(404, { error: 'App not found' });
		}
		
		// Delete the app (reviews will be cascade deleted)
		await prisma.app.delete({
			where: { id: params.id }
		});
		
		// Redirect to dashboard
		throw redirect(302, '/dashboard');
	},
	fetchReviews: async ({ params, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}
		
		// Verify the app belongs to the user
		const app = await prisma.app.findFirst({
			where: {
				id: params.id,
				userId: locals.user.id
			}
		});
		
		if (!app) {
			return fail(404, { error: 'App not found' });
		}
		
		try {
			console.log(`🚀 Fetch reviews action called for app ${app.id} (${app.appId}, ${app.platform})`);
			
			// Import ingestion logic
			const { ingestReviewsForApp } = await import('$lib/server/ingest-utils');
			const result = await ingestReviewsForApp(app.id, app.appId, app.platform);
			
			console.log(`✅ Fetch completed: ${result.newReviews} new reviews`);
			
			// Redirect to refresh the page and show new reviews
			throw redirect(302, `/dashboard/apps/${app.id}?fetched=${result.newReviews}`);
		} catch (error: any) {
			// Re-throw redirects
			if (error?.status === 302 || error?.statusCode === 302) {
				throw error;
			}
			
			console.error('❌ Error fetching reviews:', error);
			return fail(500, {
				error: error.message || 'Failed to fetch reviews. Please try again.'
			});
		}
	},
	clusterReviews: async ({ params, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}
		
		// Verify the app belongs to the user
		const app = await prisma.app.findFirst({
			where: {
				id: params.id,
				userId: locals.user.id
			}
		});
		
		if (!app) {
			return fail(404, { error: 'App not found' });
		}
		
		try {
			console.log(`🔄 Clustering reviews for app ${app.id}...`);
			
			// Import clustering logic (use v2 by default)
			const useV2 = process.env.USE_V2_CLUSTERING !== 'false'; // Default to true
			let result;
			if (useV2) {
				const { clusterReviewsForAppV2 } = await import('$lib/server/clustering-v2');
				result = await clusterReviewsForAppV2(app.id);
			} else {
				const { clusterReviewsForApp } = await import('$lib/server/clustering');
				result = await clusterReviewsForApp(app.id);
			}
			
			console.log(`✅ Clustering complete: ${result.clustersCreated} clusters, ${result.reviewsClustered} reviews`);
			
			// Redirect to refresh the page
			throw redirect(302, `/dashboard/apps/${app.id}?clustered=${result.reviewsClustered}`);
		} catch (error: any) {
			// Re-throw redirects
			if (error?.status === 302 || error?.statusCode === 302) {
				throw error;
			}
			
			console.error('❌ Error clustering reviews:', error);
			return fail(500, {
				error: error.message || 'Failed to cluster reviews. Please try again.'
			});
		}
	}
};

