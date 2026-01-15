import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Review {
  _id: string;
  user: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  company: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface CompanyReviews {
  company: {
    id: string;
    name: string;
    email: string;
    website?: string;
  };
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = 'http://localhost:3000/reviews';

  constructor(private http: HttpClient) { }

  create(review: any): Observable<Review> {
    return this.http.post<Review>(this.apiUrl, review);
  }

  getCompanyReviews(companyId: string): Observable<CompanyReviews> {
    return this.http.get<CompanyReviews>(`${this.apiUrl}/company/${companyId}`);
  }

  getMyReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/my-reviews`);
  }

  update(id: string, review: any): Observable<Review> {
    return this.http.patch<Review>(`${this.apiUrl}/${id}`, review);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}