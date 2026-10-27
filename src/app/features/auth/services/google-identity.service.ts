import { Injectable } from '@angular/core';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class GoogleIdentityService {
  private scriptPromise: Promise<void> | null = null;

  charger(): Promise<void> {
    if (typeof window === 'undefined') {
      return Promise.reject(new Error('Window non disponible'));
    }

    if (window.google?.accounts?.id) {
      return Promise.resolve();
    }

    if (!this.scriptPromise) {
      this.scriptPromise = new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;

        script.onload = () => {
          if (window.google?.accounts?.id) {
            resolve();
          } else {
            reject(new Error('Google Identity Services non initialisé'));
          }
        };

        script.onerror = () => {
          this.scriptPromise = null;
          reject(new Error('Échec du chargement du script Google Identity Services'));
        };

        document.head.appendChild(script);
      });
    }

    return this.scriptPromise;
  }

  initialiser(callback: (response: google.accounts.id.CredentialResponse) => void): void {
    if (!window.google?.accounts?.id) {
      throw new Error('Google Identity Services non chargé');
    }

    // Le paramètre hd n'est pas utilisé conformément aux règles (restriction côté serveur uniquement)
    window.google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback,
    });
  }

  rendreBouton(element: HTMLElement): void {
    if (!window.google?.accounts?.id) {
      throw new Error('Google Identity Services non chargé');
    }

    window.google.accounts.id.renderButton(element, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      locale: 'fr',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: 320,
    });
  }
}
