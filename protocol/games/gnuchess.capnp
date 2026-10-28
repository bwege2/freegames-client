@0x9b2eec9bbd079ef1;
# GNU Chess online (web/games/gnuchess): the original's manual mode ("manual"/"force": the program only
# checks and records the moves) for two people. Seat 0 plays White, seat 1 Black, from the initial
# position. There are no room options. A client sends its player's move to the server (Target.server);
# the server module (server/.../games/gnuchess/GnuchessModule.java) keeps the position, takes only a legal
# move of the colour on move, sends it to both seats (Relayed.from = 255), and ends the round when the game
# ends, with the rules of GNU Chess 6.3.0's adapter (src/adapter/game.cpp, game_comp_status()).
# Squares are numbered as in the frontend (src/frontend/common.h, enum Square): a1 = 0, b1 = 1, ..., h1 = 7,
# a2 = 8, ..., h8 = 63. The core carries these messages as Data.

using Java = import "/capnp/java.capnp";
$Java.package("net.slop.freegames.games.gnuchess");
$Java.outerClassname("GnuchessProto");

# Every game message (Relay.data / Relayed.data).
struct Msg {
  union {
    move @0 :Move;           # a client to the server: its player's move; the server to both seats: a
                             # move it took, in the order of the game
    resign @1 :Void;         # a client to the server: its player resigns (the other colour wins)
    drawOffer @2 :Void;      # a client to the server: its player offers a draw, or accepts the
                             # opponent's pending offer (then the game is drawn)
    drawOffered @3 :UInt8;   # the server to both seats: this seat offers a draw. The offer stands until
                             # the player it was made to moves.
    history @4 :History;     # the server to a seat that came back: the game so far
    historyRequest @5 :Void; # a client to the server: send me the game so far (History). A page that was
                             # reloaded asks for it: when its new connection took over before the
                             # server saw the old one go, the module is not told that the seat came
                             # back. Answered at most once a second per seat.
  }
}

# A move in coordinate notation (the frontend's MOVE(from, to) and PROMOTEPIECE; the adapter's move_t):
# castling is the king's move of two squares (e1g1, e1c1, e8g8, e8c8), en passant the pawn's move to the
# square it passes.
struct Move {
  ply @0 :UInt16;          # the half-move the move is (the frontend's GameCnt after it, from 0): a client
                           # sends the number of half-moves played so far; any other is dropped
  from @1 :UInt8;          # the square the piece leaves (FROMSQ), 0..63
  to @2 :UInt8;            # the square it goes to (TOSQ), 0..63
  promotion @3 :Promotion; # what a pawn reaching the last rank becomes; none for every other move
}

enum Promotion {
  none @0;
  knight @1;   # KNIGHTPRM, "n"
  bishop @2;   # BISHOPPRM, "b"
  rook @3;     # ROOKPRM, "r"
  queen @4;    # QUEENPRM, "q"
}

# The game so far, for a seat that came back (onReconnect): every move in order (ply 0, 1, ...) and the
# draw offer that stands.
struct History {
  moves @0 :List(Move);
  drawOffer @1 :UInt8 = 255;   # the seat whose offer stands, 255: none
}

# RoomFinished.results, from the server module.
struct Results {
  outcome @0 :Outcome;
  reason @1 :Reason;
  plies @2 :UInt16;        # half-moves played
}

enum Outcome {
  whiteWins @0;   # "1-0"
  blackWins @1;   # "0-1"
  draw @2;        # "1/2-1/2"
}

enum Reason {
  checkmate @0;   # WHITE_MATES / BLACK_MATES: "1-0 {White mates}", "0-1 {Black mates}"
  stalemate @1;   # STALEMATE: "1/2-1/2 {Stalemate}"
  fiftyMoves @2;  # DRAW_FIFTY: "1/2-1/2 {Draw by fifty-move rule}" (100 half-moves without a capture or
                  # a pawn move)
  repetition @3;  # DRAW_REPETITION: "1/2-1/2 {Draw by repetition}" (the position for the third time)
  material @4;    # DRAW_MATERIAL: "1/2-1/2 {Draw by insufficient material}" (KK, KBK, KNK, KBKB with
                  # bishops on squares of one colour)
  resignation @5; # a player resigned
  agreement @6;   # a draw offer was accepted
  left @7;        # the other player left the room (or did not come back in time); the one who stayed wins
}
