// API endpoint pour récupérer les statistiques du cache
// GET /api/cache-stats

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCacheStats } from '$lib/cache';

export const GET: RequestHandler = async () => {
	try {
		const stats = getCacheStats();
		
		return json({
			success: true,
			stats
		});
	} catch (error) {
		console.error('❌ Erreur lors de la récupération des stats du cache:', error);
		return json(
			{
				success: false,
				error: 'Erreur lors de la récupération des statistiques du cache'
			},
			{ status: 500 }
		);
	}
};

