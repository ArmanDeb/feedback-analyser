// Chained AI Pipeline - Multi-step routing system
// Router -> Specialist models for optimal accuracy and cost

import { routeReview, type Actionability } from './ai-router';
import { analyzeActionableReview, type ReviewAnalysis } from './ai-specialist-actionable';
import { analyzeNonActionableReview, type NonActionableAnalysis } from './ai-specialist-nonactionable';

export interface ChainedAnalysis {
	category: 'Bug Report' | 'Feature Request' | 'Praise' | 'Complaint';
	urgency: 'Critical' | 'High' | 'Low' | 'None';
	topic: string;
	summary: string;
	actionability: Actionability;
}

/**
 * Chained AI analysis pipeline
 * Step 1: Router determines if actionable or non-actionable
 * Step 2: Routes to appropriate specialist model
 */
export async function analyzeReviewChained(reviewBody: string): Promise<ChainedAnalysis | null> {
	if (!reviewBody || reviewBody.trim().length === 0) {
		return null;
	}

	try {
		// Step 1: Router - Fast classification
		const routerResult = await routeReview(reviewBody);
		
		if (!routerResult) {
			console.warn('⚠️ Router failed, falling back to single-model analysis');
			// Fallback to old single-model approach
			return null;
		}

		console.log(`🔀 Router classified as: ${routerResult.actionability} (confidence: ${routerResult.confidence.toFixed(2)})`);

		// Step 2: Route to specialist
		if (routerResult.actionability === 'actionable') {
			// Use high-logic model for actionable reviews
			const analysis = await analyzeActionableReview(reviewBody);
			
			if (!analysis) {
				return null;
			}

			return {
				category: analysis.category,
				urgency: analysis.urgency,
				topic: analysis.topic,
				summary: analysis.summary,
				actionability: 'actionable'
			};
		} else {
			// Use cheap model for non-actionable reviews
			const analysis = await analyzeNonActionableReview(reviewBody);
			
			if (!analysis) {
				return null;
			}

			// Map non-actionable analysis to standard format
			return {
				category: analysis.category === 'Praise' ? 'Praise' : 'Complaint',
				urgency: 'None', // Non-actionable reviews have no urgency
				topic: analysis.topic,
				summary: analysis.summary,
				actionability: 'non-actionable'
			};
		}
	} catch (error) {
		console.error('❌ Chained analysis error:', error);
		return null;
	}
}

/**
 * Batch chained analysis for multiple reviews
 * Processes reviews through the router first, then batches by actionability
 */
export async function analyzeReviewsChainedBatch(reviewBodies: string[]): Promise<(ChainedAnalysis | null)[]> {
	if (!reviewBodies || reviewBodies.length === 0) {
		return [];
	}

	// Step 1: Route all reviews
	const routerResults = await Promise.all(
		reviewBodies.map(body => routeReview(body))
	);

	// Step 2: Separate by actionability
	const actionableIndices: number[] = [];
	const nonActionableIndices: number[] = [];

	routerResults.forEach((result, index) => {
		if (result?.actionability === 'actionable') {
			actionableIndices.push(index);
		} else if (result?.actionability === 'non-actionable') {
			nonActionableIndices.push(index);
		}
	});

	// Step 3: Process actionable reviews with specialist (can batch)
	const actionableReviews = actionableIndices.map(i => reviewBodies[i]);
	const actionableAnalyses = await Promise.all(
		actionableReviews.map(body => analyzeActionableReview(body))
	);

	// Step 4: Process non-actionable reviews with cheap specialist (can batch)
	const nonActionableReviews = nonActionableIndices.map(i => reviewBodies[i]);
	const nonActionableAnalyses = await Promise.all(
		nonActionableReviews.map(body => analyzeNonActionableReview(body))
	);

	// Step 5: Combine results in original order
	const results: (ChainedAnalysis | null)[] = new Array(reviewBodies.length).fill(null);
	
	actionableIndices.forEach((originalIndex, batchIndex) => {
		const analysis = actionableAnalyses[batchIndex];
		if (analysis) {
			results[originalIndex] = {
				category: analysis.category,
				urgency: analysis.urgency,
				topic: analysis.topic,
				summary: analysis.summary,
				actionability: 'actionable'
			};
		}
	});

	nonActionableIndices.forEach((originalIndex, batchIndex) => {
		const analysis = nonActionableAnalyses[batchIndex];
		if (analysis) {
			results[originalIndex] = {
				category: analysis.category === 'Praise' ? 'Praise' : 'Complaint',
				urgency: 'None',
				topic: analysis.topic,
				summary: analysis.summary,
				actionability: 'non-actionable'
			};
		}
	});

	return results;
}

