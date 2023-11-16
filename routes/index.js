const express = require('express');
const nunjucks = require('nunjucks')
const router = express.Router();
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3');
const { each } = require('jquery');
const db = new sqlite3.Database('gamedata.sqlite3');

const app = express()

app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

let commands = []
let gameon = false
let roomset = ''
let itemlist = []

router.get('/', function (req, res) {
  res.render('game.njk')
  commands = []
  gameon = false
  roomset = ''
  printput = ''
  console.log("\x1b[34m\x1b[1m" + "Page game.njk requested" + "\x1b[0m");
});

router.post('/', bodyParser.urlencoded({ extended: false }), function (req, res) {

  function cprint(prinput, type) {
    switch (type) {
      case "rp": prinput = "[R] " + prinput; break;
      case "db": prinput = "[DEBUG] " + prinput; break;
      case "if": prinput = "[I] " + prinput; break;
      case "err": prinput = "[X] " + prinput; break;
      case "fatal": prinput = "[ERROR] " + prinput; break;
      default: break;
    }
    commands.push(prinput);
  }

  function beginatt(input) {
    console.log(input)
    switch (input) {
      case 'debug':
        cprint('Debug level setting up.', "db");
        roomset = 'roomset_debug'
        return true;
      case '':
        cprint('Argument expected: begin [level].', 'err');
        return false;
      default:
        cprint('Unknown argument: begin [level].', 'err');
        return false;
    }
  }

  function info(input) { // info 
    switch (input) {
      case 'changelogs':
        cprint('Last updates:', "rp");
        cprint('10.11.2023 v0.01: Console commands engine introduced.', "if");
        break;
      case '':
        cprint("                       .. - ----.");
        cprint("                     I'__. ..- '';");
        cprint("                     |           .");
        cprint("                     J.");
        cprint("                      L:..._.- -' .");
        cprint("                      |           .");
        cprint("                      J.");
        cprint("                       L:..._.- -' .");
        cprint("                       |           .");
        cprint("                       J.");
        cprint("                        L:..._.- -' .");
        cprint("                        |:.");
        cprint("       ________________ J8:,          ______________a:f____");
        cprint("             a88888baaa. LP:....- -' .");
        cprint('               `"88888888|8:.        .');
        cprint('                   `"8888:8::...    _J');
        cprint('                        " `""PPPPP""');
        cprint('    "The Chamber Of Secrets" v0.01');
        cprint('    By balaam_');
        cprint('    Last update: 10.11.2023');
        break;
      default:
        cprint('Unknown argument: info [changelogs, level, version].', 'err');
        return false;
    }
  }

  function examine(input) { // examine function, 'exm'
    itemlist = []
    db.all(`SELECT * FROM itemsglobal`, function (err, items) {
      loadroom(roomset, 1, function (roominfo) {
        console.log(items[roominfo.roomitems - 1])
        switch (input) {
          case '': // room examination
            console.log('case succsess')
            cprint('You look around.', 'rp');
            cprint(roominfo.roomdesc, 'if')
            cprint(`In the room you can see: \n - ${items[roominfo.roomitems - 1].itemname}, (${items[roominfo.roomitems - 1].itemsc}).`, 'if');
            break;
          default: // empty
            cprint('default', 'db')
            break;
        }
      });
    })
  }

  function loadroom(roomset, curroom, callback) {
    console.log('loadroom function called')
    db.all(`SELECT * FROM ${roomset} WHERE roomid = ${curroom}`, function (err, items) {
      if (err) {
        console.error(err);
      } else {
        callback(items[0]);
      }
    });
  }

  let userinput = req.body.inpfield;
  cprint(" >> " + userinput);
  let uinput = userinput.split(" ");
  if (uinput.length > 1) {
    resinput = uinput[1].trim();
  } else {
    resinput = '';
  }
  if (gameon == false) {
    switch (uinput[0]) {
      case "info":
        info(resinput);
        break;
      case "begin":
        if (beginatt(resinput) == true) {
          gameon = true;
          cprint('Level initializing.', 'rp')
        }
        break;
      default:
        cprint('Unknown command.', 'err')
    }
  } else if (gameon == true) {
    switch (userinput.split(" ")[0].trim()) {
      case 'exm':
        examine(resinput);
        break;
      case 'pck':
        pick(resinput);
        break;
      case 'inv':
        inventory(resinput);
        break;
      case 'int':
        interact(resinput);
        break;
      case 'drp':
        drop(resinput);
        break;
    }
  }

  res.render('game.njk', { commands: commands })
})

module.exports = router;