import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InternshipService, Internship } from '../../services/internship.service';
import { ApplicationService } from '../../services/application.service';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-internships',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Available Internships</h2>
        @if ((currentUser$ | async)?.role === 'COMPANY') {
          <a routerLink="/create-internship" class="btn btn-primary">Post New Internship</a>
        }
      </div>

      <!-- Filters and Sorting -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row">
            <div class="col-md-4 mb-3">
              <label class="form-label">Sort By</label>
              <select class="form-select" [(ngModel)]="sortBy" (change)="applySortAndFilter()">
                <option value="">Default (Newest First)</option>
                <option value="title">Title (A-Z)</option>
                <option value="location">Location (A-Z)</option>
                <option value="company">Company (A-Z)</option>
              </select>
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Filter By</label>
              <select class="form-select" [(ngModel)]="filterBy" (change)="applySortAndFilter()">
                <option value="">No Filter</option>
                <option value="title">Title</option>
                <option value="location">Location</option>
                <option value="company">Company</option>
              </select>
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Search</label>
              <input 
                type="text" 
                class="form-control" 
                [(ngModel)]="filterValue" 
                (input)="applySortAndFilter()"
                [disabled]="!filterBy"
                placeholder="Enter search term...">
            </div>
          </div>
        </div>
      </div>

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

      @if (success) {
        <div class="alert alert-success">{{ success }}</div>
      }

      <div class="row">
        @for (internship of filteredInternships; track internship._id) {
          <div class="col-md-6 col-lg-4 mb-4">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h5 class="card-title">{{ internship.title }}</h5>
                  <span class="badge bg-info">
                    {{ internship.applicationCount || 0 }} applicants
                  </span>
                </div>
                <h6 class="card-subtitle mb-2 text-muted">{{ internship.company.name }}</h6>
                <p class="card-text">{{ internship.description }}</p>
                <p class="mb-1"><strong>Location:</strong> {{ internship.location }}</p>
                <p class="mb-3"><strong>Duration:</strong> {{ internship.duration }}</p>
                
                <div class="d-flex gap-2 flex-wrap">
                  @if (internship.company.website) {
                    <a [href]="internship.company.website" target="_blank" class="btn btn-sm btn-outline-secondary">
                      Company Website
                    </a>
                  }
                  <a [routerLink]="['/company-reviews', internship.company._id]" class="btn btn-sm btn-outline-info">
                    Reviews
                  </a>
                  <a [routerLink]="['/profile/company', internship.company._id]" class="btn btn-sm btn-outline-primary">
                    Company Profile
                  </a>
                  @if ((currentUser$ | async)?.role === 'STUDENT') {
                    <button 
                      class="btn btn-sm btn-primary" 
                      (click)="apply(internship._id)"
                      [disabled]="applying === internship._id">
                      @if (applying === internship._id) {
                        <span class="spinner-border spinner-border-sm me-1"></span>
                      }
                      Apply
                    </button>
                  }
                </div>
              </div>
              <div class="card-footer text-muted">
                Posted: {{ internship.createdAt | date:'short' }}
              </div>
            </div>
          </div>
        }
      </div>

      @if (filteredInternships.length === 0 && !loading) {
        <div class="alert alert-info">
          {{ filterBy ? 'No internships match your search criteria.' : 'No internships available at the moment.' }}
        </div>
      }
    </div>
  `
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
    if (this.filterBy && this.filterValue) {
      const searchTerm = this.filterValue.toLowerCase();
      result = result.filter(internship => {
        switch(this.filterBy) {
          case 'title':
            return internship.title.toLowerCase().includes(searchTerm);
          case 'location':
            return internship.location.toLowerCase().includes(searchTerm);
          case 'company':
            return internship.company.name.toLowerCase().includes(searchTerm);
          default:
            return true;
        }
      });
    }

    // Apply sorting
    if (this.sortBy) {
      result.sort((a, b) => {
        switch(this.sortBy) {
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