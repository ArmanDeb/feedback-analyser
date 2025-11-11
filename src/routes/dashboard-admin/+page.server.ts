// Page load function pour le dashboard admin
import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { isAdmin, getGlobalStats, getUserStats, getRecentApiLogs, estimateMonthlyCost } from '$lib/admin';

export const load: PageServerLoad = async ({ locals }) => {
	// L'utilisateur est garanti d'exister et d'être admin grâce aux gardes dans hooks.server.ts
	const user = locals.user!;
	
	// Vérifier que l'utilisateur est admin (double check)
	if (!isAdmin(user)) {
		throw error(403, {
			message: 'Accès refusé. Vous devez être administrateur pour accéder à cette page.'
		});
	}

	try {
		// Charger toutes les statistiques en parallèle
		const [globalStats, userStats, recentLogs, monthlyCostEstimate] = await Promise.all([
			getGlobalStats(),
			getUserStats(),
			getRecentApiLogs(50),
			estimateMonthlyCost()
		]);

		return {
			globalStats,
			userStats,
			recentLogs,
			monthlyCostEstimate,
			currentUser: {
				id: user.id,
				email: user.email,
				role: user.role
			}
		};
	} catch (err) {
		console.error('❌ Erreur lors du chargement du dashboard admin:', err);
		
		// Fournir des données vides au lieu de crash
		return {
			globalStats: {
				totalAnalyses: 0,
				totalUsers: 0,
				totalApiCalls: 0,
				totalCost: 0,
				totalTokensIn: 0,
				totalTokensOut: 0,
				totalTokens: 0
			},
			userStats: [],
			recentLogs: [],
			monthlyCostEstimate: {
				weekCost: 0,
				estimatedMonthlyCost: 0,
				dailyAverage: 0
			},
			currentUser: {
				id: user.id,
				email: user.email,
				role: user.role
			},
			error: 'La base de données n\'est pas encore configurée. Exécutez "npx prisma db push" pour créer les tables.'
		};
	}
};

