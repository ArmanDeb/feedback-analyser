// API endpoint pour vérifier un magic link
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const { token } = await request.json();
		
		if (!token) {
			return json({ error: 'Token requis' }, { status: 400 });
		}

		// Vérifier que Stack Auth est configuré
		const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;
		const secretKey = process.env.STACK_SECRET_SERVER_KEY;
		
		if (!projectId || !secretKey) {
			console.error('Stack Auth non configuré');
			return json({ 
				error: 'Authentification non configurée' 
			}, { status: 500 });
		}

		console.log('🔐 Vérification du token magic link...');

		// Stack Auth API endpoint pour vérifier le token
		const stackAuthUrl = 'https://api.stack-auth.com/api/v1/auth/otp/verify';
		
		const response = await fetch(stackAuthUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-stack-project-id': projectId,
				'x-stack-secret-server-key': secretKey,
			},
			body: JSON.stringify({
				token
			})
		});

		if (!response.ok) {
			const errorData = await response.text();
			console.error('❌ Erreur vérification Stack Auth:', response.status, errorData);
			
			return json({ 
				error: 'Token invalide ou expiré',
				message: 'Le lien de connexion n\'est plus valide.'
			}, { status: 401 });
		}

		const data = await response.json();
		console.log('✅ Token vérifié avec succès:', data);

		// Créer une session (à améliorer avec de vrais cookies/JWT)
		const sessionToken = data.access_token || data.session_token;
		
		if (sessionToken) {
			// Stocker le token de session dans un cookie
			cookies.set('stack_session', sessionToken, {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 30 // 30 jours
			});
		}

		return json({ 
			success: true,
			message: 'Connexion réussie !',
			user: data.user
		});

	} catch (error) {
		console.error('❌ Erreur inattendue:', error);
		return json({ 
			error: 'Une erreur est survenue lors de la vérification' 
		}, { status: 500 });
	}
};

