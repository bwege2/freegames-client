// The client worker in node (test/workers.ts): no canvases (nothing is drawn), files from the disk.
// Debugging: FREECOL_READS=FILE lists the files read; FREECOL_STACK=N longer stacks; FREECOL_STUCK=1 prints
// where threads wait long (with the scheduler's frames); see debug.ts for logs and traces.
import { parentPort } from 'node:worker_threads';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { runClient } from '../../src/port/web/client-main.ts';
import { $J } from '../../src/jre/index.ts';
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
if (process.env.FREECOL_STACK) Error.stackTraceLimit = +process.env.FREECOL_STACK;
installTraces('client');

parentPort!.once('message', ({ init, server }) => {
  let frames = 0;
  runClient(init, {
    server,
    post: (m) => parentPort!.postMessage(m),
    load,
    log,
    canvas: () => null,
    addFont: (name) => name,
    frame: () => {
      parentPort!.postMessage({ t: 'frame', n: ++frames });
      return true;
    },
  });
  const sched = ($J as any).threads;
  sched.stuck = (_t: any, where: string) => {
    if (process.env.FREECOL_STUCK) console.log('STUCK', where, 'frames', sched.frames.map((f: any) => f.thread?.getName?.()?.substring(0, 30) + ':' + f.kind).join(' | '));
  };
});
