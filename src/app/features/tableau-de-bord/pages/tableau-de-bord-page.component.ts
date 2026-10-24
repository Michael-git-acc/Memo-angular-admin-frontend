import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-tableau-de-bord-page',
  template: `
    <div class="page-container">
      <h1 class="page-title">Tableau de bord</h1>
    </div>
  `,
  styles: `
    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-text);
      margin: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableauDeBordPageComponent {}
