import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card glass-morphism">
        <div class="auth-header text-center">
          <div class="brand-logo mb-3">
            <i class="bi bi-shield-lock-fill text-primary display-4"></i>
          </div>
          <h2 class="auth-title">Reset Password</h2>
          <p class="auth-subtitle">Secure your account with a new password</p>
        </div>

        <div class="auth-body">
          @if (error) {
            <div class="alert alert-danger d-flex align-items-center mb-4" role="alert">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              <div>{{ error }}</div>
            </div>
          }
          
          @if (success) {
            <div class="success-state text-center p-4">
              <div class="success-icon mb-3">
                <i class="bi bi-check-circle-fill text-success display-1"></i>
              </div>
              <h4 class="mb-2">All Set!</h4>
              <p class="text-muted">Password has been reset successfully. Redirecting you to login...</p>
              <div class="spinner-border text-primary mt-3" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
          } @else {
            <form (ngSubmit)="onSubmit()" class="auth-form">
              <div class="form-floating mb-3">
                <input 
                  type="password" 
                  class="form-control" 
                  id="password"
                  placeholder="New Password"
                  [(ngModel)]="password" 
                  name="password" 
                  required
                  minlength="6"
                >
                <label for="password"><i class="bi bi-key me-2"></i>New Password</label>
              </div>

              <div class="form-floating mb-4">
                <input 
                  type="password" 
                  class="form-control" 
                  id="confirmPassword"
                  placeholder="Confirm New Password"
                  [(ngModel)]="confirmPassword" 
                  name="confirmPassword" 
                  required
                >
                <label for="confirmPassword"><i class="bi bi-shield-check me-2"></i>Confirm New Password</label>
              </div>

              <div class="d-grid gap-2 mb-3">
                <button type="submit" class="btn btn-primary btn-lg auth-btn" [disabled]="loading || !isValid()">
                  @if (loading) {
                    <span class="spinner-border spinner-border-sm me-2"></span>
                  }
                  <i class="bi bi-arrow-right-circle me-2"></i>Reset Password
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
export class ResetPasswordComponent implements OnInit {
  token = '';
  password = '';
  confirmPassword = '';
  loading = false;
  success = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.error = 'Invalid or missing reset token. Please request a new password reset link.';
    }
  }

  isValid() {
    return this.password && this.password === this.confirmPassword && this.password.length >= 6;
  }

  onSubmit() {
    if (!this.isValid() || !this.token) {
      if (this.password !== this.confirmPassword) {
        this.error = 'Passwords do not match.';
      }
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.resetPassword(this.token, this.password).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to reset password. The link may have expired.';
        this.loading = false;
      }
    });
  }
}
