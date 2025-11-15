// AI Cluster Naming - Stage 3 of clustering
// Uses high-logic model (GPT-4o) to generate canonical cluster titles

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Generate canonical cluster title from reviews
 * Uses GPT-4o to create a precise, 5-word title describing the underlying issue
 */
export async function generateClusterTitle(
	reviews: Array<{ body: string; aiSummary: string | null }>,
	category: 'Bug Report' | 'Feature Request' | 'Complaint'
): Promise<string | null> {
	if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your_openrouter_key_here') {
		console.error('❌ OPENROUTER_API_KEY not configured');
		return null;
	}

	if (!reviews || reviews.length === 0) {
		return null;
	}

	try {
		// Prepare review texts (use summary if available, otherwise body)
		const reviewTexts = reviews
			.map(r => r.aiSummary || r.body)
			.filter(Boolean)
			.slice(0, 10); // Limit to 10 reviews for prompt size

		const prompt = `You are a senior developer analyzing ${reviewTexts.length} ${category.toLowerCase()}${category === 'Bug Report' ? 's' : 's'}.

Your task: Write ONE, precise, 5-word (maximum) canonical title for the underlying issue.

Guidelines:
- Be specific and technical (e.g., "Crash on Android 14 during checkout")
- Focus on the root cause, not symptoms
- Use developer terminology
- Maximum 5 words
- No punctuation except hyphens

Examples:
- "Crash on Android 14 during checkout"
- "Login fails with Google OAuth"
- "Dark mode toggle missing"
- "Subscription price too high"

Reviews to analyze:
${reviewTexts.map((text, i) => `${i + 1}. ${text.substring(0, 200)}`).join('\n')}

Canonical Title (5 words max):`;

		const model = process.env.ACTIONABLE_MODEL || 'openai/gpt-4o';

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
				temperature: 0.1,
				max_tokens: 50
			})
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`❌ Cluster naming API error (${response.status}):`, errorText);
			return null;
		}

		const data = await response.json();
		const aiResponse = data.choices?.[0]?.message?.content;

		if (!aiResponse) {
			console.error('❌ No response from cluster naming');
			return null;
		}

		// Extract title (remove quotes, trim, limit to 5 words)
		let title = aiResponse.trim();
		title = title.replace(/^["']|["']$/g, ''); // Remove surrounding quotes
		title = title.split('\n')[0]; // Take first line only
		title = title.substring(0, 60); // Hard limit

		// Ensure max 5 words
		const words = title.split(/\s+/).slice(0, 5);
		title = words.join(' ');

		if (title.length === 0) {
			return null;
		}

		return title;
	} catch (error) {
		console.error('❌ Cluster naming error:', error);
		return null;
	}
}

