import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Profile {
  _id: string;
  username?: string;
  email: string;
  role?: string;
  profilePicture?: string;
  bio?: string;
  name?: string;
  description?: string;
  website?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://localhost:3000/profile';

  constructor(private http: HttpClient) {}

  // Get own profile
  getMyProfile(): Observable<Profile> {
    return this.http.get<Profile>(`${this.apiUrl}/me`);
  }

  // Get any user's profile
  getUserProfile(id: string): Observable<Profile> {
    return this.http.get<Profile>(`${this.apiUrl}/user/${id}`);
  }

  // Get any company's profile
  getCompanyProfile(id: string): Observable<Profile> {
    return this.http.get<Profile>(`${this.apiUrl}/company/${id}`);
  }

  // Update own profile
  updateMyProfile(data: any): Observable<Profile> {
    return this.http.patch<Profile>(`${this.apiUrl}/me`, data);
  }

  // Change password
  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/change-password`, {
      oldPassword,
      newPassword
    });
  }

  // Upload profile picture
  uploadProfilePicture(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.patch(`${this.apiUrl}/profile-picture`, formData);
  }

  // Remove profile picture
  removeProfilePicture(): Observable<any> {
    return this.http.patch(`${this.apiUrl}/remove-picture`, {});
  }

  // Helper to get profile picture URL
  getProfilePictureUrl(profilePicture?: string): string {
    if (!profilePicture) {
      return '/assets/default-profile.png';
    }
    return `http://localhost:3000/${profilePicture}`;
  }
}