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
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div class="card-body p-4 p-md-5">
            <div class="row align-items-center">
              <div class="col-md-3 text-center mb-4 mb-md-0">
                <div class="avatar-ring-large mx-auto shadow-sm">
                  @if (profile.profilePicture) {
                    <img 
                      [src]="profile.profilePicture | imagePath" 
                      class="avatar-img-large"
                      alt="Company Logo">
                  } @else {
                    <div class="avatar-white-content-large">
                      {{ (profile.name || 'C').charAt(0).toUpperCase() }}
                    </div>
                  }
                </div>
              </div>
              <div class="col-md-9 px-md-4">
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-2 gap-3">
                  <h2 class="fw-800 mb-0">{{ profile.name }}</h2>
                  <span class="badge bg-primary px-3 py-2 rounded-pill shadow-sm">
                    {{ profile.user?.role || 'COMPANY' }}
                  </span>
                </div>
                <p class="text-muted mb-4 d-flex align-items-center gap-2 justify-content-center justify-content-md-start">
                  <i class="bi bi-envelope text-primary"></i> {{ profile.email }}
                </p>
                @if (profile.website) {
                  <p class="mb-4">
                    <a [href]="profile.website" target="_blank" class="btn btn-outline-primary px-4 rounded-pill">
                      <i class="bi bi-globe me-2"></i> Visit Website
                    </a>
                  </p>
                }
                @if (profile.description) {
                  <div class="about-section mt-4 p-4 bg-light rounded-4">
                    <h5 class="fw-700 mb-3 text-dark">About Company</h5>
                    <p class="text-muted mb-0 leading-relaxed">{{ profile.description }}</p>
                  </div>
                }
                <div class="mt-4 pt-2">
                  <a [routerLink]="['/company-reviews', profile._id]" class="btn btn-primary px-4 py-2 rounded-pill shadow-sm">
                    Read Company Reviews
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .fw-700 { font-weight: 700; }
    .fw-800 { font-weight: 800; }
    .leading-relaxed { line-height: 1.6; }
    
    .avatar-ring-large {
      position: relative;
      width: 150px;
      height: 150px;
      padding: 4px;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .avatar-white-content-large {
      width: 100%;
      height: 100%;
      background: white;
      color: #4f46e5;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 4rem;
      text-transform: uppercase;
      border: 3px solid white;
    }

    .avatar-img-large {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid white;
    }

    .about-section {
      border-left: 4px solid #4f46e5;
    }

    @media (max-width: 768px) {
      .avatar-ring-large {
        width: 120px;
        height: 120px;
      }
      .avatar-white-content-large {
        font-size: 3rem;
      }
    }
  `]
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