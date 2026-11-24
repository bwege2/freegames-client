// @ts-nocheck
// OpenClonk 36de799: src/object/C4DefList.cpp, src/object/C4DefList.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { CStdFontCustomImages } from '../graphics/C4FontLoaderCustomImages.ts';
import { StdMeshSkeletonLoader } from '../lib/StdMeshLoader.ts';
import { $u64n } from '../../rt/int.ts';
import { c$strchr, c$strncpy } from '../../rt/libc.ts';
import { $padd, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $begin, $copy, $delete, $end, $min, $reserve, StdMap, StdPair, StdString, std_stable_sort } from '../../rt/std.ts';

export class C4DefList extends CStdFontCustomImages {
  LoadFailure = false;
  table = new StdMap((a, b) => a.op_lt(b));
  FirstDef = null;
  localized_group_folder_names = new StdMap((a, b) => a.op_lt(b));
  SkeletonLoader = null;

  init() {
    this.table = new StdMap((a, b) => a.op_lt(b));
    this.localized_group_folder_names = new StdMap((a, b) => a.op_lt(b));
    this.SkeletonLoader = new C4SkeletonManager().None();
    C4DefList.prototype.Default.call(this);
    return this;
  }

  $dtor() {
    C4DefList.prototype.Clear.call(this);
  }

  Default() {
    this.FirstDef = null;
    this.LoadFailure = false;
    this.table.clear();
  }

  Clear() {
    let cdef = null;
    let next = null;
    for (cdef = this.FirstDef; cdef != null; cdef = next) {
      next = cdef.Next;
      $delete(cdef);
    }
    this.FirstDef = null;
    this.table.clear();
    this.localized_group_folder_names.clear();
    this.SkeletonLoader.Clear();
  }

  Load$rC4Group$u32$pi8$pC4SoundSystem$b$b$i32$i32$b(hGroup, dwLoadWhat, szLanguage, pSoundSystem = null, fOverload = false, fSearchMessage = false, iMinProgress = 0, iMaxProgress = 0, fLoadSysGroups = true) {
    let iResult = 0;
    let nDef = null;
    const szEntryname = new Int8Array(256);
    let hChild = new $.C4Group().init();
    let fPrimaryDef = false;
    let fThisSearchMessage = false;
    let can_be_primary_def = $.SEqualNoCase($.GetExtension(hGroup.GetName()), S("ocd"));
    if (fSearchMessage) {
      if (can_be_primary_def || $.SEqualNoCase($.GetExtension(hGroup.GetName()), S("ocs")) || $.SEqualNoCase($.GetExtension(hGroup.GetName()), S("ocf"))) {
        fThisSearchMessage = true;
        fSearchMessage = false;
      }
    }
    if (fThisSearchMessage) {
      $.LogF(S("%s..."), $.GetFilename(hGroup.GetName()));
    }
    if (can_be_primary_def) {
      if ((nDef = new $.C4Def().init()) != null) {
        if (nDef.Load(hGroup, this.SkeletonLoader, dwLoadWhat, szLanguage, pSoundSystem) && this.Add(nDef, fOverload)) {
          iResult = iResult + 1 | 0;
          fPrimaryDef = true;
        } else {
          $delete(nDef);
          nDef = null;
        }
      }
    }
    if (nDef == null) {
      let title_file = new $.C4ComponentHost().init();
      let title = new $.StdCopyStrBuf();
      $.C4Language.LoadComponentHost(title_file, hGroup, S("Title%s.txt|Title.txt"), P($.Config.General.LanguageEx, 0));
      if (title_file.GetLanguageString(P($.Config.General.LanguageEx, 0), title)) {
        let group_path = new $.StdCopyStrBuf().init$mStdStrBuf(hGroup.GetFullName());
        group_path.ReplaceChar(92, 47);
        this.localized_group_folder_names.entry(group_path, () => new $.StdCopyStrBuf()).second.$assign(title);
      }
    }
    let i = 0;
    hGroup.ResetSearch();
    while (hGroup.FindNextEntry$pi8$pi8$pu64$b(S("*.ocd"), P(szEntryname, 0))) {
      if (hChild.OpenAsChild(hGroup, P(szEntryname, 0))) {
        let iSubMinProgress = $min(iMaxProgress, iMinProgress + (Math.imul(iMaxProgress - iMinProgress | 0, i) / 16 | 0) | 0);
        let iSubMaxProgress = $min(iMaxProgress, iMinProgress + (Math.imul(iMaxProgress - iMinProgress | 0, i + 1 | 0) / 16 | 0) | 0);
        i = i + 1 | 0;
        iResult = iResult + this.Load$rC4Group$u32$pi8$pC4SoundSystem$b$b$i32$i32$b(hChild, dwLoadWhat, szLanguage, pSoundSystem, fOverload, fSearchMessage, iSubMinProgress, iSubMaxProgress) | 0;
        hChild.Close$v();
      }
    }
    if (fLoadSysGroups) {
      $.Game.LoadAdditionalSystemGroup(hGroup);
    }
    if (fThisSearchMessage) {
      $.LogF($.LoadResStr(S("IDS_PRC_DEFSLOADED")), iResult);
    }
    if (iMinProgress !== iMaxProgress) {
      $.Game.SetInitProgress(Math.fround(iMaxProgress));
    }
    return iResult;
  }

