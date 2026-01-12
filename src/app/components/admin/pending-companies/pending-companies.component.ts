import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService, AdminCompany } from '../../../services/admin.service';

@Component({
  selector: 'app-pending-companies',
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
        </nav>
      </div>

      <div class="admin-content">
        <div class="container-fluid py-4">
          <h2 class="mb-4">Pending Company Verifications</h2>

          @if (loading) {
            <div class="text-center">
              <div class="spinner-border"></div>
            </div>
          }

          @if (error) {
            <div class="alert alert-danger">{{ error }}</div>
          }

          @if (success) {
            <div class="alert alert-success">{{ success }}</div>
          }

          @if (companies.length === 0 && !loading) {
            <div class="alert alert-info">
              <i class="bi bi-check-circle me-2"></i>
              No pending companies to review.
            </div>
          }

          @for (company of companies; track company._id) {
            <div class="card mb-3">
              <div class="card-body">
                <div class="row">
                  <div class="col-md-8">
                    <h4>{{ company.name }}</h4>
                    <p class="mb-1"><strong>Email:</strong> {{ company.email }}</p>
                    @if (company.website) {
                      <p class="mb-1">
                        <strong>Website:</strong> 
                        <a [href]="company.website" target="_blank">{{ company.website }}</a>
                      </p>
                    }
                    <p class="mb-1"><strong>Submitted:</strong> {{ company.createdAt | date:'full' }}</p>
                    @if (company.user) {
                      <p class="mb-0 text-muted">
                        <small>Contact: {{ company.user.username }} ({{ company.user.email }})</small>
                      </p>
                    }
                  </div>
                  <div class="col-md-4 text-end">
                    <div class="btn-group-vertical" role="group">
                      <button 
                        class="btn btn-success" 
                        (click)="verifyCompany(company._id, 'APPROVED')"
                        [disabled]="verifying === company._id">
                        @if (verifying === company._id && verifyingStatus === 'APPROVED') {
                          <span class="spinner-border spinner-border-sm me-2"></span>
                        }
                        <i class="bi bi-check-circle me-1"></i> Approve
                      </button>
                      <button 
                        class="btn btn-danger" 
                        (click)="verifyCompany(company._id, 'REJECTED')"
                        [disabled]="verifying === company._id">
                        @if (verifying === company._id && verifyingStatus === 'REJECTED') {
                          <span class="spinner-border spinner-border-sm me-2"></span>
                        }
                        <i class="bi bi-x-circle me-1"></i> Reject
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
  `]
})
export class PendingCompaniesComponent implements OnInit {
  companies: AdminCompany[] = [];
  loading = false;
  error = '';
  success = '';
  verifying: string | null = null;
  verifyingStatus: 'APPROVED' | 'REJECTED' | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadPendingCompanies();
  }

  loadPendingCompanies() {
    this.loading = true;
    this.adminService.getPendingCompanies().subscribe({
      next: (data) => {
        this.companies = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load pending companies';
        this.loading = false;
      }
    });
  }

  verifyCompany(id: string, status: 'APPROVED' | 'REJECTED') {
    const action = status === 'APPROVED' ? 'approve' : 'reject';
    if (!confirm(`Are you sure you want to ${action} this company?`)) {
      return;
    }

    this.verifying = id;
    this.verifyingStatus = status;
    
    this.adminService.verifyCompany(id, status).subscribe({
      next: () => {
        this.success = `Company ${status.toLowerCase()} successfully!`;
        this.verifying = null;
        this.verifyingStatus = null;
        this.loadPendingCompanies();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error.message || 'Failed to verify company';
        this.verifying = null;
        this.verifyingStatus = null;
      }
    });
  }
}