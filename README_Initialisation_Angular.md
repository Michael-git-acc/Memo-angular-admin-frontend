# Initialisation du portail d'administration Angular

Ce README est destiné à un agent de développement. Il décrit comment créer le squelette du portail
d'administration : structure de dossiers, règles d'architecture, éléments partagés et coquilles de modules.

**Périmètre : la structure uniquement. Aucune logique métier ne doit être écrite.**

---

## 0. Contexte

- Le portail s'adresse aux administrateurs d'école et de plateforme. L'application mobile (chat, recherche,
  hors ligne) est un autre projet (React Native) et n'en fait pas partie.
- Il consomme l'API NestJS du projet (monolithe modulaire). Le backend reste la seule source d'autorité sur
  les droits d'accès.
- Le portail est un projet autonome. Ne crée aucune dépendance vers le dépôt backend ni vers le mobile.

## 1. Ce que tu dois faire, et ne pas faire

**À faire**
- Créer le projet, installer les dépendances listées en section 3.
- Créer toute l'arborescence de la section 4.
- Implémenter **entièrement** les éléments partagés et transversaux (sections 6 et 7) : ils sont techniques,
  sans logique métier.
- Pour chaque module métier (section 8), créer uniquement la coquille : routes, page vide, service vide,
  modèles vides.

**À ne pas faire**
- Aucun appel API réel dans les modules métier, aucun formulaire, aucune règle métier.
- Aucune donnée fictive affichée comme si elle était réelle. Une page de module affiche seulement son titre.
- Ne pas ajouter de bibliothèque de composants UI (Angular Material, PrimeNG...) : SCSS simple et Angular CDK.
- Ne pas ajouter NgRx ni aucune autre bibliothèque d'état.
- Ne pas utiliser les Signal Forms ni `@angular/aria` (encore expérimentaux).
- Ne pas désactiver le mode strict TypeScript ni les règles de lint pour faire passer un build.

## 2. Décisions techniques à respecter

| Sujet | Décision |
|---|---|
| Framework | Angular 21, composants standalone uniquement (aucun NgModule) |
| Détection de changement | Zoneless (défaut en v21), `ChangeDetectionStrategy.OnPush` sur tous les composants |
| État | Signals, plus des services pour les flux asynchrones. Pas de bibliothèque d'état |
| Formulaires | Reactive Forms classiques |
| Routage | Lazy loading : un `loadChildren` par dossier de `features/` |
| Accessibilité | Angular CDK a11y (`LiveAnnouncer`, `FocusTrap`, `FocusMonitor`) |
| Tests | Vitest (défaut en v21), tests co-localisés `*.spec.ts` |
| Langue | Français, textes marqués avec l'attribut `i18n`, `@angular/localize` installé |
| Style | SCSS, variables CSS pour les couleurs, aucune couleur codée en dur dans un composant |

## 3. Création du projet

```bash
npm i -g @angular/cli
ng new portail-admin --routing --style=scss --ssr=false
cd portail-admin
ng add @angular/localize
npm install @angular/cdk
npm install -D prettier angular-eslint eslint-plugin-boundaries
```

Vérifie après création que le projet est bien zoneless (pas de `zone.js` dans `package.json` ni dans
`angular.json`) et que le runner de tests est Vitest. Si ce n'est pas le cas, corrige avant de continuer.

Dans `tsconfig.json`, garde `strict: true` et ajoute les alias :

```json
"paths": {
  "@core/*": ["src/app/core/*"],
  "@shared/*": ["src/app/shared/*"],
  "@features/*": ["src/app/features/*"],
  "@layout/*": ["src/app/layout/*"],
  "@env/*": ["src/environments/*"]
}
```

## 4. Arborescence à créer

