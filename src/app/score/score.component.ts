import { Component, OnInit } from '@angular/core';
import { ServiceService } from '../service.service';

@Component({
  selector: 'fr-score',
  templateUrl: './score.component.html',
  styleUrls: ['./score.component.scss']
})
export class ScoreComponent implements OnInit {
  scores = [1,2,3,4,5];

  constructor(public service: ServiceService) { }

  ngOnInit() {
  }

  isStarLit(restaurant, star): boolean {
    return true;
  }

  saveScore(restaurant, score){
    this.service.addScore(restaurant, score);
  }

}
