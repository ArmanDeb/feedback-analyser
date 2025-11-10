# Plan de Projet Détaillé (Kanban)

Voici la structure de votre base de données de tâches. Vous pouvez créer un Kanban dans Notion et utiliser les "Tags" (propriété "Select" ou "Multi-Select") pour organiser les colonnes par "Épopée" (Semaine) ou par "Statut" (À Faire, En Cours, Fait).

### Propriétés de la Base de Données (Tâches)

- **Tâche** (Titre)
- **Épopée** (Select) : S1, S2, S3, S4, S5, S6, S7
- **Statut** (Statut) : À Faire, En Cours, Fait
- **Priorité** (Select) : Critique (MVP), Important, Optionnel
- **Domaine** (Multi-Select) : Backend, Frontend, IA, Admin, DevOps, Légal, Documentation

---

### Épopée S1 : Fondation, Stack & Authentification

| **Tâche** | **Domaine** | **Priorité** | **Notes** |
| --- | --- | --- | --- |
| Initialiser le projet SvelteKit | Frontend | Critique (MVP) | `npm create svelte@latest` |
| Créer le repo GitHub (main, dev) | DevOps | Critique (MVP) | Configurer `main` pour la prod. |
| Connecter le repo à Netlify | DevOps | Critique (MVP) | Activer le déploiement automatique depuis `main`. |
| Choisir et configurer la BDD | Backend | Critique (MVP) | Ex: Créer un compte Neon (Postgres). |
| Configurer Clerk pour l'authentification | Backend | Critique (MVP) | Intégrer le SDK SvelteKit de Clerk. |
| Sauvegarder les clés (Netlify, Clerk, Neon) | DevOps | Critique (MVP) | Utiliser les variables d'environnement Netlify. |
| Créer le schéma de la BDD (v1) | Backend | Critique (MVP) | Table `users` (liée à Clerk), table `analyses`. |
| Créer les pages squelettes | Frontend | Critique (MVP) | `/` (Landing), `/login`, `/dashboard`. |
| **Livrable :** Démarrer Document de Suivi S1 | Documentation | Critique (MVP) | Objectifs, choix techniques (SvelteKit, Netlify, Clerk, Neon). |

### Épopée S2 : Intégration IA & Fonctionnalité Cœur

| **Tâche** | **Domaine** | **Priorité** | **Notes** |
| --- | --- | --- | --- |
| Créer le compte OpenRouter | IA | Critique (MVP) | Obtenir la clé API (budget 2$). |
| Créer la route API SvelteKit (backend) | Backend | Critique (MVP) | Ex: `/api/analyze`. C'est ici que la clé OpenRouter sera cachée. |
| Appel "Hello World" à OpenRouter | IA | Critique (MVP) | Confirmer la connexion (ex: Mistral 7B). |
| Créer le composant "Analyseur" | Frontend | Critique (MVP) | Un `<textarea>` et un bouton "Analyser". |
| **Prompt Engineering (v1)** | IA | Critique (MVP) | Créer le prompt système demandant un JSON structuré. |
| Connecter le frontend à la route API | Frontend | Critique (MVP) | Gérer l'état de chargement (loading spinner). |
| Parser la réponse JSON de l'IA | Frontend | Critique (MVP) | Utiliser `try...catch` sur `JSON.parse`. |
| Afficher les résultats bruts (v1) | Frontend | Critique (MVP) | Juste afficher le JSON pour valider. |
| Sauvegarder l'analyse dans la BDD | Backend | Critique (MVP) | Lier l'analyse à l'ID utilisateur (de Clerk). |
| **Livrable :** Document de Suivi S2 | Documentation | Critique (MVP) | URL prod, 1er appel IA fonctionnel. |

### Épopée S3 : Dashboard Admin & Monitoring Coûts

