import { urlInterne } from './safe-redirect';

describe('urlInterne', () => {
  it('accepte les chemins internes valides', () => {
    expect(urlInterne('/roles?x=1')).toBe('/roles?x=1');
    expect(urlInterne('/tableau-de-bord')).toBe('/tableau-de-bord');
    expect(urlInterne('/connexion')).toBe('/connexion');
  });

  it('refuse les URLs absolues ou malicieuses', () => {
    expect(urlInterne('//evil.com')).toBe('/tableau-de-bord');
    expect(urlInterne('https://evil.com')).toBe('/tableau-de-bord');
    expect(urlInterne('/\\evil.com')).toBe('/tableau-de-bord');
    expect(urlInterne('javascript:alert(1)')).toBe('/tableau-de-bord');
  });

  it('refuse les valeurs nulles, vides ou avec caractères de contrôle', () => {
    expect(urlInterne('')).toBe('/tableau-de-bord');
    expect(urlInterne(null)).toBe('/tableau-de-bord');
    expect(urlInterne(undefined)).toBe('/tableau-de-bord');
    expect(urlInterne('/test\x00')).toBe('/tableau-de-bord');
  });

  it('utilise le repli spécifié en cas d’URL invalide', () => {
    expect(urlInterne('https://google.com', '/repli')).toBe('/repli');
  });
});
