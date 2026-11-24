@0x971a7342b462aefc;
# OpenClonk online (web/games/openclonk): the original's network game in lockstep, with the site's server as its
# host in central mode (C4GameControlNetwork, CNM_Central). Every browser runs the same simulation from the round's
# seed. Each sends its control for every control tick (C4GameControlPacket: a C4Control in the original's
# StdCompiler binary form) to the server module (server/.../games/openclonk/OpenclonkModule.java), which does what
# the original's host does in C4GameControlNetwork::PackCompleteCtrl: it waits for the control of every activated
# seat for the tick and sends everyone the tick's complete control, in client ID order (seat order). Every browser
# executes it at the tick's frame (tick × ControlRate). The browsers send their sync checks (C4ControlSyncCheck,
# every C4SyncCheckRate = 100 frames); the module compares them and ends the round at the first frame where they
# differ, and it ends the round with the evaluation only when every remaining seat reports the same.
#
# The server is a dedicated host (C4ClientIDHost = 0, without players of its own): a seat's client is client ID
# seat + 1 (C4ClientIDStart = 1). What the original's host issues about clients (C4ControlClientJoin,
# C4ControlClientUpdate, C4ControlClientRemove) the module issues as seat events in the ticks. The browsers
# execute a seat's control as that client's (C4ControlPacket::iByClient = seat + 1) and drop packets in it that
# claim another client: only the module's events act as the host.
# The core carries these messages as Data.

using Java = import "/capnp/java.capnp";
$Java.package("net.slop.freegames.games.openclonk");
$Java.outerClassname("OpenclonkProto");

# Room options (CreateRoom, SetRoomOptions): what the original's host sets in its lobby (C4GameParameters,
# Config.Network).
struct Options {
  scenario @0 :Text;       # the scenario as a path in the content, "Missions.ocf/AcidDrilling.ocs"
                           # (C4GameParameters::Scenario): folders *.ocf, then the *.ocs; [A-Za-z0-9_.-], at most 128 bytes
  controlRate @1 :UInt8;   # frames per control tick (C4GameParameters::ControlRate, 1..C4MaxControlRate = 20);
                           # 0: Config.Network.ControlRate's default, 3. A frame is 28 ms (iGameTickDelay)
  maxPlayers @2 :UInt16;   # players in the round (C4GameParameters::MaxPlayers, at most 64); 0: the scenario's
                           # Head.MaxPlayer (C4S_MaxPlayerDefault = 12)
  mode @3 :Mode;           # how long a tick waits for a seat's control (Config.Network.ControlMode)
  asyncMaxWait @4 :UInt8;  # mode async: frames a tick waits for a late seat (Config.Network.AsyncMaxWait, 1..36,
                           # one frame = 1000 / 38 ms, iTargetFPS); 0: the default, 2
}

# C4GameControlNetworkMode, as the host runs it.
enum Mode {
  central @0;  # CNM_Central: a tick waits for every activated seat (CNM_Decentral, the original's default, packs the
               # same control in the same order, at every client instead of the host)
  async @1;    # CNM_Async: a tick waits at most asyncMaxWait frames for a late seat; its control goes into a later tick
}

# Every game message (Relay.data / Relayed.data).
struct Msg {
  union {
    control @0 :Control;            # a browser to the server (Target.server): its control for a control tick
    tick @1 :Tick;                  # the server to all: a control tick's complete control
    syncCheck @2 :SyncCheck;        # a browser to the server: its sync check of a frame
    desync @3 :Desync;              # the server to all: two sync checks of a frame differ; the round ends
    roundResults @4 :RoundResults;  # a browser to the server: the round's evaluation (C4Game::Evaluate)
    history @5 :History;            # the server to a seat that came back: the ticks so far
  }
}

# C4GameControlPacket as a client sends it to the host (C4GameControlNetwork::DoInput).
struct Control {
  tick @0 :UInt32;  # iCtrlTick: the control tick it is for (iControlSent + 1); a seat's ticks only increase, and are at
                    # most 20 ahead of the last complete tick (C4MaxPreSend = 15 frames ahead, and the tick in work)
  ctrl @1 :Data;    # its C4Control (Ctrl) in StdCompilerBinWrite form, at most 32 KiB (C4ControlJoinPlayer::Strip
                    # keeps a player file with its BigIcon of C4NetResMaxBigicon = 20 KB within it); empty: no input,
                    # still sent for every tick (the tick waits for it)
}

# The complete control of a control tick (C4GameControlPacket with C4ClientIDAll, from PackCompleteCtrl), executed at
# frame tick × ControlRate.
struct Tick {
  tick @0 :UInt32;                 # ControlTick, from 0; every tick comes, in order
  events @1 :List(SeatEvent);      # the host's control first (C4ClientIDHost = 0 is first in client ID order)
  controls @2 :List(SeatControl);  # then the seats' control, by seat (client ID order); seats without input are left out
}

