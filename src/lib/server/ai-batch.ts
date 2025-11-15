// Batched AI Analysis for Reviews
// Processes multiple reviews in a single API call to reduce cost and latency

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface ReviewAnalysis {
	category: 'Bug Report' | 'Feature Request' | 'Praise' | 'Complaint';
	urgency: 'Critical' | 'High' | 'Low' | 'None';
	topic: string;
	summary: string;
}

/**
 * Batch analyze multiple reviews in a single API call
 * @param reviewBodies - Array of review text content
 * @returns Array of ReviewAnalysis objects (same order as input)
 */
export async function analyzeReviewsBatch(reviewBodies: string[]): Promise<(ReviewAnalysis | null)[]> {
	if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your_openrouter_key_here') {
		console.error('❌ OPENROUTER_API_KEY not configured');
		return reviewBodies.map(() => null);
	}

	if (!reviewBodies || reviewBodies.length === 0) {
		return [];
	}

	// Filter out empty reviews
	const validReviews = reviewBodies
		.map((body, index) => ({ body: body?.trim() || '', index }))
		.filter(({ body }) => body.length > 0);

	if (validReviews.length === 0) {
		return reviewBodies.map(() => null);
	}

	try {
		// Create batch prompt
		const reviewsJson = JSON.stringify(
			validReviews.map(({ body }) => body),
			null,
			2
		);

		const batchPrompt = `You are an expert app review triage bot. Your sole purpose is to analyze multiple user reviews and return a valid JSON array. Do not provide any conversational text, preamble, or explanation. You must return only the JSON array.

Analyze each review in the array provided below and return a JSON array with the following exact schema for each review: { "category": "String", "urgency": "String", "topic": "String", "summary": "String" }

Key Definitions:
category: (String) Must be one of: 'Bug Report', 'Feature Request', 'Praise', 'Complaint'.

urgency: (String) Must be one of: 'Critical', 'High', 'Low', 'None'.
- 'Critical': App crashes, data loss, won't open, cannot log in.
- 'High': Major feature broken, payment issues, serious frustration.
- 'Low': Minor UI issue, suggestion, or non-blocking problem.
- 'None': Used for 'Praise' or non-actionable items.

topic: (String) A 1-3 word summary of the main subject (e.g., 'Login', 'UI/UX', 'Performance', 'Pricing', 'Feature X').

summary: (String) A concise, one-sentence summary of the review's core point.

Return a JSON array where each element corresponds to the review at the same index in the input array.

Example Input:
[
  "This app is amazing! I use it every day, the new update is so fast and looks beautiful.",
  "I can't even open it since yesterday. it just crashes every time. fix this!!"
]

Example Output:
[
  {
    "category": "Praise",
    "urgency": "None",
    "topic": "UI & Performance",
    "summary": "User loves the app's speed and new design after the update."
  },
  {
    "category": "Bug Report",
    "urgency": "Critical",
    "topic": "Launch Crash",
    "summary": "App crashes immediately upon opening, preventing all use."
  }
]

Reviews to Analyze:
${reviewsJson}`;

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
						content: batchPrompt
					}
				],
				temperature: 0.1,
				max_tokens: 2000 // Increased for batch processing
				// Note: response_format json_object doesn't work for arrays, so we parse manually
			})
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`❌ OpenRouter API error (${response.status}):`, errorText);
			return reviewBodies.map(() => null);
		}

		const data = await response.json();
		const aiResponse = data.choices?.[0]?.message?.content;

		if (!aiResponse) {
			console.error('❌ No response content from OpenRouter');
			return reviewBodies.map(() => null);
		}

		// Parse JSON from response
		let jsonStr = aiResponse.trim();
		
		// Remove markdown code blocks if present
		if (jsonStr.startsWith('```')) {
			jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
		}

		// Try to extract JSON array
		const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
		if (jsonMatch) {
			jsonStr = jsonMatch[0];
		}

		let analyses: ReviewAnalysis[];
		try {
			analyses = JSON.parse(jsonStr) as ReviewAnalysis[];
		} catch (parseError) {
			console.error('❌ Failed to parse batch JSON, attempting recovery:', parseError);
			console.error('   Raw response:', jsonStr.substring(0, 500));
			return reviewBodies.map(() => null);
		}

		// Validate and map results back to original order
		const results: (ReviewAnalysis | null)[] = new Array(reviewBodies.length).fill(null);
		
		validReviews.forEach(({ index }, i) => {
			const analysis = analyses[i];
			if (analysis && 
				analysis.category && 
				analysis.urgency && 
				analysis.topic && 
				analysis.summary) {
				// Validate category and urgency
				const validCategories = ['Bug Report', 'Feature Request', 'Praise', 'Complaint'];
				const validUrgencies = ['Critical', 'High', 'Low', 'None'];
				
				if (validCategories.includes(analysis.category) && 
					validUrgencies.includes(analysis.urgency)) {
					results[index] = analysis;
				}
			}
		});

		return results;
	} catch (error) {
		console.error('❌ Error in batch analysis:', error);
		return reviewBodies.map(() => null);
	}
}

