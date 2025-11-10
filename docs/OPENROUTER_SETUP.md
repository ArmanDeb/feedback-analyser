# 🤖 Configuration OpenRouter - Guide Complet

## Qu'est-ce qu'OpenRouter ?

OpenRouter est une API unifiée qui donne accès à de nombreux modèles d'IA (Mistral, Claude, GPT, Llama, etc.) via une seule interface. C'est parfait pour notre cas d'usage car :

✅ **Pas d'abonnement mensuel** - Vous payez uniquement ce que vous utilisez
✅ **Budget flexible** - Commencez avec 2-5$ de crédit
✅ **Nombreux modèles** - Mistral 7B est très économique (~$0.0002 par requête)
✅ **Pas de carte bancaire requise** pour tester

---

## 📝 Étape 1 : Créer un compte OpenRouter

1. Allez sur [openrouter.ai](https://openrouter.ai/)
2. Cliquez sur **"Sign Up"** en haut à droite
3. Connectez-vous avec votre compte Google ou GitHub
4. **C'est tout !** Vous avez un compte

---

## 💳 Étape 2 : Ajouter du crédit (optionnel pour tester)

OpenRouter offre souvent quelques crédits gratuits pour tester. Sinon :

1. Allez dans **"Credits"** dans le menu
2. Cliquez sur **"Add Credits"**
3. Ajoutez **2-5$** de crédit (largement suffisant pour commencer)
4. Payez via carte bancaire ou crypto

**Note :** 5$ permettent d'effectuer environ **25,000 analyses** avec Mistral 7B !

---

## 🔑 Étape 3 : Obtenir votre clé API

1. Allez dans **"API Keys"** dans le menu
2. Cliquez sur **"Create Key"**
3. Donnez un nom à votre clé (ex: "Feedback Analyser")
4. **Copiez la clé** (elle commence par `sk-or-v1-`)
5. **Sauvegardez-la** immédiatement (vous ne pourrez plus la voir après)

---

## ⚙️ Étape 4 : Configurer dans votre projet

### 4.1 Configuration locale (.env)

Ajoutez cette ligne dans votre fichier `.env` :

```env
```

### 4.2 Configuration Netlify

1. Allez sur [Netlify](https://app.netlify.com/)
2. Sélectionnez votre site
3. **Site settings > Environment variables**
4. Cliquez sur **"New variable"**
5. Ajoutez :
   - **Key:** `OPENROUTER_API_KEY`
   - **Value:** Votre clé (sk-or-v1-...)

### 4.3 Redéployer

```bash
git add .
git commit -m "Configure OpenRouter API"
git push origin main
```

Netlify redéploiera automatiquement avec la nouvelle variable.

---

## 🧪 Étape 5 : Tester l'API

### Test local

```bash
npm run dev
```

1. Allez sur `http://localhost:5173/dashboard`
2. Collez un feedback de test :

```
J'adore votre produit ! L'interface est très intuitive. 
Par contre, j'ai rencontré un bug lors du paiement, 
la page se fige. Serait-il possible d'ajouter un export PDF ?
```

3. Cliquez sur **"Analyser le Feedback"**
4. Vous devriez voir les résultats en 2-3 secondes ✅

---

## 📊 Modèles Disponibles

Notre application utilise **Mistral 7B Instruct** par défaut :

| Modèle | Prix | Vitesse | Qualité | Recommandé pour |
|--------|------|---------|---------|-----------------|
| `mistralai/mistral-7b-instruct` | $0.0002/req | ⚡⚡⚡ | ⭐⭐⭐ | **Production** (excellent rapport qualité/prix) |
| `meta-llama/llama-3.1-8b-instruct` | $0.0003/req | ⚡⚡ | ⭐⭐⭐⭐ | Alternative plus précise |
| `anthropic/claude-3-haiku` | $0.002/req | ⚡⚡ | ⭐⭐⭐⭐⭐ | Analyses complexes |

Pour changer de modèle, modifiez la ligne dans `src/routes/api/analyze/+server.ts` :

```typescript
model: 'mistralai/mistral-7b-instruct', // Changez ici
```

---

## 💰 Estimation des Coûts

Avec **Mistral 7B** (~$0.0002 par analyse) :

| Volume | Coût estimé |
|--------|-------------|
| 100 analyses | $0.02 (2 centimes) |
| 1,000 analyses | $0.20 (20 centimes) |
| 10,000 analyses | $2.00 |
| 100,000 analyses | $20.00 |

**Conclusion :** Vous pouvez lancer votre MVP pour quelques dollars par mois !

---

## 🔍 Monitoring des Coûts

### Dashboard OpenRouter

1. Allez sur [openrouter.ai/activity](https://openrouter.ai/activity)
2. Vous verrez :
   - Nombre de requêtes
   - Coût total
   - Modèles utilisés
   - Graphiques de consommation

### Dashboard Admin (Épopée S3)

Notre application inclura un dashboard admin qui affichera :
- Coûts par utilisateur
- Coûts par jour/semaine/mois
- Nombre de requêtes
- Tokens consommés

---

## ⚠️ Sécurité

### ✅ Bonnes Pratiques

- ✅ **Ne jamais** committer la clé API dans Git
- ✅ Toujours utiliser des variables d'environnement
- ✅ Configurer des limites de budget sur OpenRouter
- ✅ Monitorer régulièrement l'usage

### 🔒 Protection

Sur OpenRouter, vous pouvez :
- Définir un **budget mensuel maximum**
- Activer des **alertes** par email
- **Révoquer** une clé à tout moment

---

## 🐛 Dépannage

### Erreur : "API IA non configurée"
- Vérifiez que `OPENROUTER_API_KEY` est bien dans votre `.env`
- Vérifiez qu'il n'y a pas d'espaces avant/après la clé
- La clé doit commencer par `sk-or-v1-`

### Erreur : "Insufficient credits"
- Ajoutez du crédit sur OpenRouter
- Vérifiez votre limite de budget

### Erreur : "Erreur de parsing de la réponse IA"
- L'IA n'a pas retourné du JSON valide
- Réessayez (c'est rare)
- Si ça persiste, contactez-nous pour améliorer le prompt

### Erreur 429 : "Rate limit exceeded"
- Vous avez dépassé la limite de requêtes
- Attendez quelques secondes
- Considérez un upgrade de plan sur OpenRouter

---

## 📚 Ressources

- [Documentation OpenRouter](https://openrouter.ai/docs)
- [Liste des modèles disponibles](https://openrouter.ai/models)
- [Calculateur de coûts](https://openrouter.ai/models)
- [Status page](https://status.openrouter.ai/)

---

## 🎯 Checklist de Configuration

- [ ] Compte OpenRouter créé
- [ ] Crédits ajoutés (au moins 2$)
- [ ] Clé API générée
- [ ] Clé ajoutée dans `.env` local
- [ ] Clé ajoutée sur Netlify
- [ ] Test local réussi
- [ ] Déploiement Netlify réussi
- [ ] Test en production réussi

---

**Une fois cette checklist complétée, votre intégration IA est 100% opérationnelle ! 🚀**

**Document créé le :** 10 novembre 2025