| **Tâche** | **Domaine** | **Priorité** | **Notes** |
| --- | --- | --- | --- |
| Sécuriser le Dashboard Admin | Backend | Critique (MVP) | Route accessible si `user.role === 'admin'`. |
| Créer la page Dashboard Admin | Admin | Critique (MVP) | Interface basique. |
| Mocker la fonction de coût | Backend | Critique (MVP) | Simuler le coût avant d'avoir les vrais chiffres. |
| **Logguer chaque appel API (BDD)** | Backend | Critique (MVP) | Stocker `user_id`, `timestamp`, `model_used`, `tokens_in`, `tokens_out`. |
| Créer le service de calcul des coûts | Backend | Critique (MVP) | Fonction qui lit la table de logs et additionne les coûts. |
| Afficher les coûts (Dashboard Admin) | Admin | Critique (MVP) | Tableau simple des coûts par utilisateur et total. |
| **Livrable :** Document de Suivi S3 | Documentation | Critique (MVP) | Screenshots du dashboard monitoring. |
| **Livrable :** Configurer la CI/CD (GitHub Actions) | DevOps | Critique (MVP) | Lint + build sur PR. Déploiement sur `main` (via Netlify). |

### Épopée S4 : Robustesse & UX

| **Tâche** | **Domaine** | **Priorité** | **Notes** |
| --- | --- | --- | --- |
| Améliorer l'affichage des résultats | Frontend | Important | Utiliser des graphiques (ex: Chart.js) ou des cartes pour les thèmes. |
| **Prompt Engineering (v2)** | IA | Important | Optimiser le prompt pour la fiabilité (gestion des cas vides). |
| Gérer les erreurs IA | Backend | Critique (MVP) | Timeouts OpenRouter, réponses non-JSON, erreurs 500. |
| Gérer les erreurs utilisateur | Frontend | Critique (MVP) | Feedback vide, feedback trop long (limite de tokens). |
| Implémenter le Caching (optionnel) | Backend | Optionnel | Si 2 utilisateurs collent le même texte, réutiliser le résultat. |
| Afficher l'historique des analyses (User) | Frontend | Important | L'utilisateur voit ses analyses passées. |
| **Livrable :** Document de Suivi S4 | Documentation | Critique (MVP) | Explication de la gestion des erreurs. |

### Épopée S5 : Landing Page, Pricing & Légal

| **Tâche** | **Domaine** | **Priorité** | **Notes** |
| --- | --- | --- | --- |
| Rédiger le contenu de la Landing Page | Frontend | Critique (MVP) | Problème, Solution, Bénéfices, CTA. |
| Intégrer le design de la Landing Page | Frontend | Critique (MVP) | Utiliser un template ou un design simple. |
| **Calculer les coûts réels (Marge)** | Admin | Critique (MVP) | Utiliser le dashboard admin pour définir les paliers. |
| Définir les 2 paliers de Pricing | Documentation | Critique (MVP) | Free (ex: 3 analyses/mois), Pro (ex: 50/mois). |
| Afficher la page Pricing | Frontend | Critique (MVP) | (Pas besoin de système de paiement réel pour le MVP). |
| Rédiger les Mentions Légales & CGU | Légal | Critique (MVP) | Utiliser des générateurs et adapter. |
| Rédiger la Politique de Confidentialité (RGPD) | Légal | Critique (MVP) | Mentionner Clerk, Neon, OpenRouter. |
| Ajouter la bannière Cookies | Légal | Critique (MVP) | |
| **Livrable :** Document de Suivi S5 | Documentation | Critique (MVP) | Stratégie de pricing détaillée. |

### Épopée S6 : Finitions UX & Tests

| **Tâche** | **Domaine** | **Priorité** | **Notes** |
| --- | --- | --- | --- |
| Polish UI/UX (CSS) | Frontend | Important | Rendre l'application propre et professionnelle. |
| Tester le parcours utilisateur complet | Frontend | Important | Inscription -> Login -> Dashboard -> Analyse -> Historique. |
| Tester la gestion des erreurs | Backend | Important | Que se passe-t-il si OpenRouter est hors-ligne ? |
| Mettre à jour le README | Documentation | Critique (MVP) | Instructions de lancement local + lien URL prod. |
| Commencer le Rapport PDF final (CDC) | Documentation | Important | Commencer à assembler les sections (Concept, Acteurs). |
| **Livrable :** Document de Suivi S6 | Documentation | Critique (MVP) | Bilan des tests, polish. |

### Épopée S7 : Rapport Final & Préparation Démo

