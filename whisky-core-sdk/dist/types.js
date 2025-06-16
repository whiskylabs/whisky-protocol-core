"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameStatus = void 0;
var GameStatus;
(function (GameStatus) {
    /** No active game */
    GameStatus[GameStatus["None"] = 0] = "None";
    /** Result requested from RNG */
    GameStatus[GameStatus["ResultRequested"] = 1] = "ResultRequested";
    /** Game ready to be settled */
    GameStatus[GameStatus["Ready"] = 2] = "Ready";
    /** Game completed */
    GameStatus[GameStatus["Completed"] = 3] = "Completed";
    /** Game failed/cancelled */
    GameStatus[GameStatus["Failed"] = 4] = "Failed";
})(GameStatus || (exports.GameStatus = GameStatus = {}));
