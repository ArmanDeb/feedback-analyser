// API endpoint pour envoyer un magic link via Stack Auth
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, url }) => {
	try {
		const { email, type } = await request.json();
		
		if (!email) {
			return json({ error: 'Email requis' }, { status: 400 });
		}

		// Vérifier que Stack Auth est configuré
		// Note: Les variables sont accessibles via import.meta.env en SvelteKit
		const projectId = import.meta.env.VITE_STACK_PROJECT_ID || 
		                  process.env.NEXT_PUBLIC_STACK_PROJECT_ID ||
		                  '77ef6702-05cf-48a6-970f-c50714b1ea94'; // Fallback temporaire
		                  
		const publishableKey = import.meta.env.VITE_STACK_PUBLISHABLE_KEY || 
		                       process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY ||
		                       'pck_3kfx6mhn658vwtww4h6s64dyn5hdsfc31drpdtqyt6nvg'; // Fallback temporaire
		
		console.log('🔑 Vérification des clés Stack Auth...');
		console.log('Project ID:', projectId ? '✅ Trouvé' : '❌ Manquant');
		console.log('Publishable Key:', publishableKey ? '✅ Trouvé' : '❌ Manquant');
		
		if (!projectId || !publishableKey) {
			console.error('❌ Stack Auth non configuré');
			console.error('Variables disponibles:', Object.keys(process.env).filter(k => k.includes('STACK')));
			return json({ 
				error: 'Authentification non configurée. Contactez l\'administrateur.' 
			}, { status: 500 });
		}

		console.log('📧 Envoi du magic link à:', email);
		console.log('🔑 Project ID:', projectId);

		// Stack Auth API endpoint pour les magic links
		const stackAuthUrl = 'https://api.stack-auth.com/api/v1/auth/otp/send';
		
		const response = await fetch(stackAuthUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-stack-project-id': projectId,
				'x-stack-publishable-client-key': publishableKey,
			},
			body: JSON.stringify({
				email,
				callback_url: `${url.origin}/auth/callback`,
			})
		});

		if (!response.ok) {
			const errorData = await response.text();
			console.error('❌ Erreur Stack Auth:', response.status, errorData);
			
			return json({ 
				error: 'Erreur lors de l\'envoi du magic link. Réessayez.' 
			}, { status: response.status });
		}

		const data = await response.json();
		console.log('✅ Magic link envoyé avec succès');

		return json({ 
			success: true,
			message: `Magic link envoyé à ${email}. Vérifiez votre boîte email !`
		});

	} catch (error) {
		console.error('❌ Erreur inattendue:', error);
		return json({ 
			error: 'Une erreur est survenue. Réessayez plus tard.' 
		}, { status: 500 });
	}
};

