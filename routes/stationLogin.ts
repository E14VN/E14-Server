import express from 'express';
import bcrypt from 'bcrypt';
import { Collection, BSON } from 'mongodb';

export class StationLogin {
    router = express.Router();

    constructor (stationsLoad: Collection<BSON.Document>) {
        this.router.use(express.json());

        this.router.post("/stationLogin/request", async (req: express.Request, res: express.Response) => {
            let stationAccount = null;
            try {
                stationAccount = await stationsLoad.findOne({
                    accountName: req.body.accountName
                });
                if (await bcrypt.compare(req.body.password, stationAccount.hash)) {
                    return res.json({
                        result: true,
                        name: stationAccount.name,
                        token: stationAccount.token
                    });
                }
            } catch (_) {}

            return res.status(400).json({
                result: false,
                reason: "Sai tài khoản hoặc mật khẩu!"
            });
        });
    }
}