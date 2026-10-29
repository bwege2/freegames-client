// @ts-nocheck
// MigLayout 5.3 core/net/miginfocom/layout/ConstraintParser.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * License (BSD):
 * ==============
 *
 * Copyright (c) 2004, Mikael Grev, MiG InfoCom AB. (miglayout (at) miginfocom (dot) com)
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 * Redistributions of source code must retain the above copyright notice, this list
 * of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this
 * list of conditions and the following disclaimer in the documentation and/or other
 * materials provided with the distribution.
 * Neither the name of the MiG InfoCom AB nor the names of its contributors may be
 * used to endorse or promote products derived from this software without specific
 * prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 * OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY
 * OF SUCH DAMAGE.
 *
 * @version 1.0
 * @author Mikael Grev, MiG InfoCom AB
 *         Date: 2006-sep-08
 */
import { $J, ArrayList, Exception, HashMap, IllegalArgumentException, JObject, JString } from '../../../../jre/index.ts';

let AC, BoundSize, CC, DimConstraint, LC, LayoutUtil, PlatformDefaults, ResizeConstraint, UnitValue;

/**
 * Parses string constraints.
 */
export class ConstraintParser extends JObject {
  _ConstraintParser(): this {
    return this;
  }
  /**
   * Parses the layout constraints and stores the parsed values in the transient (cache) member variables.
   * @param s The String to parse. Should not be <code>null</code> and <b>must be lower case and trimmed</b>.
   * @throws RuntimeException if the constraint was not valid.
   * @return The parsed constraint. Never <code>null</code>.
   */
  static parseLayoutConstraint(s: string): LC {
    let lc = new LC()._LC();
    if ((s.length === 0)) {
      return lc;
    }
    let parts = ConstraintParser.toTrimmedTokens(s, 44 /* ',' */);
    for (let i = 0; i < parts.length; i++) {
      let part = parts[i];
      if (part == null) {
        continue;
      }
      let len = part.length;
      if (len === 3 || len === 11) {
        if ($J.equals(part, 'ltr') || $J.equals(part, 'rtl') || $J.equals(part, 'lefttoright') || $J.equals(part, 'righttoleft')) {
          lc.setLeftToRight(part.charCodeAt(0) === 108 /* 'l' */ ? true : false);
          parts[i] = null;
        }
        if ($J.equals(part, 'ttb') || $J.equals(part, 'btt') || $J.equals(part, 'toptobottom') || $J.equals(part, 'bottomtotop')) {
          lc.setTopToBottom(part.charCodeAt(0) === 116 /* 't' */);
          parts[i] = null;
        }
      }
    }
    for (let part of parts) {
      if (part == null || part.length === 0) {
        continue;
      }
      try {
        let ix = -1;
        let c = part.charCodeAt(0);
        if (c === 119 /* 'w' */ || c === 104 /* 'h' */) {
          ix = ConstraintParser.startsWithLenient$String$String$int$boolean(part, 'wrap', -1, true);
          if (ix > -1) {
            let num = JString.trim(part.substring(ix));
            lc.setWrapAfter(num.length !== 0 ? $J.parseInt(num) : 0);
            continue;
          }
          let isHor = c === 119 /* 'w' */;
          if (isHor && (part.startsWith('w ') || part.startsWith('width '))) {
            let sz = JString.trim(part.substring(part.charCodeAt(1) === 32 /* ' ' */ ? 2 : 6));
            lc.setWidth(ConstraintParser.parseBoundSize(sz, false, true));
            continue;
          }
          if (!isHor && (part.startsWith('h ') || part.startsWith('height '))) {
            let uvStr = JString.trim(part.substring(part.charCodeAt(1) === 32 /* ' ' */ ? 2 : 7));
            lc.setHeight(ConstraintParser.parseBoundSize(uvStr, false, false));
            continue;
          }
          if (part.length > 5) {
            let sz = JString.trim(part.substring(5));
            if (part.startsWith('wmin ')) {
              lc.minWidth(sz);
              continue;
            } else if (part.startsWith('wmax ')) {
              lc.maxWidth(sz);
              continue;
            } else if (part.startsWith('hmin ')) {
              lc.minHeight(sz);
              continue;
            } else if (part.startsWith('hmax ')) {
              lc.maxHeight(sz);
              continue;
            }
          }
          if (part.startsWith('hidemode ')) {
            lc.setHideMode($J.parseInt(part.substring(9)));
            continue;
          }
        }
        if (c === 103 /* 'g' */) {
          if (part.startsWith('gapx ')) {
            lc.setGridGapX(ConstraintParser.parseBoundSize(JString.trim(part.substring(5)), true, true));
            continue;
          }
          if (part.startsWith('gapy ')) {
            lc.setGridGapY(ConstraintParser.parseBoundSize(JString.trim(part.substring(5)), true, false));
            continue;
          }
          if (part.startsWith('gap ')) {
            let gaps = ConstraintParser.toTrimmedTokens(JString.trim(part.substring(4)), 32 /* ' ' */);
            lc.setGridGapX(ConstraintParser.parseBoundSize(gaps[0], true, true));
            lc.setGridGapY(gaps.length > 1 ? ConstraintParser.parseBoundSize(gaps[1], true, false) : lc.getGridGapX());
            continue;
          }
        }
        if (c === 100 /* 'd' */) {
          ix = ConstraintParser.startsWithLenient$String$String$int$boolean(part, 'debug', 5, true);
          if (ix > -1) {
            let millis = JString.trim(part.substring(ix));
            lc.setDebugMillis(millis.length > 0 ? $J.parseInt(millis) : 1000);
            continue;
          }
        }
        if (c === 110 /* 'n' */) {
          if ($J.equals(part, 'nogrid')) {
            lc.setNoGrid(true);
            continue;
          }
          if ($J.equals(part, 'nocache')) {
            lc.setNoCache(true);
            continue;
          }
          if ($J.equals(part, 'novisualpadding')) {
            lc.setVisualPadding(false);
            continue;
          }
        }
        if (c === 102 /* 'f' */) {
          if ($J.equals(part, 'fill') || $J.equals(part, 'fillx') || $J.equals(part, 'filly')) {
            lc.setFillX(part.length === 4 || part.charCodeAt(4) === 120 /* 'x' */);
            lc.setFillY(part.length === 4 || part.charCodeAt(4) === 121 /* 'y' */);
            continue;
          }
          if ($J.equals(part, 'flowy')) {
            lc.setFlowX(false);
            continue;
          }
          if ($J.equals(part, 'flowx')) {
            lc.setFlowX(true);
            continue;
          }
        }
        if (c === 105 /* 'i' */) {
          ix = ConstraintParser.startsWithLenient$String$String$int$boolean(part, 'insets', 3, true);
          if (ix > -1) {
            let insStr = JString.trim(part.substring(ix));
            let ins = ConstraintParser.parseInsets(insStr, true);
            LayoutUtil.putCCString(ins, insStr);
            lc.setInsets(ins);
            continue;
          }
        }
        if (c === 97 /* 'a' */) {
          ix = ConstraintParser.startsWithLenient$String$StringArr$intArr$boolean(part, ['aligny', 'ay'], [6, 2], true);
          if (ix > -1) {
            let align = ConstraintParser.parseUnitValueOrAlign(JString.trim(part.substring(ix)), false, null);
            if (align === UnitValue.BASELINE_IDENTITY) {
              throw new IllegalArgumentException('\'baseline\' can not be used to align the whole component group.');
            }
            lc.setAlignY(align);
            continue;
          }
          ix = ConstraintParser.startsWithLenient$String$StringArr$intArr$boolean(part, ['alignx', 'ax'], [6, 2], true);
          if (ix > -1) {
            lc.setAlignX(ConstraintParser.parseUnitValueOrAlign(JString.trim(part.substring(ix)), true, null));
            continue;
          }
          ix = ConstraintParser.startsWithLenient$String$String$int$boolean(part, 'align', 2, true);
          if (ix > -1) {
            let gaps = ConstraintParser.toTrimmedTokens(JString.trim(part.substring(ix)), 32 /* ' ' */);
            lc.setAlignX(ConstraintParser.parseUnitValueOrAlign(gaps[0], true, null));
            if (gaps.length > 1) {
              let align = ConstraintParser.parseUnitValueOrAlign(gaps[1], false, null);
              if (align === UnitValue.BASELINE_IDENTITY) {
                throw new IllegalArgumentException('\'baseline\' can not be used to align the whole component group.');
              }
              lc.setAlignY(align);
            }
            continue;
          }
        }
        if (c === 112 /* 'p' */) {
          if (part.startsWith('packalign ')) {
            let packs = ConstraintParser.toTrimmedTokens(JString.trim(part.substring(10)), 32 /* ' ' */);
            lc.setPackWidthAlign(packs[0].length > 0 ? Math.fround($J.parseDouble(packs[0])) : 0.5);
            if (packs.length > 1) {
              lc.setPackHeightAlign(Math.fround($J.parseDouble(packs[1])));
            }
            continue;
          }
          if (part.startsWith('pack ') || $J.equals(part, 'pack')) {
            let ps = JString.trim(part.substring(4));
            let packs = ConstraintParser.toTrimmedTokens(ps.length > 0 ? ps : 'pref pref', 32 /* ' ' */);
            lc.setPackWidth(ConstraintParser.parseBoundSize(packs[0], false, true));
            if (packs.length > 1) {
              lc.setPackHeight(ConstraintParser.parseBoundSize(packs[1], false, false));
            }
            continue;
          }
        }
        if (lc.getAlignX() == null) {
          let alignX = ConstraintParser.parseAlignKeywords(part, true);
          if (alignX != null) {
            lc.setAlignX(alignX);
            continue;
          }
        }
        let alignY = ConstraintParser.parseAlignKeywords(part, false);
        if (alignY != null) {
          lc.setAlignY(alignY);
          continue;
        }
        throw new IllegalArgumentException('Unknown Constraint: \'' + part + '\'\n');
      } catch ($e0) {
        if ($J.isa($e0, Exception)) {
          let ex = $J.exc($e0);
          throw new IllegalArgumentException('Illegal Constraint: \'' + part + '\'\n' + ex.getMessage());
        } else {
          throw $e0;
        }
      }
    }
    return lc;
  }
  /**
   * Parses the column or rows constraints. They normally looks something like <code>"[min:pref]rel[10px][]"</code>.
   * @param s The string to parse. Not <code>null</code>.
   * @return An array of {@link DimConstraint}s that is as many are there exist "[...]" sections in the string that is parsed.
   * @throws RuntimeException if the constraint was not valid.
   */
  static parseRowConstraints(s: string): AC {
    return ConstraintParser.parseAxisConstraint(s, false);
  }
  /**
   * Parses the column or rows constraints. They normally looks something like <code>"[min:pref]rel[10px][]"</code>.
   * @param s The string to parse. Not <code>null</code>.
   * @return An array of {@link DimConstraint}s that is as many are there exist "[...]" sections in the string that is parsed.
   * @throws RuntimeException if the constraint was not valid.
   */
  static parseColumnConstraints(s: string): AC {
    return ConstraintParser.parseAxisConstraint(s, true);
  }
  /**
   * Parses the column or rows constraints. They normally looks something like <code>"[min:pref]rel[10px][]"</code>.
   * @param s The string to parse. Not <code>null</code>.
   * @param isCols If this for columns rather than rows.
   * @return An array of {@link DimConstraint}s that is as many are there exist "[...]" sections in the string that is parsed.
   * @throws RuntimeException if the constraint was not valid.
   */
  static parseAxisConstraint(s: string, isCols: boolean): AC {
    s = JString.trim(s);
    if (s.length === 0) {
      return new AC()._AC();
    }
    s = s.toLowerCase();
    let parts = ConstraintParser.getRowColAndGapsTrimmed(s);
    let gaps = $J.newArray(((parts.size() >> 1) + 1) | 0, null);
    for (let i = 0, iSz = parts.size(), gIx = 0; i < iSz; i = (i + 2) | 0, gIx++) {
      gaps[gIx] = ConstraintParser.parseBoundSize(parts.get(i), true, isCols);
    }
    let colSpecs = $J.newArray(parts.size() >> 1, null);
    for (let i = 0, gIx = 0; i < colSpecs.length; i++, gIx++) {
      if (gIx >= ((gaps.length - 1) | 0)) {
        gIx = (gaps.length - 2) | 0;
      }
      colSpecs[i] = ConstraintParser.parseDimConstraint(parts.get(((i << 1) + 1) | 0), gaps[gIx], gaps[(gIx + 1) | 0], isCols);
    }
    let ac = new AC()._AC();
    ac.setConstaints(colSpecs);
    return ac;
  }
  /**
   * Parses a single column or row constraint.
   * @param s The single constraint to parse. May look something like <code>"min:pref,fill,grow"</code>. Should not be <code>null</code> and <b>must
   * be lower case and trimmed</b>.
   * @param gapBefore The default gap "before" the column/row constraint. Can be overridden with a <code>"gap"</code> section within <code>s</code>.
   * @param gapAfter The default gap "after" the column/row constraint. Can be overridden with a <code>"gap"</code> section within <code>s</code>.
   * @param isCols If the constraints are column constraints rather than row constraints.
   * @return A single constraint. Never <code>null</code>.
   * @throws RuntimeException if the constraint was not valid.
   */
  static parseDimConstraint(s: string, gapBefore: BoundSize, gapAfter: BoundSize, isCols: boolean): DimConstraint {
    let dimConstraint = new DimConstraint()._DimConstraint();
    dimConstraint.setGapBefore(gapBefore);
    dimConstraint.setGapAfter(gapAfter);
    let parts = ConstraintParser.toTrimmedTokens(s, 44 /* ',' */);
    for (let i = 0; i < parts.length; i++) {
      let part = parts[i];
      try {
        if (part.length === 0) {
          continue;
        }
        if ($J.equals(part, 'fill')) {
          dimConstraint.setFill(true);
          continue;
        }
        if ($J.equals(part, 'nogrid')) {
          dimConstraint.setNoGrid(true);
          continue;
        }
        let ix = -1;
        let c = part.charCodeAt(0);
        if (c === 115 /* 's' */) {
          ix = ConstraintParser.startsWithLenient$String$StringArr$intArr$boolean(part, ['sizegroup', 'sg'], [5, 2], true);
          if (ix > -1) {
            dimConstraint.setSizeGroup(JString.trim(part.substring(ix)));
            continue;
          }
          ix = ConstraintParser.startsWithLenient$String$StringArr$intArr$boolean(part, ['shrinkprio', 'shp'], [10, 3], true);
          if (ix > -1) {
            dimConstraint.setShrinkPriority($J.parseInt(JString.trim(part.substring(ix))));
            continue;
          }
          ix = ConstraintParser.startsWithLenient$String$String$int$boolean(part, 'shrink', 6, true);
          if (ix > -1) {
            dimConstraint.setShrink(ConstraintParser.parseFloat(JString.trim(part.substring(ix)), ResizeConstraint.WEIGHT_100));
            continue;
          }
        }
        if (c === 103 /* 'g' */) {
          ix = ConstraintParser.startsWithLenient$String$StringArr$intArr$boolean(part, ['growpriority', 'gp'], [5, 2], true);
          if (ix > -1) {
            dimConstraint.setGrowPriority($J.parseInt(JString.trim(part.substring(ix))));
            continue;
          }
          ix = ConstraintParser.startsWithLenient$String$String$int$boolean(part, 'grow', 4, true);
          if (ix > -1) {
            dimConstraint.setGrow(ConstraintParser.parseFloat(JString.trim(part.substring(ix)), ResizeConstraint.WEIGHT_100));
            continue;
          }
        }
        if (c === 97 /* 'a' */) {
          ix = ConstraintParser.startsWithLenient$String$String$int$boolean(part, 'align', 2, true);
          if (ix > -1) {
            dimConstraint.setAlign(ConstraintParser.parseUnitValueOrAlign(JString.trim(part.substring(ix)), isCols, null));
            continue;
          }
        }
        let align = ConstraintParser.parseAlignKeywords(part, isCols);
        if (align != null) {
          dimConstraint.setAlign(align);
          continue;
        }
        dimConstraint.setSize(ConstraintParser.parseBoundSize(part, false, isCols));
      } catch ($e1) {
        if ($J.isa($e1, Exception)) {
          let ex = $J.exc($e1);
          throw new IllegalArgumentException('Illegal constraint: \'' + part + '\'\n' + ex.getMessage());
        } else {
          throw $e1;
        }
      }
    }
    return dimConstraint;
  }
  /**
   * Parses all component constraints and stores the parsed values in the transient (cache) member variables.
   * @param constrMap The constraints as <code>String</code>s. Strings <b>must be lower case and trimmed</b>
   * @return The parsed constraints. Never <code>null</code>.
   */
  static parseComponentConstraints(constrMap: JMap<ComponentWrapper, string>): JMap<ComponentWrapper, CC> {
    let flowConstrMap = new HashMap();
    for (let it = constrMap.entrySet().iterator(); it.hasNext(); ) {
      let entry = it.next();
      flowConstrMap.put(entry.getKey(), ConstraintParser.parseComponentConstraint(entry.getValue()));
    }
    return flowConstrMap;
  }
  /**
   * Parses one component constraint and returns the parsed value.
   * @param s The string to parse. <b>Must be lower case and trimmed</b>.
   * @throws RuntimeException if the constraint was not valid.
   * @return The parsed constraint. Never <code>null</code>.
   */
  static parseComponentConstraint(s: string): CC {
    let cc = new CC()._CC();
    if (s == null || (s.length === 0)) {
      return cc;
    }
    let parts = ConstraintParser.toTrimmedTokens(s, 44 /* ',' */);
    for (let part of parts) {
      try {
        if (part.length === 0) {
          continue;
        }
        let ix = -1;
        let c = part.charCodeAt(0);
        if (c === 110 /* 'n' */) {
          if ($J.equals(part, 'north')) {
            cc.setDockSide(0);
            continue;
          }
          if ($J.equals(part, 'newline')) {
            cc.setNewline(true);
            continue;
          }
          if (part.startsWith('newline ')) {
            let gapSz = JString.trim(part.substring(7));
            cc.setNewlineGapSize(ConstraintParser.parseBoundSize(gapSz, true, true));
            continue;
          }
        }
        if (c === 102 /* 'f' */ && ($J.equals(part, 'flowy') || $J.equals(part, 'flowx'))) {
          cc.setFlowX(part.charCodeAt(4) === 120 /* 'x' */ ? true : false);
          continue;
        }
        if (c === 115 /* 's' */) {
          ix = ConstraintParser.startsWithLenient$String$String$int$boolean(part, 'skip', 4, true);
          if (ix > -1) {
            let num = JString.trim(part.substring(ix));
            cc.setSkip(num.length !== 0 ? $J.parseInt(num) : 1);
            continue;
          }
          ix = ConstraintParser.startsWithLenient$String$String$int$boolean(part, 'split', 5, true);
          if (ix > -1) {
            let split = JString.trim(part.substring(ix));
            cc.setSplit(split.length > 0 ? $J.parseInt(split) : LayoutUtil.INF);
            continue;
          }
          if ($J.equals(part, 'south')) {
            cc.setDockSide(2);
            continue;
          }
          ix = ConstraintParser.startsWithLenient$String$StringArr$intArr$boolean(part, ['spany', 'sy'], [5, 2], true);
          if (ix > -1) {
            cc.setSpanY(ConstraintParser.parseSpan(JString.trim(part.substring(ix))));
            continue;
          }
          ix = ConstraintParser.startsWithLenient$String$StringArr$intArr$boolean(part, ['spanx', 'sx'], [5, 2], true);
          if (ix > -1) {
            cc.setSpanX(ConstraintParser.parseSpan(JString.trim(part.substring(ix))));
            continue;
          }
          ix = ConstraintParser.startsWithLenient$String$String$int$boolean(part, 'span', 4, true);
          if (ix > -1) {
            let spans = ConstraintParser.toTrimmedTokens(JString.trim(part.substring(ix)), 32 /* ' ' */);
            cc.setSpanX(spans[0].length > 0 ? $J.parseInt(spans[0]) : LayoutUtil.INF);
            cc.setSpanY(spans.length > 1 ? $J.parseInt(spans[1]) : 1);
            continue;
          }
          ix = ConstraintParser.startsWithLenient$String$String$int$boolean(part, 'shrinkx', 7, true);
          if (ix > -1) {
            cc.getHorizontal().setShrink(ConstraintParser.parseFloat(JString.trim(part.substring(ix)), ResizeConstraint.WEIGHT_100));
            continue;
          }
          ix = ConstraintParser.startsWithLenient$String$String$int$boolean(part, 'shrinky', 7, true);
          if (ix > -1) {
            cc.getVertical().setShrink(ConstraintParser.parseFloat(JString.trim(part.substring(ix)), ResizeConstraint.WEIGHT_100));
            continue;
          }
          ix = ConstraintParser.startsWithLenient$String$String$int$boolean(part, 'shrink', 6, false);
          if (ix > -1) {
            let shrinks = ConstraintParser.toTrimmedTokens(JString.trim(part.substring(ix)), 32 /* ' ' */);
            cc.getHorizontal().setShrink(ConstraintParser.parseFloat(shrinks[0], ResizeConstraint.WEIGHT_100));
            if (shrinks.length > 1) {
              cc.getVertical().setShrink(ConstraintParser.parseFloat(shrinks[1], ResizeConstraint.WEIGHT_100));
            }
            continue;
          }
          ix = ConstraintParser.startsWithLenient$String$StringArr$intArr$boolean(part, ['shrinkprio', 'shp'], [10, 3], true);
          if (ix > -1) {
            let sp = JString.trim(part.substring(ix));
            if (sp.startsWith('x') || sp.startsWith('y')) {
              (sp.startsWith('x') ? cc.getHorizontal() : cc.getVertical()).setShrinkPriority($J.parseInt(sp.substring(2)));
            } else {
              let shrinks = ConstraintParser.toTrimmedTokens(sp, 32 /* ' ' */);
              cc.getHorizontal().setShrinkPriority($J.parseInt(shrinks[0]));
              if (shrinks.length > 1) {
                cc.getVertical().setShrinkPriority($J.parseInt(shrinks[1]));
              }
            }
            continue;
          }
          ix = ConstraintParser.startsWithLenient$String$StringArr$intArr$boolean(part, ['sizegroupx', 'sizegroupy', 'sgx', 'sgy'], [9, 9, 2, 2], true);
          if (ix > -1) {
            let sg = JString.trim(part.substring(ix));
            let lc = part.charCodeAt((ix - 1) | 0);
            if (lc !== 121 /* 'y' */) {
              cc.getHorizontal().setSizeGroup(sg);
            }
            if (lc !== 120 /* 'x' */) {
              cc.getVertical().setSizeGroup(sg);
            }
            continue;
          }
        }
        if (c === 103 /* 'g' */) {
          ix = ConstraintParser.startsWithLenient$String$String$int$boolean(part, 'growx', 5, true);
          if (ix > -1) {
            cc.getHorizontal().setGrow(ConstraintParser.parseFloat(JString.trim(part.substring(ix)), ResizeConstraint.WEIGHT_100));
            continue;
          }
          ix = ConstraintParser.startsWithLenient$String$String$int$boolean(part, 'growy', 5, true);
          if (ix > -1) {
            cc.getVertical().setGrow(ConstraintParser.parseFloat(JString.trim(part.substring(ix)), ResizeConstraint.WEIGHT_100));
            continue;
          }
          ix = ConstraintParser.startsWithLenient$String$String$int$boolean(part, 'grow', 4, false);
          if (ix > -1) {
            let grows = ConstraintParser.toTrimmedTokens(JString.trim(part.substring(ix)), 32 /* ' ' */);
            cc.getHorizontal().setGrow(ConstraintParser.parseFloat(grows[0], ResizeConstraint.WEIGHT_100));
            cc.getVertical().setGrow(ConstraintParser.parseFloat(grows.length > 1 ? grows[1] : '', ResizeConstraint.WEIGHT_100));
            continue;
          }
          ix = ConstraintParser.startsWithLenient$String$StringArr$intArr$boolean(part, ['growprio', 'gp'], [8, 2], true);
          if (ix > -1) {
            let gp = JString.trim(part.substring(ix));
            let c0 = gp.length > 0 ? gp.charCodeAt(0) : 32 /* ' ' */;
            if (c0 === 120 /* 'x' */ || c0 === 121 /* 'y' */) {
              (c0 === 120 /* 'x' */ ? cc.getHorizontal() : cc.getVertical()).setGrowPriority($J.parseInt(gp.substring(2)));
            } else {
              let grows = ConstraintParser.toTrimmedTokens(gp, 32 /* ' ' */);
              cc.getHorizontal().setGrowPriority($J.parseInt(grows[0]));
              if (grows.length > 1) {
                cc.getVertical().setGrowPriority($J.parseInt(grows[1]));
              }
            }
            continue;
          }
          if (part.startsWith('gap')) {
            let gaps = ConstraintParser.parseGaps(part);
            if (gaps[0] != null) {
              cc.getVertical().setGapBefore(gaps[0]);
            }
            if (gaps[1] != null) {
              cc.getHorizontal().setGapBefore(gaps[1]);
            }
            if (gaps[2] != null) {
              cc.getVertical().setGapAfter(gaps[2]);
            }
            if (gaps[3] != null) {
              cc.getHorizontal().setGapAfter(gaps[3]);
            }
            continue;
          }
        }
        if (c === 97 /* 'a' */) {
          ix = ConstraintParser.startsWithLenient$String$StringArr$intArr$boolean(part, ['aligny', 'ay'], [6, 2], true);
          if (ix > -1) {
            cc.getVertical().setAlign(ConstraintParser.parseUnitValueOrAlign(JString.trim(part.substring(ix)), false, null));
            continue;
          }
          ix = ConstraintParser.startsWithLenient$String$StringArr$intArr$boolean(part, ['alignx', 'ax'], [6, 2], true);
          if (ix > -1) {
            cc.getHorizontal().setAlign(ConstraintParser.parseUnitValueOrAlign(JString.trim(part.substring(ix)), true, null));
            continue;
          }
          ix = ConstraintParser.startsWithLenient$String$String$int$boolean(part, 'align', 2, true);
          if (ix > -1) {
            let gaps = ConstraintParser.toTrimmedTokens(JString.trim(part.substring(ix)), 32 /* ' ' */);
            cc.getHorizontal().setAlign(ConstraintParser.parseUnitValueOrAlign(gaps[0], true, null));
            if (gaps.length > 1) {
              cc.getVertical().setAlign(ConstraintParser.parseUnitValueOrAlign(gaps[1], false, null));
            }
            continue;
          }
        }
        if ((c === 120 /* 'x' */ || c === 121 /* 'y' */) && part.length > 2) {
          let c2 = part.charCodeAt(1);
          if (c2 === 32 /* ' ' */ || (c2 === 50 /* '2' */ && part.charCodeAt(2) === 32 /* ' ' */)) {
            if (cc.getPos() == null) {
              cc.setPos($J.newArray(4, null));
            } else if (cc.isBoundsInGrid() === false) {
              throw new IllegalArgumentException('Cannot combine \'position\' with \'x/y/x2/y2\' keywords.');
            }
            let edge = ((c === 120 /* 'x' */ ? 0 : 1) + (c2 === 50 /* '2' */ ? 2 : 0)) | 0;
            let pos = cc.getPos();
            pos[edge] = ConstraintParser.parseUnitValue$String$UnitValue$boolean(JString.trim(part.substring(2)), null, c === 120 /* 'x' */);
            cc.setPos(pos);
            cc.setBoundsInGrid(true);
            continue;
          }
        }
        if (c === 99 /* 'c' */) {
          ix = ConstraintParser.startsWithLenient$String$String$int$boolean(part, 'cell', 4, true);
          if (ix > -1) {
            let grs = ConstraintParser.toTrimmedTokens(JString.trim(part.substring(ix)), 32 /* ' ' */);
            if (grs.length < 2) {
              throw new IllegalArgumentException('At least two integers must follow ' + part);
            }
            cc.setCellX($J.parseInt(grs[0]));
            cc.setCellY($J.parseInt(grs[1]));
            if (grs.length > 2) {
              cc.setSpanX($J.parseInt(grs[2]));
            }
            if (grs.length > 3) {
              cc.setSpanY($J.parseInt(grs[3]));
            }
            continue;
          }
        }
        if (c === 112 /* 'p' */) {
          ix = ConstraintParser.startsWithLenient$String$String$int$boolean(part, 'pos', 3, true);
          if (ix > -1) {
            if (cc.getPos() != null && cc.isBoundsInGrid()) {
              throw new IllegalArgumentException('Can not combine \'pos\' with \'x/y/x2/y2\' keywords.');
            }
            let pos = ConstraintParser.toTrimmedTokens(JString.trim(part.substring(ix)), 32 /* ' ' */);
            let bounds = $J.newArray(4, null);
            for (let j = 0; j < pos.length; j++) {
              bounds[j] = ConstraintParser.parseUnitValue$String$UnitValue$boolean(pos[j], null, j % 2 === 0);
            }
            if (bounds[0] == null && bounds[2] == null || bounds[1] == null && bounds[3] == null) {
              throw new IllegalArgumentException('Both x and x2 or y and y2 can not be null!');
            }
            cc.setPos(bounds);
            cc.setBoundsInGrid(false);
            continue;
          }
          ix = ConstraintParser.startsWithLenient$String$String$int$boolean(part, 'pad', 3, true);
          if (ix > -1) {
            let p = ConstraintParser.parseInsets(JString.trim(part.substring(ix)), false);
            cc.setPadding([p[0], p.length > 1 ? p[1] : null, p.length > 2 ? p[2] : null, p.length > 3 ? p[3] : null]);
            continue;
          }
          ix = ConstraintParser.startsWithLenient$String$String$int$boolean(part, 'pushx', 5, true);
          if (ix > -1) {
            cc.setPushX(ConstraintParser.parseFloat(JString.trim(part.substring(ix)), ResizeConstraint.WEIGHT_100));
            continue;
          }
          ix = ConstraintParser.startsWithLenient$String$String$int$boolean(part, 'pushy', 5, true);
          if (ix > -1) {
            cc.setPushY(ConstraintParser.parseFloat(JString.trim(part.substring(ix)), ResizeConstraint.WEIGHT_100));
            continue;
          }
          ix = ConstraintParser.startsWithLenient$String$String$int$boolean(part, 'push', 4, false);
          if (ix > -1) {
            let pushs = ConstraintParser.toTrimmedTokens(JString.trim(part.substring(ix)), 32 /* ' ' */);
            cc.setPushX(ConstraintParser.parseFloat(pushs[0], ResizeConstraint.WEIGHT_100));
            cc.setPushY(ConstraintParser.parseFloat(pushs.length > 1 ? pushs[1] : '', ResizeConstraint.WEIGHT_100));
            continue;
          }
        }
        if (c === 116 /* 't' */) {
          ix = ConstraintParser.startsWithLenient$String$String$int$boolean(part, 'tag', 3, true);
          if (ix > -1) {
            cc.setTag(JString.trim(part.substring(ix)));
            continue;
          }
        }
        if (c === 119 /* 'w' */ || c === 104 /* 'h' */) {
          if ($J.equals(part, 'wrap')) {
            cc.setWrap(true);
            continue;
          }
          if (part.startsWith('wrap ')) {
            let gapSz = JString.trim(part.substring(5));
            cc.setWrapGapSize(ConstraintParser.parseBoundSize(gapSz, true, true));
            continue;
          }
          let isHor = c === 119 /* 'w' */;
          if (isHor && (part.startsWith('w ') || part.startsWith('width '))) {
            let uvStr = JString.trim(part.substring(part.charCodeAt(1) === 32 /* ' ' */ ? 2 : 6));
            cc.getHorizontal().setSize(ConstraintParser.parseBoundSize(uvStr, false, true));
            continue;
          }
          if (!isHor && (part.startsWith('h ') || part.startsWith('height '))) {
            let uvStr = JString.trim(part.substring(part.charCodeAt(1) === 32 /* ' ' */ ? 2 : 7));
            cc.getVertical().setSize(ConstraintParser.parseBoundSize(uvStr, false, false));
            continue;
          }
          if (part.startsWith('wmin ') || part.startsWith('wmax ') || part.startsWith('hmin ') || part.startsWith('hmax ')) {
            let uvStr = JString.trim(part.substring(5));
            if (uvStr.length > 0) {
              let uv = ConstraintParser.parseUnitValue$String$UnitValue$boolean(uvStr, null, isHor);
              let isMin = part.charCodeAt(3) === 110 /* 'n' */;
              let dc = isHor ? cc.getHorizontal() : cc.getVertical();
              dc.setSize(new BoundSize()._BoundSize$UnitValue$UnitValue$UnitValue$String(isMin ? uv : dc.getSize().getMin(), dc.getSize().getPreferred(), isMin ? (dc.getSize().getMax()) : uv, uvStr));
              continue;
            }
          }
          if ($J.equals(part, 'west')) {
            cc.setDockSide(1);
            continue;
          }
          if (part.startsWith('hidemode ')) {
            cc.setHideMode($J.parseInt(part.substring(9)));
            continue;
          }
        }
        if (c === 105 /* 'i' */ && part.startsWith('id ')) {
          cc.setId(JString.trim(part.substring(3)));
          let dIx = cc.getId().indexOf(String.fromCharCode(46 /* '.' */));
          if (dIx === 0 || dIx === ((cc.getId().length - 1) | 0)) {
            throw new IllegalArgumentException('Dot must not be first or last!');
          }
          continue;
        }
        if (c === 101 /* 'e' */) {
          if ($J.equals(part, 'east')) {
            cc.setDockSide(3);
            continue;
          }
          if ($J.equals(part, 'external')) {
            cc.setExternal(true);
            continue;
          }
          ix = ConstraintParser.startsWithLenient$String$StringArr$intArr$boolean(part, ['endgroupx', 'endgroupy', 'egx', 'egy'], [-1, -1, -1, -1], true);
          if (ix > -1) {
            let sg = JString.trim(part.substring(ix));
            let lc = part.charCodeAt((ix - 1) | 0);
            let dc = (lc === 120 /* 'x' */ ? cc.getHorizontal() : cc.getVertical());
            dc.setEndGroup(sg);
            continue;
          }
        }
        if (c === 100 /* 'd' */) {
          if ($J.equals(part, 'dock north')) {
            cc.setDockSide(0);
            continue;
          }
          if ($J.equals(part, 'dock west')) {
            cc.setDockSide(1);
            continue;
          }
          if ($J.equals(part, 'dock south')) {
            cc.setDockSide(2);
            continue;
          }
          if ($J.equals(part, 'dock east')) {
            cc.setDockSide(3);
            continue;
          }
          if ($J.equals(part, 'dock center')) {
            cc.getHorizontal().setGrow($J.boxF(100));
            cc.getVertical().setGrow($J.boxF(100));
            cc.setPushX($J.boxF(100));
            cc.setPushY($J.boxF(100));
            continue;
          }
        }
        if (c === 118 /* 'v' */) {
          ix = ConstraintParser.startsWithLenient$String$StringArr$intArr$boolean(part, ['visualpadding', 'vp'], [3, 2], true);
          if (ix > -1) {
            let p = ConstraintParser.parseInsets(JString.trim(part.substring(ix)), false);
            cc.setVisualPadding([p[0], p.length > 1 ? p[1] : null, p.length > 2 ? p[2] : null, p.length > 3 ? p[3] : null]);
            continue;
          }
        }
        let horAlign = ConstraintParser.parseAlignKeywords(part, true);
        if (horAlign != null) {
          cc.getHorizontal().setAlign(horAlign);
          continue;
        }
        let verAlign = ConstraintParser.parseAlignKeywords(part, false);
        if (verAlign != null) {
          cc.getVertical().setAlign(verAlign);
          continue;
        }
        throw new IllegalArgumentException('Unknown keyword.');
      } catch ($e2) {
        if ($J.isa($e2, Exception)) {
          let ex = $J.exc($e2);
          throw new IllegalArgumentException('Error parsing Constraint: \'' + part + '\'', ex);
        } else {
          throw $e2;
        }
      }
    }
    return cc;
  }
  /**
   * Parses insets which consists of 1-4 <code>UnitValue</code>s.
   * @param s The string to parse. E.g. "10 10 10 10" or "20". If less than 4 groups the last will be used for the missing.
   * @param acceptPanel If "panel" and "dialog" should be accepted. They are used to access platform defaults.
   * @return An array of length 4 with the parsed insets.
   * @throws IllegalArgumentException if the parsing could not be done.
   */
  static parseInsets(s: string, acceptPanel: boolean): UnitValue[] {
    if (s.length === 0 || $J.equals(s, 'dialog') || $J.equals(s, 'panel')) {
      if (acceptPanel === false) {
        throw new IllegalArgumentException('Insets now allowed: ' + s + '\n');
      }
      let isPanel = s.startsWith('p');
      let ins = $J.newArray(4, null);
      for (let j = 0; j < 4; j++) {
        ins[j] = isPanel ? PlatformDefaults.getPanelInsets(j) : PlatformDefaults.getDialogInsets(j);
      }
      return ins;
    } else {
      let insS = ConstraintParser.toTrimmedTokens(s, 32 /* ' ' */);
      let ins = $J.newArray(4, null);
      for (let j = 0; j < 4; j++) {
        let insSz = ConstraintParser.parseUnitValue$String$UnitValue$boolean(insS[j < insS.length ? j : (insS.length - 1) | 0], UnitValue.ZERO, j % 2 === 1);
        ins[j] = insSz != null ? insSz : PlatformDefaults.getPanelInsets(j);
      }
      return ins;
    }
  }
  /**
   * Parses gaps.
   * @param s The string that contains gap information. Should start with "gap".
   * @return The gaps as specified in <code>s</code>. Indexed: <code>[top,left,bottom,right][min,pref,max]</code> or
   * [before,after][min,pref,max] if <code>oneDim</code> is true.
   */
  static parseGaps(s: string): BoundSize[] {
    let ret = $J.newArray(4, null);
    let ix = ConstraintParser.startsWithLenient$String$String$int$boolean(s, 'gaptop', -1, true);
    if (ix > -1) {
      s = JString.trim(s.substring(ix));
      ret[0] = ConstraintParser.parseBoundSize(s, true, false);
      return ret;
    }
    ix = ConstraintParser.startsWithLenient$String$String$int$boolean(s, 'gapleft', -1, true);
    if (ix > -1) {
      s = JString.trim(s.substring(ix));
      ret[1] = ConstraintParser.parseBoundSize(s, true, true);
      return ret;
    }
    ix = ConstraintParser.startsWithLenient$String$String$int$boolean(s, 'gapbottom', -1, true);
    if (ix > -1) {
      s = JString.trim(s.substring(ix));
      ret[2] = ConstraintParser.parseBoundSize(s, true, false);
      return ret;
    }
    ix = ConstraintParser.startsWithLenient$String$String$int$boolean(s, 'gapright', -1, true);
    if (ix > -1) {
      s = JString.trim(s.substring(ix));
      ret[3] = ConstraintParser.parseBoundSize(s, true, true);
      return ret;
    }
    ix = ConstraintParser.startsWithLenient$String$String$int$boolean(s, 'gapbefore', -1, true);
    if (ix > -1) {
      s = JString.trim(s.substring(ix));
      ret[1] = ConstraintParser.parseBoundSize(s, true, true);
      return ret;
    }
    ix = ConstraintParser.startsWithLenient$String$String$int$boolean(s, 'gapafter', -1, true);
    if (ix > -1) {
      s = JString.trim(s.substring(ix));
      ret[3] = ConstraintParser.parseBoundSize(s, true, true);
      return ret;
    }
    ix = ConstraintParser.startsWithLenient$String$StringArr$intArr$boolean(s, ['gapx', 'gapy'], null, true);
    if (ix > -1) {
      let x = s.charCodeAt(3) === 120 /* 'x' */;
      let gaps = ConstraintParser.toTrimmedTokens(JString.trim(s.substring(ix)), 32 /* ' ' */);
      (ret[x ? 1 : 0]) = ConstraintParser.parseBoundSize(gaps[0], true, x);
      if (gaps.length > 1) {
        (ret[x ? 3 : 2]) = ConstraintParser.parseBoundSize(gaps[1], true, !x);
      }
      return ret;
    }
    ix = ConstraintParser.startsWithLenient$String$String$int$boolean(s, 'gap ', 1, true);
    if (ix > -1) {
      let gaps = ConstraintParser.toTrimmedTokens(JString.trim(s.substring(ix)), 32 /* ' ' */);
      ret[1] = ConstraintParser.parseBoundSize(gaps[0], true, true);
      if (gaps.length > 1) {
        ret[3] = ConstraintParser.parseBoundSize(gaps[1], true, false);
        if (gaps.length > 2) {
          ret[0] = ConstraintParser.parseBoundSize(gaps[2], true, true);
          if (gaps.length > 3) {
            ret[2] = ConstraintParser.parseBoundSize(gaps[3], true, false);
          }
        }
      }
      return ret;
    }
    throw new IllegalArgumentException('Unknown Gap part: \'' + s + '\'');
  }
  static parseSpan(s: string): number {
    return s.length > 0 ? $J.parseInt(s) : LayoutUtil.INF;
  }
  static parseFloat(s: string, nullVal: number): number {
    return s.length > 0 ? $J.boxF(Math.fround($J.parseDouble(s))) : nullVal;
  }
  /**
   * Parses a single "min:pref:max" value. May look something like <code>"10px:20lp:30%"</code> or <code>"pref!"</code>.
   * @param s The string to parse. Not <code>null</code>.
   * @param isGap If this bound size is a gap (different empty string handling).
   * @param isHor If the size is for the horizontal dimension.
   * @return A bound size that may be <code>null</code> if the string was "null", "n" or <code>null</code>.
   */
  static parseBoundSize(s: string, isGap: boolean, isHor: boolean): BoundSize {
    if (s.length === 0 || $J.equals(s, 'null') || $J.equals(s, 'n')) {
      return null;
    }
    let cs = s;
    let push = false;
    if (s.endsWith('push')) {
      push = true;
      let l = s.length;
      s = s.substring(0, (l - (s.endsWith(':push') ? 5 : 4)) | 0);
      if (s.length === 0) {
        return new BoundSize()._BoundSize$UnitValue$UnitValue$UnitValue$boolean$String(null, null, null, true, cs);
      }
    }
    let sizes = ConstraintParser.toTrimmedTokens(s, 58 /* ':' */);
    let s0 = sizes[0];
    if (sizes.length === 1) {
      let hasEM = s0.endsWith('!');
      if (hasEM) {
        s0 = s0.substring(0, (s0.length - 1) | 0);
      }
      let uv = ConstraintParser.parseUnitValue$String$UnitValue$boolean(s0, null, isHor);
      return new BoundSize()._BoundSize$UnitValue$UnitValue$UnitValue$boolean$String(((isGap || hasEM) ? uv : null), uv, (hasEM ? uv : null), push, cs);
    } else if (sizes.length === 2) {
      return new BoundSize()._BoundSize$UnitValue$UnitValue$UnitValue$boolean$String(ConstraintParser.parseUnitValue$String$UnitValue$boolean(s0, null, isHor), ConstraintParser.parseUnitValue$String$UnitValue$boolean(sizes[1], null, isHor), null, push, cs);
    } else if (sizes.length === 3) {
      return new BoundSize()._BoundSize$UnitValue$UnitValue$UnitValue$boolean$String(ConstraintParser.parseUnitValue$String$UnitValue$boolean(s0, null, isHor), ConstraintParser.parseUnitValue$String$UnitValue$boolean(sizes[1], null, isHor), ConstraintParser.parseUnitValue$String$UnitValue$boolean(sizes[2], null, isHor), push, cs);
    } else {
      throw new IllegalArgumentException('Min:Preferred:Max size section must contain 0, 1 or 2 colons. \'' + cs + '\'');
    }
  }
  /**
   * Parses a single unit value that may also be an alignment as parsed by {@link #parseAlignKeywords(String, boolean)}.
   * @param s The string to parse. Not <code>null</code>. May look something like <code>"10px"</code> or <code>"5dlu"</code>.
   * @param isHor If the value is for the horizontal dimension.
   * @param emptyReplacement A replacement if <code>s</code> is empty. May be <code>null</code>.
   * @return The parsed unit value. May be <code>null</code>.
   */
  static parseUnitValueOrAlign(s: string, isHor: boolean, emptyReplacement: UnitValue): UnitValue {
    if (s.length === 0) {
      return emptyReplacement;
    }
    let align = ConstraintParser.parseAlignKeywords(s, isHor);
    if (align != null) {
      return align;
    }
    return ConstraintParser.parseUnitValue$String$UnitValue$boolean(s, emptyReplacement, isHor);
  }
  /**
   * Parses a single unit value. E.g. "10px" or "5in"
   * @param s The string to parse. Not <code>null</code>. May look something like <code>"10px"</code> or <code>"5dlu"</code>.
   * @param isHor If the value is for the horizontal dimension.
   * @return The parsed unit value. <code>null</code> is empty string,
   */
  static parseUnitValue$String$boolean(s: string, isHor: boolean): UnitValue {
    return ConstraintParser.parseUnitValue$String$UnitValue$boolean(s, null, isHor);
  }
  /**
   * Parses a single unit value.
   * @param s The string to parse. May be <code>null</code>. May look something like <code>"10px"</code> or <code>"5dlu"</code>.
   * @param emptyReplacement A replacement <code>s</code> is empty or <code>null</code>. May be <code>null</code>.
   * @param isHor If the value is for the horizontal dimension.
   * @return The parsed unit value. May be <code>null</code>.
   */
  static parseUnitValue$String$UnitValue$boolean(s: string, emptyReplacement: UnitValue, isHor: boolean): UnitValue {
    if (s == null || s.length === 0) {
      return emptyReplacement;
    }
    let cs = s;
    let c0 = s.charCodeAt(0);
    if (c0 === 40 /* '(' */ && s.charCodeAt((s.length - 1) | 0) === 41 /* ')' */) {
      s = s.substring(1, (s.length - 1) | 0);
    }
    if (c0 === 110 /* 'n' */ && ($J.equals(s, 'null') || $J.equals(s, 'n'))) {
      return null;
    }
    if (c0 === 105 /* 'i' */ && $J.equals(s, 'inf')) {
      return UnitValue.INF;
    }
    let oper = ConstraintParser.getOper(s);
    let inline = oper === UnitValue.ADD || oper === UnitValue.SUB || oper === UnitValue.MUL || oper === UnitValue.DIV;
    if (oper !== UnitValue.STATIC) {
      let uvs: string[];
      if (inline === false) {
        let sub = JString.trim(s.substring(4, (s.length - 1) | 0));
        uvs = ConstraintParser.toTrimmedTokens(sub, 44 /* ',' */);
        if (uvs.length === 1) {
          return ConstraintParser.parseUnitValue$String$UnitValue$boolean(sub, null, isHor);
        }
      } else {
        let delim: number;
        if (oper === UnitValue.ADD) {
          delim = 43 /* '+' */;
        } else if (oper === UnitValue.SUB) {
          delim = 45 /* '-' */;
        } else if (oper === UnitValue.MUL) {
          delim = 42 /* \u002a */;
        } else {
          delim = 47 /* \u002f */;
        }
        uvs = ConstraintParser.toTrimmedTokens(s, delim);
        if (uvs.length > 2) {
          let last = uvs[(uvs.length - 1) | 0];
          let first = s.substring(0, (s.length - last.length - 1) | 0);
          uvs = [first, last];
        }
      }
      if (uvs.length !== 2) {
        throw new IllegalArgumentException('Malformed UnitValue: \'' + s + '\'');
      }
      let sub1 = ConstraintParser.parseUnitValue$String$UnitValue$boolean(uvs[0], null, isHor);
      let sub2 = ConstraintParser.parseUnitValue$String$UnitValue$boolean(uvs[1], null, isHor);
      if (sub1 == null || sub2 == null) {
        throw new IllegalArgumentException('Malformed UnitValue. Must be two sub-values: \'' + s + '\'');
      }
      return new UnitValue()._UnitValue$boolean$int$UnitValue$UnitValue$String(isHor, oper, sub1, sub2, cs);
    } else {
      try {
        let numParts = ConstraintParser.getNumTextParts(s);
        let value = numParts[0].length > 0 ? Math.fround($J.parseDouble(numParts[0])) : 1;
        return new UnitValue()._UnitValue$float$String$boolean$int$String(value, numParts[1], isHor, oper, cs);
      } catch ($e3) {
        if ($J.isa($e3, Exception)) {
          let e = $J.exc($e3);
          throw new IllegalArgumentException('Malformed UnitValue: \'' + s + '\'', e);
        } else {
          throw $e3;
        }
      }
    }
  }
  /**
   * Parses alignment keywords and returns the appropriate <code>UnitValue</code>.
   * @param s The string to parse. Not <code>null</code>.
   * @param isHor If alignments for horizontal is checked. <code>false</code> means vertical.
   * @return The unit value or <code>null</code> if not recognized (no exception).
   */
  static parseAlignKeywords(s: string, isHor: boolean): UnitValue {
    if (ConstraintParser.startsWithLenient$String$String$int$boolean(s, 'center', 1, false) !== -1) {
      return UnitValue.CENTER;
    }
    if (isHor) {
      if (ConstraintParser.startsWithLenient$String$String$int$boolean(s, 'left', 1, false) !== -1) {
        return UnitValue.LEFT;
      }
      if (ConstraintParser.startsWithLenient$String$String$int$boolean(s, 'right', 1, false) !== -1) {
        return UnitValue.RIGHT;
      }
      if (ConstraintParser.startsWithLenient$String$String$int$boolean(s, 'leading', 4, false) !== -1) {
        return UnitValue.LEADING;
      }
      if (ConstraintParser.startsWithLenient$String$String$int$boolean(s, 'trailing', 5, false) !== -1) {
        return UnitValue.TRAILING;
      }
      if (ConstraintParser.startsWithLenient$String$String$int$boolean(s, 'label', 5, false) !== -1) {
        return UnitValue.LABEL;
      }
    } else {
      if (ConstraintParser.startsWithLenient$String$String$int$boolean(s, 'baseline', 4, false) !== -1) {
        return UnitValue.BASELINE_IDENTITY;
      }
      if (ConstraintParser.startsWithLenient$String$String$int$boolean(s, 'top', 1, false) !== -1) {
        return UnitValue.TOP;
      }
      if (ConstraintParser.startsWithLenient$String$String$int$boolean(s, 'bottom', 1, false) !== -1) {
        return UnitValue.BOTTOM;
      }
    }
    return null;
  }
  /**
   * Splits a text-number combination such as "hello 10.0" into <code>{"hello", "10.0"}</code>.
   * @param s The string to split. Not <code>null</code>. Needs be be reasonably formatted since the method
   * only finds the first 0-9 or . and cuts the string in half there.
   * @return Always length 2 and no <code>null</code> elements. Elements are "" if no part found.
   */
  static getNumTextParts(s: string): string[] {
    for (let i = 0, iSz = s.length; i < iSz; i++) {
      let c = s.charCodeAt(i);
      if (c === 32 /* ' ' */) {
        throw new IllegalArgumentException('Space in UnitValue: \'' + s + '\'');
      }
      if ((c < 48 /* '0' */ || c > 57 /* '9' */) && c !== 46 /* '.' */ && c !== 45 /* '-' */) {
        return [JString.trim(s.substring(0, i)), JString.trim(s.substring(i))];
      }
    }
    return [s, ''];
  }
  /**
   * Returns the operation depending on the start character.
   * @param s The string to check. Not <code>null</code>.
   * @return E.g. UnitValue.ADD, UnitValue.SUB or UnitValue.STATIC. Returns negative value for in-line operations.
   */
  static getOper(s: string): number {
    let len = s.length;
    if (len < 3) {
      return UnitValue.STATIC;
    }
    if (len > 5 && s.charCodeAt(3) === 40 /* '(' */ && s.charCodeAt((len - 1) | 0) === 41 /* ')' */) {
      if (s.startsWith('min(')) {
        return UnitValue.MIN;
      }
      if (s.startsWith('max(')) {
        return UnitValue.MAX;
      }
      if (s.startsWith('mid(')) {
        return UnitValue.MID;
      }
    }
    for (let j = 0; j < 2; j++) {
      for (let i = (len - 1) | 0, p = 0; i > 0; i--) {
        let c = s.charCodeAt(i);
        if (c === 41 /* ')' */) {
          p++;
        } else if (c === 40 /* '(' */) {
          p--;
        } else if (p === 0) {
          if (j === 0) {
            if (c === 43 /* '+' */) {
              return UnitValue.ADD;
            }
            if (c === 45 /* '-' */) {
              return UnitValue.SUB;
            }
          } else {
            if (c === 42 /* \u002a */) {
              return UnitValue.MUL;
            }
            if (c === 47 /* \u002f */) {
              return UnitValue.DIV;
            }
          }
        }
      }
    }
    return UnitValue.STATIC;
  }
  /**
   * Returns if a string shares at least a specified numbers starting characters with a number of matches.
   * <p>
   * This method just exercise {@link #startsWithLenient(String, String, int, boolean)} with every one of
   * <code>matches</code> and <code>minChars</code>.
   * @param s The string to check. Not <code>null</code>.
   * @param matches A number of possible starts for <code>s</code>.
   * @param minChars The minimum number of characters to match for every element in <code>matches</code>. Needs
   * to be of same length as <code>matches</code>. Can be <code>null</code>.
   * @param acceptTrailing If after the required number of characters are matched on recognized characters that are not
   * in one of the the <code>matches</code> string should be accepted. For instance if "abczz" should be matched with
   * "abcdef" and min chars 3.
   * @return The index of the first unmatched character if <code>minChars</code> was reached or <code>-1</code> if a match was not
   * found.
   */
  static startsWithLenient$String$StringArr$intArr$boolean(s: string, matches: string[], minChars: number[], acceptTrailing: boolean): number {
    for (let i = 0; i < matches.length; i++) {
      let minChar = minChars != null ? minChars[i] : -1;
      let ix = ConstraintParser.startsWithLenient$String$String$int$boolean(s, matches[i], minChar, acceptTrailing);
      if (ix > -1) {
        return ix;
      }
    }
    return -1;
  }
  /**
   * Returns if a string shares at least a specified numbers starting characters with a match.
   * @param s The string to check. Not <code>null</code> and must be trimmed.
   * @param match The possible start for <code>s</code>. Not <code>null</code> and must be trimmed.
   * @param minChars The mimimum number of characters to match to <code>s</code> for it this to be considered a match. -1 means
   * the full length of <code>match</code>.
   * @param acceptTrailing If after the required number of charecters are matched unrecognized characters that are not
   * in one of the the <code>matches</code> string should be accepted. For instance if "abczz" should be matched with
   * "abcdef" and min chars 3.
   * @return The index of the first unmatched character if <code>minChars</code> was reached or <code>-1</code> if a match was not
   * found.
   */
  static startsWithLenient$String$String$int$boolean(s: string, match: string, minChars: number, acceptTrailing: boolean): number {
    if (s.charCodeAt(0) !== match.charCodeAt(0)) {
      return -1;
    }
    if (minChars === -1) {
      minChars = match.length;
    }
    let sSz = s.length;
    if (sSz < minChars) {
      return -1;
    }
    let mSz = match.length;
    let sIx = 0;
    for (let mIx = 0; mIx < mSz; sIx++, mIx++) {
      while (sIx < sSz && (s.charCodeAt(sIx) === 32 /* ' ' */ || s.charCodeAt(sIx) === 95 /* '_' */)) {
        sIx++;
      }
      if (sIx >= sSz || s.charCodeAt(sIx) !== match.charCodeAt(mIx)) {
        return mIx >= minChars && (acceptTrailing || sIx >= sSz) && (sIx >= sSz || s.charCodeAt((sIx - 1) | 0) === 32 /* ' ' */) ? sIx : -1;
      }
    }
    return sIx >= sSz || acceptTrailing || s.charCodeAt(sIx) === 32 /* ' ' */ ? sIx : -1;
  }
  /**
   * Parses a string and returns it in those parts of the string that are separated with a <code>sep</code> character.
   * <p>
   * separator characters within parentheses will not be counted or handled in any way, whatever the depth.
   * <p>
   * A space separator will be a hit to one or more spaces and thus not return empty strings.
   * @param s The string to parse. If it starts and/or ends with a <code>sep</code> the first and/or last element returned will be "". If
   * two <code>sep</code> are next to each other and empty element will be "between" the periods. The <code>sep</code> themselves will never be returned.
   * @param sep The separator char.
   * @return Those parts of the string that are separated with <code>sep</code>. Never null and at least of size 1
   * @since 6.7.2 Changed so more than one space in a row works as one space.
   */
  static toTrimmedTokens(s: string, sep: number): string[] {
    let toks = 0;
    let sSize = s.length;
    let disregardDoubles = sep === 32 /* ' ' */;
    let p = 0;
    for (let i = 0; i < sSize; i++) {
      let c = s.charCodeAt(i);
      if (c === 40 /* '(' */) {
        p++;
      } else if (c === 41 /* ')' */) {
        p--;
      } else if (p === 0 && c === sep) {
        toks++;
        while (disregardDoubles && i < ((sSize - 1) | 0) && s.charCodeAt((i + 1) | 0) === 32 /* ' ' */) {
          i++;
        }
      }
      if (p < 0) {
        throw new IllegalArgumentException('Unbalanced parentheses: \'' + s + '\'');
      }
    }
    if (p !== 0) {
      throw new IllegalArgumentException('Unbalanced parentheses: \'' + s + '\'');
    }
    if (toks === 0) {
      return [JString.trim(s)];
    }
    let retArr = $J.newArray((toks + 1) | 0, null);
    let st = 0;
    let pNr = 0;
    p = 0;
    for (let i = 0; i < sSize; i++) {
      let c = s.charCodeAt(i);
      if (c === 40 /* '(' */) {
        p++;
      } else if (c === 41 /* ')' */) {
        p--;
      } else if (p === 0 && c === sep) {
        retArr[pNr++] = JString.trim(s.substring(st, i));
        st = (i + 1) | 0;
        while (disregardDoubles && i < ((sSize - 1) | 0) && s.charCodeAt((i + 1) | 0) === 32 /* ' ' */) {
          i++;
        }
      }
    }
    retArr[pNr++] = JString.trim(s.substring(st, sSize));
    return retArr;
  }
  /**
   * Parses "AAA[BBB]CCC[DDD]EEE" into {"AAA", "BBB", "CCC", "DDD", "EEE", "FFF"}. Handles empty parts. Will always start and end outside
   * a [] block so that the number of returned elemets will always be uneven and at least of length 3.
   * <p>
   * "|" is interpreted as "][".
   * @param s The string. Might be "" but not null. Should be trimmed.
   * @return The string divided into elements. Never <code>null</code> and at least of length 3.
   * @throws IllegalArgumentException If a [] mismatch of some kind. (If not same [ as ] count or if the interleave.)
   */
  static getRowColAndGapsTrimmed(s: string): ArrayList<string> {
    if (s.indexOf(String.fromCharCode(124 /* '|' */)) !== -1) {
      s = JString.replaceAll(s, '\\|', '][');
    }
    let retList = new ArrayList(Math.max(s.length >> ((2 + 1) | 0), 3));
    let s0 = 0;
    let s1 = 0;
    let st = 0;
    for (let i = 0, iSz = s.length; i < iSz; i++) {
      let c = s.charCodeAt(i);
      if (c === 91 /* '[' */) {
        s0++;
      } else if (c === 93 /* ']' */) {
        s1++;
      } else {
        continue;
      }
      if (s0 !== s1 && ((s0 - 1) | 0) !== s1) {
        break;
      }
      retList.add(JString.trim(s.substring(st, i)));
      st = (i + 1) | 0;
    }
    if (s0 !== s1) {
      throw new IllegalArgumentException('\'[\' and \']\' mismatch in row/column format string: ' + s);
    }
    if (s0 === 0) {
      retList.add('');
      retList.add(s);
      retList.add('');
    } else if (retList.size() % 2 === 0) {
      retList.add(s.substring(st, s.length));
    }
    return retList;
  }
  /**
   * Makes <code>null</code> "", trims and converts to lower case.
   * @param s The string
   * @return Not null.
   */
  static prepare(s: string): string {
    return s != null ? JString.trim(s).toLowerCase() : '';
  }
}

