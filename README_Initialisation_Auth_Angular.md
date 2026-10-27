# Initialisation de l'authentification : portail Angular

Ce README est destiné à un agent de développement. Il décrit comment brancher l'authentification dans le
portail d'administration Angular (connexion Google et connexion email + mot de passe), en s'appuyant sur le
squelette créé par `README_Initialisation_Angular.md` et sur l'API décrite dans
`README_Initialisation_Auth_Backend.md`.

**Périmètre : l'authentification côté client** (connexion, session, rafraîchissement, déconnexion, protection
des routes). L'affichage conditionné par permission (`*hasPermission`, `permissionGuard`) existe déjà et n'est
pas modifié, sauf mention.

---

## 0. Contexte et prérequis

- Le squelette du portail est en place : `core/` (guards, interceptors, `AuthService` et `SessionService` à l'état
  de coquille), `shared/ui` (toast, confirmation, chargement), `features/auth/` (coquille).
- L'API expose : `POST /auth/google`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`,
  `GET /auth/me`.
- Le portail est zoneless, `OnPush` partout, composants standalone, Reactive Forms, aucun NgRx, aucune
  bibliothèque UI. Ces règles restent valables.
- Les règles de frontières restent valables : `features/auth` peut importer `core` et `shared`, jamais une autre
  feature ; `core` n'importe ni `features` ni `layout`.

## 1. Règles non négociables

1. Le jeton d'accès vit **en mémoire uniquement** (signal dans `SessionService`). Jamais dans `localStorage`,
   `sessionStorage`, IndexedDB, un cookie lisible ou l'URL.
2. Le portail **ne lit jamais** le refresh token : il est dans un cookie `httpOnly` géré par le navigateur.
3. Le portail ne décode pas le JWT pour en tirer des droits. Le jeton ne contient que `sub`. L'identité et les
   permissions viennent de `GET /auth/me`.
4. Les contrôles côté Angular (guards, directive) servent la navigation. Ils ne remplacent **jamais** le contrôle
   du backend.
5. Les messages d'échec de connexion sont **génériques** : on ne distingue pas « compte inconnu », « compte
   suspendu » ni « domaine refusé ».
6. Aucun jeton, mot de passe ni `idToken` dans les logs, la console ou les messages d'erreur.
7. Aucune désactivation du mode strict, du lint ou d'une vérification pour faire passer un build.

## 2. Décisions techniques

| Sujet | Décision |
|---|---|
| Connexion Google | Google Identity Services (GIS), bouton rendu par Google, envoi de `credential` (l'`idToken`) à `POST /auth/google` |
| Connexion mot de passe | Reactive Forms, `POST /auth/login` |
| Transport du refresh token | Cookie `httpOnly` posé par l'API ; toutes les requêtes `/auth/*` partent avec `withCredentials: true` et l'en-tête `X-Client-Type: web` |
| Restauration de session | `provideAppInitializer` : tentative de `POST /auth/refresh` au démarrage, puis `GET /auth/me` |
| Expiration du jeton d'accès | Rafraîchissement **réactif** sur 401, **une seule requête partagée** pour toutes les requêtes en échec |
| Plusieurs onglets | Rafraîchissement sérialisé entre onglets avec l'API Web Locks (section 3, étape 6) |
| Redirection après connexion | Paramètre `returnUrl`, validé comme chemin interne |
| Typage Google | `@types/google.accounts` (dev) |

## 3. Procédure

### Étape 1. Dépendances et configuration

```bash
npm install -D @types/google.accounts
```

Ajoute `"google.accounts"` au tableau `types` de `tsconfig.app.json`.

Dans `environment.ts` et `environment.development.ts`, ajoute :

```typescript
googleClientId: '',   // identifiant client OAuth « web » ; valeur publique, pas un secret
```

Le script GIS (`https://accounts.google.com/gsi/client`) est chargé **dynamiquement** par un service (étape 5),
pas dans `index.html`, afin de ne pas le charger sur les pages qui n'en ont pas besoin.

Optionnel mais conseillé en développement : un `proxy.conf.json` qui redirige `/auth` et `/api` vers l'API,
pour que le portail et l'API semblent sur la même origine. Le cookie `SameSite=Strict` fonctionne déjà entre
`localhost:4200` et `localhost:3000` (le port ne compte pas pour la notion de « site »), donc le proxy n'est pas
obligatoire.

### Étape 2. Modèles (`core/models/auth.ts`)

```typescript
export interface LoginResponse {
  accessToken: string;
  expiresIn: number;                 // secondes
  utilisateur: { id: string; email: string; nom: string; ecoleId: string };
}
```

`UtilisateurSession` (déjà dans `core/models/utilisateur-session.ts`) reste la forme de l'utilisateur courant.
`GET /auth/me` renvoie cette forme ; pour l'instant `permissions` est un tableau vide côté API (le calcul réel
viendra du module Affectations).

