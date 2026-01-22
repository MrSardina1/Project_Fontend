import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InternshipService } from '../../services/internship.service';

@Component({
  selector: 'app-create-internship',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="premium-page-container py-5">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-8 col-xl-7">
            <!-- Premium Card -->
            <div class="premium-form-card">
              <!-- Gradient Header -->
              <div class="card-header-gradient">
                <div class="d-flex align-items-center justify-content-between">
                  <div class="d-flex align-items-center gap-3">
                    <div class="header-icon">
                      <i class="bi bi-briefcase-fill"></i>
                    </div>
                    <div>
                      <h2 class="header-title mb-1">Post New Internship</h2>
                      <p class="header-subtitle mb-0">Share an amazing opportunity with talented students</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Glass Body -->
              <div class="card-glass-body p-4 p-md-5">
                @if (error) {
                  <div class="alert-premium alert-danger-premium mb-4">
                    <i class="bi bi-exclamation-circle-fill me-2"></i>
                    <span>{{ error }}</span>
                  </div>
                }

                <form (ngSubmit)="onSubmit()">
                  <!-- Title Field -->
                  <div class="form-group-premium mb-4">
                    <label class="form-label-premium">
                      <i class="bi bi-pencil-fill me-2"></i>
                      Internship Title
                    </label>
                    <div class="input-wrapper">
                      <input 
                        type="text" 
                        class="form-control-premium" 
                        [(ngModel)]="title" 
                        name="title" 
                        placeholder="e.g., Frontend Developer Intern"
                        required>
                    </div>
                  </div>

                  <!-- Description Field -->
                  <div class="form-group-premium mb-4">
                    <label class="form-label-premium">
                      <i class="bi bi-card-text me-2"></i>
                      Description
                    </label>
                    <div class="input-wrapper">
                      <textarea 
                        class="form-control-premium textarea-premium" 
                        [(ngModel)]="description" 
                        name="description" 
                        rows="5"
                        placeholder="Describe the role, responsibilities, and what makes this opportunity special..."></textarea>
                    </div>
                  </div>

                  <!-- Location & Duration Row -->
                  <div class="row g-4 mb-4">
                    <div class="col-md-6">
                      <div class="form-group-premium">
                        <label class="form-label-premium">
                          <i class="bi bi-geo-alt-fill me-2"></i>
                          Location
                        </label>
                        <div class="input-wrapper">
                          <input 
                            type="text" 
                            class="form-control-premium" 
                            [(ngModel)]="location" 
                            name="location" 
                            placeholder="e.g., Tunis, Remote"
                            required>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-group-premium">
                        <label class="form-label-premium">
                          <i class="bi bi-clock-fill me-2"></i>
                          Duration
                        </label>
                        <div class="input-wrapper">
                          <input 
                            type="text" 
                            class="form-control-premium" 
                            [(ngModel)]="duration" 
                            name="duration" 
                            placeholder="e.g., 3 months"
                            required>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="action-buttons-container mt-5">
                    <button type="submit" class="btn-premium-submit" [disabled]="loading">
                      @if (loading) {
                        <span class="spinner-border spinner-border-sm me-2"></span>
                      } @else {
                        <i class="bi bi-check2-circle me-2"></i>
                      }
                      <span>Post Internship</span>
                    </button>
                    <button type="button" class="btn-premium-cancel" (click)="cancel()">
                      <i class="bi bi-x-circle me-2"></i>
                      <span>Cancel</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .premium-page-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    }

    .premium-form-card {
      background: white;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 60px -12px rgba(0, 0, 0, 0.08);
      border: 1px solid #f1f5f9;
    }

    .card-header-gradient {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      padding: 2rem 2rem 2rem 2rem;
      position: relative;
      overflow: hidden;
    }

    .card-header-gradient::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -10%;
      width: 300px;
      height: 300px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      filter: blur(60px);
    }

    .header-icon {
      width: 56px;
      height: 56px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .header-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: white;
      margin: 0;
      letter-spacing: -0.02em;
    }

    .header-subtitle {
      font-size: 0.95rem;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
    }

    .card-glass-body {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
    }

    .alert-premium {
      padding: 1rem 1.25rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      font-weight: 500;
      animation: slideDown 0.3s ease-out;
    }

    .alert-danger-premium {
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      color: #dc2626;
      border: 1px solid #fecaca;
    }

    .form-group-premium {
      position: relative;
    }

    .form-label-premium {
      font-weight: 600;
      color: #1e293b;
      font-size: 0.95rem;
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
    }

    .form-label-premium i {
      color: #4f46e5;
      font-size: 0.9rem;
    }

    .input-wrapper {
      position: relative;
    }

    .form-control-premium {
      width: 100%;
      padding: 0.875rem 1.25rem;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      font-size: 0.95rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background: #f8fafc;
      color: #1e293b;
      font-weight: 500;
    }

    .form-control-premium:focus {
      outline: none;
      border-color: #4f46e5;
      background: white;
      box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
      transform: translateY(-1px);
    }

    .form-control-premium::placeholder {
      color: #94a3b8;
      font-weight: 400;
    }

    .textarea-premium {
      resize: vertical;
      min-height: 120px;
      font-family: inherit;
      line-height: 1.6;
    }

    .action-buttons-container {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .btn-premium-submit {
      flex: 1;
      min-width: 200px;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 14px;
      font-weight: 700;
      font-size: 1rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn-premium-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 15px 30px -5px rgba(79, 70, 229, 0.5);
      filter: brightness(1.1);
    }

    .btn-premium-submit:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn-premium-submit:disabled {
      background: #e2e8f0;
      color: #94a3b8;
      box-shadow: none;
      cursor: not-allowed;
    }

    .btn-premium-cancel {
      flex: 1;
      min-width: 200px;
      background: white;
      color: #64748b;
      border: 1.5px solid #e2e8f0;
      padding: 1rem 2rem;
      border-radius: 14px;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn-premium-cancel:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
      color: #1e293b;
      transform: translateY(-2px);
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 768px) {
      .card-header-gradient {
        padding: 1.5rem;
      }

      .header-title {
        font-size: 1.5rem;
      }

      .header-icon {
        width: 48px;
        height: 48px;
        font-size: 1.25rem;
      }

      .action-buttons-container {
        flex-direction: column;
      }

      .btn-premium-submit,
      .btn-premium-cancel {
        width: 100%;
      }
    }
  `]
})
export class CreateInternshipComponent {
  title = '';
  description = '';
  location = '';
  duration = '';
  loading = false;
  error = '';

  constructor(
    private internshipService: InternshipService,
    private router: Router
  ) { }

  onSubmit() {
    this.loading = true;
    this.error = '';

    this.internshipService.create({
      title: this.title,
      description: this.description,
      location: this.location,
      duration: this.duration
    }).subscribe({
      next: () => {
        this.router.navigate(['/internships']);
      },
      error: (err) => {
        this.error = err.error.message || 'Failed to create internship';
        this.loading = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/internships']);
  }
}