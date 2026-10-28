# Frozen Bubble: notes

## Reference version

**Frozen Bubble 2.2.0** (2008), the last release of the Perl game, built from source and run here as the
oracle; the CPAN repackaging Games-FrozenBubble 2.212 was not needed. `fetch.sh` downloads
`frozen-bubble-2.2.0.tar.bz2` (20,585,572 bytes, sha256
`dada92322ef3adb75df7a4270b2e76c572c3f8e42006ed3a5aaeefa68fcaa5b7`) from the Internet Archive's copy of
frozen-bubble.org (the site itself answers 403) into `orig/` (gitignored). Nothing of the archive is
committed; `tools/pack.py` turns the unpacked tree into the port's `web/games/frozenbubble/assets/`.

## Licences

Checked file by file in the 2.2.0 tree:

* `COPYING`: GPL version 2. `README`: "Copyright (c) 2000-2008 The Frozen-Bubble Team ... GNU General
  Public License version 2". The program, `c_stuff` (`fb_c_stuff.xs`, `lib/fb_stuff.pm`, `fb_net.pm`,
  `fb_net_discover.pm`, `FBLE.pm`), `frozen-bubble-editor` and `server/` carry GPL-2 headers ("version 2",
  no "or later").
* `c_stuff/SDL/Sound.pm`, `Music.pm`, `Mixer.pm`, `Surface.pm`: copies of SDL_perl modules (David J. Goehrig,
  SDL_perl is LGPL-2.1); the port does not ship them. Its SDL layer reproduces what SDL_perl 2.1.2 and SDL
  1.2.15 (LGPL-2.1) do, which the GPL allows.
* The data: `gfx/` (including the bitmap fonts `font.png`, `font-hi.png`, `font2.png` and the flags),
  `snd/` (Ogg sounds and musics, the XM module), `data/levels`, `data/plasma.raw`, the demo records
  `data/demo*.bz2`, `icons/`: no licence of their own, distributed in the package under its GPL-2 (Debian
  ships them the same way, `copyright`: GPL-2). The authors in `AUTHORS` (artwork Alexis Younes and Amaury
  Amblard-Ladurantie, soundtrack Matthias Le Bidan). All free.
* `po/`: translations (GPL-2, by their translators); not used (the port is English only).
* Fonts: the package ships none for its text; it asks SDL_Pango for "sans", on Linux DejaVu Sans. The port
  ships DejaVu Sans 2.37 (Bitstream Vera licence plus public domain changes; free).
* glibc's `sin`/`cos` (`sysdeps/ieee754/dbl-64/s_sin.c`, IBM Accurate Mathematical Library, LGPL-2.1+),
  translated in `src/fb/libm.ts` to get the same doubles.

The port is GPL-2.0-only (`web/games/frozenbubble/LICENSE.md`). The server module
(`server/.../games/frozenbubble/`) follows the original game server's rules and is not distributed.

## The oracle (`oracle/`)

`build.sh` builds, with nix (glibc 2.44, gcc 16, perl 5.42.3), from pinned sources (`fetch-deps.sh`):
SDL 1.2.15 (C blitters, `--disable-assembly`, dummy video and audio, patched for the hooks), SDL_image
1.2.12, SDL_mixer 1.2.12 (only to link), SDL_Pango 0.1.2 with Debian's patches (the Frozen Bubble API
additions among them), SDL_Perl 2.1.2 (the version Frozen Bubble's INSTALL names; 1.20.x is not on
BackPAN), Locale-gettext 1.07 and c_stuff. `run.sh` runs a session (`web/games/frozenbubble/test/sessions/`)
with `shim.c` preloaded:

* a virtual clock behind SDL_GetTicks, SDL_Delay, time(), gettimeofday();
* the session's keys and mouse through SDL's own queue (key repeat and unicode are SDL's);
* every screen update hashed (FNV-1a of the 640x480 RGB bytes): one `F` line;
* a model of SDL_mixer in virtual time: every Mix_* call becomes a line (sounds and musics are compared as
  calls, not samples);
* SDL_Pango's text replaced by a placeholder of the same size after layout (the text's string, position and
  size are compared, the glyph pixels are not);
