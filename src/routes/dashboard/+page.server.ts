// Main dashboard - list all apps
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/db';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/signin');
	}
	
	const apps = await prisma.app.findMany({
		where: { userId: locals.user.id },
		orderBy: { createdAt: 'desc' },
		include: {
			_count: {
				select: { reviews: true }
			}
		}
	});
	
	return { apps };
};

