import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import { EcolesApiService } from '../services/ecoles-api.service';
import {
  CreationEcoleForm,
  Ecole,
  EcolesFiltres,
  EcolesStatistiques,
  StatutEcole,
} from '../models/ecole';
import {
  EcoleFormModalComponent,
  EcoleModalData,
} from '../components/ecole-form-modal/ecole-form-modal.component';
import {
  EcoleDetailModalComponent,
  EcoleDetailModalResult,
} from '../components/ecole-detail-modal/ecole-detail-modal.component';
import { ConfirmDialogService } from '@shared/ui/confirm-dialog/confirm-dialog.service';
import { ToastService } from '@shared/ui/toast/toast.service';

@Component({
  selector: 'app-ecoles-page',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ecoles-page-wrapper">
      <!-- En-tête de la page -->
      <header class="page-header">
        <div class="header-titles">
          <span class="category-tag">GESTION DES ÉCOLES</span>
          <h1 class="main-title">Toutes vos écoles</h1>
          <p class="subtitle">Gérez, ajoutez et administrez les écoles de la plateforme.</p>
        </div>

        <button
          type="button"
          class="btn-ajouter"
          (click)="ouvrirModalAjout()"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Ajouter une école</span>
        </button>
      </header>

      <!-- Cartes Statistiques KPI (4 cartes) -->
      <section class="stats-grid" aria-label="Indicateurs clés des écoles">
        <!-- Carte 1 : Total -->
        <div class="stat-card">
          <div class="stat-icon-wrapper icon-total">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 21h18"></path>
              <path d="M5 21V7l8-4v18"></path>
              <path d="M19 21V11l-6-4"></path>
              <path d="M9 9h1"></path>
              <path d="M9 13h1"></path>
              <path d="M9 17h1"></path>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">Total des écoles</span>
            <div class="stat-value-row">
              <span class="stat-value">{{ statistiques()?.total ?? ecoles().length }}</span>
            </div>
            <span class="stat-trend trend-positive">
              {{ statistiques()?.tendance_total_mois || '↑ +2 ce mois-ci' }}
            </span>
          </div>
        </div>

        <!-- Carte 2 : Actives -->
        <div class="stat-card">
          <div class="stat-icon-wrapper icon-actives">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">Écoles actives</span>
            <div class="stat-value-row">
              <span class="stat-value">{{ statistiques()?.actives ?? totalActives() }}</span>
            </div>
            <span class="stat-trend trend-positive">
              {{ statistiques()?.tendance_actives_mois || '↑ +3 ce mois-ci' }}
            </span>
          </div>
        </div>

        <!-- Carte 3 : Suspendues -->
        <div class="stat-card">
          <div class="stat-icon-wrapper icon-suspendues">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="10" y1="15" x2="10" y2="9"></line>
              <line x1="14" y1="15" x2="14" y2="9"></line>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">Écoles suspendues</span>
            <div class="stat-value-row">
              <span class="stat-value">{{ statistiques()?.suspendues ?? totalSuspendues() }}</span>
            </div>
            <span class="stat-trend trend-negative">
              {{ statistiques()?.tendance_suspendues_mois || '↓ -1 ce mois-ci' }}
            </span>
          </div>
        </div>

        <!-- Carte 4 : Désactivées -->
        <div class="stat-card">
          <div class="stat-icon-wrapper icon-desactivees">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">Écoles désactivées</span>
            <div class="stat-value-row">
              <span class="stat-value">{{ statistiques()?.desactivees ?? totalDesactivees() }}</span>
            </div>
            <span class="stat-trend trend-neutral">
              {{ statistiques()?.tendance_desactivees_mois || '0 ce mois-ci' }}
            </span>
          </div>
        </div>
      </section>

      <!-- Barre de Recherche et Filtres -->
      <section class="filters-bar" aria-label="Recherche et filtres d'écoles">
        <!-- Recherche textuelle -->
        <div class="search-input-wrap">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            class="search-input"
            placeholder="Rechercher une école..."
            [ngModel]="filtreRecherche()"
            (ngModelChange)="surRechercheChange($event)"
          />
          @if (filtreRecherche()) {
            <button
              type="button"
              class="btn-clear-search"
              (click)="reinitialiserRecherche()"
              aria-label="Effacer la recherche"
            >
              &times;
            </button>
          }
        </div>

        <div class="filters-group">
          <!-- Filtre Statut -->
          <div class="filter-select-wrap">
            <label for="filtre-statut" class="filter-label">Statut</label>
            <select
              id="filtre-statut"
              class="filter-select"
              [ngModel]="filtreStatut()"
              (ngModelChange)="surStatutChange($event)"
            >
              <option value="">Tous</option>
              <option value="active">Active</option>
              <option value="suspendue">Suspendue</option>
              <option value="desactivee">Désactivée</option>
            </select>
          </div>

          <!-- Filtre Région -->
          <div class="filter-select-wrap">
            <label for="filtre-region" class="filter-label">Région</label>
            <select
              id="filtre-region"
              class="filter-select"
              [ngModel]="filtreRegion()"
              (ngModelChange)="surRegionChange($event)"
            >
              <option value="">Toutes</option>
              @for (reg of regions(); track reg) {
                <option [value]="reg">{{ reg }}</option>
              }
            </select>
          </div>

          <!-- Filtre Ville -->
          <div class="filter-select-wrap">
            <label for="filtre-ville" class="filter-label">Ville</label>
            <select
              id="filtre-ville"
              class="filter-select"
              [ngModel]="filtreVille()"
              (ngModelChange)="surVilleChange($event)"
            >
              <option value="">Toutes</option>
              @for (v of villes(); track v) {
                <option [value]="v">{{ v }}</option>
              }
            </select>
          </div>

          <!-- Bouton Filtres / Réinitialisation -->
          <button
            type="button"
            class="btn-filter-settings"
            (click)="reinitialiserFiltres()"
            title="Réinitialiser tous les filtres"
            aria-label="Réinitialiser les filtres"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="4" y1="21" x2="4" y2="14"></line>
              <line x1="4" y1="10" x2="4" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12" y2="3"></line>
              <line x1="20" y1="21" x2="20" y2="16"></line>
              <line x1="20" y1="12" x2="20" y2="3"></line>
              <line x1="1" y1="14" x2="7" y2="14"></line>
              <line x1="9" y1="8" x2="15" y2="8"></line>
              <line x1="17" y1="16" x2="23" y2="16"></line>
            </svg>
          </button>
        </div>
      </section>

      <!-- Grille de Cartes d'Écoles (3 colonnes) -->
      @if (enChargement()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Chargement des écoles en cours...</p>
        </div>
      } @else if (ecoles().length === 0) {
        <div class="empty-state">
          <div class="empty-icon-wrap">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3 21h18"></path>
              <path d="M5 21V7l8-4v18"></path>
              <path d="M19 21V11l-6-4"></path>
            </svg>
          </div>
          <h3>Aucune école trouvée</h3>
          <p>Aucun établissement ne correspond aux critères de recherche actuels.</p>
          <button type="button" class="btn btn-secondary mt-3" (click)="reinitialiserFiltres()">
            Effacer les filtres
          </button>
        </div>
      } @else {
        <section class="schools-grid">
          @for (ecole of ecoles(); track ecole.id) {
            <article class="school-card" [class.is-suspended]="ecole.statut === 'suspendue'" [class.is-deactivated]="ecole.statut === 'desactivee'">
              <!-- Haut de carte : Logo, Nom, Badge Statut, Lieu -->
              <div class="card-top">
                <div class="card-logo-wrap" [style.border-color]="obtenirCouleurBordure(ecole)">
                  @if (ecole.logo_url) {
                    <img [src]="ecole.logo_url" [alt]="ecole.nom" class="school-logo-img" />
                  } @else {
                    <div class="school-logo-initials" [style.background]="obtenirGradientInitiales(ecole)">
                      {{ obtenirInitiales(ecole.nom) }}
                    </div>
                  }
                </div>

                <div class="card-main-info">
                  <div class="card-title-line">
                    <button
                      type="button"
                      class="school-name-btn"
                      [title]="ecole.nom"
                      (click)="ouvrirModalDetail(ecole)"
                    >
                      <h3 class="school-name">{{ ecole.nom }}</h3>
                    </button>
                    <svg class="verified-check" width="15" height="15" viewBox="0 0 24 24" fill="#3b82f6">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>

                  <div class="school-location">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>{{ ecole.ville || 'Ville' }} • {{ ecole.region || 'Région' }}</span>
                  </div>
                </div>

                <span class="status-badge badge-{{ ecole.statut }}">
                  {{ libelleStatut(ecole.statut) }}
                </span>
              </div>

              <!-- Milieu de carte : Description (2 lignes max) -->
              <p class="card-description" [title]="ecole.description || ''">
                {{ ecole.description || 'Établissement rattaché à la plateforme pédagogique Mémoclip.' }}
              </p>

              <!-- Bas de carte : Compteurs utilisateurs/documents & Actions -->
              <div class="card-footer">
                <div class="footer-counters">
                  <div class="counter-item" title="Utilisateurs rattachés">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span>{{ ecole.nb_utilisateurs }} utilisateurs</span>
                  </div>

                  <div class="counter-item" title="Documents indexés">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <span>{{ ecole.nb_documents }} documents</span>
                  </div>
                </div>

                <div class="footer-actions-wrap">
                  <!-- Bouton menu contextuel ... -->
                  <div class="dropdown-wrap">
                    <button
                      type="button"
                      class="btn-icon-action"
                      (click)="basculerMenu(ecole.id, $event)"
                      aria-label="Options de gestion"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="19" cy="12" r="1"></circle>
                        <circle cx="5" cy="12" r="1"></circle>
                      </svg>
                    </button>

                    @if (menuOuvertId() === ecole.id) {
                      <div
                        class="context-menu"
                        role="menu"
                        tabindex="-1"
                        (click)="$event.stopPropagation()"
                        (keydown)="$event.stopPropagation()"
                      >
                        <button type="button" class="menu-item" (click)="ouvrirModalDetail(ecole)">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                          </svg>
                          Voir les détails
                        </button>
                        <button type="button" class="menu-item" (click)="ouvrirModalEdition(ecole)">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                          Modifier l'école
                        </button>

                        <div class="menu-divider"></div>

                        @if (ecole.statut !== 'active') {
                          <button type="button" class="menu-item text-success" (click)="confirmerChangementStatut(ecole, 'active')">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Activer l'école
                          </button>
                        }
                        @if (ecole.statut !== 'suspendue') {
                          <button type="button" class="menu-item text-warning" (click)="confirmerChangementStatut(ecole, 'suspendue')">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="10" y1="15" x2="10" y2="9"></line>
                              <line x1="14" y1="15" x2="14" y2="9"></line>
                            </svg>
                            Suspendre l'école
                          </button>
                        }
                        @if (ecole.statut !== 'desactivee') {
                          <button type="button" class="menu-item text-danger" (click)="confirmerChangementStatut(ecole, 'desactivee')">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            Désactiver l'école
                          </button>
                        }
                      </div>
                    }
                  </div>

                  <!-- Bouton chevron > vers détails -->
                  <button
                    type="button"
                    class="btn-icon-chevron"
                    (click)="ouvrirModalDetail(ecole)"
                    aria-label="Accéder à l'école"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            </article>
          }
        </section>

        <!-- Pagination de bas de page -->
        <footer class="pagination-footer">
          <div class="pagination-info">
            Affichage de {{ pageEcolesDebut() }}-{{ pageEcolesFin() }} sur {{ totalEcoles() }} écoles
          </div>

          <div class="pagination-controls">
            <button
              type="button"
              class="page-btn nav-btn"
              [disabled]="pageCourante() <= 1"
              (click)="changerPage(pageCourante() - 1)"
              aria-label="Page précédente"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            @for (p of pages(); track p) {
              <button
                type="button"
                class="page-btn num-btn"
                [class.active]="p === pageCourante()"
                (click)="changerPage(p)"
              >
                {{ p }}
              </button>
            }

            <button
              type="button"
              class="page-btn nav-btn"
              [disabled]="pageCourante() >= totalPages()"
              (click)="changerPage(pageCourante() + 1)"
              aria-label="Page suivante"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </footer>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .ecoles-page-wrapper {
      max-width: 1280px;
      margin: 0 auto;
      padding-bottom: 3rem;
    }

    /* En-tête */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      gap: 1.5rem;
    }

    .category-tag {
      font-size: 0.6875rem;
      font-weight: 700;
      color: #6366f1;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      display: inline-block;
      margin-bottom: 0.35rem;
    }

    .main-title {
      font-size: 1.875rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin: 0 0 0.35rem 0;
      line-height: 1.2;
    }

    .subtitle {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0;
    }

    .btn-ajouter {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.4rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
      color: #ffffff;
      background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
      border: none;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 18px rgba(37, 99, 235, 0.45);
        opacity: 0.95;
      }

      &:active {
        transform: translateY(0);
      }
    }

    /* Grille de stats (4 cartes) */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
      margin-bottom: 2rem;

      @media (max-width: 1024px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (max-width: 640px) {
        grid-template-columns: 1fr;
      }
    }

    .stat-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 1.25rem;
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      transition: box-shadow 0.2s ease;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
      }
    }

    .stat-icon-wrapper {
      width: 46px;
      height: 46px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &.icon-total {
        background: #eff6ff;
        color: #2563eb;
      }
      &.icon-actives {
        background: #ecfdf5;
        color: #059669;
      }
      &.icon-suspendues {
        background: #fff1f2;
        color: #e11d48;
      }
      &.icon-desactivees {
        background: #f1f5f9;
        color: #64748b;
      }
    }

    .stat-content {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .stat-label {
      font-size: 0.8125rem;
      font-weight: 500;
      color: #64748b;
    }

    .stat-value {
      font-size: 1.625rem;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.2;
    }

    .stat-trend {
      font-size: 0.75rem;
      font-weight: 600;

      &.trend-positive {
        color: #16a34a;
      }
      &.trend-negative {
        color: #e11d48;
      }
      &.trend-neutral {
        color: #94a3b8;
      }
    }

    /* Barre de recherche et filtres */
    .filters-bar {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 0.875rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 2rem;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);

      @media (max-width: 900px) {
        flex-direction: column;
        align-items: stretch;
      }
    }

    .search-input-wrap {
      position: relative;
      flex: 1;
      min-width: 260px;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 0.875rem;
      color: #94a3b8;
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      padding: 0.65rem 2.25rem 0.65rem 2.6rem;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      font-size: 0.875rem;
      color: #0f172a;
      background: #f8fafc;
      outline: none;
      transition: all 0.15s ease;

      &:focus {
        background: #ffffff;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
      }

      &::placeholder {
        color: #94a3b8;
      }
    }

    .btn-clear-search {
      position: absolute;
      right: 0.75rem;
      background: none;
      border: none;
      font-size: 1.25rem;
      color: #94a3b8;
      cursor: pointer;
      line-height: 1;

      &:hover {
        color: #0f172a;
      }
    }

    .filters-group {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .filter-select-wrap {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .filter-label {
      font-size: 0.8125rem;
      font-weight: 500;
      color: #64748b;
      white-space: nowrap;
    }

    .filter-select {
      padding: 0.55rem 2rem 0.55rem 0.85rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.8125rem;
      color: #0f172a;
      background-color: #ffffff;
      outline: none;
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 0.65rem center;
      background-size: 12px;

      &:focus {
        border-color: #3b82f6;
      }
    }

    .btn-filter-settings {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      background: #ffffff;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        background: #f1f5f9;
        color: #0f172a;
        border-color: #cbd5e1;
      }
    }

    /* Grille des cartes d'écoles (3 colonnes) */
    .schools-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      margin-bottom: 2.5rem;

      @media (max-width: 1150px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (max-width: 720px) {
        grid-template-columns: 1fr;
      }
    }

    .school-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 200px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
        border-color: #cbd5e1;
      }

      &.is-suspended {
        border-left: 4px solid #f43f5e;
      }

      &.is-deactivated {
        opacity: 0.75;
        border-left: 4px solid #94a3b8;
      }
    }

    .card-top {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      position: relative;
    }

    .card-logo-wrap {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 2px solid #e2e8f0;
      overflow: hidden;
      flex-shrink: 0;
      background: #f8fafc;
    }

    .school-logo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .school-logo-initials {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.875rem;
      color: #ffffff;
    }

    .card-main-info {
      flex: 1;
      min-width: 0;
    }

    .card-title-line {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .school-name-btn {
      background: none;
      border: none;
      padding: 0;
      text-align: left;
      cursor: pointer;
      min-width: 0;
      overflow: hidden;
      display: inline-block;
    }

    .school-name {
      margin: 0;
      font-size: 0.9375rem;
      font-weight: 700;
      color: #0f172a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      &:hover {
        color: #2563eb;
      }
    }

    .verified-check {
      flex-shrink: 0;
    }

    .school-location {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      margin-top: 0.2rem;
      font-size: 0.75rem;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .status-badge {
      font-size: 0.6875rem;
      font-weight: 600;
      padding: 0.2rem 0.55rem;
      border-radius: 9999px;
      flex-shrink: 0;
      text-transform: capitalize;

      &.badge-active {
        background: #ecfdf5;
        color: #059669;
        border: 1px solid #a7f3d0;
      }
      &.badge-suspendue {
        background: #fff1f2;
        color: #e11d48;
        border: 1px solid #fecdd3;
      }
      &.badge-desactivee {
        background: #f1f5f9;
        color: #64748b;
        border: 1px solid #e2e8f0;
      }
    }

    .card-description {
      margin: 0.85rem 0 1rem 0;
      font-size: 0.8125rem;
      line-height: 1.45;
      color: #475569;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.75rem;
      border-top: 1px solid #f1f5f9;
      margin-top: auto;
    }

    .footer-counters {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      font-size: 0.75rem;
      color: #64748b;
    }

    .counter-item {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .footer-actions-wrap {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .btn-icon-action,
    .btn-icon-chevron {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      border: none;
      background: transparent;
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        background: #f1f5f9;
        color: #0f172a;
      }
    }

    .dropdown-wrap {
      position: relative;
    }

    .context-menu {
      position: absolute;
      right: 0;
      bottom: calc(100% + 6px);
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      min-width: 170px;
      z-index: 100;
      padding: 0.35rem 0;
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.5rem 0.85rem;
      border: none;
      background: transparent;
      font-size: 0.8125rem;
      color: #334155;
      text-align: left;
      cursor: pointer;
      transition: background-color 0.1s ease;

      &:hover {
        background: #f8fafc;
        color: #0f172a;
      }

      &.text-success {
        color: #16a34a;
        &:hover {
          background: #f0fdf4;
        }
      }

      &.text-warning {
        color: #d97706;
        &:hover {
          background: #fffbeb;
        }
      }

      &.text-danger {
        color: #dc2626;
        &:hover {
          background: #fef2f2;
        }
      }
    }

    .menu-divider {
      height: 1px;
      background: #f1f5f9;
      margin: 0.25rem 0;
    }

    /* Footer Pagination */
    .pagination-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1.5rem;
      border-top: 1px solid #e2e8f0;
      font-size: 0.8125rem;
      color: #64748b;

      @media (max-width: 640px) {
        flex-direction: column;
        gap: 1rem;
      }
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .page-btn {
      min-width: 32px;
      height: 32px;
      padding: 0 0.5rem;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      background: #ffffff;
      color: #475569;
      font-size: 0.8125rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover:not(:disabled) {
        background: #f8fafc;
        border-color: #cbd5e1;
        color: #0f172a;
      }

      &.active {
        background: #2563eb;
        border-color: #2563eb;
        color: #ffffff;
        font-weight: 700;
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }

    /* États vide et chargement */
    .loading-state,
    .empty-state {
      text-align: center;
      padding: 4rem 1rem;
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      color: #64748b;
    }

    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid #e2e8f0;
      border-top-color: #2563eb;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 1rem auto;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .empty-icon-wrap {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #f1f5f9;
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem auto;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EcolesPageComponent implements OnInit {
  private readonly ecolesApi = inject(EcolesApiService);
  private readonly dialog = inject(Dialog);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly toastService = inject(ToastService);

  // Signaux d'état
  protected readonly ecoles = signal<Ecole[]>([]);
  protected readonly statistiques = signal<EcolesStatistiques | null>(null);
  protected readonly totalEcoles = signal<number>(0);
  protected readonly pageCourante = signal<number>(1);
  protected readonly limite = signal<number>(9);
  protected readonly totalPages = signal<number>(1);
  protected readonly enChargement = signal<boolean>(false);

  // Signaux de filtres
  protected readonly filtreRecherche = signal<string>('');
  protected readonly filtreStatut = signal<StatutEcole | ''>('');
  protected readonly filtreRegion = signal<string>('');
  protected readonly filtreVille = signal<string>('');

  // Listes pour menus déroulants
  protected readonly regions = signal<string[]>([]);
  protected readonly villes = signal<string[]>([]);

  // Menu contextuel ouvert
  protected readonly menuOuvertId = signal<string | null>(null);

  // Dérivations
  protected readonly totalActives = computed(
    () => this.ecoles().filter((e) => e.statut === 'active').length,
  );
  protected readonly totalSuspendues = computed(
    () => this.ecoles().filter((e) => e.statut === 'suspendue').length,
  );
  protected readonly totalDesactivees = computed(
    () => this.ecoles().filter((e) => e.statut === 'desactivee').length,
  );

  protected readonly pageEcolesDebut = computed(() => {
    if (this.totalEcoles() === 0) return 0;
    return (this.pageCourante() - 1) * this.limite() + 1;
  });

  protected readonly pageEcolesFin = computed(() => {
    return Math.min(this.pageCourante() * this.limite(), this.totalEcoles());
  });

  protected readonly pages = computed(() => {
    const total = this.totalPages();
    const current = this.pageCourante();
    const result: number[] = [];

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
        result.push(i);
      }
    }
    return result;
  });

  ngOnInit(): void {
    this.chargerStatistiques();
    this.chargerRegions();
    this.chargerVilles();
    this.chargerEcoles();

    // Fermeture du menu contextuel au clic extérieur
    window.addEventListener('click', () => {
      if (this.menuOuvertId()) {
        this.menuOuvertId.set(null);
      }
    });
  }

  chargerEcoles(): void {
    this.enChargement.set(true);
    const filtres: EcolesFiltres = {
      page: this.pageCourante(),
      limit: this.limite(),
      recherche: this.filtreRecherche(),
      statut: this.filtreStatut(),
      region: this.filtreRegion(),
      ville: this.filtreVille(),
    };

    this.ecolesApi.getEcoles(filtres).subscribe({
      next: (res) => {
        this.ecoles.set(res.data);
        this.totalEcoles.set(res.total);
        this.totalPages.set(res.totalPages);
        this.enChargement.set(false);
      },
      error: () => {
        this.toastService.error('Erreur lors du chargement des écoles.');
        this.enChargement.set(false);
      },
    });
  }

  chargerStatistiques(): void {
    this.ecolesApi.getStatistiques().subscribe({
      next: (stats) => this.statistiques.set(stats),
    });
  }

  chargerRegions(): void {
    this.ecolesApi.getRegions().subscribe({
      next: (regs) => this.regions.set(regs),
    });
  }

  chargerVilles(region?: string): void {
    this.ecolesApi.getVilles(region).subscribe({
      next: (villes) => this.villes.set(villes),
    });
  }

  surRechercheChange(val: string): void {
    this.filtreRecherche.set(val);
    this.pageCourante.set(1);
    this.chargerEcoles();
  }

  reinitialiserRecherche(): void {
    this.filtreRecherche.set('');
    this.pageCourante.set(1);
    this.chargerEcoles();
  }

  surStatutChange(val: StatutEcole | ''): void {
    this.filtreStatut.set(val);
    this.pageCourante.set(1);
    this.chargerEcoles();
  }

  surRegionChange(val: string): void {
    this.filtreRegion.set(val);
    this.filtreVille.set('');
    this.pageCourante.set(1);
    this.chargerVilles(val);
    this.chargerEcoles();
  }

  surVilleChange(val: string): void {
    this.filtreVille.set(val);
    this.pageCourante.set(1);
    this.chargerEcoles();
  }

  reinitialiserFiltres(): void {
    this.filtreRecherche.set('');
    this.filtreStatut.set('');
    this.filtreRegion.set('');
    this.filtreVille.set('');
    this.pageCourante.set(1);
    this.chargerVilles();
    this.chargerEcoles();
  }

  changerPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.pageCourante.set(page);
      this.chargerEcoles();
    }
  }

  basculerMenu(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.menuOuvertId.update((curr) => (curr === id ? null : id));
  }

  ouvrirModalAjout(): void {
    const dialogRef = this.dialog.open<CreationEcoleForm | null, EcoleModalData>(
      EcoleFormModalComponent,
      {
        data: {
          titre: 'Ajouter une école',
          regionsDisponibles: this.regions(),
        },
      },
    );

    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.ecolesApi.createEcole(result).subscribe({
          next: (nouvelle) => {
            this.toastService.success(`L'école "${nouvelle.nom}" a été créée avec succès.`);
            this.chargerEcoles();
            this.chargerStatistiques();
            this.chargerRegions();
            this.chargerVilles();
          },
          error: (err) => {
            const msg = err?.error?.message || 'Erreur lors de la création de l’école.';
            this.toastService.error(msg);
          },
        });
      }
    });
  }

  ouvrirModalEdition(ecole: Ecole): void {
    this.menuOuvertId.set(null);
    const dialogRef = this.dialog.open<CreationEcoleForm | null, EcoleModalData>(
      EcoleFormModalComponent,
      {
        data: {
          titre: 'Modifier l’école',
          ecole,
          regionsDisponibles: this.regions(),
        },
      },
    );

    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.ecolesApi.updateEcole(ecole.id, result).subscribe({
          next: (modifiee) => {
            this.toastService.success(`L'école "${modifiee.nom}" a été mise à jour.`);
            this.chargerEcoles();
            this.chargerStatistiques();
          },
          error: (err) => {
            const msg = err?.error?.message || 'Erreur lors de la modification de l’école.';
            this.toastService.error(msg);
          },
        });
      }
    });
  }

  ouvrirModalDetail(ecole: Ecole): void {
    this.menuOuvertId.set(null);
    const dialogRef = this.dialog.open<EcoleDetailModalResult | null>(
      EcoleDetailModalComponent,
      {
        data: { ecole },
      },
    );

    dialogRef.closed.subscribe((result) => {
      if (result) {
        if (result.action === 'modifier') {
          this.ouvrirModalEdition(ecole);
        } else if (result.action === 'changer_statut' && result.nouveauStatut) {
          this.confirmerChangementStatut(ecole, result.nouveauStatut);
        }
      }
    });
  }

  async confirmerChangementStatut(ecole: Ecole, nouveauStatut: StatutEcole): Promise<void> {
    this.menuOuvertId.set(null);

    let titre: string;
    let message: string;
    let danger: boolean;

    if (nouveauStatut === 'desactivee') {
      titre = 'Désactiver l’école ?';
      message = `Conformément au cadrage du système, une école désactivée n'est plus interrogeable par ses utilisateurs et ses sessions en cours sont coupées. Ses documents et données restent toutefois conservés. Souhaitez-vous continuer pour "${ecole.nom}" ?`;
      danger = true;
    } else if (nouveauStatut === 'suspendue') {
      titre = 'Suspendre l’école ?';
      message = `Voulez-vous suspendre temporairement l'école "${ecole.nom}" ? Ses accès seront mis en pause.`;
      danger = false;
    } else {
      titre = 'Réactiver l’école ?';
      message = `Voulez-vous réactiver l'école "${ecole.nom}" et rendre à nouveau ses espaces accessibles ?`;
      danger = false;
    }

    const confirme = await this.confirmDialog.ask({
      title: titre,
      message,
      confirmLabel: 'Confirmer',
      cancelLabel: 'Annuler',
      danger,
    });

    if (confirme) {
      this.ecolesApi.changerStatut(ecole.id, nouveauStatut).subscribe({
        next: (miseAJour) => {
          this.toastService.success(
            `Le statut de l'école "${miseAJour.nom}" est maintenant "${this.libelleStatut(nouveauStatut)}".`,
          );
          this.chargerEcoles();
          this.chargerStatistiques();
        },
        error: (err) => {
          const msg = err?.error?.message || 'Erreur lors du changement de statut.';
          this.toastService.error(msg);
        },
      });
    }
  }

  libelleStatut(statut: StatutEcole): string {
    switch (statut) {
      case 'active':
        return 'Active';
      case 'suspendue':
        return 'Suspendue';
      case 'desactivee':
        return 'Désactivée';
    }
  }

  obtenirInitiales(nom: string): string {
    if (!nom) return 'EC';
    const words = nom.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  obtenirCouleurBordure(ecole: Ecole): string {
    switch (ecole.statut) {
      case 'active':
        return '#3b82f6';
      case 'suspendue':
        return '#f43f5e';
      case 'desactivee':
        return '#94a3b8';
    }
  }

  obtenirGradientInitiales(ecole: Ecole): string {
    const palettes = [
      'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
      'linear-gradient(135deg, #065f46 0%, #10b981 100%)',
      'linear-gradient(135deg, #854d0e 0%, #eab308 100%)',
      'linear-gradient(135deg, #4c1d95 0%, #8b5cf6 100%)',
      'linear-gradient(135deg, #0e7490 0%, #06b6d4 100%)',
      'linear-gradient(135deg, #991b1b 0%, #ef4444 100%)',
    ];
    let hash = 0;
    for (let i = 0; i < ecole.nom.length; i++) {
      hash = (hash << 5) - hash + ecole.nom.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % palettes.length;
    return palettes[index];
  }
}
