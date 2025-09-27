import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);

  const id_usuario_actual = localStorage.getItem('id_usuario_actual');

  if (id_usuario_actual) {
    return true;
  }

  router.navigate(['/login']); 
  return false;
};
