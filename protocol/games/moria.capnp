@0xc24e19c4d9ad5772;
# Moria (web/games/moria, Umoria 5.7.15) is played alone. Its score file, scores.dat, which every user of
# the machine shared, is the server's score table "scores", declared and checked by
# server/.../games/moria/MoriaModule.java. An entry's detail is the original's record of it (scores.h,
# HighScore_t), field for field; the entry's score is the record's points, its name the character's name.
# Saved games are files in the player's account storage (game.sav, in the original's format).

using Java = import "/capnp/java.capnp";
$Java.package("net.slop.freegames.games.moria");
$Java.outerClassname("MoriaProto");

# HighScore_t: one entry of the score file (ScoreSubmit.detail, ScoreEntry.detail).
struct Score {
  points @0 :Int32;          # playerCalculateTotalPoints(): max experience + 100 x deepest level + gold / 100
                             # + the value of what the character carries + 50 x the level it is on
  birthDate @1 :Int32;       # py.misc.date_of_birth: time() when the character was made (seconds since 1970)
  uid @2 :Int16;             # always 0 in 5.7.15
  maxHp @3 :Int16;           # mhp: maximum hit points
  curHp @4 :Int16;           # chp: hit points left
  dungeonDepth @5 :UInt8;    # dungeon_depth: the level (50 feet each) the game ended on
  level @6 :UInt8;           # the character's level (a total winner's has PLAYER_MAX_LEVEL added)
  deepestDepth @7 :UInt8;    # deepest_dungeon_depth: the deepest level reached
  gender @8 :UInt8;          # 'M' or 'F'
  race @9 :UInt8;            # index into character_races: Human, Half-Elf, Elf, Halfling, Gnome, Dwarf,
                             # Half-Orc, Half-Troll
  characterClass @10 :UInt8; # index into classes: Warrior, Mage, Priest, Rogue, Ranger, Paladin
  name @11 :Text;            # name[PLAYER_NAME_SIZE]: the character's name, at most 26 characters
  diedFrom @12 :Text;        # died_from[25]: what killed the character, "(saved)" while it lives on in a
                             # save file, "Quitting", "Ripe Old Age" (a total winner who retired)
}
