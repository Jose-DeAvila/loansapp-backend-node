"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.connection = void 0;
var mysql_1 = __importDefault(require("mysql"));
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1["default"].config();
var connection = mysql_1["default"].createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DATABASE,
    port: parseInt(process.env.MYSQL_PORT || '3306')
});
exports.connection = connection;
connection.connect(function (error) {
    if (error)
        throw new Error("Error connecting to database: ".concat(error.message));
    console.log('Connected to database', connection.config);
});
