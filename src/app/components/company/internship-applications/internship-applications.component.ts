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
    <div class="container mt-4">
      <button class="btn btn-secondary mb-3" (click)="goBack()">
        ← Back to My Internships
      </button>

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

      @if (data) {
        <div class="card mb-4">
          <div class="card-body">
            <h2>{{ data.internship.title }}</h2>
            <p><strong>Location:</strong> {{ data.internship.location }}</p>
            <p><strong>Duration:</strong> {{ data.internship.duration }}</p>
            <p class="text-muted">{{ data.internship.description }}</p>
            <p><strong>Total Applications:</strong> {{ filteredApplications.length }}</p>
          </div>
        </div>

        <!-- Filters -->
        <div class="card mb-4">
          <div class="card-body">
            <div class="row">
              <div class="col-md-4">
                <label class="form-label">Sort By</label>
                <select class="form-select" [(ngModel)]="sortBy" (change)="applyFilters()">
                  <option value="">Default (Newest First)</option>
                  <option value="name">Student Name (A-Z)</option>
                  <option value="date">Date Applied (Oldest First)</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label">Filter by Name</label>
                <input 
                  type="text" 
                  class="form-control" 
                  [(ngModel)]="nameFilter" 
                  (input)="applyFilters()"
                  placeholder="Search by student name...">
              </div>
              <div class="col-md-4">
                <label class="form-label">Filter by Status</label>
                <select class="form-select" [(ngModel)]="statusFilter" (change)="applyFilters()">
                  <option value="">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        @if (filteredApplications.length === 0) {
          <div class="alert alert-info">
            {{ nameFilter || statusFilter ? 'No applications match your filters.' : 'No applications yet for this internship.' }}
          </div>
        } @else {
          <div class="table-responsive">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Applied On</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (app of filteredApplications; track app._id) {
                  <tr>
                    <td>
                      <div class="d-flex align-items-center">
                        <img 
                          [src]="getProfilePictureUrl(app.student.profilePicture)" 
                          class="rounded-circle me-2" 
                          style="width: 40px; height: 40px; object-fit: cover;"
                          alt="Profile">
                        {{ app.student.username }}
                      </div>
                    </td>
                    <td>{{ app.student.email }}</td>
                    <td>{{ app.createdAt | date:'short' }}</td>
                    <td>
                      <span class="badge" [class]="getStatusClass(app.status)">
                        {{ app.status }}
                      </span>
                    </td>
                    <td>
                      @if (app.status === 'PENDING') {
                        <div class="btn-group btn-group-sm">
                          <button 
                            class="btn btn-success" 
                            (click)="updateStatus(app._id, 'ACCEPTED')"
                            [disabled]="updating === app._id">
                            @if (updating === app._id) {
                              <span class="spinner-border spinner-border-sm me-1"></span>
                            }
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
                        <span class="text-muted">-</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .table th {
      background-color: #f8f9fa;
    }
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
  ) {}

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