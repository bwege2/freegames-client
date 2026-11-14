# Typing Warriors

A typing duel with a rating (ELO) per keyboard layout, a course for every layout and a trainer for switching
between two layouts. A game of freegames.stream's own (`"own": true`), made by an AI; there is no original, so
the porting rules do not apply. Licenses: `LICENSE.md`.

## Typing, in every mode

You type what is shown. A wrong key counts as a typo and the cursor waits for the right key; there is nothing to
delete. Speed is counted in words a minute (five correct characters are a word), accuracy as correct keys of all
keys.

## The five duels

One to six players in a room, plus up to five bots. The server sends the words, checks every key, plays the bots
and decides the places.

| Mode | Rules | Who wins |
| --- | --- | --- |
| **Race** | One text of 35 words for everybody. | Whoever is through first. The round ends when every player is through (bots that are not are placed by how far they got), at the latest after 3 minutes. |
| **Last One Typing** | One word per wave, the same for everybody. Its time limit is 1.5 s plus a time per letter that starts at 650 ms and shrinks by 7 % every wave (never below 70 ms); the words get longer. Whoever has not typed the word in time loses one of three lives. | The last one with a life. Out in the same wave is a shared place. At most 60 waves. |
| **Word Loot** | Ten words lie on the table for everybody, each with a different first letter. Type a word's first letter to go for it; the first to finish a word takes it and gets its letters as points; a new word takes its place. Esc or Backspace lets go of a word. Under each word you see who else is typing it and how far they are. About one word in six carries a power-up. 75 seconds. | Most points. |
| **Combo Sprint** | 60 seconds on an endless text. A finished word brings its letters times the combo. Three words in a row without a typo raise the combo by one (×1 to ×5); a typo sets it back to ×1. | Most points. |
| **Switch Wars** | A race over 40 words with **two** layouts. The text is in coloured segments of 4 to 7 words; each segment must be typed with the other layout. When the colour changes, switch your system's keyboard layout and go on. A key typed with the layout that is not due counts as a typo and does not move the cursor. | Whoever is through first. |

