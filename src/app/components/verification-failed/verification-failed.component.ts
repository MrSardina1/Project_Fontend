import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verification-failed',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow-lg">
            <div class="card-body text-center p-5">
              <div class="mb-4">
                <i class="bi bi-x-circle-fill text-danger" style="font-size: 4rem;"></i>
              </div>
              <h2 class="card-title mb-3">Verification Failed</h2>
              <p class="card-text text-muted mb-4">
                {{ errorMessage }}
              </p>
              <div class="d-grid gap-2">
                <button 
                  class="btn btn-primary"
                  (click)="goToLogin()">
                  Go to Login
                </button>
                <button 
                  class="btn btn-outline-secondary"
                  (click)="resendEmail()"
                  [disabled]="isResending">
                  {{ isResending ? 'Sending...' : 'Resend Verification Email' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border: none;
      border-radius: 15px;
    }
  `]
})
export class VerificationFailedComponent implements OnInit {
  errorMessage = 'The verification link is invalid or has expired.';
  isResending = false;
  errorType?: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.errorType = params['error'];
      this.setErrorMessage(this.errorType);
    });
  }

  setErrorMessage(errorType?: string): void {
    switch (errorType) {
      case 'missing_token':
        this.errorMessage = 'The verification link is missing required information.';
        break;
      case 'invalid_token':
        this.errorMessage = 'The verification link is invalid or has expired.';
        break;
      case 'server_error':
        this.errorMessage = 'A server error occurred. Please try again later.';
        break;
      default:
        this.errorMessage = 'Email verification failed. Please try again.';
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  resendEmail(): void {
    this.isResending = true;
    setTimeout(() => {
      this.isResending = false;
      alert('Please login and request a new verification email.');
      this.goToLogin();
    }, 1500);
  }
}