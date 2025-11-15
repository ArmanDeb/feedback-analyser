// Specialist AI for Actionable Reviews (Bugs & Features)
// Uses high-logic model (GPT-4o or Claude 3.5 Sonnet) for accurate triage

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface ReviewAnalysis {
	category: 'Bug Report' | 'Feature Request' | 'Complaint';
	urgency: 'Critical' | 'High' | 'Low' | 'None';
	topic: string;
	summary: string;
}

/**
 * Specialist prompt for actionable reviews (bugs, features, complaints)
 * Uses detailed, high-logic prompt for accurate triage
 */
const ACTIONABLE_PROMPT = `You are an expert app review triage specialist. You analyze actionable reviews (bugs, features, complaints) with high accuracy.

Return ONLY a JSON object: { "category": "String", "urgency": "String", "topic": "String", "summary": "String" }

Category Definitions (MUST be exact):
- "Bug Report": Technical issue preventing functionality (crashes, broken features, data loss, login failures)
- "Feature Request": Request for new functionality or enhancement
- "Complaint": Non-technical issue (pricing, customer service, policy) that requires attention

Urgency Definitions (MUST be exact):
- "Critical": App crashes, won't open, data loss, cannot log in, payment failures
- "High": Major feature broken, serious frustration, blocking user workflow
- "Low": Minor UI issue, suggestion, non-blocking problem
- "None": Should not occur for actionable reviews, but use if truly low priority

Topic: 1-3 word summary (e.g., "Login", "Checkout", "Payment Button", "Dark Mode")

Summary: One concise sentence describing the core issue.

Examples:

Input: "The app crashes every time I try to checkout. I can't complete my purchase!"
Output: {
  "category": "Bug Report",
  "urgency": "Critical",
  "topic": "Checkout Crash",
  "summary": "App crashes during checkout, preventing purchase completion."
}

Input: "I really wish there was a dark mode option. The white background hurts my eyes at night."
Output: {
  "category": "Feature Request",
  "urgency": "Low",
  "topic": "Dark Mode",
  "summary": "User requests dark mode feature for better nighttime viewing."
}

Input: "The subscription price increased from $5 to $15. That's way too expensive for what it does."
Output: {
  "category": "Complaint",
  "urgency": "High",
  "topic": "Pricing",
  "summary": "User complains about significant subscription price increase."
}

Review to Analyze:
[REVIEW_TEXT]`;

/**
 * Specialist model for actionable reviews
 * Uses GPT-4o or Claude 3.5 Sonnet for high accuracy
 */
export async function analyzeActionableReview(reviewBody: string): Promise<ReviewAnalysis | null> {
	if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your_openrouter_key_here') {
		console.error('❌ OPENROUTER_API_KEY not configured');
		return null;
	}

	if (!reviewBody || reviewBody.trim().length === 0) {
		return null;
	}

	try {
		const prompt = ACTIONABLE_PROMPT.replace('[REVIEW_TEXT]', reviewBody.trim());

		// Use GPT-4o or Claude 3.5 Sonnet for high accuracy
		const model = process.env.ACTIONABLE_MODEL || 'openai/gpt-4o'; // Default to GPT-4o

		const response = await fetch(OPENROUTER_API_URL, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
				'Content-Type': 'application/json',
				'HTTP-Referer': process.env.OPENROUTER_HTTP_REFERER || 'https://appreview-triage.com',
				'X-Title': 'AppReview Triage'
			},
			body: JSON.stringify({
				model: model,
				messages: [
					{
						role: 'user',
						content: prompt
					}
				],
				temperature: 0.1, // Low temperature for consistency
				max_tokens: 300
			})
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`❌ Specialist API error (${response.status}):`, errorText);
			return null;
		}

		const data = await response.json();
		const aiResponse = data.choices?.[0]?.message?.content;

		if (!aiResponse) {
			console.error('❌ No response from specialist');
			return null;
		}

		// Parse JSON
		let jsonStr = aiResponse.trim();
		if (jsonStr.startsWith('```')) {
			jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
		}

		// Extract JSON object
		const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
		if (jsonMatch) {
			jsonStr = jsonMatch[0];
		}

		let analysis: ReviewAnalysis;
		try {
			analysis = JSON.parse(jsonStr) as ReviewAnalysis;
		} catch (parseError) {
			// Try regex recovery
			const categoryMatch = jsonStr.match(/"category"\s*:\s*"([^"]+)"/i);
			const urgencyMatch = jsonStr.match(/"urgency"\s*:\s*"([^"]+)"/i);
			const topicMatch = jsonStr.match(/"topic"\s*:\s*"([^"]+)"/i);
			const summaryMatch = jsonStr.match(/"summary"\s*:\s*"([^"]+)"/i);
			
			if (categoryMatch && urgencyMatch && topicMatch && summaryMatch) {
				analysis = {
					category: categoryMatch[1] as any,
					urgency: urgencyMatch[1] as any,
					topic: topicMatch[1],
					summary: summaryMatch[1]
				};
				console.log('✅ Recovered analysis from failed JSON');
			} else {
				throw parseError;
			}
		}

		// Validate
		const validCategories = ['Bug Report', 'Feature Request', 'Complaint'];
		const validUrgencies = ['Critical', 'High', 'Low', 'None'];
		
		if (!validCategories.includes(analysis.category) || 
		    !validUrgencies.includes(analysis.urgency) ||
		    !analysis.topic || !analysis.summary) {
			console.error('❌ Invalid analysis structure:', analysis);
			return null;
		}

		return analysis;
	} catch (error) {
		console.error('❌ Specialist error:', error);
		return null;
	}
}

