@0xebd6eca1ab6ad78b;
# Core War (web/games/corewar): online battles of pMARS 0.9.5. Every seat enters one warrior (Redcode
# source); the server module holds them until every seat has entered, then sends all of them and the
# value pMARS seeds its random number generator with (its time(0)), derived from the round's seed.
# Every client runs the same battle and reports the results; the module compares the reports and ends
# the round with the result they agree on, or with a dispute. Reports still missing 10 minutes after the
# first one are not waited for.
# Server module: server/.../games/corewar/CorewarModule.java.

using Java = import "/capnp/java.capnp";
$Java.package("net.slop.freegames.games.corewar");
$Java.outerClassname("CorewarProto");

# Room options: pMARS's command-line options for the battle (0 = pMARS's default).
struct Options {
  rounds @0 :UInt16 = 3;           # -r, 1..100
  coreSize @1 :UInt32 = 8000;      # -s, 80..65536
  cycles @2 :UInt32 = 80000;       # -c, 1..1000000 (cycles until a tie)
  processes @3 :UInt32 = 8000;     # -p, 1..65536 (max. processes per warrior)
  maxLength @4 :UInt16 = 100;      # -l, 1..1000 (max. warrior length)
  minDistance @5 :UInt32;          # -d, 0 = maxLength (min. distance between warriors)
  icws88 @6 :Bool;                 # -8, enforce ICWS'88 rules
  readLimit @7 :UInt32;            # -R, 0 = core size
  writeLimit @8 :UInt32;           # -W, 0 = core size
  pSpaceSize @9 :UInt32;           # -S, 0 = 1/16th of the core
}

# Every game message (Relay.data / Relayed.data).
struct Msg {
  union {
    warrior @0 :Text;      # a seat to the server: the Redcode source of its warrior (at most 16 KiB)
    entered @1 :Entered;   # the server to everyone: one seat's warrior, once every seat has entered
    start @2 :Start;       # the server to everyone, after the Entered messages: run the battle
    report @3 :Report;     # a seat to the server: what pMARS printed for the battle
  }
}

struct Entered {
  seat @0 :UInt8;
  source @1 :Text;
}

struct Start {
  time @0 :UInt32;         # what time(0) returns in pMARS (positions, permutations: rng(time(0)))
  seats @1 :List(UInt8);   # the warriors in battle order (warrior n is seats[n])
}

# A seat's outcome of the battle: pMARS's exit status and, if it ran, every warrior's score array
# (warrior_struct.score: wins as the last survivor of 1..W warriors, then the order of death),
# warriors in battle order, W * (2W - 1) numbers.
struct Report {
  status @0 :Int32;
  scores @1 :List(UInt32);
}

# RoomFinished.results: decided by the server module.
struct Results {
  union {
    agreed @0 :Report;            # every seat that reported reported this
    dispute @1 :List(SeatReport); # the reports differ
  }
  seats @2 :List(UInt8);          # the warriors in battle order
  missing @3 :List(UInt8);        # seats of the battle without a report: they left the room, or had not
                                  # reported 10 minutes after the first report (online only)
  unconfirmed @4 :Bool;           # agreed rests on one seat's report alone: no other seat confirmed it
}

struct SeatReport {
  seat @0 :UInt8;
  report @1 :Report;
}
