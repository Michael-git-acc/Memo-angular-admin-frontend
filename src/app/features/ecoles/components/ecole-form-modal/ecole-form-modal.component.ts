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
import { Ecole, CreationEcoleForm, StatutEcole, ModeDepassement } from '../../models/ecole';

export interface EcoleModalData {
  titre: string;
  ecole?: Ecole | null;
  regionsDisponibles: string[];
}

@Component({
  selector: 'app-ecole-form-modal',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div
      class="modal-backdrop-custom"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div class="modal-header">
        <div class="header-icon-wrap">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 21h18"></path>
            <path d="M5 21V7l8-4v18"></path>
            <path d="M19 21V11l-6-4"></path>
            <path d="M9 9h1"></path>
            <path d="M9 13h1"></path>
            <path d="M9 17h1"></path>
          </svg>
        </div>
        <div>
          <h2 id="modal-title" class="modal-title">{{ data.titre }}</h2>
          <p class="modal-subtitle">
            Configurez les informations administratives, le domaine Google et les quotas.
          </p>
        </div>
        <button
          type="button"
          class="btn-close"
          (click)="fermer()"
          aria-label="Fermer la boîte de dialogue"
        >
          &times;
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="soumettre()" class="modal-body">
        <div class="form-grid">
          <!-- Nom de l'école -->
          <div class="form-group col-span-2">
            <label for="nom" class="form-label">
              Nom de l'école <span class="required">*</span>
            </label>
            <input
              id="nom"
              type="text"
              formControlName="nom"
              class="form-input"
              placeholder="Ex: Lycée Bilingue de Douala"
            />
            @if (form.get('nom')?.invalid && form.get('nom')?.touched) {
              <span class="field-error">Le nom de l'école est requis.</span>
            }
          </div>

          <!-- Domaine Google Workspace -->
          <div class="form-group col-span-2">
            <label for="domaine_google" class="form-label">
              Domaine Google Workspace
              <span class="label-hint">(ex: lyceebilinguedouala.cm)</span>
            </label>
            <div class="input-with-icon">
              <svg
                class="input-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              <input
                id="domaine_google"
                type="text"
                formControlName="domaine_google"
                class="form-input pl-9"
                placeholder="domaine-ecole.edu"
              />
            </div>
            <p class="field-help">
              Utilisé pour valider automatiquement les connexions Google des utilisateurs.
            </p>
          </div>

          <!-- Statut -->
          <div class="form-group">
            <label for="statut" class="form-label">Statut</label>
            <select id="statut" formControlName="statut" class="form-select">
              <option value="active">Active</option>
              <option value="suspendue">Suspendue</option>
              <option value="desactivee">Désactivée</option>
            </select>
          </div>

          <!-- Région -->
          <div class="form-group">
            <label for="region" class="form-label">Région</label>
            <input
              id="region"
              type="text"
              formControlName="region"
              class="form-input"
              placeholder="Ex: Littoral, Centre, Ouest..."
              list="regionsList"
            />
            <datalist id="regionsList">
              @for (reg of data.regionsDisponibles; track reg) {
                <option [value]="reg"></option>
              }
            </datalist>
          </div>

          <!-- Ville -->
          <div class="form-group">
            <label for="ville" class="form-label">Ville</label>
            <input
              id="ville"
              type="text"
              formControlName="ville"
              class="form-input"
              placeholder="Ex: Douala, Yaoundé..."
            />
          </div>

          <!-- Responsables -->
          <div class="form-group">
            <label for="responsables" class="form-label">
              Responsables / Contacts
            </label>
            <input
              id="responsables"
              type="text"
              formControlName="responsables"
              class="form-input"
              placeholder="Emails séparés par des virgules"
            />
          </div>

          <!-- Description -->
          <div class="form-group col-span-2">
            <label for="description" class="form-label">Description</label>
            <textarea
              id="description"
              formControlName="description"
              rows="2"
              class="form-textarea"
              placeholder="Brève présentation de l'école..."
            ></textarea>
          </div>

          <!-- Section Quota & Paramètres IA -->
          <div class="section-divider col-span-2">
            <span>Quota et Paramètres d'usage</span>
          </div>

          <!-- Quota mensuel -->
          <div class="form-group">
            <label for="quota_questions_mois" class="form-label">
              Quota mensuel (questions)
            </label>
            <input
              id="quota_questions_mois"
              type="number"
              formControlName="quota_questions_mois"
              class="form-input"
              placeholder="Illimité si vide"
              min="0"
            />
          </div>

          <!-- Mode de dépassement -->
          <div class="form-group">
            <label for="mode_depassement" class="form-label">
              Mode de dépassement
            </label>
            <select
              id="mode_depassement"
              formControlName="mode_depassement"
              class="form-select"
            >
              <option value="alerte">Alerte seule</option>
              <option value="blocage">Blocage strict</option>
            </select>
          </div>

          <!-- Seuil d'alerte (%) -->
          <div class="form-group">
            <label for="seuil_alerte_pct" class="form-label">
              Seuil d'alerte (%)
            </label>
            <input
              id="seuil_alerte_pct"
              type="number"
              formControlName="seuil_alerte_pct"
              class="form-input"
              min="1"
              max="100"
            />
          </div>
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            (click)="fermer()"
          >
            Annuler
          </button>
          <button
            type="submit"
            class="btn btn-gradient"
            [disabled]="form.invalid || enregistrementEnCours"
          >
            {{ enregistrementEnCours ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: `
    :host {
      display: block;
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      max-width: 620px;
      width: 92vw;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08);
      border: 1px solid var(--color-border);
    }

    .modal-backdrop-custom {
      padding: 1.5rem;
    }

    .modal-header {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--color-border);
      position: relative;
    }

    .header-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      color: var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .modal-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-text);
      letter-spacing: -0.01em;
    }

    .modal-subtitle {
      margin: 0.25rem 0 0 0;
      font-size: 0.8125rem;
      color: var(--color-text-muted);
      line-height: 1.4;
    }

    .btn-close {
      margin-left: auto;
      background: none;
      border: none;
      font-size: 1.5rem;
      line-height: 1;
      color: var(--color-text-muted);
      cursor: pointer;
      padding: 0.25rem;
      border-radius: var(--radius-sm);

      &:hover {
        color: var(--color-text);
        background: var(--color-surface-hover);
      }
    }

    .modal-body {
      padding: 1.25rem 0 0 0;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .col-span-2 {
      grid-column: span 2;
    }

    .section-divider {
      margin: 0.5rem 0 0.25rem 0;
      padding-top: 0.75rem;
      border-top: 1px dashed var(--color-border);

      span {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-text-subtle);
      }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .form-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--color-text);
    }

    .required {
      color: var(--color-danger);
    }

    .label-hint {
      font-weight: 400;
      color: var(--color-text-subtle);
      font-size: 0.75rem;
      margin-left: 0.25rem;
    }

    .field-help {
      margin: 0.2rem 0 0 0;
      font-size: 0.75rem;
      color: var(--color-text-muted);
    }

    .field-error {
      font-size: 0.75rem;
      color: var(--color-danger);
    }

    .form-input,
    .form-select,
    .form-textarea {
      width: 100%;
      padding: 0.6rem 0.75rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      color: var(--color-text);
      background-color: var(--color-surface);
      outline: none;
      transition: all 0.15s ease;

      &:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.12);
      }
    }

    .input-with-icon {
      position: relative;
      display: flex;
      align-items: center;

      .input-icon {
        position: absolute;
        left: 0.75rem;
        color: var(--color-text-subtle);
        pointer-events: none;
      }

      .pl-9 {
        padding-left: 2.25rem;
      }
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 0.75rem;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--color-border);
    }

    .btn {
      padding: 0.6rem 1.25rem;
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.2s ease;
    }

    .btn-secondary {
      background: var(--color-surface);
      border-color: var(--color-border);
      color: var(--color-text-muted);

      &:hover {
        background: var(--color-surface-hover);
        color: var(--color-text);
      }
    }

    .btn-gradient {
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);

      &:hover:not(:disabled) {
        opacity: 0.95;
        box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EcoleFormModalComponent {
  readonly data = inject<EcoleModalData>(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<CreationEcoleForm | null>);
  private readonly fb = inject(FormBuilder);

  protected enregistrementEnCours = false;

  protected form: FormGroup = this.fb.group({
    nom: [this.data.ecole?.nom ?? '', [Validators.required, Validators.maxLength(255)]],
    domaine_google: [this.data.ecole?.domaine_google ?? '', [Validators.maxLength(255)]],
    statut: [this.data.ecole?.statut ?? 'active'],
    region: [this.data.ecole?.region ?? '', [Validators.maxLength(100)]],
    ville: [this.data.ecole?.ville ?? '', [Validators.maxLength(100)]],
    description: [this.data.ecole?.description ?? ''],
    responsables: [
      Array.isArray(this.data.ecole?.responsables)
        ? this.data.ecole?.responsables?.join(', ')
        : (this.data.ecole?.responsables ?? ''),
    ],
    quota_questions_mois: [this.data.ecole?.quota_questions_mois ?? null, [Validators.min(0)]],
    seuil_alerte_pct: [this.data.ecole?.seuil_alerte_pct ?? 80, [Validators.min(1), Validators.max(100)]],
    mode_depassement: [this.data.ecole?.mode_depassement ?? 'alerte'],
  });

  fermer(): void {
    this.dialogRef.close(null);
  }

  soumettre(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    const respString = val.responsables ? String(val.responsables) : '';
    const respArray = respString
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);

    const payload: CreationEcoleForm = {
      nom: val.nom.trim(),
      domaine_google: val.domaine_google?.trim() || null,
      statut: val.statut as StatutEcole,
      region: val.region?.trim() || null,
      ville: val.ville?.trim() || null,
      description: val.description?.trim() || null,
      responsables: respArray.length > 0 ? respArray : null,
      quota_questions_mois: val.quota_questions_mois ? Number(val.quota_questions_mois) : null,
      seuil_alerte_pct: val.seuil_alerte_pct ? Number(val.seuil_alerte_pct) : 80,
      mode_depassement: val.mode_depassement as ModeDepassement,
    };

    this.dialogRef.close(payload);
  }
}

