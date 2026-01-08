import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Internship {
  _id: string;
  title: string;
  description: string;
  location: string;
  duration: string;
  company: {
    _id: string;
    name: string;
    website?: string;
  };
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class InternshipService {
  private apiUrl = 'http://localhost:3000/internships';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Internship[]> {
    return this.http.get<Internship[]>(this.apiUrl);
  }

  create(internship: any): Observable<Internship> {
    return this.http.post<Internship>(this.apiUrl, internship);
  }
}