import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card glass shadow-lg">
        <div class="auth-header">
          <div class="auth-icon"><i class="bi bi-shield-lock"></i></div>
          <h2 class="auth-title">Welcome Back</h2>
          <p class="auth-subtitle">Login to your professional portal</p>
        </div>
        
        <div class="auth-body">
          @if (error) {
            <div class="alert alert-danger d-flex align-items-center mb-4">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              <div>{{ error }}</div>
            </div>
          }
          
          <form (ngSubmit)="onSubmit()">
            <div class="form-floating mb-3">
              <input type="email" class="form-control" id="email" [(ngModel)]="email" name="email" required placeholder="name@example.com">
              <label for="email">Email address</label>
            </div>
            
            <div class="form-floating mb-3 position-relative">
              <input type="password" class="form-control" id="password" [(ngModel)]="password" name="password" required placeholder="Password">
              <label for="password">Password</label>
              <a routerLink="/forgot-password" class="forgot-link">Forgot?</a>
            </div>
            
            <button type="submit" class="btn btn-primary w-100 py-3 mt-2 mb-4" [disabled]="loading">
              @if (loading) {
                <span class="spinner-border spinner-border-sm me-2"></span>
              }
              Sign In
            </button>
          </form>
          
          <div class="auth-divider">
            <span>Don't have an account?</span>
          </div>
          
          <div class="register-options mt-4">
            <a routerLink="/register" class="btn btn-outline-primary flex-fill me-2">
              <i class="bi bi-person-plus me-1"></i> Student
            </a>
            <a routerLink="/register-company" class="btn btn-outline-info flex-fill">
              <i class="bi bi-building-plus me-1"></i> Company
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: calc(100vh - 4rem);
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at top right, var(--primary-light), transparent);
    }

    .auth-card {
      width: 100%;
      max-width: 480px;
      padding: 3rem;
      border-radius: var(--radius-lg);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .auth-icon {
      width: 64px;
      height: 64px;
      background: var(--primary);
      color: white;
      border-radius: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      margin-bottom: 1.5rem;
      box-shadow: var(--shadow-md);
    }

    .auth-title {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .auth-subtitle {
      color: var(--text-muted);
    }

    .form-floating > .form-control {
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
    }

    .form-floating > .form-control:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 4px var(--primary-light);
    }

    .forgot-link {
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 5;
      font-size: 0.85rem;
      text-decoration: none;
      color: var(--primary);
      font-weight: 500;
    }

    .auth-divider {
      text-align: center;
      position: relative;
      margin: 1.5rem 0;
    }

    .auth-divider::before {
      content: "";
      position: absolute;
      left: 0;
      top: 50%;
      width: 100%;
      height: 1px;
      background: var(--border);
    }

    .auth-divider span {
      background: white;
      padding: 0 1rem;
      position: relative;
      color: var(--text-muted);
      font-size: 0.85rem;
    }

    .register-options {
      display: flex;
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onSubmit() {
    this.loading = true;
    this.error = '';

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/internships']);
      },
      error: (err) => {
        this.error = err.error.message || 'Login failed';
        this.loading = false;
      }
    });
  }
}