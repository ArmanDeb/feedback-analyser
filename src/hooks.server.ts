// Hooks serveur SvelteKit pour Lucia Auth
import type { Handle } from '@sveltejs/kit';
import { lucia } from '$lib/lucia';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Récupérer le cookie de session
	const sessionId = event.cookies.get(lucia.sessionCookieName);
	
	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
	} else {
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
	}
	
	// Gardes de routes - Protéger les routes authentifiées
	const path = event.url.pathname;
	
	// Routes protégées nécessitant une authentification
	const protectedRoutes = [
		'/tableau-de-bord',
		'/nouvelle-analyse',
		'/compte/utilisation'
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
	
	return resolve(event);
};