  Load$pi8$u32$pi8$pC4SoundSystem$b$i32$i32(szFilename, dwLoadWhat, szLanguage, pSoundSystem = null, fOverload = false, iMinProgress = 0, iMaxProgress = 0) {
    let hGroup = new $.C4Group().init();
    if (!$.Reloc.Open(hGroup, szFilename)) {
      $.LogFatal($.FormatString($.LoadResStr(S("IDS_PRC_DEFNOTFOUND")), szFilename).getData());
      this.LoadFailure = true;
      return 0;
    }
    let nDefs = this.Load$rC4Group$u32$pi8$pC4SoundSystem$b$b$i32$i32$b(hGroup, dwLoadWhat, szLanguage, pSoundSystem, fOverload, true, iMinProgress, iMaxProgress);
    hGroup.Close$v();
    if (iMinProgress !== iMaxProgress) {
      $.Game.SetInitProgress(Math.fround(iMaxProgress));
    }
    return nDefs;
  }

  ID2Def(id) {
    if (id.op_eq($.C4ID.None)) {
      return null;
    }
    if (this.table.empty()) {
      let cdef = null;
      for (cdef = this.FirstDef; cdef != null; cdef = cdef.Next) {
        if (cdef.id.op_eq(id)) {
          return cdef;
        }
      }
    } else {
      let it = this.table.find(id);
      if (!it.eq(this.table.end())) {
        return it.v.second;
      }
    }
    return null;
  }

  GetDef(iIndex) {
    let pDef = null;
    let iCurrentIndex = 0;
    if (iIndex < 0) {
      return null;
    }
    for (pDef = this.FirstDef, iCurrentIndex = -1; pDef != null; pDef = pDef.Next) {
      iCurrentIndex = iCurrentIndex + 1 | 0;
      if (iCurrentIndex === iIndex) {
        return pDef;
      }
    }
    return null;
  }

  GetAllDefs(filter_property = null) {
    let result = [];
    $reserve(result, filter_property != null ? 32 : this.table.size());
    let prop_val = new $.C4Value().init$v();
    for (let def = this.FirstDef; def != null; def = def.Next) {
      if (filter_property != null) {
        if (!def.GetPropertyByS(filter_property, prop_val)) {
          continue;
        }
        if (prop_val.op_not()) {
          continue;
        }
      }
      result.push(def);
    }
    return result;
  }

  GetByPath(szPath) {
    let szDefPath = null;
    for (let pDef = this.FirstDef; pDef != null; pDef = pDef.Next) {
      if ((szDefPath = $.Config.AtRelativePath(P(pDef.Filename, 0))) != null) {
        if ($.SEqual2NoCase(szPath, szDefPath)) {
          if (!(szPath.a[szPath.o + $.SLen(szDefPath)] !== 0)) {
            return pDef;
          } else if (szPath.a[szPath.o + $.SLen(szDefPath)] === 92) {
            if (!(c$strchr($padd($padd(szPath, $.SLen(szDefPath)), 1), 92) != null)) {
              return pDef;
            }
          }
        }
      }
    }
    return null;
  }

  GetByName(name) {
    return this.ID2Def(new $.C4ID().init$StdStrBuf(name));
  }

  GetDefCount() {
    let cdef = null;
    let ccount = 0;
    for (cdef = this.FirstDef; cdef != null; cdef = cdef.Next) {
      ccount = ccount + 1 | 0;
    }
    return ccount;
  }

  GetIndex(id) {
    let cdef = null;
    let cindex = 0;
    for (cdef = this.FirstDef, cindex = 0; cdef != null; cdef = cdef.Next, cindex = cindex + 1 | 0) {
      if (cdef.id.op_eq(id)) {
        return cindex;
      }
    }
    return -1;
  }

