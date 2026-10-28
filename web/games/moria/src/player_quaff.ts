// player_quaff.cpp: Code for potions
import { config } from './config.ts';
import { INT_MAX, PlayerAttr, SHRT_MAX, TV_POTION1, TV_POTION2 } from './constants.ts';
import { diceRoll } from './dice.ts';
import { randomNumber } from './game.ts';
import { game, py } from './globals.ts';
import { getAndClearFirstBit } from './helpers.ts';
import { itemIdentify, itemSetAsTried, itemSetColorlessAsIdentified, itemTypeRemainingCountDescription } from './identification.ts';
import { inventoryDestroyItem, inventoryFindRange } from './inventory.ts';
import { i32, idiv, ref } from './libc.ts';
import { playerIngestFood } from './player_eat.ts';
import { playerCureBlindness, playerCureConfusion, playerCurePoison, playerDetectInvisible, playerRemoveFear } from './player_magic.ts';
import { playerStatRandomIncrease, playerStatRestore } from './player_stats.ts';
import {
  spellChangePlayerHitPoints, spellLoseCHR, spellLoseEXP, spellLoseINT, spellLoseSTR, spellLoseWIS, spellRestorePlayerLevels,
  spellSlowPoison,
} from './spells.ts';
import { displayCharacterExperience, printCharacterCurrentMana } from './ui.ts';
import { inventoryGetInputForItemId } from './ui_inventory.ts';
import { printMessage } from './ui_io.ts';

/** enum class PotionSpellTypes */
const PotionSpellTypes = {
  Strength: 1,
  Weakness: 2,
  RestoreStrength: 3,
  Intelligence: 4,
  LoseIntelligence: 5,
  RestoreIntelligence: 6,
  Wisdom: 7,
  LoseWisdom: 8,
  RestoreWisdom: 9,
  Charisma: 10,
  Ugliness: 11,
  RestoreCharisma: 12,
  CureLightWounds: 13,
  CureSeriousWounds: 14,
  CureCriticalWounds: 15,
  Healing: 16,
  Constitution: 17,
  GainExperience: 18,
  Sleep: 19,
  Blindness: 20,
  Confusion: 21,
  Poison: 22,
  HasteSelf: 23,
  Slowness: 24,
  // 25 not used
  Dexterity: 26,
  RestoreDexterity: 27,
  RestoreConstitution: 28,
  CureBlindness: 29,
  CureConfusion: 30,
  CurePoison: 31,
  // 32 not used
  // 33 not used
  LoseExperience: 34,
  SaltWater: 35,
  Invulnerability: 36,
  Heroism: 37,
  SuperHeroism: 38,
  Boldness: 39,
  RestoreLifeLevels: 40,
  ResistHeat: 41,
  ResistCold: 42,
  DetectInvisible: 43,
  SlowPoison: 44,
  NeutralizePoison: 45,
  RestoreMana: 46,
  InfraVision: 47,
} as const;

