/**
 * Structure générique paginée.
 * Hypothèse à confirmer avec le PaginationDto du backend.
 */
export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
