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
        <div class="card shadow-lg">
          <div class="card-header bg-dark text-white text-center py-4">
            <h2>
              <i class="bi bi-shield-lock-fill me-2"></i>
              Admin Portal
            </h2>
          </div>
          <div class="card-body p-5">
            @if (error) {
              <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                {{ error }}
              </div>
            }
            <form (ngSubmit)="onSubmit()">
              <div class="mb-4">
                <label class="form-label fw-bold">
                  <i class="bi bi-envelope-fill me-2"></i>Email
                </label>
                <input 
                  type="email" 
                  class="form-control form-control-lg" 
                  [(ngModel)]="email" 
                  name="email" 
                  placeholder="admin@example.com"
                  required>
              </div>
              <div class="mb-4">
                <label class="form-label fw-bold">
                  <i class="bi bi-key-fill me-2"></i>Password
                </label>
                <input 
                  type="password" 
                  class="form-control form-control-lg" 
                  [(ngModel)]="password" 
                  name="password" 
                  placeholder="Enter your password"
                  required>
              </div>
              <button 
                type="submit" 
                class="btn btn-dark btn-lg w-100" 
                [disabled]="loading">
                @if (loading) {
                  <span class="spinner-border spinner-border-sm me-2"></span>
                  Authenticating...
                } @else {
                  <i class="bi bi-box-arrow-in-right me-2"></i>
                  Login to Admin Panel
                }
              </button>
            </form>
            <div class="text-center mt-4 text-muted">
              <small>
                <i class="bi bi-info-circle me-1"></i>
                Authorized personnel only
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-login-wrapper {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .admin-login-container {
      width: 100%;
      max-width: 450px;
    }

    .card {
      border: none;
      border-radius: 15px;
    }

    .card-header {
      border-radius: 15px 15px 0 0 !important;
    }

    .form-control:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
    }

    .btn-dark {
      background: #2c3e50;
      border: none;
    }

    .btn-dark:hover {
      background: #34495e;
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