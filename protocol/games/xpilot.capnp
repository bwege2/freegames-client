@0xd8c54fd56e55d950;
# XPilot NG 4.7.3 online (web/games/xpilot): the original's client/server protocol (src/common/packet.h;
# src/server/netserver.c sends, src/client/netclient.c receives and sends) in Cap'n Proto. The server
# module (server/.../games/xpilot/) runs the original server's world; each seat runs the X11 client.
# Every game message (Relay.data / Relayed.data) is one packed `Msg`; the room options are `Options`
# and the rank table's ScoreEntry.detail is `Rank`. Notes: re/xpilot/NOTES.md.
#
# ---------------------------------------------------------------- version
# This port speaks one protocol version: 4.F.1.5 (POLYGON_VERSION 0x4F15 in pack.h, the X11 client's
# default `protocolVersion`, default.c). netserver.c Feature_init gives such a client every feature:
# F_POLY, F_TEAMRADAR, F_SEPARATEPHASING, F_EXPLICITSELF, F_ASTEROID, F_FASTRADAR, F_FLOATSCORE,
# F_TEMPWORM, F_SHOW_APPEARING, F_SENDTEAM, F_CUMULATIVETURN, F_BALLSTYLE, F_POLYSTYLE. So: polygon map
# setup, separate phasing bit, PKT_PLAYER's "himself", asteroids, fast radar, scores in hundredths with
# alliance char, PKT_APPEARING, PKT_TEAM, cumulative pointer moves, ball styles and PKT_POLYSTYLE.
# The old-protocol variants (0x4203..0x4501: block-map setup, PKT_RADAR, 16-bit scores, ...) are not
# carried. A block map (.xp, lib/maps/teamcup.xp) reaches a 4.F.1.5 client only as polygons, the way
# the original server serves it with the option polygonMode (xpmap.c).
#
# ---------------------------------------------------------------- what the core replaces (dropped)
# * The UDP reliability layer: PKT_RELIABLE (the reliable data stream piggybacked on frame datagrams,
#   with offsets and retransmission, netserver.c Send_reliable) and PKT_ACK (the client's byte-position
#   ack of that stream, Receive_ack, with its RTT estimator). Our reliable relay delivers in order, so
#   the stream's contents travel as `Msg.reliable` lists; frames travel unreliable.
# * The handshakes: PKT_MAGIC (the connection's magic word after PKT_VERIFY), the version magic in every
#   contact pack (MAGIC_WORD 0xF4ED, MIN/MAX_CLIENT_VERSION, the compatibility retry with 0x4501), and
#   PKT_SUCCESS/PKT_FAILURE as packets of their own (they remain values of `Reply.result`).
# * The contact socket (contact.c, port 15345): ENTER_GAME_pack, ENTER_QUEUE_pack and the waiting queue
#   with its queue position, REPORT_STATUS_pack, OPTION_LIST_pack, CONTACT_pack, and the owner-only
#   packs (LOCK_GAME, MESSAGE, SHUTDOWN, KICK_PLAYER, OPTION_TUNE, CREDENTIALS). Rooms replace them:
#   the room list is the server list, JoinRoom (a free seat) is entering the game, the room's options
#   are the server's options (`Options`), and in-game commands (/set, /kick, ... as PKT_TALK) remain.
#   What ENTER_QUEUE_pack carried about the player (nick, user, display, host, team) is in `Verify`.
# * The meta server (metaserver.c, meta.c) and the per-connection login port: the core's room list and
#   connection.
# * Setup's transfer bookkeeping: setup_size, map_data_len and map_order (lists carry their lengths).
#
# ---------------------------------------------------------------- message flow (netserver.c states)
#   JoinRoom/RoomStarted (contact + queue)
#   client  [verify]                                   PKT_VERIFY                (CONN_LISTENING)
#   server  reliable [reply(PKT_VERIFY, PKT_SUCCESS)]  then setup                (CONN_SETUP)
#   client  [shape, play, power.., display, modifierBank x4, requestAudio, asyncFps]   (Net_start)
#   server  reliable [reply(PKT_PLAY, PKT_SUCCESS), player, score, base, ..., message]  (Handle_login)
#   server  frame per frame (unreliable), then that frame's reliable data (reliable)  (CONN_PLAYING)
#   client  [keyboard, pointerMove.., talk, mapAcks..] per flush of its send buffer
#   client  [quit] or LeaveRoom; server reliable [quit(reason)] when it drops a player
# The original piggybacks a frame's reliable data after PKT_END, and the client handles it after the
# frame's packets (netclient.c Net_packet), so the module sends a frame's `reliable` after its `frame`.
#
# ---------------------------------------------------------------- conventions
# * One struct per packet, named after it; field names are the names netserver.c's Send_* functions
#   send (their arguments or the members they read), in camelCase.
# * Integer widths are the wire's: %c UInt8 (Int8 where the receiver reads it signed), %hd Int16,
#   %hu UInt16, %d/%ld Int32, %u UInt32. Values are exactly what the original puts on the wire
#   (scaled, rounded, bit-packed as it does), so a port's Receive_*/Handle_* code stays 1:1.
# * Units: positions in world pixels (1 pixel = 64 clicks, CLICK_SHIFT 6, click.h; y grows upwards),
#   except where a comment says block or radar coordinates; directions in RES = 128 steps per circle
#   (0 = east, counter-clockwise; const.h); times in server frames unless a comment says seconds.
# * Strings are the original's 8-bit strings (ISO 8859-1) as Text, one character per original byte.
#   A %s field holds at most 79 characters (MAX_CHARS 80 with its NUL), a %S field at most 255
#   (MSG_LEN 256); tighter bounds are noted. The server module drops a client message that breaks a
#   bound or holds a character above U+00FF.
# * Every list's bound is written at the list and comes from the original's limits; most per-frame
#   lists are bounded by what fits in the server's 4096-byte frame buffer (SERVER_SEND_SIZE, net.h):
#   4082 bytes between PKT_START (9) and PKT_END (5), divided by the packet's size.

