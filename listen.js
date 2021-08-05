const PORT = process.env.PORT || 9090;
const app = require("./app.js");

app.listen(PORT, (err) => {
  if (err) throw err;
  else {
    console.log(`App listening on port ${PORT}...`);
  }
});
