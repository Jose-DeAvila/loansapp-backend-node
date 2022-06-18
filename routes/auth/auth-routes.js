"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
        while (_) try {
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var bcrypt_1 = __importDefault(require("bcrypt"));
var uuid_1 = require("uuid");
var db_1 = require("../../services/db");
var dotenv_1 = __importDefault(require("dotenv"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var authRouter = express_1["default"].Router();
dotenv_1["default"].config();
authRouter.post('/signup', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var SALT, document, password;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, bcrypt_1["default"].genSalt(12)];
            case 1:
                SALT = _a.sent();
                return [4 /*yield*/, bcrypt_1["default"].hash(req.body.document, SALT)];
            case 2:
                document = _a.sent();
                return [4 /*yield*/, bcrypt_1["default"].hash(req.body.password, SALT)];
            case 3:
                password = _a.sent();
                (0, db_1.query)("INSERT INTO users SET ?", function (err) {
                    if (err)
                        res.status(409).send({ message: 'User already exists' });
                    else
                        res.status(201).send({ message: 'User created successfully' });
                }, __assign(__assign({}, req.body), { document: document, password: password, lender_code: (0, uuid_1.v4)(), rol_id: 1 }));
                return [2 /*return*/];
        }
    });
}); });
authRouter.post('/signin', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password;
    return __generator(this, function (_b) {
        _a = req.body, email = _a.email, password = _a.password;
        (0, db_1.query)('SELECT * FROM users WHERE email = ?', function (err, results) {
            if (err || results.length === 0)
                res.status(401).send({ message: 'Invalid credentials' });
            else {
                var user_1 = results[0];
                bcrypt_1["default"].compare(password, user_1.password, function (err, isMatch) {
                    if (err)
                        res.status(500).send({ message: 'Internal server error' });
                    if (!isMatch)
                        res.status(401).send({ message: 'Invalid credentials' });
                    else {
                        var userInfo = {
                            firstName: user_1.firstname,
                            lastName: user_1.lastname,
                            document: user_1.document,
                            phoneNumber: user_1.phone_number,
                            email: user_1.email,
                            balance: user_1.balance || 0,
                            municipality_id: user_1.municipality_id,
                            lender_code: user_1.lender_code
                        };
                        var token = jsonwebtoken_1["default"].sign({
                            userInfo: userInfo
                        }, process.env.JWT_SECRET, {
                            expiresIn: '1d'
                        });
                        var refreshToken = jsonwebtoken_1["default"].sign({
                            userInfo: userInfo
                        }, process.env.JWT_SECRET_REFRESH, {
                            expiresIn: '31d'
                        });
                        res.status(200).send({
                            message: 'User logged in successfully',
                            token: token,
                            refreshToken: refreshToken
                        });
                    }
                });
            }
        }, email);
        return [2 /*return*/];
    });
}); });
authRouter.post('/refresh', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var refreshToken, payload, token;
    return __generator(this, function (_a) {
        refreshToken = req.body.refreshToken;
        payload = jsonwebtoken_1["default"].verify(refreshToken, process.env.JWT_SECRET_REFRESH, { complete: true });
        if (!payload)
            res.status(401).send({ message: 'Invalid refresh token' });
        else {
            token = jsonwebtoken_1["default"].sign({
                userInfo: payload.payload
            }, process.env.JWT_SECRET, {
                expiresIn: '1d'
            });
            res.status(200).send({
                token: token
            });
        }
        return [2 /*return*/];
    });
}); });
exports["default"] = authRouter;
