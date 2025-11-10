# Document de Suivi - Épopée S1 : Fondation, Stack & Authentification

**Date de début:** 10 novembre 2025  
**Statut:** ✅ En cours

---

## 🎯 Objectifs de l'Épopée S1

Mettre en place les fondations techniques du projet "Analyseur de Feedback Client":
- Initialiser le projet SvelteKit
- Configurer la stack technique complète
- Préparer l'infrastructure pour le déploiement
- Créer les pages squelettes de base

---

## 📊 Avancement des Tâches

### ✅ S1.1 - Initialiser le projet SvelteKit
**Statut:** Complété  
**Date:** 10 novembre 2025

**Actions réalisées:**
- Création manuelle des fichiers de configuration SvelteKit
- Installation des dépendances de base
- Configuration de TypeScript
- Installation de l'adaptateur Netlify (`@sveltejs/adapter-netlify`)

**Fichiers créés:**
- `package.json`
- `svelte.config.js`
- `vite.config.ts`
- `tsconfig.json`
- `.gitignore`
- `src/app.d.ts`
- `src/app.html`

**Commande d'installation:**
```bash
npm install
```

---

### ⏳ S1.2 - Créer le repo GitHub (main, dev)
**Statut:** À faire  
**Actions requises:**

1. Initialiser Git localement:
```bash
git init
git add .
git commit -m "Initial commit: SvelteKit project setup"
```

2. Créer le repository sur GitHub:
   - Nom suggéré: `feedback-analyser`
   - Visibilité: Privé (pour le MVP)

3. Créer les branches:
```bash
git branch -M main
git remote add origin <url-github>
git push -u origin main
git checkout -b dev
git push -u origin dev
```

**Note:** La branche `main` sera utilisée pour la production (déploiement Netlify automatique).

---

### ⏳ S1.3 - Connecter le repo à Netlify
**Statut:** À faire (dépend de S1.2)  
**Actions requises:**

