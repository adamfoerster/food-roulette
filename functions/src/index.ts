import * as functions from 'firebase-functions';
// Express
import * as express from 'express';
import * as cors from 'cors';
import { spinTheRoulette } from './spin-the-roulette';

// Multi Route ExpressJS HTTP Function
const app = express();
app.use(cors({ origin: true }));
// app.use(auth);

app.get('/spin-the-roulette', spinTheRoulette);

app.get('/dog', (request, response) => {
  response.send('DOG');
});

export const api = functions.https.onRequest(app);
