// Embedding generation for reviews using OpenRouter
// Uses text-embedding-ada-002 compatible models

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/embeddings';

/**
 * Generate embedding for a review text
 * @param text - The review text to embed
 * @returns Embedding vector (1536 dimensions) or null if failed
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
	if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your_openrouter_key_here') {
		console.warn('⚠️ OPENROUTER_API_KEY not configured, skipping embedding');
		return null;
	}

	if (!text || text.trim().length === 0) {
		return null;
	}

	try {
		const response = await fetch(OPENROUTER_API_URL, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
				'Content-Type': 'application/json',
				'HTTP-Referer': process.env.OPENROUTER_HTTP_REFERER || 'https://appreview-triage.com',
				'X-Title': 'AppReview Triage'
			},
			body: JSON.stringify({
				model: 'text-embedding-ada-002', // OpenAI compatible embedding model
				input: text.trim()
			})
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`❌ OpenRouter embedding API error (${response.status}):`, errorText);
			return null;
		}

		const data = await response.json();
		const embedding = data.data?.[0]?.embedding;

		if (!embedding || !Array.isArray(embedding)) {
			console.error('❌ Invalid embedding response:', data);
			return null;
		}

		if (embedding.length !== 1536) {
			console.warn(`⚠️ Unexpected embedding dimension: ${embedding.length}, expected 1536`);
		}

		return embedding;
	} catch (error) {
		console.error('❌ Error generating embedding:', error);
		return null;
	}
}

/**
 * Format embedding vector for PostgreSQL pgvector
 * @param embedding - The embedding vector array
 * @returns PostgreSQL vector string format
 */
export function formatVectorForPostgres(embedding: number[]): string {
	return `[${embedding.join(',')}]`;
}

