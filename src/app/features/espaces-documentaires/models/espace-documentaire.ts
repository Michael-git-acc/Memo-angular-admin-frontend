export type StatutEspace = 'actif' | 'inactif';

export type RoleSystemeEspace = 'public' | 'ecole';

export interface TypeEspace {
  id: string;
  nom: string;
  icone?: string | null;
  couleur?: string | null;
  ecole_id?: string | null;
}

export interface EspaceDocumentaire {
  id: string;
  ecole_id: string;
  ecole_nom?: string;
  parent_id: string | null;
  parent_nom?: string | null;
  type_id: string | null;
  type_nom?: string | null;
  type_couleur?: string | null;
  type_icone?: string | null;
  role_systeme: RoleSystemeEspace | string | null;
  nom: string;
  description: string | null;
  statut: StatutEspace;
  confidentialite: string;
  ordre: number;
  nb_sous_espaces: number;
  nb_documents: number;
  taille_documents_octets: number;
  enfants?: EspaceDocumentaire[];
  cree_a: string;
  mis_a_jour_a: string;
}

export interface EspacesStatistiques {
  total: number;
  espaces_principaux: number;
  sous_espaces: number;
  documents: number;
  ecoles_liees: number;
}

export interface EspacesFiltres {
  search?: string;
  ecole_id?: string;
  type_id?: string;
  statut?: StatutEspace | '';
  parent_id?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedEspacesResponse {
  data: EspaceDocumentaire[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreationEspaceForm {
  nom: string;
  ecole_id: string;
  parent_id?: string | null;
  type_id?: string | null;
  confidentialite?: string;
  description?: string | null;
}

export interface ModificationEspaceForm {
  nom?: string;
  type_id?: string | null;
  confidentialite?: string;
  description?: string | null;
  statut?: StatutEspace;
}

export interface DeplacerEspaceForm {
  nouveau_parent_id?: string | null;
}
