// Layout Server - Passe l'utilisateur au client
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	try {
		return {
			user: locals.user || null
		};
	} catch (error) {
		console.error('❌ Error in layout server load:', error);
		// Return null user on error to prevent 500
		return {
			user: null
		};
	}
};

