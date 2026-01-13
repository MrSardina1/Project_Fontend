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
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow-sm">
            <div class="card-header bg-warning text-dark">
              <h3 class="mb-0">Reset Password</h3>
            </div>
            <div class="card-body p-4">
              @if (error) {
                <div class="alert alert-danger">{{ error }}</div>
              }
              @if (success) {
                <div class="alert alert-success">
                  Password has been reset successfully! Redirecting to login...
                </div>
              } @else {
                <p class="text-muted mb-4">
                  Please enter your new password below.
                </p>
                <form (ngSubmit)="onSubmit()">
                  <div class="mb-3">
                    <label class="form-label">New Password</label>
                    <input 
                      type="password" 
                      class="form-control" 
                      [(ngModel)]="password" 
                      name="password" 
                      required
                      minlength="6"
                    >
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Confirm New Password</label>
                    <input 
                      type="password" 
                      class="form-control" 
                      [(ngModel)]="confirmPassword" 
                      name="confirmPassword" 
                      required
                    >
                  </div>
                  <div class="d-grid gap-2">
                    <button type="submit" class="btn btn-warning" [disabled]="loading || !isValid()">
                      @if (loading) {
                        <span class="spinner-border spinner-border-sm me-2"></span>
                      }
                      Reset Password
                    </button>
                    <a routerLink="/login" class="btn btn-link text-center text-muted">Cancel</a>
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
