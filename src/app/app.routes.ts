// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    return true;
  }
  
  router.navigate(['/login']);
  return false;
};

const roleGuard = (roles: string[]) => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    if (authService.isAuthenticated() && authService.hasRole(roles)) {
      return true;
    }
    
    router.navigate(['/']);
    return false;
  };
};

export const routes: Routes = [
  { path: '', redirectTo: '/internships', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./components/login/login.components').then(m => m.LoginComponent) 
  },
  { 
    path: 'register', 
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent) 
  },
  { 
    path: 'register-company', 
    loadComponent: () => import('./components/register-company/register-company.component').then(m => m.RegisterCompanyComponent) 
  },
  { 
    path: 'internships', 
    loadComponent: () => import('./components/internships/internships.component').then(m => m.InternshipsComponent) 
  },
  { 
    path: 'create-internship', 
    loadComponent: () => import('./components/create-internship/create-internship.component').then(m => m.CreateInternshipComponent),
    canActivate: [authGuard, roleGuard(['COMPANY'])]
  },
  { 
    path: 'applications', 
    loadComponent: () => import('./components/applications/applications.component').then(m => m.ApplicationsComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'my-reviews', 
    loadComponent: () => import('./components/my-reviews/my-reviews.component').then(m => m.MyReviewsComponent),
    canActivate: [authGuard, roleGuard(['STUDENT'])]
  },
  { 
    path: 'company-reviews/:id', 
    loadComponent: () => import('./components/company-reviews/company-reviews.component').then(m => m.CompanyReviewsComponent)
  },
  { 
    path: 'ai-chat', 
    loadComponent: () => import('./components/ai-chat/ai-chat.component').then(m => m.AIChatComponent),
    canActivate: [authGuard]
  }
];