# Revue de l’intégration Atelier

Auteur : GPT-6.1 Sol. Council : Claude Opus 5.5, effort medium. Base fixe : `aa764d9` (maquettes préservées), branche `feat/atelier-dashboard`.

## Passe 1 — CHANGES

- **S1, should, corrigé** : réinitialiser une collection après recherche laissait l’interface et l’URL désynchronisées. Reproduction confirmée par un nouveau test rouge avant correction. La lecture passe maintenant par `useSearchParams`, avec Suspense et un fallback contenant le catalogue pour l’export statique. Les écritures passent par l’intégration native de l’historique Next.js. Les liens vers la même collection nettoient explicitement une query existante, y compris après un lien direct vers l’export statique. Trois entrées testées : sidebar, marque et breadcrumb ; recherche tapée et lien direct.
- **N1, nit, conservé intentionnellement** : le lien « Projets » d’une fiche ouvre la collection complète ; le bouton Retour du navigateur restaure la recherche précédente. Ce comportement est distinct d’un bouton historique et correspond à la navigation de collection déjà validée sur la maquette.
- **N2, nit, corrigé** : une erreur d’écriture localStorage alors que la lecture fonctionne utilise maintenant le nom en mémoire pour cette visite. Test avec ancien nom lisible et `setItem` en erreur de quota.
- **N3, nit, corrigé** : copyright de l’édition 2026 explicite, sans date variable entre rendu statique et hydratation.
- **N4, nit, corrigé** : page 404 ajoutée aux contrôles de hauteur du header et de géométrie du footer.

## Preuves

Lint, TypeScript, six tests unitaires et build de 23 pages statiques passent. Dix tests Playwright sur l’export de production avec la CSP Vercel passent, dont 28 combinaisons de géométrie (sept pages × quatre largeurs), persistance/annulation du nom, stockage bloqué/quota, météo issue des données de l’API et panne, recherche/réinitialisation, routes et retour depuis les fiches, navigation clavier et 404. Les conditions météo sont mockées pour ces tests reproductibles ; un appel séparé à l’API réelle a vérifié le contrat courant de Marseille.

## Avis d’idéation séparé

Opus 5.5 medium a proposé les nouvelles pages, puis les a fait relire par GPT-6.1 Sol medium. Verdict CHANGES, objections intégrées dans `ATELIER-PAGES.md`, sans second avis. Ne pas confondre cette consultation d’idées avec l’approbation du code.

## Passe 2 — CHANGES

S1 et N2–N4 sont confirmés corrigés ; la décision N1 est acceptée. Un seul nouveau constat matériel, **S2**, concerne le curseur du champ de recherche quand le texte est modifié au milieu. Le test dédié a reproduit `abXcdefY` au lieu de `abXYcdef` avant correction.

S2 est corrigé par un état local synchrone du texte, séparé de la mise à jour différée des paramètres Next.js. Un changement externe de query (reset, navigation, historique) resynchronise cet état. Aucun remount forcé du champ à chaque frappe. Le scénario exact est répété cinq fois dans le test navigateur, puis les liens de réinitialisation sont exercés. Les onze tests navigateur passent, avec lint et TypeScript.

## Passe 3 — APPROVE

Claude Opus 5.5 medium confirme S2 corrigé et aucun constat matériel restant. Il a passé les onze tests navigateur, plus trois répétitions de ses propres probes de frappe rapide, CPU ralenti ×6, insertion au milieu, historique et réinitialisation. Aucun fichier du dépôt n’a été modifié par le reviewer.

Derniers ajustements de livraison : Analytics injecté uniquement pour les builds Vercel (le domaine de prévisualisation Caddy n’a pas de collecteur Vercel), et configuration de tests acceptant `PLAYWRIGHT_BASE_URL` pour contrôler le déploiement. Lint, typecheck, six tests unitaires, reconstruction de l’export et onze tests navigateur relancés avec succès.

