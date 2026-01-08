import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AIChatService } from '../../services/aichat.service';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-4">
      <div class="row justify-content-center">
        <div class="col-lg-10">
          <div class="card">
            <div class="card-header bg-primary text-white">
              <h4 class="mb-0">AI Assistant</h4>
              <small>Ask me anything about internships, career advice, or general questions!</small>
            </div>
            <div class="card-body" style="height: 500px; overflow-y: auto;" #chatContainer>
              @if (messages.length === 0) {
                <div class="text-center text-muted mt-5">
                  <h5>Start a conversation with the AI Assistant!</h5>
                  <p>Ask me questions about internships, career guidance, or anything else.</p>
                </div>
              }
              
              @for (message of messages; track message.timestamp) {
                <div class="mb-3" [class]="message.role === 'user' ? 'text-end' : ''">
                  <div 
                    class="d-inline-block p-3 rounded"
                    [class]="message.role === 'user' ? 'bg-primary text-white' : 'bg-light'">
                    <div style="white-space: pre-wrap;">{{ message.content }}</div>
                    <small class="text-muted d-block mt-1" style="font-size: 0.7rem;">
                      {{ message.timestamp | date:'short' }}
                    </small>
                  </div>
                </div>
              }

              @if (loading) {
                <div class="mb-3">
                  <div class="d-inline-block p-3 rounded bg-light">
                    <div class="spinner-border spinner-border-sm me-2"></div>
                    <span>AI is thinking...</span>
                  </div>
                </div>
              }
            </div>
            <div class="card-footer">
              @if (error) {
                <div class="alert alert-danger mb-2">{{ error }}</div>
              }
              <form (ngSubmit)="sendMessage()">
                <div class="input-group">
                  <input 
                    type="text" 
                    class="form-control" 
                    [(ngModel)]="prompt" 
                    name="prompt"
                    placeholder="Type your message..."
                    [disabled]="loading"
                    required>
                  <button 
                    class="btn btn-primary" 
                    type="submit"
                    [disabled]="loading || !prompt.trim()">
                    @if (loading) {
                      <span class="spinner-border spinner-border-sm"></span>
                    } @else {
                      Send
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card-body::-webkit-scrollbar {
      width: 8px;
    }
    .card-body::-webkit-scrollbar-track {
      background: #f1f1f1;
    }
    .card-body::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 4px;
    }
    .card-body::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  `]
})
export class AIChatComponent {
  messages: Message[] = [];
  prompt = '';
  loading = false;
  error = '';

  constructor(private aiChatService: AIChatService) {}

  sendMessage() {
    if (!this.prompt.trim() || this.loading) {
      return;
    }

    // Add user message
    this.messages.push({
      role: 'user',
      content: this.prompt,
      timestamp: new Date()
    });

    const userPrompt = this.prompt;
    this.prompt = '';
    this.loading = true;
    this.error = '';

    // Call AI service
    this.aiChatService.ask(userPrompt).subscribe({
      next: (response) => {
        this.messages.push({
          role: 'assistant',
          content: response.response,
          timestamp: new Date()
        });
        this.loading = false;
        this.scrollToBottom();
      },
      error: (err) => {
        this.error = err.error.message || 'Failed to get response from AI';
        this.loading = false;
      }
    });

    this.scrollToBottom();
  }

  private scrollToBottom() {
    setTimeout(() => {
      const container = document.querySelector('.card-body');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }
}