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
                <!-- Live Preview Image or Alphabetical Fallback -->
                <div class="position-relative d-inline-block mb-3">
                  @if (previewImage || profile.profilePicture) {
                    <div class="avatar-ring large">
                      <img 
                        [src]="previewImage || getProfilePictureUrl()" 
                        class="avatar-img" 
                        alt="Profile Picture">
                    </div>
                  } @else {
                    <div class="avatar-ring large">
                      <div class="avatar-gradient large">
                        {{ (profile.username || profile.name || 'U').charAt(0) }}
                      </div>
                    </div>
                  }
                  <div class="profile-badge">
                    <span class="badge bg-primary shadow-sm">{{ profile.role || 'USER' }}</span>
                  </div>
                </div>
                
                <h5 class="mb-1">{{ profile.name || profile.username || profile.user?.name || profile.user?.username || 'User' }}</h5>
                <p class="text-muted small mb-1">{{ profile.email || profile.user?.email }}</p>
                @if (profile.bio || profile.description) {
                  <div class="bio-container mb-3">
                    <p class="bio-text text-muted mb-0">{{ profile.bio || profile.description }}</p>
                  </div>
                }

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
                  @if (profile.role === 'STUDENT' || profile.role === 'user' || !profile.user) {
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
                        <i class="bi bi-building me-2"></i>Bio
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
      border-radius: 50%;
    }

    .avatar-ring.large {
      width: 185px;
      height: 185px;
      padding: 5px;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 10px 25px rgba(79, 70, 229, 0.2);
    }

    .avatar-ring.large:hover {
      transform: scale(1.02);
    }

    .avatar-gradient.large {
      width: 100%;
      height: 100%;
      background: white;
      color: #4f46e5;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 5rem;
      border: 4px solid white;
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid white;
    }

    .profile-badge {
      position: absolute;
      bottom: 15px;
      right: 15px;
      z-index: 2;
    }

    .profile-badge .badge {
      padding: 8px 16px;
      border-radius: 30px;
      font-weight: 600;
      letter-spacing: 0.5px;
      border: 2px solid white;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
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
    .bio-text {
      font-size: 0.85rem;
      font-style: italic;
      line-height: 1.4;
      padding: 0 10px;
    }
    .bio-container {
      border-top: 1px solid var(--border);
      padding-top: 8px;
      margin-top: 4px;
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
  ) { }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.loading = true;
    this.profileService.getMyProfile().subscribe({
      next: (data: any) => {
        this.profile = data;
        this.editBio = data.bio || '';
        this.editDescription = data.description || '';
        this.editWebsite = data.website || '';
        this.loading = false;
        // Sync with sidebar
        const actualRole = data.role || data.user?.role;
        const isCompany = actualRole === 'COMPANY';
        this.authService.updateLocalUser({
          name: data.name || data.user?.name,
          username: data.username || data.user?.username || '',
          bio: isCompany ? data.description : data.bio,
          profilePicture: data.profilePicture
        });
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
        this.success = '✨ Profile picture updated successfully!';
        this.uploadingPicture = false;
        this.cancelPictureUpload();
        this.loadProfile();
        // Sync with sidebar
        if (response.profilePicture) {
          this.authService.updateLocalUser({ profilePicture: response.profilePicture });
        }
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

    const actualRole = this.profile.role || this.profile.user?.role;
    const isCompany = actualRole === 'COMPANY';
    const updateData: any = {};

    if (!isCompany) {
      updateData.bio = this.editBio;
    } else {
      updateData.description = this.editDescription;
      updateData.website = this.editWebsite;
    }

    this.profileService.updateMyProfile(updateData).subscribe({
      next: (response: any) => {
        this.success = '✅ Your professional profile has been updated!';
        this.updatingProfile = false;
        this.loadProfile();
        // Sync with sidebar
        const actualRole = this.profile.role || this.profile.user?.role;
        const isComp = actualRole === 'COMPANY';
        this.authService.updateLocalUser({
          name: isComp ? (this.profile.name || response.name) : (this.profile.username || response.username),
          bio: isComp ? this.editDescription : this.editBio,
          profilePicture: response.profilePicture || this.profile.profilePicture
        });
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