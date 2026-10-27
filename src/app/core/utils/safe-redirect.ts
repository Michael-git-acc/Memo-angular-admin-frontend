/**
 * Valide et sécurise une URL de redirection interne pour éviter toute redirection ouverte.
 * N'accepte qu'un chemin interne commençant par un seul '/',
 * sans '//', sans '\\', sans schéma (':') ni caractères de contrôle.
 */
export function urlInterne(
  valeur: string | null | undefined,
  repli = '/tableau-de-bord',
): string {
  if (!valeur || typeof valeur !== 'string') {
    return repli;
  }

  const trimmed = valeur.trim();
  if (
    trimmed === '' ||
    !trimmed.startsWith('/') ||
    trimmed.startsWith('//') ||
    trimmed.includes('\\') ||
    trimmed.includes(':') ||
    // eslint-disable-next-line no-control-regex
    /[\x00-\x1F\x7F]/.test(trimmed)
  ) {
    return repli;
  }

  return trimmed;
}
