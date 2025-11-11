# 🔐 Configuration Neon Auth - Guide Complet

**Date:** 11 novembre 2025  
**Statut:** Neon Auth déjà provisionné ✅

---

## ✅ Statut Actuel

Votre projet **feedback-analyser** (ID: `tiny-feather-38505696`) a déjà Neon Auth activé !

Il vous suffit maintenant de :
1. Récupérer vos clés Stack Auth depuis Neon
2. Les ajouter dans votre `.env`
3. Installer les dépendances manquantes
4. Redémarrer l'application

---

## 📝 Étape 1 : Récupérer vos Clés Stack Auth

### Option A : Via la Console Neon (Recommandé)

1. Allez sur [console.neon.tech](https://console.neon.tech)
2. Sélectionnez votre projet **"feedback-analyser"**
3. Dans le menu de gauche, cliquez sur **"Integrations"**
4. Cliquez sur **"Stack Auth"** ou **"Authentication"**
5. Vous verrez vos 3 clés :
   - **Project ID**
   - **Publishable Client Key**
   - **Secret Server Key**

### Option B : Via le Dashboard Stack Auth

1. Allez sur [stack-auth.com](https://stack-auth.com) ou [app.stack-auth.com](https://app.stack-auth.com)
2. Connectez-vous avec le compte lié à Neon
3. Sélectionnez votre projet
4. **Settings** → **API Keys**
5. Copiez les 3 clés

---

## 🔑 Étape 2 : Configurer le fichier `.env`

Ouvrez votre fichier `.env` et ajoutez (ou mettez à jour) ces lignes :

```env
# Base de données Neon (déjà configuré)


# OpenRouter (déjà configuré)


# ⭐ Neon Auth / Stack Auth - À AJOUTER

```

**⚠️ Important :**


---

## 📦 Étape 3 : Mettre à jour `src/lib/stack.ts`

Votre fichier actuel essaie d'importer Stack Auth de manière asynchrone. Voici la version corrigée :

```typescript
// src/lib/stack.ts
import { StackServerApp } from "@stackframe/stack";

// Configuration Stack Auth pour Neon Auth
export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  urls: {
    signIn: "/handler/sign-in",
    signUp: "/handler/sign-up",
    afterSignIn: "/dashboard",
    afterSignUp: "/dashboard",
  }
});
```

---

## 🎨 Étape 4 : Initialiser Stack Auth dans SvelteKit

### 4.1 Créer `src/hooks.server.ts`

Ce fichier configure Stack Auth au niveau serveur :

```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { stackServerApp } from '$lib/stack';

export const handle: Handle = async ({ event, resolve }) => {
  try {
    // Récupérer l'utilisateur depuis Stack Auth
    const user = await stackServerApp.getUser({ request: event.request });
    
    // Stocker dans locals pour y accéder dans les pages
    event.locals.user = user ? {
      id: user.id,
      email: user.primaryEmail || '',
      displayName: user.displayName || '',
      signedUpAt: user.signedUpAt
    } : null;
    
  } catch (err) {
    console.warn('⚠️ Erreur Stack Auth:', err);
    event.locals.user = null;
  }

  return resolve(event);
};
```

### 4.2 Mettre à jour `src/app.d.ts`

Ajouter les types pour `locals.user` :

```typescript
// src/app.d.ts
declare global {
  namespace App {
    interface Locals {
      user: {
        id: string;
        email: string;
        displayName: string;
        signedUpAt: Date;
      } | null;
    }
  }
}

export {};
```

---

## 🖥️ Étape 5 : Mettre à jour le Dashboard Admin

### 5.1 Modifier `src/routes/admin/+page.server.ts`

```typescript
import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { isAdmin, getGlobalStats, getUserStats, getRecentApiLogs, estimateMonthlyCost } from '$lib/admin';

export const load: PageServerLoad = async ({ locals }) => {
  // Récupérer l'utilisateur depuis locals (configuré dans hooks.server.ts)
  const user = locals.user;
  
  // Vérifier l'authentification
  if (!user) {
    throw redirect(303, '/handler/sign-in?redirect=/admin');
  }

  // Vérifier les permissions admin
  if (!isAdmin(user)) {
    throw error(403, {
      message: 'Accès refusé. Vous devez être administrateur.'
    });
  }

  try {
    const [globalStats, userStats, recentLogs, monthlyCostEstimate] = await Promise.all([
      getGlobalStats(),
      getUserStats(),
      getRecentApiLogs(50),
      estimateMonthlyCost()
    ]);

    return {
      globalStats,
      userStats,
      recentLogs,
      monthlyCostEstimate,
      currentUser: user
    };
  } catch (err) {
    console.error('❌ Erreur dashboard admin:', err);
    
    // Retourner des données vides si BDD pas configurée
    return {
      globalStats: {
        totalAnalyses: 0,
        totalUsers: 0,
        totalApiCalls: 0,
        totalCost: 0,
        totalTokensIn: 0,
        totalTokensOut: 0,
        totalTokens: 0
      },
      userStats: [],
      recentLogs: [],
      monthlyCostEstimate: {
        weekCost: 0,
        estimatedMonthlyCost: 0,
        dailyAverage: 0
      },
      currentUser: user,
      error: 'Base de données non configurée. Exécutez: npx prisma db push'
    };
  }
};
```

### 5.2 Mettre à jour `src/lib/admin.ts`

Changer la fonction `isAdmin()` pour utiliser la BDD :

```typescript
export async function isAdmin(user: any): Promise<boolean> {
  if (!user || !user.id) return false;
  
  try {
    // Chercher l'utilisateur dans la BDD
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email }
    });
    
    return dbUser?.role === 'admin';
  } catch (err) {
    console.error('Erreur vérification admin:', err);
    
    // Fallback: emails hardcodés pour dev
    const adminEmails = [
      'admin@feedback-analyser.com',
      'arman@exemple.com' // Remplacer par votre email
    ];
    
    return adminEmails.includes(user.email?.toLowerCase() || '');
  }
}
```

---

## 🚀 Étape 6 : Créer les Pages d'Authentification

### 6.1 Page de Connexion

Créez `src/routes/auth/signin/+page.svelte` :

```svelte
<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  
  let email = '';
  let loading = false;
  let error = '';
  
  async function handleSignIn() {
    loading = true;
    error = '';
    
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        const redirect = $page.url.searchParams.get('redirect') || '/dashboard';
        goto(redirect);
      } else {
        error = 'Erreur de connexion';
      }
    } catch (e) {
      error = 'Erreur réseau';
    } finally {
      loading = false;
    }
  }
</script>

<div class="signin-container">
  <div class="signin-card">
    <h1>🔐 Connexion</h1>
    
    <form on:submit|preventDefault={handleSignIn}>
      <label>
        Email
        <input 
          type="email" 
          bind:value={email} 
          placeholder="votre@email.com"
          required
        />
      </label>
      
      {#if error}
        <div class="error">{error}</div>
      {/if}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
    
    <p class="signup-link">
      Pas de compte ? <a href="/auth/signup">Créer un compte</a>
    </p>
  </div>
</div>

<style>
  .signin-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 80vh;
    padding: 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  .signin-card {
    background: white;
    padding: 3rem;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 400px;
    width: 100%;
  }
  
  h1 {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  label {
    display: block;
    margin-bottom: 1rem;
  }
  
  input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1rem;
    margin-top: 0.5rem;
  }
  
  button {
    width: 100%;
    padding: 1rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  button:hover:not(:disabled) {
    background: #5568d3;
    transform: translateY(-2px);
  }
  
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .error {
    background: #fee;
    color: #c00;
    padding: 0.75rem;
    border-radius: 8px;
    margin-bottom: 1rem;
  }
  
  .signup-link {
    text-align: center;
    margin-top: 1.5rem;
  }
  
  .signup-link a {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
  }
</style>
```

---

## ✅ Étape 7 : Tester l'Authentification

### 7.1 Démarrer le serveur

```bash
npm run dev
```

### 7.2 Créer un compte

1. Allez sur `http://localhost:5173/handler/sign-up`
2. Entrez votre email
3. Recevez un lien de connexion (magic link)
4. Cliquez sur le lien
5. Vous êtes connecté ! ✅

### 7.3 Devenir admin

Méthode 1 - Via Prisma Studio :
```bash
npx prisma studio
```
- Ouvrez la table `User`
- Trouvez votre utilisateur
- Changez `role` de `user` à `admin`

Méthode 2 - Via SQL :
```sql
UPDATE "User" SET role = 'admin' WHERE email = 'votre@email.com';
```

### 7.4 Accéder au Dashboard Admin

1. Allez sur `http://localhost:5173/admin`
2. Vous devriez voir le dashboard admin complet ! 🎉

---

## 🐛 Dépannage

### Erreur: "Module not found: next/navigation"

**Cause:** Stack Auth essaie d'importer des modules Next.js

**Solution:** Assurez-vous d'utiliser `@stackframe/stack` version 2.8+ qui supporte mieux les frameworks autres que Next.js.

```bash
npm install @stackframe/stack@latest
```

### Erreur: "Cannot read properties of null"

**Cause:** L'utilisateur n'est pas connecté

**Solution:** Vérifiez que vous êtes bien connecté en allant sur `/handler/sign-in`

### Les clés Stack Auth ne fonctionnent pas

**Cause:** Clés incorrectes ou mal formatées

**Solution:**
1. Vérifiez qu'il n'y a pas d'espaces avant/après les clés
2. Vérifiez que les clés sont entre guillemets dans `.env`
3. Redémarrez le serveur après avoir modifié `.env`

---

## 📊 Schéma d'Authentification

```
Utilisateur
    ↓
/handler/sign-up (Stack Auth)
    ↓
Email magic link
    ↓
Clic sur le lien
    ↓
hooks.server.ts (récupère user)
    ↓
locals.user stocké
    ↓
+page.server.ts (vérifie locals.user)
    ↓
isAdmin() vérifie BDD
    ↓
Dashboard Admin ✅
```

---

## 🎉 Résultat Final

Une fois configuré, vous aurez :
- ✅ Authentification par magic link (email)
- ✅ Sessions gérées automatiquement
- ✅ Protection des routes admin
- ✅ Intégration avec votre BDD Neon
- ✅ Synchronisation User entre Stack Auth et Prisma

---

**Temps d'implémentation estimé:** 30-45 minutes

**Prochaine étape:** Récupérez vos clés Stack Auth et configurez votre `.env` ! 🚀

