import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session.service';

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  const permissionRequise = route.data['permission'] as string | undefined;
  if (!permissionRequise) {
    return true;
  }

  if (sessionService.aPermission(permissionRequise)) {
    return true;
  }

  return router.createUrlTree(['/acces-refuse']);
};
