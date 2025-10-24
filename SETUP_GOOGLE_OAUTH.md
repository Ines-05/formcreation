# 🔐 Guide pas à pas - Configuration OAuth Google

## ✅ Ce dont vous avez besoin

- Un compte Google (Gmail)
- 10-15 minutes
- Accès à [Google Cloud Console](https://console.cloud.google.com)

---

## 📝 Étape 1 : Créer un projet Google Cloud

### 1.1 Aller sur Google Cloud Console

🔗 **Ouvrez** : https://console.cloud.google.com

### 1.2 Créer un nouveau projet

1. Cliquez sur le **sélecteur de projet** (en haut à gauche, à côté de "Google Cloud")
2. Cliquez sur **"NOUVEAU PROJET"** (New Project)
3. Remplissez :
   - **Nom du projet** : `AI Form Builder` (ou le nom que vous voulez)
   - **Organisation** : Laissez par défaut (No organization)
4. Cliquez sur **"CRÉER"** (Create)

⏱️ Attendez quelques secondes que le projet soit créé.

5. **Sélectionnez le projet** que vous venez de créer (il devrait apparaître dans le sélecteur)

---

## 📝 Étape 2 : Activer les APIs nécessaires

### 2.1 Activer Google Forms API

1. Dans le menu ☰ (hamburger, en haut à gauche), allez dans :
   - **APIs et services** → **Bibliothèque** (Library)

2. Dans la barre de recherche, tapez : `Google Forms API`

3. Cliquez sur **"Google Forms API"**

4. Cliquez sur le bouton **"ACTIVER"** (Enable)

⏱️ Attendez que l'API soit activée (quelques secondes)

### 2.2 Activer Google Drive API

1. Retournez à la **Bibliothèque** (cliquez sur "Bibliothèque" dans le menu de gauche)

2. Cherchez : `Google Drive API`

3. Cliquez dessus et cliquez **"ACTIVER"** (Enable)

---

## 📝 Étape 3 : Configurer l'écran de consentement OAuth

### 3.1 Accéder à l'écran de consentement

1. Dans le menu de gauche, cliquez sur :
   - **APIs et services** → **Écran de consentement OAuth** (OAuth consent screen)

### 3.2 Choisir le type d'utilisateur

1. Sélectionnez **"Externe"** (External)
   - Cela permet à n'importe quel utilisateur avec un compte Google de se connecter
   
2. Cliquez sur **"CRÉER"** (Create)

### 3.3 Remplir les informations de l'application

**Page 1 : Informations sur l'application**

1. **Nom de l'application** : `AI Form Builder`

2. **E-mail d'assistance utilisateur** : Votre adresse Gmail

3. **Logo de l'application** : (Optionnel) Vous pouvez sauter cette étape

4. **Domaine de l'application** : (Optionnel) Laissez vide pour l'instant

5. **Domaines autorisés** : (Optionnel) Laissez vide

6. **Coordonnées du développeur** : Votre adresse Gmail

7. Cliquez sur **"ENREGISTRER ET CONTINUER"** (Save and Continue)

**Page 2 : Champs d'application (Scopes)**

1. Cliquez sur **"AJOUTER OU SUPPRIMER DES CHAMPS D'APPLICATION"** (Add or Remove Scopes)

2. Dans la liste, recherchez et **cochez** :
   - ✅ `https://www.googleapis.com/auth/forms` - Google Forms
   - ✅ `https://www.googleapis.com/auth/drive.file` - Google Drive (fichiers créés)
   - ✅ `https://www.googleapis.com/auth/userinfo.email` - Email de l'utilisateur

3. Cliquez sur **"METTRE À JOUR"** (Update)

4. Cliquez sur **"ENREGISTRER ET CONTINUER"** (Save and Continue)

**Page 3 : Utilisateurs test**

1. Cliquez sur **"AJOUTER DES UTILISATEURS"** (Add Users)

2. Ajoutez **votre adresse Gmail** (pour pouvoir tester)

3. Cliquez sur **"AJOUTER"** (Add)

4. Cliquez sur **"ENREGISTRER ET CONTINUER"** (Save and Continue)

**Page 4 : Résumé**

1. Vérifiez les informations

2. Cliquez sur **"RETOUR AU TABLEAU DE BORD"** (Back to Dashboard)

---

## 📝 Étape 4 : Créer les identifiants OAuth

### 4.1 Accéder à la page Identifiants

1. Dans le menu de gauche, cliquez sur :
   - **APIs et services** → **Identifiants** (Credentials)

### 4.2 Créer un ID client OAuth

1. Cliquez sur **"+ CRÉER DES IDENTIFIANTS"** (+ Create Credentials) en haut

2. Sélectionnez **"ID client OAuth"** (OAuth client ID)

3. **Type d'application** : Sélectionnez **"Application Web"** (Web application)

4. **Nom** : `AI Form Builder - Web Client`

5. **Origines JavaScript autorisées** :
   - Cliquez sur **"+ AJOUTER UN URI"**
   - Ajoutez : `http://localhost:3000`

6. **URI de redirection autorisés** :
   - Cliquez sur **"+ AJOUTER UN URI"**
   - Ajoutez : `http://localhost:3000/api/auth/google/callback`

7. Cliquez sur **"CRÉER"** (Create)

### 4.3 Récupérer vos identifiants

✅ Une popup apparaît avec vos identifiants !

**IMPORTANT** : Notez ces informations :

```
Client ID : xxxxx.apps.googleusercontent.com
Secret du client : xxxxxxxxxx
```

⚠️ **NE PARTAGEZ JAMAIS** votre Client Secret publiquement !

---

## 📝 Étape 5 : Configurer votre application

### 5.1 Créer le fichier .env.local

1. Dans votre projet, copiez `.env.example` vers `.env.local` :

```bash
# Windows PowerShell
Copy-Item .env.example .env.local

# Ou manuellement :
# Copiez le fichier .env.example
# Renommez la copie en .env.local
```

### 5.2 Ajouter les identifiants

Ouvrez `.env.local` et ajoutez vos identifiants Google :

```bash
# Google OAuth (pour Google Forms)
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxxxxxxx
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

⚠️ **Remplacez** `xxxxx` par vos vraies valeurs !

### 5.3 Vérifier les autres variables

Assurez-vous que ces variables sont aussi configurées :

```bash
# Google AI (obligatoire pour l'IA)
GOOGLE_GENERATIVE_AI_API_KEY=votre_clé_ai

# URL de base
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# MongoDB (pour stocker les tokens)
MONGODB_URI=mongodb://localhost:27017/ai-form-builder
```

---

## 📝 Étape 6 : Installer et configurer MongoDB

### Option A : MongoDB Local (Recommandé pour débuter)

**Windows :**

1. Téléchargez MongoDB Community Server :
   - 🔗 https://www.mongodb.com/try/download/community

2. Installez avec les paramètres par défaut

3. MongoDB se lance automatiquement sur `mongodb://localhost:27017`

**Mac (avec Homebrew) :**

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu) :**

