import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  totalStudents: number;
  totalCompanies: number;
  pendingCompanies: number;
  totalInternships: number;
  totalApplications: number;
  averageRating: number;
  totalReviews: number;
}

export interface AdminUser {
  _id: string;
  username: string;
  email: string;
  role: string;
  profilePicture?: string;
  createdAt: string;
}

export interface AdminCompany {
  _id: string;
  name: string;
  email: string;
  website?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  user: any;
  createdAt: string;
}

export interface AdminInternship {
  _id: string;
  title: string;
  location: string;
  duration: string;
  company: any;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:3000/admin';

  constructor(private http: HttpClient) {}

  // Dashboard
  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }

  // Users
  getAllUsers(sortBy?: string, filterBy?: string, filterValue?: string): Observable<AdminUser[]> {
    let params = new HttpParams();
    if (sortBy) params = params.set('sortBy', sortBy);
    if (filterBy) params = params.set('filterBy', filterBy);
    if (filterValue) params = params.set('filterValue', filterValue);
    
    return this.http.get<AdminUser[]>(`${this.apiUrl}/users`, { params });
  }

  getUserById(id: string): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.apiUrl}/users/${id}`);
  }

  updateUser(id: string, data: any): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`${this.apiUrl}/users/${id}`, data);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }

  // Companies
  getAllCompanies(
    sortBy?: string, 
    filterBy?: string, 
    filterValue?: string,
    status?: string
  ): Observable<AdminCompany[]> {
    let params = new HttpParams();
    if (sortBy) params = params.set('sortBy', sortBy);
    if (filterBy) params = params.set('filterBy', filterBy);
    if (filterValue) params = params.set('filterValue', filterValue);
    if (status) params = params.set('status', status);
    
    return this.http.get<AdminCompany[]>(`${this.apiUrl}/companies`, { params });
  }

  getPendingCompanies(): Observable<AdminCompany[]> {
    return this.http.get<AdminCompany[]>(`${this.apiUrl}/companies/pending`);
  }

  verifyCompany(id: string, status: 'APPROVED' | 'REJECTED'): Observable<AdminCompany> {
    return this.http.patch<AdminCompany>(`${this.apiUrl}/companies/${id}/verify`, { status });
  }

  updateCompany(id: string, data: any): Observable<AdminCompany> {
    return this.http.patch<AdminCompany>(`${this.apiUrl}/companies/${id}`, data);
  }

  deleteCompany(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/companies/${id}`);
  }

  // Internships
  getAllInternships(
    sortBy?: string, 
    filterBy?: string, 
    filterValue?: string
  ): Observable<AdminInternship[]> {
    let params = new HttpParams();
    if (sortBy) params = params.set('sortBy', sortBy);
    if (filterBy) params = params.set('filterBy', filterBy);
    if (filterValue) params = params.set('filterValue', filterValue);
    
    return this.http.get<AdminInternship[]>(`${this.apiUrl}/internships`, { params });
  }

  deleteInternship(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/internships/${id}`);
  }

  // Applications
  getAllApplications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/applications`);
  }

  // Reviews
  getAllReviews(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reviews`);
  }

  deleteReview(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reviews/${id}`);
  }
}