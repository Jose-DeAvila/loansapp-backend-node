import { Request, Response, NextFunction } from "express";
import jwt, { Secret } from 'jsonwebtoken';

const authentification = ( req: Request, res: Response, next: NextFunction ) => {
  const AUTHORIZATION_TOKEN = req.headers.authorization?.slice( 7 ) || '';
  
  if ( !AUTHORIZATION_TOKEN || AUTHORIZATION_TOKEN === '' ) {
    res.status( 401 ).json( { message: "Invalid or no token provided" } );
  }

  jwt.verify( AUTHORIZATION_TOKEN, process.env.JWT_SECRET as Secret, ( err, result ) => {
    if ( err ) res.status( 401 ).json( { message: "Invalid or no token provided" } );
    res.locals.userInfo = result;
    next();
  } );

};

export {
  authentification
};