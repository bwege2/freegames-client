@0xecaf62543b50b0a2;
# Liquid War online (web/games/liquidwar): the original's network game for up to 6 teams on 2 to 6
# computers. Every game message (Relay.data / Relayed.data) is one packed `Msg`. The server module
# (server/.../games/liquidwar/LiquidwarModule.java) stands where the original's liquidwar-server stood.
#
# ---------------------------------------------------------------- the original's protocol
# Liquid War 5.6.6 (src/netplay.c, protocol.c, srvcont.c, srvchan.c, keyexch.c, netkey.c): a client
# connects to the server, reserves its teams (the human ones, and the computer ones if "allow network
# bots" is set; lw_protocol_reserve_team: its slot 0-5, control type and name), sends its rules (the
# LW_NETCONF part of its config) and its map, and waits for the others. The server numbers the teams of
# all clients in connection order, then slot order (server_id 0-5; distribute_teams) and gives every
# client the other clients' teams in its own free slots ("WHO <slot>" answers NOBODY, LOCAL or NETWORK
# with server_id, control type, name); everyone plays with the rules and the map of the first client.
# In the game, each client sends, for every exchange of keys (lw_keyexch_flush, once per cursor move:
# cursor_increase_speed + 1 times per round), the key states of its local teams (4 bits: up, right, down,
# left) and a checksum of the armies (every 100 rounds, 0 otherwise); the server merges the key states of
# all clients and sends them to everyone, with a lag of a few exchanges it adapts to the connection
# (lw_srvcont_replicate_keys); a client whose checksum differs from all others gets a 0 checksum back and
# logs "incorrect checksum". A client that leaves stops sending, the server drops it, and its teams'
# keys stay 0.
#
# ---------------------------------------------------------------- what the core and the module replace
# * The server address, port, password and the waiting room (lw_connect_menu, its chat): the website's
#   lobby; the room's seats are the original's connections, in seat order.
# * The exchange of keys: instead of one message per exchange, a client says up to which exchange
#   ("step") its keys are known and when they changed (`Keys`); the module merges every seat's keys and
#   sends each seat, at most every 10 ms, the merged keys up to the step that all seats have reached, in
#   that seat's own slots (`Frame`). A client applies at step n what it was told for step n; it sends the
#   keys it reads at step n for step n + lag, and adapts its lag to the connection. Every client applies
#   the same keys at the same step, as in the original.

using Java = import "/capnp/java.capnp";
$Java.package("net.slop.freegames.games.liquidwar");
$Java.outerClassname("LiquidwarProto");

struct Rules {
  # LW_NETCONF (netconf.c): the rules every client plays with, the first client's (ranges: lw_netconf_check)
  cursorIncreaseSpeed @0 :UInt8;   # 0-2
  fighterAttack @1 :UInt8;         # 0-16
  fighterDefense @2 :UInt8;        # 0-16
  fighterNewHealth @3 :UInt8;      # 0-16
  numberInfluence @4 :UInt8;       # 0-16
  fighterNumber @5 :UInt8;         # 0-32
  gameTime @6 :UInt8;              # 0-16
  cpuAdvantage @7 :UInt8;          # 0-4
  cpuVsHuman @8 :UInt8;            # 0-2
  asmAlgorithm @9 :UInt8;          # 0-1 (and of all clients' as in distribute_teams)
  minMapRes @10 :UInt8;            # 0-8
  allowNetworkBots @11 :UInt8;     # 0-1
}

struct Team {
  # a team a client brings (lw_protocol_reserve_team)
  slot @0 :UInt8;          # its slot 0-5 on that client (the team menu's box)
  controlType @1 :UInt8;   # CONFIG_CONTROL_TYPE_HUMAN 1 or _CPU 2
  name @2 :Text;           # the player's name, at most 10 characters (NAME_SIZE)
}

struct Join {
  # client -> module, once at the start of the round: the connection's part of netplay.c's
  # connect_on_server_continue
  program @0 :Text;        # "Liquid War" (lw_protocol_tell_program)
  version @1 :Text;        # "5.6.6" (lw_protocol_tell_version)
  teams @2 :List(Team);
  rules @3 :Rules;
  map @4 :Data;            # the raw map (lw_netmap_send; the map's header and its packed bitmap), <= 60000 bytes
}

enum WhoKind {
  nobody @0;
  local @1;
  network @2;
}

struct Who {
  # the answer to "WHO <slot>" for one slot of the receiving client (LW_WHO)
  kind @0 :WhoKind;
  serverId @1 :UInt8;
  controlType @2 :UInt8;
  name @3 :Text;
}

struct Setup {
  # module -> each seat, once every seat has joined (connect_on_server_finish)
  who @0 :List(Who);       # 6 entries, by the seat's own slots
  rules @1 :Rules;
  map @2 :Data;
  full @3 :Bool;           # no team of this seat got a place (the original's "server full")
}

struct KeyChange {
  step @0 :UInt32;
  keys @1 :UInt32;         # 6 x 4 bits, slot 0 in the low bits (CURSOR_KEY_UP 1, RIGHT 2, DOWN 4, LEFT 8)
}

struct Checksum {
  step @0 :UInt32;
  value @1 :UInt32;        # lw_checksum_calc at that step
}

struct Keys {
  # client -> module: its local teams' keys are known for every step < upto; they changed at these steps
  # (in the client's slots; the other slots are ignored)
  upto @0 :UInt32;
  changes @1 :List(KeyChange);
  checksums @2 :List(Checksum);
}

struct Frame {
  # module -> one seat: the merged keys of every team are known for every step < upto; they changed at
  # these steps (in the seat's own slots, as lw_srvchan_send_keys)
  upto @0 :UInt32;
  changes @1 :List(KeyChange);
  badChecksums @2 :List(UInt32);  # steps at which this seat's checksum differed from all others
}

struct Msg {
  union {
    join @0 :Join;
    setup @1 :Setup;
    keys @2 :Keys;
    frame @3 :Frame;
    done @4 :Void;         # client -> module: this client's game is over (it stops sending keys)
  }
}
