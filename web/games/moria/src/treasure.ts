// treasure.cpp: Magical treasure
import { config } from './config.ts';
import {
  SHRT_MAX, SpecialNameIds, TV_AMULET, TV_ARROW, TV_BOLT, TV_BOOTS, TV_BOW, TV_CHEST, TV_CLOAK, TV_DIGGING, TV_FOOD, TV_GLOVES,
  TV_HAFTED, TV_HARD_ARMOR, TV_HELM, TV_LIGHT, TV_POLEARM, TV_POTION1, TV_RING, TV_SCROLL1, TV_SHIELD, TV_SLING_AMMO, TV_SOFT_ARMOR,
  TV_SPIKE, TV_STAFF, TV_SWORD, TV_WAND,
} from './constants.ts';
import { maxDiceRoll } from './dice.ts';
import { randomNumber, randomNumberNormalDistribution } from './game.ts';
import { game, globals } from './globals.ts';
import { idiv, u16, u8 } from './libc.ts';
import type { Inventory_t } from './structs.ts';

const flags = config.treasure.flags;
const chests = config.treasure.chests;
const ident = config.identification;

// Should the object be enchanted -RAK-
function magicShouldBeEnchanted(chance: number): boolean {
  return randomNumber(100) <= chance;
}

// Enchant a bonus based on degree desired -RAK-
function magicEnchantmentBonus(base: number, max_standard: number, level: number): number {
  let stand_deviation = idiv(config.treasure.LEVEL_STD_OBJECT_ADJUST * level, 100) + config.treasure.LEVEL_MIN_OBJECT_STD;

  // Check for level > max_standard since that may have generated an overflow.
  if (stand_deviation > max_standard || level > max_standard) {
    stand_deviation = max_standard;
  }

  // abs may be a macro, don't call it with randomNumberNormalDistribution() as a parameter
  const abs_distribution = Math.abs(randomNumberNormalDistribution(0, stand_deviation));
  const bonus = idiv(abs_distribution, 10) + base;

  if (bonus < base) {
    return base;
  }

  return bonus;
}

function magicalArmor(item: Inventory_t, special: number, level: number): void {
  item.to_ac += magicEnchantmentBonus(1, 30, level);

  if (!magicShouldBeEnchanted(special)) {
    return;
  }

  switch (randomNumber(9)) {
    case 1:
      item.flags |= flags.TR_RES_LIGHT | flags.TR_RES_COLD | flags.TR_RES_ACID | flags.TR_RES_FIRE;
      item.special_name_id = SpecialNameIds.SN_R;
      item.to_ac += 5;
      item.cost += 2500;
      break;
    case 2: // Resist Acid
      item.flags |= flags.TR_RES_ACID;
      item.special_name_id = SpecialNameIds.SN_RA;
      item.cost += 1000;
      break;
    case 3:
    case 4: // Resist Fire
      item.flags |= flags.TR_RES_FIRE;
      item.special_name_id = SpecialNameIds.SN_RF;
      item.cost += 600;
      break;
    case 5:
    case 6: // Resist Cold
      item.flags |= flags.TR_RES_COLD;
      item.special_name_id = SpecialNameIds.SN_RC;
      item.cost += 600;
      break;
    case 7:
    case 8:
    case 9: // Resist Lightning
      item.flags |= flags.TR_RES_LIGHT;
      item.special_name_id = SpecialNameIds.SN_RL;
      item.cost += 500;
      break;
    default:
      // Do not apply any special magic
      break;
  }
}

function cursedArmor(item: Inventory_t, level: number): void {
  item.to_ac -= magicEnchantmentBonus(1, 40, level);
  item.cost = 0;
  item.flags |= flags.TR_CURSED;
}

