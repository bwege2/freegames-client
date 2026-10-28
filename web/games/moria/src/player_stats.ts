// player_stats.cpp: Functions related to Player stats
import { config } from './config.ts';
import { PLAYER_MAX_LEVEL, PlayerAttr } from './constants.ts';
import { classes } from './data_player.ts';
import { blows_table } from './data_tables.ts';
import { randomNumber } from './game.ts';
import { py } from './globals.ts';
import { i16, i32, idiv, type Ref, u8 } from './libc.ts';
import { playerCalculateAllowedSpellsCount, playerGainMana, playerRecalculateBonuses } from './player.ts';
import { displayCharacterStats } from './ui.ts';

// I don't really like this, but for now, it's better than being a global -MRC-
export function playerInitializeBaseExperienceLevels(): void {
  // TODO: load from external data file
  const levels: readonly number[] = [
    10, 25, 45, 70, 100, 140, 200, 280, 380, 500, 650, 850, 1100, 1400, 1800, 2300, 2900, 3600, 4400, 5400,
    6800, 8400, 10200, 12500, 17500, 25000, 35000, 50000, 75000, 100000, 150000, 200000, 300000, 400000, 500000, 750000, 1500000, 2500000, 5000000, 10000000,
  ];

  for (let i = 0; i < PLAYER_MAX_LEVEL; i++) {
    py.base_exp_levels[i] = levels[i];
  }
}

// Calculate the players hit points
export function playerCalculateHitPoints(): void {
  let hp = py.base_hp_levels[py.misc.level - 1] + (playerStatAdjustmentConstitution() * py.misc.level);

  // Always give at least one point per level + 1
  if (hp < (py.misc.level + 1)) {
    hp = py.misc.level + 1;
  }

  if ((py.flags.status & config.player.status.PY_HERO) !== 0) {
    hp += 10;
  }

  if ((py.flags.status & config.player.status.PY_SHERO) !== 0) {
    hp += 20;
  }

  // MHP can equal zero while character is being created
  if (hp !== py.misc.max_hp && py.misc.max_hp !== 0) {
    // Change current hit points proportionately to change of MHP,
    // divide first to avoid overflow, little loss of accuracy
    const value = i32(idiv(i32((py.misc.current_hp << 16) + py.misc.current_hp_fraction), py.misc.max_hp) * hp);
    py.misc.current_hp = i16(value >> 16);
    py.misc.current_hp_fraction = value & 0xFFFF;
    py.misc.max_hp = i16(hp);

    // can't print hit points here, may be in store or inventory mode
    py.flags.status |= config.player.status.PY_HP;
  }
}

function playerAttackBlowsDexterity(dexterity: number): number {
  let dex: number;

  if (dexterity < 10) {
    dex = 0;
  } else if (dexterity < 19) {
    dex = 1;
  } else if (dexterity < 68) {
    dex = 2;
  } else if (dexterity < 108) {
    dex = 3;
  } else if (dexterity < 118) {
    dex = 4;
  } else {
    dex = 5;
  }

  return dex;
}

function playerAttackBlowsStrength(strength: number, weight: number): number {
  const adj_weight = idiv(strength * 10, weight);

  let str: number;

  if (adj_weight < 2) {
    str = 0;
  } else if (adj_weight < 3) {
    str = 1;
  } else if (adj_weight < 4) {
    str = 2;
  } else if (adj_weight < 5) {
    str = 3;
  } else if (adj_weight < 7) {
    str = 4;
  } else if (adj_weight < 9) {
    str = 5;
  } else {
    str = 6;
  }

  return str;
}

// Weapon weight VS strength and dexterity -RAK-
export function playerAttackBlows(weight: number, weight_to_hit: Ref<number>): number {
  weight_to_hit.v = 0;

  const player_strength = py.stats.used[PlayerAttr.A_STR];

  if (player_strength * 15 < weight) {
    weight_to_hit.v = player_strength * 15 - weight;
    return 1;
  }

  const dexterity = playerAttackBlowsDexterity(py.stats.used[PlayerAttr.A_DEX]);
  const strength = playerAttackBlowsStrength(player_strength, weight);

  return blows_table[strength][dexterity];
}

// Adjustment for wisdom/intelligence -JWT-
export function playerStatAdjustmentWisdomIntelligence(stat: number): number {
  const value = py.stats.used[stat];

  let adjustment: number;

  if (value > 117) {
    adjustment = 7;
  } else if (value > 107) {
    adjustment = 6;
  } else if (value > 87) {
    adjustment = 5;
  } else if (value > 67) {
    adjustment = 4;
  } else if (value > 17) {
    adjustment = 3;
  } else if (value > 14) {
    adjustment = 2;
  } else if (value > 7) {
    adjustment = 1;
  } else {
    adjustment = 0;
  }

  return adjustment;
}

