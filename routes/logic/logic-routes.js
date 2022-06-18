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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var db_1 = require("../../services/db");
var logicRouter = express_1["default"].Router();
logicRouter.get('/users/lender-code', function (req, res) {
    var lender_code = req.body.lender_code;
    (0, db_1.query)("SELECT firstname, lastname FROM `users` WHERE lender_code LIKE ?", lender_code, function (err, results) {
        if (err || results.length === 0) {
            res.status(404).send({ message: "User not found" });
        }
        else {
            res.status(200).json(results);
        }
    });
});
logicRouter.get('/users', function (req, res) {
    var email = req.body.email;
    (0, db_1.query)("SELECT firstname, lastname, document FROM users WHERE email LIKE '%".concat(email, "%'"), function (err, results) {
        console.log(results, err);
        if (err || results.length === 0)
            res.status(404).send({ message: "No users found" });
        else {
            res.status(200).json(results[0]);
        }
    });
});
logicRouter.get('/users/loans', function (req, res) {
    var _a;
    var token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.slice(7);
    var payload = jsonwebtoken_1["default"].verify(token || '', process.env.JWT_SECRET, { complete: true }).payload;
    var lender_code = payload.userInfo.lender_code;
    (0, db_1.query)("SELECT \n  loans.id, \n  loans.total_amount, \n  loans.reason, \n  users.firstname, \n  users.lastname, \n  users.phone_number, \n  users.email \n  FROM \n  loans \n  INNER JOIN users ON loans.debtor_document = users.document \n  AND loans.lender_code = ?", function (err, results) {
        if (err || results.length === 0)
            res.status(404).send({ message: "No loans found" });
        else
            res.status(200).send({ loans: results, code: 200, message: "Loans recovered successfully" });
    }, lender_code);
});
logicRouter.post('/loans/request', function (req, res) {
    var _a;
    var _b = req.body, lender_code = _b.lender_code, reason = _b.reason, amount = _b.amount, fees = _b.fees;
    var token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.slice(7);
    var payload = jsonwebtoken_1["default"].verify(token || '', process.env.JWT_SECRET, { complete: true }).payload;
    var user_document = payload.userInfo.document;
    var requestPayload = {
        user_document: user_document,
        lender_code: lender_code,
        reason: reason,
        amount: amount,
        approved: false,
        fees: fees
    };
    if (!user_document)
        res.status(404).send({ message: "Invalid token" });
    else {
        (0, db_1.query)("INSERT INTO `loans_requests` SET ?", function (err, results) {
            if (err || results.length === 0)
                res.status(403).send({ message: "Lender not found", err: err });
            else
                res.status(201).send({ message: "Request created successfully" });
        }, __assign({}, requestPayload));
    }
});
logicRouter.post('/loans/approve', function (req, res) {
    var request_id = req.body.request_id;
    (0, db_1.query)("UPDATE `loans_requests` SET approved = 1 WHERE id = ?", function (err, updateResults) {
        if (err || updateResults.length === 0)
            res.status(500).send({ message: "Internal server error" });
        else {
            (0, db_1.query)("SELECT * FROM loans_requests WHERE id = ?", function (err, selectResults) {
                if (err || selectResults.length === 0)
                    res.status(404).send({ message: "Loan not found!" });
                else {
                    var _a = selectResults[0], user_document = _a.user_document, lender_code = _a.lender_code, reason = _a.reason, amount = _a.amount, fees = _a.fees;
                    var feesAmount = amount * (fees / 100) * 0.083;
                    var loanData = {
                        debtor_document: user_document,
                        lender_code: lender_code,
                        reason: reason,
                        amount: amount,
                        fees: fees,
                        total_amount: amount + feesAmount
                    };
                    (0, db_1.query)("INSERT INTO loans SET ?", function (err, insertResults) {
                        if (err || insertResults.length === 0)
                            res.status(500).send({ message: "Internal server error" });
                        else
                            res.status(200).send({ message: "Loan approved successfully" });
                    }, __assign({}, loanData));
                }
            }, request_id);
        }
    }, request_id);
});
logicRouter.post('/loans/reject', function (req, res) {
    var request_id = req.body.request_id;
    (0, db_1.query)("DELETE FROM loans_requests WHERE id = ?", function (err, results) {
        if (err || results.length === 0)
            res.status(404).send({ message: "An error ocurred while rejecting the request" });
        else
            res.status(200).send({ message: "Request rejected successfully" });
    }, request_id);
});
logicRouter.post('/loans', function (req, res) {
    var _a;
    var _b = req.body, debtor_document = _b.debtor_document, reason = _b.reason, amount = _b.amount, fees = _b.fees;
    var token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.slice(7);
    var payload = jsonwebtoken_1["default"].verify(token || '', process.env.JWT_SECRET, { complete: true }).payload;
    if (!payload.userInfo.lender_code)
        res.status(404).send({ message: "Invalid token" });
    var feesAmount = amount * (fees / 100) * 0.083;
    var loanData = {
        debtor_document: debtor_document,
        lender_code: payload.userInfo.lender_code,
        reason: reason,
        amount: amount,
        fees: fees,
        total_amount: parseInt(amount) + feesAmount
    };
    (0, db_1.query)("INSERT INTO loans SET ?", function (err, results) {
        console.log(err, results);
        if (err || results.length === 0)
            res.status(500).send({ message: "Internal server error" });
        else
            res.status(201).send({ message: "Loan added successfully" });
    }, __assign({}, loanData));
});
logicRouter.post('/loans/pay', function (req, res) {
    var _a = req.body, loan_id = _a.loan_id, amount = _a.amount;
    (0, db_1.query)("SELECT total_amount FROM loans WHERE id = ?", function (err, results) {
        if (err || results.length === 0)
            res.status(404).send({ message: "Loan not found" });
        else {
            var restant_amount = results[0].total_amount - parseInt(amount);
            (0, db_1.query)("UPDATE loans SET total_amount = ".concat(restant_amount, " WHERE id = ").concat(loan_id), function (err, updateResults) {
                console.log(err, updateResults);
                if (err || results.length === 0)
                    res.status(500).send({ message: "Internal server error" });
                else
                    res.status(200).send({ message: "Loan paid successfully" });
            });
        }
    }, loan_id);
});
exports["default"] = logicRouter;
