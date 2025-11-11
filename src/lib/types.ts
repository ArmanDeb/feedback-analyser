// Types TypeScript pour l'application

// Résultat d'analyse de feedback
export interface AnalysisResult {
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

// Métadonnées de l'appel API
export interface AnalysisMetadata {
	model: string;
	tokensIn: number;
	tokensOut: number;
	totalTokens: number;
	duration: number;
	timestamp: string;
	fromCache?: boolean;
	cachedAt?: string;
}

// Réponse complète de l'API
export interface AnalyzeResponse {
	success: boolean;
	analysis: AnalysisResult;
	metadata: AnalysisMetadata;
}

// Erreur de l'API
export interface ApiError {
	error: string;
	details?: string;
	rawResponse?: string;
}

// Analyse sauvegardée (historique)
export interface SavedAnalysis {
	id: string;
	feedbackText: string;
	result: AnalysisResult;
	createdAt: string;
}

