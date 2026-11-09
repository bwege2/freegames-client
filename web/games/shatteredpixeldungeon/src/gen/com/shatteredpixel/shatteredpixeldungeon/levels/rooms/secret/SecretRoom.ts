// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/secret/SecretRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Arrays, Exception } from '../../../../../../../jre/index.ts';
import { SpecialRoom } from '../special/SpecialRoom.ts';

let SecretArtilleryRoom, SecretChestChasmRoom, SecretGardenRoom, SecretHoardRoom, SecretHoneypotRoom, SecretLaboratoryRoom, SecretLarderRoom, SecretLibraryRoom, SecretMazeRoom, SecretRunestoneRoom, SecretSummoningRoom, SecretWellRoom, Game, Random, Reflection;

export class SecretRoom extends SpecialRoom {
  static ALL_SECRETS: ArrayList<JClass<SecretRoom>> = null;
  static runSecrets: ArrayList<JClass<SecretRoom>> = null;
  static baseRegionSecrets: number[] = null;
  static regionSecretsThisRun: number[] = null;
  static readonly ROOMS: string = 'secret_rooms';
  static readonly REGIONS: string = 'region_secrets';
  _SecretRoom(): this {
    this._SpecialRoom();
    return this;
  }
  static initForRun(): void {
    let regionChances = SecretRoom.baseRegionSecrets.slice();
    for (let i = 0; i < SecretRoom.regionSecretsThisRun.length; i++) {
      SecretRoom.regionSecretsThisRun[i] = $J.d2i(regionChances[i]);
      if (Random.Float$() < Math.fround(regionChances[i] % 1)) {
        SecretRoom.regionSecretsThisRun[i]++;
      }
    }
    SecretRoom.runSecrets = new ArrayList(SecretRoom.ALL_SECRETS);
    Random.shuffle$List(SecretRoom.runSecrets);
  }
  static secretsForFloor(depth: number): number {
    if (depth === 1) {
      return 0;
    }
    let region = $J.idiv(depth, 5);
    let floor = depth % 5;
    let floorsLeft = (5 - floor) | 0;
    let secrets: number;
    if (floorsLeft === 0) {
      secrets = Math.fround(SecretRoom.regionSecretsThisRun[region]);
    } else {
      secrets = Math.fround(SecretRoom.regionSecretsThisRun[region] / Math.fround(floorsLeft));
      if (Random.Float$() < Math.fround(secrets % 1)) {
        secrets = Math.fround(Math.ceil(secrets));
      } else {
        secrets = Math.fround(Math.floor(secrets));
      }
    }
    SecretRoom.regionSecretsThisRun[region] = (SecretRoom.regionSecretsThisRun[region] - $J.d2i(secrets)) | 0;
    return $J.d2i(secrets);
  }
  static createRoom(): SecretRoom {
    let index = Random.chances$floatArr([6, 3, 1]);
    while (index >= SecretRoom.runSecrets.size()) {
      index--;
    }
    let r = Reflection.newInstance(SecretRoom.runSecrets.get(index));
    SecretRoom.runSecrets.add(SecretRoom.runSecrets.removeAt(index));
    return r;
  }
  static restoreRoomsFromBundle(bundle: Bundle): void {
    SecretRoom.runSecrets.clear();
    if (bundle.contains(SecretRoom.ROOMS)) {
      for (let type$ of bundle.getClassArray(SecretRoom.ROOMS)) {
        if (type$ != null) {
          SecretRoom.runSecrets.add(type$);
        }
      }
      SecretRoom.regionSecretsThisRun = bundle.getIntArray(SecretRoom.REGIONS);
    } else {
      SecretRoom.initForRun();
      Game.reportException(new Exception('secrets array didn\'t exist!'));
    }
  }
  static storeRoomsInBundle(bundle: Bundle): void {
    bundle.put$String$ClassArr(SecretRoom.ROOMS, $J.toArrayInto(SecretRoom.runSecrets.toArray(), $J.newArray(0, null)));
    bundle.put$String$intArr(SecretRoom.REGIONS, SecretRoom.regionSecretsThisRun);
  }
  static $clinit() {
    SecretRoom.ALL_SECRETS = new ArrayList(Arrays.asList($J.cls(SecretGardenRoom), $J.cls(SecretLaboratoryRoom), $J.cls(SecretLibraryRoom), $J.cls(SecretLarderRoom), $J.cls(SecretWellRoom), $J.cls(SecretRunestoneRoom), $J.cls(SecretArtilleryRoom), $J.cls(SecretChestChasmRoom), $J.cls(SecretHoneypotRoom), $J.cls(SecretHoardRoom), $J.cls(SecretMazeRoom), $J.cls(SecretSummoningRoom)));
    SecretRoom.runSecrets = new ArrayList();
    SecretRoom.baseRegionSecrets = [2, 2.25, 2.5, 2.75, 3];
    SecretRoom.regionSecretsThisRun = $J.newArray(5, 0);
  }
}

$J.define(SecretRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom', ctors: { '': '_SecretRoom' }, clinit: true, lazy: ['ALL_SECRETS', 'runSecrets', 'baseRegionSecrets', 'regionSecretsThisRun'] });
$J.module(() => {
  SecretArtilleryRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretArtilleryRoom');
  SecretChestChasmRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretChestChasmRoom');
  SecretGardenRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretGardenRoom');
  SecretHoardRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretHoardRoom');
  SecretHoneypotRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretHoneypotRoom');
  SecretLaboratoryRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretLaboratoryRoom');
  SecretLarderRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretLarderRoom');
  SecretLibraryRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretLibraryRoom');
  SecretMazeRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretMazeRoom');
  SecretRunestoneRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretRunestoneRoom');
  SecretSummoningRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretSummoningRoom');
  SecretWellRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretWellRoom');
  Game = $J.load('com.watabou.noosa.Game');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