using Java = import "/capnp/java.capnp";
$Java.package("net.slop.freegames.games.xpilot.proto");
$Java.outerClassname("XpilotProto");

# Every game message (Relay.data / Relayed.data).
struct Msg {
  union {
    client @0 :List(ClientPacket);  # a seat to the server (Target.server), reliable: one flush of the
                                    # client's send buffer (wbuf, netclient.c Net_flush/Send_keyboard),
                                    # at most 341 packets (its 1024-byte datagram, CLIENT_SEND_SIZE, of
                                    # 3-byte PKT_POINTER_MOVEs); at most one `keyboard` (more is
                                    # netserver.c Receive_keyboard's "no macros")
    setup @1 :Setup;                # the server to a seat, reliable, once after `verify` succeeded
    frame @2 :Frame;                # the server to a seat, unreliable, one per frame it sends that seat
    reliable @3 :List(Reliable);    # the server to a seat, reliable: the reliable data stream (connp->c)
                                    # since the last one, in order; at most 17066 (its 50 KiB buffer,
                                    # MAX_SOCKBUF_SIZE, of 3-byte PKT_LEAVEs)
  }
}

# ================================================================ client to server

# One packet the client sends (netclient.c Send_*, Net_verify, Net_start, Net_cleanup), received by
# netserver.c Receive_* (its login_receive and playing_receive tables).
struct ClientPacket {
  union {
    verify @0 :Verify;
    play @1 :Void;                  # PKT_PLAY: start playing (Net_start; netserver.c Receive_play)
    quit @2 :Void;                  # PKT_QUIT: the client leaves (Net_cleanup; Receive_quit)
    keyboard @3 :Keyboard;
    power @4 :Power;                # PKT_POWER
    powerS @5 :Power;               # PKT_POWER_S (the second, swappable setting)
    turnspeed @6 :Power;            # PKT_TURNSPEED
    turnspeedS @7 :Power;           # PKT_TURNSPEED_S
    turnresistance @8 :Power;       # PKT_TURNRESISTANCE
    turnresistanceS @9 :Power;      # PKT_TURNRESISTANCE_S
    ackCannon @10 :MapAck;          # PKT_ACK_CANNON (answers Frame.cannons)
    ackFuel @11 :MapAck;            # PKT_ACK_FUEL (answers Frame.fuels)
    ackTarget @12 :MapAck;          # PKT_ACK_TARGET (answers Frame.targets)
    ackPolystyle @13 :MapAck;       # PKT_ACK_POLYSTYLE (answers Frame.polystyles)
    talk @14 :Talk;
    display @15 :Display;
    modifierBank @16 :ModifierBank;
    motd @17 :MotdRequest;
    shape @18 :Shape;
    pointerMove @19 :PointerMove;
    requestAudio @20 :RequestAudio;
    asyncFps @21 :AsyncFps;
  }
}

# PKT_VERIFY (Net_verify "%c%s%s%s"; netserver.c Handle_listening) together with what the contact pack
# ENTER_QUEUE_pack told the server before (contact.c Queue_player: "%s%s%s%d" nick, disp, host, team;
# its header carried user). The server fixes them as the original does (checknames.c Fix_*_name,
# netserver.c LegalizeName/LegalizeHost) and refuses with Reply.result E_* as contact.c Check_names did.
struct Verify {
  user @0 :Text;      # user_name, the login name; at most 15 characters (MAX_NAME_LEN 16)
  nick @1 :Text;      # nick_name, the player's name in the game; at most 15, starts upper case
  disp @2 :Text;      # disp_name, the X display; at most 79 (MAX_DISP_LEN 80)
  host @3 :Text;      # host_name, the client's host; at most 63 (MAX_HOST_LEN 64)
  team @4 :UInt16;    # the team asked for: 0..9 (MAX_TEAMS 10), or 65535 = TEAM_NOT_SET
}

# PKT_KEYBOARD (Send_keyboard "%c%ld" + KEYBOARD_SIZE bytes; Receive_keyboard): the state of every key.
struct Keyboard {
  change @0 :Int32;      # last_keyboard_change: the key change id, increasing; the server acks it
                         # in Start.lastKeyChange and ignores a change it already has
  keyv @1 :List(Bool);   # exactly 72 (KEYBOARD_SIZE 9 bytes = NUM_KEYS, keys.h): keyv[k] is key k
                         # (KEY_SHIELD = 5, KEY_FIRE_SHOT = 6, KEY_THRUST = 30, ...); the same bits as
                         # the original's bit vector (bit.h BITV_SET: byte k/8, bit k%8)
}

# PKT_POWER, PKT_POWER_S, PKT_TURNSPEED, PKT_TURNSPEED_S, PKT_TURNRESISTANCE, PKT_TURNRESISTANCE_S
# (Send_power ... "%c%hd"; netserver.c Receive_power).
struct Power {
  value @0 :Int16;   # the setting times 256, truncated: (int)(power * 256.0); the server limits it to
                     # power 5..55, turnspeed 0..64, turnresistance 0..1 (const.h MIN/MAX_PLAYER_*)
}

# PKT_ACK_CANNON, PKT_ACK_FUEL, PKT_ACK_TARGET, PKT_ACK_POLYSTYLE (netclient.c Receive_cannon/fuel/
# target/polystyle "%c%ld%hu"; netserver.c Receive_ack_*): the client has seen a map object's state.
# The client sends these only while its send buffer holds less than 500 bytes (MAX_MAP_ACK_LEN).
struct MapAck {
  loopsAck @0 :Int32;   # loops_ack: the frame (Start.frameLoops) whose packet it acknowledges
  num @1 :UInt16;       # the cannon, fuel station, target or polygon index
}

