import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable, combineLatest } from 'rxjs';
import { AngularFireAuth } from 'angularfire2/auth';
import { auth } from 'firebase';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  restaurant$: Observable<any>;
  scoreOfDay$: Observable<any>;
  currentResult$: Observable<any>;

  constructor(private db: AngularFirestore, public afAuth: AngularFireAuth) {
    this.restaurant$ = this.db.collection('restaurants').snapshotChanges().pipe(
      map((actions: any) => this.getObjectWithId(actions)));
    this.scoreOfDay$ = this.db.collection('days').doc(this.getDay())
      .snapshotChanges()
      .pipe(map((actions: any) => this.getObjectWithId(actions)));
    // this.currentResult$ = combineLatest(this.restaurant$,this.scoreOfDay$)
    combineLatest(this.restaurant$,this.scoreOfDay$)
      .pipe(tap(res => {
        const restaurants = res[0];
        const scores = res[1];
        console.log(scores)
        // return restaurants.map(restaurant => {
        //   return
        // });
      }))
      .subscribe(res => console.log(res));
  }

  login() {
    this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider());
  }

  logout() {
    this.afAuth.auth.signOut();
  }

  getUser(): Observable<any> {
    return this.afAuth.user;
  }

  addScore(restaurant, score) {
    this.getUser().subscribe(user => {
      this.db.collection(`days/${this.getDay()}/scores/${restaurant.id}/people`)
        .doc(user.uid).set({ score: score });
    });
  }

  getDay() {
    const today = new Date();
    const mm = today.getMonth() + 1; // getMonth() is zero-based
    const dd = today.getDate();

    return [
      today.getFullYear(),
      (mm > 9 ? '' : '0') + mm,
      (dd > 9 ? '' : '0') + dd
    ].join('');
  }

  addResults(score) {
    return score.reduce((total, people) => {
      return total + people.score;
    });
  }

  getObjectWithId(object) {
    console.log(object)
    return object.map(a => {
      const data = a.payload.doc.data();
      const id = a.payload.doc.id;
      return { id, ...data };
    });
  }

  mapRestaurant(restaurant, scores) {
    return {
      ...restaurant,
      result: scores.find(score => )
    };
  }
}
