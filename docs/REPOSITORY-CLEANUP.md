# État du dépôt avant l’intégration Atelier

Audit du 13 novembre 2026 : aucune PR ouverte sur GitHub. La branche principale locale était en retard de quatre commits ; elle a été avancée jusqu’à `07a87a3` sans fusion supplémentaire.

Un ancien redesign existait dans `dev`, avec un commit non fusionné et trois fichiers modifiés (`globals.css`, `HeroReel.tsx`, `projects.ts`). Il n’a pas été intégré à Atelier. Avant toute suppression, sauvegarde complète :

- Tag `archive/dev-before-atelier-20261113-194315` sur le dernier commit `dev`, également publié sur origin avant suppression de la branche distante.
- Tag local `archive/dev-wip-before-atelier-20261113-194315` sur le snapshot Git comprenant les modifications non committées.
- Bundle complet, inventaire et patch binaire dans `.git/atelier-backups/20261113-194315/` du dépôt commun.
- Copie tar des maquettes, puis commit dédié `aa764d9` pour conserver les maquettes validées avant de toucher au code applicatif.

Les worktrees des anciens concepts et de `dev` ont été retirés après sauvegarde. Les branches locales déjà fusionnées (cashou-shot-webp, contact-email-cv, redesign-neon, t3/flat-teal-design-concepts, t3/test-mobile-portfolio-hero, tvcal-project, vercel-analytics) ont été supprimées. Les branches distantes `dev`, `t3/test-mobile-portfolio-hero` et `vercel-analytics` ont été retirées après vérification et archivage si nécessaire. Le snapshot temporaire de stash a été retiré une fois son tag et son bundle créés ; aucun travail n’a été perdu.

Restent `main`, `v1` (archive historique) et la branche active `feat/atelier-dashboard`, avec seulement deux worktrees : principal et implémentation actuelle.
