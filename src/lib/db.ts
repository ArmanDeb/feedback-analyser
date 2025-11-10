// Client Prisma pour l'accès à la base de données
import { PrismaClient } from '@prisma/client';

// Créer une instance unique de Prisma Client
// En développement, on évite de créer plusieurs instances à cause du HMR
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma;
}

// Helper pour se connecter à la base de données
export async function connectDb() {
	try {
		await prisma.$connect();
		console.log('✅ Connexion à la base de données réussie');
	} catch (error) {
		console.error('❌ Erreur de connexion à la base de données:', error);
		throw error;
	}
}

// Helper pour se déconnecter de la base de données
export async function disconnectDb() {
	await prisma.$disconnect();
}

