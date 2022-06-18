import express from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../../services/db';
import dotenv from 'dotenv';
import jwt, { Secret } from 'jsonwebtoken';
const authRouter = express.Router();

dotenv.config();

authRouter.post( '/signup', async ( req, res ) => {
  const SALT = await bcrypt.genSalt( 12 );
  const document = await bcrypt.hash( req.body.document, SALT );
  const password = await bcrypt.hash( req.body.password, SALT );

  query(
    `INSERT INTO users SET ?`,
    ( err ) => {
      if ( err ) res.status( 409 ).send( { message: 'User already exists' } );
      else res.status( 201 ).send( { message: 'User created successfully' } );
    },
    { ...req.body, document, password, lender_code: uuidv4(), rol_id: 1 } );
} );

authRouter.post( '/signin', async ( req, res ) => {
  const { email, password } = req.body;

  query( 'SELECT * FROM users WHERE email = ?', ( err, results: any ) => {
    if ( err || results.length === 0 ) res.status( 401 ).send( { message: 'Invalid credentials' } );
    else {
      const user = results[0];
      bcrypt.compare( password, user.password, ( err, isMatch ) => {
        if ( err ) res.status( 500 ).send( { message: 'Internal server error' } );
        if ( !isMatch ) res.status( 401 ).send( { message: 'Invalid credentials' } );
        else {
          const userInfo = {
            firstName: user.firstname,
            lastName: user.lastname,
            document: user.document,
            phoneNumber: user.phone_number,
            email: user.email,
            balance: user.balance || 0,
            municipality_id: user.municipality_id,
            lender_code: user.lender_code,
          };

          const token = jwt.sign( {
            userInfo
          }, process.env.JWT_SECRET as Secret, {
            expiresIn: '1d'
          } );

          const refreshToken = jwt.sign( {
            userInfo
          }, process.env.JWT_SECRET_REFRESH as Secret, {
            expiresIn: '31d'
          } );

          res.status( 200 ).send( {
            message: 'User logged in successfully',
            token,
            refreshToken,
          } );
        }
      } );
    }
  }, email );
} );

authRouter.post( '/refresh', async ( req, res ) => {
  const { refreshToken } = req.body;

  const payload = jwt.verify(
    refreshToken,
    process.env.JWT_SECRET_REFRESH as Secret,
    { complete: true }
  );

  if ( !payload ) res.status( 401 ).send( { message: 'Invalid refresh token' } );
  else {
    const token = jwt.sign( {
      userInfo: payload.payload
    }, process.env.JWT_SECRET as Secret, {
      expiresIn: '1d'
    } );

    res.status( 200 ).send( {
      token
    } );
  }
} );

export default authRouter;