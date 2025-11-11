// Page Server Load pour afficher une analyse individuelle
import type { PageServerLoad } from './$types';
import type { AnalysisResult } from '$lib/types';
import { prisma } from '$lib/db';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	try {
		// L'utilisateur est garanti d'exister grâce aux gardes dans hooks.server.ts
		const userId = locals.user!.id;
		const analysisId = params.id;
		
		// Charger l'analyse spécifique de l'utilisateur
		const analysis = await prisma.analysis.findFirst({
			where: { 
				id: analysisId,
				userId // S'assurer que l'analyse appartient à l'utilisateur
			},
			select: {
				id: true,
				feedbackText: true,
				result: true,
				createdAt: true
			}
		});

		if (!analysis) {
			throw error(404, 'Analyse non trouvée');
		}

		return {
			analysis: {
				id: analysis.id,
				feedbackText: analysis.feedbackText,
				result: analysis.result as unknown as AnalysisResult,
				createdAt: analysis.createdAt.toISOString()
			}
		};
	} catch (err) {
		console.error('Erreur lors du chargement de l\'analyse:', err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		throw error(500, 'Erreur lors du chargement de l\'analyse');
	}
};

