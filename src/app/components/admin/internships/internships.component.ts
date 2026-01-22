import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService, AdminInternship, CompanyStats } from '../../../services/admin.service';
import { ImagePathPipe } from '../../../pipes/image-path.pipe';

@Component({
  selector: 'app-admin-internships',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ImagePathPipe],
  template: `
    <div class="page-container py-4">
      <div class="container-fluid">
        <h2 class="mb-4 fw-800">Internship Management</h2>

        <!--Filters Toolbar-->
        <div class="card mb-4 shadow-sm border-0 rounded-4 overflow-hidden">
          <div class="card-body p-3">
            <div class="row g-3 align-items-center">
              <!--Search -->
              <div class="col-lg-4 col-md-12">
                <div class="search-box">
                  <i class="bi bi-search search-icon"></i>
                  <input
                    type="text"
                    class="form-control search-input"
                    [(ngModel)]="filterValue"
                    (input)="loadInternships()"
                    [disabled]="!filterBy"
                    [placeholder]="filterBy ? 'Search by ' + (filterBy | titlecase) + '...' : 'Select a filter category first'">
                  @if (filterValue) {
                    <button class="btn btn-clear" (click)="filterValue = ''; loadInternships()">
                      <i class="bi bi-x-lg"></i>
                    </button>
                  }
                </div>
              </div>

              <!--Sort & Filter Dropdowns-->
              <div class="col-lg-8 col-md-12">
                <div class="d-flex flex-wrap gap-2 justify-content-lg-end">
                  <div class="filter-item flex-grow-1 flex-lg-grow-0">
                    <div class="input-group">
                      <span class="input-group-text border-0 bg-light"><i class="bi bi-funnel text-primary small"></i></span>
                      <select class="form-select border-0 bg-light rounded-end-3" [(ngModel)]="filterBy" (change)="filterValue = ''; loadInternships()">
                        <option value="">No Filter</option>
                        <option value="title">Title</option>
                        <option value="location">Location</option>
                      </select>
                    </div>
                  </div>

                  <div class="filter-item flex-grow-1 flex-lg-grow-0">
                    <div class="input-group">
                      <span class="input-group-text border-0 bg-light"><i class="bi bi-building text-primary small"></i></span>
                      <select class="form-select border-0 bg-light rounded-end-3" [(ngModel)]="companyFilter" (change)="loadInternships()">
                        <option value="">All Companies</option>
                        @for (company of companiesStats; track company._id) {
                          <option [value]="company._id">
                            {{ company.name }} ({{ company.internshipCount }})
                          </option>
                        }
                      </select>
                    </div>
                  </div>

                  <div class="filter-item flex-grow-1 flex-lg-grow-0">
                    <div class="input-group">
                      <span class="input-group-text border-0 bg-light"><i class="bi bi-sort-down text-primary small"></i></span>
                      <select class="form-select border-0 bg-light rounded-end-3" [(ngModel)]="sortBy" (change)="loadInternships()">
                        <option value="">Newest First</option>
                        <option value="title">Title (A-Z)</option>
                        <option value="location">Location (A-Z)</option>
                      </select>
                    </div>
                  </div>

                  @if (filterBy || sortBy || filterValue || companyFilter) {
                    <button class="btn btn-outline-secondary rounded-3 d-flex align-items-center gap-2 px-3" (click)="resetFilters()" title="Reset Filters">
                      <i class="bi bi-arrow-counterclockwise"></i>
                      <span>Reset</span>
                    </button>
                  }
                </div>
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

        @if (success) {
          <div class="alert alert-success rounded-4 border-0 shadow-sm d-flex align-items-center mb-4">
            <i class="bi bi-check-circle-fill me-2 fs-5"></i>
            <div>{{ success }}</div>
          </div>
        }

        <div class="card border-0 shadow-sm rounded-4">
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th class="ps-4">Title</th>
                    <th>Company</th>
                    <th>Location</th>
                    <th class="text-center">Duration</th>
                    <th>Posted</th>
                    <th class="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (internship of internships; track internship._id) {
                    <tr>
                      <td class="ps-4"><span class="fw-600 text-dark">{{ internship.title }}</span></td>
                      <td class="p-0">
                        <div class="d-flex align-items-center gap-3 p-3 h-100">
                           <div class="avatar-ring shadow-sm">
                             @if (internship.company?.profilePicture || internship.company?.user?.profilePicture) {
                               <img 
                                 [src]="(internship.company?.profilePicture || internship.company?.user?.profilePicture) | imagePath" 
                                 class="avatar-img"
                                 alt="Profile">
                             } @else {
                               <div class="avatar-white-content">
                                 {{ (internship.company?.name || 'C').charAt(0).toUpperCase() }}
                               </div>
                             }
                           </div>
                           <div class="d-flex flex-column">
                             <span class="fw-bold text-dark">{{ internship.company?.name }}</span>
                             <a [routerLink]="['/profile/company', internship.company?._id]" 
                                class="text-primary small text-decoration-none fw-500 hover-underline">
                                <i class="bi bi-person me-1"></i>View Profile
                             </a>
                           </div>
                        </div>
                      </td>
                      <td><span class="text-muted"><i class="bi bi-geo-alt me-1"></i>{{ internship.location }}</span></td>
                      <td class="text-center">
                        <span class="badge bg-light text-dark border-0 px-3">{{ internship.duration }}</span>
                      </td>
                      <td class="small text-muted">{{ internship.createdAt | date:'mediumDate' }}</td>
                      <td class="text-end pe-4">
                        <button 
                          class="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 ms-auto"
                          (click)="deleteInternship(internship._id)"
                          [disabled]="deleting === internship._id">
                          @if (deleting === internship._id) {
                            <span class="spinner-border spinner-border-sm"></span>
                          } @else {
                            <i class="bi bi-trash"></i> Delete
                          }
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            @if (internships.length === 0 && !loading) {
              <div class="p-5 text-center">
                <div class="text-muted mb-3"><i class="bi bi-briefcase fs-1"></i></div>
                <h5 class="text-muted">No internships found.</h5>
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
    .table { min-width: 1000px; margin-bottom: 0; }
    
    .fw-500 { font-weight: 500; }
    .fw-600 { font-weight: 600; }
    .fw-800 { font-weight: 800; }
    
    .card { border: none; border-radius: 16px; width: 100%; }
    
    .table thead th {
      border-top: none;
      background: #f8fafc;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      padding: 1.25rem 1rem;
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
      font-size: 1.1rem;
    }
    .search-input {
      padding-left: 2.8rem;
      padding-right: 2.75rem;
      background-color: #f8fafc;
      border: 1.5px solid transparent;
      border-radius: 12px;
      height: 48px;
      transition: all 0.2s;
    }
    .search-input:focus {
      background-color: white;
      border-color: #4f46e5;
      box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
    }
    .btn-clear {
      position: absolute;
      right: 0.5rem;
      padding: 0.25rem 0.5rem;
      color: #94a3b8;
      border: none;
      background: none;
    }
    .btn-clear:hover { color: #475569; }

    .filter-item {
      min-width: 200px;
    }

    .filter-item .input-group-text {
      background-color: #f8fafc;
      color: #64748b;
      padding-right: 0;
      border-radius: 12px 0 0 12px;
      height: 48px;
    }
    .filter-item .form-select {
      height: 48px;
      background-color: #f8fafc;
      border-radius: 0 12px 12px 0;
      font-weight: 500;
      color: #1e293b;
      cursor: pointer;
      transition: all 0.2s;
    }
    .filter-item .form-select:focus {
      border-color: #4f46e5;
      box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
    }
    
    .btn-outline-secondary {
      height: 48px;
      border: 1.5px solid #e2e8f0;
      color: #64748b;
      font-weight: 600;
      transition: all 0.2s;
    }
    .btn-outline-secondary:hover {
      background-color: #f8fafc;
      border-color: #cbd5e1;
      color: #1e293b;
    }

    .table tbody td {
      padding: 1.25rem 1rem;
      border-bottom: 1px solid #f1f5f9;
    }

    .btn-sm {
      padding: 0.45rem 1rem;
      border-radius: 50px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .badge {
      padding: 0.5rem 1rem;
      border-radius: 50px;
      font-weight: 600;
      font-size: 0.75rem;
    }

    .bg-light { background-color: #f8fafc!important; }

    .avatar-ring {
      width: 45px;
      height: 45px;
      border-radius: 50%;
      padding: 2px;
      background: #fff;
      border: 2px solid #6366f1; /* Indigo border for that checked look */
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
export class AdminInternshipsComponent implements OnInit {
  internships: AdminInternship[] = [];
  companiesStats: CompanyStats[] = [];
  loading = true;
  error = '';
  success = '';

  // Filters
  filterBy = '';
  filterValue = '';
  companyFilter = '';
  sortBy = '';

  deleting: string | null = null;

  constructor(private adminService: AdminService) { }

  ngOnInit() {
    this.loadInternships();
  }

  loadInternships() {
    this.loading = true;
    this.adminService.getAllInternships(
      this.sortBy || undefined,
      this.filterBy || undefined,
      this.filterValue || undefined,
      this.companyFilter || undefined
    ).subscribe({
      next: (data) => {
        this.internships = data;
        this.loading = false;
        if (!this.companiesStats.length) {
          this.loadCompaniesStats();
        }
      },
      error: (err) => {
        console.error('Error loading internships:', err);
        this.error = 'Failed to load internships';
        this.loading = false;
      }
    });
  }

  loadCompaniesStats() {
    this.adminService.getCompaniesWithStats().subscribe({
      next: (stats: any) => this.companiesStats = stats,
      error: (err: any) => console.error('Error loading stats:', err)
    });
  }

  resetFilters() {
    this.filterBy = '';
    this.filterValue = '';
    this.companyFilter = '';
    this.sortBy = '';
    this.loadInternships();
  }

  deleteInternship(id: string) {
    if (!confirm('Are you sure you want to delete this internship?')) return;

    this.deleting = id;
    this.adminService.deleteInternship(id).subscribe({
      next: () => {
        this.success = 'Internship deleted successfully';
        this.deleting = null;
        this.loadInternships();
        this.loadCompaniesStats(); // Refresh stats
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to delete internship';
        this.deleting = null;
      }
    });
  }
}