function magicalSword(item: Inventory_t, special: number, level: number): void {
  item.to_hit += magicEnchantmentBonus(0, 40, level);

  // Magical damage bonus now proportional to weapon base damage
  const damage_bonus = maxDiceRoll(item.damage);

  item.to_damage += magicEnchantmentBonus(0, 4 * damage_bonus, idiv(damage_bonus * level, 10));

  // the 3*special/2 is needed because weapons are not as common as
  // before change to treasure distribution, this helps keep same
  // number of ego weapons same as before, see also missiles
  if (magicShouldBeEnchanted(idiv(3 * special, 2))) {
    switch (randomNumber(16)) {
      case 1: // Holy Avenger
        item.flags |= flags.TR_SEE_INVIS | flags.TR_SUST_STAT | flags.TR_SLAY_UNDEAD | flags.TR_SLAY_EVIL | flags.TR_STR;
        item.to_hit += 5;
        item.to_damage += 5;
        item.to_ac += randomNumber(4);

        // the value in `misc_use` is used for strength increase
        // `misc_use` is also used for sustain stat
        item.misc_use = randomNumber(4);
        item.special_name_id = SpecialNameIds.SN_HA;
        item.cost += item.misc_use * 500;
        item.cost += 10000;
        break;
      case 2: // Defender
        item.flags |= flags.TR_FFALL | flags.TR_RES_LIGHT | flags.TR_SEE_INVIS | flags.TR_FREE_ACT | flags.TR_RES_COLD |
          flags.TR_RES_ACID | flags.TR_RES_FIRE | flags.TR_REGEN | flags.TR_STEALTH;
        item.to_hit += 3;
        item.to_damage += 3;
        item.to_ac += 5 + randomNumber(5);
        item.special_name_id = SpecialNameIds.SN_DF;

        // the value in `misc_use` is used for stealth
        item.misc_use = randomNumber(3);
        item.cost += item.misc_use * 500;
        item.cost += 7500;
        break;
      case 3:
      case 4: // Slay Animal
        item.flags |= flags.TR_SLAY_ANIMAL;
        item.to_hit += 2;
        item.to_damage += 2;
        item.special_name_id = SpecialNameIds.SN_SA;
        item.cost += 3000;
        break;
      case 5:
      case 6: // Slay Dragon
        item.flags |= flags.TR_SLAY_DRAGON;
        item.to_hit += 3;
        item.to_damage += 3;
        item.special_name_id = SpecialNameIds.SN_SD;
        item.cost += 4000;
        break;
      case 7:
      case 8: // Slay Evil
        item.flags |= flags.TR_SLAY_EVIL;
        item.to_hit += 3;
        item.to_damage += 3;
        item.special_name_id = SpecialNameIds.SN_SE;
        item.cost += 4000;
        break;
      case 9:
      case 10: // Slay Undead
        item.flags |= flags.TR_SEE_INVIS | flags.TR_SLAY_UNDEAD;
        item.to_hit += 3;
        item.to_damage += 3;
        item.special_name_id = SpecialNameIds.SN_SU;
        item.cost += 5000;
        break;
      case 11:
      case 12:
      case 13: // Flame Tongue
        item.flags |= flags.TR_FLAME_TONGUE;
        item.to_hit++;
        item.to_damage += 3;
        item.special_name_id = SpecialNameIds.SN_FT;
        item.cost += 2000;
        break;
      case 14:
      case 15:
      case 16: // Frost Brand
        item.flags |= flags.TR_FROST_BRAND;
        item.to_hit++;
        item.to_damage++;
        item.special_name_id = SpecialNameIds.SN_FB;
        item.cost += 1200;
        break;
      default:
        break;
    }
  }
}

function cursedSword(item: Inventory_t, level: number): void {
  item.to_hit -= magicEnchantmentBonus(1, 55, level);

  // Magical damage bonus now proportional to weapon base damage
  const damage_bonus = maxDiceRoll(item.damage);

  item.to_damage -= magicEnchantmentBonus(1, idiv(11 * damage_bonus, 2), idiv(damage_bonus * level, 10));
  item.flags |= flags.TR_CURSED;
  item.cost = 0;
}

function magicalBow(item: Inventory_t, level: number): void {
  item.to_hit += magicEnchantmentBonus(1, 30, level);

  // add damage. -CJS-
  item.to_damage += magicEnchantmentBonus(1, 20, level);
}

function cursedBow(item: Inventory_t, level: number): void {
  item.to_hit -= magicEnchantmentBonus(1, 50, level);

  // add damage. -CJS-
  item.to_damage -= magicEnchantmentBonus(1, 30, level);

  item.flags |= flags.TR_CURSED;
  item.cost = 0;
}

function magicalDiggingTool(item: Inventory_t, level: number): void {
  item.misc_use += magicEnchantmentBonus(0, 25, level);
}

function cursedDiggingTool(item: Inventory_t, level: number): void {
  item.misc_use = -magicEnchantmentBonus(1, 30, level);
  item.cost = 0;
  item.flags |= flags.TR_CURSED;
}

