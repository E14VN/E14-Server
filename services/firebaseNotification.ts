import admin from 'firebase-admin';
import { getMessaging, Messaging } from "firebase-admin/messaging";

export class E14FirebaseMessaging {
    messagingPort: Messaging;

    constructor () {
        const serviceAccount = "apis-auth/firebase-adminsdk.json";

        const app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

        this.messagingPort = getMessaging(app);
    }

    async sendEmegencyLocationNotification(latitude: string, longitude: string, addressName: string) {
        await this.messagingPort.send({
            topic: "emergency_service_receiver",
            data: {
                type: "fire_emergency",
                latitude: latitude,
                longitude: longitude,
                addressName: addressName,
            },
            android: {
                priority: "high",
            }
        });
    }
}