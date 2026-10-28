// monster.cpp: Handle monster movement and attacks
//
// hack_monptr ("A horrible hack, needed because compactMonsters() is called from deep within
// updateMonsters() via monsterPlaceNew() and monsterSummon().") is globals.hack_monptr.
import { config } from './config.ts';
import {
  MagicSpellFlags, MAX_HEIGHT, MAX_OPEN_SPACE, MAX_WIDTH, MIN_CAVE_WALL, MON_MAX_ATTACKS, MON_MAX_LEVELS, PlayerAttr, SHRT_MAX,
  TILE_BOUNDARY_WALL, TILE_CORR_FLOOR, TV_CLOSED_DOOR, TV_FOOD, TV_MAX_OBJECT, TV_NEVER, TV_SECRET_DOOR, TV_VIS_TRAP, UCHAR_MAX,
} from './constants.ts';
import { type Creature_t, creatures_list, monster_attacks } from './data_creatures.ts';
import { diceRoll } from './dice.ts';
import {
  coordDistanceBetween, coordInBounds, dungeonDeleteMonster, dungeonDeleteMonsterRecord, dungeonDeleteObject, dungeonLiteSpot,
  dungeonMoveCreatureRecord, dungeonRemoveMonsterFromLevel, dungeonSummonObject,
} from './dungeon.ts';
import { los } from './dungeon_los.ts';
import { randomNumber } from './game.ts';
import { creature_recall, dg, game, globals, monsters, py } from './globals.ts';
import { getAndClearFirstBit } from './helpers.ts';
import {
  damageAcid, damageCold, damageCorrodingGas, damageFire, damageLightningBolt, executeDisenchantAttack, inventoryDestroyItem,
  inventoryDiminishChargesAttack, inventoryDiminishLightAttack, inventoryFindRange, inventoryItemCopyTo,
} from './inventory.ts';
import { abs, idiv, ref, type Ref, sprintf } from './libc.ts';
import { monsterPlaceNew, monsterSummon, monsterSummonUndead } from './monster_manager.ts';
import {
  playerDiedFromString, playerDisturb, playerGainKillExperience, playerMovePosition, playerRecalculateBonuses, playerSavingThrow,
  playerTakesHit, playerTestAttackHits, playerTunnelWall,
} from './player.ts';
import { playerStatRandomDecrease } from './player_stats.ts';
import { spellAggravateMonsters, spellBreath, spellLoseEXP, spellTeleportAwayMonster, spellTeleportPlayerTo } from './spells.ts';
import type { Coord_t, Monster_t, Tile_t } from './structs.ts';
import { coordInsidePanel, displayCharacterExperience, printCharacterCurrentMana, printCharacterGoldValue, printCharacterWinner } from './ui.ts';
import { printMessage } from './ui_io.ts';

function monsterIsVisible(monster: Monster_t): boolean {
  let visible = false;

  const tile = dg.floor[monster.pos.y][monster.pos.x];
  const creature = creatures_list[monster.creature_id];

  if (tile.permanent_light || tile.temporary_light || (py.running_tracker !== 0 && monster.distance_from_player < 2 && py.carrying_light)) {
    // Normal sight.
    if ((creature.movement & config.monsters.move.CM_INVISIBLE) === 0) {
      visible = true;
    } else if (py.flags.see_invisible) {
      visible = true;
      creature_recall[monster.creature_id].movement |= config.monsters.move.CM_INVISIBLE;
    }
  } else if (py.flags.see_infra > 0 && monster.distance_from_player <= py.flags.see_infra && (creature.defenses & config.monsters.defense.CD_INFRA) !== 0) {
    // Infra vision.
    visible = true;
    creature_recall[monster.creature_id].defenses |= config.monsters.defense.CD_INFRA;
  }

  return visible;
}

// Updates screen when monsters move about -RAK-
export async function monsterUpdateVisibility(monster_id: number): Promise<void> {
  let visible = false;
  const monster = monsters[monster_id];

  if (monster.distance_from_player <= config.monsters.MON_MAX_SIGHT && (py.flags.status & config.player.status.PY_BLIND) === 0 &&
    coordInsidePanel({ y: monster.pos.y, x: monster.pos.x })) {
    if (game.wizard_mode) {
      // Wizard sight.
      visible = true;
    } else if (los(py.pos, monster.pos)) {
      visible = monsterIsVisible(monster);
    }
  }

  if (visible) {
    // Light it up.
    if (!monster.lit) {
      await playerDisturb(1, 0);
      monster.lit = true;
      dungeonLiteSpot({ y: monster.pos.y, x: monster.pos.x });

      // notify inventoryExecuteCommand()
      globals.screen_has_changed = true;
    }
  } else if (monster.lit) {
    // Turn it off.
    monster.lit = false;
    dungeonLiteSpot({ y: monster.pos.y, x: monster.pos.x });

    // notify inventoryExecuteCommand()
    globals.screen_has_changed = true;
  }
}

// Given speed, returns number of moves this turn. -RAK-
// NOTE: Player must always move at least once per iteration,
// a slowed player is handled by moving monsters faster
function monsterMovementRate(speed: number): number {
  if (speed > 0) {
    if (py.flags.rest !== 0) {
      return 1;
    }
    return speed;
  }

  // speed must be negative here
  let rate = 0;
  if (dg.game_turn % (2 - speed) === 0) {
    rate = 1;
  }

  return rate;
}

// Makes sure a new creature gets lit up. -CJS-
async function monsterMakeVisible(coord: Coord_t): Promise<boolean> {
  const monster_id = dg.floor[coord.y][coord.x].creature_id;
  if (monster_id <= 1) {
    return false;
  }

  await monsterUpdateVisibility(monster_id);
  return monsters[monster_id].lit;
}

// Choose correct directions for monster movement -RAK-
function monsterGetMoveDirection(monster_id: number, directions: number[]): void {
  let ay: number;
  let ax: number;
  let movement: number;

  const y = monsters[monster_id].pos.y - py.pos.y;
  const x = monsters[monster_id].pos.x - py.pos.x;

  if (y < 0) {
    movement = 8;
    ay = -y;
  } else {
    movement = 0;
    ay = y;
  }
  if (x > 0) {
    movement += 4;
    ax = x;
  } else {
    ax = -x;
  }

  // this has the advantage of preventing the diamond maneuver, also faster
  if (ay > ax << 1) {
    movement += 2;
  } else if (ax > ay << 1) {
    movement++;
  }

  switch (movement) {
    case 0:
      directions[0] = 9;
      if (ay > ax) {
        directions[1] = 8;
        directions[2] = 6;
        directions[3] = 7;
        directions[4] = 3;
      } else {
        directions[1] = 6;
        directions[2] = 8;
        directions[3] = 3;
        directions[4] = 7;
      }
      break;
    case 1:
    case 9:
      directions[0] = 6;
      if (y < 0) {
        directions[1] = 3;

        directions[2] = 9;
        directions[3] = 2;
        directions[4] = 8;
      } else {
        directions[1] = 9;
        directions[2] = 3;
        directions[3] = 8;
        directions[4] = 2;
      }
      break;
    case 2:
    case 6:
      directions[0] = 8;
      if (x < 0) {
        directions[1] = 9;
        directions[2] = 7;
        directions[3] = 6;
        directions[4] = 4;
      } else {
        directions[1] = 7;
        directions[2] = 9;
        directions[3] = 4;
        directions[4] = 6;
      }
      break;
    case 4:
      directions[0] = 7;
      if (ay > ax) {
        directions[1] = 8;
        directions[2] = 4;
        directions[3] = 9;
        directions[4] = 1;
      } else {
        directions[1] = 4;
        directions[2] = 8;
        directions[3] = 1;
        directions[4] = 9;
      }
      break;
    case 5:
    case 13:
      directions[0] = 4;
      if (y < 0) {
        directions[1] = 1;
        directions[2] = 7;
        directions[3] = 2;
        directions[4] = 8;
      } else {
        directions[1] = 7;
        directions[2] = 1;
        directions[3] = 8;
        directions[4] = 2;
      }
      break;
    case 8:
      directions[0] = 3;
      if (ay > ax) {
        directions[1] = 2;
        directions[2] = 6;
        directions[3] = 1;
        directions[4] = 9;
      } else {
        directions[1] = 6;
        directions[2] = 2;
        directions[3] = 9;
        directions[4] = 1;
      }
      break;
    case 10:
    case 14:
      directions[0] = 2;
      if (x < 0) {
        directions[1] = 3;
        directions[2] = 1;
        directions[3] = 6;
        directions[4] = 4;
      } else {
        directions[1] = 1;
        directions[2] = 3;
        directions[3] = 4;
        directions[4] = 6;
      }
      break;
    case 12:
      directions[0] = 1;
      if (ay > ax) {
        directions[1] = 2;
        directions[2] = 4;
        directions[3] = 3;
        directions[4] = 7;
      } else {
        directions[1] = 4;
        directions[2] = 2;
        directions[3] = 7;
        directions[4] = 3;
      }
      break;
    default:
      break;
  }
}

