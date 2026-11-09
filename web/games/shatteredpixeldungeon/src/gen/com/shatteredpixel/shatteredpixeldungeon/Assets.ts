// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/Assets.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
/*
 * Pixel Dungeon
 * Copyright (C) 2012-2015 Oleg Dolya
 *
 * Shattered Pixel Dungeon
 * Copyright (C) 2014-2026 Evan Debenham
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 */
import { $J, JObject } from '../../../../jre/index.ts';

export class Assets extends JObject {
  _Assets(): this {
    return this;
  }
}

export class Assets$Effects extends JObject {
  static readonly EFFECTS: string = 'effects/effects.png';
  static readonly FIREBALL: string = 'effects/fireball.png';
  static readonly SPECKS: string = 'effects/specks.png';
  static readonly SPELL_ICONS: string = 'effects/spell_icons.png';
  static readonly TEXT_ICONS: string = 'effects/text_icons.png';
  _Assets$Effects(): this {
    return this;
  }
}

export class Assets$Environment extends JObject {
  static readonly TERRAIN_FEATURES: string = 'environment/terrain_features.png';
  static readonly RAISED_TERRAIN: string = 'environment/raised_terrain.png';
  static readonly VISUAL_GRID: string = 'environment/visual_grid.png';
  static readonly WALL_BLOCKING: string = 'environment/wall_blocking.png';
  static readonly OCCLUSION_SHADOWS: string = 'environment/occlusion_shadows.png';
  static readonly TILES_SEWERS: string = 'environment/tiles_sewers.png';
  static readonly TILES_PRISON: string = 'environment/tiles_prison.png';
  static readonly TILES_CAVES: string = 'environment/tiles_caves.png';
  static readonly TILES_CITY: string = 'environment/tiles_city.png';
  static readonly TILES_HALLS: string = 'environment/tiles_halls.png';
  static readonly TILES_CAVES_CRYSTAL: string = 'environment/tiles_caves_crystal.png';
  static readonly TILES_CAVES_GNOLL: string = 'environment/tiles_caves_gnoll.png';
  static readonly WATER_SEWERS: string = 'environment/water0.png';
  static readonly WATER_PRISON: string = 'environment/water1.png';
  static readonly WATER_CAVES: string = 'environment/water2.png';
  static readonly WATER_CITY: string = 'environment/water3.png';
  static readonly WATER_HALLS: string = 'environment/water4.png';
  static readonly CARPET: string = 'environment/custom_tiles/carpet.png';
  static readonly RAT_KING_ROOM: string = 'environment/custom_tiles/rat_king_room.png';
  static readonly WEAK_FLOOR: string = 'environment/custom_tiles/weak_floor.png';
  static readonly SEWER_BOSS: string = 'environment/custom_tiles/sewer_boss.png';
  static readonly PRISON_QUEST: string = 'environment/custom_tiles/prison_quest.png';
  static readonly PRISON_EXIT: string = 'environment/custom_tiles/prison_exit.png';
  static readonly CAVES_QUEST: string = 'environment/custom_tiles/caves_quest.png';
  static readonly CAVES_BOSS: string = 'environment/custom_tiles/caves_boss.png';
  static readonly CITY_QUEST: string = 'environment/custom_tiles/city_quest.png';
  static readonly CITY_BOSS: string = 'environment/custom_tiles/city_boss.png';
  static readonly HALLS_SP: string = 'environment/custom_tiles/halls_special.png';
  _Assets$Environment(): this {
    return this;
  }
}

export class Assets$Fonts extends JObject {
  static readonly PIXELFONT: string = 'fonts/pixel_font.png';
  _Assets$Fonts(): this {
    return this;
  }
}

