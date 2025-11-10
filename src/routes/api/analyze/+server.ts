// Route API pour l'analyse de feedback avec IA
// POST /api/analyze

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { OPENROUTER_API_KEY } from '$env/static/private';

// Type pour la requête
interface AnalyzeRequest {
	feedbackText: string;
}

// Type pour la réponse de l'IA
interface AnalysisResult {
	sentiment: 'positive' | 'negative' | 'neutral';
	score: number;
	themes: {
		positive: string[];
		negative: string[];
	};
	bugs: Array<{
		description: string;
		severity: 'low' | 'medium' | 'high';
	}>;
	featureRequests: Array<{
		description: string;
		priority: 'low' | 'medium' | 'high';
	}>;
	summary: string;
}

// Prompt système pour l'IA
const SYSTEM_PROMPT = `Tu es un expert en analyse de feedback client. 
Ton rôle est d'analyser les retours clients et d'extraire des insights structurés.

Tu dois TOUJOURS répondre avec un JSON valide suivant EXACTEMENT ce format :
{
  "sentiment": "positive" | "negative" | "neutral",
  "score": number (entre -1 et 1),
  "themes": {
    "positive": ["thème1", "thème2"],
    "negative": ["problème1", "problème2"]
  },
  "bugs": [
    {
      "description": "description du bug",
      "severity": "low" | "medium" | "high"
    }
  ],
  "featureRequests": [
    {
      "description": "description de la fonctionnalité",
      "priority": "low" | "medium" | "high"
    }
  ],
  "summary": "résumé en 1-2 phrases"
}

Règles importantes :
- Réponds UNIQUEMENT avec du JSON, aucun texte avant ou après
- Si aucun bug n'est détecté, retourne un tableau vide []
- Si aucune fonctionnalité n'est demandée, retourne un tableau vide []
- Le sentiment doit être déterminé objectivement
- Le score va de -1 (très négatif) à 1 (très positif)`;

