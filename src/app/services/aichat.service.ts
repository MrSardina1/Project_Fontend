import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatResponse {
  response: string;
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
}