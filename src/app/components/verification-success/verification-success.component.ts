import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verification-success',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow-lg">
            <div class="card-body text-center p-5">
              <div class="mb-4">
                <i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>
              </div>
              <h2 class="card-title mb-3">Email Verified Successfully!</h2>
              <p class="card-text text-muted mb-4">
                Your email has been verified. You can now login to your account.
              </p>
              <button 
                class="btn btn-primary btn-lg"
                (click)="goToLogin()">
                Go to Login
              </button>
              <p class="mt-3 text-muted small">
                Redirecting in {{ countdown }} seconds...
              </p>
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
    
    .bi-check-circle-fill {
      animation: scaleIn 0.5s ease-in-out;
    }
    
    @keyframes scaleIn {
      0% {
        transform: scale(0);
      }
      50% {
        transform: scale(1.1);
      }
      100% {
        transform: scale(1);
      }
    }
  `]
})
export class VerificationSuccessComponent implements OnInit, OnDestroy {
  countdown = 5;
  private intervalId?: number;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.startCountdown();
  }

  startCountdown(): void {
    this.intervalId = window.setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.goToLogin();
      }
    }, 1000);
  }

  goToLogin(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}