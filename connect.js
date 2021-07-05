const mysql = require("mysql2");
const GlobalEnv = require("./GlobalEnv");

module.exports = () => {
    return mysql.createConnection({
        host: GlobalEnv.hostdb,
        user: GlobalEnv.userDb,
        port: GlobalEnv.portdb,
        password: GlobalEnv.passwordDb,
        database: GlobalEnv.database,
    });
};