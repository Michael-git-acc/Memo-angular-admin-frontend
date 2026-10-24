import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LoadingService } from './loading.service';

@Component({
  selector: 'app-loading-overlay',
  template: `
    @if (loadingService.isLoading()) {
      <div
        class="loading-overlay"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div class="spinner" aria-hidden="true"></div>
        <span class="visually-hidden">Chargement en cours...</span>
      </div>
    }
  `,
  styles: `
    .loading-overlay {
      position: fixed;
      inset: 0;
      z-index: 9998;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--color-overlay);
      backdrop-filter: blur(2px);
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top-color: var(--color-surface);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingOverlayComponent {
  protected readonly loadingService = inject(LoadingService);
}
