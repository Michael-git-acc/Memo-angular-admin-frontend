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
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { EspacesDocumentairesApiService } from '../services/espaces-documentaires-api.service';
import {
  EspaceDocumentaire,
  TypeEspace,
  EspacesStatistiques,
  CreationEspaceForm,
  ModificationEspaceForm,
  DeplacerEspaceForm,
} from '../models/espace-documentaire';
import { EspaceDetailDrawerComponent } from '../components/espace-detail-drawer/espace-detail-drawer.component';
import {
  EspaceFormModalComponent,
  EspaceModalData,
} from '../components/espace-form-modal/espace-form-modal.component';
import {
  EspaceDeplacerModalComponent,
  DeplacerModalData,
} from '../components/espace-deplacer-modal/espace-deplacer-modal.component';

interface WeaveColumn {
  type: TypeEspace;
  espaces: EspaceDocumentaire[];
}

@Component({
  selector: 'app-espaces-documentaires-page',
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    EspaceDetailDrawerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="espaces-page-layout">
      <main class="page-main-content" [class.drawer-active]="espaceSelectionne() !== null">
        <!-- 1. Entête de la page -->
        <header class="page-header">
          <div class="header-breadcrumb">
            <span>DOCUMENTATION</span>
            <span class="sep">›</span>
            <span class="current">ESPACES DOCUMENTAIRES</span>
          </div>

          <div class="header-main-row">
            <div>
              <h1 class="page-title">Espaces documentaires</h1>
              <p class="page-subtitle">
                Organisez et structurez les espaces de votre plateforme. Créez, modifiez et gérez
                les espaces documentaires pour chaque école, service ou département.
              </p>
            </div>

            <div class="header-actions">
              <!-- Sélecteur de vue Arborescence / Liste -->
              <div class="view-toggle" role="group" aria-label="Mode d'affichage">
                <button
                  type="button"
                  class="toggle-btn"
                  [class.active]="vueCourante() === 'arbre'"
                  (click)="vueCourante.set('arbre')"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="18" cy="5" r="3"/>
                    <circle cx="6" cy="12" r="3"/>
                    <circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                  Vue arborescence
                </button>
                <button
                  type="button"
                  class="toggle-btn"
                  [class.active]="vueCourante() === 'liste'"
                  (click)="vueCourante.set('liste')"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="8" y1="6" x2="21" y2="6"/>
                    <line x1="8" y1="12" x2="21" y2="12"/>
                    <line x1="8" y1="18" x2="21" y2="18"/>
                    <line x1="3" y1="6" x2="3.01" y2="6"/>
                    <line x1="3" y1="12" x2="3.01" y2="12"/>
                    <line x1="3" y1="18" x2="3.01" y2="18"/>
                  </svg>
                  Vue liste
                </button>
              </div>

              <!-- Bouton CTA principal -->
              <button
                type="button"
                class="btn-nouveau"
                (click)="ouvrirModalCreation()"
              >
                + Nouvel espace
              </button>
            </div>
          </div>
        </header>

        <!-- 2. Barre de recherche et de filtres -->
        <section class="filters-bar" aria-label="Filtres des espaces">
          <div class="search-box">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              class="search-input"
              placeholder="Rechercher un espace..."
              [ngModel]="rechercheTexte()"
              (ngModelChange)="rechercheTexte.set($event)"
            />
          </div>

          <div class="filter-dropdowns">
            <!-- Filtre École -->
            <div class="select-wrapper">
              <label for="filtre-ecole" class="visually-hidden">Filtrer par école</label>
              <select
                id="filtre-ecole"
                class="filter-select"
                [ngModel]="ecoleFiltreId()"
                (ngModelChange)="changerFiltreEcole($event)"
              >
                <option value="">École : Toutes</option>
                @for (ecole of ecolesList(); track ecole.id) {
                  <option [value]="ecole.id">{{ ecole.nom }}</option>
                }
              </select>
            </div>

            <!-- Filtre Type -->
            <div class="select-wrapper">
              <label for="filtre-type" class="visually-hidden">Filtrer par type</label>
              <select
                id="filtre-type"
                class="filter-select"
                [ngModel]="typeFiltreId()"
                (ngModelChange)="typeFiltreId.set($event)"
              >
                <option value="">Type : Tous</option>
                @for (type of typesList(); track type.id) {
                  <option [value]="type.id">{{ type.nom }}</option>
                }
              </select>
            </div>

            <!-- Bouton Reset/Options -->
            <button
              type="button"
              class="btn-filter-icon"
              (click)="reinitialiserFiltres()"
              title="Réinitialiser les filtres"
              aria-label="Réinitialiser les filtres"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="4" y1="21" x2="4" y2="14"/>
                <line x1="4" y1="10" x2="4" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12" y2="3"/>
                <line x1="20" y1="21" x2="20" y2="16"/>
                <line x1="20" y1="12" x2="20" y2="3"/>
                <line x1="1" y1="14" x2="7" y2="14"/>
                <line x1="9" y1="8" x2="15" y2="8"/>
                <line x1="17" y1="16" x2="23" y2="16"/>
              </svg>
            </button>
          </div>
        </section>

        <!-- 3. Contenu principal dynamique (Arborescence Weave OU Vue Liste) -->
        @if (chargement()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Chargement des espaces documentaires...</p>
          </div>
        } @else if (vueCourante() === 'arbre') {
          <!-- VUE FIGMA WEAVE : Arborescence avec extension latérale -->
          <div class="weave-canvas-container">
            <!-- Nœud racine global (Plateforme Mémo) -->
            <div class="weave-root-row">
              <div class="root-card">
                <div class="root-icon-wrap">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 21h18"></path>
                    <path d="M5 21V7l8-4v18"></path>
                    <path d="M19 21V11l-6-4"></path>
                  </svg>
                </div>
                <div class="root-info">
                  <span class="root-title">Plateforme Mémo</span>
                  <span class="root-subtitle">Racine globale</span>
                </div>
                <button
                  type="button"
                  class="btn-card-menu"
                  (click)="ouvrirModalCreation(null)"
                  title="Ajouter un espace racine"
                >
                  ⋮
                </button>
              </div>
            </div>

            <!-- Ligne de connexion horizontale avec puces de dérivation multicolores -->
            <div class="weave-connector-hub" aria-hidden="true">
              <div class="hub-line"></div>
              <div class="hub-anchors">
                @for (col of colonnesWeave(); track col.type.id; let idx = $index) {
                  <span
                    class="hub-dot"
                    [style.background-color]="col.type.couleur || '#3b82f6'"
                  ></span>
                }
              </div>
            </div>

            <!-- Colonnes verticales de branches (Weave Columns) -->
            <div class="weave-columns-scroll">
              <div class="weave-columns-grid">
                @for (col of colonnesWeave(); track col.type.id) {
                  <div class="weave-column">
                    <!-- Entête de colonne type (ex: Écoles, Administration, Ressources) -->
                    <div
                      class="col-header-pill"
                      [style.border-color]="(col.type.couleur || '#3b82f6') + '40'"
                    >
                      <div
                        class="col-icon-box"
                        [style.background-color]="col.type.couleur || '#3b82f6'"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                        </svg>
                      </div>
                      <div class="col-header-text">
                        <span class="col-title">{{ col.type.nom }}</span>
                        <span class="col-count">{{ col.espaces.length }} espace{{ col.espaces.length > 1 ? 's' : '' }}</span>
                      </div>
                      <span class="col-arrow">›</span>
                    </div>

                    <!-- Ligne verticale de liaison -->
                    <div class="col-vertical-line" [style.background-color]="(col.type.couleur || '#3b82f6') + '40'"></div>

                    <!-- Liste des cartes espaces documentaires de cette colonne -->
                    <div class="col-cards-stack">
                      @for (esp of col.espaces; track esp.id) {
                        <div
                          class="weave-card"
                          [class.selected]="espaceSelectionne()?.id === esp.id"
                          (click)="selectionnerEspace(esp)"
                          tabindex="0"
                          role="button"
                          (keydown.enter)="selectionnerEspace(esp)"
                        >
                          <div
                            class="card-avatar"
                            [style.background-color]="(col.type.couleur || '#3b82f6') + '15'"
                            [style.color]="col.type.couleur || '#3b82f6'"
                          >
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                            </svg>
                          </div>

                          <div class="card-details">
                            <span class="card-title" [title]="esp.nom">{{ esp.nom }}</span>
                            @if (esp.nb_sous_espaces > 0) {
                              <span class="card-subcount">
                                {{ esp.nb_sous_espaces }} espace{{ esp.nb_sous_espaces > 1 ? 's' : '' }}
                              </span>
                            } @else if (esp.ecole_nom) {
                              <span class="card-subcount">{{ esp.ecole_nom }}</span>
                            }
                          </div>

                          <!-- Menu contextuel 3 points -->
                          <div class="card-menu-wrap">
                            <button
                              type="button"
                              class="btn-kebab"
                              (click)="toggleMenuContextuel(esp.id); $event.stopPropagation()"
                              aria-label="Options de l'espace"
                            >
                              ⋮
                            </button>

                            @if (menuOuvertId() === esp.id) {
                              <div class="context-menu-popover">
                                <button type="button" (click)="selectionnerEspace(esp); fermerMenu()">
                                  👁️ Voir les détails
                                </button>
                                <button type="button" (click)="ouvrirModalCreation(esp.id); fermerMenu()">
                                  ➕ Ajouter un sous-espace
                                </button>
                                <button type="button" (click)="ouvrirModalModification(esp); fermerMenu()">
                                  ✏️ Modifier l'espace
                                </button>
                                <button type="button" (click)="ouvrirModalDeplacement(esp); fermerMenu()">
                                  🔄 Changer le parent
                                </button>
                                <hr class="menu-divider" />
                                <button
                                  type="button"
                                  (click)="changerStatutEspace(esp); fermerMenu()"
                                  [class.danger]="esp.statut === 'actif'"
                                >
                                  {{ esp.statut === 'actif' ? '🚫 Désactiver' : '✅ Réactiver' }}
                                </button>
                                @if (!esp.role_systeme) {
                                  <button
                                    type="button"
                                    class="danger"
                                    (click)="supprimerEspace(esp); fermerMenu()"
                                  >
                                    🗑️ Supprimer
                                  </button>
                                }
                              </div>
                            }
                          </div>
                        </div>
                      }

                      <!-- Bouton rapide d'ajout dans la colonne -->
                      <button
                        type="button"
                        class="btn-add-in-col"
                        (click)="ouvrirModalCreation(null, col.type.id)"
                      >
                        + Ajouter dans {{ col.type.nom }}
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Bouton inférieur Ajouter un espace -->
            <div class="bottom-add-row">
              <button
                type="button"
                class="btn-dashed-add"
                (click)="ouvrirModalCreation()"
              >
                <span class="plus-icon">+</span>
                <span>Ajouter un espace</span>
              </button>
            </div>
          </div>
        } @else {
          <!-- VUE LISTE TABULAIRE -->
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Nom de l'espace</th>
                  <th>École</th>
                  <th>Type</th>
                  <th>Parent</th>
                  <th>Statut</th>
                  <th>Confidentialité</th>
                  <th>Documents</th>
                  <th class="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (esp of espacesFiltresListe(); track esp.id) {
                  <tr (click)="selectionnerEspace(esp)" class="clickable-row">
                    <td>
                      <div class="table-name-cell">
                        <span
                          class="type-circle"
                          [style.background-color]="esp.type_couleur || '#3b82f6'"
                        ></span>
                        <div class="table-titles">
                          <span class="main-name">{{ esp.nom }}</span>
                          @if (esp.role_systeme) {
                            <span class="system-badge">{{ esp.role_systeme }}</span>
                          }
                        </div>
                      </div>
                    </td>
                    <td>{{ esp.ecole_nom || '—' }}</td>
                    <td>
                      <span
                        class="type-pill"
                        [style.background-color]="(esp.type_couleur || '#3b82f6') + '20'"
                        [style.color]="esp.type_couleur || '#3b82f6'"
                      >
                        {{ esp.type_nom || 'Non défini' }}
                      </span>
                    </td>
                    <td>{{ esp.parent_nom || 'Racine' }}</td>
                    <td>
                      <span
                        class="status-pill"
                        [class.actif]="esp.statut === 'actif'"
                        [class.inactif]="esp.statut === 'inactif'"
                      >
                        {{ esp.statut === 'actif' ? 'Actif' : 'Inactif' }}
                      </span>
                    </td>
                    <td>
                      <span class="confid-label">{{ esp.confidentialite }}</span>
                    </td>
                    <td>{{ esp.nb_documents || 0 }} docs</td>
                    <td class="text-right">
                      <div class="action-buttons-cell">
                        <button
                          type="button"
                          class="btn-tbl-action"
                          (click)="selectionnerEspace(esp); $event.stopPropagation()"
                          title="Voir les détails"
                        >
                          👁️
                        </button>
                        <button
                          type="button"
                          class="btn-tbl-action"
                          (click)="ouvrirModalModification(esp); $event.stopPropagation()"
                          title="Modifier"
                        >
                          ✏️
                        </button>
                        @if (!esp.role_systeme) {
                          <button
                            type="button"
                            class="btn-tbl-action danger"
                            (click)="supprimerEspace(esp); $event.stopPropagation()"
                            title="Supprimer"
                          >
                            🗑️
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="8" class="empty-table-msg">
                      Aucun espace documentaire ne correspond aux critères de recherche.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        <!-- 4. Bandeau inférieur de statistiques (4 cartes KPI) -->
        <footer class="stats-kpi-footer">
          <div class="kpi-card">
            <div class="kpi-icon blue">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div class="kpi-content">
              <span class="kpi-value">{{ stats()?.espaces_principaux || 0 }}</span>
              <span class="kpi-label">espaces principaux</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-icon green">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </div>
            <div class="kpi-content">
              <span class="kpi-value">{{ stats()?.sous_espaces || 0 }}</span>
              <span class="kpi-label">sous-espaces</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-icon purple">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div class="kpi-content">
              <span class="kpi-value">{{ stats()?.documents || 0 }}</span>
              <span class="kpi-label">documents</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-icon cyan">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 21h18"/>
                <path d="M5 21V7l8-4v18"/>
                <path d="M19 21V11l-6-4"/>
              </svg>
            </div>
            <div class="kpi-content">
              <span class="kpi-value">{{ stats()?.ecoles_liees || 0 }}</span>
              <span class="kpi-label">écoles liées</span>
            </div>
          </div>
        </footer>
      </main>

      <!-- 5. Tiroir latéral coulissant (Détails de l'espace) -->
      <app-espace-detail-drawer
        [espace]="espaceSelectionne()"
        (fermer)="espaceSelectionne.set(null)"
        (editer)="ouvrirModalModification($event)"
        (deplacer)="ouvrirModalDeplacement($event)"
        (toggleStatut)="changerStatutEspace($event)"
        (supprimer)="supprimerEspace($event)"
        (ajouterSousEspace)="ouvrirModalCreation($event.id)"
        (selectionnerAutre)="selectionnerEspace($event)"
      />
    </div>
  `,
  styles: `
    .espaces-page-layout {
      position: relative;
      min-height: 100vh;
      display: flex;
      background: #f8fafc;
      overflow-x: hidden;
    }

    .page-main-content {
      flex: 1;
      padding: 2rem 2.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      transition: margin-right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      min-width: 0;
    }

    .page-main-content.drawer-active {
      margin-right: 420px;
    }

    /* 1. Header */
    .page-header {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .header-breadcrumb {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #64748b;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .header-breadcrumb .sep {
      color: #94a3b8;
    }

    .header-breadcrumb .current {
      color: #3b82f6;
    }

    .header-main-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .page-title {
      font-size: 1.875rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 0.4rem 0;
      letter-spacing: -0.02em;
    }

    .page-subtitle {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0;
      max-width: 650px;
      line-height: 1.45;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .view-toggle {
      display: flex;
      background: #ffffff;
      padding: 0.25rem;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    }

    .toggle-btn {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.5rem 0.85rem;
      border: none;
      background: transparent;
      border-radius: 8px;
      font-size: 0.8125rem;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
      transition: all 0.15s;
    }

    .toggle-btn.active {
      background: #eff6ff;
      color: #3b82f6;
    }

    .btn-nouveau {
      display: flex;
      align-items: center;
      padding: 0.65rem 1.25rem;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: #ffffff;
      font-size: 0.875rem;
      font-weight: 700;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.25);
      transition: transform 0.15s, box-shadow 0.15s;
    }

    .btn-nouveau:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(37, 99, 235, 0.35);
    }

    /* 2. Filtres */
    .filters-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .search-box {
      flex: 1;
      min-width: 280px;
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-box svg {
      position: absolute;
      left: 1rem;
      color: #94a3b8;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.75rem;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      font-size: 0.875rem;
      color: #0f172a;
      outline: none;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .search-input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
    }

    .filter-dropdowns {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .filter-select {
      padding: 0.75rem 1.75rem 0.75rem 1rem;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      font-size: 0.8125rem;
      font-weight: 600;
      color: #334155;
      outline: none;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
    }

    .btn-filter-icon {
      width: 42px;
      height: 42px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s;
    }

    .btn-filter-icon:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    /* 3. VUE FIGMA WEAVE CANVAS */
    .weave-canvas-container {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 2rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
      overflow-x: auto;
    }

    .weave-root-row {
      display: flex;
      justify-content: flex-start;
      padding-left: 2rem;
    }

    .root-card {
      display: inline-flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.85rem 1.25rem;
      background: #ffffff;
      border: 1.5px solid #dbeafe;
      border-radius: 14px;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.08);
    }

    .root-icon-wrap {
      width: 40px;
      height: 40px;
      background: #3b82f6;
      color: #ffffff;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .root-info {
      display: flex;
      flex-direction: column;
    }

    .root-title {
      font-size: 0.9375rem;
      font-weight: 700;
      color: #0f172a;
    }

    .root-subtitle {
      font-size: 0.75rem;
      color: #64748b;
    }

    /* Ligne horizontale de hub Weave avec puces colorées */
    .weave-connector-hub {
      position: relative;
      margin: 0.5rem 2rem 1rem 2rem;
      height: 24px;
      display: flex;
      align-items: center;
    }

    .hub-line {
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 2px;
      background: #e2e8f0;
      transform: translateY(-50%);
    }

    .hub-anchors {
      position: relative;
      width: 100%;
      display: flex;
      justify-content: space-around;
    }

    .hub-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid #ffffff;
      box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
      z-index: 2;
    }

    /* Colonnes latérales Weave */
    .weave-columns-scroll {
      width: 100%;
      overflow-x: auto;
      padding-bottom: 1rem;
    }

    .weave-columns-grid {
      display: flex;
      gap: 1.25rem;
      align-items: flex-start;
      min-width: 900px;
    }

    .weave-column {
      flex: 1;
      min-width: 190px;
      max-width: 250px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .col-header-pill {
      width: 100%;
      display: flex;
      align-items: center;
      padding: 0.65rem 0.85rem;
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
      gap: 0.65rem;
      box-sizing: border-box;
    }

    .col-icon-box {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      flex-shrink: 0;
    }

    .col-header-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .col-title {
      font-size: 0.8125rem;
      font-weight: 700;
      color: #0f172a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .col-count {
      font-size: 0.72rem;
      color: #64748b;
    }

    .col-arrow {
      color: #94a3b8;
      font-weight: bold;
    }

    .col-vertical-line {
      width: 2px;
      height: 20px;
      background: #e2e8f0;
    }

    .col-cards-stack {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    /* Carte espace Weave */
    .weave-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 0.75rem 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.65rem;
      cursor: pointer;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
      transition: all 0.15s ease-in-out;
      position: relative;
    }

    .weave-card:hover {
      border-color: #3b82f6;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.08);
      transform: translateY(-1px);
    }

    .weave-card.selected {
      border-color: #3b82f6;
      background: #f0f7ff;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }

    .card-avatar {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .card-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .card-title {
      font-size: 0.8125rem;
      font-weight: 700;
      color: #0f172a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .card-subcount {
      font-size: 0.72rem;
      color: #64748b;
    }

    .card-menu-wrap {
      position: relative;
    }

    .btn-kebab {
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 1rem;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
    }

    .btn-kebab:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    .context-menu-popover {
      position: absolute;
      top: 100%;
      right: 0;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 0.4rem;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      min-width: 180px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      z-index: 50;
    }

    .context-menu-popover button {
      background: none;
      border: none;
      padding: 0.45rem 0.65rem;
      font-size: 0.8125rem;
      font-weight: 500;
      color: #334155;
      border-radius: 6px;
      cursor: pointer;
      text-align: left;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .context-menu-popover button:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    .context-menu-popover button.danger {
      color: #ef4444;
    }

    .context-menu-popover button.danger:hover {
      background: #fef2f2;
    }

    .menu-divider {
      border: none;
      border-top: 1px solid #f1f5f9;
      margin: 0.2rem 0;
    }

    .btn-add-in-col {
      width: 100%;
      padding: 0.55rem;
      background: transparent;
      border: 1px dashed #cbd5e1;
      border-radius: 10px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
      transition: all 0.15s;
    }

    .btn-add-in-col:hover {
      border-color: #3b82f6;
      color: #3b82f6;
      background: #f8fafc;
    }

    .bottom-add-row {
      display: flex;
      justify-content: flex-start;
      margin-top: 0.5rem;
      padding-left: 1rem;
    }

    .btn-dashed-add {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.7rem 1.25rem;
      background: #ffffff;
      border: 1.5px dashed #cbd5e1;
      border-radius: 12px;
      font-size: 0.8125rem;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
      transition: all 0.15s;
    }

    .btn-dashed-add:hover {
      border-color: #3b82f6;
      color: #3b82f6;
      background: #eff6ff;
    }

    .plus-icon {
      font-size: 1.125rem;
      font-weight: bold;
    }

    /* 4. Vue Liste */
    .table-container {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      overflow-x: auto;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.875rem;
    }

    .data-table th {
      padding: 0.85rem 1.25rem;
      background: #f8fafc;
      color: #64748b;
      font-weight: 600;
      border-bottom: 1px solid #e2e8f0;
      white-space: nowrap;
    }

    .data-table td {
      padding: 0.85rem 1.25rem;
      border-bottom: 1px solid #f1f5f9;
      color: #1e293b;
    }

    .clickable-row {
      cursor: pointer;
      transition: background 0.15s;
    }

    .clickable-row:hover {
      background: #f8fafc;
    }

    .table-name-cell {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .type-circle {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .table-titles {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .main-name {
      font-weight: 600;
    }

    .system-badge {
      font-size: 0.6875rem;
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      background: #f1f5f9;
      color: #64748b;
      font-weight: 500;
    }

    .type-pill {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
    }

    .status-pill {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
    }

    .status-pill.actif {
      background: #dcfce7;
      color: #16a34a;
    }

    .status-pill.inactif {
      background: #fee2e2;
      color: #dc2626;
    }

    .confid-label {
      text-transform: capitalize;
      font-size: 0.8125rem;
      color: #64748b;
    }

    .action-buttons-cell {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.4rem;
    }

    .btn-tbl-action {
      background: none;
      border: 1px solid #e2e8f0;
      padding: 0.35rem 0.55rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .btn-tbl-action:hover {
      background: #f1f5f9;
    }

    .empty-table-msg {
      text-align: center;
      padding: 3rem 1rem;
      color: #94a3b8;
    }

    /* 5. Bandeau KPI */
    .stats-kpi-footer {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
      margin-top: auto;
    }

    .kpi-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
    }

    .kpi-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .kpi-icon.blue { background: #eff6ff; color: #3b82f6; }
    .kpi-icon.green { background: #f0fdf4; color: #22c55e; }
    .kpi-icon.purple { background: #f5f3ff; color: #8b5cf6; }
    .kpi-icon.cyan { background: #ecfeff; color: #06b6d4; }

    .kpi-content {
      display: flex;
      flex-direction: column;
    }

    .kpi-value {
      font-size: 1.5rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1;
      margin-bottom: 0.25rem;
    }

    .kpi-label {
      font-size: 0.8125rem;
      color: #64748b;
      font-weight: 500;
    }

    .loading-state {
      padding: 4rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      color: #64748b;
    }

    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid #e2e8f0;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .text-right { text-align: right; }

    @media (max-width: 1024px) {
      .stats-kpi-footer {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `,
})
export class EspacesDocumentairesPageComponent implements OnInit {
  private readonly apiService = inject(EspacesDocumentairesApiService);
  private readonly dialog = inject(Dialog);

  // Signaux d'état
  readonly vueCourante = signal<'arbre' | 'liste'>('arbre');
  readonly chargement = signal<boolean>(false);
  readonly espacesArbre = signal<EspaceDocumentaire[]>([]);
  readonly espacesListe = signal<EspaceDocumentaire[]>([]);
  readonly typesList = signal<TypeEspace[]>([]);
  readonly ecolesList = signal<{ id: string; nom: string }[]>([]);
  readonly stats = signal<EspacesStatistiques | null>(null);

  // Filtres
  readonly rechercheTexte = signal<string>('');
  readonly ecoleFiltreId = signal<string>('');
  readonly typeFiltreId = signal<string>('');

  // Tiroir latéral & Menu contextuel
  readonly espaceSelectionne = signal<EspaceDocumentaire | null>(null);
  readonly menuOuvertId = signal<string | null>(null);

  // Calcul des colonnes Weave à partir de l'arbre et des types
  readonly colonnesWeave = computed<WeaveColumn[]>(() => {
    const types = this.typesList();
    const tousEspaces = this.espacesListe();
    const filtreTexte = this.rechercheTexte().toLowerCase().trim();
    const filtreType = this.typeFiltreId();
    const filtreEcole = this.ecoleFiltreId();

    // Filtre sur la liste des espaces
    const espacesFiltres = tousEspaces.filter((esp) => {
      const matchNom = !filtreTexte || esp.nom.toLowerCase().includes(filtreTexte);
      const matchType = !filtreType || esp.type_id === filtreType;
      const matchEcole = !filtreEcole || esp.ecole_id === filtreEcole;
      return matchNom && matchType && matchEcole;
    });

    if (types.length === 0) {
      return [
        {
          type: { id: 'defaut', nom: 'Espaces', couleur: '#3b82f6' },
          espaces: espacesFiltres,
        },
      ];
    }

    return types
      .filter((t) => !filtreType || t.id === filtreType)
      .map((type) => {
        const espacesDansType = espacesFiltres.filter((e) => e.type_id === type.id);
        return {
          type,
          espaces: espacesDansType,
        };
      })
      .filter((col) => col.espaces.length > 0 || !filtreTexte);
  });

  // Espaces filtrés pour la vue liste tabulaire
  readonly espacesFiltresListe = computed<EspaceDocumentaire[]>(() => {
    const espaces = this.espacesListe();
    const recherche = this.rechercheTexte().toLowerCase().trim();
    const typeId = this.typeFiltreId();
    const ecoleId = this.ecoleFiltreId();

    return espaces.filter((e) => {
      const matchRecherche =
        !recherche ||
        e.nom.toLowerCase().includes(recherche) ||
        (e.description && e.description.toLowerCase().includes(recherche));
      const matchType = !typeId || e.type_id === typeId;
      const matchEcole = !ecoleId || e.ecole_id === ecoleId;
      return matchRecherche && matchType && matchEcole;
    });
  });

  ngOnInit(): void {
    this.chargerDonnees();
  }

  chargerDonnees(): void {
    this.chargement.set(true);
    const ecoleId = this.ecoleFiltreId() || undefined;

    // Charger statistiques
    this.apiService.getStatistiques(ecoleId).subscribe({
      next: (s) => this.stats.set(s),
    });

    // Charger types d'espaces
    this.apiService.getTypes(ecoleId).subscribe({
      next: (types) => this.typesList.set(types),
    });

    // Charger les écoles disponibles
    this.apiService.getEcoles().subscribe({
      next: (res) => {
        this.ecolesList.set(res.data.map((e) => ({ id: e.id, nom: e.nom })));
      },
    });

    // Charger liste
    this.apiService.getEspaces({ page: 1, limit: 100, ecole_id: ecoleId }).subscribe({
      next: (res) => {
        this.espacesListe.set(res.data);
        this.chargement.set(false);
      },
      error: () => this.chargement.set(false),
    });
  }

  changerFiltreEcole(ecoleId: string): void {
    this.ecoleFiltreId.set(ecoleId);
    this.chargerDonnees();
  }

  reinitialiserFiltres(): void {
    this.rechercheTexte.set('');
    this.typeFiltreId.set('');
    this.ecoleFiltreId.set('');
    this.chargerDonnees();
  }

  selectionnerEspace(espace: EspaceDocumentaire): void {
    this.espaceSelectionne.set(espace);
    this.menuOuvertId.set(null);
  }

  toggleMenuContextuel(id: string): void {
    this.menuOuvertId.update((current) => (current === id ? null : id));
  }

  fermerMenu(): void {
    this.menuOuvertId.set(null);
  }

  ouvrirModalCreation(parentParDefautId?: string | null, typeParDefautId?: string | null): void {
    const dialogRef = this.dialog.open<CreationEspaceForm>(EspaceFormModalComponent, {
      data: {
        titre: 'Créer un nouvel espace documentaire',
        parentParDefautId,
        ecoleId: this.ecoleFiltreId() || null,
        ecolesDisponibles: this.ecolesList(),
        espacesParentsDisponibles: this.espacesListe().map((e) => ({ id: e.id, nom: e.nom })),
        typesDisponibles: this.typesList(),
      } as EspaceModalData,
    });

    dialogRef.closed.subscribe((result) => {
      if (result) {
        if (typeParDefautId && !result.type_id) {
          result.type_id = typeParDefautId;
        }
        this.apiService.creerEspace(result).subscribe({
          next: (nouvelEspace) => {
            this.chargerDonnees();
            this.selectionnerEspace(nouvelEspace);
          },
        });
      }
    });
  }

  ouvrirModalModification(espace: EspaceDocumentaire): void {
    const dialogRef = this.dialog.open<ModificationEspaceForm>(EspaceFormModalComponent, {
      data: {
        titre: `Modifier l'espace « ${espace.nom} »`,
        espace,
        ecolesDisponibles: this.ecolesList(),
        espacesParentsDisponibles: this.espacesListe()
          .filter((e) => e.id !== espace.id)
          .map((e) => ({ id: e.id, nom: e.nom })),
        typesDisponibles: this.typesList(),
      } as EspaceModalData,
    });

    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.apiService.modifierEspace(espace.id, result).subscribe({
          next: (maj) => {
            this.chargerDonnees();
            this.selectionnerEspace(maj);
          },
        });
      }
    });
  }

  ouvrirModalDeplacement(espace: EspaceDocumentaire): void {
    const dialogRef = this.dialog.open<DeplacerEspaceForm>(EspaceDeplacerModalComponent, {
      data: {
        espace,
        parentsPossibles: this.espacesListe()
          .filter((e) => e.id !== espace.id && e.ecole_id === espace.ecole_id)
          .map((e) => ({ id: e.id, nom: e.nom })),
      } as DeplacerModalData,
    });

    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.apiService.deplacerEspace(espace.id, result).subscribe({
          next: (maj) => {
            this.chargerDonnees();
            this.selectionnerEspace(maj);
          },
        });
      }
    });
  }

  changerStatutEspace(espace: EspaceDocumentaire): void {
    const nouveauStatut = espace.statut === 'actif' ? 'inactif' : 'actif';
    this.apiService.changerStatut(espace.id, nouveauStatut).subscribe({
      next: (maj) => {
        this.chargerDonnees();
        this.selectionnerEspace(maj);
      },
    });
  }

  supprimerEspace(espace: EspaceDocumentaire): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer définitivement l'espace « ${espace.nom} » ?`)) {
      this.apiService.supprimerEspace(espace.id).subscribe({
        next: () => {
          if (this.espaceSelectionne()?.id === espace.id) {
            this.espaceSelectionne.set(null);
          }
          this.chargerDonnees();
        },
      });
    }
  }
}
