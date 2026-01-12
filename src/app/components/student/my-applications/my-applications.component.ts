import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApplicationService, Application } from '../../../services/application.service';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <h2 class="mb-4">My Applications</h2>

      @if (loading) {
        <div class="text-center">
          <div class="spinner-border"></div>
        </div>
      }

      @if (error) {
        <div class="alert alert-danger">{{ error }}</div>
      }

      @if (applications.length === 0 && !loading) {
        <div class="alert alert-info">
          You haven't applied to any internships yet.
          <a routerLink="/internships" class="alert-link">Browse internships</a>
        </div>
      }

      @for (app of applications; track app._id) {
        <div class="card mb-3">
          <div class="card-body">
            <div class="row">
              <div class="col-md-8">
                <h4>{{ app.internship.title }}</h4>
                <h6 class="text-muted">{{ app.internship.company.name }}</h6>
                <p class="mb-1">
                  <strong>Location:</strong> {{ app.internship.location }} | 
                  <strong>Duration:</strong> {{ app.internship.duration }}
                </p>
                <p class="mb-0">
                  <small class="text-muted">Applied on: {{ app.createdAt | date:'full' }}</small>
                </p>
              </div>
              <div class="col-md-4 text-end">
                <span class="badge fs-6" [class]="getStatusClass(app.status)">
                  {{ app.status }}
                </span>
                <div class="mt-2">
                  <a [routerLink]="['/company-reviews', app.internship.company._id]" 
                     class="btn btn-sm btn-outline-primary">
                    View Company Reviews
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class MyApplicationsComponent implements OnInit {
  applications: Application[] = [];
  loading = false;
  error = '';

  constructor(private applicationService: ApplicationService) {}

  ngOnInit() {
    this.loadApplications();
  }

  loadApplications() {
    this.loading = true;
    this.applicationService.getMyApplications().subscribe({
      next: (data) => {
        this.applications = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load applications';
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'bg-warning';
      case 'ACCEPTED': return 'bg-success';
      case 'REJECTED': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}