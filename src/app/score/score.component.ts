import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ServiceService } from '../service.service';

@Component({
  selector: 'fr-score',
  templateUrl: './score.component.html',
  styleUrls: ['./score.component.scss']
})
export class ScoreComponent implements OnInit, OnDestroy {
  scores = [1,2,3,4,5];
  subFin: any;

  constructor(public service: ServiceService, private router: Router) {
    this.service.restaurant$ = this.service.getRestaurants();
  }

  ngOnInit() {
    this.subFin = this.service.finished$.subscribe(finished => {
      if (finished) this.router.navigate(['monitor']);
    });
  }

  isStarLit(restaurant, star): boolean {
    return true;
  }

  saveScore(restaurant, score){
    this.service.addScore(restaurant, score);
  }

  ngOnDestroy() {
    this.subFin.unsubscribe();
  }

}
