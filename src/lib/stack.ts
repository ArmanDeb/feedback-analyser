// Configuration Stack Auth Server pour SvelteKit
// Stack Auth est utilisé par Neon Auth

// Note: Stack Auth est conçu pour Next.js et n'est pas entièrement compatible avec SvelteKit
// Pour l'instant, nous utilisons un mode développement mocké
// TODO: Migrer vers Auth.js (NextAuth) ou Lucia Auth pour une meilleure compatibilité SvelteKit

let stackServerApp: any = null;

// Tentative d'initialisation Stack Auth (peut échouer si non configuré)
try {
  const { StackServerApp } = await import("@stackframe/stack");
  
  stackServerApp = new StackServerApp({
    tokenStore: "nextjs-cookie",
    urls: {
      signIn: "/handler/sign-in",
      signUp: "/handler/sign-up",
      afterSignIn: "/dashboard",
      afterSignUp: "/dashboard",
    }
  });
} catch (err) {
  console.warn('⚠️ Stack Auth non disponible (normal en mode développement)');
  
  // Mock pour le développement
  stackServerApp = {
    async getUser() {
      return null; // Pas d'utilisateur authentifié
    }
  };
}

export { stackServerApp };
