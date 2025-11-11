// Hooks serveur SvelteKit pour Stack Auth (Neon Auth)
import type { Handle } from '@sveltejs/kit';
import { stackServerApp } from '$lib/stack';

export const handle: Handle = async ({ event, resolve }) => {
  try {
    // Récupérer l'utilisateur depuis Stack Auth
    const user = await stackServerApp.getUser({ request: event.request });
    
    // Stocker dans locals pour y accéder dans toutes les pages
    if (user) {
      event.locals.user = {
        id: user.id,
        email: user.primaryEmail || '',
        displayName: user.displayName || user.primaryEmail || 'Utilisateur',
        signedUpAt: user.signedUpAt
      };
      
      console.log('👤 Utilisateur authentifié:', event.locals.user.email);
    } else {
      event.locals.user = null;
    }
    
  } catch (err) {
    console.warn('⚠️ Erreur Stack Auth dans hooks.server.ts:', err);
    event.locals.user = null;
  }

  return resolve(event);
};

