const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const router = express.Router();
const nunjucks = require('nunjucks');
const path = require('path');

const app = express();
const port = process.env.PORT || 8000;

const gameRouter = require('./routes/index');

app.use('/', gameRouter);


nunjucks.configure(path.join(__dirname, 'views'), {
    autoescape: true,
    express: app
  });  

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));




app.listen(port, () => {
  console.log("\x1b[33m\x1b[1m" + `Server is up and listening on port ${port}` + "\x1b[0m");
});

module.exports = app;
