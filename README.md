# yohan/portfolio

Portfolio de Yohan Gouiran, développeur Fullstack / mobile à Marseille. Interface de dashboard en Next.js : projets, labo, archives, parcours et contact. Les captures gardent leurs couleurs d’origine.

## Développer

Node ≥ 20.9 et Bun. Les polices sont servies localement ; aucune clé n’est nécessaire pour la météo.

```sh
bun install --frozen-lockfile
bun run dev
```

Le formulaire externe utilise `NEXT_PUBLIC_TYPEFORM_ID` (valeur par défaut dans `src/constants/theme.ts`).

## Vérifier

```sh
bun run lint
bun run typecheck
bun test
bun run build
bun run test:e2e
```

Les tests navigateur construisent l’export statique puis le servent sur le port 3100 avec les headers de sécurité Vercel. Ils utilisent Chrome s’il est installé sur macOS. Sinon : `bunx playwright install chromium`, ou définir `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

Le serveur `scripts/serve-export.mjs` est réservé aux vérifications locales et n’écoute que sur loopback. L’export de production se trouve dans `out/`. Vercel publie la branche principale ; la branche `dev` publie une prévisualisation Vercel de cette interface. Les évolutions rejoignent `dev` par des pull requests.

Prévisualisation de `dev` : https://portfolio-nextjs-git-dev-yohans-projects-9535d618.vercel.app. Prévisualisation publique Caddy : https://maquettes-portfolio.23o.dev.

## Interface

- Vraies routes `/`, `/labo`, `/archives`, `/parcours`, `/contact`, `/projets/[id]` ; les 14 projets existants sont conservés.
- Recherche, filtres et vue liste/grille dans l’URL ; aucune authentification simulée.
- Compte invité : cliquer le nom pour le modifier, Entrée ou clic extérieur pour valider, Escape pour annuler. Le nom est conservé dans localStorage, sur cet appareil ; aucun envoi au serveur.
- Météo Marseille : conditions courantes et température d’[Open-Meteo](https://open-meteo.com/en/docs), rafraîchies toutes les 15 minutes. Icônes SVG selon le code WMO et le jour/la nuit ; attribution au fournisseur. Échec ou réponse dépassée : indisponibilité explicite. Pas de clé, compte ou géolocalisation du visiteur.
- Thème clair / système / sombre : toggle à trois icônes dans la sidebar, système par défaut ; le choix explicite est conservé localement.
- Header de hauteur constante et footer après le contenu, au moins au bas de la fenêtre, y compris sur les pages courtes.

Le parcours est anti-chronologique, Safee en premier. Les fontes sont locales et les animations respectent la préférence de mouvement réduit.

## Sources

- `src/app/(atelier)/` : pages et métadonnées statiques.
- `src/components/atelier/` : shell, invité, météo, catalogue.
- `src/data/projects.ts` : données existantes et captures dans `public/projects/`.
- `src/lib/` : normalisation des noms, recherche et validation météo.
- `tests/` : tests unitaires et navigateur.
- [Décisions d’interface](docs/ATELIER.md), [idées de pages](docs/ATELIER-PAGES.md), [nettoyage Git](docs/REPOSITORY-CLEANUP.md).
- `design-explorations/` : maquettes historiques conservées pour référence, distinctes de l’application livrée et exclues du lint applicatif.
