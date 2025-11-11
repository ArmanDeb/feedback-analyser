// Page load function pour le dashboard admin
import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { isAdmin, getGlobalStats, getUserStats, getRecentApiLogs, estimateMonthlyCost } from '$lib/admin';

export const load: PageServerLoad = async ({ locals }) => {
	// TODO S3.1: Récupérer l'utilisateur depuis Stack Auth
	// const user = await stackServerApp.getUser();
	
	// Pour le développement, on simule un utilisateur admin
	const mockUser = {
		id: 'dev-user-1',
		email: 'admin@feedback-analyser.com', // Remplacer par votre email pour tester
		role: 'admin'
	};

	// Vérifier si l'utilisateur est admin
	if (!isAdmin(mockUser)) {
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
			currentUser: mockUser
		};
	} catch (err) {
		console.error('Erreur lors du chargement du dashboard admin:', err);
		throw error(500, {
			message: 'Erreur lors du chargement des données du dashboard'
		});
	}
};

