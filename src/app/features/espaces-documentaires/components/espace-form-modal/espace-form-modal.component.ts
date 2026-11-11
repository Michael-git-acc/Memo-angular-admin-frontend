import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import {
  EspaceDocumentaire,
  TypeEspace,
  CreationEspaceForm,
} from '../../models/espace-documentaire';

export interface EspaceModalData {
  titre: string;
  espace?: EspaceDocumentaire | null;
  parentParDefautId?: string | null;
  ecoleId?: string | null;
  ecolesDisponibles: { id: string; nom: string }[];
  espacesParentsDisponibles: { id: string; nom: string }[];
  typesDisponibles: TypeEspace[];
}

@Component({
  selector: 'app-espace-form-modal',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="modal-backdrop-custom"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div class="modal-header">
        <div class="header-icon-wrap">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div>
          <h2 id="modal-title" class="modal-title">{{ data.titre }}</h2>
          <p class="modal-subtitle">
            Structurez vos périmètres documentaires et configurez leurs accès.
          </p>
        </div>
        <button
          type="button"
          class="btn-close"
          (click)="dialogRef.close()"
          aria-label="Fermer la boîte de dialogue"
        >
          ✕
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="soumettre()" class="modal-form">
        <!-- École de rattachement -->
        <div class="form-group">
          <label for="ecole_id" class="form-label required">École de rattachement</label>
          <select
            id="ecole_id"
            formControlName="ecole_id"
            class="form-select"
            [class.invalid]="champInvalide('ecole_id')"
          >
            <option value="" disabled>Sélectionner une école...</option>
            @for (ecole of data.ecolesDisponibles; track ecole.id) {
              <option [value]="ecole.id">{{ ecole.nom }}</option>
            }
          </select>
          @if (champInvalide('ecole_id')) {
            <span class="error-text">Veuillez sélectionner une école.</span>
          }
        </div>

        <!-- Nom de l'espace -->
        <div class="form-group">
          <label for="nom" class="form-label required">Nom de l'espace</label>
          <input
            id="nom"
            type="text"
            formControlName="nom"
            class="form-input"
            placeholder="Ex : Classe 4C, Département RH, Cycle 2..."
            [class.invalid]="champInvalide('nom')"
          />
          @if (champInvalide('nom')) {
            <span class="error-text">Le nom de l'espace est requis (max 255 car.)</span>
          }
        </div>

        <div class="form-row">
          <!-- Espace parent -->
          <div class="form-group">
            <label for="parent_id" class="form-label">Espace parent</label>
            <select
              id="parent_id"
              formControlName="parent_id"
              class="form-select"
            >
              <option [value]="null">Aucun (Espace racine)</option>
              @for (p of data.espacesParentsDisponibles; track p.id) {
                <option [value]="p.id">{{ p.nom }}</option>
              }
            </select>
            <span class="hint-text">Les documents du parent seront consultables par cet espace.</span>
          </div>

          <!-- Type d'espace -->
          <div class="form-group">
            <label for="type_id" class="form-label">Type d'espace</label>
            <select
              id="type_id"
              formControlName="type_id"
              class="form-select"
            >
              <option [value]="null">Aucun type spécifique</option>
              @for (type of data.typesDisponibles; track type.id) {
                <option [value]="type.id">{{ type.nom }}</option>
              }
            </select>
            <span class="hint-text">Simple libellé d'organisation visuelle.</span>
          </div>
        </div>

        <!-- Confidentialité -->
        <div class="form-group">
          <label for="confidentialite" class="form-label">Confidentialité</label>
          <select
            id="confidentialite"
            formControlName="confidentialite"
            class="form-select"
          >
            <option value="interne">Interne (Personnel et élèves autorisés)</option>
            <option value="public">Public (Visible aussi des parents et invités)</option>
            <option value="restreint">Restreint (Équipe restreinte / Administration)</option>
          </select>
        </div>

        <!-- Description -->
        <div class="form-group">
          <label for="description" class="form-label">Description (facultative)</label>
          <textarea
            id="description"
            formControlName="description"
            class="form-textarea"
            rows="3"
            placeholder="Précisez la fonction ou le public de cet espace..."
          ></textarea>
        </div>

        <!-- Boutons d'action -->
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
            [disabled]="form.invalid"
          >
            {{ data.espace ? 'Enregistrer les modifications' : 'Créer l’espace' }}
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
      max-width: 580px;
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
      background: #eff6ff;
      color: #3b82f6;
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

    .btn-close:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 1.125rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
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

    .form-label.required::after {
      content: ' *';
      color: #ef4444;
    }

    .form-input,
    .form-select,
    .form-textarea {
      padding: 0.65rem 0.85rem;
      font-size: 0.875rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      color: #0f172a;
      background-color: #ffffff;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
      font-family: inherit;
    }

    .form-input:focus,
    .form-select:focus,
    .form-textarea:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    .form-input.invalid,
    .form-select.invalid {
      border-color: #ef4444;
    }

    .hint-text {
      font-size: 0.72rem;
      color: #94a3b8;
    }

    .error-text {
      font-size: 0.75rem;
      color: #ef4444;
      font-weight: 500;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1rem;
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
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      color: #ffffff;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
    }

    .btn-submit:hover:not(:disabled) {
      filter: brightness(1.05);
    }

    .btn-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,
})
export class EspaceFormModalComponent {
  private readonly fb = inject(FormBuilder);
  readonly dialogRef = inject(DialogRef<CreationEspaceForm | null>);
  readonly data: EspaceModalData = inject(DIALOG_DATA);

  readonly form: FormGroup = this.fb.group({
    ecole_id: [
      this.data.espace?.ecole_id || this.data.ecoleId || (this.data.ecolesDisponibles[0]?.id || ''),
      [Validators.required],
    ],
    nom: [
      this.data.espace?.nom || '',
      [Validators.required, Validators.maxLength(255)],
    ],
    parent_id: [
      this.data.espace ? this.data.espace.parent_id : (this.data.parentParDefautId || null),
    ],
    type_id: [
      this.data.espace?.type_id || null,
    ],
    confidentialite: [
      this.data.espace?.confidentialite || 'interne',
    ],
    description: [
      this.data.espace?.description || '',
    ],
  });

  champInvalide(champ: string): boolean {
    const c = this.form.get(champ);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  soumettre(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.value);
  }
}
