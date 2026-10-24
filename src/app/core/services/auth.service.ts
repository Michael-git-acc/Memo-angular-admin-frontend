import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  connecterAvecGoogle(_idToken: string): Promise<void> {
    // TODO: connecter avec Google via l'API backend
    throw new Error('Méthode non implémentée: connecterAvecGoogle');
  }

  connecterAdmin(_email: string, _motDePasse: string): Promise<void> {
    // TODO: authentifier l'administrateur via l'API backend
    throw new Error('Méthode non implémentée: connecterAdmin');
  }

  rafraichir(): Promise<void> {
    // TODO: rafraîchir le jeton de session via l'API backend
    throw new Error('Méthode non implémentée: rafraichir');
  }

  deconnecter(): Promise<void> {
    // TODO: révoquer la session auprès de l'API backend et réinitialiser l'état
    throw new Error('Méthode non implémentée: deconnecter');
  }
}
