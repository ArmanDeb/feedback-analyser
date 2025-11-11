# 🚀 Configuration Rapide - Neon Auth

## ✅ Neon Auth déjà provisionné !

Votre projet **feedback-analyser** a déjà Neon Auth activé. Il ne reste que 3 étapes !

---

## 📝 Étape 1 : Récupérer vos Clés (2 minutes)

### Via la Console Neon

1. Ouvrez [console.neon.tech](https://console.neon.tech)
2. Sélectionnez votre projet **"feedback-analyser"**
3. Menu **"Integrations"** → **"Stack Auth"** (ou **"Authentication"**)
4. Copiez les 3 clés affichées

**Vous devriez voir :**
- ✅ Project ID
- ✅ Publishable Client Key
- ✅ Secret Server Key

---

## 🔑 Étape 2 : Configurer votre `.env` (1 minute)

Ouvrez votre fichier `.env` et ajoutez ces 3 lignes :

```env
NEXT_PUBLIC_STACK_PROJECT_ID="votre-project-id-ici"
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="votre-publishable-key-ici"
STACK_SECRET_SERVER_KEY="votre-secret-key-ici"
```

**⚠️ Attention :**
- Remplacez `"votre-..."` par vos vraies clés
- Gardez les guillemets `""`
- Pas d'espaces avant/après les `=`

---

## 🚀 Étape 3 : Redémarrer le Serveur (30 secondes)

```bash
# Arrêter le serveur (Ctrl+C)
# Puis redémarrer :
npm run dev
```

**Vous devriez voir dans la console :**
```
✅ Stack Auth configuré (Neon Auth)
```

---

## ✅ Tester l'Authentification

### Test 1 : Créer un Compte

1. Allez sur `http://localhost:5173/handler/sign-up`
2. Entrez votre email
3. Vous recevrez un "magic link" par email
4. Cliquez sur le lien
5. **Vous êtes connecté ! 🎉**

### Test 2 : Devenir Admin

**Option A - Via Prisma Studio (Recommandé) :**

```bash
npx prisma studio
```

1. Ouvrez la table `User`
2. Trouvez votre email
3. Double-cliquez sur le champ `role`
4. Changez `user` → `admin`
5. Cliquez "Save"

**Option B - Via SQL Direct :**

Allez sur [console.neon.tech](https://console.neon.tech) → SQL Editor :

```sql
UPDATE "User" SET role = 'admin' WHERE email = 'votre@email.com';
```

### Test 3 : Dashboard Admin

1. Allez sur `http://localhost:5173/admin`
2. **Vous êtes admin ! 🔐**
3. Vous verrez les statistiques en temps réel

---

## 🐛 Problèmes Fréquents

### Le serveur ne démarre pas

**Vérifiez :**
- Les 3 clés sont bien dans `.env`
- Pas d'espaces avant/après les clés
- Les clés sont entre guillemets
- Vous avez bien redémarré le serveur

### Erreur: "Module not found: next/navigation"

**Cause :** Version de Stack Auth incompatible

**Solution :**
```bash
npm install @stackframe/stack@latest
npm run dev
```

### Je ne reçois pas l'email magic link

**Vérifiez :**
- Votre dossier spam
- L'email est correct
- Stack Auth est bien configuré (console logs)

**Alternative :** Utilisez le lien de développement qui s'affiche dans la console

---

## 📊 Ce qui Fonctionne Maintenant

### ✅ Sans les Clés (Mode Dev)
- Dashboard utilisateur (`/dashboard`)
- Dashboard admin en mode dev (`/admin`)
- Badge "Mode Développement" 🟡
- Analyse IA opérationnelle

### ✅ Avec les Clés (Mode Production)
- Authentification réelle par magic link
- Création de compte
- Sessions persistantes
- Dashboard admin protégé
- Rôles (user/admin)

---

## 📚 Documentation Complète

Pour plus de détails, consultez :
- **`docs/NEON_AUTH_SETUP.md`** - Guide complet
- **`docs/AUTH_ALTERNATIVES.md`** - Alternatives (Auth.js, Lucia)
- **`SETUP_DATABASE.md`** - Configuration BDD

---

## 🎯 Récapitulatif

**Ce qui a été fait :**
- ✅ Neon Auth provisionné sur votre projet
- ✅ `src/hooks.server.ts` créé
- ✅ `src/lib/stack.ts` configuré
- ✅ `src/app.d.ts` avec types
- ✅ Dashboard admin prêt

**Ce qu'il reste à faire :**
1. 📋 Récupérer les 3 clés Stack Auth
2. ✏️ Les ajouter dans `.env`
3. 🔄 Redémarrer le serveur

---

**Temps total : ~5 minutes** ⏱️

**Questions ?** Consultez `docs/NEON_AUTH_SETUP.md` pour plus de détails !

