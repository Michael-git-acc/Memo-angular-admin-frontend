import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  CreationEcoleForm,
  Ecole,
  EcolesFiltres,
  EcolesStatistiques,
  PaginatedEcolesResponse,
  StatutEcole,
} from '../models/ecole';

@Injectable({
  providedIn: 'root',
})
export class EcolesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/ecoles`;

  /**
   * Récupère la liste paginée et filtrée des écoles
   */
  getEcoles(filtres: EcolesFiltres): Observable<PaginatedEcolesResponse> {
    let params = new HttpParams()
      .set('page', filtres.page.toString())
      .set('limit', filtres.limit.toString());

    if (filtres.recherche && filtres.recherche.trim() !== '') {
      params = params.set('recherche', filtres.recherche.trim());
    }

    if (filtres.statut) {
      params = params.set('statut', filtres.statut);
    }

    if (filtres.region && filtres.region.trim() !== '') {
      params = params.set('region', filtres.region.trim());
    }

    if (filtres.ville && filtres.ville.trim() !== '') {
      params = params.set('ville', filtres.ville.trim());
    }

    return this.http.get<PaginatedEcolesResponse>(this.baseUrl, { params });
  }

  /**
   * Récupère les métriques globales des écoles pour les 4 cartes du tableau de bord
   */
  getStatistiques(): Observable<EcolesStatistiques> {
    return this.http.get<EcolesStatistiques>(`${this.baseUrl}/statistiques`);
  }

  /**
   * Récupère les régions distinctes pour alimenter les listes déroulantes
   */
  getRegions(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/regions`);
  }

  /**
   * Récupère les villes distinctes, éventuellement filtrées par région
   */
  getVilles(region?: string): Observable<string[]> {
    let params = new HttpParams();
    if (region && region.trim() !== '') {
      params = params.set('region', region.trim());
    }
    return this.http.get<string[]>(`${this.baseUrl}/villes`, { params });
  }

  /**
   * Récupère le détail d'une école par son ID
   */
  getEcoleById(id: string): Observable<Ecole> {
    return this.http.get<Ecole>(`${this.baseUrl}/${id}`);
  }

  /**
   * Crée une nouvelle école
   */
  createEcole(data: CreationEcoleForm): Observable<Ecole> {
    return this.http.post<Ecole>(this.baseUrl, data);
  }

  /**
   * Met à jour les informations d'une école
   */
  updateEcole(id: string, data: Partial<CreationEcoleForm>): Observable<Ecole> {
    return this.http.put<Ecole>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Modifie le statut d'une école (active, suspendue, desactivee)
   */
  changerStatut(id: string, statut: StatutEcole, motif?: string): Observable<Ecole> {
    return this.http.patch<Ecole>(`${this.baseUrl}/${id}/statut`, { statut, motif });
  }
}
