import { Achievement } from './../interfaces';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy
} from '@angular/core';
import { ServiceService } from '../service.service';
import { first, map } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'fr-spinner',
  templateUrl: 'spinner.component.html',
  styleUrls: ['spinner.component.scss']
})
export class SpinnerComponent implements OnInit, OnDestroy {
  @ViewChild('day', { static: true })
  day: ElementRef;
  winner: any;
  gif: string;
  rouletters: any = [];
  emailinput = '';
  achieveinput = '';
  achievements: any = [];
  achievsOfRouletter: string[] = [];
  selectedRouletter;
  selectedAchievement = '';
  sub: any;
  link: any;

  constructor(
    public service: ServiceService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.day.nativeElement.value = this.service.getDay();
    this.service.getWinner().subscribe(winner => (this.winner = winner));
    this.service.getGif().subscribe(result => (this.gif = result['gif']));
    this.service.rouletter$.pipe(first()).subscribe(r => (this.rouletters = r));
    this.service.achievements$
      .pipe(first())
      .subscribe(a => (this.achievements = a));
  }

  spin(url, day) {
    this.link = this.sanitizer.bypassSecurityTrustResourceUrl([
      `https://us-central1-food-roulette-9415c.cloudfunctions.`,
      `net/spinTheRoulette?day=${day}`,
      `&gif=${url}`
    ].join(''));
    // window.open(this.link, '_blank');
  }

  changeEmail(input, e) {
    this.emailinput = e;
  }

  changeAchievements(input, e) {
    this.achieveinput = e;
  }

  get filtered() {
    if (!this.rouletters || !this.rouletters.length) {
      return [];
    }
    return this.rouletters.filter(r => r.email.search(this.emailinput) >= 0);
  }

  get filteredAchieves() {
    if (!this.achievements || !this.achievements.length) {
      return [];
    }
    return this.achievements.filter(
      a => a['name'].search(this.achieveinput) >= 0
    );
  }

  display(e) {
    return e ? e['name'] : null;
  }

  grantAchievement(rouletter, achievement) {
    this.service.grantAchievement(
      rouletter,
      this.achievements.find(a => a.name === achievement).id
    );
  }

  selectAchievement(e) {
    this.selectedAchievement = e;
  }

  selectRouletter(e) {
    this.selectedRouletter = e;
    console.log(e);
    const achieved = this.getAchievementsOfRouletter(e);
    this.achievsOfRouletter = this.achievements.filter(a =>
      achieved.includes(a.id)
    );
  }

  getAchievementsOfRouletter(rouletter) {
    return rouletter.achievements;
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
