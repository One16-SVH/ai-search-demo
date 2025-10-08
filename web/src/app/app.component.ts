import { TitleCasePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

type ThemeMode = 'auto' | 'light' | 'dark';

@Component({
  imports: [RouterModule, TitleCasePipe],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'web';
  modes: ThemeMode[] = ['auto', 'light', 'dark'];
  current = signal<ThemeMode>('auto');

  ngOnInit() {
    // Initialize based on current html class or system preference
    const html = document.documentElement;
    if (html.classList.contains('light')) this.current.set('light');
    else if (html.classList.contains('dark')) this.current.set('dark');
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) this.current.set('dark');
  }

  changeTheme(mode: 'light' | 'dark' | 'auto') {
    const html = document.documentElement;
    html.classList.remove('light', 'dark');
    if (mode !== 'auto') html.classList.add(mode);
  }
}
