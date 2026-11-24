// @ts-nocheck
// OpenClonk 36de799: src/c4group/C4LangStringTable.cpp, src/c4group/C4LangStringTable.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n } from '../../rt/int.ts';
import { $padd, $rd, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $copy, $delete, $throw, StdException, StdMap, StdPair, StdString } from '../../rt/std.ts';
import { C4ComponentHost } from './C4ComponentHost.ts';

export class RP {
  Pos = null;
  String = new StdString();
  Len = 0;
  Next = null;

  None() {
    this.String = new StdString();
    return this;
  }

  $clone() { return new RP().$assign(this); }
  $assign(o) {
    this.Pos = o.Pos;
    this.String = o.String.$clone();
    this.Len = o.Len;
    this.Next = o.Next;
    return this;
  }
}

export class C4LangStringTable$NoSuchTranslation extends StdException {

  init(text) {
    this.$setmsg(StdString.of(S("No such translation: \"")).plus(text).plus(S("\"")));
    return this;
  }

  $clone() { return new C4LangStringTable$NoSuchTranslation().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class C4LangStringTable extends C4ComponentHost {
  static system_string_table;
  strings = new StdMap();
  ref_count = 1;

  PopulateStringTable() {
    let $t1;
    0;
    this.strings.clear();
    let key = new StdString();
    let value = new StdString();
    let data = this.GetData();
    if (data == null || data.a[data.o] === 0) {
      return;
    }
    let state = 0 /*PSTS_Key*/;
    do {
      if ((state | 0) === 0) {
        if (data.a[data.o] === 61) {
          state = 1 /*PSTS_Val*/;
        } else if (data.a[data.o] === 0 || data.a[data.o] === 10 || data.a[data.o] === 13) {
          if (!key.empty() && key.d[0] !== 35) {
            $.LogF(S("%s: string table entry without a value: \"%s\""), this.GetFilePath() != null ? this.GetFilePath() : S("<unknown>"), key.c_str());
          }
          key.clear();
        } else {
          key.push_back(data.a[data.o]);
        }
      } else {
        if (data.a[data.o] === 0 || data.a[data.o] === 10 || data.a[data.o] === 13) {
          this.strings.insertPair(new StdPair($copy(key), $copy(value)));
          key.clear();
          value.clear();
          state = 0 /*PSTS_Key*/;
        } else {
          value.push_back(data.a[data.o]);
        }
      }
    } while ($rd(($t1 = data, data = data.add(1), $t1)) !== 0);
  }

  init() {
    this.strings = new StdMap();
    this.ref_count = 1;
    return this;
  }

  Translate(text) {
    if (this.strings.empty()) {
      this.PopulateStringTable();
    }
    let it = this.strings.find(text);
    if (it.eq(this.strings.end())) {
      $throw(new C4LangStringTable$NoSuchTranslation().init(text));
    }
    return it.v.second;
  }

  HasTranslation(text) {
    if (this.strings.empty()) {
      this.PopulateStringTable();
    }
    return !this.strings.find(text).eq(this.strings.end());
  }

  ReplaceStrings$rStdStrBuf(rBuf) {
    this.ReplaceStrings$StdStrBuf$rStdStrBuf(rBuf, rBuf);
  }

  ReplaceStrings$StdStrBuf$rStdStrBuf(rBuf, rTarget) {
    let $t1;
    if (!(rBuf.getLength() !== 0)) {
      return;
    }
    let Data = rBuf.getData();
    let iScriptLen = $.SLen(Data) | 0;
    let pRPList = null;
    let pRPListEnd = null;
    for (let pPos = $.SSearch(Data, S("$")); pPos != null; pPos = $.SSearch(pPos, S("$"))) {
      const szStringName = new Int8Array(31);
      $.SCopyUntil$pi8$pi8$i8$i32$i32(pPos, P(szStringName, 0), 36, 30);
      pPos = pPos.add($.SLen(P(szStringName, 0)) + 1);
      if ($rd($padd(pPos, -1)) !== 36) {
        continue;
      }
      let pPos2 = P(szStringName, 0);
      while (pPos2.a[pPos2.o] !== 0) {
        if (!$.IsIdentifier($rd(($t1 = pPos2, pPos2 = pPos2.add(1), $t1)))) {
          break;
        }
      }
      if (pPos2.a[pPos2.o] !== 0) {
        continue;
      }
      try {
        let pStrTblEntry = this.Translate(StdString.of(P(szStringName, 0))).$clone();
        let pnRP = new RP().None();
        pnRP.Pos = $padd($padd(pPos, -$.SLen(P(szStringName, 0))), -2);
        pnRP.String.assign(pStrTblEntry);
        pnRP.Len = $.SLen(P(szStringName, 0)) + 2 >>> 0;
        pnRP.Next = null;
        pRPListEnd = (($v) => pRPListEnd != null ? (pRPListEnd.Next = $v) : (pRPList = $v))(pnRP);
        iScriptLen = $u64n(iScriptLen) + (pStrTblEntry.size() - pnRP.Len) | 0;
      } catch ($e2) {
        if ($e2 instanceof C4LangStringTable$NoSuchTranslation) {
          $.LogF(S("%s: string table entry not found: \"%s\""), this.GetFilePath() != null ? this.GetFilePath() : S("<unknown>"), P(szStringName, 0));
        } else {
          throw $e2;
        }
      }
    }
    let pNewBuf = null;
    let sNewBuf = new $.StdStrBuf();
    sNewBuf.SetLength($u64n(iScriptLen));
    pNewBuf = sNewBuf.getMData();
    let pRPos = Data;
    let pWPos = pNewBuf;
    for (let pRPPos = pRPList; pRPPos != null; pRPPos = pRPPos.Next) {
      $.SCopy$pi8$pi8$u64(pRPos, pWPos, $u64n(pRPPos.Pos.o - pRPos.o));
      pWPos = pWPos.add(pRPPos.Pos.o - pRPos.o);
      $.SCopyUntil$pi8$pi8$i8$i32$i32(pRPPos.String.c_str(), pWPos, 10);
      $.SReplaceChar(pWPos, 13, 0);
      pRPos = $padd(pRPPos.Pos, pRPPos.Len);
      pWPos = pWPos.add($.SLen(pWPos));
    }
    $.SCopy$pi8$pi8(pRPos, pWPos);
    while (pRPList != null) {
      let pRP = pRPList;
      pRPList = pRP.Next;
      $delete(pRP);
    }
    rTarget.Clear();
    rTarget.Take$mStdStrBuf(sNewBuf);
  }

  AddRef() {
    this.ref_count = this.ref_count + 1 | 0;
  }

  DelRef() {
    if (!((this.ref_count = this.ref_count - 1 | 0) !== 0)) {
      $delete(this);
    }
  }

  static GetSystemStringTable() {
    return C4LangStringTable.system_string_table;
  }

  OnLoad() {
    this.strings.clear();
  }

  $clone() { return new C4LangStringTable().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.strings = o.strings.$clone();
    this.ref_count = o.ref_count;
    return this;
  }
}

export function $init(): void {
  C4LangStringTable.system_string_table = new C4LangStringTable().init();
}

Object.assign($, { C4LangStringTable, C4LangStringTable$NoSuchTranslation, RP });
