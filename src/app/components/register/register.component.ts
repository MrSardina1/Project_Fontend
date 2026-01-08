import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h3>Register as Student</h3>
            </div>
            <div class="card-body">
              @if (error) {
                <div class="alert alert-danger">{{ error }}</div>
              }
              @if (success) {
                <div class="alert alert-success">Registration successful! Redirecting to login...</div>
              }
              <form (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label class="form-label">Username</label>
                  <input type="text" class="form-control" [(ngModel)]="username" name="username" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input type="email" class="form-control" [(ngModel)]="email" name="email" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Password (min 6 characters)</label>
                  <input type="password" class="form-control" [(ngModel)]="password" name="password" required minlength="6">
                </div>
                <button type="submit" class="btn btn-primary w-100" [disabled]="loading">
                  @if (loading) {
                    <span class="spinner-border spinner-border-sm me-2"></span>
                  }
                  Register
                </button>
              </form>
              <div class="mt-3 text-center">
                <p>Already have an account? <a routerLink="/login">Login</a></p>
                <p>Want to register as a company? <a routerLink="/register-company">Register Company</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  loading = false;
  error = '';
  success = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.loading = true;
    this.error = '';

    this.authService.register({
      username: this.username,
      email: this.email,
      password: this.password,
      role: 'STUDENT'
    }).subscribe({
      next: () => {
        this.success = true;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.error = err.error.message || 'Registration failed';
        this.loading = false;
      }
    });
  }
}