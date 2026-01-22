import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';

interface DashboardStats {
  totalStudents: number;
  totalCompanies: number;
  pendingCompanies: number;
  totalInternships: number;
  totalApplications: number;
  averageRating: number;
  totalReviews: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-container">
      <header class="page-header mb-5">
        <h1 class="page-title text-gradient">Admin Command Center</h1>
        <p class="text-muted">Platform-wide oversight and performance metrics</p>
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

      @if (stats) {
        <div class="row g-4">
          <!-- Main Stats -->
          <div class="col-xl-3 col-md-6">
            <div class="stat-card glass p-4 rounded-4 border-0 shadow-sm h-100">
              <div class="d-flex justify-content-between mb-3">
                <div class="icon-box bg-soft-primary"><i class="bi bi-people text-primary"></i></div>
                <div class="trend text-success small"><i class="bi bi-arrow-up"></i> Total</div>
              </div>
              <h3 class="stat-value">{{ stats.totalStudents }}</h3>
              <p class="stat-label mb-0">Registered Students</p>
            </div>
          </div>

          <div class="col-xl-3 col-md-6">
            <div class="stat-card glass p-4 rounded-4 border-0 shadow-sm h-100">
              <div class="d-flex justify-content-between mb-3">
                <div class="icon-box bg-soft-info"><i class="bi bi-building text-info"></i></div>
                <div class="trend text-success small"><i class="bi bi-arrow-up"></i> Total</div>
              </div>
              <h3 class="stat-value">{{ stats.totalCompanies }}</h3>
              <p class="stat-label mb-0">Total Companies</p>
            </div>
          </div>

          <div class="col-xl-3 col-md-6">
            <div class="stat-card glass p-4 rounded-4 border-0 shadow-sm h-100" [class.border-warning]="stats.pendingCompanies > 0">
              <div class="d-flex justify-content-between mb-3">
                <div class="icon-box bg-soft-warning"><i class="bi bi-clock-history text-warning"></i></div>
                <div class="badge-action-required" *ngIf="stats.pendingCompanies > 0">Action Required</div>
              </div>
              <h3 class="stat-value">{{ stats.pendingCompanies }}</h3>
              <p class="stat-label mb-0">Pending companies</p>
            </div>
          </div>

          <div class="col-xl-3 col-md-6">
            <div class="stat-card glass p-4 rounded-4 border-0 shadow-sm h-100">
              <div class="d-flex justify-content-between mb-3">
                <div class="icon-box bg-soft-success"><i class="bi bi-briefcase text-success"></i></div>
                <div class="trend text-success small"><i class="bi bi-check-lg"></i> Active</div>
              </div>
              <h3 class="stat-value">{{ stats.totalInternships }}</h3>
              <p class="stat-label mb-0">Internships Hosted</p>
            </div>
          </div>

          <!-- Secondary Stats -->
          <div class="col-lg-4">
            <div class="info-card glass p-4 rounded-4 border-0 shadow-sm">
              <h5 class="fw-700 mb-3">User Engagement</h5>
              <div class="d-flex align-items-center mb-4">
                <div class="display-4 fw-800 text-main me-3">{{ stats.totalApplications }}</div>
                <div class="text-muted small">Applications processed<br>platform-wide</div>
              </div>
              <div class="progress rounded-pill mb-2" style="height: 8px;">
                <div class="progress-bar bg-primary" role="progressbar" [style.width.%]="getEngagementRate()"></div>
              </div>
              <div class="d-flex justify-content-between small text-muted">
                <span>Active Engagement</span>
                <span>Status: {{ getEngagementRate() }}%</span>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="info-card glass p-4 rounded-4 border-0 shadow-sm">
              <h5 class="fw-700 mb-3">System Reputation</h5>
              <div class="d-flex align-items-center mb-3">
                <div class="display-4 fw-800 text-warning me-3">{{ stats.averageRating }}</div>
                <div>
                  <div class="text-warning fs-5">
                    @for (star of [1,2,3,4,5]; track star) {
                      <i class="bi" [class.bi-star-fill]="star <= stats.averageRating" [class.bi-star]="star > stats.averageRating"></i>
                    }
                  </div>
                  <div class="text-muted small">Based on {{ stats.totalReviews }} reviews</div>
                </div>
              </div>
              <p class="text-muted small mb-0">Overall satisfaction rating from students and companies.</p>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="info-card glass p-4 rounded-4 border-0 shadow-sm">
              <h5 class="fw-700 mb-4">Quick Governance</h5>
              <div class="d-grid gap-2">
                <button routerLink="/admin/pending-companies" class="btn btn-warning-gradient py-2 rounded-3 fw-600">
                  <i class="bi bi-shield-check me-2"></i>Review Queue
                </button>
                <div class="row g-2">
                  <div class="col-6">
                    <button routerLink="/admin/users" class="btn btn-light-primary w-100 py-2 rounded-3 small fw-600">Users</button>
                  </div>
                  <div class="col-6">
                    <button routerLink="/admin/companies" class="btn btn-light-primary w-100 py-2 rounded-3 small fw-600">Companies</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row mt-5">
          <div class="col-12">
            <div class="management-section glass p-4 rounded-4 border-0 shadow-sm">
              <h5 class="fw-700 mb-4 px-2">Management Modules</h5>
              <div class="row g-4">
                <div class="col-md-4">
                  <div class="module-link p-3 rounded-3 d-flex align-items-center" routerLink="/admin/internships">
                    <div class="module-icon me-3 bg-soft-info"><i class="bi bi-journal-text text-info"></i></div>
                    <div class="module-info">
                      <div class="fw-700 text-main">Internships</div>
                      <div class="small text-muted">Browse and moderate</div>
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="module-link p-3 rounded-3 d-flex align-items-center" routerLink="/admin/applications">
                    <div class="module-icon me-3 bg-soft-success"><i class="bi bi-file-earmark-person text-success"></i></div>
                    <div class="module-info">
                      <div class="fw-700 text-main">Applications</div>
                      <div class="small text-muted">Auditing and logs</div>
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="module-link p-3 rounded-3 d-flex align-items-center" routerLink="/admin/reviews">
                    <div class="module-icon me-3 bg-soft-warning"><i class="bi bi-chat-heart text-warning"></i></div>
                    <div class="module-info">
                      <div class="fw-700 text-main">Reviews</div>
                      <div class="small text-muted">Moderate feedback</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { width: 100%; padding: 0 1rem; }
    .page-title { font-size: 2.25rem; font-weight: 800; margin-bottom: 0.25rem; }
    
    .fw-800 { font-weight: 800; }
    .fw-700 { font-weight: 700; }
    .fw-600 { font-weight: 600; }
    .text-main { color: var(--text-main); }
    
    .stat-card {
      background: white;
      border: 1px solid var(--border) !important;
      transition: all 0.3s ease;
    }
    .stat-card:hover { transform: translateY(-5px); box-shadow: var(--shadow) !important; }
    
    .icon-box {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
    
    .stat-value { font-size: 2rem; font-weight: 800; margin-bottom: 0.25rem; }
    .stat-label { font-size: 0.85rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
    
    .bg-soft-primary { background: rgba(79, 70, 229, 0.1); }
    .bg-soft-info { background: rgba(6, 182, 212, 0.1); }
    .bg-soft-warning { background: rgba(245, 158, 11, 0.1); }
    .bg-soft-success { background: rgba(16, 185, 129, 0.1); }

    .btn-light-primary { background: var(--primary-light); color: var(--primary); border: none; transition: all 0.2s; }
    .btn-light-primary:hover { background: var(--primary); color: white; }
    
    .module-link {
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid transparent;
    }
    .module-link:hover {
      background: var(--bg-main);
      border-color: var(--border);
    }
    .module-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .badge-action-required {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      padding: 0.4rem 0.85rem;
      border-radius: 50px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      box-shadow: 0 4px 10px rgba(245, 158, 11, 0.3);
      border: none;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      align-self: flex-start;
    }
    
    .badge-action-required::before {
      content: '';
      width: 6px;
      height: 6px;
      background: white;
      border-radius: 50%;
      display: inline-block;
      animation: pulse-dot 1.5s infinite;
    }

    @keyframes pulse-dot {
      0% { transform: scale(0.9); opacity: 1; }
      50% { transform: scale(1.4); opacity: 0.5; }
      100% { transform: scale(0.9); opacity: 1; }
    }

    .btn-warning-gradient {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      border: none;
      color: white;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
    }
    .btn-warning-gradient:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(245, 158, 11, 0.3);
      color: white;
      background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = false;
  error = '';

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.loading = true;
    this.adminService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load dashboard statistics';
        this.loading = false;
      }
    });
  }

  getEngagementRate(): number {
    if (!this.stats) return 0;
    const target = 10; // Define a target goal for applications
    return Math.min((this.stats.totalApplications / target) * 100, 100);
  }

  logout() {
    this.authService.logout();
  }
}