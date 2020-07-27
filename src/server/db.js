const db_config = require("../../config/config.json").database;
const mysql = require("mysql");

const db = mysql.createConnection(db_config);

db.connect(err => {
    if (err) {
        console.log('Error during connection: ', err.message);
        return;
    }
    else{
        console.log('Connected!');
    }
});

module.exports = db;