import {
  HttpContextToken,
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { environment } from '@env/environment';
import { SKIP_AUTH_REFRESH } from '../http/http-context';
import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';
import { ToastService } from '@shared/ui/toast/toast.service';

const IS_RETRY = new HttpContextToken<boolean>(() => false);

let toastSessionExpireAffiche = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionService = inject(SessionService);
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  // 1. Ne touche pas aux requêtes marquées SKIP_AUTH_REFRESH ni à celles hors API
  if (req.context.get(SKIP_AUTH_REFRESH) || !req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  // 2. Ajoute Authorization: Bearer <jeton> s'il existe
  const jeton = sessionService.jetonAcces();
  let authReq = req;
  if (jeton) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${jeton}`,
      },
    });
  }

  const handleSessionExpired = () => {
    sessionService.effacerSession();
    if (!toastSessionExpireAffiche) {
      toastSessionExpireAffiche = true;
      toastService.info('Votre session a expiré, veuillez vous reconnecter.');
      setTimeout(() => {
        toastSessionExpireAffiche = false;
      }, 3000);
    }
    const currentUrl = router.url;
    router.navigate(['/connexion'], {
      queryParams:
        currentUrl && currentUrl !== '/connexion' ? { returnUrl: currentUrl } : {},
    });
  };

  // 3. Gestion de l'erreur 401
  return next(authReq).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        if (req.context.get(IS_RETRY)) {
          handleSessionExpired();
          return throwError(() => err);
        }

        return from(authService.rafraichir()).pipe(
          switchMap(() => {
            const nouveauJeton = sessionService.jetonAcces();
            const replayedReq = req.clone({
              setHeaders: nouveauJeton
                ? { Authorization: `Bearer ${nouveauJeton}` }
                : {},
              context: req.context.set(IS_RETRY, true),
            });
            return next(replayedReq);
          }),
          catchError((refreshOrReplayErr: unknown) => {
            handleSessionExpired();
            return throwError(() => refreshOrReplayErr);
          }),
        );
      }

      return throwError(() => err);
    }),
  );
};
