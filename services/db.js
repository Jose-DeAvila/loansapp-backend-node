"use strict";
exports.__esModule = true;
exports.query = void 0;
var db_1 = require("../config/db");
function query(sql, callback, args) {
    db_1.connection.query(sql, args, function (err, results) {
        if (err) {
            callback(err, null);
        }
        else {
            callback(null, results);
        }
    });
}
exports.query = query;