// The C code strcat()s the text to the caller's buffer `msg` and prints it; the caller never reads
// its buffer again.
async function monsterPrintAttackDescription(msg: string, attack_id: number): Promise<void> {
  switch (attack_id) {
    case 1:
      await printMessage(msg + 'hits you.');
      break;
    case 2:
      await printMessage(msg + 'bites you.');
      break;
    case 3:
      await printMessage(msg + 'claws you.');
      break;
    case 4:
      await printMessage(msg + 'stings you.');
      break;
    case 5:
      await printMessage(msg + 'touches you.');
      break;
    // #if 0
    // case 6:
    //     msg_print(strcat(msg, "kicks you."));
    //     break;
    // #endif
    case 7:
      await printMessage(msg + 'gazes at you.');
      break;
    case 8:
      await printMessage(msg + 'breathes on you.');
      break;
    case 9:
      await printMessage(msg + 'spits on you.');
      break;
    case 10:
      await printMessage(msg + 'makes a horrible wail.');
      break;
    // #if 0
    // case 11:
    //     msg_print(strcat(msg, "embraces you."));
    //     break;
    // #endif
    case 12:
      await printMessage(msg + 'crawls on you.');
      break;
    case 13:
      await printMessage(msg + 'releases a cloud of spores.');
      break;
    case 14:
      await printMessage(msg + 'begs you for money.');
      break;
    case 15:
      await printMessage("You've been slimed!");
      break;
    case 16:
      await printMessage(msg + 'crushes you.');
      break;
    case 17:
      await printMessage(msg + 'tramples you.');
      break;
    case 18:
      await printMessage(msg + 'drools on you.');
      break;
    case 19:
      switch (randomNumber(9)) {
        case 1:
          await printMessage(msg + 'insults you!');
          break;
        case 2:
          await printMessage(msg + 'insults your mother!');
          break;
        case 3:
          await printMessage(msg + 'gives you the finger!');
          break;
        case 4:
          await printMessage(msg + 'humiliates you!');
          break;
        case 5:
          await printMessage(msg + 'wets on your leg!');
          break;
        case 6:
          await printMessage(msg + 'defiles you!');
          break;
        case 7:
          await printMessage(msg + 'dances around you!');
          break;
        case 8:
          await printMessage(msg + 'makes obscene gestures!');
          break;
        case 9:
          await printMessage(msg + 'moons you!!!');
          break;
        default:
          break;
      }
      break;
    case 99:
      await printMessage(msg + 'is repelled.');
      break;
    default:
      break;
  }
}

async function monsterConfuseOnAttack(creature: Creature_t, monster: Monster_t, attack_type: number, monster_name: string, visible: boolean): Promise<void> {
  if (py.flags.confuse_monster && attack_type !== 99) {
    await printMessage('Your hands stop glowing.');
    py.flags.confuse_monster = false;

    let msg: string;

    if (randomNumber(MON_MAX_LEVELS) < creature.level || (creature.defenses & config.monsters.defense.CD_NO_SLEEP) !== 0) {
      msg = sprintf('%sis unaffected.', monster_name);
    } else {
      msg = sprintf('%sappears confused.', monster_name);
      if (monster.confused_amount !== 0) {
        monster.confused_amount += 3;
      } else {
        monster.confused_amount = 2 + randomNumber(16);
      }
    }

    await printMessage(msg);

    if (visible && !game.character_is_dead && randomNumber(4) === 1) {
      creature_recall[monster.creature_id].defenses |= creature.defenses & config.monsters.defense.CD_NO_SLEEP;
    }
  }
}

// Make an attack on the player (chuckle.) -RAK-
async function monsterAttackPlayer(monster_id: number): Promise<void> {
  // don't beat a dead body!
  if (game.character_is_dead) {
    return;
  }

  const monster = monsters[monster_id];
  const creature = creatures_list[monster.creature_id];

  let name: string;
  if (!monster.lit) {
    name = 'It ';
  } else {
    name = sprintf('The %s ', creature.name);
  }

  const death_description = ref('');
  playerDiedFromString(death_description, creature.name, creature.movement);

  // monster.hp as the C++ reference (int16_t &monster_hp) executeAttackOnPlayer() gets
  const monster_hp: Ref<number> = {
    get v(): number { return monster.hp; },
    set v(value: number) { monster.hp = value; },
  };

  let attack_counter = 0;
  for (const damage_type_id of creature.damage) {
    if (damage_type_id === 0 || game.character_is_dead) {
      break;
    }

    let attack_type = monster_attacks[damage_type_id].type_id;
    let attack_desc = monster_attacks[damage_type_id].description_id;
    const dice = monster_attacks[damage_type_id].dice;

    if (py.flags.protect_evil > 0 && (creature.defenses & config.monsters.defense.CD_EVIL) !== 0 && py.misc.level + 1 > creature.level) {
      if (monster.lit) {
        creature_recall[monster.creature_id].defenses |= config.monsters.defense.CD_EVIL;
      }
      attack_type = 99;
      attack_desc = 99;
    }

    if (await playerTestAttackHits(attack_type, creature.level)) {
      await playerDisturb(1, 0);

      // can not strcat to name because the creature may have multiple attacks.
      const description = name;
      await monsterPrintAttackDescription(description, attack_desc);

      // always fail to notice attack if creature invisible, set notice
      // and visible here since creature may be visible when attacking
      // and then teleport afterwards (becoming effectively invisible)
      let notice = true;
      let visible = true;
      if (!monster.lit) {
        visible = false;
        notice = false;
      }

      const damage = diceRoll(dice);
      notice = await executeAttackOnPlayer(creature.level, monster_hp, monster_id, attack_type, damage, death_description.v, notice);

      // Moved here from monsterMove, so that monster only confused if it
      // actually hits. A monster that has been repelled has not hit
      // the player, so it should not be confused.
      await monsterConfuseOnAttack(creature, monster, attack_desc, name, visible);

      // increase number of attacks if notice true, or if visible and
      // had previously noticed the attack (in which case all this does
      // is help player learn damage), note that in the second case do
      // not increase attacks if creature repelled (no damage done)
      if ((notice || (visible && creature_recall[monster.creature_id].attacks[attack_counter] !== 0 && attack_type !== 99)) &&
        creature_recall[monster.creature_id].attacks[attack_counter] < UCHAR_MAX) {
        creature_recall[monster.creature_id].attacks[attack_counter]++;
      }

      if (game.character_is_dead && creature_recall[monster.creature_id].deaths < SHRT_MAX) {
        creature_recall[monster.creature_id].deaths++;
      }
    } else {
      if ((attack_desc >= 1 && attack_desc <= 3) || attack_desc === 6) {
        await playerDisturb(1, 0);

        const description = name;
        await printMessage(description + 'misses you.');
      }
    }

    if (attack_counter < MON_MAX_ATTACKS - 1) {
      attack_counter++;
    } else {
      break;
    }
  }
}

