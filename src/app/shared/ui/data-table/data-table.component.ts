import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { DataTableColumn, SortChangeEvent } from './data-table.types';

@Component({
  selector: 'app-data-table',
  imports: [NgTemplateOutlet],
  template: `
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            @for (col of columns(); track col.key) {
              <th
                scope="col"
                [attr.aria-sort]="getAriaSort(col)"
                [class.sortable]="col.sortable"
              >
                @if (col.sortable) {
                  <button
                    type="button"
                    class="sort-button"
                    (click)="toggleSort(col.key)"
                  >
                    <span>{{ col.label }}</span>
                    <span class="sort-icon" aria-hidden="true">
                      @if (sortKey() === col.key) {
                        {{ sortDirection() === 'asc' ? '▲' : '▼' }}
                      } @else {
                        ↕
                      }
                    </span>
                  </button>
                } @else {
                  <span>{{ col.label }}</span>
                }
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @if (loading()) {
            <tr>
              <td [attr.colspan]="columns().length" class="cell-status">
                <span role="status">Chargement des données...</span>
              </td>
            </tr>
          } @else if (rows().length === 0) {
            <tr>
              <td [attr.colspan]="columns().length" class="cell-status">
                {{ emptyMessage() }}
              </td>
            </tr>
          } @else {
            @for (row of rows(); track $index) {
              <tr
                class="data-row"
                [class.clickable]="hasRowClick"
                (click)="onRowClick(row)"
              >
                @for (col of columns(); track col.key) {
                  <td>
                    @if (col.cellTemplate) {
                      <ng-container
                        *ngTemplateOutlet="col.cellTemplate; context: { $implicit: getCellValue(row, col.key), row: row }"
                      />
                    } @else {
                      {{ getCellValue(row, col.key) }}
                    }
                  </td>
                }
              </tr>
            }
          }
        </tbody>
      </table>
    </div>
  `,
  styles: `
    .table-container {
      width: 100%;
      overflow-x: auto;
      background: var(--color-surface);
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-sm);
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.875rem;

      th,
      td {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--color-border);
      }

      th {
        background-color: var(--color-surface-muted);
        font-weight: 600;
        color: var(--color-text);
      }

      .data-row {
        transition: background-color 0.15s ease;

        &:hover {
          background-color: var(--color-surface-hover);
        }

        &.clickable {
          cursor: pointer;
        }
      }

      .cell-status {
        text-align: center;
        padding: 2rem 1rem;
        color: var(--color-text-muted);
      }
    }

    .sort-button {
      background: none;
      border: none;
      font: inherit;
      color: inherit;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      cursor: pointer;
      padding: 0;

      &:focus {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
      }
    }

    .sort-icon {
      font-size: 0.75rem;
      color: var(--color-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent<T = Record<string, unknown>> {
  readonly columns = input<DataTableColumn<T>[]>([]);
  readonly rows = input<T[]>([]);
  readonly loading = input<boolean>(false);
  readonly emptyMessage = input<string>('Aucune donnée disponible');

  readonly sortChange = output<SortChangeEvent>();
  readonly rowClick = output<T>();

  protected readonly sortKey = signal<string | null>(null);
  protected readonly sortDirection = signal<'asc' | 'desc'>('asc');

  get hasRowClick(): boolean {
    return true;
  }

  protected toggleSort(key: string): void {
    let nextDir: 'asc' | 'desc' = 'asc';
    if (this.sortKey() === key) {
      nextDir = this.sortDirection() === 'asc' ? 'desc' : 'asc';
    }
    this.sortKey.set(key);
    this.sortDirection.set(nextDir);
    this.sortChange.emit({ key, direction: nextDir });
  }

  protected getAriaSort(col: DataTableColumn<T>): 'ascending' | 'descending' | 'none' | null {
    if (!col.sortable) {
      return null;
    }
    if (this.sortKey() !== col.key) {
      return 'none';
    }
    return this.sortDirection() === 'asc' ? 'ascending' : 'descending';
  }

  protected getCellValue(row: T, key: string): unknown {
    if (typeof row === 'object' && row !== null) {
      return (row as Record<string, unknown>)[key];
    }
    return '';
  }

  protected onRowClick(row: T): void {
    this.rowClick.emit(row);
  }
}
