// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/utils/Bundle.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, BufferedInputStream, BufferedReader, BufferedWriter, Exception, GZIPInputStream, GZIPOutputStream, HashMap, IOException, IllegalArgumentException, InputStreamReader, JObject, JSONArray, JSONException, JSONObject, JSONTokener, JString, OutputStreamWriter, StringBuilder } from '../../../../jre/index.ts';

let Game, Reflection;

export class Bundle extends JObject {
  static readonly CLASS_NAME: string = '__className';
  static readonly DEFAULT_KEY: string = 'key';
  static aliases: HashMap<string, string> = null;
  data: JSONObject = null;
  static readonly compressByDefault: boolean = true;
  static readonly GZIP_BUFFER: number = 4096;
  _Bundle$(): this {
    this._Bundle$JSONObject(new JSONObject());
    return this;
  }
  _Bundle$JSONObject(data: JSONObject): this {
    this.data = data;
    return this;
  }
  toString(): string {
    return this.data.toString();
  }
  isNull(): boolean {
    return this.data == null;
  }
  contains(key: string): boolean {
    return !this.isNull() && !this.data.isNull(key);
  }
  remove(key: string): boolean {
    return this.data.remove(key) != null;
  }
  getKeys(): ArrayList<string> {
    let keys = this.data.keys();
    let result = new ArrayList();
    while (keys.hasNext()) {
      result.add(keys.next());
    }
    return result;
  }
  getBoolean(key: string): boolean {
    return this.data.optBoolean(key);
  }
  getInt(key: string): number {
    return this.data.optInt(key);
  }
  getLong(key: string): bigint {
    return this.data.optLong(key);
  }
  getFloat(key: string): number {
    return Math.fround(this.data.optDouble(key, 0));
  }
  getString(key: string): string {
    return this.data.optString(key);
  }
  getClass$String(key: string): JClass {
    let clName = JString.replace(this.getString(key), 'class ', '');
    if (!$J.equals(clName, '')) {
      if (Bundle.aliases.containsKey(clName)) {
        clName = Bundle.aliases.get(clName);
      }
      return Reflection.forName(clName);
    }
    return null;
  }
  getBundle(key: string): Bundle {
    return new Bundle()._Bundle$JSONObject(this.data.optJSONObject(key));
  }
  get$$Bundle(): Bundlable {
    if (this.data == null) {
      return null;
    }
    let clName = this.getString(Bundle.CLASS_NAME);
    if (Bundle.aliases.containsKey(clName)) {
      clName = Bundle.aliases.get(clName);
    }
    let cl = Reflection.forName(clName);
    if (cl != null && (!Reflection.isMemberClass(cl) || Reflection.isStatic(cl))) {
      let object$ = Reflection.newInstance(cl);
      if (object$ != null) {
        object$.restoreFromBundle(this);
        return object$;
      }
    }
    return null;
  }
  get$String(key: string): Bundlable {
    return this.getBundle(key).get$$Bundle();
  }
  getEnum<E>(key: string, enumClass: JClass<E>): E {
    try {
      return $J.enumValueOf(enumClass, this.data.getString(key));
    } catch ($e0) {
      if ($J.isa($e0, JSONException)) {
        let e = $J.exc($e0);
        Game.reportException(e);
        return enumClass.getEnumConstants()[0];
      } else if ($J.isa($e0, IllegalArgumentException)) {
        let e = $J.exc($e0);
        Game.reportException(e);
        return enumClass.getEnumConstants()[0];
      } else {
        throw $e0;
      }
    }
  }
  getIntArray(key: string): number[] {
    try {
      let array = this.data.getJSONArray(key);
      let length = array.length();
      let result = $J.newArray(length, 0);
      for (let i = 0; i < length; i++) {
        result[i] = array.getInt(i);
      }
      return result;
    } catch ($e1) {
      if ($J.isa($e1, JSONException)) {
        let e = $J.exc($e1);
        Game.reportException(e);
        return null;
      } else {
        throw $e1;
      }
    }
  }
  getLongArray(key: string): bigint[] {
    try {
      let array = this.data.getJSONArray(key);
      let length = array.length();
      let result = $J.newArray(length, 0n);
      for (let i = 0; i < length; i++) {
        result[i] = array.getLong(i);
      }
      return result;
    } catch ($e2) {
      if ($J.isa($e2, JSONException)) {
        let e = $J.exc($e2);
        Game.reportException(e);
        return null;
      } else {
        throw $e2;
      }
    }
  }
  getFloatArray(key: string): number[] {
    try {
      let array = this.data.getJSONArray(key);
      let length = array.length();
      let result = $J.newArray(length, 0);
      for (let i = 0; i < length; i++) {
        result[i] = Math.fround(array.optDouble(i, 0));
      }
      return result;
    } catch ($e3) {
      if ($J.isa($e3, JSONException)) {
        let e = $J.exc($e3);
        Game.reportException(e);
        return null;
      } else {
        throw $e3;
      }
    }
  }
  getBooleanArray(key: string): boolean[] {
    try {
      let array = this.data.getJSONArray(key);
      let length = array.length();
      let result = $J.newArray(length, false);
      for (let i = 0; i < length; i++) {
        result[i] = array.getBoolean(i);
      }
      return result;
    } catch ($e4) {
      if ($J.isa($e4, JSONException)) {
        let e = $J.exc($e4);
        Game.reportException(e);
        return null;
      } else {
        throw $e4;
      }
    }
  }
  getStringArray(key: string): string[] {
    try {
      let array = this.data.getJSONArray(key);
      let length = array.length();
      let result = $J.newArray(length, null);
      for (let i = 0; i < length; i++) {
        result[i] = array.getString(i);
      }
      return result;
    } catch ($e5) {
      if ($J.isa($e5, JSONException)) {
        let e = $J.exc($e5);
        Game.reportException(e);
        return null;
      } else {
        throw $e5;
      }
    }
  }
  getClassArray(key: string): JClass[] {
    try {
      let array = this.data.getJSONArray(key);
      let length = array.length();
      let result = $J.newArray(length, null);
      for (let i = 0; i < length; i++) {
        let clName = JString.replace(array.getString(i), 'class ', '');
        if (Bundle.aliases.containsKey(clName)) {
          clName = Bundle.aliases.get(clName);
        }
        let cl = Reflection.forName(clName);
        result[i] = cl;
      }
      return result;
    } catch ($e6) {
      if ($J.isa($e6, JSONException)) {
        let e = $J.exc($e6);
        Game.reportException(e);
        return null;
      } else {
        throw $e6;
      }
    }
  }
  getBundleArray$(): Bundle[] {
    return this.getBundleArray$String(Bundle.DEFAULT_KEY);
  }
  getBundleArray$String(key: string): Bundle[] {
    try {
      let array = this.data.getJSONArray(key);
      let length = array.length();
      let result = $J.newArray(length, null);
      for (let i = 0; i < length; i++) {
        result[i] = new Bundle()._Bundle$JSONObject(array.getJSONObject(i));
      }
      return result;
    } catch ($e7) {
      if ($J.isa($e7, JSONException)) {
        let e = $J.exc($e7);
        Game.reportException(e);
        return null;
      } else {
        throw $e7;
      }
    }
  }
  getCollection(key: string): Collection<Bundlable> {
    let list = new ArrayList();
    try {
      let array = this.data.getJSONArray(key);
      for (let i = 0; i < array.length(); i++) {
        let O = new Bundle()._Bundle$JSONObject(array.getJSONObject(i)).get$$Bundle();
        if (O != null) {
          list.add(O);
        }
      }
    } catch ($e8) {
      if ($J.isa($e8, JSONException)) {
        let e = $J.exc($e8);
        Game.reportException(e);
      } else {
        throw $e8;
      }
    }
    return list;
  }
  put$String$boolean(key: string, value: boolean): void {
    try {
      this.data.put(key, value);
    } catch ($e9) {
      if ($J.isa($e9, JSONException)) {
        let e = $J.exc($e9);
        Game.reportException(e);
      } else {
        throw $e9;
      }
    }
  }
  put$String$int(key: string, value: number): void {
    try {
      this.data.put(key, value);
    } catch ($e10) {
      if ($J.isa($e10, JSONException)) {
        let e = $J.exc($e10);
        Game.reportException(e);
      } else {
        throw $e10;
      }
    }
  }
  put$String$long(key: string, value: bigint): void {
    try {
      this.data.put(key, value);
    } catch ($e11) {
      if ($J.isa($e11, JSONException)) {
        let e = $J.exc($e11);
        Game.reportException(e);
      } else {
        throw $e11;
      }
    }
  }
  put$String$float(key: string, value: number): void {
    try {
      this.data.put(key, $J.boxD(value));
    } catch ($e12) {
      if ($J.isa($e12, JSONException)) {
        let e = $J.exc($e12);
        Game.reportException(e);
      } else {
        throw $e12;
      }
    }
  }
  put$String$String(key: string, value: string): void {
    try {
      this.data.put(key, value);
    } catch ($e13) {
      if ($J.isa($e13, JSONException)) {
        let e = $J.exc($e13);
        Game.reportException(e);
      } else {
        throw $e13;
      }
    }
  }
  put$String$Class(key: string, value: JClass): void {
    try {
      this.data.put(key, value);
    } catch ($e14) {
      if ($J.isa($e14, JSONException)) {
        let e = $J.exc($e14);
        Game.reportException(e);
      } else {
        throw $e14;
      }
    }
  }
  put$String$Bundle(key: string, bundle: Bundle): void {
    try {
      this.data.put(key, bundle.data);
    } catch ($e15) {
      if ($J.isa($e15, JSONException)) {
        let e = $J.exc($e15);
        Game.reportException(e);
      } else {
        throw $e15;
      }
    }
  }
  put$String$Bundlable(key: string, object$: Bundlable): void {
    if (object$ != null) {
      try {
        let bundle = new Bundle()._Bundle$();
        bundle.put$String$String(Bundle.CLASS_NAME, object$.getClass().getName());
        object$.storeInBundle(bundle);
        this.data.put(key, bundle.data);
      } catch ($e16) {
        if ($J.isa($e16, JSONException)) {
          let e = $J.exc($e16);
          Game.reportException(e);
        } else {
          throw $e16;
        }
      }
    }
  }
  put$String$Enum(key: string, value: JEnum<any>): void {
    if (value != null) {
      try {
        this.data.put(key, value.name());
      } catch ($e17) {
        if ($J.isa($e17, JSONException)) {
          let e = $J.exc($e17);
          Game.reportException(e);
        } else {
          throw $e17;
        }
      }
    }
  }
  put$String$intArr(key: string, array: number[]): void {
    try {
      let jsonArray = new JSONArray();
      for (let i = 0; i < array.length; i++) {
        jsonArray.put(i, array[i]);
      }
      this.data.put(key, jsonArray);
    } catch ($e18) {
      if ($J.isa($e18, JSONException)) {
        let e = $J.exc($e18);
        Game.reportException(e);
      } else {
        throw $e18;
      }
    }
  }
  put$String$longArr(key: string, array: bigint[]): void {
    try {
      let jsonArray = new JSONArray();
      for (let i = 0; i < array.length; i++) {
        jsonArray.put(i, array[i]);
      }
      this.data.put(key, jsonArray);
    } catch ($e19) {
      if ($J.isa($e19, JSONException)) {
        let e = $J.exc($e19);
        Game.reportException(e);
      } else {
        throw $e19;
      }
    }
  }
  put$String$floatArr(key: string, array: number[]): void {
    try {
      let jsonArray = new JSONArray();
      for (let i = 0; i < array.length; i++) {
        jsonArray.put(i, $J.boxD(array[i]));
      }
      this.data.put(key, jsonArray);
    } catch ($e20) {
      if ($J.isa($e20, JSONException)) {
        let e = $J.exc($e20);
        Game.reportException(e);
      } else {
        throw $e20;
      }
    }
  }
  put$String$booleanArr(key: string, array: boolean[]): void {
    try {
      let jsonArray = new JSONArray();
      for (let i = 0; i < array.length; i++) {
        jsonArray.put(i, array[i]);
      }
      this.data.put(key, jsonArray);
    } catch ($e21) {
      if ($J.isa($e21, JSONException)) {
        let e = $J.exc($e21);
        Game.reportException(e);
      } else {
        throw $e21;
      }
    }
  }
  put$String$StringArr(key: string, array: string[]): void {
    try {
      let jsonArray = new JSONArray();
      for (let i = 0; i < array.length; i++) {
        jsonArray.put(i, array[i]);
      }
      this.data.put(key, jsonArray);
    } catch ($e22) {
      if ($J.isa($e22, JSONException)) {
        let e = $J.exc($e22);
        Game.reportException(e);
      } else {
        throw $e22;
      }
    }
  }
  put$String$ClassArr(key: string, array: JClass[]): void {
    try {
      let jsonArray = new JSONArray();
      for (let i = 0; i < array.length; i++) {
        jsonArray.put(i, array[i].getName());
      }
      this.data.put(key, jsonArray);
    } catch ($e23) {
      if ($J.isa($e23, JSONException)) {
        let e = $J.exc($e23);
        Game.reportException(e);
      } else {
        throw $e23;
      }
    }
  }
  put$String$Collection(key: string, collection: Collection<Bundlable>): void {
    let array = new JSONArray();
    for (const $it24 = collection.iterator(); $it24.hasNext(); ) {
      let object$ = $it24.next();
      if (object$ != null) {
        let cl = object$.getClass();
        if (!Reflection.isMemberClass(cl) || Reflection.isStatic(cl)) {
          let bundle = new Bundle()._Bundle$();
          bundle.put$String$String(Bundle.CLASS_NAME, cl.getName());
          object$.storeInBundle(bundle);
          array.put(bundle.data);
        }
      }
    }
    try {
      this.data.put(key, array);
    } catch ($e25) {
      if ($J.isa($e25, JSONException)) {
        let e = $J.exc($e25);
        Game.reportException(e);
      } else {
        throw $e25;
      }
    }
  }
  static read(stream: InputStream): Bundle {
    try {
      if (!stream.markSupported()) {
        stream = new BufferedInputStream(stream, 2);
      }
      stream.mark(2);
      let header = $J.newArray(2, 0);
      stream.read(header);
      stream.reset();
      if (header[0] === ((31) << 24) >> 24 && header[1] === ((139) << 24) >> 24) {
        stream = new GZIPInputStream(stream, Bundle.GZIP_BUFFER);
      }
      let reader = new BufferedReader(new InputStreamReader(stream));
      let jsonBuilder = new StringBuilder();
      let line: string;
      while ((line = reader.readLine()) != null) {
        jsonBuilder.append(line);
        jsonBuilder.append('\n');
      }
      let jsonString = jsonBuilder.toString();
      let json = new JSONTokener(jsonString).nextValue();
      reader.close();
      if ($J.isa(json, JSONArray)) {
        json = new JSONObject().put(Bundle.DEFAULT_KEY, json);
      }
      if (!($J.isa(json, JSONObject))) {
        throw new JSONException('Malformed JSON Object: ' + jsonString);
      }
      return new Bundle()._Bundle$JSONObject(json);
    } catch ($e26) {
      if ($J.isa($e26, Exception)) {
        let e = $J.exc($e26);
        Game.reportException(e);
        throw new IOException();
      } else {
        throw $e26;
      }
    }
  }
  static write$Bundle$OutputStream(bundle: Bundle, stream: OutputStream): boolean {
    return Bundle.write$Bundle$OutputStream$boolean(bundle, stream, Bundle.compressByDefault);
  }
  static write$Bundle$OutputStream$boolean(bundle: Bundle, stream: OutputStream, compressed: boolean): boolean {
    try {
      let writer: BufferedWriter;
      if (compressed) {
        writer = new BufferedWriter(new OutputStreamWriter(new GZIPOutputStream(stream, Bundle.GZIP_BUFFER)));
      } else {
        writer = new BufferedWriter(new OutputStreamWriter(stream));
      }
      writer.write(bundle.data.toString());
      writer.close();
      return true;
    } catch ($e27) {
      if ($J.isa($e27, IOException)) {
        let e = $J.exc($e27);
        Game.reportException(e);
        return false;
      } else {
        throw $e27;
      }
    }
  }
  static addAlias(cl: JClass<any>, alias: string): void {
    Bundle.aliases.put(alias, cl.getName());
  }
  static $clinit() {
    Bundle.aliases = new HashMap();
  }
}

