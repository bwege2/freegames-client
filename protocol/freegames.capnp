@0xa1c6c2060beaa2a4;
# freegames: the core protocol between a game in the browser and the one server for all games.
# Transport (slipstream): WebTransport (one reliable stream, 4-byte length framing, + datagrams) or
# WebSocket binary frames; one packed Cap'n Proto message (root = Envelope) per message.
#
# The core knows no game rules. A game's own messages are its own schema, protocol/games/<id>.capnp,
# encoded by the game and carried here as `Data` (Relay, room options, results, score details).
# Guide: docs/SERVER.md. Bindings (tools/gen-protocol.sh): Java net.slop.freegames.proto.Fg,
# TypeScript web/src/sdk/proto/freegames.ts.
#
# Requests that expect an answer carry `req` (chosen by the client, echoed in the answer or in the
# ErrorMsg that refuses them; 0 = no answer wanted).

using Java = import "/capnp/java.capnp";
$Java.package("net.slop.freegames.proto");
$Java.outerClassname("Fg");

# ---------------------------------------------------------------- session

struct Hello {
  token @0 :Text;          # random secret kept by the browser (16..128 chars); identifies the account
  name @1 :Text;           # display name (1..24 chars after trimming; empty = keep the account's)
  version @2 :UInt16;      # protocol version (PROTOCOL_VERSION in the SDK and in Hub.java)
  game @3 :Text;           # the game this connection plays (a registered game id, e.g. "ballerburg")
}

# A play of `game` without an account: the browser stores and sends nothing that identifies it (no
# token, no name). The server counts the connection among the game's players now (/stats) and accepts
# nothing else on it but Ping and, when the game needs the server after all (saves, scores, rooms), a Hello
# that makes it an account connection. No answer; an Error if the version or the game is wrong, or the
# address has too many such plays open.
struct Presence {
  version @0 :UInt16;      # protocol version, as in Hello
  game @1 :Text;           # a registered game id
}

struct Welcome {
  accountId @0 :UInt32;
  name @1 :Text;           # the account's display name
  serverTime @2 :Float64;  # ms since the Unix epoch
  game @3 :Text;
}

struct Ping { clientTime @0 :Float64; }
struct Pong { clientTime @0 :Float64; serverTime @1 :Float64; }

struct ErrorMsg {
  code @0 :UInt16;         # ErrorCode
  text @1 :Text;
  req @2 :UInt32;          # the request this refuses (0 = none)
}

enum ErrorCode {
  none @0;
  badMessage @1;           # malformed or invalid message
  auth @2;                 # say hello first / bad token / too many new accounts from this address
  version @3;              # protocol version mismatch
  unknownGame @4;
  notFound @5;             # room, file, score table
  full @6;                 # room full, storage quota
  forbidden @7;            # not the host, not your seat, wrong password, not allowed now
  tooLarge @8;             # size limit
  rateLimited @9;
  invalid @10;             # refused by the rules (name, seat count, a game module's check)
}

# ---------------------------------------------------------------- rooms (online multiplayer)
# A room belongs to one game. Seats 0..maxSeats-1; the creator is the host. The host starts when every
# other seated member is ready; the server deals the seed. A started room relays game messages until
# the host (or the game's module) finishes the round; then the room is a lobby again (rematch).

struct Seat {
  seat @0 :UInt8;
  accountId @1 :UInt32;
  name @2 :Text;
  ready @3 :Bool;
  connected @4 :Bool;      # false: the member dropped out of a started round and may come back
}

struct RoomInfo {
  id @0 :UInt32;
  name @1 :Text;
  host @2 :UInt8;          # the host's seat
  maxSeats @3 :UInt8;
  locked @4 :Bool;         # has a password
  started @5 :Bool;
  round @6 :UInt16;        # rounds started so far
  seats @7 :List(Seat);    # occupied seats only
  options @8 :Data;        # the game's room options (its own schema), set by the host
}

struct ListRooms { req @0 :UInt32; }
struct RoomList { req @0 :UInt32; rooms @1 :List(RoomInfo); }

struct CreateRoom {
  req @0 :UInt32;
  name @1 :Text;           # 1..32 chars
  maxSeats @2 :UInt8;      # within the game module's limits
  password @3 :Text;       # empty = open
  options @4 :Data;
}

struct JoinRoom {
  req @0 :UInt32;
  id @1 :UInt32;
  password @2 :Text;
  seat @3 :Int8 = -1;      # a free seat, or -1 for the first free one
}

struct LeaveRoom {}
struct SetReady { ready @0 :Bool; }
struct SetRoomOptions { options @0 :Data; }    # host, while not started
struct StartRoom { req @0 :UInt32; }            # host, while not started

# To every member after every change (and to a joiner): the room and the receiver's own seat.
struct RoomUpdate { room @0 :RoomInfo; you @1 :UInt8; }

