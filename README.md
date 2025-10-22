# AI Form Builder

Un prototype d'application Next.js 15 qui utilise l'IA générative de Google pour créer automatiquement des formulaires dynamiques à partir de descriptions en langage naturel.

## ✨ Fonctionnalités

- 🤖 **Génération IA** : Créez des formulaires en décrivant simplement ce dont vous avez besoin
- 🎨 **Interface moderne** : Design élégant avec TailwindCSS et shadcn/ui
- 📝 **Formulaires dynamiques** : Support de tous les types de champs (text, email, select, radio, etc.)
- 💾 **Stockage local** : Sauvegarde des réponses en JSON
- ⚡ **Next.js 15** : Dernière version avec App Router et TypeScript

## 🚀 Installation

1. **Clonez le projet et installez les dépendances** :
   ```bash
   npm install
   ```

2. **Configurez votre clé API Google Generative AI** :
   - Rendez-vous sur [Google AI Studio](https://aistudio.google.com/apikey)
   - Créez une nouvelle clé API
   - Copiez `.env.local.example` vers `.env.local`
   - Ajoutez votre clé API :
     ```
     GOOGLE_GENERATIVE_AI_API_KEY=votre_cle_api_ici
     ```

3. **Lancez l'application** :
   ```bash
   npm run dev
   ```

4. **Ouvrez votre navigateur** sur [http://localhost:3000](http://localhost:3000)

## 🎯 Utilisation

1. **Décrivez votre formulaire** en langage naturel :
   - "Inscription à un atelier de cuisine"
   - "Questionnaire de satisfaction client"
   - "Formulaire de contact pour un site web"

2. **L'IA génère automatiquement** :
   - Titre et description du formulaire
   - Champs appropriés avec types et validations
   - Options pour les champs sélection/radio

3. **Testez et utilisez** :
   - Remplissez le formulaire généré
   - Les réponses sont sauvegardées dans `/data/form-responses.json`

## 🏗️ Architecture

```
src/
├── app/                    # Pages Next.js App Router
│   ├── api/               # Routes API
│   │   ├── generate-form/ # Génération de formulaires avec IA
│   │   └── submit-form/   # Soumission des réponses
│   └── page.tsx           # Page principale
├── components/            # Composants React
│   ├── ui/               # Composants shadcn/ui
│   └── DynamicForm.tsx   # Composant de formulaire dynamique
└── lib/                  # Utilitaires
    ├── ai.ts             # Configuration AI SDK
    ├── types.ts          # Types TypeScript
    └── utils.ts          # Utilitaires shadcn/ui
```

## 🛠️ Technologies

- **Framework** : Next.js 15 (App Router)
- **Language** : TypeScript
- **Styling** : TailwindCSS + shadcn/ui
- **IA** : @ai-sdk/google avec Google Generative AI
- **Validation** : Zod
- **Stockage** : JSON local

## 🔮 Évolutions futures

- [ ] Support de multiples formulaires
- [ ] Interface d'administration des réponses
- [ ] Export CSV/Excel des données
- [ ] Liens partageables
- [ ] Validation avancée des champs
- [ ] Thèmes personnalisables
- [ ] Base de données (PostgreSQL/SQLite)
- [ ] Authentification utilisateurs

## 📄 Licence

MIT License - Vous êtes libre d'utiliser ce code pour vos projets personnels et commerciaux.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

---

**Développé avec ❤️ et l'IA de Google**