# PKT_TALK (Send_talk "%c%ld%s"; netserver.c Receive_talk): a message, or a command when it starts
# with '/' (command.c Handle_player_command). Resent every TALK_RETRY (2) frames until TalkAck.
struct Talk {
  seq @0 :Int32;   # talk_pending: the talk sequence number, increasing
  str @1 :Text;    # at most 79 characters
}

# PKT_DISPLAY (Send_display "%c%hd%hd%c%c"; netserver.c Receive_display): the view the client wants.
struct Display {
  width @0 :Int16;         # view width in pixels; the server limits it to 384..1024 (MIN/MAX_VIEW_SIZE)
  height @1 :Int16;        # view height in pixels, likewise
  debrisColors @2 :UInt8;  # num_spark_colors: how many debris colours the client shows
  sparkRand @3 :UInt8;     # spark_rand: debris shown with probability sparkRand/128 (0..128)
}

# PKT_MODIFIERBANK (Send_modifier_bank "%c%c%s"; netserver.c Receive_modifier_bank).
struct ModifierBank {
  bank @0 :UInt8;   # 0..3 (NUM_MODBANKS 4)
  str @1 :Text;     # the bank's modifiers as typed (modBankStr), at most 79 characters
}

# PKT_MOTD from the client (Net_ask_for_motd "%c%ld%ld"; netserver.c Receive_motd): send me the
# message of the day from offset on.
struct MotdRequest {
  offset @0 :Int32;   # byte offset into the MOTD
  nbytes @1 :Int32;   # how many bytes at most (the client asks MAX_MOTD_SIZE, 30 KiB)
}

# PKT_SHAPE (Send_shape "%c%S" "%S"; netserver.c Receive_shape): the ship shape, before PKT_PLAY.
struct Shape {
  shape @0 :Text;   # the shape string, e.g. "(SH:)(EN: -8,0)(MG: 14,0)(LL: -8,8)(RL: -8,-8)(MR: 14,0)",
                    # shipshape.c Convert_ship_2_string version 0x3200; at most 255 characters
  ext @1 :Text;     # its extension part; at most 255 characters
}

# PKT_POINTER_MOVE (Send_pointer_move "%c%hd"; netserver.c Receive_pointer_move): mouse turning.
struct PointerMove {
  movement @0 :Int16;   # the cumulative mouse movement (since 4.F.1.3, F_CUMULATIVETURN): the client
                        # sends its running total, the server turns by the difference to the last
}

# PKT_REQUEST_AUDIO (Send_audio_request "%c%c"; netserver.c Receive_audio_request).
struct RequestAudio {
  on @0 :UInt8;   # 1: send me Frame.audio; 0: do not
}

# PKT_ASYNC_FPS (Send_fps_request "%c%c"; netserver.c Receive_fps_request): the client's maxFPS.
struct AsyncFps {
  fps @0 :UInt8;   # 1..255 frames per second (0 counts as 1); the server sends every n-th frame
}

# ================================================================ server to client: setup

# The setup the client gets once before it plays (netserver.c Handle_setup, the polygon branch
# "%ld%ld%hd%hd%hd%hd%s%s%S" of setup_t, then Setup->map_data from walls.c Polys_to_client; the client
# reads it in netclient.c Net_setup and client.c parse_styles/init_polymap). It is one message: the
# largest map in lib/maps (tourmination.xp2) is 1459 polygons, far below the transport's 1 MiB.
struct Setup {
  mode @0 :Int32;           # world->rules->mode: the rule bits (rules.h: CRASH_WITH_PLAYER, ...,
                            # TEAM_PLAY, LIMITED_LIVES, TIMING, ...)
  lives @1 :Int16;          # world->rules->lives: lives per round with LIMITED_LIVES
  width @2 :Int16;          # world->width: map width in pixels
  height @3 :Int16;         # world->height: map height in pixels
  framesPerSecond @4 :Int16;  # options.framesPerSecond (the client's FPS)
  name @5 :Text;            # world->name, the map name; at most 79 characters
  author @6 :Text;          # world->author; at most 79 characters
  dataUrl @7 :Text;         # options.dataURL, where the client may fetch the map's textures; at most 255
  pstyles @8 :List(PolygonStyle);  # num_pstyles: at most 255 (one byte; pstyles[256], walls.h)
  estyles @9 :List(EdgeStyle);     # num_estyles: at most 255
  bstyles @10 :List(BitmapStyle);  # num_bstyles: at most 255
  polygons @11 :List(Polygon);     # num_polys: at most 65535 (two bytes)
  bases @12 :List(MapBase);        # Num_bases(): at most 255 (one byte)
  fuels @13 :List(MapPos);         # Num_fuels(): fuel stations, at most 65535 (two bytes)
  checks @14 :List(MapPos);        # world->NumChecks: race checkpoints in order, at most 255 (one byte)
}

# pstyles[i] (walls.h struct polystyle) as Polys_to_client stores it.
struct PolygonStyle {
  color @0 :UInt32;     # 0xRRGGBB
  textureId @1 :UInt8;  # texture_id: index into Setup.bstyles
  defedgeId @2 :UInt8;  # defedge_id: the default edge style, index into Setup.estyles
  flags @3 :UInt8;      # STYLE_FILLED 1, STYLE_TEXTURED 2, STYLE_INVISIBLE 4, STYLE_INVISIBLE_RADAR 8
}

# estyles[i] (walls.h struct edgestyle).
struct EdgeStyle {
  width @0 :Int8;       # line width in pixels; -1: the edge is not drawn
  color @1 :UInt32;     # 0xRRGGBB
  style @2 :UInt8;      # X11 line style: 0 LineSolid, 1 LineOnOffDash, 2 LineDoubleDash
}

