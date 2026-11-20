# Madness Interactive Reloaded 0.51.1: notes for the port

Source: tag `v0.51.1-beta` of https://github.com/studio-minus/madness-interactive-reloaded (`fetch.sh`), C# on .NET 9
with Studio Minus's engine Walgelijk (NuGet 0.30.0; source https://github.com/mestiez/Walgelijk). The game logic is
readable source, so the port reads it rather than a binary; where the source alone does not settle a number (noise,
curve evaluation, parsing, the order of transforms), the oracle runs the original code.

## The oracle (`oracle/`)

`oracle/golden.sh` builds MIR.dll from the reference source with the .NET 9 SDK (the Harmony mod-loader submodule
taken from NuGet, the asset-packing post-build step left out; no code changed) and runs `oracle/Oracle.cs`, which
calls MIR's and Walgelijk's own functions without a window and writes `web/games/madness/test/golden/oracle.json`:

| Section | MIR / Walgelijk code called | Port |
| --- | --- | --- |
| noise | `Walgelijk.Noise.GetValue`, `GetSimplex`, `GetFractal(…, 3)` (FastNoise Lite, frequency 20, seed 1337), 300 points | `src/engine/noise.ts`, equal to 1e-6 |
| utilities | `Utilities.DeltaAngle`, `LerpAngle`, `SmoothApproach`, `SmoothAngleApproach`, `RotatePoint`, `VectorToAngle`, `Snap`, `Easings.*` | `src/engine/util.ts` |
| animations | `AnimationDeserialiser.Load` on all 192 `.anim` files; durations, constraint keys, every limb's curves sampled at 11 times, hand looks | `src/data/animation.ts` |
| stats, armour | `CharacterStatsDeserialiser.Load`, `ArmourDeserialiser.Load` on every file | `src/data/registry.ts` |
| floors | `Level.GetFloorLevelAt`, `Level.IsFlatAt` along every campaign level | `src/data/registry.ts` |
| weapons | `WeaponComponent.GetDamageAtDistance`, `BulletEmitter.GetBulletHoleSize`, `MeleeUtils.GetInteractionResponse` for all 144 pairs | `src/game/combat.ts` |
| random, perlin | `new System.Random(seed)`: `Next(min, max)`, `NextSingle`, `GetItems`, `Shuffle` for 6 seeds; `Noise.GetPerlin` at 200 points | `src/engine/dotnet-random.ts`, `noise.ts` |
| incident | `IncidentConfig.CreateCampaign`'s draws, its lines repeated on MIR's `System.Random` with the level files' numbers, for 5 seeds and kill targets: music, begin, end, shuffled middle levels, the body counts spread to the target, per middle level the enemy limits, weapons, spawn interval and number of spawn instructions | `src/game/incident.ts` |
| characters | a `CharacterComponent` placed as `Prefabs.CreateCharacter` does (made without its field initialisers, which would load the registries), `HandPosingFunctions.FistFight`, `CharacterUtilities.CalculateAnimationResult` and `GetAnimationConstraints` for 10 animations × flipped × 2 scales × 9 times | `src/game/positioning.ts`, `character.ts` |

`CharacterConstants`' static constructor loads two shaders; the oracle packs `base/shaders` into a Walgelijk asset
package (`AssetPackageUtils.Build`, as `MIR --mode pack` does) and registers it.

## Findings

* **Curve keys are not sorted** after parsing: `AnimationDeserialiser.AppendKey` grows the array past the
  constructor's sort, so keys stay in file order; `Curve<T>.Evaluate` then walks them in that order
  (Walgelijk `Shared/Curve.cs`). The port keeps the file order.
* **Frame times** are `frame / (float)fps / globalSpeed` in float; keyframe positions are normalised by the limb's
  longest key time (`markEndOfAnimationData`).
