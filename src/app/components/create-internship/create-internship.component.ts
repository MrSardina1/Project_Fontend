import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InternshipService } from '../../services/internship.service';

@Component({
  selector: 'app-create-internship',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header">
              <h3>Post New Internship</h3>
            </div>
            <div class="card-body">
              @if (error) {
                <div class="alert alert-danger">{{ error }}</div>
              }
              <form (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label class="form-label">Title</label>
                  <input type="text" class="form-control" [(ngModel)]="title" name="title" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Description</label>
                  <textarea class="form-control" [(ngModel)]="description" name="description" rows="4"></textarea>
                </div>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Location</label>
                    <input type="text" class="form-control" [(ngModel)]="location" name="location" required>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Duration</label>
                    <input type="text" class="form-control" [(ngModel)]="duration" name="duration" placeholder="e.g., 3 months" required>
                  </div>
                </div>
                <div class="d-grid gap-2">
                  <button type="submit" class="btn btn-primary" [disabled]="loading">
                    @if (loading) {
                      <span class="spinner-border spinner-border-sm me-2"></span>
                    }
                    Post Internship
                  </button>
                  <button type="button" class="btn btn-secondary" (click)="cancel()">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CreateInternshipComponent {
  title = '';
  description = '';
  location = '';
  duration = '';
  loading = false;
  error = '';

  constructor(
    private internshipService: InternshipService,
    private router: Router
  ) {}

  onSubmit() {
    this.loading = true;
    this.error = '';

    this.internshipService.create({
      title: this.title,
      description: this.description,
      location: this.location,
      duration: this.duration
    }).subscribe({
      next: () => {
        this.router.navigate(['/internships']);
      },
      error: (err) => {
        this.error = err.error.message || 'Failed to create internship';
        this.loading = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/internships']);
  }
}