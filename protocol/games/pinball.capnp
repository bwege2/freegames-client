@0xb7a29e4c1d3f5081;
# Pinball Construction Set (web/games/pinball), online: the original's Play Game (RUN2.S) for the
# room's 2 to 4 players, one at each computer. Every client runs the same program (the port of the
# 6502 code) on the same table; the player whose turn it is sends the joystick and buttons the program
# read, and everybody else's program reads the same values at the same reads (an input tape).
# The core carries every message as Data.
# Server module: server/src/main/java/net/slop/freegames/games/pinball/PinballModule.java

using Java = import "/capnp/java.capnp";
$Java.package("net.slop.freegames.games.pinball");
$Java.outerClassname("PinballProto");

# Room options: the table, as the host saved it with the disk menu (DISK.S SAVE).
struct Options {
  table @0 :Data;
  # The table file's bytes as DOS keeps them in the file: the address ($4000, PBBASE) and the length
  # L, two bytes each, low byte first, then the L bytes from $4000: LOGIC, WSET, PBDATA (the parts),
  # the painted screen packed by COMPRESS after them. 4 + L bytes, 1 <= L <= $3000 (the room up to
  # the bitmaps at $7000).
  name @1 :Text;
  # its file name (as the disk menu shows it), up to 30 characters
}

# Every game message (Relay.data / Relayed.data).
struct Msg {
  union {
    input @0 :Input;   # the seat whose turn it is, to all (Target.all)
    turn @1 :Turn;     # the module to all: whose turn it is
  }
}

# The program's steps fromStep..toStep-1 as the active seat ran them. A step is one stretch of the
# program between two waits (a WAIT of the main loop, one turn of a loop that polls the buttons):
# the same in every client, so all of them stop at the same places. events: the inputs that changed
# within those steps, in order. Nobody runs a step before its input is known.
struct Input {
  fromStep @0 :UInt32;    # = the toStep of the round's previous Input (0 for the first)
  toStep @1 :UInt32;      # fromStep..fromStep + 100000
  events @2 :List(Event); # at most 256, by poll
  endOfTurn @3 :Bool;     # the program went on to the next player (or the game ended) at toStep
}

# From input read number `poll` on (counted from the round's start: $C061, $C062, $C000 and PREAD
# each count one), the buttons and paddles read these values, until the next event.
struct Event {
  poll @0 :UInt32;
  buttons @1 :UInt8;      # bit 0: button 0 ($C061), bit 1: button 1 ($C062)
  paddle0 @2 :UInt8;      # PREAD 0
  paddle1 @3 :UInt8;      # PREAD 1 (the plunger)
}

struct Turn {
  seat @0 :UInt8;         # the seat whose turn it is
  balls @1 :UInt8;        # that seat's balls left, this one included (5 at the start)
}