* **`CalculateMixedAnimation`** mixes hand 2's scale from hand 1's previous scale (`Vector2.Lerp(previous.Hand1Scale,
  result.Hand2Scale, …)`); kept.
* **`FactionRelationships.GetAllies` yields the faction itself**, not its ally, so `Faction.AttackHitLayerComposite`
  only ever removes the faction's own layer; kept (`Faction.attackHitLayerComposite`).
* **Transforms**: `TransformComponent.RecalculateModelMatrix` is translate(−pivot) · scale · rotate(around
  rotation pivot × scale) · translate(position) · parent, with System.Numerics' row vectors; the body's pivot
  (0, −0.5) puts its position at the bottom of the sprite, the head's (−0.2·flip, −0.3) at the neck. Textures are
  sampled with v = 0 at the bottom; glyph rectangles of the `.wf` fonts use the same convention (TextMeshGenerator).
* **Backgrounds** carry three layers in their alpha (`shaders/background-*.frag`): 1 in front of the characters,
  0.7 behind, 0.3 behind and taking decals.
* **Physics queries** (`Walgelijk.Physics.PhysicsSystem.Raycast`) return the nearest boundary crossing ahead of the
  origin, also when the origin is inside a collider (that is how bullets find exit wounds); the port tests every
  body instead of walking the chunk grid.
* **Time**: `Game.UpdateRate = 144` (the settings' frame-rate cap), `FixedUpdateRate = 60`; every system uses
  `Time.DeltaTime`, the weapons' VelocitySystem the fixed rate, the ragdolls a 200 Hz distributor, the measured
  velocities 100 Hz. Randomness is one shared `System.Random`. A whole fight therefore cannot be replayed exactly
  against the original; the oracle covers the deterministic functions, and the levels are tested by running them.

* **Registries have no fixed order.** `Registry<T>` is a `ConcurrentDictionary` (Registries/Registry.cs) and string
  hashes are randomised per process in .NET, so `GetAllKeys()` (which IncidentConfig draws levels and weapons from)
  comes out in a different order in every run: an incident's seed does not reproduce the same incident even in the
  original. The port sorts the keys ordinally; the oracle uses the same order, so the draws themselves are compared.
* **Seeded `System.Random`** in .NET 9 is still the legacy subtractive generator (`Net5CompatSeedImpl`):
  `Next(a, b)` is `(int)(Sample() * (b - a)) + a`, `NextSingle` is `(float)Sample()`, `GetItems` calls `Next(n)` per
  item, `Shuffle` is Fisher-Yates from the front with `Next(i, n)`. The incident's spawn-instruction loop calls
  `rand.Next(2, 10)` in its condition, once per iteration; kept.
* **Level scripts** (`LevelScript` objects) are C# compiled at run time; the data has five; the port translates the four in
  played levels (lvl_destination, lvl_roof_1, lvl_cutscene_bossbattle, lvl_incident_begin_1), not the one of the
  debug level face.
* **Cutscenes** (`data/cutscenes/*.json`) are lists of `VideoSlide` (an MP4 and a duration) and `PlayerPosterSlide`;
  a `CutscenePlayer` level object starts one and, with `ProgressLevelOnEnd`, ends the level after it.
* **Improbability disks** are unlocked by `Disk` level objects (a pickup) and stored as one id per line in
  `disks.txt` (UserData.Paths); the enabled set is applied when the player is created (ImprobabilityDisks.Apply).
* **The arena mode** is not reachable in 0.51.1: its main menu button is commented out (MainMenuSystem.cs).
* **Cutscene triggers**: CutscenePlayerSystem starts a cutscene when the player's `GlobalCenter` is within 64 units.
  In lvl_habitation the note's trigger sits at the height of a standing player's centre (floor + 214), but the
  cutscene levels (lvl_cutscene_*) have no floor line and put the trigger on the spawn point at (1, 8), 200 units
  below the centre the port computes. The port also accepts the player's feet, so those cutscenes start at once,
  as they do in the original.