function magicalGloves(item: Inventory_t, special: number, level: number): void {
  item.to_ac += magicEnchantmentBonus(1, 20, level);

  if (!magicShouldBeEnchanted(special)) {
    return;
  }

  if (randomNumber(2) === 1) {
    item.flags |= flags.TR_FREE_ACT;
    item.special_name_id = SpecialNameIds.SN_FREE_ACTION;
    item.cost += 1000;
  } else {
    item.identification |= ident.ID_SHOW_HIT_DAM;
    item.to_hit += 1 + randomNumber(3);
    item.to_damage += 1 + randomNumber(3);
    item.special_name_id = SpecialNameIds.SN_SLAYING;
    item.cost += (item.to_hit + item.to_damage) * 250;
  }
}

function cursedGloves(item: Inventory_t, special: number, level: number): void {
  if (magicShouldBeEnchanted(special)) {
    if (randomNumber(2) === 1) {
      item.flags |= flags.TR_DEX;
      item.special_name_id = SpecialNameIds.SN_CLUMSINESS;
    } else {
      item.flags |= flags.TR_STR;
      item.special_name_id = SpecialNameIds.SN_WEAKNESS;
    }
    item.identification |= ident.ID_SHOW_P1;
    item.misc_use = -magicEnchantmentBonus(1, 10, level);
  }

  item.to_ac -= magicEnchantmentBonus(1, 40, level);
  item.flags |= flags.TR_CURSED;
  item.cost = 0;
}

function magicalBoots(item: Inventory_t, special: number, level: number): void {
  item.to_ac += magicEnchantmentBonus(1, 20, level);

  if (!magicShouldBeEnchanted(special)) {
    return;
  }

  const magic_type = randomNumber(12);

  if (magic_type > 5) {
    item.flags |= flags.TR_FFALL;
    item.special_name_id = SpecialNameIds.SN_SLOW_DESCENT;
    item.cost += 250;
  } else if (magic_type === 1) {
    item.flags |= flags.TR_SPEED;
    item.special_name_id = SpecialNameIds.SN_SPEED;
    item.identification |= ident.ID_SHOW_P1;
    item.misc_use = 1;
    item.cost += 5000;
  } else {
    // 2 - 5
    item.flags |= flags.TR_STEALTH;
    item.identification |= ident.ID_SHOW_P1;
    item.misc_use = randomNumber(3);
    item.special_name_id = SpecialNameIds.SN_STEALTH;
    item.cost += 500;
  }
}

function cursedBoots(item: Inventory_t, level: number): void {
  const magic_type = randomNumber(3);

  switch (magic_type) {
    case 1:
      item.flags |= flags.TR_SPEED;
      item.special_name_id = SpecialNameIds.SN_SLOWNESS;
      item.identification |= ident.ID_SHOW_P1;
      item.misc_use = -1;
      break;
    case 2:
      item.flags |= flags.TR_AGGRAVATE;
      item.special_name_id = SpecialNameIds.SN_NOISE;
      break;
    default:
      item.special_name_id = SpecialNameIds.SN_GREAT_MASS;
      item.weight = u16(item.weight * 5);
      break;
  }

  item.cost = 0;
  item.to_ac -= magicEnchantmentBonus(2, 45, level);
  item.flags |= flags.TR_CURSED;
}

