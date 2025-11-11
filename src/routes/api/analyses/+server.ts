// API endpoint pour récupérer l'historique des analyses
// GET /api/analyses

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/db';

export const GET: RequestHandler = async () => {
	try {
		// TODO: Remplacer par l'ID utilisateur réel depuis Stack Auth
		const userId = "dev-user-1";
		
		// Charger les 10 dernières analyses de l'utilisateur
		const analyses = await prisma.analysis.findMany({
			where: { userId },
			orderBy: { createdAt: 'desc' },
			take: 10,
			select: {
				id: true,
				feedbackText: true,
				result: true,
				createdAt: true
			}
		});

		return json({
			success: true,
			analyses: analyses.map(analysis => ({
				id: analysis.id,
				feedbackText: analysis.feedbackText,
				result: analysis.result,
				createdAt: analysis.createdAt.toISOString()
			}))
		});
	} catch (error) {
		console.error('❌ Erreur lors de la récupération de l\'historique:', error);
		return json(
			{
				success: false,
				error: 'Erreur lors de la récupération de l\'historique',
				analyses: []
			},
			{ status: 500 }
		);
	}
};

