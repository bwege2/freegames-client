// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/ChangeSet.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, JEnum, JObject, Stream, StringBuilder } from '../../../../../../jre/index.ts';

let LastSale, Location, Ownable, Tile, Unit, WorkLocation, AddPlayerMessage, AnimateAttackMessage, AnimateMoveMessage, AttributeMessage, ErrorMessage, FeatureChangeMessage, Message, MultipleMessage, PartialMessage, RemoveMessage, SetAIMessage, SetStanceMessage, SpySettlementMessage, UpdateMessage, CollectionUtils, StringUtils;

/**
 * Changes to be sent to the client.
 */
export class ChangeSet extends JObject {
  /**
   * The changes to send.
   */
  changes: List<ChangeSet$Change> = null;
  /**
   * Simple constructor.
   */
  _ChangeSet$(): this {
    this.changes = new ArrayList();
    return this;
  }
  /**
   * Copying constructor.
   *
   * @param other The other {@code ChangeSet} to copy.
   */
  _ChangeSet$ChangeSet(other: ChangeSet): this {
    this.changes = new ArrayList(other.changes);
    return this;
  }
  /**
   * Are there changes present?
   *
   * @return True if there is no changes present.
   */
  isEmpty(): boolean {
    return this.changes.isEmpty();
  }
  /**
   * Clear the current changes.
   */
  clear(): void {
    this.changes.clear();
  }
  /**
   * Sometimes we need to backtrack on making a change.
   *
   * @param fcgo A {@code FreeColGameObject} to remove a matching
   *     change for.
   */
  remove(fcgo: FreeColGameObject): void {
    CollectionUtils.removeInPlace$Collection$Predicate(this.changes, (c) => c.matches(fcgo));
  }
  /**
   * Helper function to add updates for multiple objects to a ChangeSet.
   *
   * @param see The visibility of this change.
   * @param objects The {@code FreeColGameObject}s that changed.
   * @return The updated {@code ChangeSet}.
   */
  add$See$FreeColGameObjectArr(see: ChangeSet$See, objects: FreeColGameObject[]): ChangeSet {
    for (let o of objects) {
      this.changes.add(new ChangeSet$ObjectChange()._ChangeSet$ObjectChange(see, o));
    }
    return this;
  }
  /**
   * Helper function to add updates for multiple objects to a ChangeSet.
   *
   * @param see The visibility of this change.
   * @param objects The {@code FreeColGameObject}s that changed.
   * @return The updated {@code ChangeSet}.
   */
  add$See$Collection(see: ChangeSet$See, objects: Collection<FreeColGameObject>): ChangeSet {
    for (const $it0 = objects.iterator(); $it0.hasNext(); ) {
      let o = $it0.next();
      this.changes.add(new ChangeSet$ObjectChange()._ChangeSet$ObjectChange(see, o));
    }
    return this;
  }
  /**
   * Helper function to add a Message to a ChangeSet.
   *
   * @param <T> The actual message type.
   * @param see The visibility of this change.
   * @param message The {@code Message} to add.
   * @return The updated {@code ChangeSet}.
   */
  add$See$Message<T>(see: ChangeSet$See, message: T): ChangeSet {
    this.changes.add(new ChangeSet$MessageChange()._ChangeSet$MessageChange(see, message));
    return this;
  }
  /**
   * Helper function to add an attack to a ChangeSet.
   *
   * @param see The visibility of this change.
   * @param attacker The {@code Unit} that is attacking.
   * @param defender The {@code Unit} that is defending.
   * @param success Did the attack succeed?
   * @return The updated {@code ChangeSet}.
   */
  addAttack(see: ChangeSet$See, attacker: Unit, defender: Unit, success: boolean): ChangeSet {
    this.changes.add(new ChangeSet$AttackChange()._ChangeSet$AttackChange(see, attacker, defender, success));
    return this;
  }
  /**
   * Helper function to add a mergeable attribute setting to a ChangeSet.
   *
   * @param see The visibility of this change.
   * @param key A key {@code String}.
   * @param value The corresponding value as a {@code String}.
   * @return The updated {@code ChangeSet}.
   */
  addAttribute(see: ChangeSet$See, key: string, value: string): ChangeSet {
    this.changes.add(new ChangeSet$AttributeChange()._ChangeSet$AttributeChange(see, key, value));
    return this;
  }
  /**
   * Helper function to add a removal for an object that disappears
   * (that is, moves where it can not be seen) to a ChangeSet.
   *
   * @param owner The {@code Player} that owns this object.
   * @param tile The {@code Tile} where the object was.
   * @param fcgo The {@code FreeColGameObject} that disappears.
   * @return The updated {@code ChangeSet}.
   */
  addDisappear(owner: Player, tile: Tile, fcgo: FreeColGameObject): ChangeSet {
    this.changes.add(new ChangeSet$RemoveChange()._ChangeSet$RemoveChange(ChangeSet$See.perhaps().except(owner), tile, Stream.of(fcgo)));
    this.changes.add(new ChangeSet$ObjectChange()._ChangeSet$ObjectChange(ChangeSet$See.perhaps().except(owner), tile));
    return this;
  }
  /**
   * Helper function to add or remove an Ability to a FreeColGameObject.
   *
   * @param player The owning {@code Player}.
   * @param object The {@code FreeColGameObject} to add to.
   * @param ability The {@code Ability} to add/remove.
   * @param add If true, add the ability.
   * @return The updated {@code ChangeSet}.
   */
  addAbility(player: Player, object$: FreeColGameObject, ability: Ability, add: boolean): ChangeSet {
    this.changes.add(new ChangeSet$FeatureChange()._ChangeSet$FeatureChange(ChangeSet$See.only(player), object$, ability, add));
    if (add) {
      object$.addAbility(ability);
    } else {
      object$.removeAbility(ability);
    }
    return this;
  }
  /**
   * Helper function to add or remove a Modifier to a FreeColGameObject.
   *
   * @param player The owning {@code Player}.
   * @param object The {@code FreeColGameObject} to add to.
   * @param modifier The {@code Modifier} to add/remove.
   * @param add If true, add the modifier.
   * @return The updated {@code ChangeSet}.
   */
  addModifier(player: Player, object$: FreeColGameObject, modifier: Modifier, add: boolean): ChangeSet {
    this.changes.add(new ChangeSet$FeatureChange()._ChangeSet$FeatureChange(ChangeSet$See.only(player), object$, modifier, add));
    if (add) {
      object$.addModifier(modifier);
    } else {
      object$.removeModifier(modifier);
    }
    return this;
  }
  /**
   * Helper function to add a global history event to a ChangeSet.
   * Also adds the history to all the European players.
   *
   * @param game The {@code Game} to find players in.
   * @param history The {@code HistoryEvent} to add.
   * @return The updated {@code ChangeSet}.
   */
  addGlobalHistory(game: Game, history: HistoryEvent): ChangeSet {
    for (const $it1 = game.getLiveEuropeanPlayerList([]).iterator(); $it1.hasNext(); ) {
      let p = $it1.next();
      this.addHistory(p, history);
    }
    return this;
  }
  /**
   * Helper function to add a message to all the European players.
   *
   * @param game The {@code Game} to find players in.
   * @param omit An optional {@code Player} to omit.
   * @param message The {@code ModelMessage} to add.
   * @return The updated {@code ChangeSet}.
   */
  addGlobalMessage(game: Game, omit: Player, message: ModelMessage): ChangeSet {
    for (const $it2 = game.getLiveEuropeanPlayerList([]).iterator(); $it2.hasNext(); ) {
      let p = $it2.next();
      if (p === omit) {
        continue;
      }
      this.addMessage(p, message);
    }
    return this;
  }
  /**
   * Helper function to add a history event to a ChangeSet.
   * Also adds the history to the owner.
   *
   * @param player The {@code Player} making history.
   * @param history The {@code HistoryEvent} to add.
   * @return The updated {@code ChangeSet}.
   */
  addHistory(player: Player, history: HistoryEvent): ChangeSet {
    this.changes.add(new ChangeSet$FeatureChange()._ChangeSet$FeatureChange(ChangeSet$See.only(player), player, history, true));
    player.addHistory(history);
    return this;
  }
  /**
   * Helper function to add a message to a ChangeSet.
   *
   * @param player The {@code Player} to send the message to.
   * @param message The {@code ModelMessage} to add.
   * @return The updated {@code ChangeSet}.
   */
  addMessage(player: Player, message: ModelMessage): ChangeSet {
    this.changes.add(new ChangeSet$FeatureChange()._ChangeSet$FeatureChange(ChangeSet$See.only(player), player, message, true));
    return this;
  }
  /**
   * Helper function to add a move to a ChangeSet.
   *
   * @param see The visibility of this change.
   * @param unit The {@code Unit} that is moving.
   * @param loc The location from which the unit is moving.
   * @param tile The {@code Tile} to which the unit is moving.
   * @return The updated {@code ChangeSet}.
   */
  addMove(see: ChangeSet$See, unit: Unit, loc: Location, tile: Tile): ChangeSet {
    this.changes.add(new ChangeSet$MoveChange()._ChangeSet$MoveChange(see, unit, loc, tile));
    return this;
  }
  /**
   * Helper function to add a partial update change for an object to
   * a ChangeSet.
   *
   * @param <T> The actual type of object to add.
   * @param see The visibility of this change.
   * @param fcgo The {@code FreeColGameObject} to update.
   * @param fields The fields to update.
   * @return The updated {@code ChangeSet}.
   */
  addPartial<T>(see: ChangeSet$See, fcgo: T, fields: string[]): ChangeSet {
    this.changes.add(new ChangeSet$PartialObjectChange()._ChangeSet$PartialObjectChange(see, fcgo, CollectionUtils.asMap(fields)));
    return this;
  }
  /**
   * Helper function to add a new player to a ChangeSet.
   *
   * The added player should not be visible, as this is called
   * pre-game to update other players, but the actual player may not
   * yet even have a Game.
   *
   * @param player The new {@code Player} to add.
   * @return The updated {@code ChangeSet}.
   */
  addNewPlayer(player: Player): ChangeSet {
    this.changes.add(new ChangeSet$PlayerChange()._ChangeSet$PlayerChange(ChangeSet$See.all().except(player), Collections.singletonList(player)));
    return this;
  }
  /**
   * Helper function to add new players to a ChangeSet.
   *
   * Used when adding the AI players en masse, or when adding the REF.
   * No care need be taken with visibility wrt AIs.
   *
   * @param players A list of new {@code Player}s to add.
   * @return The updated {@code ChangeSet}.
   */
  addPlayers(players: List<Player>): ChangeSet {
    this.changes.add(new ChangeSet$PlayerChange()._ChangeSet$PlayerChange(ChangeSet$See.all(), players));
    return this;
  }
  /**
   * Helper function to add a removal to a ChangeSet.
   *
   * -vis: If disposing of units or colonies, this routine changes
   * player visibility.
   *
   * @param see The visibility of this change.
   * @param loc The {@code Location} where the object was.
   * @param obj The {@code FreeColGameObject} to remove.
   * @return The updated {@code ChangeSet}.
   */
  addRemove(see: ChangeSet$See, loc: Location, obj: FreeColGameObject): ChangeSet {
    this.changes.add(new ChangeSet$RemoveChange()._ChangeSet$RemoveChange(see, loc, obj.getDisposables()));
    return this;
  }
  /**
   * Helper function to add removals for several objects to a ChangeSet.
   *
   * @param see The visibility of this change.
   * @param loc The {@code Location} where the object was.
   * @param objects A list of {@code FreeColGameObject}s to remove.
   * @return The updated {@code ChangeSet}.
   */
  addRemoves(see: ChangeSet$See, loc: Location, objects: List<FreeColGameObject>): ChangeSet {
    for (const $it3 = objects.iterator(); $it3.hasNext(); ) {
      let fcgo = $it3.next();
      this.changes.add(new ChangeSet$RemoveChange()._ChangeSet$RemoveChange(see, loc, fcgo.getDisposables()));
    }
    return this;
  }
  /**
   * Helper function to add a sale change to a ChangeSet.
   *
   * @param player The {@code Player} making the sale.
   * @param settlement The {@code Settlement} that is buying.
   * @param type The {@code GoodsType} bought.
   * @param price The per unit price.
   * @return The updated {@code ChangeSet}.
   */
  addSale(player: Player, settlement: Settlement, type$: GoodsType, price: number): ChangeSet {
    let game = settlement.getGame();
    let sale = new LastSale()._LastSale$Location$GoodsType$Turn$int(settlement, type$, game.getTurn(), price);
    this.changes.add(new ChangeSet$FeatureChange()._ChangeSet$FeatureChange(ChangeSet$See.only(player), player, sale, true));
    player.addLastSale(sale);
    return this;
  }
  /**
   * Helper function to add a spying change to a ChangeSet.
   *
   * @param unit The {@code Unit} that is spying.
   * @param settlement The {@code Settlement} to spy on.
   * @return The updated {@code ChangeSet}.
   */
  addSpy(unit: Unit, settlement: Settlement): ChangeSet {
    this.changes.add(new ChangeSet$SpyChange()._ChangeSet$SpyChange(ChangeSet$See.only(unit.getOwner()), unit, settlement));
    return this;
  }
  /**
   * Helper function to add a stance change to a ChangeSet.
   *
   * @param see The visibility of this change.
   * @param first The {@code Player} changing stance.
   * @param stance The {@code Stance} to change to.
   * @param second The {@code Player} wrt with to change.
   * @return The updated {@code ChangeSet}.
   */
  addStance(see: ChangeSet$See, first: Player, stance: Stance, second: Player): ChangeSet {
    this.changes.add(new ChangeSet$StanceChange()._ChangeSet$StanceChange(see, first, stance, second));
    return this;
  }
  /**
   * Merge a change set into this one.
   *
   * @param other The other {@code ChangeSet}.
   */
  merge(other: ChangeSet): void {
    this.changes.addAll(other.changes);
  }
  /**
   * Build an update message.
   *
   * @param player The {@code Player} to send the update to.
   * @return A {@code Message} encapsulating an update of the objects to
   *     consider, or null if there is nothing to report.
   */
  build(player: Player): Message {
    if (this.changes.isEmpty()) {
      return null;
    }
    let messages = new ArrayList();
    let diverted = new ArrayList();
    for (const $it4 = this.changes.iterator(); $it4.hasNext(); ) {
      let c = $it4.next();
      if (!c.isNotifiable(player)) {
        continue;
      }
      let m = c.toMessage(player);
      let onto = (m.canMerge()) ? diverted : messages;
      onto.add(m);
      if ((c = c.consequence(player)) != null) {
        m = c.toMessage(player);
        onto = (m.canMerge()) ? diverted : messages;
        onto.add(m);
      }
    }
    messages.sort(Message.messagePriorityComparator);
    diverted.sort(Message.messagePriorityComparator);
    if (messages.size() > 1) {
      let more = new ArrayList();
      let head = messages.removeAt(0);
      while (!messages.isEmpty()) {
        let m = messages.removeAt(0);
        if (!head.merge(m)) {
          more.add(head);
          head = m;
        }
      }
      more.add(head);
      messages = more;
    }
    let mm = new MultipleMessage()._MultipleMessage$List(messages);
    mm.setMergeable(true);
    for (const $it5 = diverted.iterator(); $it5.hasNext(); ) {
      let m = $it5.next();
      mm.merge(m);
    }
    return mm.simplify();
  }
  /**
   * Convenience function to create an i18n client error message and
   * wrap it into a change set.
   *
   * @param player An optional {@code Player} to restrict visibility to.
   * @param template An i18n template.
   * @return A new {@code ChangeSet}.
   */
  static clientError$Player$StringTemplate(player: Player, template: StringTemplate): ChangeSet {
    let see = (player == null) ? ChangeSet$See.all() : ChangeSet$See.only(player);
    return ChangeSet.clientError$See$StringTemplate(see, template);
  }
  /**
   * Convenience function to create an i18n client error message and
   * wrap it into a change set.
   *
   * @param see The message visibility.
   * @param template An i18n template.
   * @return A new {@code ChangeSet}.
   */
  static clientError$See$StringTemplate(see: ChangeSet$See, template: StringTemplate): ChangeSet {
    let cs = new ChangeSet()._ChangeSet$();
    if (see == null) {
      see = ChangeSet$See.all();
    }
    cs.add$See$Message(see, new ErrorMessage()._ErrorMessage$StringTemplate(template));
    return cs;
  }
  /**
   * Convenience function to create a non-i18n client error message
   * and wrap it into a change set.
   *
   * @param player An optional {@code Player} to restrict visibility to.
   * @param message The message.
   * @return A new {@code ChangeSet}.
   */
  static clientError$Player$String(player: Player, message: string): ChangeSet {
    let see = (player == null) ? ChangeSet$See.all() : ChangeSet$See.only(player);
    return ChangeSet.clientError$See$String(see, message);
  }
  /**
   * Convenience function to create a non-i18n client error message
   * and wrap it into a change set.
   *
   * @param see The message visibility.
   * @param message A non-i18n message.
   * @return A new {@code ChangeSet}.
   */
  static clientError$See$String(see: ChangeSet$See, message: string): ChangeSet {
    let cs = new ChangeSet()._ChangeSet$();
    if (see == null) {
      see = ChangeSet$See.all();
    }
    cs.add$See$Message(see, new ErrorMessage()._ErrorMessage$String(message));
    return cs;
  }
  /**
   * Convenience function to create a change set containing a message.
   *
   * @param player An optional {@code Player} to restrict visibility to.
   * @param message The {@code Message} to wrap.
   * @return A new {@code ChangeSet}.
   */
  static simpleChange$Player$Message(player: Player, message: Message): ChangeSet {
    let see = (player == null) ? ChangeSet$See.all() : ChangeSet$See.only(player);
    return ChangeSet.simpleChange$See$Message(see, message);
  }
  /**
   * Convenience function to create a change set containing a message.
   *
   * @param see The message visibility.
   * @param message The {@code Message} to wrap.
   * @return A new {@code ChangeSet}.
   */
  static simpleChange$See$Message(see: ChangeSet$See, message: Message): ChangeSet {
    let cs = new ChangeSet()._ChangeSet$();
    cs.add$See$Message((see == null) ? ChangeSet$See.all() : see, message);
    return cs;
  }
  /**
   * Get a new ChangeSet that changes a player AI state.
   *
   * @param player The {@code Player} to change.
   * @param ai The new AI state.
   * @return The new {@code ChangeSet}.
   */
  static aiChange(player: Player, ai: boolean): ChangeSet {
    return ChangeSet.simpleChange$See$Message(ChangeSet$See.all(), new SetAIMessage()._SetAIMessage$Player$boolean(player, ai));
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder();
    for (const $it6 = this.changes.iterator(); $it6.hasNext(); ) {
      let c = $it6.next();
      sb.append($J.str(c)).append(String.fromCharCode(10 /* \u000a */));
    }
    return sb.toString();
  }
}