```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### Option B : MongoDB Atlas (Cloud gratuit)

Si vous préférez le cloud :

1. Créez un compte sur https://www.mongodb.com/cloud/atlas
2. Créez un cluster gratuit (M0)
3. Créez un utilisateur de base de données
4. Autorisez votre IP
5. Copiez l'URI de connexion dans `.env.local`

---

## 📝 Étape 7 : Tester la connexion

### 7.1 Démarrer l'application

```bash
npm install
npm run dev
```

### 7.2 Tester OAuth Google

1. Ouvrez http://localhost:3000

2. Dans le chat, tapez : **"Je veux créer un formulaire"**

3. Choisissez **"Google Forms"**

4. Cliquez sur **"Se connecter avec Google"**

5. Une popup OAuth Google devrait s'ouvrir

6. Sélectionnez votre compte Google

7. Autorisez l'application

8. La popup se ferme et vous êtes connecté ! ✅

---

## ❓ Problèmes courants

### Erreur : "redirect_uri_mismatch"

**Cause** : L'URI de redirection ne correspond pas

**Solution** :
1. Vérifiez que dans Google Cloud Console → Identifiants :
   - URI de redirection = `http://localhost:3000/api/auth/google/callback`
2. Vérifiez que dans `.env.local` :
   - `GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback`
3. Relancez `npm run dev`

### Erreur : "Access blocked: This app's request is invalid"

**Cause** : Scopes non configurés

**Solution** :
1. Retournez dans **Écran de consentement OAuth**
2. Ajoutez les scopes manquants (voir Étape 3.3)

### Erreur : "MongoDB connection failed"

**Cause** : MongoDB n'est pas démarré

**Solution** :
```bash
# Windows (si installé comme service)
net start MongoDB

# Mac/Linux
brew services start mongodb-community
# ou
sudo systemctl start mongodb
```

---

## 🎉 Félicitations !

Vous avez maintenant configuré OAuth Google ! 🚀

### Prochaines étapes :

1. ✅ **OAuth Google configuré**
2. 📝 Compléter les fonctions de sauvegarde MongoDB (voir `IMPLEMENTATION.md`)
3. 🎯 Configurer Typeform OAuth (optionnel)
4. 🏗️ Créer votre premier formulaire Google !

---

## 📚 Ressources utiles

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Forms API](https://developers.google.com/forms/api)
- [MongoDB Documentation](https://www.mongodb.com/docs/)

---

## 🆘 Besoin d'aide ?

Si vous rencontrez des problèmes :

1. Vérifiez que toutes les APIs sont activées
2. Vérifiez que les URIs correspondent exactement
3. Vérifiez que MongoDB est démarré
4. Consultez les logs de la console (`npm run dev`)

---

**Temps estimé : 15-20 minutes** ⏱️

Bonne chance ! 🍀