* `PERL_HASH_SEED=0`, `PERL_RAND_SEED=1`, ASLR off, no AVX2/FMA (libm), a fixed work directory.

`FBOracle.pm` (loaded with `perl -M`) adds the state trace: every `srand`, the number of `rand` calls, and
after every frame of `maingame` each player's bubbles, launcher, next bubbles, malus, falling and exploding
bubbles, score and penguin; every `print_` and SFont text.

Two patches to the game, both without effect on what a player sees:

* `game-00-perl542.patch`: `my %x if 0` (a static variable by accident of old Perls) is a syntax error in
  Perl 5.42; `CORE::state` is what it meant.
* `game-10-hash-order.patch`: three places iterate over a hash, whose order is unspecified in Perl (and
  varied between runs even with a fixed hash seed, through heap addresses in keys): `fastuniq` keeps the
  first occurrence in list order, the menu's entries are drawn sorted by position, the editor redraws
  neighbouring bubbles in coordinate order. The port does the same.

The oracle's own nondeterminism that the port does not copy: the high score list's scrolling background
gets its width from a surface's address (`scroll_list_background` passes a Rect built from a surface
object): the port uses the real width; the demo's pause spins without sleeping (the port sleeps 1 ms per
turn).

REA was not needed: the reference is the source, and the oracle is the original program itself, built from
that source and instrumented, so every question about timing, rendering and randomness was answered by
running it.

## Findings (what the port must do to match)

* **Randomness.** Perl's `rand` is drand48 with a 48-bit state seeded from a 32-bit `srand`
  (`src/fb/rand.ts`); `c_stuff` uses glibc's `random()` (TYPE_3, seed 1 until the game calls srand).
  `rand` calls are counted per frame in the state trace.
* **libm.** `sin`/`cos` in the effects (`c_stuff`: plasma, waves, the menu's logo effects) need glibc's
  results: a port of its `s_sin.c` is bit-identical (2 million arguments checked).
* **SDL 1.2 blitters** (`src/video/SDL_blit_A.c`, `SDL_blit_N.c`, `SDL_blit_1.c`): per-pixel alpha with
  `(((s - d) * a) >> 8) + d` on unsigned values, `BlitRGBtoRGBPixelAlpha` special cases for alpha 0 and 255,
  the palette blitters for the GIFs, colour key plus surface alpha; `SDL_UpperBlit` clips and writes the
  clipped rectangle back into the destination rect.
* **SDL_perl 2.1.2.** `display_format` and `display_format_alpha` convert the surface in place;
  `SDL::Rect` fields are Sint16/Uint16 and Perl numbers are truncated (SvIV) when stored.
* **SDL_image 1.2.12.** PNGs and GIFs load into the surfaces SDL_image makes of them (palette images as
  8-bit surfaces, transparency as a colour key or an alpha channel), since the blitter chosen depends on
  it (`src/sdl/image.ts`).
* **Text.** SDL_Pango's layout with modern Pango: advances and kerning of DejaVu Sans in Pango units,
  measured by `pango-metrics.c` (`fonts.json`); widths are truncated to whole pixels where SDL_Pango
  does.
* **Data::Dumper.** The files the game writes (`rc`, `highscores`, ...) are Data::Dumper output with sorted
  keys; Perl 5.42 writes booleans as `!!1`/`!!0`.

## Online play

The original's network game: `fb_net.pm` connects to a game server (`server/`, C), whose lobby protocol
(nicks, open games, chat) the website's lobby replaces. In a game every client sends lines
`<id><command><args>` that the server relays to the others: `a` angle, `f` fire (angle and next colour),
`s` stick (position, colour, the next colours), `m` malus bubble, `M` malus stuck, `g` malus sent to a
nick, `A` malus target, `r` key release, `t` chat, `p` ping, `n` ready for the next game, `!` the leader's
start synchronisation, `F` the winner a client saw, `l` (from the server) a player left. The leader (the
lowest id) sent each game's starting bubbles (`b|cx|cy<colour>`, `N`, `T`); here the server's module
draws them from the round's seed. The module's rules are in its class comment; the module was checked with
loopback tests, not against the original C server.