async function playerDrinkPotion(flags_in: number, item_type: number): Promise<boolean> {
  let identified = false;
  const flags = ref(flags_in >>> 0);

  while (flags.v !== 0) {
    let potion_id = getAndClearFirstBit(flags) + 1;

    if (item_type === TV_POTION2) {
      potion_id += 32;
    }

    // Potions
    switch (potion_id) {
      case PotionSpellTypes.Strength:
        if (await playerStatRandomIncrease(PlayerAttr.A_STR)) {
          await printMessage('Wow!  What bulging muscles!');
          identified = true;
        }
        break;
      case PotionSpellTypes.Weakness:
        await spellLoseSTR();
        identified = true;
        break;
      case PotionSpellTypes.RestoreStrength:
        if (await playerStatRestore(PlayerAttr.A_STR)) {
          await printMessage('You feel warm all over.');
          identified = true;
        }
        break;
      case PotionSpellTypes.Intelligence:
        if (await playerStatRandomIncrease(PlayerAttr.A_INT)) {
          await printMessage("Aren't you brilliant!");
          identified = true;
        }
        break;
      case PotionSpellTypes.LoseIntelligence:
        await spellLoseINT();
        identified = true;
        break;
      case PotionSpellTypes.RestoreIntelligence:
        if (await playerStatRestore(PlayerAttr.A_INT)) {
          await printMessage('You have have a warm feeling.');
          identified = true;
        }
        break;
      case PotionSpellTypes.Wisdom:
        if (await playerStatRandomIncrease(PlayerAttr.A_WIS)) {
          await printMessage('You suddenly have a profound thought!');
          identified = true;
        }
        break;
      case PotionSpellTypes.LoseWisdom:
        await spellLoseWIS();
        identified = true;
        break;
      case PotionSpellTypes.RestoreWisdom:
        if (await playerStatRestore(PlayerAttr.A_WIS)) {
          await printMessage('You feel your wisdom returning.');
          identified = true;
        }
        break;
      case PotionSpellTypes.Charisma:
        if (await playerStatRandomIncrease(PlayerAttr.A_CHR)) {
          await printMessage("Gee, ain't you cute!");
          identified = true;
        }
        break;
      case PotionSpellTypes.Ugliness:
        await spellLoseCHR();
        identified = true;
        break;
      case PotionSpellTypes.RestoreCharisma:
        if (await playerStatRestore(PlayerAttr.A_CHR)) {
          await printMessage('You feel your looks returning.');
          identified = true;
        }
        break;
      case PotionSpellTypes.CureLightWounds:
        identified = await spellChangePlayerHitPoints(diceRoll({ dice: 2, sides: 7 }));
        break;
      case PotionSpellTypes.CureSeriousWounds:
        identified = await spellChangePlayerHitPoints(diceRoll({ dice: 4, sides: 7 }));
        break;
      case PotionSpellTypes.CureCriticalWounds:
        identified = await spellChangePlayerHitPoints(diceRoll({ dice: 6, sides: 7 }));
        break;
      case PotionSpellTypes.Healing:
        identified = await spellChangePlayerHitPoints(1000);
        break;
      case PotionSpellTypes.Constitution:
        if (await playerStatRandomIncrease(PlayerAttr.A_CON)) {
          await printMessage('You feel tingly for a moment.');
          identified = true;
        }
        break;
      case PotionSpellTypes.GainExperience:
        if (py.misc.exp < config.player.PLAYER_MAX_EXP) {
          let exp = (idiv(py.misc.exp, 2) + 10) >>> 0;
          if (exp > 100000) {
            exp = 100000;
          }
          py.misc.exp += exp;

          await printMessage('You feel more experienced.');
          await displayCharacterExperience();
          identified = true;
        }
        break;
      case PotionSpellTypes.Sleep:
        if (!py.flags.free_action) {
          // paralysis must == 0, otherwise could not drink potion
          await printMessage('You fall asleep.');
          py.flags.paralysis += randomNumber(4) + 4;
          identified = true;
        }
        break;
      case PotionSpellTypes.Blindness:
        if (py.flags.blind === 0) {
          await printMessage('You are covered by a veil of darkness.');
          identified = true;
        }
        py.flags.blind += randomNumber(100) + 100;
        break;
      case PotionSpellTypes.Confusion:
        if (py.flags.confused === 0) {
          await printMessage('Hey!  This is good stuff!  * Hick! *');
          identified = true;
        }
        py.flags.confused += randomNumber(20) + 12;
        break;
      case PotionSpellTypes.Poison:
        if (py.flags.poisoned === 0) {
          await printMessage('You feel very sick.');
          identified = true;
        }
        py.flags.poisoned += randomNumber(15) + 10;
        break;
      case PotionSpellTypes.HasteSelf:
        if (py.flags.fast === 0) {
          identified = true;
        }
        py.flags.fast += randomNumber(25) + 15;
        break;
      case PotionSpellTypes.Slowness:
        if (py.flags.slow === 0) {
          identified = true;
        }
        py.flags.slow += randomNumber(25) + 15;
        break;
      case PotionSpellTypes.Dexterity:
        if (await playerStatRandomIncrease(PlayerAttr.A_DEX)) {
          await printMessage('You feel more limber!');
          identified = true;
        }
        break;
      case PotionSpellTypes.RestoreDexterity:
        if (await playerStatRestore(PlayerAttr.A_DEX)) {
          await printMessage('You feel less clumsy.');
          identified = true;
        }
        break;
      case PotionSpellTypes.RestoreConstitution:
        if (await playerStatRestore(PlayerAttr.A_CON)) {
          await printMessage('You feel your health returning!');
          identified = true;
        }
        break;
      case PotionSpellTypes.CureBlindness:
        identified = playerCureBlindness();
        break;
      case PotionSpellTypes.CureConfusion:
        identified = playerCureConfusion();
        break;
      case PotionSpellTypes.CurePoison:
        identified = playerCurePoison();
        break;
      // case 33: break; // this is no longer useful, now that there is a 'G'ain magic spells command
      case PotionSpellTypes.LoseExperience:
        if (py.misc.exp > 0) {
          await printMessage('You feel your memories fade.');

          // Lose between 1/5 and 2/5 of your experience
          let exp = idiv(py.misc.exp, 5);

          if (py.misc.exp > SHRT_MAX) {
            const scale = i32(idiv(INT_MAX, py.misc.exp));
            exp += idiv(randomNumber(scale) * py.misc.exp, scale * 5);
          } else {
            exp += idiv(randomNumber(py.misc.exp), 5);
          }
          await spellLoseEXP(exp);
          identified = true;
        }
        break;
      case PotionSpellTypes.SaltWater:
        playerCurePoison();
        if (py.flags.food > 150) {
          py.flags.food = 150;
        }
        py.flags.paralysis = 4;

        await printMessage('The potion makes you vomit!');
        identified = true;
        break;
      case PotionSpellTypes.Invulnerability:
        if (py.flags.invulnerability === 0) {
          identified = true;
        }
        py.flags.invulnerability += randomNumber(10) + 10;
        break;
      case PotionSpellTypes.Heroism:
        if (py.flags.heroism === 0) {
          identified = true;
        }
        py.flags.heroism += randomNumber(25) + 25;
        break;
      case PotionSpellTypes.SuperHeroism:
        if (py.flags.super_heroism === 0) {
          identified = true;
        }
        py.flags.super_heroism += randomNumber(25) + 25;
        break;
      case PotionSpellTypes.Boldness:
        identified = playerRemoveFear();
        break;
      case PotionSpellTypes.RestoreLifeLevels:
        identified = await spellRestorePlayerLevels();
        break;
      case PotionSpellTypes.ResistHeat:
        if (py.flags.heat_resistance === 0) {
          identified = true;
        }
        py.flags.heat_resistance += randomNumber(10) + 10;
        break;
      case PotionSpellTypes.ResistCold:
        if (py.flags.cold_resistance === 0) {
          identified = true;
        }
        py.flags.cold_resistance += randomNumber(10) + 10;
        break;
      case PotionSpellTypes.DetectInvisible:
        if (py.flags.detect_invisible === 0) {
          identified = true;
        }
        playerDetectInvisible(randomNumber(12) + 12);
        break;
      case PotionSpellTypes.SlowPoison:
        identified = await spellSlowPoison();
        break;
      case PotionSpellTypes.NeutralizePoison:
        identified = playerCurePoison();
        break;
      case PotionSpellTypes.RestoreMana:
        if (py.misc.current_mana < py.misc.mana) {
          py.misc.current_mana = py.misc.mana;
          await printMessage('Your feel your head clear.');
          printCharacterCurrentMana();
          identified = true;
        }
        break;
      case PotionSpellTypes.InfraVision:
        if (py.flags.timed_infra === 0) {
          await printMessage('Your eyes begin to tingle.');
          identified = true;
        }
        py.flags.timed_infra += 100 + randomNumber(100);
        break;
      default:
        // All cases are handled, so this should never be reached!
        await printMessage('Internal error in potion()');
        break;
    }
  }

  return identified;
}

