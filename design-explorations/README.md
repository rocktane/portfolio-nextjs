# Canopée & Atelier — deux directions retenues

Maquettes autonomes de portfolio. Le code de l’application Next.js reste hors périmètre. `index.html` contient les deux directions ; `canopee.html` et `atelier.html` choisissent une direction initiale, avec le même sélecteur flottant.

## Ce qui change

- **Canopée** : identité réduite au nom, métier et lieu ; six projets, chacun avec une capture originale grand format, son nom et une ligne de description. Captures jamais filtrées, inversées, teintées ou recouvertes. Petites touches corail et jaune dans l’identité et les légendes, hors images. Agrandissement au clic, liens réels vers les sites ou dépôts.
- **Atelier** : dashboard avec sidebar, collection de six projets, recherche, catégories et vues grille/liste. Le labo présente trois apps macOS. Les fiches montrent aperçu original, contribution, technologies et accès au site/code. Parcours et Contact sont de vraies vues ; « Se connecter » mène au contact, sans prétendre authentifier quelqu’un. Aucune mini-démo Homebrew, statistique commerciale ou phrase de remplissage.
- Contact : adresse professionnelle existante, formulaire Typeform et LinkedIn existants. Le CV pointe vers le PDF du portfolio. Aucun message n’est envoyé automatiquement.

## Générer et vérifier

`python3 design-explorations/build.py` depuis la racine. Les fontes sont conservées dans `fonts.css`, les captures viennent de `public/projects/`. Aucun téléchargement nécessaire à la génération ou à la consultation locale ; liens externes disponibles avec une connexion.

Sources : `template.html`, `styles.css`, `app.js`, données projet et génération dans `build.py`. Les trois HTML embarquent tous leurs actifs. Le PDF du CV doit être publié à côté pour le site hébergé.

Vérification avec Playwright Core et Chrome déjà disponibles sur le Mac :

```sh
PLAYWRIGHT_MODULE=/Users/yohan/.t3/runtime/versions/0.1.9/node_modules/playwright-core node design-explorations/verify.cjs
```

`PORTFOLIO_URL` permet de vérifier le site HTTPS au lieu du fichier local ; `SCREENSHOT_DIR` choisit la destination des captures. `CHROME_PATH` choisit le navigateur.

Preuves : 36 configurations (Canopée et quatre vues Atelier × 320/390/768/1100/1440/1920 px), aucun débordement, images chargées sans filtre ni mélange sur aucun ancêtre, sélecteur visible. Recherche/filtres, aucun résultat et réinitialisation, grille/liste, détails/Escape, navigation labo/parcours/contact, « Se connecter », rechargement des liens directs. Comparaison octet pour octet de la capture Brower dans le dialogue avec le fichier source. Aucune erreur JavaScript. Rendus inspectés à 390 et 1440 px, y compris contact.

Routes : `#canopee`, `#canopee/projets`, `#canopee/contact`, `#atelier/projets`, `#atelier/labo`, `#atelier/parcours`, `#atelier/contact`. La fermeture du contact Canopée nettoie l’URL ; les liens directs peuvent être rechargés. Les dialogues utilisent les mécanismes natifs de focus et de fermeture par Escape.

## Revue et publication

Auteur GPT-6.1 Sol ; revue indépendante demandée à Claude Opus 5.5. Nouveau brief du 13/11/2026 : seuil demandé strictement supérieur à 9,5. Les notes de l’ancienne version ne valent pas validation de cette nouvelle version.

Hébergement existant : https://maquettes-portfolio.23o.dev, Caddy sur abox, `/var/www/maquettes-portfolio`. Sources publiées conservées dans `~/code/infra/sites/maquettes-portfolio/`. La mise à jour remplace uniquement les actifs de ce site et ne modifie pas sa route Caddy. Ne pas réintroduire Estuaire et Marée.

### Council — passe 1, version du 13 novembre

CHANGES, Canopée 9,2 et Atelier 8,9. Constats acceptés et corrigés :

