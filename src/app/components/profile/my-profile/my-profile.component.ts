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
      <h2>My Profile</h2>

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

      @if (profile) {
        <div class="row">
          <!-- Profile Picture Section -->
          <div class="col-md-4">
            <div class="card mb-4">
              <div class="card-body text-center">
                <img 
                  [src]="getProfilePictureUrl()" 
                  class="rounded-circle mb-3" 
                  style="width: 150px; height: 150px; object-fit: cover;"
                  alt="Profile Picture">
                
                <h5>{{ profile.username || profile.name }}</h5>
                <p class="text-muted">{{ profile.email }}</p>
                <span class="badge bg-primary">{{ profile.role || 'COMPANY' }}</span>

                <!-- Picture Upload Form -->
                <div class="mt-3">
                  <input 
                    type="file" 
                    class="form-control mb-2" 
                    (change)="onFileSelected($event)"
                    accept="image/*">
                  
                  @if (selectedFile) {
                    <div class="alert alert-info p-2 mb-2">
                      <small>Selected: {{ selectedFile.name }}</small>
                    </div>
                    <button 
                      class="btn btn-primary btn-sm w-100 mb-2" 
                      (click)="uploadPicture()"
                      [disabled]="uploadingPicture">
                      @if (uploadingPicture) {
                        <span class="spinner-border spinner-border-sm me-1"></span>
                      }
                      Confirm Upload
                    </button>
                    <button 
                      class="btn btn-secondary btn-sm w-100" 
                      (click)="cancelPictureUpload()">
                      Cancel
                    </button>
                  } @else {
                    <button 
                      class="btn btn-outline-primary btn-sm w-100" 
                      onclick="this.previousElementSibling.click()">
                      Change Picture
                    </button>
                  }

                  @if (profile.profilePicture) {
                    <button 
                      class="btn btn-outline-danger btn-sm w-100 mt-2" 
                      (click)="removePicture()"
                      [disabled]="removingPicture">
                      @if (removingPicture) {
                        <span class="spinner-border spinner-border-sm me-1"></span>
                      }
                      Remove Picture
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- Profile Information Section -->
          <div class="col-md-8">
            <!-- Bio/Description Edit -->
            <div class="card mb-4">
              <div class="card-header">
                <h5 class="mb-0">Profile Information</h5>
              </div>
              <div class="card-body">
                <form (ngSubmit)="updateProfile()">
                  @if (profile.role !== 'COMPANY') {
                    <div class="mb-3">
                      <label class="form-label">Bio</label>
                      <textarea 
                        class="form-control" 
                        [(ngModel)]="editBio" 
                        name="bio" 
                        rows="4"
                        placeholder="Tell us about yourself..."></textarea>
                    </div>
                  } @else {
                    <div class="mb-3">
                      <label class="form-label">Company Description</label>
                      <textarea 
                        class="form-control" 
                        [(ngModel)]="editDescription" 
                        name="description" 
                        rows="4"
                        placeholder="Describe your company..."></textarea>
                    </div>
                    <div class="mb-3">
                      <label class="form-label">Website</label>
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
                    Save Changes
                  </button>
                </form>
              </div>
            </div>

            <!-- Change Password Section -->
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">Change Password</h5>
              </div>
              <div class="card-body">
                @if (passwordError) {
                  <div class="alert alert-danger">{{ passwordError }}</div>
                }
                @if (passwordSuccess) {
                  <div class="alert alert-success">{{ passwordSuccess }}</div>
                }
                
                <form (ngSubmit)="changePassword()">
                  <div class="mb-3">
                    <label class="form-label">Current Password</label>
                    <input 
                      type="password" 
                      class="form-control" 
                      [(ngModel)]="oldPassword" 
                      name="oldPassword"
                      required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">New Password</label>
                    <input 
                      type="password" 
                      class="form-control" 
                      [(ngModel)]="newPassword" 
                      name="newPassword"
                      minlength="6"
                      required>
                    <small class="text-muted">Minimum 6 characters</small>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Confirm New Password</label>
                    <input 
                      type="password" 
                      class="form-control" 
                      [(ngModel)]="confirmPassword" 
                      name="confirmPassword"
                      required>
                  </div>
                  
                  <button 
                    type="submit" 
                    class="btn btn-warning"
                    [disabled]="changingPassword || !oldPassword || !newPassword || !confirmPassword">
                    @if (changingPassword) {
                      <span class="spinner-border spinner-border-sm me-2"></span>
                    }
                    Change Password
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
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

  // Picture upload
  selectedFile: File | null = null;
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

  // Picture upload methods
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
        this.selectedFile = null;
        // Clear file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
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
        this.loadProfile();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error.message || 'Failed to remove picture';
        this.removingPicture = false;
      }
    });
  }

  // Profile update method
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
      next: () => {
        this.success = 'Profile updated successfully!';
        this.updatingProfile = false;
        this.loadProfile();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error.message || 'Failed to update profile';
        this.updatingProfile = false;
      }
    });
  }

  // Password change method
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