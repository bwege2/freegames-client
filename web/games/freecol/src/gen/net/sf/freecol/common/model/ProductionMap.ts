// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/ProductionMap.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, HashMap, IllegalArgumentException, Integer, JObject, StringBuilder } from '../../../../../../jre/index.ts';

let AbstractGoods, CollectionUtils;

/**
 * A map of goods types and their production.
 */
export class ProductionMap extends JObject {
  cache: JMap<GoodsType, any> = null;
  _ProductionMap(): this {
    this.cache = new HashMap();
    return this;
  }
  get(type$: GoodsType): AbstractGoods {
    let value = this.cache.get(type$);
    if (value == null) {
      return new AbstractGoods()._AbstractGoods$GoodsType$int(type$, 0);
    } else if ($J.isa(value, Integer)) {
      return new AbstractGoods()._AbstractGoods$GoodsType$int(type$, value);
    } else {
      return (value).get(type$);
    }
  }
  add$AbstractGoods(goods: AbstractGoods): void {
    let goodsType = goods.getType();
    let value = this.cache.get(goodsType);
    if (value == null) {
      let rootType = goodsType.getStoredAs();
      if (rootType === goodsType) {
        this.cache.put(goodsType, goods.getAmount());
      } else {
        value = this.cache.get(rootType);
        if (value instanceof ProductionMap$ProductionTree) {
          (value).add(goods);
        } else {
          let amount = (value == null) ? 0 : value;
          value = new ProductionMap$ProductionTree()._ProductionMap$ProductionTree(new AbstractGoods()._AbstractGoods$GoodsType$int(rootType, amount), [goods]);
          this.cache.put(rootType, value);
        }
        this.cache.put(goodsType, value);
      }
    } else if ($J.isa(value, Integer)) {
      this.cache.put(goodsType, (value + goods.getAmount()) | 0);
    } else {
      (value).add(goods);
    }
  }
  remove$AbstractGoods(goods: AbstractGoods): void {
    let value = this.cache.get(goods.getType());
    if (value instanceof ProductionMap$ProductionTree) {
      (value).remove(goods);
    } else {
      this.add$AbstractGoods(new AbstractGoods()._AbstractGoods$GoodsType$int(goods.getType(), -goods.getAmount()));
    }
  }
  add$List(goods: List<AbstractGoods>): void {
    for (const $it0 = goods.iterator(); $it0.hasNext(); ) {
      let g = $it0.next();
      this.add$AbstractGoods(g);
    }
  }
  remove$List(goods: List<AbstractGoods>): void {
    for (const $it1 = goods.iterator(); $it1.hasNext(); ) {
      let g = $it1.next();
      this.remove$AbstractGoods(g);
    }
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(64);
    sb.append(String.fromCharCode(91 /* '[' */));
    CollectionUtils.forEachMapEntry$Map$Consumer(this.cache, (e) => sb.append(String.fromCharCode(32 /* ' ' */)).append(e.getKey().getSuffix$()).append(String.fromCharCode(58 /* ':' */)).append($J.str(e.getValue())));
    sb.append(' ]');
    return sb.toString();
  }
}

export class ProductionMap$ProductionTree extends JObject {
  /**
   * The abstract goods all other types of goods in this tree are
   * finally stored as.
   */
  root: AbstractGoods = null;
  /**
   * The abstract goods that are actually produced.
   */
  leafs: List<AbstractGoods> = null;
  _ProductionMap$ProductionTree(root: AbstractGoods, leafs: AbstractGoods[]): this {
    if (leafs.length > 0) {
      this.leafs = new ArrayList(leafs.length);
      let amount = root.getAmount();
      for (let leaf of leafs) {
        this.leafs.add(new AbstractGoods()._AbstractGoods$AbstractGoods(leaf));
        amount = (amount + leaf.getAmount()) | 0;
      }
      this.root = new AbstractGoods()._AbstractGoods$GoodsType$int(root.getType(), amount);
    } else {
      this.root = new AbstractGoods()._AbstractGoods$AbstractGoods(root);
    }
    return this;
  }
  getRoot(): AbstractGoods {
    return this.root;
  }
  setRoot(newRoot: AbstractGoods): void {
    this.root = newRoot;
  }
  getLeafs(): List<AbstractGoods> {
    return this.leafs;
  }
  setLeafs(newLeafs: List<AbstractGoods>): void {
    this.leafs = newLeafs;
  }
  add(goods: AbstractGoods): void {
    if (goods.getType().getStoredAs() !== this.root.getType()) {
      throw new IllegalArgumentException(goods.getType().getId() + ' is not stored as ' + $J.str(this.root.getType()));
    } else {
      let leaf = CollectionUtils.find$Collection$Predicate(this.leafs, AbstractGoods.matches(goods.getType()));
      if (leaf != null) {
        leaf.setAmount((leaf.getAmount() + goods.getAmount()) | 0);
        this.root.setAmount((this.root.getAmount() + goods.getAmount()) | 0);
        return;
      }
      this.leafs.add(new AbstractGoods()._AbstractGoods$AbstractGoods(goods));
      this.root.setAmount((this.root.getAmount() + goods.getAmount()) | 0);
    }
  }
  remove(goods: AbstractGoods): number {
    let consumed = goods.getAmount();
    if (goods.getType() === this.root.getType()) {
      this.root.setAmount((this.root.getAmount() - consumed) | 0);
      for (const $it2 = this.leafs.iterator(); $it2.hasNext(); ) {
        let leaf = $it2.next();
        leaf.setAmount(Math.min(leaf.getAmount(), this.root.getAmount()));
      }
    } else {
      let leaf = CollectionUtils.find$Collection$Predicate(this.leafs, AbstractGoods.matches(goods.getType()));
      if (leaf != null) {
        leaf.setAmount((leaf.getAmount() - consumed) | 0);
        this.root.setAmount((this.root.getAmount() - consumed) | 0);
      }
    }
    return consumed;
  }
  get(type$: GoodsType): AbstractGoods {
    if (this.root.getType() === type$) {
      return this.root;
    } else {
      let leaf = CollectionUtils.find$Collection$Predicate(this.leafs, AbstractGoods.matches(type$));
      if (leaf != null) {
        return new AbstractGoods()._AbstractGoods$GoodsType$int(type$, leaf.getAmount());
      }
    }
    return null;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(32);
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.root.getSuffix$()).append(String.fromCharCode(58 /* ':' */));
    for (const $it3 = this.leafs.iterator(); $it3.hasNext(); ) {
      let ag = $it3.next();
      sb.append(String.fromCharCode(32 /* ' ' */)).append($J.str(ag));
    }
    sb.append(' ]');
    return sb.toString();
  }
}

$J.define(ProductionMap, 'net.sf.freecol.common.model.ProductionMap', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_ProductionMap' }, meths: { 'remove(java.util.List)': 'remove$List', 'add(java.util.List)': 'add$List', 'remove(net.sf.freecol.common.model.AbstractGoods)': 'remove$AbstractGoods', 'add(net.sf.freecol.common.model.AbstractGoods)': 'add$AbstractGoods' } });
$J.define(ProductionMap$ProductionTree, 'net.sf.freecol.common.model.ProductionMap$ProductionTree', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.model.AbstractGoods,net.sf.freecol.common.model.AbstractGoods[]': '_ProductionMap$ProductionTree' }, returns: { 'getLeafs': 'java.util.List', 'getRoot': 'net.sf.freecol.common.model.AbstractGoods' } });
$J.module(() => {
  AbstractGoods = $J.load('net.sf.freecol.common.model.AbstractGoods');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
