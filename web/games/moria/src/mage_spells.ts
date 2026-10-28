// mage_spells.cpp: Code for mage spells
import { config } from './config.ts';
import { MagicSpellFlags, PLAYER_INVENTORY_SIZE, PlayerAttr, TV_MAGIC_BOOK, TV_NEVER } from './constants.ts';
import { classes, magic_spells, spell_names } from './data_player.ts';
import { diceRoll } from './dice.ts';
import { getDirectionWithMemory, randomNumber } from './game.ts';
import { game, py } from './globals.ts';
import { inventoryFindRange, inventoryItemRemoveCurse } from './inventory.ts';
import { ref } from './libc.ts';
import { monsterSleep } from './monster.ts';
import { playerNoLight, playerTeleport } from './player.ts';
import { playerCurePoison } from './player_magic.ts';
import { playerStatAdjustmentWisdomIntelligence, playerStatRandomDecrease } from './player_stats.ts';
import {
  castSpellGetId, spellChangePlayerHitPoints, spellConfuseMonster, spellCreateFood, spellDestroyAdjacentDoorsTraps, spellDestroyArea,
  spellDetectMonsters, spellDetectSecretDoorssWithinVicinity, spellDetectTrapsWithinVicinity, spellFireBall, spellFireBolt, spellGenocide,
  spellIdentifyItem, spellLightArea, spellPolymorphMonster, spellRechargeItem, spellSleepAllMonsters, spellSleepMonster, spellSpeedMonster,
  spellTeleportAwayMonsterInDirection, spellWallToMud,
} from './spells.ts';
import { displayCharacterExperience, printCharacterCurrentMana } from './ui.ts';
import { inventoryGetInputForItemId } from './ui_inventory.ts';
import { printMessage } from './ui_io.ts';

// names based on spell_names[62] in data_player.cpp
// enum class MageSpellId
const MageSpellId = {
  MagicMissile: 1,
  DetectMonsters: 2,
  PhaseDoor: 3,
  LightArea: 4,
  CureLightWounds: 5,
  FindHiddenTrapsDoors: 6,
  StinkingCloud: 7,
  Confusion: 8,
  LightningBolt: 9,
  TrapDoorDestruction: 10,
  Sleep1: 11,
  CurePoison: 12,
  TeleportSelf: 13,
  RemoveCurse: 14,
  FrostBolt: 15,
  WallToMud: 16,
  CreateFood: 17,
  RechargeItem1: 18,
  Sleep2: 19,
  PolymorphOther: 20,
  IdentifyItem: 21,
  Sleep3: 22,
  FireBolt: 23,
  SpeedMonster: 24,
  FrostBall: 25,
  RechargeItem2: 26,
  TeleportOther: 27,
  HasteSelf: 28,
  FireBall: 29,
  WordOfDestruction: 30,
  Genocide: 31,
} as const;

async function canReadSpells(): Promise<boolean> {
  if (py.flags.blind > 0) {
    await printMessage("You can't see to read your spell book!");
    return false;
  }

  if (playerNoLight()) {
    await printMessage('You have no light to read by.');
    return false;
  }

  if (py.flags.confused > 0) {
    await printMessage('You are too confused.');
    return false;
  }

  if (classes[py.misc.class_id].class_to_use_mage_spells !== config.spells.SPELL_TYPE_MAGE) {
    await printMessage("You can't cast spells!");
    return false;
  }

  return true;
}

