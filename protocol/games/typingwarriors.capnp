@0xff6a4f5b5eae9d3b;
# Typing Warriors (web/games/typingwarriors): a typing duel in five modes, with a rating (ELO) per player
# and keyboard layout. The server module (server/.../games/typingwarriors/TypingwarriorsModule.java) picks
# the words, checks every typed character, plays the bots, decides the places and keeps the ratings.
# Times are ms since the start of the round unless said otherwise.

using Java = import "/capnp/java.capnp";
$Java.package("net.slop.freegames.games.typingwarriors");
$Java.outerClassname("TypingwarriorsProto");

enum Mode {
  race @0;        # one text for all; who finishes first wins
  survival @1;    # a word per wave with a shrinking time limit; three lives; the last one standing wins
  loot @2;        # a shared pool of words; the first to finish a word takes it; some carry a power-up
  sprint @3;      # 60 s; points = word length x combo, a typo resets the combo
  switchWars @4;  # a race in which every segment of the text must be typed with the other of two layouts
}

enum Lang { en @0; de @1; }

# Room options (CreateRoom, SetRoomOptions).
struct Options {
  mode @0 :Mode;
  lang @1 :Lang;
  bots @2 :List(UInt16);   # one bot per entry: its rating, one of 800, 1000 ... 2400; at most 5
}

# Every game message (Relay.data / Relayed.data). Seats send only to the server (Target.server).
struct Msg {
  union {
    join @0 :Join;         # seat -> server, once after RoomStarted: the layout this seat plays (and is rated) with
    keys @1 :Keys;         # seat -> server: what it typed
    setup @2 :Setup;       # server -> seats: who plays, the text, when it starts (again to a seat that comes back)
    state @3 :State;       # server -> seats, 5 times a second, unreliable: everybody's progress
    wave @4 :Wave;         # server -> seats (survival): the next word
    pool @5 :List(Slot);   # server -> seats (loot): the slots that changed (all of them at the start)
    event @6 :Event;       # server -> seats: something to show
    sync @7 :PState;       # server -> one seat: its own state, when what it sent did not fit (it starts from here)
  }
}

struct Join {
  layout @0 :Text;         # a layout id of the game (web/games/typingwarriors/src/layouts.data.ts), at most 24 chars
  layout2 @1 :Text;        # Switch Wars: the second layout
}

struct Keys {
  chars @0 :Text;          # the typed characters in order, wrong ones included; at most 40
  pos @1 :UInt32;          # where the seat thinks it stands before them: in the text, or in the word (survival, loot)
  word @2 :UInt16;         # survival: the wave's number; loot: the id of the word being typed
  layout @3 :UInt8;        # Switch Wars: 0 or 1, the layout these keys were typed with (as the client detected it)
}

struct Player {
  id @0 :UInt8;            # the seat; bots are 100, 101, ...
  name @1 :Text;
  bot @2 :Bool;
  elo @3 :UInt16;          # the rating it goes into the round with
  games @4 :UInt32;        # rated rounds played with this layout
  layout @5 :Text;         # "" = none given: plays unrated
  layout2 @6 :Text;
}

struct Setup {
  mode @0 :Mode;
  lang @1 :Lang;
  players @2 :List(Player);
  startsInMs @3 :Int32;    # the round starts this many ms from now (negative: it runs since then)
  durationMs @4 :UInt32;   # sprint, loot: the length; race, switchWars: the latest end; survival: 0
  text @5 :Text;           # race, sprint, switchWars: lower-case words with single spaces
  switchAt @6 :List(UInt32); # switchWars: the offsets in text where the layout changes (segment 0 = layout 0)
  rated @7 :Bool;          # two or more players (bots count): the ratings change
  lives @8 :UInt8;         # survival
}

struct PState {
  id @0 :UInt8;
  pos @1 :UInt32;          # correct characters so far in the text (survival, loot: in the current word)
  errors @2 :UInt32;
  score @3 :Int32;         # sprint, loot: points; survival: waves survived
  lives @4 :UInt8;
  streak @5 :UInt16;       # sprint: words in a row without a typo
  flags @6 :UInt8;         # 1 finished or safe in this wave, 2 out, 4 frozen, 8 double points, 16 left the round
  wpm @7 :UInt16;          # correct characters / 5 per minute
  word @8 :UInt16;         # loot: the id of the word it is typing (0 = none)
  chars @9 :UInt32;        # correct characters of the whole round
}

