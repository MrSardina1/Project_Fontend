import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApplicationService } from '../../../services/application.service';
import { ImagePathPipe } from '../../../pipes/image-path.pipe';

@Component({
  selector: 'app-accepted-companies',
  standalone: true,
  imports: [CommonModule, RouterModule, ImagePathPipe],
  template: `
    <div class="page-container">
      <header class="page-header mb-5">
        <h1 class="page-title text-gradient">Companies That Accepted Me</h1>
        <p class="text-muted">Explore the companies that have accepted your applications</p>
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

      @if (companies.length === 0 && !loading) {
        <div class="glass p-5 text-center rounded-4 border-0 shadow-sm">
          <div class="mb-4">
            <i class="bi bi-building-check fs-1 text-muted"></i>
          </div>
          <h4 class="text-muted">No accepted companies yet</h4>
          <p class="text-secondary mb-4">Keep applying! When a company accepts you, they will appear here.</p>
          <a routerLink="/internships" class="btn btn-primary px-4 py-2">
            Browse Internships
          </a>
        </div>
      }

      <div class="row g-4">
        @for (company of companies; track company._id) {
          <div class="col-12">
            <div class="company-card glass p-4 rounded-4 border-0 shadow-sm h-100">
              <div class="row align-items-center">
                <div class="col-md-7">
                  <div class="d-flex align-items-center mb-3">
                    <div class="company-logo-sm-container me-3">
                      @if (company.profilePicture) {
                        <img [src]="company.profilePicture | imagePath" class="company-logo-sm-img" alt="Company Logo">
                      } @else {
                        <div class="company-logo-sm-fallback">{{ company.name.charAt(0) }}</div>
                      }
                    </div>
                    <div>
                      <h4 class="company-title mb-0">{{ company.name }}</h4>
                      @if (company.website) {
                         <a [href]="company.website" target="_blank" class="text-muted small text-decoration-none hover-purple">
                           <i class="bi bi-globe me-1"></i>Visit Website
                         </a>
                      }
                    </div>
                  </div>
                  
                  <div class="app-meta d-flex flex-wrap gap-3 mb-0">
                    <div class="meta-item"><i class="bi bi-envelope me-1"></i>{{ company.email }}</div>
                    <!-- Email is prioritized as per design -->
                  </div>
                </div>
                
                <div class="col-md-5 text-md-end mt-4 mt-md-0">
                  <div class="status-badge-wrapper mb-3">
                    <span class="status-badge bg-accepted">
                      ACCEPTED
                    </span>
                  </div>
                  
                  <div class="actions d-flex gap-2 justify-content-md-end">
                    <a [routerLink]="['/company-reviews', company._id]" 
                       class="btn btn-action-reviews btn-sm rounded-3">
                      <i class="bi bi-star me-1"></i> Reviews
                    </a>
                    <a [routerLink]="['/profile/company', company._id]" 
                       class="btn btn-action-profile btn-sm rounded-3">
                      <i class="bi bi-person me-1"></i> View Profile
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
    .page-container { max-width: 1000px; margin: 0 auto; padding: 1.5rem; }
    .page-title { font-size: 2.25rem; font-weight: 800; margin-bottom: 0.25rem; }
    
    .text-gradient {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .company-card {
      transition: all 0.3s ease;
      background: white;
      border: 1px solid #f1f5f9 !important;
    }
    
    .company-card:hover {
      transform: translateX(8px);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1) !important;
      border-color: #8b5cf6 !important;
    }

    .company-logo-sm-container {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
    }
    
    .company-logo-sm-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .company-logo-sm-fallback {
      color: #7c3aed;
      font-weight: 700;
      font-size: 1.5rem;
    }

    .company-title { font-size: 1.35rem; font-weight: 700; color: #1e293b; }
    
    .app-meta { font-size: 0.9rem; color: #64748b; }
    
    .status-badge {
      display: inline-block;
      padding: 0.4rem 1rem;
      border-radius: 100px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .bg-accepted { background: #dcfce7; color: #15803d; }

    /* Button Styles Matching Reference Image */
    .btn-action-reviews {
      background: #dcfce7; /* Light Green */
      color: #15803d;      /* Green 700 */
      border: none;
      font-weight: 600;
      padding: 0.5rem 1rem;
    }

    .btn-action-reviews:hover {
      background: #15803d;
      color: white;
    }

    .btn-action-profile {
      background: #f3e8ff; /* Light Purple */
      color: #7e22ce;      /* Purple 700 */
      border: none;
      font-weight: 600;
      padding: 0.5rem 1rem;
    }

    .btn-action-profile:hover {
      background: #7e22ce;
      color: white;
    }

    .hover-purple:hover {
      color: #7e22ce !important;
    }
  `]
})
export class AcceptedCompaniesComponent implements OnInit {
  companies: any[] = [];
  loading = false;
  error = '';

  constructor(private applicationService: ApplicationService) { }

  ngOnInit() {
    this.loadAcceptedCompanies();
  }

  loadAcceptedCompanies() {
    this.loading = true;
    this.applicationService.getAcceptedCompanies().subscribe({
      next: (data) => {
        this.companies = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load companies';
        this.loading = false;
      }
    });
  }
}
