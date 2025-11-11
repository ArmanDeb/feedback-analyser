// Page load function pour le dashboard admin
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { isAdmin, getGlobalStats, getUserStats, getRecentApiLogs, estimateMonthlyCost } from '$lib/admin';
import { stackServerApp } from '$lib/stack';

export const load: PageServerLoad = async ({ request }) => {
	// Récupérer l'utilisateur depuis Stack Auth
	let user;
	let isStackAuthEnabled = true;
	
	try {
		user = await stackServerApp.getUser({ request });
	} catch (err) {
		console.warn('⚠️ Stack Auth non configuré ou erreur:', err);
		isStackAuthEnabled = false;
		
		// Mode développement : utilisateur fictif
		user = {
			id: 'dev-user-1',
			email: 'admin@feedback-analyser.com',
			displayName: 'Admin Dev'
		};
	}

	// Si pas d'utilisateur et Stack Auth activé, rediriger vers sign-in
	if (!user && isStackAuthEnabled) {
		throw error(401, {
			message: 'Vous devez être connecté pour accéder à cette page.'
		});
	}

	// Vérifier si l'utilisateur est admin
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
				email: user.email || 'dev@feedback-analyser.com',
				displayName: user.displayName || 'Admin',
				isStackAuthEnabled
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
				id: user?.id || 'dev-user-1',
				email: user?.email || 'admin@feedback-analyser.com',
				displayName: user?.displayName || 'Admin Dev',
				isStackAuthEnabled
			},
			error: 'La base de données n\'est pas encore configurée. Exécutez "npx prisma db push" pour créer les tables.'
		};
	}
};

