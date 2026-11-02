@0xe9b7eaa74e95ae7f;
# Bomberslop online (web/games/bomberslop): two to four players in one match, in deterministic lockstep. Every
# browser runs the same game (the rules of ClanBomber 2.2.0, web/games/bomberslop/src/sim.ts) from the round's seed;
# seat n plays bomber n. The game runs in turns of four frames (1/16 s); for each turn every browser sends its
# player's keys to everyone (Target.all) and plays a turn when it has every seat's keys for it, in the server's order.
# The server module (server/.../games/bomberslop/BomberslopModule.java) passes on only a seat's next turn, not too
# far ahead of the slowest seat nor of the clock, checks the keys and compares the hashes of the game's state the
# browsers send now and then (different hashes: the games went apart, the round stops). A player who leaves is out
# of the game from the turn after their last (Left); a seat that comes back gets every turn so far (History).
# The core carries these messages as Data.

using Java = import "/capnp/java.capnp";
$Java.package("net.slop.freegames.games.bomberslop");
$Java.outerClassname("BomberslopProto");

# Room options (CreateRoom, SetRoomOptions): the original's game settings that a room may change (GameConfig).
struct Options {
  pointsToWin @0 :UInt8 = 5;       # points_to_win, 1-10: rounds a player must survive to win the match
  roundTime @1 :UInt16 = 90;       # round_time, 30-300 s: then the Ladle starts eating the arena
  randomMapOrder @2 :Bool = false; # random_map_order: the next map at random, else in the list's order
  startMap @3 :UInt8 = 0;          # start_map: the first map, an index of the map list (by name, 0-5)
}

# Every game message (Relay.data / Relayed.data).
struct Msg {
  union {
    turn @0 :Turn;         # a seat to everyone: its keys for one turn
    left @1 :Left;         # the server to everyone: a player left the match
    history @2 :History;   # the server to a seat that came back: one seat's turns so far
    stopped @3 :Stopped;   # the server to everyone: the browsers' games differ; the round ends
    over @4 :Over;         # a seat to the server: its game says the match is over
  }
}

struct Turn {
  turn @0 :UInt32;   # counted from 0 at the start of the round
  keys @1 :UInt8;    # 1 left, 2 up, 4 right, 8 down, 16 bomb (held, or pressed during the turn)
  hash @2 :UInt32;   # on every 16th turn t (t >= 16): the hash of the sender's game after turn t - 8; else 0
}

struct Left {
  seat @0 :UInt8;
  turn @1 :UInt32;   # the seat's keys end before this turn; from it on, its bomber is out
}

# One seat's turns, from `start` (a seat that came back gets one or more per seat, in order).
struct History {
  seat @0 :UInt8;
  start @1 :UInt32;
  keys @2 :Data;              # one byte a turn (Turn.keys)
  leftAt @3 :UInt32 = 0xffffffff;  # the turn from which it is out; 0xffffffff: still playing
}

struct Stopped {
  turn @0 :UInt32;   # the turn whose hashes differed
}

struct Over {
  turn @0 :UInt32;        # the turn in which the match ended
  winner @1 :UInt8;       # the seat with points_to_win points; 255: none
  points @2 :List(UInt8); # every seat's points
}

# RoundFinished.results, from the server module.
struct Results {
  winner @0 :UInt8;        # the seat that won; 255: none
  points @1 :List(UInt8);  # by seat
  reason @2 :Reason;
  turns @3 :UInt32;
}

enum Reason {
  won @0;        # every browser still playing reported the same end
  disagreed @1;  # the browsers reported different ends
  desync @2;     # the browsers' games differed (Stopped)
  left @3;       # fewer than two players were left
  limit @4;      # the match reached the server's limit of turns
}
