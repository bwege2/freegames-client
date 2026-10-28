# freegames: source code of the website

This archive is the complete source code of what https://freegames.stream/ sends to your browser: the
website, the game SDK, every game port, the build files and the Cap'n Proto schemas the browser code is
generated from. It is the version named in the archive's folder (a git commit).

* `web/`: the website and the games (Vite + TypeScript). Build: `cd web && npm ci && npm run build`; the
  site is in `web/dist`. Licenses: `web/LICENSE.md` (website and SDK, GPL-3.0-or-later, with an additional permission to combine
  them with game ports under the NetHack General Public License or GPL-2.0-only) and
  `web/games/<id>/LICENSE.md` (each game); full license texts in `web/public/licenses/`.
* `protocol/`: the Cap'n Proto schemas; `tools/gen-protocol.sh` regenerates the TypeScript bindings in
  `web/` from them.
* `server/src/main/resources/xpilot/lib/maps/`: XPilot's maps (GPL-2.0-or-later), which the game server
  sends to the browser.
* `docs/GAME-INTEGRATION.md`: how a game uses the SDK.
* `re/nethack/`: how NetHack's port was made. `tools/` translates the C source of NetHack 3.6.7 into the
  TypeScript of `web/games/nethack/src/`; `fetch.sh` downloads that source (pinned by its sha256, from
  https://www.nethack.org/), and `oracle/build.sh` builds the original, whose own tools make the game's data
  `web/games/nethack/assets/nhdat`; `oracle/` also records the test sessions.

The game server itself runs only on our machine; it is not distributed and not part of this archive.
