@0xc4a1f0e2b7d39a51;
# FreeCol online (web/games/freecol): 2 to 8 players in one game, the computer playing the other nations, as
# the original's network game (one server, a client per player). Deterministic lockstep: every browser runs the
# same FreeCol server and AI (the port's server worker) from the round's seed, and applies every player's
# client messages to it in the order the server module gives them. A player's browser sends what its FreeCol
# client sends its server (a command: one XML message as a line, or the opening and closing of a connection);
# the module (server/.../games/freecol/FreecolModule.java) numbers them, adds a random salt and sends them to
# everyone (Entry), and every browser applies them in that order to that seat's connection. The browsers report
# the state of their game where it changes (whose turn, the turn number and, once a turn, a hash of the whole
# game); the module checks that they agree, lets only the player on turn act, hands a player who left to the
# computer, and gives a player who comes back the entries so far.
# The core carries these messages as Data.

using Java = import "/capnp/java.capnp";
$Java.package("net.slop.freegames.games.freecol");
$Java.outerClassname("FreecolProto");

# Room options (CreateRoom, SetRoomOptions): the rules and the difficulty of the new game dialog.
struct Options {
  rules @0 :Text;       # "freecol" (FreeCol's rules) or "classic" (Colonization's): data/rules/<rules>
  difficulty @1 :Text;  # "veryEasy", "easy", "medium", "hard", "veryHard" (model.difficulty.<difficulty>)
}

# Every game message (Relay.data / Relayed.data).
struct Msg {
  union {
    command @0 :Command;   # a browser to the server (Target.server): what its client did
    entry @1 :Entry;       # the server to all: a command in the round's order
    report @2 :Report;     # a browser to the server: the state of its game after an entry
    history @3 :History;   # the server to a seat that came back: the entries so far
    stopped @4 :Stopped;   # the server to all: the browsers' games differ; the round ends
    over @5 :Over;         # a browser to the server: the game ended
  }
}

# What a player's client did to its connection to the server.
struct Command {
  kind @0 :Kind;
  line @1 :Data;     # kind line: one FreeCol message, UTF-8 XML without the newline (at most 32 KiB)
}

enum Kind {
  line @0;     # a message on the seat's connection
  open @1;     # the seat's client connects (a new connection; the previous one, if any, is closed)
  close @2;    # the seat's client closed its connection
  drop @3;     # (server only) the seat's connection is gone (its browser came back without it)
  computer @4; # (server only) the seat left: from here its nation is the computer's
}

# A command as everyone applies it.
struct Entry {
  index @0 :UInt32;   # its place in the round, from 0
  seat @1 :UInt8;
  salt @2 :UInt32;    # the server's random seed is reseeded from the round's seed, the index and this
  kind @3 :Kind;
  line @4 :Data;
}

# The state of a browser's game after it applied entry `index` (sent when the turn or the player on turn
# changed there).
struct Report {
  index @0 :UInt32;
  turn @1 :UInt32;      # the game's turn number (0 before the game started)
  current @2 :UInt8;    # the seat whose player is on turn; 255: a computer player, or none
  hash @3 :UInt64;      # a hash of the saved game (FNV-1a of savegame.xml), with each new turn; 0 otherwise
}

# The entries of the round so far, in chunks of at most 48 KiB (start: the index of the first; total: how many
# the round has).
struct History {
  start @0 :UInt32;
  total @1 :UInt32;
  entries @2 :List(Entry);
}

struct Stopped {
  index @0 :UInt32;   # the entry after which the reports differed
  turn @1 :UInt32;
}

# The game's end as a browser saw it.
struct Over {
  index @0 :UInt32;
  winner @1 :UInt8;   # the seat whose player won; 255: none of the players (the computer, or a surrender)
}

# RoundFinished.results, from the server module.
struct Results {
  winner @0 :UInt8;   # the seat that won; 255: none
  turn @1 :UInt32;
  reason @2 :Reason;
}

enum Reason {
  won @0;        # every browser reported the same end
  disagreed @1;  # the browsers reported different ends
  desync @2;     # the browsers' games differed (Stopped)
  limit @3;      # the round reached the server's limit of entries or bytes
}
