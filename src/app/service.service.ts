import { forEach } from '@angular/router/src/utils/collection';
import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import {
  Observable,
  combineLatest,
  BehaviorSubject,
  Subject,
  empty,
  of
} from 'rxjs';
import { AngularFireAuth } from 'angularfire2/auth';
import { auth } from 'firebase/app';
import {
  map,
  first,
  filter,
  switchMap,
  shareReplay,
  tap
} from 'rxjs/operators';
import { Router } from '@angular/router';
import { Achievement } from './interfaces';

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
    this.restaurant$ = this.getRestaurants().pipe(
      filter(r => !!r),
      first()
    );
    this.scoreOfDay$ = this.db
      .collection('days')
      .doc(this.getDay())
      .valueChanges();
    combineLatest(
      this.restaurant$,
      this.scoreOfDay$,
      this.getUser().pipe(
        filter(u => !!u && !!u['email']),
        first()
      )
    ).subscribe(res => {
      const restaurants = res[0];
      const scores = res[1] ? res[1] : [];
      const { email } = user;

      this.scoreOfDaySnap = scores;

      this.restaurantsScored = this.getRestaurantsScored(scores, email);
      const qtdRestScored = this.restaurantsScored.length;
      const qtdRest = restaurants.length;

      this.currentStars = this.getTotalStarPerRestaurant(scores, restaurants);
      this.currentResult$.next(this.currentStars);

      if (qtdRestScored === qtdRest && qtdRest !== 0) {
        this.finished$.next(true);
      } else {
        this.finished$.next(false);
      }
    });
  }

  login() {
    this.afAuth.auth
      .signInWithRedirect(new auth.GoogleAuthProvider())
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
    return this.db
      .collection('restaurants')
      .snapshotChanges()
      .pipe(
        shareReplay(1),
        map((actions: any) => this.getObjectWithId(actions)),
        map(rests => rests.filter(rest => !!rest.enabled))
      );
  }

  getResults() {
    return this.db
      .collection('results')
      .valueChanges()
      .pipe(first());
  }

  getResult() {
    return this.db
      .collection('results')
      .doc(this.getDay())
      .valueChanges()
      .pipe(first());
  }

  addScore(restaurant, score) {
    combineLatest(
      this.getUser(),
      this.db
        .collection('days')
        .doc(this.getDay())
        .valueChanges()
    )
      .pipe(first())
      .subscribe(comb => {
        const rest = restaurant.id;
        const { email } = comb[0];
        const doc = comb[1] ? comb[1] : {};
        const newDoc = {
          ...doc,
          [rest]: {
            ...(doc[rest] ? doc[rest] : {}),
            [email]: score
          }
        };
        this.db
          .collection('days')
          .doc(this.getDay())
          .set(newDoc)
          .catch(error => console.log(error));
      });
  }

  multipleScore(restaurants, score) {
    combineLatest(
      this.getUser(),
      this.db
        .collection('days')
        .doc(this.getDay())
        .valueChanges()
    )
      .pipe(first())
      .subscribe(comb => {
        const { email } = comb[0];
        const doc = comb[1] ? comb[1] : {};
        const restIds = restaurants.map(rest => rest.id);
        let newRests = {};
        restIds.forEach(id => newRests[id] = {
          ...(doc[id] ? doc[id] : {}),
            [email]: score
        });
        const newDoc = {
          ...doc,
          ...newRests
        };
        this.db
          .collection('days')
          .doc(this.getDay())
          .set(newDoc)
          .catch(error => console.log(error));
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
      const rest = this.getRestaurant(restaurants, restId);
      return {
        restaurant: rest ? rest['name'] : '',
        stars: stars
      };
    });
  }

  getRestaurant(restaurants, id) {
    return restaurants.find(rest => rest.id == id);
  }

  getRestaurantsScored(scores, email) {
    const restaurants: string[] = [];
    Object.keys(scores).forEach(restId => {
      if (scores[restId][email] !== undefined) {
        restaurants.push(restId);
      }
    });
    return restaurants;
  }

  getWinner(): Observable<any> {
    return combineLatest(
      this.db
        .collection('results')
        .doc(this.getDay())
        .valueChanges(),
      this.getRestaurants()
    ).pipe(
      filter(combo => !!combo[0] && !!combo[0]['winner']),
      map(combo => {
        const winner = combo[0];
        const restaurants = combo[1];
        return restaurants.find(rest => winner['winner']['index'] === rest.id)
          .name;
      })
    );
  }

  getWinnerId(): Observable<any> {
    return this.db
      .collection('results')
      .doc(this.getDay())
      .valueChanges()
      .pipe(
        first(),
        filter(combo => !!combo && !!combo['winner']),
        map(winner => winner['winner']['index'])
      );
  }

  getVoters() {
    return combineLatest(
      this.db
        .collection('days')
        .doc(this.getDay())
        .valueChanges(),
      this.getWinnerId()
    ).pipe(
      first(),
      tap(doc => console.log(doc)),
      map(doc => Object.keys(doc[0][doc[1]]).join(','))
    );
  }

  getGif() {
    return this.db
      .collection('results')
      .doc(this.getDay())
      .valueChanges()
      .pipe(
        map(result => {
          if (!result || !result['gif']) {
            return {
              gif: 'https://media.giphy.com/media/l4FGr3nzq5u0m02vm/giphy.gif'
            };
          }
          return result;
        })
      );
  }

  getHumanDate() {
    const dt = this.getDay();
    return `${dt.substr(6, 2)}/${dt.substr(4, 2)}/${dt.substr(0, 4)}`;
  }

  get achievements$(): Observable<Achievement[]> {
    return this.getUser().pipe(
      first(),
      switchMap(user => {
        if (!user.email) {
          return empty();
        }
        return this.db
          .collection<Achievement>('achievements')
          .valueChanges()
          .pipe(first());
      })
    );
  }

  get myAchievements$(): Observable<string[]> {
    return this.getUser().pipe(
      first(),
      switchMap(user => {
        if (!user.email) {
          return empty();
        }
        return this.db
          .collection('rouletters', ref => ref.where('email', '==', user.email))
          .valueChanges()
          .pipe(
            first(),
            map(rouletter => rouletter[0]['achievements'])
          );
      })
    );
  }

  get rouletter$(): Observable<any> {
    return this.db.collection('rouletters').valueChanges();
  }

  getMyTodayVotes() {
    return combineLatest(
      this.db
        .collection('days')
        .doc(this.getDay())
        .valueChanges(),
      this.getUser()
    ).pipe(
      map(combo => {
        const restaurants = combo[0] ? Object.keys(combo[0]) : [];
        const email = combo[1].email;
        const idsVoted = [];
        restaurants.forEach(rest => {
          if (combo[0][rest][email]) {
            idsVoted.push(rest);
          }
        });
        return idsVoted;
      })
    );
  }

  zeroToOthers() {
    combineLatest(this.getRestaurants(), this.getMyTodayVotes())
      .pipe(
        first(),
        map(combo => {
          const rests = combo[0].map(rest => rest.id);
          return rests.filter(rest => !combo[1].includes(rest));
        }),
        switchMap(rests =>
          combineLatest(this.getRestaurants().pipe(first()), of(rests))
        )
      )
      .subscribe(combo => {
        const restaurants = combo[0];
        const notVoted = combo[1];
        let restsToZero = [];
        notVoted.forEach(notVote => {
          restsToZero.push(restaurants.find(rest => notVote === rest.id));
        });
        this.multipleScore(restsToZero, 0);
      });
  }

  grantAchievement(email, achievementId) {
    this.rouletter$.pipe(first()).subscribe(combo => {
      const rouletter = combo.find(roul => roul.email === email);
      this.db
        .collection('rouletters')
        .doc(email)
        .set({
          ...rouletter,
          achievements: [...rouletter.achievements, achievementId]
        });
    });
  }
}