```
src/
  app/
    app.config.ts
    app.routes.ts
    app.ts
    core/
      guards/
        auth.guard.ts
        permission.guard.ts
      interceptors/
        auth.interceptor.ts
        error.interceptor.ts
      services/
        auth.service.ts
        session.service.ts
      models/
        permission.ts
        utilisateur-session.ts
    shared/
      ui/
        toast/
          toast.service.ts
          toast.component.ts
          toast.types.ts
        confirm-dialog/
          confirm-dialog.service.ts
          confirm-dialog.component.ts
        loading/
          loading.service.ts
          loading-overlay.component.ts
        data-table/
          data-table.component.ts
          data-table.types.ts
        pagination/
          pagination.component.ts
      directives/
        has-permission.directive.ts
      pipes/
        date-format.pipe.ts
        permission-label.pipe.ts
      utils/
        error-message.util.ts
      models/
        page.ts
    features/
      auth/
      tableau-de-bord/
      ecoles/
      utilisateurs/
      roles/
      affectations/
      espaces-documentaires/
      documents/
      signalements/
      audit/
    layout/
      shell.component.ts
      sidebar/
        sidebar.component.ts
        navigation.config.ts
      topbar/
        topbar.component.ts
  environments/
    environment.ts
    environment.development.ts
```

Chaque dossier de `features/` suit la même coquille (exemple `roles/`) :

```
features/roles/
  roles.routes.ts
  pages/
    roles-page.component.ts      <- affiche uniquement le titre du module
  services/
    roles-api.service.ts          <- classe vide injectable, commentaire TODO
  models/
    role.ts                       <- interface vide, commentaire TODO
```

## 5. Règles d'architecture

À faire respecter par ESLint (`eslint-plugin-boundaries`) :

1. `features/*` peut importer `core`, `shared` et `layout`, mais **jamais un autre dossier de `features`**.
2. `shared` ne peut importer ni `features`, ni `core`, ni `layout`. Il reste sans état applicatif.
3. `core` ne peut importer ni `features`, ni `layout`.
4. `core` contient des singletons (instanciés une fois). Aucun composant visuel réutilisable n'y vit.
5. Chaque feature est chargée en lazy loading. Aucun import statique d'une feature dans `app.routes.ts`.
6. Les composants sont standalone, `OnPush`, et utilisent `inject()` plutôt que l'injection par constructeur.
7. L'état local d'un composant passe par des signals. Pas de `BehaviorSubject` pour de l'état simple.

> Point d'attention : la règle 2 interdit à `shared` d'importer `core`. Or `HasPermissionDirective` a besoin de
> `SessionService` (qui est dans `core`). Résous-le ainsi : définis dans `shared` un jeton d'injection
> `PERMISSION_CHECKER` (interface `{ aPermission(code: string): boolean }`) et fournis-le dans `app.config.ts`
> avec `SessionService`. La directive injecte le jeton, jamais `SessionService` directement. Même principe pour
> tout autre élément de `shared` qui aurait besoin d'un service de `core`.

Conventions de nommage :

| Élément | Convention | Exemple |
|---|---|---|
| Fichiers | kebab-case, suffixe selon le type | `data-table.component.ts` |
| Classes | PascalCase | `ToastService` |
| Interfaces / types | PascalCase, sans préfixe `I` | `Permission` |
| Variables / fonctions | camelCase | `hasPermission` |
| Sélecteurs de composants | préfixe `app-` | `app-toast` |
| Tests | `.spec.ts` co-localisé | `toast.service.spec.ts` |

## 6. Éléments transversaux (`core/`) à implémenter

### Modèles
- `permission.ts` : union de littéraux des codes de permission connus aujourd'hui (`'gerer_utilisateurs'`,
  `'gerer_roles'`, `'alimenter'`, `'interroger'`, `'consulter_historique'`). Commentaire en tête : cette liste
  doit rester alignée sur le catalogue de permissions du backend.
- `utilisateur-session.ts` : `{ id, email, nom, ecoleId, permissions: Permission[] }`.

### `SessionService`
Détient l'état de session sous forme de signals : l'utilisateur courant (`utilisateur`), un booléen dérivé
`estAuthentifie`, et les permissions courantes. Expose `definirSession()`, `effacerSession()` et
`aPermission(code)`. Le jeton d'accès est conservé **en mémoire seulement**, jamais dans `localStorage`.

### `AuthService`
Coquille : méthodes `connecterAvecGoogle(idToken)`, `connecterAdmin(email, motDePasse)`, `rafraichir()`,
`deconnecter()`. Chaque méthode contient un `// TODO` et lève une erreur « non implémenté ». Ne branche rien
sur l'API.

