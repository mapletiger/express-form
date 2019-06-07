let mysql = require('mysql');
let connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'username',
    password: 'securepassword',
    database: 'databasename'
});

connection.connect(function(err) {
    if(err) throw err;
});
module.exports = connection;
