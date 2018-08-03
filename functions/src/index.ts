const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const getDay = () => {
  // const today = new Date();
  // const mm = today.getMonth() + 1; // getMonth() is zero-based
  // const dd = today.getDate();
  //
  // return [
  //   today.getFullYear(),
  //   (mm > 9 ? '' : '0') + mm,
  //   (dd > 9 ? '' : '0') + dd
  // ].join('');
  return '20180803';
}

const randomStar = (results, totalStars): string => {
  const winnerIndex = Math.floor(Math.random() * Math.floor(totalStars));
  let winner = '';
  return results.reduce((a, b) => {
    if (a + b.stars >= winnerIndex) winner = b.restaurant
    return a + b;
  });
};

const getTotalStarPerRestaurant = (scores): any => {
  let totalStars: number = 0;
  let results = Object.keys(scores)
    .map(restId => {
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

  return docRef.get()
    .then(querySnapshot => {
      const winner = getTotalStarPerRestaurant(querySnapshot.data());
      admin.firestore().collection('results').doc(currentDay)
        .set(winner);
      return response.send(winner);
    })
    .catch(err => console.log(err))

  // return docRef.get()
  //   .then(querySnapshot => {
  //     let resp: any[];
  //     // querySnapshot.docs.forEach(doc => {
  //     //   resp.push(doc.data())
  //     // });
  //     return response.send(querySnapshot.data());
  //   })
  //   .catch(err => console.log(err))
});
