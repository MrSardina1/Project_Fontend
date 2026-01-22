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
  name?: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  profilePicture?: string;
  companyStatus?: string;
  companyId?: string;
  createdAt: string;
  deletedAt?: string;
}

export interface AdminCompany {
  _id: string;
  name: string;
  email: string;
  website?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  user: any;
  profilePicture?: string;
  deletedAt?: string;
  createdAt: string;
  internshipCount?: number;
  reviewCount?: number;
  applicationCount?: number;
}

export interface AdminInternship {
  _id: string;
  title: string;
  location: string;
  duration: string;
  company: any;
  createdAt: string;
}

export interface CompanyStats {
  _id: string;
  name: string;
  email: string;
  internshipCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:3000/admin';

  constructor(private http: HttpClient) { }

  // Dashboard
  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }

  // Users
  getAllUsers(sortBy?: string, filterBy?: string, filterValue?: string, status?: string): Observable<AdminUser[]> {
    let params = new HttpParams();
    if (sortBy) params = params.set('sortBy', sortBy);
    if (filterBy) params = params.set('filterBy', filterBy);
    if (filterValue) params = params.set('filterValue', filterValue);
    if (status) params = params.set('status', status);

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

  softDeleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}/soft`);
  }

  restoreUser(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/${id}/restore`, {});
  }

  createUser(data: any): Observable<AdminUser> {
    return this.http.post<AdminUser>(`${this.apiUrl}/users`, data);
  }

  updateRole(id: string, role: string): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`${this.apiUrl}/users/${id}/role`, { role });
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

  restoreCompany(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/companies/${id}/restore`, {});
  }

  getActiveCompanies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/companies/active`);
  }

  getCompaniesWithStats(): Observable<CompanyStats[]> {
    return this.http.get<CompanyStats[]>(`${this.apiUrl}/companies/stats`);
  }

  // Internships
  getAllInternships(
    sortBy?: string,
    filterBy?: string,
    filterValue?: string,
    companyId?: string
  ): Observable<AdminInternship[]> {
    let params = new HttpParams();
    if (sortBy) params = params.set('sortBy', sortBy);
    if (filterBy) params = params.set('filterBy', filterBy);
    if (filterValue) params = params.set('filterValue', filterValue);
    if (companyId) params = params.set('company', companyId);

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
  getAllReviews(companyId?: string, reviewerName?: string): Observable<any[]> {
    let params = new HttpParams();
    if (companyId) params = params.set('company', companyId);
    if (reviewerName) params = params.set('reviewer', reviewerName);

    return this.http.get<any[]>(`${this.apiUrl}/reviews`, { params });
  }

  getCompaniesWithReviewCounts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reviews/companies`);
  }

  deleteReview(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reviews/${id}`);
  }
}