/**
 * Result of a visibility check.
 */
export class ChangeSet$SeeCheck extends JEnum {
  static VISIBLE: ChangeSet$SeeCheck = null;
  static INVISIBLE: ChangeSet$SeeCheck = null;
  static SPECIAL: ChangeSet$SeeCheck = null;
  static $VALUES: ChangeSet$SeeCheck[] = null;
  _ChangeSet$SeeCheck($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): ChangeSet$SeeCheck[] { return ChangeSet$SeeCheck.$VALUES.slice(); }
  static valueOf(name: string): ChangeSet$SeeCheck { return $J.enumValueOf(ChangeSet$SeeCheck, name); }
  static $clinit() {
    ChangeSet$SeeCheck.VISIBLE = new ChangeSet$SeeCheck()._ChangeSet$SeeCheck('VISIBLE', 0);
    ChangeSet$SeeCheck.INVISIBLE = new ChangeSet$SeeCheck()._ChangeSet$SeeCheck('INVISIBLE', 1);
    ChangeSet$SeeCheck.SPECIAL = new ChangeSet$SeeCheck()._ChangeSet$SeeCheck('SPECIAL', 2);
    ChangeSet$SeeCheck.$VALUES = [ChangeSet$SeeCheck.VISIBLE, ChangeSet$SeeCheck.INVISIBLE, ChangeSet$SeeCheck.SPECIAL];
  }
}

