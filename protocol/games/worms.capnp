@0xb97375af0f8bf580;
# Worms? online (web/games/worms): up to four people, one worm each. Seat n plays worm n (the original's
# colours: 0 green, 1 red, 2 blue, 3 purple); the worms without a player are the computer's, of the kind
# the room's options name. Every client plays the same game from RoomStarted.seed (what the original's
# RAND reads from the raster register comes from it, web/games/worms/src/raster.ts). When a person's worm
# meets a situation its table does not know, its owner chooses the move (the original asked at the
# keyboard, GETNEWMOVE) and the choice goes to everyone. The server module
# (server/.../games/worms/WormsModule.java) plays the same game: it accepts only the decision the game
# is waiting for, from that worm's owner, plays a departed player's worm itself, and ends the round with
# the scores. Names in parentheses are the original's Forth words.

using Java = import "/capnp/java.capnp";
$Java.package("net.slop.freegames.games.worms");
$Java.outerClassname("WormsProto");

# Room options (CreateRoom, SetRoomOptions).
struct Options {
  others @0 :UInt8 = 2;   # the kind of the worms without a player: 0 none (DED), 2 the computer's (AUTO), 3 WILD
}

# Every game message (Relay.data / Relayed.data).
struct Msg {
  union {
    worm @0 :Worm;            # a seat to the server, once a round: the worm it plays
    start @1 :Start;          # the server to everyone, when every seat has its worm: the game begins
    decision @2 :Decision;    # a seat to everyone (Target.all): its worm's move in a new situation
    takeover @3 :Takeover;    # the server to everyone: a player left (or did not answer for 5 minutes);
                              # the computer chooses for the worm
    history @4 :History;      # the server to a seat that came back: the round so far
  }
}

# The part of a worm a player brings (the rest of the original's 88 bytes the game makes itself).
struct Worm {
  kind @0 :UInt8;    # 1 NEW: taught from nothing in this game; 4 SAME: brings its table (a taught or loaded worm)
  name @1 :Data;     # 4 PETSCII characters
  moves @2 :Data;    # 64: the move for each situation (0-5 a path, F1 ask the player, F2 the computer chooses, F3 die)
}

struct Start {
  worms @0 :List(Worm);     # 4, by worm number; the computer's have the kind of the room's options
  owners @1 :List(UInt8);   # the seat that plays each worm, 255: the computer's
}

# A move for a situation (GETNEWMOVE's answer).
struct Decision {
  step @0 :UInt32;       # the how-manieth decision of the round, counting every person's worm's from 0
  worm @1 :UInt8;        # 0-3
  situation @2 :UInt8;   # the node's eaten paths, bits 0-5 (the table index, [.VAL])
  move @3 :UInt8;        # 0-5, a path that is not eaten
}

struct Takeover {
  worm @0 :UInt8;
  step @1 :UInt32;       # from this decision on, the computer chooses for this worm (DOAI)
}

struct History {
  start @0 :Start;
  decisions @1 :List(Decision);
  takeovers @2 :List(Takeover);
}

# RoomFinished.results, from the server module.
struct Results {
  scores @0 :List(UInt16);   # the four worms' scores (nodes completed, WSCR)
  owners @1 :List(UInt8);    # as in Start
}
