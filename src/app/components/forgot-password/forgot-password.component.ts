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
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow-sm">
            <div class="card-header bg-primary text-white">
              <h3 class="mb-0">Forgot Password</h3>
            </div>
            <div class="card-body p-4">
              @if (error) {
                <div class="alert alert-danger">{{ error }}</div>
              }
              @if (message) {
                <div class="alert alert-success">
                  {{ message }}
                  <div class="mt-2">
                    <a routerLink="/login" class="btn btn-sm btn-outline-success">Back to Login</a>
                  </div>
                </div>
              } @else {
                <p class="text-muted mb-4">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                <form (ngSubmit)="onSubmit()">
                  <div class="mb-3">
                    <label class="form-label">Email Address</label>
                    <input 
                      type="email" 
                      class="form-control" 
                      [(ngModel)]="email" 
                      name="email" 
                      required
                      placeholder="name@example.com"
                    >
                  </div>
                  <div class="d-grid gap-2">
                    <button type="submit" class="btn btn-primary" [disabled]="loading">
                      @if (loading) {
                        <span class="spinner-border spinner-border-sm me-2"></span>
                      }
                      Send Reset Link
                    </button>
                    <a routerLink="/login" class="btn btn-link text-center">Back to Login</a>
                  </div>
                </form>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .card {
      border: none;
      border-radius: 10px;
    }
    .card-header {
      border-radius: 10px 10px 0 0 !important;
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
