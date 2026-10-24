import { HttpErrorResponse } from '@angular/common/http';

export function messageErreur(err: HttpErrorResponse): string {
  if (err.status === 0) {
    return 'Impossible de joindre le serveur. Veuillez vérifier votre connexion réseau.';
  }

  switch (err.status) {
    case 400:
      return 'La requête envoyée est invalide.';
    case 403:
      return "Vous n'avez pas les permissions nécessaires pour effectuer cette action.";
    case 404:
      return 'La ressource demandée est introuvable.';
    case 409:
      return "Un conflit est survenu avec l'état actuel de la ressource.";
    case 422:
      return 'Les données transmises sont non traitables ou incorrectes.';
    case 429:
      return 'Trop de requêtes ont été envoyées. Veuillez patienter un instant.';
    default:
      if (err.status >= 500 && err.status < 600) {
        return 'Une erreur serveur est survenue. Veuillez réessayer ultérieurement.';
      }
      return 'Une erreur inattendue est survenue.';
  }
}
