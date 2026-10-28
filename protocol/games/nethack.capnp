@0xd3a1c7e5b2f40961;
# NetHack (web/games/nethack, NetHack 3.6.7) is played alone. Its record of high scores, the file
# `record` that every user of the machine shared, is the server's score table "record", declared and
# checked by server/.../games/nethack/NethackModule.java. An entry's detail is the original's entry of
# the record (topten.c, struct toptenentry), field for field; the entry's score is its points, its name
# the character's name as the record keeps it (at most 10 characters). Saved games and bones are files
# in the player's account storage, in the original's format.

using Java = import "/capnp/java.capnp";
$Java.package("net.slop.freegames.games.nethack");
$Java.outerClassname("NethackProto");

# struct toptenentry (topten.c): one line of the record (ScoreSubmit.detail, ScoreEntry.detail).
struct Score {
  verMajor @0 :Int16;      # the version that wrote it: 3.6.7
  verMinor @1 :Int16;
  patchlevel @2 :Int16;
  points @3 :Int64;        # u.urexp and the bonuses of done() (gold, depth, ascension, artifacts)
  deathDnum @4 :Int16;     # the dungeon the game ended in (dungeon.def order: 0 the Dungeons of Doom,
                           # 1 Gehennom, 2 the Gnomish Mines, 3 the Quest, 4 Sokoban, 5 Fort Ludios,
                           # 6 Vlad's Tower, 7 the Elemental Planes)
  deathLev @5 :Int16;      # observable_depth(): the depth it ended on (negative on the Planes)
  maxLvl @6 :Int16;        # deepest_lev_reached(TRUE): the deepest level reached
  hp @7 :Int16;            # u.uhp at the end
  maxHp @8 :Int16;         # u.uhpmax
  deaths @9 :Int16;        # u.umortality: times the character died (lifesaving)
  deathDate @10 :Int32;    # yyyymmdd of the end
  birthDate @11 :Int32;    # yyyymmdd of the start
  uid @12 :Int32;          # getuid() of the player (here: the record's own entries 1000, others 1001...)
  role @13 :Text;          # urole.filecode: Arc Bar Cav Hea Kni Mon Pri Rog Ran Sam Tou Val Wiz
  race @14 :Text;          # urace.filecode: Hum Elf Dwa Gno Orc
  gender @15 :Text;        # Mal Fem
  align @16 :Text;         # Law Neu Cha
  name @17 :Text;          # plname, at most NAMSZ = 10 characters
  death @18 :Text;         # formatkiller(): "killed by a jackal", "quit", "ascended", ... (DTHSZ = 100)
}
