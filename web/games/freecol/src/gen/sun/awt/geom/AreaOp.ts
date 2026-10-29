// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/awt/geom/AreaOp.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2025, Oracle and/or its affiliates. All rights reserved.
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * This code is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License version 2 only, as
 * published by the Free Software Foundation.  Oracle designates this
 * particular file as subject to the "Classpath" exception as provided
 * by Oracle in the LICENSE file that accompanied this code.
 *
 * This code is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * version 2 for more details (a copy is included in the LICENSE file that
 * accompanied this code).
 *
 * You should have received a copy of the GNU General Public License version
 * 2 along with this work; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * Please contact Oracle, 500 Oracle Parkway, Redwood Shores, CA 94065 USA
 * or visit www.oracle.com if you need additional information or have any
 * questions.
 */
import { $J, Arrays, InternalError, JObject, Vector } from '../../../../jre/index.ts';

let ChainEnd, CurveLink, Edge;

export class AreaOp extends JObject {
  static readonly CTAG_LEFT: number = 0;
  static readonly CTAG_RIGHT: number = 1;
  static readonly ETAG_IGNORE: number = 0;
  static readonly ETAG_ENTER: number = 1;
  static readonly ETAG_EXIT: number = -1;
  static readonly RSTAG_INSIDE: number = 1;
  static readonly RSTAG_OUTSIDE: number = -1;
  static readonly MAX_LINK_COUNT: number = 1024;
  static YXTopComparator: Comparator<Edge> = null;
  static EmptyLinkList: CurveLink[] = null;
  static EmptyChainList: ChainEnd[] = null;
  _AreaOp(): this {
    return this;
  }
  calculate(left: Vector<Curve>, right: Vector<Curve>): Vector<Curve> {
    let edges = new Vector();
    AreaOp.addEdges(edges, left, AreaOp.CTAG_LEFT);
    AreaOp.addEdges(edges, right, AreaOp.CTAG_RIGHT);
    let curves = this.pruneEdges(edges);
    if (false) {
      $J.out.println('result: ');
      let numcurves = curves.size();
      let curvelist = $J.toArrayInto(curves.toArray(), $J.newArray(numcurves, null));
      for (let i = 0; i < numcurves; i++) {
        $J.out.println('curvelist[' + i + '] = ' + $J.str(curvelist[i]));
      }
    }
    return curves;
  }
  static addEdges(edges: Vector<Edge>, curves: Vector<Curve>, curvetag: number): void {
    let enum_ = curves.elements();
    while (enum_.hasMoreElements()) {
      let c = enum_.nextElement();
      if (c.getOrder() > 0) {
        edges.add(new Edge()._Edge$Curve$int(c, curvetag));
      }
    }
  }
  consumeSubCurves(subcurves: Vector<CurveLink>, chains: Vector<ChainEnd>, curve: Vector<Curve>): void {
    AreaOp.finalizeSubCurves(subcurves, chains);
    let enum_ = subcurves.elements();
    while (enum_.hasMoreElements()) {
      let link = enum_.nextElement();
      curve.add(link.getMoveto());
      let nextlink = link;
      while ((nextlink = nextlink.getNext()) != null) {
        if (!link.absorb$CurveLink(nextlink)) {
          curve.add(link.getSubCurve());
          link = nextlink;
        }
      }
      curve.add(link.getSubCurve());
    }
  }
  pruneEdges(edges: Vector<Edge>): Vector<Curve> {
    let numedges = edges.size();
    if (numedges < 2) {
      return new Vector();
    }
    let edgelist = $J.toArrayInto(edges.toArray(), $J.newArray(numedges, null));
    Arrays.sort(edgelist, AreaOp.YXTopComparator);
    if (false) {
      $J.out.println('pruning: ');
      for (let i = 0; i < numedges; i++) {
        $J.out.println('edgelist[' + i + '] = ' + $J.str(edgelist[i]));
      }
    }
    let e: Edge;
    let left = 0;
    let right = 0;
    let cur = 0;
    let next = 0;
    let yrange = $J.newArray(2, 0);
    let subcurves = new Vector();
    let chains = new Vector();
    let links = new Vector();
    let ret = new Vector();
    let linkCount = 0;
    while (left < numedges) {
      let y = yrange[0];
      for (cur = next = (right - 1) | 0; cur >= left; cur--) {
        e = edgelist[cur];
        if (e.getCurve().getYBot() > y) {
          if (next > cur) {
            edgelist[next] = e;
          }
          next--;
        }
      }
      left = (next + 1) | 0;
      if (left >= right) {
        if (right >= numedges) {
          break;
        }
        y = edgelist[right].getCurve().getYTop();
        if (y > yrange[0]) {
          AreaOp.finalizeSubCurves(subcurves, chains);
        }
        yrange[0] = y;
      }
      while (right < numedges) {
        e = edgelist[right];
        if (e.getCurve().getYTop() > y) {
          break;
        }
        right++;
      }
      yrange[1] = edgelist[left].getCurve().getYBot();
      if (right < numedges) {
        y = edgelist[right].getCurve().getYTop();
        if (yrange[1] > y) {
          yrange[1] = y;
        }
      }
      if (false) {
        $J.out.println('current line: y = [' + $J.dstr(yrange[0]) + ', ' + $J.dstr(yrange[1]) + ']');
        for (cur = left; cur < right; cur++) {
          $J.out.println('  ' + $J.str(edgelist[cur]));
        }
      }
      let nexteq = 1;
      for (cur = left; cur < right; cur++) {
        e = edgelist[cur];
        e.setEquivalence(0);
        for (next = cur; next > left; next--) {
          let prevedge = edgelist[(next - 1) | 0];
          let ordering = e.compareTo(prevedge, yrange);
          if (yrange[1] <= yrange[0]) {
            throw new InternalError('backstepping to ' + $J.dstr(yrange[1]) + ' from ' + $J.dstr(yrange[0]));
          }
          if (ordering >= 0) {
            if (ordering === 0) {
              let eq = prevedge.getEquivalence();
              if (eq === 0) {
                eq = nexteq++;
                prevedge.setEquivalence(eq);
              }
              e.setEquivalence(eq);
            }
            break;
          }
          edgelist[next] = prevedge;
        }
        edgelist[next] = e;
      }
      if (false) {
        $J.out.println('current sorted line: y = [' + $J.dstr(yrange[0]) + ', ' + $J.dstr(yrange[1]) + ']');
        for (cur = left; cur < right; cur++) {
          $J.out.println('  ' + $J.str(edgelist[cur]));
        }
      }
      this.newRow();
      let ystart = yrange[0];
      let yend = yrange[1];
      for (cur = left; cur < right; cur++) {
        e = edgelist[cur];
        let etag: number;
        let eq = e.getEquivalence();
        if (eq !== 0) {
          let origstate = this.getState();
          etag = (origstate === AreaOp.RSTAG_INSIDE ? AreaOp.ETAG_EXIT : AreaOp.ETAG_ENTER);
          let activematch = null;
          let longestmatch = e;
          let furthesty = yend;
          do {
            this.classify(e);
            if (activematch == null && e.isActiveFor(ystart, etag)) {
              activematch = e;
            }
            y = e.getCurve().getYBot();
            if (y > furthesty) {
              longestmatch = e;
              furthesty = y;
            }
          } while (++cur < right && (e = edgelist[cur]).getEquivalence() === eq);
          --cur;
          if (this.getState() === origstate) {
            etag = AreaOp.ETAG_IGNORE;
          } else {
            e = (activematch != null ? activematch : longestmatch);
          }
        } else {
          etag = this.classify(e);
        }
        if (etag !== AreaOp.ETAG_IGNORE) {
          e.record(yend, etag);
          links.add(new CurveLink()._CurveLink(e.getCurve(), ystart, yend, etag));
        }
      }
      if (this.getState() !== AreaOp.RSTAG_OUTSIDE) {
        $J.out.println('Still inside at end of active edge list!');
        $J.out.println('num curves = ' + ((right - left) | 0));
        $J.out.println('num links = ' + links.size());
        $J.out.println('y top = ' + $J.dstr(yrange[0]));
        if (right < numedges) {
          $J.out.println('y top of next curve = ' + $J.dstr(edgelist[right].getCurve().getYTop()));
        } else {
          $J.out.println('no more curves');
        }
        for (cur = left; cur < right; cur++) {
          e = edgelist[cur];
          $J.out.println($J.str(e));
          let eq = e.getEquivalence();
          if (eq !== 0) {
            $J.out.println('  was equal to ' + eq + '...');
          }
        }
      }
      if (false) {
        $J.out.println('new links:');
        for (let i = 0; i < links.size(); i++) {
          let link = links.elementAt(i);
          $J.out.println('  ' + $J.str(link.getSubCurve()));
        }
      }
      if (linkCount >= AreaOp.MAX_LINK_COUNT) {
        this.consumeSubCurves(subcurves, chains, ret);
        linkCount = 0;
        chains.clear();
        subcurves.clear();
      }
      linkCount = (linkCount + links.size()) | 0;
      AreaOp.resolveLinks(subcurves, chains, links);
      links.clear();
      yrange[0] = yend;
    }
    this.consumeSubCurves(subcurves, chains, ret);
    return ret;
  }
  static finalizeSubCurves(subcurves: Vector<CurveLink>, chains: Vector<ChainEnd>): void {
    let numchains = chains.size();
    if (numchains === 0) {
      return;
    }
    if ((numchains & 1) !== 0) {
      throw new InternalError('Odd number of chains!');
    }
    let endlist = $J.newArray(numchains, null);
    $J.toArrayInto(chains.toArray(), endlist);
    for (let i = 1; i < numchains; i = (i + 2) | 0) {
      let open = endlist[(i - 1) | 0];
      let close = endlist[i];
      let subcurve = open.linkTo(close);
      if (subcurve != null) {
        subcurves.add(subcurve);
      }
    }
    chains.clear();
  }
  static resolveLinks(subcurves: Vector<CurveLink>, chains: Vector<ChainEnd>, links: Vector<CurveLink>): void {
    let numlinks = links.size();
    let linklist: CurveLink[];
    if (numlinks === 0) {
      linklist = AreaOp.EmptyLinkList;
    } else {
      if ((numlinks & 1) !== 0) {
        throw new InternalError('Odd number of new curves!');
      }
      linklist = $J.newArray((numlinks + 2) | 0, null);
      $J.toArrayInto(links.toArray(), linklist);
    }
    let numchains = chains.size();
    let endlist: ChainEnd[];
    if (numchains === 0) {
      endlist = AreaOp.EmptyChainList;
    } else {
      if ((numchains & 1) !== 0) {
        throw new InternalError('Odd number of chains!');
      }
      endlist = $J.newArray((numchains + 2) | 0, null);
      $J.toArrayInto(chains.toArray(), endlist);
    }
    let curchain = 0;
    let curlink = 0;
    chains.clear();
    let chain = endlist[0];
    let nextchain = endlist[1];
    let link = linklist[0];
    let nextlink = linklist[1];
    while (chain != null || link != null) {
      let connectchains = (link == null);
      let connectlinks = (chain == null);
      if (!connectchains && !connectlinks) {
        connectchains = ((curchain & 1) === 0 && chain.getX() === nextchain.getX());
        connectlinks = ((curlink & 1) === 0 && link.getX() === nextlink.getX());
        if (!connectchains && !connectlinks) {
          let cx = chain.getX();
          let lx = link.getX();
          connectchains = (nextchain != null && cx < lx && AreaOp.obstructs(nextchain.getX(), lx, curchain));
          connectlinks = (nextlink != null && lx < cx && AreaOp.obstructs(nextlink.getX(), cx, curlink));
        }
      }
      if (connectchains) {
        let subcurve = chain.linkTo(nextchain);
        if (subcurve != null) {
          subcurves.add(subcurve);
        }
        curchain = (curchain + 2) | 0;
        chain = endlist[curchain];
        nextchain = endlist[(curchain + 1) | 0];
      }
      if (connectlinks) {
        let openend = new ChainEnd()._ChainEnd(link, null);
        let closeend = new ChainEnd()._ChainEnd(nextlink, openend);
        openend.setOtherEnd(closeend);
        chains.add(openend);
        chains.add(closeend);
        curlink = (curlink + 2) | 0;
        link = linklist[curlink];
        nextlink = linklist[(curlink + 1) | 0];
      }
      if (!connectchains && !connectlinks) {
        chain.addLink(link);
        chains.add(chain);
        curchain++;
        chain = nextchain;
        nextchain = endlist[(curchain + 1) | 0];
        curlink++;
        link = nextlink;
        nextlink = linklist[(curlink + 1) | 0];
      }
    }
    if ((chains.size() & 1) !== 0) {
      $J.out.println('Odd number of chains!');
    }
  }
  static obstructs(v1: number, v2: number, phase: number): boolean {
    return (((phase & 1) === 0) ? (v1 <= v2) : (v1 < v2));
  }
  static $clinit() {
    AreaOp.YXTopComparator = (o1, o2) => {
      let c1 = o1.getCurve();
      let c2 = o2.getCurve();
      let v1: number;
      let v2: number;
      if ((v1 = c1.getYTop()) === (v2 = c2.getYTop())) {
        if ((v1 = c1.getXTop()) === (v2 = c2.getXTop())) {
          return 0;
        }
      }
      if (v1 < v2) {
        return -1;
      }
      return 1;
    };
    AreaOp.EmptyLinkList = $J.newArray(2, null);
    AreaOp.EmptyChainList = $J.newArray(2, null);
  }
}

