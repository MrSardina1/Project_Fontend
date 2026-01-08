import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicationService, Application } from '../../services/application.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-4">
      <h2>Applications</h2>

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

      @if (applications.length === 0 && !loading) {
        <div class="alert alert-info">
          No applications found.
        </div>
      }

      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Student</th>
              <th>Internship</th>
              <th>Company</th>
              <th>Status</th>
              <th>Applied On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (app of applications; track app._id) {
              <tr>
                <td>
                  <div>{{ app.student.username }}</div>
                  <small class="text-muted">{{ app.student.email }}</small>
                </td>
                <td>{{ app.internship.title }}</td>
                <td>{{ app.internship.company.name }}</td>
                <td>
                  <span class="badge" [class]="getStatusClass(app.status)">
                    {{ app.status }}
                  </span>
                </td>
                <td>{{ app.createdAt | date:'short' }}</td>
                <td>
                  @if (app.status === 'PENDING') {
                    <div class="btn-group btn-group-sm">
                      <button 
                        class="btn btn-success" 
                        (click)="updateStatus(app._id, 'ACCEPTED')"
                        [disabled]="updating === app._id">
                        Accept
                      </button>
                      <button 
                        class="btn btn-danger" 
                        (click)="updateStatus(app._id, 'REJECTED')"
                        [disabled]="updating === app._id">
                        Reject
                      </button>
                    </div>
                  } @else {
                    <span class="text-muted">No actions available</span>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ApplicationsComponent implements OnInit {
  applications: Application[] = [];
  loading = false;
  error = '';
  success = '';
  updating: string | null = null;

  constructor(
    private applicationService: ApplicationService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadApplications();
  }

  loadApplications() {
    this.loading = true;
    this.applicationService.getAll().subscribe({
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

  updateStatus(id: string, status: string) {
    this.updating = id;
    this.error = '';
    this.success = '';

    this.applicationService.updateStatus(id, status).subscribe({
      next: () => {
        this.success = `Application ${status.toLowerCase()} successfully!`;
        this.updating = null;
        this.loadApplications();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error.message || 'Failed to update status';
        this.updating = null;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'bg-warning';
      case 'ACCEPTED':
        return 'bg-success';
      case 'REJECTED':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }
}