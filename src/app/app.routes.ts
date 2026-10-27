import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { guestGuard } from '@core/guards/guest.guard';
import { permissionGuard } from '@core/guards/permission.guard';
import { ShellComponent } from '@layout/shell.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'tableau-de-bord',
  },
  {
    path: 'connexion',
    canActivate: [guestGuard],
    loadChildren: () => import('@features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'acces-refuse',
    loadComponent: () =>
      import('./pages/acces-refuse-page.component').then((m) => m.AccesRefusePageComponent),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'tableau-de-bord',
        loadChildren: () =>
          import('@features/tableau-de-bord/tableau-de-bord.routes').then(
            (m) => m.TABLEAU_DE_BORD_ROUTES,
          ),
      },
      {
        path: 'ecoles',
        loadChildren: () =>
          import('@features/ecoles/ecoles.routes').then((m) => m.ECOLES_ROUTES),
      },
      {
        path: 'utilisateurs',
        canActivate: [permissionGuard],
        data: { permission: 'gerer_utilisateurs' },
        loadChildren: () =>
          import('@features/utilisateurs/utilisateurs.routes').then(
            (m) => m.UTILISATEURS_ROUTES,
          ),
      },
      {
        path: 'roles',
        canActivate: [permissionGuard],
        data: { permission: 'gerer_roles' },
        loadChildren: () =>
          import('@features/roles/roles.routes').then((m) => m.ROLES_ROUTES),
      },
      {
        path: 'affectations',
        canActivate: [permissionGuard],
        data: { permission: 'gerer_utilisateurs' },
        loadChildren: () =>
          import('@features/affectations/affectations.routes').then(
            (m) => m.AFFECTATIONS_ROUTES,
          ),
      },
      {
        path: 'espaces-documentaires',
        loadChildren: () =>
          import('@features/espaces-documentaires/espaces-documentaires.routes').then(
            (m) => m.ESPACES_DOCUMENTAIRES_ROUTES,
          ),
      },
      {
        path: 'documents',
        canActivate: [permissionGuard],
        data: { permission: 'alimenter' },
        loadChildren: () =>
          import('@features/documents/documents.routes').then((m) => m.DOCUMENTS_ROUTES),
      },
      {
        path: 'signalements',
        loadChildren: () =>
          import('@features/signalements/signalements.routes').then(
            (m) => m.SIGNALEMENTS_ROUTES,
          ),
      },
      {
        path: 'audit',
        loadChildren: () =>
          import('@features/audit/audit.routes').then((m) => m.AUDIT_ROUTES),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/page-introuvable.component').then((m) => m.PageIntrouvableComponent),
  },
];