$J.define(Bundle, 'com.watabou.utils.Bundle', { kind: 'class', sup: 'java.lang.Object', ctors: { 'org.json.JSONObject': '_Bundle$JSONObject', '': '_Bundle$' }, meths: { 'write(com.watabou.utils.Bundle,java.io.OutputStream,boolean)': 'write$Bundle$OutputStream$boolean', 'write(com.watabou.utils.Bundle,java.io.OutputStream)': 'write$Bundle$OutputStream', 'put(java.lang.String,java.util.Collection)': 'put$String$Collection', 'put(java.lang.String,java.lang.Class[])': 'put$String$ClassArr', 'put(java.lang.String,java.lang.String[])': 'put$String$StringArr', 'put(java.lang.String,boolean[])': 'put$String$booleanArr', 'put(java.lang.String,float[])': 'put$String$floatArr', 'put(java.lang.String,long[])': 'put$String$longArr', 'put(java.lang.String,int[])': 'put$String$intArr', 'put(java.lang.String,java.lang.Enum)': 'put$String$Enum', 'put(java.lang.String,com.watabou.utils.Bundlable)': 'put$String$Bundlable', 'put(java.lang.String,com.watabou.utils.Bundle)': 'put$String$Bundle', 'put(java.lang.String,java.lang.Class)': 'put$String$Class', 'put(java.lang.String,java.lang.String)': 'put$String$String', 'put(java.lang.String,float)': 'put$String$float', 'put(java.lang.String,long)': 'put$String$long', 'put(java.lang.String,int)': 'put$String$int', 'put(java.lang.String,boolean)': 'put$String$boolean', 'getBundleArray(java.lang.String)': 'getBundleArray$String', 'getBundleArray()': 'getBundleArray$', 'get(java.lang.String)': 'get$String', 'get()': 'get$$Bundle', 'getClass(java.lang.String)': 'getClass$String' }, clinit: true, lazy: ['aliases'] });
$J.module(() => {
  Game = $J.load('com.watabou.noosa.Game');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
