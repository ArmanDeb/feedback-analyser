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

// Prompt système pour l'IA - Version 3.2 (Échelle 0-10)
const SYSTEM_PROMPT = `You are an expert customer experience analyst. Analyze feedback to identify friction points and strengths.

CRITICAL INSTRUCTIONS:
- Return ONLY valid JSON
- NO markdown, explanations, or code blocks
- Keep quotes SHORT (max 15 words each)
- Use simple strings, avoid complex nested arrays
- Score scale: 0 to 10 (0 = very negative, 5 = neutral, 10 = very positive)

REQUIRED JSON STRUCTURE:
{
  "executiveSummary": {
    "keyInsight": "One clear sentence summarizing the main finding",
    "overallSentiment": "positive|negative|neutral",
    "sentimentScore": 5.0,
    "topFrictionPoints": [
      {
        "category": "Category name",
        "issue": "Specific issue description",
        "priority": 1,
        "impact": 2.0,
        "quote": "Short relevant quote",
        "recommendation": "Specific action to take"
      }
    ],
    "topStrengthPoints": [
      {
        "category": "Category name",
        "strength": "Specific positive aspect",
        "priority": 1,
        "impact": 8.5,
        "quote": "Short positive quote"
      }
    ]
  },
  "allThemes": [
    {
      "category": "Main category",
      "subtheme": "Subcategory",
      "specificIssue": "Detailed issue",
      "sentiment": "positive|negative|neutral",
      "mentionCount": 1,
      "impactScore": 6.5,
      "quotes": ["short quote"]
    }
  ],
  "driverReport": {
    "themesByVolume": [
      {"theme": "Theme name", "volume": 1, "percentage": 50.0}
    ],
    "themesBySentimentImpact": [
      {"theme": "Theme name", "sentimentImpact": 3.5, "sentiment": "negative"}
    ]
  },
  "rootCauseAnalyses": [
    {
      "frictionPoint": "Main issue",
      "subthemes": [
        {
          "name": "Subtheme",
          "specificCauses": ["Cause 1"],
          "quotes": ["Quote"]
        }
      ]
    }
  ],
  "actionableInsights": [
    {
      "frictionPoint": "Issue",
      "recommendation": "Action",
      "priority": "high|medium|low"
    }
  ],
  "sentiment": "positive|negative|neutral",
  "score": 5.0,
  "themes": {
    "positive": ["theme1"],
    "negative": ["theme2"]
  },
  "bugs": [{"description": "bug", "severity": "high|medium|low"}],
  "featureRequests": [{"description": "feature", "priority": "high|medium|low"}],
  "summary": "Brief summary"
}

SCORING GUIDE (0-10 scale):
- 9-10: Exceptional, highly enthusiastic praise
- 7-8: Very positive, satisfied with minor issues
- 5-6: Neutral to slightly positive, mixed feelings
- 3-4: Negative, dissatisfied with some positives
- 0-2: Very negative, highly critical, angry

IMPACT SCORES (0-10):
- Friction points (negative): 0-4 (lower = worse experience)
- Strength points (positive): 6-10 (higher = better experience)
- Neutral points: around 5

RULES:
- For TOP friction/strength points: maximum 3 each
- Quotes: Extract from feedback, max 15 words, no special chars that break JSON
- Escape quotes in strings properly
- Keep it simple and valid JSON
- Calculate percentages: (volume / total) * 100
- All scores and impacts must be between 0 and 10

EXAMPLE:
{"executiveSummary":{"keyInsight":"Users love design but performance is critical issue","overallSentiment":"negative","sentimentScore":3.5,"topFrictionPoints":[{"category":"Performance","issue":"Slow page load","priority":1,"impact":1.5,"quote":"site takes 10 seconds to load","recommendation":"Optimize images and implement CDN"}],"topStrengthPoints":[{"category":"Design","strength":"Modern UI","priority":1,"impact":8.5,"quote":"design is really modern and intuitive"}]},"allThemes":[{"category":"Performance","subtheme":"Speed","specificIssue":"Slow loading","sentiment":"negative","mentionCount":1,"impactScore":1.5,"quotes":["site takes 10 seconds"]}],"driverReport":{"themesByVolume":[{"theme":"Performance","volume":1,"percentage":50.0}],"themesBySentimentImpact":[{"theme":"Performance","sentimentImpact":1.5,"sentiment":"negative"}]},"rootCauseAnalyses":[{"frictionPoint":"Performance","subthemes":[{"name":"Loading time","specificCauses":["Large images"],"quotes":["takes 10 seconds"]}]}],"actionableInsights":[{"frictionPoint":"Slow loading","recommendation":"Optimize assets","priority":"high"}],"sentiment":"negative","score":3.5,"themes":{"positive":["design"],"negative":["performance"]},"bugs":[{"description":"slow load","severity":"high"}],"featureRequests":[],"summary":"Good design but slow performance"}

NOW ANALYZE AND RETURN JSON ONLY:`;

