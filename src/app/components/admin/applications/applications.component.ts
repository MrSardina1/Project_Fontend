import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin.service';

import { ImagePathPipe } from '../../../pipes/image-path.pipe';

@Component({
  selector: 'app-admin-applications',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ImagePathPipe],
  template: `
    <div class="page-container py-4">
      <div class="container-fluid">
        <h2 class="mb-4 fw-800">All Applications</h2>
          <!-- Filters Toolbar -->
          <div class="card mb-4 shadow-sm border-0 rounded-4 overflow-hidden">
            <div class="card-body p-3">
              <div class="row g-3 align-items-center">
                <!-- Search -->
                <div class="col-lg-4 col-md-12">
                  <div class="search-box">
                    <i class="bi bi-search search-icon"></i>
                    <input 
                      type="text" 
                      class="form-control search-input" 
                      [(ngModel)]="filterValue" 
                      (input)="filterApplications()"
                      [disabled]="!filterBy"
                      [placeholder]="filterBy ? 'Search by ' + (filterBy | titlecase) + '...' : 'Select a category first'">
                    @if (filterValue) {
                      <button class="btn btn-clear" (click)="filterValue = ''; filterApplications()">
                        <i class="bi bi-x-lg"></i>
                      </button>
                    }
                  </div>
                </div>

                <!-- Dropdowns -->
                <div class="col-lg-6 col-md-12">
                  <div class="d-flex flex-wrap gap-2">
                    <div class="filter-item flex-grow-1">
                      <div class="input-group">
                        <span class="input-group-text border-0 bg-light"><i class="bi bi-funnel text-primary small"></i></span>
                        <select class="form-select border-0 bg-light rounded-end-3" [(ngModel)]="filterBy" (change)="filterValue = ''; filterApplications()">
                          <option value="">Filter By: None</option>
                          <option value="student">Student</option>
                          <option value="internship">Internship</option>
                        </select>
                      </div>
                    </div>

                    <div class="filter-item flex-grow-1">
                      <div class="input-group">
                        <span class="input-group-text border-0 bg-light"><i class="bi bi-building text-primary small"></i></span>
                        <select class="form-select border-0 bg-light rounded-end-3" [(ngModel)]="companyFilter" (change)="filterApplications()">
                          <option value="">All Companies</option>
                          @for (company of companies; track company._id) {
                            <option [value]="company._id">{{ company.name }}</option>
                          }
                        </select>
                      </div>
                    </div>

                    <div class="filter-item flex-grow-1">
                      <div class="input-group">
                        <span class="input-group-text border-0 bg-light"><i class="bi bi-circle-half text-primary small"></i></span>
                        <select class="form-select border-0 bg-light rounded-end-3" [(ngModel)]="statusFilter" (change)="filterApplications()">
                          <option value="">Status: All</option>
                          <option value="ACCEPTED">Accepted</option>
                          <option value="PENDING">Pending</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="col-lg-2 col-md-12 d-flex gap-2 justify-content-lg-end">
                  @if (statusFilter || filterValue || filterBy || companyFilter) {
                    <button class="btn btn-outline-secondary rounded-3 px-3 d-flex align-items-center gap-2" (click)="resetFilters()" title="Reset Filters">
                      <i class="bi bi-arrow-counterclockwise"></i>
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>

          @if (loading) {
            <div class="text-center py-5">
              <div class="spinner-border text-primary"></div>
            </div>
          }

          @if (error) {
            <div class="alert alert-danger rounded-4 border-0 shadow-sm d-flex align-items-center mb-4">
              <i class="bi bi-exclamation-circle-fill me-2 fs-5"></i>
              <div>{{ error }}</div>
            </div>
          }

          <div class="card">
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Internship</th>
                      <th>Company</th>
                      <th class="text-center">Status</th>
                      <th>Applied On</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (app of filteredApplications; track app._id) {
                      <tr>
                        <td class="p-0">
                          <div class="d-flex align-items-center gap-3 p-3 h-100">
                             <div class="avatar-ring shadow-sm">
                               @if (app.student?.profilePicture) {
                                 <img 
                                   [src]="app.student.profilePicture | imagePath" 
                                   class="avatar-img"
                                   alt="Profile">
                               } @else {
                                 <div class="avatar-white-content">
                                   {{ (app.student?.username || 'S').charAt(0).toUpperCase() }}
                                 </div>
                               }
                             </div>
                             <div class="d-flex flex-column">
                               <span class="user-name fw-600 text-dark">{{ app.student.username }}</span>
                               <span class="small text-muted">{{ app.student.email }}</span>
                               <a [routerLink]="['/profile/user', app.student._id]" class="text-primary small text-decoration-none fw-500 hover-underline mt-1">
                                 <i class="bi bi-person me-1"></i>View Profile
                               </a>
                             </div>
                          </div>
                        </td>
                        <td class="fw-500">{{ app.internship.title }}</td>
                        <td class="p-0">
                          <div class="d-flex align-items-center gap-3 p-3 h-100">
                             <div class="avatar-ring shadow-sm">
                               @if (app.internship.company?.profilePicture || app.internship.company?.user?.profilePicture) {
                                 <img 
                                   [src]="(app.internship.company?.profilePicture || app.internship.company?.user?.profilePicture) | imagePath" 
                                   class="avatar-img"
                                   alt="Profile">
                               } @else {
                                 <div class="avatar-white-content">
                                   {{ (app.internship.company?.name || 'C').charAt(0).toUpperCase() }}
                                 </div>
                               }
                             </div>
                             <div class="d-flex flex-column">
                               <span class="fw-600 text-dark">{{ app.internship.company.name }}</span>
                               <a [routerLink]="['/profile/company', app.internship.company._id]" class="text-primary small text-decoration-none fw-500 hover-underline text-start">
                                 <i class="bi bi-person me-1"></i>View Profile
                               </a>
                             </div>
                          </div>
                        </td>
                        <td>
                          <div class="d-flex justify-content-center">
                            <span class="badge" [class]="getStatusClass(app.status)">
                              {{ getStatusLabel(app.status) }}
                            </span>
                          </div>
                        </td>
                        <td class="small text-muted">{{ app.createdAt | date:'mediumDate' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              @if (filteredApplications.length === 0 && !loading) {
                <div class="alert alert-info rounded-4 border-0 mt-3 d-flex align-items-center">
                  <i class="bi bi-info-circle-fill me-2"></i>
                  No applications found matching your criteria.
                </div>
              }
            </div>
          </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { width: 100%; min-width: 0; animation: fadeIn 0.5s ease-out; }
    .container-fluid { padding: 1.5rem; max-width: 100%; }
    .table-responsive { width: 100%; overflow-x: auto; }
    .table { min-width: 900px; margin-bottom: 0; }
    
    .fw-500 { font-weight: 500; }
    .fw-600 { font-weight: 600; }
    .fw-800 { font-weight: 800; }
    .card { border: none; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); width: 100%; }
    .card-body { padding: 1.25rem; }

    .table thead th {
      border-top: none;
      background: #f8fafc;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      padding: 1rem;
    }

    .table tbody td {
      padding: 1rem;
      border-bottom: 1px solid #f1f5f9;
    }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;
    }
    .search-icon {
      position: absolute;
      left: 1rem;
      color: #64748b;
      z-index: 10;
    }
    .search-input {
      padding-left: 2.75rem;
      padding-right: 2.75rem;
      background-color: #f8fafc;
      border: 1.5px solid transparent;
      border-radius: 12px;
      height: 48px;
      transition: all 0.2s;
    }
    .search-input:focus {
      background-color: white !important;
      border-color: #4f46e5 !important;
      box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1) !important;
    }
    .btn-clear {
      position: absolute;
      right: 0.5rem;
      padding: 0.25rem 0.5rem;
      color: #94a3b8;
      border: none;
      background: none;
      z-index: 10;
    }
    .btn-clear:hover { color: #475569; }

    .filter-item .input-group-text {
      background-color: #f8fafc;
      color: #64748b;
      padding-right: 0;
      border-radius: 12px 0 0 12px;
    }
    .filter-item .form-select {
      height: 48px !important;
      background-color: #f8fafc;
      border-radius: 0 12px 12px 0;
      font-weight: 500;
      color: #1e293b;
      cursor: pointer;
      border: none !important;
    }
    
    .btn-outline-secondary {
      height: 48px;
      border: 1.5px solid #e2e8f0;
      color: #64748b;
      font-weight: 600;
      transition: all 0.2s;
      background: white;
      border-radius: 12px;
    }
    .btn-outline-secondary:hover {
      background-color: #f8fafc;
      border-color: #cbd5e1;
      color: #1e293b;
    }

    .badge {
      padding: 0.45rem 1rem;
      border-radius: 50px;
      font-weight: 600;
      font-size: 0.8rem;
      letter-spacing: 0.01em;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      border: 1px solid transparent;
    }

    .bg-success-light { background-color: rgba(16, 185, 129, 0.1); color: #10b981; border-color: rgba(16, 185, 129, 0.2); }
    .bg-danger-light { background-color: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.2); }
    .bg-warning-light { background-color: rgba(245, 158, 11, 0.1); color: #f59e0b; border-color: rgba(245, 158, 11, 0.2); }

    .avatar-ring {
      width: 45px;
      height: 45px;
      border-radius: 50%;
      padding: 2px;
      background: #fff;
      border: 2px solid #6366f1;
      overflow: hidden;
      flex-shrink: 0;
    }
    
    .avatar-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }
    
    .avatar-white-content {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #f8f9fa;
      color: #6c757d;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1.2rem;
    }
    
    .hover-underline:hover {
      text-decoration: underline !important;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class AdminApplicationsComponent implements OnInit {
  applications: any[] = [];
  filteredApplications: any[] = [];
  companies: any[] = [];
  loading = false;
  error = '';

  filterValue = '';
  statusFilter = '';
  companyFilter = '';
  filterBy = '';

  constructor(private adminService: AdminService) { }

  ngOnInit() {
    this.loadApplications();
    this.loadCompanies();
  }

  loadCompanies() {
    this.adminService.getActiveCompanies().subscribe({
      next: (data) => this.companies = data,
      error: () => console.error('Failed to load companies')
    });
  }

  loadApplications() {
    this.loading = true;
    this.adminService.getAllApplications().subscribe({
      next: (data) => {
        this.applications = data;
        this.filterApplications();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load applications';
        this.loading = false;
      }
    });
  }

  filterApplications() {
    this.filteredApplications = this.applications.filter(app => {
      const searchTerm = this.filterValue.toLowerCase();
      let matchesSearch = true;

      if (this.filterValue) {
        if (!this.filterBy) {
          matchesSearch = app.student?.username?.toLowerCase().includes(searchTerm) ||
            app.student?.email?.toLowerCase().includes(searchTerm) ||
            app.internship?.title?.toLowerCase().includes(searchTerm);
        } else if (this.filterBy === 'student') {
          matchesSearch = app.student?.username?.toLowerCase().includes(searchTerm) ||
            app.student?.email?.toLowerCase().includes(searchTerm);
        } else if (this.filterBy === 'internship') {
          matchesSearch = app.internship?.title?.toLowerCase().includes(searchTerm);
        }
      }

      const matchesStatus = !this.statusFilter || app.status === this.statusFilter;
      const matchesCompany = !this.companyFilter || app.internship?.company?._id === this.companyFilter;

      return matchesSearch && matchesStatus && matchesCompany;
    });
  }

  resetFilters() {
    this.filterValue = '';
    this.statusFilter = '';
    this.companyFilter = '';
    this.filterBy = '';
    this.filterApplications();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'bg-warning-light';
      case 'ACCEPTED': return 'bg-success-light';
      case 'REJECTED': return 'bg-danger-light';
      default: return 'bg-secondary';
    }
  }

  getStatusLabel(status: string): string {
    return status.charAt(0) + status.slice(1).toLowerCase();
  }
}