Prévisualisation publiée sur https://maquettes-portfolio.23o.dev : release complète de 6,1 Mo, bascule Caddy après validation et sauvegarde, aucun changement des autres sites. Onze tests passent également sur ce domaine HTTPS ; égalité SHA-256 de l’index avec l’export. Vérification navigateur séparée sans interception : météo réelle Marseille chargée, icône correspondant aux conditions et aucune erreur JavaScript. L’état Git initial et son archivage sont décrits dans REPOSITORY-CLEANUP.md. La branche principale du portfolio reste distincte de cette livraison de fonctionnalité.

## Finitions de l’interface — APPROVE

Périmètre fixe : diff depuis `428e818700e1d1f311e45807f79e5836a895ccaa`, auteur GPT-6.1 Sol, reviewer indépendant Claude Opus 5.5 medium, une passe. Le test de régression a reproduit un déplacement de 2 px de la navigation lors de l’édition du nom avant la correction.

Verdict APPROVE, aucun constat bloquant ou matériel. Le reviewer a inspecté le diff, les captures et exécuté ses propres probes à 320, 390, 761 et 900 px, notamment avec une température négative et un orage. Il n’a pas relancé notre suite. Son appréciation visuelle était 8,5/10 avant les ajustements de retenue ci-dessous ; aucune note supérieure n’est revendiquée.

| Constat                                                 | Niveau | Décision et résolution                                                                                |
| ------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------- |
| N1 : focus vert global au-delà du champ de recherche    | Nit    | Conservé pour une cohérence visuelle et un focus clavier visible sur tous les contrôles.              |
| N2 : halo de recherche trop faible                      | Nit    | Opacité portée de `#245b461c` à `#245b4640`, bordure verte conservée.                                 |
| N3 : remplacement visible de Georgia au chargement du Y | Nit    | `font-display: block` sur le sous-ensemble Newsreader de 1,6 Ko.                                      |
| N4 : carte météo lourde et dessin du port trop faible   | Nit    | Dessin et carte retirés ; relevé compact avec une séparation, icône, ville, condition et température. |
| N5 : hauteur interne météo différente selon son état    | Nit    | Accepté : le header reste de hauteur constante et les états d’indisponibilité sont visibles.          |

Ces corrections mineures sont vérifiées localement, sans nouvelle délégation. Le retour à la ligne de « Le labo » à 320 px préexistait et reste hors du périmètre de cette passe.

Validation finale des finitions : lint, TypeScript et six tests unitaires passent ; quatorze tests navigateur passent sur le site public HTTPS, exécutés sur abox avec son Chromium existant (1,3 minute, aucune installation). Les dernières répétitions sur le Mac ont été interrompues après des ralentissements et délais d’attente ; la suite complète distante couvre le même export et toutes les régressions. Le répertoire temporaire de tests distant a été supprimé. L’index servi a le même SHA-256 que `out/index.html`. Pages, assets et vraie 404 vérifiés ; météo réelle sans interception observée à Marseille : 9 °C, ciel dégagé. Release `/var/www/maquettes-portfolio-releases/atelier-zVXd97s2`, avec Caddy actif et configuration lisible par son utilisateur.

## Corrections suivantes et propositions d’accueil

Se connecter vers Contact restauré sur ordinateur et mobile ; Y retiré de la sidebar et conservé en favicon, réseaux retirés du footer, intitulé de Contact remplacé et pastille fléchée supprimée. Les cartes affichent toutes les technologies déjà présentes dans les données. Le visuel Geeft est raccordé et les fiches suivent le ratio natif des images, sans limite de hauteur arbitraire.

Validation : build, lint, TypeScript et six tests unitaires passent. Seize tests navigateur passent contre le site HTTPS (Chromium sur abox, 1,6 minute), dont le contrôle des proportions et de l’absence de débordement sur douze fiches à 320, 768 et 1440 px. Quatre maquettes d’accueil indépendantes sont proposées dans le fil, sans intégration à l’application avant choix de Yohan. Aucun nouvel avis council sollicité pour cette passe.
