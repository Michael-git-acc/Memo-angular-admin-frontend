import { computed, Injectable, signal, Signal } from '@angular/core';
import { Permission } from '../models/permission';
import { UtilisateurSession } from '../models/utilisateur-session';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly _jetonAcces = signal<string | null>(null);
  private readonly _utilisateur = signal<UtilisateurSession | null>(null);
  private readonly _initialisee = signal<boolean>(false);

  readonly jetonAcces: Signal<string | null> = this._jetonAcces.asReadonly();
  readonly utilisateur: Signal<UtilisateurSession | null> = this._utilisateur.asReadonly();
  readonly initialisee: Signal<boolean> = this._initialisee.asReadonly();

  readonly estAuthentifie: Signal<boolean> = computed(
    () => this._jetonAcces() !== null && this._utilisateur() !== null,
  );

  readonly permissions: Signal<readonly Permission[]> = computed(
    () => this._utilisateur()?.permissions ?? [],
  );

  definirJeton(jeton: string | null): void {
    this._jetonAcces.set(jeton);
  }

  definirUtilisateur(utilisateur: UtilisateurSession | null): void {
    this._utilisateur.set(utilisateur);
  }

  definirSession(utilisateur: UtilisateurSession, jeton: string): void {
    this._utilisateur.set(utilisateur);
    this._jetonAcces.set(jeton);
  }

  marquerInitialisee(): void {
    this._initialisee.set(true);
  }

  effacerSession(): void {
    this._utilisateur.set(null);
    this._jetonAcces.set(null);
  }

  obtenirJeton(): string | null {
    return this._jetonAcces();
  }

  aPermission(code: string): boolean {
    const userPermissions = this.permissions();
    return userPermissions.includes(code as Permission);
  }
}
