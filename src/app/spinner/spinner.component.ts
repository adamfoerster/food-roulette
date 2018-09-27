import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ServiceService } from '../service.service';

@Component({
  selector: 'fr-spinner',
  templateUrl: 'spinner.component.html',
  styleUrls: ['spinner.component.scss']
})
export class SpinnerComponent implements OnInit {
  @ViewChild('day')
  day: ElementRef;
  winner: any;
  gif: string;

  constructor(public service: ServiceService) {}

  ngOnInit() {
    this.day.nativeElement.value = this.service.getDay();
    this.service.getWinner()
      .subscribe(winner => (this.winner = winner));
    this.service.getGif()
      .subscribe(result => (this.gif = result['gif']));
  }

  spin(url, day) {
    const link = [
      `https://us-central1-food-roulette-9415c.cloudfunctions.`,
      `net/spinTheRoulette?day=${day}`,
      `&gif=${url}`
    ].join('');
    window.open(link, '_blank');
  }
}
