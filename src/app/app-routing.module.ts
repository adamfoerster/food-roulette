import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ScoreComponent } from './score/score.component';
import { MonitorComponent } from './monitor/monitor.component';
import { StatsComponent } from './stats/stats.component';
import {
  AchievementsComponent
} from './achievements/achievements.component';

const routes: Routes = [
  { path: '', component: ScoreComponent },
  { path: 'monitor', component: MonitorComponent },
  { path: 'stats', component: StatsComponent },
  { path: 'achievements', component: AchievementsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
