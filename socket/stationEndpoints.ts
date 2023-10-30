import { ObjectId } from 'mongodb';
import { E14DataBase } from '../database/controller.js';
import * as socket from 'socket.io';
import { E14FirebaseMessaging } from '../services/firebaseNotification.js';

// List of all Socket names available to station

// Server receive: /stationEndpoints/emit/finishedReport

// Server receive: /stationEndpoints/emit/notifyClientZone

// Server emit: /stationEndpoints/receive/emergencyReport (from userEndpoints)
// Server emit: /stationEndpoints/receive/emergenciesOverall

export class StationEnpoints {
    mainDb: E14DataBase;

    constructor(clientSocket: socket.Socket, notification: E14FirebaseMessaging, mainDb: E14DataBase) {
        this.initialize(clientSocket, notification, mainDb);
    }

    async initialize(clientSocket: socket.Socket, notification: E14FirebaseMessaging, mainDb: E14DataBase) {
        let token = clientSocket.handshake.auth.token;

        let ISO3166 = (await mainDb.stationsLoad.findOneAndUpdate({
            token: token,
        }, {
            $set: {
                online: true,
                socketId: clientSocket.id
            }
        })).ISO3166;

        clientSocket.emit("/stationEndpoints/receive/emergenciesOverall",
            (await mainDb.eventsLoad.findOne({
                ISO3166: ISO3166
            })).events
        );

        clientSocket.on("/stationEndpoints/emit/finishedReport", async (data) => {
            await mainDb.eventsLoad.updateOne({
                ISO3166: ISO3166
            }, {
                $pull: {
                    events: {
                        _id: new ObjectId(data._id)
                    }
                }
            });
            clientSocket.emit("/stationEndpoints/receive/emergenciesOverall",
                (await mainDb.eventsLoad.findOne({
                    ISO3166: ISO3166
                })).events
            );
        });

        clientSocket.on("/stationEndpoints/emit/notifyClientZone", async (data) => {
            let eventObject = (await mainDb.eventsLoad.aggregate([{
                    $match: {
                        ISO3166: ISO3166,
                        "events._id": new ObjectId(data._id)
                    }
                },
                {
                    $unwind: "$events"
                },
                {
                    $match: {
                        "events._id": new ObjectId(data._id)
                    }
                },
                {
                    $project: {
                        _id: 0,
                        events: 1
                    }
                }
            ]).toArray())[0].events;

            if (eventObject.notified) {
                return;
            }

            await mainDb.eventsLoad.updateOne({
                ISO3166: ISO3166,
                "events._id": new ObjectId(data._id)
            }, {
                $set: {
                    "events.$.notified": true
                }
            });

            console.log("[EMERGENCY | Firebase] Sending report to notfify users.");
            await notification.sendEmegencyLocationNotification(eventObject.latitude.toString(), eventObject.longitude.toString());

            clientSocket.emit("/stationEndpoints/receive/emergenciesOverall",
                (await mainDb.eventsLoad.findOne({
                    ISO3166: ISO3166
                })).events
            );
        });

        clientSocket.on("disconnect", async () => {
            mainDb.stationsLoad.updateOne({
                token: token
            }, {
                $set: {
                    online: false
                }
            });
        });
    }
}