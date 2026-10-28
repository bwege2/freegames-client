// staves.cpp: staffs and wands
import { config } from './config.ts';
import { MagicSpellFlags, PlayerAttr, PlayerClassLevelAdj, TV_NEVER, TV_STAFF, TV_WAND } from './constants.ts';
import { class_level_adj, spell_names } from './data_player.ts';
import { diceRoll } from './dice.ts';
import { getDirectionWithMemory, getRandomDirection, randomNumber } from './game.ts';
import { game, py } from './globals.ts';
import { getAndClearFirstBit } from './helpers.ts';
import {
  itemAppendToInscription, itemChargesRemainingDescription, itemIdentify, itemSetAsTried, itemSetColorlessAsIdentified, spellItemIdentified,
} from './identification.ts';
import { inventoryFindRange } from './inventory.ts';
import { idiv, ref, type Ref } from './libc.ts';
import { monsterSummon } from './monster_manager.ts';
import { playerTeleport } from './player.ts';
import { playerCureBlindness, playerCureConfusion, playerCurePoison } from './player_magic.ts';
import { playerStatAdjustmentWisdomIntelligence } from './player_stats.ts';
import {
  spellBuildWall, spellChangeMonsterHitPoints, spellChangePlayerHitPoints, spellCloneMonster, spellConfuseMonster, spellDarkenArea,
  spellDestroyArea, spellDestroyDoorsTrapsInDirection, spellDetectEvil, spellDetectInvisibleCreaturesWithinVicinity,
  spellDetectObjectsWithinVicinity, spellDetectSecretDoorssWithinVicinity, spellDetectTrapsWithinVicinity, spellDetectTreasureWithinVicinity,
  spellDisarmAllInDirection, spellDispelCreature, spellDrainLifeFromMonster, spellEarthquake, spellFireBall, spellFireBolt, spellLightArea,
  spellLightLine, spellMassPolymorph, spellPolymorphMonster, spellRemoveCurseFromAllWornItems, spellSleepAllMonsters, spellSleepMonster,
  spellSpeedAllMonsters, spellSpeedMonster, spellStarlite, spellTeleportAwayMonsterInDirection, spellWallToMud,
} from './spells.ts';
import type { Coord_t, Inventory_t } from './structs.ts';
import { displayCharacterExperience } from './ui.ts';
import { inventoryGetInputForItemId } from './ui_inventory.ts';
import { printMessage } from './ui_io.ts';

// enum class StaffSpellTypes
const StaffSpellTypes = {
  StaffLight: 1, // TODO: name would clash with PlayerEquipment::Light
  DetectDoorsStairs: 2,
  TrapLocation: 3,
  TreasureLocation: 4,
  ObjectLocation: 5,
  Teleportation: 6,
  Earthquakes: 7,
  Summoning: 8,
  // skipping 9
  Destruction: 10,
  Starlight: 11,
  HasteMonsters: 12,
  SlowMonsters: 13,
  SleepMonsters: 14,
  CureLightWounds: 15,
  DetectInvisible: 16,
  Speed: 17,
  Slowness: 18,
  MassPolymorph: 19,
  RemoveCurse: 20,
  DetectEvil: 21,
  Curing: 22,
  DispelEvil: 23,
  // skipping 24
  Darkness: 25,
  // skipping lots...
  StoreBoughtFlag: 32,
} as const;

async function staffPlayerIsCarrying(item_pos_start: Ref<number>, item_pos_end: Ref<number>): Promise<boolean> {
  if (py.pack.unique_items === 0) {
    await printMessage('But you are not carrying anything.');
    return false;
  }

  if (!inventoryFindRange(TV_STAFF, TV_NEVER, item_pos_start, item_pos_end)) {
    await printMessage('You are not carrying any staffs.');
    return false;
  }

  return true;
}

async function staffPlayerCanUse(item: Inventory_t): Promise<boolean> {
  let chance = py.misc.saving_throw;
  chance += playerStatAdjustmentWisdomIntelligence(PlayerAttr.A_INT);
  chance -= item.depth_first_found - 5;
  chance += idiv(class_level_adj[py.misc.class_id][PlayerClassLevelAdj.DEVICE] * py.misc.level, 3);

  if (py.flags.confused > 0) {
    chance = idiv(chance, 2);
  }

  // Give everyone a slight chance
  if (chance < config.player.PLAYER_USE_DEVICE_DIFFICULTY && randomNumber(config.player.PLAYER_USE_DEVICE_DIFFICULTY - chance + 1) === 1) {
    chance = config.player.PLAYER_USE_DEVICE_DIFFICULTY;
  }

  if (chance < 1) {
    chance = 1;
  }

  if (randomNumber(chance) < config.player.PLAYER_USE_DEVICE_DIFFICULTY) {
    await printMessage('You failed to use the staff properly.');
    return false;
  }

  if (item.misc_use < 1) {
    await printMessage('The staff has no charges left.');
    if (!spellItemIdentified(item)) {
      itemAppendToInscription(item, config.identification.ID_EMPTY);
    }
    return false;
  }

  return true;
}

