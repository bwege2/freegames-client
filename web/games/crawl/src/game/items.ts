// The original's items: base weapons and armour from item-prop.cc, the potion/scroll/wand/ring/amulet
// names and descriptions from dat/descript/items.txt, and the original's generation weights.
import { ARMOUR, ARMOUR_BY_ID, ITEM_NAMES, WEAPONS, type ArmourDef, type WeaponDef } from './data.ts';
import type { Item } from './model.ts';
import type { Rng } from './rng.ts';

export const WEAPON_GLYPH = ')';
export const ARMOUR_GLYPH = '[';
export const POTION_GLYPH = '!';
export const SCROLL_GLYPH = '?';
export const WAND_GLYPH = '/';
export const RING_GLYPH = '=';
export const AMULET_GLYPH = '"';
export const BOOK_GLYPH = '+';
export const GOLD_GLYPH = '$';

export const WEAPON_CHOICES = ['WPN_RAPIER', 'WPN_FLAIL', 'WPN_WAR_AXE', 'WPN_TRIDENT', 'WPN_LONG_SWORD', 'WPN_UNARMED'];
const UPGRADE: Record<string, string> = {
  WPN_SHORT_SWORD: 'WPN_RAPIER', WPN_MACE: 'WPN_FLAIL', WPN_HAND_AXE: 'WPN_WAR_AXE',
  WPN_SPEAR: 'WPN_TRIDENT', WPN_FALCHION: 'WPN_LONG_SWORD',
};
const BASE_CHOICE = ['WPN_SHORT_SWORD', 'WPN_MACE', 'WPN_HAND_AXE', 'WPN_SPEAR', 'WPN_FALCHION', 'WPN_QUARTERSTAFF', 'WPN_UNARMED'];

/** _get_weapons: a good-weapon job's starting choices, as the original's menu shows them. */
export function weaponChoices(good: boolean, speciesSize = 'medium', hasShield = false): string[] {
  const out: string[] = [];
  for (const w of BASE_CHOICE) {
    let id = w;
    if (good && UPGRADE[w]) id = UPGRADE[w];
    if (id === 'WPN_UNARMED') { out.push(id); continue; }
    const def = WEAPONS.find((x) => x.id === id);
    if (!def) continue;
    // weapon_restriction: the original bans weapons a species cannot wield; the two-handed
    // quarterstaff is not offered to a normal unarmed fighter in the console menu.
    if (hasShield && def.min1h === 'NUM_SIZE_LEVELS') continue;
    if (def.min1h === 'SIZE_MEDIUM' && speciesSize === 'little') continue;
    if (def.min1h === 'SIZE_LARGE' && speciesSize !== 'large') continue;
    out.push(id);
  }
  return out;
}

export const MUNDANE_WEAPONS = WEAPONS.filter((w) => !w.name.startsWith('old ') && w.commonness > 0);
export const MUNDANE_ARMOUR = ARMOUR.filter((a) => !a.name.startsWith('removed ') && a.name !== 'orb');

export function weaponDef(id: string): WeaponDef | undefined { return WEAPONS.find((w) => w.id === id); }
export function armourDef(id: string): ArmourDef | undefined { return ARMOUR_BY_ID.get(id); }

export function makeWeapon(id: string, plus = 0, ego = 'normal', qty = 1): Item {
  return { uid: 0, cls: 'weapon', id, qty, plus, ego, charges: 0, identified: true };
}
export function makeArmour(id: string, plus = 0, ego = 'normal'): Item {
  return { uid: 0, cls: 'armour', id, qty: 1, plus, ego, charges: 0, identified: true };
}
export function makePotion(name: string, qty = 1): Item {
  return { uid: 0, cls: 'potion', id: name, qty, plus: 0, ego: 'normal', charges: 0, identified: true };
}
export function makeScroll(name: string, qty = 1): Item {
  return { uid: 0, cls: 'scroll', id: name, qty, plus: 0, ego: 'normal', charges: 0, identified: true };
}
export function makeWand(name: string, charges: number): Item {
  return { uid: 0, cls: 'wand', id: name, qty: 1, plus: 0, ego: 'normal', charges, identified: true };
}
export function makeRing(name: string, plus = 0): Item {
  return { uid: 0, cls: 'ring', id: name, qty: 1, plus, ego: 'normal', charges: 0, identified: true };
}
export function makeAmulet(name: string): Item {
  return { uid: 0, cls: 'amulet', id: name, qty: 1, plus: 0, ego: 'normal', charges: 0, identified: true };
}
export function makeBook(name: string): Item {
  return { uid: 0, cls: 'book', id: name, qty: 1, plus: 0, ego: 'normal', charges: 0, identified: true };
}
export function makeGold(amount: number): Item {
  return { uid: 0, cls: 'gold', id: 'gold', qty: amount, plus: 0, ego: 'normal', charges: 0, identified: true };
}

