// Configuration Lucia Auth pour SvelteKit
import { Lucia } from 'lucia';
import { PrismaAdapter } from '@lucia-auth/adapter-prisma';
import { prisma } from './db';
import { dev } from '$app/environment';

// Adapter Prisma pour Lucia
const adapter = new PrismaAdapter(prisma.session, prisma.user);

// Configuration Lucia
export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: !dev // HTTPS en production
		}
	},
	getUserAttributes: (attributes) => {
		return {
			email: attributes.email,
			role: attributes.role
		};
	}
});

// Types TypeScript pour Lucia
declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

interface DatabaseUserAttributes {
	email: string;
	role: string;
}