async function staffDischarge(item: Inventory_t): Promise<boolean> {
  let identified = false;

  item.misc_use--;

  const flags = ref(item.flags);
  while (flags.v !== 0) {
    switch (getAndClearFirstBit(flags) + 1) {
      case StaffSpellTypes.StaffLight:
        identified = await spellLightArea(py.pos);
        break;
      case StaffSpellTypes.DetectDoorsStairs:
        identified = spellDetectSecretDoorssWithinVicinity();
        break;
      case StaffSpellTypes.TrapLocation:
        identified = spellDetectTrapsWithinVicinity();
        break;
      case StaffSpellTypes.TreasureLocation:
        identified = spellDetectTreasureWithinVicinity();
        break;
      case StaffSpellTypes.ObjectLocation:
        identified = spellDetectObjectsWithinVicinity();
        break;
      case StaffSpellTypes.Teleportation:
        await playerTeleport(100);
        identified = true;
        break;
      case StaffSpellTypes.Earthquakes:
        identified = true;
        await spellEarthquake();
        break;
      case StaffSpellTypes.Summoning:
        identified = false;

        for (let i = 0; i < randomNumber(4); i++) {
          const coord: Coord_t = { y: py.pos.y, x: py.pos.x };
          // identified |= monsterSummon(coord, false): the call is always made
          const summoned = await monsterSummon(coord, false);
          identified = identified || summoned;
        }
        break;
      case StaffSpellTypes.Destruction:
        identified = true;
        await spellDestroyArea(py.pos);
        break;
      case StaffSpellTypes.Starlight:
        identified = true;
        await spellStarlite(py.pos);
        break;
      case StaffSpellTypes.HasteMonsters:
        identified = await spellSpeedAllMonsters(1);
        break;
      case StaffSpellTypes.SlowMonsters:
        identified = await spellSpeedAllMonsters(-1);
        break;
      case StaffSpellTypes.SleepMonsters:
        identified = await spellSleepAllMonsters();
        break;
      case StaffSpellTypes.CureLightWounds:
        identified = await spellChangePlayerHitPoints(randomNumber(8));
        break;
      case StaffSpellTypes.DetectInvisible:
        identified = await spellDetectInvisibleCreaturesWithinVicinity();
        break;
      case StaffSpellTypes.Speed:
        if (py.flags.fast === 0) {
          identified = true;
        }
        py.flags.fast += randomNumber(30) + 15;
        break;
      case StaffSpellTypes.Slowness:
        if (py.flags.slow === 0) {
          identified = true;
        }
        py.flags.slow += randomNumber(30) + 15;
        break;
      case StaffSpellTypes.MassPolymorph:
        identified = await spellMassPolymorph();
        break;
      case StaffSpellTypes.RemoveCurse:
        if (spellRemoveCurseFromAllWornItems()) {
          if (py.flags.blind < 1) {
            await printMessage('The staff glows blue for a moment..');
          }
          identified = true;
        }
        break;
      case StaffSpellTypes.DetectEvil:
        identified = await spellDetectEvil();
        break;
      case StaffSpellTypes.Curing:
        if (playerCureBlindness() || playerCurePoison() || playerCureConfusion()) {
          identified = true;
        }
        break;
      case StaffSpellTypes.DispelEvil:
        identified = await spellDispelCreature(config.monsters.defense.CD_EVIL, 60);
        break;
      case StaffSpellTypes.Darkness:
        identified = await spellDarkenArea(py.pos);
        break;
      case StaffSpellTypes.StoreBoughtFlag:
        // store bought flag
        break;
      default:
        // All cases are handled, so this should never be reached!
        await printMessage('Internal error in staffs()');
        break;
    }
  }

  return identified;
}

