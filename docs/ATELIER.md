# Atelier : intégration Next.js

Identité : **yohan/atelier**, nom textuel dans la sidebar, monogramme Y réservé au favicon. Alternatives proposées : **~/yohan**, **Le bureau de Yohan**. Le monogramme utilise un Y Newsreader, accompagné d’un point abricot, sans image générée.

Palette : papier `#f5f7f4`, menthe `#e5eee7`, texte `#193e32`, secondaire `#52695d`, action `#245b46`, accent `#e6ab69`. Manrope pour l’interface, Space Grotesk pour les titres et la température, Newsreader uniquement pour le Y ; fontes locales issues de la maquette validée. Pas de filtre ni de recoloration des captures.

La structure conserve la sidebar et le catalogue de la maquette. Le header a une hauteur fixe partagée par toutes les routes ; le footer participe à une colonne flex occupant au moins la hauteur de l’écran. Sur mobile la navigation et le header restent compacts. Projets, labo, archives, parcours, contact et les fiches utilisent de vraies routes statiques Next.js. Les filtres sont dans l’URL, sans stockage local supplémentaire.

L’invité peut cliquer son nom pour le modifier. Entrée ou perte de focus valide, Escape annule, nom vide rétablit Invité. Seul ce nom est enregistré dans localStorage (`atelier.guest-name`), jamais transmis à un service. Le stockage bloqué reste utilisable pour la visite.

La météo est lue directement depuis Open-Meteo pour les coordonnées de Marseille. Conditions actuelles, température Celsius, code WMO, jour/nuit ; rafraîchissement toutes les 15 minutes, pas de clé ou de compte, pas de géolocalisation. Une icône SVG représente le code renvoyé par l’API. Les données sont attribuées à Open-Meteo. Échec, réponse invalide ou données dépassées affichent une indisponibilité, pas une météo inventée.

Référence : [documentation Open-Meteo](https://open-meteo.com/en/docs). Usage gratuit non commercial et limites du fournisseur applicables au portfolio personnel. Le CSP autorise explicitement l’API.

Les suggestions de nouvelles pages sont documentées séparément et ne sont pas ajoutées sans choix de Yohan.

## Prévisualisation de l’intégration

La version Next.js est consultable sur https://maquettes-portfolio.23o.dev. C’est l’export de la branche `feat/atelier-dashboard`, servi par Caddy ; le domaine de production conserve son processus Vercel via `main`. Le sélecteur de maquettes et Canopée ne font pas partie de cette application. Les maquettes historiques restent dans `design-explorations/`.

Vérification du déploiement : `PLAYWRIGHT_BASE_URL=https://maquettes-portfolio.23o.dev bun run test:e2e`. Les tests météo sont déterministes ; la météo réelle a aussi été vérifiée séparément dans le navigateur.

## Ajustements de l’interface

Direction : conserver papier `#f5f7f4`, menthe `#e5eee7`, encre `#193e32`, secondaire `#52695d`, forêt `#245b46`, abricot `#e6ab69`. Identité typographique Y Newsreader ; interface Manrope et titres Space Grotesk. Alignement à gauche, marque et fil d’Ariane centrés sur la même ligne du header. Profil invité sur un emplacement de hauteur constante. Le CV reste dans Parcours.

Disposition : `marque | fil d’Ariane … contact`, puis `invité / navigation | contenu`, puis `réseaux / météo | pied de page`. Sur mobile, réseaux et météo occupent la barre compacte. Les captures remplissent leur cadre en vue liste ; les vues grille et détail conservent l’image entière.

Révision du plan : la météo devient un relevé local sans carte ni décor : icône, ville, condition et température. Les boutons de réseaux restent sobres. Le focus vert suit les contours du champ de recherche au lieu de dessiner un rectangle autour du texte. Aucun mouvement décoratif.

## Cartes, fiches et propositions d’accueil

Le monogramme est réservé au favicon ; la sidebar conserve le nom textuel. Se connecter renvoie vers Contact, y compris sur mobile. Les réseaux ne sont plus répétés au footer. Contact affiche « Un projet ? Une mission ? », sans la pastille fléchée. Les cartes présentent toutes les technologies renseignées, sans en inventer de nouvelles. Les fiches adaptent leur cadre au ratio natif de chaque image ; le visuel Geeft présent dans les assets est raccordé.

Quatre propositions d’accueil interactives, séparées de l’application, sont dans `design-explorations/accueil-propositions.html` : Vue d’ensemble, À la une, Votre visite et En ce moment. Elles utilisent papier #f5f7f4, menthe #e5eee7, encre #193e32, secondaire #52695d, forêt #245b46 et abricot #e6ab69 ; Manrope, alignement à gauche et contenus réels. La variation porte sur le point d’entrée, sans faux compteurs ni activité inventée. La proposition 1 a ensuite été retenue avec les trois chemins de la proposition 3, voir ci-dessous.

## Accueil retenu

La proposition 1 est intégrée avec les trois chemins de la proposition 3. Palette conservée : papier #f5f7f4, menthe #e5eee7, encre #193e32, secondaire #52695d, forêt #245b46, abricot #e6ab69. Space Grotesk porte le métier et les trois entrées ; Manrope reste la police de l’interface. Composition à gauche : `métier / [Projets] [Parcours] [Contact]`. Aucun projet ni texte d’habillage sur l’accueil. Les aperçus et filtres restent dans `/projets`. La respiration et la taille typographique occupent l’espace, sans ajouter de panneaux ou de phrases. Marque et lien Portfolio reviennent à l’accueil `/` ; retour depuis une fiche vers sa collection. Navigation mobile défilante plutôt que libellés cassés sur deux lignes.

## Outils et recherche

Ajout de `/a-essayer` : sélection explicite des sept outils utilisables, liens exacts, contraintes visibles, copie de la commande BetterBattery avec solution de repli. La palette ⌘K / Ctrl K recherche pages, projets et technologies ; bouton visible aussi sur mobile, navigation par flèches et Entrée, fermeture Échap et retour du focus. CV et copie de l’e-mail dans la palette. Palette et liste gardent les couleurs existantes (papier #f5f7f4, menthe #e5eee7, encre #193e32, secondaire #52695d, forêt #245b46), Manrope et Space Grotesk. Une liste d’actions sobres remplace une seconde grille d’aperçus. Le bouton Se connecter est uniquement dans le header ; footer compact, aligné à droite et sans filet. Le nom et son crayon partagent une largeur contrainte, le texte se tronque avant le crayon.

L’accueil n’est pas redessiné tant que Yohan n’a pas choisi entre une sélection d’outils à essayer, un projet unique mis en avant ou un aperçu de parcours.
