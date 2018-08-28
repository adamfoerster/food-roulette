import { Component, OnInit } from '@angular/core';
import { ServiceService } from '../service.service';
import { Observable } from 'rxjs';

import { Achievement } from '../interfaces';

@Component({
  selector: 'fr-achievements',
  templateUrl: './achievements.component.html',
  styleUrls: ['./achievements.component.scss'],
})
export class AchievementsComponent implements OnInit {
  aux: any;
  my: any[] = [];

  constructor(public service: ServiceService) { }

  ngOnInit() {
    this.service.achievements$.subscribe(a => this.aux = a);
    this.service.myAchievements$.subscribe(a => this.my = a);
  }
}
