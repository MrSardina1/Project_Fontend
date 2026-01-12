import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private apiUrl = 'http://localhost:3000/company';

  constructor(private http: HttpClient) {}

  getMyInternships(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-internships`);
  }

  getInternshipApplications(internshipId: string, sortBy?: string, filterBy?: string, filterValue?: string): Observable<any> {
    let url = `${this.apiUrl}/internship/${internshipId}/applications`;
    const params: any = {};
    if (sortBy) params.sortBy = sortBy;
    if (filterBy) params.filterBy = filterBy;
    if (filterValue) params.filterValue = filterValue;
    
    return this.http.get<any>(url, { params });
  }
}