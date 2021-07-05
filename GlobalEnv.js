module.exports = {
    app_name: "Trabaja Peru",
    uri_database: "",
    host: process.env.HOST || "http://localhost",
    hostdb: process.env.HOSTDB || "sql10.freemysqlhosting.net",
    port: process.env.PORT || 4000,
    portdb: process.env.PORTDB || 3306,
    userDb: process.env.USERDB || "sql10420317",
    passwordDb: process.env.PASSWORDDB || "6cbrNQwyDU",
    database: process.env.DATABASE || "sql10420317",
    TOKEN_SECRET: process.env.TOKEN_SECRET || "trabajaperu-access",
};