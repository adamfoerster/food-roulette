import { Component, OnInit, OnChanges, Renderer, HostBinding, ViewChild, ViewEncapsulation } from '@angular/core';
import { ServiceService } from '../service.service';
@Component({
  selector: 'fr-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MonitorComponent implements OnInit {
  elWidth: number;
  data: any;
  view: any = [300, 300];
  colors: any = {
    domain: ['#CC0000', '#CC6600', '#CCCC00', '#66CC00', '#00CC00', '#00CC66', '#00CCCC', '#0066CC', '#0000CC', '#000066']
  };
  @ViewChild('roulette') element: HTMLElement;
  isSpinning: boolean = false;

  constructor(public renderer: Renderer, public service: ServiceService) { }

  ngOnInit() {
    this.mapResults();
    this.service.currentResult$.subscribe( _ => {
      this.mapResults();
    });
  }

  mapResults() {
    if (!this.service.currentStars) return null;
    this.data = this.service.currentStars.map(star => {
      return {name: star.restaurant, value: star.stars};
    });
  }

  spin() {
    this.isSpinning = !this.isSpinning;
  }
}
