import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { environment } from '@env/environment';
import { GoogleIdentityService } from '../services/google-identity.service';

@Component({
  selector: 'app-google-sign-in-button',
  template: `
    <div class="google-auth-wrapper">
      @if (googleClientIdConfigured()) {
        <!-- Google GIS container -->
        <div
          #googleBtnContainer
          class="google-btn-container"
          aria-label="Continuer avec Google"
        ></div>
      }

      @if (!googleClientIdConfigured() || scriptEchoue()) {
        <!-- Bouton conforme au design de référence -->
        <button
          type="button"
          class="google-design-btn"
          (click)="surClicBoutonGoogle()"
          aria-label="Continuer avec Google"
        >
          <svg
            class="google-icon-svg"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            aria-hidden="true"
          >
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span class="btn-text">Continuer avec Google</span>
        </button>

        @if (messageIndisponible()) {
          <p class="google-fallback-hint" role="status">
            La connexion Google est indisponible actuellement. Utilisez votre email et mot de passe.
          </p>
        }
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .google-auth-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      gap: 0.5rem;
    }

    .google-btn-container {
      display: flex;
      justify-content: center;
      width: 100%;
      overflow: hidden;
      border-radius: 12px;

      iframe {
        margin: 0 auto !important;
      }
    }

    .google-design-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      width: 100%;
      height: 46px;
      padding: 0 1rem;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      color: #1e293b;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);

      &:hover {
        background: #f8fafc;
        border-color: #cbd5e1;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
      }

      &:active {
        background: #f1f5f9;
      }
    }

    .google-icon-svg {
      flex-shrink: 0;
    }

    .btn-text {
      font-size: 0.875rem;
      font-weight: 500;
      color: #1e293b;
    }

    .google-fallback-hint {
      margin: 0;
      font-size: 0.75rem;
      color: #64748b;
      text-align: center;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoogleSignInButtonComponent implements AfterViewInit {
  readonly idToken = output<string>();

  private readonly googleService = inject(GoogleIdentityService);
  private readonly btnContainer = viewChild<ElementRef<HTMLElement>>('googleBtnContainer');

  readonly scriptEchoue = signal<boolean>(false);
  readonly messageIndisponible = signal<boolean>(false);

  readonly googleClientIdConfigured = signal<boolean>(
    Boolean(environment.googleClientId && environment.googleClientId.trim() !== ''),
  );

  ngAfterViewInit(): void {
    if (!this.googleClientIdConfigured()) {
      return;
    }

    this.googleService
      .charger()
      .then(() => {
        const container = this.btnContainer()?.nativeElement;
        if (!container) return;

        this.googleService.initialiser((response: google.accounts.id.CredentialResponse) => {
          if (response?.credential) {
            this.idToken.emit(response.credential);
          }
        });

        this.googleService.rendreBouton(container);
      })
      .catch(() => {
        this.scriptEchoue.set(true);
      });
  }

  surClicBoutonGoogle(): void {
    if (!this.googleClientIdConfigured() || this.scriptEchoue()) {
      this.messageIndisponible.set(true);
    }
  }
}
