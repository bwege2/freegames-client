// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/util/CollectionUtils.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/**
 *  Copyright (C) 2002-2022   The FreeCol Team
 *
 *  This file is part of FreeCol.
 *
 *  FreeCol is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  FreeCol is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with FreeCol.  If not, see <http://www.gnu.org/licenses/>.
 */
import { $J, ArrayList, Arrays, Collections, Collector, Collector_Characteristics, Collectors, Comparator, HashMap, HashSet, JFunction, JObject, NoSuchElementException, RuntimeException, Stream, StreamSupport } from '../../../../../../jre/index.ts';

let CachingFunction, Utils;

/**
 * Collection of small static helper methods using Collections.
 */
export class CollectionUtils extends JObject {
  static readonly MAX_DEFAULT: number = -2147483648;
  static readonly MIN_DEFAULT: number = 2147483647;
  static readonly SUM_DEFAULT: number = 0;
  static readonly SUM_DOUBLE_DEFAULT: number = 0;
  static readonly PRODUCT_DEFAULT: number = 1;
  /**
   * Trivial integer accumulator.
   */
  static integerAccumulator: BinaryOperator<number> = null;
  /**
   * Trivial double accumulator.
   */
  static doubleAccumulator: BinaryOperator<number> = null;
  /**
   * Useful comparators for mapEntriesBy*
   */
  static ascendingIntegerComparator: Comparator<number> = null;
  static descendingIntegerComparator: Comparator<number> = null;
  static ascendingDoubleComparator: Comparator<number> = null;
  static descendingDoubleComparator: Comparator<number> = null;
  static ascendingListLengthComparator: Comparator<List<any>> = null;
  static descendingListLengthComparator: Comparator<List<any>> = null;
  _CollectionUtils(): this {
    return this;
  }
  /**
   * Make an unmodifiable set with specified members.
   *
   * @param <T> The type of the set members.
   * @param members The set members.
   * @return An unmodifiable set containing the members.
   */
  static makeUnmodifiableSet<T>(members: T[]): JSet<T> {
    let tmp = new HashSet(members.length);
    for (let t of members) {
      tmp.add(t);
    }
    return Collections.unmodifiableSet(tmp);
  }
  /**
   * Make an unmodifiable list with specified members.
   *
   * @param <T> The type of the list members.
   * @param members The list members.
   * @return An unmodifiable list containing the members.
   */
  static makeUnmodifiableList<T>(members: T[]): List<T> {
    let tmp = new ArrayList(members.length);
    for (let t of members) {
      tmp.add(t);
    }
    return Collections.unmodifiableList(tmp);
  }
  /**
   * Make an unmodifiable map with member pairs specified in two arrays.
   *
   * The array lengths *must* match.
   *
   * @param <K> The type of the keys.
   * @param <V> The type of the values.
   * @param keys The array of keys.
   * @param values The array of values.
   * @return An unmodifiable map containing the specified members.
   */
  static makeUnmodifiableMap<K, V>(keys: K[], values: V[]): JMap<K, V> {
    if (keys.length !== values.length) {
      throw new RuntimeException('Length mismatch: ' + keys.length + ' != ' + values.length);
    }
    let tmp = new HashMap(keys.length);
    for (let i = 0; i < keys.length; i++) {
      tmp.put(keys[i], values[i]);
    }
    return Collections.unmodifiableMap(tmp);
  }
  /**
   * Make a map from a flat list of key,value pairs.
   *
   * Tolerates odd lists.  Perhaps this should be an error.
   *
   * @param <T> The value type.
   * @param values The list of values.
   * @return A map derived from the values.
   */
  static asMap<T>(values: T[]): JMap<T, T> {
    let ret = new HashMap($J.idiv(values.length, 2));
    for (let i = 0; i < ((values.length - 1) | 0); i = (i + 2) | 0) {
      ret.put(values[i], values[(i + 1) | 0]);
    }
    return ret;
  }
  /**
   * Appends a value to a list member of a map with a given key.
   *
   * @param <T> The map value collection member type.
   * @param <K> The map key type.
   * @param map The {@code Map} to add to.
   * @param key The key with which to look up the list in the map.
   * @param value The value to append.
   */
  static appendToMapList<T, K>(map: JMap<K, List<T>>, key: K, value: T): void {
    let l = map.get(key);
    if (l == null) {
      l = new ArrayList();
      l.add(value);
      map.put(key, l);
    } else if (!l.contains(value)) {
      l.add(value);
    }
  }
  static accumulateToMap<K, V>(map: JMap<K, V>, key: K, value: V, accumulator: BinaryOperator<V>): void {
    let val = map.get(key);
    if (val == null) {
      map.put(key, value);
    } else {
      map.put(key, accumulator(val, value));
    }
  }
  static accumulateMap<K, V>(map1: JMap<K, V>, map2: JMap<K, V>, accumulator: BinaryOperator<V>): void {
    CollectionUtils.forEachMapEntry$Map$Consumer(map2, (e) => CollectionUtils.accumulateToMap(map1, e.getKey(), e.getValue(), accumulator));
  }
  /**
   * Increment the count in an integer valued map for a given key.
   *
   * @param <K> The map key type.
   * @param map The map to increment within.
   * @param key The key to increment the value for.
   * @return The new count associated with the key.
   */
  static incrementMapCount<K>(map: JMap<K, number>, key: K): number {
    let val = map.get(key);
    if (val == null) {
      val = 1;
    } else {
      val = (val + 1) | 0;
    }
    map.put(key, val);
    return val;
  }
  /**
   * Given a list, return an iterable that yields all permutations
   * of the original list.
   *
   * Obviously combinatorial explosion will occur, so use with
   * caution only on lists that are known to be short.
   *
   * @param <T> The list member type.
   * @param l The original list.
   * @return A iterable yielding all the permutations of the original list.
   */
  static getPermutations<T>(l: List<T>): Iterable<List<T>> {
    if (l == null) {
      return null;
    }
    return new (CollectionUtils$1())().$c(l);
  }
  /**
   * Are all members of a collection the same (in the sense of ==).
   *
   * @param <T> The collection member type.
   * @param c The {@code Collection} to examine.
   * @return True if all members are the same.
   */
  static allSame<T>(c: Collection<T>): boolean {
    let datum = null;
    let first = true;
    for (const $it0 = c.iterator(); $it0.hasNext(); ) {
      let t = $it0.next();
      if (first) {
        datum = t;
      } else if (t !== datum) {
        return false;
      }
      first = false;
    }
    return true;
  }
  /**
   * Rotate a list by N places.
   *
   * @param <T> The list member type.
   * @param list The {@code List} to rotate.
   * @param n The number of places to rotate by (positive or negative).
   */
  static rotate<T>(list: List<T>, n: number): void {
    let len = list.size();
    if (len <= 0 || n === 0) {
      return;
    }
    n %= len;
    if (n > 0) {
      for (; n > 0; n--) {
        let t = list.removeAt(0);
        list.add(t);
      }
    } else {
      for (; n < 0; n++) {
        let t = list.removeAt((n - 1) | 0);
        list.add(0, t);
      }
    }
  }
  /**
   * Reverse a list.
   *
   * @param <T> The list member type.
   * @param list The {@code List} to reverse.
   */
  static reverse<T>(list: List<T>): void {
    let len = list.size();
    if (len <= 0) {
      return;
    }
    for (let i = 0, j = (len - 1) | 0; i < j; i++, j--) {
      let t = list.get(i);
      list.set(i, list.get(j));
      list.set(j, t);
    }
  }
  /**
   * Check if two lists contents are equal but also checks for null.
   *
   * @param <T> The list member type.
   * @param one First list to compare
   * @param two Second list to compare
   * @return True if the list contents are all either both null or
   *     equal in the sense of their equals() method.
   */
  static listEquals<T>(one: List<T>, two: List<T>): boolean {
    if (one == null) {
      return two == null;
    }
    if (two == null) {
      return false;
    }
    let oneI = one.iterator();
    let twoI = two.iterator();
    for (; ; ) {
      if (oneI.hasNext()) {
        if (twoI.hasNext()) {
          if (!Utils.equals(oneI.next(), twoI.next())) {
            break;
          }
        } else {
          break;
        }
      } else {
        return !twoI.hasNext();
      }
    }
    return false;
  }
  /**
   * Get the entries in a map in a sorted order.
   *
   * @param <K> The map key type.
   * @param <V> The map value type.
   * @param map The {@code Map} to extract entries from.
   * @return A list of entries from the map sorted by key.
   */
  static mapEntriesByKey$Map<K, V>(map: JMap<K, V>): List<Map_Entry<K, V>> {
    return CollectionUtils.sort$Collection$Comparator(map.entrySet(), Comparator.comparing(($p0) => $p0.getKey()));
  }
  /**
   * Get the entries in a map in a sorted order.
   *
   * @param <K> The map key type.
   * @param <V> The map value type.
   * @param map The {@code Map} to extract entries from.
   * @param comparator A {@code Comparator} for the values.
   * @return A list of entries from the map sorted by key.
   */
  static mapEntriesByKey$Map$Comparator<K, V>(map: JMap<K, V>, comparator: Comparator<K>): List<Map_Entry<K, V>> {
    return CollectionUtils.sort$Collection$Comparator(map.entrySet(), Comparator.comparing(($p0) => $p0.getKey(), comparator));
  }
  /**
   * Get the entries in a map in a sorted order.
   *
   * @param <K> The map key type.
   * @param <V> The map value type.
   * @param map The {@code Map} to extract entries from.
   * @return A list of entries from the map sorted by key.
   */
  static mapEntriesByValue$Map<K, V>(map: JMap<K, V>): List<Map_Entry<K, V>> {
    return CollectionUtils.sort$Collection$Comparator(map.entrySet(), Comparator.comparing(($p0) => $p0.getValue()));
  }
  /**
   * Get the entries in a map in a sorted order.
   *
   * @param <K> The map key type.
   * @param <V> The map value type.
   * @param map The {@code Map} to extract entries from.
   * @param comparator A {@code Comparator} for the values.
   * @return A list of entries from the map sorted by value.
   */
  static mapEntriesByValue$Map$Comparator<K, V>(map: JMap<K, V>, comparator: Comparator<V>): List<Map_Entry<K, V>> {
    return CollectionUtils.sort$Collection$Comparator(map.entrySet(), Comparator.comparing(($p0) => $p0.getValue(), comparator));
  }
  /**
   * Do all members of an array match a predicate?
   *
   * @param <T> The array member type.
   * @param array The array to test.
   * @param predicate The {@code Predicate} to test with.
   * @return True if all members pass the predicate test.
   */
  static all$ObjectArr$Predicate<T>(array: T[], predicate: Predicate<any>): boolean {
    return (array == null) ? true : CollectionUtils.all_internal(Arrays.stream(array), predicate);
  }
  /**
   * Do all members of an collection match a predicate?
   *
   * @param <T> The collection member type.
   * @param c The {@code Collection} to test.
   * @param predicate The {@code Predicate} to test with.
   * @return True if all members pass the predicate test.
   */
  static all$Collection$Predicate<T>(c: Collection<T>, predicate: Predicate<any>): boolean {
    return (c == null) ? true : CollectionUtils.all_internal(c.stream(), predicate);
  }
  /**
   * Do all members of an stream match a predicate?
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to test.
   * @param predicate The {@code Predicate} to test with.
   * @return True if all members pass the predicate test.
   */
  static all$Stream$Predicate<T>(stream: Stream<T>, predicate: Predicate<any>): boolean {
    return (stream == null) ? true : CollectionUtils.all_internal(stream, predicate);
  }
  /**
   * Implementation of all().
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to test.
   * @param predicate The {@code Predicate} to test with.
   * @return True if all members pass the predicate test.
   */
  static all_internal<T>(stream: Stream<T>, predicate: Predicate<any>): boolean {
    return stream.allMatch(predicate);
  }
  /**
   * Helper to create a predicate which is always true.
   *
   * @param <T> The stream member type.
   * @return The always valid predicate for the stream type.
   */
  static alwaysTrue<T>(): Predicate<T> {
    return (t) => true;
  }
  /**
   * Is an array non-empty?
   *
   * @param <T> The array member type.
   * @param array The array to test.
   * @return True if the array is non-empty.
   */
  static any$ObjectArr<T>(array: T[]): boolean {
    return array != null && array.length > 0;
  }
  /**
   * Does any member of an array match a predicate?
   *
   * @param <T> The array member type.
   * @param array The array to test.
   * @param predicate The {@code Predicate} to test with.
   * @return True if any member passes the predicate test.
   */
  static any$ObjectArr$Predicate<T>(array: T[], predicate: Predicate<any>): boolean {
    return CollectionUtils.any_internal(Arrays.stream(array), predicate);
  }
  /**
   * Is a collection non-empty?
   *
   * @param <T> The collection member type.
   * @param c The {@code Collection} to test.
   * @return True if the collection is non-empty.
   */
  static any$Collection<T>(c: Collection<T>): boolean {
    return c != null && !c.isEmpty();
  }
  /**
   * Does any member of a collection match a predicate?
   *
   * @param <T> The collection member type.
   * @param c The {@code Collection} to test.
   * @param predicate The {@code Predicate} to test with.
   * @return True if any member passes the predicate test.
   */
  static any$Collection$Predicate<T>(c: Collection<T>, predicate: Predicate<any>): boolean {
    return (c == null) ? false : CollectionUtils.any_internal(c.stream(), predicate);
  }
  /**
   * Is a stream non-empty?
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to test.
   * @return True if the stream is non-empty.
   */
  static any$Stream<T>(stream: Stream<T>): boolean {
    return stream != null && stream.findFirst().isPresent();
  }
  /**
   * Does any member of a stream match a predicate?
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to test.
   * @param predicate The {@code Predicate} to test with.
   * @return True if any member passes the predicate test.
   */
  static any$Stream$Predicate<T>(stream: Stream<T>, predicate: Predicate<any>): boolean {
    return (stream == null) ? false : CollectionUtils.any_internal(stream, predicate);
  }
  /**
   * Implementation of any().
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to test.
   * @param predicate The {@code Predicate} to test with.
   * @return True if any member passes the predicate test.
   */
  static any_internal<T>(stream: Stream<T>, predicate: Predicate<any>): boolean {
    return stream.anyMatch(predicate);
  }
  /**
   * Helper to create a caching ToIntFunction.
   *
   * @param <T> The argument type to be converted to int.
   * @param f The integer valued function to cache.
   * @return A caching {@code ToIntFunction}.
   */
  static cacheInt<T>(f: JFunction<T, number>): ToIntFunction<T> {
    return (t) => new CachingFunction()._CachingFunction(f).apply(t);
  }
  /**
   * Helper to create a caching comparator.
   *
   * @param <T> The argument type to be converted to int.
   * @param f The integer valued function to use in comparison.
   * @return A caching {@code Comparator}.
   */
  static cachingIntComparator<T>(f: JFunction<T, number>): Comparator<T> {
    return Comparator.comparingInt(CollectionUtils.cacheInt(f));
  }
  /**
   * Helper to create a caching ToDoubleFunction.
   *
   * @param <T> The argument type to be converted to double.
   * @param f The double valued function to cache.
   * @return A caching {@code ToDoubleFunction}.
   */
  static cacheDouble<T>(f: JFunction<T, number>): ToDoubleFunction<T> {
    return (t) => +new CachingFunction()._CachingFunction(f).apply(t);
  }
  /**
   * Helper to create a caching comparator.
   *
   * @param <T> The argument type to be converted to double.
   * @param f The double valued function to use in comparison.
   * @return A caching {@code Comparator}.
   */
  static cachingDoubleComparator<T>(f: JFunction<T, number>): Comparator<T> {
    return Comparator.comparingDouble(CollectionUtils.cacheDouble(f));
  }
  /**
   * Concatenate streams.
   *
   * @param <T> Generic type of {@link Stream}
   * @param s0 The first {@code Stream}.
   * @param streams The {@code Stream}s to concatenate (nulls ignored).
   * @return The concatenated stream.
   */
  static concat<T>(s0: Stream<T>, streams: Stream<T>[]): Stream<T> {
    let sts = streams;
    let ret = (s0 == null) ? Stream.empty() : s0;
    for (let i = 0; i < sts.length; i++) {
      if (sts[i] != null) {
        ret = Stream.concat(ret, sts[i]);
      }
    }
    return ret;
  }
  /**
   * Count the number of members of an array.
   *
   * @param <T> The array member type.
   * @param array The array to check.
   * @return The number of items that matched.
   */
  static count$ObjectArr<T>(array: T[]): number {
    return (array == null) ? 0 : array.length;
  }
  /**
   * Count the number of members of an array that match a predicate.
   *
   * @param <T> The array member type.
   * @param array The array to check.
   * @param predicate A {@code Predicate} to test with.
   * @return The number of items that matched.
   */
  static count$ObjectArr$Predicate<T>(array: T[], predicate: Predicate<any>): number {
    return CollectionUtils.count_internal(Arrays.stream(array), predicate);
  }
  /**
   * Count the number of members of a collection that match a predicate.
   *
   * @param <T> The collection member type.
   * @param c The {@code Collection} to check.
   * @return The number of items that matched.
   */
  static count$Collection<T>(c: Collection<T>): number {
    return (c == null) ? 0 : c.size();
  }
  /**
   * Count the number of members of a collection that match a predicate.
   *
   * @param <T> The collection member type.
   * @param c The {@code Collection} to check.
   * @param predicate A {@code Predicate} to test with.
   * @return The number of items that matched.
   */
  static count$Collection$Predicate<T>(c: Collection<T>, predicate: Predicate<any>): number {
    return CollectionUtils.count_internal(c.stream(), predicate);
  }
  /**
   * Count the number of members of a stream.
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to check.
   * @return The number of items that matched.
   */
  static count$Stream<T>(stream: Stream<T>): number {
    return (stream == null) ? 0 : CollectionUtils.count_internal(stream, CollectionUtils.alwaysTrue());
  }
  /**
   * Count the number of members of a stream that match a predicate.
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to check.
   * @param predicate A {@code Predicate} to test with.
   * @return The number of items that matched.
   */
  static count$Stream$Predicate<T>(stream: Stream<T>, predicate: Predicate<any>): number {
    return (stream == null) ? 0 : CollectionUtils.count_internal(stream, predicate);
  }
  /**
   * Implement count().
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to check.
   * @param predicate A {@code Predicate} to test with.
   * @return The number of items that matched.
   */
  static count_internal<T>(stream: Stream<T>, predicate: Predicate<any>): number {
    return (stream.filter(predicate).count()) | 0;
  }
  /**
   * Dump an array to {@code System.err}.
   *
   * @param <T> The collection to dump
   * @param header Optional informational string to print first.
   * @param array The array to dump.
   */
  static dump$String$ObjectArr<T>(header: string, array: T[]): void {
    CollectionUtils.dump_internal(header, Arrays.stream(array));
  }
  /**
   * Dump a collection to {@code System.err}.
   *
   * @param header Optional informational string to print first.
   * @param c The {@code Collection} to print.
   */
  static dump$String$Collection(header: string, c: Collection<any>): void {
    CollectionUtils.dump_internal(header, c.stream());
  }
  /**
   * Dump a stream to {@code System.err}.
   *
   * @param header Optional informational string to print first.
   * @param stream The {@code Stream} to print.
   */
  static dump$String$Stream(header: string, stream: Stream<any>): void {
    CollectionUtils.dump_internal(header, stream);
  }
  /**
   * Implement dump().
   *
   * @param header Optional informational string to print first.
   * @param stream The {@code Stream} to print.
   */
  static dump_internal(header: string, stream: Stream<any>): void {
    if (header != null) {
      $J.err.print(header);
    }
    $J.err.print('[ ');
    CollectionUtils.forEach$Stream$Consumer(stream, (v) => {
      $J.err.print($J.str(v));
      $J.err.print(String.fromCharCode(32 /* ' ' */));
    });
    $J.err.println(String.fromCharCode(93 /* ']' */));
  }
  /**
   * Dump a map to {@code System.err}.
   *
   * @param header Optional informational string to print first.
   * @param map The {@code Map} to print.
   */
  static dump$String$Map(header: string, map: JMap<any, any>): void {
    if (header != null) {
      $J.err.print(header);
    }
    $J.err.print('[ ');
    CollectionUtils.forEachMapEntry$Map$Consumer(map, (e) => {
      $J.err.print($J.str(e.getKey()));
      $J.err.print(String.fromCharCode(44 /* ',' */));
      $J.err.print($J.str(e.getValue()));
      $J.err.print(String.fromCharCode(32 /* ' ' */));
    });
    $J.err.println(String.fromCharCode(93 /* ']' */));
  }
  /**
   * Create a stream of files from a directory.
   *
   * @param dir The {@code File} that hopefully is a directory.
   * @return A stream of {@code File}s.
   */
  static fileStream$File(dir: File): Stream<File> {
    let files: File[];
    return (dir == null || !dir.isDirectory() || (files = dir.listFiles()) == null) ? Stream.empty() : Arrays.stream(files);
  }
  /**
   * Create a stream of files from a directory, that each match a predicate.
   *
   * @param dir The {@code File} that hopefully is a directory.
   * @param predicate The {@code Predicate} to match with.
   * @return A stream of matching {@code File}s.
   */
  static fileStream$File$Predicate(dir: File, predicate: Predicate<any>): Stream<File> {
    return CollectionUtils.fileStream$File(dir).filter(predicate);
  }
  /**
   * Simple stream search for the first item that matches a predicate.
   *
   * @param <T> The array member type.
   * @param array The array to search.
   * @param predicate A {@code Predicate} to match with.
   * @return The item found, or null if not found.
   */
  static find$ObjectArr$Predicate<T>(array: T[], predicate: Predicate<any>): T {
    return CollectionUtils.find_internal(Arrays.stream(array), predicate, null);
  }
  /**
   * Simple stream search for the first item that matches a predicate.
   *
   * @param <T> The array member type.
   * @param array The array to search.
   * @param predicate A {@code Predicate} to match with.
   * @param fail The result to return on failure.
   * @return The item found, or fail if not found.
   */
  static find$ObjectArr$Predicate$Object<T>(array: T[], predicate: Predicate<any>, fail: T): T {
    return CollectionUtils.find_internal(Arrays.stream(array), predicate, fail);
  }
  /**
   * Simple stream search for the first item that matches a predicate.
   *
   * @param <T> The collection member type.
   * @param c The {@code Collection} to search.
   * @param predicate A {@code Predicate} to match with.
   * @return The item found, or null if not found.
   */
  static find$Collection$Predicate<T>(c: Collection<T>, predicate: Predicate<any>): T {
    return CollectionUtils.find_internal(c.stream(), predicate, null);
  }
  /**
   * Simple stream search for the first item that matches a predicate.
   *
   * @param <T> The collection member type.
   * @param c The {@code Collection} to search.
   * @param predicate A {@code Predicate} to match with.
   * @param fail The value to return if nothing is found.
   * @return The item found, or fail if not found.
   */
  static find$Collection$Predicate$Object<T>(c: Collection<T>, predicate: Predicate<any>, fail: T): T {
    return CollectionUtils.find_internal(c.stream(), predicate, fail);
  }
  /**
   * Simple stream search for the first item that matches a predicate.
   *
   * @param <T> The stream member type.
   * @param stream A {@code Stream} to search.
   * @param predicate A {@code Predicate} to match with.
   * @return The item found, or null if not found.
   */
  static find$Stream$Predicate<T>(stream: Stream<T>, predicate: Predicate<any>): T {
    return (stream == null) ? null : CollectionUtils.find_internal(stream, predicate, null);
  }
  /**
   * Simple stream search for the first item that matches a predicate.
   *
   * @param <T> The stream member type.
   * @param stream A {@code Stream} to search.
   * @param predicate A {@code Predicate} to match with.
   * @param fail The value to return if nothing is found.
   * @return The item found, or fail if not found.
   */
  static find$Stream$Predicate$Object<T>(stream: Stream<T>, predicate: Predicate<any>, fail: T): T {
    return (stream == null) ? fail : CollectionUtils.find_internal(stream, predicate, fail);
  }
  /**
   * Implement find().
   *
   * @param <T> The stream member type.
   * @param stream A {@code Stream} to search.
   * @param predicate A {@code Predicate} to match with.
   * @param fail The value to return if nothing is found.
   * @return The item found, or fail if not found.
   */
  static find_internal<T>(stream: Stream<T>, predicate: Predicate<any>, fail: T): T {
    return CollectionUtils.first_internal(stream.filter(predicate), fail);
  }
  /**
   * Get the first item of an array.
   *
   * @param <T> The array member type.
   * @param array The {@code Collection} to search.
   * @return The first item, or null on failure.
   */
  static first$ObjectArr<T>(array: T[]): T {
    return (array == null || array.length === 0) ? null : CollectionUtils.first_internal(Arrays.stream(array), null);
  }
  /**
   * Get the first item of a collection.
   *
   * @param <T> Generic type T
   * @param c The {@code Collection} to search.
   * @return The first item, or null on failure.
   */
  static first$Collection<T>(c: Collection<T>): T {
    return (c == null || c.isEmpty()) ? null : CollectionUtils.first_internal(c.stream(), null);
  }
  /**
   * Get the first item of a stream.
   *
   * @param <T> Generic type T
   * @param stream The {@code Stream} to search.
   * @return The first item, or null on failure.
   */
  static first$Stream<T>(stream: Stream<T>): T {
    return (stream == null) ? null : CollectionUtils.first_internal(stream, null);
  }
  /**
   * Implement first().
   *
   * @param <T> Generic type T
   * @param stream The {@code Stream} to search.
   * @param fail The value to return on failure.
   * @return The first item, or fail on failure.
   */
  static first_internal<T>(stream: Stream<T>, fail: T): T {
    return stream.findFirst().orElse(fail);
  }
  /**
   * Flatten an array into a stream derived from its component streams.
   *
   * @param <T> The array member type.
   * @param <R> The resulting stream member type.
   * @param array The array to flatten.
   * @param mapper A mapping {@code Function} to apply.
   * @return A stream of the mapped collection.
   */
  static flatten$ObjectArr$Function<T, R>(array: T[], mapper: JFunction<any, Stream<R>>): Stream<R> {
    return CollectionUtils.flatten_internal(Arrays.stream(array), CollectionUtils.alwaysTrue(), mapper);
  }
  /**
   * Flatten an array into a stream derived from its component streams.
   *
   * @param <T> The array member type.
   * @param <R> The resulting stream member type.
   * @param array The array to flatten.
   * @param predicate A {@code Predicate} to filter the collection with.
   * @param mapper A mapping {@code Function} to apply.
   * @return A stream of the mapped collection.
   */
  static flatten$ObjectArr$Predicate$Function<T, R>(array: T[], predicate: Predicate<any>, mapper: JFunction<any, Stream<R>>): Stream<R> {
    return CollectionUtils.flatten_internal(Arrays.stream(array), predicate, mapper);
  }
  /**
   * Flatten a collection into a stream derived from its component streams.
   *
   * @param <T> The collection member type.
   * @param <R> The resulting stream member type.
   * @param c The {@code Collection} to flatten.
   * @param mapper A mapping {@code Function} to apply.
   * @return A stream of the mapped collection.
   */
  static flatten$Collection$Function<T, R>(c: Collection<T>, mapper: JFunction<any, Stream<R>>): Stream<R> {
    return CollectionUtils.flatten_internal(c.stream(), CollectionUtils.alwaysTrue(), mapper);
  }
  /**
   * Flatten a collection into a stream derived from its component streams.
   *
   * @param <T> The collection member type.
   * @param <R> The resulting stream member type.
   * @param c The {@code Collection} to flatten.
   * @param predicate A {@code Predicate} to filter the collection with.
   * @param mapper A mapping {@code Function} to apply.
   * @return A stream of the mapped collection.
   */
  static flatten$Collection$Predicate$Function<T, R>(c: Collection<T>, predicate: Predicate<any>, mapper: JFunction<any, Stream<R>>): Stream<R> {
    return CollectionUtils.flatten_internal(c.stream(), predicate, mapper);
  }
  /**
   * Flatten the members of a stream.
   *
   * @param <T> The stream member type.
   * @param <R> The resulting stream member type.
   * @param stream The {@code Stream} to flatten.
   * @param mapper A mapping {@code Function} to apply.
   * @return A stream of the mapped stream.
   */
  static flatten$Stream$Function<T, R>(stream: Stream<T>, mapper: JFunction<any, Stream<R>>): Stream<R> {
    return (stream == null) ? Stream.empty() : CollectionUtils.flatten_internal(stream, CollectionUtils.alwaysTrue(), mapper);
  }
  /**
   * Flatten the members of a stream.
   *
   * @param <T> The stream member type.
   * @param <R> The resulting stream member type.
   * @param stream The {@code Stream} to flatten.
   * @param predicate A {@code Predicate} to filter the collection with.
   * @param mapper A mapping {@code Function} to apply.
   * @return A stream of the mapped stream.
   */
  static flatten$Stream$Predicate$Function<T, R>(stream: Stream<T>, predicate: Predicate<any>, mapper: JFunction<any, Stream<R>>): Stream<R> {
    return (stream == null) ? Stream.empty() : CollectionUtils.flatten_internal(stream, predicate, mapper);
  }
  /**
   * Flatten the members of a stream.
   *
   * @param <T> The stream member type.
   * @param <R> The resulting stream member type.
   * @param stream The {@code Stream} to flatten.
   * @param predicate A {@code Predicate} to filter the collection with.
   * @param mapper A mapping {@code Function} to apply.
   * @return A stream of the mapped stream.
   */
  static flatten_internal<T, R>(stream: Stream<T>, predicate: Predicate<any>, mapper: JFunction<any, Stream<R>>): Stream<R> {
    return stream.filter(predicate).flatMap(mapper);
  }
  /**
   * Apply a consumer to the entries of a map.
   *
   * @param <K> The map key type.
   * @param <V> The map value type.
   * @param map The {@code Map} to apply to.
   * @param consumer A {@code Consumer} to apply.
   */
  static forEachMapEntry$Map$Consumer<K, V>(map: JMap<K, V>, consumer: Consumer<Map_Entry<K, V>>): void {
    if (consumer != null && map != null && !map.isEmpty()) {
      CollectionUtils.forEach_internal(map.entrySet().stream(), CollectionUtils.alwaysTrue(), consumer);
    }
  }
  /**
   * Apply a consumer to the entries of a map that match a predicate.
   *
   * @param <K> The map key type.
   * @param <V> The map value type.
   * @param map The {@code Map} to apply to.
   * @param predicate The {@code Predicate} to match.
   * @param consumer A {@code Consumer} to apply.
   */
  static forEachMapEntry$Map$Predicate$Consumer<K, V>(map: JMap<K, V>, predicate: Predicate<Map_Entry<K, V>>, consumer: Consumer<Map_Entry<K, V>>): void {
    if (consumer != null && map != null && !map.isEmpty()) {
      CollectionUtils.forEach_internal(map.entrySet().stream(), predicate, consumer);
    }
  }
  /**
   * Apply a consumer to the members of an array.
   *
   * @param <T> The array member type.
   * @param array The array to apply to.
   * @param consumer A {@code Consumer} to apply.
   */
  static forEach$ObjectArr$Consumer<T>(array: T[], consumer: Consumer<any>): void {
    if (array != null && consumer != null) {
      CollectionUtils.forEach_internal(Arrays.stream(array), CollectionUtils.alwaysTrue(), consumer);
    }
  }
  /**
   * Apply a consumer to the members of an array that match a predicate.
   *
   * @param <T> The array member type.
   * @param array The array to apply to.
   * @param predicate A {@code Predicate} to gate the application.
   * @param consumer A {@code Consumer} to apply.
   */
  static forEach$ObjectArr$Predicate$Consumer<T>(array: T[], predicate: Predicate<any>, consumer: Consumer<any>): void {
    if (array != null && consumer != null) {
      CollectionUtils.forEach_internal(Arrays.stream(array), predicate, consumer);
    }
  }
  /**
   * Apply a consumer to the members of a collection.
   *
   * @param <T> The collection member type.
   * @param c The {@code Collection} to apply to.
   * @param consumer A {@code Consumer} to apply.
   */
  static forEach$Collection$Consumer<T>(c: Collection<T>, consumer: Consumer<any>): void {
    if (c != null && !c.isEmpty() && consumer != null) {
      CollectionUtils.forEach_internal(c.stream(), CollectionUtils.alwaysTrue(), consumer);
    }
  }
  /**
   * Apply a consumer to the members of a collection that match a predicate.
   *
   * @param <T> The collection member type.
   * @param c The {@code Collection} to apply to.
   * @param predicate A {@code Predicate} to gate the application.
   * @param consumer A {@code Consumer} to apply.
   */
  static forEach$Collection$Predicate$Consumer<T>(c: Collection<T>, predicate: Predicate<any>, consumer: Consumer<any>): void {
    if (c != null && !c.isEmpty() && consumer != null) {
      CollectionUtils.forEach_internal(c.stream(), predicate, consumer);
    }
  }
  /**
   * Apply a consumer to the members of a stream.
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to apply to.
   * @param consumer A {@code Consumer} to apply.
   */
  static forEach$Stream$Consumer<T>(stream: Stream<T>, consumer: Consumer<any>): void {
    if (stream != null && consumer != null) {
      CollectionUtils.forEach_internal(stream, CollectionUtils.alwaysTrue(), consumer);
    }
  }
  /**
   * Apply a consumer to the members of a stream that match a predicate.
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to apply to.
   * @param predicate A {@code Predicate} to gate the application.
   * @param consumer A {@code Consumer} to apply.
   */
  static forEach$Stream$Predicate$Consumer<T>(stream: Stream<T>, predicate: Predicate<any>, consumer: Consumer<any>): void {
    if (stream != null && consumer != null) {
      CollectionUtils.forEach_internal(stream, predicate, consumer);
    }
  }
  /**
   * Implement forEach.
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to apply to.
   * @param predicate A {@code Predicate} to gate the application.
   * @param consumer A {@code Consumer} to apply.
   */
  static forEach_internal<T>(stream: Stream<T>, predicate: Predicate<any>, consumer: Consumer<any>): void {
    stream.filter(predicate).forEach(consumer);
  }
  /**
   * Create a predicate for a type that returns true if the argument is
   * not null.
   *
   * @param <T> The input type.
   * @return A suitable {@code Predicate}.
   */
  static isNotNull$<T>(): Predicate<T> {
    return (t) => t != null;
  }
  /**
   * Create a predicate for a type that returns true if the argument is
   * not null.
   *
   * @param <T> The input type.
   * @param <V> A type to transform to.
   * @param mapper A function to transform the input type.
   * @return A suitable {@code Predicate}.
   */
  static isNotNull$Function<T, V>(mapper: JFunction<any, V>): Predicate<T> {
    return (t) => mapper(t) != null;
  }
  /**
   * Create a predicate for a type that returns true if the argument is
   * null.
   *
   * @param <T> The input type.
   * @return A suitable {@code Predicate}.
   */
  static isNull$<T>(): Predicate<T> {
    return (t) => t == null;
  }
  /**
   * Create a predicate for a type that returns true if the argument is
   * not null.
   *
   * @param <T> The input type.
   * @param <V> A type to transform to.
   * @param mapper A function to transform the input type.
   * @return A suitable {@code Predicate}.
   */
  static isNull$Function<T, V>(mapper: JFunction<any, V>): Predicate<T> {
    return (t) => mapper(t) == null;
  }
  /**
   * Convenience function to convert a stream to an iterable.
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to convert.
   * @return The suitable {@code Iterable}.
   */
  static iterable<T>(stream: Stream<T>): Iterable<T> {
    return new (CollectionUtils$2())().$c(stream);
  }
  /**
   * Create a stream from an array and an immediate mapping transform.
   *
   * @param <T> The array member type.
   * @param <R> The resulting stream member type.
   * @param array The array to search.
   * @param mapper A mapping {@code Function} to apply.
   * @return The resulting {@code Stream}.
   */
  static map$ObjectArr$Function<T, R>(array: T[], mapper: JFunction<any, R>): Stream<R> {
    return CollectionUtils.map_internal(Arrays.stream(array), mapper);
  }
  /**
   * Create a stream from a collection and an immediate mapping transform.
   *
   * @param <T> The collection member type.
   * @param <R> The resulting stream member type.
   * @param c The {@code Collection} to search.
   * @param mapper A mapping {@code Function} to apply.
   * @return The resulting {@code Stream}.
   */
  static map$Collection$Function<T, R>(c: Collection<T>, mapper: JFunction<any, R>): Stream<R> {
    return CollectionUtils.map_internal(c.stream(), mapper);
  }
  /**
   * Apply a mapping to a stream.
   *
   * @param <T> Generic type T
   * @param <R> Generic type R
   * @param stream The {@code Stream} to map.
   * @param mapper A mapping {@code Function} to apply.
   * @return The resulting {@code Stream}.
   */
  static map$Stream$Function<T, R>(stream: Stream<T>, mapper: JFunction<any, R>): Stream<R> {
    return (stream == null) ? Stream.empty() : CollectionUtils.map_internal(stream, mapper);
  }
  /**
   * Implement map.
   *
   * @param <T> Generic type T
   * @param <R> Generic type R
   * @param stream The {@code Stream} to map.
   * @param mapper A mapping {@code Function} to apply.
   * @return The resulting {@code Stream}.
   */
  static map_internal<T, R>(stream: Stream<T>, mapper: JFunction<any, R>): Stream<R> {
    return stream.map(mapper);
  }
  /**
   * Create a predicate for a type that returns true if it equals a key.
   *
   * @param <T> The input type.
   * @param key The key to match.
   * @return A suitable {@code Predicate}.
   */
  static matchKey$Object<T>(key: T): Predicate<T> {
    return (t) => t === key;
  }
  /**
   * Create a predicate for a type that returns true if it equals a key
   * in the sense of "equals".
   *
   * @param <T> The input type.
   * @param key The key to match.
   * @return A suitable {@code Predicate}.
   */
  static matchKeyEquals$Object<T>(key: T): Predicate<T> {
    return (t) => Utils.equals(t, key);
  }
  /**
   * Create a predicate for a type that returns true if a mapper applied
   * to it causes it to equal a key.
   *
   * @param <T> The input type.
   * @param <K> The key type.
   * @param key The key to match.
   * @param mapper The mapper {@code Function} to apply.
   * @return A suitable {@code Predicate}.
   */
  static matchKey$Object$Function<T, K>(key: K, mapper: JFunction<T, K>): Predicate<T> {
    return (t) => mapper(t) === key;
  }
  /**
   * Create a predicate for a type that returns true if a mapper applied
   * to it causes it to equal a key.
   *
   * @param <T> The input type.
   * @param <K> The key type.
   * @param key The key to match.
   * @param mapper The mapper {@code Function} to apply.
   * @return A suitable {@code Predicate}.
   */
  static matchKeyEquals$Object$Function<T, K>(key: K, mapper: JFunction<T, K>): Predicate<T> {
    return (t) => Utils.equals(mapper(t), key);
  }
  /**
   * Find the maximum int value in an array.
   *
   * @param <T> The collection member type.
   * @param array The array to check.
   * @param tif A {@code ToIntFunction} to map the stream to int with.
   * @return The maximum value found, or zero if the input is empty.
   */
  static max$ObjectArr$ToIntFunction<T>(array: T[], tif: ToIntFunction<T>): number {
    return CollectionUtils.max_internal(Arrays.stream(array), CollectionUtils.alwaysTrue(), tif);
  }
  /**
   * Find the maximum int value in an array.
   *
   * @param <T> The collection member type.
   * @param array The array to check.
   * @param predicate A {@code Predicate} to match with.
   * @param tif A {@code ToIntFunction} to map the stream to int with.
   * @return The maximum value found, or zero if the input is empty.
   */
  static max$ObjectArr$Predicate$ToIntFunction<T>(array: T[], predicate: Predicate<any>, tif: ToIntFunction<T>): number {
    return CollectionUtils.max_internal(Arrays.stream(array), predicate, tif);
  }
  /**
   * Find the maximum int value in a collection.
   *
   * @param <T> The collection member type.
   * @param c The {@code Collection} to check.
   * @param tif A {@code ToIntFunction} to map the stream to int with.
   * @return The maximum value found, or zero if the input is empty.
   */
  static max$Collection$ToIntFunction<T>(c: Collection<T>, tif: ToIntFunction<T>): number {
    return CollectionUtils.max_internal(c.stream(), CollectionUtils.alwaysTrue(), tif);
  }
  /**
   * Find the maximum int value in a collection.
   *
   * @param <T> The collection member type.
   * @param c The {@code Collection} to check.
   * @param predicate A {@code Predicate} to match with.
   * @param tif A {@code ToIntFunction} to map the stream to int with.
   * @return The maximum value found, or zero if the input is empty.
   */
  static max$Collection$Predicate$ToIntFunction<T>(c: Collection<T>, predicate: Predicate<any>, tif: ToIntFunction<T>): number {
    return CollectionUtils.max$Stream$Predicate$ToIntFunction(c.stream(), predicate, tif);
  }
  /**
   * Find the maximum int value in a stream.
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to check.
   * @param tif A {@code ToIntFunction} to map the stream to int with.
   * @return The maximum value found, or zero if the input is empty.
   */
  static max$Stream$ToIntFunction<T>(stream: Stream<T>, tif: ToIntFunction<T>): number {
    return (stream == null) ? CollectionUtils.MAX_DEFAULT : CollectionUtils.max_internal(stream, CollectionUtils.alwaysTrue(), tif);
  }
  /**
   * Find the maximum int value in a stream.
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to check.
   * @param predicate A {@code Predicate} to match with.
   * @param tif A {@code ToIntFunction} to map the stream to int with.
   * @return The maximum value found, or zero if the input is empty.
   */
  static max$Stream$Predicate$ToIntFunction<T>(stream: Stream<T>, predicate: Predicate<any>, tif: ToIntFunction<T>): number {
    return (stream == null) ? CollectionUtils.MAX_DEFAULT : CollectionUtils.max_internal(stream, predicate, tif);
  }
  /**
   * Implement max.
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to check.
   * @param predicate A {@code Predicate} to match with.
   * @param tif A {@code ToIntFunction} to map the stream to int with.
   * @return The maximum value found, or zero if the input is empty.
   */
  static max_internal<T>(stream: Stream<T>, predicate: Predicate<any>, tif: ToIntFunction<T>): number {
    return stream.filter(predicate).mapToInt(tif).max().orElse(CollectionUtils.MAX_DEFAULT);
  }
  /**
   * Find the selected member of an array that maximizes according
   * to a given comparison.
   *
   * @param <T> The collection member type.
   * @param array The array to maximize from.
   * @param comparator A {@code Comparator} to compare with.
   * @return The maximal value found, or null if none present.
   */
  static maximize$ObjectArr$Comparator<T>(array: T[], comparator: Comparator<any>): T {
    return CollectionUtils.maximize_internal(Arrays.stream(array), CollectionUtils.alwaysTrue(), comparator);
  }
  /**
   * Find the selected member of a collection that maximizes according
   * to a given comparison.
   *
   * @param <T> The collection member type.
   * @param array The array to maximize from.
   * @param predicate A {@code Predicate} to match with.
   * @param comparator A {@code Comparator} to compare with.
   * @return The maximal value found, or null if none present.
   */
  static maximize$ObjectArr$Predicate$Comparator<T>(array: T[], predicate: Predicate<any>, comparator: Comparator<any>): T {
    return CollectionUtils.maximize_internal(Arrays.stream(array), predicate, comparator);
  }
  /**
   * Find the selected member of a collection that maximizes according
   * to a given comparison.
   *
   * @param <T> The collection member type.
   * @param c The {@code Collection} to maximize from.
   * @param comparator A {@code Comparator} to compare with.
   * @return The maximal value found, or null if none present.
   */
  static maximize$Collection$Comparator<T>(c: Collection<T>, comparator: Comparator<any>): T {
    return CollectionUtils.maximize_internal(c.stream(), CollectionUtils.alwaysTrue(), comparator);
  }
  /**
   * Find the selected member of a collection that maximizes according
   * to a given comparison.
   *
   * @param <T> The collection member type.
   * @param c The {@code Collection} to maximize from.
   * @param predicate A {@code Predicate} to match with.
   * @param comparator A {@code Comparator} to compare with.
   * @return The maximal value found, or null if none present.
   */
  static maximize$Collection$Predicate$Comparator<T>(c: Collection<T>, predicate: Predicate<any>, comparator: Comparator<any>): T {
    return CollectionUtils.maximize_internal(c.stream(), predicate, comparator);
  }
  /**
   * Find the selected member of a stream that maximizes according
   * to a given comparison.
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to maximize from.
   * @param comparator A {@code Comparator} to compare with.
   * @return The maximal value found, or null if none present.
   */
  static maximize$Stream$Comparator<T>(stream: Stream<T>, comparator: Comparator<any>): T {
    return (stream == null) ? null : CollectionUtils.maximize_internal(stream, CollectionUtils.alwaysTrue(), comparator);
  }
  /**
   * Find the selected member of a stream that maximizes according
   * to a given comparison.
   *
   * @param <T> The collection member type.
   * @param stream The {@code Stream} to maximize from.
   * @param predicate A {@code Predicate} to match with.
   * @param comparator A {@code Comparator} to compare with.
   * @return The maximal value found, or null if none present.
   */
  static maximize$Stream$Predicate$Comparator<T>(stream: Stream<T>, predicate: Predicate<any>, comparator: Comparator<any>): T {
    return (stream == null) ? null : CollectionUtils.maximize_internal(stream, predicate, comparator);
  }
  /**
   * Implement maximize.
   *
   * @param <T> The collection member type.
   * @param stream The {@code Stream} to maximize from.
   * @param predicate A {@code Predicate} to match with.
   * @param comparator A {@code Comparator} to compare with.
   * @return The maximal value found, or null if none present.
   */
  static maximize_internal<T>(stream: Stream<T>, predicate: Predicate<any>, comparator: Comparator<any>): T {
    return stream.filter(predicate).collect(Collectors.maxBy(comparator)).orElse(null);
  }
  /**
   * Find the minimum int value in an array.
   *
   * @param <T> The collection member type.
   * @param array The array to minimize from.
   * @param tif A {@code ToIntFunction} to map the stream to int with.
   * @return The minimum value found, or zero if the input is empty.
   */
  static min$ObjectArr$ToIntFunction<T>(array: T[], tif: ToIntFunction<T>): number {
    return CollectionUtils.min_internal(Arrays.stream(array), CollectionUtils.alwaysTrue(), tif);
  }
  /**
   * Find the minimum int value in an array.
   *
   * @param <T> The collection member type.
   * @param array The array to minimize from.
   * @param predicate A {@code Predicate} to match with.
   * @param tif A {@code ToIntFunction} to map the stream to int with.
   * @return The minimum value found, or zero if the input is empty.
   */
  static min$ObjectArr$Predicate$ToIntFunction<T>(array: T[], predicate: Predicate<any>, tif: ToIntFunction<T>): number {
    return CollectionUtils.min_internal(Arrays.stream(array), predicate, tif);
  }
  /**
   * Find the minimum int value in a collection.
   *
   * @param <T> The collection member type.
   * @param c The {@code Collection} to check.
   * @param tif A {@code ToIntFunction} to map the stream to int with.
   * @return The minimum value found, or zero if the input is empty.
   */
  static min$Collection$ToIntFunction<T>(c: Collection<T>, tif: ToIntFunction<T>): number {
    return CollectionUtils.min_internal(c.stream(), CollectionUtils.alwaysTrue(), tif);
  }
  /**
   * Find the minimum int value in a collection.
   *
   * @param <T> The collection member type.
   * @param c The {@code Collection} to check.
   * @param predicate A {@code Predicate} to match with.
   * @param tif A {@code ToIntFunction} to map the stream to int with.
   * @return The minimum value found, or zero if the input is empty.
   */
  static min$Collection$Predicate$ToIntFunction<T>(c: Collection<T>, predicate: Predicate<any>, tif: ToIntFunction<T>): number {
    return CollectionUtils.min_internal(c.stream(), predicate, tif);
  }
  /**
   * Find the minimum int value in a stream.
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to check.
   * @param tif A {@code ToIntFunction} to map the stream to int with.
   * @return The minimum value found, or zero if the input is empty.
   */
  static min$Stream$ToIntFunction<T>(stream: Stream<T>, tif: ToIntFunction<T>): number {
    return (stream == null) ? CollectionUtils.MIN_DEFAULT : CollectionUtils.min_internal(stream, CollectionUtils.alwaysTrue(), tif);
  }
  /**
   * Find the minimum int value in a stream.
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to check.
   * @param predicate A {@code Predicate} to match with.
   * @param tif A {@code ToIntFunction} to map the stream to int with.
   * @return The minimum value found, or zero if the input is empty.
   */
  static min$Stream$Predicate$ToIntFunction<T>(stream: Stream<T>, predicate: Predicate<any>, tif: ToIntFunction<T>): number {
    return (stream == null) ? CollectionUtils.MIN_DEFAULT : CollectionUtils.min_internal(stream, predicate, tif);
  }
  /**
   * Implement min.
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to check.
   * @param predicate A {@code Predicate} to match with.
   * @param tif A {@code ToIntFunction} to map the stream to int with.
   * @return The minimum value found, or zero if the input is empty.
   */
  static min_internal<T>(stream: Stream<T>, predicate: Predicate<any>, tif: ToIntFunction<T>): number {
    return stream.filter(predicate).mapToInt(tif).min().orElse(CollectionUtils.MIN_DEFAULT);
  }
  /**
   * Find the selected member of an array that minimizes according
   * to a given comparison.
   *
   * @param <T> The collection member type.
   * @param array The array to minimize from.
   * @param comparator A {@code Comparator} to compare with.
   * @return The minimal value found, or null if none present.
   */
  static minimize$ObjectArr$Comparator<T>(array: T[], comparator: Comparator<any>): T {
    return CollectionUtils.minimize_internal(Arrays.stream(array), CollectionUtils.alwaysTrue(), comparator);
  }
  /**
   * Find the selected member of a collection that minimizes according
   * to a given comparison.
   *
   * @param <T> The collection member type.
   * @param array The array to minimize from.
   * @param predicate A {@code Predicate} to match with.
   * @param comparator A {@code Comparator} to compare with.
   * @return The minimal value found, or null if none present.
   */
  static minimize$ObjectArr$Predicate$Comparator<T>(array: T[], predicate: Predicate<any>, comparator: Comparator<any>): T {
    return CollectionUtils.minimize_internal(Arrays.stream(array), predicate, comparator);
  }
  /**
   * Find the selected member of a collection that minimizes according
   * to a given comparison.
   *
   * @param <T> The collection member type.
   * @param c The {@code Collection} to minimize from.
   * @param comparator A {@code Comparator} to compare with.
   * @return The minimal value found, or null if none present.
   */
  static minimize$Collection$Comparator<T>(c: Collection<T>, comparator: Comparator<any>): T {
    return CollectionUtils.minimize_internal(c.stream(), CollectionUtils.alwaysTrue(), comparator);
  }
  /**
   * Find the selected member of a collection that minimizes according
   * to a given comparison.
   *
   * @param <T> The collection member type.
   * @param c The {@code Collection} to minimize from.
   * @param predicate A {@code Predicate} to match with.
   * @param comparator A {@code Comparator} to compare with.
   * @return The minimal value found, or null if none present.
   */
  static minimize$Collection$Predicate$Comparator<T>(c: Collection<T>, predicate: Predicate<any>, comparator: Comparator<any>): T {
    return CollectionUtils.minimize_internal(c.stream(), predicate, comparator);
  }
  /**
   * Find the selected member of a stream that minimizes according
   * to a given comparison.
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to minimize from.
   * @param comparator A {@code Comparator} to compare with.
   * @return The minimal value found, or null if none present.
   */
  static minimize$Stream$Comparator<T>(stream: Stream<T>, comparator: Comparator<any>): T {
    return (stream == null) ? null : CollectionUtils.minimize_internal(stream, CollectionUtils.alwaysTrue(), comparator);
  }
  /**
   * Find the selected member of a stream that minimizes according
   * to a given comparison.
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to minimize from.
   * @param predicate A {@code Predicate} to match with.
   * @param comparator A {@code Comparator} to compare with.
   * @return The minimal value found, or null if none present.
   */
  static minimize$Stream$Predicate$Comparator<T>(stream: Stream<T>, predicate: Predicate<any>, comparator: Comparator<any>): T {
    return (stream == null) ? null : CollectionUtils.minimize_internal(stream, predicate, comparator);
  }
  /**
   * Implement minimize.
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to minimize from.
   * @param predicate A {@code Predicate} to match with.
   * @param comparator A {@code Comparator} to compare with.
   * @return The minimal value found, or null if none present.
   */
  static minimize_internal<T>(stream: Stream<T>, predicate: Predicate<any>, comparator: Comparator<any>): T {
    return stream.filter(predicate).collect(Collectors.minBy(comparator)).orElse(null);
  }
  /**
   * Is an array null or empty?
   *
   * @param <T> The array member type.
   * @param array The array to test.
   * @return True if an array is null or empty.
   */
  static none$ObjectArr<T>(array: T[]): boolean {
    return array == null || array.length === 0;
  }
  /**
   * Do none of the members of an array match a predicate?
   *
   * @param <T> The array member type.
   * @param array The array to test.
   * @param predicate The {@code Predicate} to test with.
   * @return True if no member passes the predicate test.
   */
  static none$ObjectArr$Predicate<T>(array: T[], predicate: Predicate<any>): boolean {
    return CollectionUtils.none_internal(Arrays.stream(array), predicate);
  }
  /**
   * Is a collection empty?
   *
   * @param <T> The collection member type.
   * @param c The {@code Collection} to test.
   * @return True if the collection is null or empty.
   */
  static none$Collection<T>(c: Collection<T>): boolean {
    return c == null || c.isEmpty();
  }
  /**
   * Do none of the members of a collection match a predicate?
   *
   * @param <T> The collection member type.
   * @param c The {@code Collection} to test.
   * @param predicate The {@code Predicate} to test with.
   * @return True if no member passes the predicate test.
   */
  static none$Collection$Predicate<T>(c: Collection<T>, predicate: Predicate<any>): boolean {
    return CollectionUtils.none_internal(c.stream(), predicate);
  }
  /**
   * Is a stream null or empty?
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to test.
   * @return True if the stream is null or empty.
   */
  static none$Stream<T>(stream: Stream<T>): boolean {
    return stream == null || !stream.findFirst().isPresent();
  }
  /**
   * Do none of the members of a stream match a predicate?
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to test.
   * @param predicate The {@code Predicate} to test with.
   * @return True if no member passes the predicate test.
   */
  static none$Stream$Predicate<T>(stream: Stream<T>, predicate: Predicate<any>): boolean {
    return (stream == null) ? true : CollectionUtils.none_internal(stream, predicate);
  }
  /**
   * Implementation of none().
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to test.
   * @param predicate The {@code Predicate} to test with.
   * @return True if no member passes the predicate test.
   */
  static none_internal<T>(stream: Stream<T>, predicate: Predicate<any>): boolean {
    return stream.noneMatch(predicate);
  }
  /**
   * Take the product of an array.
   *
   * @param <T> The array member type.
   * @param array The array to multiply.
   * @param tdf A {@code ToDoubleFunction} to convert members to double.
   * @return The product of the values found.
   */
  static product$ObjectArr$ToDoubleFunction<T>(array: T[], tdf: ToDoubleFunction<T>): number {
    return CollectionUtils.product_internal(Arrays.stream(array), CollectionUtils.alwaysTrue(), tdf);
  }
  /**
   * Take the product of an array.
   *
   * @param <T> The array member type.
   * @param array The array to multiply.
   * @param predicate A {@code Predicate} to match with.
   * @param tdf A {@code ToDoubleFunction} to convert members to double.
   * @return The product of the values found.
   */
  static product$ObjectArr$Predicate$ToDoubleFunction<T>(array: T[], predicate: Predicate<any>, tdf: ToDoubleFunction<T>): number {
    return CollectionUtils.product_internal(Arrays.stream(array), predicate, tdf);
  }
  /**
   * Take the product of a collection.
   *
   * @param <T> The stream member type.
   * @param c The {@code Collection} to multiply.
   * @param tdf A {@code ToDoubleFunction} to convert members to double.
   * @return The product of the values found.
   */
  static product$Collection$ToDoubleFunction<T>(c: Collection<T>, tdf: ToDoubleFunction<T>): number {
    return CollectionUtils.product_internal(c.stream(), CollectionUtils.alwaysTrue(), tdf);
  }
  /**
   * Take the product of a collection.
   *
   * @param <T> The stream member type.
   * @param c The {@code Collection} to multiply.
   * @param predicate A {@code Predicate} to match with.
   * @param tdf A {@code ToDoubleFunction} to convert members to double.
   * @return The product of the values found.
   */
  static product$Collection$Predicate$ToDoubleFunction<T>(c: Collection<T>, predicate: Predicate<any>, tdf: ToDoubleFunction<T>): number {
    return CollectionUtils.product_internal(c.stream(), predicate, tdf);
  }
  /**
   * Take the product of the members of a stream.
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to multiply.
   * @param tdf A {@code ToDoubleFunction} to convert members to double.
   * @return The product of the values found.
   */
  static product$Stream$ToDoubleFunction<T>(stream: Stream<T>, tdf: ToDoubleFunction<T>): number {
    return (stream == null) ? CollectionUtils.PRODUCT_DEFAULT : CollectionUtils.product_internal(stream, CollectionUtils.alwaysTrue(), tdf);
  }
  /**
   * Take the product of the members of a stream.
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to multiply.
   * @param predicate A {@code Predicate} to match with.
   * @param tdf A {@code ToDoubleFunction} to convert members to double.
   * @return The product of the values found.
   */
  static product$Stream$Predicate$ToDoubleFunction<T>(stream: Stream<T>, predicate: Predicate<any>, tdf: ToDoubleFunction<T>): number {
    return (stream == null) ? CollectionUtils.PRODUCT_DEFAULT : CollectionUtils.product_internal(stream, predicate, tdf);
  }
  /**
   * Take the product of the members of a stream.
   *
   * @param predicate A {@code Predicate} to match with.
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to multiply.
   * @param tdf A {@code ToDoubleFunction} to convert members to double.
   * @return The product of the values found.
   */
  static product_internal<T>(stream: Stream<T>, predicate: Predicate<any>, tdf: ToDoubleFunction<T>): number {
    let mult = (d1, d2) => d1 * d2;
    return stream.filter(predicate).mapToDouble(tdf).reduce(CollectionUtils.PRODUCT_DEFAULT, mult);
  }
  /**
   * Special case to remove objects from a collection.
   *
   * @param <T> The collection member type.
   * @param c The {@code Collection} to remove from.
   * @param predicate A {@code Predicate} to match with.
   * @return True if anything was removed.
   */
  static removeInPlace$Collection$Predicate<T>(c: Collection<T>, predicate: Predicate<any>): boolean {
    let ret = false;
    let iterator = c.iterator();
    while (iterator.hasNext()) {
      if (predicate(iterator.next())) {
        iterator.remove();
        ret = true;
      }
    }
    return ret;
  }
  /**
   * Special case to remove objects from a map.
   *
   * @param <K> The map key type.
   * @param <V> The map value type.
   * @param map The {@code Map} to remove entries from.
   * @param predicate A {@code Predicate} to match map entries with.
   * @return True if anything was removed.
   */
  static removeInPlace$Map$Predicate<K, V>(map: JMap<K, V>, predicate: Predicate<Map_Entry<K, V>>): boolean {
    let ret = false;
    let iterator = map.entrySet().iterator();
    while (iterator.hasNext()) {
      if (predicate(iterator.next())) {
        iterator.remove();
        ret = true;
      }
    }
    return ret;
  }
  /**
   * Convenience function to convert an array to a sorted list.
   *
   * @param <T> The array member type.
   * @param array The array to convert.
   * @return A list of the stream contents.
   */
  static sort$ComparableArr<T>(array: T[]): List<T> {
    let comparator = Comparator.naturalOrder();
    return CollectionUtils.sort_internal(Arrays.stream(array), comparator);
  }
  /**
   * Convenience function to convert an array to a sorted list.
   *
   * @param <T> The array member type.
   * @param array The array to convert.
   * @param comparator A {@code Comparator} to sort with.
   * @return A list of the stream contents.
   */
  static sort$ObjectArr$Comparator<T>(array: T[], comparator: Comparator<any>): List<T> {
    return CollectionUtils.sort_internal(Arrays.stream(array), comparator);
  }
  /**
   * Convenience function to convert a collection to a sorted list.
   *
   * @param <T> The collection member type.
   * @param c The {@code Collection} to convert.
   * @return A list of the stream contents.
   */
  static sort$Collection<T>(c: Collection<T>): List<T> {
    let comparator = Comparator.naturalOrder();
    return CollectionUtils.sort_internal(c.stream(), comparator);
  }
  /**
   * Convenience function to convert a collection to a map.
   *
   * @param <T> The collection member type.
   * @param c The {@code Collection} to convert.
   * @param comparator A {@code Comparator} to sort with.
   * @return A map of the stream contents.
   */
  static sort$Collection$Comparator<T>(c: Collection<T>, comparator: Comparator<any>): List<T> {
    return CollectionUtils.sort_internal(c.stream(), comparator);
  }
  /**
   * Convenience function to collect a stream to a list.
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to collect.
   * @return A list of the stream contents.
   */
  static sort$Stream<T>(stream: Stream<T>): List<T> {
    let comparator = Comparator.naturalOrder();
    return (stream == null) ? Collections.emptyList() : CollectionUtils.sort_internal(stream, comparator);
  }
  /**
   * Convenience function to collect a stream to a list.
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to collect.
   * @param comparator A {@code Comparator} to sort with.
   * @return A list of the stream contents.
   */
  static sort$Stream$Comparator<T>(stream: Stream<T>, comparator: Comparator<any>): List<T> {
    return (stream == null) ? Collections.emptyList() : CollectionUtils.sort_internal(stream, comparator);
  }
  /**
   * Implement sort.
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to collect.
   * @param comparator A {@code Comparator} to sort with.
   * @return A list of the stream contents.
   */
  static sort_internal<T>(stream: Stream<T>, comparator: Comparator<any>): List<T> {
    return stream.sorted(comparator).collect(Collectors.toList());
  }
  /**
   * Take the sum of the members of an array.
   *
   * @param <T> The collection member type.
   * @param array The array to sum.
   * @param tif A {@code ToIntFunction} to convert members to an int.
   * @return The sum of the values found.
   */
  static sum$ObjectArr$ToIntFunction<T>(array: T[], tif: ToIntFunction<T>): number {
    return CollectionUtils.sum_internal(Arrays.stream(array), CollectionUtils.alwaysTrue(), tif);
  }
  /**
   * Take the sum of the members of an array.
   *
   * @param <T> The collection member type.
   * @param array The array to sum.
   * @param predicate A {@code Predicate} to match with.
   * @param tif A {@code ToIntFunction} to convert members to an int.
   * @return The sum of the values found.
   */
  static sum$ObjectArr$Predicate$ToIntFunction<T>(array: T[], predicate: Predicate<any>, tif: ToIntFunction<T>): number {
    return CollectionUtils.sum_internal(Arrays.stream(array), predicate, tif);
  }
  /**
   * Take the sum of the members of a collection.
   *
   * @param <T> The collection member type.
   * @param c The {@code Collection} to sum.
   * @param tif A {@code ToIntFunction} to convert members to an int.
   * @return The sum of the values found.
   */
  static sum$Collection$ToIntFunction<T>(c: Collection<T>, tif: ToIntFunction<T>): number {
    return CollectionUtils.sum_internal(c.stream(), CollectionUtils.alwaysTrue(), tif);
  }
  /**
   * Take the sum of the members of a collection.
   *
   * @param <T> The collection member type.
   * @param c The {@code Collection} to sum.
   * @param predicate A {@code Predicate} to match with.
   * @param tif A {@code ToIntFunction} to map the stream to int with.
   * @return The sum of the values found.
   */
  static sum$Collection$Predicate$ToIntFunction<T>(c: Collection<T>, predicate: Predicate<any>, tif: ToIntFunction<T>): number {
    return CollectionUtils.sum_internal(c.stream(), predicate, tif);
  }
  /**
   * Take the sum of the members of a stream.
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to sum.
   * @param tif A {@code ToIntFunction} to convert members to an int.
   * @return The sum of the values found.
   */
  static sum$Stream$ToIntFunction<T>(stream: Stream<T>, tif: ToIntFunction<T>): number {
    return (stream == null) ? CollectionUtils.SUM_DEFAULT : CollectionUtils.sum_internal(stream, CollectionUtils.alwaysTrue(), tif);
  }
  /**
   * Take the sum of the members of a stream.
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to sum.
   * @param predicate A {@code Predicate} to match with.
   * @param tif A {@code ToIntFunction} to convert members to an int.
   * @return The sum of the values found.
   */
  static sum$Stream$Predicate$ToIntFunction<T>(stream: Stream<T>, predicate: Predicate<any>, tif: ToIntFunction<T>): number {
    return (stream == null) ? CollectionUtils.SUM_DEFAULT : CollectionUtils.sum_internal(stream, predicate, tif);
  }
  /**
   * Take the sum of the members of a stream.
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to sum.
   * @param predicate A {@code Predicate} to match with.
   * @param tif A {@code ToIntFunction} to convert members to an int.
   * @return The sum of the values found.
   */
  static sum_internal<T>(stream: Stream<T>, predicate: Predicate<any>, tif: ToIntFunction<T>): number {
    return stream.filter(predicate).mapToInt(tif).sum();
  }
  /**
   * Take the sum of the members of an array.
   *
   * @param <T> The collection member type.
   * @param array The array to sum.
   * @param tdf A {@code ToDoubleFunction} to convert members
   *     to a double.
   * @return The sum of the values found.
   */
  static sumDouble$ObjectArr$ToDoubleFunction<T>(array: T[], tdf: ToDoubleFunction<T>): number {
    return CollectionUtils.sumDouble_internal(Arrays.stream(array), CollectionUtils.alwaysTrue(), tdf);
  }
  /**
   * Take the sum of the members of an array.
   *
   * @param <T> The collection member type.
   * @param array The array to sum.
   * @param predicate A {@code Predicate} to match with.
   * @param tdf A {@code ToDoubleFunction} to map the stream to
   *     double with.
   * @return The sum of the values found.
   */
  static sumDouble$ObjectArr$Predicate$ToDoubleFunction<T>(array: T[], predicate: Predicate<any>, tdf: ToDoubleFunction<T>): number {
    return CollectionUtils.sumDouble_internal(Arrays.stream(array), predicate, tdf);
  }
  /**
   * Take the sum of the members of a collection.
   *
   * @param <T> The collection member type.
   * @param c The {@code Collection} to sum.
   * @param tdf A {@code ToDoubleFunction} to convert members
   *     to a double.
   * @return The sum of the values found.
   */
  static sumDouble$Collection$ToDoubleFunction<T>(c: Collection<T>, tdf: ToDoubleFunction<T>): number {
    return CollectionUtils.sumDouble_internal(c.stream(), CollectionUtils.alwaysTrue(), tdf);
  }
  /**
   * Take the sum of the members of a collection.
   *
   * @param <T> The collection member type.
   * @param c The {@code Collection} to sum.
   * @param predicate A {@code Predicate} to match with.
   * @param tdf A {@code ToDoubleFunction} to map the stream to
   *     double with.
   * @return The sum of the values found.
   */
  static sumDouble$Collection$Predicate$ToDoubleFunction<T>(c: Collection<T>, predicate: Predicate<any>, tdf: ToDoubleFunction<T>): number {
    return CollectionUtils.sumDouble_internal(c.stream(), predicate, tdf);
  }
  /**
   * Take the sum of the members of a stream.
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to sum.
   * @param tdf A {@code ToDoubleFunction} to convert members
   *     to a double.
   * @return The sum of the values found.
   */
  static sumDouble$Stream$ToDoubleFunction<T>(stream: Stream<T>, tdf: ToDoubleFunction<T>): number {
    return (stream == null) ? CollectionUtils.SUM_DOUBLE_DEFAULT : CollectionUtils.sumDouble_internal(stream, CollectionUtils.alwaysTrue(), tdf);
  }
  /**
   * Take the sum of the members of a stream.
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to sum.
   * @param predicate A {@code Predicate} to select members.
   * @param tdf A {@code ToIntFunction} to convert members to a double.
   * @return The sum of the values found.
   */
  static sumDouble$Stream$Predicate$ToDoubleFunction<T>(stream: Stream<T>, predicate: Predicate<any>, tdf: ToDoubleFunction<T>): number {
    return (stream == null) ? CollectionUtils.SUM_DOUBLE_DEFAULT : CollectionUtils.sumDouble_internal(stream, predicate, tdf);
  }
  /**
   * Take the sum of the members of a stream.
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to sum.
   * @param predicate A {@code Predicate} to select members.
   * @param tdf A {@code ToIntFunction} to convert members to a double.
   * @return The sum of the values found.
   */
  static sumDouble_internal<T>(stream: Stream<T>, predicate: Predicate<any>, tdf: ToDoubleFunction<T>): number {
    return stream.filter(predicate).mapToDouble(tdf).sum();
  }
  /**
   * Make a collector that takes lists and appends them.
   *
   * @param <T> The list member type.
   * @return A list appending collector.
   */
  static toAppendedList<T>(): Collector<List<T>, any, List<T>> {
    let squash = (l1, l2) => (l1.isEmpty()) ? l2 : (l1.addAll(l2)) ? l1 : l1;
    return Collectors.reducing(Collections.emptyList(), squash);
  }
  /**
   * Convenience function to convert an array to a list.
   *
   * @param <T> The array member type.
   * @param array The array to convert.
   * @return A map of the stream contents.
   */
  static toList$ObjectArr<T>(array: T[]): List<T> {
    return CollectionUtils.toList_internal(Arrays.stream(array));
  }
  /**
   * Convenience function to convert a collection to a list.
   *
   * @param <T> The collection member type.
   * @param c The {@code Collection} to convert.
   * @return A map of the stream contents.
   */
  static toList$Collection<T>(c: Collection<T>): List<T> {
    return CollectionUtils.toList_internal(c.stream());
  }
  /**
   * Convenience function to collect a stream to a list.
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to collect.
   * @return A list of the stream contents.
   */
  static toList$Stream<T>(stream: Stream<T>): List<T> {
    return (stream == null) ? Collections.emptyList() : CollectionUtils.toList_internal(stream);
  }
  /**
   * Implement toList.
   *
   * @param <T> The stream member type.
   * @param stream The {@code Stream} to collect.
   * @return A list of the stream contents.
   */
  static toList_internal<T>(stream: Stream<T>): List<T> {
    return stream.collect(Collectors.toList());
  }
  /**
   * Create a new collector that accumulates to a list but excludes
   * null members.
   *
   * @param <T> The stream member type.
   * @return A list collectors.
   */
  static toListNoNulls<T>(): Collector<T, any, List<T>> {
    return Collector.of(() => new ArrayList(), (left, right) => {
      if (right != null) {
        left.add(right);
      }
    }, (left, right) => {
      left.addAll(right);
      return left;
    }, Collector_Characteristics.IDENTITY_FINISH);
  }
  /**
   * Convert an iterator to a stream.
   *
   * @param <T> A {@link Stream}
   * @param iterator The {@code Iterator} to convert.
   * @return The resulting {@code Stream}.
   */
  static toStream$Iterator<T>(iterator: Iterator<T>): Stream<T> {
    return CollectionUtils.toStream$Iterable($J.lambdaObj(() => iterator, 'iterator', 'java.lang.Iterable'));
  }
  /**
   * Convert an iterable to a stream.
   *
   * @param <T> A {@link Stream}
   * @param iterable The {@code Iterable} to convert.
   * @return The resulting {@code Stream}.
   */
  static toStream$Iterable<T>(iterable: Iterable<T>): Stream<T> {
    return StreamSupport.stream(iterable.spliterator(), false);
  }
  /**
   * Transform the contents of an array.
   *
   * @param <T> The array member type.
   * @param array The array to transform.
   * @param predicate A {@code Predicate} to select the items.
   * @return The result of collecting the predicate matches.
   */
  static transform$ObjectArr$Predicate<T>(array: T[], predicate: Predicate<any>): List<T> {
    return CollectionUtils.transform_internal(Arrays.stream(array), predicate, JFunction.identity(), null, Collectors.toList());
  }
  /**
   * Transform the contents of an array.
   *
   * @param <T> The array member type.
   * @param <R> The resulting collection member type.
   * @param array The array to transform.
   * @param predicate A {@code Predicate} to select the items.
   * @param mapper A function to transform the selected items.
   * @return The result of collecting the mapped predicate matches.
   */
  static transform$ObjectArr$Predicate$Function<T, R>(array: T[], predicate: Predicate<any>, mapper: JFunction<any, R>): List<R> {
    return CollectionUtils.transform_internal(Arrays.stream(array), predicate, mapper, null, Collectors.toList());
  }
  /**
   * Transform the contents of an array.
   *
   * @param <T> The array member type.
   * @param <R> The resulting collection member type.
   * @param <C> The resulting collection type.
   * @param array The array to transform.
   * @param predicate A {@code Predicate} to select the items.
   * @param mapper A function to transform the selected items.
   * @param collector A {@code Collector} to collect the items.
   * @return The result of collecting the mapped predicate matches.
   */
  static transform$ObjectArr$Predicate$Function$Collector<T, R, C>(array: T[], predicate: Predicate<any>, mapper: JFunction<any, R>, collector: Collector<R, any, C>): C {
    return CollectionUtils.transform_internal(Arrays.stream(array), predicate, mapper, null, collector);
  }
  /**
   * Transform the contents of an array and sort the result.
   *
   * @param <T> The array member type.
   * @param <R> The resulting collection member type.
   * @param array The array to transform.
   * @param predicate A {@code Predicate} to select the items.
   * @param mapper A function to transform the selected items.
   * @param comparator A {@code Comparator} to sort the items.
   * @return A list of sorted mapped predicate matches.
   */
  static transform$ObjectArr$Predicate$Function$Comparator<T, R>(array: T[], predicate: Predicate<any>, mapper: JFunction<any, R>, comparator: Comparator<any>): List<R> {
    return CollectionUtils.transform_internal(Arrays.stream(array), predicate, mapper, comparator, Collectors.toList());
  }
  /**
   * Transform the contents of a collection.
   *
   * @param <T> The collection member type.
   * @param c The {@code Collection} to transform.
   * @param predicate A {@code Predicate} to select the items.
   * @return The result of collecting the predicate matches.
   */
  static transform$Collection$Predicate<T>(c: Collection<T>, predicate: Predicate<any>): List<T> {
    return CollectionUtils.transform_internal(c.stream(), predicate, JFunction.identity(), null, Collectors.toList());
  }
  /**
   * Transform the contents of a collection.
   *
   * @param <T> The collection member type.
   * @param <R> The resulting collection member type.
   * @param c The {@code Collection} to transform.
   * @param predicate A {@code Predicate} to select the items.
   * @param mapper A function to transform the selected items.
   * @return The result of collecting the mapped predicate matches.
   */
  static transform$Collection$Predicate$Function<T, R>(c: Collection<T>, predicate: Predicate<any>, mapper: JFunction<any, R>): List<R> {
    return CollectionUtils.transform_internal(c.stream(), predicate, mapper, null, Collectors.toList());
  }
  /**
   * Transform the contents of a collection and sort the result.
   *
   * @param <T> The collection member type.
   * @param <R> The resulting collection member type.
   * @param c The {@code Collection} to transform.
   * @param predicate A {@code Predicate} to select the items.
   * @param mapper A function to transform the selected items.
   * @param comparator A {@code Comparator} to sort the results.
   * @return A list of sorted mapped predicate matches.
   */
  static transform$Collection$Predicate$Function$Comparator<T, R>(c: Collection<T>, predicate: Predicate<any>, mapper: JFunction<any, R>, comparator: Comparator<any>): List<R> {
    return CollectionUtils.transform_internal(c.stream(), predicate, mapper, comparator, Collectors.toList());
  }
  /**
   * Transform the contents of a collection.
   *
   * @param <T> The collection member type.
   * @param <R> The resulting collection member type.
   * @param <C> The resulting collection type.
   * @param c The {@code Collection} to transform.
   * @param predicate A {@code Predicate} to select the items.
   * @param mapper A function to transform the selected items.
   * @param collector A {@code Collector} to aggregate the results.
   * @return The result of collecting the mapped predicate matches.
   */
  static transform$Collection$Predicate$Function$Collector<T, R, C>(c: Collection<T>, predicate: Predicate<any>, mapper: JFunction<any, R>, collector: Collector<R, any, C>): C {
    return CollectionUtils.transform_internal(c.stream(), predicate, mapper, null, collector);
  }
  /**
   * Transform the contents of a stream.
   *
   * @param <T> The stream type.
   * @param stream The {@code Stream} to transform.
   * @param predicate A {@code Predicate} to select the items.
   * @return The result of collecting the predicate matches.
   */
  static transform$Stream$Predicate<T>(stream: Stream<T>, predicate: Predicate<any>): List<T> {
    let s = (stream == null) ? Stream.empty() : stream;
    return CollectionUtils.transform_internal(s, predicate, JFunction.identity(), null, Collectors.toList());
  }
  /**
   * Transform the contents of a stream.
   *
   * @param <T> The stream member type.
   * @param <R> The resulting collection member type.
   * @param stream The {@code Stream} to transform.
   * @param predicate A {@code Predicate} to select the items.
   * @param mapper A function to transform the selected items.
   * @return The result of collecting the mapped predicate matches.
   */
  static transform$Stream$Predicate$Function<T, R>(stream: Stream<T>, predicate: Predicate<any>, mapper: JFunction<any, R>): List<R> {
    let s = (stream == null) ? Stream.empty() : stream;
    return CollectionUtils.transform_internal(s, predicate, mapper, null, Collectors.toList());
  }
  /**
   * Transform the contents of a stream.
   *
   * @param <T> The collection member type.
   * @param <R> The resulting collection member type.
   * @param stream The {@code Stream} to transform.
   * @param predicate A {@code Predicate} to select the items.
   * @param mapper A function to transform the selected items.
   * @param comparator A {@code Comparator} to sort the results.
   * @return A list of sorted mapped predicate matches.
   */
  static transform$Stream$Predicate$Function$Comparator<T, R>(stream: Stream<T>, predicate: Predicate<any>, mapper: JFunction<any, R>, comparator: Comparator<any>): List<R> {
    let s = (stream == null) ? Stream.empty() : stream;
    return CollectionUtils.transform_internal(s, predicate, mapper, comparator, Collectors.toList());
  }
  /**
   * Transform the contents of a stream.
   *
   * @param <T> The collection member type.
   * @param <R> The resulting collection member type.
   * @param <C> The resulting collection type.
   * @param stream The {@code Stream} to transform.
   * @param predicate A {@code Predicate} to select the items.
   * @param mapper A function to transform the selected items.
   * @param collector A {@code Collector} to aggregate the results.
   * @return The result of collecting the mapped predicate matches.
   */
  static transform$Stream$Predicate$Function$Collector<T, R, C>(stream: Stream<T>, predicate: Predicate<any>, mapper: JFunction<any, R>, collector: Collector<R, any, C>): C {
    let s = (stream == null) ? Stream.empty() : stream;
    return CollectionUtils.transform_internal(s, predicate, mapper, null, collector);
  }
  /**
   * Underlying implementation for the transform functions.
   *
   * @param <T> The stream member type.
   * @param <R> The resulting collection member type.
   * @param <C> The resulting collection type.
   * @param stream The {@code Stream} to transform.
   * @param predicate A {@code Predicate} to select the items.
   * @param mapper A function to transform the selected items.
   * @param comparator An optional {@code Comparator} to sort
   *     the results.
   * @param collector A {@code Collector} to aggregate the results.
   * @return The result of collecting the mapped predicate matches.
   */
  static transform_internal<T, R, C>(stream: Stream<T>, predicate: Predicate<any>, mapper: JFunction<any, R>, comparator: Comparator<any>, collector: Collector<R, any, C>): C {
    return (comparator == null) ? stream.filter(predicate).map(mapper).collect(collector) : stream.filter(predicate).map(mapper).sorted(comparator).collect(collector);
  }
  static $clinit() {
    CollectionUtils.integerAccumulator = (i1, i2) => (i1 + i2) | 0;
    CollectionUtils.doubleAccumulator = (d1, d2) => $J.boxD(+d1 + +d2);
    CollectionUtils.ascendingIntegerComparator = Comparator.comparingInt(($p0) => (+$p0));
    CollectionUtils.descendingIntegerComparator = Comparator.reversed(CollectionUtils.ascendingIntegerComparator);
    CollectionUtils.ascendingDoubleComparator = Comparator.comparingDouble(($p0) => (+$p0));
    CollectionUtils.descendingDoubleComparator = Comparator.reversed(CollectionUtils.ascendingDoubleComparator);
    CollectionUtils.ascendingListLengthComparator = Comparator.comparingInt(($p0) => $p0.size());
    CollectionUtils.descendingListLengthComparator = Comparator.reversed(CollectionUtils.ascendingListLengthComparator);
  }
}