function magicalHelms(item: Inventory_t, special: number, level: number): void {
  item.to_ac += magicEnchantmentBonus(1, 20, level);

  if (!magicShouldBeEnchanted(special)) {
    return;
  }

  if (item.sub_category_id < 6) {
    item.identification |= ident.ID_SHOW_P1;

    const magic_type = randomNumber(3);

    switch (magic_type) {
      case 1:
        item.misc_use = randomNumber(2);
        item.flags |= flags.TR_INT;
        item.special_name_id = SpecialNameIds.SN_INTELLIGENCE;
        item.cost += item.misc_use * 500;
        break;
      case 2:
        item.misc_use = randomNumber(2);
        item.flags |= flags.TR_WIS;
        item.special_name_id = SpecialNameIds.SN_WISDOM;
        item.cost += item.misc_use * 500;
        break;
      default:
        item.misc_use = 1 + randomNumber(4);
        item.flags |= flags.TR_INFRA;
        item.special_name_id = SpecialNameIds.SN_INFRAVISION;
        item.cost += item.misc_use * 250;
    }
    return;
  }

  switch (randomNumber(6)) {
    case 1:
      item.identification |= ident.ID_SHOW_P1;
      item.misc_use = randomNumber(3);
      item.flags |= flags.TR_FREE_ACT | flags.TR_CON | flags.TR_DEX | flags.TR_STR;
      item.special_name_id = SpecialNameIds.SN_MIGHT;
      item.cost += 1000 + item.misc_use * 500;
      break;
    case 2:
      item.identification |= ident.ID_SHOW_P1;
      item.misc_use = randomNumber(3);
      item.flags |= flags.TR_CHR | flags.TR_WIS;
      item.special_name_id = SpecialNameIds.SN_LORDLINESS;
      item.cost += 1000 + item.misc_use * 500;
      break;
    case 3:
      item.identification |= ident.ID_SHOW_P1;
      item.misc_use = randomNumber(3);
      item.flags |= flags.TR_RES_LIGHT | flags.TR_RES_COLD | flags.TR_RES_ACID | flags.TR_RES_FIRE | flags.TR_INT;
      item.special_name_id = SpecialNameIds.SN_MAGI;
      item.cost += 3000 + item.misc_use * 500;
      break;
    case 4:
      item.identification |= ident.ID_SHOW_P1;
      item.misc_use = randomNumber(3);
      item.flags |= flags.TR_CHR;
      item.special_name_id = SpecialNameIds.SN_BEAUTY;
      item.cost += 750;
      break;
    case 5:
      item.identification |= ident.ID_SHOW_P1;
      item.misc_use = 5 * (1 + randomNumber(4));
      item.flags |= flags.TR_SEE_INVIS | flags.TR_SEARCH;
      item.special_name_id = SpecialNameIds.SN_SEEING;
      item.cost += 1000 + item.misc_use * 100;
      break;
    case 6:
      item.flags |= flags.TR_REGEN;
      item.special_name_id = SpecialNameIds.SN_REGENERATION;
      item.cost += 1500;
      break;
    default:
      break;
  }
}

function cursedHelms(item: Inventory_t, special: number, level: number): void {
  item.to_ac -= magicEnchantmentBonus(1, 45, level);
  item.flags |= flags.TR_CURSED;
  item.cost = 0;

  if (!magicShouldBeEnchanted(special)) {
    return;
  }

  switch (randomNumber(7)) {
    case 1:
      item.identification |= ident.ID_SHOW_P1;
      item.misc_use = -randomNumber(5);
      item.flags |= flags.TR_INT;
      item.special_name_id = SpecialNameIds.SN_STUPIDITY;
      break;
    case 2:
      item.identification |= ident.ID_SHOW_P1;
      item.misc_use = -randomNumber(5);
      item.flags |= flags.TR_WIS;
      item.special_name_id = SpecialNameIds.SN_DULLNESS;
      break;
    case 3:
      item.flags |= flags.TR_BLIND;
      item.special_name_id = SpecialNameIds.SN_BLINDNESS;
      break;
    case 4:
      item.flags |= flags.TR_TIMID;
      item.special_name_id = SpecialNameIds.SN_TIMIDNESS;
      break;
    case 5:
      item.identification |= ident.ID_SHOW_P1;
      item.misc_use = -randomNumber(5);
      item.flags |= flags.TR_STR;
      item.special_name_id = SpecialNameIds.SN_WEAKNESS;
      break;
    case 6:
      item.flags |= flags.TR_TELEPORT;
      item.special_name_id = SpecialNameIds.SN_TELEPORTATION;
      break;
    case 7:
      item.identification |= ident.ID_SHOW_P1;
      item.misc_use = -randomNumber(5);
      item.flags |= flags.TR_CHR;
      item.special_name_id = SpecialNameIds.SN_UGLINESS;
      break;
    default:
      return;
  }
}

