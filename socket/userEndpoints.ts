import * as socket from 'socket.io';
import { reverseGeocodingToISO3166 } from '../services/openStreetMapGeocoding.js';
import { E14DataBase } from '../database/controller.js';
import { reverseGeocodingToAddress } from '../services/goongGeocoding.js';
import { ObjectId } from 'mongodb';


export class UserEnpoints {
    constructor(clientSocket: socket.Socket, mainDb: E14DataBase) {
        clientSocket.on("/userEndpoints/emit/emergencyReport", async (data, callback) => {
            this.emergencyProcedure(clientSocket, mainDb, data);
            callback();
        });
    }

    async emergencyProcedure(clientSocket: socket.Socket, mainDb: E14DataBase, data) {
        console.log("[EMERGENCY | Time] Saving time...");
        let timestamp = Date.now();

        console.log("[EMERGENCY | OpenStreetMap] Reversing user's geocoding state...");
        let stateCode = await reverseGeocodingToISO3166(data.fireLocation.latitude, data.fireLocation.longitude);
    
        console.log("[EMERGENCY | GOONG] Reversing user's geocoding address...");
        let addressName = await reverseGeocodingToAddress(data.fireLocation.latitude, data.fireLocation.longitude);

        console.log(`[EMERGENCY | Server] Sending reports to ISO3166 code: ${stateCode}`);

        let reporterPhoneNumber = (await mainDb.usersLoad.findOne({
            token: clientSocket.handshake.auth.token
        }, { projection: { _id: 0, phoneNumber: 1 } })).phoneNumber;

        let eventId = new ObjectId();

        mainDb.eventsLoad.updateOne(
            { ISO3166: stateCode },
            {
                $push: {
                    events: {
                        _id: eventId,
                        reporterPhoneNumber: reporterPhoneNumber,
                        address: addressName,
                        latitude: data.fireLocation.latitude,
                        longitude: data.fireLocation.longitude,
                        locationApproximate: data.fireLocation.locationApproximate,
                        reportedTime: timestamp,
                        notified: false
                    }
                }
            }
        );

        clientSocket.to((await mainDb.stationsLoad.findOne(
            { ISO3166: stateCode },
            { projection: {socketId: 1, _id: 0} }
        )).socketId).emit("/stationEndpoints/receive/emergencyReport", {
            _id: eventId.toString(),
            reporterPhoneNumber: reporterPhoneNumber,
            address: addressName,
            latitude: data.fireLocation.latitude,
            longitude: data.fireLocation.longitude,
            locationApproximate: data.fireLocation.locationApproximate,
            reportedTime: timestamp,
            notified: false
        });
    }
}