// Use a staff. -RAK-
export async function staffUse(): Promise<void> {
  game.player_free_turn = true;

  const item_pos_start = ref(0);
  const item_pos_end = ref(0);
  if (!(await staffPlayerIsCarrying(item_pos_start, item_pos_end))) {
    return;
  }

  const item_id = ref(0);
  if (!(await inventoryGetInputForItemId(item_id, 'Use which staff?', item_pos_start.v, item_pos_end.v, null, null))) {
    return;
  }

  // From here on player uses up a turn
  game.player_free_turn = false;

  const item = py.inventory[item_id.v];

  if (!(await staffPlayerCanUse(item))) {
    return;
  }

  const identified = await staffDischarge(item);

  if (identified) {
    if (!itemSetColorlessAsIdentified(item.category_id, item.sub_category_id, item.identification)) {
      // round half-way case up
      py.misc.exp += idiv(item.depth_first_found + (py.misc.level >> 1), py.misc.level);

      await displayCharacterExperience();

      await itemIdentify(py.inventory[item_id.v], item_id);
    }
  } else if (!itemSetColorlessAsIdentified(item.category_id, item.sub_category_id, item.identification)) {
    itemSetAsTried(item);
  }

  await itemChargesRemainingDescription(item_id.v);
}

// enum class WandSpellTypes
const WandSpellTypes = {
  WandLight: 1, // TODO: name would clash with PlayerEquipment::Light
  LightningBolt: 2,
  FrostBolt: 3,
  FireBolt: 4,
  StoneToMud: 5,
  Polymorph: 6,
  HealMonster: 7,
  HasteMonster: 8,
  SlowMonster: 9,
  ConfuseMonster: 10,
  SleepMonster: 11,
  DrainLife: 12,
  TrapDoorDestruction: 13,
  WandMagicMissile: 14, // TODO: name would clash with MagicSpellFlags::MagicMissile
  WallBuilding: 15,
  CloneMonster: 16,
  TeleportAway: 17,
  Disarming: 18,
  LightningBall: 19,
  ColdBall: 20,
  FireBall: 21,
  StinkingCloud: 22,
  AcidBall: 23,
  Wonder: 24,
} as const;

async function wandDischarge(item: Inventory_t, direction: number): Promise<boolean> {
  // decrement "use" variable
  item.misc_use--;

  let identified = false;
  const flags = ref(item.flags);

  const coord: Coord_t = { y: 0, x: 0 };

  while (flags.v !== 0) {
    coord.y = py.pos.y;
    coord.x = py.pos.x;

    // Wand types
    switch (getAndClearFirstBit(flags) + 1) {
      case WandSpellTypes.WandLight:
        await printMessage('A line of blue shimmering light appears.');
        await spellLightLine(py.pos, direction);
        identified = true;
        break;
      case WandSpellTypes.LightningBolt:
        await spellFireBolt(coord, direction, diceRoll({ dice: 4, sides: 8 }), MagicSpellFlags.Lightning, spell_names[8]);
        identified = true;
        break;
      case WandSpellTypes.FrostBolt:
        await spellFireBolt(coord, direction, diceRoll({ dice: 6, sides: 8 }), MagicSpellFlags.Frost, spell_names[14]);
        identified = true;
        break;
      case WandSpellTypes.FireBolt:
        await spellFireBolt(coord, direction, diceRoll({ dice: 9, sides: 8 }), MagicSpellFlags.Fire, spell_names[22]);
        identified = true;
        break;
      case WandSpellTypes.StoneToMud:
        identified = await spellWallToMud(coord, direction);
        break;
      case WandSpellTypes.Polymorph:
        identified = await spellPolymorphMonster(coord, direction);
        break;
      case WandSpellTypes.HealMonster:
        identified = await spellChangeMonsterHitPoints(coord, direction, -diceRoll({ dice: 4, sides: 6 }));
        break;
      case WandSpellTypes.HasteMonster:
        identified = await spellSpeedMonster(coord, direction, 1);
        break;
      case WandSpellTypes.SlowMonster:
        identified = await spellSpeedMonster(coord, direction, -1);
        break;
      case WandSpellTypes.ConfuseMonster:
        identified = await spellConfuseMonster(coord, direction);
        break;
      case WandSpellTypes.SleepMonster:
        identified = await spellSleepMonster(coord, direction);
        break;
      case WandSpellTypes.DrainLife:
        identified = await spellDrainLifeFromMonster(coord, direction);
        break;
      case WandSpellTypes.TrapDoorDestruction:
        identified = await spellDestroyDoorsTrapsInDirection(coord, direction);
        break;
      case WandSpellTypes.WandMagicMissile:
        await spellFireBolt(coord, direction, diceRoll({ dice: 2, sides: 6 }), MagicSpellFlags.MagicMissile, spell_names[0]);
        identified = true;
        break;
      case WandSpellTypes.WallBuilding:
        identified = await spellBuildWall(coord, direction);
        break;
      case WandSpellTypes.CloneMonster:
        identified = await spellCloneMonster(coord, direction);
        break;
      case WandSpellTypes.TeleportAway:
        identified = await spellTeleportAwayMonsterInDirection(coord, direction);
        break;
      case WandSpellTypes.Disarming:
        identified = await spellDisarmAllInDirection(coord, direction);
        break;
      case WandSpellTypes.LightningBall:
        await spellFireBall(coord, direction, 32, MagicSpellFlags.Lightning, 'Lightning Ball');
        identified = true;
        break;
      case WandSpellTypes.ColdBall:
        await spellFireBall(coord, direction, 48, MagicSpellFlags.Frost, 'Cold Ball');
        identified = true;
        break;
      case WandSpellTypes.FireBall:
        await spellFireBall(coord, direction, 72, MagicSpellFlags.Fire, spell_names[28]);
        identified = true;
        break;
      case WandSpellTypes.StinkingCloud:
        await spellFireBall(coord, direction, 12, MagicSpellFlags.PoisonGas, spell_names[6]);
        identified = true;
        break;
      case WandSpellTypes.AcidBall:
        await spellFireBall(coord, direction, 60, MagicSpellFlags.Acid, 'Acid Ball');
        identified = true;
        break;
      case WandSpellTypes.Wonder:
        flags.v = (1 << (randomNumber(23) - 1)) >>> 0;
        break;
      default:
        // All cases are handled, so this should never be reached!
        await printMessage('Internal error in wands()');
        break;
    }
  }

  return identified;
}

