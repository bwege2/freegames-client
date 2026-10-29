// FreeCol's two workers, one script (the same translated code serves both, so the browser loads it once): the
// first message says which one this is, the server (worker-server.ts) or the client (worker-client.ts).
import { startServerWorker } from './worker-server.ts';
import { startClientWorker } from './worker-client.ts';
import { Logger } from './jre/index.ts';

const scope = self as any;
// FreeCol's last log records (the original writes them to FreeCol.log), for a look from the developer tools
const recent: string[] = (scope.freecolLog = []);
Logger.sink = (r: any) => {
  recent.push(`${r.level.getName()} ${r.loggerName} ${r.message}${r.thrown ? ' ' + r.thrown.toString() : ''}`);
  if (recent.length > 400) recent.shift();
};

scope.onmessage = (e: MessageEvent<any>) => {
  scope.onmessage = null;
  if (e.data.role === 'server') startServerWorker(e.data);
  else void startClientWorker(e.data);
};
