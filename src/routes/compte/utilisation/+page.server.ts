// Page load function pour le dashboard utilisateur
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/db';

export const load: PageServerLoad = async ({ locals }) => {
	try {
		// L'utilisateur est garanti d'exister grâce aux gardes dans hooks.server.ts
		const userId = locals.user!.id;

		// Récupérer les statistiques de l'utilisateur
		const [totalAnalyses, totalApiCalls, apiLogs] = await Promise.all([
			// Nombre total d'analyses
			prisma.analysis.count({
				where: { userId }
			}),
			
			// Nombre total d'appels API
			prisma.apiLog.count({
				where: { userId }
			}),
			
			// Logs API récents avec totaux
			prisma.apiLog.findMany({
				where: { userId },
				orderBy: { timestamp: 'desc' },
				take: 50
			})
		]);

		// Calculer les totaux
		const totalCost = apiLogs.reduce((sum, log) => sum + log.cost, 0);
		const totalTokensIn = apiLogs.reduce((sum, log) => sum + log.tokensIn, 0);
		const totalTokensOut = apiLogs.reduce((sum, log) => sum + log.tokensOut, 0);
		const totalTokens = totalTokensIn + totalTokensOut;

		// Calculer l'estimation mensuelle (basée sur les 7 derniers jours)
		const weekAgo = new Date();
		weekAgo.setDate(weekAgo.getDate() - 7);
		
		const weekLogs = apiLogs.filter(log => new Date(log.timestamp) >= weekAgo);
		const weekCost = weekLogs.reduce((sum, log) => sum + log.cost, 0);
		const dailyAverage = weekCost / 7;
		const estimatedMonthlyCost = dailyAverage * 30;

		return {
			userStats: {
				totalAnalyses,
				totalApiCalls,
				totalCost,
				totalTokensIn,
				totalTokensOut,
				totalTokens
			},
			recentLogs: apiLogs.map(log => ({
				id: log.id,
				modelUsed: log.modelUsed,
				tokensIn: log.tokensIn,
				tokensOut: log.tokensOut,
				cost: log.cost,
				timestamp: log.timestamp.toISOString()
			})),
			monthlyCostEstimate: {
				weekCost,
				estimatedMonthlyCost,
				dailyAverage
			},
			currentUser: {
				id: userId,
				email: locals.user!.email
			}
		};
	} catch (err) {
		console.error('❌ Erreur lors du chargement des statistiques utilisateur:', err);
		
		// Fournir des données vides en cas d'erreur
		return {
			userStats: {
				totalAnalyses: 0,
				totalApiCalls: 0,
				totalCost: 0,
				totalTokensIn: 0,
				totalTokensOut: 0,
				totalTokens: 0
			},
			recentLogs: [],
			monthlyCostEstimate: {
				weekCost: 0,
				estimatedMonthlyCost: 0,
				dailyAverage: 0
			},
		currentUser: {
			id: locals.user?.id || '',
			email: locals.user?.email || ''
		},
			error: 'La base de données n\'est pas encore configurée. Exécutez "npx prisma db push" pour créer les tables.'
		};
	}
};

