# AGENTS.md

## Déploiement Vercel

- Seule la branche `main` est déployée (production). Depuis le 15/11/2026, les previews Vercel sont désactivées pour toutes les autres branches, `dev` comprise, dans `vercel.json` :

  ```json
  "git": { "deploymentEnabled": { "main": true, "**": false } }
  ```

- Quand une branche correspond à plusieurs règles, Vercel déploie dès qu'une d'elles vaut `true` : `main` reste donc déployée.
