// @ts-nocheck
// java.util.logging: the original logs at INFO by default (no file in the browser). Records at or above
// the root level are built (FreeCol's messages may call methods) and then dropped, unless a sink is set.
import { $J, JObject, defineLib, str } from './lang.ts';

export class Level extends JObject {
  name: string;
  value: number;
  constructor(name: string, value: number) {
    super();
    this.name = name; this.value = value;
  }
  static OFF = new Level('OFF', 2147483647);
  static SEVERE = new Level('SEVERE', 1000);
  static WARNING = new Level('WARNING', 900);
  static INFO = new Level('INFO', 800);
  static CONFIG = new Level('CONFIG', 700);
  static FINE = new Level('FINE', 500);
  static FINER = new Level('FINER', 400);
  static FINEST = new Level('FINEST', 300);
  static ALL = new Level('ALL', -2147483648);
  static parse(s: string) {
    for (const l of [Level.OFF, Level.SEVERE, Level.WARNING, Level.INFO, Level.CONFIG, Level.FINE, Level.FINER, Level.FINEST, Level.ALL]) {
      if (l.name === s.toUpperCase()) return l;
    }
    return new Level(s, $J.parseInt(s));
  }
  getName() { return this.name; }
  getLocalizedName() { return this.name; }
  intValue() { return this.value; }
  toString() { return this.name; }
}
defineLib(Level, 'java.util.logging.Level');

export class LogRecord extends JObject {
  thrown: any = null;
  millis = $J.clock();
  sourceClassName: string = null;
  sourceMethodName: string = null;
  params: any[] = null;
  loggerName: string = null;
  level: Level;
  message: string;
  constructor(level: Level, message: string) {
    super();
    this.level = level; this.message = message;
  }
  getLevel() { return this.level; }
  getMessage() { return this.message; }
  getMillis() { return this.millis; }
  getThrown() { return this.thrown; }
  setThrown(t: any) { this.thrown = t; }
  getSourceClassName() { return this.sourceClassName; }
  getSourceMethodName() { return this.sourceMethodName; }
  getThreadID() { return 1; }
  getLongThreadID() { return 1; }
  getLoggerName() { return this.loggerName; }
  getParameters() { return this.params; }
}
defineLib(LogRecord, 'java.util.logging.LogRecord');

export class Handler extends JObject {
  level: Level = Level.ALL;
  formatter: any = null;
  _Handler(): this { return this; }
  setLevel(l: Level) { this.level = l; }
  getLevel() { return this.level; }
  setFormatter(f: any) { this.formatter = f; }
  getFormatter() { return this.formatter; }
  isLoggable(r: LogRecord) { return r.level.value >= this.level.value; }
  flush() {}
  close() {}
}
defineLib(Handler, 'java.util.logging.Handler');

export class Formatter extends JObject {
  _Formatter(): this { return this; }
  formatMessage(r: LogRecord) { return r.message; }
}
defineLib(Formatter, 'java.util.logging.Formatter');

const loggers = new Map<string, Logger>();

export class Logger extends JObject {
  level: Level = null;
  handlers: any[] = [];
  parent: Logger = null;
  static root: Logger = null;
  /** Where records go (tests set it); null drops them. */
  static sink: ((r: LogRecord) => void) | null = null;
  name: string;
  constructor(name: string) {
    super();
    this.name = name;
  }
  static getLogger(name: string) {
    let l = loggers.get(name);
    if (!l) {
      l = new Logger(name);
      l.parent = name === '' ? null : Logger.getLogger('');
      if (name === '') l.level = Level.INFO;
      loggers.set(name, l);
    }
    return l;
  }
  static getGlobal() { return Logger.getLogger('global'); }
  getName() { return this.name; }
  getParent() { return this.parent; }
  setLevel(l: Level) { this.level = l; }
  getLevel() { return this.level; }
  effective(): number {
    for (let l: Logger = this; l; l = l.parent) if (l.level) return l.level.value;
    return 800;
  }
  isLoggable(l: Level) { return l.value >= this.effective() && this.effective() !== 2147483647; }
  addHandler(h: any) { this.handlers.push(h); }
  removeHandler(h: any) { this.handlers = this.handlers.filter((x) => x !== h); }
  getHandlers() { return this.handlers.slice(); }
  setUseParentHandlers() {}
  log(level: any, msg?: any, extra?: any) {
    if (level instanceof LogRecord) return this.publish(level);
    if (!this.isLoggable(level)) return;
    let m = typeof msg === 'function' ? msg() : msg;
    const r = new LogRecord(level, m == null ? null : str(m));
    r.loggerName = this.name;
    if (extra != null) {
      if (extra instanceof JObject && typeof extra.getMessage === 'function' && typeof extra.printStackTrace === 'function') r.thrown = extra;
      else r.params = Array.isArray(extra) ? extra : [extra];
    }
    this.publish(r);
  }
  publish(r: LogRecord) {
    if (Logger.sink) Logger.sink(r);
    for (let l: Logger = this; l; l = l.parent) for (const h of l.handlers) if (h.isLoggable(r)) h.publish(r);
  }
  logp(level: any, cls: string, meth: string, msg: any, extra?: any) { this.log(level, msg, extra); }
  severe(m: any) { this.log(Level.SEVERE, m); }
  warning(m: any) { this.log(Level.WARNING, m); }
  info(m: any) { this.log(Level.INFO, m); }
  config(m: any) { this.log(Level.CONFIG, m); }
  fine(m: any) { this.log(Level.FINE, m); }
  finer(m: any) { this.log(Level.FINER, m); }
  finest(m: any) { this.log(Level.FINEST, m); }
  entering() {}
  exiting() {}
  throwing() {}
}
defineLib(Logger, 'java.util.logging.Logger');

export class LogManager {
  static getLogManager() { return { reset() {}, readConfiguration() {}, getLogger: (n: string) => Logger.getLogger(n) }; }
}
