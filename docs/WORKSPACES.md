# Projets, parcours et favoris

## Tableau des projets

`/projets` ouvre le Kanban de l’ensemble des 14 projets : Non publié, En cours, Bêta, En ligne et Archives. Les vues grille et liste du catalogue restent accessibles dans le sélecteur et via `?vue=grille` / `?vue=liste`.

Référence visuelle et fonctionnelle : `~/code/exp/angular-poc`, composants `board-page`, `column` et `card-item`. Colonnes de 296 px, rayons de 12/6 px et languettes colorées. La palette et les polices reprennent celles du portfolio, y compris dans la modale. Le tableau est directement intégré à la page, sans cadre ni panneau de fond indépendant. Essai : sa zone de défilement s’étend jusqu’au bord gauche de la fenêtre et passe sous la sidebar sur ordinateur ; celle-ci reste au-dessus et cliquable. Son fond teinté à 55 % et son flou de 8 px empêchent les textes des cartes de concurrencer la navigation, tout en laissant percevoir les couleurs et le mouvement. La première carte reste alignée au titre au départ. La couleur de languette identifie ici le projet, pas une priorité inventée.

Les cartes et colonnes se déplacent avec la poignée à la souris, au tactile ou au clavier (Espace, flèches, Espace ; Échap annule). Les fiches permettent aussi de choisir la colonne et de monter/descendre une carte. Création, modification, suppression, annulation du dernier changement et réinitialisation sont disponibles. Les déplacements sont désactivés pendant une recherche, comme dans le POC.

Les modifications du visiteur sont enregistrées sous `atelier.project-board.v1`. Elles ne modifient ni les fiches publiques ni le catalogue. Une validation du stockage rejette les structures corrompues ; si localStorage est refusé ou saturé, le tableau reste utilisable en mémoire et signale l’absence de persistance. Pas de backend ou d’authentification pour ces interactions.

## Parcours

`/parcours` présente une base de données inspirée de Notion : page neutre, onglets, propriétés typées, lignes compactes, tags, colonnes à bordures fines et ouverture des fiches dans une fenêtre. Clair et sombre, typographie et fond suivent le thème du portfolio ; aucun cadre extérieur. La barre d’outils reprend la référence Notion fournie : onglets en pastilles, commandes par icônes et recherche dépliable. Les propriétés apparaissent dans un menu ancré au bouton, avec recherche et cases à cocher, sans réduire la table. Chaque domaine possède sa couleur. Le fond du tableau conserve le verre translucide et un flou de 2 px, sans halo ni dégradé autour. Les filtres s’ouvrent en menu ancré avec recherche de propriété ; le tri se déclenche depuis les en-têtes. Les tris et filtres actifs figurent en pastilles sous les onglets ; aucune ligne de contrôle n’est affichée sans critère actif, aucun bouton « + Filtrer » ni bouton de tri n’est ajouté. Le badge d’ouverture des fiches reprend le pictogramme de panneau et une capsule bordée. Les pages Parcours et Favoris n’ont pas de sous-titre. Aucun lien de réinitialisation n’est ajouté au changement de vue. Les détails bloquent le défilement du fond puis restaurent sa position à la fermeture.

10 entrées, 14 propriétés : titre, organisme, type, période, contrat, domaine, compétences, contexte, contributions, projets liés, diplôme, spécialité, équipe et site. Toutes les propriétés peuvent être affichées ; le titre reste visible. Les cellules non documentées sont laissées vides. La table défile horizontalement dans son propre cadre.

Recherche sur les propriétés, onglets expériences/formations, filtres combinables ET/OU (contient, est, n’est pas, vide/non vide), tris successifs et tri par en-tête. La période est triée sur une date structurée et non son libellé. Ces réglages modifient la vue pendant la visite. Les fiches publiques ne sont pas modifiables par le visiteur.

Sources du contenu : CV fullstack v03 d’octobre 2026 (`~/code/exp/jobs/data/candidatures/base/`) et données publiques du portfolio. Le CV distingue G-ON, RATP et les deux postes ThemaVerde. Les deux missions IA sont regroupées car le document ne donne pas de fiche distincte par client. Les coordonnées privées du CV ne sont pas reproduites. Les périodes dont seul le millésime est connu ne reçoivent pas de mois inventé. Le bouton de CV conserve le PDF public existant.

## Favoris

`/favoris` reprend les 26 applications explicitement choisies par Yohan, sans ajouter automatiquement les autres entrées de Brower. Recherche, catégories et tri alphabétique sont disponibles. Les icônes des applications sont servies localement ; elles restent la propriété de leurs auteurs et ne sont pas recolorées. Les liens mènent aux sites ou dépôts officiels.

Brower a été vérifié sur sa page publique le 14 novembre 2026 : 48 entrées, identiques en noms au catalogue `~/code/rocktane/brower/src/db.json`. 11 entrées sont dans la sélection, 37 n’y sont pas.

Applications présentes dans Brower et absentes de la sélection : AlDente, Alfred, Alt-Tab, Arc, BalenaEtcher, Battery, Brave, Bruno, CoconutBattery, Cursor, Discord, Ente, Ferdium, Firefox, Google Chrome, Google Drive, Ice, iTerm2, Latest, LuLu, Maccy, Notion, Obsidian, Orion, Raycast, Scroll Reverser, Setapp, Signal, Slack, Sonos, Telegram, The Unarchiver, Transmission, Visual Studio Code, VLC, Warp et WhatsApp.

Parmi elles, les anciennes entrées marquées d’un cœur sont Alt-Tab, Arc, Cursor, Ice, Telegram et Warp. Cela décrit le catalogue Brower ; cela ne les ajoute pas aux préférences actuelles.

L’entrée Zen de Brower pointe vers `browser.kagi.com` (Orion). Le lien utilisé dans Favoris est `https://zen-browser.app`. Le dépôt Brower n’a pas été modifié.

Liens vérifiés pour les applications moins connues : [Desigma](https://github.com/deepfounder-ai/desigma), [FluxMarkdown](https://github.com/xykong/flux-markdown), [MacPacker](https://github.com/sarensw/MacPacker), [OpenLogi](https://openlogi.org/), [Handy](https://handy.computer/). Keepresso et Tinycast sont documentés dans leurs dépôts locaux, qui renvoient vers leurs sources officielles.

## Vérifications

Les tests unitaires couvrent les déplacements sans duplication, la validation des données locales, les filtres ET/OU, les valeurs absentes et les tris chronologiques et secondaires. Les tests navigateur couvrent les déplacements souris/clavier, la création, l’édition, le rechargement, l’annulation, la réinitialisation, le stockage refusé, les propriétés et filtres du parcours, les 26 icônes locales et l’absence de débordement sur mobile. Le build statique est conservé.

## Boutons et sélecteur de vue

Ajouter une colonne reprend le bouton vitré Se connecter. Ajouter une colonne, Rechercher et Se connecter partagent le fond de survol. Le sélecteur de vue utilise un indicateur persistant qui glisse vers la sélection, sans animation lorsque le mouvement réduit est demandé. Une infobulle apparaît après 70 ms et reste montée pendant le passage entre les icônes ; elle fonctionne aussi au focus et se ferme avec Échap.
