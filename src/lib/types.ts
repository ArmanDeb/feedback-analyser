// Types TypeScript pour l'application

// Thème hiérarchique avec taxonomie (Catégorie > Sous-thème > Problème)
export interface ThematicIssue {
	category: string;          // Ex: "Livraison"
	subtheme: string;          // Ex: "Retard"
	specificIssue: string;     // Ex: "Cause transporteur"
	sentiment: 'positive' | 'negative' | 'neutral';
	mentionCount: number;      // Fréquence de mention
	impactScore: number;       // Score d'impact sur sentiment (-1 à 1)
	quotes: string[];          // Citations clients anonymisées
}

// Point de friction identifié
export interface FrictionPoint {
	theme: ThematicIssue;
	priority: number;          // 1 = plus important
	volume: number;            // Nombre de mentions
	sentimentImpact: number;   // Impact sur sentiment négatif
	recommendation: string;    // Action recommandée
}

// Point fort identifié
export interface StrengthPoint {
	theme: ThematicIssue;
	priority: number;          // 1 = plus important
	volume: number;            // Nombre de mentions
	sentimentImpact: number;   // Impact sur sentiment positif
}

// Synthèse managériale
export interface ExecutiveSummary {
	topFrictionPoints: FrictionPoint[];      // Top 3 points de friction
	topStrengthPoints: StrengthPoint[];      // Top 3 points forts
	overallSentiment: 'positive' | 'negative' | 'neutral';
	sentimentScore: number;
	keyInsight: string;                      // Insight principal
}

// Rapport d'analyse des drivers
export interface DriverReport {
	themesByVolume: Array<{
		theme: string;
		volume: number;
		percentage: number;
	}>;
	themesBySentimentImpact: Array<{
		theme: string;
		sentimentImpact: number;
		sentiment: 'positive' | 'negative' | 'neutral';
	}>;
}

// Analyse des causes profondes
export interface RootCauseAnalysis {
	frictionPoint: string;
	subthemes: Array<{
		name: string;
		specificCauses: string[];
		quotes: string[];           // 2-3 citations représentatives
	}>;
}

// Résultat d'analyse de feedback (version enrichie)
export interface AnalysisResult {
	// Titre généré par l'IA
	title?: string;
	
	// Synthèse managériale
	executiveSummary: ExecutiveSummary;
	
	// Analyse thématique complète
	allThemes: ThematicIssue[];
	
	// Rapport des drivers
	driverReport: DriverReport;
	
	// Analyse des causes profondes (top 3 frictions)
	rootCauseAnalyses: RootCauseAnalysis[];
	
	// Informations exploitables
	actionableInsights: Array<{
		frictionPoint: string;
		recommendation: string;
		priority: 'high' | 'medium' | 'low';
	}>;
	
	// Anciens champs conservés pour rétrocompatibilité
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
	title?: string | null;
	result: AnalysisResult;
	createdAt: string;
}

