exports.handle404s = (req, res, next) => {
  res.status(404).send({ msg: "Sorry, that is not found" });
};

exports.handlePSQLErrors = (err, req, res, next) => {
  const errorCodes = ["22P02", "42601", "23502", "2201W", "2201X"];
  if (err.code === "23503") {
    res.status(404).send({ msg: "Sorry, that is not found" });
  } else if (errorCodes.includes(err.code)) {
    res.status(400).send({ msg: "Bad Request" });
  } else {
    next(err);
  }
};

exports.handleCustomErrors = (err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
};

exports.handle500s = (err, req, res, next) => {
  console.log(err, "      <<<<< 500 error");

  res.status(500).send({ msg: "Internal Server Error" });
};
