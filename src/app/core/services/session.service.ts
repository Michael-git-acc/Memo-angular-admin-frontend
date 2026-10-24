import { computed, Injectable, signal, Signal } from '@angular/core';
import { Permission } from '../models/permission';
import { UtilisateurSession } from '../models/utilisateur-session';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly _utilisateur = signal<UtilisateurSession | null>(null);
  private readonly _jeton = signal<string | null>(null);

  readonly utilisateur: Signal<UtilisateurSession | null> = this._utilisateur.asReadonly();
  readonly estAuthentifie: Signal<boolean> = computed(() => this._utilisateur() !== null);
  readonly permissions: Signal<readonly Permission[]> = computed(
    () => this._utilisateur()?.permissions ?? [],
  );

  definirSession(utilisateur: UtilisateurSession, jeton: string): void {
    this._utilisateur.set(utilisateur);
    this._jeton.set(jeton);
  }

  effacerSession(): void {
    this._utilisateur.set(null);
    this._jeton.set(null);
  }

  obtenirJeton(): string | null {
    return this._jeton();
  }

  aPermission(code: string): boolean {
    const userPermissions = this.permissions();
    return userPermissions.includes(code as Permission);
  }
}
