import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { errorInterceptor } from '@core/interceptors/error.interceptor';
import { AuthService } from '@core/services/auth.service';
import { SessionService } from '@core/services/session.service';
import { PERMISSION_CHECKER } from '@shared/directives/has-permission.token';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideAppInitializer(() => inject(AuthService).restaurerSession()),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    {
      provide: PERMISSION_CHECKER,
      useExisting: SessionService,
    },
  ],
};
