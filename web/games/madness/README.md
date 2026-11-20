# Madness Interactive Reloaded (port)

Studio Minus's **Madness Interactive Reloaded**, release **0.51.1-beta** (`re/madness/`). The game logic is a
line-by-line translation of the original's C# (and of the parts of its engine, Walgelijk, that the game logic
calls) into TypeScript: `src/game/` (characters, their procedural animation, the player, the AI, weapons, bullets,
melee, dodging, death animations, ragdolls, levels, doors, spawning, progress, camera, the level systems and
scripts, abilities, improbability disks, the incident director, the training program), `src/data/` (MIR's own file
formats: `.anim`, `.stats`, `.look`, `.armor`, `.hand`, `.seq`, weapon, faction, campaign and level JSON) and
`src/engine/` (Walgelijk's maths, curves, easings, transforms, the physics queries, FastNoise Lite, .NET's seeded
`System.Random`). The data, graphics, sounds, music and videos are the original's files, unchanged, except the two
fonts whose originals are not free (see below). The original is GPL-3.0, version 3 only, and so is this port; every
asset file and its source is listed in `ASSET-MANIFEST.csv` (`LICENSE.md`).

## Controls

The original's default controls (Shared/ControlScheme.cs):

* **A / D**: walk. **Mouse**: aim. **Left button**: shoot; unarmed or with a melee weapon: attack (click again for
  the next blow of the combo). **Right button**: iron sights; with a blade: block and deflect bullets.
  **Middle button**: melee attack with a gun. **Space**: jump dodge. **E**: pick up the weapon nearest to the mouse.
  **F**: throw the weapon. **Left Shift, Q, Left Ctrl**: the abilities 1 to 3 (when the character has them).
* **R** after dying: retry the level (in the experiment: revive). **Esc**: pause menu. **Tab** in the experiment:
  edit mode. **Hold Esc** in a cutscene: skip it.

## What is ported

