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
                <button class="btn btn-outline-primary w-100 mb-2" (click)="showCVForm = true">
                  <i class="bi bi-pencil me-2"></i>Edit CV
                </button>
                <button class="btn btn-primary w-100" (click)="analyzeCV()" [disabled]="loading">
                  <i class="bi bi-graph-up me-2"></i>Get Recommendations
                </button>
              } @else {
                <p class="text-muted mb-3">Upload your CV to get personalized internship recommendations</p>
                <button class="btn btn-primary w-100" (click)="showCVForm = true">
                  <i class="bi bi-upload me-2"></i>Upload CV
                </button>
              }
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

    <!-- CV Form Modal -->
    @if (showCVForm) {
      <div class="modal show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title">
                <i class="bi bi-file-earmark-person me-2"></i>CV Information
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="showCVForm = false"></button>
            </div>
            <div class="modal-body">
              <form (ngSubmit)="saveCV()">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label fw-bold">Full Name *</label>
                    <input type="text" class="form-control" [(ngModel)]="cvData.fullName" name="fullName" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-bold">Email *</label>
                    <input type="email" class="form-control" [(ngModel)]="cvData.email" name="email" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-bold">Phone</label>
                    <input type="tel" class="form-control" [(ngModel)]="cvData.phone" name="phone">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-bold">Location</label>
                    <input type="text" class="form-control" [(ngModel)]="cvData.location" name="location">
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-bold">Professional Summary</label>
                    <textarea class="form-control" [(ngModel)]="cvData.summary" name="summary" rows="3"></textarea>
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-bold">Skills (comma-separated) *</label>
                    <input type="text" class="form-control" [(ngModel)]="skillsText" name="skills" 
                           placeholder="e.g., JavaScript, React, Python, Data Analysis" required>
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-bold">Career Goals</label>
                    <textarea class="form-control" [(ngModel)]="cvData.careerGoals" name="careerGoals" rows="2"
                              placeholder="What are your career aspirations?"></textarea>
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-bold">Preferred Industries (comma-separated)</label>
                    <input type="text" class="form-control" [(ngModel)]="industriesText" name="industries"
                           placeholder="e.g., Technology, Finance, Healthcare">
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" (click)="showCVForm = false">Cancel</button>
                  <button type="submit" class="btn btn-primary" [disabled]="savingCV">
                    @if (savingCV) {
                      <span class="spinner-border spinner-border-sm me-2"></span>
                    }
                    Save CV
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    }
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
  
  // CV related
  hasCV = false;
  showCVForm = false;
  savingCV = false;
  cvData: CVData = {
    fullName: '',
    email: '',
    skills: [],
    experience: [],
    education: []
  };
  skillsText = '';
  industriesText = '';

  constructor(private aiChatService: AIChatService) {}

  ngOnInit() {
    this.checkCV();
  }

  checkCV() {
    this.aiChatService.getCV().subscribe({
      next: (cv: CVData | null) => {
        this.hasCV = !!cv;
        if (cv) {
          this.cvData = cv;
          this.skillsText = cv.skills.join(', ');
          this.industriesText = cv.preferredIndustries?.join(', ') || '';
        }
      },
      error: () => {
        this.hasCV = false;
      }
    });
  }

  saveCV() {
    this.cvData.skills = this.skillsText.split(',').map(s => s.trim()).filter(s => s);
    this.cvData.preferredIndustries = this.industriesText.split(',').map(s => s.trim()).filter(s => s);
    
    this.savingCV = true;
    this.aiChatService.saveCV(this.cvData).subscribe({
      next: () => {
        this.hasCV = true;
        this.showCVForm = false;
        this.savingCV = false;
        this.addSystemMessage('CV saved successfully! You can now get personalized recommendations.');
      },
      error: (err) => {
        this.error = 'Failed to save CV';
        this.savingCV = false;
      }
    });
  }

  analyzeCV() {
    this.loading = true;
    this.error = '';
    
    this.addSystemMessage('Analyzing your CV and matching with available internships...');

    this.aiChatService.analyzeCV().subscribe({
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
        this.error = 'Failed to analyze CV';
        this.loading = false;
      }
    });
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