/**
 * Class to control the visibility of a change.
 */
export class ChangeSet$See extends JObject {
  static readonly ALL: number = 1;
  static readonly PERHAPS: number = 0;
  static readonly ONLY: number = -1;
  seeAlways: Player = null;
  seePerhaps: Player = null;
  seeNever: Player = null;
  type: number = 0;
  _ChangeSet$See(type$: number): this {
    this.seeAlways = this.seePerhaps = this.seeNever = null;
    this.type = type$;
    return this;
  }
  /**
   * Check this visibility with respect to a player.
   *
   * @param player The {@code Player} to consider.
   * @return If the player satisfies the visibility test return VISIBLE,
   *     or INVISIBLE on failure, or SPECIAL if indeterminate.
   */
  check(player: Player): ChangeSet$SeeCheck {
    return (player != null && player === this.seeNever) ? ChangeSet$SeeCheck.INVISIBLE : (player != null && player === this.seeAlways) ? ChangeSet$SeeCheck.VISIBLE : (player != null && player === this.seePerhaps) ? ChangeSet$SeeCheck.SPECIAL : (this.type === ChangeSet$See.ONLY) ? ChangeSet$SeeCheck.INVISIBLE : (this.type === ChangeSet$See.ALL) ? ChangeSet$SeeCheck.VISIBLE : ChangeSet$SeeCheck.SPECIAL;
  }
  /**
   * Make this change visible to all players.
   *
   * @return See(ALL).
   */
  static all(): ChangeSet$See {
    return new ChangeSet$See()._ChangeSet$See(ChangeSet$See.ALL);
  }
  /**
   * Make this change visible to all players, provided they can
   * see the objects that are being changed.
   *
   * @return See(PERHAPS).
   */
  static perhaps(): ChangeSet$See {
    return new ChangeSet$See()._ChangeSet$See(ChangeSet$See.PERHAPS);
  }
  /**
   * Make this change visible only to the given player.
   *
   * @param player The {@code Player} to see this change.
   * @return A {@code See}(ONLY) with attached player.
   */
  static only(player: Player): ChangeSet$See {
    return new ChangeSet$See()._ChangeSet$See(ChangeSet$See.ONLY).always(player);
  }
  /**
   * Make this change visible to the given player.
   *
   * @param player The {@code Player} to see this change.
   * @return A {@code See} with attached player.
   */
  always(player: Player): ChangeSet$See {
    this.seeAlways = player;
    return this;
  }
  /**
   * Make this change visible to the given player, provided the
   * player can see the objects being changed.
   *
   * @param player The {@code Player} to perhaps see this change.
   * @return A {@code See} with attached player.
   */
  perhapsOnly(player: Player): ChangeSet$See {
    this.seePerhaps = player;
    return this;
  }
  /**
   * Make this change invisible to the given player.
   *
   * @param player The {@code Player} that can not see this change.
   * @return A {@code See} with attached player.
   */
  except(player: Player): ChangeSet$See {
    this.seeNever = player;
    return this;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(64);
    sb.append((this.type === ChangeSet$See.ALL) ? 'ALL' : (this.type === ChangeSet$See.PERHAPS) ? 'PERHAPS' : (this.type === ChangeSet$See.ONLY) ? 'ONLY' : 'BADTYPE');
    if (this.seeAlways != null) {
      sb.append(',always(').append(this.seeAlways.getId()).append(String.fromCharCode(41 /* ')' */));
    }
    if (this.seePerhaps != null) {
      sb.append(',perhaps(').append(this.seePerhaps.getId()).append(String.fromCharCode(41 /* ')' */));
    }
    if (this.seeNever != null) {
      sb.append(',never(').append(this.seeNever.getId()).append(String.fromCharCode(41 /* ')' */));
    }
    return sb.toString();
  }
}

