import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService, AdminCompany } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-companies',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-container py-4">
      <div class="container-fluid">
        <h2 class="mb-4 fw-800">Company Management</h2>

          <!-- Filters -->
          <div class="card mb-4">
            <div class="card-body">
              <div class="row">
                <div class="col-md-3">
                  <label class="form-label">Status</label>
                  <select class="form-select" [(ngModel)]="status" (change)="loadCompanies()">
                    <option value="">All Companies</option>
                    <option value="APPROVED">Approved</option>
                    <option value="PENDING">Pending</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Sort By</label>
                  <select class="form-select" [(ngModel)]="sortBy" (change)="loadCompanies()">
                    <option value="">Default</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="email">Email (A-Z)</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Filter By</label>
                  <select class="form-select" [(ngModel)]="filterBy" (change)="filterValue = ''; loadCompanies()">
                    <option value="">No Filter</option>
                    <option value="name">Name</option>
                    <option value="email">Email</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Search</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    [(ngModel)]="filterValue" 
                    (input)="loadCompanies()"
                    [disabled]="!filterBy"
                    placeholder="Search...">
                </div>
              </div>
            </div>
          </div>

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

          <div class="card">
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Company Name</th>
                      <th>Email</th>
                      <th>Website</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (company of companies; track company._id) {
                      <tr>
                        <td>{{ company.name }}</td>
                        <td>{{ company.email }}</td>
                        <td>
                          @if (company.website) {
                            <a [href]="company.website" target="_blank">Link</a>
                          } @else {
                            <span class="text-muted">-</span>
                          }
                        </td>
                        <td>
                          <span class="badge" [class]="getStatusBadgeClass(company.status)">
                            {{ company.status }}
                          </span>
                        </td>
                        <td>{{ company.createdAt | date:'short' }}</td>
                        <td>
                          <button 
                            class="btn btn-sm btn-danger" 
                            (click)="deleteCompany(company._id)"
                            [disabled]="deleting === company._id">
                            @if (deleting === company._id) {
                              <span class="spinner-border spinner-border-sm"></span>
                            } @else {
                              Delete
                            }
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              @if (companies.length === 0 && !loading) {
                <div class="alert alert-info">
                  No companies found.
                </div>
              }
            </div>
          </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { width: 100%; }
    .fw-800 { font-weight: 800; }
    .card { border: 1px solid var(--border); border-radius: 12px; }
  `]
})
export class AdminCompaniesComponent implements OnInit {
  companies: AdminCompany[] = [];
  loading = false;
  error = '';
  success = '';
  status = '';
  sortBy = '';
  filterBy = '';
  filterValue = '';
  deleting: string | null = null;

  constructor(private adminService: AdminService) { }

  ngOnInit() {
    this.loadCompanies();
  }

  loadCompanies() {
    this.loading = true;
    this.adminService.getAllCompanies(this.sortBy, this.filterBy, this.filterValue, this.status).subscribe({
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

  deleteCompany(id: string) {
    if (!confirm('Are you sure you want to delete this company?')) {
      return;
    }

    this.deleting = id;
    this.adminService.deleteCompany(id).subscribe({
      next: () => {
        this.success = 'Company deleted successfully';
        this.deleting = null;
        this.loadCompanies();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error.message || 'Failed to delete company';
        this.deleting = null;
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'bg-success';
      case 'PENDING':
        return 'bg-warning';
      case 'REJECTED':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }
}