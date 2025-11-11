// Tableau de Bord Server Load - Charge l'historique des analyses
import type { PageServerLoad } from './$types';
import type { AnalysisResult } from '$lib/types';
import { prisma } from '$lib/db';

export const load: PageServerLoad = async ({ locals }) => {
	try {
		// L'utilisateur est garanti d'exister grâce aux gardes dans hooks.server.ts
		const userId = locals.user!.id;
		
		// Charger les 20 dernières analyses de l'utilisateur
		const analyses = await prisma.analysis.findMany({
			where: { userId },
			orderBy: { createdAt: 'desc' },
			take: 20,
			select: {
				id: true,
				feedbackText: true,
				title: true,
				result: true,
				createdAt: true
			}
		});

		// Statistiques de base
		const totalAnalyses = await prisma.analysis.count({
			where: { userId }
		});

		return {
			analyses: analyses.map(analysis => ({
				id: analysis.id,
				feedbackText: analysis.feedbackText,
				title: analysis.title,
				result: analysis.result as unknown as AnalysisResult,
				createdAt: analysis.createdAt.toISOString()
			})),
			totalAnalyses
		};
	} catch (error) {
		console.error('❌ Erreur lors du chargement de l\'historique:', error);
		return {
			analyses: [],
			totalAnalyses: 0
		};
	}
};

