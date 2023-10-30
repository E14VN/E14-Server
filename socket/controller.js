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
import * as socket from 'socket.io';
import { UserEnpoints } from './userEndpoints.js';
import { StationEnpoints } from './stationEndpoints.js';
var E14Socket = /** @class */ (function () {
    function E14Socket(httpServer, notification, mainDb) {
        var _this = this;
        this.mainDb = mainDb;
        this.parentSocketPort = new socket.Server(httpServer);
        this.parentSocketPort.on("connection", function (clientSocket) { return __awaiter(_this, void 0, void 0, function () {
            var authStatus;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("A device connected.");
                        return [4 /*yield*/, this.checkAuth(clientSocket.handshake.auth.token, clientSocket.handshake.auth.type)];
                    case 1:
                        authStatus = _a.sent();
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
                        }
                        else {
                            clientSocket.disconnect(true);
                        }
                        return [2 /*return*/];
                }
            });
        }); });
    }
    E14Socket.prototype.checkAuth = function (token, type) {
        return __awaiter(this, void 0, void 0, function () {
            var userCheck, stationCheck;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(type == "user")) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.mainDb.usersLoad.findOne({
                                token: token
                            }, { projection: { _id: 0 } })];
                    case 1:
                        userCheck = _a.sent();
                        if (userCheck === null) {
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/, true];
                    case 2:
                        if (!(type == "station")) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.mainDb.stationsLoad.findOne({
                                token: token
                            }, { projection: { _id: 1 } })];
                    case 3:
                        stationCheck = _a.sent();
                        if (stationCheck === null) {
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/, true];
                    case 4: return [2 /*return*/, false];
                }
            });
        });
    };
    return E14Socket;
}());
export { E14Socket };
