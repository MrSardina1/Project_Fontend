import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ReviewService, CompanyReviews } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-company-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-4">
      @if (loading) {
        <div class="text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      }

      @if (companyReviews) {
        <div class="card mb-4">
          <div class="card-body">
            <h2>{{ companyReviews.company.name }}</h2>
            <p class="text-muted">{{ companyReviews.company.email }}</p>
            @if (companyReviews.company.website) {
              <a [href]="companyReviews.company.website" target="_blank" class="btn btn-sm btn-outline-primary">
                Visit Website
              </a>
            }
            <div class="mt-3">
              <h4>Average Rating: {{ companyReviews.averageRating }} / 5</h4>
              <div class="text-warning fs-4">
                @for (star of [1,2,3,4,5]; track star) {
                  <span>{{ star <= companyReviews.averageRating ? '★' : '☆' }}</span>
                }
              </div>
              <p class="text-muted">Based on {{ companyReviews.totalReviews }} reviews</p>
            </div>
          </div>
        </div>

        @if ((currentUser$ | async)?.role === 'STUDENT' && !showReviewForm) {
          <button class="btn btn-primary mb-4" (click)="showReviewForm = true">
            Write a Review
          </button>
        }

        @if (showReviewForm) {
          <div class="card mb-4">
            <div class="card-body">
              <h4>Write a Review</h4>
              @if (reviewError) {
                <div class="alert alert-danger">{{ reviewError }}</div>
              }
              @if (reviewSuccess) {
                <div class="alert alert-success">{{ reviewSuccess }}</div>
              }
              <form (ngSubmit)="submitReview()">
                <div class="mb-3">
                  <label class="form-label">Rating</label>
                  <select class="form-select" [(ngModel)]="newRating" name="rating" required>
                    <option value="">Select rating</option>
                    <option [value]="5">5 - Excellent</option>
                    <option [value]="4">4 - Very Good</option>
                    <option [value]="3">3 - Good</option>
                    <option [value]="2">2 - Fair</option>
                    <option [value]="1">1 - Poor</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label">Comment (optional)</label>
                  <textarea class="form-control" [(ngModel)]="newComment" name="comment" rows="3"></textarea>
                </div>
                <div class="btn-group">
                  <button type="submit" class="btn btn-primary" [disabled]="submitting">
                    @if (submitting) {
                      <span class="spinner-border spinner-border-sm me-2"></span>
                    }
                    Submit Review
                  </button>
                  <button type="button" class="btn btn-secondary" (click)="showReviewForm = false">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        }

        <h3 class="mb-3">Reviews</h3>
        @for (review of companyReviews.reviews; track review._id) {
          <div class="card mb-3">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h5 class="mb-1">{{ review.user.username }}</h5>
                  <div class="text-warning">
                    @for (star of [1,2,3,4,5]; track star) {
                      <span>{{ star <= review.rating ? '★' : '☆' }}</span>
                    }
                  </div>
                </div>
                <small class="text-muted">{{ review.createdAt | date:'short' }}</small>
              </div>
              @if (review.comment) {
                <p class="mt-2 mb-0">{{ review.comment }}</p>
              }
            </div>
          </div>
        }

        @if (companyReviews.reviews.length === 0) {
          <div class="alert alert-info">
            No reviews yet. Be the first to review this company!
          </div>
        }
      }

      @if (error) {
        <div class="alert alert-danger">{{ error }}</div>
      }
    </div>
  `
})
export class CompanyReviewsComponent implements OnInit {
  companyReviews: CompanyReviews | null = null;
  loading = false;
  error = '';
  showReviewForm = false;
  newRating: number = 0;
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
    if (!this.companyReviews || !this.newRating) {
      return;
    }

    this.submitting = true;
    this.reviewError = '';
    this.reviewSuccess = '';

    this.reviewService.create({
      companyId: this.companyReviews.company.id,
      rating: this.newRating,
      comment: this.newComment
    }).subscribe({
      next: () => {
        this.reviewSuccess = 'Review submitted successfully!';
        this.submitting = false;
        this.showReviewForm = false;
        this.newRating = 0;
        this.newComment = '';
        this.loadReviews(this.companyReviews!.company.id);
      },
      error: (err) => {
        this.reviewError = err.error.message || 'Failed to submit review';
        this.submitting = false;
      }
    });
  }
}