import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { guestGuard } from './guest.guard';
import { SessionService } from '../services/session.service';

describe('Guards d’authentification', () => {
  let sessionService: SessionService;
  let router: Router;

  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = { url: '/tableau-de-bord' } as RouterStateSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SessionService],
    });
    sessionService = TestBed.inject(SessionService);
    router = TestBed.inject(Router);
  });

  describe('authGuard', () => {
    it('laisse passer l’utilisateur authentifié', () => {
      sessionService.definirJeton('token');
      sessionService.definirUtilisateur({
        id: '1',
        email: 'admin@ecole.fr',
        nom: 'Admin',
        permissions: [],
      });

      const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));
      expect(result).toBe(true);
    });

    it('redirige vers /connexion avec returnUrl si non authentifié', () => {
      sessionService.effacerSession();

      const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));
      expect(result instanceof UrlTree).toBe(true);
      const urlTree = result as UrlTree;
      expect(router.serializeUrl(urlTree)).toContain('returnUrl=%2Ftableau-de-bord');
    });
  });

  describe('guestGuard', () => {
    it('laisse passer l’utilisateur non authentifié vers /connexion', () => {
      sessionService.effacerSession();

      const result = TestBed.runInInjectionContext(() => guestGuard(mockRoute, mockState));
      expect(result).toBe(true);
    });

    it('redirige vers /tableau-de-bord si déjà authentifié', () => {
      sessionService.definirJeton('token');
      sessionService.definirUtilisateur({
        id: '1',
        email: 'admin@ecole.fr',
        nom: 'Admin',
        permissions: [],
      });

      const result = TestBed.runInInjectionContext(() => guestGuard(mockRoute, mockState));
      expect(result instanceof UrlTree).toBe(true);
      const urlTree = result as UrlTree;
      expect(router.serializeUrl(urlTree)).toBe('/tableau-de-bord');
    });
  });
});
