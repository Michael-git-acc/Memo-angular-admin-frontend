import { TestBed } from '@angular/core/testing';
import { SessionService } from './session.service';
import { UtilisateurSession } from '../models/utilisateur-session';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SessionService],
    });
    service = TestBed.inject(SessionService);
  });

  it('ne doit jamais écrire dans localStorage ni sessionStorage', () => {
    const localSpy = vi.spyOn(Storage.prototype, 'setItem');
    const mockUser: UtilisateurSession = {
      id: '1',
      email: 'admin@memo.ecole',
      nom: 'Admin Test',
      permissions: ['gerer_utilisateurs'],
    };

    service.definirJeton('token_123');
    service.definirUtilisateur(mockUser);
    service.marquerInitialisee();
    service.effacerSession();

    expect(localSpy).not.toHaveBeenCalled();
    localSpy.mockRestore();
  });

  it('gère l’état d’authentification avec les signaux en mémoire uniquement', () => {
    expect(service.estAuthentifie()).toBe(false);
    expect(service.initialisee()).toBe(false);

    service.definirJeton('abc');
    expect(service.estAuthentifie()).toBe(false);

    service.definirUtilisateur({
      id: '1',
      email: 'test@memo.fr',
      nom: 'Utilisateur Test',
      permissions: [],
    });
    expect(service.estAuthentifie()).toBe(true);
    expect(service.jetonAcces()).toBe('abc');

    service.marquerInitialisee();
    expect(service.initialisee()).toBe(true);

    service.effacerSession();
    expect(service.estAuthentifie()).toBe(false);
    expect(service.jetonAcces()).toBeNull();
    expect(service.utilisateur()).toBeNull();
  });
});
