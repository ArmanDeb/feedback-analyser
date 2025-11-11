# 🔐 Alternatives d'Authentification pour SvelteKit

**Problème :** Stack Auth est conçu pour Next.js et n'est pas compatible avec SvelteKit.

**Erreur rencontrée :**
```
Cannot find module 'next/navigation' 
imported from @stackframe/stack
```

---

## 🚨 Situation Actuelle

### Ce qui fonctionne ✅
- ✅ Application en **mode développement**
- ✅ Dashboard utilisateur fonctionnel
- ✅ Dashboard admin avec utilisateur fictif
- ✅ Analyse IA opérationnelle
- ✅ Sauvegarde BDD
- ✅ Monitoring des coûts

### Ce qui ne fonctionne pas ❌
- ❌ Stack Auth (incompatibilité SvelteKit)
- ❌ Authentification réelle
- ❌ Gestion des sessions utilisateurs

---

## 🎯 Solutions Recommandées

### **Option 1 : Auth.js (NextAuth) - RECOMMANDÉ** ⭐

**Avantages :**
- ✅ Support officiel SvelteKit
- ✅ OAuth providers (Google, GitHub, etc.)
- ✅ Magic links
- ✅ Documentation complète
- ✅ Grande communauté

**Installation :**
```bash
npm install @auth/core @auth/sveltekit
```

**Documentation :** [https://authjs.dev/getting-started/installation?framework=sveltekit](https://authjs.dev/getting-started/installation?framework=sveltekit)

**Configuration de base :**

```typescript
// src/hooks.server.ts
import { SvelteKitAuth } from "@auth/sveltekit"
import GitHub from "@auth/sveltekit/providers/github"
import Google from "@auth/sveltekit/providers/google"
 
export const { handle } = SvelteKitAuth({
  providers: [
    GitHub({ 
      clientId: process.env.GITHUB_ID, 
      clientSecret: process.env.GITHUB_SECRET 
    }),
    Google({ 
      clientId: process.env.GOOGLE_ID, 
      clientSecret: process.env.GOOGLE_SECRET 
    })
  ],
})
```

---

### **Option 2 : Lucia Auth** 🌙

**Avantages :**
- ✅ Conçu spécifiquement pour SvelteKit
- ✅ Léger et simple
- ✅ Support PostgreSQL (Prisma)
- ✅ Type-safe

**Installation :**
```bash
npm install lucia @lucia-auth/adapter-prisma
```

**Documentation :** [https://lucia-auth.com/](https://lucia-auth.com/)

**Configuration de base :**

```typescript
// src/lib/server/auth.ts
import { lucia } from "lucia";
import { sveltekit } from "lucia/middleware";
import { prisma } from "@lucia-auth/adapter-prisma";
import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

export const auth = lucia({
  adapter: prisma(client),
  env: "DEV", // "PROD" en production
  middleware: sveltekit(),
  getUserAttributes: (data) => {
    return {
      email: data.email,
      role: data.role
    };
  }
});
```

---

### **Option 3 : Auth Maison (Email/Password)** 🔨

**Avantages :**
- ✅ Contrôle total
- ✅ Pas de dépendances externes
- ✅ Simple pour commencer

**Inconvénients :**
- ❌ Plus de code à écrire
- ❌ Sécurité à gérer manuellement
- ❌ Pas d'OAuth

**Stack nécessaire :**
- bcrypt pour hasher les mots de passe
- jsonwebtoken pour les sessions
- Prisma pour la BDD

**Schéma Prisma minimal :**

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  role          String   @default("user")
  createdAt     DateTime @default(now())
  
  sessions      Session[]
  analyses      Analysis[]
  apiLogs       ApiLog[]
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  expiresAt DateTime
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## 📊 Comparaison

| Critère | Auth.js | Lucia | Maison |
|---------|---------|-------|--------|
| **Facilité** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **OAuth** | ✅ | ❌ | ❌ |
| **Type-safe** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Communauté** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | - |
| **Documentation** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | - |
| **Setup** | 30 min | 45 min | 2-3h |

---

## 🎯 Ma Recommandation

### **Pour ce projet : Auth.js** ⭐

**Raisons :**
1. ✅ OAuth natif (Google, GitHub) = meilleure UX
2. ✅ Magic links = pas de mot de passe à gérer
3. ✅ Documentation excellente
4. ✅ Maintenance active
5. ✅ Compatible Neon PostgreSQL

**Setup rapide :**

```bash
# 1. Installer
npm install @auth/core @auth/sveltekit

# 2. Créer src/hooks.server.ts
# 3. Configurer les providers
# 4. Ajouter les variables d'environnement
# 5. Tester !
```

---

## 🔧 Migration depuis Stack Auth

### Étapes

**1. Supprimer Stack Auth**
```bash
npm uninstall @stackframe/stack
```

**2. Installer Auth.js**
```bash
npm install @auth/core @auth/sveltekit
```

**3. Configurer `src/hooks.server.ts`**

```typescript
import { SvelteKitAuth } from "@auth/sveltekit"
import GoogleProvider from "@auth/sveltekit/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "$lib/db"
 
export const { handle } = SvelteKitAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ],
  callbacks: {
    session({ session, user }) {
      session.user.role = user.role // Ajouter le rôle
      return session
    }
  }
})
```

**4. Mettre à jour le schéma Prisma**

Auth.js nécessite des tables spécifiques :

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  role          String    @default("user")
  
  accounts      Account[]
  sessions      Session[]
  analyses      Analysis[]
  apiLogs       ApiLog[]
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  
  @@unique([identifier, token])
}
```

**5. Pousser le schéma**
```bash
npx prisma db push
```

**6. Mettre à jour `src/routes/admin/+page.server.ts`**

```typescript
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.getSession();
  
  if (!session?.user) {
    throw redirect(303, '/auth/signin');
  }
  
  // Vérifier le rôle admin
  if (session.user.role !== 'admin') {
    throw error(403, 'Accès refusé');
  }
  
  // Charger les données...
};
```

**7. Variables d'environnement**

`.env` :
```env
# Auth.js
AUTH_SECRET="votre-secret-ici" # Générer avec: openssl rand -base64 32
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="xxx"

# Optionnel
GITHUB_ID="xxx"
GITHUB_SECRET="xxx"
```

---

## ⏱️ Temps d'Implémentation Estimé

- **Auth.js :** 2-3 heures
- **Lucia Auth :** 3-4 heures
- **Auth maison :** 6-8 heures

---

## 🚀 Prochaines Étapes

### Court terme (aujourd'hui)
1. Supprimer Stack Auth
2. Mode développement avec utilisateur fictif (déjà fait ✅)
3. Application fonctionnelle sans auth réelle

### Moyen terme (cette semaine)
1. Choisir Auth.js ou Lucia
2. Implémenter l'authentification
3. Tester OAuth (Google)
4. Déployer

### Long terme
1. Ajouter 2FA
2. Logs de connexion
3. Gestion des rôles avancée

---

## 📚 Ressources

- [Auth.js Documentation](https://authjs.dev/)
- [Lucia Auth Guide](https://lucia-auth.com/guidebook/)
- [SvelteKit Auth Tutorial](https://kit.svelte.dev/docs/authentication)
- [Prisma Auth Best Practices](https://www.prisma.io/docs/guides/database/authentication)

---

**Conclusion :** Stack Auth n'est pas compatible. Auth.js est la meilleure alternative pour SvelteKit ! 🎯

