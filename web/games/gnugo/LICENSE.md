# License and credits

## GNU Go 3.8

This port is a translation of parts of GNU Go 3.8 into TypeScript and is distributed, like GNU Go, under
the **GNU General Public License, version 3 or (at your option) any later version** (GPL-3.0-or-later):
<https://www.gnu.org/licenses/gpl-3.0.html>. The package's `COPYING` has the full text.

    GNU Go 3.8
    Copyright 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007
    2008 and 2009 by the Free Software Foundation, Inc.

    This program is free software; you can redistribute it and/or modify it under the terms of the GNU
    General Public License as published by the Free Software Foundation - version 3 or (at your option)
    any later version. GNU Go comes with NO WARRANTY to the extent permitted by law.

Translated parts: the board (`engine/board.c`, `engine/hash.c`), unconditional life
(`engine/unconditional.c`), the Monte Carlo player (`engine/montecarlo.c`, the Monte Carlo part of
`engine/genmove.c`), the random number generator (`utils/random.c`, TT800 after Matsumoto and Kurita) and
random seed (`utils/gg_utils.c`), fixed handicap (`engine/handicap.c`), the game functions
(`engine/interface.c`, `engine/sgffile.c`, `engine/printutils.c`), the SGF reader and writer
(`sgf/sgfnode.c`, `sgf/sgftree.c`, `sgf/sgf_utils.c`), the ASCII interface (`interface/play_ascii.c`) and
the options, help and copyright texts of `interface/main.c`.

`assets/mc_montegnu_classic.db` is the package's `patterns/mc_montegnu_classic.db` (GPL-3.0-or-later),
unchanged: the default patterns of the Monte Carlo player's random games.

The licence of every file of the package, and why nothing in it is unfree, is recorded in
`re/gnugo/LICENSE.md`.

### Authors (the package's AUTHORS)

GNU Go authors (in chronological order of contribution) are Man Li, Wayne Iba, Daniel Bump, David
Denholm, Gunnar Farnebäck, Nils Lohner, Jerome Dumonteil, Tommy Thorn, Nicklas Ekstrand, Inge Wallin,
Thomas Traber, Douglas Ridgway, Teun Burgers, Tanguy Urvoy, Thien-Thi Nguyen, Heikki Levanto, Mark
Vytlacil, Adriaan van Kessel, Wolfgang Manner, Jens Yllman, Don Dailey, Måns Ullerstam, Arend Bayer,
Trevor Morris, Evan Berggren Daniel, Fernando Portela, Paul Pogonyshev, S.P. Lee, Stéphane Nicolet,
Martin Holters, Grzegorz Leszczynski and Lee Fisher. The package's THANKS names many more who helped.

### The reference version

`gnugo-3.8.tar.gz` from <https://ftp.gnu.org/gnu/gnugo/> (3,200,454 bytes, sha-256
`da68d7a65f44dcf6ce6e4e630b6f6dd9897249d34425920bfdd4e07ff1866a72`), downloaded by `re/gnugo/fetch.sh`.
Home page: <https://www.gnu.org/software/gnugo/>.

## Favicon

The favicon of the game's page (`web/icons/gnugo.png`, 48x48, and `web/icons/gnugo-180.png`, 180x180;
drawn by `web/scripts/icons.py`) is the freegames project's own drawing and uses no art of the game: a
black and a white stone on a piece of Go board. It is under the website's license (GPL-3.0-or-later,
`web/LICENSE.md`).
