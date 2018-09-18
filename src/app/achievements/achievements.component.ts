import { Component, OnInit } from '@angular/core';
import { ServiceService } from '../service.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'fr-achievements',
  templateUrl: './achievements.component.html',
  styleUrls: ['./achievements.component.scss']
})
export class AchievementsComponent implements OnInit {
  aux: any;
  achievents: any[] = [];
  rouletters: string[] = [];
  current: string;

  constructor(public service: ServiceService) {}

  ngOnInit() {
    this.service.getUser().subscribe(user => {
      this.current = user.email;
      this.changeRouletter({value: this.current});
    });
    this.service.achievements$.subscribe(a => (this.aux = a));
  }

  changeRouletter(e) {
    this.service.rouletter$
        .pipe(
          tap(rouletters => {
            const rouletter = rouletters
              .find(r => r.email === e.value);
            if (rouletter) {
              this.achievents = rouletter['achievements'];
            }
          })
        )
        .subscribe(rs => this.rouletters = rs.map(r => r.email));
  }
}
