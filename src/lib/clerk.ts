// Configuration Clerk pour SvelteKit
// Note: Clerk n'a pas de SDK officiel pour SvelteKit actuellement
// Cette implémentation utilise l'approche manuelle avec l'API Clerk

import { writable } from 'svelte/store';

// Store pour l'état de l'utilisateur
export const userStore = writable<any>(null);
export const isLoadingStore = writable<boolean>(true);

// Placeholder pour l'intégration Clerk
// TODO (S1.5): Implémenter l'authentification Clerk
// Options:
// 1. Utiliser Clerk avec le SDK JavaScript vanilla et l'intégrer manuellement
// 2. Utiliser Clerk via les composants Web Components
// 3. Implémenter l'authentification via l'API Clerk directement

export const clerkConfig = {
	publishableKey: '', // À configurer depuis .env
	signInUrl: '/sign-in',
	signUpUrl: '/sign-up',
	afterSignInUrl: '/dashboard',
	afterSignUpUrl: '/dashboard'
};

// Fonction pour initialiser Clerk (à implémenter)
export async function initializeClerk() {
	// TODO: Initialiser Clerk ici
	console.log('Clerk initialization - À implémenter');
	isLoadingStore.set(false);
}

// Fonction pour obtenir l'utilisateur actuel (à implémenter)
export async function getCurrentUser() {
	// TODO: Récupérer l'utilisateur via l'API Clerk
	return null;
}

// Fonction pour se déconnecter (à implémenter)
export async function signOut() {
	// TODO: Déconnexion via Clerk
	userStore.set(null);
}

