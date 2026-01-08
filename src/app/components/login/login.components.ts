import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h3>Login</h3>
            </div>
            <div class="card-body">
              @if (error) {
                <div class="alert alert-danger">{{ error }}</div>
              }
              <form (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input type="email" class="form-control" [(ngModel)]="email" name="email" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Password</label>
                  <input type="password" class="form-control" [(ngModel)]="password" name="password" required>
                </div>
                <button type="submit" class="btn btn-primary w-100" [disabled]="loading">
                  @if (loading) {
                    <span class="spinner-border spinner-border-sm me-2"></span>
                  }
                  Login
                </button>
              </form>
              <div class="mt-3 text-center">
                <p>Don't have an account?</p>
                <a routerLink="/register" class="btn btn-outline-secondary me-2">Register as Student</a>
                <a routerLink="/register-company" class="btn btn-outline-info">Register as Company</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.loading = true;
    this.error = '';

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/internships']);
      },
      error: (err) => {
        this.error = err.error.message || 'Login failed';
        this.loading = false;
      }
    });
  }
}