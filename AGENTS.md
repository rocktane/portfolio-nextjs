# AGENTS.md

## Déploiement Vercel

- La production est déployée automatiquement depuis `main`.
- La branche `dev` n'est plus utilisée pour le moment (depuis le 15/11/2026) : sa preview Vercel est désactivée dans `vercel.json` :

  ```json
  "git": { "deploymentEnabled": { "dev": false } }
  ```

- Les autres branches (`t3/*`, PR) gardent leurs previews Vercel.

### Réactiver la preview de `dev`

1. Retirer l'entrée `"dev": false` de `git.deploymentEnabled` dans `vercel.json` (ou tout le bloc `git` s'il ne contient rien d'autre).
2. Remettre `dev` à niveau avec `main` (`git checkout dev && git merge main`), puis pousser `main` et `dev`.
3. Vérifier que le déploiement de `dev` apparaît sur Vercel : https://portfolio-nextjs-git-dev-yohans-projects-9535d618.vercel.app
4. Mettre à jour la fiche `~/code/infra/machines/abox.md` (entrée « Portfolio — dev Vercel »).
