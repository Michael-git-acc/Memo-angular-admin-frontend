import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '@shared/ui/toast/toast.service';
import { messageErreur } from '@shared/utils/error-message.util';
import { SKIP_AUTH_REFRESH } from '../http/http-context';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        if (err.status !== 401 && !req.context.get(SKIP_AUTH_REFRESH)) {
          const message = messageErreur(err);
          toastService.error(message);
        }
      }
      return throwError(() => err);
    }),
  );
};
