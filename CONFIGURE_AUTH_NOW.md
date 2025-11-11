# 🔐 Configuration Neon Auth - Guide Pas à Pas

**Temps estimé : 5 minutes** ⏱️

---

## 📋 Étape 1 : Récupérer vos Clés Stack Auth

### Via la Console Neon

1. **Ouvrez votre navigateur** et allez sur :
   ```
   https://console.neon.tech
   ```

2. **Connectez-vous** avec votre compte Neon

3. **Sélectionnez votre projet** : `feedback-analyser`

4. **Menu de gauche** → Cliquez sur **"Integrations"**

5. **Cherchez "Stack Auth"** ou **"Authentication"** dans la liste

6. **Cliquez dessus** - Vous devriez voir une page avec 3 clés :

```
Project ID: proj_xxxxxxxxxxxxx
Publishable Client Key: pk_xxxxxxxxxxxxx
Secret Server Key: sk_xxxxxxxxxxxxx
```

7. **Copiez ces 3 clés** (gardez-les sous la main)

---

## 📝 Étape 2 : Ajouter les Clés dans votre `.env`

### Ouvrir le fichier `.env`

Dans votre éditeur de code, ouvrez le fichier `.env` à la racine du projet.

**Si le fichier n'existe pas**, créez-le :
```bash
touch .env
```

### Ajouter les 3 Clés

Ajoutez ces lignes **à la fin** de votre fichier `.env` :

```env
# Neon Auth / Stack Auth
NEXT_PUBLIC_STACK_PROJECT_ID="proj_votre_project_id_ici"
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="pk_votre_publishable_key_ici"
STACK_SECRET_SERVER_KEY="sk_votre_secret_key_ici"
```

**⚠️ Remplacez :**
- `proj_votre_project_id_ici` → Votre vrai Project ID
- `pk_votre_publishable_key_ici` → Votre vraie Publishable Client Key
- `sk_votre_secret_key_ici` → Votre vraie Secret Server Key

**💡 Important :**
- Gardez les **guillemets** `""`
- Pas d'**espaces** avant ou après le `=`
- Les clés doivent être sur des lignes **séparées**

### Exemple Complet de `.env`

Votre fichier `.env` devrait ressembler à ça :

```env
# Base de données Neon
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# OpenRouter API
OPENROUTER_API_KEY="sk-or-v1-xxxxxxxxxxxxxxxx"

# Neon Auth / Stack Auth
NEXT_PUBLIC_STACK_PROJECT_ID="proj_abc123xyz456"
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="pk_test_abc123xyz456"
STACK_SECRET_SERVER_KEY="sk_secret_abc123xyz456"
```

### Sauvegarder le Fichier

**Appuyez sur `Cmd+S` (Mac) ou `Ctrl+S` (Windows/Linux)**

---

## 🔄 Étape 3 : Redémarrer le Serveur

### Arrêter le serveur actuel

Dans votre terminal où `npm run dev` tourne :
- Appuyez sur **`Ctrl+C`** (ou `Cmd+C` sur Mac)

### Redémarrer le serveur

```bash
npm run dev
```

### Vérifier que ça fonctionne

Dans la console, vous devriez voir :

```
✅ Stack Auth configuré (Neon Auth)
```

**Si vous voyez ça, c'est bon ! ✅**

**Si vous voyez :**
```
⚠️ Stack Auth non configuré - Mode développement activé
```
**→ Vérifiez vos clés dans le `.env`**

---

## 🧪 Étape 4 : Tester l'Authentification

### Test 1 : Page de Connexion

1. Ouvrez votre navigateur
2. Allez sur : `http://localhost:5173/handler/sign-in`
3. Vous devriez voir une page de connexion Stack Auth

### Test 2 : Créer un Compte

1. Cliquez sur **"Sign Up"** ou allez sur :
   ```
   http://localhost:5173/handler/sign-up
   ```

2. **Entrez votre email** (utilisez un vrai email)

3. **Cliquez sur "Send Magic Link"**

4. **Vérifiez votre boîte email** (peut prendre 1-2 minutes)
   - Regardez aussi dans les **spam** !

5. **Cliquez sur le lien** dans l'email

6. **Vous êtes connecté ! 🎉**

### Test 3 : Vérifier la Connexion

Une fois connecté, vous devriez voir :
- Votre email affiché dans la navbar
- Un bouton "Sign Out"

---

## 🔐 Étape 5 : Devenir Admin

Pour accéder au dashboard admin, vous devez avoir le rôle `admin`.

### Option A : Via Prisma Studio (Recommandé)

1. **Ouvrir Prisma Studio** :
   ```bash
   npx prisma studio
   ```

2. Dans votre navigateur, ça ouvre : `http://localhost:5555`

3. **Cliquez sur la table `User`** dans le menu de gauche

4. **Trouvez votre utilisateur** (cherchez votre email)

