import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-introuvable',
  imports: [RouterLink],
  template: `
    <div class="message-page">
      <h1>Page introuvable</h1>
      <p>La page que vous recherchez n'existe pas ou a été déplacée.</p>
      <a routerLink="/tableau-de-bord" class="btn-retour">Retour au tableau de bord</a>
    </div>
  `,
  styles: `
    .message-page {
      max-width: 560px;
      margin: 4rem auto;
      text-align: center;
      padding: 2.5rem;
      background: var(--color-surface);
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-sm);
    }

    h1 {
      color: var(--color-text);
      margin: 0 0 1rem 0;
      font-size: 1.5rem;
    }

    p {
      color: var(--color-text-muted);
      margin: 0 0 2rem 0;
      line-height: 1.5;
    }

    .btn-retour {
      display: inline-block;
      padding: 0.6rem 1.25rem;
      background: var(--color-primary);
      color: var(--color-primary-contrast);
      text-decoration: none;
      border-radius: var(--radius-sm);
      font-weight: 500;
      font-size: 0.875rem;

      &:hover {
        background: var(--color-primary-hover);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageIntrouvableComponent {}
