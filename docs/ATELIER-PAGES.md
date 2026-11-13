# Atelier : idées de nouvelles pages

Ce sont des idées de pages supplémentaires, rien de cette sélection n’est implémenté. L’avis d’idéation a été réalisé avant l’intégration Next.js ; ses réserves sur l’invité et la météo décrivent l’ancienne maquette. Yohan doit choisir avant tout développement.
Sources : `src/data/projects.ts` (14 projets : stack, statut, année, rôle, `hrefKind`, `platform` ; `technicalCredits` ; `credits`) et les maquettes de `design-explorations/`.

## Council

- **Modèle exécuté :** GPT-6.1 Sol (Codex), effort medium, relecteur unique en lecture seule, 1 passe.
- **Verdict :** CHANGES, sans blocker. Les 5 constats « should » sont acceptés et intégrés ci-dessous. Le nit C6 est noté.
- **Ce qui a changé après le council :**
  - « État » sort du top 3. Un code HTTP 200 sur safee.fr ne prouve pas que l'app mobile fonctionne.
  - La palette ⌘K remonte à la 3e place.
  - Stack est dérivée des seuls `project.stack`.
  - À essayer repose sur une sélection explicite, pas sur un filtre automatique.

## Les 3 recommandées

### 1. Stack : index technos → projets

- **Utilité :** répondre à la question du recruteur ou du collègue : « NestJS, il en a fait où ? ». On choisit une techno et on voit ses projets, Projets et Labo confondus.
- **Données :** uniquement `project.stack` des 14 projets, avec normalisation des alias (`Vue`/`Vue.js`, `Node`/`Node.js`). Les technos sans projet sont omises : Convex, Redis, Kotlin, n8n, outils de test présents dans `technicalCredits` mais sur aucun projet.
- **Interaction :** chips regroupées par domaine. Un clic affiche les cartes projets. Un lien partageable du type `#atelier/stack/nestjs`.
- **Coût :** faible, tout est dérivé des données.
- **À éviter :**
  - Jauges de niveau, pourcentages, « années d'expérience ».
  - Faire croire que le code est public : NestJS mène à Safee, lien site, dépôt privé.
  - Doublonner la recherche existante. La valeur de la page tient à la navigation transversale.

### 2. À essayer : ce qu'on peut utiliser maintenant

- **Utilité :** pour les curieux et les collègues, passer à l'action en un clic plutôt que lire.
- **Données :** sélection explicite, et non un filtre `live` :
  - Exo et Snake : Ouvrir.
  - Brower (bêta admise) : Ouvrir.
  - tvcal : Composer son flux. On ne promet pas d'abonnement immédiat.
  - BetterBattery : Copier la commande `brew install --cask rocktane/tap/betterbattery`.
  - RemoveBG et EXIF Dates : Voir l'installation (dépôt).
- **Interaction :** une ligne par projet avec un seul verbe exact, plus un badge de contrainte (macOS, Raycast, Apple Silicon). Retour « Copié » au moment de copier.
- **Coût :** faible.
- **À éviter :**
  - Mini-démos embarquées (déjà exclues des maquettes).
  - Verbe « Installer » quand il n'existe qu'un dépôt.
  - Cacher la contrainte de plateforme.

### 3. Palette ⌘K : une action transverse plutôt qu'une page

- **Utilité :** tout atteindre sans menu : un projet, une techno (vers Stack), copier l'e-mail, ouvrir le CV, renommer l'invité.
- **Données :** projets, technos normalisées, liens réels (e-mail, Typeform, LinkedIn, CV PDF).
- **Interaction :** ⌘K / Ctrl K, et aussi un bouton visible dans la barre du haut pour le tactile et la découvrabilité. Navigation classique complète conservée.
- **Coût :** faible à moyen (focus, clavier, accessibilité du dialogue).
- **À éviter :**
  - Recherche « IA ».
  - Commandes gadgets.
  - En faire le seul moyen de navigation.

## Autres idées, non retenues pour l'instant

- **Dossier (kit recruteur) :** à faire comme vue imprimable de Parcours (CV, 3 projets clés, stack, liens), pas comme page séparée. Coût faible.
- **Réglages invité :** un petit menu sur l'avatar plutôt qu'une page : renommer, thème, mouvement réduit, effacer les données locales.
- **État des sites :** au mieux, une mention discrète dans les fiches concernées (« URL accessible · vérifiée à … », avec un état indéterminé en cas d'échec de mesure). Pas de % de disponibilité, pas d'historique, et Cashou (wip) n'en fait pas partie.
- **Activité GitHub :** reportée. Il n'y a qu'un `href` par projet, sans dépôt associé aux sites. Un flux global serait bruyant et parfois vide. Au mieux : dernière release dans une fiche qui a un dépôt identifié.

## Rejetées (séduisantes mais inutiles)

- **Analytics visiteurs :** ce serait un faux KPI, et sans intérêt pour le visiteur.
- **Chatbot « Demandez à Yohan » :** hallucinations, coût d'API, beaucoup de texte, contraire à l'épure.
- **Disponibilités / prise de RDV ou roadmap Kanban :** contenu inventé, qui vieillit mal. Le contact existe déjà.
- **Page Marseille / météo :** pur décor. La météo réelle suffit en widget.

## Nom de l'espace (à la place de yohan.workspace)

1. **yohan/atelier** : préféré par le council, personnel et cohérent avec la direction visuelle.
2. **~/yohan** : plus « dev ».
3. Autres options, plus faibles : `yohan.local` (fait penser à un environnement local, mais colle bien à l'invité local), `atelier.yg` (identifie moins bien Yohan), `yg·atelier` (difficile à taper et à transmettre).

## Réserves

- **C6 :** les maquettes lues affichent encore « Se connecter », sans météo ni invité renommable. Ces éléments viennent du brief et n'ont pas été vérifiés dans la version lue.
- Le council a porté sur l'idéation, pas sur le code Next.js du parent.
- Un seul tour de council. Pas de re-vérification : tous les constats ont été intégrés tels quels.
