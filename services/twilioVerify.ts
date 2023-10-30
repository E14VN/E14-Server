import twilio from 'twilio';
import { readFileSync } from 'fs';

const twilioJson = JSON.parse(readFileSync("apis-auth/twilio-admin.json", "utf-8"));

const client = twilio(twilioJson.accountSid, twilioJson.authToken);
const verifySid = twilioJson.verifySid;

export async function phoneSendSms(phoneNumber: string) {
    try {
        const sendSms = await client.verify.v2
                .services(verifySid)
                .verifications.create({ to: phoneNumber, channel: "sms" });
        return {
            "status": sendSms.status
        }
    } catch (_) {
        return {
            "status": "failed"
        };
    }
}

export async function phoneVerify(phoneNumber: string, verifyCode: string) {
    try {
        const verify = await client.verify.v2
            .services(verifySid)
            .verificationChecks.create({ to: phoneNumber, code: verifyCode });
        return {
            "status": verify.status
        };
    } catch (_) {
        return {
            "status": "failed"
        };
    }
}