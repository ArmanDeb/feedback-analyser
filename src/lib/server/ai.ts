// AI Service for Review Triage
// Analyzes app reviews using OpenRouter (Mistral 7B)

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface ReviewAnalysis {
	category: 'Bug Report' | 'Feature Request' | 'Praise' | 'Complaint';
	urgency: 'Critical' | 'High' | 'Low' | 'None';
	topic: string;
	summary: string;
}

/**
 * Core AI Prompt for Review Analysis
 * This is the exact prompt from the plan specification
 */
const REVIEW_ANALYSIS_PROMPT = `You are an expert app review triage bot. Your sole purpose is to analyze a user review and return a valid JSON object. Do not provide any conversational text, preamble, or explanation. You must return only the JSON.

Analyze the review provided at the end of this prompt and return a JSON object with the following exact schema: { "category": "String", "urgency": "String", "topic": "String", "summary": "String" }

Key Definitions:
category: (String) Must be one of: 'Bug Report', 'Feature Request', 'Praise', 'Complaint'.

urgency: (String) Must be one of: 'Critical', 'High', 'Low', 'None'.

'Critical': App crashes, data loss, won't open, cannot log in.
'High': Major feature broken, payment issues, serious frustration.
'Low': Minor UI issue, suggestion, or non-blocking problem.
'None': Used for 'Praise' or non-actionable items.

topic: (String) A 1-3 word summary of the main subject (e.g., 'Login', 'UI/UX', 'Performance', 'Pricing', 'Feature X').

summary: (String) A concise, one-sentence summary of the review's core point.

Examples:

Example 1 Input: "This app is amazing! I use it every day, the new update is so fast and looks beautiful."
Example 1 Output:
{
  "category": "Praise",
  "urgency": "None",
  "topic": "UI & Performance",
  "summary": "User loves the app's speed and new design after the update."
}

Example 2 Input: "I can't even open it since yesterday. it just crashes every time. fix this!!"
Example 2 Output:
{
  "category": "Bug Report",
  "urgency": "Critical",
  "topic": "Launch Crash",
  "summary": "App crashes immediately upon opening, preventing all use."
}

Example 3 Input: "it's pretty good, but i really wish i could connect it to my Google Calendar. would be 5 stars if it had that."
Example 3 Output:
{
  "category": "Feature Request",
  "urgency": "Low",
  "topic": "Google Calendar Integration",
  "summary": "User wants the ability to integrate with Google Calendar."
}

Example 4 Input: "why is the 'pro' subscription so expensive? it's not worth $10 a month for what it does. i'm canceling."
Example 4 Output:
{
  "category": "Complaint",
  "urgency": "High",
  "topic": "Pricing",
  "summary": "User is complaining that the 'Pro' subscription price is too high and is canceling."
}

Review to Analyze:

[YOUR_REVIEW_BODY_HERE]`;

/**
 * Analyze a review using OpenRouter AI
 * @param reviewBody - The text content of the review
 * @returns ReviewAnalysis object or null if analysis fails
 */
export async function analyzeReview(reviewBody: string): Promise<ReviewAnalysis | null> {
	if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your_openrouter_key_here') {
		console.error('❌ OPENROUTER_API_KEY not configured');
		return null;
	}

	if (!reviewBody || reviewBody.trim().length === 0) {
		console.warn('⚠️ Empty review body, skipping analysis');
		return null;
	}

	try {
		// Replace placeholder in prompt with actual review
		const prompt = REVIEW_ANALYSIS_PROMPT.replace('[YOUR_REVIEW_BODY_HERE]', reviewBody.trim());

		const response = await fetch(OPENROUTER_API_URL, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
				'Content-Type': 'application/json',
				'HTTP-Referer': process.env.OPENROUTER_HTTP_REFERER || 'https://appreview-triage.com',
				'X-Title': 'AppReview Triage'
			},
			body: JSON.stringify({
				model: 'mistralai/mistral-7b-instruct',
				messages: [
					{
						role: 'user',
						content: prompt
					}
				],
				temperature: 0.1, // Low temperature for consistent JSON output
				max_tokens: 300, // Increased to ensure complete JSON response
				response_format: { type: 'json_object' } // Force JSON output if supported
			})
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`❌ OpenRouter API error (${response.status}):`, errorText);
			return null;
		}

		const data = await response.json();
		const aiResponse = data.choices?.[0]?.message?.content;

		if (!aiResponse) {
			console.error('❌ No response content from OpenRouter');
			return null;
		}

		// Parse JSON from response (might be wrapped in markdown code blocks)
		let jsonStr = aiResponse.trim();
		
		// Remove markdown code blocks if present
		if (jsonStr.startsWith('```')) {
			jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
		}

		// Try to extract JSON if response is incomplete or has extra text
		// Look for JSON object boundaries
		const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
		if (jsonMatch) {
			jsonStr = jsonMatch[0];
		}

		let analysis: ReviewAnalysis;
		try {
			analysis = JSON.parse(jsonStr) as ReviewAnalysis;
		} catch (parseError) {
			// If JSON parsing fails, try to extract partial data
			console.error('❌ Failed to parse JSON, attempting recovery:', parseError);
			console.error('   Raw response:', jsonStr.substring(0, 200));
			
			// Try to extract fields using regex as fallback
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
				console.log('✅ Recovered partial analysis from failed JSON');
			} else {
				throw parseError; // Re-throw if we can't recover
			}
		}

		// Validate the response structure
		if (
			!analysis.category ||
			!analysis.urgency ||
			!analysis.topic ||
			!analysis.summary
		) {
			console.error('❌ Invalid analysis structure:', analysis);
			return null;
		}

		// Validate category
		const validCategories = ['Bug Report', 'Feature Request', 'Praise', 'Complaint'];
		if (!validCategories.includes(analysis.category)) {
			console.error(`❌ Invalid category: ${analysis.category}`);
			return null;
		}

		// Validate urgency
		const validUrgencies = ['Critical', 'High', 'Low', 'None'];
		if (!validUrgencies.includes(analysis.urgency)) {
			console.error(`❌ Invalid urgency: ${analysis.urgency}`);
			return null;
		}

		return analysis;
	} catch (error) {
		console.error('❌ Error analyzing review:', error);
		if (error instanceof SyntaxError) {
			console.error('   Failed to parse JSON response');
		}
		return null;
	}
}

