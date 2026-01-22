import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

import { ImagePathPipe } from '../../../pipes/image-path.pipe';

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ImagePathPipe],
  template: `
    <div class="page-container py-4">
      <div class="container-fluid">
        <h2 class="mb-4 fw-800">Review Management</h2>

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
                    [(ngModel)]="filters.reviewer" 
                    (ngModelChange)="onSearchChange()"
                    [disabled]="filterBy !== 'reviewer'"
                    [placeholder]="filterBy === 'reviewer' ? 'Search by Reviewer Username...' : 'Select Reviewer filter first'">
                  @if (filters.reviewer) {
                    <button class="btn btn-clear" (click)="resetSearch()">
                       <i class="bi bi-x-circle-fill"></i>
                    </button>
                  }
                </div>
              </div>

              <!-- Dropdowns -->
              <div class="col-lg-6 col-md-12">
                <div class="d-flex flex-wrap gap-2">
                  <!-- Filter Category -->
                  <div class="filter-item flex-grow-1">
                    <div class="input-group">
                      <span class="input-group-text border-0 bg-light"><i class="bi bi-funnel text-primary small"></i></span>
                      <select class="form-select border-0 bg-light rounded-end-3" [(ngModel)]="filterBy" (change)="onFilterTypeChange()">
                        <option value="">No Filter</option>
                        <option value="reviewer">Reviewer</option>
                      </select>
                    </div>
                  </div>

                  <!-- Company Filter -->
                  <div class="filter-item flex-grow-1">
                    <div class="input-group">
                      <span class="input-group-text border-0 bg-light"><i class="bi bi-building text-primary small"></i></span>
                      <select class="form-select border-0 bg-light rounded-end-3" [(ngModel)]="filters.company" (change)="onFilterChange()">
                        <option value="">All Companies</option>
                        @for (company of companies; track company._id) {
                          <option [value]="company._id">
                            {{ company.name }} ({{ company.reviewCount }})
                          </option>
                        }
                      </select>
                    </div>
                  </div>

                  <!-- Sort Filter -->
                  <div class="filter-item flex-grow-1">
                    <div class="input-group">
                      <span class="input-group-text border-0 bg-light"><i class="bi bi-sort-down text-primary small"></i></span>
                      <select class="form-select border-0 bg-light rounded-end-3" [(ngModel)]="sortBy" (change)="applySort()">
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="highest">Highest Rated</option>
                        <option value="lowest">Lowest Rated</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Reset Actions -->
              <div class="col-lg-2 col-md-12 d-flex gap-2 justify-content-lg-end">
                @if (hasActiveFilters()) {
                  <button class="btn btn-outline-secondary rounded-3 px-3 d-flex align-items-center gap-2" 
                          (click)="resetFilters()" 
                          title="Reset Filters">
                    <i class="bi bi-arrow-counterclockwise"></i>
                    <span>Reset</span>
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

        @if (success) {
          <div class="alert alert-success rounded-4 border-0 shadow-sm d-flex align-items-center mb-4">
            <i class="bi bi-check-circle-fill me-2 fs-5"></i>
            <div>{{ success }}</div>
          </div>
        }

        <div class="card">
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Reviewer</th>
                    <th>Rating</th>
                    <th style="width: 30%">Comment</th>
                    <th>Date</th>
                    <th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (review of filteredReviews; track review._id) {
                    <tr>
                      <td class="p-0">
                        <div class="d-flex align-items-center gap-3 p-3 h-100">
                          <div class="avatar-ring shadow-sm">
                            @if (review.company?.profilePicture || review.company?.user?.profilePicture) {
                              <img 
                                [src]="(review.company?.profilePicture || review.company?.user?.profilePicture) | imagePath" 
                                class="avatar-img"
                                alt="Profile">
                            } @else {
                              <div class="avatar-white-content">
                                {{ (review.company?.name || 'C').charAt(0).toUpperCase() }}
                              </div>
                            }
                          </div>
                          <div class="d-flex flex-column">
                            <span class="fw-bold text-dark">{{ review.company?.name || 'Deleted Company' }}</span>
                            @if (review.company) {
                              <a [routerLink]="['/profile/company', review.company._id]" 
                                 class="text-primary small text-decoration-none fw-500 hover-underline">
                                 <i class="bi bi-person me-1"></i>View Profile
                              </a>
                            }
                          </div>
                        </div>
                      </td>
                      <td class="p-0">
                        <div class="d-flex align-items-center gap-3 p-3 h-100">
                          <div class="avatar-ring shadow-sm">
                            @if (review.user?.profilePicture) {
                              <img 
                                [src]="review.user.profilePicture | imagePath" 
                                class="avatar-img"
                                alt="Profile">
                            } @else {
                              <div class="avatar-white-content">
                                {{ (review.user?.username || 'U').charAt(0).toUpperCase() }}
                              </div>
                            }
                          </div>
                          <div class="d-flex flex-column">
                            <span class="fw-bold text-dark">{{ review.user?.username || 'Deleted User' }}</span>
                            <span class="small text-muted">{{ review.user?.email }}</span>
                            @if (review.user) {
                              <a [routerLink]="['/profile/user', review.user._id]" 
                                 class="text-primary small text-decoration-none fw-500 hover-underline mt-1">
                                 <i class="bi bi-person me-1"></i>View Profile
                              </a>
                            }
                          </div>
                        </div>
                      </td>
                      <td>
                        <div class="text-warning d-flex gap-1">
                          @for (star of [1,2,3,4,5]; track star) {
                            <i class="bi" [class.bi-star-fill]="star <= review.rating" [class.bi-star]="star > review.rating"></i>
                          }
                        </div>
                      </td>
                      <td>
                        <div class="small text-muted text-truncate-2">
                          {{ review.comment || 'No comment provided' }}
                        </div>
                      </td>
                      <td class="small text-muted">{{ review.createdAt | date:'mediumDate' }}</td>
                      <td class="text-end">
                        <button 
                          class="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 mx-auto me-0" 
                          (click)="deleteReview(review._id)"
                          [disabled]="deleting === review._id">
                          @if (deleting === review._id) {
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

            @if (filteredReviews.length === 0 && !loading) {
              <div class="alert alert-info rounded-4 border-0 mt-3 d-flex align-items-center">
                <i class="bi bi-info-circle-fill me-2"></i>
                No reviews found matching your filters.
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
    .card { border: none; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); width: 100%; }
    .card-body { padding: 1.25rem; }

    /* Filter Toolbar Logic */
    .search-box { position: relative; }
    .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }
    .search-input { padding-left: 2.5rem; border-radius: 8px; border: 1px solid #e2e8f0; padding-top: 0.6rem; padding-bottom: 0.6rem;}
    .search-input:focus { box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); border-color: #3b82f6; }
    
    .input-group-text { color: #64748b; background-color: #f8fafc !important; }
    .form-select.bg-light { background-color: #f8fafc !important; color: #334155; cursor: pointer; }
    .form-select:focus { box-shadow: none; border-color: #e2e8f0; }

    .btn-clear {
      position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
      background: none; border: none; color: #94a3b8; padding: 0;
    }

    .text-truncate-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .table thead th {
      border-top: none; background: #f8fafc; font-size: 0.85rem;
      text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; padding: 1rem;
    }

    .table tbody td { padding: 1rem; border-bottom: 1px solid #f1f5f9; }

    .btn-sm {
      padding: 0.45rem 1rem; border-radius: 50px; font-weight: 600;
      display: inline-flex; align-items: center; gap: 0.25rem;
    }

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
export class AdminReviewsComponent implements OnInit {
  reviews: any[] = [];
  filteredReviews: any[] = [];
  companies: any[] = [];
  loading = false;
  error = '';
  success = '';
  deleting: string | null = null;

  // Filter States
  filterBy: string = ''; // 'reviewer' or ''
  sortBy: string = 'newest';

  filters = {
    company: '',
    reviewer: ''
  };

  private searchTimeout: any;

  constructor(private adminService: AdminService) { }

  ngOnInit() {
    this.loadCompanies();
    this.loadReviews();
  }

  loadCompanies() {
    this.adminService.getCompaniesWithReviewCounts().subscribe({
      next: (data) => this.companies = data,
      error: () => console.error('Failed to load company stats')
    });
  }

  loadReviews() {
    this.loading = true;
    // Backend search still happens via API for reviewer/company
    this.adminService.getAllReviews(this.filters.company, this.filters.reviewer).subscribe({
      next: (data) => {
        this.reviews = data;
        this.applySort(); // Sort client-side
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load reviews';
        this.loading = false;
      }
    });
  }

  onSearchChange() {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.loadReviews();
    }, 400);
  }

  onFilterTypeChange() {
    if (this.filterBy === '') {
      this.filters.reviewer = '';
      this.loadReviews();
    }
    // If switched to 'reviewer', focus input? (Optional)
  }

  onFilterChange() {
    this.loadReviews();
  }

  applySort() {
    let sorted = [...this.reviews];
    switch (this.sortBy) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'highest':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        sorted.sort((a, b) => a.rating - b.rating);
        break;
    }
    this.filteredReviews = sorted;
  }

  resetSearch() {
    this.filters.reviewer = '';
    this.loadReviews();
  }

  resetFilters() {
    this.filterBy = '';
    this.sortBy = 'newest';
    this.filters = { company: '', reviewer: '' };
    this.loadReviews();
  }

  hasActiveFilters(): boolean {
    return !!this.filters.company || !!this.filters.reviewer || this.sortBy !== 'newest' || !!this.filterBy;
  }

  deleteReview(id: string) {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    this.deleting = id;
    this.adminService.deleteReview(id).subscribe({
      next: () => {
        this.success = 'Review deleted successfully';
        this.deleting = null;
        this.loadReviews(); // Refresh
        this.loadCompanies(); // Reload counts
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error.message || 'Failed to delete review';
        this.deleting = null;
      }
    });
  }
}