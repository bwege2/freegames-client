// Shops: shopping.cc `item_value`, `_shop_get_item_value`, `item_price`,
// dungeon.cc `greed_for_shop_type`/`_shop_greed` and `_shop_num_items`, and
// the 0.34 shop-type.h types. Shop *placement* is the port's (the original's
// shops come from vaults, which are not ported); the prices are the original's.
import type { Item } from './model.ts';
import {
  armourDef, makeAmulet, makeMissile, makePotion, makeRing, makeScroll, makeWand, randomBook,
  randomWeapon, randomArmour, weaponDef, missileDef, POTIONS, SCROLLS, WANDS, RINGS, AMULETS,
} from './items.ts';
import type { Rng } from './rng.ts';

export type ShopType = 'SHOP_WEAPON' | 'SHOP_ARMOUR' | 'SHOP_WEAPON_ANTIQUE' | 'SHOP_ARMOUR_ANTIQUE'
  | 'SHOP_GENERAL_ANTIQUE' | 'SHOP_JEWELLERY' | 'SHOP_BOOK' | 'SHOP_EVOKABLES' | 'SHOP_DISTILLERY'
  | 'SHOP_SCROLL' | 'SHOP_GENERAL';

export const SHOP_TYPES: ShopType[] = [
  'SHOP_WEAPON', 'SHOP_ARMOUR', 'SHOP_WEAPON_ANTIQUE', 'SHOP_ARMOUR_ANTIQUE', 'SHOP_GENERAL_ANTIQUE',
  'SHOP_JEWELLERY', 'SHOP_BOOK', 'SHOP_EVOKABLES', 'SHOP_DISTILLERY', 'SHOP_SCROLL', 'SHOP_GENERAL',
];

/** shopping.cc shoptype_identifies_stock. */
export function shopIdentifiesStock(t: ShopType): boolean {
  return t !== 'SHOP_WEAPON_ANTIQUE' && t !== 'SHOP_ARMOUR_ANTIQUE' && t !== 'SHOP_GENERAL_ANTIQUE';
}

/** dungeon.cc greed_for_shop_type: 15 + random2avg(19,2) + level/6 + random2(level*2/3)
 *  for non-identifying shops, 10 + random2(5) + ... for identifying ones. */
export function greedForShopType(rng: Rng, t: ShopType, levelNumber: number): number {
  const levelGreed = Math.trunc(levelNumber / 6) + rng.int(Math.max(1, Math.trunc(levelNumber * 2 / 3)));
  if (!shopIdentifiesStock(t)) return 15 + rng.intAvg(19, 2) + levelGreed;
  return 10 + rng.int(5) + levelGreed;
}

const BRAND_MULT: Record<string, number> = {
  normal: 10, speed: 30, vampirism: 30, antimagic: 30,
  distortion: 25, electrocution: 25, pain: 25, spectral: 25,
  chaos: 18, draining: 18, flaming: 18, freezing: 18, heavy: 18, holy_wrath: 18,
  protection: 12, venom: 12,
};

const POTION_VALUE: Record<string, number> = {
  'potion of experience': 500, 'potion of resistance': 100, 'potion of haste': 100,
  'potion of magic': 80, 'potion of invisibility': 80, 'potion of cancellation': 80,
  'potion of heal wounds': 80, 'potion of ambrosia': 80, 'potion of mutation': 80,
  'potion of berserk rage': 50, 'potion of enlightenment': 50,
  'potion of might': 40, 'potion of brilliance': 40,
  'potion of curing': 30, 'potion of lignification': 30, 'potion of attraction': 30,
  'potion of moonshine': 10,
};

const SCROLL_VALUE: Record<string, number> = {
  'scroll of acquirement': 520,
  'scroll of summoning': 95, 'scroll of torment': 95, 'scroll of silence': 95,
  'scroll of brand weapon': 95, 'scroll of blinking': 95, 'scroll of butterflies': 95,
  'scroll of enchant armour': 75, 'scroll of enchant weapon': 75, 'scroll of revelation': 75,
  'scroll of amnesia': 40, 'scroll of fear': 40, 'scroll of immolation': 40,
  'scroll of poison': 40, 'scroll of vulnerability': 40, 'scroll of fog': 40,
  'scroll of teleportation': 30, 'scroll of identify': 20, 'scroll of noise': 10,
};

const WAND_VALUE: Record<string, [number, number]> = {
  'wand of acid': [42, 0], 'wand of light': [42, 0], 'wand of quicksilver': [42, 0],
  'wand of digging': [42, 0], 'wand of iceblast': [24, 0], 'wand of roots': [24, 0],
  'wand of warping': [24, 0], 'wand of charming': [24, 0], 'wand of paralysis': [24, 0],
  'wand of polymorph': [14, 0], 'wand of mindburst': [14, 0], 'wand of flame': [7, 0],
};

const JEWELLERY_VALUE: Record<string, number> = {
  'amulet of faith': 400,
  'ring of wizardry': 300, 'amulet of regeneration': 300, 'amulet of guardian spirit': 300,
  'amulet of magic regeneration': 300, 'amulet of the acrobat': 300, 'amulet of reflection': 300,
  'amulet of wildshape': 300, 'amulet of chemistry': 300, 'amulet of dissipation': 300,
  'ring of protection from cold': 250, 'ring of protection from fire': 250, 'ring of willpower': 250,
  'ring of magical power': 200, 'ring of positive energy': 200, 'ring of poison resistance': 200,
  'ring of resist corrosion': 200, 'ring of see invisible': 200,
  'ring of flight': 150,
};

