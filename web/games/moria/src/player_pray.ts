// player_pray.cpp: Code for priest spells
import { config } from './config.ts';
import { MagicSpellFlags, PlayerAttr, TV_MAX_WEAR, TV_MIN_WEAR, TV_NEVER, TV_PRAYER_BOOK } from './constants.ts';
import { classes, magic_spells } from './data_player.ts';
import { diceRoll } from './dice.ts';
import { getDirectionWithMemory, randomNumber } from './game.ts';
import { game, py } from './globals.ts';
import { inventoryFindRange, inventoryItemRemoveCurse } from './inventory.ts';
import { i16, ref, type Ref } from './libc.ts';
import { monsterSleep } from './monster.ts';
import { playerNoLight, playerTeleport } from './player.ts';
import { playerBless, playerCurePoison, playerDetectInvisible, playerProtectEvil, playerRemoveFear } from './player_magic.ts';
import { playerStatRandomDecrease, playerStatRestore } from './player_stats.ts';
import {
  castSpellGetId, spellChangePlayerHitPoints, spellConfuseMonster, spellCreateFood, spellDetectEvil, spellDetectSecretDoorssWithinVicinity,
  spellDetectTrapsWithinVicinity, spellDispelCreature, spellEarthquake, spellFireBall, spellLightArea, spellMapCurrentArea, spellSlowPoison,
  spellTurnUndead, spellWardingGlyph,
} from './spells.ts';
import { displayCharacterExperience, printCharacterCurrentMana } from './ui.ts';
import { inventoryGetInputForItemId } from './ui_inventory.ts';
import { printMessage } from './ui_io.ts';

