# Fonds des boutons d’accueil

Les SVG décoratifs partagent une composition à droite et laissent les titres dégagés. Le bouton Projets utilise les logos des stacks ; Parcours utilise la composition diagonale B ; Contact associe GitHub et LinkedIn aux pictogrammes de communication.

Les tracés sont sans remplissage au repos. Le survol et le focus clavier révèlent les couleurs officielles des logos et les teintes des métiers : chantier, études, thermique, environnement et formation. Les transitions respectent `prefers-reduced-motion` ; les SVG sont masqués aux technologies d’assistance, les liens gardant leur libellé texte.

Les coordonnées fixes évitent tout aléatoire à l’hydratation. Les masques protègent les titres sur ordinateur et mobile. Les sources se trouvent dans `src/data/home-stack-logos.ts`, `home-card-compositions.ts` et `home-card-icons.ts`. Les changements de composition restent indépendants du rendu des SVG et de la navigation.

- Pictogrammes : [Lucide 1.73.0](https://lucide.dev), sélection de tracés embarquée sans dépendance supplémentaire. Licence ISC dans `public/licenses/lucide.txt`.
- Logos de stacks et Revit : [Simple Icons 16.37.0](https://simpleicons.org), licence dans `public/licenses/simple-icons.txt`. L’oiseau Swift représente SwiftUI ; React représente aussi React Native.
- GitHub et LinkedIn reprennent les tracés déjà présents dans `SocialLinks.tsx`.

Les logos restent des marques de leurs propriétaires respectifs. Les planches d’exploration ne font pas partie de l’application livrée.
