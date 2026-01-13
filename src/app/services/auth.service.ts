import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, BehaviorSubject } from 'rxjs';

export interface User {
  userId?: string;
  id?: string;
  name?: string;
  username: string;
  role: 'ADMIN' | 'COMPANY' | 'STUDENT';
  profilePicture?: string;
  bio?: string;
}

export interface LoginResponse {
  access_token: string;
  user: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromToken();
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.access_token);
          // Map backend response to our User interface
          const user: User = {
            userId: response.user.id,
            username: response.user.username || response.user.name,
            role: response.user.role,
            profilePicture: response.user.profilePicture,
            bio: response.user.bio
          };
          localStorage.setItem('user_metadata', JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }

  // FIXED: Changed from /users/register to /auth/register
  register(userData: any): Observable<any> {
    console.log('Registering user with data:', userData);
    return this.http.post(`${this.apiUrl}/auth/register`, userData)
      .pipe(
        tap(response => console.log('Registration response:', response))
      );
  }

  // FIXED: Changed from /companies/register to /auth/register-company
  registerCompany(companyData: any): Observable<any> {
    console.log('Registering company with data:', companyData);
    return this.http.post(`${this.apiUrl}/auth/register-company`, companyData)
      .pipe(
        tap(response => console.log('Company registration response:', response))
      );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user_metadata');
    this.currentUserSubject.next(null);

    // Navigate based on previous role
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  updateLocalUser(userData: Partial<User>) {
    const current = this.currentUserSubject.value;
    if (current) {
      const updated = { ...current, ...userData };
      this.currentUserSubject.next(updated);
      localStorage.setItem('user_metadata', JSON.stringify(updated));
    }
  }

  private loadUserFromToken() {
    const token = this.getToken();
    const storedMetadata = localStorage.getItem('user_metadata');

    if (token) {
      try {
        if (storedMetadata) {
          const user = JSON.parse(storedMetadata);
          this.currentUserSubject.next(user);
        } else {
          const payload = JSON.parse(atob(token.split('.')[1]));
          this.currentUserSubject.next({
            userId: payload.sub,
            username: payload.username,
            role: payload.role,
            profilePicture: payload.profilePicture,
            bio: payload.bio
          });
        }
      } catch (e) {
        this.logout();
      }
    }
  }

  hasRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  getDefaultProfilePicture(): string {
    return '/assets/default-profile.png';
  }

  // Additional helper methods for email verification
  verifyEmail(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/verify-email?token=${token}`);
  }

  resendVerification(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/resend-verification`, { email });
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/reset-password`, { token, password });
  }
}