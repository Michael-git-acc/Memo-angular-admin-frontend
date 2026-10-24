export interface NavigationEntry {
  libelle: string;
  route: string;
  permission?: string;
}

export const NAVIGATION_ENTRIES: readonly NavigationEntry[] = [
  { libelle: 'Tableau de bord', route: '/tableau-de-bord' },
  { libelle: 'Écoles', route: '/ecoles' },
  { libelle: 'Utilisateurs', route: '/utilisateurs', permission: 'gerer_utilisateurs' },
  { libelle: 'Rôles et permissions', route: '/roles', permission: 'gerer_roles' },
  { libelle: 'Affectations', route: '/affectations', permission: 'gerer_utilisateurs' },
  { libelle: 'Espaces documentaires', route: '/espaces-documentaires' },
  { libelle: 'Documents', route: '/documents', permission: 'alimenter' },
  { libelle: 'Signalements', route: '/signalements' },
  { libelle: 'Audit', route: '/audit' },
];
