// C-Dogs SDL 2.5.0, translated: player templates (player_template.c). The original keeps them in players.cnf;
// the port keeps the same JSON in the player's server storage (README.md). GPL-2.0-or-later / BSD-2-Clause
// (web/games/cdogs/LICENSE.md).
import { CharacterOldFaceToHeadParts, CharacterOldHairToHeadParts, StrCharacterClass } from './classes.ts';
import { HEAD_PART_COUNT, HEAD_PART_FACEHAIR, HEAD_PART_GLASSES, HEAD_PART_HAIR, HEAD_PART_HAT, type CharColors } from './pics.ts';
import { GetString, LoadColor, LoadInt, LoadStr, child, type Json } from './json.ts';
import type { Character, PlayerData } from './types.ts';
import { cloneCharColors, zeroCharColors } from './player.ts';
import type { Color } from './base.ts';

export const PLAYER_NAME_MAXLEN = 20;
const VERSION = 4;

export interface PlayerTemplate {
  name: string;
  CharClassName: string | null;
  HeadParts: (string | null)[];
  Colors: CharColors;
}
export const gPlayerTemplates = { Classes: [] as PlayerTemplate[], CustomClasses: [] as PlayerTemplate[] };

export function newPlayerTemplate(): PlayerTemplate {
  return { name: '', CharClassName: null, HeadParts: [null, null, null, null], Colors: zeroCharColors() };
}
function LoadPlayerTemplate(templates: PlayerTemplate[], node: Json, version: number): void {
  const t = newPlayerTemplate();
  t.name = String(GetString(node, 'Name') ?? '').slice(0, PLAYER_NAME_MAXLEN - 1);
  t.CharClassName = GetString(node, 'Face');
  if (version < 3) {
    const r = CharacterOldFaceToHeadParts(t.CharClassName ?? '', t.HeadParts);
    t.CharClassName = r;
  } else {
    t.HeadParts[HEAD_PART_HAIR] = LoadStr(node, 'HairType');
    if (version < 4) {
      CharacterOldHairToHeadParts(t.HeadParts);
    } else {
      t.HeadParts[HEAD_PART_FACEHAIR] = LoadStr(node, 'FacehairType');
      t.HeadParts[HEAD_PART_HAT] = LoadStr(node, 'HatType');
      t.HeadParts[HEAD_PART_GLASSES] = LoadStr(node, 'GlassesType');
    }
  }
  const c = t.Colors;
  const lc = (k: keyof CharColors, name: string): void => {
    c[k] = LoadColor(node, name, c[k]);
  };
  lc('Skin', 'Skin');
  lc('Arms', 'Arms');
  lc('Body', 'Body');
  lc('Legs', 'Legs');
  lc('Hair', 'Hair');
  if (version < 3) c.Feet = { ...c.Legs };
  lc('Feet', 'Feet');
  if (version < 4) {
    c.Facehair = { ...c.Hair };
    c.Hat = { ...c.Hair };
    c.Glasses = { ...c.Hair };
  }
  lc('Facehair', 'Facehair');
  lc('Hat', 'Hat');
  lc('Glasses', 'Glasses');
  templates.push(t);
}
export function PlayerTemplatesLoadJSON(classes: PlayerTemplate[], node: Json): void {
  const version = LoadInt(node, 'Version', 1);
  const arr = child(node, 'PlayerTemplates');
  if (!Array.isArray(arr)) return;
  for (const n of arr) LoadPlayerTemplate(classes, n as Json, version);
}
export function PlayerTemplatesLoadText(text: string | null): void {
  gPlayerTemplates.Classes = [];
  if (!text) return;
  try {
    PlayerTemplatesLoadJSON(gPlayerTemplates.Classes, JSON.parse(text) as Json);
  } catch {
    gPlayerTemplates.Classes = [];
  }
}
const colorJson = (c: Color): string => `#${[c.r, c.g, c.b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
export function PlayerTemplatesSaveText(): string {
  const templates = gPlayerTemplates.Classes.map((t) => {
    const o: Record<string, string> = { Name: t.name, Face: t.CharClassName ?? '' };
    if (t.HeadParts[HEAD_PART_HAIR]) o.HairType = t.HeadParts[HEAD_PART_HAIR]!;
    if (t.HeadParts[HEAD_PART_FACEHAIR]) o.FacehairType = t.HeadParts[HEAD_PART_FACEHAIR]!;
    if (t.HeadParts[HEAD_PART_HAT]) o.HatType = t.HeadParts[HEAD_PART_HAT]!;
    if (t.HeadParts[HEAD_PART_GLASSES]) o.GlassesType = t.HeadParts[HEAD_PART_GLASSES]!;
    const c = t.Colors;
    Object.assign(o, {
      Body: colorJson(c.Body), Arms: colorJson(c.Arms), Legs: colorJson(c.Legs), Skin: colorJson(c.Skin),
      Hair: colorJson(c.Hair), Facehair: colorJson(c.Facehair), Hat: colorJson(c.Hat), Glasses: colorJson(c.Glasses),
      Feet: colorJson(c.Feet),
    });
    return o;
  });
  return JSON.stringify({ Version: VERSION, PlayerTemplates: templates }, null, '\t');
}
export function PlayerTemplateGetById(id: number): PlayerTemplate | null {
  const pt = gPlayerTemplates;
  if (id < pt.CustomClasses.length) return pt.CustomClasses[id];
  if (id < pt.CustomClasses.length + pt.Classes.length) return pt.Classes[id - pt.CustomClasses.length];
  return null;
}
export function PlayerTemplateGetNum(): number {
  return gPlayerTemplates.Classes.length + gPlayerTemplates.CustomClasses.length;
}
export function PlayerTemplateToPlayerData(p: PlayerData, t: PlayerTemplate): void {
  if (t.name.length === 0 || t.CharClassName == null) return;
  p.name = t.name;
  p.Char.Class = StrCharacterClass(t.CharClassName) ?? StrCharacterClass('Jones');
  for (let hp = HEAD_PART_HAIR; hp < HEAD_PART_COUNT; hp++) p.Char.HeadParts[hp] = t.HeadParts[hp] ?? null;
  p.Char.Colors = cloneCharColors(t.Colors);
}
function PlayerTemplateFromCharacter(t: PlayerTemplate, c: Character): void {
  t.CharClassName = c.Class!.Name;
  for (let hp = HEAD_PART_HAIR; hp < HEAD_PART_COUNT; hp++) if (c.HeadParts[hp]) t.HeadParts[hp] = c.HeadParts[hp];
  t.Colors = cloneCharColors(c.Colors);
}
export function PlayerTemplateFromPlayerData(t: PlayerTemplate, p: PlayerData): void {
  t.name = p.name;
  PlayerTemplateFromCharacter(t, p.Char);
}
export function PlayerTemplateAddCharacter(classes: PlayerTemplate[], c: Character): void {
  const t = newPlayerTemplate();
  t.name = (c.PlayerTemplateName ?? '').slice(0, PLAYER_NAME_MAXLEN - 1);
  PlayerTemplateFromCharacter(t, c);
  classes.push(t);
}