/**
 * Abstract template for all types of Change.
 */
export class ChangeSet$Change<T> extends JObject {
  /**
   * The visibility of the change.
   */
  see: ChangeSet$See = null;
  /**
   * Make a new Change.
   *
   * @param see The visibility.
   */
  _ChangeSet$Change(see: ChangeSet$See): this {
    this.see = see;
    return this;
  }
  /**
   * Check this changes visibility to a given player.
   *
   * @param player The {@code player} to check.
   * @return The visibility result.
   */
  check(player: Player): ChangeSet$SeeCheck {
    return this.see.check(player);
  }
  /**
   * Does this Change operate on the given object?
   *
   * @param fcgo The {@code FreeColGameObject} to check.
   * @return True if the object is a subject of this change.
   */
  matches(fcgo: FreeColGameObject): boolean {
    return false;
  }
  /**
   * Should a player be notified of this Change?
   *
   * Override in subclasses with special cases.
   *
   * @param player The {@code Player} to consider.
   * @return True if this {@code Change} should be sent.
   */
  isNotifiable(player: Player): boolean {
    return this.check(player) === ChangeSet$SeeCheck.VISIBLE;
  }
  /**
   * Are the secondary changes consequent to this Change?
   *
   * @param player The {@code Player} to consider.
   * @return The consequent {@code Change}, or null if none.
   */
  consequence(player: Player): ChangeSet$Change {
    return null;
  }
}

/**
 * Encapsulate an attack.
 */
