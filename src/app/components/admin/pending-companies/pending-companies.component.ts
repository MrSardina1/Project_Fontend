import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService, AdminCompany } from '../../../services/admin.service';
import { ImagePathPipe } from '../../../pipes/image-path.pipe';

@Component({
  selector: 'app-pending-companies',
  standalone: true,
  imports: [CommonModule, RouterModule, ImagePathPipe],
  template: `
    <div class="page-container py-4">
      <div class="container-fluid">
        <h2 class="mb-4 fw-800">Pending Company Verifications</h2>

          @if (loading) {
            <div class="text-center py-5">
              <div class="spinner-border text-primary"></div>
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

          <div class="card">
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Email</th>
                      <th>Website</th>
                      <th>Submitted</th>
                      <th class="text-end">Verification</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (company of companies; track company._id) {
                      <tr>
                        <td class="p-0">
                          <div class="d-flex align-items-center gap-3 p-3 h-100">
                             <div class="avatar-ring shadow-sm">
                               @if (company.profilePicture || company.user?.profilePicture) {
                                 <img 
                                   [src]="(company.profilePicture || company.user?.profilePicture) | imagePath" 
                                   class="avatar-img"
                                   alt="Profile">
                               } @else {
                                 <div class="avatar-white-content">
                                   {{ (company.name || 'C').charAt(0).toUpperCase() }}
                                 </div>
                               }
                             </div>
                             <div class="d-flex flex-column">
                               <span class="fw-600 text-dark">{{ company.name }}</span>
                               <a [routerLink]="['/profile/company', company._id]" 
                                  class="text-primary small text-decoration-none fw-500 hover-underline mt-1">
                                 <i class="bi bi-person me-1"></i>View Profile
                               </a>
                             </div>
                          </div>
                        </td>
                        <td class="text-muted">{{ company.email }}</td>
                        <td>
                          @if (company.website) {
                            <a [href]="company.website" target="_blank" class="btn btn-sm btn-light-primary">
                              <i class="bi bi-link-45deg"></i> Website
                            </a>
                          } @else {
                            <span class="text-muted">-</span>
                          }
                        </td>
                        <td class="small text-muted">{{ company.createdAt | date:'mediumDate' }}</td>
                        <td class="text-end">
                          <div class="d-flex justify-content-end gap-2">
                            <button 
                              class="btn btn-sm btn-outline-success d-flex align-items-center gap-1 px-3" 
                              (click)="verifyCompany(company._id, 'APPROVED')"
                              [disabled]="verifying === company._id">
                              @if (verifying === company._id && verifyingStatus === 'APPROVED') {
                                <span class="spinner-border spinner-border-sm"></span>
                              } @else {
                                <i class="bi bi-check-circle"></i> Approve
                              }
                            </button>
                            <button 
                              class="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 px-3" 
                              (click)="verifyCompany(company._id, 'REJECTED')"
                              [disabled]="verifying === company._id">
                              @if (verifying === company._id && verifyingStatus === 'REJECTED') {
                                <span class="spinner-border spinner-border-sm"></span>
                              } @else {
                                <i class="bi bi-x-circle"></i> Reject
                              }
                            </button>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              @if (companies.length === 0 && !loading) {
                <div class="alert alert-info rounded-4 border-0 mt-3 d-flex align-items-center">
                  <i class="bi bi-check-circle-fill me-2"></i>
                  No pending companies to review.
                </div>
              }
            </div>
          </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { width: 100%; min-width: 0; animation: fadeIn 0.5s ease-out; }
    .container-fluid { padding: 1.5rem; max-width: 100%; }
    .table-responsive { width: 100%; overflow-x: auto; }
    .table { min-width: 900px; margin-bottom: 0; }
    
    .fw-500 { font-weight: 500; }
    .fw-600 { font-weight: 600; }
    .fw-800 { font-weight: 800; }
    .card { border: none; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); width: 100%; }
    .card-body { padding: 1.25rem; }

    .avatar-ring {
      position: relative;
      width: 44px;
      height: 44px;
      padding: 2px;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .avatar-white-content {
      width: 100%;
      height: 100%;
      background: white;
      color: #4f46e5;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.1rem;
      text-transform: uppercase;
      border: 1.5px solid white;
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 1.5px solid white;
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
      padding: 0.45rem 1rem;
      border-radius: 50px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .btn-light-primary {
      background-color: #eef2ff;
      color: #4f46e5;
      border: none;
    }
    .btn-light-primary:hover {
      background-color: #4f46e5;
      color: white;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .hover-underline:hover {
      text-decoration: underline !important;
    }
  `]
})
export class PendingCompaniesComponent implements OnInit {
  companies: AdminCompany[] = [];
  loading = false;
  error = '';
  success = '';
  verifying: string | null = null;
  verifyingStatus: 'APPROVED' | 'REJECTED' | null = null;

  constructor(private adminService: AdminService) { }

  ngOnInit() {
    this.loadPendingCompanies();
  }

  loadPendingCompanies() {
    this.loading = true;
    this.adminService.getPendingCompanies().subscribe({
      next: (data) => {
        this.companies = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load pending companies';
        this.loading = false;
      }
    });
  }

  verifyCompany(id: string, status: 'APPROVED' | 'REJECTED') {
    const action = status === 'APPROVED' ? 'approve' : 'reject';
    if (!confirm(`Are you sure you want to ${action} this company?`)) {
      return;
    }

    this.verifying = id;
    this.verifyingStatus = status;

    this.adminService.verifyCompany(id, status).subscribe({
      next: () => {
        this.success = `Company ${status.toLowerCase()} successfully!`;
        this.verifying = null;
        this.verifyingStatus = null;
        this.loadPendingCompanies();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error.message || 'Failed to verify company';
        this.verifying = null;
        this.verifyingStatus = null;
      }
    });
  }
}