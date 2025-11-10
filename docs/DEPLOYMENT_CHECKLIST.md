# ✅ Checklist de Déploiement - Feedback Analyser

## 🔒 Sécurité - COMPLÉTÉE

- ✅ Toutes les clés API retirées de la documentation
- ✅ Placeholders génériques utilisés dans les fichiers .md
- ✅ `.gitignore` configuré correctement
- ✅ Aucune clé exposée dans le code source
- ✅ Build Netlify ne détectera plus de secrets

## 📋 Avant de pousser vers GitHub

### 1. Vérifier le fichier `.env` local

Votre fichier `.env` doit contenir VOS VRAIES clés (ne jamais commiter ce fichier) :

```env
DATABASE_URL="postgresql://..."  # Votre vraie URL Neon
NEXT_PUBLIC_STACK_PROJECT_ID="..."  # Votre ID Stack Auth
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="..."  # Votre clé publique
STACK_SECRET_SERVER_KEY="..."  # Votre clé secrète
```

### 2. Pousser le schéma Prisma (si pas encore fait)

```bash
npx prisma db push
```

### 3. Pousser vers GitHub

```bash
git push origin main
```

## 🚀 Configuration Netlify (À faire APRÈS le push)

1. Allez sur [app.netlify.com](https://app.netlify.com/)
2. Sélectionnez votre site
3. **Site settings > Build & deploy > Environment**
4. Cliquez sur **"New variable"** et ajoutez chaque variable

### Variables à configurer sur Netlify

| Variable | Où la trouver | Obligatoire |
|----------|---------------|-------------|
| `DATABASE_URL` | Dashboard Neon > Connection string | ✅ Oui |
| `NEXT_PUBLIC_STACK_PROJECT_ID` | Dashboard Neon > Auth tab | ✅ Oui |
| `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` | Dashboard Neon > Auth tab | ✅ Oui |
| `STACK_SECRET_SERVER_KEY` | Dashboard Neon > Auth tab | ✅ Oui |
| `OPENROUTER_API_KEY` | openrouter.ai (Épopée S2) | ⏸️ Plus tard |

### 4. Redéployer sur Netlify

Après avoir ajouté les variables :
- Cliquez sur **"Trigger deploy"** > **"Deploy site"**
- Ou poussez un nouveau commit vers `main`

## ✅ Vérification Post-Déploiement

Une fois déployé, vérifiez :

1. **Landing page accessible** : `https://votre-site.netlify.app/`
2. **Dashboard accessible** : `https://votre-site.netlify.app/dashboard`
3. **Routes auth accessibles** : `https://votre-site.netlify.app/handler/sign-in`
4. **Pas d'erreurs 500** dans les logs Netlify

## 🐛 Dépannage

### Erreur : "Cannot connect to database"
- Vérifiez que `DATABASE_URL` est bien configurée sur Netlify
- Vérifiez que l'URL contient le bon format PostgreSQL

### Erreur : "Stack Auth not initialized"
- Vérifiez que les 3 variables Stack Auth sont configurées
- Vérifiez qu'il n'y a pas d'espaces avant/après les valeurs

### Build échoue sur Netlify
- Vérifiez les logs de build sur Netlify
- Assurez-vous que Node version 18+ est utilisée (déjà dans netlify.toml)

## 📊 Statut Actuel

- ✅ Code source sécurisé (pas de clés exposées)
- ✅ Build local réussi
- ✅ Commits poussés vers GitHub
- ⏳ Variables d'environnement à configurer sur Netlify
- ⏳ Premier déploiement Netlify à venir

## 🎯 Prochaine Étape : Épopée S2

Une fois le déploiement réussi :
- Créer un compte OpenRouter
- Ajouter la clé API dans `.env` et Netlify
- Implémenter la route API `/api/analyze`
- Intégrer l'IA pour l'analyse de feedback

---

**Document créé le :** 10 novembre 2025  
**Dernière mise à jour :** 10 novembre 2025