| **Tâche** | **Domaine** | **Priorité** | **Notes** |
| --- | --- | --- | --- |
| Finaliser le Rapport PDF | Documentation | Critique (MVP) | Inclure schémas, justification modèle IA, calcul de marge. |
| Préparer le scénario de Démo | Documentation | Critique (MVP) | Parcours utilisateur type (inscription, analyse, dashboard coûts). |
| Vérifier tous les livrables | Documentation | Critique (MVP) | URL prod OK? Repo accessible? Rapport PDF complet? |
| Nettoyer le code (linting) | DevOps | Important | Assurer la propreté du repo. |
| **Livrable :** Rapport PDF Final | Documentation | Critique (MVP) | À remettre avant la deadline. |
| **Livrable :** Document de Suivi S7 | Documentation | Critique (MVP) | Bilan final du projet. |

### Niveau 1 : Améliorations de l'UX (Post-MVP)

Ces fonctionnalités améliorent la valeur du résultat de l'analyse, sans ajouter de complexité IA majeure.

1. **Comparaison d'Analyses (Vue "Delta")**
    - **Description :** Permettre à l'utilisateur de sélectionner deux analyses (ex: "Feedback Janvier" vs "Feedback Février"). L'interface met en surbrillance les **nouveaux** points de friction, les problèmes **résolus** (disparus), et les demandes de fonctionnalités **récurrentes**.
    - **Différenciation :** Vous ne fournissez plus seulement une photo, mais une vidéo de l'évolution du sentiment client. Cela transforme l'outil d'un simple rapporteur à un outil de suivi stratégique.
    - **Implémentation :** Pas de coût IA supplémentaire. C'est une simple logique de backend/frontend (comparer deux structures JSON).
2. **Priorisation (Détection d'Urgence)**
    - **Description :** Modifier le prompt IA pour ajouter un champ `urgence: true/false` ou `priorite: haute/moyenne/basse`. L'IA doit être entraînée (via le prompt) à identifier les problèmes bloquants (ex: "impossible de payer", "ne peut pas se connecter") comme "haute priorité".
    - **Différenciation :** La plupart des concurrents donnent un score de sentiment global. Vous donnez un **plan d'action priorisé**. L'utilisateur sait immédiatement quel feu éteindre.
    - **Implémentation :** Coût IA marginal (quelques tokens de plus). Pur "prompt engineering".

### Niveau 2 : Différenciation "Game-Changer"

Ces fonctionnalités changent la nature de votre produit, le faisant passer d'un "outil" (passif) à un "service" (actif).

1. **Sources de Données (Suppression du Copier-Coller)**
    - **Description :** C'est la friction principale de votre MVP. L'utilisateur doit *aller chercher* le feedback. Supprimez cette étape.
        - **Version 1 (Webhook) :** Fournir à chaque utilisateur une URL de webhook unique. Il peut la coller dans ses outils (Typeform, formulaires de site web...). Chaque nouvelle soumission est automatiquement envoyée et analysée.
        - **Version 2 (API) :** Permettre de connecter des sources via API (ex: Twitter/X, Reddit, flux RSS d'avis App Store). L'application "poll" (vérifie) ces sources toutes les heures et analyse les nouveaux feedbacks.
    - **Différenciation :** C'est la proposition de valeur la plus forte. Vous automatisez l'ensemble du processus. L'utilisateur n'a qu'à *lire* le rapport, plus à *faire* l'analyse.
    - **Implémentation :** Le webhook est simple (une route API SvelteKit). L'intégration d'API est plus complexe mais définit le produit "Pro".
2. **Générateur de Réponses (Boucler la boucle)**
    - **Description :** Dans le rapport d'analyse, à côté d'un point de friction (ex: "Bug de connexion reporté par l'utilisateur X"), ajouter un bouton "Générer une réponse".
    - **Fonctionnement :** Un second appel IA (toujours avec un modèle léger) prend le feedback spécifique en contexte et génère 2-3 brouillons de réponse empathiques et professionnelles que l'utilisateur peut copier (ex: "Merci d'avoir signalé ce bug de connexion. Nous examinons le problème...").
    - **Différenciation :** Vous ne faites pas que l'analyse, vous accélérez l'action. Vous faites gagner du temps non seulement sur la lecture mais aussi sur la gestion du support client.
    - **Implémentation :** Coût IA très faible. Un nouveau prompt simple.
