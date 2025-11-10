// Route de test simple pour OpenRouter
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { OPENROUTER_API_KEY } from '$env/static/private';

export const GET: RequestHandler = async () => {
	console.log('\n🧪 === TEST OPENROUTER ===');
	
	// 1. Vérifier la clé API
	console.log('🔑 Clé API:', OPENROUTER_API_KEY ? `${OPENROUTER_API_KEY.substring(0, 20)}...` : 'NON CONFIGURÉE');
	
	if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your_openrouter_key_here') {
		return json({
			error: 'OPENROUTER_API_KEY non configurée',
			hint: 'Ajoutez OPENROUTER_API_KEY="sk-or-v1-..." dans votre fichier .env'
		}, { status: 503 });
	}
	
	// 2. Test simple avec un prompt très basique
	console.log('📡 Appel à OpenRouter...');
	
	try {
		const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
				'Content-Type': 'application/json',
				'HTTP-Referer': 'http://localhost:5173',
				'X-Title': 'Feedback Analyser Test'
			},
			body: JSON.stringify({
				model: 'mistralai/mistral-7b-instruct',
				messages: [
					{
						role: 'user',
						content: 'Réponds uniquement avec ce JSON exactement comme ça (sans rien avant ou après): {"test": "success", "message": "Hello from OpenRouter"}'
					}
				],
				temperature: 0.1,
				max_tokens: 100
			})
		});
		
		console.log('📊 Status:', response.status, response.statusText);
		
		if (!response.ok) {
			const errorText = await response.text();
			console.error('❌ Erreur:', errorText);
			return json({
				error: 'Erreur OpenRouter',
				status: response.status,
				details: errorText
			}, { status: response.status });
		}
		
		const data = await response.json();
		console.log('✅ Réponse complète:', JSON.stringify(data, null, 2));
		
		const aiResponse = data.choices[0]?.message?.content;
		console.log('📄 Message de l\'IA:', aiResponse);
		
		return json({
			success: true,
			rawResponse: aiResponse,
			fullData: data,
			usage: data.usage
		});
		
	} catch (error) {
		console.error('❌ Exception:', error);
		return json({
			error: 'Exception lors du test',
			details: error instanceof Error ? error.message : 'Erreur inconnue'
		}, { status: 500 });
	}
};

