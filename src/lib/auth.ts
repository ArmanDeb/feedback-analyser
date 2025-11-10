// Configuration Stack Auth (Neon Auth) pour SvelteKit
// Neon Auth utilise Stack Auth sous le capot

import { writable } from 'svelte/store';

// Store pour l'état de l'utilisateur
export const userStore = writable<any>(null);
export const isLoadingStore = writable<boolean>(true);

// Configuration Stack Auth (fournie par Neon Auth)
export const stackAuthConfig = {
	projectId: '', // À configurer depuis .env (NEXT_PUBLIC_STACK_PROJECT_ID)
	publishableClientKey: '', // À configurer depuis .env (NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY)
	secretServerKey: '', // À configurer depuis .env (STACK_SECRET_SERVER_KEY)
	signInUrl: '/handler/sign-in',
	signUpUrl: '/handler/sign-up',
	afterSignInUrl: '/dashboard',
	afterSignUpUrl: '/dashboard'
};

// Fonction pour initialiser Stack Auth
export async function initializeStackAuth() {
	console.log('Stack Auth initialization - Configuration via .env');
	isLoadingStore.set(false);
}

// Fonction pour obtenir l'utilisateur actuel
export async function getCurrentUser() {
	// TODO: Implémenter avec Stack Auth SDK
	return null;
}

// Fonction pour se déconnecter
export async function signOut() {
	// TODO: Implémenter avec Stack Auth SDK
	userStore.set(null);
}

