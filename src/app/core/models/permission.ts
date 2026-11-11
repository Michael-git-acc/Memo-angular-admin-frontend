/**
 * Catalogue des permissions de l'application.
 * Cette liste doit rester alignée sur le catalogue de permissions du backend.
 */
export type Permission =
  | 'gerer_ecoles'
  | 'gerer_espaces'
  | 'gerer_utilisateurs'
  | 'gerer_roles'
  | 'alimenter'
  | 'interroger'
  | 'consulter_historique';
