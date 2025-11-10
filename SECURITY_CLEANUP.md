# 🔒 Nettoyage de Sécurité - Clé API Exposée

## ⚠️ Situation

Votre clé OpenRouter a été détectée par Netlify dans les dossiers de build.

---

## 🚨 ACTIONS IMMÉDIATES À FAIRE

### 1. Révoquer l'ancienne clé OpenRouter

1. Allez sur [openrouter.ai/keys](https://openrouter.ai/keys)
2. **Supprimez** l'ancienne clé (celle qui commence par `sk-or-v1-6d274c...`)
3. **Générez une NOUVELLE clé**
4. Copiez la nouvelle clé

### 2. Mettre à jour votre `.env` local

```bash
# Ouvrez votre fichier .env et remplacez:
OPENROUTER_API_KEY="VOTRE_NOUVELLE_CLE_ICI"
```

### 3. Nettoyer les dossiers de build locaux

```bash
# Supprimez les dossiers qui contiennent l'ancienne clé
rm -rf .svelte-kit
rm -rf .netlify
rm -rf build
```

### 4. Rebuild proprement

```bash
npm run build
```

### 5. Mettre à jour Netlify

1. Allez sur [app.netlify.com](https://app.netlify.com/)
2. Sélectionnez votre site
3. **Site settings > Environment variables**
4. **Supprimez** l'ancienne variable `OPENROUTER_API_KEY`
5. **Ajoutez** la nouvelle avec votre nouvelle clé
6. **Trigger deploy** > **Clear cache and deploy site**

### 6. Commit et Push

```bash
git add .
git commit -m "chore: Clean build folders and update security"
git push origin main
```

---

## ✅ Vérification

Après ces étapes :
- ✅ Ancienne clé révoquée (ne fonctionne plus)
- ✅ Nouvelle clé configurée localement
- ✅ Nouvelle clé configurée sur Netlify
- ✅ Dossiers de build nettoyés
- ✅ Aucune clé dans Git

---

## 🛡️ Prévention Future

### Ce qu fichiers .gitignore protège :

```
.env              ← Vos clés locales
.env.*            ← Toutes variations
.svelte-kit       ← Build SvelteKit
.netlify          ← Build Netlify
build             ← Build de production
```

### Netlify va build proprement :

Netlify va :
1. Cloner le repo (sans les clés)
2. Lire les variables d'environnement de son interface
3. Builder avec la nouvelle clé
4. **NE PAS** commiter les builds dans Git

---

## 📝 Rappel Important

**JAMAIS mettre de vraies clés dans :**
- ❌ Code source (`.ts`, `.js`, `.svelte`)
- ❌ Documentation (`.md`)
- ❌ Commits Git
- ❌ Messages de commit

**TOUJOURS mettre les clés dans :**
- ✅ Fichier `.env` (ignoré par Git)
- ✅ Variables d'environnement Netlify
- ✅ Gestionnaires de secrets (Vault, etc.)

---

Une fois ces étapes terminées, votre application sera sécurisée ! 🔒

