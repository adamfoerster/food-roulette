import { Component } from '@angular/core';
import { ServiceService } from './service.service';

@Component({
  selector: 'fr-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private service: ServiceService) {
  }

  login() {
    this.service.login();
  }

  logout() {
    this.service.logout();
  }

  getUser() {
    return this.service.getUser();
  }
}