async function monsterOpenDoor(tile: Tile_t, monster_hp: number, move_bits: number, do_turn: Ref<boolean>, do_move: Ref<boolean>, rcmove: Ref<number>, coord: Coord_t): Promise<void> {
  const item = game.treasure.list[tile.treasure_id];

  // Creature can open doors.
  if ((move_bits & config.monsters.move.CM_OPEN_DOOR) !== 0) {
    let door_is_stuck = false;

    if (item.category_id === TV_CLOSED_DOOR) {
      do_turn.v = true;

      if (item.misc_use === 0) {
        // Closed doors

        do_move.v = true;
      } else if (item.misc_use > 0) {
        // Locked doors

        if (randomNumber((monster_hp + 1) * (50 + item.misc_use)) < 40 * (monster_hp - 10 - item.misc_use)) {
          item.misc_use = 0;
        }
      } else if (item.misc_use < 0) {
        // Stuck doors

        if (randomNumber((monster_hp + 1) * (50 - item.misc_use)) < 40 * (monster_hp - 10 + item.misc_use)) {
          await printMessage('You hear a door burst open!');
          await playerDisturb(1, 0);
          door_is_stuck = true;
          do_move.v = true;
        }
      }
    } else if (item.category_id === TV_SECRET_DOOR) {
      do_turn.v = true;
      do_move.v = true;
    }

    if (do_move.v) {
      inventoryItemCopyTo(config.dungeon.objects.OBJ_OPEN_DOOR, item);

      // 50% chance of breaking door
      if (door_is_stuck) {
        item.misc_use = 1 - randomNumber(2);
      }
      tile.feature_id = TILE_CORR_FLOOR;
      dungeonLiteSpot(coord);
      rcmove.v = (rcmove.v | config.monsters.move.CM_OPEN_DOOR) >>> 0;
      do_move.v = false;
    }
  } else if (item.category_id === TV_CLOSED_DOOR) {
    // Creature can not open doors, must bash them
    do_turn.v = true;

    const abs_misc_use = abs(item.misc_use);
    if (randomNumber((monster_hp + 1) * (80 + abs_misc_use)) < 40 * (monster_hp - 20 - abs_misc_use)) {
      inventoryItemCopyTo(config.dungeon.objects.OBJ_OPEN_DOOR, item);

      // 50% chance of breaking door
      item.misc_use = 1 - randomNumber(2);
      tile.feature_id = TILE_CORR_FLOOR;
      dungeonLiteSpot(coord);
      await printMessage('You hear a door burst open!');
      await playerDisturb(1, 0);
    }
  }
}

async function glyphOfWardingProtection(creature_id: number, move_bits: number, do_move: Ref<boolean>, do_turn: Ref<boolean>, coord: Coord_t): Promise<void> {
  if (randomNumber(config.treasure.OBJECTS_RUNE_PROTECTION) < creatures_list[creature_id].level) {
    if (coord.y === py.pos.y && coord.x === py.pos.x) {
      await printMessage('The rune of protection is broken!');
    }
    dungeonDeleteObject(coord);
    return;
  }

  do_move.v = false;

  // If the creature moves only to attack, don't let it
  // move if the glyph prevents it from attacking
  if ((move_bits & config.monsters.move.CM_ATTACK_ONLY) !== 0) {
    do_turn.v = true;
  }
}

async function monsterMovesOnPlayer(monster: Monster_t, creature_id: number, monster_id: number, move_bits: number, do_move: Ref<boolean>, do_turn: Ref<boolean>, rcmove: Ref<number>, coord: Coord_t): Promise<void> {
  if (creature_id === 1) {
    // if the monster is not lit, must call monsterUpdateVisibility, it
    // may be faster than character, and hence could have
    // just moved next to character this same turn.
    if (!monster.lit) {
      await monsterUpdateVisibility(monster_id);
    }
    await monsterAttackPlayer(monster_id);
    do_move.v = false;
    do_turn.v = true;
  } else if (creature_id > 1 && (coord.y !== monster.pos.y || coord.x !== monster.pos.x)) {
    // Creature is attempting to move on other creature?

    // Creature eats other creatures?
    if ((move_bits & config.monsters.move.CM_EATS_OTHER) !== 0 &&
      creatures_list[monster.creature_id].kill_exp_value >= creatures_list[monsters[creature_id].creature_id].kill_exp_value) {
      if (monsters[creature_id].lit) {
        rcmove.v = (rcmove.v | config.monsters.move.CM_EATS_OTHER) >>> 0;
      }

      // It ate an already processed monster. Handle normally.
      if (monster_id < creature_id) {
        dungeonDeleteMonster(creature_id);
      } else {
        // If it eats this monster, an already processed
        // monster will take its place, causing all kinds
        // of havoc. Delay the kill a bit.
        dungeonRemoveMonsterFromLevel(creature_id);
      }
    } else {
      do_move.v = false;
    }
  }
}

function monsterAllowedToMove(monster: Monster_t, move_bits: number, do_turn: Ref<boolean>, rcmove: Ref<number>, coord: Coord_t): void {
  // Pick up or eat an object
  if ((move_bits & config.monsters.move.CM_PICKS_UP) !== 0) {
    const treasure_id = dg.floor[coord.y][coord.x].treasure_id;

    if (treasure_id !== 0 && game.treasure.list[treasure_id].category_id <= TV_MAX_OBJECT) {
      rcmove.v = (rcmove.v | config.monsters.move.CM_PICKS_UP) >>> 0;
      dungeonDeleteObject(coord);
    }
  }

  // Move creature record
  dungeonMoveCreatureRecord({ y: monster.pos.y, x: monster.pos.x }, coord);

  if (monster.lit) {
    monster.lit = false;
    dungeonLiteSpot({ y: monster.pos.y, x: monster.pos.x });
  }

  monster.pos.y = coord.y;
  monster.pos.x = coord.x;
  monster.distance_from_player = coordDistanceBetween(py.pos, coord);

  do_turn.v = true;
}

// Make the move if possible, five choices -RAK-
async function makeMove(monster_id: number, directions: number[], rcmove: Ref<number>): Promise<void> {
  const do_turn = ref(false);
  const do_move = ref(false);

  const monster = monsters[monster_id];
  const move_bits = creatures_list[monster.creature_id].movement;

  // Up to 5 attempts at moving, give up.
  const coord = { y: 0, x: 0 };
  for (let i = 0; !do_turn.v && i < 5; i++) {
    // Get new position
    coord.y = monster.pos.y;
    coord.x = monster.pos.x;

    playerMovePosition(directions[i], coord);

    const tile = dg.floor[coord.y][coord.x];

    if (tile.feature_id === TILE_BOUNDARY_WALL) {
      continue;
    }

    // Floor is open?
    if (tile.feature_id <= MAX_OPEN_SPACE) {
      do_move.v = true;
    } else if ((move_bits & config.monsters.move.CM_PHASE) !== 0) {
      // Creature moves through walls?
      do_move.v = true;
      rcmove.v = (rcmove.v | config.monsters.move.CM_PHASE) >>> 0;
    } else if (tile.treasure_id !== 0) {
      // Creature can open doors?
      await monsterOpenDoor(tile, monster.hp, move_bits, do_turn, do_move, rcmove, coord);
    }

    // Glyph of warding present?
    if (do_move.v && tile.treasure_id !== 0 && game.treasure.list[tile.treasure_id].category_id === TV_VIS_TRAP && game.treasure.list[tile.treasure_id].sub_category_id === 99) {
      await glyphOfWardingProtection(monster.creature_id, move_bits, do_move, do_turn, coord);
    }

    // Creature has attempted to move on player?
    if (do_move.v) {
      await monsterMovesOnPlayer(monster, tile.creature_id, monster_id, move_bits, do_move, do_turn, rcmove, coord);
    }

    // Creature has been allowed move.
    if (do_move.v) {
      monsterAllowedToMove(monster, move_bits, do_turn, rcmove, coord);
    }
  }
}

