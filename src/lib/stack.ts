// Configuration Stack Auth Server pour SvelteKit
// Stack Auth est utilisé par Neon Auth

import { StackServerApp } from "@stackframe/stack";

// Vérifier si les clés Stack Auth sont configurées
const hasStackAuthKeys = 
  process.env.NEXT_PUBLIC_STACK_PROJECT_ID && 
  process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY && 
  process.env.STACK_SECRET_SERVER_KEY;

let stackServerApp: any;

if (hasStackAuthKeys) {
  // Stack Auth configuré : mode production
  console.log('✅ Stack Auth configuré (Neon Auth)');
  
  stackServerApp = new StackServerApp({
    tokenStore: "nextjs-cookie",
    urls: {
      signIn: "/handler/sign-in",
      signUp: "/handler/sign-up",
      afterSignIn: "/dashboard",
      afterSignUp: "/dashboard",
    }
  });
} else {
  // Stack Auth non configuré : mode développement
  console.warn('⚠️ Stack Auth non configuré - Mode développement activé');
  console.warn('💡 Consultez docs/NEON_AUTH_SETUP.md pour configurer l\'authentification');
  
  // Mock pour le développement
  stackServerApp = {
    async getUser() {
      return null; // Pas d'utilisateur authentifié en mode dev
    }
  };
}

export { stackServerApp };
