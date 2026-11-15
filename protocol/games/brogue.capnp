@0x8ba675807f806eb2;
# Brogue (web/games/brogue, Brogue CE 1.15.1) is played alone. Its high-score files, which every user of a
# machine shared (BrogueHighScores.txt, RapidBrogueHighScores.txt, BulletBrogueHighScores.txt, one per variant:
# platformdependent.c setHighScoresFilename()), are the server's score tables "Brogue", "RapidBrogue" and
# "BulletBrogue", declared and checked by server/.../games/brogue/BrogueModule.java. An entry's score is the
# file line's score, its time the line's date; its detail is the rest of the line. Saved games, recordings
# and the run history are files in the player's account storage, in the original's formats.

using Java = import "/capnp/java.capnp";
$Java.package("net.slop.freegames.games.brogue");
$Java.outerClassname("BrogueProto");

# One line of a high-score file (brogueScoreEntry; ScoreSubmit.detail, ScoreEntry.detail).
struct Score {
  description @0 :Text;   # brogueScoreEntry.description: how the game ended, as the high-score screen shows
                          # it ("Killed by a jackal on depth 3.", "Escaped the Dungeons of Doom with 1,234
                          # gold."); at most COLS - 1 = 99 characters, printable ASCII
}
