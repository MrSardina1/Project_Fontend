import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService, AdminCompany } from '../../../services/admin.service';

@Component({
  selector: 'app-pending-companies',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-container py-4">
      <div class="container-fluid">
        <h2 class="mb-4 fw-800">Pending Company Verifications</h2>

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
  `,
  styles: [`
    .page-container { width: 100%; }
    .fw-800 { font-weight: 800; }
    .card { border: 1px solid var(--border); border-radius: 12px; }
  `]
})
export class PendingCompaniesComponent implements OnInit {
  companies: AdminCompany[] = [];
  loading = false;
  error = '';
  success = '';
  verifying: string | null = null;
  verifyingStatus: 'APPROVED' | 'REJECTED' | null = null;

  constructor(private adminService: AdminService) { }

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