export const POST: RequestHandler = async (event) => {
	const { request } = event;
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
									content: `FEEDBACK TO ANALYZE:\n\n"${feedbackText}"\n\nRETURN ONLY VALID JSON:`
					}
				],
							temperature: 0.05,
							max_tokens: 3000,
							response_format: { type: "json_object" },
							top_p: 0.95
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
			
			// Validation et normalisation des champs (nouveau format enrichi)
			
			// Nouveaux champs enrichis
			if (!analysisResult.executiveSummary) {
				analysisResult.executiveSummary = {
					topFrictionPoints: [],
					topStrengthPoints: [],
					overallSentiment: 'neutral',
					sentimentScore: 0,
					keyInsight: 'Analyse complétée'
				} as any;
			}
			if (!analysisResult.allThemes) {
				analysisResult.allThemes = [];
			}
			if (!analysisResult.driverReport) {
				analysisResult.driverReport = {
					themesByVolume: [],
					themesBySentimentImpact: []
				} as any;
			}
			if (!analysisResult.rootCauseAnalyses) {
				analysisResult.rootCauseAnalyses = [];
			}
			if (!analysisResult.actionableInsights) {
				analysisResult.actionableInsights = [];
			}
			
			// Anciens champs (rétrocompatibilité)
			if (!analysisResult.sentiment) {
				analysisResult.sentiment = analysisResult.executiveSummary?.overallSentiment || 'neutral';
			}
			if (!analysisResult.score && analysisResult.score !== 0) {
				analysisResult.score = analysisResult.executiveSummary?.sentimentScore || 0;
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
				analysisResult.summary = analysisResult.executiveSummary?.keyInsight || 'Analyse complétée';
			}
			
			// Valider que le sentiment est valide
			const validSentiments = ['positive', 'negative', 'neutral'];
			if (!validSentiments.includes(analysisResult.sentiment)) {
				console.warn(`⚠️ Sentiment invalide: ${analysisResult.sentiment}, utilisation de 'neutral'`);
				analysisResult.sentiment = 'neutral' as any;
			}
			
			// Convertir automatiquement les scores de l'ancien format (-1 à 1) vers 0-10
			// Si le score est entre -1 et 1, c'est l'ancien format, on convertit
			if (analysisResult.score >= -1 && analysisResult.score <= 1) {
				console.log(`🔄 Conversion du score de l'ancien format: ${analysisResult.score} → ${((analysisResult.score + 1) / 2 * 10).toFixed(1)}`);
				analysisResult.score = (analysisResult.score + 1) / 2 * 10; // -1 devient 0, 0 devient 5, 1 devient 10
			}
			
			// Valider que le score est dans les limites (échelle 0-10)
			if (analysisResult.score < 0) analysisResult.score = 0;
			if (analysisResult.score > 10) analysisResult.score = 10;
			
			// Convertir et valider le sentimentScore dans executiveSummary
			if (analysisResult.executiveSummary?.sentimentScore !== undefined) {
				// Convertir si ancien format
				if (analysisResult.executiveSummary.sentimentScore >= -1 && analysisResult.executiveSummary.sentimentScore <= 1) {
					console.log(`🔄 Conversion sentimentScore: ${analysisResult.executiveSummary.sentimentScore} → ${((analysisResult.executiveSummary.sentimentScore + 1) / 2 * 10).toFixed(1)}`);
					analysisResult.executiveSummary.sentimentScore = (analysisResult.executiveSummary.sentimentScore + 1) / 2 * 10;
				}
				// Valider limites
				if (analysisResult.executiveSummary.sentimentScore < 0) analysisResult.executiveSummary.sentimentScore = 0;
				if (analysisResult.executiveSummary.sentimentScore > 10) analysisResult.executiveSummary.sentimentScore = 10;
			}
			
			// Convertir les impacts des friction/strength points si nécessaire
			if (analysisResult.executiveSummary?.topFrictionPoints) {
				analysisResult.executiveSummary.topFrictionPoints.forEach((fp: any) => {
					if (fp.impact !== undefined && fp.impact >= -1 && fp.impact <= 1) {
						fp.impact = (fp.impact + 1) / 2 * 10;
					}
					// Friction points devraient être 0-4 (bas = mauvais)
					if (fp.impact > 5) fp.impact = 5 - (fp.impact - 5); // Inverser si nécessaire
				});
			}
			
			if (analysisResult.executiveSummary?.topStrengthPoints) {
				analysisResult.executiveSummary.topStrengthPoints.forEach((sp: any) => {
					if (sp.impact !== undefined && sp.impact >= -1 && sp.impact <= 1) {
						sp.impact = (sp.impact + 1) / 2 * 10;
					}
					// Strength points devraient être 6-10 (haut = bon)
					if (sp.impact < 5) sp.impact = 5 + (5 - sp.impact); // Ajuster si nécessaire
				});
			}
			
			// Convertir impactScore dans allThemes
			if (analysisResult.allThemes) {
				analysisResult.allThemes.forEach((theme: any) => {
					if (theme.impactScore !== undefined && theme.impactScore >= -1 && theme.impactScore <= 1) {
						theme.impactScore = (theme.impactScore + 1) / 2 * 10;
					}
				});
			}
			
			// Convertir sentimentImpact dans driverReport
			if (analysisResult.driverReport?.themesBySentimentImpact) {
				analysisResult.driverReport.themesBySentimentImpact.forEach((item: any) => {
					if (item.sentimentImpact !== undefined && item.sentimentImpact >= -1 && item.sentimentImpact <= 1) {
						item.sentimentImpact = (item.sentimentImpact + 1) / 2 * 10;
					}
				});
			}
			
			console.log('✅ JSON validé, normalisé et converti vers échelle 0-10');
			
		} catch (parseError) {
			console.error('❌ Erreur de parsing JSON:', parseError);
			console.error('📄 Réponse complète (longueur:', aiResponse.length, ')');
			
			// Logger les 500 premiers et 500 derniers caractères pour debug
			console.error('Début:', aiResponse.substring(0, 500));
			console.error('Fin:', aiResponse.substring(Math.max(0, aiResponse.length - 500)));
			
			// Si l'erreur contient une position, logger le contexte
			if (parseError instanceof Error && parseError.message.includes('position')) {
				const match = parseError.message.match(/position (\d+)/);
				if (match) {
					const pos = parseInt(match[1]);
					const start = Math.max(0, pos - 100);
					const end = Math.min(aiResponse.length, pos + 100);
					console.error('Contexte autour de l\'erreur (position', pos, '):', aiResponse.substring(start, end));
				}
			}
			
			return json(
				{
					error: 'Erreur de parsing de la réponse IA',
					details: parseError instanceof Error ? parseError.message : 'La réponse de l\'IA n\'est pas au format JSON valide',
					hint: 'Le modèle IA a généré un JSON malformé. Essayez avec un feedback plus court ou plus simple.',
					debug: {
						responseLength: aiResponse.length,
						firstChars: aiResponse.substring(0, 200),
						lastChars: aiResponse.substring(Math.max(0, aiResponse.length - 200))
					}
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
	// Récupérer l'utilisateur authentifié depuis event.locals (Lucia Auth)
	try {
		const prisma = await import('$lib/db').then(m => m.prisma);
		const { calculateCost } = await import('$lib/admin');
		
		// Récupérer l'utilisateur authentifié depuis event.locals
		// Pour /essayer (mode démo sans auth), on crée un utilisateur temporaire
		let userId = event.locals?.user?.id;
		
		if (!userId) {
			// Mode démo : créer/utiliser un utilisateur anonyme
			const anonymousEmail = 'anonymous@demo.local';
			let anonymousUser = await prisma.user.findUnique({
				where: { email: anonymousEmail }
			});
			
			if (!anonymousUser) {
				// Créer l'utilisateur anonyme avec un mot de passe vide
				anonymousUser = await prisma.user.create({
					data: {
						email: anonymousEmail,
						hashedPassword: '',
						role: 'user'
					}
				});
			}
			userId = anonymousUser.id;
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

