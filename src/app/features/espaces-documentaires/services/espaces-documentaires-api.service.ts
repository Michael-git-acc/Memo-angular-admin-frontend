import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  EspaceDocumentaire,
  TypeEspace,
  EspacesStatistiques,
  EspacesFiltres,
  PaginatedEspacesResponse,
  CreationEspaceForm,
  ModificationEspaceForm,
  DeplacerEspaceForm,
  StatutEspace,
} from '../models/espace-documentaire';

@Injectable({
  providedIn: 'root',
})
export class EspacesDocumentairesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/espaces-documentaires`;

  /**
   * Récupère les 4 métriques KPI pour le bandeau bas
   */
  getStatistiques(ecoleId?: string): Observable<EspacesStatistiques> {
    let params = new HttpParams();
    if (ecoleId) {
      params = params.set('ecole_id', ecoleId);
    }
    return this.http.get<EspacesStatistiques>(`${this.baseUrl}/statistiques`, { params });
  }

  /**
   * Récupère l'arbre complet des espaces pour la vue Figma Weave
   */
  getArbre(ecoleId?: string): Observable<EspaceDocumentaire[]> {
    let params = new HttpParams();
    if (ecoleId) {
      params = params.set('ecole_id', ecoleId);
    }
    return this.http.get<EspaceDocumentaire[]>(`${this.baseUrl}/arbre`, { params });
  }

  /**
   * Récupère la liste paginée et filtrée pour la vue liste
   */
  getEspaces(filtres: EspacesFiltres): Observable<PaginatedEspacesResponse> {
    let params = new HttpParams()
      .set('page', (filtres.page || 1).toString())
      .set('limit', (filtres.limit || 10).toString());

    if (filtres.search && filtres.search.trim() !== '') {
      params = params.set('search', filtres.search.trim());
    }
    if (filtres.ecole_id) {
      params = params.set('ecole_id', filtres.ecole_id);
    }
    if (filtres.type_id) {
      params = params.set('type_id', filtres.type_id);
    }
    if (filtres.parent_id) {
      params = params.set('parent_id', filtres.parent_id);
    }
    if (filtres.statut) {
      params = params.set('statut', filtres.statut);
    }

    return this.http.get<PaginatedEspacesResponse>(this.baseUrl, { params });
  }

  /**
   * Récupère les détails complets d'un espace
   */
  getEspaceById(id: string): Observable<EspaceDocumentaire> {
    return this.http.get<EspaceDocumentaire>(`${this.baseUrl}/${id}`);
  }

  /**
   * Récupère la lignée d'ancêtres d'un espace (pour le fil d'Ariane ou aperçu d'accès)
   */
  getAncetres(id: string): Observable<EspaceDocumentaire[]> {
    return this.http.get<EspaceDocumentaire[]>(`${this.baseUrl}/${id}/ancetres`);
  }

  /**
   * Récupère la liste des écoles pour les filtres et formulaires
   */
  getEcoles(): Observable<{ data: { id: string; nom: string }[] }> {
    return this.http.get<{ data: { id: string; nom: string }[] }>(`${environment.apiUrl}/ecoles`, {
      params: { page: '1', limit: '100' },
    });
  }

  /**
   * Récupère le catalogue des types d'espaces
   */
  getTypes(ecoleId?: string): Observable<TypeEspace[]> {
    let params = new HttpParams();
    if (ecoleId) {
      params = params.set('ecole_id', ecoleId);
    }
    return this.http.get<TypeEspace[]>(`${this.baseUrl}/types`, { params });
  }

  /**
   * Création d'un espace documentaire
   */
  creerEspace(dto: CreationEspaceForm): Observable<EspaceDocumentaire> {
    return this.http.post<EspaceDocumentaire>(this.baseUrl, dto);
  }

  /**
   * Modification d'un espace documentaire
   */
  modifierEspace(id: string, dto: ModificationEspaceForm): Observable<EspaceDocumentaire> {
    return this.http.put<EspaceDocumentaire>(`${this.baseUrl}/${id}`, dto);
  }

  /**
   * Déplacement d'un espace vers un autre parent
   */
  deplacerEspace(id: string, dto: DeplacerEspaceForm): Observable<EspaceDocumentaire> {
    return this.http.patch<EspaceDocumentaire>(`${this.baseUrl}/${id}/deplacer`, dto);
  }

  /**
   * Modification du statut (actif/inactif)
   */
  changerStatut(id: string, statut: StatutEspace): Observable<EspaceDocumentaire> {
    return this.http.patch<EspaceDocumentaire>(`${this.baseUrl}/${id}/statut`, { statut });
  }

  /**
   * Suppression d'un espace
   */
  supprimerEspace(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
