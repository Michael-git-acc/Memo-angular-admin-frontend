import { InjectionToken } from '@angular/core';

export interface PermissionChecker {
  aPermission(code: string): boolean;
}

export const PERMISSION_CHECKER = new InjectionToken<PermissionChecker>('PERMISSION_CHECKER');
