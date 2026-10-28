@0xf4652c8cf0ba55c5;
# Abuse online (web/games/abuse): a deathmatch of two to eight players on the original's network
# levels (addon/deathmat), in deterministic lockstep. Every client runs the same game from
# RoomStarted.seed; seat n is player n (seat 0 is the original's server, client number 0). Each game
# tick every client sends the input of its player (what the original's engine put into its network
# packet, net_send / view::get_input in src/view.cpp) to everyone (Target.all); a client goes on to
# the next tick when it has every seat's input for it, and processes them in the server's order
# (process_packet_commands). The server module (server/.../games/abuse/AbuseModule.java) passes on only
# a seat's next tick, checks every value, tells everyone when a player leaves (from which tick on) and
# gives a seat that reconnects the ticks it may have missed (it holds those of the last few ticks). Names in parentheses are the original's (SCMD_*).

using Java = import "/capnp/java.capnp";
$Java.package("net.slop.freegames.games.abuse");
$Java.outerClassname("AbuseProto");

# Room options (CreateRoom, SetRoomOptions): the original's server options (net_configuration::get_options).
struct Options {
  levelSize @0 :UInt8 = 2;    # the set of levels: 2 small (addon/deathmat/small.lsp), 4 medium, 8 large
  kills @1 :UInt8 = 25;       # kills to win a level ("kills_to_win", 1-99)
}

# Every game message (Relay.data / Relayed.data).
struct Msg {
  union {
    tick @0 :Tick;          # a seat to everyone: its player's input of one game tick
    left @1 :Left;          # the server to everyone: a player left the game (SCMD_DELETE_CLIENT)
    resume @2 :UInt32;      # a seat to the server: send me the kept messages from this tick on
    replayed @3 :Replayed;  # the server to a seat (after a reconnection, or Resume): a kept message, in the order sent
  }
}

# One tick of one player (the commands net_send writes for the local player, in their order).
struct Tick {
  tick @0 :UInt32;              # the game tick, counted from 0 at the start of the round
  commands @1 :List(Command);   # at most 32
}

struct Command {
  union {
    setInput @0 :SetInput;            # SCMD_SET_INPUT: movement and buttons, the mouse pointer in the level
    viewResize @1 :ViewResize;        # SCMD_VIEW_RESIZE: the player's view on the screen
    weaponChange @2 :UInt8;           # SCMD_WEAPON_CHANGE: the weapon chosen on the status bar (0-7)
    keyPress @3 :UInt16;              # SCMD_KEYPRESS (0-255) / SCMD_EXT_KEYPRESS (256-511): a key went down
    keyRelease @4 :UInt16;            # SCMD_KEYRELEASE / SCMD_EXT_KEYRELEASE: a key went up
    chatKey @5 :UInt8;                # SCMD_CHAT_KEYPRESS: a key typed into the chat console
    sync @6 :UInt16;                  # SCMD_SYNC: make_sync() (the players' positions and the random position)
    reload @7 :Void;                  # SCMD_RELOAD: the players of the round join (once, at tick 0)
  }
}

struct SetInput {
  flags @0 :UInt8;      # 1 right, 2 left, 4 down, 8 up, 16 b1, 32 b2 (fire), 64 b3, 128 b4
  pointerX @1 :Int16;   # where the mouse points, in level pixels
  pointerY @2 :Int16;
}

struct ViewResize {
  cx1 @0 :Int32;        # the view's corners on the 320x200 screen
  cy1 @1 :Int32;
  cx2 @2 :Int32;
  cy2 @3 :Int32;
  panX @4 :Int32;
  panY @5 :Int32;
  shiftDown @6 :Int32;
  shiftRight @7 :Int32;
}

struct Left {
  seat @0 :UInt8;
  tick @1 :UInt32;      # the seat's input ends before this tick; it is deleted in this tick
}

struct Replayed {
  union {
    tick @0 :Tick;
    left @1 :Left;
  }
  seat @2 :UInt8;       # the sender of the tick
}
