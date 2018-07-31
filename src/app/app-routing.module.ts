import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ScoreComponent } from './score/score.component';
import { MonitorComponent } from './monitor/monitor.component';

const routes: Routes = [
  { path: '', component: ScoreComponent },
  { path: 'monitor', component: MonitorComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
