const { selectUsers, selectUserByUsername } = require("../models/users");

const getUsers = (req, res, next) => {
  selectUsers()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch(next);
};

const getUserByUsername = (req, res, next) => {
  const { username } = req.params;

  selectUserByUsername(username)
    .then((user) => {
      res.status(200).send({ user });
    })
    .catch(next);
};

module.exports = { getUsers, getUserByUsername };
