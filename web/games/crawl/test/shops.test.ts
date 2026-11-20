// Shops: shopping.cc item_value/item_price, dungeon.cc greed and stock sizes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Rng } from '../src/game/rng.ts';
import {
  SHOP_TYPES, greedForShopType, itemValue, makeShop, shopIdentifiesStock, shopItemPrice, shopTitle,
} from '../src/game/shops.ts';
import { makePotion, makeWeapon, makeArmour, makeWand, makeMissile } from '../src/game/items.ts';
import { ARMOUR_BY_NAME, WEAPON_BY_NAME } from '../src/game/data.ts';

test('the 0.34 shop types are shop-type.h', () => {
  assert.deepEqual(SHOP_TYPES, [
    'SHOP_WEAPON', 'SHOP_ARMOUR', 'SHOP_WEAPON_ANTIQUE', 'SHOP_ARMOUR_ANTIQUE', 'SHOP_GENERAL_ANTIQUE',
    'SHOP_JEWELLERY', 'SHOP_BOOK', 'SHOP_EVOKABLES', 'SHOP_DISTILLERY', 'SHOP_SCROLL', 'SHOP_GENERAL',
  ]);
  assert.equal(shopTitle('SHOP_DISTILLERY'), 'distillery');
  assert.equal(shopTitle('SHOP_WEAPON_ANTIQUE'), 'antique weapon shop');
  assert.equal(shopIdentifiesStock('SHOP_WEAPON'), true);
  assert.equal(shopIdentifiesStock('SHOP_WEAPON_ANTIQUE'), false);
  assert.equal(shopIdentifiesStock('SHOP_GENERAL_ANTIQUE'), false);
});

test('greed_for_shop_type is dungeon.cc', () => {
  // Identifying: 10 + random2(5) + level/6 + random2(level * 2 / 3).
  assert.equal(greedForShopType(new Rng(7n), 'SHOP_WEAPON', 5), 12);
  // Non-identifying: 15 + random2avg(19, 2) + ...
  assert.equal(greedForShopType(new Rng(7n), 'SHOP_WEAPON_ANTIQUE', 5), 27);
});

test('item_value is shopping.cc for the port\'s item classes', () => {
  const sword = makeWeapon('WPN_LONG_SWORD');
  assert.equal(itemValue(sword), WEAPON_BY_NAME.get('long sword')!.price);
  const flaming = makeWeapon('WPN_LONG_SWORD', 2, 'flaming');
  // 35 * 18 / 10 + 50 * 2 = 163.
  assert.equal(itemValue(flaming), Math.trunc(WEAPON_BY_NAME.get('long sword')!.price * 18 / 10) + 100);
  assert.equal(itemValue(makeWeapon('WPN_LONG_SWORD'), false), 35);
  assert.equal(itemValue(makePotion('potion of might')), 40);
  assert.equal(itemValue(makePotion('potion of might'), false), 9);
  const mail = makeArmour('ARM_CHAIN_MAIL', 1, 'protection');
  assert.equal(itemValue(mail), ARMOUR_BY_NAME.get('chain mail')!.price + 50 + 50);
  assert.equal(itemValue(makeMissile('MI_JAVELIN', 5)), 30);
  assert.equal(itemValue(makeWand('wand of flame', 4)), 28);
});

test('shop prices apply the greed and the consumable minimum', () => {
  const sword = makeWeapon('WPN_LONG_SWORD');
  // greed 12 * 35 / 10 = 42.
  assert.equal(shopItemPrice(sword, 12, true), 42);
  const potion = makePotion('potion of might');
  // greed 12 * 40 / 10 = 48; max(48, 48 * 27 / 30 = 43) = 48.
  assert.equal(shopItemPrice(potion, 12, true), 48);
  // An unidentified antique-shop potion is worth 9: 12 * 9 / 10 = 10.
  assert.equal(shopItemPrice(potion, 12, false), 10);
  assert.equal(shopItemPrice(sword, 1, true), 3);
});

test('stock sizes are _shop_num_items: 5 + random2avg(8,3), books 7 + random2avg(13,3)', () => {
  const weapon = makeShop(new Rng(7n), 'SHOP_WEAPON', 5);
  assert.equal(weapon.stock.length, 8);
  assert.equal(weapon.greed, 12);
  for (const item of weapon.stock) assert.equal(item.cls, 'weapon');
  const book = makeShop(new Rng(7n), 'SHOP_BOOK', 5);
  assert.ok(book.stock.length >= 7);
  for (const item of book.stock) assert.equal(item.cls, 'book');
  const scroll = makeShop(new Rng(7n), 'SHOP_SCROLL', 5);
  for (const item of scroll.stock) assert.equal(item.cls, 'scroll');
  const distillery = makeShop(new Rng(7n), 'SHOP_DISTILLERY', 5);
  for (const item of distillery.stock) assert.equal(item.cls, 'potion');
});
