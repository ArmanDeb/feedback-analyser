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
		console.log('🔑 Publishable Key:', publishableKey.substring(0, 20) + '...');
		console.log('🌐 Callback URL:', `${url.origin}/auth/callback`);

		// Stack Auth utilise une approche différente
		// On va créer un magic link manuellement via leur SDK
		// Pour l'instant, simulons l'envoi et affichons le lien
		
		console.log('⚠️ Stack Auth API direct pas encore testé - Utilisation de l\'approche SDK');
		console.log('💡 Alternative : Utilisez les composants Stack Auth built-in');
		
		// Générer un code temporaire (6 chiffres)
		const code = Math.floor(100000 + Math.random() * 900000).toString();
		console.log('🔢 Code de vérification temporaire:', code);
		
		// Pour l'instant, on retourne un succès pour que l'UI fonctionne
		// TODO: Intégrer le vrai SDK Stack Auth ou utiliser leurs composants
		console.log('✅ Magic link simulé (en attente d\'intégration complète Stack Auth)');
		console.log('📧 Email cible:', email);
		console.log('🔗 Lien callback:', `${url.origin}/auth/callback?email=${encodeURIComponent(email)}&code=${code}`);
		console.log('');
		console.log('⚠️ IMPORTANT: Pour une vraie intégration, installez le SDK Stack Auth :');
		console.log('   npm install @stackframe/stack');
		console.log('   Ou utilisez leurs composants pre-built');
		console.log('');
		
		// Retourner un succès avec instructions
		return json({ 
			success: true,
			message: `Instructions envoyées ! Pour ce test, utilisez ce code : ${code}`,
			debug: {
				email,
				code,
				callbackUrl: `${url.origin}/auth/callback?email=${encodeURIComponent(email)}&code=${code}`,
				note: 'Intégration Stack Auth complète en cours. Pour l\'instant, utilisez le code ci-dessus.'
			}
		});

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

