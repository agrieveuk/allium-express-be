exports.handle404s = (req, res, next) => {
  res.status(404).send({ msg: "Sorry, that is not found" });
};

exports.handleCustomErrors = (err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
};
