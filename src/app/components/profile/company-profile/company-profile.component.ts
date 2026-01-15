import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProfileService, Profile } from '../../../services/profile.service';
import { ImagePathPipe } from '../../../pipes/image-path.pipe';

@Component({
  selector: 'app-company-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ImagePathPipe],
  template: `
    <div class="container mt-4">
      @if (loading) {
        <div class="text-center">
          <div class="spinner-border"></div>
        </div>
      }

      @if (error) {
        <div class="alert alert-danger">{{ error }}</div>
      }

      @if (profile) {
        <div class="card">
          <div class="card-body">
            <div class="row">
              <div class="col-md-3 text-center">
                <img 
                  [src]="profile.profilePicture | imagePath" 
                  class="rounded-circle mb-3"
                  width="150" 
                  height="150"
                  alt="Company Logo">
              </div>
              <div class="col-md-9">
                <h2>{{ profile.name }}</h2>
                <p class="text-muted">{{ profile.email }}</p>
                @if (profile.website) {
                  <p>
                    <a [href]="profile.website" target="_blank" class="btn btn-outline-primary">
                      <i class="bi bi-globe"></i> Visit Website
                    </a>
                  </p>
                }
                @if (profile.description) {
                  <div class="mt-3">
                    <h5>About</h5>
                    <p>{{ profile.description }}</p>
                  </div>
                }
                <div class="mt-3">
                  <a [routerLink]="['/company-reviews', profile._id]" class="btn btn-primary">
                    View Company Reviews
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class CompanyProfileComponent implements OnInit {
  profile: Profile | null = null;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private profileService: ProfileService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProfile(id);
    }
  }

  loadProfile(id: string) {
    this.loading = true;
    this.profileService.getCompanyProfile(id).subscribe({
      next: (data) => {
        this.profile = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load company profile';
        this.loading = false;
      }
    });
  }

  getProfilePicture(): string {
    return this.profileService.getProfilePictureUrl(this.profile?.profilePicture);
  }
}