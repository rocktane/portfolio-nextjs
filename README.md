<div align="center">

# Portfolio - Yohan Gouiran

### Développeur Web Full-Stack

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

[Voir le site en ligne](https://www.yohangouiran.com) • [LinkedIn](https://www.linkedin.com/in/yohan-g) • [GitHub](https://www.github.com/rocktane)

</div>

---

## À propos

Portfolio personnel présentant mon parcours de **reconversion professionnelle** : d'ingénieur dans la construction durable (5 ans) à développeur web full-stack.

Ce site met en avant mes **compétences techniques**, mes **projets** et mon approche du développement web, avec un design moderne et interactif.

## ✨ Fonctionnalités

- **Design moderne et responsive** - Interface élégante avec système de design tokens
- **Cartes interactives 3D** - Effet de tilt au survol pour une expérience immersive
- **Animation de défilement** - Marquee infinie présentant les technologies maîtrisées
- **Carte géographique interactive** - Intégration Leaflet pour la localisation
- **Formulaire de contact intégré** - Typeform embarqué pour une prise de contact simplifiée
- **Optimisations performance** - Loading states, lazy loading, et export statique
- **Accessibilité** - Sémantique HTML5, ARIA labels, support clavier
- **SEO optimisé** - Métadonnées complètes, Open Graph, et sitemap

## 🛠️ Stack Technique

### Core
- **[Next.js 16](https://nextjs.org/)** - Framework React avec App Router
- **[React 19](https://react.dev/)** - Bibliothèque UI avec les dernières fonctionnalités
- **[TypeScript 5](https://www.typescriptlang.org/)** - Typage statique pour plus de robustesse

### Styling
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Framework CSS utility-first
- **Custom Design System** - Tokens de design (couleurs, typographie, ombres)
- **Animations CSS** - Transitions fluides et animations personnalisées

### Fonctionnalités
- **[Leaflet](https://leafletjs.com/)** - Cartographie interactive
- **[Typeform](https://www.typeform.com/)** - Formulaire de contact moderne
- **Dynamic Imports** - Chargement optimisé des composants

### Développement
- **ESLint** - Linting et qualité de code
- **PostCSS** - Transformation CSS
- **Vercel** - Déploiement et hébergement

## 🚀 Démarrage rapide

### Prérequis

- **Node.js** >= 20.0.0
- **npm**, **yarn**, **pnpm** ou **bun**

### Installation

```bash
# Cloner le repository
git clone https://github.com/rocktane/portfolio-nextjs.git
cd portfolio-nextjs

# Installer les dépendances
npm install
# ou
yarn install
# ou
pnpm install
```

### Configuration

Créer un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_TYPEFORM_ID=votre_id_typeform
```

### Développement

```bash
# Lancer le serveur de développement
npm run dev

# Le site sera accessible sur http://localhost:3000
```

### Build & Production

```bash
# Créer un build de production
npm run build

# Lancer le serveur de production
npm start
```

### Linting

```bash
# Vérifier la qualité du code
npm run lint
```

## 📁 Structure du Projet

```
portfolio-nextjs/
├── public/
│   ├── images/          # Images et assets statiques
│   └── CV-20240201.pdf  # CV téléchargeable
├── src/
│   ├── app/
│   │   ├── layout.tsx   # Layout principal
│   │   ├── page.tsx     # Page d'accueil
│   │   ├── globals.css  # Styles globaux
│   │   ├── error.tsx    # Page d'erreur
│   │   └── not-found.tsx # Page 404
│   ├── components/
│   │   ├── DynamicMap.tsx  # Map avec chargement dynamique
│   │   ├── Footer.tsx      # Pied de page
│   │   ├── Map.tsx         # Composant carte Leaflet
│   │   ├── Navbar.tsx      # Navigation avec scroll spy
│   │   └── TiltCard.tsx    # Carte interactive 3D
│   ├── constants/
│   │   └── theme.ts     # Design tokens
│   ├── data/
│   │   └── projects.ts  # Données des projets
│   └── types/
│       └── index.ts     # Types TypeScript
├── next.config.ts       # Configuration Next.js
├── tailwind.config.ts   # Configuration Tailwind
├── tsconfig.json        # Configuration TypeScript
└── vercel.json          # Configuration Vercel
```

## 🎨 Projets Présentés

### [brower](https://bro.yohan.one)
Une sélection de paquets brew dans une interface moderne. Il n'y a plus qu'à les installer.

### [geeft](https://www.geeft.club)
Une plateforme pour trouver le cadeau parfait. Plus besoin de chercher.

### Portfolio
Le site sur lequel vous vous trouvez actuellement.

## 🌐 Déploiement

Le site est déployé automatiquement sur **Vercel** à chaque push sur la branche principale.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rocktane/portfolio-nextjs)

### Configuration Vercel

Le projet inclut :
- Export statique (`output: 'export'`)
- Headers de sécurité (CSP, X-Frame-Options, etc.)
- Optimisations d'images
- Compression automatique

## 📄 License

Ce projet est sous licence privée. Tous droits réservés © 2024 Yohan Gouiran.

---

<div align="center">

**Développé avec ❤️ par [Yohan Gouiran](https://www.yohangouiran.com)**

[LinkedIn](https://www.linkedin.com/in/yohan-g) • [GitHub](https://www.github.com/rocktane) • [Portfolio](https://www.yohangouiran.com)

</div>
