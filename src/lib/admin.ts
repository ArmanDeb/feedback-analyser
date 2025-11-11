// Utilitaires pour le Dashboard Admin
import { prisma } from './db';

// Vérifier si un utilisateur est admin
export function isAdmin(user: any): boolean {
	if (!user) return false;
	
	// Vérifier le rôle de l'utilisateur depuis Lucia Auth
	return user.role === 'admin';
}

// Récupérer les statistiques globales
export async function getGlobalStats() {
	try {
		const [totalAnalyses, totalUsers, totalApiCalls] = await Promise.all([
			prisma.analysis.count(),
			prisma.user.count(),
			prisma.apiLog.count()
		]);

		const totalCost = await prisma.apiLog.aggregate({
			_sum: {
				cost: true
			}
		});

		const totalTokens = await prisma.apiLog.aggregate({
			_sum: {
				tokensIn: true,
				tokensOut: true
			}
		});

		return {
			totalAnalyses,
			totalUsers,
			totalApiCalls,
			totalCost: totalCost._sum.cost || 0,
			totalTokensIn: totalTokens._sum.tokensIn || 0,
			totalTokensOut: totalTokens._sum.tokensOut || 0,
			totalTokens: (totalTokens._sum.tokensIn || 0) + (totalTokens._sum.tokensOut || 0)
		};
	} catch (error) {
		console.error('Erreur lors de la récupération des stats globales:', error);
		throw error;
	}
}

// Récupérer les statistiques par utilisateur
export async function getUserStats() {
	try {
		const users = await prisma.user.findMany({
			include: {
				_count: {
					select: {
						analyses: true,
						apiLogs: true
					}
				},
				apiLogs: {
					select: {
						cost: true,
						tokensIn: true,
						tokensOut: true
					}
				}
			}
		});

		return users.map(user => {
			const totalCost = user.apiLogs.reduce((sum, log) => sum + log.cost, 0);
			const totalTokensIn = user.apiLogs.reduce((sum, log) => sum + log.tokensIn, 0);
			const totalTokensOut = user.apiLogs.reduce((sum, log) => sum + log.tokensOut, 0);

			return {
				userId: user.id,
				email: user.email,
				role: user.role,
				analysesCount: user._count.analyses,
				apiCallsCount: user._count.apiLogs,
				totalCost,
				totalTokensIn,
				totalTokensOut,
				totalTokens: totalTokensIn + totalTokensOut,
				avgCostPerCall: user._count.apiLogs > 0 ? totalCost / user._count.apiLogs : 0
			};
		});
	} catch (error) {
		console.error('Erreur lors de la récupération des stats par utilisateur:', error);
		throw error;
	}
}

// Récupérer les logs API récents
export async function getRecentApiLogs(limit = 50) {
	try {
		const logs = await prisma.apiLog.findMany({
			take: limit,
			orderBy: {
				timestamp: 'desc'
			},
			include: {
				user: {
					select: {
						email: true
					}
				}
			}
		});

		return logs.map(log => ({
			id: log.id,
			userEmail: log.user.email,
			modelUsed: log.modelUsed,
			tokensIn: log.tokensIn,
			tokensOut: log.tokensOut,
			totalTokens: log.tokensIn + log.tokensOut,
			cost: log.cost,
			timestamp: log.timestamp
		}));
	} catch (error) {
		console.error('Erreur lors de la récupération des logs API:', error);
		throw error;
	}
}

// Calculer le coût d'un appel API
export function calculateCost(modelUsed: string, tokensIn: number, tokensOut: number): number {
	// Prix par 1M de tokens (à jour au 10 novembre 2025)
	const pricing: Record<string, { input: number; output: number }> = {
		'mistralai/mistral-7b-instruct:free': { input: 0, output: 0 },
		'mistralai/mistral-7b-instruct': { input: 0.2, output: 0.2 }, // $0.20 per 1M tokens
		'mistralai/mixtral-8x7b-instruct': { input: 0.5, output: 0.5 },
		'meta-llama/llama-3.1-8b-instruct': { input: 0.3, output: 0.3 },
		'google/gemini-flash-1.5': { input: 0.075, output: 0.3 }
	};

	const modelPricing = pricing[modelUsed] || pricing['mistralai/mistral-7b-instruct'];
	
	// Calculer le coût en dollars
	const inputCost = (tokensIn / 1_000_000) * modelPricing.input;
	const outputCost = (tokensOut / 1_000_000) * modelPricing.output;
	
	return inputCost + outputCost;
}

// Estimer le coût mensuel basé sur l'utilisation récente
export async function estimateMonthlyCost() {
	try {
		// Coût des 7 derniers jours
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

		const recentCost = await prisma.apiLog.aggregate({
			where: {
				timestamp: {
					gte: sevenDaysAgo
				}
			},
			_sum: {
				cost: true
			}
		});

		const weekCost = recentCost._sum.cost || 0;
		const estimatedMonthlyCost = (weekCost / 7) * 30;

		return {
			weekCost,
			estimatedMonthlyCost,
			dailyAverage: weekCost / 7
		};
	} catch (error) {
		console.error('Erreur lors de l\'estimation du coût mensuel:', error);
		throw error;
	}
}