export class Assets$Interfaces extends JObject {
  static readonly ARCS_BG: string = 'interfaces/arcs1.png';
  static readonly ARCS_FG: string = 'interfaces/arcs2.png';
  static readonly BANNERS: string = 'interfaces/banners.png';
  static readonly BADGES: string = 'interfaces/badges.png';
  static readonly LOCKED: string = 'interfaces/locked_badge.png';
  static readonly CHROME: string = 'interfaces/chrome.png';
  static readonly ICONS: string = 'interfaces/icons.png';
  static readonly STATUS: string = 'interfaces/status_pane.png';
  static readonly MENU: string = 'interfaces/menu_pane.png';
  static readonly MENU_BTN: string = 'interfaces/menu_button.png';
  static readonly TOOLBAR: string = 'interfaces/toolbar.png';
  static readonly SHADOW: string = 'interfaces/shadow.png';
  static readonly BOSSHP: string = 'interfaces/boss_hp.png';
  static readonly SURFACE: string = 'interfaces/surface.png';
  static readonly BUFFS_SMALL: string = 'interfaces/buffs.png';
  static readonly BUFFS_LARGE: string = 'interfaces/large_buffs.png';
  static readonly TALENT_ICONS: string = 'interfaces/talent_icons.png';
  static readonly TALENT_BUTTON: string = 'interfaces/talent_button.png';
  static readonly HERO_ICONS: string = 'interfaces/hero_icons.png';
  static readonly RADIAL_MENU: string = 'interfaces/radial_menu.png';
  static readonly CHANGE_ICONS: string = 'interfaces/change_icons.png';
  _Assets$Interfaces(): this {
    return this;
  }
}

export class Assets$Messages extends JObject {
  static readonly ACTORS: string = 'messages/actors/actors';
  static readonly ITEMS: string = 'messages/items/items';
  static readonly JOURNAL: string = 'messages/journal/journal';
  static readonly LEVELS: string = 'messages/levels/levels';
  static readonly MISC: string = 'messages/misc/misc';
  static readonly PLANTS: string = 'messages/plants/plants';
  static readonly SCENES: string = 'messages/scenes/scenes';
  static readonly UI: string = 'messages/ui/ui';
  static readonly WINDOWS: string = 'messages/windows/windows';
  _Assets$Messages(): this {
    return this;
  }
}

export class Assets$Music extends JObject {
  static readonly THEME_1: string = 'music/theme_1.ogg';
  static readonly THEME_2: string = 'music/theme_2.ogg';
  static readonly THEME_FINALE: string = 'music/theme_finale.ogg';
  static readonly SEWERS_1: string = 'music/sewers_1.ogg';
  static readonly SEWERS_2: string = 'music/sewers_2.ogg';
  static readonly SEWERS_3: string = 'music/sewers_3.ogg';
  static readonly SEWERS_TENSE: string = 'music/sewers_tense.ogg';
  static readonly SEWERS_BOSS: string = 'music/sewers_boss.ogg';
  static readonly PRISON_1: string = 'music/prison_1.ogg';
  static readonly PRISON_2: string = 'music/prison_2.ogg';
  static readonly PRISON_3: string = 'music/prison_3.ogg';
  static readonly PRISON_TENSE: string = 'music/prison_tense.ogg';
  static readonly PRISON_BOSS: string = 'music/prison_boss.ogg';
  static readonly CAVES_1: string = 'music/caves_1.ogg';
  static readonly CAVES_2: string = 'music/caves_2.ogg';
  static readonly CAVES_3: string = 'music/caves_3.ogg';
  static readonly CAVES_TENSE: string = 'music/caves_tense.ogg';
  static readonly CAVES_BOSS: string = 'music/caves_boss.ogg';
  static readonly CAVES_BOSS_FINALE: string = 'music/caves_boss_finale.ogg';
  static readonly CITY_1: string = 'music/city_1.ogg';
  static readonly CITY_2: string = 'music/city_2.ogg';
  static readonly CITY_3: string = 'music/city_3.ogg';
  static readonly CITY_TENSE: string = 'music/city_tense.ogg';
  static readonly CITY_BOSS: string = 'music/city_boss.ogg';
  static readonly CITY_BOSS_FINALE: string = 'music/city_boss_finale.ogg';
  static readonly HALLS_1: string = 'music/halls_1.ogg';
  static readonly HALLS_2: string = 'music/halls_2.ogg';
  static readonly HALLS_3: string = 'music/halls_3.ogg';
  static readonly HALLS_TENSE: string = 'music/halls_tense.ogg';
  static readonly HALLS_BOSS: string = 'music/halls_boss.ogg';
  static readonly HALLS_BOSS_FINALE: string = 'music/halls_boss_finale.ogg';
  _Assets$Music(): this {
    return this;
  }
}

