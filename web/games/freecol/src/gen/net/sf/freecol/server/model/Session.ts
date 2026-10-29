// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/model/Session.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, HashMap, IllegalArgumentException, JObject, Logger } from '../../../../../../jre/index.ts';

let CollectionUtils;

/**
 * Root class for sessions.
 */
export class Session extends JObject {
  static logger: Logger = null;
  /**
   * A map of all active sessions.
   */
  static allSessions: JMap<string, Session> = null;
  /**
   * The key to this session.
   */
  key: string = null;
  /**
   * Has this session been completed?
   */
  completed: boolean = false;
  /**
   * Protected constructor, we only really instantiate specific types
   * of transactions.
   *
   * @param key A unique key to lookup this transaction with.
   */
  _Session(key: string): this {
    this.completed = false;
    let s = Session.getSession(key);
    if (s != null) {
      throw new IllegalArgumentException('Duplicate session: ' + key + ' -> ' + $J.str(s));
    }
    this.key = key;
    this.completed = false;
    Session.logger.finest('Created session: ' + key);
    return this;
  }
  /**
   * Get the session key.
   *
   * @return The key for this session.
   */
  getKey(): string {
    return this.key;
  }
  /**
   * Register a new session.
   */
  register(): void {
    {
      Session.allSessions.put(this.getKey(), this);
    }
  }
  /**
   * Get the session with a given key.
   *
   * @param key The session key.
   * @return The {@code session} found.
   */
  static getSession(key: string): Session {
    {
      return Session.allSessions.get(key);
    }
  }
  /**
   * Is this session complete?
   *
   * @return True if the session is complete.
   */
  isComplete(): boolean {
    return this.completed;
  }
  /**
   * All transaction types must implement a completion action.
   *
   * This is called by the controller at the end of turn to complete
   * any sessions that have not yet completed, or if the controller
   * gets the required response to complete the session.
   *
   * @param cs A {@code ChangeSet} to update with changes that
   *     occur when completing this session.
   * @return True if the session was already complete.
   */
  complete$ChangeSet(cs: ChangeSet): boolean {
    let ret = this.completed;
    this.completed = true;
    return ret;
  }
  /**
   * Make a transaction session key.
   *
   * Note: sort the keys to make session key independent of argument order.
   *
   * @param type An identifier for the type of transaction.
   * @param o1 A string to uniquely identify the transaction.
   * @param o2 Another string to uniquely identify the transaction.
   * @return A transaction session key.
   */
  static makeSessionKey$Class$String$String(type$: JClass, o1: string, o2: string): string {
    return ($J.compareTo(o1, o2) < 0) ? $J.str(type$) + '-' + o1 + '-' + o2 : $J.str(type$) + '-' + o2 + '-' + o1;
  }
  /**
   * Make a transaction session key given two game objects.
   *
   * @param type An identifier for the type of transaction.
   * @param o1 A {@code FreeColGameObject} involved in the session.
   * @param o2 Another {@code FreeColGameObject} involved in the session.
   * @return A transaction session key.
   */
  static makeSessionKey$Class$FreeColGameObject$FreeColGameObject(type$: JClass, o1: FreeColGameObject, o2: FreeColGameObject): string {
    return Session.makeSessionKey$Class$String$String(type$, o1.getId(), o2.getId());
  }
  /**
   * Complete all transactions.  Useful at the end of turn.
   *
   * @param cs A {@code ChangeSet} to update.
   */
  static completeAll(cs: ChangeSet): void {
    let sessions: List<Session>;
    {
      sessions = CollectionUtils.transform$Collection$Predicate(Session.allSessions.values(), (s) => !s.isComplete());
      Session.allSessions.clear();
    }
    for (const $it0 = sessions.iterator(); $it0.hasNext(); ) {
      let ts = $it0.next();
      ts.complete$ChangeSet(cs);
    }
  }
  /**
   * Clear all sessions.
   */
  static clearAll(): void {
    {
      Session.allSessions.clear();
    }
  }
  /**
   * Find a session matching a predicate.
   *
   * @param pred The {@code Predicate} to match.
   * @return The {@code Session} found if any.
   */
  static findSession(pred: Predicate<Session>): Session {
    {
      return CollectionUtils.find$Collection$Predicate(Session.allSessions.values(), pred);
    }
  }
  /**
   * Look up a session of specified type given the game objects involved.
   *
   * @param <T> The actual session class found.
   * @param type The class of session.
   * @param o1 The first {@code FreeColGameObject} in the session.
   * @param o2 The second {@code FreeColGameObject} in the session.
   * @return A session of the specified type, or null if not found.
   */
  static lookup$Class$FreeColGameObject$FreeColGameObject<T>(type$: JClass<T>, o1: FreeColGameObject, o2: FreeColGameObject): T {
    return Session.lookup$Class$String$String(type$, o1.getId(), o2.getId());
  }
  /**
   * Look up a session of specified type given the IDs of the game objects
   * involved.  This version is needed for sessions where one of the objects
   * may have already been disposed of while the session is still valid.
   *
   * @param <T> The actual session class found.
   * @param type The class of session.
   * @param s1 The identifier of the first object in the session.
   * @param s2 The identifier of the second object in the session.
   * @return A session of the specified type, or null if not found.
   */
  static lookup$Class$String$String<T>(type$: JClass<T>, s1: string, s2: string): T {
    let key = Session.makeSessionKey$Class$String$String(type$, s1, s2);
    return Session.lookup$Class$String(type$, key);
  }
  /**
   * Look up a session given its key.
   *
   * @param <T> The actual session class found.
   * @param type The class of session.
   * @param key The session key.
   * @return A session of the specified type, or null if not found.
   */
  static lookup$Class$String<T>(type$: JClass<T>, key: string): T {
    let ts = Session.getSession(key);
    if (ts != null && ts.isComplete()) {
      {
        Session.allSessions.remove(key);
      }
      ts = null;
    }
    return (ts == null) ? null : type$.cast(ts);
  }
  static $clinit() {
    Session.logger = Logger.getLogger($J.cls(Session).getName());
    Session.allSessions = new HashMap();
  }
}

$J.define(Session, 'net.sf.freecol.server.model.Session', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.lang.String': '_Session' }, returns: { 'isComplete': 'boolean', 'getKey': 'java.lang.String' }, meths: { 'lookup(java.lang.Class,java.lang.String)': 'lookup$Class$String', 'lookup(java.lang.Class,java.lang.String,java.lang.String)': 'lookup$Class$String$String', 'lookup(java.lang.Class,net.sf.freecol.common.model.FreeColGameObject,net.sf.freecol.common.model.FreeColGameObject)': 'lookup$Class$FreeColGameObject$FreeColGameObject', 'makeSessionKey(java.lang.Class,net.sf.freecol.common.model.FreeColGameObject,net.sf.freecol.common.model.FreeColGameObject)': 'makeSessionKey$Class$FreeColGameObject$FreeColGameObject', 'makeSessionKey(java.lang.Class,java.lang.String,java.lang.String)': 'makeSessionKey$Class$String$String', 'complete(net.sf.freecol.common.networking.ChangeSet)': 'complete$ChangeSet' }, clinit: true, lazy: ['logger', 'allSessions'] });
$J.module(() => {
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
