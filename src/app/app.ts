import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>
      <main class="content-area">
        <div class="content-wrapper">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
    }

    .content-area {
      flex: 1;
      margin-left: var(--sidebar-width);
      transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background-color: var(--bg-main);
    }

    /* Handle dynamic margin if we had global observable, 
       but for now we'll handle the simplest case 
       or use a CSS variable controlled by Sidebar */
    :host ::ng-deep .sidebar.collapsed + .content-area {
      margin-left: var(--sidebar-width-collapsed);
    }

    .content-wrapper {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    @media (max-width: 768px) {
      .content-area {
        margin-left: 0;
      }
    }
  `]
})
export class App {
  // We can add logic to dynamic style if needed
}