// Wands for the aiming.
export async function wandAim(): Promise<void> {
  game.player_free_turn = true;

  if (py.pack.unique_items === 0) {
    await printMessage('But you are not carrying anything.');
    return;
  }

  const item_pos_start = ref(0);
  const item_pos_end = ref(0);
  if (!inventoryFindRange(TV_WAND, TV_NEVER, item_pos_start, item_pos_end)) {
    await printMessage('You are not carrying any wands.');
    return;
  }

  const item_id = ref(0);
  if (!(await inventoryGetInputForItemId(item_id, 'Aim which wand?', item_pos_start.v, item_pos_end.v, null, null))) {
    return;
  }

  game.player_free_turn = false;

  const direction = ref(0);
  if (!(await getDirectionWithMemory(null, direction))) {
    return;
  }

  if (py.flags.confused > 0) {
    await printMessage('You are confused.');
    direction.v = getRandomDirection();
  }

  const item = py.inventory[item_id.v];

  const player_class_lev_adj = idiv(class_level_adj[py.misc.class_id][PlayerClassLevelAdj.DEVICE] * py.misc.level, 3);
  let chance = py.misc.saving_throw + playerStatAdjustmentWisdomIntelligence(PlayerAttr.A_INT) - item.depth_first_found + player_class_lev_adj;

  if (py.flags.confused > 0) {
    chance = idiv(chance, 2);
  }

  if (chance < config.player.PLAYER_USE_DEVICE_DIFFICULTY && randomNumber(config.player.PLAYER_USE_DEVICE_DIFFICULTY - chance + 1) === 1) {
    chance = config.player.PLAYER_USE_DEVICE_DIFFICULTY; // Give everyone a slight chance
  }

  if (chance <= 0) {
    chance = 1;
  }

  if (randomNumber(chance) < config.player.PLAYER_USE_DEVICE_DIFFICULTY) {
    await printMessage('You failed to use the wand properly.');
    return;
  }

  if (item.misc_use < 1) {
    await printMessage('The wand has no charges left.');
    if (!spellItemIdentified(item)) {
      itemAppendToInscription(item, config.identification.ID_EMPTY);
    }
    return;
  }

  const identified = await wandDischarge(item, direction.v);

  if (identified) {
    if (!itemSetColorlessAsIdentified(item.category_id, item.sub_category_id, item.identification)) {
      // round half-way case up
      py.misc.exp += idiv(item.depth_first_found + (py.misc.level >> 1), py.misc.level);
      await displayCharacterExperience();

      await itemIdentify(py.inventory[item_id.v], item_id);
    }
  } else if (!itemSetColorlessAsIdentified(item.category_id, item.sub_category_id, item.identification)) {
    itemSetAsTried(item);
  }

  await itemChargesRemainingDescription(item_id.v);
}
