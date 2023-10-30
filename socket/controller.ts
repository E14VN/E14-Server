import mongodb from 'mongodb';
import * as socket from 'socket.io';
import http from 'http';

import { E14FirebaseMessaging } from '../services/firebaseNotification.js';
import { E14DataBase } from '../database/controller.js';
import { UserEnpoints } from './userEndpoints.js';
import { StationEnpoints } from './stationEndpoints.js';

export class E14Socket {
    parentSocketPort: socket.Server;
    mainDb: E14DataBase;

    constructor(httpServer: http.Server, notification: E14FirebaseMessaging, mainDb: E14DataBase) {
        this.mainDb = mainDb;
        this.parentSocketPort = new socket.Server(httpServer);

        this.parentSocketPort.on("connection", async (clientSocket: socket.Socket) => {
            console.log("A device connected.");

            let authStatus = await this.checkAuth(clientSocket.handshake.auth.token, clientSocket.handshake.auth.type);

            if (authStatus) {
                if (clientSocket.handshake.auth.type == "user") {
                    console.log("A user signed in the socket. Connecting endpoints...");
                    new UserEnpoints(clientSocket, mainDb);
                }
                if (clientSocket.handshake.auth.type == "station") {
                    // ATTACH STATION ENDPOINT HERE
                    console.log("A station signed in the socket.");
                    new StationEnpoints(clientSocket, notification, mainDb);
                }

                console.log("Endpoints ready, notifying client...");
                clientSocket.emit("/controller/endpointsReady", {
                    ready: true
                });
            } else {
                clientSocket.disconnect(true);
            }
        });
    }

    async checkAuth(token: string, type: string) {
        if (type == "user") {
            let userCheck = await this.mainDb.usersLoad.findOne({
                token: token
            }, { projection: {_id: 0} });

            if (userCheck === null) {
                return false;
            }
            return true;
        }
        if (type == "station") {
            let stationCheck = await this.mainDb.stationsLoad.findOne({
                token: token
            }, { projection: {_id: 1} });

            if (stationCheck === null) {
                return false;
            }
            return true;
        }

        return false;
    }
}