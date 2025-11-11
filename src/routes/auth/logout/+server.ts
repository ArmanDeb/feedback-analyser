// Route de déconnexion
import { lucia } from '$lib/lucia';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, cookies }) => {
	if (!locals.session) {
		throw redirect(302, '/');
	}

	// Invalider la session
	await lucia.invalidateSession(locals.session.id);
	
	// Supprimer le cookie
	const sessionCookie = lucia.createBlankSessionCookie();
	cookies.set(sessionCookie.name, sessionCookie.value, {
		path: '/',
		...sessionCookie.attributes
	});

	throw redirect(302, '/');
};

