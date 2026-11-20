# Endless Sky 0.11.4: reverse-engineering notes

Reference tree: `re/endlesssky/orig/endless-sky-0.11.4` (from `fetch.sh`; v0.11.4, 2026-10-31).
Everything below is read from that tree; the port's files are named in parentheses. The data files
are used unchanged, so every number in this port comes from the release unless a deviation is named.

## Data and loading

* `source/DataFile.cpp`, `source/DataNode.cpp`: the indentation-based format. A line is a node; a
  quoted token is `"..."` or `` `...` ``; `#` outside a quote starts a comment; deeper-indented lines
  are children. `src/data/node.ts` is a direct translation, including the original's empty-token
  case and the byte-order mark.
* `source/GameData.cpp` and `source/UniverseObjects.cpp`: the loaders called for `trade`, `system`,
  `planet`, `ship`, `outfit`, `government`, `fleet`, `shipyard`, `outfitter`, `start`, `effect`.
  The port loads the same top-level nodes. Missions, events, persons, conversations, phrases and
  news are counted but not simulated (README).
* `source/Outfit.cpp` stores attributes as integer multiples of 1/10,000 (`ATTRIBUTE_PRECISION`).
  `src/data/attributes.ts` does the same, so `0.1 + 0.2` attributes behave as in the original.
* `source/Outfit.cpp: Outfit::Add` adds `cost`, the separate `mass` field and every attribute. In
  0.11 the ship's `"mass"` is the Outfit mass field, not an attribute; `shipAttributes` adds the
  outfit masses separately (`src/data/gamedata.ts`).
* `source/Ship.cpp: FinishLoading` sets the base attributes `"gun ports"` and `"turret mounts"` from
  the hardpoint counts. `src/sim/ship.ts` does this before an outfit is checked for fit.

## The galaxy

* `source/System.cpp`: `SetDate` places a stellar object at
  `Angle(daysSinceEpoch * speed + offset).Unit() * distance`, then adds its parent's position;
  `speed = 360 / period`. `src/sim/world.ts: arrangeSystem` is that loop; the day count is
  `Date::DaysSinceEpoch` (`source/Date.cpp`, `src/sim/date.ts`).
* Stellar radius (`source/StellarObject.cpp: Radius`) is half the smaller sprite dimension, with a
  star capped at 80 pixels. The port uses the loaded image's dimensions.
* `source/System.cpp: UpdateNeighbors` uses `DEFAULT_NEIGHBOR_DISTANCE = 100` for map visibility;
  the port's route only follows `link` entries (hyperspace links).
* Planet data: `source/Planet.cpp`, default port services in `source/Port.cpp`
  (`LoadDefaultSpaceport`: all recharges + all services). A planet with a `spaceport` text is thus a
  full port in the port, and landing recharges the ship.

## Flight physics

* `source/Ship.cpp: DoMovement` (0.11.4): turning and thrusting spend their resource costs by
  `ResourceLevels::FractionalUsage`; `Turn(TurnRate * slowMultiplier)`, then
  `acceleration += angle.Unit() * command * Acceleration()`. Drag is
  `dragAcceleration = acceleration - velocity * DragForce() * accelerationMult`, scaled by
  `0.5 * (acceleration.Unit().Dot(dragAcceleration.Unit()) + 1)`, with the original's STOP fudge.
  `src/sim/ship.ts: move` is a translation (the port has no `slowness` DoT, so the slow multiplier is
  normally 1).
* `TurnRate = turn / InertialMass * (1 + turn multiplier)`;
  `Acceleration = thrust / InertialMass * (1 + acceleration multiplier)`;
  `Drag = min(drag / (1 + drag reduction), InertialMass)`;
  `DragForce = drag >= mass ? 1 : drag / mass`; `InertialMass = Mass / (1 + inertia reduction)`;
  `Mass = attributes.Mass() + cargo.Used()` (`source/Ship.cpp`).
