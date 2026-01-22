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
        <a routerLink="/create-internship" class="btn btn-primary shadow-sm rounded-3 px-4 py-2 fw-600 d-flex align-items-center">
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
            <div class="icon-circle bg-light mx-auto">
              <i class="bi bi-folder2-open fs-1 text-muted"></i>
            </div>
          </div>
          <h4 class="text-muted fw-700 mb-2">No internships posted yet</h4>
          <p class="text-secondary mb-4">Start reaching out to talented students by posting your first opening.</p>
          <a routerLink="/create-internship" class="btn btn-primary px-4 py-2 rounded-pill fw-600">
            Create First Listing
          </a>
        </div>
      }

      <div class="row g-4 row-cols-1 row-cols-lg-2">
        @for (internship of internships; track internship._id) {
          <div class="col">
            <div class="dashboard-card h-100">
              <div class="card-body p-4 d-flex flex-column h-100">
                
                <div class="d-flex justify-content-between align-items-start mb-4">
                  <div>
                    <h3 class="intern-title mb-2">{{ internship.title }}</h3>
                    <span class="status-badge active">
                      <span class="dot"></span> Active
                    </span>
                  </div>
                  <div class="applicant-counter">
                    <span class="count">{{ internship.applicationCount || 0 }}</span>
                    <span class="label">Applicants</span>
                  </div>
                </div>

                <!-- Quick Stats Grid -->
                <div class="stats-grid mb-4">
                  <div class="stat-item">
                    <div class="stat-icon"><i class="bi bi-geo-alt"></i></div>
                    <div>
                      <div class="stat-label">Location</div>
                      <div class="stat-value">{{ internship.location }}</div>
                    </div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-icon"><i class="bi bi-clock"></i></div>
                    <div>
                      <div class="stat-label">Duration</div>
                      <div class="stat-value">{{ internship.duration }}</div>
                    </div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-icon"><i class="bi bi-calendar3"></i></div>
                    <div>
                      <div class="stat-label">Posted</div>
                      <div class="stat-value">{{ internship.createdAt | date:'mediumDate' }}</div>
                    </div>
                  </div>
                </div>

                <!-- Full Description -->
                <div class="description-section mb-4 flex-grow-1">
                  <h6 class="section-label">Description</h6>
                  <p class="intern-desc">
                    {{ internship.description }}
                  </p>
                </div>
                
                <!-- Action Footer -->
                <div class="card-footer-custom pt-3 border-top mt-auto">
                  <a [routerLink]="['/internship-applications', internship._id]" 
                     class="btn btn-action-primary w-100">
                    <span>Review Applications</span>
                    <i class="bi bi-arrow-right-short fs-5"></i>
                  </a>
                </div>

              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 100%; }
    .page-title { font-size: 2.25rem; font-weight: 800; margin-bottom: 0.25rem; }
    
    .text-gradient {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* Dashboard Card Styles */
    .dashboard-card {
      background: white;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    .dashboard-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      border-color: #cbd5e1;
    }

    .intern-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
      line-height: 1.2;
    }

    /* Status Badge */
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 100px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .status-badge.active {
      background: #f0fdf4;
      color: #15803d;
      border: 1px solid #bbf7d0;
    }

    .status-badge .dot {
      width: 6px;
      height: 6px;
      background: currentColor;
      border-radius: 50%;
    }

    /* Applicant Counter */
    .applicant-counter {
      text-align: center;
      background: #eff6ff;
      padding: 0.75rem 1.25rem;
      border-radius: 16px;
      border: 1px solid #dbeafe;
    }

    .applicant-counter .count {
      display: block;
      font-size: 1.5rem;
      font-weight: 800;
      color: #2563eb;
      line-height: 1;
    }

    .applicant-counter .label {
      font-size: 0.7rem;
      font-weight: 700;
      color: #3b82f6;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      background: #f8fafc;
      padding: 1rem;
      border-radius: 16px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .stat-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: white;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #e2e8f0;
      font-size: 1rem;
    }

    .stat-label {
      font-size: 0.7rem;
      color: #94a3b8;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 2px;
    }

    .stat-value {
      font-size: 0.9rem;
      color: #0f172a;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Description */
    .section-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94a3b8;
      font-weight: 700;
      margin-bottom: 0.75rem;
    }

    .intern-desc {
      font-size: 0.95rem;
      color: #475569;
      line-height: 1.7;
    }

    /* Action Button */
    .btn-action-primary {
      background: #2563eb;
      color: white;
      padding: 12px;
      border-radius: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s;
    }

    .btn-action-primary:hover {
      background: #1d4ed8;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
    }

    .icon-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .fw-600 { font-weight: 600; }
    .fw-700 { font-weight: 700; }
    
    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
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