struct RoomClosed { id @0 :UInt32; reason @1 :Text; }   # to members still inside, and to a member who was removed

struct RoomStarted {
  id @0 :UInt32;
  round @1 :UInt16;
  seed @2 :UInt64;         # from the server: every client of the round gets the same
  seats @3 :List(Seat);    # who plays (the seated members at the start)
  options @4 :Data;
  you @5 :UInt8;
  serverTime @6 :Float64;
}

# Ends the running round: the host (or the game's module) sends the result in the game's own schema.
struct FinishRoom { results @0 :Data; }
struct RoomFinished {
  id @0 :UInt32;
  round @1 :UInt16;
  results @2 :Data;
  stopped @3 :Text;        # empty: the game (or the host) ended the round; otherwise why the server
                           # stopped it (its ticks ran over budget: docs/SERVER.md "Tick watchdog")
}

# ---------------------------------------------------------------- relay (inside a started room)

enum Target {
  others @0;               # every other seated member
  all @1;                  # every seated member including the sender
  seat @2;                 # one seat (Relay.seat)
  server @3;               # only the game's server module
}

struct Relay {
  to @0 :Target;
  seat @1 :UInt8;          # for to = seat
  reliable @2 :Bool = true;   # false: may be lost or overtaken (a datagram over WebTransport)
  data @3 :Data;           # a message of the game's own schema
}

struct Relayed {
  from @0 :UInt8;          # sender's seat; 255 = the game's server module
  seq @1 :UInt32;          # per room, increasing: the server's order of all relayed messages
  data @2 :Data;
  serverTime @3 :Float64;
}

# ---------------------------------------------------------------- storage (the player's files)
# Per account and game: what the original kept on disk (saves, own levels, warriors).
# Names: [A-Za-z0-9._-]{1,64}. Limits in docs/SERVER.md.

struct FileInfo { name @0 :Text; size @1 :UInt32; modified @2 :Float64; }

struct StorageGet { req @0 :UInt32; name @1 :Text; }
struct StoragePut { req @0 :UInt32; name @1 :Text; data @2 :Data; }
struct StorageDelete { req @0 :UInt32; name @1 :Text; }
struct StorageList { req @0 :UInt32; prefix @1 :Text; }

struct StorageReply {
  req @0 :UInt32;
  union {
    file :group { info @1 :FileInfo; data @2 :Data; }   # StorageGet
    missing @3 :Text;                                   # StorageGet / StorageDelete of a file that does not exist
    done @4 :FileInfo;                                  # StoragePut / StorageDelete
    files @5 :List(FileInfo);                           # StorageList, sorted by name
  }
}

# ---------------------------------------------------------------- score tables (shared by everyone)
# Per game, declared by the game's module: what the original kept in a score file shared by every
# user of the machine. The module checks each entry.

struct ScoreEntry {
  rank @0 :UInt16;         # 1 = best
  score @1 :Int64;
  name @2 :Text;           # as shown in the original's table (the module may require a format)
  accountId @3 :UInt32;
  time @4 :Float64;        # ms since the epoch, when it was entered
  detail @5 :Data;         # the rest of the original's record, in the game's own schema
}

struct ScoreSubmit {
  req @0 :UInt32;
  table @1 :Text;
  score @2 :Int64;
  name @3 :Text;
  detail @4 :Data;
}

struct ScoreRequest { req @0 :UInt32; table @1 :Text; limit @2 :UInt16; }

struct ScoreTable {
  req @0 :UInt32;
  table @1 :Text;
  entries @2 :List(ScoreEntry);   # best first
  rank @3 :Int32;          # after ScoreSubmit: the new entry's rank, 0 = did not make the table
}

# ---------------------------------------------------------------- envelope

struct Envelope {
  union {
    hello @0 :Hello;
    welcome @1 :Welcome;
    ping @2 :Ping;
    pong @3 :Pong;
    error @4 :ErrorMsg;

    listRooms @5 :ListRooms;
    roomList @6 :RoomList;
    createRoom @7 :CreateRoom;
    joinRoom @8 :JoinRoom;
    leaveRoom @9 :LeaveRoom;
    setReady @10 :SetReady;
    setRoomOptions @11 :SetRoomOptions;
    startRoom @12 :StartRoom;
    roomUpdate @13 :RoomUpdate;
    roomClosed @14 :RoomClosed;
    roomStarted @15 :RoomStarted;
    finishRoom @16 :FinishRoom;
    roomFinished @17 :RoomFinished;

    relay @18 :Relay;
    relayed @19 :Relayed;

    storageGet @20 :StorageGet;
    storagePut @21 :StoragePut;
    storageDelete @22 :StorageDelete;
    storageList @23 :StorageList;
    storageReply @24 :StorageReply;

    scoreSubmit @25 :ScoreSubmit;
    scoreRequest @26 :ScoreRequest;
    scoreTable @27 :ScoreTable;

    presence @28 :Presence;
  }
}
