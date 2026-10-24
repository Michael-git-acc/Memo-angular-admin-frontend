import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-auth-page',
  template: `
    <div class="auth-card">
      <h1 class="auth-title">Connexion</h1>
      <p class="auth-subtitle">Portail d'administration</p>

      <div class="auth-actions">
        <button
          type="button"
          class="btn-google"
          disabled
          aria-disabled="true"
        >
          Se connecter avec Google
        </button>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background-color: var(--color-background);
      padding: 1rem;
    }

    .auth-card {
      width: 100%;
      max-width: 400px;
      padding: 2.5rem;
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-md);
      text-align: center;
    }

    .auth-title {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-text);
    }

    .auth-subtitle {
      margin: 0 0 2rem 0;
      font-size: 0.875rem;
      color: var(--color-text-muted);
    }

    .auth-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .btn-google {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border: 1px solid var(--color-border);
      background-color: var(--color-surface);
      color: var(--color-text-muted);
      border-radius: var(--radius-sm);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: not-allowed;
      opacity: 0.6;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthPageComponent {}
