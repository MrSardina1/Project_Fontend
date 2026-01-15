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
    <div class="page-container">
      <header class="page-header d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1 class="page-title text-gradient">Available Internships</h1>
          <p class="text-muted">Find your next big opportunity today</p>
        </div>
        @if ((currentUser$ | async)?.role === 'COMPANY') {
          <a routerLink="/create-internship" class="btn btn-primary shadow-sm">
            <i class="bi bi-plus-lg me-2"></i>Post New Internship
          </a>
        }
      </header>

      <!-- Search & Filters -->
      <section class="filters-section glass p-4 mb-5 border-0 shadow-sm rounded-4">
        <div class="row g-3">
          <div class="col-lg-3 col-md-4">
            <div class="input-group search-group">
              <span class="input-group-text bg-transparent border-end-0"><i class="bi bi-search"></i></span>
              <input 
                type="text" 
                class="form-control border-start-0 ps-0" 
                [(ngModel)]="filterValue" 
                (input)="applySortAndFilter()"
                placeholder="Search opportunities...">
            </div>
          </div>
          <div class="col-lg-3 col-md-4">
            <select class="form-select" [(ngModel)]="filterBy" (change)="applySortAndFilter()">
              <option value="">Filter by Field</option>
              <option value="title">Internship Title</option>
              <option value="location">Location</option>
              <option value="company">Company Name</option>
            </select>
          </div>
          <div class="col-lg-3 col-md-4">
            <select class="form-select" [(ngModel)]="sortBy" (change)="applySortAndFilter()">
              <option value="">Sort by Date</option>
              <option value="title">Title (A-Z)</option>
              <option value="location">Location (A-Z)</option>
              <option value="company">Company (A-Z)</option>
            </select>
          </div>
          <div class="col-lg-3 col-md-12 text-lg-end">
            <button class="btn btn-outline-secondary px-4" (click)="filterBy = ''; filterValue = ''; sortBy = ''; applySortAndFilter()">
              Reset Filters
            </button>
          </div>
        </div>
      </section>

      @if (loading) {
        <div class="d-flex justify-content-center py-5">
          <div class="spinner-grow text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      }

      @if (error) {
        <div class="alert alert-danger rounded-3 p-3 mb-4 shadow-sm border-0 d-flex align-items-center">
          <i class="bi bi-x-circle-fill me-2 fs-5"></i>
          <div>{{ error }}</div>
        </div>
      }

      @if (success) {
        <div class="alert alert-success rounded-3 p-3 mb-4 shadow-sm border-0 d-flex align-items-center">
          <i class="bi bi-check-circle-fill me-2 fs-5"></i>
          <div>{{ success }}</div>
        </div>
      }

      <div class="row g-4">
        @for (internship of filteredInternships; track internship._id) {
          <div class="col-xl-4 col-lg-6 col-md-6">
            <div class="internship-card p-4 h-100 shadow-sm border-0 rounded-4">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div class="company-logo-container">
                  @if (internship.company.profilePicture) {
                    <img [src]="internship.company.profilePicture | imagePath" class="company-logo-img" alt="Company Logo">
                  } @else {
                    <div class="company-logo-fallback">{{ internship.company.name.charAt(0) }}</div>
                  }
                </div>
                <div class="badge-group">
                  @if ((internship.applicationCount || 0) > 5) {
                    <span class="badge bg-soft-primary text-primary">Trending</span>
                  }
                  <span class="badge bg-soft-info text-info ms-2">
                    {{ internship.applicationCount || 0 }} Applied
                  </span>
                </div>
              </div>
              
              <h3 class="intern-title mb-1">{{ internship.title }}</h3>
              <p class="company-name text-primary fw-medium mb-3">{{ internship.company.name }}</p>
              
              <div class="meta-info mb-4">
                <div class="meta-item"><i class="bi bi-geo-alt me-2"></i>{{ internship.location }}</div>
                <div class="meta-item"><i class="bi bi-calendar-event me-2"></i>{{ internship.duration }}</div>
              </div>

              <p class="intern-desc text-muted mb-4 text-truncate-2">
                {{ internship.description }}
              </p>
              
              <div class="card-actions mt-auto d-flex gap-2">
                  <button 
                    class="btn btn-primary flex-grow-1"
                    (click)="apply(internship._id)"
                    [disabled]="applying === internship._id || internship.userApplicationStatus === 'PENDING' || internship.userApplicationStatus === 'ACCEPTED'"
                    *ngIf="(currentUser$ | async)?.role === 'STUDENT'">
                    @if (applying === internship._id) {
                      <span class="spinner-border spinner-border-sm me-1"></span>
                    }
                    @if (internship.userApplicationStatus === 'ACCEPTED') {
                      Accepted
                    } @else if (internship.userApplicationStatus === 'PENDING') {
                      Applied
                    } @else {
                      Apply Now
                    }
                  </button>
                <a [routerLink]="['/profile/company', internship.company._id]" class="btn btn-light-primary px-3" title="View Company">
                  <i class="bi bi-eye"></i>
                </a>
              </div>
            </div>
          </div>
        }
      </div>

      @if (filteredInternships.length === 0 && !loading) {
        <div class="text-center py-5">
          <img src="assets/empty.svg" alt="No results" style="max-width: 200px;" class="mb-4 opacity-50">
          <h4 class="text-muted">No internships match your criteria</h4>
          <p class="text-secondary">Try adjusting your filters or search term</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1200px;
    }

    .page-title {
      font-size: 2.25rem;
      font-weight: 800;
      margin-bottom: 0.5rem;
    }

    .internship-card {
      background: white;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      border: 1px solid var(--border) !important;
    }

    .internship-card:hover {
      transform: translateY(-8px);
      box-shadow: var(--shadow-md) !important;
      border-color: var(--primary) !important;
    }

    .company-logo-container {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--primary-light);
    }
    
    .company-logo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .company-logo-fallback {
      color: var(--primary);
      font-weight: 700;
      font-size: 1.25rem;
    }

    .intern-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .meta-item {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin-bottom: 0.25rem;
    }

    .intern-desc {
      font-size: 0.9rem;
      line-height: 1.6;
    }

    .bg-soft-primary { background-color: rgba(79, 70, 229, 0.1); }
    .bg-soft-info { background-color: rgba(6, 182, 212, 0.1); }
    
    .btn-light-primary {
      background: var(--primary-light);
      color: var(--primary);
      border: none;
    }
    .btn-light-primary:hover {
      background: var(--primary);
      color: white;
    }

    .text-truncate-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .search-group .form-control:focus {
      box-shadow: none;
    }

    .form-select, .form-control {
      border-radius: 10px;
      padding: 0.6rem 1rem;
      border: 1px solid var(--border);
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