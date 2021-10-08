const express = require("express");
const {
  handle404s,
  handlePSQLErrors,
  handleCustomErrors,
  handle500s
} = require("./errors");
const apiRouter = require("./routers/api.router");
const cors = require("cors");
const getWelcomeMessage = require("./controllers/welcome");

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", getWelcomeMessage);
app.use("/api", apiRouter);

app.use("*", handle404s);

app.use(handlePSQLErrors);
app.use(handleCustomErrors);
app.use(handle500s);

module.exports = app;
