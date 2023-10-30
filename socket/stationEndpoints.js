var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { ObjectId } from 'mongodb';
// List of all Socket names available to station
// Server receive: /stationEndpoints/emit/finishedReport
// Server receive: /stationEndpoints/emit/notifyClientZone
// Server emit: /stationEndpoints/receive/emergencyReport (from userEndpoints)
// Server emit: /stationEndpoints/receive/emergenciesOverall
var StationEnpoints = /** @class */ (function () {
    function StationEnpoints(clientSocket, notification, mainDb) {
        this.initialize(clientSocket, notification, mainDb);
    }
    StationEnpoints.prototype.initialize = function (clientSocket, notification, mainDb) {
        return __awaiter(this, void 0, void 0, function () {
            var token, ISO3166, _a, _b, _c;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        token = clientSocket.handshake.auth.token;
                        return [4 /*yield*/, mainDb.stationsLoad.findOneAndUpdate({
                                token: token,
                            }, {
                                $set: {
                                    online: true,
                                    socketId: clientSocket.id
                                }
                            })];
                    case 1:
                        ISO3166 = (_d.sent()).ISO3166;
                        _b = (_a = clientSocket).emit;
                        _c = ["/stationEndpoints/receive/emergenciesOverall"];
                        return [4 /*yield*/, mainDb.eventsLoad.findOne({
                                ISO3166: ISO3166
                            })];
                    case 2:
                        _b.apply(_a, _c.concat([(_d.sent()).events]));
                        clientSocket.on("/stationEndpoints/emit/finishedReport", function (data) { return __awaiter(_this, void 0, void 0, function () {
                            var _a, _b, _c;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0: return [4 /*yield*/, mainDb.eventsLoad.updateOne({
                                            ISO3166: ISO3166
                                        }, {
                                            $pull: {
                                                events: {
                                                    _id: new ObjectId(data._id)
                                                }
                                            }
                                        })];
                                    case 1:
                                        _d.sent();
                                        _b = (_a = clientSocket).emit;
                                        _c = ["/stationEndpoints/receive/emergenciesOverall"];
                                        return [4 /*yield*/, mainDb.eventsLoad.findOne({
                                                ISO3166: ISO3166
                                            })];
                                    case 2:
                                        _b.apply(_a, _c.concat([(_d.sent()).events]));
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        clientSocket.on("/stationEndpoints/emit/notifyClientZone", function (data) { return __awaiter(_this, void 0, void 0, function () {
                            var eventObject, _a, _b, _c;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0: return [4 /*yield*/, mainDb.eventsLoad.aggregate([{
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
                                        ]).toArray()];
                                    case 1:
                                        eventObject = (_d.sent())[0].events;
                                        if (eventObject.notified) {
                                            return [2 /*return*/];
                                        }
                                        return [4 /*yield*/, mainDb.eventsLoad.updateOne({
                                                ISO3166: ISO3166,
                                                "events._id": new ObjectId(data._id)
                                            }, {
                                                $set: {
                                                    "events.$.notified": true
                                                }
                                            })];
                                    case 2:
                                        _d.sent();
                                        console.log("[EMERGENCY | Firebase] Sending report to notfify users.");
                                        return [4 /*yield*/, notification.sendEmegencyLocationNotification(eventObject.latitude.toString(), eventObject.longitude.toString())];
                                    case 3:
                                        _d.sent();
                                        _b = (_a = clientSocket).emit;
                                        _c = ["/stationEndpoints/receive/emergenciesOverall"];
                                        return [4 /*yield*/, mainDb.eventsLoad.findOne({
                                                ISO3166: ISO3166
                                            })];
                                    case 4:
                                        _b.apply(_a, _c.concat([(_d.sent()).events]));
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        clientSocket.on("disconnect", function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                mainDb.stationsLoad.updateOne({
                                    token: token
                                }, {
                                    $set: {
                                        online: false
                                    }
                                });
                                return [2 /*return*/];
                            });
                        }); });
                        return [2 /*return*/];
                }
            });
        });
    };
    return StationEnpoints;
}());
export { StationEnpoints };
