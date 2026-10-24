import { Pipe, PipeTransform } from '@angular/core';

const LIBELLES_PERMISSIONS: Record<string, string> = {
  gerer_utilisateurs: 'Gérer les utilisateurs',
  gerer_roles: 'Gérer les rôles et permissions',
  alimenter: 'Alimenter les documents',
  interroger: 'Interroger le système',
  consulter_historique: "Consulter l'historique d'audit",
};

@Pipe({
  name: 'permissionLabel',
})
export class PermissionLabelPipe implements PipeTransform {
  transform(code: string | null | undefined): string {
    if (!code) {
      return '';
    }
    return LIBELLES_PERMISSIONS[code] ?? code;
  }
}
