// OpenClonk in the browser: the scenario list of the page, until the original's start menu is translated
// (milestone 3, gui/C4StartupScenSelDlg.cpp). It reads what the original's C4ScenarioListLoader reads from the packed
// scenario folders and orders them as its EntrySortFunc does (Config.Startup.AlphabeticalSorting off, the default):
// the entry's name from Title.txt for the language (C4ComponentHost::GetLanguageString), else the scenario core's
// Title, else the file name; folders by Folder.txt's Index, scenarios by their standard icon (2..11), then by
// Difficulty, then by name.
import { C4Group, unpackGroupFile } from './rt/group.ts';

/** C4Config's LanguageEx as boot.ts sets it */
export const LANGUAGE = 'US';

export interface ScenarioEntry {
  /** the scenario's path below planet/, as boot.ts takes it ("Tutorials.ocf/Tutorial01.ocs") */
  path: string;
  title: string;
  /** C4ScenarioListLoader::Entry::iIconIndex: the core's Icon when the scenario has no Icon.png/Icon.bmp, else -1 */
  icon: number;
  /** C4S.Head.Difficulty (0 for savegames and records) */
  difficulty: number;
  /** C4S.Head.MinPlayer (0: not set): the scenario selection refuses to start with fewer players */
  minPlayers: number;
}

export interface ScenarioFolder {
  /** the folder's file name in planet/ ("Tutorials.ocf") */
  name: string;
  title: string;
  /** Folder.txt [Head] Index */
  index: number;
  scenarios: ScenarioEntry[];
}

const utf8 = new TextDecoder();

/** C4ComponentHost::GetLanguageString: the text after the first "US:" up to the line's end */
export function languageString(text: string, language = LANGUAGE): string | null {
  for (const lang of language.split(',')) {
    const key = lang.slice(0, 2) + ':';
    const at = text.indexOf(key);
    if (at < 0) continue;
    const rest = text.slice(at + key.length);
    const end = rest.search(/[\r\n]/);
    return end < 0 ? rest : rest.slice(0, end);
  }
  return null;
}

/** the [Head] section of a core file (Scenario.txt, Folder.txt) as name -> value */
export function headSection(text: string): Map<string, string> {
  const out = new Map<string, string>();
  let inHead = false;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (line.startsWith('[')) {
      inHead = line === '[Head]';
      continue;
    }
    const eq = line.indexOf('=');
    if (inHead && eq > 0) out.set(line.slice(0, eq).trim(), line.slice(eq + 1).trim());
  }
  return out;
}

const intOf = (v: string | undefined, dflt: number): number => {
  const n = v === undefined ? NaN : parseInt(v, 10);
  return Number.isNaN(n) ? dflt : n;
};

/** C4Language::LoadComponentHost(..., "Title%s.txt|Title.txt", LanguageEx): TitleUS.txt before Title.txt */
function titleOf(group: C4Group): string | null {
  const data = group.LoadEntry(`Title${LANGUAGE}.txt`) ?? group.LoadEntry('Title.txt');
  return data ? languageString(utf8.decode(data)) : null;
}

/** the scenarios of a packed scenario folder (a .ocf group as pack.sh writes it) */
export function readScenarioFolder(name: string, packed: Uint8Array): ScenarioFolder {
  const group = new C4Group(name, unpackGroupFile(packed));
  const folderCore = group.LoadEntry('Folder.txt');
  const head = folderCore ? headSection(utf8.decode(folderCore)) : new Map<string, string>();
  const scenarios: ScenarioEntry[] = [];
  for (const e of group.entries) {
    if (e.deleted || !e.ChildGroup || !/\.ocs$/i.test(e.name)) continue;
    const child = group.OpenAsChild(e.name);
    if (!child) continue;
    const coreData = child.LoadEntry('Scenario.txt');
    const core = coreData ? headSection(utf8.decode(coreData)) : new Map<string, string>();
    const hasIcon = !!(child.GetEntry('Icon.png') || child.GetEntry('Icon.bmp'));
    const special = intOf(core.get('SaveGame'), 0) !== 0 || intOf(core.get('Replay'), 0) !== 0;
    scenarios.push({
      path: `${name}/${e.name}`,
      // Entry::Load: the file name without extension, replaced by Title.txt, else (LoadCustom) by the core's Title
      title: titleOf(child) ?? core.get('Title') ?? e.name.replace(/\.[^.]*$/, ''),
      icon: hasIcon ? -1 : intOf(core.get('Icon'), 18),
      difficulty: special ? 0 : intOf(core.get('Difficulty'), 0),
      minPlayers: intOf(core.get('MinPlayer'), 0),
    });
  }
  scenarios.sort(compareEntries);
  return { name, title: titleOf(group) ?? name.replace(/\.[^.]*$/, ''), index: intOf(head.get('Index'), 0), scenarios };
}

/** stricmp of the C library (ASCII case folding, bytes compared) */
function stricmp(a: string, b: string): number {
  const x = new TextEncoder().encode(a), y = new TextEncoder().encode(b);
  for (let i = 0; ; i++) {
    const c = i < x.length ? x[i] : 0, d = i < y.length ? y[i] : 0;
    const cl = c >= 65 && c <= 90 ? c + 32 : c, dl = d >= 65 && d <= 90 ? d + 32 : d;
    if (cl !== dl || !c) return cl - dl;
  }
}

/** EntrySortFunc for two scenarios of one folder */
export function compareEntries(a: ScenarioEntry, b: ScenarioEntry): number {
  if (a.icon >= 2 && a.icon <= 11) {
    const d = a.icon - b.icon;
    if (d) return d;
  }
  if (a.difficulty || b.difficulty) {
    if (!a.difficulty) return +1;
    if (!b.difficulty) return -1;
    const d = a.difficulty - b.difficulty;
    if (d) return d;
  }
  return stricmp(a.title, b.title);
}

/** EntrySortFunc for folders: by Folder.txt Index (0 last), then by name */
export function compareFolders(a: ScenarioFolder, b: ScenarioFolder): number {
  if (a.index || b.index) {
    if (!a.index) return +1;
    if (!b.index) return -1;
    const d = a.index - b.index;
    if (d) return d;
  }
  return stricmp(a.title, b.title);
}