struct State {
  t @0 :UInt32;
  players @1 :List(PState);
}

struct Wave {
  number @0 :UInt16;       # from 1
  word @1 :Text;
  startT @2 :UInt32;
  limitMs @3 :UInt32;      # whoever has not typed it by startT + limitMs loses a life
}

enum Power {
  none @0;
  freeze @1;               # everybody else cannot type for 2.5 s
  double @2;               # the taker's words count twice for 10 s
  steal @3;                # up to 10 points from the best of the others
  shuffle @4;              # every other word of the pool is replaced
}

struct Slot {
  index @0 :UInt8;         # 0..9
  id @1 :UInt16;           # the new word's id (ids are never reused in a round)
  word @2 :Text;
  power @3 :Power;
  takenBy @4 :UInt8 = 255; # who took the word that was here (255: nobody, a first or shuffled word)
  points @5 :UInt16;       # what it brought them
}

enum EventKind {
  finished @0;             # value: the place
  lifeLost @1;             # value: lives left
  out @2;                  # value: the wave
  freeze @3;               # id: who took it; value: ms
  double @4;
  steal @5;                # id: who took it; value: (victim << 16) | points
  shuffle @6;
}

struct Event {
  kind @0 :EventKind;
  id @1 :UInt8;
  value @2 :Int32;
  t @3 :UInt32;
}

# RoomFinished.results: decided by the module (the host cannot finish a round).
struct Results {
  mode @0 :Mode;
  rated @1 :Bool;
  players @2 :List(Result);  # best first
}

struct Result {
  id @0 :UInt8;
  name @1 :Text;
  bot @2 :Bool;
  place @3 :UInt8;         # from 1; equal results share a place
  score @4 :Int32;
  wpm @5 :UInt16;
  accuracy @6 :UInt16;     # correct / all typed characters, in 1/1000
  errors @7 :UInt32;
  chars @8 :UInt32;
  timeMs @9 :UInt32;       # race, switchWars: the finishing time (0 = not finished)
  layout @10 :Text;
  eloBefore @11 :UInt16;
  eloAfter @12 :UInt16;    # = eloBefore for bots and unrated rounds
}

# ScoreEntry.detail of the rating tables "elo-<layout id>" and "elo-switch" (score = the rating).
struct Rating {
  games @0 :UInt32;
  wins @1 :UInt32;
}

# The player's file "profile" in storage.
struct Profile {
  layout @0 :Text;
  layout2 @1 :Text;        # the second layout of Switch Wars and of the switch trainer
  lang @2 :Lang;           # the words' language
  uiLang @3 :Text;         # "en" or "de"; "" = the browser's
  helper @4 :Bool = true;  # show the helper keyboard
  trustLayout @5 :Bool;    # do not check the layout from the keys (a keyboard that maps the layout itself)
  sound @6 :Bool = true;
  lessons @7 :List(LessonDone);
  ratings @8 :List(KnownRating);   # the ratings as the server last told them (the server's tables decide)
  history @9 :List(Played);        # the last rounds, newest first, at most 50
  switchStats @10 :List(SwitchStat);
}

struct LessonDone {
  layout @0 :Text;
  lesson @1 :UInt16;       # the lesson's number in that layout's course
  stars @2 :UInt8;         # 1..5
  wpm @3 :UInt16;          # the best
  accuracy @4 :UInt16;     # of the best run, in 1/1000
  runs @5 :UInt16;
}

struct KnownRating {
  table @0 :Text;          # a layout id, or "switch"
  elo @1 :UInt16;
  games @2 :UInt32;
}

struct Played {
  time @0 :Float64;        # ms since the epoch
  mode @1 :Mode;
  layout @2 :Text;
  place @3 :UInt8;
  players @4 :UInt8;
  wpm @5 :UInt16;
  accuracy @6 :UInt16;
  eloBefore @7 :UInt16;
  eloAfter @8 :UInt16;
}

struct SwitchStat {
  from @0 :Text;
  to @1 :Text;
  switches @2 :UInt32;
  totalMs @3 :UInt32;      # the sum of the switching times (order to first correct key with the new layout)
  bestMs @4 :UInt32;
}
