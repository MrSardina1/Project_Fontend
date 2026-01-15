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
        <div class="card mb-4 shadow-sm border-0">
          <div class="card-body p-4">
            <h2 class="mb-3">
              <i class="bi bi-building me-2"></i>{{ companyReviews.company.name }}
            </h2>
            <p class="text-muted mb-3">
              <i class="bi bi-envelope me-2"></i>{{ companyReviews.company.email }}
            </p>
            @if (companyReviews.company.website) {
              <a [href]="companyReviews.company.website" target="_blank" class="btn btn-outline-primary btn-sm mb-3">
                <i class="bi bi-globe me-2"></i>Visit Website
              </a>
            }
            <div class="rating-section mt-4 p-3 bg-light rounded">
              <h4 class="mb-2">
                <i class="bi bi-star-fill text-warning me-2"></i>
                Average Rating: {{ companyReviews.averageRating }} / 5
              </h4>
              <div class="text-warning fs-3 mb-2">
                @for (star of [1,2,3,4,5]; track star) {
                  <span>{{ star <= companyReviews.averageRating ? '★' : '☆' }}</span>
                }
              </div>
              <p class="text-muted mb-0">
                <i class="bi bi-people me-2"></i>Based on {{ companyReviews.totalReviews }} reviews
              </p>
            </div>
          </div>
        </div>

        @if ((currentUser$ | async)?.role === 'STUDENT' && !showReviewForm) {
          <button class="btn btn-primary mb-4" (click)="showReviewForm = true">
            <i class="bi bi-pencil-square me-2"></i>Write a Review
          </button>
        }

        @if (showReviewForm) {
          <div class="card mb-4 shadow-sm border-0">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">
                <i class="bi bi-pencil-square me-2"></i>Write Your Review
              </h5>
            </div>
            <div class="card-body p-4">
              @if (reviewError) {
                <div class="alert alert-danger alert-dismissible fade show">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ reviewError }}
                  <button type="button" class="btn-close" (click)="reviewError = ''"></button>
                </div>
              }
              @if (reviewSuccess) {
                <div class="alert alert-success alert-dismissible fade show">
                  <i class="bi bi-check-circle-fill me-2"></i>{{ reviewSuccess }}
                  <button type="button" class="btn-close" (click)="reviewSuccess = ''"></button>
                </div>
              }
              <form (ngSubmit)="submitReview()">
                <div class="mb-4">
                  <label class="form-label fw-bold">
                    <i class="bi bi-star me-2"></i>Rating (1-5 stars)
                  </label>
                  <select class="form-select form-select-lg" [(ngModel)]="newRating" name="rating" required>
                    <option [value]="0" disabled selected>Select your rating</option>
                    <option [value]="5">⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                    <option [value]="4">⭐⭐⭐⭐ (4 - Very Good)</option>
                    <option [value]="3">⭐⭐⭐ (3 - Good)</option>
                    <option [value]="2">⭐⭐ (2 - Fair)</option>
                    <option [value]="1">⭐ (1 - Poor)</option>
                  </select>
                </div>
                <div class="mb-4">
                  <label class="form-label fw-bold">
                    <i class="bi bi-chat-left-text me-2"></i>Your Review (optional)
                  </label>
                  <textarea 
                    class="form-control" 
                    [(ngModel)]="newComment" 
                    name="comment" 
                    rows="4"
                    placeholder="Share your experience with this company..."></textarea>
                </div>
                <div class="btn-group">
                  <button 
                    type="submit" 
                    class="btn btn-primary btn-lg" 
                    [disabled]="submitting || newRating === 0">
                    @if (submitting) {
                      <span class="spinner-border spinner-border-sm me-2"></span>
                    }
                    <i class="bi bi-send me-2"></i>Submit Review
                  </button>
                  <button 
                    type="button" 
                    class="btn btn-outline-secondary btn-lg" 
                    (click)="cancelReview()">
                    <i class="bi bi-x-circle me-2"></i>Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        }

        <h3 class="mb-4">
          <i class="bi bi-chat-square-text me-2"></i>Customer Reviews
        </h3>
        @for (review of companyReviews.reviews; track review._id) {
          <div class="card mb-3 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                  <h5 class="mb-2 d-flex align-items-center">
                    @if (review.user.profilePicture) {
                      <img [src]="review.user.profilePicture | imagePath" class="rounded-circle me-2" style="width: 32px; height: 32px; object-fit: cover;" alt="Profile">
                    } @else {
                      <i class="bi bi-person-circle me-2"></i>
                    }
                    <a [routerLink]="['/profile/user', review.user._id]" class="text-decoration-none text-dark hover-primary">
                      {{ review.user.username }}
                    </a>
                  </h5>
                  <div class="text-warning fs-5 mb-2">
                    @for (star of [1,2,3,4,5]; track star) {
                      <span>{{ star <= review.rating ? '★' : '☆' }}</span>
                    }
                  </div>
                  @if (review.comment) {
                    <p class="mt-2 mb-0">{{ review.comment }}</p>
                  }
                </div>
                <small class="text-muted">
                  <i class="bi bi-calendar me-1"></i>{{ review.createdAt | date:'short' }}
                </small>
              </div>
            </div>
          </div>
        }

        @if (companyReviews.reviews.length === 0) {
          <div class="alert alert-info">
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
    .rating-section {
      border-left: 4px solid #ffc107;
    }

    .card {
      transition: all 0.3s ease;
    }

    .card:hover {
      box-shadow: 0 8px 16px rgba(0,0,0,0.1) !important;
    }

    .btn {
      transition: all 0.3s ease;
    }

    .btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
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