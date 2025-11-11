// Route d'inscription - Server
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { lucia } from '$lib/lucia';
import { hashPassword, validateEmail, validatePassword } from '$lib/auth-utils';
import { prisma } from '$lib/db';

export const load: PageServerLoad = async ({ locals }) => {
	// Si déjà connecté, rediriger vers le tableau de bord
	if (locals.user) {
		throw redirect(302, '/tableau-de-bord');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString()?.toLowerCase()?.trim();
		const password = formData.get('password')?.toString();
		const confirmPassword = formData.get('confirmPassword')?.toString();

		// Validation des données
		if (!email || !password || !confirmPassword) {
			return fail(400, {
				error: 'Tous les champs sont requis',
				email
			});
		}

		if (!validateEmail(email)) {
			return fail(400, {
				error: 'Adresse email invalide',
				email
			});
		}

		if (password !== confirmPassword) {
			return fail(400, {
				error: 'Les mots de passe ne correspondent pas',
				email
			});
		}

		const passwordValidation = validatePassword(password);
		if (!passwordValidation.valid) {
			return fail(400, {
				error: passwordValidation.error,
				email
			});
		}

		try {
			// Vérifier si l'utilisateur existe déjà
			const existingUser = await prisma.user.findUnique({
				where: { email }
			});

			if (existingUser) {
				return fail(400, {
					error: 'Un compte existe déjà avec cet email',
					email
				});
			}

			// Créer l'utilisateur
			const hashedPassword = await hashPassword(password);
			const user = await prisma.user.create({
				data: {
					email,
					hashedPassword,
					role: 'user'
				}
			});

			// Créer une session
			const session = await lucia.createSession(user.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			
			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '/',
				...sessionCookie.attributes
			});

		} catch (error) {
			console.error('❌ Erreur lors de la création du compte:', error);
			return fail(500, {
				error: 'Erreur lors de la création du compte. Veuillez réessayer.',
				email
			});
		}

		// Rediriger vers le tableau de bord
		throw redirect(302, '/tableau-de-bord');
	}
};

