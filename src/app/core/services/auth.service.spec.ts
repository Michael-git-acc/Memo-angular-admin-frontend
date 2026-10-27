import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { environment } from '@env/environment';

describe('AuthService', () => {
  let service: AuthService;
  let sessionService: SessionService;
  let httpTesting: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        SessionService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AuthService);
    sessionService = TestBed.inject(SessionService);
    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('restaurerSession avec succès met à jour le jeton et l’utilisateur, et marque initialisée', async () => {
    const sessionPromise = service.restaurerSession();

    const reqRefresh = await vi.waitFor(() =>
      httpTesting.expectOne(`${environment.apiUrl}/auth/refresh`),
    );
    expect(reqRefresh.request.method).toBe('POST');
    reqRefresh.flush({ accessToken: 'new_token', expiresIn: 3600 });

    const reqMe = await vi.waitFor(() =>
      httpTesting.expectOne(`${environment.apiUrl}/auth/me`),
    );
    expect(reqMe.request.method).toBe('GET');
    reqMe.flush({
      id: 'u-1',
      email: 'test@memo.ecole',
      nom: 'Professeur Test',
      permissions: ['alimenter'],
    });

    await sessionPromise;

    expect(sessionService.jetonAcces()).toBe('new_token');
    expect(sessionService.utilisateur()?.nom).toBe('Professeur Test');
    expect(sessionService.initialisee()).toBe(true);
    expect(sessionService.estAuthentifie()).toBe(true);
  });

  it('restaurerSession en échec laisse la session vide sans lever d’exception et marque initialisée', async () => {
    const sessionPromise = service.restaurerSession();

    const reqRefresh = await vi.waitFor(() =>
      httpTesting.expectOne(`${environment.apiUrl}/auth/refresh`),
    );
    reqRefresh.flush('Non autorisé', { status: 401, statusText: 'Unauthorized' });

    await sessionPromise;

    expect(sessionService.jetonAcces()).toBeNull();
    expect(sessionService.utilisateur()).toBeNull();
    expect(sessionService.initialisee()).toBe(true);
    expect(sessionService.estAuthentifie()).toBe(false);
  });

  it('deconnecter efface la session et redirige vers /connexion même si l’appel échoue', async () => {
    sessionService.definirJeton('token');
    sessionService.definirUtilisateur({
      id: '1',
      email: 'a@b.c',
      nom: 'Test',
      permissions: [],
    });

    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const logoutPromise = service.deconnecter();

    const reqLogout = await vi.waitFor(() =>
      httpTesting.expectOne(`${environment.apiUrl}/auth/logout`),
    );
    reqLogout.flush('Erreur serveur', { status: 500, statusText: 'Server Error' });

    await logoutPromise;

    expect(sessionService.estAuthentifie()).toBe(false);
    expect(sessionService.jetonAcces()).toBeNull();
    expect(sessionService.utilisateur()).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith(['/connexion']);
  });

  it('rafraîchissement fonctionne quand navigator.locks est absent', async () => {
    const originalLocks = (navigator as unknown as { locks?: unknown }).locks;
    Object.defineProperty(navigator, 'locks', { value: undefined, configurable: true });

    const refreshPromise = service.rafraichir();

    const reqRefresh = await vi.waitFor(() =>
      httpTesting.expectOne(`${environment.apiUrl}/auth/refresh`),
    );
    reqRefresh.flush({ accessToken: 'fallback_token' });

    await refreshPromise;

    expect(sessionService.jetonAcces()).toBe('fallback_token');

    Object.defineProperty(navigator, 'locks', { value: originalLocks, configurable: true });
  });
});
