// Simple in-memory cache pour les analyses de feedback
// Permet d'économiser des coûts en évitant de réanalyser le même feedback

import crypto from 'crypto';

interface CacheEntry {
	result: any;
	timestamp: number;
	hits: number;
}

// Cache en mémoire (sera perdu au redémarrage du serveur)
const cache = new Map<string, CacheEntry>();

// Configuration du cache
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 heures
const MAX_CACHE_SIZE = 1000; // Maximum 1000 entrées en cache

/**
 * Génère une clé de cache à partir du texte du feedback
 */
export function generateCacheKey(feedbackText: string): string {
	// Normaliser le texte (minuscules, espaces) pour maximiser les hits
	const normalized = feedbackText.toLowerCase().trim().replace(/\s+/g, ' ');
	// Créer un hash SHA-256 du texte normalisé
	return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Récupère une analyse depuis le cache
 */
export function getCachedAnalysis(feedbackText: string): any | null {
	const key = generateCacheKey(feedbackText);
	const entry = cache.get(key);
	
	if (!entry) {
		return null;
	}
	
	// Vérifier si l'entrée a expiré
	const now = Date.now();
	const age = now - entry.timestamp;
	
	if (age > CACHE_TTL_MS) {
		// Entrée expirée, la supprimer
		cache.delete(key);
		console.log('🗑️ Entrée de cache expirée:', key.substring(0, 16) + '...');
		return null;
	}
	
	// Incrémenter le compteur de hits
	entry.hits++;
	
	console.log('✅ Cache hit!', {
		key: key.substring(0, 16) + '...',
		age: Math.round(age / 1000) + 's',
		hits: entry.hits
	});
	
	return entry.result;
}

/**
 * Sauvegarde une analyse dans le cache
 */
export function setCachedAnalysis(feedbackText: string, result: any): void {
	const key = generateCacheKey(feedbackText);
	
	// Si le cache est plein, supprimer les entrées les plus anciennes
	if (cache.size >= MAX_CACHE_SIZE) {
		const entriesToDelete = Math.floor(MAX_CACHE_SIZE * 0.2); // Supprimer 20%
		const sortedEntries = Array.from(cache.entries())
			.sort((a, b) => a[1].timestamp - b[1].timestamp);
		
		for (let i = 0; i < entriesToDelete; i++) {
			cache.delete(sortedEntries[i][0]);
		}
		
		console.log(`🗑️ Cache plein, ${entriesToDelete} entrées supprimées`);
	}
	
	cache.set(key, {
		result,
		timestamp: Date.now(),
		hits: 0
	});
	
	console.log('💾 Analyse mise en cache:', {
		key: key.substring(0, 16) + '...',
		cacheSize: cache.size
	});
}

/**
 * Vide le cache (utile pour les tests ou la maintenance)
 */
export function clearCache(): void {
	cache.clear();
	console.log('🗑️ Cache vidé');
}

/**
 * Récupère les statistiques du cache
 */
export function getCacheStats() {
	let totalHits = 0;
	let oldestEntry = Date.now();
	let newestEntry = 0;
	
	for (const entry of cache.values()) {
		totalHits += entry.hits;
		if (entry.timestamp < oldestEntry) oldestEntry = entry.timestamp;
		if (entry.timestamp > newestEntry) newestEntry = entry.timestamp;
	}
	
	return {
		size: cache.size,
		maxSize: MAX_CACHE_SIZE,
		totalHits,
		oldestEntry: cache.size > 0 ? new Date(oldestEntry).toISOString() : null,
		newestEntry: cache.size > 0 ? new Date(newestEntry).toISOString() : null,
		ttlHours: CACHE_TTL_MS / (60 * 60 * 1000)
	};
}

