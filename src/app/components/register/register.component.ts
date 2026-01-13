import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card glass shadow-lg">
        <div class="auth-header">
          <div class="auth-icon"><i class="bi bi-person-plus"></i></div>
          <h2 class="auth-title">Join as Student</h2>
          <p class="auth-subtitle">Launch your career with top internships</p>
        </div>
        
        <div class="auth-body">
          @if (error) {
            <div class="alert alert-danger mb-4">{{ error }}</div>
          }
          @if (success) {
            <div class="alert alert-success mb-4">Registration successful! Redirecting...</div>
          }
          
          <form (ngSubmit)="onSubmit()">
            <div class="form-floating mb-3">
              <input type="text" class="form-control" id="username" [(ngModel)]="username" name="username" required placeholder="Username">
              <label for="username">Full Name</label>
            </div>
            
            <div class="form-floating mb-3">
              <input type="email" class="form-control" id="email" [(ngModel)]="email" name="email" required placeholder="name@example.com">
              <label for="email">Email address</label>
            </div>
            
            <div class="form-floating mb-4">
              <input type="password" class="form-control" id="password" [(ngModel)]="password" name="password" required minlength="6" placeholder="Password">
              <label for="password">Password (min 6 characters)</label>
            </div>
            
            <button type="submit" class="btn btn-primary w-100 py-3 mb-4" [disabled]="loading">
              @if (loading) {
                <span class="spinner-border spinner-border-sm me-2"></span>
              }
              Create Student Account
            </button>
          </form>
          
          <div class="auth-footer text-center">
            <p class="text-muted">Already have an account? <a routerLink="/login" class="text-decoration-none fw-600">Login</a></p>
            <div class="auth-divider"><span>OR</span></div>
            <a routerLink="/register-company" class="text-primary text-decoration-none small fw-600">Register as a company instead</a>
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
      background: radial-gradient(circle at bottom left, var(--primary-light), transparent);
    }

    .auth-card {
      width: 100%;
      max-width: 500px;
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
      background: var(--secondary);
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
      font-size: 0.75rem;
    }
    
    .fw-600 { font-weight: 600; }
  `]
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  loading = false;
  error = '';
  success = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onSubmit() {
    this.loading = true;
    this.error = '';

    this.authService.register({
      username: this.username,
      email: this.email,
      password: this.password,
      role: 'STUDENT'
    }).subscribe({
      next: () => {
        this.success = true;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.error = err.error.message || 'Registration failed';
        this.loading = false;
      }
    });
  }
}