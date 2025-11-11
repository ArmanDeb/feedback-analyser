// Layout serveur pour la section admin
import type { LayoutServerLoad } from './$types';
import { stackServerApp } from '$lib/stack';

export const load: LayoutServerLoad = async ({ request }) => {
	try {
		// Initialiser Stack Auth
		const user = await stackServerApp.getUser({ request });
		
		return {
			user: user ? {
				id: user.id,
				email: user.primaryEmail,
				displayName: user.displayName
			} : null
		};
	} catch (err) {
		console.warn('⚠️ Stack Auth non disponible en mode dev');
		return {
			user: null
		};
	}
};

