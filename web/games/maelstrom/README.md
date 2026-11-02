# Maelstrom (port)

**Maelstrom** (Ambrosia Software, 1993), from the open-source **4.0.2** SDL port by Sam Lantinga
and contributors (`re/maelstrom/`). The 640×480 arena, the original sprites and sounds, the ship
physics, asteroids, Shenobi fighters and wave rules are the original's; the code is TypeScript.

## Controls

* **Pilot 1**: ↑ / ↓ thrust / shield, ← / → rotate, **Space** fire, **Shift** air brakes.
* **Pilot 2**: **W / S** thrust / shield, **A / D** rotate, **F** fire, **Q** air brakes.
* **Pilot 3**: **I / K** thrust / shield, **J / L** rotate, **H** fire, **U** air brakes.
* **Gamepad**: left stick or d-pad, **A** fire, **B** air brakes; the first pad belongs to Pilot 1.
* **Touch**: on-screen thrust, shield, rotate, fire and brake buttons on touch devices.
* **Caps Lock** or **Esc**: pause a local game; **Esc** from pause: title screen. In an online room
  **Esc** leaves the room.

Menu: **P** 1 player, **2** two-player co-op, **3** two-player deathmatch, **O / V** online co-op or
deathmatch, **R** replays, **M** mods, **C** controls, **Z** zap high scores, **A** about, **Q** quit;
arrow keys and Enter also work.

The air-brakes prize still brakes automatically; Shift/Q/U and gamepad B also work without it.

## The game

* The original 640×480 asteroid belt with the player ship, large/medium/small rocks, steel
  asteroids, prizes, score multipliers, point bonuses, gravity wells, homing mines, novas,
  damaged ships and Shenobi fighters.
* The 48-frame ship rotation, the original acceleration table, wrapping at the screen edges,
  thrust/air-brake physics, shields with the original capacity and automatic spawn shield, three
  hit points, extra lives every 50,000 points, and the wave-clear bonus tally.
* Eight prizes: machine guns, air brakes, lucky Irish, triple fire, long range, extra shields,
  freezing and a screen-clearing nova; shot prizes turn into score bonuses.
* **No sound.** The original's sound effects and music are not shipped: Ambrosia Software's 1993 sounds have no
  licence that lets us publish them, and we asked without an answer. The game runs silently; the sound calls of the
  original are all still made (the same events, the same volumes), so the original's sound files can be plugged in
  with `re/maelstrom/tools/build-assets.py --sounds <Data/Sounds>` once a licence exists. Then they must be credited
  and kept out of the public source repository.
* High scores are kept in the player's account (`hiscores.txt`, `name score wave`), with the
  original top-ten ordering and “Zap the high scores”.
* The wave flow follows `game.cpp`: rocks split into smaller rocks, the belt speeds up with the
  wave, special objects appear on the original random timers, and clearing the last rock starts
  the bonus display and the next wave.
* **2–3 pilots**: the original `MAX_PLAYERS 3` co-op and deathmatch rules. Co-op pilots share the
  wave; a pilot with no lives left becomes a ghost, and the game ends when all are ghosts.
  Deathmatch uses the original frag target (10), each pilot has one life and respawns until a
  pilot reaches the target. Gravity affects every pilot; homing mines, novas and Shenobi pick a
  random living target. Local players use side-by-side spawn positions (`SetSpawnPosition`).
* **Online**: deterministic lockstep through a website room. Every client runs the same 30 Hz
  simulation from the round seed and sends one 6-bit input byte per frame; the server module
  relays it with the sender's seat and ends the round when the seats report the same score, wave
  and frags. Co-op and deathmatch are room options.
* **Replays**: every local game records its seed, players, mode and per-frame inputs, and saves
  `LastGame.mreplay` in the player's account. The **Replays** screen plays it back at 30 Hz.
* **Mods**: the **Mods** screen stores `.zip` packs in the player's account and applies the
  original `Sprites/`, `Images/`, `Sounds/` overrides (stored and deflated ZIP entries, PNG and
  WAV). `Fonts/` and `UI/` entries are ignored because the browser uses its own text and panels.

## Deviations and known gaps

* **Menu fonts**: the original Mac New York/Geneva fonts are Macintosh `NFNT` resources; the port
  uses browser serif/sans-serif fonts with the original colours and panel artwork. The title and
  icons are the original images.
* **Steam achievements** are platform-bound and not ported.
* Online rooms use the website's rooms instead of the original UDP lobby/discovery; the lockstep
  frame/input model follows `netplay.cpp`.
* The original mod selector reads ZIPs from a local `mods/` directory; the browser uploads the same
  ZIPs to account storage and ignores `Fonts/` and `UI/` overrides.
* The original replay file is a compressed binary with a CRC-checked sprite pack; the browser uses
  a text `.mreplay` with the same seed/frame-input information.
* **Kid Mode** and the continue/cheat dialogs are not exposed.
* High scores use a small text table (`name score wave`) with the same ordering; replay files are
  separate `.mreplay` files.
* The bonus/game-over panels use a compact browser layout rather than the original XML UI
  templates.
* A C++/SDL oracle was not built here (SDL3 development files and a display are not available);
  the original constants, RNG and formulas are cited in `re/maelstrom/NOTES.md` and checked with
  deterministic tests.

The original `COPYING`, `CREDITS` and `README.md` are in the download; see
`re/maelstrom/fetch.sh`.

## Running

```sh
bash re/maelstrom/fetch.sh                     # downloads and unpacks 4.0.2
python3 re/maelstrom/tools/build-assets.py      # copies the sprites and generates tables.ts (no sounds; see above)
cd web && npm test                             # RNG/physics/wave tests
npm run build && node scripts/screenshots.mjs maelstrom
```