export class Assets$Sounds extends JObject {
  static readonly CLICK: string = 'sounds/click.mp3';
  static readonly BADGE: string = 'sounds/badge.mp3';
  static readonly GOLD: string = 'sounds/gold.mp3';
  static readonly OPEN: string = 'sounds/door_open.mp3';
  static readonly UNLOCK: string = 'sounds/unlock.mp3';
  static readonly ITEM: string = 'sounds/item.mp3';
  static readonly DEWDROP: string = 'sounds/dewdrop.mp3';
  static readonly STEP: string = 'sounds/step.mp3';
  static readonly WATER: string = 'sounds/water.mp3';
  static readonly GRASS: string = 'sounds/grass.mp3';
  static readonly TRAMPLE: string = 'sounds/trample.mp3';
  static readonly STURDY: string = 'sounds/sturdy.mp3';
  static readonly HIT: string = 'sounds/hit.mp3';
  static readonly MISS: string = 'sounds/miss.mp3';
  static readonly HIT_SLASH: string = 'sounds/hit_slash.mp3';
  static readonly HIT_STAB: string = 'sounds/hit_stab.mp3';
  static readonly HIT_CRUSH: string = 'sounds/hit_crush.mp3';
  static readonly HIT_MAGIC: string = 'sounds/hit_magic.mp3';
  static readonly HIT_STRONG: string = 'sounds/hit_strong.mp3';
  static readonly HIT_PARRY: string = 'sounds/hit_parry.mp3';
  static readonly HIT_ARROW: string = 'sounds/hit_arrow.mp3';
  static readonly ATK_SPIRITBOW: string = 'sounds/atk_spiritbow.mp3';
  static readonly ATK_CROSSBOW: string = 'sounds/atk_crossbow.mp3';
  static readonly HEALTH_WARN: string = 'sounds/health_warn.mp3';
  static readonly HEALTH_CRITICAL: string = 'sounds/health_critical.mp3';
  static readonly DESCEND: string = 'sounds/descend.mp3';
  static readonly EAT: string = 'sounds/eat.mp3';
  static readonly READ: string = 'sounds/read.mp3';
  static readonly LULLABY: string = 'sounds/lullaby.mp3';
  static readonly DRINK: string = 'sounds/drink.mp3';
  static readonly SHATTER: string = 'sounds/shatter.mp3';
  static readonly ZAP: string = 'sounds/zap.mp3';
  static readonly LIGHTNING: string = 'sounds/lightning.mp3';
  static readonly LEVELUP: string = 'sounds/levelup.mp3';
  static readonly DEATH: string = 'sounds/death.mp3';
  static readonly CHALLENGE: string = 'sounds/challenge.mp3';
  static readonly CURSED: string = 'sounds/cursed.mp3';
  static readonly TRAP: string = 'sounds/trap.mp3';
  static readonly EVOKE: string = 'sounds/evoke.mp3';
  static readonly TOMB: string = 'sounds/tomb.mp3';
  static readonly ALERT: string = 'sounds/alert.mp3';
  static readonly MELD: string = 'sounds/meld.mp3';
  static readonly BOSS: string = 'sounds/boss.mp3';
  static readonly BLAST: string = 'sounds/blast.mp3';
  static readonly PLANT: string = 'sounds/plant.mp3';
  static readonly RAY: string = 'sounds/ray.mp3';
  static readonly BEACON: string = 'sounds/beacon.mp3';
  static readonly TELEPORT: string = 'sounds/teleport.mp3';
  static readonly CHARMS: string = 'sounds/charms.mp3';
  static readonly MASTERY: string = 'sounds/mastery.mp3';
  static readonly PUFF: string = 'sounds/puff.mp3';
  static readonly ROCKS: string = 'sounds/rocks.mp3';
  static readonly BURNING: string = 'sounds/burning.mp3';
  static readonly FALLING: string = 'sounds/falling.mp3';
  static readonly GHOST: string = 'sounds/ghost.mp3';
  static readonly SECRET: string = 'sounds/secret.mp3';
  static readonly BONES: string = 'sounds/bones.mp3';
  static readonly BEE: string = 'sounds/bee.mp3';
  static readonly DEGRADE: string = 'sounds/degrade.mp3';
  static readonly MIMIC: string = 'sounds/mimic.mp3';
  static readonly DEBUFF: string = 'sounds/debuff.mp3';
  static readonly CHARGEUP: string = 'sounds/chargeup.mp3';
  static readonly GAS: string = 'sounds/gas.mp3';
  static readonly CHAINS: string = 'sounds/chains.mp3';
  static readonly SCAN: string = 'sounds/scan.mp3';
  static readonly SHEEP: string = 'sounds/sheep.mp3';
  static readonly MINE: string = 'sounds/mine.mp3';
  static all: string[] = null;
  _Assets$Sounds(): this {
    return this;
  }
  static $clinit() {
    Assets$Sounds.all = [Assets$Sounds.CLICK, Assets$Sounds.BADGE, Assets$Sounds.GOLD, Assets$Sounds.OPEN, Assets$Sounds.UNLOCK, Assets$Sounds.ITEM, Assets$Sounds.DEWDROP, Assets$Sounds.STEP, Assets$Sounds.WATER, Assets$Sounds.GRASS, Assets$Sounds.TRAMPLE, Assets$Sounds.STURDY, Assets$Sounds.HIT, Assets$Sounds.MISS, Assets$Sounds.HIT_SLASH, Assets$Sounds.HIT_STAB, Assets$Sounds.HIT_CRUSH, Assets$Sounds.HIT_MAGIC, Assets$Sounds.HIT_STRONG, Assets$Sounds.HIT_PARRY, Assets$Sounds.HIT_ARROW, Assets$Sounds.ATK_SPIRITBOW, Assets$Sounds.ATK_CROSSBOW, Assets$Sounds.HEALTH_WARN, Assets$Sounds.HEALTH_CRITICAL, Assets$Sounds.DESCEND, Assets$Sounds.EAT, Assets$Sounds.READ, Assets$Sounds.LULLABY, Assets$Sounds.DRINK, Assets$Sounds.SHATTER, Assets$Sounds.ZAP, Assets$Sounds.LIGHTNING, Assets$Sounds.LEVELUP, Assets$Sounds.DEATH, Assets$Sounds.CHALLENGE, Assets$Sounds.CURSED, Assets$Sounds.TRAP, Assets$Sounds.EVOKE, Assets$Sounds.TOMB, Assets$Sounds.ALERT, Assets$Sounds.MELD, Assets$Sounds.BOSS, Assets$Sounds.BLAST, Assets$Sounds.PLANT, Assets$Sounds.RAY, Assets$Sounds.BEACON, Assets$Sounds.TELEPORT, Assets$Sounds.CHARMS, Assets$Sounds.MASTERY, Assets$Sounds.PUFF, Assets$Sounds.ROCKS, Assets$Sounds.BURNING, Assets$Sounds.FALLING, Assets$Sounds.GHOST, Assets$Sounds.SECRET, Assets$Sounds.BONES, Assets$Sounds.BEE, Assets$Sounds.DEGRADE, Assets$Sounds.MIMIC, Assets$Sounds.DEBUFF, Assets$Sounds.CHARGEUP, Assets$Sounds.GAS, Assets$Sounds.CHAINS, Assets$Sounds.SCAN, Assets$Sounds.SHEEP, Assets$Sounds.MINE];
  }
}