### Intercepteurs (fonctionnels, `HttpInterceptorFn`)
- `auth.interceptor.ts` : ajoute `Authorization: Bearer <jeton>` aux requêtes dont l'URL commence par
  `environment.apiUrl`, si un jeton existe. Laisse un `// TODO` pour le rafraîchissement sur 401.
- `error.interceptor.ts` : intercepte `HttpErrorResponse`, traduit l'erreur avec `error-message.util.ts`,
  appelle `ToastService.error(...)`, puis relance l'erreur. Exception : ne pas afficher de toast pour un
  401 (la déconnexion est gérée à part).

### Guards (fonctionnels)
- `auth.guard.ts` : laisse passer si `SessionService.estAuthentifie()`, sinon redirige vers `/connexion`.
- `permission.guard.ts` : lit `route.data['permission']` et laisse passer si
  `SessionService.aPermission(...)` est vrai, sinon redirige vers `/acces-refuse` (route à créer, simple
  page de message). Si la route ne déclare aucune permission, laisse passer.

Ces guards servent l'expérience de navigation. Ils ne remplacent jamais le contrôle du backend.

## 7. Éléments partagés (`shared/`) à implémenter

### `ToastService` et `ToastComponent`
- Un signal `toasts` en lecture seule, plus les méthodes `success`, `error`, `info`, `warning`, `dismiss`.
- Chaque toast a un `id` (`crypto.randomUUID()`), un type, un message, une durée (5 s par défaut, les erreurs
  restent 8 s). Fermeture automatique par `setTimeout`.
- `ToastComponent` est monté **une seule fois** dans le shell, lit le signal et annonce chaque nouveau toast
  via `LiveAnnouncer`. Chaque toast a un bouton de fermeture accessible au clavier.

### `ConfirmDialogService` et `ConfirmDialogComponent`
- Basés sur `Dialog` de `@angular/cdk/dialog` (piège de focus et fermeture avec Échap inclus).
- API : `ask({ title, message, confirmLabel?, cancelLabel?, danger? }): Promise<boolean>`.
- Si `danger` est vrai, le bouton de confirmation a un style d'avertissement. Le focus initial est sur le
  bouton « Annuler ».

### `LoadingService` et `LoadingOverlayComponent`
- Compteur interne (signal) pour gérer plusieurs opérations simultanées : `begin()`, `end()`,
  `isLoading = computed(...)`.
- L'overlay a `role="status"` et un texte masqué pour les lecteurs d'écran.

### `DataTableComponent` (générique)
Aucune logique métier. Entrées : `columns` (`{ key, label, sortable?, cellTemplate? }`), `rows`, `loading`,
`emptyMessage`. Sorties : `sortChange`, `rowClick`. Utilise un vrai `<table>` sémantique avec `<th scope="col">`
et `aria-sort`. Affiche un état vide et un état de chargement.

### `PaginationComponent`
Entrées : `page`, `pageSize`, `total`. Sortie : `pageChange`. Boutons précédent / suivant avec
`aria-label`, et indication de la page courante.

### `shared/models/page.ts`
```typescript
export interface Page<T> { items: T[]; total: number; page: number; limit: number; }
```
Ce format est une hypothèse à confirmer avec le `PaginationDto` du backend.

