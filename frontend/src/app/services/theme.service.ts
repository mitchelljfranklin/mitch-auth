import { Injectable } from '@angular/core'

export type ThemeMode = 'system' | 'dark' | 'light'

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private _themeMode: ThemeMode = 'system'

  constructor() {
    this.themeMode = localStorage.getItem('theme_mode') as ThemeMode | null ?? this.themeMode
  }

  get themeMode() {
    return this._themeMode
  };

  set themeMode(mode: ThemeMode) {
    this._themeMode = mode
    localStorage.setItem('theme_mode', mode)
    const root = document.documentElement
    root.classList.toggle('dark', mode === 'dark')
    root.classList.toggle('light', mode === 'light')
  }
}
