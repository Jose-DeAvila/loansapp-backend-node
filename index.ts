import express from 'express';
import dotenv from 'dotenv';
import router from './routes';
import cors from 'cors';

dotenv.config();
require( './config/db' );

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use( express.json() );
app.use( express.urlencoded( { extended: true } ) );
app.use( cors( {} ) );
app.use( '/api/v1', router );

app.listen( PORT, () => {
    console.log( `Server is running on port: ${PORT}` );
} );