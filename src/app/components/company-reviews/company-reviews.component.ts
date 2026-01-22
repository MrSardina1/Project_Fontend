import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReviewService, CompanyReviews, Review } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { ImagePathPipe } from '../../pipes/image-path.pipe';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-company-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ImagePathPipe],
  template: `
    <div class="container mt-4">
      @if (loading) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      }

      @if (companyReviews) {
        <div class="card mb-4 shadow-sm border-0 rounded-4 overflow-hidden">
          <div class="card-body p-4">
            <div class="d-flex align-items-center gap-4">
              <div class="avatar-ring-md shadow-sm">
                @if (companyReviews.company.profilePicture) {
                  <img 
                    [src]="companyReviews.company.profilePicture | imagePath" 
                    class="avatar-img-md"
                    alt="Company Logo">
                } @else {
                  <div class="avatar-white-content-md">
                    {{ (companyReviews.company.name || 'C').charAt(0).toUpperCase() }}
                  </div>
                }
              </div>
              <div>
                <h2 class="fw-800 mb-1">
                  {{ companyReviews.company.name }}
                </h2>
                <p class="text-muted mb-2 d-flex align-items-center gap-2">
                  <i class="bi bi-envelope text-primary"></i> {{ companyReviews.company.email }}
                </p>
                @if (companyReviews.company.website) {
                  <a [href]="companyReviews.company.website" target="_blank" class="btn btn-outline-primary btn-sm rounded-pill px-3">
                    <i class="bi bi-globe me-1"></i> Visit Website
                  </a>
                }
              </div>
            </div>

            <div class="rating-section mt-4 p-4 bg-light rounded-4">
              <div class="row align-items-center">
                <div class="col-auto">
                  <div class="display-4 fw-800 text-dark mb-0">{{ companyReviews.averageRating }}<span class="fs-4 text-muted">/5</span></div>
                </div>
                <div class="col">
                  <div class="text-warning fs-3 mb-1">
                    @for (star of [1,2,3,4,5]; track star) {
                      <span>{{ star <= companyReviews.averageRating ? '★' : '☆' }}</span>
                    }
                  </div>
                  <p class="text-muted mb-0 small">
                    <i class="bi bi-people me-1"></i> Based on {{ companyReviews.totalReviews }} reviews
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        @if ((currentUser$ | async)?.role === 'STUDENT' && !showReviewForm) {
          <button class="btn btn-primary mb-4 rounded-pill px-4 shadow-sm" (click)="showReviewForm = true">
            <i class="bi bi-pencil-square me-2"></i>Write a Review
          </button>
        }

        @if (showReviewForm) {
          <div class="card mb-4 shadow-sm border-0 rounded-4 overflow-hidden">
            <div class="card-body p-4">
              <h4 class="fw-700 mb-4">
                <i class="bi bi-pencil-square me-2 text-primary"></i>Write Your Review
              </h4>

              @if (reviewError) {
                <div class="alert alert-danger rounded-3 mb-3">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ reviewError }}
                </div>
              }

              @if (reviewSuccess) {
                <div class="alert alert-success rounded-3 mb-3">
                  <i class="bi bi-check-circle-fill me-2"></i>{{ reviewSuccess }}
                </div>
              }

              <div class="mb-4">
                <label class="form-label fw-600">Rating <span class="text-danger">*</span></label>
                <div class="star-rating-input">
                  @for (star of [1,2,3,4,5]; track star) {
                    <i 
                      class="bi star-clickable"
                      [class.bi-star-fill]="star <= newRating"
                      [class.bi-star]="star > newRating"
                      (click)="newRating = star"
                      (mouseenter)="hoverRating = star"
                      (mouseleave)="hoverRating = 0"
                      [class.text-warning]="star <= (hoverRating || newRating)"
                      [class.text-muted]="star > (hoverRating || newRating)">
                    </i>
                  }
                  @if (newRating > 0) {
                    <span class="ms-2 text-muted small">{{ newRating }} out of 5</span>
                  }
                </div>
              </div>

              <div class="mb-4">
                <label class="form-label fw-600">Comment (Optional)</label>
                <textarea 
                  class="form-control rounded-3" 
                  rows="4" 
                  [(ngModel)]="newComment"
                  placeholder="Share your experience with this company..."
                  [disabled]="submitting"></textarea>
              </div>

              <div class="d-flex gap-2">
                <button 
                  class="btn btn-primary rounded-pill px-4"
                  (click)="submitReview()"
                  [disabled]="submitting || newRating === 0">
                  @if (submitting) {
                    <span class="spinner-border spinner-border-sm me-2"></span>
                  }
                  Submit Review
                </button>
                <button 
                  class="btn btn-outline-secondary rounded-pill px-4"
                  (click)="cancelReview()"
                  [disabled]="submitting">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        }

        <h3 class="mb-4 fw-800">
          <i class="bi bi-chat-square-text me-2 text-primary"></i>Customer Reviews
        </h3>
        
        <div class="reviews-list">
          @for (review of companyReviews.reviews; track review._id) {
            <div class="card mb-3 shadow-sm border-0 rounded-4">
              <div class="card-body p-4">
                <div class="d-flex justify-content-between align-items-start">
                  <div class="d-flex gap-3">
                    <div class="avatar-ring-sm shadow-sm mt-1">
                      @if (review.user.profilePicture) {
                        <img 
                          [src]="review.user.profilePicture | imagePath" 
                          class="avatar-img-sm"
                          alt="Profile">
                      } @else {
                        <div class="avatar-white-content-sm">
                          {{ (review.user.username || 'U').charAt(0).toUpperCase() }}
                        </div>
                      }
                    </div>
                    <div>
                      <h5 class="mb-1 fw-700">
                        <a [routerLink]="['/profile/user', review.user._id]" class="text-decoration-none text-dark hover-indigo">
                          {{ review.user.username }}
                        </a>
                      </h5>
                      <div class="text-warning small mb-3">
                        @for (star of [1,2,3,4,5]; track star) {
                          <i class="bi" [class]="star <= review.rating ? 'bi-star-fill' : 'bi-star'"></i>
                        }
                      </div>
                      @if (review.comment) {
                        <p class="mb-0 text-muted leading-relaxed">{{ review.comment }}</p>
                      }
                    </div>
                  </div>
                  <small class="text-muted bg-light px-2 py-1 rounded small">
                    {{ review.createdAt | date:'mediumDate' }}
                  </small>
                </div>
              </div>
            </div>
          }
        </div>

        @if (companyReviews.reviews.length === 0) {
          <div class="alert alert-info rounded-4 border-0 shadow-sm p-4">
            <i class="bi bi-info-circle me-2"></i>
            No reviews yet. Be the first to review this company!
          </div>
        }
      }

      @if (error) {
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ error }}
        </div>
      }
    </div>
  `,
  styles: [`
    .fw-700 { font-weight: 700; }
    .fw-800 { font-weight: 800; }
    .leading-relaxed { line-height: 1.6; }
    .hover-indigo:hover { color: #4f46e5 !important; }

    .avatar-ring-md {
      position: relative;
      width: 80px;
      height: 80px;
      padding: 3px;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .avatar-white-content-md {
      width: 100%;
      height: 100%;
      background: white;
      color: #4f46e5;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 2rem;
      text-transform: uppercase;
      border: 2px solid white;
    }

    .avatar-img-md {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid white;
    }

    .avatar-ring-sm {
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

    .avatar-white-content-sm {
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

    .avatar-img-sm {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 1.5px solid white;
    }

    .rating-section {
      border-left: 5px solid #ffc107;
      background-color: #f8fafc !important;
    }

    .card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important;
    }

    .btn {
      transition: all 0.2s ease;
    }

    .btn:hover:not(:disabled) {
      transform: translateY(-1px);
      filter: brightness(1.05);
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

    .fw-600 {
      font-weight: 600;
    }
  `]
})
export class CompanyReviewsComponent implements OnInit {
  companyReviews: CompanyReviews | null = null;
  loading = false;
  error = '';
  showReviewForm = false;
  newRating: number = 0;  // Initialize to 0 (invalid) to force selection
  newComment = '';
  submitting = false;
  reviewError = '';
  reviewSuccess = '';
  hoverRating: number = 0;