function monsterCanCastSpells(monster: Monster_t, spells: number): boolean {
  // 1 in x chance of casting spell
  if (randomNumber(spells & config.monsters.spells.CS_FREQ) !== 1) {
    return false;
  }

  // Must be within certain range
  const within_range = monster.distance_from_player <= config.monsters.MON_MAX_SPELL_CAST_DISTANCE;

  // Must have unobstructed Line-Of-Sight
  const unobstructed = los(py.pos, monster.pos);

  return within_range && unobstructed;
}

// (not static in the C++, but declared in no header: only monsterCastSpell() calls it)
async function monsterExecuteCastingOfSpell(monster: Monster_t, monster_id: number, spell_id: number, level: number, monster_name: string, death_description: string): Promise<void> {
  const coord = { y: py.pos.y, x: py.pos.x }; //  only used for cases 14 and 15.

  // Cast the spell.
  switch (spell_id) {
    case 5: // Teleport Short
      await spellTeleportAwayMonster(monster_id, 5);
      break;
    case 6: // Teleport Long
      await spellTeleportAwayMonster(monster_id, config.monsters.MON_MAX_SIGHT);
      break;
    case 7: // Teleport To
      await spellTeleportPlayerTo({ y: monster.pos.y, x: monster.pos.x });
      break;
    case 8: // Light Wound
      if (playerSavingThrow()) {
        await printMessage('You resist the effects of the spell.');
      } else {
        playerTakesHit(diceRoll({ dice: 3, sides: 8 }), death_description);
      }
      break;
    case 9: // Serious Wound
      if (playerSavingThrow()) {
        await printMessage('You resist the effects of the spell.');
      } else {
        playerTakesHit(diceRoll({ dice: 8, sides: 8 }), death_description);
      }
      break;
    case 10: // Hold Person
      if (py.flags.free_action) {
        await printMessage('You are unaffected.');
      } else if (playerSavingThrow()) {
        await printMessage('You resist the effects of the spell.');
      } else if (py.flags.paralysis > 0) {
        py.flags.paralysis += 2;
      } else {
        py.flags.paralysis = randomNumber(5) + 4;
      }
      break;
    case 11: // Cause Blindness
      if (playerSavingThrow()) {
        await printMessage('You resist the effects of the spell.');
      } else if (py.flags.blind > 0) {
        py.flags.blind += 6;
      } else {
        py.flags.blind += 12 + randomNumber(3);
      }
      break;
    case 12: // Cause Confuse
      if (playerSavingThrow()) {
        await printMessage('You resist the effects of the spell.');
      } else if (py.flags.confused > 0) {
        py.flags.confused += 2;
      } else {
        py.flags.confused = randomNumber(5) + 3;
      }
      break;
    case 13: // Cause Fear
      if (playerSavingThrow()) {
        await printMessage('You resist the effects of the spell.');
      } else if (py.flags.afraid > 0) {
        py.flags.afraid += 2;
      } else {
        py.flags.afraid = randomNumber(5) + 3;
      }
      break;
    case 14: // Summon Monster
      monster_name += 'magically summons a monster!';
      await printMessage(monster_name);
      coord.y = py.pos.y;
      coord.x = py.pos.x;

      // in case compact_monster() is called,it needs monster_id
      globals.hack_monptr = monster_id;
      await monsterSummon(coord, false);
      globals.hack_monptr = -1;
      await monsterUpdateVisibility(dg.floor[coord.y][coord.x].creature_id);
      break;
    case 15: // Summon Undead
      monster_name += 'magically summons an undead!';
      await printMessage(monster_name);
      coord.y = py.pos.y;
      coord.x = py.pos.x;

      // in case compact_monster() is called,it needs monster_id
      globals.hack_monptr = monster_id;
      await monsterSummonUndead(coord);
      globals.hack_monptr = -1;
      await monsterUpdateVisibility(dg.floor[coord.y][coord.x].creature_id);
      break;
    case 16: // Slow Person
      if (py.flags.free_action) {
        await printMessage('You are unaffected.');
      } else if (playerSavingThrow()) {
        await printMessage('You resist the effects of the spell.');
      } else if (py.flags.slow > 0) {
        py.flags.slow += 2;
      } else {
        py.flags.slow = randomNumber(5) + 3;
      }
      break;
    case 17: // Drain Mana
      if (py.misc.current_mana > 0) {
        await playerDisturb(1, 0);

        let msg = sprintf('%sdraws psychic energy from you!', monster_name);
        await printMessage(msg);

        if (monster.lit) {
          msg = sprintf('%sappears healthier.', monster_name);
          await printMessage(msg);
        }

        let num = (randomNumber(level) >> 1) + 1;
        if (num > py.misc.current_mana) {
          num = py.misc.current_mana;
          py.misc.current_mana = 0;
          py.misc.current_mana_fraction = 0;
        } else {
          py.misc.current_mana -= num;
        }
        printCharacterCurrentMana();
        monster.hp += 6 * num;
      }
      break;
    case 20: // Breath Light
      monster_name += 'breathes lightning.';
      await printMessage(monster_name);
      await spellBreath({ y: py.pos.y, x: py.pos.x }, monster_id, idiv(monster.hp, 4), MagicSpellFlags.Lightning, death_description);
      break;
    case 21: // Breath Gas
      monster_name += 'breathes gas.';
      await printMessage(monster_name);
      await spellBreath({ y: py.pos.y, x: py.pos.x }, monster_id, idiv(monster.hp, 3), MagicSpellFlags.PoisonGas, death_description);
      break;
    case 22: // Breath Acid
      monster_name += 'breathes acid.';
      await printMessage(monster_name);
      await spellBreath({ y: py.pos.y, x: py.pos.x }, monster_id, idiv(monster.hp, 3), MagicSpellFlags.Acid, death_description);
      break;
    case 23: // Breath Frost
      monster_name += 'breathes frost.';
      await printMessage(monster_name);
      await spellBreath({ y: py.pos.y, x: py.pos.x }, monster_id, idiv(monster.hp, 3), MagicSpellFlags.Frost, death_description);
      break;
    case 24: // Breath Fire
      monster_name += 'breathes fire.';
      await printMessage(monster_name);
      await spellBreath({ y: py.pos.y, x: py.pos.x }, monster_id, idiv(monster.hp, 3), MagicSpellFlags.Fire, death_description);
      break;
    default:
      monster_name += 'cast unknown spell.';
      await printMessage(monster_name);
  }
}

