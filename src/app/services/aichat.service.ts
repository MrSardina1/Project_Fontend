import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatResponse {
  response: string;
}

export interface CVData {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
  languages?: string[];
  certifications?: string[];
  careerGoals?: string;
  preferredIndustries?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AIChatService {
  private apiUrl = 'http://localhost:3000/aichat';

  constructor(private http: HttpClient) {}

  ask(prompt: string): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.apiUrl}/ask`, { prompt });
  }

  saveCV(cvData: CVData): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/cv`, cvData);
  }

  getCV(): Observable<CVData> {
    return this.http.get<CVData>(`${this.apiUrl}/cv`);
  }

  analyzeCV(): Observable<ChatResponse> {
    return this.http.get<ChatResponse>(`${this.apiUrl}/cv/analyze`);
  }
}