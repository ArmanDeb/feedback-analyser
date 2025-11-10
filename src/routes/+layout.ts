// Layout load function
// Charge les données nécessaires pour toute l'application

export const ssr = true;
export const prerender = false;

export async function load() {
	return {
		// Les données globales de l'application seront ajoutées ici
	};
}