export class AreaOp$CAGOp extends AreaOp {
  inLeft: boolean = false;
  inRight: boolean = false;
  inResult: boolean = false;
  _AreaOp$CAGOp(): this {
    this._AreaOp();
    return this;
  }
  newRow(): void {
    this.inLeft = false;
    this.inRight = false;
    this.inResult = false;
  }
  classify(e: Edge): number {
    if (e.getCurveTag() === AreaOp.CTAG_LEFT) {
      this.inLeft = !this.inLeft;
    } else {
      this.inRight = !this.inRight;
    }
    let newClass = this.newClassification(this.inLeft, this.inRight);
    if (this.inResult === newClass) {
      return AreaOp.ETAG_IGNORE;
    }
    this.inResult = newClass;
    return (newClass ? AreaOp.ETAG_ENTER : AreaOp.ETAG_EXIT);
  }
  getState(): number {
    return (this.inResult ? AreaOp.RSTAG_INSIDE : AreaOp.RSTAG_OUTSIDE);
  }
}

export class AreaOp$SubOp extends AreaOp$CAGOp {
  _AreaOp$SubOp(): this {
    this._AreaOp$CAGOp();
    return this;
  }
  newClassification(inLeft: boolean, inRight: boolean): boolean {
    return (inLeft && !inRight);
  }
}