let $CollectionUtils$1$1: any = null;
/** An anonymous class (CollectionUtils.java:221). */
function CollectionUtils$1$1(): any {
  return $CollectionUtils$1$1 ??= $J.local(class extends JObject {
    original: List<T> = null;
    n: number = 0;
    np: number = 0;
    index_: number = 0;
    $init_anon() {
      this.original = new ArrayList(this.$cv_l);
      this.n = this.$cv_l.size();
      this.np = this.factorial(this.n);
      this.index_ = 0;
      return this;
    }
    factorial(n: number): number {
      let total = n;
      while (--n > 1) {
        total = Math.imul(total, n);
      }
      return total;
    }
    hasNext(): boolean {
      return this.index_ < this.np;
    }
    next(): List<T> {
      if (!this.hasNext()) {
        throw new NoSuchElementException('Permutations exhausted: ' + this.n);
      }
      let pick = new ArrayList(this.original);
      let result = new ArrayList(this.n);
      let current = this.index_++;
      let divisor = this.np;
      for (let i = this.n; i > 0; i--) {
        divisor = $J.idiv(divisor, i);
        let j = $J.idiv(current, divisor);
        result.add(pick.removeAt(j));
        current = (current - Math.imul(j, divisor)) | 0;
      }
      return result;
    }
    remove(): void {
      throw new RuntimeException('remove() not implemented: ' + $J.str(this));
    }
    $c($l): this {
      this.$cv_l = $l;
      return this;
    }
  }, 'net.sf.freecol.common.util.CollectionUtils$1$1', ['java.util.Iterator']);
}

