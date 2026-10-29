// @ts-nocheck
// java.util.ResourceBundle for the JDK's own resources (Swing's and AWT's strings): properties files in
// the virtual file system at /jdk/<base name>[_<locale>].properties (re/freecol/oracle/JdkResources.java
// writes them from the JDK). The lookup chain is Java's: language and country, language, the base bundle.
import { $J, JObject, defineLib, NullPointerException } from './lang.ts';
import { vfs } from './io.ts';
import { HashSet } from './util.ts';
import { MissingResourceException } from './platform.ts';

export class ResourceBundle extends JObject {
  map = new Map<string, string>();
  parent: ResourceBundle | null = null;
  locale: any = null;
  static cache = new Map<string, ResourceBundle | null>();

  static load(name: string): ResourceBundle | null {
    if (ResourceBundle.cache.has(name)) return ResourceBundle.cache.get(name);
    const bytes = vfs.read('/jdk/' + name + '.properties');
    let rb: ResourceBundle | null = null;
    if (bytes) {
      rb = new ResourceBundle();
      for (const line of new TextDecoder().decode(bytes).split('\n')) {
        if (!line || line.startsWith('#')) continue;
        let i = 0, key = '';
        for (; i < line.length && line[i] !== '='; i++) {
          if (line[i] === '\\') key += line[++i];
          else key += line[i];
        }
        rb.map.set(key, unescape(line.substring(i + 1)));
      }
    }
    ResourceBundle.cache.set(name, rb);
    return rb;
  }

  static getBundle(base: string, locale?: any, _x?: any) {
    if (base == null) throw new NullPointerException();
    const l = locale && typeof locale === 'object' && locale.getLanguage ? locale : $J.load('java.util.Locale').getDefault();
    const lang = l.getLanguage(), country = l.getCountry();
    const chain: string[] = [];
    if (lang && country) chain.push(base + '_' + lang + '_' + country);
    if (lang) chain.push(base + '_' + lang);
    chain.push(base);
    let child: ResourceBundle | null = null, first: ResourceBundle | null = null;
    for (const n of chain) {
      const rb = ResourceBundle.load(n);
      if (!rb) continue;
      if (child) child.parent = rb;
      else first = rb;
      child = rb;
      rb.locale = l;
    }
    if (!first) throw new MissingResourceException("Can't find bundle for base name " + base + ', locale ' + l, base + '_' + l, '');
    return first;
  }
  static clearCache(..._a: any[]) {}

  handleGetObject(k: string) {
    return this.map.has(k) ? this.map.get(k) : null;
  }
  getObject(k: string) {
    if (k == null) throw new NullPointerException();
    for (let b: ResourceBundle | null = this; b; b = b.parent) {
      const v = b.handleGetObject(k);
      if (v != null) return v;
    }
    throw new MissingResourceException("Can't find resource for bundle " + $J.getClass(this).getName() + ', key ' + k, $J.getClass(this).getName(), k);
  }
  getString(k: string) {
    return this.getObject(k);
  }
  getStringArray(k: string) {
    return this.getObject(k);
  }
  containsKey(k: string) {
    for (let b: ResourceBundle | null = this; b; b = b.parent) if (b.map.has(k)) return true;
    return false;
  }
  keySet() {
    const s = new HashSet();
    for (let b: ResourceBundle | null = this; b; b = b.parent) for (const k of b.map.keys()) s.add(k);
    return s;
  }
  getKeys() {
    const ks = [...this.keySet()];
    let i = 0;
    return { hasMoreElements: () => i < ks.length, nextElement: () => ks[i++], hasNext: () => i < ks.length, next: () => ks[i++] };
  }
  getLocale() {
    return this.locale;
  }
  getBaseBundleName() {
    return null;
  }
}
defineLib(ResourceBundle, 'java.util.ResourceBundle');

function unescape(s: string): string {
  return s.replace(/\\(u[0-9a-fA-F]{4}|.)/g, (_m, c: string) => {
    if (c[0] === 'u' && c.length === 5) return String.fromCharCode(parseInt(c.substring(1), 16));
    return c === 'n' ? '\n' : c === 't' ? '\t' : c === 'r' ? '\r' : c;
  });
}
($J as any).jdkResource = (name: string) => ResourceBundle.load(name) != null;