const BRAND_NAME: Record<string, string> = {
  flaming: 'flaming', freezing: 'freezing', venom: 'venomous', electrocution: 'electrical',
  draining: 'draining', protection: 'protected', holy_wrath: 'holy', vampirism: 'vampiric',
  pain: 'painful', antimagic: 'antimagic', distortion: 'distorted', speed: 'speedy',
  heavy: 'heavy', crushing: 'crushing', spectral: 'spectral',
};
export const BRANDS = ['flaming', 'freezing', 'venom', 'protection', 'heavy', 'electrocution', 'draining', 'holy_wrath', 'vampirism', 'pain', 'antimagic', 'distortion'];

export function itemName(item: Item): string {
  if (item.cls === 'gold') return `${item.qty} gold piece${item.qty === 1 ? '' : 's'}`;
  if (item.cls === 'weapon') {
    const d = weaponDef(item.id);
    const base = d?.name ?? item.id;
    if (item.id === 'WPN_UNARMED') return 'unarmed';
    const sign = item.plus >= 0 ? '+' : '';
    const brand = item.ego !== 'normal' && BRAND_NAME[item.ego] ? `${BRAND_NAME[item.ego]} ` : '';
    return `${sign}${item.plus} ${brand}${base}`;
  }
  if (item.cls === 'armour') {
    const d = armourDef(item.id);
    const sign = item.plus > 0 ? `+${item.plus} ` : item.plus < 0 ? `${item.plus} ` : '';
    return `${sign}${d?.name ?? item.id}`;
  }
  if (item.cls === 'potion' || item.cls === 'scroll' || item.cls === 'wand' || item.cls === 'ring'
      || item.cls === 'amulet' || item.cls === 'book') {
    if (item.cls === 'wand') return `${item.id} (${item.charges})`;
    return item.id;
  }
  return item.name ?? item.id;
}

export function itemGlyph(item: Item): string {
  switch (item.cls) {
    case 'weapon': return WEAPON_GLYPH;
    case 'armour': return ARMOUR_GLYPH;
    case 'potion': return POTION_GLYPH;
    case 'scroll': return SCROLL_GLYPH;
    case 'wand': return WAND_GLYPH;
    case 'ring': return RING_GLYPH;
    case 'amulet': return AMULET_GLYPH;
    case 'book': return BOOK_GLYPH;
    case 'gold': return GOLD_GLYPH;
    default: return '?';
  }
}

export function itemColour(item: Item): string {
  if (item.cls === 'gold') return 'YELLOW';
  if (item.cls === 'weapon') {
    if (item.ego === 'flaming') return 'RED';
    if (item.ego === 'freezing') return 'LIGHTBLUE';
    if (item.ego === 'venom') return 'LIGHTGREEN';
    if (item.ego === 'holy_wrath') return 'YELLOW';
    return item.plus > 0 ? 'LIGHTBLUE' : 'LIGHTGREY';
  }
  if (item.cls === 'armour') return item.plus > 0 ? 'LIGHTBLUE' : 'LIGHTGREY';
  if (item.cls === 'potion') return 'LIGHTMAGENTA';
  if (item.cls === 'scroll') return 'WHITE';
  if (item.cls === 'wand') return 'LIGHTBLUE';
  if (item.cls === 'ring') return 'LIGHTGREEN';
  if (item.cls === 'amulet') return 'YELLOW';
  if (item.cls === 'book') return 'LIGHTRED';
  return 'LIGHTGREY';
}

export function itemDescription(item: Item): string {
  if (item.cls === 'weapon') {
    const d = weaponDef(item.id);
    const base = d?.description ?? '';
    if (item.ego !== 'normal') {
      const b = {
        flaming: 'It is wreathed in flame.', freezing: 'It is covered in frost.', venom: 'It is coated in poison.',
        protection: 'It protects its wielder.', heavy: 'It is unusually heavy.', electrocution: 'It crackles with electricity.',
        draining: 'It drains the life of those it strikes.', holy_wrath: 'It is holy.', vampirism: 'It drinks blood.',
        pain: 'It is wreathed in pain.', antimagic: 'It disrupts magic.', distortion: 'It distorts space.',
      }[item.ego] ?? '';
      return `${base}${base ? '\n\n' : ''}${b}`;
    }
    return base;
  }
  if (item.cls === 'armour') return armourDef(item.id)?.description ?? '';
  const key = item.id.toLowerCase();
  return ITEM_NAMES[key] ?? '';
}

export function stackable(item: Item): boolean {
  return item.cls === 'potion' || item.cls === 'scroll' || item.cls === 'gold';
}

/** _job_def equipment specs: "potion of might q:2", "dagger plus:2", "dart ego:poisoned q:9". */
export function parseItemSpec(spec: string): { name: string; qty: number; plus: number; ego: string; charges: number } {
  let rest = spec.trim();
  let qty = 1, plus = 0, ego = 'normal', charges = 0;
  const q = /\bq:(\d+)/.exec(rest); if (q) { qty = Number(q[1]); rest = rest.replace(q[0], ''); }
  const p = /\bplus:(-?\d+)/.exec(rest); if (p) { plus = Number(p[1]); rest = rest.replace(p[0], ''); }
  const c = /\bcharges:(\d+)/.exec(rest); if (c) { charges = Number(c[1]); rest = rest.replace(c[0], ''); }
  const e = /\bego:(\w+)/.exec(rest); if (e) { ego = e[1]; rest = rest.replace(e[0], ''); }
  rest = rest.replace(/\bno_exclude\b|\bno_pickup\b/g, '').trim().replace(/\s+/g, ' ');
  return { name: rest, qty, plus, ego, charges };
}