let $CollectionUtils$1: any = null;
/** An anonymous class (CollectionUtils.java:218). */
function CollectionUtils$1(): any {
  return $CollectionUtils$1 ??= $J.local(class extends JObject {
    iterator(): Iterator<List<T>> {
      return new (CollectionUtils$1$1())().$o(this).$c(this.$cv_l).$init_anon();
    }
    $c($l): this {
      this.$cv_l = $l;
      return this;
    }
  }, 'net.sf.freecol.common.util.CollectionUtils$1', ['java.lang.Iterable']);
}

let $CollectionUtils$2: any = null;
/** An anonymous class (CollectionUtils.java:1237). */
function CollectionUtils$2(): any {
  return $CollectionUtils$2 ??= $J.local(class extends JObject {
    iterator(): Iterator<T> {
      return this.$cv_stream.iterator();
    }
    $c($stream): this {
      this.$cv_stream = $stream;
      return this;
    }
  }, 'net.sf.freecol.common.util.CollectionUtils$2', ['java.lang.Iterable']);
}

$J.define(CollectionUtils, 'net.sf.freecol.common.util.CollectionUtils', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_CollectionUtils' }, meths: { 'transform(java.util.stream.Stream,java.util.function.Predicate,java.util.function.Function,java.util.stream.Collector)': 'transform$Stream$Predicate$Function$Collector', 'transform(java.util.stream.Stream,java.util.function.Predicate,java.util.function.Function,java.util.Comparator)': 'transform$Stream$Predicate$Function$Comparator', 'transform(java.util.stream.Stream,java.util.function.Predicate,java.util.function.Function)': 'transform$Stream$Predicate$Function', 'transform(java.util.stream.Stream,java.util.function.Predicate)': 'transform$Stream$Predicate', 'transform(java.util.Collection,java.util.function.Predicate,java.util.function.Function,java.util.stream.Collector)': 'transform$Collection$Predicate$Function$Collector', 'transform(java.util.Collection,java.util.function.Predicate,java.util.function.Function,java.util.Comparator)': 'transform$Collection$Predicate$Function$Comparator', 'transform(java.util.Collection,java.util.function.Predicate,java.util.function.Function)': 'transform$Collection$Predicate$Function', 'transform(java.util.Collection,java.util.function.Predicate)': 'transform$Collection$Predicate', 'transform(java.lang.Object[],java.util.function.Predicate,java.util.function.Function,java.util.Comparator)': 'transform$ObjectArr$Predicate$Function$Comparator', 'transform(java.lang.Object[],java.util.function.Predicate,java.util.function.Function,java.util.stream.Collector)': 'transform$ObjectArr$Predicate$Function$Collector', 'transform(java.lang.Object[],java.util.function.Predicate,java.util.function.Function)': 'transform$ObjectArr$Predicate$Function', 'transform(java.lang.Object[],java.util.function.Predicate)': 'transform$ObjectArr$Predicate', 'toStream(java.lang.Iterable)': 'toStream$Iterable', 'toStream(java.util.Iterator)': 'toStream$Iterator', 'toList(java.util.stream.Stream)': 'toList$Stream', 'toList(java.util.Collection)': 'toList$Collection', 'toList(java.lang.Object[])': 'toList$ObjectArr', 'sumDouble(java.util.stream.Stream,java.util.function.Predicate,java.util.function.ToDoubleFunction)': 'sumDouble$Stream$Predicate$ToDoubleFunction', 'sumDouble(java.util.stream.Stream,java.util.function.ToDoubleFunction)': 'sumDouble$Stream$ToDoubleFunction', 'sumDouble(java.util.Collection,java.util.function.Predicate,java.util.function.ToDoubleFunction)': 'sumDouble$Collection$Predicate$ToDoubleFunction', 'sumDouble(java.util.Collection,java.util.function.ToDoubleFunction)': 'sumDouble$Collection$ToDoubleFunction', 'sumDouble(java.lang.Object[],java.util.function.Predicate,java.util.function.ToDoubleFunction)': 'sumDouble$ObjectArr$Predicate$ToDoubleFunction', 'sumDouble(java.lang.Object[],java.util.function.ToDoubleFunction)': 'sumDouble$ObjectArr$ToDoubleFunction', 'sum(java.util.stream.Stream,java.util.function.Predicate,java.util.function.ToIntFunction)': 'sum$Stream$Predicate$ToIntFunction', 'sum(java.util.stream.Stream,java.util.function.ToIntFunction)': 'sum$Stream$ToIntFunction', 'sum(java.util.Collection,java.util.function.Predicate,java.util.function.ToIntFunction)': 'sum$Collection$Predicate$ToIntFunction', 'sum(java.util.Collection,java.util.function.ToIntFunction)': 'sum$Collection$ToIntFunction', 'sum(java.lang.Object[],java.util.function.Predicate,java.util.function.ToIntFunction)': 'sum$ObjectArr$Predicate$ToIntFunction', 'sum(java.lang.Object[],java.util.function.ToIntFunction)': 'sum$ObjectArr$ToIntFunction', 'sort(java.util.stream.Stream,java.util.Comparator)': 'sort$Stream$Comparator', 'sort(java.util.stream.Stream)': 'sort$Stream', 'sort(java.util.Collection,java.util.Comparator)': 'sort$Collection$Comparator', 'sort(java.util.Collection)': 'sort$Collection', 'sort(java.lang.Object[],java.util.Comparator)': 'sort$ObjectArr$Comparator', 'sort(java.lang.Comparable[])': 'sort$ComparableArr', 'removeInPlace(java.util.Map,java.util.function.Predicate)': 'removeInPlace$Map$Predicate', 'removeInPlace(java.util.Collection,java.util.function.Predicate)': 'removeInPlace$Collection$Predicate', 'product(java.util.stream.Stream,java.util.function.Predicate,java.util.function.ToDoubleFunction)': 'product$Stream$Predicate$ToDoubleFunction', 'product(java.util.stream.Stream,java.util.function.ToDoubleFunction)': 'product$Stream$ToDoubleFunction', 'product(java.util.Collection,java.util.function.Predicate,java.util.function.ToDoubleFunction)': 'product$Collection$Predicate$ToDoubleFunction', 'product(java.util.Collection,java.util.function.ToDoubleFunction)': 'product$Collection$ToDoubleFunction', 'product(java.lang.Object[],java.util.function.Predicate,java.util.function.ToDoubleFunction)': 'product$ObjectArr$Predicate$ToDoubleFunction', 'product(java.lang.Object[],java.util.function.ToDoubleFunction)': 'product$ObjectArr$ToDoubleFunction', 'none(java.util.stream.Stream,java.util.function.Predicate)': 'none$Stream$Predicate', 'none(java.util.stream.Stream)': 'none$Stream', 'none(java.util.Collection,java.util.function.Predicate)': 'none$Collection$Predicate', 'none(java.util.Collection)': 'none$Collection', 'none(java.lang.Object[],java.util.function.Predicate)': 'none$ObjectArr$Predicate', 'none(java.lang.Object[])': 'none$ObjectArr', 'minimize(java.util.stream.Stream,java.util.function.Predicate,java.util.Comparator)': 'minimize$Stream$Predicate$Comparator', 'minimize(java.util.stream.Stream,java.util.Comparator)': 'minimize$Stream$Comparator', 'minimize(java.util.Collection,java.util.function.Predicate,java.util.Comparator)': 'minimize$Collection$Predicate$Comparator', 'minimize(java.util.Collection,java.util.Comparator)': 'minimize$Collection$Comparator', 'minimize(java.lang.Object[],java.util.function.Predicate,java.util.Comparator)': 'minimize$ObjectArr$Predicate$Comparator', 'minimize(java.lang.Object[],java.util.Comparator)': 'minimize$ObjectArr$Comparator', 'min(java.util.stream.Stream,java.util.function.Predicate,java.util.function.ToIntFunction)': 'min$Stream$Predicate$ToIntFunction', 'min(java.util.stream.Stream,java.util.function.ToIntFunction)': 'min$Stream$ToIntFunction', 'min(java.util.Collection,java.util.function.Predicate,java.util.function.ToIntFunction)': 'min$Collection$Predicate$ToIntFunction', 'min(java.util.Collection,java.util.function.ToIntFunction)': 'min$Collection$ToIntFunction', 'min(java.lang.Object[],java.util.function.Predicate,java.util.function.ToIntFunction)': 'min$ObjectArr$Predicate$ToIntFunction', 'min(java.lang.Object[],java.util.function.ToIntFunction)': 'min$ObjectArr$ToIntFunction', 'maximize(java.util.stream.Stream,java.util.function.Predicate,java.util.Comparator)': 'maximize$Stream$Predicate$Comparator', 'maximize(java.util.stream.Stream,java.util.Comparator)': 'maximize$Stream$Comparator', 'maximize(java.util.Collection,java.util.function.Predicate,java.util.Comparator)': 'maximize$Collection$Predicate$Comparator', 'maximize(java.util.Collection,java.util.Comparator)': 'maximize$Collection$Comparator', 'maximize(java.lang.Object[],java.util.function.Predicate,java.util.Comparator)': 'maximize$ObjectArr$Predicate$Comparator', 'maximize(java.lang.Object[],java.util.Comparator)': 'maximize$ObjectArr$Comparator', 'max(java.util.stream.Stream,java.util.function.Predicate,java.util.function.ToIntFunction)': 'max$Stream$Predicate$ToIntFunction', 'max(java.util.stream.Stream,java.util.function.ToIntFunction)': 'max$Stream$ToIntFunction', 'max(java.util.Collection,java.util.function.Predicate,java.util.function.ToIntFunction)': 'max$Collection$Predicate$ToIntFunction', 'max(java.util.Collection,java.util.function.ToIntFunction)': 'max$Collection$ToIntFunction', 'max(java.lang.Object[],java.util.function.Predicate,java.util.function.ToIntFunction)': 'max$ObjectArr$Predicate$ToIntFunction', 'max(java.lang.Object[],java.util.function.ToIntFunction)': 'max$ObjectArr$ToIntFunction', 'matchKeyEquals(java.lang.Object,java.util.function.Function)': 'matchKeyEquals$Object$Function', 'matchKey(java.lang.Object,java.util.function.Function)': 'matchKey$Object$Function', 'matchKeyEquals(java.lang.Object)': 'matchKeyEquals$Object', 'matchKey(java.lang.Object)': 'matchKey$Object', 'map(java.util.stream.Stream,java.util.function.Function)': 'map$Stream$Function', 'map(java.util.Collection,java.util.function.Function)': 'map$Collection$Function', 'map(java.lang.Object[],java.util.function.Function)': 'map$ObjectArr$Function', 'isNull(java.util.function.Function)': 'isNull$Function', 'isNull()': 'isNull$', 'isNotNull(java.util.function.Function)': 'isNotNull$Function', 'isNotNull()': 'isNotNull$', 'forEach(java.util.stream.Stream,java.util.function.Predicate,java.util.function.Consumer)': 'forEach$Stream$Predicate$Consumer', 'forEach(java.util.stream.Stream,java.util.function.Consumer)': 'forEach$Stream$Consumer', 'forEach(java.util.Collection,java.util.function.Predicate,java.util.function.Consumer)': 'forEach$Collection$Predicate$Consumer', 'forEach(java.util.Collection,java.util.function.Consumer)': 'forEach$Collection$Consumer', 'forEach(java.lang.Object[],java.util.function.Predicate,java.util.function.Consumer)': 'forEach$ObjectArr$Predicate$Consumer', 'forEach(java.lang.Object[],java.util.function.Consumer)': 'forEach$ObjectArr$Consumer', 'forEachMapEntry(java.util.Map,java.util.function.Predicate,java.util.function.Consumer)': 'forEachMapEntry$Map$Predicate$Consumer', 'forEachMapEntry(java.util.Map,java.util.function.Consumer)': 'forEachMapEntry$Map$Consumer', 'flatten(java.util.stream.Stream,java.util.function.Predicate,java.util.function.Function)': 'flatten$Stream$Predicate$Function', 'flatten(java.util.stream.Stream,java.util.function.Function)': 'flatten$Stream$Function', 'flatten(java.util.Collection,java.util.function.Predicate,java.util.function.Function)': 'flatten$Collection$Predicate$Function', 'flatten(java.util.Collection,java.util.function.Function)': 'flatten$Collection$Function', 'flatten(java.lang.Object[],java.util.function.Predicate,java.util.function.Function)': 'flatten$ObjectArr$Predicate$Function', 'flatten(java.lang.Object[],java.util.function.Function)': 'flatten$ObjectArr$Function', 'first(java.util.stream.Stream)': 'first$Stream', 'first(java.util.Collection)': 'first$Collection', 'first(java.lang.Object[])': 'first$ObjectArr', 'find(java.util.stream.Stream,java.util.function.Predicate,java.lang.Object)': 'find$Stream$Predicate$Object', 'find(java.util.stream.Stream,java.util.function.Predicate)': 'find$Stream$Predicate', 'find(java.util.Collection,java.util.function.Predicate,java.lang.Object)': 'find$Collection$Predicate$Object', 'find(java.util.Collection,java.util.function.Predicate)': 'find$Collection$Predicate', 'find(java.lang.Object[],java.util.function.Predicate,java.lang.Object)': 'find$ObjectArr$Predicate$Object', 'find(java.lang.Object[],java.util.function.Predicate)': 'find$ObjectArr$Predicate', 'fileStream(java.io.File,java.util.function.Predicate)': 'fileStream$File$Predicate', 'fileStream(java.io.File)': 'fileStream$File', 'dump(java.lang.String,java.util.Map)': 'dump$String$Map', 'dump(java.lang.String,java.util.stream.Stream)': 'dump$String$Stream', 'dump(java.lang.String,java.util.Collection)': 'dump$String$Collection', 'dump(java.lang.String,java.lang.Object[])': 'dump$String$ObjectArr', 'count(java.util.stream.Stream,java.util.function.Predicate)': 'count$Stream$Predicate', 'count(java.util.stream.Stream)': 'count$Stream', 'count(java.util.Collection,java.util.function.Predicate)': 'count$Collection$Predicate', 'count(java.util.Collection)': 'count$Collection', 'count(java.lang.Object[],java.util.function.Predicate)': 'count$ObjectArr$Predicate', 'count(java.lang.Object[])': 'count$ObjectArr', 'any(java.util.stream.Stream,java.util.function.Predicate)': 'any$Stream$Predicate', 'any(java.util.stream.Stream)': 'any$Stream', 'any(java.util.Collection,java.util.function.Predicate)': 'any$Collection$Predicate', 'any(java.util.Collection)': 'any$Collection', 'any(java.lang.Object[],java.util.function.Predicate)': 'any$ObjectArr$Predicate', 'any(java.lang.Object[])': 'any$ObjectArr', 'all(java.util.stream.Stream,java.util.function.Predicate)': 'all$Stream$Predicate', 'all(java.util.Collection,java.util.function.Predicate)': 'all$Collection$Predicate', 'all(java.lang.Object[],java.util.function.Predicate)': 'all$ObjectArr$Predicate', 'mapEntriesByValue(java.util.Map,java.util.Comparator)': 'mapEntriesByValue$Map$Comparator', 'mapEntriesByValue(java.util.Map)': 'mapEntriesByValue$Map', 'mapEntriesByKey(java.util.Map,java.util.Comparator)': 'mapEntriesByKey$Map$Comparator', 'mapEntriesByKey(java.util.Map)': 'mapEntriesByKey$Map' }, clinit: true, lazy: ['integerAccumulator', 'doubleAccumulator', 'ascendingIntegerComparator', 'descendingIntegerComparator', 'ascendingDoubleComparator', 'descendingDoubleComparator', 'ascendingListLengthComparator', 'descendingListLengthComparator'] });
$J.module(() => {
  CachingFunction = $J.load('net.sf.freecol.common.util.CachingFunction');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