function processRings(item: Inventory_t, level: number, cursed: number): void {
  switch (item.sub_category_id) {
    case 0:
    case 1:
    case 2:
    case 3:
      if (magicShouldBeEnchanted(cursed)) {
        item.misc_use = -magicEnchantmentBonus(1, 20, level);
        item.flags |= flags.TR_CURSED;
        item.cost = -item.cost;
      } else {
        item.misc_use = magicEnchantmentBonus(1, 10, level);
        item.cost += item.misc_use * 100;
      }
      break;
    case 4:
      if (magicShouldBeEnchanted(cursed)) {
        item.misc_use = -randomNumber(3);
        item.flags |= flags.TR_CURSED;
        item.cost = -item.cost;
      } else {
        item.misc_use = 1;
      }
      break;
    case 5:
      item.misc_use = 5 * magicEnchantmentBonus(1, 20, level);
      item.cost += item.misc_use * 50;
      if (magicShouldBeEnchanted(cursed)) {
        item.misc_use = -item.misc_use;
        item.flags |= flags.TR_CURSED;
        item.cost = -item.cost;
      }
      break;
    case 19: // Increase damage
      item.to_damage += magicEnchantmentBonus(1, 20, level);
      item.cost += item.to_damage * 100;
      if (magicShouldBeEnchanted(cursed)) {
        item.to_damage = -item.to_damage;
        item.flags |= flags.TR_CURSED;
        item.cost = -item.cost;
      }
      break;
    case 20: // Increase To-Hit
      item.to_hit += magicEnchantmentBonus(1, 20, level);
      item.cost += item.to_hit * 100;
      if (magicShouldBeEnchanted(cursed)) {
        item.to_hit = -item.to_hit;
        item.flags |= flags.TR_CURSED;
        item.cost = -item.cost;
      }
      break;
    case 21: // Protection
      item.to_ac += magicEnchantmentBonus(1, 20, level);
      item.cost += item.to_ac * 100;
      if (magicShouldBeEnchanted(cursed)) {
        item.to_ac = -item.to_ac;
        item.flags |= flags.TR_CURSED;
        item.cost = -item.cost;
      }
      break;
    case 24:
    case 25:
    case 26:
    case 27:
    case 28:
    case 29:
      item.identification |= ident.ID_NO_SHOW_P1;
      break;
    case 30: // Slaying
      item.identification |= ident.ID_SHOW_HIT_DAM;
      item.to_damage += magicEnchantmentBonus(1, 25, level);
      item.to_hit += magicEnchantmentBonus(1, 25, level);
      item.cost += (item.to_hit + item.to_damage) * 100;
      if (magicShouldBeEnchanted(cursed)) {
        item.to_hit = -item.to_hit;
        item.to_damage = -item.to_damage;
        item.flags |= flags.TR_CURSED;
        item.cost = -item.cost;
      }
      break;
    default:
      break;
  }
}

function processAmulets(item: Inventory_t, level: number, cursed: number): void {
  if (item.sub_category_id < 2) {
    if (magicShouldBeEnchanted(cursed)) {
      item.misc_use = -magicEnchantmentBonus(1, 20, level);
      item.flags |= flags.TR_CURSED;
      item.cost = -item.cost;
    } else {
      item.misc_use = magicEnchantmentBonus(1, 10, level);
      item.cost += item.misc_use * 100;
    }
  } else if (item.sub_category_id === 2) {
    item.misc_use = 5 * magicEnchantmentBonus(1, 25, level);
    if (magicShouldBeEnchanted(cursed)) {
      item.misc_use = -item.misc_use;
      item.cost = -item.cost;
      item.flags |= flags.TR_CURSED;
    } else {
      item.cost += 50 * item.misc_use;
    }
  } else if (item.sub_category_id === 8) {
    // amulet of the magi is never cursed
    item.misc_use = 5 * magicEnchantmentBonus(1, 25, level);
    item.cost += 20 * item.misc_use;
  }
}

function wandMagic(id: number): number {
  switch (u8(id)) {
    case 0:
      return randomNumber(10) + 6;
    case 1:
      return randomNumber(8) + 6;
    case 2:
      return randomNumber(5) + 6;
    case 3:
      return randomNumber(8) + 6;
    case 4:
      return randomNumber(4) + 3;
    case 5:
      return randomNumber(8) + 6;
    case 6:
    case 7:
      return randomNumber(20) + 12;
    case 8:
      return randomNumber(10) + 6;
    case 9:
      return randomNumber(12) + 6;
    case 10:
      return randomNumber(10) + 12;
    case 11:
      return randomNumber(3) + 3;
    case 12:
      return randomNumber(8) + 6;
    case 13:
      return randomNumber(10) + 6;
    case 14:
    case 15:
      return randomNumber(5) + 3;
    case 16:
      return randomNumber(5) + 6;
    case 17:
      return randomNumber(5) + 4;
    case 18:
      return randomNumber(8) + 4;
    case 19:
      return randomNumber(6) + 2;
    case 20:
      return randomNumber(4) + 2;
    case 21:
      return randomNumber(8) + 6;
    case 22:
      return randomNumber(5) + 2;
    case 23:
      return randomNumber(12) + 12;
    default:
      return -1;
  }
}

