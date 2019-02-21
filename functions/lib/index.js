"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
// Express
const express = require("express");
const cors = require("cors");
const spin_the_roulette_1 = require("./spin-the-roulette");
// Multi Route ExpressJS HTTP Function
const app = express();
app.use(cors({ origin: true }));
// app.use(auth);
app.get('/spin-the-roulette', (request, response) => {
    return spin_the_roulette_1.spinTheRoulette(request, response);
});
app.get('/dog', (request, response) => {
    response.send('DOG');
});
exports.api = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map