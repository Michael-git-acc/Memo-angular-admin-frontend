import { Permission } from './permission';

export interface UtilisateurSession {
  id: string;
  email: string;
  nom: string;
  ecoleId?: string | null;
  permissions: Permission[];
}
