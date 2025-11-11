// Layout load function
// Charge les données nécessaires pour toute l'application
import type { LayoutLoad } from './$types';

export const ssr = true;
export const prerender = false;

export const load: LayoutLoad = async ({ data }) => {
	// Passer les données du serveur (incluant user) au client
	return {
		user: data.user
	};
};

