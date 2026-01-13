import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-career-roadmap',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="container py-5">
      <div class="roadmap-header mb-5 text-center">
        <h1 class="display-4 fw-800 text-gradient mb-3">Your Career Roadmap</h1>
        <p class="lead text-muted">AI-powered skill gap analysis and internship path optimization.</p>
      </div>

      <div class="row g-4 justify-content-center">
        <div class="col-md-8">
          <div class="card glass border-0 shadow-lg p-5 text-center rounded-5">
            <div class="feature-icon mb-4 fs-1">🚀</div>
            <h2 class="fw-700 mb-4">Coming Soon: Skill Sync AI</h2>
            <p class="mb-4 fs-5 text-muted">
              We are building a powerful AI tool that analyzes your applications and the most popular internships 
              to provide you with a personalized learning path and trending technology recommendations.
            </p>
            <div class="d-flex justify-content-center gap-3">
              <span class="badge bg-soft-primary text-primary px-3 py-2 rounded-pill">Machine Learning</span>
              <span class="badge bg-soft-success text-success px-3 py-2 rounded-pill">Skill Mapping</span>
              <span class="badge bg-soft-info text-info px-3 py-2 rounded-pill">Industry Insights</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .display-4 { font-weight: 800; }
    .text-gradient {
      background: linear-gradient(135deg, #4f46e5 0%, #10b981 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  `]
})
export class CareerRoadmapComponent { }