  RemoveTemporary() {
    let cdef = null;
    let prev = null;
    let next = null;
    let removed = 0;
    for (cdef = this.FirstDef, prev = null; cdef != null; cdef = next) {
      next = cdef.Next;
      if (cdef.Temporary) {
        if (prev != null) {
          prev.Next = next;
        } else {
          this.FirstDef = next;
        }
        $delete(cdef);
        removed = removed + 1 | 0;
      } else {
        prev = cdef;
      }
    }
    this.BuildTable();
    return removed;
  }

  CheckEngineVersion(ver1, ver2) {
    let rcount = 0;
    let cdef = null;
    let prev = null;
    let next = null;
    for (cdef = this.FirstDef, prev = null; cdef != null; cdef = next) {
      next = cdef.Next;
      if ($.CompareVersion(cdef.rC4XVer[0], cdef.rC4XVer[1], ver1, ver2) > 0) {
        if (prev != null) {
          prev.Next = cdef.Next;
        } else {
          this.FirstDef = cdef.Next;
        }
        $delete(cdef);
        rcount = rcount + 1 | 0;
      } else {
        prev = cdef;
      }
    }
    return rcount;
  }

  CheckRequireDef() {
    let rcount = 0;
    let rcount2 = 0;
    let cdef = null;
    let prev = null;
    let next = null;
    do {
      rcount2 = rcount;
      for (cdef = this.FirstDef, prev = null; cdef != null; cdef = next) {
        next = cdef.Next;
        for (let i = 0; i < cdef.RequireDef.GetNumberOfIDs$v(); i = i + 1 | 0) {
          if (this.GetIndex(cdef.RequireDef.GetID$u64$pi32($u64n(i))) < 0) {
            (($v) => prev != null ? (prev.Next = $v) : (this.FirstDef = $v))(cdef.Next);
            $delete(cdef);
            rcount = rcount + 1 | 0;
          }
        }
      }
    } while (rcount !== rcount2);
    return rcount;
  }

  Draw(id, cgo, fSelected, iColor) {
    let cdef = this.ID2Def(id.$clone());
    if (cdef != null) {
      cdef.Draw$rC4Facet$b$u32$pC4Object$i32$i32$pC4DrawTransform$pi8(cgo, fSelected, iColor >>> 0);
    }
  }

  Remove$pC4Def(def) {
    let cdef = null;
    let prev = null;
    for (cdef = this.FirstDef, prev = null; cdef != null; prev = cdef, cdef = cdef.Next) {
      if (cdef === def) {
        if (prev != null) {
          prev.Next = cdef.Next;
        } else {
          this.FirstDef = cdef.Next;
        }
        $delete(cdef);
        return;
      }
    }
  }

  Remove$C4ID(id) {
    let cdef = null;
    let prev = null;
    for (cdef = this.FirstDef, prev = null; cdef != null; prev = cdef, cdef = cdef.Next) {
      if (cdef.id.op_eq(id)) {
        if (prev != null) {
          prev.Next = cdef.Next;
        } else {
          this.FirstDef = cdef.Next;
        }
        $delete(cdef);
        return true;
      }
    }
    return false;
  }

  Reload(pDef, dwLoadWhat, szLanguage, pSoundSystem = null) {
    if (pDef == null) {
      return false;
    }
    let GfxBackup = new $.C4DefGraphicsPtrBackup().init();
    GfxBackup.Add(pDef.Graphics);
    pDef.Clear();
    let hGroup = new $.C4Group().init();
    if (!hGroup.Open(P(pDef.Filename, 0))) {
      return false;
    }
    this.SkeletonLoader.RemoveSkeletonsInGroup(hGroup.GetName());
    if (!pDef.Load(hGroup, this.SkeletonLoader, dwLoadWhat, szLanguage, pSoundSystem, GfxBackup)) {
      return false;
    }
    hGroup.Close$v();
    this.BuildTable();
    this.AppendAndIncludeSkeletons();
    GfxBackup.AssignUpdate();
    return true;
  }

