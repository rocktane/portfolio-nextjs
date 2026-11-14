# Spotify sur le portfolio statique

État des docs vérifié le 14 novembre 2026. Objectif : afficher les écoutes/favoris du propriétaire à des visiteurs sans leur demander de se connecter. Le portfolio est Next.js `output: export` : il ne peut pas conserver un secret OAuth ni renouveler des tokens à l’exécution. Il faut donc un petit composant serveur externe, ou produire des données statiques lors d'une tâche périodique.

## Ce qui est disponible

La Web API expose les trois lectures pertinentes :

- [Top items](https://developer.spotify.com/documentation/web-api/reference/get-users-top-items) (`GET /me/top/{type}`), avec périodes courte/moyenne/longue, scope `user-top-read`.
- [Écoutes récentes](https://developer.spotify.com/documentation/web-api/reference/get-recently-played) (`GET /me/player/recently-played`), scope `user-read-recently-played`.
- [Titre en cours](https://developer.spotify.com/documentation/web-api/reference/get-the-users-currently-playing-track) (`GET /me/player/currently-playing`), scope `user-read-currently-playing`. Réponse vide possible si rien ne joue.

Les endpoints sont documentés comme accessibles en novembre 2026. Ces endpoints lisent le compte autorisé; ils ne sont pas appelables anonymement avec le seul Client ID. Pour le profil personnel, le développement nécessite un compte Premium du propriétaire selon [Quota modes](https://developer.spotify.com/documentation/web-api/concepts/quota-modes). En Development mode, la doc indique une limite de cinq utilisateurs Spotify autorisés par application. C'est compatible avec un seul propriétaire qui autorise l'app, même si tous les visiteurs du site sont anonymes : les visiteurs ne s'authentifient pas auprès de Spotify.

Spotify a aussi publié un [guide de migration février 2026](https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide) et les modes/quota peuvent changer. Les pages consultées ne permettent pas d'affirmer que chaque application existante est automatiquement soumise à toutes les limites des nouvelles applications; vérifier les réglages effectifs dans le Dashboard du compte avant d'implémenter. La limite five-user et Premium sont explicitement données par la page quotas consultée.

## Parcours Dashboard du propriétaire

1. Ouvrir [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) avec le compte développeur existant, puis ouvrir ou créer l'application du portfolio.
2. Dans les réglages de l'application, relever le **Client ID**. Garder le Client Secret privé; ne pas le mettre dans le dépôt, le bundle Next.js, une variable `NEXT_PUBLIC_*`, une issue ou une conversation.
3. Ajouter dans Redirect URIs l'URL exacte de callback qui sera servie par le backend OAuth. Exemple de production : `https://spotify-auth.example.net/callback`. Pour l’autorisation locale, enregistrer `http://127.0.0.1:8787/callback`. Le guide [Redirect URIs](https://developer.spotify.com/documentation/web-api/concepts/redirect_uri) impose une correspondance exacte, et les URI web doivent utiliser HTTPS; les exceptions localhost/loopback sont destinées au développement. Utiliser une adresse IP de loopback explicite : `localhost` est refusé par Spotify. Ne pas utiliser une IP LAN ou un HTTP public.
4. Lancer une seule autorisation avec le compte Spotify propriétaire via le backend, consentir aux seuls scopes utiles, puis conserver les tokens côté serveur.

Les noms/écrans du Dashboard pouvant évoluer, les libellés ci-dessus décrivent les actions, pas une séquence garantie de boutons.

## Les étapes concrètes pour toi

1. **Vérifier Premium sur le compte propriétaire.** Un compte développeur existant ne remplace pas cette condition du Development Mode.
2. **Ouvrir ou créer l’application** dans le [Dashboard](https://developer.spotify.com/dashboard). Nom conseillé : « Portfolio Yohan ». Description : affichage personnel des écoutes et artistes préférés. Site : `https://yohangouiran.com`. Choisir **Web API** si le formulaire demande les APIs utilisées ; le Web Playback SDK est inutile pour une carte sans lecture audio.
3. **Enregistrer le callback local** `http://127.0.0.1:8787/callback` dans les Redirect URIs, puis sauvegarder. Il servira à l’autorisation initiale avec un petit outil local. L’outil OAuth n’est pas fourni par cette note : ne pas ouvrir ce callback seul en attendant une page fonctionnelle.
4. **Vérifier l’accès du compte Spotify** dans la gestion des utilisateurs de l’application. Le compte qui autorise les données doit être autorisé pour l’app en Development Mode ; si nécessaire, l’ajouter avec son nom et son email Spotify. Aucun visiteur du portfolio n’est ajouté.
5. **Conserver le Client ID et le Client Secret** dans un gestionnaire de mots de passe ou les variables protégées du futur service. Ne rien coller dans une conversation ni dans Git. Ne pas partager l’écran du secret dans une capture.
6. **Faire préparer le flux OAuth local** : il écoutera uniquement `127.0.0.1:8787`, ouvrira l’autorisation avec `user-top-read`, vérifiera `state` et échangera le code côté serveur. Tu ouvriras le lien Spotify et accepteras une seule fois. Ajouter d’autres scopes ultérieurement demandera une nouvelle autorisation.
7. **Configurer le service de synchronisation** avec le Client ID, le Client Secret et le refresh token obtenus, dans son stockage de secrets. Le choix d’hébergement et le service sont à préparer séparément ; le site statique ne conserve aucun de ces secrets.
8. **Afficher un premier snapshot** : quelques artistes ou titres du top court terme, actualisés quotidiennement, avec date de mise à jour, attribution Spotify et liens vers les éléments Spotify. Tester aussi une erreur d’accès, l’expiration du jeton et la révocation de l’autorisation.
9. **Ajouter éventuellement le titre en cours** avec le scope `user-read-currently-playing`, un service de lecture et un cache court. En l’absence de morceau, afficher un état neutre ou les favoris ; ne pas inventer une écoute.

Les étapes 1 à 5 préparent ton compte. Les étapes 6 à 9 nécessitent du code et un service qui ne sont pas implémentés dans ce changement. Les scopes et l’architecture ci-dessous indiquent précisément ce qui sera nécessaire.

## Scopes minimaux

Choisir uniquement ce qui alimente réellement l'affichage :

| Affichage | Scope |
|---|---|
| Top titres/artistes | `user-top-read` |
| Historique récent | `user-read-recently-played` |
| Now playing | `user-read-currently-playing` |

Éviter les scopes d'écriture, de lecture de bibliothèque complète, de profil ou d'email si non nécessaires. Les descriptions officielles sont dans [Scopes](https://developer.spotify.com/documentation/web-api/concepts/scopes).

## OAuth serveur et secrets

Pour une intégration durable, utiliser [Authorization Code flow](https://developer.spotify.com/documentation/web-api/tutorials/code-flow), pas implicit grant. Le backend démarre `/authorize` avec `client_id`, `response_type=code`, URI enregistrée, scopes et un `state` aléatoire lié à une session. Au callback, comparer `state` de façon stricte, puis échanger le code via `POST https://accounts.spotify.com/api/token` en authentifiant la requête avec Client ID + Client Secret. Stocker access token et refresh token dans un stockage secret serveur; renouveler l'access token avant expiration avec le [refresh token flow](https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens). Ne jamais envoyer le refresh token au navigateur. Une session de propriétaire peut être verrouillée/authentifiée hors de l'interface publique.

L'option PKCE protège les clients publics sans secret; elle n'apporte pas ici le bénéfice du flux serveur si le client secret peut rester côté backend. Ne pas transférer le secret dans le site exporté.

## Deux façons de publier les données

**Favoris/top périodiques (recommandé pour le portfolio).** Un cron ou une fonction planifiée appelle le backend chaque heure/jour, lit top items (ou écoutes récentes), normalise en petit JSON et le publie dans un stockage/CDN public. Le site exporté affiche ce JSON. Les tokens restent secrets côté serveur. C'est résilient et peu coûteux en appels; la fraîcheur dépend de la cadence. « Favoris » peut désigner top items (classement Spotify sur une période) ou titres enregistrés en bibliothèque, qui n'est pas un endpoint favori arbitraire : la lecture de bibliothèque enregistrée a ses propres scopes et accès, à valider séparément.

**Now playing.** Une route backend publique lit `/me/player/currently-playing` et renvoie uniquement les champs nécessaires. Le navigateur peut la consulter périodiquement, par exemple toutes les 30–60 secondes avec pause lorsque l'onglet est caché. Le backend rafraîchit son token, et peut mettre la réponse en cache quelques dizaines de secondes pour partager un appel entre visiteurs. Un export statique seul ne peut pas rendre un état en direct; un point d'accès externe est nécessaire. Ne pas faire un polling serré (chaque visiteur multiplié par la fréquence) : la Web API applique une limite glissante calculée sur les appels de l'application, et répond typiquement `429` avec `Retry-After` quand dépassée; voir [Rate limits](https://developer.spotify.com/documentation/web-api/concepts/rate-limits).

Architecture simple et compatible export : fonction serverless ou petit service sur hébergement externe, routes privées `/login` et `/callback`, secret dans les variables protégées du fournisseur, stockage chiffré du refresh token, route publique en lecture seule `/api/spotify`, plus tâche cron de snapshot si nécessaire. Le JSON public ne contient que titre/artiste/album/image/lien Spotify et date de mise à jour. Ne pas exposer les tokens ni laisser la route publique déclencher une lecture Spotify non limitée. Les métadonnées et visuels restent soumis aux [Spotify Developer Terms](https://developer.spotify.com/terms) et [Developer Policy](https://developer.spotify.com/policy) : attribuer clairement Spotify, lier les éléments vers Spotify, ne pas présenter le contenu comme le sien et respecter les règles applicables aux images/métadonnées. La conformité exacte dépend de la présentation et de l'usage; à revalider avant mise en ligne.

## Qui fait quoi

**Le propriétaire doit faire dans son compte** : vérifier Premium, sélectionner l'app dans le Dashboard, ajouter l'URL callback réelle, et consentir une fois avec son propre compte Spotify. Le propriétaire doit saisir les secrets directement dans les variables secrètes du backend/hébergeur. Aucun secret ne doit être demandé ou copié dans le chat ou le dépôt.

**L'agent peut ensuite préparer** : le code du backend et du composant UI, configurer les noms de variables sans valeurs, écrire les instructions de déploiement, ajouter le snapshot/cron et vérifier les erreurs OAuth. Pour connecter réellement le compte, le propriétaire devra ouvrir le lien OAuth et consentir; pour activer le service, il faudra un hébergeur/stockage choisi et l'ajout direct des secrets par le propriétaire.

## À retenir

Pour une section « mes écoutes/favoris », commencer par `user-top-read` et un snapshot périodique. Ajouter le now-playing uniquement si sa fraîcheur justifie une route backend toujours disponible et du polling. Le site exporté reste public et sans login visiteurs; OAuth et secrets vivent entièrement à l'extérieur du bundle statique.

### Sources officielles consultées

- [Apps / Dashboard](https://developer.spotify.com/documentation/web-api/concepts/apps)
- [Quota modes](https://developer.spotify.com/documentation/web-api/concepts/quota-modes)
- [Migration de février 2026](https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide)
- [Redirect URIs](https://developer.spotify.com/documentation/web-api/concepts/redirect_uri)
- [Authorization Code](https://developer.spotify.com/documentation/web-api/tutorials/code-flow)
- [Refreshing tokens](https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens)
- [Scopes](https://developer.spotify.com/documentation/web-api/concepts/scopes)
- [Top items](https://developer.spotify.com/documentation/web-api/reference/get-users-top-items)
- [Recently played](https://developer.spotify.com/documentation/web-api/reference/get-recently-played)
- [Currently playing](https://developer.spotify.com/documentation/web-api/reference/get-the-users-currently-playing-track)
- [Rate limits](https://developer.spotify.com/documentation/web-api/concepts/rate-limits)
- [Developer Policy](https://developer.spotify.com/policy)
