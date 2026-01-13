import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card glass-morphism">
        <div class="auth-header text-center">
          <div class="brand-logo mb-3">
            <i class="bi bi-question-circle-fill text-primary display-4"></i>
          </div>
          <h2 class="auth-title">Forgot Password?</h2>
          <p class="auth-subtitle">No worries, we'll send you reset instructions.</p>
        </div>

        <div class="auth-body">
          @if (error) {
            <div class="alert alert-danger d-flex align-items-center mb-4" role="alert">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              <div>{{ error }}</div>
            </div>
          }
          
          @if (message) {
            <div class="success-state text-center p-4">
              <div class="success-icon mb-3">
                <i class="bi bi-envelope-check-fill text-success display-1"></i>
              </div>
              <h4 class="mb-2">Email Sent!</h4>
              <p class="text-muted">{{ message }}</p>
              <div class="d-grid gap-2 mt-4">
                <a routerLink="/login" class="btn btn-outline-primary">
                  <i class="bi bi-arrow-left me-2"></i>Return to Login
                </a>
              </div>
            </div>
          } @else {
            <form (ngSubmit)="onSubmit()" class="auth-form">
              <div class="form-floating mb-4">
                <input 
                  type="email" 
                  class="form-control" 
                  id="email"
                  placeholder="name@example.com"
                  [(ngModel)]="email" 
                  name="email" 
                  required
                >
                <label for="email"><i class="bi bi-envelope me-2"></i>Email Address</label>
              </div>

              <div class="d-grid gap-2 mb-3">
                <button type="submit" class="btn btn-primary btn-lg auth-btn" [disabled]="loading || !email">
                  @if (loading) {
                    <span class="spinner-border spinner-border-sm me-2"></span>
                  }
                  <i class="bi bi-send-fill me-2"></i>Send Reset Link
                </button>
              </div>

              <div class="text-center">
                <a routerLink="/login" class="text-decoration-none text-muted small hover-primary">
                  <i class="bi bi-arrow-left me-1"></i>Back to Login
                </a>
              </div>
            </form>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at top right, #eef2ff 0%, #f8fafc 100%);
      padding: 20px;
    }

    .auth-card {
      width: 100%;
      max-width: 450px;
      padding: 40px;
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
    }

    .glass-morphism {
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }

    .auth-title {
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.02em;
    }

    .auth-subtitle {
      color: #64748b;
      font-size: 0.95rem;
    }

    .form-control {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.5);
    }

    .form-control:focus {
      border-color: #4f46e5;
      box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
      background: #ffffff;
    }

    .btn-primary {
      background: #4f46e5;
      border: none;
      border-radius: 12px;
      padding: 12px;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-primary:hover:not(:disabled) {
      background: #4338ca;
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(79, 70, 229, 0.2);
    }

    .hover-primary {
      transition: color 0.2s ease;
    }

    .hover-primary:hover {
      color: #4f46e5 !important;
    }
  `]
})
export class ForgotPasswordComponent {
  email = '';
  loading = false;
  message = '';
  error = '';

  constructor(private authService: AuthService) { }

  onSubmit() {
    if (!this.email) return;

    this.loading = true;
    this.error = '';
    this.message = '';

    this.authService.forgotPassword(this.email).subscribe({
      next: (response) => {
        this.message = response.message || 'If an account exists with this email, you will receive a password reset link shortly.';
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'An error occurred. Please try again.';
        this.loading = false;
      }
    });
  }
}