// Adjustment for charisma -RAK-
// Percent decrease or increase in price of goods
export function playerStatAdjustmentCharisma(): number {
  const charisma = py.stats.used[PlayerAttr.A_CHR];

  if (charisma > 117) {
    return 90;
  }

  if (charisma > 107) {
    return 92;
  }

  if (charisma > 87) {
    return 94;
  }

  if (charisma > 67) {
    return 96;
  }

  if (charisma > 18) {
    return 98;
  }

  switch (charisma) {
    case 18:
      return 100;
    case 17:
      return 101;
    case 16:
      return 102;
    case 15:
      return 103;
    case 14:
      return 104;
    case 13:
      return 106;
    case 12:
      return 108;
    case 11:
      return 110;
    case 10:
      return 112;
    case 9:
      return 114;
    case 8:
      return 116;
    case 7:
      return 118;
    case 6:
      return 120;
    case 5:
      return 122;
    case 4:
      return 125;
    case 3:
      return 130;
    default:
      return 100;
  }
}

// Returns a character's adjustment to hit points -JWT-
export function playerStatAdjustmentConstitution(): number {
  const con = py.stats.used[PlayerAttr.A_CON];

  if (con < 7) {
    return (con - 7);
  }

  if (con < 17) {
    return 0;
  }

  if (con === 17) {
    return 1;
  }

  if (con < 94) {
    return 2;
  }

  if (con < 117) {
    return 3;
  }

  return 4;
}

function playerModifyStat(stat: number, amount: number): number {
  amount = i16(amount);
  let new_stat = py.stats.current[stat];

  const loop = (amount < 0 ? -amount : amount);

  for (let i = 0; i < loop; i++) {
    if (amount > 0) {
      if (new_stat < 18) {
        new_stat = u8(new_stat + 1);
      } else if (new_stat < 108) {
        new_stat = u8(new_stat + 10);
      } else {
        new_stat = 118;
      }
    } else {
      if (new_stat > 27) {
        new_stat = u8(new_stat - 10);
      } else if (new_stat > 18) {
        new_stat = 18;
      } else if (new_stat > 3) {
        new_stat = u8(new_stat - 1);
      }
    }
  }

  return new_stat;
}

// Set the value of the stat which is actually used. -CJS-
export async function playerSetAndUseStat(stat: number): Promise<void> {
  py.stats.used[stat] = playerModifyStat(stat, py.stats.modified[stat]);

  if (stat === PlayerAttr.A_STR) {
    py.flags.status |= config.player.status.PY_STR_WGT;
    playerRecalculateBonuses();
  } else if (stat === PlayerAttr.A_DEX) {
    playerRecalculateBonuses();
  } else if (stat === PlayerAttr.A_INT && classes[py.misc.class_id].class_to_use_mage_spells === config.spells.SPELL_TYPE_MAGE) {
    await playerCalculateAllowedSpellsCount(PlayerAttr.A_INT);
    playerGainMana(PlayerAttr.A_INT);
  } else if (stat === PlayerAttr.A_WIS && classes[py.misc.class_id].class_to_use_mage_spells === config.spells.SPELL_TYPE_PRIEST) {
    await playerCalculateAllowedSpellsCount(PlayerAttr.A_WIS);
    playerGainMana(PlayerAttr.A_WIS);
  } else if (stat === PlayerAttr.A_CON) {
    playerCalculateHitPoints();
  }
}

// Increases a stat by one randomized level -RAK-
export async function playerStatRandomIncrease(stat: number): Promise<boolean> {
  let new_stat = py.stats.current[stat];

  if (new_stat >= 118) {
    return false;
  }

  if (new_stat >= 18 && new_stat < 116) {
    // stat increases by 1/6 to 1/3 of difference from max
    const gain = (idiv(118 - new_stat, 3) + 1) >> 1;

    new_stat += randomNumber(gain) + gain;
  } else {
    new_stat++;
  }

  py.stats.current[stat] = u8(new_stat);

  if (new_stat > py.stats.max[stat]) {
    py.stats.max[stat] = u8(new_stat);
  }

  await playerSetAndUseStat(stat);
  displayCharacterStats(stat);

  return true;
}

// Decreases a stat by one randomized level -RAK-
export async function playerStatRandomDecrease(stat: number): Promise<boolean> {
  let new_stat = py.stats.current[stat];

  if (new_stat <= 3) {
    return false;
  }

  if (new_stat >= 19 && new_stat < 117) {
    const loss = (((118 - new_stat) >> 1) + 1) >> 1;
    new_stat += -randomNumber(loss) - loss;

    if (new_stat < 18) {
      new_stat = 18;
    }
  } else {
    new_stat--;
  }

  py.stats.current[stat] = u8(new_stat);

  await playerSetAndUseStat(stat);
  displayCharacterStats(stat);

  return true;
}

