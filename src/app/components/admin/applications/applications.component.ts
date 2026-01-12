import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-applications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-container">
      <div class="admin-sidebar">
        <h4 class="text-white mb-4">Admin Panel</h4>
        <nav class="nav flex-column">
          <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-link">
            <i class="bi bi-speedometer2"></i> Dashboard
          </a>
          <a routerLink="/admin/users" routerLinkActive="active" class="nav-link">
            <i class="bi bi-people"></i> Users
          </a>
          <a routerLink="/admin/companies" routerLinkActive="active" class="nav-link">
            <i class="bi bi-building"></i> Companies
          </a>
          <a routerLink="/admin/pending-companies" routerLinkActive="active" class="nav-link">
            <i class="bi bi-clock-history"></i> Pending Companies
          </a>
          <a routerLink="/admin/internships" routerLinkActive="active" class="nav-link">
            <i class="bi bi-briefcase"></i> Internships
          </a>
          <a routerLink="/admin/applications" routerLinkActive="active" class="nav-link">
            <i class="bi bi-file-text"></i> Applications
          </a>
          <a routerLink="/admin/reviews" routerLinkActive="active" class="nav-link">
            <i class="bi bi-star"></i> Reviews
          </a>
        </nav>
      </div>

      <div class="admin-content">
        <div class="container-fluid py-4">
          <h2 class="mb-4">All Applications</h2>

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
    </div>
  `,
  styles: [`
    .admin-container { display: flex; min-height: 100vh; }
    .admin-sidebar { width: 250px; background: #2c3e50; padding: 20px; position: fixed; height: 100vh; overflow-y: auto; }
    .admin-sidebar .nav-link { color: #ecf0f1; padding: 12px 15px; border-radius: 5px; margin-bottom: 5px; transition: all 0.3s; }
    .admin-sidebar .nav-link:hover { background: #34495e; padding-left: 20px; }
    .admin-sidebar .nav-link.active { background: #3498db; color: white; }
    .admin-content { margin-left: 250px; flex: 1; background: #f8f9fa; }
  `]
})
export class AdminApplicationsComponent implements OnInit {
  applications: any[] = [];
  loading = false;
  error = '';

  constructor(private adminService: AdminService) {}

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