# bstyles[i] (walls.h struct bmpstyle): a texture image.
struct BitmapStyle {
  filename @0 :Text;    # e.g. "rock4.ppm"; at most 31 characters (filename[32]); the client keeps 29
  flags @1 :UInt8;
}

# pdata[i] (walls.h poly_t) as Polys_to_client sends it: the start point and the edges, in pixels.
struct Polygon {
  style @0 :UInt8;                    # index into Setup.pstyles
  x @1 :UInt16;                       # pos.cx >> CLICK_SHIFT: the first point
  y @2 :UInt16;                       # pos.cy >> CLICK_SHIFT
  edges @3 :List(Edge);               # num_points - 1 offsets from point to point (the closing edge
                                      # back to the first point is implied); at most 65534 (num_points
                                      # is two bytes; lib/maps has at most 344)
  estyles @4 :List(EdgeStyleChange);  # where the edge style changes (num_echanges = 2 x this length);
                                      # at most 32767 (num_echanges is two bytes)
}

# One edge of a polygon: (dx >> CLICK_SHIFT) - (startx >> CLICK_SHIFT), the same for y.
struct Edge {
  dx @0 :Int16;   # pixels
  dy @1 :Int16;   # pixels
}

# A pair of estyleptr (polygon.c P_offset): from edge `point` on, edges use estyle `style`.
struct EdgeStyleChange {
  point @0 :UInt16;   # edge index (0 = the edge from the first point)
  style @1 :UInt16;   # index into Setup.estyles
}

# A base (home base) in Polys_to_client.
struct MapBase {
  team @0 :UInt8;   # 0..9; 0 also when the base has no team (TEAM_NOT_SET)
  x @1 :UInt16;     # pixels, the base's centre
  y @2 :UInt16;
  dir @3 :UInt8;    # the direction the base faces, 0..127 (the client draws it as up/right/down/left)
}

# A fuel station's or checkpoint's position in Polys_to_client.
struct MapPos {
  x @0 :UInt16;   # pixels
  y @1 :UInt16;
}

# ================================================================ server to client: frames

# One frame for one player (frame.c Frame_update: Send_start_of_frame ... Send_end_of_frame; the client
# reads it in netclient.c Net_packet and paints at PKT_END, client.c Handle_end). Fields are in the
# order the original sends its packets; within a list the order is the original's (objects and
# players in the frame's shuffled order). A null struct field means the packet was not in the frame.
# When `damaged` is set the original sends only start, timeLeft, damaged, audio and end.
struct Frame {
  start @0 :Start;                 # PKT_START, always
  timeLeft @1 :TimeLeft;           # PKT_TIME_LEFT: when the time left changed, or with maxRoundTime
  damaged @2 :Damaged;             # PKT_DAMAGED: the player is blinded by an ECM
  self @3 :Self;                   # PKT_SELF (Frame_status): the watched player (yourself, or the
                                   # player you look through while dead, paused or waiting)
  selfItems @4 :SelfItems;         # PKT_SELF_ITEMS: only when the player owns items
  modifiers @5 :Modifiers;         # PKT_MODIFIERS: with every `self`
  thrusttime @6 :Thrusttime;       # PKT_THRUSTTIME: while emergency thrust is on
  shieldtime @7 :Shieldtime;       # PKT_SHIELDTIME: while the emergency shield is on
  destruct @8 :Destruct;           # PKT_DESTRUCT: while self-destructing
  phasingtime @9 :Phasingtime;     # PKT_PHASINGTIME: while phasing
  shutdown @10 :Shutdown;          # PKT_SHUTDOWN: while the server shuts down (/shutdown, gameDuration)
  targets @11 :List(Target);       # PKT_TARGET (Frame_map): not sent to a 4.F.1.5 client (Send_target
                                   # returns 0 for F_POLY), kept for netclient.c Receive_target; at most
                                   # 285 (Frame_map's 2000-byte budget / 7 bytes)
  cannons @12 :List(Cannon);       # PKT_CANNON: likewise not sent to 4.F.1.5 (Send_cannon); at most 400
                                   # (2000 / 5)
  fuels @13 :List(Fuel);           # PKT_FUEL (Frame_map): fuel stations near the view whose amount the
                                   # client has not acknowledged (ClientPacket.ackFuel); at most 400
  polystyles @14 :List(Polystyle); # PKT_POLYSTYLE (Frame_map): polygons whose style changed (destroyed
                                   # cannons, targets ...) until acknowledged; at most 400
  wreckages @15 :List(Wreckage);   # PKT_WRECKAGE (Frame_shots); at most 510 (4082 / 8)
  asteroids @16 :List(Asteroid);   # PKT_ASTEROID; at most 583 (4082 / 7)
  missiles @17 :List(Missile);     # PKT_MISSILE: torpedoes, heat-seekers, smart missiles; at most 583
  balls @18 :List(Ball);           # PKT_BALL; at most 510
  mines @19 :List(Mine);           # PKT_MINE; at most 510
  items @20 :List(Item);           # PKT_ITEM; at most 680 (4082 / 6)
  lasers @21 :List(Laser);         # PKT_LASER: laser pulses; at most 453 (4082 / 9)
  ecms @22 :List(Ecm);             # PKT_ECM (Frame_ships); at most 583
  trans @23 :List(Trans);          # PKT_TRANS: transporter beams; at most 453
  connectors @24 :List(Connector); # PKT_CONNECTOR: cannon and player tractor beams (3 per target ship),
                                   # ball connectors, in that order; at most 408 (4082 / 10)
  paused @25 :List(Paused);        # PKT_PAUSED: paused players' bases in view; at most 583
  appearing @26 :List(Appearing);  # PKT_APPEARING: players about to appear on their base; at most 453
  ships @27 :List(Ship);           # PKT_SHIP: ships in view; at most 453
  refuels @28 :List(Refuel);       # PKT_REFUEL: refuelling and repair beams; at most 453
  radar @29 :List(Radar);          # PKT_RADAR: not sent to 4.F.1.5 (F_FASTRADAR gets `fastradar`), kept
                                   # for Receive_radar; at most 680
  fastradar @30 :List(Fastradar);  # PKT_FASTRADAR (Frame_radar_buffer_send): radar blips in shuffled
                                   # order; at most 255 (its count is one byte)
  loseitem @31 :Loseitem;          # PKT_LOSEITEM (Frame_lose_item_state)
  debris @32 :List(Debris);        # PKT_DEBRIS + type (debris_end), by type; at most 128 (DEBRIS_TYPES)
  fastshots @33 :List(Fastshot);   # PKT_FASTSHOT (fastshot_end), by type; at most 256
  audio @34 :List(Audio);          # PKT_AUDIO (saudio.c sound_play_queued): each sound at most once a
                                   # frame, so at most 83 (MAX_SOUNDS, audio.h)
  eyes @35 :Eyes;                  # PKT_EYES: never sent by the 4.7.3 server (Send_eyes has no caller),
                                   # kept for Receive_eyes
  wormholes @36 :List(Wormhole);   # PKT_WORMHOLE: never sent by the 4.7.3 server (Send_wormhole has no
                                   # caller), kept for Receive_wormhole; at most 816 (4082 / 5)
  rounddelay @37 :Rounddelay;      # PKT_ROUNDDELAY: never sent by the 4.7.3 server, kept for
                                   # Receive_rounddelay
  end @38 :End;                    # PKT_END, always
  packetSize @39 :UInt16;          # the byte length the original's datagram would have (rbuf.len, which
                                   # client.c Handle_self keeps for the packet size meter), at most 4096
}

