import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Application {
  _id: string;
  student: {
    _id: string;
    username: string;
    email: string;
    profilePicture?: string;
  };
  internship: {
    _id: string;
    title: string;
    location: string;
    duration: string;
    company: {
      _id: string;
      name: string;
      email: string;
      website?: string;
      profilePicture?: string;
    };
  };
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private apiUrl = 'http://localhost:3000/applications';

  constructor(private http: HttpClient) { }

  apply(internshipId: string): Observable<Application> {
    return this.http.post<Application>(this.apiUrl, { internshipId });
  }

  getAll(): Observable<Application[]> {
    return this.http.get<Application[]>(this.apiUrl);
  }

  getMyApplications(): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.apiUrl}/my-applications`);
  }

  getAcceptedCompanies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/accepted-companies`);
  }

  updateStatus(id: string, status: string): Observable<Application> {
    return this.http.patch<Application>(`${this.apiUrl}/${id}/status`, { status });
  }

  getApplicationCount(internshipId: string): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/count/${internshipId}`);
  }
}