export class AreaOp$NZWindOp extends AreaOp {
  count_: number = 0;
  _AreaOp$NZWindOp(): this {
    this._AreaOp();
    return this;
  }
  newRow(): void {
    this.count_ = 0;
  }
  classify(e: Edge): number {
    let newCount = this.count_;
    let type$ = (newCount === 0 ? AreaOp.ETAG_ENTER : AreaOp.ETAG_IGNORE);
    newCount = (newCount + e.getCurve().getDirection()) | 0;
    this.count_ = newCount;
    return (newCount === 0 ? AreaOp.ETAG_EXIT : type$);
  }
  getState(): number {
    return ((this.count_ === 0) ? AreaOp.RSTAG_OUTSIDE : AreaOp.RSTAG_INSIDE);
  }
}

export class AreaOp$EOWindOp extends AreaOp {
  inside_: boolean = false;
  _AreaOp$EOWindOp(): this {
    this._AreaOp();
    return this;
  }
  newRow(): void {
    this.inside_ = false;
  }
  classify(e: Edge): number {
    let newInside = !this.inside_;
    this.inside_ = newInside;
    return (newInside ? AreaOp.ETAG_ENTER : AreaOp.ETAG_EXIT);
  }
  getState(): number {
    return (this.inside_ ? AreaOp.RSTAG_INSIDE : AreaOp.RSTAG_OUTSIDE);
  }
}

