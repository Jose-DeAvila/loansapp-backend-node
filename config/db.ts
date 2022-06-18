import mysql, { MysqlError } from 'mysql';
import dotenv from 'dotenv';

dotenv.config();

const connection = mysql.createConnection( {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DATABASE,
    port: parseInt( process.env.MYSQL_PORT || '3306' ),
} );

connection.connect( ( error: MysqlError ) => {
    if( error ) throw new Error( `Error connecting to database: ${error.message}` );
    console.log( 'Connected to database', connection.config );
} );

export { connection };