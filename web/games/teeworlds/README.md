# Teeworlds

A port of **Teeworlds 0.7.5** (2020), the last official release of Magnus Auvinen's and the Teeworlds team's
online shooter: the original's client in TypeScript in the browser, the original's dedicated server in Java in
our server, speaking the original's network protocol. Reference notes, the oracles and what the tests check:
`re/teeworlds/NOTES.md`. License and credits: `LICENSE.md`.

## Playing

Play opens the lobby. Create a room (game type, map, score and time limit and the other server settings above
the lobby; the vote options for the official maps are added) or join one; a running game takes players at any
time. Back leaves the game and the room.

The original's default controls:

| Key | Action |
| --- | --- |
| A / D | run left / right |
| Space | jump (once more in the air) |
| Mouse | aim |
| Left mouse button | fire |
| Right mouse button | grappling hook |
| 1–5, mouse wheel | weapons |
| T / Y / X | chat to all / team / whisper |
| Tab, E | scoreboard, statistics |
| Left Shift | emoticons (choose with the mouse) |
| Right Shift, ← → | spectate: follow / next / previous player |
| F3 / F4 | vote yes / no |
| R | ready (when the server asks for it) |
| U | show the chat |
| Esc | the menu: game (join a team, spectate), players, server info, call vote, settings |

## Deviations from the original

The server (in our server):

* **No master server, no server browser:** the room list replaces them. The server answers no server-info
  requests (connectionless packets) and does not register anywhere.
* **No remote console:** the original sets a random rcon password when none is configured and prints it to its
  console; the port draws the same random bytes but sets no password, so a client's rcon login gets the answer
  of a server without passwords. There are no admin or moderator passwords. **Votes stay** (kick, spectate and
  the vote options), as in the original.
* **The server's settings are the room's options:** the game type, map, map rotation, score and time limit,
  matches per map and team swap, team damage, power-ups, warmup, countdown, player slots, respawn delay,
  tournament and ready modes, team balance, inactivity kick, spectator settings, vote settings, spam protection,
  the name and the message of the day. Only those keys, each within its limits, and vote options with commands
  of a fixed set (map, game type, limits, restart, reload, pause, team commands, say). Not available:
  `sv_high_bandwidth` (the update rate stays the original's), passwords, ports, logs, demos, the econ console.
* **Only the official maps** (dm1–dm3, dm6–dm9, ctf1–ctf8, lms1) are on the server; clients that lack one
  download it from the server as in the original.
* **At most 16 players** per room (the site's seat limit; the server is configured for 16 clients).
* **A seat is a connection:** each seat is a peer address of the server, and its client connects as the
  original's client connects. When a seat leaves, the server closes its connection at once, as when the
  client closes it (the original's client says goodbye with a CLOSE whose reason the server ignores). When a
  seat's dropped connection comes back, its client connects anew and the server closes the old connection at
  once instead of letting it time out after 10 seconds.
* **The server's loop** runs every 10 ms and for every datagram that arrives (the original waits for a packet
  or at most 5 ms); the game runs at the original's 50 ticks per second, snapshots at 25 per second.
* **Bans** (a kick vote with `sv_vote_kick_bantime`, too many failed rcon logins) last for the room's game, in
  memory, by the seat's address.
* **The resend buffer** of a connection (32 KiB in the original, a ring buffer) is counted by the size of what
  it holds, without the ring buffer's fragmentation: a connection that falls far behind is dropped at about the
  same point as in the original.
The client (in the browser):

* **The website is the main menu:** no start menu, server browser, demo player, map editor or news; the
  in-game menu (Esc) keeps the game, players, server info and call-vote pages and the settings. Left out of
  the menu: the Record button, the Favorite check box and the server-browser button.
* **Settings that belong to the browser are gone:** General has no language or theme list (English only, no
  menu map) and no skip-start-menu, auto-demo or screenshot options; Controls has no joystick group and no OS
  mouse acceleration; Graphics keeps Quality Textures and High Detail (screen size, full screen, v-sync and
  anti-aliasing are the browser's); Sound has no sample rate (the browser's) and no menu music (it belongs to
  the start menu, which is gone).
* **The settings file** (the original's `settings.cfg`, with the binds) and saved skins are files in your
  account on the server, not on disk. On the first start the site's player name replaces "nameless tee"
  (the original asks for a name in its first-start popup).
* **The mouse:** the original reads relative mouse motion. Click the game to capture the pointer (Pointer
  Lock); Esc releases it, and the game then gets its Esc as well, so Esc still opens and closes the menu.
  Without the lock the menu follows the system cursor.
* **Text** is drawn from the original's font (DejaVu Sans) by the browser's font rasterizer instead of
  FreeType, without kerning: glyphs differ by a pixel here and there.
* **Graphics** are WebGL instead of OpenGL, through the original's drawing interface; the loading bar only
  counts, since the browser shows nothing until a frame ends.
* **Sounds** are the original's WavPack files, decoded by a TypeScript port of the decoder Teeworlds ships,
  mixed by WebAudio with the original's volume and panning.
* **No client console commands** for connecting, quitting or the remote console; the local console works for
  settings and key bindings.

The network:

* **The network** is the site's: the datagrams go as WebTransport datagrams, or over the WebSocket fallback,
  where none is lost; a datagram larger than the transport's datagram size goes reliably.