### `HasPermissionDirective`
Directive structurelle `*hasPermission="'gerer_roles'"` : affiche le contenu si le vérificateur de permissions
(jeton `PERMISSION_CHECKER`, voir le point d'attention de la section 5) répond vrai, le retire sinon, et réagit
aux changements du signal sous-jacent.

### Pipes et utilitaires
- `DateFormatPipe` : format `dd/MM/yyyy HH:mm`, locale `fr`.
- `PermissionLabelPipe` : traduit un code de permission en libellé français (table de correspondance locale,
  repli sur le code brut si inconnu).
- `error-message.util.ts` : fonction `messageErreur(err: HttpErrorResponse): string` avec un message français par
  statut (0 réseau, 400, 403, 404, 409, 422, 429, 5xx) et un message générique en repli. Ne pas exposer de
  détails techniques ni de stack trace.

## 8. Modules métier (`features/`) : coquilles uniquement

Chaque module reçoit la coquille décrite en section 4 et une route paresseuse déclarée dans `app.routes.ts`.
La permission indiquée est un **espace réservé** : elle alimente `data.permission` pour que le mécanisme soit
en place, mais sa valeur définitive sera fixée avec le backend.

| Route | Dossier | Titre de page | Permission (provisoire) |
|---|---|---|---|
| `/connexion` | `auth` | Connexion | publique |
| `/tableau-de-bord` | `tableau-de-bord` | Tableau de bord | aucune |
| `/ecoles` | `ecoles` | Écoles | à définir |
| `/utilisateurs` | `utilisateurs` | Utilisateurs | `gerer_utilisateurs` |
| `/roles` | `roles` | Rôles et permissions | `gerer_roles` |
| `/affectations` | `affectations` | Affectations | `gerer_utilisateurs` |
| `/espaces-documentaires` | `espaces-documentaires` | Espaces documentaires | à définir |
| `/documents` | `documents` | Documents | `alimenter` |
| `/signalements` | `signalements` | Signalements | à définir |
| `/audit` | `audit` | Audit | à définir |

Deux précisions :
- **Tableau de bord :** il n'a aucune donnée propre. Dans la coquille, son service est vide avec un commentaire
  indiquant qu'il agrégera des données fournies par l'API.
- **Connexion :** la page affiche seulement le titre et un bouton désactivé « Se connecter avec Google ».
  Aucun appel à Google ni à l'API. Elle se trouve hors du `ShellComponent` et sans `authGuard`.

Crée aussi les deux pages hors modules, en simple message : `/acces-refuse` et une route `**` « Page
introuvable ».

## 9. Layout

- `ShellComponent` : assemble `SidebarComponent`, `TopbarComponent`, le `<router-outlet>`, le
  `ToastComponent` et le `LoadingOverlayComponent`. Landmarks HTML (`<nav>`, `<main>`, `<header>`) et lien
  « Aller au contenu » en première position.
- `navigation.config.ts` : tableau typé d'entrées `{ libelle, route, permission? }` correspondant au tableau de
  la section 8. La sidebar le parcourt et masque les entrées avec `*hasPermission`.
- `TopbarComponent` : affiche le nom de l'utilisateur de `SessionService` et un bouton de déconnexion
  (appelle `AuthService.deconnecter()`, qui reste une coquille).

## 10. Configuration

`app.config.ts` doit déclarer : `provideRouter(routes)`, `provideHttpClient(withInterceptors([authInterceptor,
errorInterceptor]))`, `provideBrowserGlobalErrorListeners()`, la détection de changement zoneless, et le
fournisseur du jeton `PERMISSION_CHECKER` (`useExisting: SessionService`).

`environment.ts` et `environment.development.ts` exposent au minimum :

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
};
```

Dans `app.routes.ts`, les routes protégées passent sous le `ShellComponent` avec `canActivate: [authGuard]`.
Chaque route de module ajoute `canActivate: [permissionGuard]` et `data: { permission: ... }` quand une
permission est définie.

## 11. Qualité

- ESLint : règles `angular-eslint` (dont les règles d'accessibilité des templates) et règles de frontières de
  la section 5.
- Prettier configuré, un script `npm run format`.
- Un test Vitest minimal pour chaque élément partagé implémenté : `ToastService` (ajout, fermeture,
  expiration), `LoadingService` (compteur), `HasPermissionDirective`, `permission.guard`,
  `error-message.util`.

## 12. Critères de fin

- [ ] `ng build` réussit sans avertissement.
- [ ] `ng test` réussit.
- [ ] `ng lint` réussit, y compris les règles de frontières.
- [ ] Toutes les routes de la section 8 s'ouvrent et affichent leur titre.
- [ ] Chaque feature produit un chunk distinct dans le build (lazy loading vérifié).
- [ ] Aucune dépendance à `zone.js`, `@angular/material` ni `@ngrx/*`.
- [ ] Aucun import de `core` depuis `shared` (la règle 2 est effectivement vérifiée par le lint).
- [ ] Aucun appel HTTP réel dans les modules métier, aucune donnée fictive.
- [ ] Un toast, une confirmation et un overlay de chargement se déclenchent depuis une page de démonstration
      temporaire, qui est **supprimée** avant de rendre le travail.

## 13. Hors périmètre

Authentification réelle, formulaires, tableaux alimentés par l'API, gestion des rôles et des affectations,
import de fichiers, tableau de bord réel, thème graphique définitif, tests de bout en bout.
