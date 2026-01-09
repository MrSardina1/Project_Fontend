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
    <div class="admin-container">
      <div class="admin-sidebar">
        <h4 class="text-white mb-4">Admin Panel</h4>
        <nav class="nav flex-column">
          <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-link">
            <i class="bi bi-speedometer2"></i> Dashboard
          </a>
          <a routerLink="/admin/users" routerLinkActive="active" class="nav-link">
            <i class="bi bi-people"></i> Users
          </a>
          <a routerLink="/admin/companies" routerLinkActive="active" class="nav-link">
            <i class="bi bi-building"></i> Companies
          </a>
          <a routerLink="/admin/pending-companies" routerLinkActive="active" class="nav-link">
            <i class="bi bi-clock-history"></i> Pending Companies
            @if (stats && stats.pendingCompanies > 0) {
              <span class="badge bg-warning ms-2">{{ stats.pendingCompanies }}</span>
            }
          </a>
          <a routerLink="/admin/internships" routerLinkActive="active" class="nav-link">
            <i class="bi bi-briefcase"></i> Internships
          </a>
          <a routerLink="/admin/applications" routerLinkActive="active" class="nav-link">
            <i class="bi bi-file-text"></i> Applications
          </a>
          <a routerLink="/admin/reviews" routerLinkActive="active" class="nav-link">
            <i class="bi bi-star"></i> Reviews
          </a>
          <hr class="bg-light">
          <a (click)="logout()" class="nav-link text-danger" style="cursor: pointer;">
            <i class="bi bi-box-arrow-right"></i> Logout
          </a>
        </nav>
      </div>

      <div class="admin-content">
        <div class="container-fluid py-4">
          <h2 class="mb-4">Dashboard</h2>

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

          @if (stats) {
            <div class="row">
              <div class="col-md-3 mb-4">
                <div class="card bg-primary text-white">
                  <div class="card-body">
                    <h6 class="card-title">Total Students</h6>
                    <h2 class="mb-0">{{ stats.totalStudents }}</h2>
                  </div>
                </div>
              </div>

              <div class="col-md-3 mb-4">
                <div class="card bg-success text-white">
                  <div class="card-body">
                    <h6 class="card-title">Total Companies</h6>
                    <h2 class="mb-0">{{ stats.totalCompanies }}</h2>
                  </div>
                </div>
              </div>

              <div class="col-md-3 mb-4">
                <div class="card bg-warning text-white">
                  <div class="card-body">
                    <h6 class="card-title">Pending Companies</h6>
                    <h2 class="mb-0">{{ stats.pendingCompanies }}</h2>
                    @if (stats.pendingCompanies > 0) {
                      <a routerLink="/admin/pending-companies" class="btn btn-sm btn-light mt-2">
                        Review Now
                      </a>
                    }
                  </div>
                </div>
              </div>

              <div class="col-md-3 mb-4">
                <div class="card bg-info text-white">
                  <div class="card-body">
                    <h6 class="card-title">Total Internships</h6>
                    <h2 class="mb-0">{{ stats.totalInternships }}</h2>
                  </div>
                </div>
              </div>

              <div class="col-md-4 mb-4">
                <div class="card">
                  <div class="card-body">
                    <h6 class="card-title">Total Applications</h6>
                    <h2 class="mb-0">{{ stats.totalApplications }}</h2>
                  </div>
                </div>
              </div>

              <div class="col-md-4 mb-4">
                <div class="card">
                  <div class="card-body">
                    <h6 class="card-title">Average Rating</h6>
                    <h2 class="mb-0">{{ stats.averageRating }} / 5</h2>
                    <div class="text-warning fs-4">
                      @for (star of [1,2,3,4,5]; track star) {
                        <span>{{ star <= stats.averageRating ? '★' : '☆' }}</span>
                      }
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-md-4 mb-4">
                <div class="card">
                  <div class="card-body">
                    <h6 class="card-title">Total Reviews</h6>
                    <h2 class="mb-0">{{ stats.totalReviews }}</h2>
                  </div>
                </div>
              </div>
            </div>

            <div class="row mt-4">
              <div class="col-md-12">
                <div class="card">
                  <div class="card-header">
                    <h5 class="mb-0">Quick Actions</h5>
                  </div>
                  <div class="card-body">
                    <div class="d-grid gap-2 d-md-flex">
                      <button routerLink="/admin/pending-companies" class="btn btn-warning">
                        Review Pending Companies ({{ stats.pendingCompanies }})
                      </button>
                      <button routerLink="/admin/users" class="btn btn-primary">
                        Manage Users
                      </button>
                      <button routerLink="/admin/companies" class="btn btn-success">
                        Manage Companies
                      </button>
                      <button routerLink="/admin/internships" class="btn btn-info">
                        Manage Internships
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-container {
      display: flex;
      min-height: 100vh;
    }

    .admin-sidebar {
      width: 250px;
      background: #2c3e50;
      padding: 20px;
      position: fixed;
      height: 100vh;
      overflow-y: auto;
    }

    .admin-sidebar .nav-link {
      color: #ecf0f1;
      padding: 12px 15px;
      border-radius: 5px;
      margin-bottom: 5px;
      transition: all 0.3s;
    }

    .admin-sidebar .nav-link:hover {
      background: #34495e;
      padding-left: 20px;
    }

    .admin-sidebar .nav-link.active {
      background: #3498db;
      color: white;
    }

    .admin-content {
      margin-left: 250px;
      flex: 1;
      background: #f8f9fa;
    }

    .card {
      border: none;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
  ) {}

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

  logout() {
    this.authService.logout();
  }
}