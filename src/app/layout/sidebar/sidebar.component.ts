import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';
import { NAVIGATION_ENTRIES } from './navigation.config';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, HasPermissionDirective],
  template: `
    <nav class="sidebar-nav" aria-label="Menu principal">
      <div class="sidebar-brand">
        <span class="brand-title">Portail Admin</span>
      </div>

      <ul class="nav-list">
        @for (entry of navEntries; track entry.route) {
          @if (entry.permission) {
            <ng-container *appHasPermission="entry.permission">
              <li class="nav-item">
                <a
                  [routerLink]="entry.route"
                  routerLinkActive="active"
                  class="nav-link"
                >
                  {{ entry.libelle }}
                </a>
              </li>
            </ng-container>
          } @else {
            <li class="nav-item">
              <a
                [routerLink]="entry.route"
                routerLinkActive="active"
                class="nav-link"
              >
                {{ entry.libelle }}
              </a>
            </li>
          }
        }
      </ul>
    </nav>
  `,
  styles: `
    :host {
      display: block;
      width: var(--sidebar-width);
      min-width: var(--sidebar-width);
      height: 100vh;
      background-color: var(--color-surface);
      border-right: 1px solid var(--color-border);
      position: sticky;
      top: 0;
      overflow-y: auto;
    }

    .sidebar-brand {
      height: var(--topbar-height);
      display: flex;
      align-items: center;
      padding: 0 1.5rem;
      border-bottom: 1px solid var(--color-border);
    }

    .brand-title {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--color-primary);
      letter-spacing: -0.01em;
    }

    .nav-list {
      list-style: none;
      margin: 0;
      padding: 1rem 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .nav-link {
      display: flex;
      align-items: center;
      padding: 0.625rem 0.875rem;
      color: var(--color-text-muted);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      border-radius: var(--radius-sm);
      transition: all 0.15s ease;

      &:hover {
        color: var(--color-text);
        background-color: var(--color-surface-hover);
      }

      &.active {
        color: var(--color-primary);
        background-color: var(--color-primary-light);
        font-weight: 600;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  protected readonly navEntries = NAVIGATION_ENTRIES;
}