// Creatures can cast spells too.  (Dragon Breath) -RAK-
//   castSpellGetId = true if creature changes position
//   return true (took_turn) if creature casts a spell
async function monsterCastSpell(monster_id: number): Promise<boolean> {
  if (game.character_is_dead) {
    return false;
  }

  const monster = monsters[monster_id];
  const creature = creatures_list[monster.creature_id];

  if (!monsterCanCastSpells(monster, creature.spells)) {
    return false;
  }

  // Creature is going to cast a spell

  // Check to see if monster should be lit.
  await monsterUpdateVisibility(monster_id);

  // Describe the attack
  let name: string;
  if (monster.lit) {
    name = sprintf('The %s ', creature.name);
  } else {
    name = 'It ';
  }

  const death_description = ref('');
  playerDiedFromString(death_description, creature.name, creature.movement);

  // Extract all possible spells into spell_choice
  const spell_choice: number[] = new Array<number>(30).fill(0);
  const spell_flags = ref((creature.spells & ~config.monsters.spells.CS_FREQ) >>> 0);

  let id = 0;
  while (spell_flags.v !== 0) {
    spell_choice[id] = getAndClearFirstBit(spell_flags);
    id++;
  }

  // Choose a spell to cast
  let thrown_spell = spell_choice[randomNumber(id) - 1];
  thrown_spell++;

  // all except spellTeleportAwayMonster() and drain mana spells always disturb
  if (thrown_spell > 6 && thrown_spell !== 17) {
    await playerDisturb(1, 0);
  }

  // save some code/data space here, with a small time penalty
  if ((thrown_spell < 14 && thrown_spell > 6) || thrown_spell === 16) {
    name += 'casts a spell.';
    await printMessage(name);
  }

  await monsterExecuteCastingOfSpell(monster, monster_id, thrown_spell, creature.level, name, death_description.v);

  if (monster.lit) {
    creature_recall[monster.creature_id].spells |= 1 << (thrown_spell - 1);
    if ((creature_recall[monster.creature_id].spells & config.monsters.spells.CS_FREQ) !== config.monsters.spells.CS_FREQ) {
      creature_recall[monster.creature_id].spells++;
    }
    if (game.character_is_dead && creature_recall[monster.creature_id].deaths < SHRT_MAX) {
      creature_recall[monster.creature_id].deaths++;
    }
  }

  return true;
}

// Places creature adjacent to given location -RAK-
// Rats and Flys are fun!
export async function monsterMultiply(coord: Coord_t, creature_id: number, monster_id: number): Promise<boolean> {
  const position = { y: 0, x: 0 };

  for (let i = 0; i <= 18; i++) {
    position.y = coord.y - 2 + randomNumber(3);
    position.x = coord.x - 2 + randomNumber(3);

    // don't create a new creature on top of the old one, that
    // causes invincible/invisible creatures to appear.
    if (coordInBounds(position) && (position.y !== coord.y || position.x !== coord.x)) {
      const tile = dg.floor[position.y][position.x];

      if (tile.feature_id <= MAX_OPEN_SPACE && tile.treasure_id === 0 && tile.creature_id !== 1) {
        // Creature there already?
        if (tile.creature_id > 1) {
          // Some critters are cannibalistic!
          const cannibalistic = (creatures_list[creature_id].movement & config.monsters.move.CM_EATS_OTHER) !== 0;

          // Check the experience level -CJS-
          const experienced = creatures_list[creature_id].kill_exp_value >= creatures_list[monsters[tile.creature_id].creature_id].kill_exp_value;

          if (cannibalistic && experienced) {
            // It ate an already processed monster. Handle * normally.
            if (monster_id < tile.creature_id) {
              dungeonDeleteMonster(tile.creature_id);
            } else {
              // If it eats this monster, an already processed
              // monster will take its place, causing all kinds
              // of havoc. Delay the kill a bit.
              dungeonRemoveMonsterFromLevel(tile.creature_id);
            }

            // in case compact_monster() is called, it needs monster_id.
            globals.hack_monptr = monster_id;
            // Place_monster() may fail if monster list full.
            const result = await monsterPlaceNew(position, creature_id, false);
            globals.hack_monptr = -1;
            if (!result) {
              return false;
            }

            globals.monster_multiply_total++;
            return monsterMakeVisible(position);
          }
        } else {
          // All clear,  place a monster

          // in case compact_monster() is called,it needs monster_id
          globals.hack_monptr = monster_id;
          // Place_monster() may fail if monster list full.
          const result = await monsterPlaceNew(position, creature_id, false);
          globals.hack_monptr = -1;
          if (!result) {
            return false;
          }

          globals.monster_multiply_total++;
          return monsterMakeVisible(position);
        }
      }
    }
  }

  return false;
}

async function monsterMultiplyCritter(monster: Monster_t, monster_id: number, rcmove: Ref<number>): Promise<void> {
  let counter = 0;

  const coord = { y: 0, x: 0 };

  for (coord.y = monster.pos.y - 1; coord.y <= monster.pos.y + 1; coord.y++) {
    for (coord.x = monster.pos.x - 1; coord.x <= monster.pos.x + 1; coord.x++) {
      if (coordInBounds(coord) && dg.floor[coord.y][coord.x].creature_id > 1) {
        counter++;
      }
    }
  }

  // can't call randomNumber with a value of zero, increment
  // counter to allow creature multiplication.
  if (counter === 0) {
    counter++;
  }

  if (counter < 4 && randomNumber(counter * config.monsters.MON_MULTIPLY_ADJUST) === 1) {
    if (await monsterMultiply({ y: monster.pos.y, x: monster.pos.x }, monster.creature_id, monster_id)) {
      rcmove.v = (rcmove.v | config.monsters.move.CM_MULTIPLY) >>> 0;
    }
  }
}

async function monsterMoveOutOfWall(monster: Monster_t, monster_id: number, rcmove: Ref<number>): Promise<void> {
  // If the monster is already dead, don't kill it again!
  // This can happen for monsters moving faster than the player. They
  // will get multiple moves, but should not if they die on the first
  // move.  This is only a problem for monsters stuck in rock.
  if (monster.hp < 0) {
    return;
  }

  let id = 0;
  let dir = 1;
  // int directions[9]: the C array is not initialized; makeMove() reads 5 entries even when fewer
  // were set here. Unset entries are 0 here (an invalid direction, which never moves the monster).
  const directions: number[] = new Array<number>(9).fill(0);

  // Note direction of for loops matches direction of keypad from 1 to 9
  // Do not allow attack against the player.
  // Must cast y-1 to signed int, so that a negative value
  // of i will fail the comparison.
  for (let y = monster.pos.y + 1; y >= monster.pos.y - 1; y--) {
    for (let x = monster.pos.x - 1; x <= monster.pos.x + 1; x++) {
      if (dir !== 5 && dg.floor[y][x].feature_id <= MAX_OPEN_SPACE && dg.floor[y][x].creature_id !== 1) {
        directions[id] = dir;
        id++;
      }
      dir++;
    }
  }

  if (id !== 0) {
    // put a random direction first
    dir = randomNumber(id) - 1;

    const saved_id = directions[0];

    directions[0] = directions[dir];
    directions[dir] = saved_id;

    // this can only fail if directions[0] has a rune of protection
    await makeMove(monster_id, directions, rcmove);
  }

  // if still in a wall, let it dig itself out, but also apply some more damage
  if (dg.floor[monster.pos.y][monster.pos.x].feature_id >= MIN_CAVE_WALL) {
    // in case the monster dies, may need to callfix1_delete_monster()
    // instead of delete_monsters()
    globals.hack_monptr = monster_id;
    const i = await monsterTakeHit(monster_id, diceRoll({ dice: 8, sides: 8 }));
    globals.hack_monptr = -1;

    if (i >= 0) {
      await printMessage('You hear a scream muffled by rock!');
      await displayCharacterExperience();
    } else {
      await printMessage('A creature digs itself out from the rock!');
      await playerTunnelWall({ y: monster.pos.y, x: monster.pos.x }, 1, 0);
    }
  }
}

// Undead only get confused from turn undead, so they should flee
async function monsterMoveUndead(creature: Creature_t, monster_id: number, rcmove: Ref<number>): Promise<void> {
  const directions: number[] = new Array<number>(9).fill(0);
  monsterGetMoveDirection(monster_id, directions);

  directions[0] = 10 - directions[0];
  directions[1] = 10 - directions[1];
  directions[2] = 10 - directions[2];
  directions[3] = randomNumber(9); // May attack only if cornered
  directions[4] = randomNumber(9);

  // don't move if it's is not supposed to move!
  if ((creature.movement & config.monsters.move.CM_ATTACK_ONLY) === 0) {
    await makeMove(monster_id, directions, rcmove);
  }
}

