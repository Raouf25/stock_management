import { Injectable, signal, effect } from '@angular/core';

const THEME_STORAGE_KEY = 'theme';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly _isDarkMode = signal<boolean>(this.resolveInitialTheme());
  readonly isDarkMode = this._isDarkMode.asReadonly();

  constructor() {
    // Apply immediately so there is no flash of wrong theme on first render
    this.applyTheme(this._isDarkMode());

    // Keep the DOM attribute in sync whenever the signal changes
    effect(() => {
      this.applyTheme(this._isDarkMode());
    });
  }

  toggleTheme(): void {
    this._isDarkMode.update(isDark => !isDark);
  }

  private resolveInitialTheme(): boolean {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved !== null) {
      return saved === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private applyTheme(isDark: boolean): void {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
  }
}
