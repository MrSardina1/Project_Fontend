import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register-company',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header">
              <h3>Register as Company</h3>
            </div>
            <div class="card-body">
              @if (error) {
                <div class="alert alert-danger">{{ error }}</div>
              }
              @if (success) {
                <div class="alert alert-success">Registration successful! Redirecting to login...</div>
              }
              <form (ngSubmit)="onSubmit()">
                <h5 class="mb-3">Company Information</h5>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Company Name</label>
                    <input type="text" class="form-control" [(ngModel)]="name" name="name" required>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Company Email</label>
                    <input type="email" class="form-control" [(ngModel)]="email" name="email" required>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Website (optional)</label>
                  <input type="url" class="form-control" [(ngModel)]="website" name="website">
                </div>
                <div class="mb-3">
                  <label class="form-label">Description (optional)</label>
                  <textarea class="form-control" [(ngModel)]="description" name="description" rows="3"></textarea>
                </div>
                
                <h5 class="mb-3 mt-4">Account Information</h5>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Username</label>
                    <input type="text" class="form-control" [(ngModel)]="username" name="username" required>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Password (min 6 characters)</label>
                    <input type="password" class="form-control" [(ngModel)]="password" name="password" required minlength="6">
                  </div>
                </div>
                
                <button type="submit" class="btn btn-primary w-100" [disabled]="loading">
                  @if (loading) {
                    <span class="spinner-border spinner-border-sm me-2"></span>
                  }
                  Register Company
                </button>
              </form>
              <div class="mt-3 text-center">
                <p>Already have an account? <a routerLink="/login">Login</a></p>
                <p>Register as a student? <a routerLink="/register">Student Registration</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterCompanyComponent {
  // Company fields
  name = '';
  email = '';
  website = '';
  description = '';
  
  // User fields
  username = '';
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

    this.authService.registerCompany({
      name: this.name,
      email: this.email,
      website: this.website,
      description: this.description,
      username: this.username,
      password: this.password
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