async function monsterMoveConfused(creature: Creature_t, monster_id: number, rcmove: Ref<number>): Promise<void> {
  const directions: number[] = new Array<number>(9).fill(0);

  directions[0] = randomNumber(9);
  directions[1] = randomNumber(9);
  directions[2] = randomNumber(9);
  directions[3] = randomNumber(9);
  directions[4] = randomNumber(9);

  // don't move if it's is not supposed to move!
  if ((creature.movement & config.monsters.move.CM_ATTACK_ONLY) === 0) {
    await makeMove(monster_id, directions, rcmove);
  }
}

async function monsterDoMove(monster_id: number, rcmove: Ref<number>, monster: Monster_t, creature: Creature_t): Promise<boolean> {
  // Creature is confused or undead turned?
  if (monster.confused_amount !== 0) {
    if ((creature.defenses & config.monsters.defense.CD_UNDEAD) !== 0) {
      await monsterMoveUndead(creature, monster_id, rcmove);
    } else {
      await monsterMoveConfused(creature, monster_id, rcmove);
    }
    monster.confused_amount--;
    return true;
  }

  // Creature may cast a spell
  if ((creature.spells & config.monsters.spells.CS_FREQ) !== 0) {
    return monsterCastSpell(monster_id);
  }

  return false;
}

async function monsterMoveRandomly(monster_id: number, rcmove: Ref<number>, randomness: number): Promise<void> {
  const directions: number[] = new Array<number>(9).fill(0);

  directions[0] = randomNumber(9);
  directions[1] = randomNumber(9);
  directions[2] = randomNumber(9);
  directions[3] = randomNumber(9);
  directions[4] = randomNumber(9);

  rcmove.v = (rcmove.v | randomness) >>> 0;

  await makeMove(monster_id, directions, rcmove);
}

async function monsterMoveNormally(monster_id: number, rcmove: Ref<number>): Promise<void> {
  const directions: number[] = new Array<number>(9).fill(0);

  if (randomNumber(200) === 1) {
    directions[0] = randomNumber(9);
    directions[1] = randomNumber(9);
    directions[2] = randomNumber(9);
    directions[3] = randomNumber(9);
    directions[4] = randomNumber(9);
  } else {
    monsterGetMoveDirection(monster_id, directions);
  }

  rcmove.v = (rcmove.v | config.monsters.move.CM_MOVE_NORMAL) >>> 0;

  await makeMove(monster_id, directions, rcmove);
}

async function monsterAttackWithoutMoving(monster_id: number, rcmove: Ref<number>, distance_from_player: number): Promise<void> {
  const directions: number[] = new Array<number>(9).fill(0);

  if (distance_from_player < 2) {
    monsterGetMoveDirection(monster_id, directions);
    await makeMove(monster_id, directions, rcmove);
  } else {
    // Learn that the monster does does not move when
    // it should have moved, but didn't.
    rcmove.v = (rcmove.v | config.monsters.move.CM_ATTACK_ONLY) >>> 0;
  }
}

// Move the critters about the dungeon -RAK-
async function monsterMove(monster_id: number, rcmove: Ref<number>): Promise<void> {
  const monster = monsters[monster_id];
  const creature = creatures_list[monster.creature_id];

  // Does the critter multiply?
  // rest could be negative, to be safe, only use mod with positive values.
  const abs_rest_period = abs(py.flags.rest);
  if ((creature.movement & config.monsters.move.CM_MULTIPLY) !== 0 && config.monsters.MON_MAX_MULTIPLY_PER_LEVEL >= globals.monster_multiply_total &&
    abs_rest_period % config.monsters.MON_MULTIPLY_ADJUST === 0) {
    await monsterMultiplyCritter(monster, monster_id, rcmove);
  }

  // if in wall, must immediately escape to a clear area
  // then monster movement finished
  if ((creature.movement & config.monsters.move.CM_PHASE) === 0 && dg.floor[monster.pos.y][monster.pos.x].feature_id >= MIN_CAVE_WALL) {
    await monsterMoveOutOfWall(monster, monster_id, rcmove);
    return;
  }

  if (await monsterDoMove(monster_id, rcmove, monster, creature)) {
    return;
  }

  // 75% random movement
  if ((creature.movement & config.monsters.move.CM_75_RANDOM) !== 0 && randomNumber(100) < 75) {
    await monsterMoveRandomly(monster_id, rcmove, config.monsters.move.CM_75_RANDOM);
    return;
  }

  // 40% random movement
  if ((creature.movement & config.monsters.move.CM_40_RANDOM) !== 0 && randomNumber(100) < 40) {
    await monsterMoveRandomly(monster_id, rcmove, config.monsters.move.CM_40_RANDOM);
    return;
  }

  // 20% random movement
  if ((creature.movement & config.monsters.move.CM_20_RANDOM) !== 0 && randomNumber(100) < 20) {
    await monsterMoveRandomly(monster_id, rcmove, config.monsters.move.CM_20_RANDOM);
    return;
  }

  // Normal movement
  if ((creature.movement & config.monsters.move.CM_MOVE_NORMAL) !== 0) {
    await monsterMoveNormally(monster_id, rcmove);
    return;
  }

  // Attack, but don't move
  if ((creature.movement & config.monsters.move.CM_ATTACK_ONLY) !== 0) {
    await monsterAttackWithoutMoving(monster_id, rcmove, monster.distance_from_player);
    return;
  }

  if ((creature.movement & config.monsters.move.CM_ONLY_MAGIC) !== 0 && monster.distance_from_player < 2) {
    // A little hack for Quylthulgs, so that one will eventually
    // notice that they have no physical attacks.
    if (creature_recall[monster.creature_id].attacks[0] < UCHAR_MAX) {
      creature_recall[monster.creature_id].attacks[0]++;
    }

    // Another little hack for Quylthulgs, so that one can
    // eventually learn their speed.
    if (creature_recall[monster.creature_id].attacks[0] > 20) {
      creature_recall[monster.creature_id].movement |= config.monsters.move.CM_ONLY_MAGIC;
    }
  }
}

function memoryUpdateRecall(monster: Monster_t, wake: boolean, ignore: boolean, rcmove: number): void {
  if (!monster.lit) {
    return;
  }

  const memory = creature_recall[monster.creature_id];

  if (wake) {
    if (memory.wake < UCHAR_MAX) {
      memory.wake++;
    }
  } else if (ignore) {
    if (memory.ignore < UCHAR_MAX) {
      memory.ignore++;
    }
  }

  memory.movement |= rcmove;
}

async function monsterAttackingUpdate(monster: Monster_t, monster_id: number, moves: number): Promise<void> {
  for (let i = moves; i > 0; i--) {
    let wake = false;
    let ignore = false;

    const rcmove = ref(0);

    // Monsters trapped in rock must be given a turn also,
    // so that they will die/dig out immediately.
    if (monster.lit || monster.distance_from_player <= creatures_list[monster.creature_id].area_affect_radius ||
      ((creatures_list[monster.creature_id].movement & config.monsters.move.CM_PHASE) === 0 && dg.floor[monster.pos.y][monster.pos.x].feature_id >= MIN_CAVE_WALL)) {
      if (monster.sleep_count > 0) {
        if (py.flags.aggravate) {
          monster.sleep_count = 0;
        } else if ((py.flags.rest === 0 && py.flags.paralysis < 1) || randomNumber(50) === 1) {
          const notice = randomNumber(1024);

          // 1L << (29 - stealth_factor): a long
          if (notice * notice * notice <= 2 ** (29 - py.misc.stealth_factor)) {
            monster.sleep_count -= idiv(100, monster.distance_from_player);
            if (monster.sleep_count > 0) {
              ignore = true;
            } else {
              wake = true;

              // force it to be exactly zero
              monster.sleep_count = 0;
            }
          }
        }
      }

      if (monster.stunned_amount !== 0) {
        // NOTE: Balrog = 100*100 = 10000, it always recovers instantly
        if (randomNumber(5000) < creatures_list[monster.creature_id].level * creatures_list[monster.creature_id].level) {
          monster.stunned_amount = 0;
        } else {
          monster.stunned_amount--;
        }

        if (monster.stunned_amount === 0) {
          if (monster.lit) {
            const msg = sprintf('The %s ', creatures_list[monster.creature_id].name);
            await printMessage(msg + 'recovers and glares at you.');
          }
        }
      }
      if (monster.sleep_count === 0 && monster.stunned_amount === 0) {
        await monsterMove(monster_id, rcmove);
      }
    }

    await monsterUpdateVisibility(monster_id);
    memoryUpdateRecall(monster, wake, ignore, rcmove.v);
  }
}

