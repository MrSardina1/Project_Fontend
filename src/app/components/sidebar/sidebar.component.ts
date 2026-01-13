import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="sidebar" [class.collapsed]="isCollapsed">
      <div class="logo-section">
        <div class="logo-icon"><i class="bi bi-rocket-takeoff"></i></div>
        <span class="logo-text" *ngIf="!isCollapsed">InterPortal</span>
      </div>

      <nav class="nav-menu">
        <div class="nav-section" *ngIf="!isCollapsed">Main Menu</div>
        
        <a class="nav-item" routerLink="/internships" routerLinkActive="active">
          <i class="bi bi-grid"></i>
          <span *ngIf="!isCollapsed">Explore Internships</span>
        </a>

        @if (currentUser$ | async; as user) {
          @if (user.role === 'COMPANY') {
            <div class="nav-section" *ngIf="!isCollapsed">Company Space</div>
            <a class="nav-item" routerLink="/create-internship" routerLinkActive="active">
              <i class="bi bi-plus-circle"></i>
              <span *ngIf="!isCollapsed">Post New</span>
            </a>
            <a class="nav-item" routerLink="/my-internships" routerLinkActive="active">
              <i class="bi bi-briefcase"></i>
              <span *ngIf="!isCollapsed">My Listings</span>
            </a>
          }
          
          @if (user.role === 'STUDENT') {
            <div class="nav-section" *ngIf="!isCollapsed">Student Space</div>
            <a class="nav-item" routerLink="/my-applications" routerLinkActive="active">
              <i class="bi bi-file-earmark-text"></i>
              <span *ngIf="!isCollapsed">My Applications</span>
            </a>
            <a class="nav-item" routerLink="/accepted-companies" routerLinkActive="active">
              <i class="bi bi-building-check"></i>
              <span *ngIf="!isCollapsed">Companies</span>
            </a>
            <a class="nav-item" routerLink="/my-reviews" routerLinkActive="active">
              <i class="bi bi-star-half"></i>
              <span *ngIf="!isCollapsed">My Reviews</span>
            </a>
          }

          @if (user.role === 'ADMIN') {
            <div class="nav-section" *ngIf="!isCollapsed">Administration</div>
            <a class="nav-item" routerLink="/admin/dashboard" routerLinkActive="active">
              <i class="bi bi-speedometer2"></i>
              <span *ngIf="!isCollapsed">Dashboard</span>
            </a>
            <a class="nav-item" routerLink="/admin/users" routerLinkActive="active">
              <i class="bi bi-people"></i>
              <span *ngIf="!isCollapsed">Users</span>
            </a>
            <a class="nav-item" routerLink="/admin/companies" routerLinkActive="active">
              <i class="bi bi-building"></i>
              <span *ngIf="!isCollapsed">Companies</span>
            </a>
            <a class="nav-item" routerLink="/admin/pending-companies" routerLinkActive="active">
              <i class="bi bi-clock-history"></i>
              <span *ngIf="!isCollapsed">Pending Verifications</span>
            </a>
            <a class="nav-item" routerLink="/admin/internships" routerLinkActive="active">
              <i class="bi bi-briefcase"></i>
              <span *ngIf="!isCollapsed">Internships</span>
            </a>
            <a class="nav-item" routerLink="/admin/applications" routerLinkActive="active">
               <i class="bi bi-file-text"></i>
               <span *ngIf="!isCollapsed">Applications</span>
            </a>
            <a class="nav-item" routerLink="/admin/reviews" routerLinkActive="active">
               <i class="bi bi-star"></i>
               <span *ngIf="!isCollapsed">Reviews</span>
            </a>
          }

          <div class="nav-section" *ngIf="!isCollapsed">Support</div>
          <a class="nav-item" routerLink="/ai-chat" routerLinkActive="active">
            <i class="bi bi-chat-dots"></i>
            <span *ngIf="!isCollapsed">AI Assistant</span>
          </a>

          <div class="user-section">
            <div class="profile-section" routerLink="/my-profile" [class.collapsed]="isCollapsed">
              <div class="avatar-container">
                <div class="avatar-ring">
                  <div class="avatar-gradient" *ngIf="!user.profilePicture">
                    {{ (user.username || 'U').charAt(0) }}
                  </div>
                  <img *ngIf="user.profilePicture" [src]="getProfileUrl(user.profilePicture)" class="avatar-img" alt="Profile">
                  <div class="status-indicator"></div>
                </div>
              </div>
              
              <div class="info" *ngIf="!isCollapsed">
                <span class="name text-truncate">{{ user.username || 'User' }}</span>
                <span class="bio-preview text-truncate" *ngIf="user.bio">{{ user.bio }}</span>
                <span class="role" *ngIf="!user.bio">{{ user.role }}</span>
              </div>
            </div>
            <button class="logout-btn" (click)="logout($event)">
              <i class="bi bi-box-arrow-left"></i>
              <span *ngIf="!isCollapsed">Logout</span>
            </button>
          </div>
        } @else {
          <div class="user-section auth-btns">
            <a class="nav-item login-btn" routerLink="/login" routerLinkActive="active">
              <i class="bi bi-person"></i>
              <span *ngIf="!isCollapsed">Login</span>
            </a>
            <a class="nav-item register-btn" routerLink="/register" routerLinkActive="active" *ngIf="!isCollapsed">
              <span>Join Now</span>
            </a>
          </div>
        }
      </nav>

      <button class="toggle-btn" (click)="toggleSidebar()">
        <i class="bi" [class.bi-chevron-left]="!isCollapsed" [class.bi-chevron-right]="isCollapsed"></i>
      </button>
    </div>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width);
      height: 100vh;
      background: var(--bg-sidebar);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 1000;
      padding: 1.5rem 1rem;
    }

    .sidebar.collapsed {
      width: var(--sidebar-width-collapsed);
      padding: 1.5rem 0.75rem;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 2rem;
      padding-left: 0.5rem;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      background: var(--primary);
      color: white;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .logo-text {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--primary);
    }

    .nav-menu {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-section {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-light);
      text-transform: uppercase;
      margin: 1.5rem 0 0.5rem 0.5rem;
      letter-spacing: 0.05em;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0.75rem 0.75rem;
      border-radius: 10px;
      color: var(--text-muted);
      text-decoration: none;
      transition: all 0.2s;
      cursor: pointer;
    }

    .nav-item i {
      font-size: 1.25rem;
    }

    .nav-item:hover {
      background: var(--primary-light);
      color: var(--primary);
    }

    .nav-item.active {
      background: var(--primary);
      color: white;
    }

    .user-section {
      margin-top: auto;
      padding-top: 1rem;
      border-top: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .profile-section {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0.5rem;
      cursor: pointer;
      border-radius: 10px;
      transition: background 0.2s;
    }

    .profile-section:hover {
      background: var(--bg-main);
    }

    .profile-section.collapsed {
      justify-content: center;
    }

    .avatar-ring {
      position: relative;
      width: 48px;
      height: 48px;
      padding: 2px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .avatar-gradient {
      width: 100%;
      height: 100%;
      background: white;
      color: var(--primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 1.2rem;
      border: 2px solid white;
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid white;
    }

    .status-indicator {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 12px;
      height: 12px;
      background: #10b981;
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
    }

    .info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
      flex: 1;
      padding-right: 10px;
    }

    .name {
      display: block;
      font-weight: 700;
      color: var(--text-main);
      font-size: 0.95rem;
      line-height: 1.2;
    }

    .bio-preview {
      display: block;
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 400;
      font-style: italic;
    }

    .role {
      font-size: 0.75rem;
      color: var(--primary);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .creative-link:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      border-color: var(--primary);
    }

    .creative-icon {
      width: 36px;
      height: 36px;
      background: white;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary);
      font-size: 1.25rem;
      margin-right: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .creative-text {
      display: flex;
      flex-direction: column;
    }

    .creative-text .title {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .creative-text .subtitle {
      font-size: 0.65rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    .collapsed-profile {
      justify-content: center;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0.75rem;
      border-radius: 10px;
      border: none;
      background: transparent;
      color: #ef4444;
      font-weight: 500;
      transition: background 0.2s;
    }

    .logout-btn:hover {
      background: #fef2f2;
    }

    .toggle-btn {
      position: absolute;
      right: -12px;
      top: 32px;
      width: 24px;
      height: 24px;
      background: white;
      border: 1px solid var(--border);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: var(--shadow-sm);
      color: var(--text-muted);
    }

    .register-btn {
      background: var(--secondary);
      color: white;
      justify-content: center;
      font-weight: 600;
    }
    
    .register-btn:hover {
      background: var(--secondary-hover);
      color: white;
    }
  `]
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  currentUser$ = this.authService.currentUser$;
  isCollapsed = false;

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    document.documentElement.style.setProperty(
      '--sidebar-width-real',
      this.isCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)'
    );
  }

  getProfileUrl(path?: string): string {
    return this.profileService.getProfilePictureUrl(path);
  }

  logout(event: Event) {
    event.preventDefault();
    this.authService.logout();
  }
}
