// Utilitaires d'authentification
import { Argon2id } from 'oslo/password';

// Hasher de mots de passe avec Argon2id
export async function hashPassword(password: string): Promise<string> {
	return await new Argon2id().hash(password);
}

// Vérifier un mot de passe
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
	return await new Argon2id().verify(hash, password);
}

// Valider un email
export function validateEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

// Valider un mot de passe
export function validatePassword(password: string): { valid: boolean; error?: string } {
	if (password.length < 8) {
		return { valid: false, error: 'Le mot de passe doit contenir au moins 8 caractères' };
	}
	if (!/[A-Z]/.test(password)) {
		return { valid: false, error: 'Le mot de passe doit contenir au moins une majuscule' };
	}
	if (!/[a-z]/.test(password)) {
		return { valid: false, error: 'Le mot de passe doit contenir au moins une minuscule' };
	}
	if (!/[0-9]/.test(password)) {
		return { valid: false, error: 'Le mot de passe doit contenir au moins un chiffre' };
	}
	return { valid: true };
}

