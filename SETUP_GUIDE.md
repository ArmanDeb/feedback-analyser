# 🚀 Guide de Configuration - Feedback Analyser

## Étape 1: Configurer le fichier .env

Créez ou mettez à jour votre fichier `.env` à la racine du projet avec ces valeurs :

### 1.1 Database URL (Neon) ✅

```env
DATABASE_URL="postgresql://neondb_owner:npg_g6WstRw8uDOk@ep-frosty-shape-aglhllx1-pooler.c-2.eu-central-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
```

**⚠️ Important:** Cette URL contient le mot de passe de votre base de données. Ne la commitez JAMAIS dans Git !

### 1.2 Stack Auth (Neon Auth) 🔐

Pour obtenir vos clés Stack Auth depuis Neon :

1. Allez sur le [Dashboard Neon](https://console.neon.tech/)
2. Sélectionnez votre projet `feedback-analyser`
3. Allez dans l'onglet "Auth" ou "Stack Auth"
4. Copiez les clés suivantes :

```env
NEXT_PUBLIC_STACK_PROJECT_ID="votre-project-id"
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="votre-publishable-key"
STACK_SECRET_SERVER_KEY="votre-secret-key"
```

### 1.3 OpenRouter (À faire dans l'Épopée S2)

```
```

---

## Étape 2: Pousser le schéma Prisma vers Neon

Une fois le fichier `.env` configuré, exécutez :

```bash
npx prisma db push
npx prisma generate
```

Cela va créer les tables dans votre base de données Neon.

---

## Étape 3: Configurer les variables d'environnement sur Netlify

1. Allez sur [Netlify](https://app.netlify.com/)
2. Sélectionnez votre site `feedback-analyser`
3. Allez dans **Site settings > Environment variables**
4. Ajoutez toutes les variables du fichier `.env` :
   - `DATABASE_URL`
   - `NEXT_PUBLIC_STACK_PROJECT_ID`
   - `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`
   - `STACK_SECRET_SERVER_KEY`
   - `OPENROUTER_API_KEY` (placeholder pour l'instant)

---

## Étape 4: Tester localement

```bash
npm run dev
```

Ouvrez `http://localhost:5173` et vérifiez que tout fonctionne.

---

## Étape 5: Déployer sur Netlify

Une fois les variables d'environnement configurées sur Netlify :

```bash
git add .
git commit -m "feat: Configure Stack Auth and Neon integration"
git push origin main
```

Netlify déclenchera automatiquement un déploiement.

---

## 📝 Structure des tables créées

Après `npx prisma db push`, vous aurez 3 tables :

### `User`
- Stocke les utilisateurs (synchronisés avec Stack Auth)
- Champs: `id`, `stackId`, `email`, `role`, `createdAt`, `updatedAt`

### `Analysis`
- Stocke les analyses de feedback
- Champs: `id`, `userId`, `feedbackText`, `result` (JSON), `createdAt`

### `ApiLog`
- Log des appels API pour le monitoring des coûts (S3)
- Champs: `id`, `userId`, `modelUsed`, `tokensIn`, `tokensOut`, `cost`, `timestamp`

---

## ⚠️ Problèmes courants

### Erreur: "the URL must start with the protocol postgresql://"
- Vérifiez que votre `.env` contient bien `DATABASE_URL="postgresql://..."`
- Assurez-vous qu'il n'y a pas d'espaces avant ou après

### Erreur: "EPERM: operation not permitted"
- Vérifiez les permissions du fichier `.env` : `chmod 644 .env`

### Build Netlify échoue
- Assurez-vous que toutes les variables d'environnement sont configurées sur Netlify
- Vérifiez que le build command est bien `npm run build`

---

## ✅ Checklist S1

- [x] Projet SvelteKit initialisé
- [x] Repository GitHub créé et push
- [x] Compte Netlify connecté à GitHub
- [x] Compte Neon créé
- [ ] Fichier `.env` configuré avec DATABASE_URL
- [ ] Stack Auth configuré (clés dans `.env`)
- [ ] Schéma Prisma poussé vers Neon (`npx prisma db push`)
- [ ] Variables d'environnement configurées sur Netlify
- [ ] Premier déploiement réussi sur Netlify

---

## 🎯 Prochaine étape : Épopée S2

Une fois S1 complété, nous passerons à l'intégration de l'API IA (OpenRouter) et à la création de la fonctionnalité d'analyse de feedback.

