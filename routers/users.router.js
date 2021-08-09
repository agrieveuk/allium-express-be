const express = require("express");
const usersRouter = express.Router();
const { getUsers, getUserByUsername } = require("../controllers/users.js");

//endpoints
usersRouter.route("/").get(getUsers);

usersRouter.route("/:username").get(getUserByUsername);

module.exports = usersRouter;
