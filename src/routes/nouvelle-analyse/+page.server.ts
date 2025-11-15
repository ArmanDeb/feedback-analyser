// Redirect old new analysis route to new add app route
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/signin?redirect=/dashboard/apps/new');
	}
	throw redirect(302, '/dashboard/apps/new');
};
