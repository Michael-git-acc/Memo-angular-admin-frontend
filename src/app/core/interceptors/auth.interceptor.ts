import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionService } from '../services/session.service';
import { environment } from '@env/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionService = inject(SessionService);
  const jeton = sessionService.obtenirJeton();

  let authReq = req;
  if (jeton && req.url.startsWith(environment.apiUrl)) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${jeton}`,
      },
    });
  }

  // TODO: gérer le rafraîchissement de jeton sur réception d'un code HTTP 401
  return next(authReq);
};
