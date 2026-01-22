import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AIChatService, ChatResponse, CVData } from '../../services/aichat.service';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid mt-4 px-4">
      <div class="row">
        <!-- Sidebar for CV -->
        <div class="col-lg-3 mb-4">
          <div class="card shadow-sm border-0 sticky-top" style="top: 20px;">
            <div class="card-header bg-gradient-primary text-white">
              <h5 class="mb-0">
                <i class="bi bi-file-earmark-person me-2"></i>Your CV
              </h5>
            </div>
            <div class="card-body">
              @if (hasCV) {
                <div class="alert alert-success mb-3">
                  <i class="bi bi-check-circle me-2"></i>CV Uploaded
                </div>
                <button class="btn btn-primary w-100 mb-3" (click)="analyzeCV()" [disabled]="loading">
                  <i class="bi bi-graph-up me-2"></i>Get Recommendations
                </button>
              } @else {
                <div class="alert alert-info mb-3">
                  <i class="bi bi-info-circle me-2"></i>No CV uploaded yet.
                </div>
              }
              
              <button class="btn btn-outline-primary w-100 mb-2" (click)="fileInput.click()" [disabled]="loading">
                <i class="bi bi-upload me-2"></i>{{ hasCV ? 'Update CV (PDF)' : 'Upload CV (PDF)' }}
              </button>
              <input #fileInput type="file" class="d-none" accept=".pdf" (change)="onFileSelected($event)">
              
              @if (hasCV) {
                <button class="btn btn-outline-danger w-100 mb-2" (click)="resetCV()" [disabled]="loading">
                  <i class="bi bi-trash me-2"></i>Reset CV
                </button>
              }
              
              <div class="mt-3 small text-muted">
                <i class="bi bi-shield-check me-1"></i>Your information is used only for matching.
              </div>
            </div>
          </div>
        </div>

        <!-- Main Chat Area -->
        <div class="col-lg-9">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-gradient-primary text-white">
              <div class="d-flex justify-content-between align-items-center">
                <h4 class="mb-0">
                  <i class="bi bi-robot me-2"></i>AI Career Assistant
                </h4>
                <span class="badge bg-light text-dark">
                  <i class="bi bi-circle-fill text-success me-1" style="font-size: 0.5rem;"></i>Online
                </span>
              </div>
              <small class="opacity-75">Powered by Advanced AI • Career Guidance & Internship Matching</small>
            </div>
            
            <div class="card-body chat-container p-0" style="height: 600px; overflow-y: auto;" #chatContainer>
              @if (messages.length === 0) {
                <div class="text-center p-5 welcome-screen">
                  <div class="mb-4">
                    <i class="bi bi-robot display-1 text-primary"></i>
                  </div>
                  <h5 class="mb-3">Welcome to your AI Career Assistant!</h5>
                  <p class="text-muted mb-4">I can help you with:</p>
                  <div class="row g-3">
                    <div class="col-md-6">
                      <div class="feature-card p-3 border rounded">
                        <i class="bi bi-briefcase text-primary fs-3 mb-2"></i>
                        <h6>Internship Matching</h6>
                        <small class="text-muted">Get personalized recommendations</small>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="feature-card p-3 border rounded">
                        <i class="bi bi-file-earmark-text text-success fs-3 mb-2"></i>
                        <h6>CV Analysis</h6>
                        <small class="text-muted">Improve your resume</small>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="feature-card p-3 border rounded">
                        <i class="bi bi-chat-dots text-info fs-3 mb-2"></i>
                        <h6>Career Advice</h6>
                        <small class="text-muted">Expert guidance</small>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="feature-card p-3 border rounded">
                        <i class="bi bi-question-circle text-warning fs-3 mb-2"></i>
                        <h6>Interview Prep</h6>
                        <small class="text-muted">Tips and strategies</small>
                      </div>
                    </div>
                  </div>
                </div>
              }
              
              <div class="p-4">
                @for (message of messages; track message.timestamp) {
                  <div class="mb-4 message-wrapper" [class.user-message]="message.role === 'user'">
                    <div class="d-flex" [class.justify-content-end]="message.role === 'user'">
                      <div class="message-bubble" [class]="getMessageClass(message.role)">
                        @if (message.role === 'assistant') {
                          <div class="d-flex align-items-start mb-2">
                            <i class="bi bi-robot me-2 text-primary"></i>
                            <strong>AI Assistant</strong>
                          </div>
                        }
                        <div [innerHTML]="formatMessage(message.content)"></div>
                        <small class="message-time d-block mt-2 opacity-75">
                          {{ message.timestamp | date:'short' }}
                        </small>
                      </div>
                    </div>
                  </div>
                }

                @if (loading) {
                  <div class="mb-4">
                    <div class="d-flex">
                      <div class="message-bubble assistant-message">
                        <div class="typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
            
            <div class="card-footer bg-light">
              @if (error) {
                <div class="alert alert-danger alert-dismissible mb-2">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ error }}
                  <button type="button" class="btn-close" (click)="error = ''"></button>
                </div>
              }
              <form (ngSubmit)="sendMessage()" class="d-flex gap-2">
                <input 
                  type="text" 
                  class="form-control form-control-lg" 
                  [(ngModel)]="prompt" 
                  name="prompt"
                  placeholder="Ask me anything about careers, internships, or upload your CV..."
                  [disabled]="loading"
                  required>
                <button 
                  class="btn btn-primary btn-lg px-4" 
                  type="submit"
                  [disabled]="loading || !prompt.trim()">
                  @if (loading) {
                    <span class="spinner-border spinner-border-sm"></span>
                  } @else {
                    <i class="bi bi-send-fill"></i>
                  }
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bg-gradient-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .chat-container::-webkit-scrollbar {
      width: 8px;
    }
    .chat-container::-webkit-scrollbar-track {
      background: #f1f1f1;
    }
    .chat-container::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 4px;
    }

    .message-bubble {
      max-width: 70%;
      padding: 1rem 1.25rem;
      border-radius: 1rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .user-message .message-bubble {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .assistant-message {
      background: #f8f9fa;
      border-left: 4px solid #667eea;
    }

    .typing-indicator span {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #667eea;
      margin: 0 2px;
      animation: bounce 1.4s infinite ease-in-out both;
    }

    .typing-indicator span:nth-child(1) {
      animation-delay: -0.32s;
    }
    .typing-indicator span:nth-child(2) {
      animation-delay: -0.16s;
    }

    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }

    .feature-card {
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .feature-card:hover {
      background: #f8f9fa;
      transform: translateY(-5px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .message-time {
      font-size: 0.75rem;
    }
  `]
})
export class AIChatComponent implements OnInit {
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  messages: Message[] = [];
  prompt = '';
  loading = false;
  error = '';
  uploadingFile = false;

  // CV related
  hasCV = false;
  constructor(private aiChatService: AIChatService) { }

  ngOnInit() {
    this.checkCV();
  }

  checkCV() {
    this.aiChatService.getCV().subscribe({
      next: (cv: any) => {
        this.hasCV = !!cv;
      },
      error: () => {
        this.hasCV = false;
      }
    });
  }

  analyzeCV() {
    this.loading = true;
    this.error = '';

    this.addSystemMessage('Analyzing your CV and matching with available internships...');

    this.aiChatService.analyzeCV().subscribe({
      next: (response: ChatResponse) => {
        this.addAssistantMessage(response.response);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to analyze CV';
        this.loading = false;
      }
    });
  }

  resetCV() {
    if (confirm('Are you sure you want to delete your CV data? This action cannot be undone.')) {
      this.loading = true;
      this.aiChatService.deleteCV().subscribe({
        next: () => {
          this.hasCV = false;
          this.loading = false;
          this.addSystemMessage('CV data has been reset successfully.');
        },
        error: (err: any) => {
          this.error = 'Failed to reset CV';
          this.loading = false;
          this.addSystemMessage('Error: Failed to reset CV data.');
        }
      });
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        this.error = 'Please upload a PDF file';
        return;
      }

      this.uploadingFile = true;
      this.loading = true;
      this.addSystemMessage(`Uploading and analyzing CV: ${file.name}...`);

      this.aiChatService.uploadCV(file).subscribe({
        next: (response: ChatResponse) => {
          this.addAssistantMessage(response.response);
          this.uploadingFile = false;
          this.loading = false;
          this.hasCV = true;
          this.checkCV(); // Refresh CV data if available
        },
        error: (err: any) => {
          this.error = err.error?.message || err.error?.response || 'Failed to upload or analyze CV';
          this.uploadingFile = false;
          this.loading = false;
          this.addSystemMessage('System Error: ' + this.error);
        }
      });
    }
  }

  addAssistantMessage(content: string) {
    this.messages.push({
      role: 'assistant',
      content: content,
      timestamp: new Date()
    });
    this.scrollToBottom();
  }

  sendMessage() {
    if (!this.prompt.trim() || this.loading) return;

    this.messages.push({
      role: 'user',
      content: this.prompt,
      timestamp: new Date()
    });

    const userPrompt = this.prompt;
    this.prompt = '';
    this.loading = true;
    this.error = '';

    this.aiChatService.ask(userPrompt).subscribe({
      next: (response: ChatResponse) => {
        this.messages.push({
          role: 'assistant',
          content: response.response,
          timestamp: new Date()
        });
        this.loading = false;
        this.scrollToBottom();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to get response';
        this.loading = false;
      }
    });

    this.scrollToBottom();
  }

  addSystemMessage(content: string) {
    this.messages.push({
      role: 'system',
      content,
      timestamp: new Date()
    });
    this.scrollToBottom();
  }

  getMessageClass(role: string): string {
    if (role === 'user') return 'user-message';
    if (role === 'assistant') return 'assistant-message';
    return 'system-message';
  }

  formatMessage(content: string): string {
    // Convert markdown-like formatting to HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>')
      .replace(/- (.*?)(<br>|$)/g, '• $1$2');
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.chatContainer) {
        const element = this.chatContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    }, 100);
  }
}