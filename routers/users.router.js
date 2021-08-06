const express = require("express");
const usersRouter = express.Router();
const { getUsers } = require("../controllers/users.js");

//endpoints
usersRouter.route("/").get(getUsers);

module.exports = usersRouter;
