// @ts-nocheck
// The rest of the Java library FreeCol's common and server code mentions: java.beans, java.text,
// java.util.regex, java.lang.ref, small java.awt value classes, and stubs for what the browser does
// elsewhere (sockets, Java Sound, the Ogg decoder classes, desktop integration). The client's AWT and
// Swing are the GUI layer (gui/).
import { $J, JObject, defineLib, str, stringHash, jsRegex, IOException, UnsupportedOperationException, HeadlessException } from './lang.ts';
import { ArrayList } from './util.ts';

/* ------------------------------------------------------------------ java.text */

export class SimpleDateFormat extends JObject {
  pattern: string;
  constructor(pattern: string = 'yyyy-MM-dd HH:mm', _l?: any) {
    super();
    this.pattern = pattern;
  }
  format(d: any) {
    const t = new Date(typeof d === 'number' ? d : d.getTime());
    const p2 = (n: number) => String(n).padStart(2, '0');
    return this.pattern.replace(/yyyy|MM|dd|HH|mm|ss|SSS|z/g, (m) => ({
      yyyy: String(t.getFullYear()), MM: p2(t.getMonth() + 1), dd: p2(t.getDate()), HH: p2(t.getHours()),
      mm: p2(t.getMinutes()), ss: p2(t.getSeconds()), SSS: String(t.getMilliseconds()).padStart(3, '0'), z: 'UTC',
    } as any)[m]);
  }
}
defineLib(SimpleDateFormat, 'java.text.SimpleDateFormat');
export class DateFormat extends JObject {
  static SHORT = 3;
  static MEDIUM = 2;
  static LONG = 1;
  static FULL = 0;
  static getDateTimeInstance() { return new SimpleDateFormat('yyyy-MM-dd HH:mm:ss'); }
  static getDateInstance() { return new SimpleDateFormat('yyyy-MM-dd'); }
}
defineLib(DateFormat, 'java.text.DateFormat');

/* ------------------------------------------------------------------ java.util.regex */

export class Pattern extends JObject {
  re: string;
  flags: any;
  constructor(re: string, flags = 0) {
    super();
    this.re = re; this.flags = flags;
  }
  static CASE_INSENSITIVE = 2;
  static compile(re: string, flags = 0) { return new Pattern(re, flags); }
  static quote(s: string) { return '\\Q' + s + '\\E'; }
  static matches(re: string, s: string) { return jsRegex('^(?:' + re + ')$').test(s); }
  matcher(s: string) { return new Matcher(this, s); }
  pattern() { return this.re; }
  split(s: string) { return s.split(jsRegex(this.re, this.flags & 2 ? 'i' : '')); }
  toString() { return this.re; }
}
defineLib(Pattern, 'java.util.regex.Pattern');
export class Matcher extends JObject {
  m: RegExpExecArray | null = null;
  rx: RegExp;
  p: Pattern;
  s: string;
  constructor(p: Pattern, s: string) {
    super();
    this.p = p; this.s = s;
    this.rx = jsRegex(p.re, 'g' + (p.flags & 2 ? 'i' : ''));
  }
  matches() { this.m = jsRegex('^(?:' + this.p.re + ')$', this.p.flags & 2 ? 'i' : '').exec(this.s); return !!this.m; }
  find() { this.m = this.rx.exec(this.s); return !!this.m; }
  lookingAt() { this.m = jsRegex('^(?:' + this.p.re + ')', this.p.flags & 2 ? 'i' : '').exec(this.s); return !!this.m; }
  group(i: any = 0) { return this.m ? (this.m[i] === undefined ? null : this.m[i]) : null; }
  groupCount() { return this.m ? this.m.length - 1 : 0; }
  start() { return this.m ? this.m.index : -1; }
  end() { return this.m ? this.m.index + this.m[0].length : -1; }
  replaceAll(r: string) { return this.s.replace(this.rx, r); }
}
defineLib(Matcher, 'java.util.regex.Matcher');

/* ------------------------------------------------------------------ java.lang.ref, reflect */

