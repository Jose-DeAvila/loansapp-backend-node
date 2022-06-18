import { MysqlError } from "mysql";
import { connection } from "../config/db";

function query(
  sql: string,
  callback: ( err: MysqlError | null, results: any ) => void,
  args?: any, ) {
  connection.query( sql, args, ( err, results ) => {
    if ( err ) {
      callback( err, null );
    } else {
      callback( null, results );
    }
  } );
}

export { query };