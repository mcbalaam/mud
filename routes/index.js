const express = require("express");
const nunjucks = require("nunjucks");
const router = express.Router();
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3");
const { each } = require("jquery");
const db = new sqlite3.Database("gamedata.sqlite3");

const app = express();

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

let commands = [];
let gameon = false;
let roomset = "";
let itemlist = [];
let prinput = "";

router.get("/", function (req, res) {
  res.render("game.njk");
  commands = [];
  gameon = false;
  roomset = "";
  prinput = "";
  console.log("\x1b[34m\x1b[1m" + "Page game.njk requested" + "\x1b[0m");
});

router.post(
  "/",
  bodyParser.urlencoded({ extended: false }),
  function (req, res) {
    function cprint(prinput, type) {
      switch (type) {
        case "rp":
          prinput = "[R] " + prinput;
          break;
        case "db":
          prinput = "[DEBUG] " + prinput;
          break;
        case "if":
          prinput = "[I] " + prinput;
          break;
        case "err":
          prinput = "[X] " + prinput;
          break;
        case "fatal":
          prinput = "[ERROR] " + prinput;
          break;
        default:
          break;
      }
      commands.push(prinput);
    }

    function beginatt(input) {
      console.log(input);
      switch (input) {
        case "debug":
          cprint("Debug level setting up.", "db");
          roomset = "roomset_debug";
          return true;
        case "":
          cprint("Argument expected: begin [level].", "err");
          return false;
        default:
          cprint("Unknown argument: begin [level].", "err");
          return false;
      }
    }

    function info(input) {
      // info
      switch (input) {
        case "changelogs":
          cprint("Last updates:", "rp");
          cprint("10.11.2023 v0.01: Console commands engine introduced.", "if");
          cprint("14.11.2023 v0.02: Examination function created.", "if");
          cprint("19.11.2023 v0.03: Database system implemented.", "if");
          cprint("23.11.2023 v0.04: Room/item examination implemented.", "if");
          break;
        case "":
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
          cprint('    "The Chamber Of Secrets" v0.04');
          cprint("    By balaam_");
          cprint("    Last update: 25.11.2023");
          break;
        default:
          cprint("Unknown argument: info [changelogs, level, version].", "err");
          return false;
      }
    }

    function examine(input) {
      // examine function, 'exm'
      itemlist = [];
      roomId = 1;
      db.all(`SELECT * FROM itemsglobal`, function (err, globalItems) {     // создание массива всех существующих объектов globalItems
        loadroom(roomset, roomId, function (roomInfo) {     // загрузка данных комнаты - описание, список предметов, etc. в объект RoomInfo
          let roomItemsList = []      // создание списка объектов с данными всех предметов в комнате
          let roomItems = globalItems.filter((item) =>
          roomInfo.roomitems.includes(item.itemid)
          );
          roomItems.forEach((item) => {
            roomItemsList.push(item)
          });     // список наполнен
          console.log(roomItemsList)

          switch (input) {      // обработка аргументов команды
            case '':  console.log('room examination');      // осмотр комнаты 
              cprint('You look around.', 'rp');
              cprint(roomInfo.roomdesc, 'if');
              cprint(`In the room you can see: \n`, 'if');
              roomItemsList.forEach((item) => {
                 cprint(`${item.itemname}, (${item.itemsc}) \n`);
              });
              break;
            default:  console.log('item examination')     // осмотр предмета по шорткату
              let reqItem = roomItemsList.find(
                (item) => item.itemsc === input
              );
              console.log(reqItem);
              cprint(`You look at ${reqItem.itemname} closer.`, "rp");
              cprint(reqItem.itemdesc, 'if')
          }
        });
      });
    }

    function loadroom(roomset, currentRoom, callback) {
      console.log("loadroom function called");
      db.all(
        `SELECT * FROM ${roomset} WHERE roomid = ${currentRoom}`,
        function (err, roomItems) {
          if (err) {
            console.error(err);
          } else {
            callback(roomItems[0]);
          }
        }
      );
    }

    let userinput = req.body.inpfield;
    cprint(" >> " + userinput);
    let uinput = userinput.split(" ");
    if (uinput.length > 1) {
      resinput = uinput[1].trim();
    } else {
      resinput = "";
    }
    if (gameon == false) {
      switch (uinput[0]) {
        case "info":
          info(resinput);
          break;
        case "begin":
          if (beginatt(resinput) == true) {
            gameon = true;
            cprint("Level initializing.", "rp");
          }
          break;
        default:
          cprint("Unknown command.", "err");
      }
    } else if (gameon == true) {
      switch (userinput.split(" ")[0].trim()) {
        case "exm":
          examine(resinput);
          break;
        case "pck":
          pick(resinput);
          break;
        case "inv":
          inventory(resinput);
          break;
        case "int":
          interact(resinput);
          break;
        case "drp":
          drop(resinput);
          break;
      }
    }

    res.render("game.njk", { commands: commands });
  }
);

module.exports = router;
