"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var auth_1 = require("../middlewares/auth");
var auth_routes_1 = __importDefault(require("./auth/auth-routes"));
var logic_routes_1 = __importDefault(require("./logic/logic-routes"));
var router = express_1["default"].Router();
router.use('/auth', auth_routes_1["default"]);
router.use('/', auth_1.authentification, logic_routes_1["default"]);
exports["default"] = router;
