import { TemplateRef } from '@angular/core';

export interface DataTableColumn<T = unknown> {
  key: string;
  label: string;
  sortable?: boolean;
  cellTemplate?: TemplateRef<{ $implicit: unknown; row: T }>;
}

export type SortDirection = 'asc' | 'desc' | 'none';

export interface SortChangeEvent {
  key: string;
  direction: 'asc' | 'desc';
}
