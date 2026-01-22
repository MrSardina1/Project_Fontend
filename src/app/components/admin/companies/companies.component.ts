import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService, AdminCompany } from '../../../services/admin.service';
import { ImagePathPipe } from '../../../pipes/image-path.pipe';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-admin-companies',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ImagePathPipe],
  template: `
    <div class="page-container py-4">
      <div class="container-fluid">
        <h2 class="mb-4 fw-800">Company Management</h2>

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
                      (input)="onSearchChange()"
                      [disabled]="!filterBy"
                      [placeholder]="filterBy ? 'Search by ' + (filterBy | titlecase) + '...' : 'Select a category'">
                    @if (filterValue) {
                      <button class="btn btn-clear" (click)="filterValue = ''; loadCompanies()">
                        <i class="bi bi-x-lg"></i>
                      </button>
                    }
                  </div>
                </div>

                <!-- Dropdowns -->
                <div class="col-lg-5 col-md-12">
                  <div class="d-flex flex-wrap gap-2">
                    <div class="filter-item flex-grow-1">
                      <div class="input-group">
                        <span class="input-group-text border-0 bg-light"><i class="bi bi-circle-half text-primary small"></i></span>
                        <select class="form-select border-0 bg-light rounded-end-3" [(ngModel)]="status" (change)="loadCompanies()">
                          <option value="">Status: All</option>
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                          <option value="DELETED">Deleted</option>
                        </select>
                      </div>
                    </div>

                    <div class="filter-item flex-grow-1">
                      <div class="input-group">
                        <span class="input-group-text border-0 bg-light"><i class="bi bi-funnel text-primary small"></i></span>
                        <select class="form-select border-0 bg-light rounded-end-3" [(ngModel)]="filterBy" (change)="filterValue = ''; loadCompanies()">
                          <option value="">Filter By: None</option>
                          <option value="name">Name</option>
                          <option value="email">Email</option>
                        </select>
                      </div>
                    </div>

                    <div class="filter-item flex-grow-1">
                      <div class="input-group">
                        <span class="input-group-text border-0 bg-light"><i class="bi bi-sort-down text-primary small"></i></span>
                        <select class="form-select border-0 bg-light rounded-end-3" [(ngModel)]="sortBy" (change)="loadCompanies()">
                          <option value="">Sort: Default</option>
                          <option value="name">Name (A-Z)</option>
                          <option value="email">Email (A-Z)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="col-lg-3 col-md-12 d-flex gap-2 justify-content-lg-end">
                  @if (filterBy || sortBy || filterValue || status) {
                    <button class="btn btn-outline-secondary btn-toolbar rounded-3 px-3 d-flex align-items-center gap-2" (click)="resetFilters()" title="Reset Filters">
                      <i class="bi bi-arrow-counterclockwise"></i>
                    </button>
                  }
                  <button class="btn btn-primary rounded-3 px-4 py-2 d-flex align-items-center gap-2 flex-grow-1 flex-lg-grow-0 justify-content-center" (click)="showAddModal = true">
                    <i class="bi bi-person-plus-fill"></i>
                    <span>Add Company</span>
                  </button>
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


          <!-- Card Grid Layout -->
          @if (companies.length === 0 && !loading) {
            <div class="empty-state text-center py-5">
              <div class="empty-icon mb-4">
                <i class="bi bi-building text-muted"></i>
              </div>
              <h3 class="fw-700 mb-2">No Companies Found</h3>
              <p class="text-muted mb-4">No companies match your current filters.</p>
              <button class="btn btn-primary rounded-pill px-4 shadow-sm" (click)="resetFilters()">
                <i class="bi bi-arrow-counterclockwise me-2"></i>Clear Filters
              </button>
            </div>
          }

          <div class="row g-4 row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xxl-4">
            @for (company of companies; track company._id) {
              <div class="col">
                <div class="company-card h-100" 
                     [class.company-card-deleted]="company.deletedAt || company.user?.deletedAt"
                     [class.company-card-inactive]="company.user && !company.user.isActive && !company.deletedAt">
                  <div class="card-body p-4">
                    <!-- Company Header -->
                    <div class="company-header mb-4">
                      <div class="d-flex align-items-start gap-3">
                        <div class="avatar-ring-xl shadow-sm">
                          @if (company.profilePicture || company.user?.profilePicture) {
                            <img 
                              [src]="(company.profilePicture || company.user?.profilePicture) | imagePath" 
                              class="avatar-img-xl"
                              alt="Company Logo">
                          } @else {
                            <div class="avatar-white-content-xl">
                              {{ (company.name || 'C').charAt(0).toUpperCase() }}
                            </div>
                          }
                        </div>
                        <div class="flex-grow-1">
                          <h5 class="company-name mb-2">{{ company.name }}</h5>
                          
                          <!-- Status Badge -->
                          @if (company.deletedAt || company.user?.deletedAt) {
                            <span class="status-badge status-deleted">
                              <i class="bi bi-trash me-1"></i>Deleted
                            </span>
                          } @else if (company.status === 'PENDING') {
                            <span class="status-badge status-pending">
                              <i class="bi bi-hourglass-split me-1"></i>Pending
                            </span>
                          } @else if (company.status === 'REJECTED') {
                            <span class="status-badge status-rejected">
                              <i class="bi bi-x-circle me-1"></i>Rejected
                            </span>
                          } @else if (company.user?.isActive) {
                            <span class="status-badge status-active">
                              <i class="bi bi-check-circle me-1"></i>Active
                            </span>
                          } @else {
                            <span class="status-badge status-inactive">
                              <i class="bi bi-person-x me-1"></i>Deactivated
                            </span>
                          }
                        </div>
                      </div>
                    </div>

                    <!-- Company Info -->
                    <div class="company-info mb-4">
                      <div class="info-item mb-2">
                        <i class="bi bi-envelope text-muted me-2"></i>
                        <span class="text-muted small">{{ company.email }}</span>
                      </div>
                      @if (company.website) {
                        <div class="info-item mb-2">
                          <i class="bi bi-globe text-muted me-2"></i>
                          <a [href]="company.website" target="_blank" class="text-primary small text-decoration-none hover-underline">
                            Visit Website
                          </a>
                        </div>
                      }
                      <div class="info-item">
                        <i class="bi bi-calendar3 text-muted me-2"></i>
                        <span class="text-muted small">Joined {{ company.createdAt | date:'mediumDate' }}</span>
                      </div>
                    </div>

                    <!-- Stats -->
                    <div class="company-stats mb-4">
                      <div class="stat-item">
                        <div class="stat-value">{{ company.internshipCount || 0 }}</div>
                        <div class="stat-label">Internships</div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-value">{{ company.reviewCount || 0 }}</div>
                        <div class="stat-label">Reviews</div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-value">{{ company.applicationCount || 0 }}</div>
                        <div class="stat-label">Applications</div>
                      </div>
                    </div>

                    <!-- Actions -->
                    <div class="card-actions pt-3 border-top">
                      <div class="d-flex gap-2 mb-3">
                        @if (company.deletedAt || company.user?.deletedAt) {
                          <button class="btn btn-outline-secondary btn-sm flex-grow-1 rounded-pill" disabled>
                            <i class="bi bi-person me-1"></i>View Profile
                          </button>
                        } @else {
                          <a [routerLink]="['/profile/company', company._id]" 
                             class="btn btn-outline-primary btn-sm flex-grow-1 rounded-pill">
                            <i class="bi bi-person me-1"></i>View Profile
                          </a>
                        }
                        @if (company.status === 'PENDING') {
                          <a routerLink="/admin/pending-companies" 
                             class="btn btn-outline-info btn-sm rounded-pill"
                             title="Review Company">
                            <i class="bi bi-eye"></i>
                          </a>
                        }
                      </div>

                      <div class="d-flex gap-2 justify-content-center">
                        @if (company.deletedAt || company.user?.deletedAt) {
                          <!-- Deleted State: Only Restore -->
                          <button 
                            class="btn-action btn-restore"
                            (click)="restoreCompany(company)"
                            [disabled]="deleting === company._id"
                            title="Restore Company">
                            @if (deleting === company._id) {
                              <span class="spinner-border spinner-border-sm"></span>
                            } @else {
                              <i class="bi bi-arrow-counterclockwise"></i>
                            }
                          </button>
                        } @else if (!company.user?.isActive) {
                          <!-- Deactivated State: Activate and Delete -->
                          <button 
                            class="btn-action btn-activate"
                            (click)="toggleCompanyStatus(company)"
                            [disabled]="deleting === company._id"
                            title="Activate Company">
                            <i class="bi bi-person-check"></i>
                          </button>
                          <button 
                            class="btn-action btn-delete" 
                            (click)="deleteCompany(company._id)"
                            [disabled]="deleting === company._id"
                            title="Delete Company">
                            <i class="bi bi-trash"></i>
                          </button>
                        } @else {
                          <!-- Active State: Edit, Deactivate, Delete -->
                          <button 
                            class="btn-action btn-edit"
                            (click)="openEditModal(company)"
                            [disabled]="deleting === company._id"
                            title="Edit Company">
                            <i class="bi bi-pencil"></i>
                          </button>
                          <button 
                            class="btn-action btn-deactivate"
                            (click)="toggleCompanyStatus(company)"
                            [disabled]="deleting === company._id"
                            title="Deactivate Company">
                            <i class="bi bi-person-x"></i>
                          </button>
                          <button 
                            class="btn-action btn-delete" 
                            (click)="deleteCompany(company._id)"
                            [disabled]="deleting === company._id"
                            title="Delete Company">
                            <i class="bi bi-trash"></i>
                          </button>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
      </div> <!-- end container-fluid -->
    </div> <!-- end page-container -->

    @if (showAddModal) {
      <div class="modal-backdrop"></div>
      <div class="modal d-block" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Add New Company</h5>
              <button type="button" class="btn-close btn-close-white" (click)="showAddModal = false"></button>
            </div>
            <div class="modal-body p-4">
              <form (ngSubmit)="addCompany()">
                <div class="mb-3">
                  <label class="form-label">Username *</label>
                  <input type="text" class="form-control" [(ngModel)]="newCompany.username" name="username" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Email Address *</label>
                  <input type="email" class="form-control" [(ngModel)]="newCompany.email" name="email" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Password *</label>
                  <input type="password" class="form-control" [(ngModel)]="newCompany.password" name="password" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Company Name</label>
                  <input type="text" class="form-control" [(ngModel)]="newCompany.name" name="name">
                </div>
                <div class="mb-3">
                  <label class="form-label">Website</label>
                  <input type="url" class="form-control" [(ngModel)]="newCompany.website" name="website">
                </div>

                <div class="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" class="btn btn-outline-secondary" (click)="showAddModal = false">Cancel</button>
                  <button type="submit" class="btn btn-primary px-4">Create Company</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Edit Company Modal -->
    @if (showEditModal) {
      <div class="modal-backdrop"></div>
      <div class="modal d-block" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header bg-primary">
              <h5 class="modal-title text-white">Edit Company</h5>
              <button type="button" class="btn-close btn-close-white" (click)="showEditModal = false"></button>
            </div>
            <div class="modal-body p-4">
              <form (ngSubmit)="updateCompany()">
                <div class="mb-3">
                  <label class="form-label">Company Name *</label>
                  <input type="text" class="form-control" [(ngModel)]="editingCompany.name" name="name" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Email Address *</label>
                  <input type="email" class="form-control" [(ngModel)]="editingCompany.email" name="email" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Website</label>
                  <input type="url" class="form-control" [(ngModel)]="editingCompany.website" name="website">
                </div>

                <div class="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" class="btn btn-outline-secondary" (click)="showEditModal = false">Cancel</button>
                  <button type="submit" class="btn btn-primary px-4">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page-container { 
      width: 100%; 
      min-width: 0; 
      animation: fadeIn 0.5s ease-out; 
    }
    
    .container-fluid { 
      padding: 1.5rem; 
      max-width: 100%; 
    }

    .fw-500 { font-weight: 500; }
    .fw-600 { font-weight: 600; }
    .fw-700 { font-weight: 700; }
    .fw-800 { font-weight: 800; }

    /* Company Cards */
    .company-card {
      background: white;
      border-radius: 20px;
      border: 1px solid #f1f5f9;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      overflow: hidden;
    }

    .company-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px -12px rgba(79, 70, 229, 0.15);
      border-color: #e2e8f0;
    }

    .company-card-deleted {
      opacity: 0.6;
      background: #f8fafc;
    }

    .company-card-deleted img {
      filter: grayscale(1);
    }

    .company-card-inactive {
      opacity: 0.75;
      background: #fafafa;
    }

    .company-card-inactive img {
      filter: grayscale(0.5);
    }

    /* Company Header */
    .company-header {
      padding-bottom: 1rem;
      border-bottom: 2px solid #f8fafc;
    }

    .avatar-ring-xl {
      width: 70px;
      height: 70px;
      padding: 3px;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .avatar-img-xl {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid white;
    }

    .avatar-white-content-xl {
      width: 100%;
      height: 100%;
      background: white;
      color: #4f46e5;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.8rem;
      border: 2px solid white;
    }

    .company-name {
      font-weight: 700;
      color: #1e293b;
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
    }

    /* Status Badges */
    .status-badge {
      padding: 0.4rem 0.9rem;
      border-radius: 50px;
      font-weight: 600;
      font-size: 0.75rem;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .status-active {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.2);
    }

    .status-inactive {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .status-pending {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.2);
    }

    .status-rejected {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .status-deleted {
      background: rgba(100, 116, 139, 0.1);
      color: #64748b;
      border: 1px solid rgba(100, 116, 139, 0.2);
    }

    /* Company Info */
    .company-info {
      background: #f8fafc;
      padding: 1rem;
      border-radius: 12px;
    }

    .info-item {
      display: flex;
      align-items: center;
      font-size: 0.875rem;
    }

    /* Company Stats */
    .company-stats {
      display: flex;
      justify-content: space-around;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      padding: 1rem;
      border-radius: 12px;
    }

    .stat-item {
      text-align: center;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 800;
      color: #4f46e5;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.7rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 0.25rem;
      font-weight: 600;
    }

    /* Card Actions */
    .card-actions {
      margin-top: 1rem;
    }

    .btn-action {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      transition: all 0.2s;
      cursor: pointer;
    }

    .btn-edit {
      background: #eff6ff;
      color: #3b82f6;
    }

    .btn-edit:hover {
      background: #3b82f6;
      color: white;
      transform: scale(1.1);
    }

    .btn-deactivate {
      background: #fef3c7;
      color: #f59e0b;
    }

    .btn-deactivate:hover {
      background: #f59e0b;
      color: white;
      transform: scale(1.1);
    }

    .btn-delete {
      background: #fef2f2;
      color: #ef4444;
    }

    .btn-delete:hover {
      background: #ef4444;
      color: white;
      transform: scale(1.1);
    }

    .btn-activate {
      background: #d1fae5;
      color: #10b981;
    }

    .btn-activate:hover {
      background: #10b981;
      color: white;
      transform: scale(1.1);
    }

    .btn-restore {
      background: #dbeafe;
      color: #3b82f6;
    }

    .btn-restore:hover {
      background: #3b82f6;
      color: white;
      transform: scale(1.1);
    }

    /* Empty State */
    .empty-state {
      background: white;
      border-radius: 24px;
      padding: 4rem 2rem;
      border: 2px dashed #e2e8f0;
    }

    .empty-icon {
      font-size: 5rem;
      opacity: 0.3;
    }

    /* Filter Toolbar */
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
    
    .btn-toolbar {
      height: 48px;
      border: 1.5px solid #e2e8f0;
      color: #64748b;
      font-weight: 600;
      transition: all 0.2s;
      background: white;
    }
    
    .btn-toolbar:hover {
      background-color: #f8fafc;
      border-color: #cbd5e1;
      color: #1e293b;
    }

    .hover-underline:hover {
      text-decoration: underline !important;
    }

    /* Animations */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Modal Styles */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.5);
      backdrop-filter: blur(4px);
      z-index: 1040;
    }

    .modal {
      display: block;
      z-index: 1050;
    }

    .modal-content {
      border: none;
      border-radius: 16px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .modal-header {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: white;
      border-radius: 16px 16px 0 0;
      padding: 1.25rem 1.5rem;
    }

    .btn-close-white {
      filter: brightness(0) invert(1);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .container-fluid {
        padding: 1rem;
      }

      .company-stats {
        flex-direction: column;
        gap: 1rem;
      }
    }
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

  showAddModal = false;
  showEditModal = false;
  newCompany = {
    username: '',
    email: '',
    password: '',
    role: 'COMPANY',
    name: '',
    website: '',
    description: ''
  };

  editingCompany: any = {};

  private searchSubject = new Subject<{ value: string, filter: string }>();

  constructor(private adminService: AdminService) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged((prev, curr) => prev.value === curr.value && prev.filter === curr.filter)
    ).subscribe(() => {
      this.loadCompanies();
    });
  }

  ngOnInit() {
    this.loadCompanies();
  }

  onSearchChange() {
    this.searchSubject.next({ value: this.filterValue, filter: this.filterBy });
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

  toggleCompanyStatus(company: AdminCompany) {
    if (!company.user?._id) return;

    const action = company.user?.isActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this company user ? `)) {
      return;
    }

    this.deleting = company._id;
    this.adminService.deleteUser(company.user._id).subscribe({
      next: (res) => {
        this.success = res.message;
        this.deleting = null;
        this.loadCompanies();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = 'Failed to update company status';
        this.deleting = null;
      }
    });
  }

  addCompany() {
    if (!this.newCompany.username || !this.newCompany.email || !this.newCompany.password) {
      this.error = 'Please fill in all required fields';
      return;
    }

    this.loading = true;
    this.adminService.createUser(this.newCompany).subscribe({
      next: () => {
        this.success = 'Company created successfully';
        this.showAddModal = false;
        this.resetNewCompany();
        this.loadCompanies();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error.message || 'Failed to create company';
        this.loading = false;
      }
    });
  }

  openEditModal(company: any) {
    this.editingCompany = { ...company };
    this.showEditModal = true;
  }

  updateCompany() {
    if (!this.editingCompany._id) return;

    this.loading = true;
    const { _id, user, ...updateData } = this.editingCompany;

    this.adminService.updateCompany(_id, updateData).subscribe({
      next: () => {
        this.success = 'Company updated successfully';
        this.showEditModal = false;
        this.loadCompanies();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error.message || 'Failed to update company';
        this.loading = false;
      }
    });
  }

  resetNewCompany() {
    this.newCompany = {
      username: '',
      email: '',
      password: '',
      role: 'COMPANY',
      name: '',
      website: '',
      description: ''
    };
  }

  restoreCompany(company: any) {
    if (!confirm(`Are you sure you want to restore company "${company.name}" ? `)) {
      return;
    }

    this.deleting = company._id;
    this.adminService.restoreCompany(company._id).subscribe({
      next: () => {
        this.success = 'Company restored successfully';
        this.deleting = null;
        this.loadCompanies();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error.message || 'Failed to restore company';
        this.deleting = null;
      }
    });
  }

  resetFilters() {
    this.sortBy = '';
    this.filterBy = '';
    this.filterValue = '';
    this.status = '';
    this.loadCompanies();
  }

  deleteCompany(id: string) {
    if (!confirm('Are you sure you want to delete this company? This will move it to the archive.')) {
      return;
    }

    this.deleting = id;
    this.adminService.deleteCompany(id).subscribe({
      next: (res) => {
        this.success = res.message;
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