function staffMagic(id: number): number {
  switch (u8(id)) {
    case 0:
      return randomNumber(20) + 12;
    case 1:
      return randomNumber(8) + 6;
    case 2:
      return randomNumber(5) + 6;
    case 3:
      return randomNumber(20) + 12;
    case 4:
      return randomNumber(15) + 6;
    case 5:
      return randomNumber(4) + 5;
    case 6:
      return randomNumber(5) + 3;
    case 7:
    case 8:
      return randomNumber(3) + 1;
    case 9:
      return randomNumber(5) + 6;
    case 10:
      return randomNumber(10) + 12;
    case 11:
    case 12:
    case 13:
      return randomNumber(5) + 6;
    case 14:
      return randomNumber(10) + 12;
    case 15:
      return randomNumber(3) + 4;
    case 16:
    case 17:
      return randomNumber(5) + 6;
    case 18:
      return randomNumber(3) + 4;
    case 19:
      return randomNumber(10) + 12;
    case 20:
    case 21:
      return randomNumber(3) + 4;
    case 22:
      return randomNumber(10) + 6;
    default:
      return -1;
  }
}

function magicalCloak(item: Inventory_t, special: number, level: number): void {
  if (!magicShouldBeEnchanted(special)) {
    item.to_ac += magicEnchantmentBonus(1, 20, level);
    return;
  }

  if (randomNumber(2) === 1) {
    item.special_name_id = SpecialNameIds.SN_PROTECTION;
    item.to_ac += magicEnchantmentBonus(2, 40, level);
    item.cost += 250;
    return;
  }

  item.to_ac += magicEnchantmentBonus(1, 20, level);
  item.identification |= ident.ID_SHOW_P1;
  item.misc_use = randomNumber(3);
  item.flags |= flags.TR_STEALTH;
  item.special_name_id = SpecialNameIds.SN_STEALTH;
  item.cost += 500;
}

function cursedCloak(item: Inventory_t, level: number): void {
  const magic_type = randomNumber(3);

  switch (magic_type) {
    case 1:
      item.flags |= flags.TR_AGGRAVATE;
      item.special_name_id = SpecialNameIds.SN_IRRITATION;
      item.to_ac -= magicEnchantmentBonus(1, 10, level);
      item.identification |= ident.ID_SHOW_HIT_DAM;
      item.to_hit -= magicEnchantmentBonus(1, 10, level);
      item.to_damage -= magicEnchantmentBonus(1, 10, level);
      item.cost = 0;
      break;
    case 2:
      item.special_name_id = SpecialNameIds.SN_VULNERABILITY;
      item.to_ac -= magicEnchantmentBonus(10, 100, level + 50);
      item.cost = 0;
      break;
    default:
      item.special_name_id = SpecialNameIds.SN_ENVELOPING;
      item.to_ac -= magicEnchantmentBonus(1, 10, level);
      item.identification |= ident.ID_SHOW_HIT_DAM;
      item.to_hit -= magicEnchantmentBonus(2, 40, level + 10);
      item.to_damage -= magicEnchantmentBonus(2, 40, level + 10);
      item.cost = 0;
      break;
  }

  item.flags |= flags.TR_CURSED;
}

function magicalChests(item: Inventory_t, level: number): void {
  const magic_type = randomNumber(level + 4);

  switch (magic_type) {
    case 1:
      item.flags = 0;
      item.special_name_id = SpecialNameIds.SN_EMPTY;
      break;
    case 2:
      item.flags |= chests.CH_LOCKED;
      item.special_name_id = SpecialNameIds.SN_LOCKED;
      break;
    case 3:
    case 4:
      item.flags |= chests.CH_LOSE_STR | chests.CH_LOCKED;
      item.special_name_id = SpecialNameIds.SN_POISON_NEEDLE;
      break;
    case 5:
    case 6:
      item.flags |= chests.CH_POISON | chests.CH_LOCKED;
      item.special_name_id = SpecialNameIds.SN_POISON_NEEDLE;
      break;
    case 7:
    case 8:
    case 9:
      item.flags |= chests.CH_PARALYSED | chests.CH_LOCKED;
      item.special_name_id = SpecialNameIds.SN_GAS_TRAP;
      break;
    case 10:
    case 11:
      item.flags |= chests.CH_EXPLODE | chests.CH_LOCKED;
      item.special_name_id = SpecialNameIds.SN_EXPLOSION_DEVICE;
      break;
    case 12:
    case 13:
    case 14:
      item.flags |= chests.CH_SUMMON | chests.CH_LOCKED;
      item.special_name_id = SpecialNameIds.SN_SUMMONING_RUNES;
      break;
    case 15:
    case 16:
    case 17:
      item.flags |= chests.CH_PARALYSED | chests.CH_POISON | chests.CH_LOSE_STR | chests.CH_LOCKED;
      item.special_name_id = SpecialNameIds.SN_MULTIPLE_TRAPS;
      break;
    default:
      item.flags |= chests.CH_SUMMON | chests.CH_EXPLODE | chests.CH_LOCKED;
      item.special_name_id = SpecialNameIds.SN_MULTIPLE_TRAPS;
      break;
  }
}

