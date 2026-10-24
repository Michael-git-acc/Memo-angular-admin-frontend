import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '@shared/ui/toast/toast.service';
import { messageErreur } from '@shared/utils/error-message.util';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        if (err.status !== 401) {
          const message = messageErreur(err);
          toastService.error(message);
        }
      }
      return throwError(() => err);
    }),
  );
};