* `source/Ship.cpp: DoGeneration` (0.11.4's `ShipAttributeCache` formulas): shield and hull repair
  with `DoRepair`, energy/fuel generation and consumption, heat generation, cooling efficiency,
  active cooling, fuel-to-energy conversion, `heat -= heat * HeatDissipation` with
  `HeatDissipation = .001 * "heat dissipation"`, overheat damage, the min-hull threshold
  (`0.1*(1-transition)+0.5*transition`, `transition = 1/(1+0.0005*hull)`) and disabled recovery.
  `src/sim/ship.ts: generate`.
* `source/Ship.cpp: CacheAttributes` capacities: shields/hull from `"shields"`/`"hull"`, energy from
  `"energy capacity"`, fuel from `"fuel capacity"`. `src/sim/ship.ts` constructor.
* `source/Weapon.cpp`: the weapon fields used here (velocity, lifetime, reload, inaccuracy,
  firing costs, shield/hull damage, hit force, blast radius, piercing, homing, turn, acceleration,
  drag, submunitions, `icon` = secondary weapon). `src/data/gamedata.ts: loadWeapon`.
* `source/Projectile.cpp: Move`: lifetime, homing turn/acceleration, `position += velocity`; the
  original fires projectiles from `start - .5 * velocity` (`Hardpoint::Fire`). `src/sim/ship.ts`.
* `source/DamageProfile.cpp: CalculateDamage`: while shields are up, `shieldFraction = 1 -
  piercing`; shield damage is applied to the shields and hull damage is multiplied by
  `1 - shieldFraction`; hit force is unaffected; blast damage scales as
  `1 / (1 + r^4)^2`. `src/sim/ship.ts: takeDamage` implements the no-protection/no-dropoff case.
* `source/AI.cpp`: the port's AI is a documented heuristic (nearest hostile, turn, thrust, fire in
  range); the original's personality/formation/order code is not translated.

## Economy and account

* `source/System.cpp`: `Price::Update` is `price = base + int(-100 * erf(supply / 20000))`;
  `StepEconomy` keeps 89%, exports 10% and adds `Normal() * 2000`; `KEEP = .89`, `EXPORT = .10`,
  `VOLUME = 2000`. `src/data/gamedata.ts` and `src/sim/pilot.ts`.
  `GameData::StepEconomy` applies purchases before the daily step; the port records purchases in
  `pilot.economy` and applies them in `stepDay` (the price shown while trading does not move until
  the next day, as in the original).
* `source/Mortgage.cpp`: `Payment = principal * interest * (1+interest)^term /
  ((1+interest)^term - 1)`, rounded, at least 1; a missed payment adds
  `round(principal * interest)`. `src/sim/pilot.ts: mortgagePayment`.
* `source/Date.cpp: DaysSinceEpoch` starts at year 1; the port's `GameDate` reproduces it, including
  Zeller's weekday and `DaysSinceYearStart`. Start date: `data/starts.txt` default start,
  16 Nov 3013.
* `source/PlayerInfo.cpp: Save` and `source/Ship.cpp: Save`: the section names the port writes
  (`pilot`, `date`, `system`, `planet`, `credits`, `ship`, `outfits`, `cargo`, `crew`, `fuel`,
  `shields`, `hull`, `position`, `conditions`, `visited`, `economy`) and reads back.
  The port's file is `pilot.txt` in the account storage; the original's `data/`-driven mission and
  event sections are not written.

## Reference values checked by the tests

* Counts: 694 systems, 619 planets, 917 ship definitions, 938 outfits, 10 trade commodities.
* Star Barge: cost 190,000; shields 600; hull 1000; drag 2.2; mass 80; cargo 50; outfit space 130;
  default Hyperdrive, X1700 Ion Thruster (thrust 13.545), X1200 Ion Steering (turn 288).
* Energy Blaster: velocity 10.625, lifetime 48, reload 12, shield damage 10.6, hull damage 6.6,
  firing energy 5.8, firing heat 18, inaccuracy 3.
* Rutilicus: position (-535, 273), links to Arcturus, Cebalrai, Holeb and Menkent; New Boston at
  distance 513.86 with landscape `land/water2` and the Basic Ships shipyard.
* Default start: 480,000 credits, 480,000 mortgage, 0.4% daily interest, 365 days, Rutilicus/New
  Boston, 16 Nov 3013.

## Assets

* `re/endlesssky/tools/build-assets.py` copies `data/**` and the referenced `sounds/**` unchanged;
  PNGs become lossless WebP (Pillow, `lossless=True, exact=True`; verified pixel-identical on the
  font and sample sprites by the build); the original JPG photographs are copied unchanged.
* `re/endlesssky/tools/licence.py` reads the release's Debian `copyright` and refuses any file whose
  license is not GPL-3+, CC-BY-SA-4.0, CC-BY-4.0, CC-BY-3.0, CC0 or public-domain. The 101 images
  and 3 sounds left out are listed in `web/games/endlesssky/LICENSE.md`; the per-file manifest is
  `web/games/endlesssky/assets/licenses.json`.
* The two bitmap font atlases are `images/font/ubuntu14r.png` and `ubuntu18r.png`; the renderer
  (`src/render/font.ts`) recomputes the original's advances by scanning the atlas exactly as
  `source/text/Font.cpp: CalculateAdvances` does, and draws with `KERN = 2`.

## Not reverse-engineered / not ported

Missions and conversation conditions, events and the war timeline, fleet ownership and escorts,
boarding/capture, fighters and bays, asteroid fields and mining, flotsam and salvage, cloaking,
scanning, the original's `AI.cpp` personalities and the exact panel layouts. The README lists these
as missing; no test claims them.
