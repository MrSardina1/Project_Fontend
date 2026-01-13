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

// Admin guard - redirects to admin login if not authenticated
const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.hasRole(['ADMIN'])) {
    return true;
  }

  router.navigate(['/admin/login']);
  return false;
};

export const routes: Routes = [
  { path: '', redirectTo: '/internships', pathMatch: 'full' },

  // Public routes
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
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
    path: 'profile/user/:id',
    loadComponent: () => import('./components/profile/user-profile/user-profile.component').then(m => m.UserProfileComponent)
  },
  {
    path: 'profile/company/:id',
    loadComponent: () => import('./components/profile/company-profile/company-profile.component').then(m => m.CompanyProfileComponent)
  },
  {
    path: 'verify-email',
    loadComponent: () =>
      import('./components/verify-email/verify-email.component').then(m => m.VerifyEmailComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./components/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./components/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },

  // Student routes
  {
    path: 'my-profile',
    loadComponent: () => import('./components/profile/my-profile/my-profile.component').then(m => m.MyProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'my-applications',
    loadComponent: () => import('./components/student/my-applications/my-applications.component').then(m => m.MyApplicationsComponent),
    canActivate: [authGuard, roleGuard(['STUDENT'])]
  },
  {
    path: 'my-reviews',
    loadComponent: () => import('./components/my-reviews/my-reviews.component').then(m => m.MyReviewsComponent),
    canActivate: [authGuard, roleGuard(['STUDENT'])]
  },
  {
    path: 'accepted-companies',
    loadComponent: () => import('./components/student/accepted-companies/accepted-companies.component').then(m => m.AcceptedCompaniesComponent),
    canActivate: [authGuard, roleGuard(['STUDENT'])]
  },

  // Company routes
  {
    path: 'create-internship',
    loadComponent: () => import('./components/create-internship/create-internship.component').then(m => m.CreateInternshipComponent),
    canActivate: [authGuard, roleGuard(['COMPANY'])]
  },
  {
    path: 'my-internships',
    loadComponent: () => import('./components/company/company-internships/company-internships.component').then(m => m.CompanyInternshipsComponent),
    canActivate: [authGuard, roleGuard(['COMPANY'])]
  },
  {
    path: 'internship-applications/:id',
    loadComponent: () => import('./components/company/internship-applications/internship-applications.component').then(m => m.InternshipApplicationsComponent),
    canActivate: [authGuard, roleGuard(['COMPANY'])]
  },

  // Shared (Company & Admin)
  {
    path: 'applications',
    loadComponent: () => import('./components/applications/applications.component').then(m => m.ApplicationsComponent),
    canActivate: [authGuard, roleGuard(['ADMIN', 'COMPANY'])]
  },

  // Public company reviews
  {
    path: 'company-reviews/:id',
    loadComponent: () => import('./components/company-reviews/company-reviews.component').then(m => m.CompanyReviewsComponent)
  },

  // AI Chat
  {
    path: 'ai-chat',
    loadComponent: () => import('./components/ai-chat/ai-chat.component').then(m => m.AIChatComponent),
    canActivate: [authGuard]
  },

  // Admin routes
  {
    path: 'admin/login',
    loadComponent: () => import('./components/admin/admin-login/admin-login-component').then(m => m.AdminLoginComponent)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./components/admin/users/users.component').then(m => m.AdminUsersComponent)
      },
      {
        path: 'companies',
        loadComponent: () => import('./components/admin/companies/companies.component').then(m => m.AdminCompaniesComponent)
      },
      {
        path: 'pending-companies',
        loadComponent: () => import('./components/admin/pending-companies/pending-companies.component').then(m => m.PendingCompaniesComponent)
      },
      {
        path: 'internships',
        loadComponent: () => import('./components/admin/internships/internships.component').then(m => m.AdminInternshipsComponent)
      },
      {
        path: 'applications',
        loadComponent: () => import('./components/admin/applications/applications.component').then(m => m.AdminApplicationsComponent)
      },
      {
        path: 'reviews',
        loadComponent: () => import('./components/admin/reviews/reviews.component').then(m => m.AdminReviewsComponent)
      },
    ]
  },

  // Wildcard route - redirect to home
  { path: '**', redirectTo: '/internships' }
];