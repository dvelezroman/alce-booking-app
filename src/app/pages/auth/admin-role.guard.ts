import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs';
import { UserRole } from '../../services/dtos/user.dto';
import { selectUserData } from '../../store/user.selector';

/** Solo administradores (JWT + rol). */
export const adminOnlyGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);
  return store.select(selectUserData).pipe(
    take(1),
    map((user) => {
      if (user?.role === UserRole.ADMIN) {
        return true;
      }
      void router.navigate(['/dashboard/home']);
      return false;
    }),
  );
};
