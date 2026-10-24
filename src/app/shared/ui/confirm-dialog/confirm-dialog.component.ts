import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ConfirmDialogData } from './confirm-dialog.types';

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <div
      class="dialog-box"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-message"
    >
      <h2 id="dialog-title" class="dialog-title">{{ data.title }}</h2>
      <p id="dialog-message" class="dialog-message">{{ data.message }}</p>

      <div class="dialog-actions">
        <button
          #cancelButton
          type="button"
          class="btn btn-secondary"
          (click)="annuler()"
        >
          {{ data.cancelLabel || 'Annuler' }}
        </button>

        <button
          #confirmButton
          type="button"
          class="btn"
          [class.btn-danger]="data.danger"
          [class.btn-primary]="!data.danger"
          (click)="confirmer()"
        >
          {{ data.confirmLabel || 'Confirmer' }}
        </button>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      max-width: 480px;
      width: 90vw;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--color-border);
    }

    .dialog-title {
      margin: 0 0 0.75rem 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-text);
    }

    .dialog-message {
      margin: 0 0 1.5rem 0;
      font-size: 0.95rem;
      color: var(--color-text-muted);
      line-height: 1.5;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      border-radius: var(--radius-sm);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid transparent;
      transition: background-color 0.15s ease;
    }

    .btn-secondary {
      background: var(--color-surface);
      border-color: var(--color-border);
      color: var(--color-text);

      &:hover,
      &:focus {
        background: var(--color-surface-hover);
        border-color: var(--color-border-hover);
      }
    }

    .btn-primary {
      background: var(--color-primary);
      color: var(--color-primary-contrast);

      &:hover,
      &:focus {
        background: var(--color-primary-hover);
      }
    }

    .btn-danger {
      background: var(--color-danger);
      color: var(--color-danger-contrast);

      &:hover,
      &:focus {
        background: var(--color-danger-hover);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent implements AfterViewInit {
  protected readonly data = inject<ConfirmDialogData>(DIALOG_DATA);
  protected readonly dialogRef = inject(DialogRef<boolean>);

  private readonly cancelButton = viewChild<ElementRef<HTMLButtonElement>>('cancelButton');
  private readonly confirmButton = viewChild<ElementRef<HTMLButtonElement>>('confirmButton');

  ngAfterViewInit(): void {
    if (this.data.danger) {
      this.cancelButton()?.nativeElement.focus();
    } else {
      this.confirmButton()?.nativeElement.focus();
    }
  }

  confirmer(): void {
    this.dialogRef.close(true);
  }

  annuler(): void {
    this.dialogRef.close(false);
  }
}
