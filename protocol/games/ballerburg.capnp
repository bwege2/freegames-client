@0xade65cfc5a0a815d;
# Ballerburg online (web/games/ballerburg): two players, one castle each: seat 0 is the left castle (it
# moves first, as player 1 does in the original), seat 1 the right castle. Every client runs the same game
# from RoomStarted.seed (the original's rand() seeded with it). What a player decides in a turn is a move,
# sent to everyone (Target.all) and carried out by every client in the server's order; the server module
# (server/.../games/ballerburg/BallerburgModule.java) lets only the castle on turn move and ends the round.
# The core carries these messages as Data. Names in parentheses are the original's (baller1.c, baller2.c,
# market.c, cannoneer.c, settings.c).

using Java = import "/capnp/java.capnp";
$Java.package("net.slop.freegames.games.ballerburg");
$Java.outerClassname("BallerburgProto");

# Room options (CreateRoom, SetRoomOptions): the settings dialog's rules and the new game dialog's castles.
struct Options {
  maxRounds @0 :UInt16 = 32767;      # Maximum rounds (max_rund): 20, 50, 100, or 32767 for unlimited
  kingMayCapitulate @1 :Bool = true; # King may capitulate (au_kap)
  playersMayBuild @2 :Bool = true;   # Players may build (an_erl)
  castleLeft @3 :UInt8;              # the left castle (bur[0]): its number in baller.dat, 0..8
  castleRight @4 :UInt8;             # the right castle (bur[1])
}

# Every game message (Relay.data / Relayed.data).
struct Msg {
  union {
    done @0 :Void;           # the "Done" button (Fertig): the turn ends without a shot
    cannon @1 :Cannon;       # a cannon was clicked and its dialog closed (sch_obj)
    king @2 :Void;           # an audience with the king (koenig)
    market @3 :Void;         # the market dialog opens (markt)
    marketButton @4 :UInt8;  # a button of the market dialog, by its object number in marktdlg: 19 taxes
                             # down, 20 taxes up, 29..34 a price (lay bricks, shaft tower, cannon, weather
                             # vane, powder, cannonballs), 35 Done
    brick @5 :Brick;         # laying bricks (anbau): a brick at the mouse position
    bricksDone @6 :Void;     # laying bricks: the right mouse button ended it before the 20th brick
    gameOver @7 :UInt8;      # a client to the server (Target.server): its game ended with this end code
    history @8 :History;     # the server to a seat that came back: the moves of the round so far
  }
}

# A cannon's dialog: the angle and the powder it was set to, and whether OK (fire) or Cancel was pressed.
# Firing ends the turn.
struct Cannon {
  index @0 :UInt8;   # the cannon (ka[n][index]), 0..9
  angle @1 :UInt8;   # Winkel, 0..180 degrees
  powder @2 :UInt8;  # Pulver, 5..20
  fire @3 :Bool;
}

struct Brick {
  x @0 :UInt16;      # screen pixels (640x480 as the original's window), 0..639
  y @1 :UInt16;      # 0..479
}

# The moves relayed in the round so far, in order, in chunks (start: the index of the first; total: how
# many the round has, so the client knows when it has them all).
struct History {
  start @0 :UInt32;
  total @1 :UInt32;
  moves @2 :List(Data);   # each a packed Msg as it was relayed
  seats @3 :List(UInt8);  # moves[i] came from seats[i]
}

# RoundFinished.results, from the server module.
struct Results {
  winner @0 :UInt8;    # the seat that won; 255: none (the clients' games did not agree, or one did not
                       # report its end in time)
  end @1 :UInt8;       # the original's end code (ende()): 17/18 the left/right king was hit, 33/34 the
                       # left/right king capitulated, 49/50 the left/right castle has no people left,
                       # 65/66 the round limit with the right/left castle worse off; 0 when a player left
                       # or the round timed out
  reason @2 :Reason;
}

enum Reason {
  king @0;
  capitulated @1;
  noFolk @2;
  rounds @3;
  left @4;       # the other player left the room (or did not come back in time)
  disagreed @5;  # the two clients reported different ends (one of them is not the same game)
  timeout @6;    # online only: the castle on turn did nothing for 5 minutes while connected (the other castle
                 # won), or the second client's end was not reported within a minute of the first's (no winner)
}
