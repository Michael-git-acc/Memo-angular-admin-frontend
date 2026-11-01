import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Ecole, StatutEcole } from '../../models/ecole';

export interface EcoleDetailModalData {
  ecole: Ecole;
}

export type EcoleDetailAction = 'modifier' | 'changer_statut' | null;

export interface EcoleDetailModalResult {
  action: EcoleDetailAction;
  nouveauStatut?: StatutEcole;
}

@Component({
  selector: 'app-ecole-detail-modal',
  imports: [CommonModule],
  template: `
    <div
      class="detail-box"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-title"
    >
      <div class="detail-header">
        <div class="header-left">
          <div class="school-avatar">
            @if (ecole.logo_url) {
              <img [src]="ecole.logo_url" [alt]="ecole.nom" class="avatar-img" />
            } @else {
              <div class="avatar-fallback">{{ obtenirInitiales(ecole.nom) }}</div>
            }
          </div>
          <div>
            <div class="title-row">
              <h2 id="detail-title" class="detail-title">{{ ecole.nom }}</h2>
              <svg class="verified-icon" width="18" height="18" viewBox="0 0 24 24" fill="#3b82f6">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div class="location-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>{{ ecole.ville || 'Ville non spécifiée' }} • {{ ecole.region || 'Région non spécifiée' }}</span>
            </div>
          </div>
        </div>

        <button type="button" class="btn-close" (click)="fermer()" aria-label="Fermer">
          &times;
        </button>
      </div>

      <div class="detail-body">
        <!-- Badge statut & Domaine Google -->
        <div class="tags-row">
          <span class="status-pill status-{{ ecole.statut }}">
            {{ libelleStatut(ecole.statut) }}
          </span>

          <div class="google-domain">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <span>Domaine Google : <strong>{{ ecole.domaine_google || 'Non configuré' }}</strong></span>
          </div>
        </div>

        <!-- Description -->
        @if (ecole.description) {
          <p class="description-text">{{ ecole.description }}</p>
        }

        <!-- Indicateurs clés -->
        <div class="metrics-grid">
          <div class="metric-card">
            <span class="metric-label">Utilisateurs rattachés</span>
            <span class="metric-value">{{ ecole.nb_utilisateurs }}</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Documents indexés</span>
            <span class="metric-value">{{ ecole.nb_documents }}</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Quota mensuel IA</span>
            <span class="metric-value">
              {{ ecole.quota_questions_mois ? (ecole.quota_questions_mois | number) + ' questions' : 'Illimité' }}
            </span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Mode dépassement</span>
            <span class="metric-value mode-{{ ecole.mode_depassement }}">
              {{ ecole.mode_depassement === 'blocage' ? 'Blocage strict' : 'Alerte' }} ({{ ecole.seuil_alerte_pct }}%)
            </span>
          </div>
        </div>

        <!-- Responsables -->
        @if (ecole.responsables && ecole.responsables.length > 0) {
          <div class="responsables-section">
            <span class="section-title">Responsables désignés :</span>
            <div class="responsables-list">
              @for (resp of ecole.responsables; track resp) {
                <span class="resp-chip">{{ resp }}</span>
              }
            </div>
          </div>
        }
      </div>

      <div class="detail-footer">
        <div class="footer-actions">
          @if (ecole.statut === 'active') {
            <button
              type="button"
              class="btn btn-warning"
              (click)="changerStatut('suspendue')"
            >
              Suspendre
            </button>
            <button
              type="button"
              class="btn btn-danger"
              (click)="changerStatut('desactivee')"
            >
              Désactiver
            </button>
          } @else if (ecole.statut === 'suspendue') {
            <button
              type="button"
              class="btn btn-success"
              (click)="changerStatut('active')"
            >
              Réactiver
            </button>
            <button
              type="button"
              class="btn btn-danger"
              (click)="changerStatut('desactivee')"
            >
              Désactiver
            </button>
          } @else {
            <button
              type="button"
              class="btn btn-success"
              (click)="changerStatut('active')"
            >
              Réactiver l'école
            </button>
          }

          <button
            type="button"
            class="btn btn-primary"
            (click)="modifier()"
          >
            Modifier
          </button>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      max-width: 580px;
      width: 92vw;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
      border: 1px solid var(--color-border);
      overflow: hidden;
    }

    .detail-box {
      padding: 1.5rem;
    }

    .detail-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--color-border);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .school-avatar {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
      border: 2px solid var(--color-border);
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-fallback {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.1rem;
    }

    .title-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .detail-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-text);
    }

    .verified-icon {
      flex-shrink: 0;
    }

    .location-badge {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      margin-top: 0.25rem;
      font-size: 0.8125rem;
      color: var(--color-text-muted);
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: var(--color-text-muted);
      cursor: pointer;
      line-height: 1;

      &:hover {
        color: var(--color-text);
      }
    }

    .detail-body {
      padding: 1.25rem 0;
    }

    .tags-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }

    .status-pill {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      text-transform: capitalize;

      &.status-active {
        background: #ecfdf5;
        color: #059669;
        border: 1px solid #a7f3d0;
      }

      &.status-suspendue {
        background: #fff1f2;
        color: #e11d48;
        border: 1px solid #fecdd3;
      }

      &.status-desactivee {
        background: #f1f5f9;
        color: #64748b;
        border: 1px solid #cbd5e1;
      }
    }

    .google-domain {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.8125rem;
      color: var(--color-text-muted);
      background: var(--color-surface-muted);
      padding: 0.25rem 0.65rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-border);
    }

    .description-text {
      font-size: 0.875rem;
      color: var(--color-text);
      line-height: 1.5;
      margin: 0 0 1.25rem 0;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }

    .metric-card {
      background: var(--color-surface-muted);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .metric-label {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      font-weight: 500;
    }

    .metric-value {
      font-size: 1rem;
      font-weight: 700;
      color: var(--color-text);

      &.mode-blocage {
        color: var(--color-danger);
      }

      &.mode-alerte {
        color: var(--color-warning);
      }
    }

    .responsables-section {
      margin-top: 0.5rem;
    }

    .section-title {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-text-muted);
      display: block;
      margin-bottom: 0.4rem;
    }

    .responsables-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .resp-chip {
      background: #eff6ff;
      color: var(--color-primary);
      padding: 0.2rem 0.6rem;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 500;
    }

    .detail-footer {
      border-top: 1px solid var(--color-border);
      padding-top: 1rem;
      display: flex;
      justify-content: flex-end;
    }

    .footer-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      border-radius: var(--radius-md);
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s ease;
    }

    .btn-primary {
      background: var(--color-primary);
      color: #ffffff;
      &:hover {
        background: var(--color-primary-hover);
      }
    }

    .btn-warning {
      background: var(--color-warning-bg);
      color: var(--color-warning);
      border-color: var(--color-warning-border);
      &:hover {
        background: #fde68a;
      }
    }

    .btn-danger {
      background: var(--color-danger-bg);
      color: var(--color-danger);
      border-color: var(--color-danger-border);
      &:hover {
        background: #fecaca;
      }
    }

    .btn-success {
      background: var(--color-success-bg);
      color: var(--color-success);
      border-color: var(--color-success-border);
      &:hover {
        background: #bbf7d0;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EcoleDetailModalComponent {
  readonly data = inject<EcoleDetailModalData>(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<EcoleDetailModalResult | null>);

  get ecole(): Ecole {
    return this.data.ecole;
  }

  obtenirInitiales(nom: string): string {
    if (!nom) return 'EC';
    const words = nom.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
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

  fermer(): void {
    this.dialogRef.close(null);
  }

  modifier(): void {
    this.dialogRef.close({ action: 'modifier' });
  }

  changerStatut(statut: StatutEcole): void {
    this.dialogRef.close({ action: 'changer_statut', nouveauStatut: statut });
  }
}

