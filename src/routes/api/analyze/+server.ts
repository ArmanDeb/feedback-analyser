// Route API pour l'analyse de feedback avec IA
// POST /api/analyze

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCachedAnalysis, setCachedAnalysis } from '$lib/cache';

// Récupérer la clé API de manière compatible CI/CD
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

// Configuration des timeouts et retry
const API_TIMEOUT_MS = 30000; // 30 secondes
const MAX_RETRIES = 2; // Nombre maximum de tentatives
const RETRY_DELAY_MS = 1000; // Délai entre les tentatives

// Helper pour créer un timeout sur une Promise
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
	return Promise.race([
		promise,
		new Promise<T>((_, reject) =>
			setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
		)
	]);
}

// Helper pour retry avec délai exponentiel
async function retryWithBackoff<T>(
	fn: () => Promise<T>,
	maxRetries: number,
	baseDelayMs: number
): Promise<T> {
	let lastError: Error | null = null;
	
	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error as Error;
			
			if (attempt < maxRetries) {
				const delay = baseDelayMs * Math.pow(2, attempt); // Backoff exponentiel
				console.log(`⚠️ Tentative ${attempt + 1}/${maxRetries + 1} échouée. Nouvelle tentative dans ${delay}ms...`);
				await new Promise(resolve => setTimeout(resolve, delay));
			}
		}
	}
	
	throw lastError;
}

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

// Prompt système pour l'IA - Version 2 (Optimisée pour la fiabilité)
const SYSTEM_PROMPT = `You are an expert customer feedback analyst. Your task is to analyze feedback text and return STRUCTURED JSON data.

CRITICAL INSTRUCTIONS:
- Return ONLY a valid JSON object
- NO additional text, explanations, or markdown
- NO code blocks (no \`\`\`json or \`\`\`)
- Just the raw JSON object

REQUIRED JSON STRUCTURE:
{
  "sentiment": "positive" | "negative" | "neutral",
  "score": number between -1.0 (very negative) and 1.0 (very positive),
  "themes": {
    "positive": ["array", "of", "strings"],
    "negative": ["array", "of", "strings"]
  },
  "bugs": [
    {"description": "string", "severity": "low"|"medium"|"high"}
  ],
  "featureRequests": [
    {"description": "string", "priority": "low"|"medium"|"high"}
  ],
  "summary": "concise 1-2 sentence summary"
}

SCORING GUIDE:
- Very positive (0.7 to 1.0): enthusiastic praise, no major issues
- Positive (0.3 to 0.7): generally satisfied with minor issues
- Neutral (-0.3 to 0.3): mixed feelings or factual feedback
- Negative (-0.7 to -0.3): dissatisfied with some positives
- Very negative (-1.0 to -0.7): highly critical, angry, disappointed

EDGE CASES:
1. Empty feedback: Return neutral sentiment (0.0), empty arrays, summary: "No feedback provided"
2. Vague feedback: Extract what you can, mark as neutral if unclear
3. Mixed feedback: Balance positive/negative in score, list both themes
4. No bugs/features: Use empty arrays []
5. Multiple languages: Respond in the same language as input

SEVERITY/PRIORITY RULES:
- High severity bugs: crashes, data loss, payment issues, security problems
- Medium severity: inconvenient bugs that affect workflow
- Low severity: minor UI glitches, cosmetic issues
- High priority features: frequently requested, core functionality gaps
- Medium priority: nice-to-have improvements
- Low priority: minor enhancements

EXAMPLE (what you should return):
{"sentiment":"positive","score":0.6,"themes":{"positive":["intuitive interface","fast response"],"negative":["expensive pricing"]},"bugs":[{"description":"login button not clickable on mobile","severity":"high"}],"featureRequests":[{"description":"add dark mode","priority":"medium"}],"summary":"User appreciates the interface and speed but finds pricing high and encountered a mobile login bug"}

NOW ANALYZE THE FEEDBACK AND RETURN ONLY THE JSON OBJECT:`;

