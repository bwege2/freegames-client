@0xf1ed4ed084aeb73d;
# Teeworlds online (web/games/teeworlds): the original's client/server protocol (Teeworlds 0.7.5,
# src/engine/shared/network*.cpp) over our rooms. The server module (server/.../games/teeworlds/) runs the
# original server, ported to Java; each seat runs the original client, ported to TypeScript. Every game
# message (Relay.data / Relayed.data) is one packed `Msg`; the room options are `Options`.
# Notes: re/teeworlds/NOTES.md.
#
# ---------------------------------------------------------------- the datagrams
# The original speaks UDP: every datagram is one packet of its own protocol (a 7-byte header with flags,
# ack, chunk count and the connection token, then chunks with their own vital flag, size and sequence;
# Huffman compressed; or a control message: token request, connect, accept, keep-alive, close). It has its own
# reliability (vital chunks are resent until acked) and tokens. So the packets are carried as they are:
# `Msg.udp` is one UDP datagram, sent unreliably (WebTransport datagrams; over the WebSocket fallback, and
# above the datagram size, they go reliably): from the client what it writes to its socket, to the server
# (Target.server); from the server (Relayed from 255) what the server writes to that seat's address. A lost
# datagram is lost, as on the original's network.
#
# ---------------------------------------------------------------- what the core replaces
# * The socket addresses: a seat is one peer address of the server (an IPv4 address per seat); a new
#   connection of the seat (after leaving and joining again) is a new port.
# * The master server and the server browser: the room list.
# * The remote console (rcon): not available (no admin passwords); the votes stay.

using Java = import "/capnp/java.capnp";
$Java.package("net.slop.freegames.games.teeworlds.proto");
$Java.outerClassname("TeeworldsProto");

struct Msg {
  udp @0 :Data;
  # one UDP datagram of the original protocol (see above)
}

struct Options {
  # The room's server settings: lines of the original server's configuration (autoexec.cfg), as an operator
  # would write them, e.g. {key "sv_gametype", value "ctf"}. Only the keys the module allows
  # (TeeworldsModule.OPTIONS) and values within their limits.
  config @0 :List(Line);
  votes @1 :List(Vote);
  # vote options (add_vote) the players can call, with commands of the allowed kind only
}

struct Line {
  key @0 :Text;
  value @1 :Text;
}

struct Vote {
  description @0 :Text;
  command @1 :Text;
  # e.g. "sv_map ctf2", "sv_gametype ctf; restart", "restart 10"
}
