// Utility functions for parsing App Store and Play Store URLs

export interface ParsedAppUrl {
	platform: 'ios' | 'android';
	appId: string;
	storeUrl: string;
}

/**
 * Parse an App Store or Play Store URL and extract platform and app ID
 * @param url - The store URL
 * @returns Parsed URL data or null if invalid
 */
export function parseStoreUrl(url: string): ParsedAppUrl | null {
	try {
		const urlObj = new URL(url.trim());
		
		// iOS App Store
		if (urlObj.hostname.includes('apps.apple.com')) {
			// Format: https://apps.apple.com/us/app/app-name/id123456789
			// or: https://apps.apple.com/us/app/app-name/id/123456789
			const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
			
			// Look for 'id' as a separate segment followed by the ID
			let idIndex = pathParts.findIndex(part => part === 'id');
			if (idIndex !== -1 && pathParts[idIndex + 1]) {
				const appId = pathParts[idIndex + 1];
				return {
					platform: 'ios',
					appId,
					storeUrl: url.trim()
				};
			}
			
			// Look for a segment starting with 'id' followed by digits (id123456789 format)
			const idSegment = pathParts.find(part => part.startsWith('id') && /^id\d+$/.test(part));
			if (idSegment) {
				const appId = idSegment.substring(2); // Remove 'id' prefix
				return {
					platform: 'ios',
					appId,
					storeUrl: url.trim()
				};
			}
		}
		
		// Android Play Store
		if (urlObj.hostname.includes('play.google.com')) {
			// Format: https://play.google.com/store/apps/details?id=com.example.app
			const appId = urlObj.searchParams.get('id');
			
			if (appId) {
				return {
					platform: 'android',
					appId,
					storeUrl: url.trim()
				};
			}
		}
		
		return null;
	} catch (error) {
		return null;
	}
}

/**
 * Validate that a URL is a valid App Store or Play Store URL
 */
export function isValidStoreUrl(url: string): boolean {
	return parseStoreUrl(url) !== null;
}

/**
 * Fetch app metadata (name and icon) from the App Store
 * @param appId - The app ID
 * @param platform - 'ios' or 'android'
 * @returns App metadata or null if failed
 */
export async function fetchAppMetadata(
	appId: string,
	platform: 'ios' | 'android'
): Promise<{ name: string; icon: string } | null> {
	try {
		if (platform === 'ios') {
			// Dynamic import for app-store-scraper to avoid SSR issues
			const storeModule = await import('app-store-scraper');
			const store = (storeModule.default && typeof storeModule.default.app === 'function')
				? storeModule.default
				: storeModule;
			
			if (typeof store.app !== 'function') {
				console.error('store.app is not a function');
				return null;
			}
			
			const appData = await store.app({ id: appId });
			
			return {
				name: appData.title || '',
				icon: appData.icon || ''
			};
		} else if (platform === 'android') {
			// Android Play Store scraping not implemented yet
			// For now, return null - we can implement this later with play-store-scraper
			console.log('Android app metadata fetching not implemented yet');
			return null;
		}
		
		return null;
	} catch (error) {
		console.error(`Error fetching app metadata for ${appId} (${platform}):`, error);
		return null;
	}
}

