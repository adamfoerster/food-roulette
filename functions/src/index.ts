import * as firebase from 'firebase';
import * as admin from 'firebase-admin';
const functions = require('firebase-functions');

admin.initializeApp();

const getDay = () => {
	return '20180810';
}

const randomStar = (results, totalStars): any => {
	const winnerIndex = Math.floor(Math.random() * Math.floor(totalStars));
	let winner: string;
	let acummulator:number = 0;
	results.forEach(result => {
		acummulator = acummulator + result.stars;
		if (acummulator >= winnerIndex && !winner) {
			winner = result.restaurant;
		}
	});
	return {
		index: winner,
		random: winnerIndex
	};
};

const getTotalStars = (restaurants: any[]): number => {
	let totalStars: number = 0;
	restaurants.forEach(rest => totalStars = totalStars + rest.stars);
	return totalStars;
}

const getTotalStarPerRestaurant = (scores): any => {
	const results = Object.keys(scores).map(restId => {
		const restaurant = scores[restId];
		const people = Object.keys(restaurant);
		let stars: number = 0;
		people.forEach(userId => {
			stars = restaurant[userId] + stars;
		});
		return {
			restaurant: restId,
			stars: stars
		};
	});
	const totalStars = getTotalStars(results);
	return {
		stars: results,
		total: totalStars,
		winner: randomStar(results, totalStars)
	};
};

exports.spinTheRoulette = functions.https.onRequest((request, response) => {
	const currentDay = getDay();
	const docRef = admin.firestore().collection('days').doc(currentDay);
	const resultRef = admin.firestore().collection('results').doc(currentDay);
	return docRef.get()
		.then(querySnapshot => {
			const winner = getTotalStarPerRestaurant(querySnapshot.data());
			resultRef.set(winner)
				.then(r => console.log('ok:'+r))
				.catch(e => console.log(e));
			return response.send(winner);
		})
		.catch(err => console.log(err))
});
