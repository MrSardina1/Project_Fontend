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
          <h2 class="mb-4">User Management</h2>

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
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Profile</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (user of users; track user._id) {
                      <tr>
                        <td>
                          <img 
                            [src]="getProfilePicture(user.profilePicture)" 
                            class="rounded-circle"
                            width="40" 
                            height="40"
                            alt="Profile">
                        </td>
                        <td>{{ user.username }}</td>
                        <td>{{ user.email }}</td>
                        <td>
                          <span class="badge" [class]="getRoleBadgeClass(user.role)">
                            {{ user.role }}
                          </span>
                        </td>
                        <td>{{ user.createdAt | date:'short' }}</td>
                        <td>
                          @if (user.role !== 'ADMIN') {
                            <button 
                              class="btn btn-sm btn-danger" 
                              (click)="deleteUser(user._id)"
                              [disabled]="deleting === user._id">
                              @if (deleting === user._id) {
                                <span class="spinner-border spinner-border-sm"></span>
                              } @else {
                                Delete
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
    </div>
  `,
  styles: [`
    .admin-container {
      display: flex;
      min-height: 100vh;
    }

    .admin-sidebar {
      width: 250px;
      background: #2c3e50;
      padding: 20px;
      position: fixed;
      height: 100vh;
      overflow-y: auto;
    }

    .admin-sidebar .nav-link {
      color: #ecf0f1;
      padding: 12px 15px;
      border-radius: 5px;
      margin-bottom: 5px;
      transition: all 0.3s;
    }

    .admin-sidebar .nav-link:hover {
      background: #34495e;
      padding-left: 20px;
    }

    .admin-sidebar .nav-link.active {
      background: #3498db;
      color: white;
    }

    .admin-content {
      margin-left: 250px;
      flex: 1;
      background: #f8f9fa;
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

  constructor(private adminService: AdminService) {}

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

  deleteUser(id: string) {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    this.deleting = id;
    this.adminService.deleteUser(id).subscribe({
      next: () => {
        this.success = 'User deleted successfully';
        this.deleting = null;
        this.loadUsers();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error.message || 'Failed to delete user';
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