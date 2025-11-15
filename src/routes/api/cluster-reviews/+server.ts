// Cron endpoint for clustering reviews (runs daily)
// Netlify cron: 0 2 * * * (2 AM daily)

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { clusterAllApps } from '$lib/server/clustering'; // Legacy
import { clusterAllAppsV2 } from '$lib/server/clustering-v2'; // New multi-stage

export const GET: RequestHandler = async () => {
	try {
		console.log('🔄 Starting multi-stage review clustering job...');
		
		// Use new v2 clustering by default, fallback to legacy if env var set
		const useV2 = process.env.USE_V2_CLUSTERING !== 'false'; // Default to true
		const result = useV2 ? await clusterAllAppsV2() : await clusterAllApps();
		
		return json({
			success: true,
			...result,
			timestamp: new Date().toISOString()
		});
	} catch (error: any) {
		console.error('❌ Clustering job failed:', error);
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

