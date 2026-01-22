import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InternshipService, Internship } from '../../services/internship.service';
import { ApplicationService } from '../../services/application.service';
import { AuthService } from '../../services/auth.service';
import { ImagePathPipe } from '../../pipes/image-path.pipe';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-internships',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ImagePathPipe],
  template: `
    <div class="page-container py-4">
      <div class="container-fluid">
        <header class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="fw-800 text-gradient mb-1">Available Internships</h2>
            <p class="text-muted mb-0">Find your next big opportunity today</p>
          </div>
          @if ((currentUser$ | async)?.role === 'COMPANY') {
            <a routerLink="/create-internship" class="btn btn-primary rounded-pill px-4 shadow-sm fw-600">
              <i class="bi bi-plus-lg me-2"></i>Post Internship
            </a>
          }
        </header>

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
                    (input)="applySortAndFilter()"
                    [disabled]="!filterBy"
                    [placeholder]="filterBy ? 'Search by ' + (filterBy | titlecase) + '...' : 'Select a category first'">
                  @if (filterValue) {
                    <button class="btn btn-clear" (click)="filterValue = ''; applySortAndFilter()">
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
                      <select class="form-select border-0 bg-light rounded-end-3" [(ngModel)]="filterBy" (change)="filterValue = ''; applySortAndFilter()">
                        <option value="">Filter By: None</option>
                        <option value="title">Internship Title</option>
                        <option value="location">Location</option>
                        <option value="company">Company Name</option>
                      </select>
                    </div>
                  </div>

                  <div class="filter-item flex-grow-1">
                    <div class="input-group">
                      <span class="input-group-text border-0 bg-light"><i class="bi bi-sort-down text-primary small"></i></span>
                      <select class="form-select border-0 bg-light rounded-end-3" [(ngModel)]="sortBy" (change)="applySortAndFilter()">
                        <option value="">Sort By: Newest</option>
                        <option value="title">Title (A-Z)</option>
                        <option value="location">Location (A-Z)</option>
                        <option value="company">Company (A-Z)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="col-lg-2 col-md-12 d-flex gap-2 justify-content-lg-end">
                @if (filterBy || sortBy || filterValue) {
                  <button class="btn btn-outline-secondary btn-toolbar rounded-3 px-3 d-flex align-items-center gap-2" (click)="resetFilters()" title="Reset Filters">
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

        <!-- Card Grid Layout -->
        @if (filteredInternships.length === 0 && !loading) {
          <div class="empty-state text-center py-5">
            <div class="empty-icon mb-4">
              <i class="bi bi-briefcase text-muted"></i>
            </div>
            <h3 class="fw-700 mb-2">No Internships Found</h3>
            <p class="text-muted mb-4">Try adjusting your filters or search term.</p>
            <button class="btn btn-primary rounded-pill px-4 shadow-sm" (click)="resetFilters()">
              <i class="bi bi-arrow-counterclockwise me-2"></i>Clear Filters
            </button>
          </div>
        }

        <div class="row g-4 row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xxl-4">
          @for (internship of filteredInternships; track internship._id) {
            <div class="col">
              <div class="internship-card h-100">
                <div class="card-body p-4">
                  <!-- Header: Company Info -->
                  <div class="card-header-custom mb-3">
                    <div class="d-flex align-items-start gap-3">
                      <div class="avatar-ring-xl shadow-sm">
                        @if (internship.company.profilePicture) {
                          <img 
                            [src]="internship.company.profilePicture | imagePath" 
                            class="avatar-img-xl"
                            alt="Company Logo">
                        } @else {
                          <div class="avatar-white-content-xl">
                            {{ (internship.company.name || 'C').charAt(0).toUpperCase() }}
                          </div>
                        }
                      </div>
                      <div class="flex-grow-1">
                        <h5 class="company-name mb-1">{{ internship.company.name }}</h5>
                        <div class="text-muted small mb-2">
                           Posted {{ internship.createdAt | date:'mediumDate' }}
                        </div>
                        @if ((internship.applicationCount || 0) > 5) {
                          <span class="status-badge status-trending">
                            <i class="bi bi-fire me-1"></i>Trending
                          </span>
                        }
                      </div>
                    </div>
                  </div>

                  <!-- Title -->
                  <h4 class="internship-title mb-3">{{ internship.title }}</h4>

                  <!-- Info Box -->
                  <div class="info-box mb-4">
                    <div class="info-item mb-2">
                      <i class="bi bi-geo-alt icon-location me-2"></i>
                      <span class="text-muted small">{{ internship.location }}</span>
                    </div>
                    <div class="info-item mb-2">
                      <i class="bi bi-clock icon-duration me-2"></i>
                      <span class="text-muted small">{{ internship.duration }}</span>
                    </div>
                    <div class="info-item">
                      <i class="bi bi-people icon-applicants me-2"></i>
                      <span class="text-muted small">{{ internship.applicationCount || 0 }} Applicants</span>
                    </div>
                  </div>

                  <!-- Description -->
                  <p class="description-text mb-4 text-muted small">
                    {{ internship.description }}
                  </p>

                  <!-- Actions -->
                  <div class="card-actions pt-3 border-top mt-auto">
                    <div class="d-flex flex-column gap-2">
                      <!-- Apply Button -->
                      @if ((currentUser$ | async)?.role === 'STUDENT') {
                        <button 
                          class="btn btn-apply-gradient rounded-pill w-100 fw-600 shadow-sm"
                          (click)="apply(internship._id)"
                          [disabled]="applying === internship._id || internship.userApplicationStatus === 'PENDING' || internship.userApplicationStatus === 'ACCEPTED'">
                          @if (applying === internship._id) {
                            <span class="spinner-border spinner-border-sm me-2"></span>
                          }
                          
                          @if (internship.userApplicationStatus === 'ACCEPTED') {
                            <i class="bi bi-check2-all me-2"></i>Accepted
                          } @else if (internship.userApplicationStatus === 'PENDING') {
                            <i class="bi bi-check2 me-2"></i>Applied
                          } @else {
                            Apply Now
                          }
                        </button>
                      }
                      
                      <!-- View Company Button -->
                      <a [routerLink]="['/profile/company', internship.company._id]" 
                         class="btn btn-outline-secondary btn-sm rounded-pill w-100">
                        <i class="bi bi-building me-1"></i>View Company
                      </a>
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
    .page-container { 
      width: 100%; 
      min-width: 0; 
      animation: fadeIn 0.5s ease-out; 
    }
    
    .container-fluid { 
      padding: 1.5rem; 
      max-width: 100%; 
    }

    .fw-600 { font-weight: 600; }
    .fw-700 { font-weight: 700; }
    .fw-800 { font-weight: 800; }

    .text-gradient {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* Internship Cards (Matching Admin Company Card Design) */
    .internship-card {
      background: white;
      border-radius: 20px;
      border: 1px solid #f1f5f9;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .internship-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: linear-gradient(90deg, #4f46e5, #7c3aed);
      opacity: 0;
      transition: opacity 0.3s;
    }

    .internship-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px -12px rgba(79, 70, 229, 0.15);
      border-color: #e2e8f0;
    }

    .internship-card:hover::before {
      opacity: 1;
    }

    .card-header-custom {
      padding-bottom: 1rem;
      border-bottom: 2px solid #f8fafc;
    }

    .avatar-ring-xl {
      width: 60px;
      height: 60px;
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
      font-size: 1.5rem;
      border: 2px solid white;
    }

    .company-name {
      font-weight: 700;
      color: #1e293b;
      font-size: 1rem;
    }

    .internship-title {
      font-size: 1.1rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.3;
    }

    .status-badge {
      padding: 0.3rem 0.8rem;
      border-radius: 50px;
      font-weight: 600;
      font-size: 0.7rem;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .status-trending {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.2);
    }

    /* Info Box */
    .info-box {
      background: #f8fafc;
      padding: 1rem;
      border-radius: 12px;
      border: 1px solid #f1f5f9;
    }

    .info-item {
      display: flex;
      align-items: center;
      font-size: 0.85rem;
    }

    .icon-location { color: #e11d48; }
    .icon-duration { color: #4f46e5; }
    .icon-applicants { color: #059669; }

    .description-text {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.5;
    }

    /* Actions */
    .card-actions {
      margin-top: 1rem;
    }

    .btn-apply-gradient {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: white;
      border: none;
      transition: all 0.3s;
    }

    .btn-apply-gradient:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
      color: white;
    }

    .btn-apply-gradient:disabled {
      background: #e2e8f0;
      color: #94a3b8;
      cursor: not-allowed;
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

    /* Animations */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .container-fluid {
        padding: 1rem;
      }
    }
  `]
})
export class InternshipsComponent implements OnInit {
  internships: Internship[] = [];
  filteredInternships: Internship[] = [];
  loading = false;
  error = '';
  success = '';
  applying: string | null = null;