1. Se connecter à [Netlify](https://app.netlify.com/)
2. Cliquer sur "New site from Git"
3. Sélectionner le repository GitHub `feedback-analyser`
4. Configurer les paramètres de build:
   - **Build command:** `npm run build`
   - **Publish directory:** `build`
   - **Branch:** `main`

**Fichier créé:**
- `netlify.toml` ✅ (configuration du build)

**Note:** Le déploiement automatique se déclenchera sur chaque push sur `main`.

---

### ⏳ S1.4 - Choisir et configurer la BDD (Neon)
**Statut:** Partiellement complété  
**Date:** 10 novembre 2025

**Actions réalisées:**
- Installation de Prisma (`prisma` et `@prisma/client`)
- Création du schéma Prisma avec les 3 tables principales

**Actions restantes:**

1. Créer un compte sur [Neon](https://neon.tech)
2. Créer un nouveau projet PostgreSQL
3. Copier la connection string
4. Mettre à jour le fichier `.env`:
```env
DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

5. Pousser le schéma vers Neon:
```bash
npx prisma db push
npx prisma generate
```

---

### ⏳ S1.5 - Configurer Clerk pour l'authentification
**Statut:** Partiellement complété (structure créée)  
**Date:** 10 novembre 2025

**Problème identifié:**
Le package `@clerk/sveltekit` n'existe pas sur npm. Clerk ne semble pas avoir de SDK officiel pour SvelteKit.

**Solution proposée (3 options):**

**Option 1 - Clerk avec SDK JavaScript vanilla (Recommandé)**
- Installer `@clerk/clerk-js`
- Intégrer manuellement dans SvelteKit via les hooks
- Utiliser les Web Components de Clerk

**Option 2 - Clerk via API REST**
- Implémenter l'authentification côté serveur
- Utiliser l'API REST de Clerk directement
- Plus de contrôle mais plus de code à écrire

**Option 3 - Alternative à Clerk**
- **Supabase Auth** (très similaire à Clerk)
- **Auth.js** (anciennement NextAuth, support SvelteKit)
- **Lucia Auth** (léger, spécifique à SvelteKit)

**Actions restantes:**

1. Créer un compte sur [Clerk](https://clerk.dev)
2. Créer une nouvelle application
3. Récupérer les clés API
4. Choisir et implémenter l'une des 3 options ci-dessus
5. Mettre à jour le fichier `.env`:
```env
PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_xxxxxxxxx"
CLERK_SECRET_KEY="sk_test_xxxxxxxxx"
```

**Fichier créé:**
- `src/lib/clerk.ts` ✅ (structure placeholder)

---

### ⏳ S1.6 - Sauvegarder les clés (Netlify, Clerk, Neon)
**Statut:** Partiellement complété (templates créés)

**Fichiers créés:**
- `.env.example` ✅ (template)
- `.env` ⚠️ (NON commité, déjà dans .gitignore)

**Actions restantes:**

1. **Localement:**
   - Remplir le fichier `.env` avec les vraies clés

2. **Sur Netlify:**
   - Aller dans Site settings > Environment variables
   - Ajouter toutes les variables du `.env`
   - ⚠️ Ne jamais commiter les vraies clés dans Git

**Variables à configurer:**
```
DATABASE_URL
PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
OPENROUTER_API_KEY (S2)
```

---

### ✅ S1.7 - Créer le schéma de la BDD (v1) avec Prisma
**Statut:** Complété  
**Date:** 10 novembre 2025

**Schéma créé:**

**Table `User`:**
- `id`: String (CUID)
- `clerkId`: String unique (lien avec Clerk)
- `email`: String unique
- `role`: String (default: "user") - Supporte "user" et "admin"
- `createdAt`, `updatedAt`: DateTime

**Table `Analysis`:**
- `id`: String (CUID)
- `userId`: Foreign Key vers User
- `feedbackText`: Text (feedback brut)
- `result`: JSON (résultat structuré de l'IA)
- `createdAt`: DateTime
- Index sur `userId` et `createdAt`

**Table `ApiLog`:**
- `id`: String (CUID)
- `userId`: Foreign Key vers User
- `modelUsed`: String (ex: "mistralai/mistral-7b-instruct")
- `tokensIn`, `tokensOut`: Int
- `cost`: Float (en dollars)
- `timestamp`: DateTime
- Index sur `userId` et `timestamp`

**Fichier créé:**
- `prisma/schema.prisma` ✅

**Fichier helper créé:**
- `src/lib/db.ts` ✅ (client Prisma)

**Justifications techniques:**
- **User.role:** Permet de distinguer les admins pour le dashboard de monitoring (S3)
- **Analysis.result:** JSON pour flexibilité de la structure retournée par l'IA
- **ApiLog:** Prévu dès S1 pour le monitoring des coûts (S3)
- **Index:** Sur les clés fréquemment recherchées (userId, timestamps)

---

### ✅ S1.8 - Créer les pages squelettes
**Statut:** Complété  
**Date:** 10 novembre 2025

**Pages créées:**

1. **Landing Page (`src/routes/+page.svelte`)**
   - Hero section avec CTA
   - Section "Pourquoi notre outil ?"
   - 3 cartes de fonctionnalités
   - Footer simple
   - Design moderne avec gradient violet

2. **Dashboard (`src/routes/dashboard/+page.svelte`)**
   - Zone d'analyse (textarea + bouton)
   - Gestion de l'état de chargement (spinner)
   - Affichage des résultats (placeholder)
   - Section historique (placeholder pour S4)
   - Design propre et professionnel

3. **Layout Global (`src/routes/+layout.svelte`)**
   - Navbar avec logo et navigation
   - Styles globaux
   - Structure responsive
   - Placeholder pour les boutons Clerk (Sign In/Sign Up)

**Design:**
- Palette de couleurs: Violet (#667eea) et gradient vers #764ba2
- Typographie: System font stack
- Background: #f5f7fa
- Responsive (media queries pour mobile)

**Note:** Les pages sont fonctionnelles mais ne communiquent pas encore avec l'IA (prévu pour S2).

---

### ⏳ S1.9 - Démarrer Document de Suivi S1
**Statut:** ✅ Complété  
**Date:** 10 novembre 2025

Ce document ! 📄

---

## 🛠️ Stack Technique Finale (S1)

| Composant | Technologie | Version | Statut |
|-----------|-------------|---------|--------|
| Framework | SvelteKit | 2.0.0 | ✅ Installé |
| Adaptateur | @sveltejs/adapter-netlify | 4.3.4 | ✅ Installé |
| Language | TypeScript | 5.0.0 | ✅ Configuré |
| ORM | Prisma | Latest | ✅ Installé |
| Client BDD | @prisma/client | Latest | ✅ Installé |
| Hébergement | Netlify | - | ⏳ À configurer |
| Base de données | Neon PostgreSQL | - | ⏳ À configurer |
| Authentification | Clerk | - | ⏳ À configurer |

---

## 📝 Notes Techniques

### Dépendances installées:
```json
{
  "devDependencies": {
    "@sveltejs/adapter-netlify": "^4.3.4",
    "@sveltejs/kit": "^2.0.0",
    "@sveltejs/vite-plugin-svelte": "^4.0.0",
    "prisma": "latest",
    "svelte": "^5.0.0",
    "svelte-check": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  },
  "dependencies": {
    "@prisma/client": "latest"
  }
}
```

### Configuration Netlify (`netlify.toml`):
- Build command: `npm run build`
- Publish directory: `build`
- Node version: 18
- Redirects configurés pour le SPA

---

## ⚠️ Points d'Attention

1. **Clerk pour SvelteKit:**
   - Pas de SDK officiel trouvé sur npm
   - Solutions alternatives à évaluer
   - Peut nécessiter une implémentation manuelle

2. **Base de données Neon:**
   - Requiert un compte externe
   - Connection string à configurer manuellement
   - Utiliser `npx prisma db push` (pas de migrations pour MVP)

3. **Variables d'environnement:**
   - Ne JAMAIS commiter le fichier `.env`
   - Toujours utiliser `.env.example` comme référence
   - Configurer les mêmes variables sur Netlify

---

## 🎯 Prochaines Étapes

### Actions immédiates pour compléter S1:

1. ✅ Créer le repository GitHub
2. ✅ Pousser le code initial
3. ✅ Créer un compte Neon et configurer la BDD
4. ✅ Résoudre l'intégration Clerk (choisir une option)
5. ✅ Connecter le repo à Netlify
6. ✅ Configurer les variables d'environnement sur Netlify
7. ✅ Tester le premier déploiement

### Transition vers S2:

Une fois S1 complété, nous pourrons démarrer l'**Épopée S2 : Intégration IA & Fonctionnalité Cœur**, qui inclut:
- Création du compte OpenRouter
- Création de la route API `/api/analyze`
- Prompt engineering (v1)
- Connexion du frontend à l'API
- Sauvegarde des analyses dans la BDD

---

## 📊 Métriques

- **Temps estimé S1:** 1 semaine
- **Temps réel:** En cours
- **Fichiers créés:** 15+
- **Lignes de code:** ~600+
- **Tâches complétées:** 3/9
- **Tâches en cours:** 6/9

---

## 🤝 Décisions Techniques

| Décision | Justification |
|----------|---------------|
| SvelteKit au lieu de Next.js | Plus léger, meilleure performance, adapté au projet |
| Netlify au lieu de Vercel | Excellent free tier, simplicité de déploiement |
| Neon au lieu de Supabase | PostgreSQL pur, pas de features superflues |
| Prisma au lieu de Drizzle | Maturité, excellente DX, générateur de types |
| TypeScript | Type safety, meilleure DX, moins d'erreurs |

---

**Document maintenu par:** Assistant IA (Tech Lead)  
**Dernière mise à jour:** 10 novembre 2025  
**Version:** 1.0

