import { Component } from '@angular/core';
import { ServiceService } from './service.service';
import { SwPush } from '@angular/service-worker';
import { SwUpdate } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'fr-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    private service: ServiceService,
    private swPush: SwPush,
    private swUpdate: SwUpdate,
    public snackBar: MatSnackBar
  ) {
    this.swUpdate.available.subscribe(event => {
      let snackBarRef = this.snackBar
        .open('Newer version of the app is available', 'Refresh');

      snackBarRef.onAction().subscribe(() => {
        window.location.reload()
      })
    })
  }

  subscribeToPush() {
    this.swPush.requestSubscription({
      serverPublicKey: 'VAPID_PUBLIC_KEY'
    }).then(pushSubscription => {
      // Pass subscription object to backend
    })
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
