// Writes server/src/test/java/net/slop/freegames/games/worms/WormsFixtures.java from the port's online
// games (fixtures.ts). Run: node web/games/worms/test/gen-java-fixtures.ts
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { allFixtures, javaFixtures } from './fixtures.ts';

export const JAVA_FIXTURES = fileURLToPath(new URL('../../../../server/src/test/java/net/slop/freegames/games/worms/WormsFixtures.java', import.meta.url));

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const fs = await allFixtures();
  writeFileSync(JAVA_FIXTURES, javaFixtures(fs));
  for (const f of fs) console.log(f.name, f.decisions.length, 'decisions, scores', f.scores.join(' '));
}
