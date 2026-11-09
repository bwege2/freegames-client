@0xffb22ec889fa699b;
# HyperRogue online (web/games/hyperrogue): the turn-based multiplayer mode of the original (multi.cpp), 2-7 players,
# in deterministic lockstep. The original has only local multiplayer (up to 7 players at one keyboard); online play
# is the port's deviation (web/games/hyperrogue/ONLINE.md). Every browser runs the same game from the round's seed;
# seat n plays player n (multi::player[n]). For each round every seat sends one Decision to everyone (Target.all);
# the browsers apply a round's decisions, in the server's order, once they have one from every seat still in the
# game: multi::whereto[seat], then the part of multi::handleMulti that runs when all players have decided (the crash
# check, multimove, monstersTurn). The server module (server/.../games/hyperrogue/HyperrogueModule.java) never runs
# the game; it checks seats and rounds, decides for seats that time out, tells everyone about seats that leave
# (Left), sends a seat that comes back every decision so far (History), compares the hashes of the browsers' games
# and ends the round when they report the same end. The core carries these messages as Data.

using Java = import "/capnp/java.capnp";
$Java.package("net.slop.freegames.games.hyperrogue");
$Java.outerClassname("HyperrogueProto");

# Room options (CreateRoom, SetRoomOptions).
struct Options {
  land @0 :UInt16 = 4;          # specialland (eLand), the land the game starts in: laIce 4 (the default),
                                # laCrossroads 2, laDesert 3, laCaves 5, laJungle 6, laAlchemist 7
  hardcore @1 :Bool = false;    # hardcore mode (menus.cpp switchHardcore)
  orbStrategy @2 :Bool = false; # inv::on, the Orb Strategy mode
  turnTimeout @3 :UInt16 = 0;   # seconds a seat has for its decision, then the server decides "wait" for it;
                                # 0 = wait for every player, as the original does; else 10-600
  rulesVersion @4 :UInt32 = 0;  # the port's rules version (web/games/hyperrogue/src/net.ts RULES_VERSION): a
                                # browser with other rules does not play in the room
}

# Every game message (Relay.data / Relayed.data).
struct Msg {
  union {
    decision @0 :Decision;   # a seat to everyone; or the server to everyone for a seat that timed out (from 255)
    left @1 :Left;           # the server to everyone: a seat left the room
    history @2 :History;     # the server to a seat that came back: every decision and Left so far
    stopped @3 :Stopped;     # the server to everyone: the browsers' games differ; the round ends
    over @4 :Over;           # a seat to the server: its game is over (canmove is false)
  }
}

# multi::whereto (movedir) of one player for one round.
enum Kind {
  move @0;    # whereto.d = dir, whereto.subdir = subdir: move to (or attack) the neighbour
  wait @1;    # MD_WAIT: skip the turn
  drop @2;    # MD_DROP: pick up or drop an item
  orb @3;     # MD_USE_ORB at whereto.tgt = dcal[target]: use a ranged Orb
  leave @4;   # the player's "leave the game" key (pcFaceFire): multi::leaveGame, while more than one plays
  none @5;    # the seat's player is not on the board (in the revival queue): nothing to decide
}

struct Decision {
  round @0 :UInt32;    # counted from 0 at the start of the round (a refused round counts as well)
  seat @1 :UInt8;      # the player: the sender's seat (checked), or the seat the server decided for
  kind @2 :Kind;
  dir @3 :UInt8;       # move: the direction relative to the player's facing (cellwalker + dir + wstep), < 8
  subdir @4 :Int8 = 1; # move: the side to push towards (movedir.subdir), -1 or 1
  target @5 :UInt16;   # orb: the index of the target cell in dcal (the cells in range, the same in every browser)
  hash @6 :UInt32;     # in every 8th round r (r >= 8): the hash of the sender's game after round r - 4; else 0
}

struct Left {
  seat @0 :UInt8;
  round @1 :UInt32;    # the seat's decisions end before this round; it leaves the game before this round's moves
}

# Every decision and Left of the round so far, in the server's order (one or more messages; `last` on the last).
struct History {
  decisions @0 :List(Decision);
  lefts @1 :List(Left);
  last @2 :Bool;
}

struct Stopped {
  round @0 :UInt32;    # the round whose hashes differed
}

# multi::treasures, multi::kills, multi::deaths of one player.
struct SeatStats {
  treasures @0 :UInt32;
  kills @1 :UInt32;
  deaths @2 :UInt32;
}

struct Over {
  round @0 :UInt32;            # the round after which canmove became false
  gold @1 :UInt32;             # gold(): the treasure collected, shared by the players
  seats @2 :List(SeatStats);   # by seat
}

# RoomFinished.results, from the server module.
struct Results {
  reason @0 :Reason;
  rounds @1 :UInt32;
  gold @2 :UInt32;
  seats @3 :List(SeatStats);   # by seat (empty unless the reason is `over`)
}

enum Reason {
  over @0;        # every browser still playing reported the same end of the game
  disagreed @1;   # the browsers reported different ends
  desync @2;      # the browsers' games differed (Stopped)
  left @3;        # every player left
  limit @4;       # the game reached the server's limit of rounds
}
