@0xac635efe89ad2040;
# C-Dogs online (web/games/cdogs): one to four seats, one player each, all on the same mission of the
# same campaign. Every client runs the whole simulation (lockstep) from RoomStarted.seed; each frame
# every client sends its own player's command word (the original's cmds of its local players,
# src/cdogs/base.h CMD_*), the server relays the words in order, and a client steps the game once the
# words of every seat for that frame are in.
# Names in parentheses are from the C-Dogs SDL 2.5.0 source (src/mainmenu.c, src/game.c, src/cdogs/base.h).
#
# The server module (server/.../games/cdogs/CdogsModule.java) checks the seat, the frame numbers and
# the message size (one word per frame and seat, without gaps: the first for a frame of at most 60, every
# later one for the frame after the seat's previous one), ends the round when every seat reported its
# end (or one left, or one stopped sending), and gives the results to the clients.

using Java = import "/capnp/java.capnp";
$Java.package("net.slop.freegames.games.cdogs");
$Java.outerClassname("CdogsProto");

# Room options: the campaign the host picked and the mission, as the original's NCampaignDef (the host
# sends its campaign definition to the clients when the game starts).
struct Options {
  campaign @0 :Text;   # the campaign entry's path in the data: "missions/<name>" or "dogfights/<name>"
  mode @1 :UInt8;      # GameMode (state.h): 0 normal, 1 dogfight, 2 deathmatch
  mission @2 :UInt16;  # the campaign's mission index (normal), 0 for dogfight and deathmatch
}

# Every game message (Relay.data / Relayed.data).
struct Msg {
  union {
    input @0 :Input;
    done @1 :Done;       # a client to the server (Target.server): its game ended
  }
}

# One frame's command word of the sending seat's player.
struct Input {
  frame @0 :UInt32;  # the frame the word belongs to (every client starts at 0 and steps one frame at a time)
  cmd @1 :UInt16;    # CMD_LEFT..CMD_GRENADE (base.h): 1 left, 2 right, 4 up, 8 down, 16 fire,
                     # 32 switch weapon, 64 map, 128 pause, 256 grenade; 0: nothing pressed
}

# The seat's game is over: the mission summary's numbers of its player.
struct Done {
  score @0 :UInt32;
  survived @1 :Bool;
}

# RoundFinished.results, from the server module: one entry per seat that reported.
struct Results {
  seats @0 :List(SeatResult);
}

struct SeatResult {
  seat @0 :UInt8;
  score @1 :UInt32;
  survived @2 :Bool;
}
