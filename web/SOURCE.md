# freegames: source code of the website

This repository is the complete source code of what https://freegames.stream/ sends to your browser: the
website, the game SDK, every game port, the build files and the Cap'n Proto schemas the browser code is
generated from. Every release of the site is one commit here, tagged `release-YYYY-MM-DD` (`.2`, `.3`, … for
further releases that day); the site's page "Licenses & source" links the tag of the version it runs.

* `web/`: the website and the games (Vite + TypeScript). Build: `cd web && npm ci && npm run build`; the
  site is in `web/dist`. Licenses: `web/LICENSE.md` (website and SDK, GPL-3.0-or-later, with an additional permission to combine
  them with game ports under the NetHack General Public License or GPL-2.0-only, and additional terms under
  section 7) and `web/games/<id>/LICENSE.md` (each game); full license texts in `web/public/licenses/`.
* `web/games/<id>/`: one game: its port (`src/`), its data (`assets/`), tests, `README.md` (what differs from
  the original) and `LICENSE.md`.
* `protocol/`: the Cap'n Proto schemas; `tools/gen-protocol.sh` regenerates the TypeScript bindings in
  `web/` from them.
* `server/src/main/resources/xpilot/lib/maps/`: XPilot's maps (GPL-2.0-or-later), which the game server
  sends to the browser.
* `docs/GAME-INTEGRATION.md`: how a game uses the SDK.
* `re/<id>/`: how a port was made, where tools made part of it: `fetch.sh` downloads the original (pinned by
  its sha256), the tools translate or convert it, and `oracle/` builds the original to test the port against.
  NetHack's C source, for example, is translated into the TypeScript of `web/games/nethack/src/` by
  `re/nethack/tools/`.

The game server itself runs only on our machine; it is not distributed and not part of this repository. On
request we send the complete source code of every version the site served in the last three years (contact:
the site's Impressum).
