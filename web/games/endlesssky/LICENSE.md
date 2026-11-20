# Endless Sky: license and credits

This port is made from **Endless Sky 0.11.4** (released 2026-10-31), the latest stable release of
Endless Sky. The reference source tree, data, sprites, sounds and the original's copyright catalog
are downloaded by `re/endlesssky/fetch.sh` from
<https://github.com/endless-sky/endless-sky/releases/tag/v0.11.4> (source archive sha256
`971399cc91956171261f5a36429572201a35662db2b1d3615fd6043ee4a38a61`). The archive is never
committed.

Endless Sky is by **Michael Zahniser** and the **Endless Sky community**; the original's
`credits.txt` (copied as `ORIGINAL-CREDITS.txt`) names its developers, artists, musicians, writers
and translators, and `changelog` records every contributor. The original's copyright catalog is
copied verbatim as `ORIGINAL-COPYRIGHT.txt`; the GPL text is `LICENSE-GPL-3.0.txt`.

## The original's licenses

`copyright` (the Debian-format catalog in the release, copied unchanged) says:

```
Files: *
Copyright: Michael Zahniser <mzahniser@gmail.com>
           endless-sky contributors (see credits.txt and changelog)
License: GPL-3+

Files: images/*
Copyright: Michael Zahniser <mzahniser@gmail.com>
License: CC-BY-SA-4.0
```

and then gives each image, sound and photograph its own author and license. The data files
(`data/**`), the source, the fonts (`images/font/`) and the program icons (`icons/`) are
GPL-3.0-or-later. The sprites are CC-BY-SA-4.0, except the groups below; the sounds are public
domain, CC-BY-3.0 or CC-BY-SA-4.0 as their blocks say.

