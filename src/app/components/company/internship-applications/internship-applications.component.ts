import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Application {
  _id: string;
  student: {
    _id: string;
    username: string;
    email: string;
    profilePicture?: string;
  };
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

interface InternshipWithApplications {
  internship: {
    _id: string;
    title: string;
    description: string;
    location: string;
    duration: string;
  };
  applications: Application[];
}

@Component({
  selector: 'app-internship-applications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <header class="page-header mb-5">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <button class="btn btn-link text-decoration-none p-0 text-muted fw-600" (click)="goBack()">
            <i class="bi bi-arrow-left me-1"></i> Back to Listings
          </button>
        </div>
        <h1 class="page-title text-gradient">Applications Management</h1>
        <p class="text-muted">Review and manage candidates for this position</p>
      </header>

      @if (loading) {
        <div class="d-flex justify-content-center py-5">
          <div class="spinner-grow text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
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

      @if (data) {
        <!-- Internship Info Summary -->
        <div class="glass p-4 rounded-4 border-0 shadow-sm mb-4">
          <div class="row align-items-center">
            <div class="col-lg-8">
              <h2 class="h4 fw-800 mb-1 text-main">{{ data.internship.title }}</h2>
              <div class="d-flex gap-3 text-muted small fw-500">
                <span><i class="bi bi-geo-alt me-1"></i>{{ data.internship.location }}</span>
                <span><i class="bi bi-calendar-event me-1"></i>{{ data.internship.duration }}</span>
                <span class="text-primary fw-600"><i class="bi bi-people me-1"></i>{{ filteredApplications.length }} Candidates</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters Section -->
        <section class="filters-card glass p-4 mb-4 border-0 shadow-sm rounded-4">
          <div class="row g-3">
            <div class="col-md-4">
              <div class="input-group search-group">
                <span class="input-group-text bg-transparent border-end-0"><i class="bi bi-search"></i></span>
                <input 
                  type="text" 
                  class="form-control border-start-0 ps-0" 
                  [(ngModel)]="nameFilter" 
                  (input)="applyFilters()"
                  placeholder="Search by student name...">
              </div>
            </div>
            <div class="col-md-4">
              <select class="form-select" [(ngModel)]="statusFilter" (change)="applyFilters()">
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div class="col-md-4">
              <select class="form-select" [(ngModel)]="sortBy" (change)="applyFilters()">
                <option value="">Sort by Date (Newest)</option>
                <option value="name">Name (A-Z)</option>
                <option value="date">Date (Oldest First)</option>
              </select>
            </div>
          </div>
        </section>

        @if (filteredApplications.length === 0) {
          <div class="text-center py-5 glass rounded-4 shadow-sm border-0">
            <i class="bi bi-person-x fs-1 text-muted mb-3 d-block"></i>
            <h4 class="text-muted">No applications found</h4>
            <p class="text-secondary">Try adjusting your filters.</p>
          </div>
        } @else {
          <div class="table-card glass rounded-4 shadow-sm border-0 overflow-hidden">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th class="ps-4">Student</th>
                    <th>Email</th>
                    <th>Applied On</th>
                    <th>Status</th>
                    <th class="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (app of filteredApplications; track app._id) {
                    <tr>
                      <td class="ps-4">
                        <div class="d-flex align-items-center">
                          <div class="avatar-sm me-3">{{ app.student.username.charAt(0) }}</div>
                          <div class="fw-700 text-main">{{ app.student.username }}</div>
                        </div>
                      </td>
                      <td><span class="text-muted small">{{ app.student.email }}</span></td>
                      <td><span class="text-muted small">{{ app.createdAt | date:'mediumDate' }}</span></td>
                      <td>
                        <span class="status-badge" [class]="getStatusClass(app.status)">
                          {{ app.status }}
                        </span>
                      </td>
                      <td class="text-end pe-4">
                        @if (app.status === 'PENDING') {
                          <div class="d-flex gap-2 justify-content-end">
                            <button 
                              class="btn btn-action-success" 
                              (click)="updateStatus(app._id, 'ACCEPTED')"
                              [disabled]="updating === app._id"
                              title="Accept Application">
                              <i class="bi bi-check-lg" *ngIf="updating !== app._id"></i>
                              <span class="spinner-border spinner-border-sm" *ngIf="updating === app._id"></span>
                            </button>
                            <button 
                              class="btn btn-action-danger" 
                              (click)="updateStatus(app._id, 'REJECTED')"
                              [disabled]="updating === app._id"
                              title="Reject Application">
                              <i class="bi bi-x-lg"></i>
                            </button>
                          </div>
                        } @else {
                          <span class="text-muted small fw-600">Decision Made</span>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .page-container { max-width: 1100px; }
    .page-title { font-size: 2.25rem; font-weight: 800; margin-bottom: 0.25rem; }
    
    .fw-800 { font-weight: 800; }
    .fw-700 { font-weight: 700; }
    .fw-600 { font-weight: 600; }
    .fw-500 { font-weight: 500; }
    .text-main { color: var(--text-main); }
    
    .avatar-sm {
      width: 36px;
      height: 36px;
      background: var(--bg-main);
      color: var(--primary);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.9rem;
      border: 1px solid var(--border);
    }

    .table thead th {
      background: var(--bg-main);
      color: var(--text-light);
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 1rem 0.5rem;
      border: none;
    }

    .table tbody td {
      padding: 1.25rem 0.5rem;
      border-bottom: 1px solid var(--border);
    }

    .status-badge {
      display: inline-block;
      padding: 0.35rem 0.8rem;
      border-radius: 100px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .bg-warning { background: #fef3c7; color: #92400e; }
    .bg-success { background: #d1fae5; color: #065f46; }
    .bg-danger { background: #fee2e2; color: #991b1b; }

    .btn-action-success {
      width: 32px;
      height: 32px;
      padding: 0;
      border-radius: 8px;
      background: #d1fae5;
      color: #059669;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .btn-action-success:hover { background: #059669; color: white; }

    .btn-action-danger {
      width: 32px;
      height: 32px;
      padding: 0;
      border-radius: 8px;
      background: #fee2e2;
      color: #dc2626;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .btn-action-danger:hover { background: #dc2626; color: white; }

    .search-group .form-control { border-radius: 10px; }
    .form-select { border-radius: 10px; }
  `]
})
export class InternshipApplicationsComponent implements OnInit {
  data: InternshipWithApplications | null = null;
  filteredApplications: Application[] = [];
  loading = false;
  error = '';
  success = '';
  updating: string | null = null;

  // Filters
  sortBy = '';
  nameFilter = '';
  statusFilter = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit() {
    const internshipId = this.route.snapshot.paramMap.get('id');
    if (internshipId) {
      this.loadApplications(internshipId);
    }
  }

  loadApplications(internshipId: string) {
    this.loading = true;
    this.error = '';

    this.http.get<InternshipWithApplications>(
      `http://localhost:3000/company/internship/${internshipId}/applications`
    ).subscribe({
      next: (response) => {
        this.data = response;
        this.filteredApplications = response.applications;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load applications';
        this.loading = false;
      }
    });
  }

  applyFilters() {
    if (!this.data) return;

    let result = [...this.data.applications];

    // Filter by name
    if (this.nameFilter) {
      const search = this.nameFilter.toLowerCase();
      result = result.filter(app =>
        app.student.username.toLowerCase().includes(search)
      );
    }

    // Filter by status
    if (this.statusFilter) {
      result = result.filter(app => app.status === this.statusFilter);
    }

    // Sort
    if (this.sortBy === 'name') {
      result.sort((a, b) =>
        a.student.username.localeCompare(b.student.username)
      );
    } else if (this.sortBy === 'date') {
      result.sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } else {
      // Default: newest first
      result.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    this.filteredApplications = result;
  }

  updateStatus(applicationId: string, status: 'ACCEPTED' | 'REJECTED') {
    this.updating = applicationId;
    this.error = '';
    this.success = '';

    this.http.patch(
      `http://localhost:3000/applications/${applicationId}/status`,
      { status }
    ).subscribe({
      next: () => {
        this.success = `Application ${status.toLowerCase()} successfully!`;
        this.updating = null;
        // Reload data
        const internshipId = this.route.snapshot.paramMap.get('id');
        if (internshipId) {
          this.loadApplications(internshipId);
        }
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to update status';
        this.updating = null;
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

  getProfilePictureUrl(profilePicture?: string): string {
    if (!profilePicture) {
      return '/assets/default-profile.png';
    }
    return `http://localhost:3000/${profilePicture}`;
  }

  goBack() {
    this.router.navigate(['/my-internships']);
  }
}