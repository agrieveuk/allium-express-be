const express = require("express");
const commentsRouter = express.Router();
const { deleteComment, patchComment } = require("../controllers/comments.js");

//endpoints
commentsRouter.route("/:comment_id").delete(deleteComment).patch(patchComment);

module.exports = commentsRouter;