**Compatibility.** GPL-3.0-or-later code and data, CC-BY-SA-4.0 artwork, CC-BY-3.0/4.0, CC0 and
public-domain assets can be distributed together: CC BY-SA 4.0 is one-way compatible with GPLv3
(Creative Commons' compatibility statement), and CC BY 3.0 is GPL-compatible. The images stay under
CC-BY-SA-4.0 (they are not relicensed); the port's code and the original's data are GPL-3.0-or-later.

## The assets this port uses

`re/endlesssky/tools/build-assets.py` copies the original's data files and sounds unchanged and
converts every PNG sprite to **lossless WebP** (pixel-for-pixel identical, no lossy step); the
original's JPG photographs are copied unchanged. The
full file-by-file list, with each file's original path, license and copyright holder, is committed
as **`assets/licenses.json`** (generated from `copyright`; 4,415 files). Grouped by author and
license:

| Files | Author (from `copyright`) | License |
| --- | --- | --- |
| `data/**/*.txt` (204 files) | Michael Zahniser and the Endless Sky contributors | GPL-3.0-or-later |
| `images/ship`, `effect`, `projectile`, `star`, `planet`, `land`, `_menu`, `font` | Michael Zahniser (1,997 files in the whole image tree) | CC-BY-SA-4.0, except the font's underlying Ubuntu Font Licence 1.0 (below) |
| the same folders | Becca Tommaso (1,265), Saugia (719 + 49 public domain), Gefüllte Taubenbrust (574), Azure (488), Daeridanii (197 + 4 CC0), @Karirawri (158), RisingLeaf (150), Frederick Goy IV (114), Evan Fluharty (65), Matteo "Lead" M. (60), Lia Gerty (50 + 5), Maximilian Korber (50 + 3), Iaz Poolar (43), 1010todd (21 + 6 + 1), Arachi-Lover (20 + 1), Jack George (10), Zachary Siple (10), Benjamin Jackson (8), Amazinite (6), Zitchas (6), Anarchist2 (5), Nate Graham (4), bene-dictator (4 + 1), Ejo Thims (4 + 2), Scrinarii1337 (2), Griffin Schutte (2), Matthew Smestad (2), Dave Flowers (2), @RestingImmortal, Brian Swift, mOctave, Benjamin Hauch, David Stark, Lineth (2), and the other holders named in `assets/licenses.json` | CC-BY-SA-4.0 |
| `images/land/*` (default, morgueFile / Unsplash-donated-before-2017 / NASA / USGS / NPS photos), `sounds/*` (default) | the photographers and sound recorders named in `copyright`; "Various" for public-domain sounds | public domain |
| `images/land/station53`–`57`, `snow*`, `water28`–`32` and the other pxhere/pixabay/Unsplash-donated ones | N/A (CC0 Public Domain) or the named photographers | CC0 |
| `images/land/hills14`, `sounds/asteroid crunch large.wav`, `sounds/hion*`, `sounds/archonteleport*` | Daniel Läubli, "BW_Clowes", michael_kur95, oldestmillennial | CC-BY-3.0 |
| `sounds/thrasher.wav`, `sounds/point defense.wav`, `sounds/*` by Lineth | Lineth | CC-BY-SA-4.0 |

`images/font/ubuntu14r.png` and `ubuntu18r.png` are the original's bitmap font atlases. The
`copyright` catalog licenses them as `images/*` under CC-BY-SA-4.0; the glyph designs come from the
Ubuntu font family (Canonical Ltd., Ubuntu Font Licence 1.0, <https://ubuntu.com/legal/font-licence>).
The atlases are used unmodified (except the lossless WebP conversion) as part of the game's
interface.

The sounds are copied unchanged from `sounds/`; the data files are copied unchanged from `data/`.
The images are the originals with only a lossless container conversion; no pixel was changed. If you
reuse them, keep the attribution above, the license notice and the link to the license
(<https://creativecommons.org/licenses/by-sa/4.0/>), and indicate that the format was changed
(PNG → lossless WebP; JPG unchanged). The CC-BY-SA-4.0 requires the same license for adaptations of
the images; this port does not adapt them beyond the format conversion.

### Assets not used (and why)

The task's rule is that no asset may be non-commercial, no-derivatives or incompatible with
GPL-3.0-or-later. Two groups in the original's `copyright` do not qualify, so the port leaves them
out and this list is complete. All other files of the release are used.

**CC-BY-SA-3.0 (not GPL-compatible; 64 images and 3 sounds):**

* `images/land/bwerner*.jpg`, `myrabella*.jpg`, `dmottl*.jpg`, `mfield*.jpg`, `loc3*`,
  `station5*`, `mountain46*`, `desert21*` (Wikimedia Commons photos; those planets fall back to no
  landscape or their planet sprite in this port);
* `images/outfit/harvested yottrite*`, `images/effect/flotsam yottrite*` (Becca Tommaso);
* `images/planet/stationh-ancient0/1/2*` (Derived from Michael Zahniser);
* `images/scene/ssil vida alert hologram*`, `remnant remote spaceport*` (J Everett Nichol);
* `images/effect/ember tear/*` (23 files), `images/outfit/ember tear*` (X-27);
* `sounds/heavy rocket hit.wav`, `sounds/meteor.wav`, `sounds/explosion huge.wav` (Mike Koenig,
  "18hiltc").

**Unsplash license (not a free license compatible with the GPL; 36 files):**
`images/land/beach18*`, `canyon16*`, `clouds11*`, `clouds14*`, `clouds15*`, `desert19*`, `fog15*`,
`forest13*`, `forest14*`, `forest15*`, `hills13*`, `lava15*`, `mountain33*`, `mountain38*`,
`mountain41*`, `mountain45*`, `peripheria*`, `sky14*`, `snow26*`–`30*`, `snow33*`, `snow36*`–`39*`,
`station53*`–`57*`, `water28*`, `water30*`–`32*`, `tundra1*`.

Those files are not in `web/games/endlesssky/assets/`; the build script refuses any license outside
`GPL-3+`, `CC-BY-SA-4.0`, `CC-BY-4.0`, `CC-BY-3.0`, `CC0` and `public-domain` (`licence.py`). The
affected planets are 71 land images (about an eighth of the planets' landscapes), three station
orbit sprites, two spaceport scenes, the Yottrite outfit/effect and the Ember Tear weapon effects;
the rest of the galaxy and its ships are complete.

## This port

The TypeScript port, its loader, simulation, renderer, screens and tests (`src/**`), the asset build
script (`re/endlesssky/tools/build-assets.py`) and the licence checker (`re/endlesssky/tools/licence.py`)
are by the freegames project. The port is a derivative of Endless Sky and is licensed
**GPL-3.0-or-later**, like the original's code and data; the website and game SDK are GPL-3.0-or-later
with an additional permission under section 7 (`web/LICENSE.md`). This program comes with ABSOLUTELY
NO WARRANTY. The source of the port and of the original is available through the site's "Licenses &
source" page.

The port uses no third-party runtime library beyond the website's own dependencies (Vite for the
build, the SDK for account storage). The bitmap-font renderer (`src/render/font.ts`) is a translation
of the original's `Font.cpp`; the physics (`src/sim/ship.ts`), data model (`src/data/*`) and world
(`src/sim/world.ts`) translate the corresponding Endless Sky files.

## Favicon

`web/icons/endlesssky.png` (48x48) and `endlesssky-180.png` (180x180) are drawn by
`web/scripts/icons.py` from the original's program icon `icons/icon_512x512.png`, copied into the game's folder as
`icon-source.png` (Endless Sky,
GPL-3.0-or-later per the `copyright` catalog): the icon is scaled to the site's rounded tile,
unmodified otherwise.

## Music

The original repository does not contain the music; Endless Sky downloads its soundtrack separately.
The port therefore has no soundtrack, and no music file is copied or redistributed.
