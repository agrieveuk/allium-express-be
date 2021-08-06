const express = require("express");
const commentsRouter = express.Router();
const { deleteComment } = require("../controllers/comments.js");

//endpoints
commentsRouter.route("/:comment_id").delete(deleteComment);

module.exports = commentsRouter;
