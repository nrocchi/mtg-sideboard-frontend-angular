import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'

import { ErrorDisplayComponent } from './components/error-display/error-display.component'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ErrorDisplayComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'mtg-sideboard-frontend-angular'
}