# PKT_START (Send_start_of_frame "%c%ld%ld"; Receive_start).
struct Start {
  frameLoops @0 :Int32;      # frame_loops: this frame's number, increasing (starts at 1)
  lastKeyChange @1 :Int32;   # last_key_change: the last Keyboard.change the server has
}

# PKT_END (Send_end_of_frame "%c%ld"; Receive_end).
struct End {
  frameLoops @0 :Int32;      # the same as Start.frameLoops
}

# PKT_TIME_LEFT (Send_time_left "%c%ld").
struct TimeLeft {
  sec @0 :Int32;   # seconds left of the game (gameDuration) or of the round (maxRoundTime)
}

# PKT_DAMAGED (Send_damaged "%c%c").
struct Damaged {
  damaged @0 :UInt8;   # pl->damaged: frames the player stays blinded
}

# PKT_SELF (Send_self, "%c" "%hd%hd%hd%hd%c" "%c%c%c" "%hd%hd%c%c" "%c%hd%hd" "%hd%hd%c" "%c%c";
# netclient.c Receive_self): the HUD data of the watched player.
struct Self {
  x @0 :Int16;               # CLICK_TO_PIXEL(pl->pos.cx): position, pixels
  y @1 :Int16;
  vx @2 :Int16;              # (int) pl->vel.x: velocity, pixels per game tick, truncated
  vy @3 :Int16;
  dir @4 :UInt8;             # pl->dir: heading, 0..127
  power @5 :UInt8;           # (int)(pl->power + 0.5)
  turnspeed @6 :UInt8;       # (int)(pl->turnspeed + 0.5)
  turnresistance @7 :UInt8;  # (int)(pl->turnresistance * 255.0 + 0.5)
  lockId @8 :Int16;          # lock_id: the locked player's id, -1 = none (NO_ID)
  lockDist @9 :Int16;        # lock_dist: distance to it, pixels (0 when not visible)
  lockDir @10 :UInt8;        # lock_dir: direction to it, 0..127
  check @11 :UInt8;          # pl->check: the next race checkpoint
  fuelCurrent @12 :UInt8;    # pl->fuel.current: the current tank (0 = the ship's own)
  fuelSum @13 :Int16;        # (int)(pl->fuel.sum + 0.5): fuel in all tanks
  fuelMax @14 :Int16;        # (int)(pl->fuel.max + 0.5): capacity of all tanks
  viewWidth @15 :Int16;      # connp->view_width: the view the server uses (Display, limited)
  viewHeight @16 :Int16;     # connp->view_height
  debrisColors @17 :UInt8;   # connp->debris_colors
  status @18 :UInt8;         # pl_old_status: OLD_PLAYING 1, OLD_PAUSE 2, OLD_GAME_OVER 4 (rules.h)
  autopilotlight @19 :UInt8; # 1: show the autopilot light this frame (it blinks)
}

# PKT_SELF_ITEMS (Send_self_items "%c%u" + one byte per set bit; Receive_self_items).
struct SelfItems {
  itemMask @0 :UInt32;      # item_mask: bit i set = the player owns item i (item.h: ITEM_FUEL 0 ...
                            # ITEM_ARMOR 20; NUM_ITEMS 21)
  counts @1 :List(UInt8);   # pl->item[i] for each set bit, lowest bit first; at most 21 (NUM_ITEMS)
}

# PKT_MODIFIERS (Send_modifiers "%c%s"; Receive_modifiers).
struct Modifiers {
  mods @0 :Text;   # modifiers.c Mods_to_string, e.g. "NC V2 X3"; at most 79 characters
}

# PKT_THRUSTTIME (Send_thrusttime "%c%hd%hd").
struct Thrusttime {
  count @0 :Int16;   # (int) pl->emergency_thrust_left, frames
  max @1 :Int16;     # EMERGENCY_THRUST_TIME
}

# PKT_SHIELDTIME (Send_shieldtime "%c%hd%hd").
struct Shieldtime {
  count @0 :Int16;   # (int) pl->emergency_shield_left
  max @1 :Int16;     # EMERGENCY_SHIELD_TIME
}

