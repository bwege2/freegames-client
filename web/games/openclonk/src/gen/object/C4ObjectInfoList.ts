// @ts-nocheck
// OpenClonk 36de799: src/object/C4ObjectInfoList.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { c$time } from '../../rt/libc.ts';
import { $padd, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $min } from '../../rt/std.ts';

export class C4ObjectInfoList {
  First = null;
  iNumCreated = 0;

  init() {
    C4ObjectInfoList.prototype.Default.call(this);
    return this;
  }

  $dtor() {
    C4ObjectInfoList.prototype.Clear.call(this);
  }

  Default() {
    this.First = null;
    this.iNumCreated = 0;
  }

  Clear() {
    let next = null;
    while (this.First != null) {
      next = this.First.Next;
      $delete(this.First);
      this.First = next;
    }
  }

  Evaluate() {
    let cinf = null;
    for (cinf = this.First; cinf != null; cinf = cinf.Next) {
      cinf.Evaluate();
    }
  }

  DetachFromObjects() {
    let cinf = null;
    for (cinf = this.First; cinf != null; cinf = cinf.Next) {
      $.Objects.ClearInfo(cinf);
    }
  }

  Load(hGroup) {
    let ninf = null;
    let infn = 0;
    const entryname = new Int8Array(257);
    hGroup.ResetSearch();
    while (hGroup.FindNextEntry$pi8$pi8$pu64$b(S("*.oci"), P(entryname, 0))) {
      if ((ninf = new $.C4ObjectInfo().init()) != null) {
        if (ninf.Load$rC4Group$pi8(hGroup, P(entryname, 0))) {
          this.Add(ninf);
          infn = infn + 1 | 0;
        } else {
          $delete(ninf);
        }
      }
    }
    hGroup.ResetSearch();
    while (hGroup.FindNextEntry$pi8$pi8$pu64$b(S("*"), P(entryname, 0))) {
      let ItemGroup = new $.C4Group().init();
      if (ItemGroup.OpenAsChild(hGroup, P(entryname, 0))) {
        this.Load(ItemGroup);
      }
    }
    return infn;
  }

  Add(pInfo) {
    if (pInfo == null) {
      return false;
    }
    pInfo.Next = this.First;
    this.First = pInfo;
    return true;
  }

  Save(hGroup, fSavegame, fStoreTiny, pDefs) {
    let pInfo = null;
    for (pInfo = this.GetLast(); pInfo != null; pInfo = this.GetPrevious(pInfo)) {
      if (!fSavegame) {
        let pDef = $.C4Id2Def(pInfo.id.$clone());
        if (pDef != null && pDef.TemporaryCrew !== 0) {
          continue;
        }
      }
      if (!pInfo.Save$rC4Group$b$pC4DefList(hGroup, fStoreTiny, pDefs)) {
        return false;
      }
    }
    return true;
  }

  New(n_id, pDefs) {
    let pInfo = null;
    if (!((pInfo = new $.C4ObjectInfo().init()) != null)) {
      return null;
    }
    if (n_id.op_eq($.C4ID.None)) {
      n_id.$assign($.C4ID.Clonk);
    }
    let pDef = null;
    if (pDefs != null && !((pDef = pDefs.ID2Def(n_id.$clone())) != null)) {
      $delete(pInfo);
      return null;
    }
    let cpNames = $.Game.Names.GetData();
    if (pDef.pClonkNames != null) {
      cpNames = pDef.pClonkNames.GetData();
    }
    pInfo.Default$C4ID$pC4DefList$pi8(n_id.$clone(), pDefs, cpNames);
    pInfo.Birthday = c$time(null) | 0;
    this.MakeValidName(P(pInfo.Name, 0));
    this.Add(pInfo);
    this.iNumCreated = this.iNumCreated + 1 | 0;
    return pInfo;
  }

  GetIdle$C4ID$rC4DefList(c_id, rDefs) {
    let pDef = null;
    let pInfo = null;
    let pHiExp = null;
    for (pInfo = this.First; pInfo != null; pInfo = pInfo.Next) {
      if ((pDef = rDefs.ID2Def(pInfo.id.$clone())) != null) {
        if (!(c_id.op_unsigned_long_C4ID_() != null) && pDef.NativeCrew === 0 || pInfo.id.op_eq(c_id)) {
          if (pInfo.Participation !== 0 && !pInfo.InAction && !pInfo.HasDied) {
            if (pHiExp == null || pInfo.Experience > pHiExp.Experience) {
              pHiExp = pInfo;
            }
          }
        }
      }
    }
    if (pHiExp != null) {
      pHiExp.Recruit();
      return pHiExp;
    }
    return null;
  }

  GetIdle$pi8(szByName) {
    let pInfo = null;
    for (pInfo = this.First; pInfo != null; pInfo = pInfo.Next) {
      if ($.SEqualNoCase(P(pInfo.Name, 0), szByName) && pInfo.Participation !== 0 && !pInfo.InAction && !pInfo.HasDied) {
        pInfo.Recruit();
        return pInfo;
      }
    }
    return null;
  }

  GetFirst() {
    return this.First;
  }

  IsElement(pInfo) {
    for (let cInfo = this.First; cInfo != null; cInfo = cInfo.Next) {
      if (cInfo === pInfo) {
        return true;
      }
    }
    return false;
  }

  Strip(rDefs) {
    let pInfo = null;
    let pPrev = null;
    for (pInfo = this.First, pPrev = null; pInfo != null; ) {
      if (!(rDefs.ID2Def(pInfo.id.$clone()) != null)) {
        let pDelete = pInfo;
        if (pPrev != null) {
          pPrev.Next = pInfo.Next;
        } else {
          this.First = pInfo.Next;
        }
        pInfo = pInfo.Next;
        $delete(pDelete);
      } else {
        pPrev = pInfo;
        pInfo = pInfo.Next;
      }
    }
  }

  MakeValidName(sName) {
    const number_suffix = new Int8Array(13);
    let namelen = $.SLen(sName);
    for (let identifier = 2; this.NameExists(sName); identifier = identifier + 1 | 0) {
      $.ssprintf$7(number_suffix, S(" %d"), identifier);
      $.SCopy$pi8$pi8(P(number_suffix, 0), $padd(sName, $min(namelen, 30 - $.SLen(P(number_suffix, 0)))));
    }
  }

  NameExists(szName) {
    let cinf = null;
    for (cinf = this.First; cinf != null; cinf = cinf.Next) {
      if ($.SEqualNoCase(szName, P(cinf.Name, 0))) {
        return true;
      }
    }
    return false;
  }

  GetLast() {
    let cInfo = this.First;
    while (cInfo != null && cInfo.Next != null) {
      cInfo = cInfo.Next;
    }
    return cInfo;
  }

  GetPrevious(pInfo) {
    for (let cInfo = this.First; cInfo != null; cInfo = cInfo.Next) {
      if (cInfo.Next === pInfo) {
        return cInfo;
      }
    }
    return null;
  }

  $clone() { return new C4ObjectInfoList().$assign(this); }
  $assign(o) {
    this.First = o.First;
    this.iNumCreated = o.iNumCreated;
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4ObjectInfoList });
