const express = require("express");
const { handle404s, handleCustomErrors } = require("./errors");
const apiRouter = require("./routers/api.router");

const app = express();

app.use(express.json());

app.use("/api", apiRouter);

app.use("*", handle404s);

app.use(handleCustomErrors);

module.exports = app;
