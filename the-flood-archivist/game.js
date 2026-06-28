(function () {
"use strict";

/* ---------------------------------------------------------------------
   THE FLOOD ARCHIVIST
   A text adventure. You are the city archivist of Vellmouth, and the
   sea is coming up the streets. You have a little time, a small boat
   waiting at the pier, and far more history than you can carry.
--------------------------------------------------------------------- */

const MAX_TURNS = 26;       // the water reaches the rooftops at this turn
const BOAT_LEAVES_AT = 24;  // the boat won't wait past this
const CARRY_CAPACITY = 10;  // total weight you can carry

const ITEMS = {
  founding_charter: {
    name: "founding charter",
    weight: 2,
    value: 50,
    look: "A vellum charter, sealed in wax, founding the city of Vellmouth on this low ground centuries ago.",
    read: "\"...and on this shore, between the river and the sea, let there be a city...\" The ink has faded but the optimism hasn't."
  },
  land_deeds: {
    name: "land deeds",
    weight: 3,
    value: 20,
    look: "A bundle of property deeds, tied in red string, mapping who owned what before the water decides otherwise.",
    read: "Names of families who haven't lived in this city for generations. Some of their descendants still pay taxes on land that's already underwater."
  },
  flood_records: {
    name: "hydrological survey",
    weight: 1,
    value: 15,
    look: "A thin folder of survey data and rainfall charts, decades old, stamped CONFIDENTIAL.",
    read: "A 40-year-old engineering survey. It predicts, almost to the year, the flood that's happening right now. It was filed and forgotten."
  },
  childhood_diary: {
    name: "a child's diary",
    weight: 1,
    value: 10,
    look: "A cheap notebook diary, handwriting still uneven and round.",
    read: "\"Today the water came up to the second step of the bakery. Mum says it's nothing. I counted the steps anyway.\""
  },
  city_ledger: {
    name: "city ledger",
    weight: 4,
    value: 15,
    look: "A heavy bound ledger recording decades of city expenditures.",
    read: "Page after page of budget lines. One recurring item, struck through every year: \"Flood Barrier - Pier District.\" Never funded."
  },
  brass_key: {
    name: "brass key",
    weight: 0,
    value: 0,
    look: "A small brass key, warm from being held in someone's pocket.",
    read: "It's just a key. It looks like it fits something with a lock."
  },
  sky_bell: {
    name: "the sky bell",
    weight: 5,
    value: 5,
    look: "A small bronze bell from the tower's old warning system, kept more for ceremony than use.",
    read: "There's nothing to read. It's a bell. It still has a clean, simple ring to it."
  },
  spyglass: {
    name: "brass spyglass",
    weight: 1,
    value: 5,
    look: "An old brass spyglass, kept in the tower for watching ships come in.",
    read: "Looking through it from the tower, you can see exactly how far the water has come."
  },
  corruption_memo: {
    name: "sealed memo",
    weight: 1,
    value: 40,
    look: "A memo on city hall letterhead, sealed, marked NOT FOR RECORD.",
    read: "\"...the pier barrier project was deferred again this fiscal year. Risk to lower archive and market square is understood and accepted.\" It is signed by three names you recognize."
  },
  mayors_portrait: {
    name: "the mayor's portrait",
    weight: 6,
    value: 5,
    look: "An oil portrait of a previous mayor, gilt frame, very heavy, not very good.",
    read: "There is nothing to read in a portrait, though the painted mayor's expression suggests he'd want you to save him anyway."
  },
  keeper_logbook: {
    name: "lighthouse logbook",
    weight: 2,
    value: 25,
    look: "A logbook kept by generations of lighthouse keepers, weather and tides recorded in a dozen different hands.",
    read: "Decades of tide heights, hand-recorded every night. The handwriting changes; the rising trend in the numbers does not."
  },
  lifejacket: {
    name: "life jacket",
    weight: 1,
    value: 0,
    look: "A worn but sound life jacket.",
    read: "No words on it, just straps and buckles. Wearing it would be wise on the water."
  },
  fishing_net: {
    name: "old fishing net",
    weight: 3,
    value: 0,
    look: "A tangled fishing net, mostly useless on dry land.",
    read: "It's a net. There is nothing to read."
  }
};

const ROOMS = {
  hall: {
    name: "Archive Main Hall",
    floodAt: null,
    desc: "The marble entrance hall of the city archive. Tall shelves rise into shadow overhead, and a wide staircase leads down. Through the open doors to the north you can already hear water moving in the square.",
    exits: { basement: "basement", down: "basement", "reading room": "reading_room", reading_room: "reading_room", east: "reading_room", tower: "tower", up: "tower", square: "square", north: "square", out: "square" },
    items: []
  },
  basement: {
    name: "Restricted Archive (Basement)",
    floodAt: 8,
    desc: "The basement stacks, kept cool and dry for two hundred years until this week. The air smells like wet paper. Water is already pooling around the lowest shelves.",
    exits: { hall: "hall", up: "hall", out: "hall" },
    items: ["founding_charter", "land_deeds", "flood_records"]
  },
  reading_room: {
    name: "Reading Room",
    floodAt: 14,
    desc: "Long oak tables where scholars once worked. Sunlight, or what passes for it under these clouds, still comes through the tall windows.",
    exits: { hall: "hall", west: "hall", out: "hall" },
    items: ["childhood_diary", "city_ledger"]
  },
  tower: {
    name: "Archive Tower",
    floodAt: null,
    desc: "The old watch tower above the archive. From here you can see all of Vellmouth, and all of the water coming for it.",
    exits: { hall: "hall", down: "hall", out: "hall" },
    items: ["sky_bell", "spyglass"]
  },
  square: {
    name: "Market Square",
    floodAt: 20,
    desc: "The market square, normally full of stalls, now ankle-deep and rising. City Hall stands to the north, the pier lies east, and the old lighthouse keeper's house is west.",
    exits: { hall: "hall", archive: "hall", south: "hall", city_hall: "city_hall", "city hall": "city_hall", north: "city_hall", pier: "pier", east: "pier", lighthouse: "lighthouse", west: "lighthouse" },
    items: []
  },
  city_hall: {
    name: "City Hall",
    floodAt: 20,
    desc: "A grand, slightly pompous lobby. A locked glass case stands against one wall, full of ceremonial documents nobody reads anymore.",
    exits: { square: "square", south: "square", out: "square" },
    items: ["mayors_portrait"]
  },
  pier: {
    name: "Old Pier",
    floodAt: 24,
    desc: "The wooden pier, slick and groaning. A small boat is tied here, rocking hard against the current. This is the only way out of Vellmouth now.",
    exits: { square: "square", west: "square", out: "square" },
    items: ["fishing_net"]
  },
  lighthouse: {
    name: "Lighthouse Keeper's House",
    floodAt: 20,
    desc: "A squat stone house at the base of the old lighthouse, lit by a single oil lamp.",
    exits: { square: "square", east: "square", out: "square" },
    items: []
  }
};

const NPCS = {
  child: {
    room: "reading_room",
    name: "a child",
    look: "A kid of about ten, sitting on a reading table with a small bag of belongings, waiting for someone to tell them what to do.",
    talked: false
  },
  mayors_aide: {
    room: "city_hall",
    name: "the mayor's aide",
    look: "A harried-looking aide, arms full of folders, clearly more concerned with which documents leave the building than who's still in it.",
    talked: false
  },
  lighthouse_keeper: {
    room: "lighthouse",
    name: "the lighthouse keeper",
    look: "An old woman wrapped in a oilskin coat, watching the water through a salt-crusted window.",
    talked: false,
    gaveKey: false
  }
};

const state = {
  room: "hall",
  inventory: [],
  flags: {
    hasKey: false,
    caseUnlocked: false,
    hasLifejacket: false,
    confrontedAide: false,
    gameOver: false
  },
  turn: 0,
  visited: new Set(["hall"]),
  history: [],
  historyIndex: -1
};

/* ---------------------------- output helpers ---------------------------- */

const outputEl = document.getElementById("output");
const inputEl = document.getElementById("input");

function print(text, cls) {
  const div = document.createElement("div");
  div.className = "line" + (cls ? " " + cls : "");
  div.textContent = text;
  outputEl.appendChild(div);
  outputEl.scrollTop = outputEl.scrollHeight;
}

function printBlank() {
  print("");
}

function printTitle(text) {
  print(text, "title");
}

/* ------------------------------ game logic ------------------------------ */

function weightCarried() {
  return state.inventory.reduce((sum, id) => sum + ITEMS[id].weight, 0);
}

function valueCarried() {
  return state.inventory.reduce((sum, id) => sum + ITEMS[id].value, 0);
}

function room() {
  return ROOMS[state.room];
}

function describeRoom() {
  const r = room();
  printTitle(r.name);
  print(r.desc);
  if (r.items.length) {
    print("You can see: " + r.items.map((id) => ITEMS[id].name).join(", ") + ".");
  }
  const npcHere = Object.keys(NPCS).find((k) => NPCS[k].room === state.room);
  if (npcHere) {
    print("Also here: " + NPCS[npcHere].name + ".");
  }
  // list unique destination room names, not raw exit-keyword synonyms
  const dest = new Set();
  Object.values(r.exits).forEach((id) => dest.add(ROOMS[id].name));
  print("Exits: " + Array.from(dest).join(", ") + ".");
  if (r.floodAt !== null) {
    const remaining = r.floodAt - state.turn;
    if (remaining <= 4 && remaining > 0) {
      print("The water is rising fast here. You don't have long.", "warn");
    } else if (remaining <= 0) {
      print("This room is flooding badly.", "danger");
    }
  }
}

function statusReport() {
  printTitle("Status");
  print("Location: " + room().name);
  print("Turn: " + state.turn + " of " + MAX_TURNS + " before the water tops the rooftops.");
  print("Carrying: " + weightCarried() + " / " + CARRY_CAPACITY + " weight.");
  if (state.inventory.length) {
    print("Inventory: " + state.inventory.map((id) => ITEMS[id].name).join(", "));
  } else {
    print("Inventory: nothing.");
  }
  if (state.turn >= BOAT_LEAVES_AT - 4 && state.turn < BOAT_LEAVES_AT) {
    print("The boat at the pier won't wait much longer.", "warn");
  }
}

function findItemByName(name, list) {
  name = name.toLowerCase();
  return list.find((id) => {
    const item = ITEMS[id];
    return item.name.toLowerCase() === name || item.name.toLowerCase().includes(name) || id.replace(/_/g, " ") === name;
  });
}

function tick() {
  state.turn++;
  if (state.turn === 5) {
    print("Somewhere below, you hear a shelf give way under the water's weight.", "warn");
  }
  if (state.turn === BOAT_LEAVES_AT - 5) {
    print("Through a window you can see the boat at the pier straining against its rope. Time is short.", "warn");
  }
  checkFlooding();
}

function checkFlooding() {
  const r = room();
  if (r.floodAt !== null && state.turn >= r.floodAt + 3 && !state.flags.gameOver) {
    endGame("drowned", r);
    return;
  }
  if (r.floodAt !== null && state.turn >= r.floodAt) {
    print("Water is pouring into the " + r.name + " now. You need to get out.", "danger");
  }
  if (state.turn >= MAX_TURNS && !state.flags.gameOver) {
    endGame("toolate");
  }
}

function endGame(kind, r) {
  state.flags.gameOver = true;
  printBlank();
  if (kind === "drowned") {
    printTitle("THE WATER TAKES THE ARCHIVE");
    print("You stayed too long in the " + r.name + ". The water that was rising is, suddenly, just water, and it does not care what you were trying to save.");
    print("Final inventory recovered with the body of the archive: " + (state.inventory.length ? state.inventory.map((id) => ITEMS[id].name).join(", ") : "nothing") + ".");
  } else if (kind === "toolate") {
    printTitle("TOO LATE");
    print("The water reaches the rooftops while you are still inside. Vellmouth's record keeper becomes one more thing the sea keeps instead.");
  } else if (kind === "missedboat") {
    printTitle("THE BOAT IS GONE");
    print("You reach the pier, but the rope is already cut. The boat is a shape in the grey water, getting smaller. You did not save yourself, whatever else you saved.");
  } else if (kind === "evacuate") {
    const value = valueCarried();
    const hasTruth = state.inventory.includes("flood_records") && state.inventory.includes("corruption_memo");
    const hasCharter = state.inventory.includes("founding_charter");
    printTitle("YOU LEAVE VELLMOUTH");
    print("You push off from the pier as the water closes over the square behind you. The city archive, what's left of it, goes under within the hour.");
    printBlank();
    print("You carried out: " + (state.inventory.length ? state.inventory.map((id) => ITEMS[id].name).join(", ") : "nothing at all") + ".");
    print("Preserved value: " + value + " points.");
    printBlank();
    if (hasTruth) {
      printTitle("ENDING: THE RECORD SET STRAIGHT");
      print("Among what you saved are the survey that predicted this flood decades ago, and the memo proving city hall knew and did nothing. Somewhere dry, eventually, someone will read them, and the next Vellmouth will be built on higher ground, or at least built honestly.");
    } else if (hasCharter && value >= 60) {
      printTitle("ENDING: THE ARCHIVIST'S CHOICE");
      print("You couldn't save the city, but you saved its memory of itself: the charter that founded it, and enough else besides that Vellmouth will be remembered as more than a flood. That will have to be enough.");
    } else if (value >= 40) {
      printTitle("ENDING: SOMETHING KEPT");
      print("You leave with your arms full and your hands empty of any one perfect answer. It wasn't everything. It was something.");
    } else if (!state.flags.hasLifejacket) {
      printTitle("ENDING: BARE HANDS");
      print("You leave Vellmouth with almost nothing but yourself, soaked through and shaking, no life jacket, no document worth the weight. You survived. The city's memory mostly didn't.");
    } else {
      printTitle("ENDING: A QUIET LOSS");
      print("You make it out safely, but light. Most of what the archive held is, tonight, just water finding its own level. You did what you could in the time you had.");
    }
  }
  printBlank();
  print("Type RESTART to begin again.", "warn");
}

/* ------------------------------- commands -------------------------------- */

function cmd_help() {
  printTitle("Commands");
  print("look                  - look around the room");
  print("go <place>            - move to a connected room (or just type the place name)");
  print("take <item> / take all - pick something up");
  print("drop <item>           - leave something behind");
  print("inventory / i         - see what you're carrying");
  print("examine <item/person> - look closely at something");
  print("read <item>           - read a document");
  print("talk <person>         - speak with someone in the room");
  print("status                - check the time and your inventory weight");
  print("evacuate / leave      - escape on the boat (only works at the Pier)");
  print("wait                  - let a turn pass");
  print("save / load           - save or load your progress (uses this browser)");
  print("restart               - start over");
  print("help                  - show this list again");
}

function cmd_look(arg) {
  if (!arg) {
    describeRoom();
    return;
  }
  const r = room();
  const item = findItemByName(arg, r.items) || findItemByName(arg, state.inventory);
  if (item) {
    print(ITEMS[item].look);
    return;
  }
  const npcHere = Object.keys(NPCS).find((k) => NPCS[k].room === state.room && (NPCS[k].name.toLowerCase().includes(arg.toLowerCase())));
  if (npcHere) {
    print(NPCS[npcHere].look);
    return;
  }
  print("You don't see that here.");
}

function resolveExit(arg) {
  const r = room();
  const key = arg.toLowerCase().trim();
  if (r.exits[key]) return r.exits[key];
  const match = Object.keys(r.exits).find((k) => k.includes(key) || key.includes(k));
  return match ? r.exits[match] : null;
}

function cmd_go(arg) {
  if (!arg) {
    print("Go where?");
    return;
  }
  const dest = resolveExit(arg);
  if (!dest) {
    print("You can't go that way.");
    return;
  }
  state.room = dest;
  state.visited.add(dest);
  tick();
  if (state.flags.gameOver) return;
  printBlank();
  describeRoom();
}

function cmd_take(arg) {
  if (!arg) {
    print("Take what?");
    return;
  }
  const r = room();
  if (arg.toLowerCase() === "all") {
    if (!r.items.length) {
      print("There's nothing here to take.");
      return;
    }
    const taken = [];
    r.items.slice().forEach((id) => {
      if (weightCarried() + ITEMS[id].weight <= CARRY_CAPACITY) {
        r.items.splice(r.items.indexOf(id), 1);
        state.inventory.push(id);
        taken.push(ITEMS[id].name);
      }
    });
    if (taken.length) {
      print("You take: " + taken.join(", ") + ".");
    }
    if (r.items.length) {
      print("You can't carry anything else right now (" + weightCarried() + "/" + CARRY_CAPACITY + ").", "warn");
    }
    return;
  }
  const item = findItemByName(arg, r.items);
  if (!item) {
    print("There's no \"" + arg + "\" here to take.");
    return;
  }
  if (weightCarried() + ITEMS[item].weight > CARRY_CAPACITY) {
    print("That's too heavy to carry right now. You're at " + weightCarried() + "/" + CARRY_CAPACITY + " weight. Drop something first.", "warn");
    return;
  }
  r.items.splice(r.items.indexOf(item), 1);
  state.inventory.push(item);
  print("You take the " + ITEMS[item].name + ".");
}

function cmd_drop(arg) {
  if (!arg) {
    print("Drop what?");
    return;
  }
  const item = findItemByName(arg, state.inventory);
  if (!item) {
    print("You're not carrying that.");
    return;
  }
  state.inventory.splice(state.inventory.indexOf(item), 1);
  room().items.push(item);
  print("You set down the " + ITEMS[item].name + ".");
}

function cmd_inventory() {
  if (!state.inventory.length) {
    print("You're carrying nothing.");
    return;
  }
  print("You are carrying (" + weightCarried() + "/" + CARRY_CAPACITY + " weight):");
  state.inventory.forEach((id) => print("  - " + ITEMS[id].name));
}

function cmd_read(arg) {
  if (!arg) {
    print("Read what?");
    return;
  }
  const item = findItemByName(arg, state.inventory) || findItemByName(arg, room().items);
  if (!item) {
    print("You don't have that, and it isn't here.");
    return;
  }
  if (item === "spyglass" && state.inventory.includes("spyglass") && state.room === "tower") {
    print(ITEMS.spyglass.read);
    print("The water is at level " + state.turn + " of " + MAX_TURNS + ".");
    return;
  }
  print(ITEMS[item].read);
}

function cmd_talk(arg) {
  const npcId = Object.keys(NPCS).find((k) => NPCS[k].room === state.room && (!arg || NPCS[k].name.toLowerCase().includes(arg.toLowerCase())));
  if (!npcId) {
    print("There's no one like that here to talk to.");
    return;
  }
  const npc = NPCS[npcId];
  if (npcId === "child") {
    if (!npc.talked) {
      print("The child looks up. \"Are you taking the old papers out? My mum says the building's going to be underwater by tonight.\"");
      print("They dig in their bag and hold out a small brass key. \"Found this on the floor of city hall once. Never knew what it opened. You can have it.\"");
      if (!state.inventory.includes("brass_key") && !room().items.includes("brass_key")) {
        room().items.push("brass_key");
        print("(A brass key has been left on the table.)");
      }
      npc.talked = true;
    } else {
      print("\"You should get to the boat,\" the child says. \"I'm going to find my mum.\"");
    }
    return;
  }
  if (npcId === "mayors_aide") {
    if (state.inventory.includes("corruption_memo") && !state.flags.confrontedAide) {
      print("You hold up the sealed memo. The aide goes pale. \"That was never meant to leave the building.\"");
      print("\"Neither was the flood,\" you say, and they have nothing to answer with.");
      state.flags.confrontedAide = true;
    } else if (!npc.talked) {
      print("\"Whatever you're taking, take it fast,\" the aide says, not looking up from their folders. \"And if you find a locked glass case, leave it locked. Orders.\"");
      npc.talked = true;
    } else {
      print("The aide waves you off, too busy carrying their own armful of paper toward the door.");
    }
    return;
  }
  if (npcId === "lighthouse_keeper") {
    if (!npc.talked) {
      print("\"I've watched this water for forty years,\" she says. \"Tonight it stops being patient.\"");
      print("She presses a life jacket into your hands. \"Wear it on the water. Don't argue with an old woman about it.\"");
      if (!state.inventory.includes("lifejacket")) {
        state.inventory.push("lifejacket");
        state.flags.hasLifejacket = true;
        print("(You take the life jacket.)");
      }
      npc.talked = true;
    } else {
      print("\"Go on, then,\" she says. \"I've seen enough floods to know how this part goes.\"");
    }
    return;
  }
}

function cmd_examine(arg) {
  cmd_look(arg);
}

function cmd_unlock() {
  if (state.room !== "city_hall") {
    print("There's nothing to unlock here.");
    return;
  }
  if (state.flags.caseUnlocked) {
    print("The glass case is already open.");
    return;
  }
  if (!state.inventory.includes("brass_key")) {
    print("The glass case is locked, and you don't have anything that looks like it'd open it.");
    return;
  }
  state.flags.caseUnlocked = true;
  ROOMS.city_hall.items.push("corruption_memo");
  print("The brass key turns. Inside the case is a single sealed memo, tucked behind the ceremonial documents as if someone hoped no one would look.");
}

function cmd_evacuate() {
  if (state.room !== "pier") {
    print("You're not at the pier. The boat is your only way out of the city.");
    return;
  }
  if (state.turn >= BOAT_LEAVES_AT) {
    endGame("missedboat");
    return;
  }
  endGame("evacuate");
}

function cmd_wait() {
  print("You let a moment pass, listening to the water.");
  tick();
}

function cmd_save() {
  try {
    localStorage.setItem("flood_archivist_save", JSON.stringify({
      room: state.room,
      inventory: state.inventory,
      flags: state.flags,
      turn: state.turn,
      visited: Array.from(state.visited),
      roomItems: Object.fromEntries(Object.keys(ROOMS).map((k) => [k, ROOMS[k].items])),
      npcState: Object.fromEntries(Object.keys(NPCS).map((k) => [k, { talked: NPCS[k].talked }]))
    }));
    print("Progress saved.");
  } catch (e) {
    print("Couldn't save progress in this browser.", "warn");
  }
}

function cmd_load() {
  try {
    const raw = localStorage.getItem("flood_archivist_save");
    if (!raw) {
      print("No saved game found.");
      return;
    }
    const data = JSON.parse(raw);
    state.room = data.room;
    state.inventory = data.inventory;
    state.flags = data.flags;
    state.turn = data.turn;
    state.visited = new Set(data.visited);
    Object.keys(data.roomItems).forEach((k) => { ROOMS[k].items = data.roomItems[k]; });
    Object.keys(data.npcState).forEach((k) => { NPCS[k].talked = data.npcState[k].talked; });
    print("Progress loaded.");
    describeRoom();
  } catch (e) {
    print("Couldn't load progress.", "warn");
  }
}

function resetState() {
  state.room = "hall";
  state.inventory = [];
  state.flags = { hasKey: false, caseUnlocked: false, hasLifejacket: false, confrontedAide: false, gameOver: false };
  state.turn = 0;
  state.visited = new Set(["hall"]);
  Object.keys(ROOMS).forEach((k) => { ROOMS[k].items = ROOMS_INITIAL[k].slice(); });
  Object.keys(NPCS).forEach((k) => { NPCS[k].talked = false; });
}

function cmd_restart() {
  resetState();
  outputEl.innerHTML = "";
  intro();
}

/* ------------------------------- parser ---------------------------------- */

function handleCommand(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return;
  print("> " + trimmed, "echo");

  if (state.flags.gameOver) {
    if (/^restart$/i.test(trimmed)) cmd_restart();
    else print("The story has ended. Type RESTART to begin again.");
    return;
  }

  const parts = trimmed.split(/\s+/);
  const verb = parts[0].toLowerCase();
  const arg = parts.slice(1).join(" ");

  switch (verb) {
    case "help": case "?":
      cmd_help(); break;
    case "look": case "l":
      cmd_look(arg); break;
    case "examine": case "x": case "inspect":
      cmd_examine(arg); break;
    case "go": case "move": case "walk":
      cmd_go(arg); break;
    case "take": case "get": case "grab": case "pickup": case "pick":
      cmd_take(arg.replace(/^up\s+/, "")); break;
    case "drop": case "leave":
      if (verb === "leave" && !arg) { cmd_evacuate(); break; }
      cmd_drop(arg); break;
    case "inventory": case "i": case "inv":
      cmd_inventory(); break;
    case "read":
      cmd_read(arg); break;
    case "talk": case "speak": case "ask":
      cmd_talk(arg.replace(/^to\s+/, "")); break;
    case "status": case "time":
      statusReport(); break;
    case "unlock": case "open":
      cmd_unlock(); break;
    case "evacuate": case "escape": case "board":
      cmd_evacuate(); break;
    case "wait": case "z":
      cmd_wait(); break;
    case "save":
      cmd_save(); break;
    case "load":
      cmd_load(); break;
    case "restart":
      cmd_restart(); break;
    case "about":
      printTitle("The Flood Archivist");
      print("A short text game about deciding, with very little time, what a city is allowed to remember.");
      break;
    case "clear":
      outputEl.innerHTML = ""; break;
    default:
      // bare exit name, e.g. typing "pier"
      if (resolveExit(trimmed)) {
        cmd_go(trimmed);
      } else {
        print("I don't understand \"" + trimmed + "\". Type HELP for a list of commands.");
      }
  }
}

/* -------------------------------- intro ----------------------------------- */

function intro() {
  printTitle("THE FLOOD ARCHIVIST");
  print("Vellmouth is flooding. You are the city archivist, and you have maybe an hour before the water takes the lower archive, the square, and whatever you haven't already carried out.");
  print("A boat waits at the Old Pier. It will not wait forever.");
  printBlank();
  print("Type HELP at any time for a list of commands.");
  printBlank();
  describeRoom();
}

/* keep an immutable copy of starting room items for RESTART */
const ROOMS_INITIAL = {};
Object.keys(ROOMS).forEach((k) => { ROOMS_INITIAL[k] = ROOMS[k].items.slice(); });

/* ------------------------------- input wiring ------------------------------ */

inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const val = inputEl.value;
    if (val.trim()) {
      state.history.push(val);
      state.historyIndex = state.history.length;
    }
    inputEl.value = "";
    handleCommand(val);
  } else if (e.key === "ArrowUp") {
    if (state.historyIndex > 0) {
      state.historyIndex--;
      inputEl.value = state.history[state.historyIndex];
      setTimeout(() => inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length), 0);
    }
    e.preventDefault();
  } else if (e.key === "ArrowDown") {
    if (state.historyIndex < state.history.length - 1) {
      state.historyIndex++;
      inputEl.value = state.history[state.historyIndex];
    } else {
      state.historyIndex = state.history.length;
      inputEl.value = "";
    }
    e.preventDefault();
  }
});

document.getElementById("terminal").addEventListener("click", () => inputEl.focus());

intro();
})();
