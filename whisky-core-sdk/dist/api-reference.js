"use strict";
/**
 * ============================================================================
 * 🥃 WHISKY GAMING PROTOCOL - COMPLETE API REFERENCE 🎮
 * ============================================================================
 *
 * This file contains ALL functions available in the Whisky Gaming SDK.
 * Use this as your integration guide for building gaming applications.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameStatus = void 0;
var GameStatus;
(function (GameStatus) {
    GameStatus[GameStatus["None"] = 0] = "None";
    GameStatus[GameStatus["ResultRequested"] = 1] = "ResultRequested";
    GameStatus[GameStatus["Ready"] = 2] = "Ready";
    GameStatus[GameStatus["Completed"] = 3] = "Completed";
    GameStatus[GameStatus["Failed"] = 4] = "Failed";
})(GameStatus || (exports.GameStatus = GameStatus = {}));
