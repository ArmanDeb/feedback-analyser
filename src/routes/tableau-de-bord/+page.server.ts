// Redirect old dashboard route to new dashboard
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/signin?redirect=/dashboard');
	}
	throw redirect(302, '/dashboard');
};