# PKT_PHASINGTIME (Send_phasingtime "%c%hd%hd").
struct Phasingtime {
  count @0 :Int16;   # (int) pl->phasing_left
  max @1 :Int16;     # PHASING_TIME
}

# PKT_ROUNDDELAY (netclient.c Receive_rounddelay "%c%hd%hd"; no sender in the 4.7.3 server).
struct Rounddelay {
  count @0 :Int16;
  max @1 :Int16;
}

# PKT_DESTRUCT (Send_destruct "%c%hd").
struct Destruct {
  count @0 :Int16;   # (int) pl->self_destruct_count: frames until the ship explodes
}

# PKT_SHUTDOWN (Send_shutdown "%c%hd%hd").
struct Shutdown {
  count @0 :Int16;   # ShutdownServer: frames until the server stops
  delay @1 :Int16;   # ShutdownDelay: the delay asked for, seconds
}

# PKT_TARGET (Send_target "%c%hu%hu%hu"; not sent to 4.F.1.5).
struct Target {
  num @0 :UInt16;         # target index
  deadTicks @1 :UInt16;   # dead_ticks: frames until it comes back (0 = alive)
  damage @2 :UInt16;      # (int)(damage * 256.0)
}

# PKT_CANNON (Send_cannon "%c%hu%hu"; not sent to 4.F.1.5).
struct Cannon {
  num @0 :UInt16;
  deadTicks @1 :UInt16;
}

# PKT_FUEL (Send_fuel "%c%hu%hu").
struct Fuel {
  num @0 :UInt16;    # fuel station index (Setup.fuels)
  fuel @1 :UInt16;   # (int)(fuel + 0.5): fuel in the station (MAX_STATION_FUEL 500)
}

# PKT_POLYSTYLE (Send_polystyle "%c%hu%hu").
struct Polystyle {
  polyind @0 :UInt16;    # polygon index (Setup.polygons)
  newstyle @1 :UInt16;   # its current style, index into Setup.pstyles
}

# PKT_WRECKAGE (Send_wreckage "%c%hd%hd%c%c%c").
struct Wreckage {
  x @0 :Int16;        # pixels
  y @1 :Int16;
  wrtype @2 :UInt8;   # wire_type (wreckshape.h), bit 0x80 set when wreckage kills
                      # (options.wreckageCollisionMayKill)
  size @3 :UInt8;     # wire_size
  rot @4 :UInt8;      # wire_rotation, 0..127
}

# PKT_ASTEROID (Send_asteroid "%c%hd%hd%c%c").
struct Asteroid {
  x @0 :Int16;
  y @1 :Int16;
  typeSize @2 :UInt8;   # type_size: (wire_type & 0x0F) << 4 | (wire_size & 0x0F)
  rot @3 :UInt8;        # wire_rotation, 0..127
}

# PKT_MISSILE (Send_missile "%c%hd%hd%c%c").
struct Missile {
  x @0 :Int16;
  y @1 :Int16;
  len @2 :UInt8;   # length in pixels (MISSILE_LEN 15, or TORPEDO_LEN/SMART_SHOT_LEN/HEAT_SHOT_LEN with
                   # options.distinguishMissiles)
  dir @3 :UInt8;   # missile_dir, 0..127
}

# PKT_BALL (Send_ball "%c%hd%hd%hd%c", with the style since 4.F.1.4).
struct Ball {
  x @0 :Int16;
  y @1 :Int16;
  id @2 :Int16;     # ball->id: the player connected to it, -1 = none
  style @3 :UInt8;  # ball_style (a polygon style index), 0xFF = none (options.ballStyles off)
}

# PKT_MINE (Send_mine "%c%hd%hd%c%hd").
struct Mine {
  x @0 :Int16;
  y @1 :Int16;
  teammine @2 :UInt8;   # laid_by_team: 1 = harmless to this player (own team, owner immune)
  id @3 :Int16;         # the owner when identifyMines and close enough; 0 = unknown; 4096 =
                        # EXPIRED_MINE_ID (an owner who left)
}

# PKT_ITEM (Send_item "%c%hd%hd%c").
struct Item {
  x @0 :Int16;
  y @1 :Int16;
  type @2 :UInt8;   # item_type 0..20 (item.h); a random item shows a new random type every frame
}

# PKT_LASER (Send_laser "%c%c%hd%hd%hd%c").
struct Laser {
  color @0 :UInt8;   # BLUE 2 (harmless to this player) or RED 3
  x @1 :Int16;       # the end of the pulse that is in view
  y @2 :Int16;
  len @3 :Int16;     # pulse_len, pixels
  dir @4 :UInt8;     # from (x, y) along the pulse, 0..127
}

# PKT_ECM (Send_ecm "%c%hd%hd%hd").
struct Ecm {
  x @0 :Int16;
  y @1 :Int16;
  size @2 :Int16;   # ecm->size: the blast's diameter, pixels
}

# PKT_TRANS (Send_trans "%c%hd%hd%hd%hd").
struct Trans {
  x1 @0 :Int16;   # the victim
  y1 @1 :Int16;
  x2 @2 :Int16;   # the player using the transporter
  y2 @3 :Int16;
}

# PKT_CONNECTOR (Send_connector "%c%hd%hd%hd%hd%c").
struct Connector {
  x1 @0 :Int16;        # pos1 (netserver.c Send_connector)
  y1 @1 :Int16;
  x2 @2 :Int16;        # pos2
  y2 @3 :Int16;
  tractor @4 :UInt8;   # 1: a tractor/pressor beam, 0: a ball connector
}

# PKT_PAUSED (Send_paused "%c%hd%hd%hd").
struct Paused {
  x @0 :Int16;       # the paused player's home base
  y @1 :Int16;
  count @2 :Int16;   # (int) pl->pause_count
}

