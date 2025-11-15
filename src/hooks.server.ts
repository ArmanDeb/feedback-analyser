// Hooks serveur SvelteKit pour Lucia Auth
import type { Handle } from '@sveltejs/kit';
import { lucia } from '$lib/lucia';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Initialize locals with null values
	event.locals.user = null;
	event.locals.session = null;
	
	try {
		// Ensure lucia is initialized
		if (!lucia || !lucia.sessionCookieName) {
			console.warn('⚠️ Lucia not initialized, skipping session validation');
			return resolve(event);
		}
		
		// Récupérer le cookie de session
		const sessionId = event.cookies.get(lucia.sessionCookieName);
		
		if (sessionId) {
			try {
				// Valider la session
				const { session, user } = await lucia.validateSession(sessionId);
				
				if (session && session.fresh) {
					// Session valide et fraîche, renouveler le cookie
					const sessionCookie = lucia.createSessionCookie(session.id);
					event.cookies.set(sessionCookie.name, sessionCookie.value, {
						path: '/',
						...sessionCookie.attributes
					});
				}
				
				if (!session) {
					// Session invalide, supprimer le cookie
					const sessionCookie = lucia.createBlankSessionCookie();
					event.cookies.set(sessionCookie.name, sessionCookie.value, {
						path: '/',
						...sessionCookie.attributes
					});
				}
				
				event.locals.user = user;
				event.locals.session = session;
			} catch (error) {
				// If session validation fails, clear the session
				console.error('❌ Error validating session:', error);
				const sessionCookie = lucia.createBlankSessionCookie();
				event.cookies.set(sessionCookie.name, sessionCookie.value, {
					path: '/',
					...sessionCookie.attributes
				});
				event.locals.user = null;
				event.locals.session = null;
			}
		}
		
		// Gardes de routes - Protéger les routes authentifiées
		const path = event.url.pathname;
		
		// Routes protégées nécessitant une authentification
		const protectedRoutes = [
			'/tableau-de-bord',
			'/nouvelle-analyse',
			'/compte/utilisation',
			'/dashboard'
		];
		
		// Routes admin
		const adminRoutes = ['/dashboard-admin'];
		
		// Vérifier si l'utilisateur essaie d'accéder à une route protégée
		if (protectedRoutes.some(route => path.startsWith(route))) {
			if (!event.locals.user) {
				// Rediriger vers la page de connexion
				throw redirect(302, `/auth/signin?redirect=${encodeURIComponent(path)}`);
			}
		}
		
		// Vérifier si l'utilisateur essaie d'accéder à une route admin
		if (adminRoutes.some(route => path.startsWith(route))) {
			if (!event.locals.user) {
				throw redirect(302, `/auth/signin?redirect=${encodeURIComponent(path)}`);
			}
			if (event.locals.user.role !== 'admin') {
				throw redirect(302, '/tableau-de-bord');
			}
		}
	} catch (error) {
		// Log error but don't crash - allow page to load
		console.error('❌ Error in hooks.server.ts:', error);
		// If it's a redirect, re-throw it
		if (error && typeof error === 'object' && 'status' in error && (error as any).status >= 300 && (error as any).status < 400) {
			throw error;
		}
		// Otherwise, continue with null user
	}
	
	return resolve(event);
};
