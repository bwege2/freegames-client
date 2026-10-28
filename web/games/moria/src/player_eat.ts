// player_eat.cpp: Food code
import { config } from './config.ts';
import { PlayerAttr, TV_FOOD, TV_NEVER } from './constants.ts';
import { diceRoll } from './dice.ts';
import { randomNumber } from './game.ts';
import { game, py } from './globals.ts';
import { getAndClearFirstBit } from './helpers.ts';
import { itemIdentify, itemSetAsTried, itemSetColorlessAsIdentified, itemTypeRemainingCountDescription } from './identification.ts';
import { inventoryDestroyItem, inventoryFindRange } from './inventory.ts';
import { i16, idiv, ref } from './libc.ts';
import { playerTakesHit } from './player.ts';
import { playerCureBlindness, playerCureConfusion, playerCurePoison } from './player_magic.ts';
import { playerStatRestore } from './player_stats.ts';
import { spellChangePlayerHitPoints, spellLoseCON, spellLoseSTR } from './spells.ts';
import { displayCharacterExperience, drawCavePanel, printCharacterHungerStatus } from './ui.ts';
import { inventoryGetInputForItemId } from './ui_inventory.ts';
import { printMessage } from './ui_io.ts';

/** enum class FoodMagicTypes */
const FoodMagicTypes = {
  Poison: 1,
  Blindness: 2,
  Paranoia: 3,
  Confusion: 4,
  Hallucination: 5,
  CurePoison: 6,
  CureBlindness: 7,
  CureParanoia: 8,
  CureConfusion: 9,
  Weakness: 10,
  Unhealth: 11,
  // 12-15 are no longer used
  RestoreSTR: 16,
  RestoreCON: 17,
  RestoreINT: 18,
  RestoreWIS: 19,
  RestoreDEX: 20,
  RestoreCHR: 21,
  FirstAid: 22,
  MinorCures: 23,
  LightCures: 24,
  // 25 no longer used
  MajorCures: 26,
  PoisonousFood: 27,
} as const;