/** shopping.cc item_value for the item classes the port has. */
export function itemValue(item: Item, identified = true): number {
  const isId = identified;
  let valued = 0;
  if (item.cls === 'weapon') {
    const d = weaponDef(item.id);
    if (!d) return 1;
    valued += d.price;
    if (isId) {
      const mult = BRAND_MULT[item.ego] ?? 10;
      valued = Math.trunc((valued * mult) / 10);
      valued += 50 * item.plus;
    }
  } else if (item.cls === 'armour') {
    const d = armourDef(item.id);
    if (!d) return 1;
    valued += d.price;
    if (isId) {
      if (item.ego === 'protection') valued += 50;
      else if (item.ego === 'resistance') valued += 250;
      valued += 50 * item.plus;
    }
  } else if (item.cls === 'missile') {
    valued += missileDef(item.id)?.price ?? 1;
  } else if (item.cls === 'potion') {
    if (!isId) valued += 9;
    else valued += POTION_VALUE[item.id] ?? 0;
  } else if (item.cls === 'scroll') {
    if (!isId) valued += 10;
    else valued += SCROLL_VALUE[item.id] ?? 0;
  } else if (item.cls === 'wand') {
    if (!isId) valued += 40;
    else {
      const [base, per] = WAND_VALUE[item.id] ?? [4, 0];
      valued += (base || 4) * item.charges + per * item.charges;
    }
  } else if (item.cls === 'ring' || item.cls === 'amulet') {
    if (!isId) valued += 50;
    else if (item.cls === 'ring' && ['ring of slaying', 'ring of protection', 'ring of evasion',
      'ring of strength', 'ring of dexterity', 'ring of intelligence'].includes(item.id)) {
      // shopping.cc: base = 2*plus / 8*plus/5 / 4*plus/3; price = 5n(n+1).
      let base = 0;
      if (item.id === 'ring of slaying' || item.id === 'ring of protection') base = 2 * item.plus;
      else if (item.id === 'ring of evasion') base = Math.trunc(8 * item.plus / 5);
      else base = Math.trunc(item.plus * 4 / 3);
      valued += base <= 0 ? 25 * base : 5 * base * (base + 1);
    } else {
      valued += JEWELLERY_VALUE[item.id] ?? 100;
    }
  } else if (item.cls === 'book') {
    valued += 100;
  } else {
    valued += 1;
  }
  return Math.max(1, valued);
}

/** shopping.cc _shop_get_item_value: greed * value / 10, plus the consumable minimum. */
export function shopItemPrice(item: Item, greed: number, identifiesStock: boolean): number {
  let result = Math.trunc((greed * itemValue(item, identifiesStock)) / 10);
  if (identifiesStock && (item.cls === 'potion' || item.cls === 'scroll' || item.cls === 'wand')) {
    result = Math.max(result, Math.trunc((result * (15 + greed)) / 30));
  }
  return Math.max(1, result);
}

function makeShopItem(rng: Rng, type: ShopType, level: number): Item {
  switch (type) {
    case 'SHOP_WEAPON': case 'SHOP_WEAPON_ANTIQUE':
      return randomWeapon(rng, level);
    case 'SHOP_ARMOUR': case 'SHOP_ARMOUR_ANTIQUE':
      return randomArmour(rng, level);
    case 'SHOP_JEWELLERY':
      return rng.oneChanceIn(2) ? makeRing(rng.choose(RINGS)) : makeAmulet(rng.choose(AMULETS));
    case 'SHOP_BOOK':
      return randomBook(rng, level);
    case 'SHOP_SCROLL':
      return makeScroll(rng.choose(SCROLLS));
    case 'SHOP_DISTILLERY':
      return makePotion(rng.choose(POTIONS));
    case 'SHOP_EVOKABLES':
      return makeWand(rng.choose(WANDS), 3 + rng.int(10));
    default:
      return rng.oneChanceIn(2)
        ? (rng.oneChanceIn(2) ? randomWeapon(rng, level) : randomArmour(rng, level))
        : makeMissile(rng.choose(['MI_DART', 'MI_STONE', 'MI_JAVELIN']), 5 + rng.int(10));
  }
}

/** dungeon.cc place_spec_shop + _shop_num_items: 5 + random2avg(8,3) items (books 7 + ...). */
export function makeShop(rng: Rng, type: ShopType, level: number): { greed: number; stock: Item[] } {
  const greed = greedForShopType(rng, type, level);
  const n = type === 'SHOP_BOOK' ? 7 + rng.intAvg(13, 3) : 5 + rng.intAvg(8, 3);
  const stock: Item[] = [];
  for (let i = 0; i < n; i++) stock.push(makeShopItem(rng, type, level));
  return { greed, stock };
}

/** item_in_shop: the item class a shop stocks, for the shop's title. */
export function shopTitle(type: ShopType): string {
  switch (type) {
    case 'SHOP_WEAPON': return 'weapon shop';
    case 'SHOP_ARMOUR': return 'armour shop';
    case 'SHOP_WEAPON_ANTIQUE': return 'antique weapon shop';
    case 'SHOP_ARMOUR_ANTIQUE': return 'antique armour shop';
    case 'SHOP_GENERAL_ANTIQUE': return 'antique shop';
    case 'SHOP_JEWELLERY': return 'jewellery shop';
    case 'SHOP_BOOK': return 'book shop';
    case 'SHOP_EVOKABLES': return 'evokables shop';
    case 'SHOP_DISTILLERY': return 'distillery';
    case 'SHOP_SCROLL': return 'scroll shop';
    default: return 'general store';
  }
}
