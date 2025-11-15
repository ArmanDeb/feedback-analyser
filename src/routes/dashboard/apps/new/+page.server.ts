// Onboarding: Add new app form
import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/db';
import { parseStoreUrl, fetchAppMetadata } from '$lib/server/app-store-utils';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/signin');
	}
	
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}
		
		const formData = await request.formData();
		const storeUrl = formData.get('storeUrl')?.toString()?.trim();
		
		if (!storeUrl) {
			return fail(400, { error: 'Store URL is required', storeUrl: '' });
		}
		
		// Parse the URL
		const parsed = parseStoreUrl(storeUrl);
		
		if (!parsed) {
			return fail(400, { 
				error: 'Invalid store URL. Please provide a valid App Store or Play Store URL.',
				storeUrl 
			});
		}
		
		try {
			// Check if app already exists for this user
			const existingApp = await prisma.app.findFirst({
				where: {
					userId: locals.user.id,
					appId: parsed.appId,
					platform: parsed.platform
				}
			});
			
			if (existingApp) {
				return fail(400, {
					error: 'This app is already added to your account',
					storeUrl
				});
			}
			
			// Fetch app metadata (name and icon)
			const metadata = await fetchAppMetadata(parsed.appId, parsed.platform);
			
			// Create the app
			const app = await prisma.app.create({
				data: {
					userId: locals.user.id,
					storeUrl: parsed.storeUrl,
					platform: parsed.platform,
					appId: parsed.appId,
					name: metadata?.name || null,
					icon: metadata?.icon || null
				}
			});
			
			// Trigger immediate fetch for onboarding (first-time analysis)
			// This will be handled by the app detail page with a loading state
			// Redirect to app page with onboarding flag
			throw redirect(302, `/dashboard/apps/${app.id}?onboarding=true`);
		} catch (error: any) {
			console.error('Error creating app:', error);
			
			// Handle redirect separately (it's not an error)
			if (error?.status === 302 || error?.statusCode === 302) {
				throw error;
			}
			
			// Provide more specific error messages
			let errorMessage = 'Failed to add app. Please try again.';
			
			if (error?.code === 'P2002') {
				errorMessage = 'This app is already added to your account.';
			} else if (error?.message) {
				// Log the full error for debugging
				console.error('Full error details:', {
					message: error.message,
					code: error.code,
					meta: error.meta
				});
				errorMessage = `Failed to add app: ${error.message}`;
			}
			
			return fail(500, {
				error: errorMessage,
				storeUrl
			});
		}
	}
};

