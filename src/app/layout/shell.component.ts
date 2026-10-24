import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent } from './topbar/topbar.component';
import { ToastComponent } from '@shared/ui/toast/toast.component';
import { LoadingOverlayComponent } from '@shared/ui/loading/loading-overlay.component';

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    SidebarComponent,
    TopbarComponent,
    ToastComponent,
    LoadingOverlayComponent,
  ],
  template: `
    <a href="#contenu-principal" class="skip-link">Aller au contenu</a>

    <div class="shell-layout">
      <app-sidebar />

      <div class="shell-main">
        <app-topbar />

        <main id="contenu-principal" class="shell-content" tabindex="-1">
          <router-outlet />
        </main>
      </div>
    </div>

    <app-toast />
    <app-loading-overlay />
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
    }

    .shell-layout {
      display: flex;
      min-height: 100vh;
      background-color: var(--color-background);
    }

    .shell-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .shell-content {
      flex: 1;
      padding: 1.5rem 2rem;
      outline: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {}
