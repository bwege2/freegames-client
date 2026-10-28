# License and credits

## GNU Chess 6.3.0

This port is a translation of GNU Chess 6.3.0 into TypeScript and is distributed, like GNU Chess, under
the **GNU General Public License, version 3 or (at your option) any later version**
(GPL-3.0-or-later): <https://www.gnu.org/licenses/gpl-3.0.html>. The package's `COPYING` has the full
text.

    GNU Chess 6
    Copyright (C) 2001-2025 Free Software Foundation, Inc.

    This program is free software: you can redistribute it and/or modify it under the terms of the GNU
    General Public License as published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
    even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
    General Public License for more details.

GNU Chess is based on the two research programs Cobalt by Chua Kong-Sian and Gazebo by Stuart
Cracraft. Version 6 has three parts, and so has the port:

- the **frontend** (`src/frontend/`): the command interface of GNU Chess 5, by Chua Kong Sian, Stuart
  Cracraft, Lukas Geyer, Simon Waters and others; its PGN reader lexpgn by David A. Wheeler;
- the **adapter** (`src/adapter/`): PolyGlot 1.4 by Fabien Letouzey, which translates between the
  frontend's xboard protocol and the engine's UCI protocol and has the opening book;
- the **engine** (`src/engine/`): Fruit 2.1 by Fabien Letouzey.

The opening book `assets/smallbook.bin` is the one the package installs (`src/smallbook.bin`),
unchanged.

### Authors (the package's AUTHORS)

Contributions that warranted legal paper exchanges with the Free Software Foundation:

- Antonio Ceballos
- Chua Kong Sian
- Daniel Díaz
- David A. Wheeler
- Elvis Vasconcelos
- Fabien Letouzey
- John Stanback
- Lukas Geyer
- Pranav Deshpande
- Simon Waters
- Stuart Cracraft

### Thanks (the package's THANKS)

"The contributions from uncountable people have been very helpful throughout the many years GNU Chess
has been around." In the age of series 6: Stuart Cracraft, Simon Waters, Karl Berry, Sebastián
Reguera, Sebastian Pipping, Sylvain Beucler, Josef Reidinger, Hafiz Muhammad Luqmand, Kamil
Rytarowski, Vincent Legout, Benno Schulenberg, Pawel Koziol, Santiago Vila, H.G. Muller, Michael
Vetter, Clayten Gillis, Norbert Raimund Leisner, Mark Hermeling, Henry Ballentine, Ryan Sarson, Jens
Schleusener, David Seifert, Michael Vaughan, Sam James, Baudaux Benoit, Stephan Eisenbeiß, Rudolf
Polzer; and the translators Rafael Ferreira, Rafael Fontenelle, Tianze Wang, Boyuan Yang, Joe Hansen,
Benno Schulenberg, Felipe Castro, Stéphane Aulery, Leandro Regueiro, Antonio Ceballos, Mario
Blättermann, Sebastiano Pistore, Johnny A. Solbu, Remus-Gabriel Chelu, Мирослав Николић, Anders
Jonsson, Yuri Chornoivan, Trần Ngọc Quân and the Translation Project Robot.

### The reference version

`gnuchess-6.3.0.tar.gz` from <https://ftp.gnu.org/gnu/chess/> (835,620 bytes,
sha-256 `0b37bec2098c2ad695b7443e5d7944dc6dc8284f8d01fcc30bdb94dd033ca23a`), downloaded by
`re/gnuchess/fetch.sh`. Home page: <https://www.gnu.org/software/chess/>.

## Test positions

`re/gnuchess/oracle/positions*.txt` contain the Bratko-Kopec test (Danny Kopec and Ivan Bratko, 1982),
positions of Fred Reinfeld's *Win at Chess* (1958) as the widely shared WAC EPD file has them,
perft positions from the Chess Programming Wiki, and endgame and mate positions; positions are
facts of the game and are used to compare the port with the original only.
