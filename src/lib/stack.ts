// Configuration Stack Auth Server pour SvelteKit
// Stack Auth est utilisé par Neon Auth

import { StackServerApp } from "@stackframe/stack";

// Initialiser Stack Auth Server
// Les variables d'environnement seront chargées automatiquement
export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie", // Compatible avec SvelteKit
  urls: {
    signIn: "/handler/sign-in",
    signUp: "/handler/sign-up",
    afterSignIn: "/dashboard",
    afterSignUp: "/dashboard",
  }
});

