import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Application {
  _id: string;
  student: {
    _id: string;
    username: string;
    email: string;
  };
  internship: {
    _id: string;
    title: string;
    company: {
      _id: string;
      name: string;
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

  constructor(private http: HttpClient) {}

  apply(internshipId: string): Observable<Application> {
    return this.http.post<Application>(this.apiUrl, { internshipId });
  }

  getAll(): Observable<Application[]> {
    return this.http.get<Application[]>(this.apiUrl);
  }

  updateStatus(id: string, status: string): Observable<Application> {
    return this.http.patch<Application>(`${this.apiUrl}/${id}/status`, { status });
  }
}