  sortBy = '';
  filterBy = '';
  filterValue = '';

  private internshipService = inject(InternshipService);
  private applicationService = inject(ApplicationService);
  private authService = inject(AuthService);

  currentUser$: Observable<any> = this.authService.currentUser$;

  ngOnInit() {
    this.loadInternships();
  }

  loadInternships() {
    this.loading = true;
    this.internshipService.getAll().subscribe({
      next: (data) => {
        this.internships = data;
        this.filteredInternships = data;
        this.applySortAndFilter();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load internships';
        this.loading = false;
      }
    });
  }

  applySortAndFilter() {
    let result = [...this.internships];

    // Apply filter
    if (this.filterValue) {
      const searchTerm = this.filterValue.toLowerCase();
      result = result.filter(internship => {
        if (this.filterBy) {
          switch (this.filterBy) {
            case 'title':
              return internship.title.toLowerCase().includes(searchTerm);
            case 'location':
              return internship.location.toLowerCase().includes(searchTerm);
            case 'company':
              return internship.company.name.toLowerCase().includes(searchTerm);
            default:
              return true;
          }
        } else {
          // General search across main fields if no specific filter is selected
          return internship.title.toLowerCase().includes(searchTerm) ||
            internship.location.toLowerCase().includes(searchTerm) ||
            internship.company.name.toLowerCase().includes(searchTerm);
        }
      });
    }

    // Apply sorting
    if (this.sortBy) {
      result.sort((a, b) => {
        switch (this.sortBy) {
          case 'title':
            return a.title.localeCompare(b.title);
          case 'location':
            return a.location.localeCompare(b.location);
          case 'company':
            return a.company.name.localeCompare(b.company.name);
          default:
            return 0;
        }
      });
    }

    this.filteredInternships = result;
  }

  resetFilters() {
    this.filterBy = '';
    this.filterValue = '';
    this.sortBy = '';
    this.applySortAndFilter();
  }

  apply(internshipId: string) {
    this.applying = internshipId;
    this.error = '';
    this.success = '';

    this.applicationService.apply(internshipId).subscribe({
      next: () => {
        this.success = 'Application submitted successfully!';
        this.applying = null;
        // Reload to update application count
        this.loadInternships();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error.message || 'Failed to apply';
        this.applying = null;
        setTimeout(() => this.error = '', 5000);
      }
    });
  }
}