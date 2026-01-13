import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService, AdminInternship } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-internships',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-container py-4">
      <div class="container-fluid">
        <h2 class="mb-4 fw-800">Internship Management</h2>

          <!-- Filters -->
          <div class="card mb-4">
            <div class="card-body">
              <div class="row">
                <div class="col-md-4">
                  <label class="form-label">Sort By</label>
                  <select class="form-select" [(ngModel)]="sortBy" (change)="loadInternships()">
                    <option value="">Default</option>
                    <option value="title">Title (A-Z)</option>
                    <option value="location">Location (A-Z)</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Filter By</label>
                  <select class="form-select" [(ngModel)]="filterBy" (change)="filterValue = ''; loadInternships()">
                    <option value="">No Filter</option>
                    <option value="title">Title</option>
                    <option value="location">Location</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Search</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    [(ngModel)]="filterValue" 
                    (input)="loadInternships()"
                    [disabled]="!filterBy"
                    placeholder="Search...">
                </div>
              </div>
            </div>
          </div>

          @if (loading) {
            <div class="text-center">
              <div class="spinner-border"></div>
            </div>
          }

          @if (error) {
            <div class="alert alert-danger">{{ error }}</div>
          }

          @if (success) {
            <div class="alert alert-success">{{ success }}</div>
          }

          <div class="card">
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Company</th>
                      <th>Location</th>
                      <th>Duration</th>
                      <th>Posted</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (internship of internships; track internship._id) {
                      <tr>
                        <td>{{ internship.title }}</td>
                        <td>{{ internship.company?.name }}</td>
                        <td>{{ internship.location }}</td>
                        <td>{{ internship.duration }}</td>
                        <td>{{ internship.createdAt | date:'short' }}</td>
                        <td>
                          <button 
                            class="btn btn-sm btn-danger" 
                            (click)="deleteInternship(internship._id)"
                            [disabled]="deleting === internship._id">
                            @if (deleting === internship._id) {
                              <span class="spinner-border spinner-border-sm"></span>
                            } @else {
                              Delete
                            }
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              @if (internships.length === 0 && !loading) {
                <div class="alert alert-info">
                  No internships found.
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
export class AdminInternshipsComponent implements OnInit {
  internships: AdminInternship[] = [];
  loading = false;
  error = '';
  success = '';
  sortBy = '';
  filterBy = '';
  filterValue = '';
  deleting: string | null = null;

  constructor(private adminService: AdminService) { }

  ngOnInit() {
    this.loadInternships();
  }

  loadInternships() {
    this.loading = true;
    this.adminService.getAllInternships(this.sortBy, this.filterBy, this.filterValue).subscribe({
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

  deleteInternship(id: string) {
    if (!confirm('Are you sure you want to delete this internship?')) {
      return;
    }

    this.deleting = id;
    this.adminService.deleteInternship(id).subscribe({
      next: () => {
        this.success = 'Internship deleted successfully';
        this.deleting = null;
        this.loadInternships();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error.message || 'Failed to delete internship';
        this.deleting = null;
      }
    });
  }
}