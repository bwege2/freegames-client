@0xa1b2c3d4e5f60719;
# Maelstrom online (web/games/maelstrom): deterministic lockstep for 2–3 seats.
# Every client runs the same 30 Hz simulation from the round seed and sends one
# input byte per frame to the server; the module relays it with the sender's seat
# and decides the round from the seats' final reports. The core carries these
# messages as Data.
using Java = import "/capnp/java.capnp";
$Java.package("net.slop.freegames.games.maelstrom");
$Java.outerClassname("MaelstromProto");

struct Options {
  mode @0 :Mode = coop;
  fragTarget @1 :UInt8 = 10;  # deathmatch: frags that end the round (1..99)
}

enum Mode {
  coop @0;
  deathmatch @1;
}

struct Msg {
  union {
    input @0 :Input;  # client -> server: my frame input; server -> all: relayed with seat filled
    done @1 :Done;    # client -> server: final report
  }
}

struct Input {
  frame @0 :UInt32;      # the 30 Hz frame this input belongs to, from 0
  buttons @1 :UInt8;     # bit 0 thrust, 1 brake, 2 left, 3 right, 4 shield, 5 fire
  seat @2 :UInt8 = 255;  # filled by the server; 255 in a client's message
}

struct Done {
  wave @0 :UInt16;
  scores @1 :List(UInt32);  # by seat order
  frags @2 :List(UInt16);   # by seat order
}

struct Results {
  mode @0 :Mode;
  wave @1 :UInt16;
  agreed @2 :Bool;
  scores @3 :List(UInt32);
  frags @4 :List(UInt16);
  reason @5 :Reason;
}

enum Reason {
  done @0;
  timeout @1;
  left @2;
  disagreed @3;
}
