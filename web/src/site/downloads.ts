// freegames.stream website and game SDK: GPL-3.0-or-later, with an additional permission and additional terms under its section 7 (web/LICENSE.md).
// What a game downloads when it starts (dist/downloads.json, made by scripts/downloads.mjs at build time), and its
// download with progress: the player fetches the game's files before it starts the game, showing how much, how far
// and how long still; the game then finds them in the browser's cache. Without the list (the development server)
// the game simply starts.

export interface Download {
  bytes: number;
  files: [string, number][];
}

let list: Promise<Record<string, Download>> | null = null;

/** the files game `id` downloads when it starts, or null if unknown */
export async function downloadOf(id: string): Promise<Download | null> {
  list ??= fetch('downloads.json').then((r) => (r.ok ? r.json() : {}), () => ({}));
  return (await list)[id] ?? null;
}

/** "21.7 MB" */
export function megabytes(b: number): string {
  return `${(b / 1e6).toFixed(b < 1e7 ? 1 : 0)} MB`;
}

/** "3.2 of 21.7 MB (15 %) · about 9 s left": the time once there is a rate to go by (a second of downloading) */
export function progressText(done: number, total: number, elapsedMs: number): string {
  const pct = total > 0 ? Math.min(100, Math.floor((done / total) * 100)) : 100;
  let text = `${(done / 1e6).toFixed(1)} of ${megabytes(total)} (${pct} %)`;
  if (elapsedMs >= 1000 && done > 0 && done < total) {
    const s = Math.ceil(((total - done) / done) * (elapsedMs / 1000));
    text += ` · about ${s < 60 ? `${s} s` : `${Math.floor(s / 60)} min ${s % 60} s`} left`;
  }
  return text;
}

/**
 * Fetches the files (four at a time), calling `progress(done, total)` as bytes arrive. A file that fails is left
 * to the game (it loads it itself and says what went wrong); the abort signal stops everything.
 */
export async function preload(d: Download, progress: (done: number, total: number) => void, signal: AbortSignal): Promise<void> {
  let done = 0;
  const queue = [...d.files];
  const one = async ([url, size]: [string, number]) => {
    let got = 0;
    try {
      const r = await fetch(url, { signal });
      if (!r.ok || !r.body) throw new Error(`HTTP ${r.status}`);
      const reader = r.body.getReader();
      for (;;) {
        const { value, done: end } = await reader.read();
        if (end) break;
        got += value.byteLength;
        done += value.byteLength;
        progress(done, d.bytes);
      }
    } catch {
      if (signal.aborted) return;
    }
    // what did not come counts as done (the game fetches it itself)
    done += Math.max(0, size - got);
    progress(done, d.bytes);
  };
  const workers = Array.from({ length: Math.min(4, queue.length) }, async () => {
    while (queue.length && !signal.aborted) await one(queue.shift()!);
  });
  await Promise.all(workers);
}
