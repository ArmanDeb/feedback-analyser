// Validate app URL and return app info for immediate feedback
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseStoreUrl } from '$lib/server/app-store-utils';

export const GET: RequestHandler = async ({ url }) => {
	const storeUrl = url.searchParams.get('url');
	
	if (!storeUrl) {
		return json({ valid: false, error: 'URL is required' }, { status: 400 });
	}
	
	const parsed = parseStoreUrl(storeUrl);
	
	if (!parsed) {
		return json({ 
			valid: false, 
			error: 'Invalid store URL. Please provide a valid App Store or Play Store URL.' 
		});
	}
	
	// Return parsed info for UI preview
	return json({
		valid: true,
		platform: parsed.platform,
		appId: parsed.appId,
		storeUrl: parsed.storeUrl,
		// Note: App name/icon would require scraping, which we'll do on submit
		// For now, just return validation success
	});
};

