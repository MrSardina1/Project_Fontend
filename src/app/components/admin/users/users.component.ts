import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService, AdminUser } from '../../../services/admin.service';
import { ImagePathPipe } from '../../../pipes/image-path.pipe';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ImagePathPipe],
  template: `
    <div class="page-container py-4">
      <div class="container-fluid">
        <h2 class="mb-4 fw-800">User Management</h2>

          <!-- Filters Toolbar -->
          <div class="card mb-4 shadow-sm border-0 rounded-4 overflow-hidden">
            <div class="card-body p-3">
              <div class="row g-3 align-items-center">
                <!-- Search & Role Value -->
                <div class="col-lg-4 col-md-12">
                  <div class="search-box">
                    <i class="bi bi-search search-icon"></i>
                    @if (filterBy === 'role') {
                      <select class="form-select search-input" [(ngModel)]="filterValue" (change)="loadUsers()">
                        <option value="">All Roles</option>
                        <option value="STUDENT">Student</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    } @else {
                      <input 
                        type="text" 
                        class="form-control search-input" 
                        [(ngModel)]="filterValue" 
                        (input)="onSearchChange()"
                        [disabled]="!filterBy"
                        [placeholder]="filterBy ? 'Search by ' + (filterBy | titlecase) + '...' : 'Select a category'">
                    }
                    @if (filterValue) {
                      <button class="btn btn-clear" (click)="filterValue = ''; loadUsers()">
                        <i class="bi bi-x-lg"></i>
                      </button>
                    }
                  </div>
                </div>

                <!-- Dropdowns -->
                <div class="col-lg-5 col-md-12">
                  <div class="d-flex flex-wrap gap-2">
                    <div class="filter-item flex-grow-1">
                      <div class="input-group">
                        <span class="input-group-text border-0 bg-light"><i class="bi bi-circle-half text-primary small"></i></span>
                        <select class="form-select border-0 bg-light rounded-end-3" [(ngModel)]="status" (change)="loadUsers()">
                          <option value="">Status: All</option>
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                          <option value="DELETED">Deleted</option>
                        </select>
                      </div>
                    </div>

                    <div class="filter-item flex-grow-1">
                      <div class="input-group">
                        <span class="input-group-text border-0 bg-light"><i class="bi bi-funnel text-primary small"></i></span>
                        <select class="form-select border-0 bg-light rounded-end-3" [(ngModel)]="filterBy" (change)="filterValue = ''; loadUsers()">
                          <option value="">Filter By: None</option>
                          <option value="name">Name</option>
                          <option value="email">Email</option>
                          <option value="role">Role</option>
                        </select>
                      </div>
                    </div>

                    <div class="filter-item flex-grow-1">
                      <div class="input-group">
                        <span class="input-group-text border-0 bg-light"><i class="bi bi-sort-down text-primary small"></i></span>
                        <select class="form-select border-0 bg-light rounded-end-3" [(ngModel)]="sortBy" (change)="loadUsers()">
                          <option value="">Sort: Default</option>
                          <option value="name">Name (A-Z)</option>
                          <option value="email">Email (A-Z)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="col-lg-3 col-md-12 d-flex gap-2 justify-content-lg-end">
                  @if (filterBy || sortBy || filterValue || status) {
                    <button class="btn btn-outline-secondary btn-toolbar rounded-3 px-3 d-flex align-items-center gap-2" (click)="resetFilters()" title="Reset Filters">
                      <i class="bi bi-arrow-counterclockwise"></i>
                    </button>
                  }
                  <button class="btn btn-primary rounded-3 px-4 py-2 d-flex align-items-center gap-2 flex-grow-1 flex-lg-grow-0 justify-content-center" (click)="showAddModal = true">
                    <i class="bi bi-person-plus-fill"></i>
                    <span>Add User</span>
                  </button>
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


          <!-- Card Grid Layout -->
          @if (users.length === 0 && !loading) {
            <div class="empty-state text-center py-5">
              <div class="empty-icon mb-4">
                <i class="bi bi-people text-muted"></i>
              </div>
              <h3 class="fw-700 mb-2">No Users Found</h3>
              <p class="text-muted mb-4">No users match your current filters.</p>
              <button class="btn btn-primary rounded-pill px-4 shadow-sm" (click)="resetFilters()">
                <i class="bi bi-arrow-counterclockwise me-2"></i>Clear Filters
              </button>
            </div>
          }

          <div class="row g-4 row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xxl-4">
            @for (user of users; track user._id) {
              <div class="col">
                <div class="user-card h-100" 
                     [class.user-card-deleted]="user.deletedAt"
                     [class.user-card-inactive]="!user.isActive && !user.deletedAt">
                  <div class="card-body p-4">
                    <!-- User Header -->
                    <div class="user-header mb-4">
                      <div class="d-flex align-items-start gap-3">
                        <div class="avatar-ring-xl shadow-sm">
                          @if (user.profilePicture) {
                            <img 
                              [src]="user.profilePicture | imagePath" 
                              class="avatar-img-xl"
                              alt="Profile">
                          } @else {
                            <div class="avatar-white-content-xl">
                              {{ (user.name || user.username || 'U').charAt(0).toUpperCase() }}
                            </div>
                          }
                        </div>
                        <div class="flex-grow-1">
                          <h5 class="user-name mb-2">{{ user.username }}</h5>
                          
                          <!-- Role Badge -->
                          <span class="role-badge" [class]="getRoleBadgeClass(user.role)">
                            {{ user.role }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- User Info -->
                    <div class="user-info mb-4">
                      <div class="info-item mb-2">
                        <i class="bi bi-envelope text-muted me-2"></i>
                        <span class="text-muted small">{{ user.email }}</span>
                      </div>
                      <div class="info-item">
                        <i class="bi bi-calendar3 text-muted me-2"></i>
                        <span class="text-muted small">Joined {{ user.createdAt | date:'mediumDate' }}</span>
                      </div>
                    </div>

                    <!-- Status Badge -->
                    <div class="mb-4">
                      @if (user.deletedAt) {
                        <span class="status-badge status-deleted">
                          <i class="bi bi-trash me-1"></i>Deleted
                        </span>
                      } @else if (user.role === 'COMPANY' && user.companyStatus === 'PENDING') {
                        <span class="status-badge status-pending">
                          <i class="bi bi-hourglass-split me-1"></i>Pending
                        </span>
                      } @else if (user.role === 'COMPANY' && user.companyStatus === 'REJECTED') {
                        <span class="status-badge status-rejected">
                          <i class="bi bi-x-circle me-1"></i>Rejected
                        </span>
                      } @else if (user.isActive) {
                        <span class="status-badge status-active">
                          <i class="bi bi-check-circle me-1"></i>Active
                        </span>
                      } @else {
                        <span class="status-badge status-inactive">
                          <i class="bi bi-person-x me-1"></i>Deactivated
                        </span>
                      }
                    </div>

                    <div class="card-actions pt-3 border-top">
                      <div class="d-flex gap-2 mb-3">
                        @if (user.deletedAt) {
                          <button class="btn btn-outline-secondary btn-sm flex-grow-1 rounded-pill" disabled>
                            <i class="bi bi-person me-1"></i>View Profile
                          </button>
                        } @else {
                          <a [routerLink]="user.role === 'COMPANY' ? ['/profile/company', user.companyId] : ['/profile/user', user._id]" 
                             class="btn btn-outline-primary btn-sm flex-grow-1 rounded-pill">
                            <i class="bi bi-person me-1"></i>View Profile
                          </a>
                        }
                      </div>

                      @if (user.role !== 'ADMIN') {
                        <div class="d-flex gap-2 justify-content-center">
                          @if (user.deletedAt) {
                            <!-- Deleted State: Only Restore -->
                            <button 
                              class="btn-action btn-restore"
                              (click)="restoreUser(user)"
                              [disabled]="deleting === user._id"
                              title="Restore User">
                              @if (deleting === user._id) {
                                <span class="spinner-border spinner-border-sm"></span>
                              } @else {
                                <i class="bi bi-arrow-counterclockwise"></i>
                              }
                            </button>
                          } @else if (!user.isActive) {
                            <!-- Deactivated State: Activate and Delete -->
                            <button 
                              class="btn-action btn-activate"
                              (click)="toggleUserStatus(user)"
                              [disabled]="deleting === user._id"
                              title="Activate User">
                              <i class="bi bi-person-check"></i>
                            </button>
                            <button 
                              class="btn-action btn-delete" 
                              (click)="confirmDelete(user)"
                              [disabled]="deleting === user._id"
                              title="Delete User">
                              <i class="bi bi-trash"></i>
                            </button>
                          } @else {
                            <!-- Active State: Edit, Deactivate, Delete -->
                            <button 
                              class="btn-action btn-edit"
                              (click)="openEditModal(user)"
                              [disabled]="deleting === user._id"
                              title="Edit User">
                              <i class="bi bi-pencil"></i>
                            </button>
                            <button 
                              class="btn-action btn-deactivate"
                              (click)="toggleUserStatus(user)"
                              [disabled]="deleting === user._id"
                              title="Deactivate User">
                              <i class="bi bi-person-x"></i>
                            </button>
                            <button 
                              class="btn-action btn-delete" 
                              (click)="confirmDelete(user)"
                              [disabled]="deleting === user._id"
                              title="Delete User">
                              <i class="bi bi-trash"></i>
                            </button>
                          }
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
      </div>
    </div>

    <!-- Add User Modal -->
    @if (showAddModal) {
      <div class="modal-backdrop"></div>
      <div class="modal d-block" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Add New User</h5>
              <button type="button" class="btn-close btn-close-white" (click)="showAddModal = false"></button>
            </div>
            <div class="modal-body p-4">
              <form (ngSubmit)="addUser()">
                <div class="mb-3">
                  <label class="form-label">Username *</label>
                  <input type="text" class="form-control" [(ngModel)]="newUser.username" name="username" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Email Address *</label>
                  <input type="email" class="form-control" [(ngModel)]="newUser.email" name="email" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Password *</label>
                  <input type="password" class="form-control" [(ngModel)]="newUser.password" name="password" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Role</label>
                  <select class="form-select" [(ngModel)]="newUser.role" name="role">
                    <option value="STUDENT">Student</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                @if (newUser.role === 'COMPANY') {
                  <div class="mb-3">
                    <label class="form-label">Company Name</label>
                    <input type="text" class="form-control" [(ngModel)]="newUser.name" name="name">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Website</label>
                    <input type="url" class="form-control" [(ngModel)]="newUser.website" name="website">
                  </div>
                } @else {
                  <div class="mb-3">
                    <label class="form-label">Full Name</label>
                    <input type="text" class="form-control" [(ngModel)]="newUser.name" name="name">
                  </div>
                }

                <div class="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" class="btn btn-outline-secondary" (click)="showAddModal = false">Cancel</button>
                  <button type="submit" class="btn btn-primary px-4">Create User</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Edit User Modal -->
    @if (showEditModal) {
      <div class="modal-backdrop"></div>
      <div class="modal d-block" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header bg-primary">
              <h5 class="modal-title">Edit User</h5>
              <button type="button" class="btn-close btn-close-white" (click)="showEditModal = false"></button>
            </div>
            <div class="modal-body p-4">
              <form (ngSubmit)="updateUser()">
                <div class="mb-3">
                  <label class="form-label">Username *</label>
                  <input type="text" class="form-control" [(ngModel)]="editingUser.username" name="username" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Email Address *</label>
                  <input type="email" class="form-control" [(ngModel)]="editingUser.email" name="email" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Role</label>
                  <select class="form-select" [(ngModel)]="editingUser.role" name="role">
                    <option value="STUDENT">Student</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label">Full Name</label>
                  <input type="text" class="form-control" [(ngModel)]="editingUser.name" name="name">
                </div>

                <div class="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" class="btn btn-outline-secondary" (click)="showEditModal = false">Cancel</button>
                  <button type="submit" class="btn btn-primary px-4">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page-container { width: 100%; min-width: 0; animation: fadeIn 0.5s ease-out; }
    .container-fluid { padding: 1.5rem; max-width: 100%; }
    
    .fw-500 { font-weight: 500; }
    .fw-600 { font-weight: 600; }
    .fw-700 { font-weight: 700; }
    .fw-800 { font-weight: 800; }
    .card { border: none; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); width: 100%; margin-bottom: 2rem; }
    .card-body { padding: 1.25rem; overflow: visible; }

    /* User Cards */
    .user-card {
      background: white;
      border-radius: 20px;
      border: 1px solid #f1f5f9;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      overflow: hidden;
    }

    .user-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px -12px rgba(79, 70, 229, 0.15);
      border-color: #e2e8f0;
    }

    .user-card-deleted {
      opacity: 0.6;
      background: #f8fafc;
    }

    .user-card-deleted img {
      filter: grayscale(1);
    }

    .user-card-inactive {
      opacity: 0.75;
      background: #fafafa;
    }

    .user-card-inactive img {
      filter: grayscale(0.5);
    }

    /* User Header */
    .user-header {
      padding-bottom: 1rem;
      border-bottom: 2px solid #f8fafc;
    }

    .avatar-ring-xl {
      width: 70px;
      height: 70px;
      padding: 3px;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .avatar-img-xl {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid white;
    }

    .avatar-white-content-xl {
      width: 100%;
      height: 100%;
      background: white;
      color: #4f46e5;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.8rem;
      border: 2px solid white;
    }

    .user-name {
      font-weight: 700;
      color: #1e293b;
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
    }

    /* Role Badges */
    .role-badge {
      padding: 0.35rem 1rem;
      border-radius: 50px;
      font-weight: 700;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border: 1.5px solid;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .role-admin {
      background-color: rgba(239, 68, 68, 0.08);
      border-color: rgba(239, 68, 68, 0.3);
      color: #dc2626;
    }

    .role-company {
      background-color: rgba(79, 70, 229, 0.08);
      border-color: rgba(79, 70, 229, 0.3);
      color: #4f46e5;
    }

    .role-student {
      background-color: rgba(79, 70, 229, 0.08);
      border-color: rgba(79, 70, 229, 0.3);
      color: #4f46e5;
    }

    /* Status Badges */
    .status-badge {
      padding: 0.4rem 0.9rem;
      border-radius: 50px;
      font-weight: 600;
      font-size: 0.75rem;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .status-active {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.2);
    }

    .status-inactive {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .status-pending {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.2);
    }

    .status-rejected {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .status-deleted {
      background: rgba(100, 116, 139, 0.1);
      color: #64748b;
      border: 1px solid rgba(100, 116, 139, 0.2);
    }

    /* User Info */
    .user-info {
      background: #f8fafc;
      padding: 1rem;
      border-radius: 12px;
    }

    .info-item {
      display: flex;
      align-items: center;
      font-size: 0.875rem;
    }

    /* Card Actions */
    .card-actions {
      margin-top: 1rem;
    }

    .btn-action {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      transition: all 0.2s;
      cursor: pointer;
    }

    .btn-edit {
      background: #eff6ff;
      color: #3b82f6;
    }

    .btn-edit:hover {
      background: #3b82f6;
      color: white;
      transform: scale(1.1);
    }

    .btn-deactivate {
      background: #fef3c7;
      color: #f59e0b;
    }

    .btn-deactivate:hover {
      background: #f59e0b;
      color: white;
      transform: scale(1.1);
    }

    .btn-delete {
      background: #fef2f2;
      color: #ef4444;
    }

    .btn-delete:hover {
      background: #ef4444;
      color: white;
      transform: scale(1.1);
    }

    .btn-activate {
      background: #d1fae5;
      color: #10b981;
    }

    .btn-activate:hover {
      background: #10b981;
      color: white;
      transform: scale(1.1);
    }

    .btn-restore {
      background: #dbeafe;
      color: #3b82f6;
    }

    .btn-restore:hover {
      background: #3b82f6;
      color: white;
      transform: scale(1.1);
    }

    /* Empty State */
    .empty-state {
      background: white;
      border-radius: 24px;
      padding: 4rem 2rem;
      border: 2px dashed #e2e8f0;
    }

    .empty-icon {
      font-size: 5rem;
      opacity: 0.3;
    }

    /* Filter Toolbar */
    .search-box {
      position: relative;
      display: flex;
      align-items: center;
    }
    .search-icon {
      position: absolute;
      left: 1rem;
      color: #64748b;
      z-index: 10;
    }
    .search-input {
      padding-left: 2.75rem;
      padding-right: 2.75rem;
      background-color: #f8fafc;
      border: 1.5px solid transparent;
      border-radius: 12px;
      height: 48px;
      transition: all 0.2s;
    }
    .search-input:focus {
      background-color: white !important;
      border-color: #4f46e5 !important;
      box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1) !important;
    }
    .btn-clear {
      position: absolute;
      right: 0.5rem;
      padding: 0.25rem 0.5rem;
      color: #94a3b8;
      border: none;
      background: none;
      z-index: 10;
    }
    .btn-clear:hover { color: #475569; }

    .filter-item .input-group-text {
      background-color: #f8fafc;
      color: #64748b;
      padding-right: 0;
      border-radius: 12px 0 0 12px;
    }
    .filter-item .form-select {
      height: 48px !important;
      background-color: #f8fafc;
      border-radius: 0 12px 12px 0;
      font-weight: 500;
      color: #1e293b;
      cursor: pointer;
      border: none !important;
    }
    
    .btn-toolbar {
      height: 48px;
      border: 1.5px solid #e2e8f0;
      color: #64748b;
      font-weight: 600;
      transition: all 0.2s;
      background: white;
    }
    .btn-toolbar:hover {
      background-color: #f8fafc;
      border-color: #cbd5e1;
      color: #1e293b;
    }

    .hover-underline:hover {
      text-decoration: underline !important;
    }

    /* Animations */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Modal Styles */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.5);
      backdrop-filter: blur(4px);
      z-index: 1040;
    }

    .modal {
      display: block;
      z-index: 1050;
    }

    .modal-content {
      border: none;
      border-radius: 16px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .modal-header {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: white;
      border-radius: 16px 16px 0 0;
      padding: 1.25rem 1.5rem;
    }

    .btn-close-white {
      filter: brightness(0) invert(1);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .container-fluid {
        padding: 1rem;
      }
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
  status = '';
  deleting: string | null = null;

  showAddModal = false;
  showEditModal = false;

  newUser = {
    username: '',
    email: '',
    password: '',
    role: 'STUDENT',
    name: '',
    website: ''
  };

  editingUser: any = {};

  private searchSubject = new Subject<{ value: string, filter: string }>();

  constructor(private adminService: AdminService) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged((prev, curr) => prev.value === curr.value && prev.filter === curr.filter)
    ).subscribe(() => {
      this.loadUsers();
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  onSearchChange() {
    this.searchSubject.next({ value: this.filterValue, filter: this.filterBy });
  }

  loadUsers() {
    this.loading = true;
    this.adminService.getAllUsers(this.sortBy, this.filterBy, this.filterValue, this.status).subscribe({
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

  openEditModal(user: any) {
    this.editingUser = { ...user };
    this.showEditModal = true;
  }

  updateUser() {
    if (!this.editingUser._id) return;

    this.loading = true;
    const { _id, ...updateData } = this.editingUser;

    this.adminService.updateUser(_id, updateData).subscribe({
      next: () => {
        this.success = 'User updated successfully';
        this.showEditModal = false;
        this.loadUsers();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error.message || 'Failed to update user';
        this.loading = false;
      }
    });
  }

  restoreUser(user: AdminUser) {
    if (!confirm(`Are you sure you want to restore user "${user.username}"?`)) {
      return;
    }

    this.deleting = user._id;
    this.adminService.restoreUser(user._id).subscribe({
      next: () => {
        this.success = 'User restored successfully';
        this.deleting = null;
        this.loadUsers();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error.message || 'Failed to restore user';
        this.deleting = null;
      }
    });
  }

  resetFilters() {
    this.status = '';
    this.sortBy = '';
    this.filterBy = '';
    this.filterValue = '';
    this.loadUsers();
  }

  addUser() {
    if (!this.newUser.username || !this.newUser.email || !this.newUser.password) {
      this.error = 'Please fill in all required fields';
      return;
    }

    this.loading = true;
    this.adminService.createUser(this.newUser).subscribe({
      next: () => {
        this.success = 'User created successfully';
        this.showAddModal = false;
        this.resetNewUser();
        this.loadUsers();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error.message || 'Failed to create user';
        this.loading = false;
      }
    });
  }

  resetNewUser() {
    this.newUser = {
      username: '',
      email: '',
      password: '',
      role: 'STUDENT',
      name: '',
      website: ''
    };
  }

  promoteToAdmin(user: AdminUser) {
    // Hidden in UI but kept for logic if needed elsewhere
  }

  confirmDelete(user: AdminUser) {
    if (!confirm(`Are you sure you want to permanently delete user "${user.username}"? This will move them to the archive.`)) {
      return;
    }

    this.deleting = user._id;
    this.adminService.softDeleteUser(user._id).subscribe({
      next: (response) => {
        this.success = response.message;
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
        return 'role-admin';
      case 'COMPANY':
        return 'role-company';
      case 'STUDENT':
        return 'role-student';
      default:
        return 'role-secondary';
    }
  }

  getProfilePicture(picture?: string): string {
    return picture ? `http://localhost:3000/${picture}` : '/assets/default-profile.png';
  }
}