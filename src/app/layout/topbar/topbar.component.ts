import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SessionService } from '@core/services/session.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-topbar',
  template: `
    <header class="topbar" role="banner">
      <div class="topbar-context">
        <span class="portal-badge">Administration</span>
      </div>

      <div class="topbar-user">
        <span class="user-name">
          {{ sessionService.utilisateur()?.nom ?? 'Administrateur' }}
        </span>

        <button
          type="button"
          class="btn-logout"
          (click)="deconnecter()"
          aria-label="Se déconnecter"
        >
          Déconnexion
        </button>
      </div>
    </header>
  `,
  styles: `
    :host {
      display: block;
      height: var(--topbar-height);
      width: 100%;
    }

    .topbar {
      height: 100%;
      background-color: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
    }

    .portal-badge {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--color-primary);
      background-color: var(--color-primary-light);
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);
    }

    .topbar-user {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text);
    }

    .btn-logout {
      padding: 0.4rem 0.75rem;
      font-size: 0.8125rem;
      background: none;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      color: var(--color-text-muted);
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        color: var(--color-danger);
        border-color: var(--color-danger-border);
        background-color: var(--color-danger-bg);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopbarComponent {
  protected readonly sessionService = inject(SessionService);
  private readonly authService = inject(AuthService);

  protected deconnecter(): void {
    try {
      this.authService.deconnecter();
    } catch {
      // Coquille: attendue pour le moment
    }
  }
}
