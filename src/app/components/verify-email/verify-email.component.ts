import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-body text-center p-5">
              @if (loading) {
                <div class="spinner-border text-primary mb-3" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <h3>Verifying your email...</h3>
                <p class="text-muted">Please wait while we verify your account.</p>
              }
              
              @if (success) {
                <div class="text-success mb-3">
                  <i class="bi bi-check-circle" style="font-size: 4rem;"></i>
                </div>
                <h3 class="text-success">Email Verified Successfully!</h3>
                <p class="mt-3">{{ message }}</p>
                <p class="text-muted">You will be redirected to login page in {{ countdown }} seconds...</p>
                <a routerLink="/login" class="btn btn-primary mt-3">Go to Login Now</a>
              }
              
              @if (error) {
                <div class="text-danger mb-3">
                  <i class="bi bi-x-circle" style="font-size: 4rem;"></i>
                </div>
                <h3 class="text-danger">Verification Failed</h3>
                <div class="alert alert-danger mt-3">{{ error }}</div>
                <p class="mt-3">The verification link may have expired or is invalid.</p>
                <div class="mt-4">
                  <a routerLink="/login" class="btn btn-primary me-2">Go to Login</a>
                  <a routerLink="/register" class="btn btn-secondary">Register Again</a>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
      border: none;
      border-radius: 10px;
    }
    
    i {
      display: inline-block;
      margin-bottom: 1rem;
    }
  `]
})
export class VerifyEmailComponent implements OnInit {
  loading = true;
  success = false;
  error = '';
  message = '';
  countdown = 5;
  private countdownInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Get token from URL query parameters
    const token = this.route.snapshot.queryParamMap.get('token');
    
    console.log('=== EMAIL VERIFICATION DEBUG ===');
    console.log('Full URL:', window.location.href);
    console.log('Token from URL:', token);
    console.log('Token length:', token?.length);

    if (!token) {
      console.error('ERROR: No token found in URL');
      this.loading = false;
      this.error = 'No verification token provided';
      return;
    }

    // Call backend to verify email
    console.log('Calling backend with token:', token);
    this.authService.verifyEmail(token).subscribe({
      next: (response) => {
        console.log('✅ Verification SUCCESS:', response);
        this.loading = false;
        this.success = true;
        this.message = response.message || 'Email verified successfully! You can now login.';
        
        // Start countdown and redirect
        this.startCountdown();
      },
      error: (err) => {
        console.error('❌ Verification FAILED:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.error?.message);
        console.error('Full error:', err);
        this.loading = false;
        this.error = err.error?.message || 'Failed to verify email. The link may have expired.';
      }
    });
  }

  startCountdown() {
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
        this.router.navigate(['/login']);
      }
    }, 1000);
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}