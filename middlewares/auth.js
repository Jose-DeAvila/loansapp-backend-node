"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.authentification = void 0;
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var authentification = function (req, res, next) {
    var _a;
    var AUTHORIZATION_TOKEN = ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.slice(7)) || '';
    if (!AUTHORIZATION_TOKEN || AUTHORIZATION_TOKEN === '') {
        res.status(401).json({ message: "Invalid or no token provided" });
    }
    jsonwebtoken_1["default"].verify(AUTHORIZATION_TOKEN, process.env.JWT_SECRET, function (err, result) {
        if (err)
            res.status(401).json({ message: "Invalid or no token provided" });
        res.locals.userInfo = result;
        next();
    });
};
exports.authentification = authentification;
