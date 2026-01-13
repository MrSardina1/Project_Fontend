import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApplicationService, Application } from '../../../services/application.service';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-container">
      <header class="page-header mb-5">
        <h1 class="page-title text-gradient">My Applications</h1>
        <p class="text-muted">Track and manage your internship applications</p>
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

      @if (applications.length === 0 && !loading) {
        <div class="glass p-5 text-center rounded-4 border-0 shadow-sm">
          <div class="mb-4">
            <i class="bi bi-send-x fs-1 text-muted"></i>
          </div>
          <h4 class="text-muted">No applications found</h4>
          <p class="text-secondary mb-4">You haven't applied to any internships yet.</p>
          <a routerLink="/internships" class="btn btn-primary px-4 py-2">
            Browse All Internships
          </a>
        </div>
      }

      <div class="row g-4">
        @for (app of applications; track app._id) {
          <div class="col-12">
            <div class="application-card glass p-4 rounded-4 border-0 shadow-sm h-100">
              <div class="row align-items-center">
                <div class="col-md-7">
                  <div class="d-flex align-items-center mb-3">
                    <div class="company-logo-sm me-3">{{ app.internship.company.name.charAt(0) }}</div>
                    <div>
                      <h4 class="intern-title mb-0">{{ app.internship.title }}</h4>
                      <div class="company-name text-primary">{{ app.internship.company.name }}</div>
                    </div>
                  </div>
                  
                  <div class="app-meta d-flex flex-wrap gap-3 mb-0">
                    <div class="meta-item"><i class="bi bi-geo-alt me-1"></i>{{ app.internship.location }}</div>
                    <div class="meta-item"><i class="bi bi-calendar-event me-1"></i>{{ app.internship.duration }}</div>
                    <div class="meta-item"><i class="bi bi-clock-history me-1"></i>Applied {{ app.createdAt | date:'mediumDate' }}</div>
                  </div>
                </div>
                
                <div class="col-md-5 text-md-end mt-4 mt-md-0">
                  <div class="status-badge-wrapper mb-3">
                    <span class="status-badge" [class]="getStatusClass(app.status)">
                      {{ app.status }}
                    </span>
                  </div>
                  
                  <div class="actions d-flex gap-2 justify-content-md-end">
                    <a [routerLink]="['/company-reviews', app.internship.company._id]" 
                       class="btn btn-light-primary btn-sm rounded-3">
                      <i class="bi bi-star me-1"></i> Reviews
                    </a>
                    <a [routerLink]="['/profile/company', app.internship.company._id]" 
                       class="btn btn-light-secondary btn-sm rounded-3">
                      <i class="bi bi-building me-1"></i> Profile
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1000px; }
    .page-title { font-size: 2.25rem; font-weight: 800; margin-bottom: 0.25rem; }
    
    .application-card {
      transition: all 0.3s ease;
      border: 1px solid var(--border) !important;
    }
    
    .application-card:hover {
      transform: translateX(8px);
      box-shadow: var(--shadow) !important;
      border-color: var(--primary) !important;
    }

    .company-logo-sm {
      width: 48px;
      height: 48px;
      background: var(--primary-light);
      color: var(--primary);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.25rem;
    }

    .intern-title { font-size: 1.25rem; font-weight: 700; }
    .company-name { font-weight: 600; font-size: 0.95rem; }
    
    .app-meta { font-size: 0.85rem; color: var(--text-muted); }
    
    .status-badge {
      display: inline-block;
      padding: 0.4rem 1rem;
      border-radius: 100px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .bg-pending { background: #fef3c7; color: #92400e; }
    .bg-accepted { background: #d1fae5; color: #065f46; }
    .bg-rejected { background: #fee2e2; color: #991b1b; }
    .bg-other { background: #f3f4f6; color: #374151; }

    .btn-light-primary {
      background: var(--primary-light);
      color: var(--primary);
      border: none;
    }
    .btn-light-secondary {
      background: #ecfdf5;
      color: #059669;
      border: none;
    }
  `]
})
export class MyApplicationsComponent implements OnInit {
  applications: Application[] = [];
  loading = false;
  error = '';

  constructor(private applicationService: ApplicationService) { }

  ngOnInit() {
    this.loadApplications();
  }

  loadApplications() {
    this.loading = true;
    this.applicationService.getMyApplications().subscribe({
      next: (data) => {
        this.applications = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load applications';
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'bg-pending';
      case 'ACCEPTED': return 'bg-accepted';
      case 'REJECTED': return 'bg-rejected';
      default: return 'bg-other';
    }
  }
}