- A1 : le lien d’évitement clavier déplace le focus sans toucher à la route.
- A2 : les détails Atelier deviennent des vues `#atelier/projets/<id>` et `#atelier/labo/<id>`, avec breadcrumb, retour collection, rechargement et historique natif ; Canopée garde son dialogue.
- A3 : recherche et catégorie réinitialisées au changement de section.
- A4 : barre de breadcrumb supprimée sur mobile, navigation conservée dans la barre supérieure.
- A5 : parcours chronologique 2018–2023, 2023–2024, 2024–2026 ; dates recoupées avec `public/CV-20260409.pdf` (bootcamp 2023, professorat 2024, alternance 2024–2026, diplôme Epitech 2026).
- A6/A7 : pas de filtre à une seule plateforme au labo, pas de CTA vers la page Contact déjà ouverte ; avatars redondants retirés.
- C1 : dialogues Canopée canard/Newsreader et contact limité à 520 px.
- C2 : les liens internes passent par le routeur même lorsque le hash ne change pas.
- C3 : fermer le contact ouvert depuis une page revient à l’entrée d’historique précédente ; un lien direct se ferme sans dépendance à une page précédente.
- C4/C5 : sélecteur flottant dans le coin, léger contour autour des captures pour délimiter les aperçus sombres.
- X1/X2 : alt text fonctionnel, chaque capture embarquée une seule fois puis réutilisée, sans modification des pixels.

Vérification élargie à 36 configurations et aux scénarios exacts du relecteur : skip, liens de même hash, recherche en changeant de section, détail partageable/rechargement/Back. Tous passent. Les fenêtres Canopée et le détail Atelier ont été inspectés visuellement après correction.

### Council — passe 2

CHANGES, 9,4 pour chaque piste. Corrections acceptées : R2-1 conserve exactement le défilement à l’ouverture/fermeture du contact Canopée ; R2-2 mémorise les positions de défilement par URL et les restaure pour Retour/Suivant dans Atelier. Les changements de route internes utilisent `pushState` puis le routeur ; la restauration native est désactivée pour éviter les conflits. Ces deux scénarios échouaient dans le test avant correction et passent maintenant.

R2-3 : section `canopee-view` distincte du hash de route ; le lien d’évitement est à nouveau le premier Tab sur une page fraîche. R2-4 : bloc d’identité redondant retiré du contact et lien de contact du footer masqué sur cette vue. R2-5 : les détails inconnus ou hors collection redirigent vers l’URL canonique de leur collection. R2-6 : nombre de configurations corrigé. Tests ajoutés pour ces comportements et le CV PDF lorsque la cible est hébergée.

### Verdict final et livraison — 13 novembre 2026

APPROVE, Claude Opus 5.5, trois passes pour ce brief : Canopée **9,6/10**, Atelier **9,6/10**. Aucun constat substantiel ouvert. Le relecteur a vérifié les retours de défilement sur ordinateur et mobile, fermeture des dialogues via bouton/Escape/fond/Retour, historique Suivant/Retour, vues grille/liste, clavier et URL invalides. Ses notes sont un jugement sur ces maquettes, pas sur une application de production complète.

Après APPROVE, deux petites améliorations non bloquantes ont été corrigées et vérifiées localement : N1 restaure le focus sur la carte projet lors du retour à une grille défilée ; N2 conserve l’entrée de retour quand le contact Canopée est rouvert via Suivant. Le rechargement repart en haut de la vue, réserve N3 acceptée pour ce prototype. La reconstruction automatique faite par le relecteur a été suivie d’une reconstruction et d’un passage complet des vérifications par l’auteur.

Publié sur https://maquettes-portfolio.23o.dev. Trois fichiers HTML autonomes et CV PDF ; Caddy inchangé. Remplacement atomique de chaque actif et de l’index en dernier, ancienne version sauvegardée dans `/var/backups/maquettes-portfolio/20261113-140110`. Copie des sources publiées dans le dépôt infra, fiche abox actualisée. HTTPS 200 et égalité SHA-256 de l’index ; les mêmes 36 configurations et tests fonctionnels passent contre l’URL publique, CV PDF inclus. Aucun commit ni changement du portfolio Next.js.
