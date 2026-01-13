import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CompanyService } from '../../../services/company.service';

@Component({
  selector: 'app-company-internships',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-container">
      <header class="page-header d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1 class="page-title text-gradient">My Internship Listings</h1>
          <p class="text-muted">Manage your active opportunities and track applicants</p>
        </div>
        <a routerLink="/create-internship" class="btn btn-primary shadow-sm rounded-3">
          <i class="bi bi-plus-lg me-2"></i>Post New Opening
        </a>
      </header>

      @if (loading) {
        <div class="d-flex justify-content-center py-5">
          <div class="spinner-grow text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      }

      @if (error) {
        <div class="alert alert-danger rounded-4 border-0 shadow-sm d-flex align-items-center mb-4">
          <i class="bi bi-exclamation-circle-fill me-2 fs-5"></i>
          <div>{{ error }}</div>
        </div>
      }

      @if (internships.length === 0 && !loading) {
        <div class="glass p-5 text-center rounded-4 border-0 shadow-sm">
          <div class="mb-4">
            <i class="bi bi-folder2-open fs-1 text-muted"></i>
          </div>
          <h4 class="text-muted">No internships posted yet</h4>
          <p class="text-secondary mb-4">Start reaching out to talented students by posting your first opening.</p>
          <a routerLink="/create-internship" class="btn btn-primary px-4 py-2">
            Create First listing
          </a>
        </div>
      }

      <div class="row g-4">
        @for (internship of internships; track internship._id) {
          <div class="col-xl-6">
            <div class="listing-card glass p-4 rounded-4 border-0 shadow-sm h-100">
              <div class="d-flex justify-content-between align-items-start mb-4">
                <div class="title-area">
                  <h3 class="intern-title mb-1">{{ internship.title }}</h3>
                  <div class="d-flex align-items-center gap-3">
                    <span class="meta-item"><i class="bi bi-geo-alt me-1"></i>{{ internship.location }}</span>
                    <span class="meta-item"><i class="bi bi-calendar-event me-1"></i>{{ internship.duration }}</span>
                  </div>
                </div>
                <div class="applicant-stat text-center p-2 rounded-3">
                  <div class="count">{{ internship.applicationCount || 0 }}</div>
                  <div class="label">Applicants</div>
                </div>
              </div>
              
              <p class="intern-desc text-muted mb-4">
                {{ internship.description | slice:0:150 }}{{ internship.description.length > 150 ? '...' : '' }}
              </p>
              
              <div class="card-footer-custom pt-4 border-top d-flex justify-content-between align-items-center mt-auto">
                <div class="posted-date small text-light">
                  <i class="bi bi-clock me-1"></i>Posted {{ internship.createdAt | date:'mediumDate' }}
                </div>
                <a [routerLink]="['/internship-applications', internship._id]" 
                   class="btn btn-outline-primary rounded-pill px-4 btn-sm fw-600">
                  Review Applications <i class="bi bi-arrow-right ms-1"></i>
                </a>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1100px; }
    .page-title { font-size: 2.25rem; font-weight: 800; margin-bottom: 0.25rem; }
    
    .listing-card {
      background: white;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      border: 1px solid var(--border) !important;
    }
    
    .listing-card:hover {
      transform: translateY(-5px);
      box-shadow: var(--shadow-md) !important;
      border-color: var(--primary) !important;
    }

    .intern-title { font-size: 1.5rem; font-weight: 700; color: var(--text-main); }
    .meta-item { font-size: 0.85rem; color: var(--text-muted); font-weight: 500; }
    
    .applicant-stat {
      background: var(--primary-light);
      min-width: 80px;
    }
    
    .applicant-stat .count {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--primary);
      line-height: 1;
    }
    
    .applicant-stat .label {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--primary);
    }

    .intern-desc { font-size: 0.95rem; line-height: 1.6; }
    
    .fw-600 { font-weight: 600; }
    .text-light { color: #94a3b8 !important; }
  `]
})
export class CompanyInternshipsComponent implements OnInit {
  internships: any[] = [];
  loading = false;
  error = '';

  constructor(private companyService: CompanyService) { }

  ngOnInit() {
    this.loadInternships();
  }

  loadInternships() {
    this.loading = true;
    this.companyService.getMyInternships().subscribe({
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
}