  Add(pDef, fOverload) {
    if (pDef == null) {
      return false;
    }
    let pLastDef = this.ID2Def(pDef.id.$clone());
    if (pLastDef != null && !fOverload) {
      return false;
    }
    if ($.Config.Graphics.VerboseObjectLoading >= 1) {
      if (pLastDef != null) {
        $.LogF($.LoadResStr(S("IDS_PRC_DEFOVERLOAD")), pDef.GetName(), pLastDef.id.ToString());
        if ($.Config.Graphics.VerboseObjectLoading >= 2) {
          $.LogF(S("      Old def at %s"), P(pLastDef.Filename, 0));
          $.LogF(S("     Overload by %s"), P(pDef.Filename, 0));
        }
      }
    }
    this.Remove$C4ID(pDef.id.$clone());
    pDef.Next = this.FirstDef;
    this.FirstDef = pDef;
    return true;
  }

  BuildTable() {
    this.table.clear();
    for (let def = this.FirstDef; def != null; def = def.Next) {
      this.table.insertPair(new StdPair($copy(def.id), def));
    }
  }

  ResetIncludeDependencies() {
    for (const it of this.table) {
      it.second.ResetIncludeDependencies();
    }
  }

  CallEveryDefinition() {
    for (const def = [this.FirstDef]; def[0] != null; def[0] = def[0].Next) {
      if ($.Config.General.DebugRec !== 0) {
        const sz = new Int8Array(33);
        c$strncpy(P(sz, 0), def[0].id.ToString(), 33);
        $.AddDbgRec(165 /*RCT_Definition*/, P(sz, 0), 32);
      }
      let Pars = new $.C4AulParSet().init$rpC4Def(P(def, 0));
      def[0].Call$pi8$pC4AulParSet$b(S("~Definition"), Pars.op_and());
    }
  }

  SortByPriority() {
    let n = this.GetDefCount();
    if (n === 0) {
      return;
    }
    let def_vec = [];
    $reserve(def_vec, $u64n(n));
    for (let def = this.FirstDef; def != null; def = def.Next) {
      def_vec.push(def);
    }
    std_stable_sort($begin(def_vec), $end(def_vec), ((a, b) => {
  return b.GetPropertyInt(214 /*P_DefinitionPriority*/) < a.GetPropertyInt(214 /*P_DefinitionPriority*/);
}));
    let prev_def = null;
    for (const def of def_vec) {
      if (prev_def != null) {
        prev_def.Next = def;
      } else {
        this.FirstDef = def;
      }
      prev_def = def;
    }
    if (prev_def != null) {
      prev_def.Next = null;
    }
  }

  Synchronize() {
    for (const it of this.table) {
      it.second.Synchronize();
    }
  }

  AppendAndIncludeSkeletons() {
    this.SkeletonLoader.ResolveIncompleteSkeletons();
  }

  GetSkeletonLoader() {
    return this.SkeletonLoader;
  }

  GetLocalizedGroupFolderName(folder_path) {
    let iter = this.localized_group_folder_names.find(new $.StdCopyStrBuf().init$pi8$b(folder_path));
    if (iter.eq(this.localized_group_folder_names.end())) {
      return null;
    }
    return iter.v.second.getData();
  }

  DrawFontImage(szImageTag, cgo, pTransform) {
    return $.Game.DrawTextSpecImage(cgo, szImageTag, pTransform);
  }

  GetFontImageAspect(szImageTag) {
    return $.Game.GetTextSpecImageAspect(szImageTag);
  }

  $clone() { return new C4DefList().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.LoadFailure = o.LoadFailure;
    this.table = o.table.$clone();
    this.FirstDef = o.FirstDef;
    this.localized_group_folder_names = o.localized_group_folder_names.$clone();
    this.SkeletonLoader = o.SkeletonLoader;
    return this;
  }
}

export class C4SkeletonManager extends StdMeshSkeletonLoader {

  GetSkeletonByDefinition(definition) {
    let def = $.Definitions.ID2Def(new $.C4ID().init$string(StdString.of(definition)));
    if (def == null) {
      $.DebugLogF(S("WARNING: Looking up skeleton from definition '%s' failed, because there is no such definition with that ID"), definition);
      return null;
    }
    if (!def.Graphics.IsMesh()) {
      $.DebugLogF(S("WARNING: Looking up skeleton from definition '%s' failed, because the definition has no mesh"), definition);
      return null;
    } else {
      let mesh = def.Graphics.$u1.Mesh;
      return mesh.GetSkeleton$v();
    }
  }

  None() {
    return this;
  }

  $clone() { return new C4SkeletonManager().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export function C4Id2Def(id) {
  return $.Definitions.ID2Def(id.$clone());
}

export function $init(): void {
}

Object.assign($, { C4DefList, C4Id2Def, C4SkeletonManager });