* **Menus**: the main menu (campaigns, improbability disks, experiment, incident mode, character customisation,
  settings, credits; quit goes back to the website), the campaign menu (the campaigns that are not hidden, in their
  order: Training program, Employee of the Month; continue, restart, level select of the unlocked levels with the
  time spent and the kills), the pause menu, the HUD (weapon, ammunition, body count, dodge and health vignettes,
  crosshair with the weapon's spread), the death screen, the level transitions.
* **Campaigns**: all of **Employee of the Month** (lvl_cutscene_begin to lvl_cutscene_credits: the facility, the
  train levels, the elevator, the roof, the Rich boss) and the **Training program** (tut_move, tut_pickupshoot,
  tut_dodging, tut_melee with TeachMoveSystem, TeachPickupShootSystem, TeachDodgeSystem and TeachMeleeSystem and
  their instruction boxes). The hidden mag campaign (not listed in the original either) is built and tested but
  not offered in the menu, as in the original.
* **Level types and scripted levels**: every level object of the data (doors and portals, spawners, NPCs, weapons on
  the floor and on walls, posters, flipbooks, decal zones, progress triggers, animation triggers, cutscene players,
  turrets, disks, moving train backgrounds) and the level systems: TrainShakeSystem, PassingTrainSystem,
  MachinistLevelSystem (the engine you shoot), DebarkationLevelSystem, ElevatorLevelSystem, the four training
  systems; the level scripts of lvl_destination (rare portals), lvl_roof_1 (the footsteps),
  lvl_cutscene_bossbattle (its music cue) and lvl_incident_begin_1 (the docile guard). Progression by body count,
  time, explicit trigger or always.
* **Cutscenes**: the videos of the data (`video/*.mp4`) with their slides and durations (CutsceneSystem), the
  player poster slide; skipping by holding Esc.
* **Boss**: the Rich boss (RichBossSystem: sword attacks, the area hit, the gun sequence with its warning circles,
  the health bar).
* **Abilities** (Character/Abilities): no stun, no waiting for an attack turn, no weapons, flying, teleport dash, holy
  shield (reflects bullets), telekinesis, conjuring (spawn menu), on the characters whose stats name them.
* **Improbability disks**: all 17 disks of ImprobabilityDisks with their effects on the player, the AI and the
  level (god, infinite ammo, fast walking, tricky revive, fewer/more enemies, everyone evil, the stat disks, the
  ones that give abilities), their incompatibilities, the hidden disk pickups in the levels, the unlock notice and
  the selection menu. Unlocked disks are kept in your account (`disks.txt`, the original's file).
* **Incident mode**: IncidentConfig.CreateCampaign (a begin level, five shuffled incident levels and an end level,
  the kill target spread over them, random spawning, weapons and music from a seeded System.Random), the kill
  counter of IncidentSystem.
* **Experiment mode**: exp_1 with ExperimentModeSystem's edit mode (Tab): place character presets and weapons with a
  click, pick the music, autospawn on/off, time scale, clean everything, toggle unlocked disks; revive with R.
* **Character customisation**: the player's look (body, head, two body and three head accessories, hands) from all
  armour pieces of the data, kept in your account as `player.look` (MIR's look format) and used in the levels.
* **Settings**: master, music and sound volume, screen shake, stamping ragdolls on the background; kept in your
  account (`settings.json`).
* Every character as MIR builds and moves it: CharacterPositionSystem (body, head, hands, feet, recoil, iron
  sights, tilting, hopping, head bob with FastNoise), the hand poses for fists, one- and two-handed guns, swords,
  axes and blunt weapons, all animations of the data (mixed and blended as the original does), the constraints the
  animations set.
* Player and AI exactly as PlayerCharacterSystem and AiCharacterSystem: aiming with the stats' randomness and speed,
  shooting timeout, attack turns (MaxSimultaneousAttackingEnemies), walking to keep the convars' distances, picking
  up weapons, panic, deflecting, accurate shots with their warning, melee.
* Weapons (WeaponSystem, BulletEmitter): fire rate, bursts, pump action, automatic fire, accuracy, recoil, damage
  over distance, bullets going through bodies, dodging (the dodge meter and its costs), deflection by blades and
  armour (with the perfect deflect and its slow motion), broken armour, casings, muzzle flashes, tracers, bullet
  holes and blood in the decal zones, low ammunition sounds.
* Melee (MeleeUtils, MeleeSequenceSystem): the combo sequences of the data with their hit frames, blocking, parries,
  stuns, the interaction table of blade, axe and blunt weapons of every size, knock-downs.
* Death animations by hit zone and direction, ragdolls (the verlet ragdoll of Ragdoll.cs at 200 steps per second),
  stamping corpses onto the background, thrown weapons that stun, kill or stick in bodies.
* Saves: each campaign's progress file (Level/CampaignStats.cs, the original's JSON) is kept in your account
  (`campaign-<id>.json`): level index, kills, deaths, attempts, time spent, the weapon carried into each level.

## Deviations

* **Not ported**: the mod menu (mods are .NET assemblies), the level, campaign, weapon and armour editors (reached in
  the original through its developer console), the arena mode (its menu button is commented out in 0.51.1), the
  club scene of exp_club (DjScreen, dancing characters, club lights: the level is built without them), language
  choice (the data has only English), key rebinding, the video settings for the window and the frame-rate limit.
* **Experiment mode**: the drag windows are a simpler side panel: no selecting, dragging, killing or editing of
  placed characters (health, faction), no autospawn configuration window (autospawn uses the level's own
  instructions), presets only (no duplicating or saving of presets). Placed characters belong to the AAHW faction.
* **Character customisation**: lists of the pieces instead of the original's grid with previews; no flipping,
  colours, import or export; the preview is a still picture.
* **Settings**: the user interface volume is part of the sound volume.
* **Incident mode**: MIR's registries are ConcurrentDictionaries whose key order is not fixed between runs, so the
  original's draws for a seed are not reproducible; the port takes the level and weapon keys in ordinal order (the
  test compares with MIR's System.Random on that order). The incident's name hashes the seed and kill target
  (HashCode.Combine is randomised per process in .NET). Every incident starts from fresh copies of the levels (the
  original changes the loaded levels and keeps the changes until it is restarted). The enemy kinds are drawn from
  the port's shared random generator, as the original draws them from its shared one.
* **Cutscenes** are played by the browser's video element; the player poster slide shows the poster picture
  without the rendered portrait of the player.
* **Fonts**: Impact and Toxigenesis are not free; `assets/fonts/impact.wf` is Anton and `assets/fonts/toxigenesis.wf`
  is Russo One (SIL OFL), rendered into MIR's font format (`LICENSE.md`). Their glyphs are a coverage atlas, not a
  multi-channel distance field.
* **Gore**: the original cuts holes into the body textures with a shader (flesh and gore textures, slashes). The
  port draws dark wounds on the body parts instead.
* **Decals**: blood splats are kept where the original's decal mask allows them (the level's decal zones); the
  original reads its background buffer to put bullet holes in front of or behind the foreground.
* **Player posters** in the levels show the poster without the rendered portrait of the player.
* **Screen**: a fixed 1920x1080 picture scaled to the window (the original's window has any size; the camera keeps
  the level's height filling the screen in both).
* **Time**: the game runs at the browser's frame rate with MIR's variable time step (as the original does at its
  frame rate cap); its fixed update (weapons' physics, turrets, the elevator) at 60 per second as the original.
* **Thrown sharp weapons** stick in any body part they hit (the original tests their sharp boxes first).
* **Random numbers**: Walgelijk's shared System.Random is replaced by a seedable generator; seeded System.Random
  (incident mode) is ported exactly.
* **Loading**: backgrounds, level thumbnails, music and videos load when they are needed (the whole game is about
  630 MB).

## Tests

`test/madness.test.ts` checks the port against MIR itself: `re/madness/oracle/` runs MIR's own C# (the 0.51.1
build) headless and writes `test/golden/oracle.json` (noise values including Perlin, the parsed animations, stats,
armour, the floor lines, the animation results of characters at given times, hand poses, melee interaction table,
damage formulas, System.Random sequences and the incident director's draws). A bot then plays every level of every
campaign, the incident and the experiment levels. `test/licence.test.ts` checks every shipped asset against
`ASSET-MANIFEST.csv` (size, SHA-256, free licence, source) and that the locale file is read from its `Table` and
covers every key the UI uses. See `re/madness/NOTES.md`.