async function playerCanPray(item_pos_begin: Ref<number>, item_pos_end: Ref<number>): Promise<boolean> {
  if (py.flags.blind > 0) {
    await printMessage("You can't see to read your prayer!");
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

  if (classes[py.misc.class_id].class_to_use_mage_spells !== config.spells.SPELL_TYPE_PRIEST) {
    await printMessage('Pray hard enough and your prayers may be answered.');
    return false;
  }

  if (py.pack.unique_items === 0) {
    await printMessage('But you are not carrying anything!');
    return false;
  }

  if (!inventoryFindRange(TV_PRAYER_BOOK, TV_NEVER, item_pos_begin, item_pos_end)) {
    await printMessage('You are not carrying any Holy Books!');
    return false;
  }

  return true;
}

// names based on spell_names[62] in data_player.cpp
/** enum class PriestSpellTypes */
const PriestSpellTypes = {
  DetectEvil: 1,
  CureLightWounds: 2,
  Bless: 3,
  RemoveFear: 4,
  CallLight: 5,
  FindTraps: 6,
  DetectDoorsStairs: 7,
  SlowPoison: 8,
  BlindCreature: 9,
  Portal: 10,
  CureMediumWounds: 11,
  Chant: 12,
  Sanctuary: 13,
  CreateFood: 14,
  RemoveCurse: 15,
  ResistHeadCold: 16,
  NeutralizePoison: 17,
  OrbOfDraining: 18,
  CureSeriousWounds: 19,
  SenseInvisible: 20,
  ProtectFromEvil: 21,
  Earthquake: 22,
  SenseSurroundings: 23,
  CureCriticalWounds: 24,
  TurnUndead: 25,
  Prayer: 26,
  DispelUndead: 27,
  Heal: 28,
  DispelEvil: 29,
  GlyphOfWarding: 30,
  HolyWord: 31,
} as const;

// Recite a prayers.
async function playerRecitePrayer(prayer_type: number): Promise<void> {
  const dir = ref(0);

  switch (prayer_type + 1) {
    case PriestSpellTypes.DetectEvil:
      await spellDetectEvil();
      break;
    case PriestSpellTypes.CureLightWounds:
      await spellChangePlayerHitPoints(diceRoll({ dice: 3, sides: 3 }));
      break;
    case PriestSpellTypes.Bless:
      playerBless(randomNumber(12) + 12);
      break;
    case PriestSpellTypes.RemoveFear:
      playerRemoveFear();
      break;
    case PriestSpellTypes.CallLight:
      await spellLightArea({ y: py.pos.y, x: py.pos.x });
      break;
    case PriestSpellTypes.FindTraps:
      spellDetectTrapsWithinVicinity();
      break;
    case PriestSpellTypes.DetectDoorsStairs:
      spellDetectSecretDoorssWithinVicinity();
      break;
    case PriestSpellTypes.SlowPoison:
      await spellSlowPoison();
      break;
    case PriestSpellTypes.BlindCreature:
      if (await getDirectionWithMemory(null, dir)) {
        await spellConfuseMonster({ y: py.pos.y, x: py.pos.x }, dir.v);
      }
      break;
    case PriestSpellTypes.Portal:
      await playerTeleport(py.misc.level * 3);
      break;
    case PriestSpellTypes.CureMediumWounds:
      await spellChangePlayerHitPoints(diceRoll({ dice: 4, sides: 4 }));
      break;
    case PriestSpellTypes.Chant:
      playerBless(randomNumber(24) + 24);
      break;
    case PriestSpellTypes.Sanctuary:
      await monsterSleep({ y: py.pos.y, x: py.pos.x });
      break;
    case PriestSpellTypes.CreateFood:
      await spellCreateFood();
      break;
    case PriestSpellTypes.RemoveCurse:
      for (const entry of py.inventory) {
        // only clear flag for items that are wielded or worn
        if (entry.category_id >= TV_MIN_WEAR && entry.category_id <= TV_MAX_WEAR) {
          inventoryItemRemoveCurse(entry);
        }
      }
      break;
    case PriestSpellTypes.ResistHeadCold:
      py.flags.heat_resistance += randomNumber(10) + 10;
      py.flags.cold_resistance += randomNumber(10) + 10;
      break;
    case PriestSpellTypes.NeutralizePoison:
      playerCurePoison();
      break;
    case PriestSpellTypes.OrbOfDraining:
      if (await getDirectionWithMemory(null, dir)) {
        await spellFireBall({ y: py.pos.y, x: py.pos.x }, dir.v, diceRoll({ dice: 3, sides: 6 }) + py.misc.level, MagicSpellFlags.HolyOrb, 'Black Sphere');
      }
      break;
    case PriestSpellTypes.CureSeriousWounds:
      await spellChangePlayerHitPoints(diceRoll({ dice: 8, sides: 4 }));
      break;
    case PriestSpellTypes.SenseInvisible:
      playerDetectInvisible(randomNumber(24) + 24);
      break;
    case PriestSpellTypes.ProtectFromEvil:
      playerProtectEvil();
      break;
    case PriestSpellTypes.Earthquake:
      await spellEarthquake();
      break;
    case PriestSpellTypes.SenseSurroundings:
      await spellMapCurrentArea();
      break;
    case PriestSpellTypes.CureCriticalWounds:
      await spellChangePlayerHitPoints(diceRoll({ dice: 16, sides: 4 }));
      break;
    case PriestSpellTypes.TurnUndead:
      await spellTurnUndead();
      break;
    case PriestSpellTypes.Prayer:
      playerBless(randomNumber(48) + 48);
      break;
    case PriestSpellTypes.DispelUndead:
      await spellDispelCreature(config.monsters.defense.CD_UNDEAD, 3 * py.misc.level);
      break;
    case PriestSpellTypes.Heal:
      await spellChangePlayerHitPoints(200);
      break;
    case PriestSpellTypes.DispelEvil:
      await spellDispelCreature(config.monsters.defense.CD_EVIL, 3 * py.misc.level);
      break;
    case PriestSpellTypes.GlyphOfWarding:
      await spellWardingGlyph();
      break;
    case PriestSpellTypes.HolyWord:
      playerRemoveFear();
      playerCurePoison();
      await spellChangePlayerHitPoints(1000);

      for (let i: number = PlayerAttr.A_STR; i <= PlayerAttr.A_CHR; i++) {
        await playerStatRestore(i);
      }

      await spellDispelCreature(config.monsters.defense.CD_EVIL, 4 * py.misc.level);
      await spellTurnUndead();

      if (py.flags.invulnerability < 3) {
        py.flags.invulnerability = 3;
      } else {
        py.flags.invulnerability++;
      }
      break;
    default:
      // All cases are handled, so this should never be reached!
      break;
  }
}

// Pray like HELL. -RAK-
export async function pray(): Promise<void> {
  game.player_free_turn = true;

  const item_pos_begin = ref(0);
  const item_pos_end = ref(0);
  if (!(await playerCanPray(item_pos_begin, item_pos_end))) {
    return;
  }

  const item_id = ref(0);
  if (!(await inventoryGetInputForItemId(item_id, 'Use which Holy Book?', item_pos_begin.v, item_pos_end.v, null, null))) {
    return;
  }

  const choice = ref(0);
  const chance = ref(0);
  const result = await castSpellGetId('Recite which prayer?', item_id.v, choice, chance);
  if (result < 0) {
    await printMessage("You don't know any prayers in that book.");
    return;
  }
  if (result === 0) {
    return;
  }

  const spell = magic_spells[py.misc.class_id - 1][choice.v];

  // NOTE: at least one function called by `playerRecitePrayer()` sets `player_free_turn = true`,
  // e.g. `spellCreateFood()`, so this check is required. -MRC-
  game.player_free_turn = false;

  if (randomNumber(100) < chance.v) {
    await printMessage('You lost your concentration!');
  } else {
    await playerRecitePrayer(choice.v);

    if (!game.player_free_turn) {
      if ((py.flags.spells_worked & ((1 << choice.v) >>> 0)) === 0) {
        py.misc.exp += spell.exp_gain_for_learning << 2;
        await displayCharacterExperience();
        py.flags.spells_worked |= (1 << choice.v) >>> 0;
      }
    }
  }

  if (game.player_free_turn) {
    return;
  }

  if (spell.mana_required > py.misc.current_mana) {
    await printMessage('You faint from fatigue!');

    py.flags.paralysis = i16(randomNumber(5 * (spell.mana_required - py.misc.current_mana)));
    py.misc.current_mana = 0;
    py.misc.current_mana_fraction = 0;

    if (randomNumber(3) === 1) {
      await printMessage('You have damaged your health!');
      await playerStatRandomDecrease(PlayerAttr.A_CON);
    }
  } else {
    py.misc.current_mana -= spell.mana_required;
  }

  printCharacterCurrentMana();
}