# PKT_APPEARING (Send_appearing "%c%hd%hd%hd%hd", since 4.F.1.2).
struct Appearing {
  x @0 :Int16;       # the player's home base
  y @1 :Int16;
  id @2 :Int16;      # the player
  count @3 :Int16;   # (int)(recovery_count * 10)
}

# PKT_SHIP (Send_ship "%c%hd%hd%hd%c%c").
struct Ship {
  x @0 :Int16;
  y @1 :Int16;
  id @2 :Int16;      # the player
  dir @3 :UInt8;     # 0..127
  flags @4 :UInt8;   # shield 1, cloak 2, emergency shield 4, phased 8, deflector 16
}

# PKT_REFUEL (Send_refuel "%c%hd%hd%hd%hd"): a fuel station to a ship, or a ship to the target it
# repairs (the same packet).
struct Refuel {
  x1 @0 :Int16;   # pos1 (netserver.c Send_refuel)
  y1 @1 :Int16;
  x2 @2 :Int16;   # pos2
  y2 @3 :Int16;
}

# PKT_RADAR (Send_radar "%c%hd%hd%c"; not sent to 4.F.1.5).
struct Radar {
  x @0 :Int16;      # world pixels
  y @1 :Int16;
  size @2 :UInt8;   # blip size, bit 0x80 = teammate (F_TEAMRADAR)
}

# One blip of PKT_FASTRADAR (frame.c Frame_radar_buffer_send packs 3 bytes; netclient.c
# Receive_fastradar unpacks them into these values).
struct Fastradar {
  x @0 :UInt8;      # radar_x = 256 * x / world->width: radar pixels, 0..255
  y @1 :UInt16;     # radar_y = radar_height * y / world->height, radar_height = 256 * height / width;
                    # 0..1023 (10 bits)
  size @2 :UInt8;   # 0..7; bit 0x80: a teammate, ally or own tank, or an asteroid (frame.c Frame_radar)
}

# PKT_LOSEITEM (Send_loseitem "%c%c").
struct Loseitem {
  loseItemIndex @0 :UInt8;   # lose_item: the item the lose-item key would drop
}

# PKT_DEBRIS + type (Send_debris: one byte PKT_DEBRIS + type, a count, then x, y bytes per particle):
# sparks and debris, by colour and screen area (frame.c debris_store).
struct Debris {
  type @0 :UInt8;    # 0..127: color * debris_areas + area, where the view is cut into 256x256-pixel
                     # areas (debris_x_areas = (view_width + 255) >> 8, likewise y)
  xy @1 :List(Xy);   # the particles; at most 255 (debris_store stops at 255)
}

# PKT_FASTSHOT (Send_fastshot "%c%c%c" + x, y bytes per shot): shots, by colour and screen area.
struct Fastshot {
  type @0 :UInt8;    # 0..255: (teamshot ? DEBRIS_TYPES : 0) + color * debris_areas + area
  xy @1 :List(Xy);   # the shots; at most 255
}

# A particle or shot within its 256x256 area of the view (frame.c DEBRIS_STORE).
struct Xy {
  x @0 :UInt8;   # pixels from the area's left edge
  y @1 :UInt8;   # pixels from the area's lower edge
}

# PKT_AUDIO (Send_audio "%c%c%c"; Receive_audio).
struct Audio {
  type @0 :UInt8;   # the sound (audio.h: START_SOUND 0 ... ASTEROID_BREAK_SOUND 82)
  vol @1 :UInt8;    # volume, 0..100
}

# PKT_EYES (Send_eyes "%c%hd"; no caller in the 4.7.3 server).
struct Eyes {
  id @0 :Int16;   # the player whose view the frames show
}

# PKT_WORMHOLE (Send_wormhole "%c%hd%hd"; no caller in the 4.7.3 server).
struct Wormhole {
  x @0 :Int16;
  y @1 :Int16;
}

# ================================================================ server to client: reliable data

# One packet of the reliable data stream (netserver.c writes them into connp->c; netclient.c
# reliable_tbl reads them).
struct Reliable {
  union {
    reply @0 :Reply;
    message @1 :Message;
    player @2 :Player;
    team @3 :Team;
    score @4 :Score;
    timing @5 :Timing;
    leave @6 :Leave;
    base @7 :Base;
    scoreObject @8 :ScoreObject;
    talkAck @9 :TalkAck;
    motd @10 :Motd;
    quit @11 :Quit;
    teamScore @12 :TeamScore;
    war @13 :War;
    seek @14 :Seek;
    string @15 :StringPacket;
  }
}

# PKT_REPLY (Send_reply "%c%c%c"; netclient.c Receive_reply): the answer to PKT_VERIFY or PKT_PLAY.
struct Reply {
  replyto @0 :UInt8;   # PKT_VERIFY 1 or PKT_PLAY 3
  result @1 :UInt8;    # PKT_SUCCESS 102 or PKT_FAILURE 101; for PKT_VERIFY also the contact reply's
                       # refusals (pack.h): E_GAME_FULL 2, E_TEAM_FULL 3, E_TEAM_NOT_SET 4,
                       # E_GAME_LOCKED 5, E_IN_USE 8, E_INVAL 10
}

# PKT_MESSAGE (Send_message "%c%S"): a line for the message area (talk, kills, server notices).
struct Message {
  msg @0 :Text;   # at most 255 characters (Set_message cuts at MSG_LEN)
}

# PKT_PLAYER (Send_player "%c%hd%c%c%s%s%s%S" then "%S%c"; Receive_player): a player joined or changed.
struct Player {
  id @0 :Int16;
  team @1 :UInt8;       # 0..9, or 255 (TEAM_NOT_SET truncated to a byte) outside team play
  mychar @2 :UInt8;     # the status char shown in the score list (' ', 'R' robot, 'T' tank, 'P'
                        # paused, 'W' waiting, 'D' dead, ...)
  name @3 :Text;        # the nick; at most 15 characters
  username @4 :Text;    # at most 15 characters
  hostname @5 :Text;    # at most 63 characters
  shape @6 :Text;       # the ship shape (Convert_ship_2_string, version 0x3200); at most 255
  ext @7 :Text;         # its extension; at most 255
  himself @8 :UInt8;    # 1: this is the receiving player (since 4.F.1.0, F_EXPLICITSELF)
}

