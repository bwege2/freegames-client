@0x96499b22daa164f4;
# Netrek online (web/games/netrek): the original's client/server protocol (include/packets.h of the Vanilla
# server 2.19.0, the same in the COW client 3.3.3) over our rooms. The server module
# (server/.../games/netrek/) runs the original server: the daemon, one ntserv per seat, the robots. Each
# seat runs the COW client. Every game message (Relay.data / Relayed.data) is one packed `Msg`; the room
# options are `Options`. Notes: re/netrek/NOTES.md.
#
# ---------------------------------------------------------------- the stream
# The original speaks over TCP: a stream of packets laid end to end, each a C struct of packets.h (the first
# byte its type; multi-byte fields in network byte order; variable-size short packets carry their length).
# Client to server: CP_ packets (CP_SOCKET first, CP_LOGIN, CP_OUTFIT, CP_SPEED, CP_TORP, ...). Server to
# client: SP_ packets (SP_MOTD, SP_YOU, SP_PLAYER, SP_S_PLAYER, SP_TORP, SP_PLANET, SP_MESSAGE, ...).
# The packets are the original's own data, so they are carried as they are: `Msg.tcp` is a piece of that
# stream, in order, over the core's reliable relay (to the server; from the server, Relayed from 255). A
# piece may end inside a packet: the receiver reassembles the stream as the original reads its socket.
#
# ---------------------------------------------------------------- what the core replaces
# * The TCP connection and newstartd: a seat of the room is a connection; the server starts its ntserv when
#   the seat joins and ends it when the seat leaves (the client's end closes).
# * UDP: the client's and the server's UDP sockets are the seat's datagrams. `Msg.udp` is one UDP datagram,
#   sent unreliably (WebTransport datagrams; over the WebSocket fallback they arrive anyway): from the client
#   what COW writes to its UDP socket, from the server what the ntserv writes to its own (SP_SEQUENCE and the
#   packets the original sends by UDP). The negotiation is the original's, on the stream (CP_UDP_REQ,
#   SP_UDP_REPLY with the server's port, the verify datagram); ports are the original's numbers, but every
#   datagram of a seat goes between that seat's client and its ntserv. A lost datagram is lost, as on the
#   original's network: what it carried is superseded by the next update.
# * The metaserver: the room list.

using Java = import "/capnp/java.capnp";
$Java.package("net.slop.freegames.games.netrek.proto");
$Java.outerClassname("NetrekProto");

struct Msg {
  union {
    tcp @0 :Data;
    # a piece of the TCP stream: CP_ packets from the client, SP_ packets from the server
    bye @1 :Void;
    # from the server: the ntserv closed the connection (it exited: the client quit, or was ghostbusted)
    udp @2 :Data;
    # one UDP datagram (see above)
  }
}

struct Options {
  # The room's server options: lines of the server's configuration file (etc/sysdef, docs/sample_sysdef),
  # as the server's operator would edit them. Only the keys the module allows (NetrekModule.OPTIONS) and
  # values within its limits.
  sysdef @0 :List(Sysdef);
}

struct Sysdef {
  key @0 :Text;
  # e.g. "TOURN", "SHIPS", "CHAOS", "RESTRICT_BOMB"
  value @1 :Text;
}

struct Player {
  # A character of the server's player database (var/players, struct statentry) as the score table
  # "players" keeps it: one record per account, the latest. ScoreEntry.score is the rank.
  name @0 :Text;
  rank @1 :Int32;
  flags @2 :Int32;
  keymap @3 :Data;
  # st_keymap[96]
  ltd @4 :List(Ltd);
  # the LTD statistics (include/ltd_stats.h), one per ship type: LTD_TOTAL, SC, DD, CA, BB, AS, SB, GA/AT
  lastlogin @5 :Int32;
  # st_lastlogin: when the character last played (seconds since 1970)
}

struct Ltd {
  # struct ltd_stats, field by field (the names of SP_LTD's ltd_spacket where it has them)
  kt @0 :UInt32; kmax @1 :Float64; k1 @2 :UInt32; k1p @3 :UInt32; k1c @4 :UInt32; k2 @5 :UInt32;
  k2p @6 :UInt32; k2c @7 :UInt32; kbp @8 :UInt32; kbt @9 :UInt32; kbs @10 :UInt32;
  dt @11 :UInt32; dpc @12 :UInt32; dcc @13 :UInt32; ddc @14 :UInt32; dbp @15 :UInt32; dbt @16 :UInt32;
  dbs @17 :UInt32; acc @18 :UInt32;
  ptt @19 :UInt32; pdt @20 :UInt32;
  bpt @21 :UInt32; bp8 @22 :UInt32; bpc @23 :UInt32; bat @24 :UInt32; ba8 @25 :UInt32; bac @26 :UInt32;
  oat @27 :UInt32; odc @28 :UInt32; occ @29 :UInt32; opc @30 :UInt32; ogc @31 :UInt32; oec @32 :UInt32;
  olc @33 :UInt32; osba @34 :UInt32; ofc @35 :UInt32; ofa @36 :UInt32;
  at @37 :UInt32; aa @38 :UInt32; ar @39 :UInt32; af @40 :UInt32; ak @41 :UInt32;
  ct @42 :UInt32; cp @43 :UInt32; cc @44 :UInt32; ca @45 :UInt32; cr @46 :UInt32; cf @47 :UInt32;
  tt @48 :UInt32; tyel @49 :UInt32; tred @50 :UInt32; tz @51 :List(UInt32); tpc @52 :UInt32;
  tcc @53 :UInt32; tr @54 :UInt32;
  dr @55 :UInt32;
  wpf @56 :UInt32; wph @57 :UInt32; wpdi @58 :UInt32; wpdt @59 :UInt32;
  wtf @60 :UInt32; wth @61 :UInt32; wtd @62 :UInt32; wts @63 :UInt32; wtw @64 :UInt32; wtdi @65 :UInt32;
  wtdt @66 :UInt32;
  wsf @67 :UInt32; wsh @68 :UInt32; wsp @69 :UInt32; wsw @70 :UInt32; wsdi @71 :UInt32; wsdt @72 :UInt32;
}
