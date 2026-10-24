import { Injectable, signal, Signal } from '@angular/core';
import { Toast, ToastType } from './toast.types';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts: Signal<readonly Toast[]> = this._toasts.asReadonly();

  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();

  show(message: string, type: ToastType, duration?: number): string {
    const finalDuration = duration ?? (type === 'error' ? 8000 : 5000);
    const id = crypto.randomUUID();

    const newToast: Toast = {
      id,
      type,
      message,
      duration: finalDuration,
    };

    this._toasts.update((current) => [...current, newToast]);

    if (finalDuration > 0) {
      const timer = setTimeout(() => {
        this.dismiss(id);
      }, finalDuration);
      this.timers.set(id, timer);
    }

    return id;
  }

  success(message: string, duration?: number): string {
    return this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): string {
    return this.show(message, 'error', duration ?? 8000);
  }

  info(message: string, duration?: number): string {
    return this.show(message, 'info', duration);
  }

  warning(message: string, duration?: number): string {
    return this.show(message, 'warning', duration);
  }

  dismiss(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this._toasts.update((current) => current.filter((t) => t.id !== id));
  }
}
