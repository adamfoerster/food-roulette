import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { AngularFireAuth } from 'angularfire2/auth';
import { auth } from 'firebase';
import { map, tap, first } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class ServiceService {
	restaurant$: Observable<any>;
	scoreOfDay$: Observable<any>;
	scoreOfDaySnap: any;
	restaurantsScored: string[] = [];
	currentResult$: Observable<any>;
	finished$: BehaviorSubject<boolean> = new BehaviorSubject(false);
	currentStars: any[];

	constructor(private db: AngularFirestore, public afAuth: AngularFireAuth) {
		this.restaurant$ = this.db.collection('restaurants').snapshotChanges().pipe(
			map((actions: any) => this.getObjectWithId(actions)));
		this.scoreOfDay$ = this.db.collection('days').doc(this.getDay()).valueChanges()
		// creates current day if doesnt exist
		combineLatest(this.restaurant$, this.scoreOfDay$, this.getUser())
			.pipe(tap(res => {
				if (!res[1]) this.db.collection('days').doc(this.getDay()).set({})
			}))
			.subscribe(res => {
				const restaurants = res[0];
				const scores = res[1];
				const { uid } = res[2];
				const qtdRestScored = this.restaurantsScored.length;
				const qtdRest = restaurants.length;

				this.scoreOfDaySnap = scores;
				if (!scores) {
					return this.db.collection('days').doc(this.getDay()).set({});
				}
				this.restaurantsScored = Object.keys(scores)
					.map(restId => scores[restId][uid] ? restId : null);

				this.currentStars = this.getTotalStarPerRestaurant(scores, restaurants);

				if (qtdRestScored == qtdRest && qtdRest != 0) {
					this.finished$.next(true);
				}
			});
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

	mapRestaurant(restaurant, scores) {
		return {
			...restaurant,
			result: scores.find(score => 3)
		};
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
}
