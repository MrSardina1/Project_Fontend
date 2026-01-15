import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService, Review } from '../../services/review.service';
import { ImagePathPipe } from '../../pipes/image-path.pipe';

@Component({
  selector: 'app-my-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, ImagePathPipe],
  template: `
    <div class="container mt-4">
      <h2>My Reviews</h2>

      @if (loading) {
        <div class="text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      }

      @if (error) {
        <div class="alert alert-danger">{{ error }}</div>
      }

      @if (success) {
        <div class="alert alert-success">{{ success }}</div>
      }

      @if (reviews.length === 0 && !loading) {
        <div class="alert alert-info">
          You haven't written any reviews yet.
        </div>
      }

      @for (review of reviews; track review._id) {
        <div class="card mb-3">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div class="flex-grow-1">
                <div class="d-flex align-items-center mb-3">
                  <div class="company-logo-xs-container me-2">
                    @if (review.company.profilePicture) {
                      <img [src]="review.company.profilePicture | imagePath" class="company-logo-xs-img" alt="Logo">
                    } @else {
                      <div class="company-logo-xs-fallback">{{ review.company.name.charAt(0) }}</div>
                    }
                  </div>
                  <h5 class="mb-0">{{ review.company.name }}</h5>
                </div>
                <div class="text-warning mb-2">
                  @for (star of [1,2,3,4,5]; track star) {
                    <span>{{ star <= review.rating ? '★' : '☆' }}</span>
                  }
                </div>
                @if (!editingId || editingId !== review._id) {
                  @if (review.comment) {
                    <p class="mb-0">{{ review.comment }}</p>
                  }
                } @else {
                  <div class="mb-3">
                    <label class="form-label">Rating</label>
                    <select class="form-select mb-2" [(ngModel)]="editRating" name="rating">
                      <option [value]="5">5 - Excellent</option>
                      <option [value]="4">4 - Very Good</option>
                      <option [value]="3">3 - Good</option>
                      <option [value]="2">2 - Fair</option>
                      <option [value]="1">1 - Poor</option>
                    </select>
                    <label class="form-label">Comment</label>
                    <textarea class="form-control" [(ngModel)]="editComment" name="comment" rows="3"></textarea>
                  </div>
                }
                <small class="text-muted">Posted: {{ review.createdAt | date:'short' }}</small>
              </div>
              <div class="ms-3">
                @if (!editingId || editingId !== review._id) {
                  <div class="btn-group-vertical btn-group-sm">
                    <button class="btn btn-outline-primary" (click)="startEdit(review)">
                      Edit
                    </button>
                    <button class="btn btn-outline-danger" (click)="deleteReview(review._id)">
                      Delete
                    </button>
                  </div>
                } @else {
                  <div class="btn-group-vertical btn-group-sm">
                    <button class="btn btn-primary" (click)="saveEdit(review._id)" [disabled]="updating">
                      Save
                    </button>
                    <button class="btn btn-secondary" (click)="cancelEdit()">
                      Cancel
                    </button>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .company-logo-xs-container {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--primary-light);
    }
    
    .company-logo-xs-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .company-logo-xs-fallback {
      color: var(--primary);
      font-weight: 700;
      font-size: 0.9rem;
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