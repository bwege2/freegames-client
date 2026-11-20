@0x9b7d2f5c1e4a8631;
# TEG online (web/games/teg): two to six seats, one player each. The server module runs the game with
# the rules of TEG 0.13.0 (server/play.cpp, helper.cpp, turno.cpp, missions.cpp); the clients send
# intents and draw the state the module broadcasts. The core carries these messages as Data.
# Names in parentheses are the original's (server/play.cpp tokens).
using Java = import "/capnp/java.capnp";
$Java.package("net.slop.freegames.games.teg");
$Java.outerClassname("TegProto");

# Room options (the original's server options; defaults are the server's).
struct Options {
  secretMissions @0 :Bool = false;   # set conquer_world:0: play with secret missions
  commonMission @1 :Bool = true;     # set common_mission:1
  fogOfWar @2 :Bool = false;         # set fog_of_war:1
  startingArmies @3 :UInt8 = 5;      # set armies:<first>,<second>
  secondArmies @4 :UInt8 = 3;
}

# Every game message (Relay.data / Relayed.data).
struct Msg {
  union {
    place @0 :Place;          # to the server: a whole placement (fichas/fichas2/fichasc)
    attack @1 :Attack;        # to the server (ataque)
    move @2 :Move;            # to the server: armies into a conquered country (tropas)
    regroup @3 :Move;         # to the server (reagrupe)
    drawCard @4 :Void;        # to the server (tarjeta)
    useCard @5 :UInt8;        # to the server: the 2 armies of a card (ejer2), its country
    exchange @6 :Exchange;    # to the server (canje)
    endTurn @7 :Void;         # to the server (turno)
    surrender @8 :Void;       # to the server (soy_cobarde)
    mission @9 :Void;         # to the server: ask for the mission (mission)
    chat @10 :Chat;           # to the server; the module sends it to everyone with the seat
    state @11 :State;         # the server to the seats
    snapshot @12 :Void;       # to the server: send me the current state (after RoomStarted)
  }
}

struct Place {
  countries @0 :List(UInt8);  # country ids, ascending is not required
  armies @1 :List(UInt8);     # armies[i] for countries[i], 1..255
}

struct Attack { src @0 :UInt8; dst @1 :UInt8; }
struct Move { src @0 :UInt8; dst @1 :UInt8; armies @2 :UInt8; }
struct Exchange { a @0 :UInt8; b @1 :UInt8; c @2 :UInt8; }
struct Chat { seat @0 :UInt8; text @1 :Text; }

enum Phase {
  place1 @0;    # placing armies (fichas)
  place2 @1;    # placing armies 2 (fichas2)
  reinforce @2;# placing armies 3 (fichasc/canje)
  attack @3;    # attacking
  regroup @4;   # regrouping
  move @5;      # moving armies into a conquered country (tropas)
  card @6;      # getting card (tarjeta)
  over @7;
}

# One seat's view of the game. In fog of war, countries the seat cannot see have owner -1 and
# armies -1 (the original sends no owner at all); other seats' missions and cards are not included.
struct State {
  countries @0 :List(Country);
  players @1 :List(Player);
  turn @2 :UInt8;              # the seat whose turn it is
  phase @3 :Phase;
  round @4 :UInt16;
  roundStarter @5 :UInt8;      # g_game.empieza_turno
  pendingSrc @6 :Int8 = -1;    # tropas: the country conquered from
  pendingDst @7 :Int8 = -1;
  pendingMax @8 :Int8 = -1;    # how many more armies the original's tropas message offers
  winner @9 :Int8 = -1;
  winnerMission @10 :Int8 = -1;
  event @11 :Event;            # the last thing that happened (the UI's log line)
  options @12 :Options;
}

struct Country {
  owner @0 :Int8;      # -1: nobody / hidden
  armies @1 :Int16;    # -1 when hidden
  regrouped @2 :Int8;  # ejer_reagrupe
  cardOwner @3 :Int8 = -1;  # the viewer's cards only; -1 for everybody else's
  cardUsed @4 :Bool;        # the viewer's cards only
}

struct Player {
  seat @0 :UInt8;
  name @1 :Text;
  color @2 :UInt8;
  active @3 :Bool;         # still in the game
  eliminated @4 :Bool;
  countries @5 :UInt16;    # hidden counts are 0xffff in fog for other seats (the UI shows ?)
  armies @6 :UInt16;
  cards @7 :UInt8;
  mission @8 :Int8 = -1;   # only the viewer's mission; -1 for the others
  exchanges @9 :UInt8;
  hasExchanged @10 :Bool;
  conquered @11 :UInt8;
  score @12 :UInt16;
}

enum EventKind {
  info @0; error @1; attack @2; dice @3; conquest @4; card @5; exchange @6; turn @7;
  round @8; win @9; lost @10; place @11; regroup @12; move @13; mission @14; chat @15;
}

struct Event {
  seq @0 :UInt32;
  kind @1 :EventKind;
  text @2 :Text;
  seat @3 :Int8 = -1;
  src @4 :Int8 = -1;
  dst @5 :Int8 = -1;
  srcDice @6 :List(UInt8);
  dstDice @7 :List(UInt8);
  card @8 :Int8 = -1;
  amount @9 :Int8 = 0;
}

# RoomFinished.results, from the server module.
struct Results {
  winner @0 :Int8 = -1;    # -1: nobody (timeout)
  mission @1 :Int8 = -1;
  round @2 :UInt16;
  reason @3 :Reason;
  scores @4 :List(Score);
}

enum Reason { mission @0; lastPlayer @1; left @2; timeout @3; }

struct Score {
  seat @0 :UInt8;
  score @1 :UInt32;
  countries @2 :UInt16;
  armies @3 :UInt16;
}

# ScoreEntry.detail of the "scores" table (the original's name, colour, date and human flag).
struct ScoreDetail {
  color @0 :UInt8;
  human @1 :Bool;
  round @2 :UInt16;
}