$J.define(AreaOp, 'sun.awt.geom.AreaOp', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_AreaOp' }, clinit: true, lazy: ['YXTopComparator', 'EmptyLinkList', 'EmptyChainList'] });
$J.define(AreaOp$CAGOp, 'sun.awt.geom.AreaOp$CAGOp', { kind: 'class', sup: 'sun.awt.geom.AreaOp', ctors: { '': '_AreaOp$CAGOp' } });
$J.define(AreaOp$SubOp, 'sun.awt.geom.AreaOp$SubOp', { kind: 'class', sup: 'sun.awt.geom.AreaOp$CAGOp', ctors: { '': '_AreaOp$SubOp' } });
$J.define(AreaOp$NZWindOp, 'sun.awt.geom.AreaOp$NZWindOp', { kind: 'class', sup: 'sun.awt.geom.AreaOp', ctors: { '': '_AreaOp$NZWindOp' } });
$J.define(AreaOp$EOWindOp, 'sun.awt.geom.AreaOp$EOWindOp', { kind: 'class', sup: 'sun.awt.geom.AreaOp', ctors: { '': '_AreaOp$EOWindOp' } });
$J.module(() => {
  ChainEnd = $J.load('sun.awt.geom.ChainEnd');
  CurveLink = $J.load('sun.awt.geom.CurveLink');
  Edge = $J.load('sun.awt.geom.Edge');
});
