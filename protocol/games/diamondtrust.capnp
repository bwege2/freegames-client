@0xd1a2b3c4e5f60718;
# Diamond Trust online (web/games/diamondtrust): a two-seat hidden-information
# game. The server module (server/.../games/diamondtrust/DiamondTrustModule.java)
# runs the authoritative rules from the round seed and sends each seat only its
# own private information plus the public board. Clients send their whole turn
# choice to Target.server; they never see the other seat's money, salaries,
# bribes or un-leaked moves. The core carries these messages as Data.

using Java = import "/capnp/java.capnp";
$Java.package("net.slop.freegames.games.diamondtrust");
$Java.outerClassname("DiamondTrustProto");

# Every game message (Relay.data / Relayed.data).
struct Msg {
  union {
    action @0 :Action;  # a seat to the server (Target.server): this turn's choice
    state @1 :State;    # the server to one seat (Relayed.from = 255): its private view
  }
}

struct Action {
  union {
    salary @0 :Salary;      # salary phase: salaries, bribes and their targets
    moves @1 :Moves;        # moves/adjust: one destination and bid per agent
    adjust @2 :Void;        # peek: I have seen the leaks, let me adjust
    inspector @3 :UInt8;    # inspector: the winning seat moves the inspector (0..7)
    sale @4 :UInt16;        # market/marketAdjust: vault diamonds to sell
    marketAdjust @5 :Void;  # marketPeek: I have seen the sale leak, let me adjust
    next @6 :Void;          # roundEnd: start the next month
    sync @7 :Void;          # after RoomStarted/reconnect: send me the current state
  }
}

struct Salary {
  salary @0 :List(UInt16);       # by own agent (3): paid only at home
  bribe @1 :List(UInt16);        # by own agent (3): paid to bribe[target]
  bribeTarget @2 :List(UInt8);   # by own agent (3): local index (0..2) of the enemy agent
}

struct Moves {
  moves @0 :List(Move);          # by own agent (3)
}

struct Move {
  dest @0 :UInt8;                # region 0..7; the enemy home is never legal
  bid @1 :UInt16;                # diamonds bid (0 in the inspector's region)
  bribe @2 :UInt16;              # UN inspector bribe (0 outside the inspector's region)
}

struct Choices {
  salary @0 :List(UInt16);
  bribe @1 :List(UInt16);
  bribeTarget @2 :List(UInt8);
  moves @3 :List(Move);
  sale @4 :UInt16;
}

struct Unit {
  owner @0 :UInt8;               # 0 London, 1 Antwerp
  region @1 :UInt8;              # 0..7
  carrying @2 :UInt16;           # diamonds carried; public on the map
}

struct Leak {
  unit @0 :UInt8;                # the enemy agent's local index (0..2)
  dest @1 :UInt8;
  bid @2 :UInt16;
  bribe @3 :UInt16;
  salary @4 :UInt16;
  bribeTotal @5 :UInt16;
}

# One seat's private view. Opponent money, salaries and bribes are absent (and
# opponentMoney is only filled at the end, when the original reveals it).
struct State {
  monthsLeft @0 :UInt8;
  round @1 :UInt8;
  phase @2 :Phase;
  active @3 :UInt8;              # the seat the UI should act for, or is waiting for
  inspector @4 :UInt8;
  yourSeat @5 :UInt8;
  result @6 :Result;
  yourMoney @7 :Int16;
  opponentMoney @8 :Int16 = -1;  # -1 until the game end
  yourDiamonds @9 :UInt16;
  opponentDiamonds @10 :UInt16;
  regions @11 :List(UInt16);     # 8 regions, public diamond counts
  units @12 :List(Unit);         # 6 units, public regions/carried diamonds
  yourSalary @13 :List(UInt16);  # 3 own agents
  yourBribe @14 :List(UInt16);   # 3 own agents
  yourBribedBy @15 :List(Int16); # 3 own agents: global bribing unit, -1 none
  leaks @16 :List(Leak);         # only what this seat may peek at
  saleLeak @17 :Int16 = -1;      # -1: no leak
  yourChoices @18 :Choices;      # own pending choice, for a reload
  reason @19 :Reason;            # at the end: diamonds, money, tie or left
}

enum Phase {
  salary @0;
  moves @1;
  peek @2;
  adjust @3;
  inspector @4;
  sale @5;
  market @6;
  marketPeek @7;
  marketAdjust @8;
  roundEnd @9;
  end @10;
}

enum Result {
  none @0;
  london @1;  # seat 0
  antwerp @2; # seat 1
  tie @3;
}

# RoomFinished.results: decided by the server module.
struct Results {
  result @0 :Result;
  londonDiamonds @1 :UInt16;
  antwerpDiamonds @2 :UInt16;
  londonMoney @3 :Int16;
  antwerpMoney @4 :Int16;
  reason @5 :Reason;
}

enum Reason {
  diamonds @0;
  money @1;
  tie @2;
  left @3;
  resigned @4;
}
