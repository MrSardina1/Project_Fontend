import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-reviews',
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
          <h2 class="mb-4">Review Management</h2>

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

          @for (review of reviews; track review._id) {
            <div class="card mb-3">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div class="flex-grow-1">
                    <h5>{{ review.company.name }}</h5>
                    <div class="text-warning mb-2">
                      @for (star of [1,2,3,4,5]; track star) {
                        <span>{{ star <= review.rating ? '★' : '☆' }}</span>
                      }
                    </div>
                    <p class="mb-1">
                      <strong>By:</strong> {{ review.user.username }} ({{ review.user.email }})
                    </p>
                    @if (review.comment) {
                      <p class="mb-0">{{ review.comment }}</p>
                    }
                    <small class="text-muted">{{ review.createdAt | date:'short' }}</small>
                  </div>
                  <div>
                    <button 
                      class="btn btn-sm btn-danger" 
                      (click)="deleteReview(review._id)"
                      [disabled]="deleting === review._id">
                      @if (deleting === review._id) {
                        <span class="spinner-border spinner-border-sm"></span>
                      } @else {
                        Delete
                      }
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }

          @if (reviews.length === 0 && !loading) {
            <div class="alert alert-info">
              No reviews found.
            </div>
          }
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
export class AdminReviewsComponent implements OnInit {
  reviews: any[] = [];
  loading = false;
  error = '';
  success = '';
  deleting: string | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadReviews();
  }

  loadReviews() {
    this.loading = true;
    this.adminService.getAllReviews().subscribe({
      next: (data) => {
        this.reviews = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load reviews';
        this.loading = false;
      }
    });
  }

  deleteReview(id: string) {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    this.deleting = id;
    this.adminService.deleteReview(id).subscribe({
      next: () => {
        this.success = 'Review deleted successfully';
        this.deleting = null;
        this.loadReviews();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error.message || 'Failed to delete review';
        this.deleting = null;
      }
    });
  }
}