// Creatures movement and attacking are done from here -RAK-
export async function updateMonsters(attack: boolean): Promise<void> {
  // Process the monsters
  for (let id = globals.next_free_monster_id - 1; id >= config.monsters.MON_MIN_INDEX_ID && !game.character_is_dead; id--) {
    const monster = monsters[id];

    // Get rid of an eaten/breathed on monster.  Note: Be sure not to
    // process this monster. This is necessary because we can't delete
    // monsters while scanning the monsters here.
    if (monster.hp < 0) {
      dungeonDeleteMonsterRecord(id);
      continue;
    }

    monster.distance_from_player = coordDistanceBetween(py.pos, { y: monster.pos.y, x: monster.pos.x });

    // Attack is argument passed to CREATURE
    if (attack) {
      const moves = monsterMovementRate(monster.speed);

      if (moves <= 0) {
        await monsterUpdateVisibility(id);
      } else {
        await monsterAttackingUpdate(monster, id, moves);
      }
    } else {
      await monsterUpdateVisibility(id);
    }

    // Get rid of an eaten/breathed on monster. This is necessary because
    // we can't delete monsters while scanning the monsters here.
    // This monster may have been killed during monsterMove().
    if (monster.hp < 0) {
      dungeonDeleteMonsterRecord(id);
      continue;
    }
  }
}

// Decreases monsters hit points and deletes monster if needed.
// (Picking on my babies.) -RAK-
export async function monsterTakeHit(monster_id: number, damage: number): Promise<number> {
  const monster = monsters[monster_id];
  const creature = creatures_list[monster.creature_id];

  monster.sleep_count = 0;
  monster.hp -= damage;

  if (monster.hp >= 0) {
    return -1;
  }

  let treasure_flags = await monsterDeath({ y: monster.pos.y, x: monster.pos.x }, creature.movement);

  const memory = creature_recall[monster.creature_id];

  if ((py.flags.blind < 1 && monster.lit) || (creature.movement & config.monsters.move.CM_WIN) !== 0) {
    const tmp = (memory.movement & config.monsters.move.CM_TREASURE) >>> config.monsters.move.CM_TR_SHIFT;

    if (tmp > (treasure_flags & config.monsters.move.CM_TREASURE) >>> config.monsters.move.CM_TR_SHIFT) {
      treasure_flags = ((treasure_flags & ~config.monsters.move.CM_TREASURE) | (tmp << config.monsters.move.CM_TR_SHIFT)) >>> 0;
    }

    memory.movement = (memory.movement & ~config.monsters.move.CM_TREASURE) | treasure_flags;

    if (memory.kills < SHRT_MAX) {
      memory.kills++;
    }
  }

  playerGainKillExperience(creature);

  // can't call displayCharacterExperience() here, as that would result in "new level"
  // message appearing before "monster dies" message.
  const m_take_hit = monster.creature_id;

  // in case this is called from within updateMonsters(), this is a horrible
  // hack, the monsters/updateMonsters() code needs to be rewritten.
  if (globals.hack_monptr < monster_id) {
    dungeonDeleteMonster(monster_id);
  } else {
    dungeonRemoveMonsterFromLevel(monster_id);
  }

  return m_take_hit;
}

function monsterDeathItemDropType(flags: number): number {
  let object: number;

  if ((flags & config.monsters.move.CM_CARRY_OBJ) !== 0) {
    object = 1;
  } else {
    object = 0;
  }

  if ((flags & config.monsters.move.CM_CARRY_GOLD) !== 0) {
    object += 2;
  }

  if ((flags & config.monsters.move.CM_SMALL_OBJ) !== 0) {
    object += 4;
  }

  return object;
}

function monsterDeathItemDropCount(flags: number): number {
  let count = 0;

  if ((flags & config.monsters.move.CM_60_RANDOM) !== 0 && randomNumber(100) < 60) {
    count++;
  }

  if ((flags & config.monsters.move.CM_90_RANDOM) !== 0 && randomNumber(100) < 90) {
    count++;
  }

  if ((flags & config.monsters.move.CM_1D2_OBJ) !== 0) {
    count += randomNumber(2);
  }

  if ((flags & config.monsters.move.CM_2D2_OBJ) !== 0) {
    count += diceRoll({ dice: 2, sides: 2 });
  }

  if ((flags & config.monsters.move.CM_4D2_OBJ) !== 0) {
    count += diceRoll({ dice: 4, sides: 2 });
  }

  return count;
}

// Allocates objects upon a creatures death -RAK-
// Oh well,  another creature bites the dust. Reward the
// victor based on flags set in the main creature record.
//
// Returns a mask of bits from the given flags which indicates what the
// monster is seen to have dropped.  This may be added to monster memory.
export async function monsterDeath(coord: Coord_t, flags: number): Promise<number> {
  const item_type = monsterDeathItemDropType(flags);
  const item_count = monsterDeathItemDropCount(flags);

  let dropped_item_id = 0;

  if (item_count > 0) {
    dropped_item_id = (await dungeonSummonObject(coord, item_count, item_type)) >>> 0;
  }

  // maybe the player died in mid-turn
  if ((flags & config.monsters.move.CM_WIN) !== 0 && !game.character_is_dead) {
    game.total_winner = true;

    printCharacterWinner();

    await printMessage('*** CONGRATULATIONS *** You have won the game.');
    await printMessage('You cannot save this game, but you may retire when ready.');
  }

  if (dropped_item_id === 0) {
    return 0;
  }

  let return_flags = 0;

  if ((dropped_item_id & 255) !== 0) {
    return_flags = (return_flags | config.monsters.move.CM_CARRY_OBJ) >>> 0;

    if ((item_type & 0x04) !== 0) {
      return_flags = (return_flags | config.monsters.move.CM_SMALL_OBJ) >>> 0;
    }
  }

  if (dropped_item_id >= 256) {
    return_flags = (return_flags | config.monsters.move.CM_CARRY_GOLD) >>> 0;
  }

  let number_of_items = (dropped_item_id % 256) + idiv(dropped_item_id, 256);
  number_of_items = number_of_items << config.monsters.move.CM_TR_SHIFT;

  return (return_flags | number_of_items) >>> 0;
}

export async function printMonsterActionText(name: string, action: string): Promise<void> {
  await printMessage(name + ' ' + action);
}

export function monsterNameDescription(real_name: string, is_lit: boolean): string {
  if (is_lit) {
    return 'The ' + real_name;
  }
  return 'It';
}

