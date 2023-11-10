const express = require('express');
const router = express.Router();
const path = require('path');
const bodyParser = require('body-parser');
const app = express()
const $ = require('jquery');
app.use(bodyParser.urlencoded({ extended: true }));

router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views/game.html'))
  console.log("\x1b[34m\x1b[1m" + "Page game.html requested" + "\x1b[0m");
});

router.post('/', function(req, res) {
  const userInput = req.body.inpfield;
  const comdec = "command detected"
  res.send(userInput);
});


module.exports = router;
