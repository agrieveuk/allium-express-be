const getWelcomeMessage = (req, res, next) => {
  res.status(200).send({
    msg: "Welcome to the Allium Express News API! Please go to /api to see a list of available endpoints and what response you can expect. Thank you!"
  });
};

module.exports = getWelcomeMessage;