# PKT_TEAM (Send_team "%c%hd%c", since 4.F.1.2): a player changed team.
struct Team {
  id @0 :Int16;
  team @1 :UInt8;
}

# PKT_SCORE (Send_score "%c%hd%d%hd%c%c", F_FLOATSCORE).
struct Score {
  id @0 :Int16;
  score @1 :Int32;      # (int)(score * 100 +- 0.5): hundredths
  life @2 :Int16;       # lives left
  mychar @3 :UInt8;     # as Player.mychar
  alliance @4 :UInt8;   # allchar: ' ' none, '0'+n the alliance (announceAlliances), '+' my alliance
}

# PKT_TIMING (Send_timing "%c%hd%hu"): race progress.
struct Timing {
  id @0 :Int16;
  timing @1 :UInt16;   # round * num_checks + check (num_checks = Setup.checks' length); the client
                       # splits it (Receive_timing)
}

# PKT_LEAVE (Send_leave "%c%hd"): a player left.
struct Leave {
  id @0 :Int16;
}

# PKT_BASE (Send_base "%c%hd%hu"): a player's home base.
struct Base {
  id @0 :Int16;    # the player
  num @1 :UInt16;  # base index (Setup.bases)
}

# PKT_SCORE_OBJECT (Send_score_object "%c%d%hu%hu%s"): a score shown on the map for a while.
struct ScoreObject {
  score @0 :Int32;   # hundredths
  x @1 :UInt16;      # block coordinates (BLOCK_SZ 35 pixels per block)
  y @2 :UInt16;
  string @3 :Text;   # at most 79 characters
}

# PKT_TALK_ACK (Receive_talk "%c%ld"): the server has the Talk with this sequence number.
struct TalkAck {
  seq @0 :Int32;
}

# PKT_MOTD from the server (Send_motd "%c%ld%hd%ld" + data): a piece of the message of the day.
struct Motd {
  off @0 :Int32;    # its byte offset
  data @1 :Text;    # the piece (len = its length); at most 512 characters (MAX_MOTD_CHUNK); empty =
                    # the end of the MOTD
  size @2 :Int32;   # the whole MOTD's size in bytes (at most MAX_MOTD_SIZE, 30 KiB)
}

# PKT_QUIT from the server (Destroy_connection: PKT_QUIT and a reason): you are out.
struct Quit {
  reason @0 :Text;   # "client quit", "timeout 02", "no macros", "Name already in use" ...; at most 79
}

# PKT_TEAM_SCORE (netclient.c Receive_team_score "%c%hd%d"; no sender in the 4.7.3 server).
struct TeamScore {
  team @0 :Int16;
  score @1 :Int32;   # hundredths
}

# PKT_WAR (netclient.c Receive_war "%c%hd%hd", "not interested"; no sender in the 4.7.3 server).
struct War {
  robotId @0 :Int16;
  killerId @1 :Int16;
}

# PKT_SEEK (netclient.c Receive_seek "%c%hd%hd%hd", "not interested"; no sender in the 4.7.3 server).
struct Seek {
  programmerId @0 :Int16;
  robotId @1 :Int16;
  soughtId @2 :Int16;
}

# PKT_STRING (netclient.c Receive_string "%c%c%hu%hu", "not implemented"; no sender in 4.7.3).
struct StringPacket {
  type @0 :UInt8;
  arg1 @1 :UInt16;
  arg2 @2 :UInt16;
}

# ================================================================ room options

# Room options (CreateRoom, SetRoomOptions): the server options a room runs with, as the original
# takes them on its command line or from a defaults file (cmdline.c, option.c): name and value as
# text, parsed and checked by the module as the original's option parser does. Options not given keep
# the original's defaults (lib/defaults.txt). The map is the option "mapFileName".
struct Options {
  options @0 :List(Option);   # at most one per entry of cmdline.c's option table: 366 (365 when
                              # built with SELECT_SCHED, which drops timerResolution)
}

struct Option {
  name @0 :Text;    # the option's name or its command-line alias, e.g. "framesPerSecond"; at most 79
  value @1 :Text;   # its value as the original reads it ("50", "yes", "12.5", "polybloods.xp2"); at
                    # most 255 characters (room options are at most 16 KiB in all, docs/SERVER.md)
}

# ================================================================ rankings

# ScoreEntry.detail of the module's rank table: one record of the original's rank file (rank.h
# ranknode_t, written by rank.c Rank_write_rankfile as <Player .../> in XPilotNGRank). Only the
# module writes it (acceptScore takes only what it saw); ScoreEntry.name is the nick.
struct Rank {
  name @0 :Text;                 # the nick; at most 15 characters (MAX_NAME_LEN 16)
  user @1 :Text;                 # at most 15 characters
  host @2 :Text;                 # at most 63 characters (MAX_HOST_LEN 64)
  score @3 :Float64;             # written "%.2f"
  kills @4 :Int32;
  deaths @5 :Int32;
  rounds @6 :Int32;
  shots @7 :Int32;
  deadliest @8 :Int32;
  ballsCashed @9 :Int32;
  ballsSaved @10 :Int32;
  ballsWon @11 :Int32;
  ballsLost @12 :Int32;
  bestball @13 :Float64;         # written "%.2f"
  maxSurvivalTime @14 :Float64;  # max_survival_time, written "%.2f"
  timestamp @15 :UInt32;         # time_t, seconds since the epoch, written "%u"
}
