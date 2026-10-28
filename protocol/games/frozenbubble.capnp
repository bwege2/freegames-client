@0xfc8526c6119931c3;
# Frozen Bubble online (web/games/frozenbubble): the original's network game for 2 to 5 players, its
# in-game protocol carried unchanged over our rooms. Every game message (Relay.data / Relayed.data) is one
# packed `Msg`; the room options are `Options`; the round's results are `Results`. The server module
# (server/.../games/frozenbubble/FrozenbubbleModule.java) stands where the original's fb-server stood.
#
# ---------------------------------------------------------------- the original's protocol
# Frozen Bubble 2.2.0 (c_stuff/lib/fb_net.pm, server/game.c): once a game has started, each client writes
# lines "<id><message>\n" to the server, <id> being the one byte the server gave it (its connection's fd)
# in GAME_CAN_START, and the server copies every line to the other players of the game ("p", the ping,
# goes to nobody; "!", the synchronisation, also back to its sender; when a player's connection ends, the
# server sends "<id>l" for it). The messages (the first character is the command):
#   ! synchro       a angle         A attack (single player targetting)   b bubble (start of a game)
#   f fire          F finished      g generate malus   l leave           m malus bubble   M malus stick
#   n new game      N next bubble   p ping             r rotate          s stick          t talk
#   T to be launched bubble
# `Msg.line` is one such line without its newline: the id byte, then the message, bytes as the original
# sends them (ASCII, the chat UTF-8).
#
# ---------------------------------------------------------------- what the core and the module replace
# * The game server's lobby (server list, chat room, CREATE/JOIN/KICK/START, the options a creator sets):
#   the website's lobby; the options are `Options`, the players are the room's seats.
# * GAME_CAN_START (the mapping of ids to nicks): `Start`, from the module, in seat order. A seat's id is
#   seat + 4 (the original's ids are small fds, never "\n"); its nick is the seat's name made a valid nick
#   (sanitize_nick: [A-Za-z0-9_-], at most 10 characters, "player" if nothing is left) and unique, as the
#   original's NICK_IN_USE answers made it (a digit 2-9 replaces the 10th character).
# * The leader's choice of the starting bubbles: in the original the leader (the lowest id still in the
#   game) draws them and sends "b|<cx>|<cy><colour>" for the 37 bubbles, then "N<colour>" and
#   "T<colour>"; here the module draws them from the round's seed and sends the same lines, with the
#   leader's id, to everyone (the leader included) at the start of each game. Clients' b, N, T lines are
#   dropped.
# * The ids' authenticity: a line whose first byte is not the sender's id is dropped, and so are lines the
#   original would never send (unknown commands, out-of-range numbers, more than `maxLine` bytes).

using Java = import "/capnp/java.capnp";
$Java.package("net.slop.freegames.games.frozenbubble");
$Java.outerClassname("FrozenbubbleProto");

struct Options {
  # what the original's game creator set in its chat room (smg_choose_game, "SETOPTIONS")
  chainReaction @0 :Bool = true;
  # CHAINREACTION: falling bubbles of a colour that fit a group chain-react
  continueGameWhenPlayersLeave @1 :Bool = true;
  # CONTINUEGAMEWHENPLAYERSLEAVE: the game goes on while two or more remain
  singlePlayerTargetting @2 :Bool = true;
  # SINGLEPLAYERTARGETTING: F1-F4 send the malus to one opponent (F10: to all)
  victoriesLimit @3 :UInt8 = 5;
  # VICTORIESLIMIT: 0 none (unlimited), else 1-12, 15, 20, 30, 50 or 100
}

struct Msg {
  union {
    line @0 :Data;
    # one line of the in-game protocol (above), both ways
    start @1 :Start;
    # the module to each seat when the round starts
  }
}

struct Start {
  ids @0 :Data;
  # one id byte per seat of the round, in seat order
  nicks @1 :List(Text);
  # the nicks, in the same order
  you @2 :UInt8;
  # the index of the receiving seat in ids/nicks
}

struct Results {
  # the round's end (RoomFinished.results), as the original's show_mp_scores tells it
  nicks @0 :List(Text);
  victories @1 :List(UInt16);
  # the games each nick won (the original's score), counted by the module from the "F" lines
  reason @2 :Text;
  # "victories": the victories limit was reached; "left": a player left (and the game does not go on
  # without them) or fewer than two remain
}
