import express from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { MysqlError } from 'mysql';
import { query } from '../../services/db';
const logicRouter = express.Router();

logicRouter.get( '/users/lender-code', ( req, res ) => {
  const { lender_code } = req.body;
  query(
    "SELECT firstname, lastname FROM `users` WHERE lender_code LIKE ?",
    lender_code,
    ( err: MysqlError, results: any ) => {
      if ( err || results.length === 0 ) {
        res.status( 404 ).send( { message: "User not found" } );
      } else {
        res.status( 200 ).json( results );
      }
    } );
} );

logicRouter.get( '/users', ( req, res ) => {
  const { email } = req.body;
  query( `SELECT firstname, lastname, document FROM users WHERE email LIKE '%${email}%'`, ( err, results ) => {
    console.log( results, err );
    if ( err || results.length === 0 ) res.status( 404 ).send( { message: "No users found" } );
    else {
      res.status( 200 ).json( results[0] );
    }
  } );
} );

logicRouter.get( '/users/loans', ( req, res ) => {
  const token = req.headers.authorization?.slice( 7 );
  const payload: any = jwt.verify( token || '', process.env.JWT_SECRET as Secret, { complete: true } ).payload;
  const lender_code = payload.userInfo.lender_code;
  query( `SELECT 
  loans.id, 
  loans.total_amount, 
  loans.reason, 
  users.firstname, 
  users.lastname, 
  users.phone_number, 
  users.email 
  FROM 
  loans 
  INNER JOIN users ON loans.debtor_document = users.document 
  AND loans.lender_code = ?`, ( err, results ) => {
    if( err || results.length === 0 ) res.status( 404 ).send( { message: "No loans found" } );
    else res.status( 200 ).send( { loans: results, code: 200, message: "Loans recovered successfully" } );
  }, lender_code );
} );

logicRouter.post( '/loans/request', ( req, res ) => {
  const { lender_code, reason, amount, fees } = req.body;
  const token = req.headers.authorization?.slice( 7 );
  const payload: any = jwt.verify( token || '', process.env.JWT_SECRET as Secret, { complete: true } ).payload;
  const user_document = payload.userInfo.document;
  const requestPayload = {
    user_document,
    lender_code,
    reason,
    amount,
    approved: false,
    fees
  };
  if ( !user_document ) res.status( 404 ).send( { message: "Invalid token" } );
  else {
    query( "INSERT INTO `loans_requests` SET ?", ( err, results ) => {
      if ( err || results.length === 0 ) res.status( 403 ).send( { message: "Lender not found", err } );
      else res.status( 201 ).send( { message: "Request created successfully" } );
    }, { ...requestPayload } );
  }
} );

logicRouter.post( '/loans/approve', ( req, res ) => {
  const { request_id } = req.body;
  query( "UPDATE `loans_requests` SET approved = 1 WHERE id = ?", ( err, updateResults ) => {
    if ( err || updateResults.length === 0 ) res.status( 500 ).send( { message: "Internal server error" } );
    else {
      query( "SELECT * FROM loans_requests WHERE id = ?", ( err, selectResults ) => {
        if ( err || selectResults.length === 0 ) res.status( 404 ).send( { message: "Loan not found!" } );
        else {
          const { user_document, lender_code, reason, amount, fees } = selectResults[0];
          const feesAmount = amount * ( fees / 100 ) * 0.083;
          const loanData = {
            debtor_document: user_document,
            lender_code,
            reason,
            amount,
            fees,
            total_amount: amount + feesAmount
          };
          query( "INSERT INTO loans SET ?", ( err, insertResults ) => {
            if ( err || insertResults.length === 0 ) res.status( 500 ).send( { message: "Internal server error" } );
            else res.status( 200 ).send( { message: "Loan approved successfully" } );
          }, { ...loanData } );
        }
      }, request_id );
    }
  }, request_id );
} );

logicRouter.post( '/loans/reject', ( req, res ) => {
  const { request_id } = req.body;
  query( "DELETE FROM loans_requests WHERE id = ?", ( err, results ) => {
    if ( err || results.length === 0 ) res.status( 404 ).send( { message: "An error ocurred while rejecting the request" } );
    else res.status( 200 ).send( { message: "Request rejected successfully" } );
  }, request_id );
} );

logicRouter.post( '/loans', ( req, res ) => {
  const { debtor_document, reason, amount, fees } = req.body;
  const token = req.headers.authorization?.slice( 7 );
  const payload: any = jwt.verify( token || '', process.env.JWT_SECRET as Secret, { complete: true } ).payload;
  if ( !payload.userInfo.lender_code ) res.status( 404 ).send( { message: "Invalid token" } );
  const feesAmount = amount * ( fees / 100 ) * 0.083;
  const loanData = {
    debtor_document,
    lender_code: payload.userInfo.lender_code,
    reason,
    amount,
    fees,
    total_amount: parseInt( amount ) + feesAmount
  };

  query( "INSERT INTO loans SET ?", ( err, results ) => {
    console.log( err, results );
    if ( err || results.length === 0 ) res.status( 500 ).send( { message: "Internal server error" } );
    else res.status( 201 ).send( { message: "Loan added successfully" } );
  }, { ...loanData } );
} );

logicRouter.post( '/loans/pay', ( req, res ) => {
  const { loan_id, amount } = req.body;
  query( "SELECT total_amount FROM loans WHERE id = ?", ( err, results ) => {
    if ( err || results.length === 0 ) res.status( 404 ).send( { message: "Loan not found" } );
    else {
      const restant_amount = results[0].total_amount - parseInt( amount );
      query( `UPDATE loans SET total_amount = ${restant_amount} WHERE id = ${loan_id}`, ( err, updateResults ) => {
        console.log( err, updateResults );
        if ( err || results.length === 0 ) res.status( 500 ).send( { message: "Internal server error" } );
        else res.status( 200 ).send( { message: "Loan paid successfully" } );
      } );
    }
  }, loan_id );

} );

export default logicRouter;