export const POST: RequestHandler = async ({ request }) => {
	try {
		// 1. Valider la requête
		const body = await request.json() as AnalyzeRequest;
		const { feedbackText } = body;

		if (!feedbackText || feedbackText.trim().length === 0) {
			return json(
				{ error: 'Le feedback ne peut pas être vide' },
				{ status: 400 }
			);
		}

		if (feedbackText.length > 5000) {
			return json(
				{ error: 'Le feedback est trop long (maximum 5000 caractères)' },
				{ status: 400 }
			);
		}

		// 2. Vérifier la clé API
		console.log('🔑 Vérification de la clé OpenRouter...');
		if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your_openrouter_key_here' || OPENROUTER_API_KEY === '') {
			console.error('❌ OPENROUTER_API_KEY not configured');
			console.error('   Current value:', OPENROUTER_API_KEY ? `${OPENROUTER_API_KEY.substring(0, 10)}...` : 'undefined');
			return json(
				{
					error: 'API IA non configurée',
					details: 'Veuillez configurer OPENROUTER_API_KEY dans vos variables d\'environnement',
					hint: 'Créez un compte sur openrouter.ai et ajoutez la clé dans votre fichier .env'
				},
				{ status: 503 }
			);
		}
		console.log('✅ Clé OpenRouter configurée:', OPENROUTER_API_KEY.substring(0, 15) + '...');

		// 3. Appeler l'API OpenRouter
		console.log('📡 Appel à OpenRouter API...');
		const startTime = Date.now();

		const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
				'Content-Type': 'application/json',
				'HTTP-Referer': 'https://feedback-analyser.netlify.app',
				'X-Title': 'Feedback Analyser'
			},
			body: JSON.stringify({
				model: 'mistralai/mistral-7b-instruct',
				messages: [
					{
						role: 'system',
						content: SYSTEM_PROMPT
					},
					{
						role: 'user',
						content: `Analyse ce feedback client :\n\n${feedbackText}`
					}
				],
				temperature: 0.3, // Faible température pour plus de cohérence
				max_tokens: 1000
			})
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('❌ Erreur OpenRouter:', response.status);
			console.error('   Response:', errorText.substring(0, 500));
			
			let errorData: any = {};
			try {
				errorData = JSON.parse(errorText);
			} catch {
				errorData = { message: errorText };
			}
			
			return json(
				{
					error: 'Erreur lors de l\'appel à l\'API IA',
					details: errorData.error?.message || errorData.message || 'Erreur inconnue',
					statusCode: response.status,
					hint: response.status === 401 ? 'Vérifiez votre clé API OpenRouter' : undefined
				},
				{ status: response.status }
			);
		}

		const data = await response.json();
		const duration = Date.now() - startTime;
		console.log(`✅ Réponse reçue en ${duration}ms`);

		// 4. Parser la réponse de l'IA
		const aiResponse = data.choices[0]?.message?.content;
		if (!aiResponse) {
			return json(
				{ error: 'Pas de réponse de l\'IA' },
				{ status: 500 }
			);
		}

		// 5. Parser le JSON retourné par l'IA
		console.log('📄 Réponse brute de l\'IA:', aiResponse.substring(0, 200) + '...');
		
		let analysisResult: AnalysisResult;
		try {
			// Nettoyer la réponse
			let cleanedResponse = aiResponse.trim();
			
			// Retirer les markdown code blocks si présents (```json ... ```)
			cleanedResponse = cleanedResponse.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
			cleanedResponse = cleanedResponse.replace(/^```\s*/i, '').replace(/```\s*$/, '');
			
			// Extraire le JSON de la réponse
			const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
			if (!jsonMatch) {
				console.error('❌ Aucun JSON trouvé dans la réponse');
				console.log('Réponse complète:', aiResponse);
				throw new Error('Aucun JSON trouvé dans la réponse');
			}
			
			const jsonString = jsonMatch[0];
			console.log('✅ JSON extrait:', jsonString.substring(0, 100) + '...');
			
			analysisResult = JSON.parse(jsonString);
			
			// Valider que les champs requis sont présents
			if (!analysisResult.sentiment || !analysisResult.themes) {
				throw new Error('JSON incomplet - champs manquants');
			}
			
		} catch (parseError) {
			console.error('❌ Erreur de parsing JSON:', parseError);
			console.log('📄 Réponse complète:', aiResponse);
			return json(
				{
					error: 'Erreur de parsing de la réponse IA',
					details: parseError instanceof Error ? parseError.message : 'La réponse de l\'IA n\'est pas au format JSON valide',
					rawResponse: aiResponse.substring(0, 1000), // Plus de contexte pour debug
					hint: 'Vérifiez que la clé OPENROUTER_API_KEY est correctement configurée'
				},
				{ status: 500 }
			);
		}

		// 6. Préparer la réponse avec métadonnées
		const usage = data.usage || {};
		const result = {
			success: true,
			analysis: analysisResult,
			metadata: {
				model: 'mistralai/mistral-7b-instruct',
				tokensIn: usage.prompt_tokens || 0,
				tokensOut: usage.completion_tokens || 0,
				totalTokens: usage.total_tokens || 0,
				duration: duration,
				timestamp: new Date().toISOString()
			}
		};

		console.log('📊 Analyse complétée:', {
			sentiment: analysisResult.sentiment,
			bugs: analysisResult.bugs.length,
			features: analysisResult.featureRequests.length,
			tokens: result.metadata.totalTokens
		});

		// S2.8: Sauvegarder dans la BDD
		// Note: Temporairement désactivé car nécessite l'authentification (Stack Auth)
		// TODO S3: Activer la sauvegarde une fois l'auth configurée
		/*
		try {
			const userId = "temp-user-id"; // TODO: Récupérer depuis Stack Auth
			
			await prisma.analysis.create({
				data: {
					userId: userId,
					feedbackText: feedbackText,
					result: analysisResult as any
				}
			});

			await prisma.apiLog.create({
				data: {
					userId: userId,
					modelUsed: 'mistralai/mistral-7b-instruct',
					tokensIn: result.metadata.tokensIn,
					tokensOut: result.metadata.tokensOut,
					cost: (result.metadata.totalTokens * 0.0002) / 1000 // Estimation
				}
			});
		} catch (dbError) {
			console.error('❌ Erreur sauvegarde BDD:', dbError);
			// On ne bloque pas la réponse si la BDD échoue
		}
		*/

		return json(result);

	} catch (error) {
		console.error('❌ Erreur inattendue:', error);
		return json(
			{
				error: 'Erreur serveur inattendue',
				details: error instanceof Error ? error.message : 'Erreur inconnue'
			},
			{ status: 500 }
		);
	}
};

