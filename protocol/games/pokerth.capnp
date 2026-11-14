@0xd1a6c2f4b8e93a57;
# PokerTH (web/games/pokerth): Texas Hold'em online. The rules run on every client in lockstep (the port of
# PokerTH 1.1.2's engine); the server module (server/.../games/pokerth/PokerthModule.java) is a card dealer
# that knows no poker rule: it shuffles with the server's own random numbers, hands every seat its two hole
# cards privately, and shows board and hole cards only when every connected seat asks for the same thing.
# It also passes on time-out claims when nobody acted for the action time-out.

using Java = import "/capnp/java.capnp";
$Java.package("net.slop.freegames.games.pokerth");
$Java.outerClassname("PokerthProto");

# Room options: the original's "Create Internet Game" dialog (createinternetgamedialog.ui).
struct Options {
  startCash @0 :UInt32 = 3000;          # NetStartCash (1000..1000000)
  firstSmallBlind @1 :UInt32 = 10;      # NetFirstSmallBlind
  raiseOnMinutes @2 :Bool = false;      # false: raise the blinds every `raiseEvery` hands, true: minutes
  raiseEvery @3 :UInt16 = 8;            # NetRaiseSmallBlindEveryHands / ...Minutes
  manualBlinds @4 :List(UInt32);        # empty: always double the blinds; else the manual blinds order
  afterManual @5 :UInt8 = 1;            # after the manual list: 1 double, 2 raise by `raiseAbout`, 3 stay
  raiseAbout @6 :UInt32 = 0;
  timeoutSec @7 :UInt8 = 20;            # NetTimeOutPlayerAction (5..60)
  gameSpeed @8 :UInt8 = 4;              # NetGameSpeed (1..11)
}

# Every game message (Relay.data / Relayed.data).
struct Msg {
  union {
    action @0 :Action;        # a seat to everyone: its action at step `step` of hand `hand`
    deal @1 :Request;         # a seat to the server: deal hand `hand` to `seats` (stage 0)
    reveal @2 :Request;       # a seat to the server: show stage 1 flop, 2 turn, 3 river, 4 the hole cards of `seats`
    dealt @3 :Dealt;          # the server to each seat: hand `hand` is dealt (with that seat's own cards)
    board @4 :Cards;          # the server to everyone: board cards of a stage
    holes @5 :Cards;          # the server to everyone: hole cards, two per seat in `seats`
    idle @6 :Step;            # a seat to the server: nobody acted at this step for the time-out
    timedOut @7 :Step;        # the server to everyone: the player at this step timed out (check, else fold)
    left @8 :UInt8;           # the server to everyone: this seat left the room (it checks or folds from now on)
  }
}

struct Action {
  hand @0 :UInt32;
  step @1 :UInt16;            # the number of actions in this hand before this one
  kind @2 :UInt8;             # 1 fold, 2 check, 3 call, 4 bet, 5 raise, 6 all in
  value @3 :UInt32;           # bet / raise: the amount the bet/raise button showed
}

struct Request {
  hand @0 :UInt32;
  stage @1 :UInt8;
  seats @2 :List(UInt8);      # by round seat index
}

struct Dealt {
  hand @0 :UInt32;
  elapsedSec @1 :UInt32;      # seconds since the round started (the blinds timer of RAISE_ON_MINUTES)
  cards @2 :List(UInt8);      # this seat's two hole cards, or empty if it is not in the hand
}

struct Cards {
  hand @0 :UInt32;
  stage @1 :UInt8;
  seats @2 :List(UInt8);
  cards @3 :List(UInt8);      # board: the stage's cards (3, 1, 1); holes: two per seat
}

struct Step {
  hand @0 :UInt32;
  step @1 :UInt16;
}

# RoomFinished.results
struct Results {
  winner @0 :UInt8;           # round seat index of the game's winner
}
