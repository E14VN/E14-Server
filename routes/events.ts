import express from 'express';
import { Collection, BSON } from 'mongodb';
import { tryWrap } from '../utils/safeOption.js';

export class Events {
    router = express.Router();

    constructor(eventsLoad: Collection<BSON.Document>, stationsLoad: Collection<BSON.Document>) {
        this.router.use(express.json());

        this.router.get("/events/get", async (req: express.Request, res: express.Response) => {
            tryWrap(res, async () => {
                let stationObject = await stationsLoad.findOne({
                    token: req.headers.authorization
                }, {
                    projection: {
                        _id: 0,
                        ISO3166: 1
                    }
                });

                if (stationObject === null) {
                    return res.status(403).json({
                        result: false,
                        reason: "Không xác định được token."
                    });
                }

                let requestPage = parseInt(req.query.page.toString());
                let indexLimit = 10;
                let indexBegin = requestPage * indexLimit;

                let events = (await eventsLoad.findOne({
                    ISO3166: stationObject.ISO3166
                }, {
                    projection: {
                        _id: 0,
                        events: {
                            $slice: [indexBegin, indexBegin + (indexLimit - 1)]
                        }
                    }
                })).events;

                return res.json({
                    result: true,
                    content: events
                });
            });
        });
    }
}