import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable, combineLatest, BehaviorSubject, Subject } from 'rxjs';
import { AngularFireAuth } from 'angularfire2/auth';
import { auth } from 'firebase/app';
import { map, tap, first, filter } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  restaurant$: Observable<any>;
  scoreOfDay$: Observable<any>;
  scoreOfDaySnap: any;
  restaurantsScored: string[] = [];
  currentResult$: Subject<any> = new Subject();
  finished$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  currentStars: any[];

  constructor(
    private router: Router,
    private db: AngularFirestore,
    public afAuth: AngularFireAuth
  ) {
    this.getUser()
      .pipe(filter(u => !!u && !!u.uid))
      .subscribe(u => this.initialize(u));
  }

  initialize(user) {
    this.restaurant$ = this.getRestaurants();
    this.scoreOfDay$ = this.db.collection('days').doc(this.getDay())
      .valueChanges();
    combineLatest(this.restaurant$, this.scoreOfDay$)
      .pipe(tap(res => {
        // creates current day if doesnt exist
        if (!res[1]) this.db.collection('days').doc(this.getDay()).set({})
      }))
      .subscribe(res => {
        const restaurants = res[0];
        const scores = res[1];
        const { uid } = user;
        const qtdRestScored = this.getRestaurantsScored(scores, uid).length;
        const qtdRest = restaurants.length;

        this.scoreOfDaySnap = scores;
        if (!scores) {
          return this.db.collection('days').doc(this.getDay()).set({});
        }
        this.restaurantsScored = Object.keys(scores)
          .map(restId => scores[restId][uid] ? restId : null);

        this.currentStars = this.getTotalStarPerRestaurant(scores, restaurants);
        this.currentResult$.next(this.currentStars);

        if (qtdRestScored == qtdRest && qtdRest != 0) {
          this.finished$.next(true);
        } else {
          this.finished$.next(false);
        }
      });
  }

  login() {
    this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider())
      .then(u => this.initialize(u));
  }

  logout() {
    this.afAuth.auth.signOut();
    this.router.navigate(['/']);
  }

  getUser(): Observable<any> {
    return this.afAuth.user;
  }

  getRestaurants() {
    return this.db.collection('restaurants').snapshotChanges()
      .pipe(map((actions: any) => this.getObjectWithId(actions)));
  }

  addScore(restaurant, score) {
    this.getUser().pipe(first()).subscribe(comb => {
      const rest = restaurant.id;
      const { uid } = comb;
      this.db.collection('days').doc(this.getDay()).set({
        ...this.scoreOfDaySnap,
        [rest]: {
          ...this.scoreOfDaySnap[rest],
          [uid]: score
        }
      });
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
    return object.map(a => {
      const data = a.payload.doc.data();
      const id = a.payload.doc.id;
      return { id, ...data };
    });
  }

  getTotalStarPerRestaurant(scores, restaurants): any[] {
    return Object.keys(scores).map(restId => {
      const restaurant = scores[restId];
      const people = Object.keys(restaurant);
      let stars = 0;
      people.forEach(userId => {
        stars = restaurant[userId] + stars;
      });
      return {
        restaurant: this.getRestaurant(restaurants, restId)['name'],
        stars: stars
      }
    });
  }

  getRestaurant(restaurants, id) {
    return restaurants.find(rest => rest.id == id);
  }

  getRestaurantsScored(scores, uid) {
    let restaurants: string[] = [];
    Object.keys(scores)
      .forEach(restId => {
        if (scores[restId][uid]) restaurants.push(restId);
      });
    return restaurants;
  }

  getWinner(): Observable<any> {
    // return combineLatest(
    //   this.db.collection('results').doc(this.getDay()).valueChanges(),
    //   this.getRestaurants()
    // )
    return this.db.collection('results').doc(this.getDay()).valueChanges()
    .pipe(
      map(combo => {
        return combo;
        // const winner = combo[0];
        // console.log(winner)
        // const restaurants = combo[1];
        // return restaurants
        //   .find(rest => winner['winner']['index'] == rest.id).name;
      })
    );
  }
}
