# C-Dogs SDL (port)

Reference version: **C-Dogs SDL 2.5.0** (tag `2.5.0`, `re/cdogs/fetch.sh`). The port is TypeScript, no emulator or
WebAssembly; the original's data (`assets/`, copied by `re/cdogs/tools/assets.sh`) is used unchanged. License check:
`LICENSE.md`, reverse engineering: `re/cdogs/NOTES.md`.

## What is in it

| Part | Files |
| --- | --- |
| data, campaigns, map building | `src/core/{data,classes,pics,sounds,mission,map,mapbuild}.ts` |
| simulation: actors, AI (A*, path cache), AI players, bullets, objects, particles, pickups, events, mission, game step | `src/core/{actors,ai,aicoop,objs,particles,pickups,player,missionrun,handle,game,camera,music,quickplay}.ts` |
| renderer, world/actor/HUD/automap drawing, fonts, the live menu background | `src/render/*.ts` |
| input (keyboard as SDL scancodes, gamepads, mouse), Web Audio sounds and music | `src/platform/*.ts` |
| screens: main menu, options, campaign intro, player select, level select, game options, briefing, equip/weapon/ammo menus, mission, mission summary, dogfight/deathmatch scores, high scores, pause, autosave/password, loading, credits | `src/ui/*.ts`, started by `src/index.ts` |
| online play (the original's LAN game) through the website's rooms | `src/online.ts`, `protocol/games/cdogs.capnp`, `server/.../games/cdogs/` |

Options, autosave, player templates and the high-score files are the original's files in the player's server
storage (account scope). Music and sound are the original's files, played through Web Audio.

## Controls

| | Keyboard 1 | Keyboard 2 | Gamepad |
| --- | --- | --- | --- |
| move | arrow keys | keypad 4 6 8 2 | left stick / d-pad |
| fire | X | keypad Enter | A (or the right trigger) |
| switch weapon / slide | Z | keypad . | B |
| grenade | S | keypad 3 | right shoulder |
| map | A | keypad 0 | — |
| pause | Esc | Esc | Start |

Menus: arrow keys (or the mouse) and Enter to choose, Esc/Backspace to go back. The keys are the original's
defaults and can be changed under Options → Redefine keys.

## Online play

"Start → Online" lists the campaigns like the offline game; the host picks one, the room's players are the game's
players (one each, up to four). The lobby is the website's shared room list (create, join, ready, start). The
round runs in lockstep: every client runs the whole simulation from the room's seed, each frame sends its own
player's command word, and the server relays the words in order (`protocol/games/cdogs.capnp`,
`server/src/main/java/net/slop/freegames/games/cdogs/CdogsModule.java`). The module checks the seat, the command
word and the frame numbers (one word per frame and seat, without gaps), ends the round when every seat reported its end, when a seat leaves, or when a seat
went silent for 10 s, and hands the scores to the clients. A round is one mission; its end leads to the mission
summary and back to the menu. A client that is ahead of another sends words for frames the other has not reached
yet; the other keeps them until it gets there, so no word is lost.

## Tests

`node --test games/cdogs/test/sim.test.ts` (from `web/`): four scenarios of the original's game loop (ogre with one
player, ogre co-op with an AI player, zombie with two players, a dogfight) against `re/cdogs/oracle/golden/`, which
the original's own objects wrote (`re/cdogs/oracle/build.sh`). `games/cdogs/test/online.test.ts`: the way from
the lobby into the round keeps the room, the lockstep keeps the words of a client that is ahead, the shake's
generator. The server module's tests are
`server/src/test/java/net/slop/freegames/games/cdogs/CdogsModuleTest.java`.

## Deviations

- **Online** (`src/online.ts`): the original's LAN game (an authoritative host sending game events, `net_server.c`)
  becomes lockstep simulation on every client through this website's rooms; every human player counts as local
  (`PlayerData.IsLocal`), `isOwn` marks the client's own players (screens, camera, input). The camera shake draws
  from its own random generator (`shakeRandom` in `src/online.ts`, xorshift32 from the room's seed, in `rand()`'s
  range) instead of the game's `rand()`, so the shake (only the view) does not change the shared simulation. The server cannot check what a client
  does with its own player: the module checks the framing (seat, frame order, command bits), not the game.
  "Join LAN game" becomes the website's lobby; the original's LAN server browser and the direct-IP entry go.
- **Online always plays the campaign's first mission** (mission 0): the host picks the campaign and the mode,
  not the mission, and a round is that one mission. The original's host can continue a campaign mission by mission.
- **Online, character and name come only from the seat order**: a player's character is the default of its seat
  number (`PlayerDataDefault` of the seat's place) and the player's name is the room's name. The original's
  player-select screen (name, character, equipment) runs on the host for local players, and the host sends every
  player's data to the clients; here nobody picks anything online. Offline the player select works as in the
  original.
- **Seed**: the room's seed replaces `Game.RandomSeed` (`campaigns.c: CampaignSeedRandom` is
  `10 * MissionIndex + Game.RandomSeed`), so every client builds the same map for every mode, not only for PVP.
- The order of the general music tracks is sorted (the original keeps its file system's directory order).
- Songs without a stated license (`devhell1.xm`, `devhell2.ogg`, `graveintent1.xm`) are not shipped; in 2.5.0 a
  mission's own song never plays anyway (`re/cdogs/NOTES.md`).
- The favicon is drawn from the game's own logo (`web/icons/cdogs*.png`, `web/scripts/icons.py`).
- The browser has no file dialogs: the original's files (options, autosave, player templates, high scores) live in
  the player's server storage, and the campaign list comes from the shipped data (`re/cdogs/NOTES.md`).
