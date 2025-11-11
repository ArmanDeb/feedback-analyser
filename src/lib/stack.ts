// Configuration Stack Auth Server pour SvelteKit
// Stack Auth est utilisé par Neon Auth

// Vérifier si les clés Stack Auth sont configurées
const hasStackAuthKeys = 
  process.env.NEXT_PUBLIC_STACK_PROJECT_ID && 
  process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY && 
  process.env.STACK_SECRET_SERVER_KEY;

let stackServerApp: any;

// N'importer Stack Auth QUE si les clés sont configurées
// Cela évite les erreurs "Cannot find module 'next/navigation'" au build
if (hasStackAuthKeys) {
  try {
    // Import dynamique pour éviter les erreurs au build
    const { StackServerApp } = await import("@stackframe/stack");
    
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
  } catch (err) {
    console.error('❌ Erreur lors de l\'import de Stack Auth:', err);
    console.error('💡 Stack Auth nécessite Next.js. Désactivation...');
    
    // Fallback si l'import échoue
    stackServerApp = {
      async getUser() {
        return null;
      }
    };
  }
} else {
  // Stack Auth non configuré : mode développement
  console.warn('⚠️ Stack Auth non configuré - Mode développement activé');
  console.warn('💡 Pour activer l\'authentification :');
  console.warn('   1. Allez sur https://console.neon.tech');
  console.warn('   2. Projet "feedback-analyser" → Integrations → Stack Auth');
  console.warn('   3. Copiez les 3 clés dans votre .env');
  console.warn('   4. Consultez QUICKSTART_AUTH.md pour les détails');
  
  // Mock pour le développement
  stackServerApp = {
    async getUser() {
      return null; // Pas d'utilisateur authentifié en mode dev
    }
  };
}

export { stackServerApp };
