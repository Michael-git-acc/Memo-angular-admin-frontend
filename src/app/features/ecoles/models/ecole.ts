export type StatutEcole = 'active' | 'suspendue' | 'desactivee';
export type ModeDepassement = 'alerte' | 'blocage';

export interface Ecole {
  id: string;
  nom: string;
  domaine_google: string | null;
  statut: StatutEcole;
  region: string | null;
  ville: string | null;
  description: string | null;
  logo_url: string | null;
  responsables: string[] | null;
  quota_questions_mois: number | null;
  seuil_alerte_pct: number;
  mode_depassement: ModeDepassement;
  nb_utilisateurs: number;
  nb_documents: number;
  cree_a: string;
  mis_a_jour_a: string;
}

export interface EcolesStatistiques {
  total: number;
  actives: number;
  suspendues: number;
  desactivees: number;
  tendance_total_mois: string;
  tendance_actives_mois: string;
  tendance_suspendues_mois: string;
  tendance_desactivees_mois: string;
}

export interface EcolesFiltres {
  page: number;
  limit: number;
  recherche?: string;
  statut?: StatutEcole | '';
  region?: string;
  ville?: string;
}

export interface PaginatedEcolesResponse {
  data: Ecole[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreationEcoleForm {
  nom: string;
  domaine_google?: string | null;
  statut?: StatutEcole;
  region?: string | null;
  ville?: string | null;
  description?: string | null;
  logo_url?: string | null;
  responsables?: string[] | null;
  quota_questions_mois?: number | null;
  seuil_alerte_pct?: number;
  mode_depassement?: ModeDepassement;
}
