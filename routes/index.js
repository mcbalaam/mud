const express = require('express');
const nunjucks = require('nunjucks')
const router = express.Router();
const path = require('path');
const bodyParser = require('body-parser');
const app = express()
const $ = require('jquery');

let commands = []

app.use(bodyParser.urlencoded({ extended: true }));

router.get('/', function(req, res, next) {
  res.render('game.njk')
  console.log("\x1b[34m\x1b[1m" + "Page game.njk requested" + "\x1b[0m");
});

router.post('/', function(req, res) {
  commands.append(req.body.inpfield);
});

module.exports = router;
