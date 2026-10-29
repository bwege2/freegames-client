// FreeCol 1.2.0 in TypeScript: the runtime, the platform replacements and the translated classes,
// linked and initialized. Other modules get the translated classes from here by their Java names.
import { $J, Locale, vfs } from './jre/index.ts';
import './port/index.ts';
import './gen/index.ts';
import { installThreadModel } from './port/threads.ts';

/** A translated class (or a replacement) by its Java binary name. */
export function java(name: string): any {
  const c = $J.classByName(name);
  if (!c || c.$meta?.stub) throw new Error('FreeCol class not available: ' + name);
  return c;
}

/** new C(args) by the Java constructor signature, e.g. jnew('a.B', 'java.lang.String,int', 'x', 1). */
export function jnew(name: string, sig: string, ...args: any[]): any {
  const C = java(name);
  const init = C.$meta.ctors?.[sig];
  if (!init) throw new Error('no constructor ' + name + '(' + sig + ')');
  return new C()[init](...args);
}

/** The TypeScript name of a Java method, by its signature, e.g. jmethod('a.B', 'save(java.io.File)'). */
export function jmethod(name: string, sig: string): string {
  for (let C = java(name); C && C.$meta; C = Object.getPrototypeOf(C)) {
    const m = Object.prototype.hasOwnProperty.call(C, '$meta') && C.$meta.meths?.[sig];
    if (m) return m;
  }
  return sig.substring(0, sig.indexOf('('));
}

installThreadModel(java);

export const DATA = '/data';
export const USER = '/user';

/** Sets up FreeCol's directories in the virtual file system and loads the rules (FreeCol.main's first steps). */
export function bootFreeCol(locale = 'en_US') {
  const FreeColDirectories = java('net.sf.freecol.common.io.FreeColDirectories');
  const Messages = java('net.sf.freecol.common.i18n.Messages');
  const FreeColRules = java('net.sf.freecol.common.io.FreeColRules');
  for (const d of ['c', 'd', 'k']) vfs.mkdir(USER + '/' + d);
  FreeColDirectories.setDataDirectory(DATA);
  FreeColDirectories.setUserConfigDirectory(USER + '/c');
  FreeColDirectories.setUserDataDirectory(USER + '/d');
  FreeColDirectories.setUserCacheDirectory(USER + '/k');
  FreeColDirectories.setUserDirectories();
  const [lang, country] = locale.split('_');
  Messages.loadMessageBundle(new Locale(lang, country ?? ''));
  FreeColRules.loadRules();
}

export { $J, vfs };
