// The server worker in node (test/workers.ts): files from the disk.
import { parentPort } from 'node:worker_threads';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { runServer } from '../../src/port/web/server-main.ts';
import { Logger } from '../../src/jre/index.ts';
import { log, installTraces, syncConsole } from './debug.ts';

const load = (url: string) => {
  if (process.env.FREECOL_READS) fs.appendFileSync(process.env.FREECOL_READS, fileURLToPath(url) + '\n');
  try {
    return new Uint8Array(fs.readFileSync(fileURLToPath(url)));
  } catch {
    return null;
  }
};

syncConsole();
// FREECOL_HASHED=dir: every game state an online browser hashes (lockstep.ts), to compare browsers
if (process.env.FREECOL_HASHED) {
  let n = 0;
  (globalThis as any).freecolHashed = (seat: number, xml: string) => fs.writeFileSync(`${process.env.FREECOL_HASHED}/seat${seat}-${n++}.xml`, xml);
}
installTraces('server');

parentPort!.once('message', ({ init, client }) => {
  Logger.sink = log;
  const worker = runServer(init, { load, send: (m) => parentPort!.postMessage({ t: 'net', m }) });
  client.on('message', () => worker.ping());
  parentPort!.on('message', (m: any) => {
    if (m.t === 'entry') worker.entry(m.e);
    else if (m.t === 'liveFrom') worker.liveFrom(m.index);
  });
  parentPort!.postMessage({ t: 'ready' });
});
