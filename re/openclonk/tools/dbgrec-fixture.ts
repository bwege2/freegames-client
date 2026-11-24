// The short form of an original debug record (oracle/debugrec.sh) for the port's test, which runs without the
// original: web/games/openclonk/test/data/<name>-dbgrec.json (blocks of chunks with their hashes, the seed, the
// frames the original ran), and <name>-record.ocs, the original's record that the port replays.
//   node re/openclonk/tools/dbgrec-fixture.ts <name> <scenario path in planet/>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BlockHasher, RCT, readDbgRecFile } from '../../../web/games/openclonk/src/rt/debugrec.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const [name, scenario] = process.argv.slice(2);
const dir = path.join(here, '../work/dbgrec');
const rec = new Uint8Array(fs.readFileSync(path.join(dir, name + '.rec')));
const seed = Number(fs.readFileSync(path.join(dir, name + '.seed'), 'utf8').trim());
// the original's replay does not end by itself (oracle/debugrec.sh): its server is stopped between two frames, so
// its frames end with the last C4Game::Execute's "eGame"; what follows is the game being cleared (with players:
// their removal's script calls), which the port's test does not do. The fixture has the whole frames.
const blockName = (c: { data: Uint8Array }) => new TextDecoder('latin1').decode(c.data).replace(/\0[\s\S]*$/, '');
let total = 0;
let end = -1;
for (const c of readDbgRecFile(rec)) {
  if (c.type === RCT.Block && blockName(c) === 'eGame') end = total;
  total++;
}
if (end < 0) throw new Error(`${name}.rec has no whole frame`);
const h = new BlockHasher();
let chunks = 0;
let frames = 0;
for (const c of readDbgRecFile(rec)) {
  if (chunks > end) break;
  h.add(c);
  chunks++;
  if (c.type === RCT.DbgFrame) frames = new DataView(c.data.buffer, c.data.byteOffset).getInt32(0, true);
}
h.flush();
if (total > chunks) console.log(`${name}.rec: ${total - chunks} chunks after the last whole frame (the game being cleared) left out`);
const out = path.join(here, '../../../web/games/openclonk/test/data', name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-dbgrec.json');
const recordName = fs.existsSync(path.join(dir, name + '.recname')) ? fs.readFileSync(path.join(dir, name + '.recname'), 'utf8').trim() : undefined;
fs.writeFileSync(out, JSON.stringify({ scenario, seed, record: recordName, chunks, frames, blocks: h.blocks }) + '\n');
console.log(`${out}: ${chunks} chunks, ${frames} frames, ${h.blocks.length} blocks`);
// the record the port replays (oracle/debugrec.sh keeps it beside the debug record)
const record = path.join(dir, name + '.ocs');
if (fs.existsSync(record)) {
  const to = out.replace(/-dbgrec\.json$/, '-record.ocs');
  fs.copyFileSync(record, to);
  console.log(`${to}: the record, ${fs.statSync(to).size} bytes`);
}