export class Assets$Splashes extends JObject {
  static readonly WARRIOR: string = 'splashes/warrior.jpg';
  static readonly MAGE: string = 'splashes/mage.jpg';
  static readonly ROGUE: string = 'splashes/rogue.jpg';
  static readonly HUNTRESS: string = 'splashes/huntress.jpg';
  static readonly DUELIST: string = 'splashes/duelist.jpg';
  static readonly CLERIC: string = 'splashes/cleric.jpg';
  static readonly SEWERS: string = 'splashes/sewers.jpg';
  static readonly PRISON: string = 'splashes/prison.jpg';
  static readonly CAVES: string = 'splashes/caves.jpg';
  static readonly CITY: string = 'splashes/city.jpg';
  static readonly HALLS: string = 'splashes/halls.jpg';
  _Assets$Splashes(): this {
    return this;
  }
}

export class Assets$Splashes$Title extends JObject {
  static readonly ARCHS: string = 'splashes/title/archs.png';
  static readonly BACK_CLUSTERS: string = 'splashes/title/back_clusters.png';
  static readonly MID_MIXED: string = 'splashes/title/mid_mixed.png';
  static readonly FRONT_SMALL: string = 'splashes/title/front_small.png';
  _Assets$Splashes$Title(): this {
    return this;
  }
}

