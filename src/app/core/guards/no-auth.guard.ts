import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const noAuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  
  if (typeof window !== 'undefined' && window.localStorage) {
    const token = localStorage.getItem('token');
    
    if (token) {
      router.navigate(['/dashboard']);
      return false;
    }
  }

  return true;
};