export class WeakReference extends JObject {
  v: any;
  constructor(v: any, _q?: any) {
    super();
    this.v = v;
  }
  _WeakReference(v: any, _q?: any): this {
    this.v = v;
    return this;
  }
  _SoftReference(v: any, _q?: any): this {
    this.v = v;
    return this;
  }
  _Reference(v: any, _q?: any): this {
    this.v = v;
    return this;
  }
  get() { return this.v; }
  clear() { this.v = null; }
  refersTo(o: any) { return this.v === o; }
  enqueue() { return false; }
}
defineLib(WeakReference, 'java.lang.ref.WeakReference');
/** References keep their referents: JavaScript has no weak references with Java's equality. */
export class SoftReference extends WeakReference {}
defineLib(SoftReference, 'java.lang.ref.SoftReference');
export class ReferenceQueue extends JObject {
  poll() { return null; }
  /** Nothing is ever enqueued (no collector reports here): remove() waits for ever, as in Java. */
  remove(ms?: number) {
    if (!$J.threads) return null;
    if (ms) {
      $J.threads.sleep(ms);
      return null;
    }
    throw $J.threads.parkForever();
  }
}
defineLib(ReferenceQueue, 'java.lang.ref.ReferenceQueue');
export class Modifier {
  static isStatic(m: number) { return (m & 8) !== 0; }
  static isPublic(m: number) { return (m & 1) !== 0; }
  static isAbstract(m: number) { return (m & 1024) !== 0; }
  static isFinal(m: number) { return (m & 16) !== 0; }
}
export class JArray {
  static newInstance(c: any, n: number) {
    const a = new Array(n).fill(null);
    if (c && c.getName) Object.defineProperty(a, '$type', { value: 'L' + c.getName() + ';', enumerable: false });
    return a;
  }
  static getLength(a: any[]) { return a.length; }
  static get(a: any[], i: number) { return a[i]; }
}

/* ------------------------------------------------------------------ stubs */
function stub(name: string, javaName: string, statics: any = {}): any {
  const C = {
    [name]: class extends JObject {
      constructor(..._a: any[]) {
        super();
      }
    },
  }[name];
  Object.assign(C, statics);
  C.prototype['_' + name] = function () { return this; };
  defineLib(C, javaName);
  return C;
}
const headless = () => { throw new HeadlessException(); };
const noSound = () => { throw new UnsupportedOperationException('Java Sound'); };
export const AudioSystem = stub('AudioSystem', 'javax.sound.sampled.AudioSystem', { getMixerInfo: () => [], getMixer: () => null, getAudioInputStream: noSound, getLine: noSound, NOT_SPECIFIED: -1 });
export const AudioFormat = stub('AudioFormat', 'javax.sound.sampled.AudioFormat', { Encoding: { PCM_SIGNED: 'PCM_SIGNED' } });
export const AudioInputStream = stub('AudioInputStream', 'javax.sound.sampled.AudioInputStream');
export const SourceDataLine = stub('SourceDataLine', 'javax.sound.sampled.SourceDataLine');
export const DataLine_Info = stub('DataLine_Info', 'javax.sound.sampled.DataLine$Info');
export const FloatControl_Type = stub('FloatControl_Type', 'javax.sound.sampled.FloatControl$Type', { MASTER_GAIN: 'Master Gain', VOLUME: 'Volume' });
// com.jcraft.jogg / jorbis (the original's Ogg decoder; the browser decodes Ogg itself)
export const Packet = stub('Packet', 'com.jcraft.jogg.Packet');
export const Page = stub('Page', 'com.jcraft.jogg.Page');
export const StreamState = stub('StreamState', 'com.jcraft.jogg.StreamState');
export const SyncState = stub('SyncState', 'com.jcraft.jogg.SyncState');
export const Block = stub('Block', 'com.jcraft.jorbis.Block');
export const Comment = stub('Comment', 'com.jcraft.jorbis.Comment');
export const DspState = stub('DspState', 'com.jcraft.jorbis.DspState');
export const Info = stub('Info', 'com.jcraft.jorbis.Info');

// org.apache.commons.cli (FreeCol.main's command line; the browser has none)
export const DefaultParser = stub('DefaultParser', 'org.apache.commons.cli.DefaultParser');
export const HelpFormatter = stub('HelpFormatter', 'org.apache.commons.cli.HelpFormatter');
export const Option = stub('Option', 'org.apache.commons.cli.Option');
export const Options = stub('Options', 'org.apache.commons.cli.Options');
export const ParseException = stub('ParseException', 'org.apache.commons.cli.ParseException');
