// freegames.stream website and game SDK: GPL-3.0-or-later, with an additional permission and additional terms under its section 7 (web/LICENSE.md).
// Starts the real server (server/target/freegames-server.jar) on a free port for SDK tests.
import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, mkdtempSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const JAR = join(import.meta.dirname, '..', '..', 'server', 'target', 'freegames-server.jar');

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const s = createServer();
    s.once('error', reject);
    s.listen(0, '127.0.0.1', () => {
      const p = (s.address() as { port: number }).port;
      s.close(() => resolve(p));
    });
  });
}

export interface RunningServer { port: number; url: string; stop(): Promise<void> }

/** null when the jar is not built (run `mvn -f pom.xml package` first). */
export async function startServer(env: Record<string, string> = {}): Promise<RunningServer | null> {
  if (!existsSync(JAR)) return null;
  const port = await freePort();
  const java = process.env.JAVA_HOME ? join(process.env.JAVA_HOME, 'bin', 'java') : 'java';
  const proc: ChildProcess = spawn(java, ['-jar', JAR], {
    env: { ...process.env, PORT: String(port), WT_PORT: '-1', WEB_ROOT: join(tmpdir(), 'fg-no-web'), DATA_DIR: mkdtempSync(join(tmpdir(), 'fg-web-test-')), ...env },
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  let log = '';
  proc.stderr!.on('data', (d) => { log += d; });
  const end = Date.now() + 15000;
  for (;;) {
    try {
      await fetch(`http://127.0.0.1:${port}/`);
      break;
    } catch {
      if (Date.now() > end || proc.exitCode !== null) throw new Error(`server did not start:\n${log}`);
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  return {
    port,
    url: `ws://127.0.0.1:${port}/ws`,
    stop: () => new Promise<void>((resolve) => {
      if (proc.exitCode !== null) { resolve(); return; }
      proc.once('exit', () => resolve());
      proc.kill();
    }),
  };
}
