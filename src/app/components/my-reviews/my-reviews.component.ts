import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ReviewService, Review } from '../../services/review.service';
import { ImagePathPipe } from '../../pipes/image-path.pipe';

@Component({
  selector: 'app-my-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ImagePathPipe],
  template: `
    <div class="page-container">
      <header class="page-header mb-5">
        <div>
          <h1 class="page-title text-gradient">
            <i class="bi bi-star-fill me-3"></i>My Reviews
          </h1>
          <p class="text-muted">Manage and edit your company reviews</p>
        </div>
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
          <i class="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
          <div>{{ error }}</div>
        </div>
      }

      @if (success) {
        <div class="alert alert-success rounded-4 border-0 shadow-sm d-flex align-items-center mb-4">
          <i class="bi bi-check-circle-fill me-2 fs-5"></i>
          <div>{{ success }}</div>
        </div>
      }

      @if (reviews.length === 0 && !loading) {
        <div class="empty-state text-center py-5">
          <div class="empty-icon mb-4">
            <i class="bi bi-star text-muted"></i>
          </div>
          <h3 class="fw-700 mb-2">No Reviews Yet</h3>
          <p class="text-muted mb-4">You haven't written any company reviews yet.</p>
          <a routerLink="/internships" class="btn btn-primary rounded-pill px-4 shadow-sm">
            <i class="bi bi-search me-2"></i>Explore Companies
          </a>
        </div>
      }

      <div class="row g-4 row-cols-1 row-cols-md-2 row-cols-xl-3">
        @for (review of reviews; track review._id) {
          <div class="col">
            <div class="review-card h-100">
              <div class="card-body p-4">
                <!-- Company Header -->
                <div class="company-header mb-4">
                  <div class="d-flex align-items-center gap-3">
                    <div class="avatar-ring-lg shadow-sm">
                      @if (review.company.profilePicture) {
                        <img 
                          [src]="review.company.profilePicture | imagePath" 
                          class="avatar-img-lg"
                          alt="Company Logo">
                      } @else {
                        <div class="avatar-white-content-lg">
                          {{ review.company.name.charAt(0).toUpperCase() }}
                        </div>
                      }
                    </div>
                    <div class="flex-grow-1">
                      <h5 class="company-name mb-1">{{ review.company.name }}</h5>
                      <a [routerLink]="['/profile/company', review.company._id]" 
                         class="text-primary small text-decoration-none fw-500 hover-underline">
                        <i class="bi bi-building me-1"></i>View Profile
                      </a>
                    </div>
                  </div>
                </div>

                <!-- Rating Section -->
                @if (!editingId || editingId !== review._id) {
                  <div class="rating-display mb-3">
                    <div class="stars-large text-warning">
                      @for (star of [1,2,3,4,5]; track star) {
                        <i class="bi" [class.bi-star-fill]="star <= review.rating" [class.bi-star]="star > review.rating"></i>
                      }
                    </div>
                    <span class="rating-text ms-2">{{ review.rating }}/5</span>
                  </div>

                  @if (review.comment) {
                    <div class="comment-box mb-3">
                      <p class="comment-text mb-0">{{ review.comment }}</p>
                    </div>
                  }

                  <div class="review-meta d-flex justify-content-between align-items-center">
                    <small class="text-muted">
                      <i class="bi bi-calendar3 me-1"></i>{{ review.createdAt | date:'mediumDate' }}
                    </small>
                    <div class="action-buttons d-flex gap-2">
                      <button class="btn-action btn-edit" (click)="startEdit(review)" title="Edit Review">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn-action btn-delete" (click)="deleteReview(review._id)" title="Delete Review">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                } @else {
                  <!-- Edit Mode -->
                  <div class="edit-section">
                    <div class="mb-4">
                      <label class="form-label fw-600 mb-2">Rating <span class="text-danger">*</span></label>
                      <div class="star-rating-input">
                        @for (star of [1,2,3,4,5]; track star) {
                          <i 
                            class="bi star-clickable"
                            [class.bi-star-fill]="star <= editRating"
                            [class.bi-star]="star > editRating"
                            (click)="editRating = star"
                            (mouseenter)="hoverRating = star"
                            (mouseleave)="hoverRating = 0"
                            [class.text-warning]="star <= (hoverRating || editRating)"
                            [class.text-muted]="star > (hoverRating || editRating)">
                          </i>
                        }
                        @if (editRating > 0) {
                          <span class="ms-2 text-muted small">{{ editRating }} out of 5</span>
                        }
                      </div>
                    </div>

                    <div class="mb-4">
                      <label class="form-label fw-600">Comment (Optional)</label>
                      <textarea 
                        class="form-control rounded-3" 
                        [(ngModel)]="editComment" 
                        rows="3"
                        placeholder="Share your experience..."
                        [disabled]="updating"></textarea>
                    </div>

                    <div class="d-flex gap-2">
                      <button 
                        class="btn btn-primary rounded-pill px-4 flex-grow-1"
                        (click)="saveEdit(review._id)" 
                        [disabled]="updating || editRating === 0">
                        @if (updating) {
                          <span class="spinner-border spinner-border-sm me-2"></span>
                        }
                        Save Changes
                      </button>
                      <button 
                        class="btn btn-outline-secondary rounded-pill px-3"
                        (click)="cancelEdit()"
                        [disabled]="updating">
                        Cancel
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
      animation: fadeIn 0.5s ease-out;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-title {
      font-size: 2.5rem;
      font-weight: 800;
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
    }

    .text-gradient {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* Review Cards */
    .review-card {
      background: white;
      border-radius: 24px;
      border: 1px solid #f1f5f9;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      overflow: hidden;
    }

    .review-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px -12px rgba(79, 70, 229, 0.15);
      border-color: #e2e8f0;
    }

    /* Company Header */
    .company-header {
      padding-bottom: 1rem;
      border-bottom: 2px solid #f8fafc;
    }

    .avatar-ring-lg {
      width: 60px;
      height: 60px;
      padding: 3px;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .avatar-img-lg {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid white;
    }

    .avatar-white-content-lg {
      width: 100%;
      height: 100%;
      background: white;
      color: #4f46e5;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.5rem;
      border: 2px solid white;
    }

    .company-name {
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 0.25rem;
    }

    .hover-underline:hover {
      text-decoration: underline !important;
    }

    .fw-500 { font-weight: 500; }
    .fw-600 { font-weight: 600; }
    .fw-700 { font-weight: 700; }

    /* Rating Display */
    .rating-display {
      display: flex;
      align-items: center;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 16px;
      border-left: 4px solid #ffc107;
    }

    .stars-large {
      font-size: 1.5rem;
      display: flex;
      gap: 0.25rem;
    }

    .rating-text {
      font-weight: 700;
      color: #64748b;
      font-size: 1.1rem;
    }

    /* Comment Box */
    .comment-box {
      background: #f8fafc;
      padding: 1rem;
      border-radius: 12px;
      border-left: 3px solid #e2e8f0;
    }

    .comment-text {
      color: #475569;
      line-height: 1.6;
      font-size: 0.95rem;
    }

    /* Review Meta */
    .review-meta {
      padding-top: 1rem;
      border-top: 1px solid #f1f5f9;
    }

    /* Action Buttons */
    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .btn-action {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
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

    .btn-delete {
      background: #fef2f2;
      color: #ef4444;
    }

    .btn-delete:hover {
      background: #ef4444;
      color: white;
      transform: scale(1.1);
    }

    /* Edit Section */
    .edit-section {
      background: #f8fafc;
      padding: 1.5rem;
      border-radius: 16px;
      margin-top: 1rem;
    }

    .star-rating-input {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .star-clickable {
      font-size: 2rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .star-clickable:hover {
      transform: scale(1.2);
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

    /* Animations */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .page-container {
        padding: 1rem;
      }

      .page-title {
        font-size: 2rem;
      }
    }
  `]
})
export class MyReviewsComponent implements OnInit {
  reviews: Review[] = [];
  loading = false;
  error = '';
  success = '';
  editingId: string | null = null;
  editRating = 0;
  editComment = '';
  updating = false;
  hoverRating = 0;

  constructor(private reviewService: ReviewService) { }

  ngOnInit() {
    this.loadReviews();
  }

  loadReviews() {
    this.loading = true;
    this.reviewService.getMyReviews().subscribe({
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

  startEdit(review: Review) {
    this.editingId = review._id;
    this.editRating = review.rating;
    this.editComment = review.comment || '';
  }

  cancelEdit() {
    this.editingId = null;
    this.editRating = 0;
    this.editComment = '';
    this.hoverRating = 0;
  }

  saveEdit(id: string) {
    this.updating = true;
    this.error = '';
    this.success = '';

    this.reviewService.update(id, {
      rating: this.editRating,
      comment: this.editComment
    }).subscribe({
      next: () => {
        this.success = 'Review updated successfully!';
        this.updating = false;
        this.editingId = null;
        this.loadReviews();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error.message || 'Failed to update review';
        this.updating = false;
      }
    });
  }

  deleteReview(id: string) {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    this.reviewService.delete(id).subscribe({
      next: () => {
        this.success = 'Review deleted successfully!';
        this.loadReviews();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error.message || 'Failed to delete review';
      }
    });
  }
}