export const POST: RequestHandler = async ({ request }) => {
	try {
		// 1. Valider la requête
		const body = await request.json() as AnalyzeRequest;
		let { feedbackText } = body;

		// Nettoyer le feedback
		feedbackText = feedbackText?.trim() || '';

		if (!feedbackText || feedbackText.length === 0) {
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

		// Détecter les feedbacks très courts (moins de 10 caractères)
		if (feedbackText.length < 10) {
			console.warn('⚠️ Feedback très court:', feedbackText);
			// On laisse passer mais l'IA devra gérer ce cas
		}

		// 2. Vérifier le cache (S4.6: économiser les coûts)
		const cachedResult = getCachedAnalysis(feedbackText);
		if (cachedResult) {
			console.log('🎯 Résultat trouvé dans le cache, pas d\'appel API nécessaire');
			return json({
				...cachedResult,
				metadata: {
					...cachedResult.metadata,
					fromCache: true,
					cachedAt: new Date().toISOString()
				}
			});
		}

		// 3. Vérifier la clé API
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

		// 4. Appeler l'API OpenRouter avec retry et timeout
		console.log('📡 Appel à OpenRouter API avec retry et timeout...');
		const startTime = Date.now();

		let response: Response;
		let data: any;
		let duration = 0;
		
		try {
			// Fonction pour faire l'appel API
			const makeApiCall = async () => {
				return await withTimeout(
					fetch('https://openrouter.ai/api/v1/chat/completions', {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
							'Content-Type': 'application/json',
							'HTTP-Referer': 'https://feedback-analyser.netlify.app',
							'X-Title': 'Feedback Analyser'
						},
						body: JSON.stringify({
							model: 'mistralai/mistral-7b-instruct:free',
							messages: [
								{
									role: 'system',
									content: SYSTEM_PROMPT
								},
								{
									role: 'user',
									content: `FEEDBACK TO ANALYZE:\n\n"${feedbackText}"\n\nRETURN JSON ONLY (no other text):`
								}
							],
							temperature: 0.1,
							max_tokens: 2000,
							response_format: { type: "json_object" },
							top_p: 0.9
						})
					}),
					API_TIMEOUT_MS,
					`L'API a pris trop de temps à répondre (timeout après ${API_TIMEOUT_MS / 1000}s)`
				);
			};

			// Appeler avec retry
			response = await retryWithBackoff(makeApiCall, MAX_RETRIES, RETRY_DELAY_MS);

			// Vérifier le statut HTTP
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
				
				// Déterminer si l'erreur est retry-able
				const isRetryable = [429, 500, 502, 503, 504].includes(response.status);
				
				return json(
					{
						error: 'Erreur lors de l\'appel à l\'API IA',
						details: errorData.error?.message || errorData.message || 'Erreur inconnue',
						statusCode: response.status,
						hint: response.status === 401 
							? 'Vérifiez votre clé API OpenRouter' 
							: response.status === 429
							? 'Trop de requêtes. Attendez quelques secondes avant de réessayer.'
							: isRetryable
							? 'Erreur serveur temporaire. Réessayez dans quelques instants.'
							: 'Une erreur est survenue lors de l\'analyse.'
					},
					{ status: response.status >= 500 ? 503 : response.status }
				);
			}

			// Parser la réponse
			data = await response.json();
			duration = Date.now() - startTime;
			console.log(`✅ Réponse reçue en ${duration}ms`);
			
		} catch (error) {
			duration = Date.now() - startTime;
			console.error('❌ Erreur lors de l\'appel OpenRouter:', error);
			
			const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
			const isTimeout = errorMessage.includes('timeout');
			
			return json(
				{
					error: isTimeout ? 'Délai d\'attente dépassé' : 'Erreur de connexion à l\'API IA',
					details: errorMessage,
					duration: duration,
					hint: isTimeout 
						? `L'API n'a pas répondu dans le délai imparti (${API_TIMEOUT_MS / 1000}s). Réessayez avec un feedback plus court.`
						: 'Vérifiez votre connexion internet et réessayez.'
				},
				{ status: 503 }
			);
		}

		// 5. Parser la réponse de l'IA
		const aiResponse = data.choices[0]?.message?.content;
		if (!aiResponse) {
			return json(
				{ error: 'Pas de réponse de l\'IA' },
				{ status: 500 }
			);
		}

		// 6. Parser le JSON retourné par l'IA
		console.log('📄 Réponse brute de l\'IA:', aiResponse.substring(0, 200) + '...');
		
		let analysisResult: AnalysisResult;
		try {
			// Nettoyer la réponse
			let cleanedResponse = aiResponse.trim();
			
			// Retirer les markdown code blocks si présents (```json ... ```)
			cleanedResponse = cleanedResponse.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
			cleanedResponse = cleanedResponse.replace(/^```\s*/i, '').replace(/```\s*$/, '');
			
			// Extraire le JSON de la réponse (support pour JSON avec ou sans wrapping)
			const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
			if (!jsonMatch) {
				console.error('❌ Aucun JSON trouvé dans la réponse');
				console.log('Réponse complète:', aiResponse);
				throw new Error('Aucun JSON trouvé dans la réponse');
			}
			
			const jsonString = jsonMatch[0];
			console.log('✅ JSON extrait:', jsonString.substring(0, 100) + '...');
			
			analysisResult = JSON.parse(jsonString);
			
			// Validation et normalisation des champs
			if (!analysisResult.sentiment) {
				analysisResult.sentiment = 'neutral';
			}
			if (!analysisResult.score && analysisResult.score !== 0) {
				analysisResult.score = 0;
			}
			if (!analysisResult.themes) {
				analysisResult.themes = { positive: [], negative: [] };
			}
			if (!analysisResult.themes.positive) {
				analysisResult.themes.positive = [];
			}
			if (!analysisResult.themes.negative) {
				analysisResult.themes.negative = [];
			}
			if (!analysisResult.bugs) {
				analysisResult.bugs = [];
			}
			if (!analysisResult.featureRequests) {
				analysisResult.featureRequests = [];
			}
			if (!analysisResult.summary) {
				analysisResult.summary = 'Analyse complétée';
			}
			
			// Valider que le sentiment est valide
			const validSentiments = ['positive', 'negative', 'neutral'];
			if (!validSentiments.includes(analysisResult.sentiment)) {
				console.warn(`⚠️ Sentiment invalide: ${analysisResult.sentiment}, utilisation de 'neutral'`);
				analysisResult.sentiment = 'neutral' as any;
			}
			
			// Valider que le score est dans les limites
			if (analysisResult.score < -1) analysisResult.score = -1;
			if (analysisResult.score > 1) analysisResult.score = 1;
			
			console.log('✅ JSON validé et normalisé');
			
		} catch (parseError) {
			console.error('❌ Erreur de parsing JSON:', parseError);
			console.log('📄 Réponse complète:', aiResponse);
			return json(
				{
					error: 'Erreur de parsing de la réponse IA',
					details: parseError instanceof Error ? parseError.message : 'La réponse de l\'IA n\'est pas au format JSON valide',
					rawResponse: aiResponse.substring(0, 1000), // Plus de contexte pour debug
					hint: 'L\'IA a peut-être retourné une réponse malformée. Réessayez ou contactez le support.'
				},
				{ status: 500 }
			);
		}

		// 7. Préparer la réponse avec métadonnées
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
				timestamp: new Date().toISOString(),
				fromCache: false
			}
		};

		// 8. Mettre en cache le résultat (S4.6)
		setCachedAnalysis(feedbackText, result);

		console.log('📊 Analyse complétée:', {
			sentiment: analysisResult.sentiment,
			bugs: analysisResult.bugs.length,
			features: analysisResult.featureRequests.length,
			tokens: result.metadata.totalTokens
		});

		// 9. Sauvegarder dans la BDD + Logging des coûts (S3.4)
		// Note: Pour le développement, on utilise un user ID fictif
		// TODO: Remplacer par l'ID réel depuis Stack Auth quand l'auth sera activée
		try {
			const prisma = await import('$lib/db').then(m => m.prisma);
			const { calculateCost } = await import('$lib/admin');
			
			// User ID temporaire pour le développement
			const userId = "dev-user-1"; // TODO: Récupérer depuis Stack Auth
			
			// Vérifier si l'utilisateur existe, sinon le créer
			let user = await prisma.user.findUnique({
				where: { id: userId }
			});

			if (!user) {
				user = await prisma.user.create({
					data: {
						id: userId,
						stackId: userId,
						email: 'dev@feedback-analyser.com', // TODO: Email réel depuis Stack Auth
						role: 'user'
					}
				});
				console.log('✅ Utilisateur de développement créé');
			}
			
			// Calculer le coût réel
			const cost = calculateCost(
				'mistralai/mistral-7b-instruct:free',
				result.metadata.tokensIn,
				result.metadata.tokensOut
			);
			
			// Sauvegarder l'analyse
			await prisma.analysis.create({
				data: {
					userId: userId,
					feedbackText: feedbackText,
					result: analysisResult as any
				}
			});

			// Logger l'appel API pour le monitoring
			await prisma.apiLog.create({
				data: {
					userId: userId,
					modelUsed: 'mistralai/mistral-7b-instruct:free',
					tokensIn: result.metadata.tokensIn,
					tokensOut: result.metadata.tokensOut,
					cost: cost
				}
			});

			console.log('✅ Analyse et log sauvegardés en BDD (coût:', cost, ')');
			
		} catch (dbError) {
			console.error('❌ Erreur sauvegarde BDD:', dbError);
			// On ne bloque pas la réponse si la BDD échoue
			// L'analyse a déjà été effectuée, l'utilisateur la recevra quand même
		}

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