  private route = inject(ActivatedRoute);
  private reviewService = inject(ReviewService);
  private authService = inject(AuthService);

  currentUser$: Observable<any> = this.authService.currentUser$;

  ngOnInit() {
    const companyId = this.route.snapshot.paramMap.get('id');
    if (companyId) {
      this.loadReviews(companyId);
    }
  }

  loadReviews(companyId: string) {
    this.loading = true;
    this.reviewService.getCompanyReviews(companyId).subscribe({
      next: (data) => {
        this.companyReviews = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load reviews';
        this.loading = false;
      }
    });
  }

  submitReview() {
    if (!this.companyReviews || this.newRating === 0) {
      this.reviewError = 'Please select a rating';
      return;
    }

    this.submitting = true;
    this.reviewError = '';
    this.reviewSuccess = '';

    // Ensure rating is sent as integer
    const reviewData = {
      companyId: this.companyReviews.company.id,
      rating: parseInt(this.newRating.toString(), 10),
      comment: this.newComment.trim() || undefined
    };

    this.reviewService.create(reviewData).subscribe({
      next: () => {
        this.reviewSuccess = 'Review submitted successfully!';
        this.submitting = false;
        this.cancelReview();
        this.loadReviews(this.companyReviews!.company.id);
        setTimeout(() => this.reviewSuccess = '', 3000);
      },
      error: (err) => {
        this.reviewError = err.error.message || 'Failed to submit review';
        this.submitting = false;
      }
    });
  }

  cancelReview() {
    this.showReviewForm = false;
    this.newRating = 0;
    this.newComment = '';
    this.reviewError = '';
  }
}