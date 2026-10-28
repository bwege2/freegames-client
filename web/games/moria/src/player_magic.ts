// player_magic.cpp: Player magic functions
import { config } from './config.ts';
import { TV_ARROW, TV_FLASK, TV_HAFTED, TV_SLING_AMMO, TV_SWORD } from './constants.ts';
import { creatures_list } from './data_creatures.ts';
import { randomNumber } from './game.ts';
import { creature_recall, py } from './globals.ts';
import { idiv } from './libc.ts';
import type { Inventory_t } from './structs.ts';

// Cure players confusion -RAK-
export function playerCureConfusion(): boolean {
  if (py.flags.confused > 1) {
    py.flags.confused = 1;
    return true;
  }
  return false;
}

// Cure players blindness -RAK-
export function playerCureBlindness(): boolean {
  if (py.flags.blind > 1) {
    py.flags.blind = 1;
    return true;
  }
  return false;
}

// Cure poisoning -RAK-
export function playerCurePoison(): boolean {
  if (py.flags.poisoned > 1) {
    py.flags.poisoned = 1;
    return true;
  }
  return false;
}

// Cure the players fear -RAK-
export function playerRemoveFear(): boolean {
  if (py.flags.afraid > 1) {
    py.flags.afraid = 1;
    return true;
  }
  return false;
}

// Evil creatures don't like this. -RAK-
export function playerProtectEvil(): boolean {
  const is_protected = py.flags.protect_evil === 0;

  py.flags.protect_evil += randomNumber(25) + 3 * py.misc.level;

  return is_protected;
}

// Bless -RAK-
export function playerBless(adjustment: number): void {
  py.flags.blessed += adjustment;
}

// Detect Invisible for period of time -RAK-
export function playerDetectInvisible(adjustment: number): void {
  py.flags.detect_invisible += adjustment;
}

// Special damage due to magical abilities of object -RAK-
export function itemMagicAbilityDamage(item: Inventory_t, total_damage: number, monster_id: number): number {
  const is_ego_weapon = (item.flags & config.treasure.flags.TR_EGO_WEAPON) !== 0;
  const is_projectile = item.category_id >= TV_SLING_AMMO && item.category_id <= TV_ARROW;
  const is_hafted_sword = item.category_id >= TV_HAFTED && item.category_id <= TV_SWORD;
  const is_flask = item.category_id === TV_FLASK;

  if (is_ego_weapon && (is_projectile || is_hafted_sword || is_flask)) {
    const creature = creatures_list[monster_id];
    const memory = creature_recall[monster_id];

    // Slay Dragon
    if ((creature.defenses & config.monsters.defense.CD_DRAGON) !== 0 && (item.flags & config.treasure.flags.TR_SLAY_DRAGON) !== 0) {
      memory.defenses |= config.monsters.defense.CD_DRAGON;
      return total_damage * 4;
    }

    // Slay Undead
    if ((creature.defenses & config.monsters.defense.CD_UNDEAD) !== 0 && (item.flags & config.treasure.flags.TR_SLAY_UNDEAD) !== 0) {
      memory.defenses |= config.monsters.defense.CD_UNDEAD;
      return total_damage * 3;
    }

    // Slay Animal
    if ((creature.defenses & config.monsters.defense.CD_ANIMAL) !== 0 && (item.flags & config.treasure.flags.TR_SLAY_ANIMAL) !== 0) {
      memory.defenses |= config.monsters.defense.CD_ANIMAL;
      return total_damage * 2;
    }

    // Slay Evil
    if ((creature.defenses & config.monsters.defense.CD_EVIL) !== 0 && (item.flags & config.treasure.flags.TR_SLAY_EVIL) !== 0) {
      memory.defenses |= config.monsters.defense.CD_EVIL;
      return total_damage * 2;
    }

    // Frost
    if ((creature.defenses & config.monsters.defense.CD_FROST) !== 0 && (item.flags & config.treasure.flags.TR_FROST_BRAND) !== 0) {
      memory.defenses |= config.monsters.defense.CD_FROST;
      return idiv(total_damage * 3, 2);
    }

    // Fire
    if ((creature.defenses & config.monsters.defense.CD_FIRE) !== 0 && (item.flags & config.treasure.flags.TR_FLAME_TONGUE) !== 0) {
      memory.defenses |= config.monsters.defense.CD_FIRE;
      return idiv(total_damage * 3, 2);
    }
  }

  return total_damage;
}
