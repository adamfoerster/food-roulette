import { Component, OnInit, OnDestroy } from '@angular/core';
import { ServiceService } from '../service.service';
import { tap, first, switchMap } from 'rxjs/operators';

@Component({
  selector: 'fr-achievements',
  templateUrl: './achievements.component.html',
  styleUrls: ['./achievements.component.scss']
})
export class AchievementsComponent implements OnInit, OnDestroy {
  aux: any;
  achievents: any[] = [];
  rouletters: string[] = [];
  current: string;
  subs: any[] = [];

  constructor(public service: ServiceService) {}

  ngOnInit() {
    this.subs.push(
      this.service
        .getUser()
        .pipe()
        .subscribe(user => {
          this.current = user.email;
          this.changeRouletter({ value: this.current });
        })
    );
    this.subs.push(this.service.achievements$.subscribe(a => (this.aux = a)));
  }

  changeRouletter(e) {
    this.service.rouletter$
      .pipe(
        first(),
        tap(rouletters => {
          const rouletter = rouletters.find(r => r.email === e.value);
          if (rouletter) {
            this.achievents = rouletter['achievements'];
          }
          this.rouletters = rouletters
            .map(roul => roul.email)
            .sort()
            .filter((v, i, a) => a.indexOf(v) === i);
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }
}
