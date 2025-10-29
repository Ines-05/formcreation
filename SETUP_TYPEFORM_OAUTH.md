# 🔐 Guide pas à pas - Configuration OAuth Typeform

## ✅ Ce dont vous avez besoin

- Un compte Typeform (gratuit ou payant)
- 10-15 minutes
- Accès à [Typeform Admin](https://admin.typeform.com)

---

## 📝 Étape 1 : Créer une application OAuth Typeform

### 1.1 Aller sur Typeform Admin

🔗 **Ouvrez** : https://admin.typeform.com/account#/section/tokens

Ou suivez ce chemin :
1. Connectez-vous à Typeform
2. Cliquez sur votre avatar en haut à droite
3. Sélectionnez **"Account Settings"**
4. Dans le menu de gauche, cliquez sur **"Personal tokens"** (ou "Developer apps")

### 1.2 Créer une nouvelle application

1. Dans la section **"Applications"**, cliquez sur **"Register a new application"** (ou "New app")

2. Remplissez les informations :

   **Nom de l'application** : `AI Form Builder`
   
   **Description** : `Application pour créer des formulaires automatiquement avec l'IA`
   
   **Redirect URI(s)** : 
   ```
   http://localhost:3000/api/auth/typeform/callback
   ```
   
   ⚠️ **IMPORTANT** : L'URI doit correspondre EXACTEMENT (pas de slash à la fin)

3. Cliquez sur **"Register"** ou **"Create"**

### 1.3 Récupérer vos identifiants

✅ Une fois créée, vous verrez vos identifiants OAuth :

```
Client ID : xxxxxxxxxxxxxxxxxxxxxxxxxx
Client Secret : xxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **NE PARTAGEZ JAMAIS** votre Client Secret publiquement !

📝 **Notez ces informations** - vous en aurez besoin pour le fichier `.env.local`

---

## 📝 Étape 2 : Comprendre les Scopes Typeform

Typeform utilise des **scopes** pour définir ce que votre app peut faire.

Pour notre projet, nous avons besoin de :

| Scope | Description | Pourquoi |
|-------|-------------|----------|
| `forms:read` | Lire les formulaires | Pour récupérer les formulaires créés |
| `forms:write` | Créer/modifier les formulaires | Pour créer de nouveaux formulaires |
| `responses:read` | Lire les réponses | Pour voir les statistiques |
| `accounts:read` | Lire les infos du compte | Pour identifier l'utilisateur |

Ces scopes sont **déjà configurés** dans le code (`src/app/api/auth/typeform/authorize/route.ts`).

---

## 📝 Étape 3 : Configurer votre application

### 3.1 Vérifier le fichier .env.local

Ouvrez votre fichier `.env.local` et vérifiez que ces lignes existent :

```bash
# Typeform OAuth
TYPEFORM_CLIENT_ID=votre_client_id_ici
TYPEFORM_CLIENT_SECRET=votre_client_secret_ici
TYPEFORM_REDIRECT_URI=http://localhost:3000/api/auth/typeform/callback
```

### 3.2 Ajouter vos identifiants

Remplacez les valeurs par vos vrais identifiants Typeform :

```bash
# Typeform OAuth
TYPEFORM_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
TYPEFORM_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxx
TYPEFORM_REDIRECT_URI=http://localhost:3000/api/auth/typeform/callback
```

⚠️ **Remplacez** `xxxxxxxxxxxxxxxxxxxxxxxxxx` par vos vraies valeurs !

### 3.3 Vérifier les autres variables

Assurez-vous que ces variables sont aussi configurées :

```bash
# Google AI (obligatoire pour l'IA)
GOOGLE_GENERATIVE_AI_API_KEY=votre_clé_ai

# URL de base
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# MongoDB (pour stocker les tokens)
MONGODB_URI=mongodburi
# OU MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Encryption (obligatoire pour chiffrer les tokens)
ENCRYPTION_KEY=votre_clé_de_32_caractères_hex
```

---

## 📝 Étape 4 : Vérifier MongoDB

### Option A : MongoDB Local (Recommandé pour débuter)

**Windows :**

1. MongoDB doit être installé et démarré
2. Par défaut sur `mongodb://localhost:27017`

**Vérifier si MongoDB tourne :**
```bash
# Windows
net start | findstr MongoDB

# Mac/Linux
brew services list | grep mongodb
# ou
sudo systemctl status mongodb
```

**Démarrer MongoDB si nécessaire :**
```bash
# Windows
net start MongoDB

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongodb
```

### Option B : MongoDB Atlas (Cloud gratuit)

Si vous préférez le cloud :

1. Connectez-vous sur https://www.mongodb.com/cloud/atlas
2. Votre cluster doit être créé et actif
3. L'URI de connexion doit être dans `.env.local`

---

## 📝 Étape 5 : Vérifier le code d'intégration

### 5.1 Routes API déjà créées ✅

Vérifiez que ces fichiers existent :

```
src/app/api/auth/typeform/
├── authorize/route.ts      ✅ Génère l'URL OAuth
├── callback/route.ts       ✅ Gère le retour OAuth
├── status/route.ts         ✅ Vérifie la connexion
└── disconnect/route.ts     ✅ Déconnecte le compte
```

### 5.2 Composant de connexion ✅

```
src/components/TypeformConnect.tsx ✅
```

### 5.3 Bibliothèque Typeform ✅

```
src/lib/typeform.ts          ✅ Fonctions API Typeform
src/lib/typeform-tokens.ts   🔴 À CRÉER
```

---

## 📝 Étape 6 : Créer la bibliothèque de gestion des tokens

⚠️ **Fichier manquant** - Je vais le créer maintenant :

**Fichier à créer** : `src/lib/typeform-tokens.ts`

Ce fichier contiendra :
- `saveTypeformTokens()` - Sauvegarder les tokens (chiffrés)
- `getTypeformTokens()` - Récupérer les tokens (déchiffrés)
- `hasValidTypeformTokens()` - Vérifier la validité
- `deleteTypeformTokens()` - Supprimer les tokens
- `refreshTypeformAccessToken()` - Rafraîchir le token (si supporté)

---

## 📝 Étape 7 : Mettre à jour les routes callback

### 7.1 Route callback

Le fichier `src/app/api/auth/typeform/callback/route.ts` doit :
1. Échanger le code OAuth contre un access token
2. Sauvegarder le token dans MongoDB (chiffré)
3. Fermer la popup et notifier le parent

### 7.2 Route status

Le fichier `src/app/api/auth/typeform/status/route.ts` doit :
1. Vérifier si l'utilisateur a des tokens valides dans MongoDB
2. Retourner `{ isConnected: true/false }`

---

## 📝 Étape 8 : Tester la connexion

### 8.1 Démarrer l'application

```bash
npm install
npm run dev
```

### 8.2 Tester OAuth Typeform

1. Ouvrez http://localhost:3000

2. Dans le chat, tapez : **"Je veux créer un formulaire"**

3. Choisissez **"Typeform"** dans le sélecteur

4. Cliquez sur **"Se connecter avec Typeform"**

5. Une popup OAuth Typeform devrait s'ouvrir

6. **Autorisez** l'application

7. La popup se ferme et vous êtes connecté ! ✅

---

## 📝 Étape 9 : Créer la route de création de formulaire

### 9.1 Route API

**Fichier** : `src/app/api/typeform/create/route.ts` ✅ (déjà créé)

Cette route doit :
1. Récupérer les tokens Typeform de l'utilisateur
2. Créer le formulaire via l'API Typeform
3. Retourner le lien du formulaire

### 9.2 Fonction de création

**Fichier** : `src/lib/typeform.ts` ✅ (déjà créé)

Contient la fonction `createTypeform()` qui appelle l'API Typeform.

---

## ❓ Problèmes courants

### Erreur : "redirect_uri_mismatch"

**Cause** : L'URI de redirection ne correspond pas

**Solution** :
1. Vérifiez dans Typeform Admin → Applications :
   - URI de redirection = `http://localhost:3000/api/auth/typeform/callback`
2. Vérifiez dans `.env.local` :
   - `TYPEFORM_REDIRECT_URI=http://localhost:3000/api/auth/typeform/callback`
3. Relancez `npm run dev`

### Erreur : "Invalid client credentials"

**Cause** : Client ID ou Secret incorrect

**Solution** :
1. Retournez dans Typeform Admin
2. Copiez à nouveau le Client ID et Secret
3. Collez dans `.env.local`
4. Relancez `npm run dev`

### Erreur : "MongoDB connection failed"

**Cause** : MongoDB n'est pas démarré

**Solution** :
```bash
# Windows
net start MongoDB

# Mac/Linux
brew services start mongodb-community
# ou
sudo systemctl start mongodb
```

### Erreur : "Encryption key not configured"

**Cause** : La clé de chiffrement n'est pas définie

**Solution** :
1. Générez une clé de 32 octets en hexadécimal :
   ```bash
   # Windows PowerShell
   -join ((48..57) + (97..102) | Get-Random -Count 64 | % {[char]$_})
   
   # Mac/Linux
   openssl rand -hex 32
   ```

2. Ajoutez dans `.env.local` :
   ```bash
   ENCRYPTION_KEY=votre_clé_générée_ici
   ```

---

## 🎉 Félicitations !

Vous avez configuré OAuth Typeform ! 🚀

### Prochaines étapes :

1. ✅ **OAuth Typeform configuré**
2. 🔨 **Créer `typeform-tokens.ts`** (je vais le faire maintenant)
3. 🔨 **Compléter les routes callback** (mise à jour nécessaire)
4. 🎯 **Activer Typeform dans l'interface**
5. 🏗️ **Créer votre premier formulaire Typeform !**

---

## 📚 Ressources utiles

- [Typeform OAuth Documentation](https://www.typeform.com/developers/get-started/applications/)
- [Typeform Create API](https://www.typeform.com/developers/create/)
- [Typeform Scopes](https://www.typeform.com/developers/get-started/scopes/)

---

## 🆘 Besoin d'aide ?

Si vous rencontrez des problèmes :

1. Vérifiez que le Redirect URI correspond exactement
2. Vérifiez que MongoDB est démarré
3. Vérifiez que la clé de chiffrement est définie
4. Consultez les logs de la console (`npm run dev`)

---

**Temps estimé : 15-20 minutes** ⏱️

Bonne chance ! 🍀

---

## 🔄 Ce qui reste à faire (je vais le faire maintenant)

1. Créer `src/lib/typeform-tokens.ts`
2. Mettre à jour `src/app/api/auth/typeform/callback/route.ts`
3. Mettre à jour `src/app/api/auth/typeform/status/route.ts`
4. Activer Typeform dans `src/app/page.tsx`
