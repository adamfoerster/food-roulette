import { Component, ViewChild, TemplateRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ServiceService } from './service.service';
import { SwUpdate } from '@angular/service-worker';
import { MatSnackBar, MatBottomSheet } from '@angular/material';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'fr-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('menu')
  menu: TemplateRef<any>;
  constructor(
    private service: ServiceService,
    private swUpdate: SwUpdate,
    public snackBar: MatSnackBar,
    private bottomSheet: MatBottomSheet,
    private router: Router
  ) {
    this.swUpdate.available.subscribe(event => {
      window.location.reload();
    });

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(_ => this.bottomSheet.dismiss());
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

  openMenu() {
    this.bottomSheet.open(this.menu);
    setTimeout(_ => this.bottomSheet.dismiss(), 3000);
  }
}