// Eat some food. -RAK-
export async function playerEat(): Promise<void> {
  game.player_free_turn = true;

  if (py.pack.unique_items === 0) {
    await printMessage('But you are not carrying anything.');
    return;
  }

  const item_pos_start = ref(0);
  const item_pos_end = ref(0);
  if (!inventoryFindRange(TV_FOOD, TV_NEVER, item_pos_start, item_pos_end)) {
    await printMessage('You are not carrying any food.');
    return;
  }

  const item_id = ref(0);
  if (!(await inventoryGetInputForItemId(item_id, 'Eat what?', item_pos_start.v, item_pos_end.v, null, null))) {
    return;
  }

  game.player_free_turn = false;

  let identified = false;

  let item = py.inventory[item_id.v];
  const item_flags = ref(item.flags);

  while (item_flags.v !== 0) {
    switch (getAndClearFirstBit(item_flags) + 1) {
      case FoodMagicTypes.Poison:
        py.flags.poisoned += randomNumber(10) + item.depth_first_found;
        identified = true;
        break;
      case FoodMagicTypes.Blindness:
        py.flags.blind += randomNumber(250) + 10 * item.depth_first_found + 100;
        await drawCavePanel();
        await printMessage('A veil of darkness surrounds you.');
        identified = true;
        break;
      case FoodMagicTypes.Paranoia:
        py.flags.afraid += randomNumber(10) + item.depth_first_found;
        await printMessage('You feel terrified!');
        identified = true;
        break;
      case FoodMagicTypes.Confusion:
        py.flags.confused += randomNumber(10) + item.depth_first_found;
        await printMessage('You feel drugged.');
        identified = true;
        break;
      case FoodMagicTypes.Hallucination:
        py.flags.image += randomNumber(200) + 25 * item.depth_first_found + 200;
        await printMessage('You feel drugged.');
        identified = true;
        break;
      case FoodMagicTypes.CurePoison:
        identified = playerCurePoison();
        break;
      case FoodMagicTypes.CureBlindness:
        identified = playerCureBlindness();
        break;
      case FoodMagicTypes.CureParanoia:
        if (py.flags.afraid > 1) {
          py.flags.afraid = 1;
          identified = true;
        }
        break;
      case FoodMagicTypes.CureConfusion:
        identified = playerCureConfusion();
        break;
      case FoodMagicTypes.Weakness:
        await spellLoseSTR();
        identified = true;
        break;
      case FoodMagicTypes.Unhealth:
        await spellLoseCON();
        identified = true;
        break;
      // #if 0: 12 through 15 are no longer used (lose_int, lose_wis, lose_dex, lose_chr)
      case FoodMagicTypes.RestoreSTR:
        if (await playerStatRestore(PlayerAttr.A_STR)) {
          await printMessage('You feel your strength returning.');
          identified = true;
        }
        break;
      case FoodMagicTypes.RestoreCON:
        if (await playerStatRestore(PlayerAttr.A_CON)) {
          await printMessage('You feel your health returning.');
          identified = true;
        }
        break;
      case FoodMagicTypes.RestoreINT:
        if (await playerStatRestore(PlayerAttr.A_INT)) {
          await printMessage('Your head spins a moment.');
          identified = true;
        }
        break;
      case FoodMagicTypes.RestoreWIS:
        if (await playerStatRestore(PlayerAttr.A_WIS)) {
          await printMessage('You feel your wisdom returning.');
          identified = true;
        }
        break;
      case FoodMagicTypes.RestoreDEX:
        if (await playerStatRestore(PlayerAttr.A_DEX)) {
          await printMessage('You feel more dexterous.');
          identified = true;
        }
        break;
      case FoodMagicTypes.RestoreCHR:
        if (await playerStatRestore(PlayerAttr.A_CHR)) {
          await printMessage('Your skin stops itching.');
          identified = true;
        }
        break;
      case FoodMagicTypes.FirstAid:
        identified = await spellChangePlayerHitPoints(randomNumber(6));
        break;
      case FoodMagicTypes.MinorCures:
        identified = await spellChangePlayerHitPoints(randomNumber(12));
        break;
      case FoodMagicTypes.LightCures:
        identified = await spellChangePlayerHitPoints(randomNumber(18));
        break;
      // #if 0: 25 is no longer used (hp_player(damroll(3, 6)))
      case FoodMagicTypes.MajorCures:
        identified = await spellChangePlayerHitPoints(diceRoll({ dice: 3, sides: 12 }));
        break;
      case FoodMagicTypes.PoisonousFood:
        playerTakesHit(randomNumber(18), 'poisonous food.');
        identified = true;
        break;
      // #if 0: 28 through 30 are no longer used (take_hit(randint(8)), damroll(2, 8), damroll(3, 8))
      default:
        // All cases are handled, so this should never be reached!
        await printMessage('Internal error in playerEat()');
        break;
    }
  }

  if (identified) {
    if (!itemSetColorlessAsIdentified(item.category_id, item.sub_category_id, item.identification)) {
      // use identified it, gain experience
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

  py.flags.status &= ~(config.player.status.PY_WEAK | config.player.status.PY_HUNGRY);

  printCharacterHungerStatus();

  await itemTypeRemainingCountDescription(item_id.v);
  inventoryDestroyItem(item_id.v);
}

// Add to the players food time -RAK-
export async function playerIngestFood(amount: number): Promise<void> {
  if (py.flags.food < 0) {
    py.flags.food = 0;
  }

  py.flags.food += amount;

  if (py.flags.food > config.player.PLAYER_FOOD_MAX) {
    await printMessage('You are bloated from overeating.');

    // Calculate how much of amount is responsible for the bloating. Give the
    // player food credit for 1/50, and also slow them for that many turns.
    let extra = py.flags.food - config.player.PLAYER_FOOD_MAX;
    if (extra > amount) {
      extra = amount;
    }
    const penalty = idiv(extra, 50);

    py.flags.slow += penalty;

    if (extra === amount) {
      py.flags.food = i16(py.flags.food - amount + penalty);
    } else {
      py.flags.food = i16(config.player.PLAYER_FOOD_MAX + penalty);
    }
  } else if (py.flags.food > config.player.PLAYER_FOOD_FULL) {
    await printMessage('You are full.');
  }
}
