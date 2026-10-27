import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment';
import { SKIP_AUTH_REFRESH } from '../http/http-context';
import { LoginResponse } from '../models/auth';
import { UtilisateurSession } from '../models/utilisateur-session';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly sessionService = inject(SessionService);
  private readonly router = inject(Router);

  private refreshPromise: Promise<void> | null = null;

  async connecterAvecGoogle(idToken: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<LoginResponse>(
        `${environment.apiUrl}/auth/google`,
        { idToken },
        {
          withCredentials: true,
          headers: { 'X-Client-Type': 'web' },
          context: new HttpContext().set(SKIP_AUTH_REFRESH, true),
        },
      ),
    );
    this.sessionService.definirJeton(res.accessToken);
    await this.chargerUtilisateur();
  }

  async connecterAdmin(email: string, motDePasse: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<LoginResponse>(
        `${environment.apiUrl}/auth/login`,
        { email, motDePasse },
        {
          withCredentials: true,
          headers: { 'X-Client-Type': 'web' },
          context: new HttpContext().set(SKIP_AUTH_REFRESH, true),
        },
      ),
    );
    this.sessionService.definirJeton(res.accessToken);
    await this.chargerUtilisateur();
  }

  async rafraichir(): Promise<void> {
    if (this.refreshPromise) {
      return await this.refreshPromise;
    }

    if (typeof navigator !== 'undefined' && 'locks' in navigator && navigator.locks) {
      return await navigator.locks.request('portail-auth-refresh', async () => {
        return await this.rafraichirInterne();
      });
    }

    return await this.rafraichirInterne();
  }

  private rafraichirInterne(): Promise<void> {
    if (!this.refreshPromise) {
      this.refreshPromise = (async () => {
        try {
          const res = await firstValueFrom(
            this.http.post<{ accessToken: string; expiresIn?: number }>(
              `${environment.apiUrl}/auth/refresh`,
              {},
              {
                withCredentials: true,
                headers: { 'X-Client-Type': 'web' },
                context: new HttpContext().set(SKIP_AUTH_REFRESH, true),
              },
            ),
          );
          this.sessionService.definirJeton(res.accessToken);
        } finally {
          this.refreshPromise = null;
        }
      })();
    }
    return this.refreshPromise;
  }

  async chargerUtilisateur(): Promise<UtilisateurSession> {
    const jeton = this.sessionService.jetonAcces();
    const headers: Record<string, string> = { 'X-Client-Type': 'web' };
    if (jeton) {
      headers['Authorization'] = `Bearer ${jeton}`;
    }

    const utilisateur = await firstValueFrom(
      this.http.get<UtilisateurSession>(`${environment.apiUrl}/auth/me`, {
        withCredentials: true,
        headers,
        context: new HttpContext().set(SKIP_AUTH_REFRESH, true),
      }),
    );
    this.sessionService.definirUtilisateur(utilisateur);
    return utilisateur;
  }

  async restaurerSession(): Promise<void> {
    try {
      await this.rafraichir();
      await this.chargerUtilisateur();
    } catch {
      // Échec silencieux si pas de cookie / cookie expiré / serveur injoignable.
      // La session reste vide.
    } finally {
      this.sessionService.marquerInitialisee();
    }
  }

  async deconnecter(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(
          `${environment.apiUrl}/auth/logout`,
          {},
          {
            withCredentials: true,
            headers: { 'X-Client-Type': 'web' },
            context: new HttpContext().set(SKIP_AUTH_REFRESH, true),
          },
        ),
      );
    } catch {
      // Ignorer l'échec backend
    } finally {
      this.sessionService.effacerSession();
      const win = typeof window !== 'undefined' ? (window as unknown as { google?: typeof google }) : null;
      if (win?.google?.accounts?.id) {
        win.google.accounts.id.disableAutoSelect();
      }
      await this.router.navigate(['/connexion']);
    }
  }
}
