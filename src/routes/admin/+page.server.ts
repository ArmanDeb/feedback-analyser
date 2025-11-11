// Page load function pour le dashboard admin
import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { isAdmin, getGlobalStats, getUserStats, getRecentApiLogs, estimateMonthlyCost } from '$lib/admin';

export const load: PageServerLoad = async ({ locals }) => {
	// Récupérer l'utilisateur depuis locals (configuré dans hooks.server.ts)
	const user = locals.user;
	
	// Mode développement : pas d'auth configurée
	const devMode = !user;
	let effectiveUser = user;
	
	if (devMode) {
		console.warn('🔓 Mode développement - Dashboard admin accessible sans authentification');
		effectiveUser = {
			id: 'dev-user-1',
			email: 'admin@feedback-analyser.com',
			displayName: 'Admin Dev',
			signedUpAt: new Date()
		};
	}

	// Vérifier si l'utilisateur est admin
	if (!isAdmin(effectiveUser)) {
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
				id: effectiveUser.id,
				email: effectiveUser.email,
				displayName: effectiveUser.displayName,
				isStackAuthEnabled: !devMode
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
				id: effectiveUser.id,
				email: effectiveUser.email,
				displayName: effectiveUser.displayName,
				isStackAuthEnabled: !devMode
			},
			error: 'La base de données n\'est pas encore configurée. Exécutez "npx prisma db push" pour créer les tables.'
		};
	}
};

