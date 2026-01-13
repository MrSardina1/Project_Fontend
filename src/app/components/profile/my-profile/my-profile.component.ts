import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../../services/profile.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-4">
      <h2 class="mb-4">My Profile</h2>

      @if (loading) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      }

      @if (error) {
        <div class="alert alert-danger alert-dismissible fade show">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ error }}
          <button type="button" class="btn-close" (click)="error = ''"></button>
        </div>
      }

      @if (success) {
        <div class="alert alert-success alert-dismissible fade show">
          <i class="bi bi-check-circle-fill me-2"></i>{{ success }}
          <button type="button" class="btn-close" (click)="success = ''"></button>
        </div>
      }

      @if (profile) {
        <div class="row g-4">
          <!-- Profile Picture Section -->
          <div class="col-lg-4">
            <div class="card shadow-sm border-0">
              <div class="card-body text-center p-4">
                <!-- Live Preview Image -->
                <div class="position-relative d-inline-block mb-3">
                  <img 
                    [src]="previewImage || getProfilePictureUrl()" 
                    class="rounded-circle profile-image" 
                    alt="Profile Picture">
                  <div class="profile-badge">
                    <span class="badge bg-primary">{{ profile.role || 'COMPANY' }}</span>
                  </div>
                </div>
                
                <h5 class="mb-1">{{ profile.username || profile.name }}</h5>
                <p class="text-muted mb-3">{{ profile.email }}</p>

                <!-- Picture Upload Form -->
                <div class="picture-upload-section">
                  <input 
                    type="file" 
                    #fileInput
                    class="d-none" 
                    (change)="onFileSelected($event)"
                    accept="image/*">
                  
                  @if (selectedFile) {
                    <div class="alert alert-info p-2 mb-2">
                      <i class="bi bi-image me-2"></i>
                      <small>{{ selectedFile.name }}</small>
                    </div>
                    <div class="d-grid gap-2">
                      <button 
                        class="btn btn-primary" 
                        (click)="uploadPicture()"
                        [disabled]="uploadingPicture">
                        @if (uploadingPicture) {
                          <span class="spinner-border spinner-border-sm me-2"></span>
                        }
                        <i class="bi bi-upload me-2"></i>Confirm Upload
                      </button>
                      <button 
                        class="btn btn-outline-secondary" 
                        (click)="cancelPictureUpload()">
                        <i class="bi bi-x-circle me-2"></i>Cancel
                      </button>
                    </div>
                  } @else {
                    <div class="d-grid gap-2">
                      <button 
                        class="btn btn-outline-primary" 
                        (click)="fileInput.click()">
                        <i class="bi bi-camera me-2"></i>Change Picture
                      </button>
                      @if (profile.profilePicture) {
                        <button 
                          class="btn btn-outline-danger" 
                          (click)="removePicture()"
                          [disabled]="removingPicture">
                          @if (removingPicture) {
                            <span class="spinner-border spinner-border-sm me-2"></span>
                          }
                          <i class="bi bi-trash me-2"></i>Remove Picture
                        </button>
                      }
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- Profile Information Section -->
          <div class="col-lg-8">
            <!-- Profile Info Card -->
            <div class="card shadow-sm border-0 mb-4">
              <div class="card-header bg-primary text-white">
                <h5 class="mb-0"><i class="bi bi-person-circle me-2"></i>Profile Information</h5>
              </div>
              <div class="card-body p-4">
                <form (ngSubmit)="updateProfile()">
                  @if (profile.role !== 'COMPANY') {
                    <div class="mb-3">
                      <label class="form-label fw-bold">
                        <i class="bi bi-pencil me-2"></i>Bio
                      </label>
                      <textarea 
                        class="form-control" 
                        [(ngModel)]="editBio" 
                        name="bio" 
                        rows="4"
                        placeholder="Tell us about yourself..."></textarea>
                    </div>
                  } @else {
                    <div class="mb-3">
                      <label class="form-label fw-bold">
                        <i class="bi bi-building me-2"></i>Company Description
                      </label>
                      <textarea 
                        class="form-control" 
                        [(ngModel)]="editDescription" 
                        name="description" 
                        rows="4"
                        placeholder="Describe your company..."></textarea>
                    </div>
                    <div class="mb-3">
                      <label class="form-label fw-bold">
                        <i class="bi bi-globe me-2"></i>Website
                      </label>
                      <input 
                        type="url" 
                        class="form-control" 
                        [(ngModel)]="editWebsite" 
                        name="website"
                        placeholder="https://example.com">
                    </div>
                  }
                  
                  <button 
                    type="submit" 
                    class="btn btn-primary"
                    [disabled]="updatingProfile">
                    @if (updatingProfile) {
                      <span class="spinner-border spinner-border-sm me-2"></span>
                    }
                    <i class="bi bi-check-circle me-2"></i>Save Changes
                  </button>
                </form>
              </div>
            </div>

            <!-- Change Password Card -->
            <div class="card shadow-sm border-0">
              <div class="card-header bg-warning text-dark">
                <h5 class="mb-0"><i class="bi bi-shield-lock me-2"></i>Security Settings</h5>
              </div>
              <div class="card-body p-4">
                @if (passwordError) {
                  <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ passwordError }}
                  </div>
                }
                @if (passwordSuccess) {
                  <div class="alert alert-success">
                    <i class="bi bi-check-circle-fill me-2"></i>{{ passwordSuccess }}
                  </div>
                }
                
                <form (ngSubmit)="changePassword()">
                  <div class="mb-3">
                    <label class="form-label fw-bold">
                      <i class="bi bi-key me-2"></i>Current Password
                    </label>
                    <input 
                      type="password" 
                      class="form-control" 
                      [(ngModel)]="oldPassword" 
                      name="oldPassword"
                      required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-bold">
                      <i class="bi bi-key-fill me-2"></i>New Password
                    </label>
                    <input 
                      type="password" 
                      class="form-control" 
                      [(ngModel)]="newPassword" 
                      name="newPassword"
                      minlength="6"
                      required>
                    <small class="text-muted">
                      <i class="bi bi-info-circle me-1"></i>Minimum 6 characters
                    </small>
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-bold">
                      <i class="bi bi-check2-circle me-2"></i>Confirm New Password
                    </label>
                    <input 
                      type="password" 
                      class="form-control" 
                      [(ngModel)]="confirmPassword" 
                      name="confirmPassword"
                      required>
                  </div>
                  
                  <button 
                    type="submit" 
                    class="btn btn-warning text-dark"
                    [disabled]="changingPassword || !oldPassword || !newPassword || !confirmPassword">
                    @if (changingPassword) {
                      <span class="spinner-border spinner-border-sm me-2"></span>
                    }
                    <i class="bi bi-shield-check me-2"></i>Change Password
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .profile-image {
      width: 180px;
      height: 180px;
      object-fit: cover;
      border: 4px solid #f8f9fa;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: transform 0.3s ease;
    }

    .profile-image:hover {
      transform: scale(1.05);
    }

    .profile-badge {
      position: absolute;
      bottom: 10px;
      right: 10px;
    }

    .picture-upload-section {
      margin-top: 1.5rem;
    }

    .card {
      transition: all 0.3s ease;
    }

    .card:hover {
      box-shadow: 0 8px 16px rgba(0,0,0,0.1) !important;
    }

    .card-header {
      border-bottom: 2px solid rgba(255,255,255,0.1);
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
export class MyProfileComponent implements OnInit {
  profile: any = null;
  loading = false;
  error = '';
  success = '';

  // Profile editing
  editBio = '';
  editDescription = '';
  editWebsite = '';
  updatingProfile = false;

  // Picture upload with live preview
  selectedFile: File | null = null;
  previewImage: string | null = null;
  uploadingPicture = false;
  removingPicture = false;

  // Password change
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  changingPassword = false;
  passwordError = '';
  passwordSuccess = '';

  constructor(
    private profileService: ProfileService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.loading = true;
    this.profileService.getMyProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.editBio = data.bio || '';
        this.editDescription = data.description || '';
        this.editWebsite = data.website || '';
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load profile';
        this.loading = false;
      }
    });
  }

  getProfilePictureUrl(): string {
    return this.profileService.getProfilePictureUrl(this.profile?.profilePicture);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/image\/(jpg|jpeg|png|gif)/)) {
        this.error = 'Only image files (JPG, PNG, GIF) are allowed';
        event.target.value = '';
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'File size must be less than 5MB';
        event.target.value = '';
        return;
      }
      
      this.selectedFile = file;
      this.error = '';
      
      // Create live preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadPicture() {
    if (!this.selectedFile) return;

    this.uploadingPicture = true;
    this.error = '';
    this.success = '';

    this.profileService.uploadProfilePicture(this.selectedFile).subscribe({
      next: (response) => {
        this.success = 'Profile picture updated successfully!';
        this.uploadingPicture = false;
        this.cancelPictureUpload();
        this.loadProfile();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error.message || 'Failed to upload picture';
        this.uploadingPicture = false;
      }
    });
  }

  cancelPictureUpload() {
    this.selectedFile = null;
    this.previewImage = null;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  removePicture() {
    if (!confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }

    this.removingPicture = true;
    this.error = '';
    this.success = '';

    this.profileService.removeProfilePicture().subscribe({
      next: () => {
        this.success = 'Profile picture removed successfully!';
        this.removingPicture = false;
        this.previewImage = null;
        this.loadProfile();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error.message || 'Failed to remove picture';
        this.removingPicture = false;
      }
    });
  }

  updateProfile() {
    this.updatingProfile = true;
    this.error = '';
    this.success = '';

    const updateData: any = {};
    
    if (this.profile.role !== 'COMPANY') {
      updateData.bio = this.editBio;
    } else {
      updateData.description = this.editDescription;
      updateData.website = this.editWebsite;
    }

    this.profileService.updateMyProfile(updateData).subscribe({
      next: (response) => {
        this.success = 'Profile updated successfully!';
        this.updatingProfile = false;
        this.loadProfile();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to update profile';
        this.updatingProfile = false;
      }
    });
  }

  changePassword() {
    this.passwordError = '';
    this.passwordSuccess = '';

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'New passwords do not match';
      return;
    }

    if (this.newPassword.length < 6) {
      this.passwordError = 'Password must be at least 6 characters';
      return;
    }

    this.changingPassword = true;

    this.profileService.changePassword(this.oldPassword, this.newPassword).subscribe({
      next: () => {
        this.passwordSuccess = 'Password changed successfully!';
        this.changingPassword = false;
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        setTimeout(() => this.passwordSuccess = '', 3000);
      },
      error: (err) => {
        this.passwordError = err.error.message || 'Failed to change password';
        this.changingPassword = false;
      }
    });
  }
}