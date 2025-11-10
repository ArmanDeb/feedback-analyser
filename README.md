# Analyseur de Feedback Client

Un outil SaaS alimenté par l'IA pour analyser automatiquement les feedbacks clients et extraire des insights actionnables.

## 🚀 Stack Technique

- **Framework:** SvelteKit
- **Hébergement:** Netlify
- **Authentification:** Clerk
- **Base de Données:** Neon (PostgreSQL Serverless)
- **ORM:** Prisma
- **API IA:** OpenRouter (Mistral 7B)

## 📋 Prérequis

- Node.js 18+
- npm ou pnpm
- Compte Neon (pour la base de données)
- Compte Clerk (pour l'authentification)
- Compte OpenRouter (pour l'API IA)
- Compte Netlify (pour le déploiement)

## 🛠️ Installation Locale

1. **Cloner le repository:**

```bash
git clone <url-du-repo>
cd feedback-analyser
```

2. **Installer les dépendances:**

```bash
npm install
```

3. **Configurer les variables d'environnement:**

Créez un fichier `.env` à partir de `.env.example`:

```bash
cp .env.example .env
```

Remplissez les variables d'environnement avec vos clés (voir SETUP_GUIDE.md):
- `DATABASE_URL`: URL de connexion Neon
- `NEXT_PUBLIC_STACK_PROJECT_ID`: ID du projet Stack Auth
- `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`: Clé publique Stack Auth
- `STACK_SECRET_SERVER_KEY`: Clé secrète Stack Auth
- `OPENROUTER_API_KEY`: Clé API OpenRouter (Épopée S2)

4. **Initialiser la base de données:**

```bash
npx prisma generate
npx prisma db push
```

5. **Lancer le serveur de développement:**

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 📁 Structure du Projet

```
feedback-analyser/
├── prisma/
│   └── schema.prisma          # Schéma de base de données
├── src/
│   ├── lib/
│   │   ├── clerk.ts           # Configuration Clerk
│   │   └── db.ts              # Client Prisma
│   ├── routes/
│   │   ├── +layout.svelte     # Layout global
│   │   ├── +page.svelte       # Landing page
│   │   └── dashboard/
│   │       └── +page.svelte   # Dashboard utilisateur
│   ├── app.d.ts
│   └── app.html
├── static/
├── .env                        # Variables d'environnement (NON versionné)
├── .env.example               # Template des variables
├── netlify.toml               # Configuration Netlify
├── package.json
├── svelte.config.js
└── tsconfig.json
```

## 🗄️ Schéma de Base de Données

### User
- Stocke les informations utilisateur (synchronisé avec Clerk)
- Rôles: `user` ou `admin`

### Analysis
- Stocke chaque analyse de feedback
- Contient le texte brut et le résultat JSON de l'IA

### ApiLog
- Log de tous les appels API pour le monitoring des coûts
- Utilisé dans le dashboard admin (Épopée S3)

## 🚢 Déploiement

### Configuration Netlify

1. Connecter le repository GitHub à Netlify
2. Configurer les variables d'environnement dans Netlify
3. Le déploiement automatique se déclenchera sur chaque push sur `main`

### Variables d'environnement Netlify

Ajouter dans les paramètres Netlify (voir SETUP_GUIDE.md):
- `DATABASE_URL`
- `NEXT_PUBLIC_STACK_PROJECT_ID`
- `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`
- `STACK_SECRET_SERVER_KEY`
- `OPENROUTER_API_KEY`

## 📖 Documentation

Consultez le fichier `project_plan.md` pour le plan détaillé du projet par épopée.

Consultez `docs/S1_SUIVI.md` pour le document de suivi de l'Épopée S1.

## 🔧 Scripts Disponibles

- `npm run dev` - Lancer le serveur de développement
- `npm run build` - Construire pour la production
- `npm run preview` - Prévisualiser le build de production
- `npm run check` - Vérifier le code TypeScript
- `npx prisma studio` - Ouvrir l'interface Prisma Studio

## 📝 Roadmap

- [x] **S1:** Fondation & Authentification
- [ ] **S2:** Intégration IA & Fonctionnalité Cœur
- [ ] **S3:** Dashboard Admin & Monitoring Coûts
- [ ] **S4:** Robustesse & UX
- [ ] **S5:** Landing Page, Pricing & Légal
- [ ] **S6:** Finitions UX & Tests
- [ ] **S7:** Rapport Final & Démo

## 📄 Licence

Projet académique - Tous droits réservés.

