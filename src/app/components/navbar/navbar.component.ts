import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container-fluid">
        <a class="navbar-brand" routerLink="/">Internship Portal</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/internships" routerLinkActive="active">Internships</a>
            </li>
            @if (currentUser$ | async; as user) {
              @if (user.role === 'COMPANY') {
                <li class="nav-item">
                  <a class="nav-link" routerLink="/create-internship" routerLinkActive="active">Post Internship</a>
                </li>
              }
              @if (user.role === 'COMPANY' || user.role === 'ADMIN') {
                <li class="nav-item">
                  <a class="nav-link" routerLink="/applications" routerLinkActive="active">Applications</a>
                </li>
              }
              @if (user.role === 'STUDENT') {
                <li class="nav-item">
                  <a class="nav-link" routerLink="/my-reviews" routerLinkActive="active">My Reviews</a>
                </li>
              }
              <li class="nav-item">
                <a class="nav-link" routerLink="/ai-chat" routerLinkActive="active">AI Assistant</a>
              </li>
            }
          </ul>
          <ul class="navbar-nav">
            @if (currentUser$ | async; as user) {
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                  {{ user.username }} ({{ user.role }})
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li><a class="dropdown-item" href="#" (click)="logout($event)">Logout</a></li>
                </ul>
              </li>
            } @else {
              <li class="nav-item">
                <a class="nav-link" routerLink="/login">Login</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/register">Register</a>
              </li>
            }
          </ul>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  private authService = inject(AuthService);
  currentUser$ = this.authService.currentUser$;

  logout(event: Event) {
    event.preventDefault();
    this.authService.logout();
  }
}