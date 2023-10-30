console.log("Importing libraries...");

import express from 'express';
import http from 'http';
import { UserRegister } from './routes/userRegister.js';
import { E14DataBase } from './database/controller.js';
import morgan from 'morgan';
import process from 'process';
import { E14Socket } from './socket/controller.js';
import { E14FirebaseMessaging } from './services/firebaseNotification.js';
import { StationLogin } from './routes/stationLogin.js';
import { Events } from './routes/events.js';

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ', err.stack);
});

console.log("Initializing...");

const app = express();
const server = http.createServer(app);
const PORT = 3000;
const IP = "0.0.0.0";

app.use(morgan('combined'));

async function start() {
    const mainDb = new E14DataBase();
    await mainDb.initialize();

    app.use((new UserRegister(mainDb.usersLoad)).router);
    app.use((new StationLogin(mainDb.stationsLoad)).router);
    app.use((new Events(mainDb.eventsLoad, mainDb.stationsLoad)).router);

    new E14Socket(server, new E14FirebaseMessaging(), mainDb);

    server.listen(PORT, IP, null, () => console.log(`Listening on ${IP}:${PORT}`));
}

start().catch((err) => {
    console.log(err);
});