async function castSpell(spell_id: number): Promise<void> {
  const dir = ref(0);

  switch (spell_id) {
    case MageSpellId.MagicMissile:
      if (await getDirectionWithMemory(null, dir)) {
        await spellFireBolt(py.pos, dir.v, diceRoll({ dice: 2, sides: 6 }), MagicSpellFlags.MagicMissile, spell_names[0]);
      }
      break;
    case MageSpellId.DetectMonsters:
      void (await spellDetectMonsters());
      break;
    case MageSpellId.PhaseDoor:
      await playerTeleport(10);
      break;
    case MageSpellId.LightArea:
      void (await spellLightArea(py.pos));
      break;
    case MageSpellId.CureLightWounds:
      void (await spellChangePlayerHitPoints(diceRoll({ dice: 4, sides: 4 })));
      break;
    case MageSpellId.FindHiddenTrapsDoors:
      void spellDetectSecretDoorssWithinVicinity();
      void spellDetectTrapsWithinVicinity();
      break;
    case MageSpellId.StinkingCloud:
      if (await getDirectionWithMemory(null, dir)) {
        await spellFireBall(py.pos, dir.v, 12, MagicSpellFlags.PoisonGas, spell_names[6]);
      }
      break;
    case MageSpellId.Confusion:
      if (await getDirectionWithMemory(null, dir)) {
        void (await spellConfuseMonster(py.pos, dir.v));
      }
      break;
    case MageSpellId.LightningBolt:
      if (await getDirectionWithMemory(null, dir)) {
        await spellFireBolt(py.pos, dir.v, diceRoll({ dice: 4, sides: 8 }), MagicSpellFlags.Lightning, spell_names[8]);
      }
      break;
    case MageSpellId.TrapDoorDestruction:
      void (await spellDestroyAdjacentDoorsTraps());
      break;
    case MageSpellId.Sleep1:
      if (await getDirectionWithMemory(null, dir)) {
        void (await spellSleepMonster(py.pos, dir.v));
      }
      break;
    case MageSpellId.CurePoison:
      void playerCurePoison();
      break;
    case MageSpellId.TeleportSelf:
      await playerTeleport((py.misc.level * 5));
      break;
    case MageSpellId.RemoveCurse:
      for (let id = 22; id < PLAYER_INVENTORY_SIZE; id++) {
        inventoryItemRemoveCurse(py.inventory[id]);
      }
      break;
    case MageSpellId.FrostBolt:
      if (await getDirectionWithMemory(null, dir)) {
        await spellFireBolt(py.pos, dir.v, diceRoll({ dice: 6, sides: 8 }), MagicSpellFlags.Frost, spell_names[14]);
      }
      break;
    case MageSpellId.WallToMud:
      if (await getDirectionWithMemory(null, dir)) {
        void (await spellWallToMud(py.pos, dir.v));
      }
      break;
    case MageSpellId.CreateFood:
      await spellCreateFood();
      break;
    case MageSpellId.RechargeItem1:
      void (await spellRechargeItem(20));
      break;
    case MageSpellId.Sleep2:
      void (await monsterSleep({ y: py.pos.y, x: py.pos.x }));
      break;
    case MageSpellId.PolymorphOther:
      if (await getDirectionWithMemory(null, dir)) {
        void (await spellPolymorphMonster(py.pos, dir.v));
      }
      break;
    case MageSpellId.IdentifyItem:
      void (await spellIdentifyItem());
      break;
    case MageSpellId.Sleep3:
      void (await spellSleepAllMonsters());
      break;
    case MageSpellId.FireBolt:
      if (await getDirectionWithMemory(null, dir)) {
        await spellFireBolt(py.pos, dir.v, diceRoll({ dice: 9, sides: 8 }), MagicSpellFlags.Fire, spell_names[22]);
      }
      break;
    case MageSpellId.SpeedMonster:
      if (await getDirectionWithMemory(null, dir)) {
        void (await spellSpeedMonster(py.pos, dir.v, -1));
      }
      break;
    case MageSpellId.FrostBall:
      if (await getDirectionWithMemory(null, dir)) {
        await spellFireBall(py.pos, dir.v, 48, MagicSpellFlags.Frost, spell_names[24]);
      }
      break;
    case MageSpellId.RechargeItem2:
      void (await spellRechargeItem(60));
      break;
    case MageSpellId.TeleportOther:
      if (await getDirectionWithMemory(null, dir)) {
        void (await spellTeleportAwayMonsterInDirection(py.pos, dir.v));
      }
      break;
    case MageSpellId.HasteSelf:
      py.flags.fast += randomNumber(20) + py.misc.level;
      break;
    case MageSpellId.FireBall:
      if (await getDirectionWithMemory(null, dir)) {
        await spellFireBall(py.pos, dir.v, 72, MagicSpellFlags.Fire, spell_names[28]);
      }
      break;
    case MageSpellId.WordOfDestruction:
      await spellDestroyArea(py.pos);
      break;
    case MageSpellId.Genocide:
      void (await spellGenocide());
      break;
    default:
      // All cases are handled, so this should never be reached!
      break;
  }
}

// Throw a magic spell -RAK-
export async function getAndCastMagicSpell(): Promise<void> {
  game.player_free_turn = true;

  if (!(await canReadSpells())) {
    return;
  }

  const i = ref(0);
  const j = ref(0);
  if (!inventoryFindRange(TV_MAGIC_BOOK, TV_NEVER, i, j)) {
    await printMessage('But you are not carrying any spell-books!');
    return;
  }

  const item_val = ref(0);
  if (!(await inventoryGetInputForItemId(item_val, 'Use which spell-book?', i.v, j.v, null, null))) {
    return;
  }

  const choice = ref(0);
  const chance = ref(0);
  const result = await castSpellGetId('Cast which spell?', item_val.v, choice, chance);
  if (result < 0) {
    await printMessage("You don't know any spells in that book.");
    return;
  }
  if (result === 0) {
    return;
  }

  game.player_free_turn = false;

  const magic_spell = magic_spells[py.misc.class_id - 1][choice.v];

  if (randomNumber(100) < chance.v) {
    await printMessage('You failed to get the spell off!');
  } else {
    await castSpell(choice.v + 1);

    // 1L << choice: choice < 31
    if (!game.player_free_turn && (py.flags.spells_worked & (1 << choice.v)) === 0) {
      py.misc.exp += magic_spell.exp_gain_for_learning << 2;
      py.flags.spells_worked |= (1 << choice.v);

      await displayCharacterExperience();
    }
  }

  if (game.player_free_turn) {
    return;
  }

  if (magic_spell.mana_required > py.misc.current_mana) {
    await printMessage('You faint from the effort!');

    py.flags.paralysis = randomNumber((5 * (magic_spell.mana_required - py.misc.current_mana)));
    py.misc.current_mana = 0;
    py.misc.current_mana_fraction = 0;

    if (randomNumber(3) === 1) {
      await printMessage('You have damaged your health!');
      void (await playerStatRandomDecrease(PlayerAttr.A_CON));
    }
  } else {
    py.misc.current_mana -= magic_spell.mana_required;
  }

  printCharacterCurrentMana();
}

// Returns spell chance of failure for class_to_use_mage_spells -RAK-
export function spellChanceOfSuccess(spell_id: number): number {
  const spell = magic_spells[py.misc.class_id - 1][spell_id];

  let chance = spell.failure_chance - 3 * (py.misc.level - spell.level_required);

  let stat: number;
  if (classes[py.misc.class_id].class_to_use_mage_spells === config.spells.SPELL_TYPE_MAGE) {
    stat = PlayerAttr.A_INT;
  } else {
    stat = PlayerAttr.A_WIS;
  }

  chance -= 3 * (playerStatAdjustmentWisdomIntelligence(stat) - 1);

  if (spell.mana_required > py.misc.current_mana) {
    chance += 5 * (spell.mana_required - py.misc.current_mana);
  }

  if (chance > 95) {
    chance = 95;
  } else if (chance < 5) {
    chance = 5;
  }

  return chance;
}