export class Assets$Sprites extends JObject {
  static readonly ITEMS: string = 'sprites/items.png';
  static readonly ITEM_ICONS: string = 'sprites/item_icons.png';
  static readonly WARRIOR: string = 'sprites/warrior.png';
  static readonly MAGE: string = 'sprites/mage.png';
  static readonly ROGUE: string = 'sprites/rogue.png';
  static readonly HUNTRESS: string = 'sprites/huntress.png';
  static readonly DUELIST: string = 'sprites/duelist.png';
  static readonly CLERIC: string = 'sprites/cleric.png';
  static readonly AVATARS: string = 'sprites/avatars.png';
  static readonly PET: string = 'sprites/pet.png';
  static readonly AMULET: string = 'sprites/amulet.png';
  static readonly RAT: string = 'sprites/rat.png';
  static readonly BRUTE: string = 'sprites/brute.png';
  static readonly SPINNER: string = 'sprites/spinner.png';
  static readonly DM300: string = 'sprites/dm300.png';
  static readonly WRAITH: string = 'sprites/wraith.png';
  static readonly UNDEAD: string = 'sprites/undead.png';
  static readonly KING: string = 'sprites/king.png';
  static readonly PIRANHA: string = 'sprites/piranha.png';
  static readonly EYE: string = 'sprites/eye.png';
  static readonly GNOLL: string = 'sprites/gnoll.png';
  static readonly CRAB: string = 'sprites/crab.png';
  static readonly GOO: string = 'sprites/goo.png';
  static readonly SWARM: string = 'sprites/swarm.png';
  static readonly SKELETON: string = 'sprites/skeleton.png';
  static readonly SHAMAN: string = 'sprites/shaman.png';
  static readonly THIEF: string = 'sprites/thief.png';
  static readonly TENGU: string = 'sprites/tengu.png';
  static readonly SHEEP: string = 'sprites/sheep.png';
  static readonly KEEPER: string = 'sprites/shopkeeper.png';
  static readonly BAT: string = 'sprites/bat.png';
  static readonly ELEMENTAL: string = 'sprites/elemental.png';
  static readonly MONK: string = 'sprites/monk.png';
  static readonly WARLOCK: string = 'sprites/warlock.png';
  static readonly GOLEM: string = 'sprites/golem.png';
  static readonly STATUE: string = 'sprites/statue.png';
  static readonly SUCCUBUS: string = 'sprites/succubus.png';
  static readonly SCORPIO: string = 'sprites/scorpio.png';
  static readonly FISTS: string = 'sprites/yog_fists.png';
  static readonly YOG: string = 'sprites/yog.png';
  static readonly LARVA: string = 'sprites/larva.png';
  static readonly GHOST: string = 'sprites/ghost.png';
  static readonly MAKER: string = 'sprites/wandmaker.png';
  static readonly TROLL: string = 'sprites/blacksmith.png';
  static readonly IMP: string = 'sprites/imp.png';
  static readonly RATKING: string = 'sprites/ratking.png';
  static readonly BEE: string = 'sprites/bee.png';
  static readonly MIMIC: string = 'sprites/mimic.png';
  static readonly ROT_LASH: string = 'sprites/rot_lasher.png';
  static readonly ROT_HEART: string = 'sprites/rot_heart.png';
  static readonly GUARD: string = 'sprites/guard.png';
  static readonly WARDS: string = 'sprites/wards.png';
  static readonly GUARDIAN: string = 'sprites/guardian.png';
  static readonly SLIME: string = 'sprites/slime.png';
  static readonly SNAKE: string = 'sprites/snake.png';
  static readonly NECRO: string = 'sprites/necromancer.png';
  static readonly GHOUL: string = 'sprites/ghoul.png';
  static readonly RIPPER: string = 'sprites/ripper.png';
  static readonly SPAWNER: string = 'sprites/spawner.png';
  static readonly DM100: string = 'sprites/dm100.png';
  static readonly PYLON: string = 'sprites/pylon.png';
  static readonly DM200: string = 'sprites/dm200.png';
  static readonly LOTUS: string = 'sprites/lotus.png';
  static readonly NINJA_LOG: string = 'sprites/ninja_log.png';
  static readonly SPIRIT_HAWK: string = 'sprites/spirit_hawk.png';
  static readonly SENTRY: string = 'sprites/sentry.png';
  static readonly CRYSTAL_WISP: string = 'sprites/crystal_wisp.png';
  static readonly CRYSTAL_GUARDIAN: string = 'sprites/crystal_guardian.png';
  static readonly CRYSTAL_SPIRE: string = 'sprites/crystal_spire.png';
  static readonly GNOLL_GUARD: string = 'sprites/gnoll_guard.png';
  static readonly GNOLL_SAPPER: string = 'sprites/gnoll_sapper.png';
  static readonly GNOLL_GEOMANCER: string = 'sprites/gnoll_geomancer.png';
  static readonly FUNGAL_SPINNER: string = 'sprites/fungal_spinner.png';
  static readonly FUNGAL_SENTRY: string = 'sprites/fungal_sentry.png';
  static readonly FUNGAL_CORE: string = 'sprites/fungal_core.png';
  static readonly VAULT_TOKENS_DOOR: string = 'sprites/vault_tokens_door.png';
  static readonly VAULT_MIRROR: string = 'sprites/vault_mirror.png';
  static readonly VAULT_BOSS_ELEMENTAL: string = 'sprites/vault_boss_elemental.png';
  _Assets$Sprites(): this {
    return this;
  }
}

