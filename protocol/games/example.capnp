@0x8c0653c3d0136578;
# The example game (web/games/example, not listed on the website): a dice race that shows every part
# of the server integration. Room options, the game messages and the round results are this schema;
# the core carries them as Data. Server module: server/.../games/example/ExampleModule.java.

using Java = import "/capnp/java.capnp";
$Java.package("net.slop.freegames.games.example");
$Java.outerClassname("ExampleProto");

struct Options {
  target @0 :UInt16 = 20;  # the first to reach this many points wins (1..1000)
}

# Every game message (Relay.data / Relayed.data).
struct Msg {
  union {
    roll @0 :Void;         # a seat to the server (Target.server): roll my die
    rolled @1 :Rolled;     # the server to everyone: the roll and the new total
    chat @2 :Text;         # a seat to the others, relayed by the core as it is
    pointer @3 :Pointer;   # a seat to the others, unreliable: superseded by the next one
  }
}

struct Rolled {
  seat @0 :UInt8;
  value @1 :UInt8;         # 1..6
  total @2 :UInt16;
  rolls @3 :UInt16;        # rolls this seat made so far
}

struct Pointer { x @0 :Float32; y @1 :Float32; }

# RoomFinished.results: decided by the server module (the host cannot finish this game itself).
struct Results {
  winner @0 :UInt8;
  totals @1 :List(UInt16); # by seat order of the round
  rolls @2 :UInt16;        # the winner's rolls: what the score table "fewest-rolls" accepts
}

# The player's file "stats" in storage (what an original would have written to disk).
struct Stats {
  rounds @0 :UInt32;
  wins @1 :UInt32;
}
