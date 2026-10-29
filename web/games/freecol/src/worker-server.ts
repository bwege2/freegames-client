// The server worker in the browser (port/web/server-main.ts), started by worker.ts. Online, the page hands it
// the round's entries and sends what it reports to the server module.
import { runServer, type ServerInit } from './port/web/server-main.ts';
import { loadSync } from './port/web/files.ts';

export function startServerWorker({ init, client }: { init: ServerInit; client: MessagePort }) {
  const scope = self as any;
  const worker = runServer(init, { load: loadSync, send: (m) => scope.postMessage({ t: 'net', m }) });
  client.onmessage = () => worker.ping();
  scope.onmessage = (e: MessageEvent<any>) => {
    const m = e.data;
    if (m.t === 'entry') worker.entry(m.e);
    else if (m.t === 'liveFrom') worker.liveFrom(m.index);
  };
  scope.postMessage({ t: 'ready' });
}
