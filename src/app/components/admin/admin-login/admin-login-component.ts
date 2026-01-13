import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-login-wrapper">
      <div class="admin-login-container">
        <div class="admin-card border-0 shadow-2xl overflow-hidden">
          <div class="admin-card-header">
            <div class="auth-icon mb-3">
              <i class="bi bi-shield-lock"></i>
            </div>
            <h1 class="h3 fw-800 text-white mb-1">Command Control</h1>
            <p class="text-blue-200 small opacity-75">Secure Access for Management Only</p>
          </div>
          
          <div class="admin-card-body p-4 p-md-5">
            @if (error) {
              <div class="alert alert-danger-custom d-flex align-items-center mb-4">
                <i class="bi bi-shield-exclamation me-2 fs-5"></i>
                <div class="small fw-600">{{ error }}</div>
              </div>
            }

            <form (ngSubmit)="onSubmit()" class="admin-form">
              <div class="mb-4">
                <label class="form-label admin-label">Management Identity</label>
                <div class="input-group-custom">
                  <i class="bi bi-envelope icon"></i>
                  <input 
                    type="email" 
                    [(ngModel)]="email" 
                    name="email" 
                    placeholder="admin@system.io"
                    class="admin-input"
                    required>
                </div>
              </div>

              <div class="mb-5">
                <label class="form-label admin-label">Security Key</label>
                <div class="input-group-custom">
                  <i class="bi bi-key icon"></i>
                  <input 
                    type="password" 
                    [(ngModel)]="password" 
                    name="password" 
                    placeholder="••••••••"
                    class="admin-input"
                    required>
                </div>
              </div>

              <button 
                type="submit" 
                class="btn-admin-primary w-100" 
                [disabled]="loading">
                @if (loading) {
                  <span class="spinner-border spinner-border-sm me-2"></span>
                  Verifying Gateway...
                } @else {
                  <span class="d-flex align-items-center justify-content-center">
                    Initiate Connection
                    <i class="bi bi-arrow-right-short ms-2 fs-4"></i>
                  </span>
                }
              </button>
            </form>
          </div>

          <div class="admin-card-footer text-center py-3">
            <span class="security-dot me-2"></span>
            System Online & Guarded
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-login-wrapper {
      min-height: 100vh;
      background: radial-gradient(circle at top left, #1a202c 0%, #0f172a 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      font-family: 'Outfit', sans-serif;
    }

    .admin-login-container {
      width: 100%;
      max-width: 480px;
    }

    .admin-card {
      background: #1e293b;
      border-radius: 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    .admin-card-header {
      background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
      padding: 3rem 2rem 2rem;
      text-align: center;
      position: relative;
    }

    .auth-icon {
      width: 64px;
      height: 64px;
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      color: white;
      font-size: 2rem;
      backdrop-filter: blur(8px);
    }

    .fw-800 { font-weight: 800; }
    .text-blue-200 { color: #bfdbfe; }

    .admin-label {
      color: #94a3b8;
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.75rem;
    }

    .input-group-custom {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-group-custom .icon {
      position: absolute;
      left: 1rem;
      color: #475569;
      font-size: 1.2rem;
    }

    .admin-input {
      width: 100%;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 0.85rem 1rem 0.85rem 3rem;
      color: white;
      transition: all 0.3s ease;
    }

    .admin-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
      background: #1e293b;
    }

    .btn-admin-primary {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 1rem;
      border-radius: 12px;
      font-weight: 700;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .btn-admin-primary:hover:not(:disabled) {
      background: #2563eb;
      transform: translateY(-1px);
      box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
    }

    .btn-admin-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .alert-danger-custom {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #fca5a5;
      padding: 1rem;
      border-radius: 12px;
    }

    .admin-card-footer {
      background: #0f172a;
      border-top: 1px solid #1e293b;
      color: #475569;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .security-dot {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 8px #10b981;
    }
  `]
})
export class AdminLoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Check if already logged in as admin
    const user = this.authService.getCurrentUser();
    if (user && user.role === 'ADMIN') {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  onSubmit() {
    this.loading = true;
    this.error = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        if (response.user.role !== 'ADMIN') {
          this.error = 'Access denied. Admin credentials required.';
          this.authService.logout();
          this.loading = false;
        } else {
          this.router.navigate(['/admin/dashboard']);
        }
      },
      error: (err) => {
        this.error = err.error.message || 'Invalid credentials';
        this.loading = false;
      }
    });
  }
}