// Restore a stat.  Return true only if this actually makes a difference.
export async function playerStatRestore(stat: number): Promise<boolean> {
  const new_stat = py.stats.max[stat] - py.stats.current[stat];

  if (new_stat === 0) {
    return false;
  }

  py.stats.current[stat] += new_stat;

  await playerSetAndUseStat(stat);
  displayCharacterStats(stat);

  return true;
}

// Boost a stat artificially (by wearing something). If the display
// argument is true, then increase is shown on the screen.
export async function playerStatBoost(stat: number, amount: number): Promise<void> {
  py.stats.modified[stat] += amount;

  await playerSetAndUseStat(stat);

  // can not call displayCharacterStats() here:
  //   might be in a store,
  //   might be in inventoryExecuteCommand()
  py.flags.status |= (config.player.status.PY_STR << stat);
}

// Returns a character's adjustment to hit. -JWT-
export function playerToHitAdjustment(): number {
  let total: number;

  const dexterity = py.stats.used[PlayerAttr.A_DEX];
  if (dexterity < 4) {
    total = -3;
  } else if (dexterity < 6) {
    total = -2;
  } else if (dexterity < 8) {
    total = -1;
  } else if (dexterity < 16) {
    total = 0;
  } else if (dexterity < 17) {
    total = 1;
  } else if (dexterity < 18) {
    total = 2;
  } else if (dexterity < 69) {
    total = 3;
  } else if (dexterity < 118) {
    total = 4;
  } else {
    total = 5;
  }

  const strength = py.stats.used[PlayerAttr.A_STR];
  if (strength < 4) {
    total -= 3;
  } else if (strength < 5) {
    total -= 2;
  } else if (strength < 7) {
    total -= 1;
  } else if (strength < 18) {
    total -= 0;
  } else if (strength < 94) {
    total += 1;
  } else if (strength < 109) {
    total += 2;
  } else if (strength < 117) {
    total += 3;
  } else {
    total += 4;
  }

  return total;
}

// Returns a character's adjustment to armor class -JWT-
export function playerArmorClassAdjustment(): number {
  const stat = py.stats.used[PlayerAttr.A_DEX];

  let adjustment: number;

  if (stat < 4) {
    adjustment = -4;
  } else if (stat === 4) {
    adjustment = -3;
  } else if (stat === 5) {
    adjustment = -2;
  } else if (stat === 6) {
    adjustment = -1;
  } else if (stat < 15) {
    adjustment = 0;
  } else if (stat < 18) {
    adjustment = 1;
  } else if (stat < 59) {
    adjustment = 2;
  } else if (stat < 94) {
    adjustment = 3;
  } else if (stat < 117) {
    adjustment = 4;
  } else {
    adjustment = 5;
  }

  return adjustment;
}

// Returns a character's adjustment to disarm -RAK-
export function playerDisarmAdjustment(): number {
  const stat = py.stats.used[PlayerAttr.A_DEX];

  let adjustment = 0;

  if (stat < 4) {
    adjustment = -8;
  } else if (stat === 4) {
    adjustment = -6;
  } else if (stat === 5) {
    adjustment = -4;
  } else if (stat === 6) {
    adjustment = -2;
  } else if (stat === 7) {
    adjustment = -1;
  } else if (stat < 13) {
    adjustment = 0;
  } else if (stat < 16) {
    adjustment = 1;
  } else if (stat < 18) {
    adjustment = 2;
  } else if (stat < 59) {
    adjustment = 4;
  } else if (stat < 94) {
    adjustment = 5;
  } else if (stat < 117) {
    adjustment = 6;
  } else {
    adjustment = 8;
  }

  return adjustment;
}

// Returns a character's adjustment to damage -JWT-
export function playerDamageAdjustment(): number {
  const stat = py.stats.used[PlayerAttr.A_STR];

  let adjustment: number;

  if (stat < 4) {
    adjustment = -2;
  } else if (stat < 5) {
    adjustment = -1;
  } else if (stat < 16) {
    adjustment = 0;
  } else if (stat < 17) {
    adjustment = 1;
  } else if (stat < 18) {
    adjustment = 2;
  } else if (stat < 94) {
    adjustment = 3;
  } else if (stat < 109) {
    adjustment = 4;
  } else if (stat < 117) {
    adjustment = 5;
  } else {
    adjustment = 6;
  }

  return adjustment;
}
