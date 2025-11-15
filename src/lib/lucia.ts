// Configuration Lucia Auth pour SvelteKit
import { Lucia } from 'lucia';
import { PrismaAdapter } from '@lucia-auth/adapter-prisma';
import { prisma } from './db';
import { dev } from '$app/environment';

let adapter: PrismaAdapter;
let luciaInstance: Lucia<PrismaAdapter>;

try {
	// Adapter Prisma pour Lucia
	adapter = new PrismaAdapter(prisma.session, prisma.user);

	// Configuration Lucia
	luciaInstance = new Lucia(adapter, {
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
} catch (error) {
	console.error('❌ Error initializing Lucia:', error);
	// Create a minimal Lucia instance to prevent crashes
	adapter = new PrismaAdapter(prisma.session, prisma.user);
	luciaInstance = new Lucia(adapter, {
		sessionCookie: {
			attributes: {
				secure: !dev
			}
		},
		getUserAttributes: (attributes) => {
			return {
				email: attributes.email || '',
				role: attributes.role || 'user'
			};
		}
	});
}

export const lucia = luciaInstance;

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



