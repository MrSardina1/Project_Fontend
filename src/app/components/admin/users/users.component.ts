import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService, AdminUser } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-container py-4">
      <div class="container-fluid">
        <h2 class="mb-4 fw-800">User Management</h2>

          <!-- Filters -->
          <div class="card mb-4">
            <div class="card-body">
              <div class="row">
                <div class="col-md-4">
                  <label class="form-label">Sort By</label>
                  <select class="form-select" [(ngModel)]="sortBy" (change)="loadUsers()">
                    <option value="">Default (Newest First)</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="email">Email (A-Z)</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Filter By</label>
                  <select class="form-select" [(ngModel)]="filterBy" (change)="filterValue = ''; loadUsers()">
                    <option value="">No Filter</option>
                    <option value="name">Name</option>
                    <option value="email">Email</option>
                    <option value="role">Role</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Search</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    [(ngModel)]="filterValue" 
                    (input)="loadUsers()"
                    [disabled]="!filterBy"
                    placeholder="Enter search term...">
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
                <table class="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th class="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (user of users; track user._id) {
                      <tr [class.deactivated-row]="!user.isActive">
                        <td>
                          <div class="d-flex align-items-center gap-3">
                            <div class="avatar-container">
                              <img 
                                [src]="getProfilePicture(user.profilePicture)" 
                                class="rounded-circle"
                                width="40" 
                                height="40"
                                alt="Profile">
                              @if (!user.isActive) {
                                <div class="status-dot offline"></div>
                              } @else {
                                <div class="status-dot online"></div>
                              }
                            </div>
                            <span class="user-name fw-600">{{ user.username }}</span>
                          </div>
                        </td>
                        <td class="text-muted">{{ user.email }}</td>
                        <td>
                          <span class="badge" [class]="getRoleBadgeClass(user.role)">
                            {{ user.role }}
                          </span>
                        </td>
                        <td>
                          @if (user.isActive) {
                            <span class="badge bg-success-light text-success border-success-subtle">
                              <i class="bi bi-check-circle me-1"></i>Active
                            </span>
                          } @else {
                            <span class="badge bg-danger-light text-danger border-danger-subtle">
                              <i class="bi bi-x-circle me-1"></i>Deactivated
                            </span>
                          }
                        </td>
                        <td class="small text-muted">{{ user.createdAt | date:'mediumDate' }}</td>
                        <td class="text-end">
                          @if (user.role !== 'ADMIN') {
                            <button 
                              class="btn btn-sm" 
                              [class]="user.isActive ? 'btn-outline-danger' : 'btn-outline-success'"
                              (click)="toggleUserStatus(user)"
                              [disabled]="deleting === user._id">
                              @if (deleting === user._id) {
                                <span class="spinner-border spinner-border-sm"></span>
                              } @else {
                                <i class="bi" [class]="user.isActive ? 'bi-person-x' : 'bi-person-check'"></i>
                                {{ user.isActive ? 'Deactivate' : 'Activate' }}
                              }
                            </button>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              @if (users.length === 0 && !loading) {
                <div class="alert alert-info">
                  No users found.
                </div>
              }
            </div>
          </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { width: 100%; animation: fadeIn 0.5s ease-out; }
    .fw-600 { font-weight: 600; }
    .fw-800 { font-weight: 800; }
    .card { border: none; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    
    .deactivated-row {
      background-color: #f8fafc;
      opacity: 0.7;
    }
    
    .deactivated-row img {
      filter: grayscale(1);
    }

    .avatar-container {
      position: relative;
      display: inline-block;
    }

    .status-dot {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid white;
    }
    
    .status-dot.online { background-color: #10b981; }
    .status-dot.offline { background-color: #94a3b8; }

    .bg-success-light { background-color: #f0fdf4; }
    .bg-danger-light { background-color: #fef2f2; }
    
    .badge {
      padding: 6px 12px;
      border-radius: 8px;
      font-weight: 500;
    }

    .table thead th {
      border-top: none;
      background: #f8fafc;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      padding: 1rem;
    }

    .table tbody td {
      padding: 1rem;
      border-bottom: 1px solid #f1f5f9;
    }

    .btn-sm {
      padding: 0.4rem 0.8rem;
      border-radius: 8px;
      font-weight: 500;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class AdminUsersComponent implements OnInit {
  users: AdminUser[] = [];
  loading = false;
  error = '';
  success = '';
  sortBy = '';
  filterBy = '';
  filterValue = '';
  deleting: string | null = null;

  constructor(private adminService: AdminService) { }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.adminService.getAllUsers(this.sortBy, this.filterBy, this.filterValue).subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load users';
        this.loading = false;
      }
    });
  }

  toggleUserStatus(user: AdminUser) {
    const action = user.isActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    this.deleting = user._id;
    this.adminService.deleteUser(user._id).subscribe({
      next: (response) => {
        this.success = response.message;
        this.deleting = null;
        this.loadUsers();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error.message || `Failed to ${action} user`;
        this.deleting = null;
      }
    });
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'bg-danger';
      case 'COMPANY':
        return 'bg-primary';
      case 'STUDENT':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  }

  getProfilePicture(picture?: string): string {
    return picture ? `http://localhost:3000/${picture}` : '/assets/default-profile.png';
  }
}