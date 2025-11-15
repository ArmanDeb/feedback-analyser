// AI Router - First pass classification
// Uses cheap, fast model to determine if review is actionable or non-actionable
// This reduces cost by routing to appropriate specialist models

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export type Actionability = 'actionable' | 'non-actionable';

export interface RouterResult {
	actionability: Actionability;
	confidence: number; // 0-1
}

/**
 * Router prompt - Fast, cheap classification
 * Determines if review requires detailed triage (actionable) or simple tagging (non-actionable)
 */
const ROUTER_PROMPT = `You are a review classifier. Your sole purpose is to determine if a review is "actionable" or "non-actionable".

Return ONLY a JSON object: { "actionability": "actionable" | "non-actionable", "confidence": 0.0-1.0 }

Definitions:
- "actionable": Review describes a bug, feature request, or complaint that requires developer attention. Examples: crashes, broken features, missing functionality, payment issues, login problems.
- "non-actionable": Review is praise, general feedback, or non-technical complaint. Examples: "Great app!", "Love the design", "Too expensive" (without technical details).

Review to classify:
[REVIEW_TEXT]`;

/**
 * Router model - Fast, cheap classification
 * Uses Claude Haiku or Llama 3 8B for speed and cost efficiency
 */
export async function routeReview(reviewBody: string): Promise<RouterResult | null> {
	if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your_openrouter_key_here') {
		console.error('❌ OPENROUTER_API_KEY not configured');
		return null;
	}

	if (!reviewBody || reviewBody.trim().length === 0) {
		return null;
	}

	try {
		const prompt = ROUTER_PROMPT.replace('[REVIEW_TEXT]', reviewBody.trim());

		const response = await fetch(OPENROUTER_API_URL, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
				'Content-Type': 'application/json',
				'HTTP-Referer': process.env.OPENROUTER_HTTP_REFERER || 'https://appreview-triage.com',
				'X-Title': 'AppReview Triage'
			},
			body: JSON.stringify({
				model: 'anthropic/claude-3-haiku', // Fast, cheap router model
				messages: [
					{
						role: 'user',
						content: prompt
					}
				],
				temperature: 0.1,
				max_tokens: 50
			})
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`❌ Router API error (${response.status}):`, errorText);
			return null;
		}

		const data = await response.json();
		const aiResponse = data.choices?.[0]?.message?.content;

		if (!aiResponse) {
			console.error('❌ No response from router');
			return null;
		}

		// Parse JSON
		let jsonStr = aiResponse.trim();
		if (jsonStr.startsWith('```')) {
			jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
		}

		const result = JSON.parse(jsonStr) as RouterResult;

		// Validate
		if (result.actionability !== 'actionable' && result.actionability !== 'non-actionable') {
			console.error('❌ Invalid actionability:', result.actionability);
			return null;
		}

		return result;
	} catch (error) {
		console.error('❌ Router error:', error);
		return null;
	}
}

