"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
const functions = require('firebase-functions');
admin.initializeApp();
const getDay = () => {
    return '20180807';
};
const randomStar = (results, totalStars) => {
    const winnerIndex = Math.floor(Math.random() * Math.floor(totalStars));
    let winner;
    let acummulator = 0;
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
const getTotalStars = (restaurants) => {
    let totalStars = 0;
    restaurants.forEach(rest => totalStars = totalStars + rest.stars);
    return totalStars;
};
const getTotalStarPerRestaurant = (scores) => {
    const results = Object.keys(scores).map(restId => {
        const restaurant = scores[restId];
        const people = Object.keys(restaurant);
        let stars = 0;
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
        resultRef.set(winner);
        return response.send(winner);
    })
        .catch(err => console.log(err));
});
//# sourceMappingURL=index.js.map