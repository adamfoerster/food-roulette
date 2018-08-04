const functions = require('firebase-functions');
const admin = require('firebase-admin');
const moment = require('moment');
admin.initializeApp(functions.config({ timestampsInSnapshots: true }).firebase);

const getDay = () => {
	const today = moment();
	const mm = today.month(); // getMonth() is zero-based
	const dd = today.date();

	return [
		today.year(),
		(mm > 9 ? '' : '0') + mm,
		(dd > 9 ? '' : '0') + dd
	].join('');
	// return '20180804';
}

const randomStar = (results, totalStars): any => {
	const winnerIndex = Math.floor(Math.random() * Math.floor(totalStars));
	let winner: string;
	let acummulator = 0;
	results.forEach(result => {
		acummulator = result.stars;
		if (acummulator >= winnerIndex && !winner) {
			winner = result.restaurant;
		}
	});
	return {
		index: winner,
		random: winnerIndex
	};
};

const getTotalStarPerRestaurant = (scores): any => {
	let totalStars: number = 0;
	const results = Object.keys(scores).map(restId => {
		const restaurant = scores[restId];
		const people = Object.keys(restaurant);
		let stars = 0;
		people.forEach(userId => {
			stars = restaurant[userId] + stars;
			totalStars = totalStars + stars;
		});
		return {
			restaurant: restId,
			stars: stars
		};
	});
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
			resultRef.set(winner);
			return response.send(winner);
		})
		.catch(err => console.log(err))

});
