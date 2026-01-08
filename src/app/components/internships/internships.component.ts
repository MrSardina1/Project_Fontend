import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InternshipService, Internship } from '../../services/internship.service';
import { ApplicationService } from '../../services/application.service';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-internships',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Available Internships</h2>
        @if ((currentUser$ | async)?.role === 'COMPANY') {
          <a routerLink="/create-internship" class="btn btn-primary">Post New Internship</a>
        }
      </div>

      @if (loading) {
        <div class="text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      }

      @if (error) {
        <div class="alert alert-danger">{{ error }}</div>
      }

      @if (success) {
        <div class="alert alert-success">{{ success }}</div>
      }

      <div class="row">
        @for (internship of internships; track internship._id) {
          <div class="col-md-6 col-lg-4 mb-4">
            <div class="card h-100">
              <div class="card-body">
                <h5 class="card-title">{{ internship.title }}</h5>
                <h6 class="card-subtitle mb-2 text-muted">{{ internship.company.name }}</h6>
                <p class="card-text">{{ internship.description }}</p>
                <p class="mb-1"><strong>Location:</strong> {{ internship.location }}</p>
                <p class="mb-3"><strong>Duration:</strong> {{ internship.duration }}</p>
                @if (internship.company.website) {
                  <a [href]="internship.company.website" target="_blank" class="btn btn-sm btn-outline-secondary me-2">
                    Company Website
                  </a>
                }
                <a [routerLink]="['/company-reviews', internship.company._id]" class="btn btn-sm btn-outline-info me-2">
                  Reviews
                </a>
                @if ((currentUser$ | async)?.role === 'STUDENT') {
                  <button 
                    class="btn btn-sm btn-primary" 
                    (click)="apply(internship._id)"
                    [disabled]="applying === internship._id">
                    @if (applying === internship._id) {
                      <span class="spinner-border spinner-border-sm me-1"></span>
                    }
                    Apply
                  </button>
                }
              </div>
              <div class="card-footer text-muted">
                Posted: {{ internship.createdAt | date:'short' }}
              </div>
            </div>
          </div>
        }
      </div>

      @if (internships.length === 0 && !loading) {
        <div class="alert alert-info">
          No internships available at the moment.
        </div>
      }
    </div>
  `
})
export class InternshipsComponent implements OnInit {
  internships: Internship[] = [];
  loading = false;
  error = '';
  success = '';
  applying: string | null = null;
  currentUser$: Observable<any>;

  constructor(
    private internshipService: InternshipService,
    private applicationService: ApplicationService,
    private authService: AuthService
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {
    this.loadInternships();
  }

  loadInternships() {
    this.loading = true;
    this.internshipService.getAll().subscribe({
      next: (data) => {
        this.internships = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load internships';
        this.loading = false;
      }
    });
  }

  apply(internshipId: string) {
    this.applying = internshipId;
    this.error = '';
    this.success = '';

    this.applicationService.apply(internshipId).subscribe({
      next: () => {
        this.success = 'Application submitted successfully!';
        this.applying = null;
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error.message || 'Failed to apply';
        this.applying = null;
        setTimeout(() => this.error = '', 5000);
      }
    });
  }
}