Ces formes sont alignées sur le README backend. Si l'API s'en écarte, adapte les modèles, pas l'inverse, et
signale-le.

### Étape 3. `SessionService` (`core/services/session.service.ts`)

Étends le service existant (signals uniquement) :

- `jetonAcces`: signal en lecture seule (`string | null`).
- `utilisateur`: signal en lecture seule (`UtilisateurSession | null`).
- `estAuthentifie = computed(() => this.jetonAcces() !== null && this.utilisateur() !== null)`.
- `initialisee`: signal booléen, vrai une fois la restauration terminée, qu'elle ait réussi ou non.
- `definirJeton(jeton)`, `definirUtilisateur(u)`, `marquerInitialisee()`.
- `effacerSession()`: remet jeton et utilisateur à `null`.
- `aPermission(code)`: déjà présent ; inchangé.

Aucun accès à `localStorage` ni `sessionStorage` dans ce fichier. Un test doit le garantir (étape 11).

### Étape 4. `AuthService` (`core/services/auth.service.ts`)

Remplace la coquille. Toutes les méthodes appellent `${environment.apiUrl}/auth/...` avec
`withCredentials: true` et l'en-tête `X-Client-Type: web`. Les requêtes d'authentification portent le contexte
`SKIP_AUTH_REFRESH` (voir l'étape 6) pour ne jamais déclencher de rafraîchissement en boucle.

| Méthode | Appel | Effet |
|---|---|---|
| `connecterAvecGoogle(idToken)` | `POST /auth/google` `{ idToken }` | stocke le jeton, charge l'utilisateur |
| `connecterAdmin(email, motDePasse)` | `POST /auth/login` `{ email, motDePasse }` | stocke le jeton, charge l'utilisateur |
| `rafraichir()` | `POST /auth/refresh` | met à jour le jeton ; **partagé** (étape 6) |
| `chargerUtilisateur()` | `GET /auth/me` | met à jour `SessionService.utilisateur` |
| `restaurerSession()` | `rafraichir()` puis `chargerUtilisateur()` | ne lève jamais d'erreur ; finit par `marquerInitialisee()` |
| `deconnecter()` | `POST /auth/logout` | efface la session même si l'appel échoue, puis redirige vers `/connexion` |

Détails :
- Après `POST /auth/google` ou `/auth/login`, la réponse contient `accessToken` et `utilisateur`. Stocke le jeton
  d'abord, puis appelle `chargerUtilisateur()` pour obtenir la forme complète (permissions comprises).
- `deconnecter()` appelle aussi `google.accounts.id.disableAutoSelect()` quand GIS est chargé, pour que Google ne
  reconnecte pas silencieusement l'utilisateur à la prochaine visite.
- En cas d'échec de `restaurerSession()` (aucun cookie, cookie expiré, API injoignable), la session reste vide.
  L'utilisateur est simplement non authentifié ; aucune erreur n'est affichée.

### Étape 5. Connexion Google (`features/auth`)

**`GoogleIdentityService`** (`features/auth/services/google-identity.service.ts`)
- `charger(): Promise<void>` : injecte `<script src="https://accounts.google.com/gsi/client" async defer>` une
  seule fois, résout quand `window.google?.accounts?.id` est disponible, rejette en cas d'échec de chargement.
- `initialiser(callback)` : `google.accounts.id.initialize({ client_id: environment.googleClientId, callback })`.
  **Ne pas** passer le paramètre `hd` : il n'est qu'un indice d'affichage et chaque école a son propre domaine.
  La restriction de domaine est faite par le serveur, pas par le client.
- `rendreBouton(element)` : `google.accounts.id.renderButton(element, { theme: 'outline', size: 'large', locale: 'fr', text: 'signin_with' })`.
- Pas de One Tap (`prompt()`) : le bouton seul suffit pour ce portail.

**`GoogleSignInButtonComponent`** (`features/auth/components/`)
- Rend un conteneur, appelle le service au chargement, émet une sortie `idToken` avec la valeur `credential`.
- Si le script ne charge pas (réseau bloqué, extension), il affiche un message accessible (« La connexion Google
  est indisponible. Utilisez votre email et votre mot de passe si votre compte en dispose. ») au lieu de rester
  vide.
- Le callback de GIS s'exécute hors de l'application : mets à jour l'état **uniquement via des signals** pour que
  la détection de changement soit notifiée (le portail est zoneless).

### Étape 6. Intercepteurs

**Contexte de requête** (`core/http/http-context.ts`)

```typescript
export const SKIP_AUTH_REFRESH = new HttpContextToken<boolean>(() => false);
```

Les requêtes marquées `true` ne reçoivent pas de `Authorization` et ne déclenchent aucun rafraîchissement.
Utilise ce jeton plutôt qu'une comparaison d'URL.

**`auth.interceptor.ts`**
1. Ne touche pas aux requêtes marquées `SKIP_AUTH_REFRESH`, ni à celles dont l'URL ne commence pas par
   `environment.apiUrl`.
2. Ajoute `Authorization: Bearer <jeton>` s'il existe.
3. Sur une réponse 401 : appelle `AuthService.rafraichir()`, puis **rejoue la requête une seule fois** avec le
   nouveau jeton. Si le rejeu renvoie encore 401, ou si le rafraîchissement échoue : `effacerSession()`, toast
   d'information « Votre session a expiré, veuillez vous reconnecter. » (une seule fois), puis redirection vers
   `/connexion` avec `returnUrl`.

**Rafraîchissement partagé** : si dix requêtes échouent en 401 en même temps, **un seul** `POST /auth/refresh`
doit partir. Les autres attendent son résultat. Implémentation attendue : `AuthService` conserve la promesse (ou
l'observable partagé) du rafraîchissement en cours et la remet à zéro à la fin.

**Sérialisation entre onglets (important)** : l'API révoque tous les jetons d'un utilisateur si un refresh token
déjà utilisé est présenté. Deux onglets qui rafraîchissent **en même temps** avec le même cookie provoqueraient
donc une déconnexion générale. Entoure l'appel `POST /auth/refresh` de :

```typescript
await navigator.locks.request('portail-auth-refresh', async () => { /* appel de rafraîchissement */ });
```

Si `navigator.locks` n'existe pas, exécute l'appel sans verrou. Un onglet qui obtient le verrou après un autre
utilise simplement le cookie déjà renouvelé, ce qui est sans danger.

**`error.interceptor.ts`** (existant) : ne montre pas de toast pour les 401, ni pour les requêtes
`SKIP_AUTH_REFRESH`. Les erreurs de connexion sont affichées **dans le formulaire**, pas en toast (étape 8).

### Étape 7. Guards, initialisation, routes

**Initialisation** (`app.config.ts`) :

```typescript
provideAppInitializer(() => inject(AuthService).restaurerSession())
```

Le routage ne démarre qu'après la fin de cette fonction. `authGuard` n'a donc jamais à attendre : à son
exécution, la session est soit restaurée, soit définitivement absente.

**`authGuard`** (existant) : si `estAuthentifie()`, laisse passer ; sinon redirige vers `/connexion` avec
`queryParams: { returnUrl: state.url }`.

**`guestGuard`** (nouveau, `core/guards/guest.guard.ts`) : appliqué à `/connexion`. Si l'utilisateur est déjà
authentifié, redirige vers `/tableau-de-bord`.

**Validation de `returnUrl`** (`core/utils/safe-redirect.ts`) : fonction `urlInterne(valeur, repli)` qui
n'accepte qu'un chemin interne : il commence par un seul `/`, ne commence pas par `//`, ne contient ni `\`, ni
schéma (`:`), ni caractère de contrôle. Sinon, elle retourne `repli` (`/tableau-de-bord`). C'est une protection
contre la redirection ouverte : un lien piégé ne doit pas envoyer l'utilisateur connecté vers un site externe.

### Étape 8. Page de connexion (`features/auth/pages/connexion-page.component.ts`)

Remplace la page de titre seul par une vraie page, **hors `ShellComponent`**, avec `guestGuard`.

Contenu :
- Titre, texte court d'explication.
- `GoogleSignInButtonComponent` (voie principale).
- Séparateur « ou », puis un formulaire email + mot de passe (Reactive Forms).
- Bouton « Se connecter » désactivé pendant l'appel (`aria-busy`).

Comportement :
- Après succès : `router.navigateByUrl(urlInterne(returnUrl, '/tableau-de-bord'))`.
- Échec (Google ou mot de passe) : un **message unique et générique** dans une zone `role="alert"` :
  « Connexion impossible. Vérifiez vos identifiants ou contactez votre administrateur. » Le message est le même
  quel que soit le motif (401), sauf pour 429 (« Trop de tentatives. Réessayez dans quelques minutes. ») et pour
  les erreurs réseau (« Le serveur est injoignable. Réessayez plus tard. »).
- Le champ mot de passe est vidé après un échec.
- Le focus revient sur le message d'erreur ou sur le premier champ en erreur.

Accessibilité (WCAG 2.2 AA) :
- chaque champ a un `<label>` explicite ; `autocomplete="username"` pour l'email et
  `autocomplete="current-password"` pour le mot de passe ;
- erreurs de validation reliées par `aria-describedby`, annoncées sans ne reposer que sur la couleur ;
- un seul `<h1>` ; ordre de tabulation logique ; indicateur de focus visible ;
- le bouton Google est rendu par Google (son accessibilité lui incombe), mais le conteneur a un libellé.

Validation côté client : email au bon format et mot de passe non vide. **Aucune règle de complexité de mot de
passe côté client** : la règle appartient au serveur et s'applique à la création, pas à la connexion.

### Étape 9. Déconnexion et en-tête

- Le bouton de déconnexion de `TopbarComponent` appelle `AuthService.deconnecter()`.
- La barre supérieure affiche `SessionService.utilisateur()?.nom`. Tant que l'utilisateur n'est pas chargé,
  elle n'affiche rien de nominatif.
- `/acces-refuse` existe déjà ; ne le confonds pas avec un échec d'authentification.

### Étape 10. Mise à jour des fichiers existants

À modifier, sans réécrire le reste :
`core/services/auth.service.ts`, `core/services/session.service.ts`, `core/interceptors/auth.interceptor.ts`,
`core/interceptors/error.interceptor.ts`, `core/guards/auth.guard.ts`, `app.config.ts`,
`features/auth/` (page, routes), `layout/topbar/topbar.component.ts`, les deux fichiers d'environnement.

À créer : `core/models/auth.ts`, `core/http/http-context.ts`, `core/guards/guest.guard.ts`,
`core/utils/safe-redirect.ts`, `features/auth/services/google-identity.service.ts`,
`features/auth/components/google-sign-in-button.component.ts`.

### Étape 11. Tests (Vitest)

- **SessionService** : aucune écriture dans `localStorage` ni `sessionStorage` (espionne les deux).
- **AuthService** : `restaurerSession` réussi (jeton + utilisateur), `restaurerSession` en échec (session vide,
  aucune exception, `initialisee` vraie), `deconnecter` efface la session même si l'API échoue.
- **auth.interceptor** :
  - ajoute le jeton aux requêtes de l'API et pas aux autres ;
  - n'ajoute rien aux requêtes `SKIP_AUTH_REFRESH` ;
  - sur 401, un rafraîchissement puis **un seul** rejeu ;
  - **dix requêtes en 401 simultanées déclenchent un seul** `POST /auth/refresh` ;
  - un 401 sur `/auth/refresh` ne provoque pas de boucle ;
  - un rejeu qui échoue en 401 efface la session et redirige.
- **authGuard** et **guestGuard** : redirections et `returnUrl`.
- **urlInterne** : accepte `/roles?x=1` ; refuse `//evil.com`, `https://evil.com`, `/\evil.com`,
  `javascript:alert(1)`, chaîne vide.
- **Page de connexion** : message générique identique pour deux échecs 401 différents ; 429 distinct ; bouton
  désactivé pendant l'appel ; champ mot de passe vidé après échec.
- **Verrou inter-onglets** : si `navigator.locks` est absent, le rafraîchissement fonctionne quand même.

N'appelle jamais Google ni l'API réelle dans les tests : utilise `HttpTestingController` et une doublure du
service GIS.

## 4. Vérifications avant de rendre le travail

- [ ] Recherche dans le code : aucune occurrence de `localStorage`, `sessionStorage` ni `indexedDB` liée aux jetons.
- [ ] Aucun `console.log` contenant un jeton, un mot de passe ou un `idToken`.
- [ ] Aucun décodage du JWT côté client (pas de `atob` ni de bibliothèque de décodage).
- [ ] Le paramètre `hd` n'est pas utilisé dans l'initialisation de GIS.
- [ ] Le message d'échec de connexion est identique pour tous les motifs 401.
- [ ] Le rafraîchissement est partagé et protégé par le verrou inter-onglets.
- [ ] `returnUrl` passe toujours par `urlInterne`.

## 5. Critères de fin

- [ ] `ng build`, `ng test` et `ng lint` réussissent, y compris les règles de frontières.
- [ ] Une visite sans session redirige vers `/connexion?returnUrl=...`.
- [ ] Après connexion, l'utilisateur arrive sur `returnUrl` (ou `/tableau-de-bord`).
- [ ] Un rechargement de page conserve la session (restauration par cookie), sans rien stocker côté client.
- [ ] La déconnexion invalide la session, et un retour arrière du navigateur ne rouvre pas une page protégée.
- [ ] Un utilisateur déjà connecté qui ouvre `/connexion` est redirigé.
- [ ] Un jeton d'accès expiré est renouvelé de façon transparente, sans perte de la requête en cours.
- [ ] Le bundle ne contient ni `zone.js`, ni bibliothèque UI, ni NgRx.
- [ ] Le build fonctionne avec `googleClientId` vide (la page de connexion affiche alors le message
      d'indisponibilité Google au lieu de planter).

## 6. À confirmer avec le propriétaire du projet

Fais ton choix par défaut, indique-le dans ton compte rendu, et ne bloque pas le travail :

1. **Identifiant client Google** du portail (à fournir ; laissé vide en attendant).
2. **Formes de réponse** de l'API (`LoginResponse`, `/auth/me`) : alignées sur le README backend, à confirmer
   dès que l'API tourne.
3. **Domaine du portail** : `SameSite=Strict` suppose que portail et API partagent le même site. Si ce n'est pas
   le cas, le transport par cookie doit être revu avec le backend.
4. **Tolérance du backend aux rafraîchissements simultanés** : le verrou inter-onglets couvre le cas courant,
   mais une courte fenêtre de grâce côté API le rendrait plus robuste. À discuter, pas à implémenter ici.

## 7. Hors périmètre

Application mobile (React Native), changement ou réinitialisation de mot de passe, invitation par email,
authentification à deux facteurs, déconnexion synchronisée entre onglets (`BroadcastChannel`), journal des
connexions, thème graphique définitif de la page de connexion, tests de bout en bout.
