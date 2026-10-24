import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'app-pagination',
  template: `
    <nav class="pagination" aria-label="Pagination des résultats">
      <div class="pagination-info">
        Page <span class="current-page">{{ page() }}</span> sur <span>{{ totalPages() }}</span>
        <span class="total-items">({{ total() }} éléments au total)</span>
      </div>

      <div class="pagination-controls">
        <button
          type="button"
          class="btn-page"
          [disabled]="page() <= 1"
          (click)="allerPage(page() - 1)"
          aria-label="Aller à la page précédente"
        >
          &larr; Précédent
        </button>

        <button
          type="button"
          class="btn-page"
          [disabled]="page() >= totalPages()"
          (click)="allerPage(page() + 1)"
          aria-label="Aller à la page suivante"
        >
          Suivant &rarr;
        </button>
      </div>
    </nav>
  `,
  styles: `
    .pagination {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.75rem 0;
      font-size: 0.875rem;
      color: var(--color-text-muted);
    }

    .current-page {
      font-weight: 600;
      color: var(--color-text);
    }

    .total-items {
      font-size: 0.8rem;
      margin-left: 0.35rem;
    }

    .pagination-controls {
      display: flex;
      gap: 0.5rem;
    }

    .btn-page {
      padding: 0.4rem 0.75rem;
      border: 1px solid var(--color-border);
      background: var(--color-surface);
      border-radius: var(--radius-sm);
      color: var(--color-text);
      font-size: 0.875rem;
      cursor: pointer;
      transition: background-color 0.15s ease;

      &:hover:not(:disabled) {
        background-color: var(--color-surface-hover);
        border-color: var(--color-border-hover);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  readonly page = input<number>(1);
  readonly pageSize = input<number>(10);
  readonly total = input<number>(0);

  readonly pageChange = output<number>();

  protected readonly totalPages = computed(() => {
    const size = this.pageSize();
    if (size <= 0) return 1;
    return Math.max(1, Math.ceil(this.total() / size));
  });

  protected allerPage(nouvellePage: number): void {
    if (nouvellePage >= 1 && nouvellePage <= this.totalPages()) {
      this.pageChange.emit(nouvellePage);
    }
  }
}