// Potions for the quaffing -RAK-
export async function quaff(): Promise<void> {
  game.player_free_turn = true;

  if (py.pack.unique_items === 0) {
    await printMessage('But you are not carrying anything.');
    return;
  }

  const item_pos_begin = ref(0);
  const item_pos_end = ref(0);
  if (!inventoryFindRange(TV_POTION1, TV_POTION2, item_pos_begin, item_pos_end)) {
    await printMessage('You are not carrying any potions.');
    return;
  }

  const item_id = ref(0);
  if (!(await inventoryGetInputForItemId(item_id, 'Quaff which potion?', item_pos_begin.v, item_pos_end.v, null, null))) {
    return;
  }

  game.player_free_turn = false;

  let identified: boolean;
  let item = py.inventory[item_id.v];

  if (item.flags === 0) {
    await printMessage('You feel less thirsty.');
    identified = true;
  } else {
    identified = await playerDrinkPotion(item.flags, item.category_id);
  }

  if (identified) {
    if (!itemSetColorlessAsIdentified(item.category_id, item.sub_category_id, item.identification)) {
      // round half-way case up
      py.misc.exp += idiv(item.depth_first_found + (py.misc.level >> 1), py.misc.level);
      await displayCharacterExperience();

      await itemIdentify(py.inventory[item_id.v], item_id);
      item = py.inventory[item_id.v];
    }
  } else if (!itemSetColorlessAsIdentified(item.category_id, item.sub_category_id, item.identification)) {
    itemSetAsTried(item);
  }

  await playerIngestFood(item.misc_use);
  await itemTypeRemainingCountDescription(item_id.v);
  inventoryDestroyItem(item_id.v);
}
