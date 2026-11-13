# Atelier : intégration Next.js

Identité : **yohan/atelier**, monogramme Y simple, fond menthe et point abricot. Alternatives proposées : **~/yohan**, **Le bureau de Yohan**. Le logo existe en SVG, sans image générée.

Palette : papier `#f5f7f4`, menthe `#e5eee7`, texte `#193e32`, secondaire `#52695d`, action `#245b46`, accent `#e6ab69`. Manrope pour l’interface, Space Grotesk pour les titres ; fontes locales issues de la maquette validée. Pas de filtre ni de recoloration des captures.

La structure conserve la sidebar et le catalogue de la maquette. Le header a une hauteur fixe partagée par toutes les routes ; le footer participe à une colonne flex occupant au moins la hauteur de l’écran. Sur mobile la navigation et le header restent compacts. Projets, labo, archives, parcours, contact et les fiches utilisent de vraies routes statiques Next.js. Les filtres sont dans l’URL, sans stockage local supplémentaire.

L’invité peut cliquer son nom pour le modifier. Entrée ou perte de focus valide, Escape annule, nom vide rétablit Invité. Seul ce nom est enregistré dans localStorage (`atelier.guest-name`), jamais transmis à un service. Le stockage bloqué reste utilisable pour la visite.

La météo est lue directement depuis Open-Meteo pour les coordonnées de Marseille. Conditions actuelles, température Celsius, code WMO, jour/nuit ; rafraîchissement toutes les 15 minutes, pas de clé ou de compte, pas de géolocalisation. Une icône SVG représente le code renvoyé par l’API. Les données sont attribuées à Open-Meteo. Échec, réponse invalide ou données dépassées affichent une indisponibilité, pas une météo inventée.

Référence : [documentation Open-Meteo](https://open-meteo.com/en/docs). Usage gratuit non commercial et limites du fournisseur applicables au portfolio personnel. Le CSP autorise explicitement l’API.

Les suggestions de nouvelles pages sont documentées séparément et ne sont pas ajoutées sans choix de Yohan.

## Prévisualisation de l’intégration

La version Next.js est consultable sur https://maquettes-portfolio.23o.dev. C’est l’export de la branche `feat/atelier-dashboard`, servi par Caddy ; le domaine de production conserve son processus Vercel via `main`. Le sélecteur de maquettes et Canopée ne font pas partie de cette application. Les maquettes historiques restent dans `design-explorations/`.

Vérification du déploiement : `PLAYWRIGHT_BASE_URL=https://maquettes-portfolio.23o.dev bun run test:e2e`. Les tests météo sont déterministes ; la météo réelle a aussi été vérifiée séparément dans le navigateur.
