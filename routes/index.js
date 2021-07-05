const express = require("express");
const user = require("../controllers/user");
const api = express.Router();
const dbConnection = require("../connect");
const connection = dbConnection();
const auth = require("../middleware/auth")
api.all("*", function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Credentials", true);
    next();
});

api.get("/", function(req, res) {
    res.send("Web service Trabaja Perú");
});

api.post("/user", user);
api.post("/login", (req, res) => {
    res.send("Registrado");
});

///////////////////////////////////////////////////////////////
//BUSCAR USUARIO
api.post("/search/user", user);
///////////////////////////////////////////////////////////////

module.exports = api;