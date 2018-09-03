import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp();

const getDay = () => {
	return '20180813';
}

exports.spinTheRoulette = functions.https.onRequest((request, response) => {
  let currentDay = '';
  if (request.query.day) {
    currentDay = request.query.day;
  } else {
    currentDay = getDay();
  }
  return response.send( currentDay);

});
