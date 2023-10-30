import express from 'express';
import { nanoid } from 'nanoid';
import { Collection, BSON } from 'mongodb';
import { phoneSendSms, phoneVerify } from '../services/twilioVerify.js';

export class UserRegister {
    router = express.Router();

    constructor (usersLoad: Collection<BSON.Document>) {
        this.router.use(express.json());

        this.router.post("/userRegister/request", async (req: express.Request, res: express.Response) => {
            const overSms = await phoneSendSms(req.body.phoneNumber);
            if (overSms.status === "failed") {
                return res.status(400).json({
                    result: false,
                    reason: "Không thể gửi tin nhắn tới số điện thoại này!"
                });
            }
            return res.json({
                result: true
            });
        });

        this.router.post("/userRegister/verify", async (req: express.Request, res: express.Response) => {
            const overVerify = await phoneVerify(req.body.phoneNumber, req.body.verifyCode);
            if (overVerify.status === "failed") {
                return res.status(403).json({
                    result: false,
                    reason: "Mã xác thực không hợp lệ!"
                });
            }

            let token = "";

            try {
                token = (await usersLoad.findOne({
                    phoneNumber: req.body.phoneNumber
                }, { projection: {token: 1, _id: 0} })).token;
            } catch (_) {
                token = nanoid();
                await usersLoad.insertOne({
                    phoneNumber: req.body.phoneNumber,
                    token: token
                });
            }

            return res.json({
                result: true,
                token: token
            });
        });

        this.router.get("/userRegister/check", async (req: express.Request, res: express.Response) => {
            let userObject = await usersLoad.findOne({
                token: req.headers.authorization
            }, { projection: {_id: 0} });

            if (userObject === null) {
                return res.status(403).json({
                    result: false
                });
            }

            return res.json({
                result: true
            });
        });

    }
}