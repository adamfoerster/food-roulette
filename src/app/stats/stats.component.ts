import { Component, OnInit } from '@angular/core';
import { ServiceService } from '../service.service';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'fr-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {
  restaurant$: Observable<any[]>;
  result$: Observable<any[]>;
  stats: Observable<any[]>;

  constructor(public service: ServiceService) {}

  ngOnInit() {
    this.restaurant$ = this.service.getRestaurants();
    this.result$ = this.service.getResults();

    this.stats = combineLatest(
      this.restaurant$,
      this.result$
    ).pipe(
      map(combo => {
        return combo[0].map(restaurant => {
          return {
            name: restaurant.name,
            stars: combo[1].reduce((prev, curr) => {
              if (!curr || !curr.stars) {
                return prev;
              }
              const stars = curr.stars.find(
                star => star.restaurant === restaurant.id
              );
              if (!stars) {
                return prev;
              }
              return prev + parseInt(stars.stars);
            }, 0),
            days: combo[1].reduce((prev, curr) => {
              if (!curr || !curr.stars) {
                return prev;
              }
              const stars = curr.stars.find(
                star => star.restaurant === restaurant.id
              );
              if (!stars) {
                return prev;
              }
              return prev + 1;
            }, 0),
            won: combo[1].reduce((prev, curr) => {
              if (!curr || !curr.winner || !curr.winner.index) {
                return prev;
              }
              if (curr.winner.index === restaurant.id) {
                return prev + 1;
              } else {
                return prev;
              }
            }, 0)
          };
        });
      })
    );
  }
}