5. **Double-cliquez** sur le champ `role`

6. **Changez** `user` → `admin`

7. **Cliquez sur "Save 1 change"** (bouton vert en haut à droite)

8. **Fermez Prisma Studio** (Ctrl+C dans le terminal)

### Option B : Via SQL Direct

1. Allez sur [console.neon.tech](https://console.neon.tech)

2. Votre projet → **SQL Editor**

3. **Exécutez cette requête** (remplacez l'email) :

```sql
UPDATE "User" SET role = 'admin' WHERE email = 'votre@email.com';
```

4. Cliquez sur **"Run"**

---

## ✅ Étape 6 : Tester le Dashboard Admin

### Accéder au Dashboard Admin

1. Allez sur : `http://localhost:5173/admin`

2. **Vous devriez voir le dashboard admin complet ! 🎉**

3. Plus de badge "Mode Développement"

4. **Statistiques en temps réel :**
   - Total Analyses
   - Utilisateurs
   - Appels API
   - Coûts
   - Logs récents

---

## 🐛 Problèmes Fréquents

### "Stack Auth non configuré" dans la console

**Cause :** Les clés ne sont pas correctement dans le `.env`

**Solution :**
1. Vérifiez que les 3 clés sont dans `.env`
2. Vérifiez qu'il n'y a pas d'espaces
3. Vérifiez les guillemets `""`
4. Redémarrez le serveur (`Ctrl+C` puis `npm run dev`)

### Je ne reçois pas l'email magic link

**Solutions :**
1. Vérifiez votre dossier **spam**
2. Attendez 2-3 minutes
3. Vérifiez que l'email est correct
4. Réessayez avec un autre email

### Erreur 403 sur `/admin`

**Cause :** Vous n'avez pas le rôle `admin`

**Solution :**
1. Suivez l'**Étape 5** ci-dessus
2. Changez votre `role` en `admin` dans la BDD
3. Rechargez la page `/admin`

### Le serveur ne démarre pas

**Cause possible :** Problème avec Stack Auth ou les clés

**Solution :**
1. Vérifiez le format des clés (pas d'espaces, bons guillemets)
2. Essayez de supprimer et réinstaller :
   ```bash
   npm install @stackframe/stack@latest
   npm run dev
   ```

---

## 📊 Vérification Finale

### Checklist

- [ ] ✅ Les 3 clés Stack Auth sont dans `.env`
- [ ] ✅ Le serveur affiche "✅ Stack Auth configuré"
- [ ] ✅ Je peux accéder à `/handler/sign-in`
- [ ] ✅ J'ai reçu un magic link par email
- [ ] ✅ Je suis connecté
- [ ] ✅ Mon rôle est `admin` dans la BDD
- [ ] ✅ J'accède au dashboard admin (`/admin`)

**Si tous les ✅ sont cochés, vous avez réussi ! 🎉**

---

## 🚀 Prochaines Étapes

### 1. Tester l'Analyse de Feedback

1. Allez sur : `http://localhost:5173/dashboard`
2. Entrez un feedback (ex: "L'app est super mais il manque un mode dark")
3. Cliquez sur "Analyser"
4. **Voyez les résultats structurés** ✅

### 2. Vérifier le Dashboard Admin

1. Allez sur : `http://localhost:5173/admin`
2. **Vous verrez :**
   - 1 utilisateur (vous)
   - 1 analyse
   - 1 appel API
   - Coût : $0.0000 (modèle gratuit)

### 3. Déployer sur Netlify

```bash
# Commiter vos changements (sans le .env !)
git add -A
git commit -m "Configure Neon Auth"
git push origin develop

# Merger vers main
git checkout main
git merge develop
git push origin main
```

**Sur Netlify :**
1. Allez dans **Site Settings** → **Environment Variables**
2. Ajoutez les mêmes 3 clés Stack Auth
3. Ajoutez aussi `DATABASE_URL` et `OPENROUTER_API_KEY`
4. Netlify va redéployer automatiquement
5. Testez sur votre URL de production !

---

## 💡 Aide Supplémentaire

### Documentation Complète

- **`QUICKSTART_AUTH.md`** - Guide rapide
- **`docs/NEON_AUTH_SETUP.md`** - Guide détaillé
- **`BUILD_SUCCESS.md`** - Guide de build

### Support

Si vous avez des problèmes :
1. Relisez ce guide
2. Vérifiez les logs dans la console
3. Consultez les docs ci-dessus
4. Vérifiez que toutes les dépendances sont installées

---

## 🎉 Félicitations !

Une fois cette configuration terminée, vous aurez :
- ✅ Authentification complète (magic links)
- ✅ Gestion des sessions
- ✅ Dashboard admin protégé
- ✅ Rôles utilisateurs
- ✅ Application production-ready

**Temps total : 5-10 minutes** ⏱️

**Commencez maintenant avec l'Étape 1 ! 🚀**

