import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  template: `
    <div
      class="toast-container"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="toast-item"
          [class]="'toast-' + toast.type"
          role="status"
        >
          <span class="toast-message">{{ toast.message }}</span>
          <button
            type="button"
            class="toast-close"
            (click)="toastService.dismiss(toast.id)"
            aria-label="Fermer la notification"
          >
            &times;
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .toast-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: 380px;
      width: 100%;
      pointer-events: none;
    }

    .toast-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-md);
      pointer-events: auto;
      font-size: 0.875rem;
      line-height: 1.4;
      border: 1px solid transparent;
    }

    .toast-message {
      flex: 1;
    }

    .toast-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      line-height: 1;
      cursor: pointer;
      padding: 0 0.25rem;
      color: inherit;
      opacity: 0.7;

      &:hover,
      &:focus {
        opacity: 1;
      }
    }

    .toast-success {
      background-color: var(--color-success-bg);
      color: var(--color-success);
      border-color: var(--color-success-border);
    }

    .toast-error {
      background-color: var(--color-danger-bg);
      color: var(--color-danger);
      border-color: var(--color-danger-border);
    }

    .toast-info {
      background-color: var(--color-info-bg);
      color: var(--color-info);
      border-color: var(--color-info-border);
    }

    .toast-warning {
      background-color: var(--color-warning-bg);
      color: var(--color-warning);
      border-color: var(--color-warning-border);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  protected readonly toastService = inject(ToastService);
  private readonly liveAnnouncer = inject(LiveAnnouncer);
  private readonly announcedIds = new Set<string>();

  constructor() {
    effect(() => {
      const toasts = this.toastService.toasts();
      for (const toast of toasts) {
        if (!this.announcedIds.has(toast.id)) {
          this.announcedIds.add(toast.id);
          this.liveAnnouncer.announce(
            toast.message,
            toast.type === 'error' ? 'assertive' : 'polite',
          );
        }
      }
    });
  }
}
