import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '@core/services/auth.service';
import { urlInterne } from '@core/utils/safe-redirect';
import { GoogleSignInButtonComponent } from '../components/google-sign-in-button.component';

interface ConnexionForm {
  email: FormControl<string>;
  motDePasse: FormControl<string>;
  seSouvenirDeMoi: FormControl<boolean>;
}

@Component({
  selector: 'app-connexion-page',
  imports: [ReactiveFormsModule, GoogleSignInButtonComponent],
  template: `
    <div class="login-page">
      <!-- En-tête supérieur épuré -->
      <header class="page-topbar">
        <div class="brand-header">
          <img
            src="assets/pages_design/memo-logo-exact-trans.png"
            alt="Logo Mémo"
            class="brand-header-icon"
            width="30"
            height="20"
          />
          <span class="brand-header-name">Mémo</span>
        </div>

        <button
          type="button"
          class="lang-switch-btn"
          aria-label="Changer de langue. Langue actuelle : Français"
        >
          <svg
            class="lang-globe-icon"
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
          <span class="lang-code">FR</span>
          <span class="lang-chevron" aria-hidden="true">⌵</span>
        </button>
      </header>

      <!-- Corps principal : 2 colonnes parfaitement ajustées -->
      <main class="page-content">
        <!-- Colonne Gauche : Présentation épurée -->
        <section class="showcase-column" aria-label="Présentation Mémo">
          <!-- Logo 3D illuminé avec effet glowing conforme à l'image -->
          <div class="logo-hero-container">
            <div class="logo-glow-halo" aria-hidden="true"></div>
            <img
              src="assets/pages_design/memo-logo-exact-trans.png"
              alt="Mémo"
              class="logo-hero-img"
              width="130"
              height="86"
            />
          </div>

          <div class="showcase-header">
            <h2 class="showcase-brand-name">Mémo</h2>
            <p class="showcase-brand-desc">Votre assistant académique intelligent</p>
            <div class="accent-gradient-bar" aria-hidden="true"></div>
          </div>

          <div class="showcase-pitch">
            <h3 class="pitch-title">
              Toute la documentation<br />
              de votre école, <span class="gradient-text">en un chat.</span>
            </h3>

            <ul class="features-list" role="list">
              <li class="feature-item">
                <div class="feature-circle" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#0070f3" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <div class="feature-body">
                  <strong class="feature-title">Trouvez</strong>
                  <span class="feature-subtitle">vos documents en un instant</span>
                </div>
              </li>

              <li class="feature-item">
                <div class="feature-circle" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#0070f3" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <div class="feature-body">
                  <strong class="feature-title">Comprenez</strong>
                  <span class="feature-subtitle">grâce à des réponses claires</span>
                </div>
              </li>

              <li class="feature-item">
                <div class="feature-circle" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#0070f3" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                  </svg>
                </div>
                <div class="feature-body">
                  <strong class="feature-title">Progressez</strong>
                  <span class="feature-subtitle">plus facilement</span>
                </div>
              </li>
            </ul>
          </div>

          <div class="showcase-bottom-quote">
            <div class="quote-line" aria-hidden="true"></div>
            <span class="quote-title">Mémo</span>
            <span class="quote-desc">Plus qu'une application,<br />un véritable allié académique.</span>
          </div>
        </section>

        <!-- Colonne Droite : Carte de connexion blanche épurée -->
        <section class="card-column" aria-label="Connexion">
          <div class="login-card">
            <div class="card-intro">
              <span class="intro-eyebrow">BON RETOUR !</span>
              <h1 class="intro-title">Connectez-vous</h1>
              <p class="intro-subtitle">
                Accédez à votre compte pour profiter<br />
                de toutes les fonctionnalités de Mémo.
              </p>
            </div>

            <!-- Message d'alerte WCAG accessible -->
            @if (messageErreur(); as msg) {
              <div
                #errorAlert
                class="error-banner"
                role="alert"
                tabindex="-1"
                aria-live="assertive"
              >
                <svg
                  class="error-banner-icon"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{{ msg }}</span>
              </div>
            }

            <!-- Formulaire réactif -->
            <form
              [formGroup]="form"
              (ngSubmit)="soumettre()"
              class="login-fields"
              novalidate
            >
              <!-- Champ E-mail / Identifiant -->
              <div class="field-item">
                <label for="connexion-email" class="visually-hidden">
                  Adresse e-mail ou identifiant
                </label>
                <div
                  class="field-input-container"
                  [class.is-invalid]="champInvalide('email')"
                >
                  <span class="field-leading-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </span>
                  <input
                    #emailInput
                    id="connexion-email"
                    type="email"
                    formControlName="email"
                    autocomplete="username"
                    class="field-input"
                    placeholder="Adresse e-mail ou identifiant"
                    [attr.aria-invalid]="champInvalide('email')"
                    [attr.aria-describedby]="champInvalide('email') ? 'email-err-msg' : null"
                  />
                </div>
                @if (champInvalide('email')) {
                  <span id="email-err-msg" class="field-error-hint" role="alert">
                    @if (form.controls.email.hasError('required')) {
                      L'adresse e-mail est obligatoire.
                    } @else if (form.controls.email.hasError('email')) {
                      Veuillez saisir une adresse e-mail valide.
                    }
                  </span>
                }
              </div>

              <!-- Champ Mot de passe -->
              <div class="field-item">
                <label for="connexion-password" class="visually-hidden">
                  Mot de passe
                </label>
                <div
                  class="field-input-container"
                  [class.is-invalid]="champInvalide('motDePasse')"
                >
                  <span class="field-leading-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </span>
                  <input
                    #passwordInput
                    id="connexion-password"
                    [type]="afficherMotDePasse() ? 'text' : 'password'"
                    formControlName="motDePasse"
                    autocomplete="current-password"
                    class="field-input password-input-pad"
                    placeholder="Mot de passe"
                    [attr.aria-invalid]="champInvalide('motDePasse')"
                    [attr.aria-describedby]="champInvalide('motDePasse') ? 'pwd-err-msg' : null"
                  />
                  <button
                    type="button"
                    class="field-trailing-btn"
                    (click)="basculerAffichageMotDePasse()"
                    [attr.aria-label]="afficherMotDePasse() ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      @if (afficherMotDePasse()) {
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      } @else {
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      }
                    </svg>
                  </button>
                </div>
                @if (champInvalide('motDePasse')) {
                  <span id="pwd-err-msg" class="field-error-hint" role="alert">
                    Le mot de passe est obligatoire.
                  </span>
                }
              </div>

              <!-- Ligne Options : Se souvenir de moi & Mot de passe oublié -->
              <div class="options-row">
                <label class="remember-checkbox-label">
                  <input
                    type="checkbox"
                    formControlName="seSouvenirDeMoi"
                    class="native-checkbox"
                  />
                  <span>Se souvenir de moi</span>
                </label>

                <a
                  href="javascript:void(0)"
                  class="forgot-pwd-link"
                  (click)="surMotDePasseOublie($event)"
                >
                  Mot de passe oublié ?
                </a>
              </div>

              <!-- Bouton de soumission dégradé -->
              <button
                type="submit"
                class="btn-login-gradient"
                [disabled]="chargement()"
                [attr.aria-busy]="chargement()"
              >
                @if (chargement()) {
                  <span class="btn-loader" aria-hidden="true"></span>
                  <span>Connexion en cours...</span>
                } @else {
                  <span>Se connecter</span>
                  <span class="btn-arrow-icon" aria-hidden="true">→</span>
                }
              </button>
            </form>

            <!-- Séparateur Ou -->
            <div class="divider-ou" aria-hidden="true">
              <span class="ou-label">Ou</span>
            </div>

            <!-- Bouton Google -->
            <div class="google-wrapper">
              <app-google-sign-in-button (idToken)="connexionGoogle($event)" />
            </div>

            <!-- Pied de carte : Créer un compte -->
            <div class="card-footer-box">
              <span>Vous n'avez pas de compte ?</span>
              <a
                href="javascript:void(0)"
                class="register-link"
                (click)="surCreerCompte($event)"
              >
                Créer un compte
              </a>
            </div>
          </div>
        </section>
      </main>

      <!-- Éléments de vagues en arrière-plan -->
      <div class="waves-backdrop" aria-hidden="true">
        <!-- Vague horizontale au bas -->
        <img
          src="assets/pages_design/waves/wave-clean.png"
          alt=""
          class="wave-bottom-img"
        />
        <!-- Vague verticale courbe sur le côté droit -->
        <img
          src="assets/pages_design/waves/wave-right.png"
          alt=""
          class="wave-right-img"
        />
        <!-- Halos lumineux ambiants -->
        <div class="ambient-glow-left"></div>
        <div class="ambient-glow-right"></div>
      </div>
    </div>
  `,
  styleUrl: './connexion-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConnexionPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly emailInput = viewChild<ElementRef<HTMLInputElement>>('emailInput');
  private readonly passwordInput = viewChild<ElementRef<HTMLInputElement>>('passwordInput');
  private readonly errorAlert = viewChild<ElementRef<HTMLElement>>('errorAlert');

  readonly chargement = signal<boolean>(false);
  readonly afficherMotDePasse = signal<boolean>(false);
  readonly messageErreur = signal<string | null>(null);

  readonly form: FormGroup<ConnexionForm> = this.fb.group({
    email: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    motDePasse: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    seSouvenirDeMoi: this.fb.control(false, { nonNullable: true }),
  });

  champInvalide(champ: 'email' | 'motDePasse'): boolean {
    const control = this.form.controls[champ];
    return control.invalid && (control.dirty || control.touched);
  }

  basculerAffichageMotDePasse(): void {
    this.afficherMotDePasse.update((v) => !v);
  }

  async soumettre(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.repositionnerFocusSurPremierChampInvalide();
      return;
    }

    this.chargement.set(true);
    this.messageErreur.set(null);

    const { email, motDePasse } = this.form.getRawValue();

    try {
      await this.authService.connecterAdmin(email, motDePasse);
      this.redirigerApresConnexion();
    } catch (err: unknown) {
      this.traiterErreurConnexion(err);
    } finally {
      this.chargement.set(false);
    }
  }

  async connexionGoogle(idToken: string): Promise<void> {
    this.chargement.set(true);
    this.messageErreur.set(null);

    try {
      await this.authService.connecterAvecGoogle(idToken);
      this.redirigerApresConnexion();
    } catch (err: unknown) {
      this.traiterErreurConnexion(err);
    } finally {
      this.chargement.set(false);
    }
  }

  surMotDePasseOublie(event: Event): void {
    event.preventDefault();
    this.messageErreur.set(
      'Pour réinitialiser votre mot de passe, veuillez contacter l’administrateur de votre établissement.',
    );
  }

  surCreerCompte(event: Event): void {
    event.preventDefault();
    this.messageErreur.set(
      'Les comptes sont gérés par les administrateurs scolaires. Veuillez contacter votre administration.',
    );
  }

  private traiterErreurConnexion(err: unknown): void {
    this.form.controls.motDePasse.reset();

    let message =
      'Connexion impossible. Vérifiez vos identifiants ou contactez votre administrateur.';

    if (err instanceof HttpErrorResponse) {
      if (err.status === 429) {
        message = 'Trop de tentatives. Réessayez dans quelques minutes.';
      } else if (err.status === 0) {
        message = 'Le serveur est injoignable. Réessayez plus tard.';
      }
    }

    this.messageErreur.set(message);

    setTimeout(() => {
      const alertEl = this.errorAlert()?.nativeElement;
      if (alertEl) {
        alertEl.focus();
      } else {
        this.repositionnerFocusSurPremierChampInvalide();
      }
    });
  }

  private repositionnerFocusSurPremierChampInvalide(): void {
    if (this.form.controls.email.invalid) {
      this.emailInput()?.nativeElement.focus();
    } else if (this.form.controls.motDePasse.invalid) {
      this.passwordInput()?.nativeElement.focus();
    }
  }

  private redirigerApresConnexion(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    const cible = urlInterne(returnUrl, '/tableau-de-bord');
    this.router.navigateByUrl(cible);
  }
}
