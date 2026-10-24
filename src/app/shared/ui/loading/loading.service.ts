import { computed, Injectable, signal, Signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private readonly count = signal<number>(0);
  readonly isLoading: Signal<boolean> = computed(() => this.count() > 0);

  begin(): void {
    this.count.update((c) => c + 1);
  }

  end(): void {
    this.count.update((c) => Math.max(0, c - 1));
  }
}