export class ChangeSet$AttackChange extends ChangeSet$Change {
  attacker: Unit = null;
  defender: Unit = null;
  success: boolean = false;
  defenderInSettlement: boolean = false;
  /**
   * Build a new AttackChange.
   *
   * Note that we must copy attackers and defenders because a
   * successful attacker can move, and an unsuccessful
   * participant can die, and unsuccessful defenders can be
   * captured.  Furthermore for defenders, insufficient
   * information is serialized when a unit is inside a
   * settlement, but if unscoped too much is disclosed.  So we
   * make a copy and neuter it.
   *
   * We have to remember if the defender was in a settlement
   * because by the time serialization occurs the settlement
   * might have been destroyed.
   *
   * We just have to accept that combat animation is an
   * exception to the normal visibility rules.
   *
   * @param see The visibility of this change.
   * @param attacker The {@code Unit} that is attacking.
   * @param defender The {@code Unit} that is defending.
   * @param success Did the attack succeed.
   */
  _ChangeSet$AttackChange(see: ChangeSet$See, attacker: Unit, defender: Unit, success: boolean): this {
    this._ChangeSet$Change(see);
    let game = attacker.getGame();
    this.attacker = attacker.copy$Game$Class(game, $J.cls(Unit));
    this.defender = defender.copy$Game$Class(game, $J.cls(Unit));
    this.success = success;
    this.defenderInSettlement = defender.getTile$().hasSettlement();
    return this;
  }
  /**
   * Is the attacker visible to a player?
   *
   * @param player The {@code Player} to test.
   * @return The attacker visibility.
   */
  attackerVisible(player: Player): boolean {
    return player.canSeeUnit(this.attacker);
  }
  /**
   * Is the defender visible to a player?
   *
   * A false positive can occur as the defender may *start*
   * invisible because it is in a settlement, but the settlement
   * falls, exposing the defender (the defender dies).
   * Defenders in settlements must always be considered to be
   * invisible to other players as the animation happens while
   * the settlement stands.
   *
   * @param player The {@code Player} to test.
   * @return The defender visibility.
   */
  defenderVisible(player: Player): boolean {
    return player.canSeeUnit(this.defender) && (!this.defenderInSettlement || player.owns(this.defender));
  }
  /**
   * {@inheritDoc}
   */
  isNotifiable(player: Player): boolean {
    switch (this.check(player)) {
      case ChangeSet$SeeCheck.VISIBLE:
        return true;
      case ChangeSet$SeeCheck.INVISIBLE:
        return false;
      case ChangeSet$SeeCheck.SPECIAL:
        break;
    }
    return player.owns(this.attacker) || player.owns(this.defender) || (player.canSee(this.attacker.getTile$()) && player.canSee(this.defender.getTile$()));
  }
  /**
   * {@inheritDoc}
   */
  toMessage(player: Player): AnimateAttackMessage {
    if (!this.isNotifiable(player)) {
      return null;
    }
    let a = (player.owns(this.attacker)) ? this.attacker : this.attacker.reduceVisibility(this.attacker.getTile$(), player);
    let d = (player.owns(this.defender)) ? this.defender : this.defender.reduceVisibility(this.defender.getTile$(), player);
    return new AnimateAttackMessage()._AnimateAttackMessage$Unit$Unit$boolean$boolean$boolean(a, d, this.success, !this.attackerVisible(player), !this.defenderVisible(player));
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(64);
    sb.append(String.fromCharCode(91 /* '[' */)).append($J.getClass(this).getName()).append(String.fromCharCode(32 /* ' ' */)).append($J.str(this.see)).append(String.fromCharCode(32 /* ' ' */)).append(this.attacker.getId()).append(String.fromCharCode(64 /* '@' */)).append(this.attacker.getTile$().getId()).append(String.fromCharCode(32 /* ' ' */)).append(String(this.success)).append(String.fromCharCode(32 /* ' ' */)).append(this.defender.getId()).append(String.fromCharCode(64 /* '@' */)).append(this.defender.getTile$().getId()).append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
}

/**
 * Encapsulate an attribute change.
 */
export class ChangeSet$AttributeChange extends ChangeSet$Change {
  key: string = null;
  value_: string = null;
  /**
   * Build a new AttributeChange.
   *
   * @param see The visibility of this change.
   * @param key A key {@code String}.
   * @param value The corresponding value as a {@code String}.
   */
  _ChangeSet$AttributeChange(see: ChangeSet$See, key: string, value: string): this {
    this._ChangeSet$Change(see);
    this.key = key;
    this.value_ = value;
    return this;
  }
  /**
   * {@inheritDoc}
   */
  toMessage(player: Player): AttributeMessage {
    return new AttributeMessage()._AttributeMessage$String$StringArr(AttributeMessage.TAG, [this.key, this.value_]).setMergeable(true);
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(32);
    sb.append(String.fromCharCode(91 /* '[' */)).append($J.getClass(this).getName()).append(String.fromCharCode(32 /* ' ' */)).append($J.str(this.see)).append(String.fromCharCode(32 /* ' ' */)).append(this.key).append(String.fromCharCode(61 /* '=' */)).append(this.value_).append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
}

/**
 * Encapsulate a feature change.
 */
export class ChangeSet$FeatureChange extends ChangeSet$Change {
  parent: FreeColGameObject = null;
  child: FreeColObject = null;
  add_: boolean = false;
  /**
   * Build a new FeatureChange.
   *
   * @param see The visibility of this change.
   * @param parent The {@code FreeColGameObject} to update.
   * @param child The {@code FreeColObject} value to add or remove.
   * @param add If true, add the child, if not, remove it.
   */
  _ChangeSet$FeatureChange(see: ChangeSet$See, parent: FreeColGameObject, child: FreeColObject, add: boolean): this {
    this._ChangeSet$Change(see);
    this.parent = parent;
    this.child = child;
    this.add_ = add;
    return this;
  }
  /**
   * {@inheritDoc}
   */
  isNotifiable(player: Player): boolean {
    return this.check(player) === ChangeSet$SeeCheck.VISIBLE;
  }
  /**
   * {@inheritDoc}
   */
  toMessage(player: Player): FeatureChangeMessage {
    return (!this.isNotifiable(player)) ? null : new FeatureChangeMessage()._FeatureChangeMessage$FreeColGameObject$FreeColObject$boolean(this.parent, this.child, this.add_);
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(32);
    sb.append(String.fromCharCode(91 /* '[' */)).append($J.getClass(this).getName()).append(String.fromCharCode(32 /* ' ' */)).append($J.str(this.see)).append(String.fromCharCode(32 /* ' ' */)).append((this.add_) ? 'add' : 'remove').append(String.fromCharCode(32 /* ' ' */)).append($J.str(this.child)).append(String.fromCharCode(32 /* ' ' */)).append((this.add_) ? 'to' : 'from').append(String.fromCharCode(32 /* ' ' */)).append(this.parent.getId()).append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
}

/**
 * Encapsulate a Message.
 */
export class ChangeSet$MessageChange<T> extends ChangeSet$Change {
  message: T = null;
  /**
   * Build a new MessageChange.
   *
   * @param see The visibility of this change.
   * @param message The {@code Message} to add.
   */
  _ChangeSet$MessageChange(see: ChangeSet$See, message: T): this {
    this._ChangeSet$Change(see);
    this.message = message;
    return this;
  }
  /**
   * {@inheritDoc}
   */
  toMessage(player: Player): T {
    return (this.isNotifiable(player)) ? this.message : null;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(32);
    sb.append(String.fromCharCode(91 /* '[' */)).append(StringUtils.lastPart($J.getClass(this).getName(), '.')).append(String.fromCharCode(32 /* ' ' */)).append($J.str(this.see)).append(String.fromCharCode(32 /* ' ' */)).append($J.str(this.message)).append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
}

/**
 * Encapsulate a move.
 */
export class ChangeSet$MoveChange extends ChangeSet$Change {
  unit: Unit = null;
  oldLocation: Location = null;
  newTile: Tile = null;
  /**
   * Build a new MoveChange.
   *
   * @param see The visibility of this change.
   * @param unit The {@code Unit} that is moving.
   * @param oldLocation The location from which the unit is moving.
   * @param newTile The {@code Tile} to which the unit is moving.
   */
  _ChangeSet$MoveChange(see: ChangeSet$See, unit: Unit, oldLocation: Location, newTile: Tile): this {
    this._ChangeSet$Change(see);
    this.unit = unit;
    this.oldLocation = oldLocation;
    this.newTile = newTile;
    return this;
  }
  /**
   * Can a player see the old tile?
   *
   * @param player The {@code Player} to test.
   * @return True if the old tile is visible.
   */
  seeOld(player: Player): boolean {
    let oldTile = this.oldLocation.getTile$();
    return player.owns(this.unit) || (oldTile != null && player.canSee(oldTile) && !(oldTile.hasSettlement() || (this.oldLocation instanceof Unit)));
  }
  /**
   * Can a player see the new tile?
   *
   * @param player The {@code Player} to test.
   * @return True if the new tile is visible.
   */
  seeNew(player: Player): boolean {
    return player.canSeeUnit(this.unit);
  }
  /**
   * {@inheritDoc}
   */
  isNotifiable(player: Player): boolean {
    if (player.isAI()) {
      return false;
    }
    switch (this.check(player)) {
      case ChangeSet$SeeCheck.VISIBLE:
        return true;
      case ChangeSet$SeeCheck.INVISIBLE:
        return false;
      case ChangeSet$SeeCheck.SPECIAL:
        break;
    }
    return this.seeOld(player) || this.seeNew(player);
  }
  /**
   * {@inheritDoc}
   */
  consequence(player: Player): ChangeSet$Change {
    return (this.seeOld(player) && !this.seeNew(player) && !this.unit.isDisposed()) ? new ChangeSet$RemoveChange()._ChangeSet$RemoveChange(ChangeSet$See.only(player), this.unit.getLocation(), Stream.of(this.unit)) : null;
  }
  /**
   * {@inheritDoc}
   */
  toMessage(player: Player): AnimateMoveMessage {
    if (!this.isNotifiable(player)) {
      return null;
    }
    let oldTile = this.oldLocation.getTile$();
    let u = (player.owns(this.unit)) ? this.unit : this.unit.reduceVisibility(this.oldLocation.getTile$(), player);
    return new AnimateMoveMessage()._AnimateMoveMessage$Unit$Tile$Tile$boolean(u, oldTile, this.newTile, !this.seeOld(player));
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(32);
    sb.append(String.fromCharCode(91 /* '[' */)).append($J.getClass(this).getName()).append(String.fromCharCode(32 /* ' ' */)).append($J.str(this.see)).append(String.fromCharCode(32 /* ' ' */)).append(this.unit.getId()).append(String.fromCharCode(32 /* ' ' */)).append(this.oldLocation.getId()).append(String.fromCharCode(32 /* ' ' */)).append(this.newTile.getId()).append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
}

/**
 * Encapsulate a FreeColGameObject update.
 */
export class ChangeSet$ObjectChange extends ChangeSet$Change {
  fcgo: FreeColGameObject = null;
  /**
   * Build a new ObjectChange for a single object.
   *
   * @param see The visibility of this change.
   * @param fcgo The {@code FreeColGameObject} to update.
   */
  _ChangeSet$ObjectChange(see: ChangeSet$See, fcgo: FreeColGameObject): this {
    this._ChangeSet$Change(see);
    this.fcgo = fcgo;
    return this;
  }
  /**
   * {@inheritDoc}
   */
  matches(fcgo: FreeColGameObject): boolean {
    return this.fcgo === fcgo;
  }
  /**
   * {@inheritDoc}
   */
  isNotifiable(player: Player): boolean {
    switch (this.check(player)) {
      case ChangeSet$SeeCheck.VISIBLE:
        return true;
      case ChangeSet$SeeCheck.INVISIBLE:
        return false;
      case ChangeSet$SeeCheck.SPECIAL:
        break;
    }
    if (this.fcgo == null) {
      return false;
    }
    if (this.fcgo instanceof Unit) {
      return player.canSeeUnit(this.fcgo);
    }
    if ($J.isa(this.fcgo, Ownable) && player.owns(this.fcgo)) {
      return true;
    }
    if (this.fcgo instanceof WorkLocation) {
      return false;
    }
    if ($J.isa(this.fcgo, Location)) {
      let tile = (this.fcgo).getTile$();
      return player.canSee(tile);
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  toMessage(player: Player): UpdateMessage {
    return (!this.isNotifiable(player)) ? null : new UpdateMessage()._UpdateMessage$Player$List(player, Collections.singletonList(this.fcgo));
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(32);
    sb.append(String.fromCharCode(91 /* '[' */)).append($J.getClass(this).getName()).append(String.fromCharCode(32 /* ' ' */)).append($J.str(this.see)).append(String.fromCharCode(32 /* ' ' */)).append((this.fcgo == null) ? '<null>' : this.fcgo.getId()).append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
}

/**
 * Encapsulate a partial update of a FreeColGameObject.
 */
export class ChangeSet$PartialObjectChange<T> extends ChangeSet$Change {
  map_: JMap<string, string> = null;
  /**
   * Build a new PartialObjectChange for a single object.
   *
   * @param see The visibility of this change.
   * @param fcgo The {@code FreeColGameObject} to update.
   * @param map A map of the field to update to the value to use.
   */
  _ChangeSet$PartialObjectChange(see: ChangeSet$See, fcgo: T, map: JMap<string, string>): this {
    this._ChangeSet$Change(see);
    this.map_ = map;
    this.map_.put(PartialMessage.ID_TAG, fcgo.getId());
    return this;
  }
  /**
   * {@inheritDoc}
   */
  toMessage(player: Player): PartialMessage {
    return new PartialMessage()._PartialMessage$Map(this.map_);
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(32);
    sb.append(String.fromCharCode(91 /* '[' */)).append($J.getClass(this).getName()).append(String.fromCharCode(32 /* ' ' */)).append($J.str(this.see));
    for (const $it7 = this.map_.entrySet().iterator(); $it7.hasNext(); ) {
      let e = $it7.next();
      sb.append(String.fromCharCode(32 /* ' ' */)).append(e.getKey()).append(String.fromCharCode(61 /* '=' */)).append(e.getValue());
    }
    sb.append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
}

/**
 * Encapsulate a new player change.
 */
export class ChangeSet$PlayerChange extends ChangeSet$Change {
  players: List<Player> = null;
  /**
   * Build a new PlayerChange.
   *
   * @param see The visibility of this change.
   * @param newPlayers The {@code Player}s to add.
   */
  _ChangeSet$PlayerChange(see: ChangeSet$See, newPlayers: List<Player>): this {
    this._ChangeSet$Change(see);
    this.players = new ArrayList();
    this.players.clear();
    this.players.addAll(newPlayers);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  toMessage(player: Player): AddPlayerMessage {
    if (!this.isNotifiable(player)) {
      return null;
    }
    return new AddPlayerMessage()._AddPlayerMessage$Player$List(player, this.players);
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(32);
    sb.append(String.fromCharCode(91 /* '[' */)).append($J.getClass(this).getName()).append(String.fromCharCode(32 /* ' ' */)).append($J.str(this.see));
    for (const $it8 = this.players.iterator(); $it8.hasNext(); ) {
      let p = $it8.next();
      sb.append(String.fromCharCode(32 /* ' ' */)).append(p.getId());
    }
    sb.append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
}

/**
 * Encapsulates removing some objects.
 *
 * -vis: If removing settlements or units, visibility changes.
 */
export class ChangeSet$RemoveChange extends ChangeSet$Change {
  tile: Tile = null;
  contents: List<FreeColGameObject> = null;
  /**
   * Build a new RemoveChange for an object that is disposed.
   *
   * @param see The visibility of this change.
   * @param loc The {@code Location} where the object was.
   * @param objects The {@code FreeColGameObject}s to remove.
   */
  _ChangeSet$RemoveChange(see: ChangeSet$See, loc: Location, objects: Stream<FreeColGameObject>): this {
    this._ChangeSet$Change(see);
    this.tile = (loc instanceof Tile) ? loc : null;
    this.contents = CollectionUtils.toList$Stream(objects);
    return this;
  }
  /**
   * By convention, the main object is last.  All other objects are
   * internal to it and should be removed first if visible.
   *
   * @return The main object.
   */
  getMainObject(): FreeColGameObject {
    return this.contents.get((this.contents.size() - 1) | 0);
  }
  /**
   * Should we tell a player to remove all the objects or just
   * the main one?
   *
   * @param player A {@code Player} to check.
   * @return True if all the objects must go.
   */
  fullRemoval(player: Player): boolean {
    let fcgo = this.getMainObject();
    return $J.isa(fcgo, Ownable) && player.owns(fcgo);
  }
  /**
   * {@inheritDoc}
   */
  isNotifiable(player: Player): boolean {
    switch (this.check(player)) {
      case ChangeSet$SeeCheck.VISIBLE:
        return true;
      case ChangeSet$SeeCheck.INVISIBLE:
        return false;
      case ChangeSet$SeeCheck.SPECIAL:
        break;
    }
    let settlement: Settlement;
    return this.tile != null && player.canSee(this.tile) && ((settlement = this.tile.getSettlement()) == null || settlement.isDisposed() || player.owns(settlement));
  }
  /**
   * {@inheritDoc}
   */
  toMessage(player: Player): RemoveMessage {
    let divertId = (this.tile != null) ? this.tile.getId() : player.getId();
    return new RemoveMessage()._RemoveMessage$String$List(divertId, ((this.fullRemoval(player)) ? this.contents : Collections.singletonList(this.getMainObject())));
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(32);
    sb.append(String.fromCharCode(91 /* '[' */)).append($J.getClass(this).getName()).append(String.fromCharCode(32 /* ' ' */)).append($J.str(this.see)).append(String.fromCharCode(32 /* ' ' */)).append(((this.tile == null) ? '<null>' : this.tile.getId()));
    for (const $it9 = this.contents.iterator(); $it9.hasNext(); ) {
      let f = $it9.next();
      sb.append(String.fromCharCode(32 /* ' ' */)).append(f.getId());
    }
    sb.append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
}

/**
 * Encapsulates a spying action.
 */
export class ChangeSet$SpyChange extends ChangeSet$Change {
  unit: Unit = null;
  settlement: Settlement = null;
  /**
   * Build a new SpyChange.
   *
   * @param see The visibility of this change.
   * @param unit The {@code Unit} that is spying.
   * @param settlement The {@code Settlement} to spy on.
   */
  _ChangeSet$SpyChange(see: ChangeSet$See, unit: Unit, settlement: Settlement): this {
    this._ChangeSet$Change(see);
    this.unit = unit;
    this.settlement = settlement;
    return this;
  }
  /**
   * {@inheritDoc}
   */
  toMessage(player: Player): SpySettlementMessage {
    return (!this.isNotifiable(player)) ? null : new SpySettlementMessage()._SpySettlementMessage$Unit$Settlement(this.unit, this.settlement);
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(32);
    sb.append(String.fromCharCode(91 /* '[' */)).append($J.getClass(this).getName()).append(String.fromCharCode(32 /* ' ' */)).append($J.str(this.see)).append(String.fromCharCode(32 /* ' ' */)).append(this.settlement.getId()).append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
}

/**
 * Encapsulate a stance change.
 */
export class ChangeSet$StanceChange extends ChangeSet$Change {
  first_: Player = null;
  stance: Stance = null;
  second: Player = null;
  /**
   * Build a new StanceChange.
   *
   * @param see The visibility of this change.
   * @param first The {@code Player} changing stance.
   * @param stance The {@code Stance} to change to.
   * @param second The {@code Player} wrt with to change.
   */
  _ChangeSet$StanceChange(see: ChangeSet$See, first: Player, stance: Stance, second: Player): this {
    this._ChangeSet$Change(see);
    this.first_ = first;
    this.stance = stance;
    this.second = second;
    return this;
  }
  /**
   * {@inheritDoc}
   */
  toMessage(player: Player): SetStanceMessage {
    return (!this.isNotifiable(player)) ? null : new SetStanceMessage()._SetStanceMessage$Stance$Player$Player(this.stance, this.first_, this.second);
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(32);
    sb.append(String.fromCharCode(91 /* '[' */)).append($J.getClass(this).getName()).append(String.fromCharCode(32 /* ' ' */)).append($J.str(this.see)).append(String.fromCharCode(32 /* ' ' */)).append(this.first_.getId()).append(String.fromCharCode(32 /* ' ' */)).append($J.str(this.stance)).append(String.fromCharCode(32 /* ' ' */)).append(this.second.getId()).append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
}

$J.define(ChangeSet, 'net.sf.freecol.common.networking.ChangeSet', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.networking.ChangeSet': '_ChangeSet$ChangeSet', '': '_ChangeSet$' }, returns: { 'isEmpty': 'boolean' }, meths: { 'simpleChange(net.sf.freecol.common.networking.ChangeSet$See,net.sf.freecol.common.networking.Message)': 'simpleChange$See$Message', 'simpleChange(net.sf.freecol.common.model.Player,net.sf.freecol.common.networking.Message)': 'simpleChange$Player$Message', 'clientError(net.sf.freecol.common.networking.ChangeSet$See,java.lang.String)': 'clientError$See$String', 'clientError(net.sf.freecol.common.model.Player,java.lang.String)': 'clientError$Player$String', 'clientError(net.sf.freecol.common.networking.ChangeSet$See,net.sf.freecol.common.model.StringTemplate)': 'clientError$See$StringTemplate', 'clientError(net.sf.freecol.common.model.Player,net.sf.freecol.common.model.StringTemplate)': 'clientError$Player$StringTemplate', 'add(net.sf.freecol.common.networking.ChangeSet$See,net.sf.freecol.common.networking.Message)': 'add$See$Message', 'add(net.sf.freecol.common.networking.ChangeSet$See,java.util.Collection)': 'add$See$Collection', 'add(net.sf.freecol.common.networking.ChangeSet$See,net.sf.freecol.common.model.FreeColGameObject[])': 'add$See$FreeColGameObjectArr' } });
$J.define(ChangeSet$SeeCheck, 'net.sf.freecol.common.networking.ChangeSet$SeeCheck', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_ChangeSet$SeeCheck' }, clinit: true, lazy: ['$VALUES', 'VISIBLE', 'INVISIBLE', 'SPECIAL'] });
$J.define(ChangeSet$See, 'net.sf.freecol.common.networking.ChangeSet$See', { kind: 'class', sup: 'java.lang.Object', ctors: { 'int': '_ChangeSet$See' } });
$J.define(ChangeSet$Change, 'net.sf.freecol.common.networking.ChangeSet$Change', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.networking.ChangeSet$See': '_ChangeSet$Change' } });
$J.define(ChangeSet$AttackChange, 'net.sf.freecol.common.networking.ChangeSet$AttackChange', { kind: 'class', sup: 'net.sf.freecol.common.networking.ChangeSet$Change', ctors: { 'net.sf.freecol.common.networking.ChangeSet$See,net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.Unit,boolean': '_ChangeSet$AttackChange' } });
$J.define(ChangeSet$AttributeChange, 'net.sf.freecol.common.networking.ChangeSet$AttributeChange', { kind: 'class', sup: 'net.sf.freecol.common.networking.ChangeSet$Change', ctors: { 'net.sf.freecol.common.networking.ChangeSet$See,java.lang.String,java.lang.String': '_ChangeSet$AttributeChange' } });
$J.define(ChangeSet$FeatureChange, 'net.sf.freecol.common.networking.ChangeSet$FeatureChange', { kind: 'class', sup: 'net.sf.freecol.common.networking.ChangeSet$Change', ctors: { 'net.sf.freecol.common.networking.ChangeSet$See,net.sf.freecol.common.model.FreeColGameObject,net.sf.freecol.common.model.FreeColObject,boolean': '_ChangeSet$FeatureChange' } });
$J.define(ChangeSet$MessageChange, 'net.sf.freecol.common.networking.ChangeSet$MessageChange', { kind: 'class', sup: 'net.sf.freecol.common.networking.ChangeSet$Change', ctors: { 'net.sf.freecol.common.networking.ChangeSet$See,net.sf.freecol.common.networking.Message': '_ChangeSet$MessageChange' } });
$J.define(ChangeSet$MoveChange, 'net.sf.freecol.common.networking.ChangeSet$MoveChange', { kind: 'class', sup: 'net.sf.freecol.common.networking.ChangeSet$Change', ctors: { 'net.sf.freecol.common.networking.ChangeSet$See,net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.Location,net.sf.freecol.common.model.Tile': '_ChangeSet$MoveChange' } });
$J.define(ChangeSet$ObjectChange, 'net.sf.freecol.common.networking.ChangeSet$ObjectChange', { kind: 'class', sup: 'net.sf.freecol.common.networking.ChangeSet$Change', ctors: { 'net.sf.freecol.common.networking.ChangeSet$See,net.sf.freecol.common.model.FreeColGameObject': '_ChangeSet$ObjectChange' } });
$J.define(ChangeSet$PartialObjectChange, 'net.sf.freecol.common.networking.ChangeSet$PartialObjectChange', { kind: 'class', sup: 'net.sf.freecol.common.networking.ChangeSet$Change', ctors: { 'net.sf.freecol.common.networking.ChangeSet$See,net.sf.freecol.common.model.FreeColGameObject,java.util.Map': '_ChangeSet$PartialObjectChange' } });
$J.define(ChangeSet$PlayerChange, 'net.sf.freecol.common.networking.ChangeSet$PlayerChange', { kind: 'class', sup: 'net.sf.freecol.common.networking.ChangeSet$Change', ctors: { 'net.sf.freecol.common.networking.ChangeSet$See,java.util.List': '_ChangeSet$PlayerChange' } });
$J.define(ChangeSet$RemoveChange, 'net.sf.freecol.common.networking.ChangeSet$RemoveChange', { kind: 'class', sup: 'net.sf.freecol.common.networking.ChangeSet$Change', ctors: { 'net.sf.freecol.common.networking.ChangeSet$See,net.sf.freecol.common.model.Location,java.util.stream.Stream': '_ChangeSet$RemoveChange' }, returns: { 'getMainObject': 'net.sf.freecol.common.model.FreeColGameObject' } });
$J.define(ChangeSet$SpyChange, 'net.sf.freecol.common.networking.ChangeSet$SpyChange', { kind: 'class', sup: 'net.sf.freecol.common.networking.ChangeSet$Change', ctors: { 'net.sf.freecol.common.networking.ChangeSet$See,net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.Settlement': '_ChangeSet$SpyChange' } });
$J.define(ChangeSet$StanceChange, 'net.sf.freecol.common.networking.ChangeSet$StanceChange', { kind: 'class', sup: 'net.sf.freecol.common.networking.ChangeSet$Change', ctors: { 'net.sf.freecol.common.networking.ChangeSet$See,net.sf.freecol.common.model.Player,net.sf.freecol.common.model.Stance,net.sf.freecol.common.model.Player': '_ChangeSet$StanceChange' } });
$J.module(() => {
  LastSale = $J.load('net.sf.freecol.common.model.LastSale');
  Location = $J.load('net.sf.freecol.common.model.Location');
  Ownable = $J.load('net.sf.freecol.common.model.Ownable');
  Tile = $J.load('net.sf.freecol.common.model.Tile');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  WorkLocation = $J.load('net.sf.freecol.common.model.WorkLocation');
  AddPlayerMessage = $J.load('net.sf.freecol.common.networking.AddPlayerMessage');
  AnimateAttackMessage = $J.load('net.sf.freecol.common.networking.AnimateAttackMessage');
  AnimateMoveMessage = $J.load('net.sf.freecol.common.networking.AnimateMoveMessage');
  AttributeMessage = $J.load('net.sf.freecol.common.networking.AttributeMessage');
  ErrorMessage = $J.load('net.sf.freecol.common.networking.ErrorMessage');
  FeatureChangeMessage = $J.load('net.sf.freecol.common.networking.FeatureChangeMessage');
  Message = $J.load('net.sf.freecol.common.networking.Message');
  MultipleMessage = $J.load('net.sf.freecol.common.networking.MultipleMessage');
  PartialMessage = $J.load('net.sf.freecol.common.networking.PartialMessage');
  RemoveMessage = $J.load('net.sf.freecol.common.networking.RemoveMessage');
  SetAIMessage = $J.load('net.sf.freecol.common.networking.SetAIMessage');
  SetStanceMessage = $J.load('net.sf.freecol.common.networking.SetStanceMessage');
  SpySettlementMessage = $J.load('net.sf.freecol.common.networking.SpySettlementMessage');
  UpdateMessage = $J.load('net.sf.freecol.common.networking.UpdateMessage');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
});
