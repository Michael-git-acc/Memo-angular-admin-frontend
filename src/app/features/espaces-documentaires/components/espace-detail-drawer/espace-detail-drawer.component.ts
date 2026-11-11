import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { EspaceDocumentaire } from '../../models/espace-documentaire';

type DrawerTab = 'infos' | 'sous-espaces' | 'permissions' | 'documents';

@Component({
  selector: 'app-espace-detail-drawer',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="drawer-container" [class.open]="espace !== null" aria-label="Détails de l'espace">
      @if (espace) {
        <!-- Entête du tiroir -->
        <div class="drawer-header">
          <h2 class="drawer-title">Détails de l'espace</h2>
          <button
            type="button"
            class="btn-close"
            (click)="fermer.emit()"
            aria-label="Fermer le panneau de détails"
          >
            ✕
          </button>
        </div>

        <!-- Carte identité de l'espace -->
        <div class="espace-hero-card">
          <div class="espace-avatar" [style.background-color]="espace.type_couleur || '#3b82f6'">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <div class="espace-hero-info">
            <div class="title-row">
              <h3 class="espace-name" [title]="espace.nom">{{ espace.nom }}</h3>
              <span
                class="status-pill"
                [class.actif]="espace.statut === 'actif'"
                [class.inactif]="espace.statut === 'inactif'"
              >
                {{ espace.statut === 'actif' ? 'Actif' : 'Inactif' }}
              </span>
            </div>
            <p class="espace-subtitle">
              {{ espace.type_nom || 'Espace' }} • {{ espace.parent_id ? 'Sous-espace' : 'Espace principal' }}
            </p>
          </div>
        </div>

        <!-- Onglets -->
        <nav class="drawer-tabs" aria-label="Sections des détails">
          <button
            type="button"
            class="tab-btn"
            [class.active]="activeTab() === 'infos'"
            (click)="activeTab.set('infos')"
          >
            Informations
          </button>
          <button
            type="button"
            class="tab-btn"
            [class.active]="activeTab() === 'sous-espaces'"
            (click)="activeTab.set('sous-espaces')"
          >
            Sous-espaces ({{ espace.nb_sous_espaces || (espace.enfants?.length || 0) }})
          </button>
          <button
            type="button"
            class="tab-btn"
            [class.active]="activeTab() === 'permissions'"
            (click)="activeTab.set('permissions')"
          >
            Permissions
          </button>
          <button
            type="button"
            class="tab-btn"
            [class.active]="activeTab() === 'documents'"
            (click)="activeTab.set('documents')"
          >
            Documents ({{ espace.nb_documents || 0 }})
          </button>
        </nav>

        <!-- Contenu des onglets -->
        <div class="drawer-body">
          @if (activeTab() === 'infos') {
            <!-- Section Informations générales -->
            <section class="info-section">
              <div class="section-header">
                <h4>Informations générales</h4>
                <button
                  type="button"
                  class="btn-icon-action"
                  (click)="editer.emit(espace)"
                  title="Modifier l'espace"
                  aria-label="Modifier l'espace"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                </button>
              </div>

              <div class="info-grid">
                <div class="info-row">
                  <span class="info-label">Nom de l'espace</span>
                  <span class="info-value font-medium">{{ espace.nom }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Type</span>
                  <span
                    class="type-tag"
                    [style.background-color]="(espace.type_couleur || '#3b82f6') + '20'"
                    [style.color]="espace.type_couleur || '#3b82f6'"
                  >
                    {{ espace.type_nom || 'Non catégorisé' }}
                  </span>
                </div>
                <div class="info-row">
                  <span class="info-label">École</span>
                  <span class="info-value location-val">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    {{ espace.ecole_nom || 'École rattachée' }}
                  </span>
                </div>
                <div class="info-row">
                  <span class="info-label">Description</span>
                  <p class="description-text">
                    {{ espace.description || 'Aucune description fournie pour cet espace documentaire.' }}
                  </p>
                </div>
              </div>
            </section>

            <!-- Section Statut et paramètres -->
            <section class="info-section">
              <h4>Statut et paramètres</h4>
              <div class="info-grid">
                <div class="info-row">
                  <span class="info-label">Statut</span>
                  <span class="status-indicator">
                    <span class="dot" [class.actif]="espace.statut === 'actif'"></span>
                    {{ espace.statut === 'actif' ? 'Actif' : 'Inactif' }}
                  </span>
                </div>
                <div class="info-row">
                  <span class="info-label">Accès public</span>
                  <span class="info-value">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    {{ espace.confidentialite === 'public' ? 'Oui' : 'Non' }}
                  </span>
                </div>
                <div class="info-row">
                  <span class="info-label">Taille</span>
                  <span class="info-value">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    {{ formaterTaille(espace.taille_documents_octets) }} ({{ espace.nb_documents || 0 }} documents)
                  </span>
                </div>
              </div>
            </section>

            <!-- Section Raccourcis -->
            <section class="info-section">
              <h4>Raccourcis</h4>
              <div class="shortcuts-list">
                <button type="button" class="shortcut-btn" (click)="activeTab.set('documents')">
                  <span class="shortcut-icon blue">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    </svg>
                  </span>
                  <span class="shortcut-label">Voir les documents</span>
                  <span class="chevron">›</span>
                </button>
                <button type="button" class="shortcut-btn" (click)="activeTab.set('sous-espaces')">
                  <span class="shortcut-icon purple">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M16 16v1a2 2 0 0 1-2 2H3m0 0a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1"/>
                      <path d="M18 8h4a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-4"/>
                    </svg>
                  </span>
                  <span class="shortcut-label">Gérer les sous-espaces</span>
                  <span class="chevron">›</span>
                </button>
                <button type="button" class="shortcut-btn" (click)="deplacer.emit(espace)">
                  <span class="shortcut-icon orange">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="15 3 21 3 21 9"/>
                      <polyline points="9 21 3 21 3 15"/>
                      <line x1="21" y1="3" x2="14" y2="10"/>
                      <line x1="3" y1="21" x2="10" y2="14"/>
                    </svg>
                  </span>
                  <span class="shortcut-label">Changer l'espace parent</span>
                  <span class="chevron">›</span>
                </button>
              </div>
            </section>

            <!-- Membres associés (aperçu) -->
            <section class="info-section">
              <h4>Membres associés</h4>
              <div class="members-list">
                <div class="member-item">
                  <div class="member-avatar bg-purple">MK</div>
                  <div class="member-info">
                    <span class="member-name">Marie K.</span>
                    <span class="member-role">Administrateur</span>
                  </div>
                  <span class="chevron">›</span>
                </div>
                <div class="member-item">
                  <div class="member-avatar bg-blue">TS</div>
                  <div class="member-info">
                    <span class="member-name">Thomas S.</span>
                    <span class="member-role">Enseignant</span>
                  </div>
                  <span class="chevron">›</span>
                </div>
                <div class="member-item">
                  <div class="member-avatar bg-pink">AK</div>
                  <div class="member-info">
                    <span class="member-name">Awa K.</span>
                    <span class="member-role">Enseignant</span>
                  </div>
                  <span class="chevron">›</span>
                </div>
              </div>
            </section>
          }

          @if (activeTab() === 'sous-espaces') {
            <section class="subspaces-list">
              <div class="subspaces-header">
                <p class="tab-description">
                  Sous-espaces dépendant de cet espace. Les documents de ce parent sont accessibles à tous ses descendants.
                </p>
                <button
                  type="button"
                  class="btn-sm-primary"
                  (click)="ajouterSousEspace.emit(espace)"
                >
                  + Ajouter un sous-espace
                </button>
              </div>

              @if (espace.enfants && espace.enfants.length > 0) {
                <div class="subspace-cards-grid">
                  @for (enfant of espace.enfants; track enfant.id) {
                    <button
                      type="button"
                      class="subspace-card"
                      (click)="selectionnerAutre.emit(enfant)"
                    >
                      <div class="subspace-icon" [style.background-color]="enfant.type_couleur || '#3b82f6'">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                        </svg>
                      </div>
                      <div class="subspace-card-info">
                        <span class="subspace-title">{{ enfant.nom }}</span>
                        <span class="subspace-meta">
                          {{ enfant.type_nom || 'Espace' }} • {{ enfant.nb_documents || 0 }} docs
                        </span>
                      </div>
                      <span class="chevron">›</span>
                    </button>
                  }
                </div>
              } @else {
                <div class="empty-tab-state">
                  <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                  </svg>
                  <p>Aucun sous-espace direct dans cet espace.</p>
                </div>
              }
            </section>
          }

          @if (activeTab() === 'permissions') {
            <section class="permissions-tab">
              <p class="tab-description">
                Permissions actives accordées via les affectations sur cet espace documentaire :
              </p>
              <div class="perm-badges-list">
                <div class="perm-card">
                  <span class="perm-title">interroger</span>
                  <p class="perm-desc">Permet de poser des questions au RAG sur les documents de cet espace.</p>
                </div>
                <div class="perm-card">
                  <span class="perm-title">alimenter</span>
                  <p class="perm-desc">Permet d’importer des documents dans cet espace spécifique.</p>
                </div>
                <div class="perm-card">
                  <span class="perm-title">consulter_historique</span>
                  <p class="perm-desc">Accès à l’historique des échanges documentaires.</p>
                </div>
              </div>
            </section>
          }

          @if (activeTab() === 'documents') {
            <section class="documents-tab">
              <p class="tab-description">
                {{ espace.nb_documents || 0 }} document(s) présent(s) dans cet espace.
              </p>
              <div class="empty-tab-state">
                <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <p>Pour ajouter ou consulter les fichiers, rendez-vous dans le module Documents.</p>
              </div>
            </section>
          }
        </div>

        <!-- Bouton d'action en bas -->
        <div class="drawer-footer">
          @if (!espace.role_systeme) {
            <button
              type="button"
              class="btn-action-status"
              [class.danger]="espace.statut === 'actif'"
              [class.success]="espace.statut === 'inactif'"
              (click)="toggleStatut.emit(espace)"
            >
              @if (espace.statut === 'actif') {
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                </svg>
                Désactiver l'espace
              } @else {
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                Réactiver l'espace
              }
            </button>
            <button
              type="button"
              class="btn-action-delete"
              (click)="supprimer.emit(espace)"
              title="Supprimer définitivement cet espace"
            >
              Supprimer
            </button>
          } @else {
            <div class="system-space-badge">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Espace système lié au cycle de vie de l'école (non supprimable)
            </div>
          }
        </div>
      }
    </aside>
  `,
  styles: `
    .drawer-container {
      position: fixed;
      top: 0;
      right: 0;
      width: 420px;
      height: 100vh;
      background: #ffffff;
      box-shadow: -8px 0 28px rgba(0, 0, 0, 0.08);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .drawer-container.open {
      transform: translateX(0);
    }

    .drawer-header {
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #f1f5f9;
    }

    .drawer-title {
      font-size: 1.125rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.125rem;
      color: #94a3b8;
      cursor: pointer;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: background 0.15s, color 0.15s;
    }

    .btn-close:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    .espace-hero-card {
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      background: #f8fafc;
      border-bottom: 1px solid #f1f5f9;
    }

    .espace-avatar {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      flex-shrink: 0;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }

    .espace-hero-info {
      flex: 1;
      min-width: 0;
    }

    .title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
    }

    .espace-name {
      font-size: 1rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .status-pill {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      white-space: nowrap;
    }

    .status-pill.actif {
      background: #dcfce7;
      color: #16a34a;
    }

    .status-pill.inactif {
      background: #fee2e2;
      color: #dc2626;
    }

    .espace-subtitle {
      font-size: 0.8125rem;
      color: #64748b;
      margin: 0;
    }

    .drawer-tabs {
      display: flex;
      border-bottom: 1px solid #e2e8f0;
      padding: 0 1rem;
      background: #ffffff;
    }

    .tab-btn {
      flex: 1;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      padding: 0.85rem 0.5rem;
      font-size: 0.8125rem;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
      transition: color 0.15s, border-color 0.15s;
      white-space: nowrap;
      text-align: center;
    }

    .tab-btn:hover {
      color: #0f172a;
    }

    .tab-btn.active {
      color: #3b82f6;
      border-bottom-color: #3b82f6;
    }

    .drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .info-section {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .info-section h4 {
      font-size: 0.875rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .btn-icon-action {
      background: none;
      border: none;
      color: #64748b;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-icon-action:hover {
      background: #f1f5f9;
      color: #3b82f6;
    }

    .info-grid {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      background: #f8fafc;
      padding: 1rem;
      border-radius: 10px;
      border: 1px solid #f1f5f9;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8125rem;
      gap: 0.75rem;
    }

    .info-label {
      color: #64748b;
      font-weight: 500;
    }

    .info-value {
      color: #1e293b;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .location-val {
      color: #3b82f6;
    }

    .type-tag {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
    }

    .description-text {
      font-size: 0.8125rem;
      color: #334155;
      line-height: 1.45;
      margin: 0;
      text-align: right;
      max-width: 65%;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.8125rem;
      font-weight: 600;
      color: #0f172a;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #94a3b8;
    }

    .dot.actif {
      background: #22c55e;
    }

    .shortcuts-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .shortcut-btn {
      display: flex;
      align-items: center;
      padding: 0.65rem 0.85rem;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s;
      gap: 0.75rem;
    }

    .shortcut-btn:hover {
      border-color: #3b82f6;
      background: #f8fafc;
    }

    .shortcut-icon {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .shortcut-icon.blue {
      background: #eff6ff;
      color: #3b82f6;
    }

    .shortcut-icon.purple {
      background: #f5f3ff;
      color: #8b5cf6;
    }

    .shortcut-icon.orange {
      background: #fff7ed;
      color: #f97316;
    }

    .shortcut-label {
      flex: 1;
      text-align: left;
      font-size: 0.8125rem;
      font-weight: 600;
      color: #1e293b;
    }

    .chevron {
      color: #94a3b8;
      font-size: 1.125rem;
      font-weight: bold;
    }

    .members-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .member-item {
      display: flex;
      align-items: center;
      padding: 0.55rem 0.75rem;
      background: #f8fafc;
      border-radius: 8px;
      gap: 0.75rem;
    }

    .member-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      color: #ffffff;
      font-weight: 700;
      font-size: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .bg-purple { background: #8b5cf6; }
    .bg-blue { background: #3b82f6; }
    .bg-pink { background: #ec4899; }

    .member-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .member-name {
      font-size: 0.8125rem;
      font-weight: 600;
      color: #0f172a;
    }

    .member-role {
      font-size: 0.75rem;
      color: #64748b;
    }

    .tab-description {
      font-size: 0.8125rem;
      color: #64748b;
      margin-top: 0;
      margin-bottom: 1rem;
      line-height: 1.4;
    }

    .subspaces-header {
      margin-bottom: 1rem;
    }

    .btn-sm-primary {
      background: #3b82f6;
      color: #ffffff;
      border: none;
      padding: 0.45rem 0.8rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-sm-primary:hover {
      background: #2563eb;
    }

    .subspace-cards-grid {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .subspace-card {
      display: flex;
      align-items: center;
      padding: 0.75rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      cursor: pointer;
      gap: 0.75rem;
      transition: border-color 0.15s;
    }

    .subspace-card:hover {
      border-color: #3b82f6;
    }

    .subspace-icon {
      width: 30px;
      height: 30px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
    }

    .subspace-card-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .subspace-title {
      font-size: 0.8125rem;
      font-weight: 600;
      color: #0f172a;
    }

    .subspace-meta {
      font-size: 0.75rem;
      color: #64748b;
    }

    .empty-tab-state {
      padding: 2.5rem 1rem;
      text-align: center;
      color: #94a3b8;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.8125rem;
    }

    .permissions-tab {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .perm-card {
      background: #f8fafc;
      border-left: 3px solid #3b82f6;
      padding: 0.75rem;
      border-radius: 0 6px 6px 0;
    }

    .perm-title {
      font-weight: 700;
      font-size: 0.8125rem;
      color: #0f172a;
      display: block;
      margin-bottom: 0.2rem;
    }

    .perm-desc {
      font-size: 0.75rem;
      color: #64748b;
      margin: 0;
    }

    .drawer-footer {
      padding: 1.25rem 1.5rem;
      border-top: 1px solid #f1f5f9;
      background: #ffffff;
      display: flex;
      gap: 0.75rem;
    }

    .btn-action-status {
      flex: 1;
      padding: 0.7rem 1rem;
      border-radius: 8px;
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: background 0.15s;
    }

    .btn-action-status.danger {
      background: #ffffff;
      color: #ef4444;
      border: 1px solid #fee2e2;
    }

    .btn-action-status.danger:hover {
      background: #fef2f2;
      border-color: #ef4444;
    }

    .btn-action-status.success {
      background: #ffffff;
      color: #16a34a;
      border: 1px solid #dcfce7;
    }

    .btn-action-status.success:hover {
      background: #f0fdf4;
      border-color: #16a34a;
    }

    .btn-action-delete {
      padding: 0.7rem 1rem;
      border-radius: 8px;
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      background: #ffffff;
      color: #64748b;
      border: 1px solid #e2e8f0;
      transition: background 0.15s, color 0.15s;
    }

    .btn-action-delete:hover {
      background: #fef2f2;
      color: #ef4444;
      border-color: #ef4444;
    }

    .system-space-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      color: #64748b;
      background: #f8fafc;
      padding: 0.6rem 0.8rem;
      border-radius: 6px;
      width: 100%;
      justify-content: center;
    }
  `,
})
export class EspaceDetailDrawerComponent {
  @Input() espace: EspaceDocumentaire | null = null;

  @Output() fermer = new EventEmitter<void>();
  @Output() editer = new EventEmitter<EspaceDocumentaire>();
  @Output() deplacer = new EventEmitter<EspaceDocumentaire>();
  @Output() toggleStatut = new EventEmitter<EspaceDocumentaire>();
  @Output() supprimer = new EventEmitter<EspaceDocumentaire>();
  @Output() ajouterSousEspace = new EventEmitter<EspaceDocumentaire>();
  @Output() selectionnerAutre = new EventEmitter<EspaceDocumentaire>();

  readonly activeTab = signal<DrawerTab>('infos');

  formaterTaille(octets?: number): string {
    if (!octets || octets === 0) return '0 Ko';
    if (octets < 1024 * 1024) {
      return `${Math.round(octets / 1024)} Ko`;
    }
    if (octets < 1024 * 1024 * 1024) {
      return `${(octets / (1024 * 1024)).toFixed(1)} Mo`;
    }
    return `${(octets / (1024 * 1024 * 1024)).toFixed(1)} Go`;
  }
}
