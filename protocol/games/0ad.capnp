@0xf3a7c1d9b2e6480a;
# 0 A.D. online (web/games/0ad): a two-seat deterministic lockstep skirmish. Every client constructs the
# same World from RoomStarted.seed and the room options; the human commands of a turn are sent to the
# server module (Target.server), checked there, and broadcast in one server order. A client applies a
# turn only when both seats' turn packets are present, so the simulations advance together.
#
# The server module is server/.../games/zeroade/ZeroAdeModule.java. The room options, every relayed
# message and the result are this schema; the core carries them as Data. The round's results are the
# RoomFinished.results of the core (one packed `Results`), not a Msg.

using Java = import "/capnp/java.capnp";
$Java.package("net.slop.freegames.games.zeroade");
$Java.outerClassname("ZeroAdeProto");

struct Options {
  map @0 :Text = "farmland_2p";
  startingResources @1 :UInt16 = 300;
  civ0 @2 :Text = "athen";
  civ1 @3 :Text = "athen";
  # turns a human command is scheduled ahead of the simulation, so both seats' input can arrive
  commandDelay @4 :UInt8 = 3;
}

# Every relayed message (Relay.data / Relayed.data).
struct Msg {
  union {
    turn @0 :Turn;           # a seat to the server (Target.server): its commands for one turn
    appliedTurn @1 :AppliedTurn; # the server to every seat: one seat's checked turn, in sequence
    syncRequest @2 :Void;    # a rejoining seat to the server (Target.server)
    sync @3 :Sync;           # the server to a rejoining seat: the checked turns so far
    gameOver @4 :GameOver;   # a seat to the server (Target.server): its simulation ended
    chat @5 :Text;           # a seat to the others, relayed
    check @6 :Check;         # a seat to the others, relayed: the state hash after `turn` turns
    desync @7 :Void;         # a seat to the server (Target.server): a peer's state differs; end the round
  }
}

struct Turn {
  turn @0 :UInt32;
  commands @1 :List(Command);
}

# One checked turn of one seat, as the server relays it.
struct AppliedTurn {
  seat @0 :UInt8;
  turn @1 :Turn;
}

struct Command {
  union {
    move @0 :Move;
    gather @1 :TargetCommand;
    attack @2 :TargetCommand;
    build @3 :TargetCommand;
    train @4 :Train;
    place @5 :Place;
    stop @6 :Units;
    stance @7 :Stance;
    rally @8 :Rally;
  }
}

struct Move { units @0 :List(UInt32); x @1 :Float32; z @2 :Float32; }
struct Units { units @0 :List(UInt32); }
struct TargetCommand { units @0 :List(UInt32); target @1 :UInt32; }
struct Train { building @0 :UInt32; template @1 :Text; }
struct Place { template @0 :Text; x @1 :Float32; z @2 :Float32; yaw @3 :Float32; builders @4 :List(UInt32); }
struct Stance { units @0 :List(UInt32); stance @1 :UInt8; }
struct Rally { building @0 :UInt32; x @1 :Float32; z @2 :Float32; }

# The checked turns of the round so far, in chunks (start: index of the first; total: how many there
# are; turns: this chunk). The rejoining client replays them from turn 0 to catch up.
struct Sync {
  start @0 :UInt32;
  total @1 :UInt32;
  turns @2 :List(AppliedTurn);
}

# A seat's report of the end of its simulation (winner: 0 or 1). The module ends the round when both
# seats report the same winner.
struct GameOver {
  winner @0 :UInt8;
  turns @1 :UInt32;
}

# The hash of the world after `turn` turns: both clients exchange it now and then, and a difference is
# a desynchronised simulation (the module ends the round, nobody wins).
struct Check {
  turn @0 :UInt32;
  hash @1 :UInt32;
}

# RoomFinished.results, from the server module (one packed Results).
struct Results {
  winner @0 :UInt8;   # 0 or 1; 255: no agreed winner (a seat left, the reports disagreed, a desync)
  turns @1 :UInt32;
  reason @2 :Text;    # "agreed", "left", "timeout", "disagreed", "desync", "too-many-turns"
}
