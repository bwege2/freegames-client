// @ts-nocheck
// FlushablePool.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
/*******************************************************************************
 * Copyright 2011 See AUTHORS file.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ******************************************************************************/
import { $J } from '../../../../../jre/index.ts';
import { Pool } from './Pool.ts';

let Array_;

/**
 * A {@link Pool} which keeps track of the obtained items (see {@link #obtain()}), which can be free'd all at once using the
 * {@link #flush()} method.
 * @author Xoppa
 */
export class FlushablePool<T> extends Pool {
  obtained: Array_<T> = null;
  $init_FlushablePool() {
    this.obtained = new Array_()._Array$();
  }
  _FlushablePool$(): this {
    this._Pool$();
    this.$init_FlushablePool();
    return this;
  }
  obtain(): T {
    let result = super.obtain();
    this.obtained.add$Object(result);
    return result;
  }
  /**
   * Frees all obtained instances.
   */
  flush(): void {
    super.freeAll(this.obtained);
    this.obtained.clear();
  }
  free(object$: T): void {
    this.obtained.removeValue(object$, true);
    super.free(object$);
  }
  freeAll(objects: Array_<T>): void {
    this.obtained.removeAll(objects, true);
    super.freeAll(objects);
  }
}

$J.define(FlushablePool, 'com.badlogic.gdx.utils.FlushablePool', { kind: 'class', sup: 'com.badlogic.gdx.utils.Pool', ctors: { 'int,int': '_FlushablePool$int$int', 'int': '_FlushablePool$int', '': '_FlushablePool$' } });
$J.module(() => {
  Array_ = $J.load('com.badlogic.gdx.utils.Array');
});
