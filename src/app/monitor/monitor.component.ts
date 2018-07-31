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
  view: any;
  @ViewChild('roulette') element: HTMLElement;

  constructor(public renderer: Renderer, public service: ServiceService) { }

  ngOnInit() {
    this.mapResults();
    this.service.currentResult$.subscribe( _ => {
      this.mapResults();
    });
    console.log(this.element.clientWidth);
    this.element.clientWidth;
    // this.view = [this.element.clientWidth, this.element.clientWidth];
  }

  mapResults() {
    if (!this.service.currentStars) return null;
    this.data = this.service.currentStars.map(star => {
      return {name: star.restaurant, value: star.stars};
    });
  }

  onResize(e) {
    console.log(e.target.innerWidth);
    this.view = [this.element.clientWidth, this.element.clientWidth];
  }
}