function magicalProjectileAdjustment(item: Inventory_t, special: number, level: number): void {
  item.to_hit += magicEnchantmentBonus(1, 35, level);
  item.to_damage += magicEnchantmentBonus(1, 35, level);

  // see comment for weapons
  if (magicShouldBeEnchanted(idiv(3 * special, 2))) {
    switch (randomNumber(10)) {
      case 1:
      case 2:
      case 3:
        item.special_name_id = SpecialNameIds.SN_SLAYING;
        item.to_hit += 5;
        item.to_damage += 5;
        item.cost += 20;
        break;
      case 4:
      case 5:
        item.flags |= flags.TR_FLAME_TONGUE;
        item.to_hit += 2;
        item.to_damage += 4;
        item.special_name_id = SpecialNameIds.SN_FIRE;
        item.cost += 25;
        break;
      case 6:
      case 7:
        item.flags |= flags.TR_SLAY_EVIL;
        item.to_hit += 3;
        item.to_damage += 3;
        item.special_name_id = SpecialNameIds.SN_SLAY_EVIL;
        item.cost += 25;
        break;
      case 8:
      case 9:
        item.flags |= flags.TR_SLAY_ANIMAL;
        item.to_hit += 2;
        item.to_damage += 2;
        item.special_name_id = SpecialNameIds.SN_SLAY_ANIMAL;
        item.cost += 30;
        break;
      case 10:
        item.flags |= flags.TR_SLAY_DRAGON;
        item.to_hit += 3;
        item.to_damage += 3;
        item.special_name_id = SpecialNameIds.SN_DRAGON_SLAYING;
        item.cost += 35;
        break;
      default:
        break;
    }
  }
}

function cursedProjectileAdjustment(item: Inventory_t, level: number): void {
  item.to_hit -= magicEnchantmentBonus(5, 55, level);
  item.to_damage -= magicEnchantmentBonus(5, 55, level);
  item.flags |= flags.TR_CURSED;
  item.cost = 0;
}

// Counter for missiles (globals.missiles_counter, int16_t)
// Note: converted to uint16_t when saving the game.

function magicalProjectile(item: Inventory_t, special: number, level: number, chance: number, cursed: number): void {
  if (item.category_id === TV_SLING_AMMO || item.category_id === TV_BOLT || item.category_id === TV_ARROW) {
    // always show to_hit/to_damage values if identified
    item.identification |= ident.ID_SHOW_HIT_DAM;

    if (magicShouldBeEnchanted(chance)) {
      magicalProjectileAdjustment(item, special, level);
    } else if (magicShouldBeEnchanted(cursed)) {
      cursedProjectileAdjustment(item, level);
    }
  }

  item.items_count = 0;

  for (let i = 0; i < 7; i++) {
    item.items_count += randomNumber(6);
  }

  if (globals.missiles_counter === SHRT_MAX) {
    globals.missiles_counter = -SHRT_MAX - 1;
  } else {
    globals.missiles_counter++;
  }

  item.misc_use = globals.missiles_counter;
}

