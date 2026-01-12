import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApplicationService } from '../../../services/application.service';

@Component({
  selector: 'app-accepted-companies',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <h2 class="mb-4">Companies That Accepted Me</h2>

      @if (loading) {
        <div class="text-center">
          <div class="spinner-border"></div>
        </div>
      }

      @if (error) {
        <div class="alert alert-danger">{{ error }}</div>
      }

      @if (companies.length === 0 && !loading) {
        <div class="alert alert-info">
          You don't have any accepted applications yet.
        </div>
      }

      <div class="row">
        @for (company of companies; track company._id) {
          <div class="col-md-6 mb-4">
            <div class="card h-100">
              <div class="card-body">
                <h4>{{ company.name }}</h4>
                <p class="text-muted">{{ company.email }}</p>
                @if (company.website) {
                  <p>
                    <a [href]="company.website" target="_blank" class="btn btn-sm btn-outline-primary">
                      <i class="bi bi-globe"></i> Visit Website
                    </a>
                  </p>
                }
                @if (company.description) {
                  <p>{{ company.description }}</p>
                }
                <div class="mt-3">
                  <a [routerLink]="['/profile/company', company._id]" class="btn btn-primary me-2">
                    View Profile
                  </a>
                  <a [routerLink]="['/company-reviews', company._id]" class="btn btn-outline-secondary">
                    View Reviews
                  </a>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class AcceptedCompaniesComponent implements OnInit {
  companies: any[] = [];
  loading = false;
  error = '';

  constructor(private applicationService: ApplicationService) {}

  ngOnInit() {
    this.loadAcceptedCompanies();
  }

  loadAcceptedCompanies() {
    this.loading = true;
    this.applicationService.getAcceptedCompanies().subscribe({
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
}
