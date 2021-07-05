"use strict";
const express = require("express");
const methodOverride = require("method-override");
const cors = require("cors");
const route = require("./routes");
const morgan = require("morgan");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "50mb" }));
app.use(morgan("dev"));
app.use(methodOverride());
app.use(cors());
app.use(route);
app.use("/static", express.static(__dirname + "/public"));
app.use(function(req, res, next) {
    res.status(404).send("Pagina 404");
});

module.exports = app;