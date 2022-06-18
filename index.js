"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var dotenv_1 = __importDefault(require("dotenv"));
var routes_1 = __importDefault(require("./routes"));
var cors_1 = __importDefault(require("cors"));
dotenv_1["default"].config();
require('./config/db');
var app = (0, express_1["default"])();
var PORT = process.env.PORT || 3000;
// Middlewares
app.use(express_1["default"].json());
app.use(express_1["default"].urlencoded({ extended: true }));
app.use((0, cors_1["default"])({}));
app.use('/api/v1', routes_1["default"]);
app.listen(PORT, function () {
    console.log("Server is running on port: ".concat(PORT));
});
