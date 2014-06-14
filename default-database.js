var mysql        = require('mysql');

if(!connection) {
  var connection = mysql.createConnection({
    host     : '',
    database : '',
    user     : '', // Using 'root' is not recommended.
    password : '',
  });
  connection.connect(function(err) {
    if(err) {
      throw "DB is DOWN, refusing to start."
    }
  });
}

module.exports=connection;