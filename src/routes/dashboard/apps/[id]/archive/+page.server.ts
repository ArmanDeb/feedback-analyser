// Cluster Archive - Dense, actionable list view
import type { PageServerLoad, Actions } from './$types';
import { redirect, error } from '@sveltejs/kit';
import { prisma } from '$lib/db';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/signin');
	}
	
	const app = await prisma.app.findFirst({
		where: {
			id: params.id,
			userId: locals.user.id
		}
	});
	
	if (!app) {
		throw error(404, 'App not found');
	}
	
	// Get filter params
	const statusFilter = url.searchParams.get('status') || 'all';
	const categoryFilter = url.searchParams.get('category') || 'all';
	
	// Build where clause
	const where: any = { appId: app.id };
	
	if (statusFilter !== 'all') {
		where.status = statusFilter;
	}
	
	if (categoryFilter !== 'all') {
		where.category = categoryFilter;
	}
	
	// Fetch clusters with review counts and sample reviews for hover preview
	const clusters = await prisma.issueCluster.findMany({
		where,
		include: {
			_count: {
				select: { reviews: true }
			},
			reviews: {
				take: 3, // Sample reviews for hover preview
				select: {
					body: true,
					aiSummary: true
				}
			}
		}
	});
	
	// Sort: Status first ('open' = New first), then by frequency (review count desc)
	clusters.sort((a, b) => {
		// Status order: 'open' (New) first, then 'resolved' (Seen), then 'ignored' (Archived)
		const statusOrder = { 'open': 0, 'resolved': 1, 'ignored': 2 };
		const statusDiff = (statusOrder[a.status as keyof typeof statusOrder] ?? 99) - 
		                  (statusOrder[b.status as keyof typeof statusOrder] ?? 99);
		
		if (statusDiff !== 0) {
			return statusDiff;
		}
		
		// Within same status, sort by frequency (review count) descending
		return b._count.reviews - a._count.reviews;
	});
	
	// Get stats for filters
	const totalClusters = await prisma.issueCluster.count({ where: { appId: app.id } });
	const newClusters = await prisma.issueCluster.count({ 
		where: { appId: app.id, status: 'open' } 
	});
	const seenClusters = await prisma.issueCluster.count({ 
		where: { appId: app.id, status: 'resolved' } 
	});
	
	// Get category counts for treemap
	const bugCount = await prisma.issueCluster.count({ 
		where: { appId: app.id, category: 'Bug Report' } 
	});
	const featureCount = await prisma.issueCluster.count({ 
		where: { appId: app.id, category: 'Feature Request' } 
	});
	const complaintCount = await prisma.issueCluster.count({ 
		where: { appId: app.id, category: 'Complaint' } 
	});
	
	return {
		app,
		clusters,
		filters: {
			status: statusFilter,
			category: categoryFilter
		},
		stats: {
			total: totalClusters,
			new: newClusters,
			seen: seenClusters,
			bugs: bugCount,
			features: featureCount,
			complaints: complaintCount
		}
	};
};

export const actions: Actions = {
	markSeen: async ({ params, locals, request }) => {
		if (!locals.user) {
			return { success: false, error: 'Unauthorized' };
		}
		
		const formData = await request.formData();
		const clusterId = formData.get('clusterId')?.toString();
		
		if (!clusterId) {
			return { success: false, error: 'Cluster ID required' };
		}
		
		// Verify cluster belongs to user's app
		const app = await prisma.app.findFirst({
			where: {
				id: params.id,
				userId: locals.user.id
			}
		});
		
		if (!app) {
			return { success: false, error: 'App not found' };
		}
		
		await prisma.issueCluster.update({
			where: { id: clusterId },
			data: { status: 'resolved' } // 'resolved' = 'Seen' (marked as reviewed)
		});
		
		return { success: true };
	},
	
	archive: async ({ params, locals, request }) => {
		if (!locals.user) {
			return { success: false, error: 'Unauthorized' };
		}
		
		const formData = await request.formData();
		const clusterId = formData.get('clusterId')?.toString();
		
		if (!clusterId) {
			return { success: false, error: 'Cluster ID required' };
		}
		
		// Verify cluster belongs to user's app
		const app = await prisma.app.findFirst({
			where: {
				id: params.id,
				userId: locals.user.id
			}
		});
		
		if (!app) {
			return { success: false, error: 'App not found' };
		}
		
		await prisma.issueCluster.update({
			where: { id: clusterId },
			data: { status: 'ignored' } // 'ignored' = 'Archived' (dismissed)
		});
		
		return { success: true };
	}
};