$J.define(ConstraintParser, 'net.miginfocom.layout.ConstraintParser', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_ConstraintParser' }, meths: { 'startsWithLenient(java.lang.String,java.lang.String,int,boolean)': 'startsWithLenient$String$String$int$boolean', 'startsWithLenient(java.lang.String,java.lang.String[],int[],boolean)': 'startsWithLenient$String$StringArr$intArr$boolean', 'parseUnitValue(java.lang.String,net.miginfocom.layout.UnitValue,boolean)': 'parseUnitValue$String$UnitValue$boolean', 'parseUnitValue(java.lang.String,boolean)': 'parseUnitValue$String$boolean' } });
$J.module(() => {
  AC = $J.load('net.miginfocom.layout.AC');
  BoundSize = $J.load('net.miginfocom.layout.BoundSize');
  CC = $J.load('net.miginfocom.layout.CC');
  DimConstraint = $J.load('net.miginfocom.layout.DimConstraint');
  LC = $J.load('net.miginfocom.layout.LC');
  LayoutUtil = $J.load('net.miginfocom.layout.LayoutUtil');
  PlatformDefaults = $J.load('net.miginfocom.layout.PlatformDefaults');
  ResizeConstraint = $J.load('net.miginfocom.layout.ResizeConstraint');
  UnitValue = $J.load('net.miginfocom.layout.UnitValue');
});
