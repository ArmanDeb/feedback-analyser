// Dashboard Server Load - Charge l'historique des analyses
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/db';

export const load: PageServerLoad = async () => {
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

		return {
			analyses: analyses.map(analysis => ({
				id: analysis.id,
				feedbackText: analysis.feedbackText,
				result: analysis.result,
				createdAt: analysis.createdAt.toISOString()
			}))
		};
	} catch (error) {
		console.error('❌ Erreur lors du chargement de l\'historique:', error);
		// Retourner un tableau vide en cas d'erreur (ex: base de données non configurée)
		return {
			analyses: []
		};
	}
};