// Chance of treasure having magic abilities -RAK-
// Chance increases with each dungeon level
export function magicTreasureMagicalAbility(item_id: number, level: number): void {
  let chance = config.treasure.OBJECT_BASE_MAGIC + level;
  if (chance > config.treasure.OBJECT_MAX_BASE_MAGIC) {
    chance = config.treasure.OBJECT_MAX_BASE_MAGIC;
  }

  let special = idiv(chance, config.treasure.OBJECT_CHANCE_SPECIAL);
  const cursed = idiv(10 * chance, config.treasure.OBJECT_CHANCE_CURSED);

  let magic_amount: number;

  const item = game.treasure.list[item_id];

  // some objects appear multiple times in the game_objects with different
  // levels, this is to make the object occur more often, however, for
  // consistency, must set the level of these duplicates to be the same
  // as the object with the lowest level

  // Depending on treasure type, it can have certain magical properties
  switch (item.category_id) {
    case TV_SHIELD:
    case TV_HARD_ARMOR:
    case TV_SOFT_ARMOR:
      if (magicShouldBeEnchanted(chance)) {
        magicalArmor(item, special, level);
      } else if (magicShouldBeEnchanted(cursed)) {
        cursedArmor(item, level);
      }
      break;
    case TV_HAFTED:
    case TV_POLEARM:
    case TV_SWORD:
      // always show to_hit/to_damage values if identified
      item.identification |= ident.ID_SHOW_HIT_DAM;

      if (magicShouldBeEnchanted(chance)) {
        magicalSword(item, special, level);
      } else if (magicShouldBeEnchanted(cursed)) {
        cursedSword(item, level);
      }
      break;
    case TV_BOW:
      // always show to_hit/to_damage values if identified
      item.identification |= ident.ID_SHOW_HIT_DAM;

      if (magicShouldBeEnchanted(chance)) {
        magicalBow(item, level);
      } else if (magicShouldBeEnchanted(cursed)) {
        cursedBow(item, level);
      }
      break;
    case TV_DIGGING:
      // always show to_hit/to_damage values if identified
      item.identification |= ident.ID_SHOW_HIT_DAM;

      if (magicShouldBeEnchanted(chance)) {
        if (randomNumber(3) < 3) {
          magicalDiggingTool(item, level);
        } else {
          cursedDiggingTool(item, level);
        }
      }
      break;
    case TV_GLOVES:
      if (magicShouldBeEnchanted(chance)) {
        magicalGloves(item, special, level);
      } else if (magicShouldBeEnchanted(cursed)) {
        cursedGloves(item, special, level);
      }
      break;
    case TV_BOOTS:
      if (magicShouldBeEnchanted(chance)) {
        magicalBoots(item, special, level);
      } else if (magicShouldBeEnchanted(cursed)) {
        cursedBoots(item, level);
      }
      break;
    case TV_HELM:
      // give crowns a higher chance for magic
      if (item.sub_category_id >= 6 && item.sub_category_id <= 8) {
        chance += idiv(item.cost, 100);
        special += special;
      }

      if (magicShouldBeEnchanted(chance)) {
        magicalHelms(item, special, level);
      } else if (magicShouldBeEnchanted(cursed)) {
        cursedHelms(item, special, level);
      }
      break;
    case TV_RING:
      processRings(item, level, cursed);
      break;
    case TV_AMULET:
      processAmulets(item, level, cursed);
      break;
    case TV_LIGHT:
      // `sub_category_id` should be even for store, odd for dungeon
      // Dungeon found ones will be partially charged
      if (item.sub_category_id % 2 === 1) {
        item.misc_use = randomNumber(item.misc_use);
        item.sub_category_id -= 1;
      }
      break;
    case TV_WAND:
      magic_amount = wandMagic(item.sub_category_id);
      if (magic_amount !== -1) {
        item.misc_use = u16(magic_amount);
      }
      break;
    case TV_STAFF:
      magic_amount = staffMagic(item.sub_category_id);
      if (magic_amount !== -1) {
        item.misc_use = u16(magic_amount);
      }

      // Change the level the items was first found on value
      if (item.sub_category_id === 7) {
        item.depth_first_found = 10;
      } else if (item.sub_category_id === 22) {
        item.depth_first_found = 5;
      }
      break;
    case TV_CLOAK:
      if (magicShouldBeEnchanted(chance)) {
        magicalCloak(item, special, level);
      } else if (magicShouldBeEnchanted(cursed)) {
        cursedCloak(item, level);
      }
      break;
    case TV_CHEST:
      magicalChests(item, level);
      break;
    case TV_SLING_AMMO:
    case TV_SPIKE:
    case TV_BOLT:
    case TV_ARROW:
      magicalProjectile(item, special, level, chance, cursed);
      break;
    case TV_FOOD:
      // make sure all food rations have the same level
      if (item.sub_category_id === 90) {
        item.depth_first_found = 0;
      }

      // give all Elvish waybread the same level
      if (item.sub_category_id === 92) {
        item.depth_first_found = 6;
      }
      break;
    case TV_SCROLL1:
      if (item.sub_category_id === 67) {
        // give all identify scrolls the same level
        item.depth_first_found = 1;
      } else if (item.sub_category_id === 69) {
        // scroll of light
        item.depth_first_found = 0;
      } else if (item.sub_category_id === 80) {
        // scroll of trap detection
        item.depth_first_found = 5;
      } else if (item.sub_category_id === 81) {
        // scroll of door/stair location
        item.depth_first_found = 5;
      }
      break;
    case TV_POTION1:
      // cure light
      if (item.sub_category_id === 76) {
        item.depth_first_found = 0;
      }
      break;
    default:
      break;
  }
}
