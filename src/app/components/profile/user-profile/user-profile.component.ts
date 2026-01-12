import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProfileService, Profile } from '../../../services/profile.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
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
                  [src]="getProfilePicture()" 
                  class="rounded-circle mb-3"
                  width="150" 
                  height="150"
                  alt="Profile">
              </div>
              <div class="col-md-9">
                <h2>{{ profile.username }}</h2>
                <p class="text-muted">{{ profile.email }}</p>
                @if (profile.role) {
                  <span class="badge bg-primary mb-3">{{ profile.role }}</span>
                }
                @if (profile.bio) {
                  <div>
                    <h5>Bio</h5>
                    <p>{{ profile.bio }}</p>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class UserProfileComponent implements OnInit {
  profile: Profile | null = null;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private profileService: ProfileService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProfile(id);
    }
  }

  loadProfile(id: string) {
    this.loading = true;
    this.profileService.getUserProfile(id).subscribe({
      next: (data) => {
        this.profile = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load profile';
        this.loading = false;
      }
    });
  }

  getProfilePicture(): string {
    return this.profileService.getProfilePictureUrl(this.profile?.profilePicture);
  }
}
