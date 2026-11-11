import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { EspaceDocumentaire, DeplacerEspaceForm } from '../../models/espace-documentaire';

export interface DeplacerModalData {
  espace: EspaceDocumentaire;
  parentsPossibles: { id: string; nom: string }[];
}

@Component({
  selector: 'app-espace-deplacer-modal',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="modal-backdrop-custom"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deplacer-title"
    >
      <div class="modal-header">
        <div class="header-icon-wrap">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 3 21 3 21 9"/>
            <polyline points="9 21 3 21 3 15"/>
            <line x1="21" y1="3" x2="14" y2="10"/>
            <line x1="3" y1="21" x2="10" y2="14"/>
          </svg>
        </div>
        <div>
          <h2 id="deplacer-title" class="modal-title">Déplacer l'espace</h2>
          <p class="modal-subtitle">
            Changer le parent de « {{ data.espace.nom }} »
          </p>
        </div>
        <button
          type="button"
          class="btn-close"
          (click)="dialogRef.close()"
          aria-label="Fermer"
        >
          ✕
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="soumettre()" class="modal-form">
        <div class="alert-box">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div class="alert-content">
            <span class="alert-title">Impact sur les droits d'accès</span>
            <p class="alert-desc">
              Déplacer cet espace modifiera immédiatement les documents que ses utilisateurs peuvent interroger (héritage des parents).
            </p>
          </div>
        </div>

        <div class="form-group">
          <label for="nouveau_parent_id" class="form-label">Sélectionner le nouvel espace parent</label>
          <select
            id="nouveau_parent_id"
            formControlName="nouveau_parent_id"
            class="form-select"
          >
            <option [value]="null">Aucun (Placer à la racine)</option>
            @for (p of data.parentsPossibles; track p.id) {
              <option [value]="p.id">{{ p.nom }}</option>
            }
          </select>
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="btn-cancel"
            (click)="dialogRef.close()"
          >
            Annuler
          </button>
          <button
            type="submit"
            class="btn-submit"
          >
            Confirmer le déplacement
          </button>
        </div>
      </form>
    </div>
  `,
  styles: `
    .modal-backdrop-custom {
      background: #ffffff;
      border-radius: 16px;
      padding: 2rem;
      max-width: 500px;
      width: 90vw;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
      border: 1px solid #e2e8f0;
      box-sizing: border-box;
    }

    .modal-header {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1.5rem;
      position: relative;
    }

    .header-icon-wrap {
      width: 44px;
      height: 44px;
      background: #fff7ed;
      color: #f97316;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .modal-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.25rem 0;
    }

    .modal-subtitle {
      font-size: 0.8125rem;
      color: #64748b;
      margin: 0;
    }

    .btn-close {
      position: absolute;
      top: 0;
      right: 0;
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
    }

    .alert-box {
      display: flex;
      gap: 0.75rem;
      background: #fffbeb;
      border: 1px solid #fef3c7;
      padding: 0.85rem 1rem;
      border-radius: 8px;
      color: #b45309;
      margin-bottom: 1rem;
    }

    .alert-title {
      font-weight: 700;
      font-size: 0.8125rem;
      display: block;
      margin-bottom: 0.15rem;
    }

    .alert-desc {
      font-size: 0.75rem;
      margin: 0;
      line-height: 1.4;
      color: #92400e;
    }

    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .form-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: #1e293b;
    }

    .form-select {
      padding: 0.65rem 0.85rem;
      font-size: 0.875rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      color: #0f172a;
      background-color: #ffffff;
      outline: none;
      font-family: inherit;
    }

    .form-select:focus {
      border-color: #f97316;
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.15);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 0.5rem;
      padding-top: 1rem;
      border-top: 1px solid #f1f5f9;
    }

    .btn-cancel {
      padding: 0.65rem 1.125rem;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
    }

    .btn-cancel:hover {
      background: #f8fafc;
      color: #0f172a;
    }

    .btn-submit {
      padding: 0.65rem 1.25rem;
      background: #f97316;
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      color: #ffffff;
      cursor: pointer;
    }

    .btn-submit:hover {
      background: #ea580c;
    }
  `,
})
export class EspaceDeplacerModalComponent {
  private readonly fb = inject(FormBuilder);
  readonly dialogRef = inject(DialogRef<DeplacerEspaceForm | null>);
  readonly data: DeplacerModalData = inject(DIALOG_DATA);

  readonly form: FormGroup = this.fb.group({
    nouveau_parent_id: [this.data.espace.parent_id],
  });

  soumettre(): void {
    this.dialogRef.close(this.form.value);
  }
}
