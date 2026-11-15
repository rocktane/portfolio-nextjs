# AGENTS.md

## Déploiement Vercel

- Seule la branche `main` est déployée (production). Depuis le 15/11/2026, les previews Vercel sont désactivées pour toutes les autres branches, `dev` comprise, dans `vercel.json` :

  ```json
  "git": { "deploymentEnabled": { "main": true, "**": false } }
  ```

- Quand une branche correspond à plusieurs règles, Vercel déploie dès qu'une d'elles vaut `true` : `main` reste donc déployée.

## CV

- Le CV s'appelle toujours `public/CV.pdf` : pour le mettre à jour, remplacer le fichier sans le renommer, sinon le QR code du site ne marche plus.
- Le QR code pointe vers `cv.23o.dev`, une redirection Caddy sur abox vers `https://yohangouiran.com/CV.pdf` (voir `~/code/infra/machines/abox.md`).