// Sleep creatures adjacent to player -RAK-
export async function monsterSleep(coord: Coord_t): Promise<boolean> {
  let asleep = false;

  for (let y = coord.y - 1; y <= coord.y + 1 && y < MAX_HEIGHT; y++) {
    for (let x = coord.x - 1; x <= coord.x + 1 && x < MAX_WIDTH; x++) {
      const monster_id = dg.floor[y][x].creature_id;

      if (monster_id <= 1) {
        continue;
      }

      const monster = monsters[monster_id];
      const creature = creatures_list[monster.creature_id];

      const name = monsterNameDescription(creature.name, monster.lit);

      if (randomNumber(MON_MAX_LEVELS) < creature.level || (creature.defenses & config.monsters.defense.CD_NO_SLEEP) !== 0) {
        if (monster.lit && (creature.defenses & config.monsters.defense.CD_NO_SLEEP) !== 0) {
          creature_recall[monster.creature_id].defenses |= config.monsters.defense.CD_NO_SLEEP;
        }

        await printMonsterActionText(name, 'is unaffected.');
      } else {
        monster.sleep_count = 500;
        asleep = true;

        await printMonsterActionText(name, 'falls asleep.');
      }
    }
  }

  return asleep;
}

async function executeAttackOnPlayer(creature_level: number, monster_hp: Ref<number>, monster_id: number, attack_type: number, damage: number, death_description: string, noticed: boolean): Promise<boolean> {
  const item_pos_start = ref(0);
  const item_pos_end = ref(0);
  let gold: number;

  switch (attack_type) {
    case 1: // Normal attack
      // round half-way case down
      damage -= idiv((py.misc.ac + py.misc.magical_ac) * damage, 200);
      playerTakesHit(damage, death_description);
      break;
    case 2: // Lose Strength
      playerTakesHit(damage, death_description);
      if (py.flags.sustain_str) {
        await printMessage('You feel weaker for a moment, but it passes.');
      } else if (randomNumber(2) === 1) {
        await printMessage('You feel weaker.');
        await playerStatRandomDecrease(PlayerAttr.A_STR);
      } else {
        noticed = false;
      }
      break;
    case 3: // Confusion attack
      playerTakesHit(damage, death_description);
      if (randomNumber(2) === 1) {
        if (py.flags.confused < 1) {
          await printMessage('You feel confused.');
          py.flags.confused += randomNumber(creature_level);
        } else {
          noticed = false;
        }
        py.flags.confused += 3;
      } else {
        noticed = false;
      }
      break;
    case 4: // Fear attack
      playerTakesHit(damage, death_description);
      if (playerSavingThrow()) {
        await printMessage('You resist the effects!');
      } else if (py.flags.afraid < 1) {
        await printMessage('You are suddenly afraid!');
        py.flags.afraid += 3 + randomNumber(creature_level);
      } else {
        py.flags.afraid += 3;
        noticed = false;
      }
      break;
    case 5: // Fire attack
      await printMessage('You are enveloped in flames!');
      await damageFire(damage, death_description);
      break;
    case 6: // Acid attack
      await printMessage('You are covered in acid!');
      await damageAcid(damage, death_description);
      break;
    case 7: // Cold attack
      await printMessage('You are covered with frost!');
      await damageCold(damage, death_description);
      break;
    case 8: // Lightning attack
      await printMessage('Lightning strikes you!');
      await damageLightningBolt(damage, death_description);
      break;
    case 9: // Corrosion attack
      await printMessage('A stinging red gas swirls about you.');
      await damageCorrodingGas(death_description);
      playerTakesHit(damage, death_description);
      break;
    case 10: // Blindness attack
      playerTakesHit(damage, death_description);
      if (py.flags.blind < 1) {
        py.flags.blind += 10 + randomNumber(creature_level);
        await printMessage('Your eyes begin to sting.');
      } else {
        py.flags.blind += 5;
        noticed = false;
      }
      break;
    case 11: // Paralysis attack
      playerTakesHit(damage, death_description);
      if (playerSavingThrow()) {
        await printMessage('You resist the effects!');
      } else if (py.flags.paralysis < 1) {
        if (py.flags.free_action) {
          await printMessage('You are unaffected.');
        } else {
          py.flags.paralysis = randomNumber(creature_level) + 3;
          await printMessage('You are paralyzed.');
        }
      } else {
        noticed = false;
      }
      break;
    case 12: // Steal Money
      if (py.flags.paralysis < 1 && randomNumber(124) < py.stats.used[PlayerAttr.A_DEX]) {
        await printMessage('You quickly protect your money pouch!');
      } else {
        gold = idiv(py.misc.au, 10) + randomNumber(25);
        if (gold > py.misc.au) {
          py.misc.au = 0;
        } else {
          py.misc.au -= gold;
        }
        await printMessage('Your purse feels lighter.');
        printCharacterGoldValue();
      }
      if (randomNumber(2) === 1) {
        await printMessage('There is a puff of smoke!');
        await spellTeleportAwayMonster(monster_id, config.monsters.MON_MAX_SIGHT);
      }
      break;
    case 13: // Steal Object
      if (py.flags.paralysis < 1 && randomNumber(124) < py.stats.used[PlayerAttr.A_DEX]) {
        await printMessage('You grab hold of your backpack!');
      } else {
        inventoryDestroyItem(randomNumber(py.pack.unique_items) - 1);
        await printMessage('Your backpack feels lighter.');
      }
      if (randomNumber(2) === 1) {
        await printMessage('There is a puff of smoke!');
        await spellTeleportAwayMonster(monster_id, config.monsters.MON_MAX_SIGHT);
      }
      break;
    case 14: // Poison
      playerTakesHit(damage, death_description);
      await printMessage('You feel very sick.');
      py.flags.poisoned += randomNumber(creature_level) + 5;
      break;
    case 15: // Lose dexterity
      playerTakesHit(damage, death_description);
      if (py.flags.sustain_dex) {
        await printMessage('You feel clumsy for a moment, but it passes.');
      } else {
        await printMessage('You feel more clumsy.');
        await playerStatRandomDecrease(PlayerAttr.A_DEX);
      }
      break;
    case 16: // Lose constitution
      playerTakesHit(damage, death_description);
      if (py.flags.sustain_con) {
        await printMessage('Your body resists the effects of the disease.');
      } else {
        await printMessage('Your health is damaged!');
        await playerStatRandomDecrease(PlayerAttr.A_CON);
      }
      break;
    case 17: // Lose intelligence
      playerTakesHit(damage, death_description);
      await printMessage('You have trouble thinking clearly.');
      if (py.flags.sustain_int) {
        await printMessage('But your mind quickly clears.');
      } else {
        await playerStatRandomDecrease(PlayerAttr.A_INT);
      }
      break;
    case 18: // Lose wisdom
      playerTakesHit(damage, death_description);
      if (py.flags.sustain_wis) {
        await printMessage('Your wisdom is sustained.');
      } else {
        await printMessage('Your wisdom is drained.');
        await playerStatRandomDecrease(PlayerAttr.A_WIS);
      }
      break;
    case 19: // Lose experience
      await printMessage('You feel your life draining away!');
      await spellLoseEXP(damage + idiv(py.misc.exp, 100) * config.monsters.MON_PLAYER_EXP_DRAINED_PER_HIT);
      break;
    case 20: // Aggravate monster
      await spellAggravateMonsters(20);
      break;
    case 21: // Disenchant
      if (executeDisenchantAttack()) {
        await printMessage('There is a static feeling in the air.');
        playerRecalculateBonuses();
      } else {
        noticed = false;
      }
      break;
    case 22: // Eat food
      if (inventoryFindRange(TV_FOOD, TV_NEVER, item_pos_start, item_pos_end)) {
        inventoryDestroyItem(item_pos_start.v);
        await printMessage('It got at your rations!');
      } else {
        noticed = false;
      }
      break;
    case 23: // Eat light
      noticed = await inventoryDiminishLightAttack(noticed);
      break;
    case 24: // Eat charges
      noticed = await inventoryDiminishChargesAttack(creature_level, monster_hp, noticed);
      break;
    // NOTE: default handles this case
    // case 99:
    //     noticed = false;
    //     break;
    default:
      noticed = false;
      break;
  }

  return noticed;
}
