import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminUIComponent } from './AdminUI/admin-ui/admin-ui.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AdminUIComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Admin_Dashboard';
}
