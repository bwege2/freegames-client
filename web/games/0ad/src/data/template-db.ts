// Resolves and caches the templates shipped in assets/templates. Browser and test code both build
// it from a map of file name (without .xml) to text, so the tests read the same original files.
import { TemplateSet } from './templates.ts';
import { templateInfo, type TemplateInfo } from './template-info.ts';

export class TemplateDatabase {
  readonly set: TemplateSet;
  private readonly cache = new Map<string, TemplateInfo>();

  constructor(files: Map<string, string>) {
    this.set = new TemplateSet(files);
  }

  has(name: string): boolean {
    if (name.startsWith('actor|')) return true;
    return this.set.files.has(name) || this.set.files.has(`mixins/${name}`) || this.set.files.has(`special/filter/${name}`);
  }

  info(name: string): TemplateInfo {
    const cached = this.cache.get(name);
    if (cached) return cached;
    const info = templateInfo(name, this.set.resolve(name));
    this.cache.set(name, info);
    return info;
  }

  /** all template names the port shipped, without .xml */
  names(): string[] {
    return [...this.set.files.keys()].sort();
  }
}
