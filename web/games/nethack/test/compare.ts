// Development: replays a golden through the port and shows the first difference.
//   node games/nethack/test/compare.ts PATH.json.gz
import { loadGolden, replay } from './golden.ts';

const g = loadGolden(process.argv[2]);
const d = await replay(g);
console.log(d ?? `${g.name}: the same (${g.runs.map((r) => r.frames.length).join('+')} frames)`);
process.exit(d ? 1 : 0);
