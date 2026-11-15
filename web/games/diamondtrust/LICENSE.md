# Diamond Trust of London: license and credits

**Diamond Trust of London** was designed and developed by **Jason Rohrer** (music by Tom Bailey) and
released for the Nintendo DS in 2012. This port uses the open-source source tree at commit
`fb9e51a4d1f007d20a8b93a90394f5c12c2c62d9` (<https://github.com/jasonrohrer/DiamondTrust>), fetched by
`re/diamondtrust/fetch.sh`.

## The original: public domain

Jason Rohrer placed the game in the public domain:

* the source tree's own copyright string, `build/macOSX/DiamondTrust.app/Contents/Info.plist`:
  `NSHumanReadableCopyright` = "Public Domain, 2010";
* Rohrer's SourceForge project `hcsoftware` (<https://sourceforge.net/projects/hcsoftware/>), which hosts
  the `DiamondTrust` repository, is licensed **Public Domain**;
* Wikipedia ("The game has been placed in the public domain"), citing Rohrer's Kickstarter update
  "Public Domain" (2013-05-03).

The repository has no separate LICENSE/COPYING file. Public domain allows commercial use and is
compatible with GPL-3.0.

| Asset group | Source | Status |
| --- | --- | --- |
| Rules and code (reference for `src/`, `server/.../diamondtrust/`) | `gameSource/*.cpp`, by Jason Rohrer | public domain |
| Graphics (`assets/*.png`: map, map names, units, portraits, diamond, vault, panels, buttons, paper, title) | `gameSource/graphics/`, drawn by Jason Rohrer | public domain |
| Bitmap fonts (`assets/font8.png`, `font16*.png`) | `gameSource/graphics/`, Jason Rohrer | public domain |
| Text (labels, help strings) | `gameSource/languages/English.txt` | public domain |
| `crcHash.cpp` (not used by the port) | Bob Jenkins | public domain (file header) |

Not used: the music (Tom Bailey's loops are not in the source repository), the satellite images
`angola_satellite*.png` (NASA Visible Earth, `graphics/world_notes.txt`), the Nintendo and indiePub
logos, and the TrueType fonts under `documentation/artwork/fonts/` (packaging artwork only). No ROM and no
source archive are committed; `re/diamondtrust/orig/` is not committed.

## This port

The TypeScript rules engine, browser UI, online adapter, server module (`TrustGame.java`,
`DiamondTrustModule.java`) and the protocol schema are by the freegames project. They are altered
source, not the original program. The website and game SDK are GPL-3.0-or-later with an additional
permission under section 7 (`web/LICENSE.md`); the game's own code here is released under the same
public-domain terms as the original.

The files under `assets/` are copied unchanged from `gameSource/graphics/` by
`re/diamondtrust/tools/build-assets.py`.

## Favicon

The favicon of the game's page (`web/icons/diamondtrust.png`, 48x48, and
`web/icons/diamondtrust-180.png`, 180x180; drawn by `web/scripts/icons.py`) is the original's
`diamond.png` (Jason Rohrer, public domain) with its corner colour keyed out, unscaled at 48 px and
scaled 5x at 180 px, on an olive tile we drew.
