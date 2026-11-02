@0xc3a2e1d4b5f60718;
# Sopwith online (web/games/sopwith): two seats, one biplane each, on the original level. The game
# ticks at 10 Hz; every tick each client sends its 16-bit key word (the original's Vid_GetGameKeys),
# the server relays them in order and both clients run the same fixed-step simulation.
# Names in parentheses are from the SDL Sopwith 2.9.0 source (src/sw.h, src/video.c).
#
# The server module (server/.../games/sopwith/SopwithModule.java) checks the seat, the key mask and
# the message size, keeps the last tick, and ends a round whose peer stops sending.

using Java = import "/capnp/java.capnp";
$Java.package("net.slop.freegames.games.sopwith");
$Java.outerClassname("SopwithProto");

# Room options: the mission index from web/games/sopwith/src/mission.ts MISSION_FILES:
# 0 original, 1 empty, 2 new targets, 3 tank strike, 4 triplane, 5 doghouse, 6 bogey.
struct Options {
  mission @0 :UInt8 = 0;   # MISSION_FILES index (0-6)
}

struct Msg {
  union {
    input @0 :Input;
    result @1 :Result;     # a client to the server, when the game is over
  }
}

struct Input {
  tick @0 :UInt32;        # the 10 Hz tick this word belongs to
  keys @1 :UInt16;        # K_ACCEL..K_STARBURST from src/sw.h
}

struct Result {
  winner @0 :Int8;        # 0/1, 255 none
  score0 @1 :UInt32;
  score1 @2 :UInt32;
}
