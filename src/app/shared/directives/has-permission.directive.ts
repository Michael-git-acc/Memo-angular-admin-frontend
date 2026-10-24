import {
  Directive,
  effect,
  inject,
  input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { PERMISSION_CHECKER, PermissionChecker } from './has-permission.token';

export { PERMISSION_CHECKER, PermissionChecker };

@Directive({
  selector: '[appHasPermission]',
})
export class HasPermissionDirective {
  readonly appHasPermission = input.required<string>();

  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly permissionChecker = inject(PERMISSION_CHECKER, { optional: true });

  private hasView = false;

  constructor() {
    effect(() => {
      const code = this.appHasPermission();
      const autorise = this.permissionChecker ? this.permissionChecker.aPermission(code) : false;

      if (autorise && !this.hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
      } else if (!autorise && this.hasView) {
        this.viewContainer.clear();
        this.hasView = false;
      }
    });
  }
}