Power-ups of Word Loot (the word's badge says which):

| Badge | What it does |
| --- | --- |
| FREEZE | Everybody else cannot type for 2.5 seconds. |
| ×2 | Your words count double for 10 seconds. |
| STEAL | You take up to 10 points from the best of the others. |
| SHUFFLE | Every other word on the table is replaced; whoever was halfway through one starts anew. |

**Words.** English (a to z) or German (with ä ö ü ß), chosen by whoever creates the room. A layout that cannot
type the German letters (the US layouts) is warned before the round: pick English there.

**Play the bots now** starts a round against the chosen bots at once. **Online room** opens the lobby: create a
room or join one; the room's creator chose the mode, the words and the bots.

## ELO

* One rating **per layout**, and one more for Switch Wars (whatever the two layouts). Everybody starts at 1000.
* A round counts as one game against each opponent: won, drawn or lost by place. The expected results come from
  the rating difference (400 points = ten to one), the sum is divided by the number of opponents and multiplied
  by 40 for your first 20 rated rounds with that layout, then by 24. Ratings stay between 100 and 3000.
* A round alone is not rated. A bot counts as an opponent; the bots' ratings never change.
* The server keeps the ratings (score tables `elo-<layout>` and `elo-switch`, one entry per account, the best
  1000 of each). **Ratings** in the menu shows the best of each layout and your last rounds.

**Bots** come in bands of 200 from 800 to 2400 (Snail, Tortoise, Hedgehog, Beaver, Fox, Hare, Falcon, Cheetah,
Lightning). A bot types with the speed and the typo rate of its band, each bot a little differently:

| Rating | 800 | 1200 | 1600 | 2000 | 2400 |
| --- | --- | --- | --- | --- | --- |
| words a minute, about | 22 | 47 | 76 | 111 | 150 |
| wrong keys | 9 % | 7 % | 5 % | 3 % | 1 % |
| time to switch layouts (Switch Wars) | 3.2 s | 2.6 s | 2.0 s | 1.3 s | 0.7 s |

A typo also costs a bot the moment it takes to notice it.

## The layouts

Choose the layout your system is set to (or the one you want to learn, and set your system to it): the game
does not change your keyboard.

| Common | Neo family (<https://www.neo-layout.org/Layouts/>) |
| --- | --- |
| QWERTZ (German), QWERTZ (Swiss), QWERTY (US), QWERTY (UK), AZERTY (French), Dvorak (US), Colemak, Colemak-DH (ANSI), Colemak-DH (ISO), Workman, Norman, Bépo | Neo 2, NeoQwertz, NeoQwerty, Bone, Mine, Noted, AdNW, KOY, 3l |

Every key map is generated (`tools/gen-layouts.mjs` → `src/layouts.data.ts`) from the layout definitions of
xkeyboard-config 2.47, and Mine from the Neo project's own xkb file: no map was typed in by hand. Each layout has
up to four levels: plain, Shift, and levels 3 and 4 (Mod3 and Mod4 in the Neo family, AltGr and Shift+AltGr
elsewhere).

**Not included**, because no definition could be checked: **VOU** and **BuT** (both on the Neo page; VOU's page
shows its keys only as pictures, BuT is made for matrix keyboards with Shift under the thumb, which the helper
keyboard does not draw). Levels 5 and 6 of the Neo family (Greek, mathematics) are not in the data.

Levels 3 and 4 are as Linux defines them. The letters and the usual punctuation are the same on Windows and
macOS; rare characters of the AltGr level can differ in those systems' drivers. On macOS with an ISO keyboard the
browser reports the keys left of 1 and right of left Shift swapped.

## The helper keyboard

* It draws your layout on an ISO or ANSI keyboard, each key with the character it types on the level shown.
* The key to press next is lit; keys to hold with it (Shift, Mod3, Mod4, AltGr) are outlined. The modifier is
  the one for the other hand where there are two.
* Colours are the fingers of ten-finger typing; the line under the text names the finger in the course.
* The buttons above it pick the level. While you type, it shows the level of the next character by itself.
  Click a level to pin it, click it again to let it follow.
* M3 and M4 are the Neo family's Mod3 and Mod4 keys. A dotted circle marks a dead key.
* **Keyboard** in the top bar hides and shows it (kept in your profile). On a phone it is a picture only: you
  type on the phone's own keyboard.

## What the game sees of your layout

A browser does not tell a page which layout is active. For each key press it tells the physical key (its code,
the same on every layout) and the character the active layout made of it. A key press therefore **fits** a
layout (that key types that character on one of its levels) or does not.

* Under the helper keyboard the game says what your last 12 keys tell: "your keys fit …", or the layouts they
  look like instead. Layouts that share keys (QWERTZ and NeoQwertz have the same letters) cannot be told apart
  by those keys, so the answer can be several layouts.
* In **Switch Wars** and the **switch trainer**, each key is checked against the two chosen layouts. Typed with
  the layout that is due: it counts. Typed with the other one, or fitting neither: refused ("wrong layout").
  The same in both layouts: nothing to see, it counts.
* **What cannot be detected**, and what the game does then: a phone's on-screen keyboard and input methods send
  no key codes; a keyboard that maps the layout in its firmware makes the system report the layout it is set
  to, not the one you type; and keys both layouts share say nothing. In these cases the game tells you **when**
  to switch (the banner, the segment's colour, a sound), shows the other layout on the helper keyboard, and
  **trusts you** to switch. For a firmware keyboard, turn the layout check off in the settings; it is then
  trusted everywhere.
* The check runs in the browser. The server takes the browser's word for which layout a key was typed with; it
  checks the characters themselves.

## The practice area

**Course.** Every layout has a course built from its own key map, in the order typing is taught: the home row
first (the index fingers' keys, then outwards, then the two inner keys, then a review), the upper row and the
lower row the same way, the remaining letters, capitals with Shift, punctuation, digits, and for the Neo family
levels 3 and 4. It ends with two lessons of plain words. A lesson has four or five lines: the new keys alone,
mixed with the known ones, then words made only of keys you know. After a lesson you see words a minute,
accuracy, time, the keys you missed most, and one to five stars: 2 from 80 % accuracy, 3 from 90 %, 4 from
95 %, 5 from 98 % at 20 words a minute or more. The course page keeps each lesson's best stars and speed.

**Switch trainer.** Two layouts, a text of 36 words in coloured segments of 3 to 6 words, typed in turn with
both. It measures your switching time (from the moment a segment ends to the first right key with the other
layout), counts keys typed with the wrong layout, and says after each key what it saw. The times are kept per
pair and direction.

## What is kept

Your profile is the file `profile` in your account's storage on the server: the two layouts, the settings, the
stars of each lesson, the ratings as the server last told them, your last 50 rounds, the switching times.
Nothing is kept in the browser.

## Controls

| Input | Action |
| --- | --- |
| The keyboard | Type what is shown |
| Esc / Backspace | Word Loot: let go of the word. Esc in a lesson or the trainer: leave |
| Enter | After a lesson: the next one |
| ← (top left) | Leave the round or the lesson |
| Touch | Tap the text to bring up the phone's keyboard |

## Not built yet

* Texts with capitals and punctuation in the duels (the duels use lower-case words; the course teaches the rest).
* Matchmaking by rating: players meet in rooms of the lobby.
* Watching a room, a chat, a rematch vote.
* A rhythm mode, more languages, VOU and BuT.
* The bots' speeds and the rating steps are first guesses, to be set from real rounds.

## For developers

* `tools/gen-layouts.mjs` regenerates `src/layouts.data.ts` (needs `xkbcomp`, xkeyboard-config and X11's
  `keysymdef.h`; `--print` shows every layout's rows).
* The rules of a round are in the server module (`server/.../games/typingwarriors/TypingwarriorsModule.java`);
  `src/match.ts` keeps a copy of them to show a key's effect at once, and takes the server's `sync` when they
  differ. `protocol/games/typingwarriors.capnp` has every message.
* The word lists exist twice and must stay the same: `src/words.ts` and the server's `Words.java`.
* The server's list of layout ids (`TypingwarriorsModule.LAYOUTS`) must name every id of `src/layouts.data.ts`:
  a layout it does not know plays unrated.
* `src/layouts.ts`, `src/lessons.ts`, `src/words.ts` and `src/profile.ts` (but for load and save) need no DOM.