export function itemFromSpec(spec: string): Item | null {
  const { name, qty, plus, ego, charges } = parseItemSpec(spec);
  if (!name) return null;
  if (name === 'unarmed') return null;
  const w = WEAPONS.find((x) => x.name === name);
  if (w) return makeWeapon(w.id, plus, ego, qty);
  const a = ARMOUR.find((x) => x.name === name);
  if (a) return makeArmour(a.id, plus, ego);
  if (name.startsWith('potion of ')) return makePotion(name, qty);
  if (name.startsWith('scroll of ')) return makeScroll(name, qty);
  if (name.startsWith('wand of ')) return makeWand(name, charges || 15);
  if (name.startsWith('ring of ')) return makeRing(name, plus);
  if (name.startsWith('amulet of ')) return makeAmulet(name);
  if (name.includes('book') || name.startsWith('book of ')) return makeBook(name);
  if (name === 'gold') return makeGold(qty);
  return null;
}

export const POTIONS = Object.keys(ITEM_NAMES).filter((k) => k.startsWith('potion of ')).sort();
export const SCROLLS = Object.keys(ITEM_NAMES).filter((k) => k.startsWith('scroll of ')).sort();
export const WANDS = Object.keys(ITEM_NAMES).filter((k) => k.startsWith('wand of ')).sort();
export const RINGS = Object.keys(ITEM_NAMES).filter((k) => k.startsWith('ring of ')).sort();
export const AMULETS = Object.keys(ITEM_NAMES).filter((k) => k.startsWith('amulet of ')).sort();

const EARLY_POTIONS = [
  'potion of might', 'potion of curing', 'potion of heal wounds', 'potion of magic', 'potion of haste',
  'potion of berserk rage', 'potion of flight', 'potion of brilliance', 'potion of agility',
];
const EARLY_SCROLLS = [
  'scroll of blinking', 'scroll of teleportation', 'scroll of magic mapping', 'scroll of remove curse',
  'scroll of fear', 'scroll of fog', 'scroll of immolation',
];
const EARLY_WANDS = ['wand of flame', 'wand of frost', 'wand of magic darts', 'wand of confusion', 'wand of polymorph'];
const EARLY_RINGS = ['ring of protection', 'ring of evasion', 'ring of slaying', 'ring of magical power', 'ring of strength'];

export function randomWeapon(rng: Rng, depth: number): Item {
  const pool = MUNDANE_WEAPONS.filter((w) => w.commonness > 0);
  const w = rng.weighted(pool.map((x) => [x.commonness, x] as [number, WeaponDef]));
  const plus = Math.min(3, Math.max(0, rng.int(1 + Math.floor(depth / 5))));
  const egoChance = Math.min(35, 4 + depth * 2);
  const ego = rng.xChanceInY(egoChance, 100) ? rng.choose(BRANDS) : 'normal';
  return makeWeapon(w.id, plus, ego);
}

export function randomArmour(rng: Rng, depth: number): Item {
  const pool = MUNDANE_ARMOUR.filter((a) => a.slot !== 'SLOT_OFFHAND' || a.name.includes('shield') || a.name === 'buckler');
  const a = rng.weighted(pool.map((x) => [Math.max(1, x.acquire || 1), x] as [number, ArmourDef]));
  const plus = rng.xChanceInY(Math.min(40, 5 + depth * 3), 100) ? 1 + rng.int(1 + Math.floor(depth / 6)) : 0;
  const ego = a.name.includes('dragon') ? 'normal' : (rng.xChanceInY(Math.min(25, 2 + depth), 100) ? 'protection' : 'normal');
  return makeArmour(a.id, plus, ego);
}

export function randomConsumable(rng: Rng, depth: number): Item {
  const r = rng.int(100);
  if (r < 45) return makePotion(rng.choose(EARLY_POTIONS.slice(0, Math.min(EARLY_POTIONS.length, 4 + Math.floor(depth / 3)))));
  if (r < 82) return makeScroll(rng.choose(EARLY_SCROLLS.slice(0, Math.min(EARLY_SCROLLS.length, 3 + Math.floor(depth / 4)))));
  if (r < 95) return makeWand(rng.choose(EARLY_WANDS.slice(0, Math.min(EARLY_WANDS.length, 2 + Math.floor(depth / 4)))), 4 + rng.int(10));
  if (r < 98) return makeRing(rng.choose(EARLY_RINGS));
  return makeAmulet('amulet of regeneration');
}

export function randomItem(rng: Rng, depth: number): Item {
  const r = rng.int(100);
  if (r < 28) return randomWeapon(rng, depth);
  if (r < 48) return randomArmour(rng, depth);
  if (r < 78) return randomConsumable(rng, depth);
  if (r < 88) return makeGold(1 + rng.int(20 + depth * 8));
  return randomConsumable(rng, depth);
}
