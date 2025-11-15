// Specialist AI for Non-Actionable Reviews (Praise, General Feedback)
// Uses cheap model (Mistral 7B) for simple topic/sentiment tagging

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface NonActionableAnalysis {
	category: 'Praise' | 'Complaint';
	topic: string;
	sentiment: 'positive' | 'neutral' | 'negative';
	summary: string;
}

/**
 * Specialist prompt for non-actionable reviews (praise, general feedback)
 * Uses simple, cheap model for basic tagging
 */
const NON_ACTIONABLE_PROMPT = `You are a review sentiment analyzer. You analyze non-actionable reviews (praise, general feedback) with simple tagging.

Return ONLY a JSON object: { "category": "Praise" | "Complaint", "topic": "String", "sentiment": "positive" | "neutral" | "negative", "summary": "String" }

Category:
- "Praise": Positive feedback, compliments, appreciation
- "Complaint": General complaints without technical details (pricing, policy, customer service)

Topic: 1-3 word summary (e.g., "Design", "Performance", "Pricing", "Customer Service")

Sentiment: Overall emotional tone

Summary: One concise sentence describing the feedback.

Review to Analyze:
[REVIEW_TEXT]`;

/**
 * Specialist model for non-actionable reviews
 * Uses Mistral 7B for cost efficiency (non-actionable reviews don't need high accuracy)
 */
export async function analyzeNonActionableReview(reviewBody: string): Promise<NonActionableAnalysis | null> {
	if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your_openrouter_key_here') {
		console.error('❌ OPENROUTER_API_KEY not configured');
		return null;
	}

	if (!reviewBody || reviewBody.trim().length === 0) {
		return null;
	}

	try {
		const prompt = NON_ACTIONABLE_PROMPT.replace('[REVIEW_TEXT]', reviewBody.trim());

		const response = await fetch(OPENROUTER_API_URL, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
				'Content-Type': 'application/json',
				'HTTP-Referer': process.env.OPENROUTER_HTTP_REFERER || 'https://appreview-triage.com',
				'X-Title': 'AppReview Triage'
			},
			body: JSON.stringify({
				model: 'mistralai/mistral-7b-instruct', // Cheap model for non-actionable reviews
				messages: [
					{
						role: 'user',
						content: prompt
					}
				],
				temperature: 0.1,
				max_tokens: 200
			})
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`❌ Non-actionable specialist API error (${response.status}):`, errorText);
			return null;
		}

		const data = await response.json();
		const aiResponse = data.choices?.[0]?.message?.content;

		if (!aiResponse) {
			console.error('❌ No response from non-actionable specialist');
			return null;
		}

		// Parse JSON
		let jsonStr = aiResponse.trim();
		if (jsonStr.startsWith('```')) {
			jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
		}

		const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
		if (jsonMatch) {
			jsonStr = jsonMatch[0];
		}

		const analysis = JSON.parse(jsonStr) as NonActionableAnalysis;

		// Validate
		if ((analysis.category !== 'Praise' && analysis.category !== 'Complaint') ||
		    !analysis.topic || !analysis.summary) {
			console.error('❌ Invalid non-actionable analysis:', analysis);
			return null;
		}

		return analysis;
	} catch (error) {
		console.error('❌ Non-actionable specialist error:', error);
		return null;
	}
}

