import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CompanyService } from '../../../services/company.service';

@Component({
  selector: 'app-company-internships',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>My Posted Internships</h2>
        <a routerLink="/create-internship" class="btn btn-primary">
          <i class="bi bi-plus-circle"></i> Post New Internship
        </a>
      </div>

      @if (loading) {
        <div class="text-center">
          <div class="spinner-border"></div>
        </div>
      }

      @if (error) {
        <div class="alert alert-danger">{{ error }}</div>
      }

      @if (internships.length === 0 && !loading) {
        <div class="alert alert-info">
          You haven't posted any internships yet.
        </div>
      }

      <div class="row">
        @for (internship of internships; track internship._id) {
          <div class="col-md-6 mb-4">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h4>{{ internship.title }}</h4>
                  <span class="badge bg-info fs-6">
                    {{ internship.applicationCount || 0 }} applicants
                  </span>
                </div>
                <p>{{ internship.description }}</p>
                <p class="mb-1"><strong>Location:</strong> {{ internship.location }}</p>
                <p class="mb-3"><strong>Duration:</strong> {{ internship.duration }}</p>
                <a [routerLink]="['/internship-applications', internship._id]" 
                   class="btn btn-primary">
                  View Applications ({{ internship.applicationCount || 0 }})
                </a>
              </div>
              <div class="card-footer text-muted">
                Posted: {{ internship.createdAt | date:'short' }}
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class CompanyInternshipsComponent implements OnInit {
  internships: any[] = [];
  loading = false;
  error = '';

  constructor(private companyService: CompanyService) {}

  ngOnInit() {
    this.loadInternships();
  }

  loadInternships() {
    this.loading = true;
    this.companyService.getMyInternships().subscribe({
      next: (data) => {
        this.internships = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load internships';
        this.loading = false;
      }
    });
  }
}