$J.define(Assets, 'com.shatteredpixel.shatteredpixeldungeon.Assets', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Assets' } });
$J.define(Assets$Effects, 'com.shatteredpixel.shatteredpixeldungeon.Assets$Effects', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Assets$Effects' } });
$J.define(Assets$Environment, 'com.shatteredpixel.shatteredpixeldungeon.Assets$Environment', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Assets$Environment' } });
$J.define(Assets$Fonts, 'com.shatteredpixel.shatteredpixeldungeon.Assets$Fonts', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Assets$Fonts' } });
$J.define(Assets$Interfaces, 'com.shatteredpixel.shatteredpixeldungeon.Assets$Interfaces', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Assets$Interfaces' } });
$J.define(Assets$Messages, 'com.shatteredpixel.shatteredpixeldungeon.Assets$Messages', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Assets$Messages' } });
$J.define(Assets$Music, 'com.shatteredpixel.shatteredpixeldungeon.Assets$Music', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Assets$Music' } });
$J.define(Assets$Sounds, 'com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Assets$Sounds' }, clinit: true, lazy: ['all'] });
$J.define(Assets$Splashes, 'com.shatteredpixel.shatteredpixeldungeon.Assets$Splashes', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Assets$Splashes' } });
$J.define(Assets$Splashes$Title, 'com.shatteredpixel.shatteredpixeldungeon.Assets$Splashes$Title', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Assets$Splashes$Title' } });
$J.define(Assets$Sprites, 'com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Assets$Sprites' } });
