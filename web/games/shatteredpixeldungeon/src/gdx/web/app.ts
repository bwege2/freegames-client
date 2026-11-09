// @ts-nocheck
// libGDX's Application, Net and Clipboard for the browser (as the LWJGL3 backend's: Lwjgl3Application,
// Lwjgl3Net, Lwjgl3Clipboard). The application type is Desktop (the port is the desktop game in a page),
// runnables posted from anywhere run before the next frame, exit() leaves the game (back to the site's
// game page), the log goes to the browser's console. Preferences are files among the player's files
// (files.ts, FilePreferences), as Lwjgl3Preferences are files in the game's folder.
import { JObject } from '../../jre/lang.ts';
import { Application_ApplicationType, Gdx } from '../core.ts';
import { FilePreferences } from './files.ts';
import type { FileStore } from '../files.ts';

/**
 * The clipboard. The browser lets a page read the system clipboard only asynchronously and with the
 * player's permission, libGDX reads it synchronously: getContents() answers what was last copied or pasted
 * in the page (copy and paste events) or set by the game; setContents also writes the system clipboard.
 */
export class BrowserClipboard extends JObject {
  text: string = null;
  constructor(signal: AbortSignal) {
    super();
    const take = (e: ClipboardEvent) => {
      const t = e.clipboardData?.getData('text/plain');
      if (t) this.text = t;
    };
    document.addEventListener('paste', take, { signal });
    document.addEventListener('copy', () => {
      const t = document.getSelection?.()?.toString();
      if (t) this.text = t;
    }, { signal });
  }
  hasContents() { return this.text != null && this.text.length > 0; }
  getContents() { return this.text; }
  setContents(s: string) {
    this.text = s;
    try { void navigator.clipboard?.writeText(s ?? '').catch(() => {}); } catch { /* not allowed */ }
  }
}

export class BrowserNet extends JObject {
  /** Lwjgl3Net.openURI: the system's browser; here a new tab. */
  openURI(uri: string) {
    try {
      window.open(uri, '_blank', 'noopener');
      return true;
    } catch {
      return false;
    }
  }
  sendHttpRequest() { throw new Error('Net.sendHttpRequest is not in the browser backend'); }
  cancelHttpRequest() {}
  isHttpRequestPending() { return false; }
}

export class BrowserApplication extends JObject {
  files: FileStore;
  prefs = new Map<string, FilePreferences>();
  clipboard: BrowserClipboard;
  posted: any[] = [];
  logLevel = 2;
  listener: any = null;
  onExit: () => void;
  exited = false;
  constructor(files: FileStore, signal: AbortSignal, onExit: () => void) {
    super();
    this.files = files;
    this.clipboard = new BrowserClipboard(signal);
    this.onExit = onExit;
  }
  getType() { return Application_ApplicationType.Desktop; }
  getVersion() { return 0; }
  getApplicationListener() { return this.listener; }
  getGraphics() { return Gdx.graphics; }
  getAudio() { return Gdx.audio; }
  getInput() { return Gdx.input; }
  getFiles() { return Gdx.files; }
  getNet() { return Gdx.net; }
  getPreferences(name: string) {
    let p = this.prefs.get(name);
    if (!p) this.prefs.set(name, (p = new FilePreferences(this.files, name)));
    return p;
  }
  getClipboard() { return this.clipboard; }
  postRunnable(r: any) { this.posted.push(r); }
  runPosted() {
    const rs = this.posted;
    this.posted = [];
    for (const r of rs) (typeof r === 'function' ? r : r.run.bind(r))();
  }
  log(tag: string, msg: string, e?: any) { if (this.logLevel >= 2) console.log('[' + tag + '] ' + msg, ...(e ? [e] : [])); }
  error(tag: string, msg: string, e?: any) { if (this.logLevel >= 1) console.error('[' + tag + '] ' + msg, ...(e ? [e] : [])); }
  debug(tag: string, msg: string, e?: any) { if (this.logLevel >= 3) console.debug('[' + tag + '] ' + msg, ...(e ? [e] : [])); }
  setLogLevel(l: number) { this.logLevel = l; }
  getLogLevel() { return this.logLevel; }
  setApplicationLogger() {}
  getApplicationLogger() { return null; }
  exit() {
    if (this.exited) return;
    this.exited = true;
    this.onExit();
  }
  getJavaHeap() { return 0n; }
  getNativeHeap() { return 0n; }
  addLifecycleListener() {}
  removeLifecycleListener() {}
}
