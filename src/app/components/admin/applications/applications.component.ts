import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-applications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-container py-4">
      <div class="container-fluid">
        <h2 class="mb-4 fw-800">All Applications</h2>

          @if (loading) {
            <div class="text-center">
              <div class="spinner-border"></div>
            </div>
          }

          @if (error) {
            <div class="alert alert-danger">{{ error }}</div>
          }

          <div class="card">
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Internship</th>
                      <th>Company</th>
                      <th>Status</th>
                      <th>Applied On</th>
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
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              @if (applications.length === 0 && !loading) {
                <div class="alert alert-info">
                  No applications found.
                </div>
              }
            </div>
          </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { width: 100%; }
    .fw-800 { font-weight: 800; }
    .card { border: 1px solid var(--border); border-radius: 12px; }
  `]
})
export class AdminApplicationsComponent implements OnInit {
  applications: any[] = [];
  loading = false;
  error = '';

  constructor(private adminService: AdminService) { }

  ngOnInit() {
    this.loadApplications();
  }

  loadApplications() {
    this.loading = true;
    this.adminService.getAllApplications().subscribe({
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