import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { LocaleSelectorComponent } from './core/i18n/locale-selector.component';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, MatButtonModule, MatSidenavModule, MatToolbarModule, LocaleSelectorComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
