// Route de connexion - Server
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { lucia } from '$lib/lucia';
import { verifyPassword, validateEmail } from '$lib/auth-utils';
import { prisma } from '$lib/db';

export const load: PageServerLoad = async ({ locals, url }) => {
	// Si déjà connecté, rediriger vers le tableau de bord
	if (locals.user) {
		throw redirect(302, '/tableau-de-bord');
	}
	
	// Récupérer l'URL de redirection (si fournie)
	const redirectTo = url.searchParams.get('redirect') || '/tableau-de-bord';
	
	return { redirectTo };
};

export const actions: Actions = {
	default: async ({ request, cookies, url }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString()?.toLowerCase()?.trim();
		const password = formData.get('password')?.toString();
		const redirectTo = url.searchParams.get('redirect') || '/tableau-de-bord';

		// Validation des données
		if (!email || !password) {
			return fail(400, {
				error: 'Email et mot de passe requis',
				email
			});
		}

		if (!validateEmail(email)) {
			return fail(400, {
				error: 'Adresse email invalide',
				email
			});
		}

		try {
			// Trouver l'utilisateur
			const user = await prisma.user.findUnique({
				where: { email }
			});

			if (!user) {
				return fail(400, {
					error: 'Email ou mot de passe incorrect',
					email
				});
			}

			// Vérifier le mot de passe
			const validPassword = await verifyPassword(user.hashedPassword, password);
			
			if (!validPassword) {
				return fail(400, {
					error: 'Email ou mot de passe incorrect',
					email
				});
			}

			// Créer une session
			const session = await lucia.createSession(user.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			
			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '/',
				...sessionCookie.attributes
			});

		} catch (error) {
			console.error('❌ Erreur lors de la connexion:', error);
			return fail(500, {
				error: 'Erreur lors de la connexion. Veuillez réessayer.',
				email
			});
		}

		// Rediriger vers la page demandée
		throw redirect(302, redirectTo);
	}
};

