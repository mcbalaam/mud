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
let roomItemList = [];
let hands = [];
let roomList = [];
let currentRoomItemsList = []

router.get("/", function (req, res) {
  commands = ['[I] Welcome to The Chamber Of Secrets (Early Beta).', '[I] Type a command or use "help" or "?" to list all the commands.'];
  gameon = false;
  roomset = "";
  prinput = "";
  hands = [];
  roomItemsList = [];
  console.log("\x1b[34m\x1b[1m" + "Page loading." + "\x1b[0m");
  res.render("game.njk", { commands: commands });
});

router.post(
  "/",
  bodyParser.urlencoded({ extended: false }),
  function (req, res) {
    let userInput = req.body.inpfield;

    function cprint(prinput, type) {
      // функция вывода текста в консоль и редактирования сниппетов
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
        case "br":
          prinput = " >> " + prinput;
          break;
        default:
          break;
      }
      commands.push(prinput);
    }

    function beginatt(input) {
      // попытка запуска карты с указанными параметрами
      switch (input) {
        case "debug":
          cprint("Debug level setting up.", "db");
          roomset = "roomset_debug";
          roomId = 1;
          loadroom(roomset, roomId, function (roomInfo, currentRoomItemsList) {

          });
          return true;
        case "":
          cprint("Argument expected: begin [level].", "err");
          return false;
        default:
          cprint("Unknown argument: begin [level].", "err");
          return false;
      }
    }

    function info(input) {      // информация о игре
      switch (input) {
        case "changelogs":
          cprint("Last updates:", "rp");
          cprint("10.11.2023 v0.01: Console commands engine introduced.", "if");
          cprint("14.11.2023 v0.02: Examination function created.", "if");
          cprint("19.11.2023 v0.03: Database system implemented.", "if");
          cprint("23.11.2023 v0.04: Room/item examination implemented.", "if");
          cprint("26.11.2023 v0.05: Item pickup added.", "if");
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
          cprint('    "The Chamber Of Secrets" v0.05');
          cprint("    By balaam_");
          cprint("    Last update: 29.11.2023");
          break;
        default:
          cprint("Unknown argument: info [changelogs, level, version].", "err");
          return false;
      }
    }

  function examine(input) {      // функция exm, осмотр чего-либо
    switch (input) { // обработка аргументов команды          
      case "":
        console.log("room examination"); // осмотр комнаты
        cprint("You look around.", "rp");
        cprint(currentRoomInfo.roomdesc, "if");
        cprint(`In the room you can see: \n`, "if");
        currentRoomItemsList.forEach((item) => {
          cprint(` - ${item.itemname}, (${item.itemsc}) \n`);
        });
        break;
      case "hands":
        console.log("hands examination"); // осмотр рук
        cprint("You look at your hands.", "rp");
        if (hands.length != 0) {
          cprint(`You are holding: \n`, "if");
          hands.forEach((item) => {
            cprint(` - ${item.itemname}, (${item.itemsc}) \n`);
          });
        } else {
          cprint(`You are not holding anything!`);
        }
        break;
      default:
        console.log("item examination"); // осмотр предмета по шорткату
        let reqItem = currentRoomItemsList.find((item) => item.itemsc === input);
        cprint(`You look at ${reqItem.itemname} closer.`, "rp");
        cprint(reqItem.itemdesc, "if");
    }
  };

  function loadroom(roomset, currentRoom, callback) {      // загрузка данных комнаты
    console.log("loadroom function called");
    db.all(
      `SELECT * FROM ${roomset} WHERE roomid = ${currentRoom}`, function (err, roomInfo) {        // загрузка информации о текущей комнате
        if (err) {
          console.error(err);
        } else {
          db.all(`SELECT * FROM itemsglobal`, function (err, globalItems) {        // создание массива всех существующих объектов globalItems
            currentRoomInfo = roomInfo[0]
            let roomItems = globalItems.filter((item) =>
              currentRoomInfo.roomitems.includes(item.itemid)
            );
            roomItems.forEach((item) => {
              console.log(item)
              currentRoomItemsList.push(item);
            });       // список наполнен
            console.log(currentRoomItemsList)
            callback(currentRoomInfo);
          }); 
        }
      }
    );
  }

  function levelList(){
    cprint('Current levels avalible:', 'if')
    cprint(' - debug')
  }

  function help(){
    cprint('Chat commands:', 'if')
    cprint('Cmd                Arguments            Description')
    cprint('~~~                ~~~~~~~~~            ~~~~~~~~~~~')
    cprint('begin              [roomset]            Begins a game on a stated roomset')
    cprint('info               [empty]              Displays basic info about the game')
    cprint('                    changelogs          Displays changelogs')
    cprint('levels             [empty]             Displays avalible roomsets')
    cprint('Game commands:', 'if')
    cprint('Cmd                Arguments            Description')
    cprint('~~~                ~~~~~~~~~            ~~~~~~~~~~~')
    cprint("exm                [empty]              Examines the room you're in, lists the items and other")
    cprint('                                        objects')
    cprint(`                   [item shortcut]      Examines the item that's in the room by the given shortcut`)
    cprint(`                    hands               Examines what are you holging right now`)
    cprint(`pck                [item shortcut]      Picks up the item by the given shortcut if your hands`)
    cprint(`                                        are not occupied by something already`)
    cprint(`drp                [item shortcut]      Drops the item you were holding in your hand`)
  }

  function pickup(sCut) {      // функция pck, поднять предмет в комнате
    switch (sCut) {      // обработка аргументов команды 
      case "":
        console.log("pickup empty");        // пустой аргумент (ошибка)
        cprint("Argument expected: pck [item shortcut].", "err");
        break;
      default:
        console.log(`pickup ${sCut}`);     // осмотр предмета по шорткату
        let reqItem = currentRoomItemsList.find((item) => item.itemsc === sCut);
        cprint(`You reach out to grab ${reqItem.itemname}...`, "rp");
            handsSize = 0;
            for (let i = 0; i < hands.length; i++) {
              handsSize += parseInt(hands[i].itempick);
            }
            if (handsSize + reqItem.itempick <= 1) {
              hands.push(reqItem);
              currentRoomItemsList = currentRoomItemsList.filter((item) => item.itemsc !== sCut);
              console.log(currentRoomItemsList)
              cprint(`You are now holding ${reqItem.itemname}.`, "if");
              console.log(hands)
            } else {
              cprint(
                `Your hands are too busy to pick up ${reqItem.itemname}!`, 'if');
            }
    }
  }

  function drop(sCut) {
    if (hands.length === 0){
      cprint('You are not holding anything!', 'if')
    } else {
      switch (sCut) {
        case '':
          cprint('Argument expected: drp [item shortcut].', 'err')
        default:
          console.log(`dropping ${sCut}`)
          let reqItem = hands.find((item) => item.itemsc === sCut);
          currentRoomItemsList.push(reqItem)
          hands = hands.filter((item) => item.itemsc !== sCut);
          cprint(`You scatter ${reqItem.itemname} on the floor, where it belongs.`, 'if')
      }
    }
  }

  function basecom(userInput) {     // функция отправки команд
    let secArg = "";
    cprint(userInput, "br");
    let commandSplit = userInput.split(" ");
    console.log(commandSplit);
    if (commandSplit.length > 1) {
      secArg = commandSplit[1];
    } else {
      secArg = "";
    }
    if (gameon == false) {
      switch (commandSplit[0]) {
        case "info":
          info(secArg);
          break;
        case 'help':
          help(secArg)
          break;
        case 'levels':
          levelList(secArg)
          break;
        case '?':
          help(secArg)
          break;
        case "begin":
          if (beginatt(secArg) == true) {
            gameon = true;
            cprint("Level initializing.", "rp");
          }
          break;
        default:
          cprint("Unknown command.", "err");
      }
    } else if (gameon == true) {
      switch (commandSplit[0]) {
        case "exm":
          examine(secArg);
          break;
        case "pck":
          pickup(secArg);
          break;
        case "inv":
          inventory(secArg);
          break;
        case "int":
          interact(secArg);
          break;
        case "drp":
          drop(secArg);
          break;
      }
    }
  }

    basecom(userInput);
    res.render("game.njk", { commands: commands });
  }
);

module.exports = router;
