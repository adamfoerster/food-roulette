import * as admin from "firebase-admin";
import * as dayjs from "dayjs";

admin.initializeApp();

const getDay = () => {
  return dayjs().format("YYYYMMDD");
};

const randomStar = (results, totalStars): any => {
  const winnerIndex = Math.floor(Math.random() * Math.floor(totalStars));
  let winner: string;
  let acummulator: number = 0;
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
  restaurants.forEach(rest => (totalStars = totalStars + rest.stars));
  return totalStars;
};

const getTotalStarPerRestaurant = (scores, gif): any => {
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
    winner: randomStar(results, totalStars),
    gif: gif ? gif : ""
  };
};

export const spinTheRoulette = async (request, response) => {
  try {
    let currentDay = "";
    if (request.query.day) {
      currentDay = request.query.day;
    } else {
      currentDay = getDay();
    }
    const gif = request.query.gif;
    const docRef = admin
      .firestore()
      .collection("days")
      .doc(currentDay);
    const resultRef = admin
      .firestore()
      .collection("results")
      .doc(currentDay);
    const querySnapshot = await docRef.get();
    const winner = getTotalStarPerRestaurant(querySnapshot.data(), gif);
    await resultRef.set(winner);
    return response.send(winner);
  } catch (err) {
    console.log(err);
    response.send(err);
  }
};
