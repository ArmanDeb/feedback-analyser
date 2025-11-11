# 🗄️ Configuration de la Base de Données

## Étape 1 : Vérifier le fichier `.env`

Assurez-vous que votre fichier `.env` contient une `DATABASE_URL` valide :

```env
# Format Neon PostgreSQL
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Autres variables
OPENROUTER_API_KEY="sk-or-v1-xxxxx"
NEXT_PUBLIC_STACK_PROJECT_ID="xxxxx"
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="xxxxx"
STACK_SECRET_SERVER_KEY="xxxxx"
```

## Étape 2 : Obtenir votre DATABASE_URL depuis Neon

1. Allez sur [console.neon.tech](https://console.neon.tech)
2. Sélectionnez votre projet
3. Cliquez sur **"Connection Details"**
4. Copiez la **"Connection string"** (format PostgreSQL)
5. Collez-la dans votre fichier `.env`

**⚠️ Important:** La connection string doit :
- Commencer par `postgresql://` ou `postgres://`
- Se terminer par `?sslmode=require`
- Contenir votre mot de passe (pas de placeholders)

## Étape 3 : Pousser le schéma vers Neon

```bash
npx prisma db push
```

Cette commande va :
- ✅ Créer les tables `User`, `Analysis`, `ApiLog`
- ✅ Configurer les relations
- ✅ Appliquer tous les indexes

## Étape 4 : Générer le client Prisma

```bash
npx prisma generate
```

## Étape 5 : Vérifier la connexion

```bash
npx prisma studio
```

Cela ouvre une interface web pour explorer votre base de données.

---

## 🐛 Dépannage

### Erreur : "the URL must start with the protocol postgresql://"

**Cause:** La `DATABASE_URL` est mal formatée ou manquante

**Solution:**
1. Vérifiez que votre `.env` contient bien `DATABASE_URL`
2. Vérifiez le format : `postgresql://user:pass@host/db?sslmode=require`
3. Pas d'espaces, pas de guillemets supplémentaires

### Erreur : "P1001: Can't reach database server"

**Cause:** Le serveur Neon n'est pas accessible

**Solution:**
1. Vérifiez votre connexion internet
2. Vérifiez que le projet Neon est actif (pas en pause)
3. Vérifiez les credentials (username, password)

### Erreur : "P1017: Server has closed the connection"

**Cause:** Le projet Neon est en mode "pause" (auto-suspend)

**Solution:**
1. Relancez la commande, Neon va se réveiller automatiquement
2. Ou désactivez l'auto-suspend dans les settings Neon

---

## 📊 Structure des Tables

### Table `User`
- `id` : ID unique
- `stackId` : ID Stack Auth (unique)
- `email` : Email de l'utilisateur
- `role` : 'user' ou 'admin'
- `createdAt` / `updatedAt` : Timestamps

### Table `Analysis`
- `id` : ID unique
- `userId` : Référence à User
- `feedbackText` : Texte du feedback
- `result` : Résultat JSON de l'analyse IA
- `createdAt` : Timestamp

### Table `ApiLog`
- `id` : ID unique
- `userId` : Référence à User
- `modelUsed` : Modèle IA utilisé
- `tokensIn` / `tokensOut` : Tokens consommés
- `cost` : Coût calculé
- `timestamp` : Timestamp

---

## ✅ Vérification Finale

Après avoir configuré la BDD, testez :

1. **Dashboard utilisateur** : `http://localhost:5173/dashboard`
   - Analyser un feedback
   - Vérifier que ça enregistre en BDD

2. **Dashboard admin** : `http://localhost:5173/admin`
   - Voir les statistiques
   - Voir les logs API

Si tout fonctionne, vous êtes prêt ! 🚀