# One seat's control in a tick.
struct SeatControl {
  seat @0 :UInt8;   # whose: its packets execute as client seat + 1's
  tick @1 :UInt32;  # the tick the seat sent it for: below Tick.tick when it came late (async mode, a seat back after a
                    # lost connection), as the original's host packs a client's late control into the next tick
  ctrl @2 :Data;
}

# What the host does to a seat's client, as control of a tick.
struct SeatEvent {
  seat @0 :UInt8;
  kind @1 :SeatEventKind;
}

enum SeatEventKind {
  join @0;        # C4ControlClientJoin: the seat's client is in the game (every seat of the round, in tick 0)
  deactivate @1;  # C4ControlClientUpdate CUT_Activate 0: its connection dropped; ticks no longer wait for it
  activate @2;    # C4ControlClientUpdate CUT_Activate 1: it is back and sends control again
  remove @3;      # C4ControlClientRemove: it left the round; its players are removed (Players.RemoveAtClient(id, true))
}

# C4ControlSyncCheck (C4ControlSyncCheck::Set) after every C4SyncCheckRate = 100 frames (Frame is a multiple of 100).
struct SyncCheck {
  frame @0 :Int32;                   # Frame: Game.FrameCounter
  controlTick @1 :Int32;             # ControlTick
  randomCount @2 :Int32;             # RandomCount: calls of the synchronized random generator
  allCrewPosX @3 :Int32;             # AllCrewPosX: every crew member's x summed (fixtoi(fix_x, 100))
  pxsCount @4 :Int32;                # PXSCount: loose material pixels (PXS.Count)
  massMoverIndex @5 :Int32;          # MassMoverIndex: MassMover.CreatePtr
  objectCount @6 :Int32;             # ObjectCount: Objects.ObjectCount()
  objectEnumerationIndex @7 :Int32;  # ObjectEnumerationIndex: C4PropListNumbered::GetEnumerationIndex()
  sectShapeSum @8 :Int32;            # SectShapeSum: Objects.Sectors.getShapeSum()
  hash @9 :UInt64;                   # the port's own, optional: a hash of more of the state (0: none)
}

# The sync checks of a frame differ ("Network: Synchronization loss!", C4ControlSyncCheck::Execute).
struct Desync {
  frame @0 :Int32;
  seat @1 :UInt8;          # the seat whose check of the frame came first
  check @2 :SyncCheck;
  other @3 :UInt8;         # the seat whose check differs from it
  otherCheck @4 :SyncCheck;
}

# C4RoundResults as C4Game::Evaluate leaves it (a round without league).
struct RoundResults {
  frame @0 :Int32;                  # Game.FrameCounter at the evaluation
  playingTime @1 :UInt32;           # PlayingTime: Game.Time, in seconds
  goals @2 :List(Text);             # Goals: the goals' IDs (C4ID), at most 64 of at most 64 bytes
  fulfilledGoals @3 :List(Text);    # FulfilledGoals
  players @4 :List(PlayerResult);   # PlayerInfos, at most 64
}

# C4RoundResultsPlayer, and the player's fate from its C4PlayerInfo.
struct PlayerResult {
  id @0 :Int32;                 # ID: the player's C4PlayerInfo ID
  seat @1 :UInt8;               # the seat of the player's client; 255: none (a script player)
  name @2 :Text;                # C4PlayerInfo::GetName, at most 64 bytes
  won @3 :Bool;                 # PIF_Won: the player, or its team, won (C4PlayerInfo::HasTeamWon)
  totalPlayingTime @4 :UInt32;  # TotalPlayingTime, in seconds
  scoreOld @5 :Int32;           # SettlementScoreOld (-1: unknown)
  scoreNew @6 :Int32;           # SettlementScoreNew (-1: unknown)
}

# The ticks so far, for a seat that came back after a lost connection or a reloaded page (in messages of at most
# 48 KiB): it executes them from the round's start and goes on with the live ticks.
struct History {
  start @0 :UInt32;    # the tick of the first in ticks
  total @1 :UInt32;    # ticks so far: the next live Tick is this one
  resume @2 :UInt32;   # the first tick the seat may send control for (its control for the ticks before reached the server)
  ticks @3 :List(Tick);
}

# RoomFinished.results, from the server module.
struct Results {
  reason @0 :Reason;
  frame @1 :Int32;           # evaluated, disagreed: the frame of the (first) evaluation; desync: the frame whose checks
                             # differ; limit: the frame of the last tick
  results @2 :RoundResults;  # evaluated: what every remaining seat reported
}

enum Reason {
  evaluated @0;  # every seat still in the round reported the same evaluation
  disagreed @1;  # the seats' evaluations differ
  desync @2;     # their sync checks of a frame differ (Desync)
  limit @3;      # the round reached the server's limit of the ticks it keeps for seats that come back
}
