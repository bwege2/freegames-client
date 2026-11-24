// @ts-nocheck
// OpenClonk 36de799: src/c4group/C4Group.cpp, src/c4group/C4Group.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $i64n, $u64n } from '../../rt/int.ts';
import { c$access, c$crc32, c$memcpy, c$printf, c$strlen } from '../../rt/libc.ts';
import { $bytesView, $cs, $oarr, $oat, $oidx, $padd, $rd, $reinterpVoid, $ta, $view8, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $max, StdString } from '../../rt/std.ts';
import { CStdStream } from './CStdFile.ts';

export class C4GroupHeader {
  Id = $cs(S("RedWolf Design GrpFolder"), 28);
  Ver1 = 1;
  Ver2 = 2;
  Entries = 0;
  Reserved = $ta(Int8Array, 164, [0]);

  $clone() { return new C4GroupHeader().$assign(this); }
  $assign(o) {
    this.Id = o.Id.slice();
    this.Ver1 = o.Ver1;
    this.Ver2 = o.Ver2;
    this.Entries = o.Entries;
    this.Reserved = o.Reserved.slice();
    return this;
  }
}

export class C4GroupEntryCore {
  FileName = $ta(Int8Array, 260, [0]);
  Packed = 0;
  ChildGroup = 0;
  Size = 0;
  Offset = 0;
  Reserved1 = 0;
  Reserved2 = 0;
  Reserved3 = 0;
  Reserved4 = 0;
  Executable = 0;
  Buffer = $ta(Uint8Array, 26, [0]);

  $clone() { return new C4GroupEntryCore().$assign(this); }
  $assign(o) {
    this.FileName = o.FileName.slice();
    this.Packed = o.Packed;
    this.ChildGroup = o.ChildGroup;
    this.Size = o.Size;
    this.Offset = o.Offset;
    this.Reserved1 = o.Reserved1;
    this.Reserved2 = o.Reserved2;
    this.Reserved3 = o.Reserved3;
    this.Reserved4 = o.Reserved4;
    this.Executable = o.Executable;
    this.Buffer = o.Buffer.slice();
    return this;
  }
}

export class C4Group$P_c4group_C4Group {
  SourceType = 0 /*ST_None*/;
  FileName = new StdString();
  Mother = null;
  ExclusiveChild = false;
  SearchPtr = null;
  StdFile = new $.CStdFile().init();
  iCurrFileSize = 0;
  FilePtr = 0;
  MotherOffset = 0;
  EntryOffset = 0;
  Modified = false;
  FirstEntry = null;
  pInMemEntry = null;
  iInMemEntrySize = 0;
  FolderSearch = new $.DirectoryIterator().init$v();
  FolderSearchEntry = new C4GroupEntry();
  LastFolderSearchEntry = new C4GroupEntry();
  LogToStdOutput = false;
  ProcessCallback = null;
  ErrorString = new StdString();
  NoSort = false;

  None() {
    this.SourceType = 0 /*ST_None*/;
    this.FileName = new StdString();
    this.Mother = null;
    this.ExclusiveChild = false;
    this.SearchPtr = null;
    this.StdFile = new $.CStdFile().init();
    this.iCurrFileSize = 0;
    this.FilePtr = 0;
    this.MotherOffset = 0;
    this.EntryOffset = 0;
    this.Modified = false;
    this.FirstEntry = null;
    this.pInMemEntry = null;
    this.iInMemEntrySize = 0;
    this.FolderSearch = new $.DirectoryIterator().init$v();
    this.FolderSearchEntry = new C4GroupEntry();
    this.LastFolderSearchEntry = new C4GroupEntry();
    this.LogToStdOutput = false;
    this.ProcessCallback = null;
    this.ErrorString = new StdString();
    this.NoSort = false;
    return this;
  }

  $clone() { return new C4Group$P_c4group_C4Group().$assign(this); }
  $assign(o) {
    this.SourceType = o.SourceType;
    this.FileName = o.FileName.$clone();
    this.Mother = o.Mother;
    this.ExclusiveChild = o.ExclusiveChild;
    this.SearchPtr = o.SearchPtr;
    this.StdFile.$assign(o.StdFile);
    this.iCurrFileSize = o.iCurrFileSize;
    this.FilePtr = o.FilePtr;
    this.MotherOffset = o.MotherOffset;
    this.EntryOffset = o.EntryOffset;
    this.Modified = o.Modified;
    this.FirstEntry = o.FirstEntry;
    this.pInMemEntry = o.pInMemEntry;
    this.iInMemEntrySize = o.iInMemEntrySize;
    this.FolderSearch.$assign(o.FolderSearch);
    this.FolderSearchEntry.$assign(o.FolderSearchEntry);
    this.LastFolderSearchEntry.$assign(o.LastFolderSearchEntry);
    this.LogToStdOutput = o.LogToStdOutput;
    this.ProcessCallback = o.ProcessCallback;
    this.ErrorString = o.ErrorString.$clone();
    this.NoSort = o.NoSort;
    return this;
  }
}

export class C4GroupEntry extends C4GroupEntryCore {
  DiskPath = $ta(Int8Array, 4097, [0]);
  Status = 0 /*C4GRES_InGroup*/;
  DeleteOnDisk = false;
  HoldBuffer = false;
  BufferIsStdbuf = false;
  NoSort = false;
  MemoryBuffer = null;
  Next = null;

  $dtor() {
    if (this.HoldBuffer) {
      if (this.MemoryBuffer != null) {
        if (this.BufferIsStdbuf) {
          $.StdBuf.DeletePointer(this.MemoryBuffer);
        } else {
          $delete(this.MemoryBuffer);
        }
      }
    }
  }

  Set(directories, _path) {
    $.InplaceReconstruct$pC4GroupEntry(this);
    $.SCopy$pi8$pi8$u64($.GetFilename(directories.op_mul()), P(this.FileName, 0), 255);
    $.SCopy$pi8$pi8$u64(directories.op_mul(), P(this.DiskPath, 0), 4095);
    this.Size = directories.GetFileSize() | 0;
    this.Status = 1 /*C4GRES_OnDisk*/;
    this.Packed = 0;
    this.ChildGroup = 0;
  }

  $clone() { return new C4GroupEntry().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.DiskPath = o.DiskPath.slice();
    this.Status = o.Status;
    this.DeleteOnDisk = o.DeleteOnDisk;
    this.HoldBuffer = o.HoldBuffer;
    this.BufferIsStdbuf = o.BufferIsStdbuf;
    this.NoSort = o.NoSort;
    this.MemoryBuffer = o.MemoryBuffer;
    this.Next = o.Next;
    return this;
  }
}

export class C4Group extends CStdStream {
  p = null;
  Head = new C4GroupHeader();

  init() {
    this.p = new C4Group$P_c4group_C4Group().None();
    this.Head = new C4GroupHeader();
    return this;
  }

  $dtor() {
    C4Group.prototype.Clear.call(this);
  }

  GetEntry(entry_name) {
    if (this.p.SourceType === 2) {
      return null;
    }
    for (let entry = this.p.FirstEntry; entry != null; entry = entry.Next) {
      if (entry.Status !== 3 && $.WildcardMatch(entry_name, P(entry.FileName, 0))) {
        return entry;
      }
    }
    return null;
  }

  Clear() {
    if (this.p != null) {
      let next = null;
      while (this.p.FirstEntry != null) {
        next = this.p.FirstEntry.Next;
        $delete(this.p.FirstEntry);
        this.p.FirstEntry = next;
      }
      this.p.StdFile.Close$ppStdBuf();
      if (this.p.Mother != null && this.p.ExclusiveChild) {
        $delete(this.p.Mother);
        this.p.Mother = null;
      }
    }
    this.Init();
  }

  Open(group_name, do_create = false) {
    if (group_name == null) {
      return this.Error_(S("Open: Null filename"));
    }
    if (group_name.a[group_name.o + 0] === 0) {
      return this.Error_(S("Open: Empty filename"));
    }
    const group_name_native = new Int8Array(255);
    $.SCopy$pi8$pi8$u64(group_name, P(group_name_native, 0), 255);
    $.SReplaceChar(P(group_name_native, 0), 92, 47);
    if ($.FileExists(P(group_name_native, 0))) {
      this.Init();
      return this.OpenReal(P(group_name_native, 0));
    }
    if (do_create) {
      let temp = new $.CStdFile().init();
      if (temp.Create(P(group_name_native, 0), false)) {
        temp.Close$ppStdBuf();
        this.Init();
        this.p.SourceType = 1 /*ST_Packed*/;
        this.p.Modified = true;
        this.p.FileName.assign(P(group_name_native, 0));
        return true;
      }
    }
    const group_name_real = new Int8Array(255);
    $.SCopy$pi8$pi8$u64(P(group_name_native, 0), P(group_name_real, 0), 255);
    do {
      if (!$.TruncatePath(P(group_name_real, 0))) {
        return this.Error_($.FormatString(S("Open(\"%s\"): File not found"), P(group_name_native, 0)).getData());
      }
    } while (!$.FileExists(P(group_name_real, 0)));
    let mother = new C4Group().init();
    mother.SetStdOutput(this.p.LogToStdOutput);
    if (!mother.Open(P(group_name_real, 0))) {
      this.Clear();
      this.Error_(mother.GetError());
      $delete(mother);
      return false;
    }
    if (!this.OpenAsChild(mother, $padd($padd(P(group_name_native, 0), $.SLen(P(group_name_real, 0))), 1), true)) {
      this.Clear();
      return false;
    }
    return true;
  }

  Close$v() {
    let rewrite = false;
    if (this.p.SourceType === 0) {
      return false;
    }
    if (this.p.SourceType === 2) {
      this.CloseExclusiveMother();
      this.Clear();
      return true;
    }
    for (let entry = this.p.FirstEntry; entry != null; entry = entry.Next) {
      if (entry.Status !== 0) {
        rewrite = true;
      }
    }
    if (this.p.Modified) {
      rewrite = true;
    }
    if (!rewrite) {
      this.CloseExclusiveMother();
      this.Clear();
      return true;
    }
    if (this.p.LogToStdOutput) {
      c$printf(S("Writing group file...\n"));
    }
    this.Head.Ver1 = 1;
    this.Head.Ver2 = 2;
    this.SortByList($.C4Group_SortList);
    let success = this.Save(false);
    this.CloseExclusiveMother();
    this.Clear();
    return !!success;
  }

  Save(reopen) {
    const temp_filename = new Int8Array(256);
    const group_filename = new Int8Array(256);
    let contents_size = 0;
    let save_core = $oat($oarr($u64n(this.Head.Entries), () => new C4GroupEntryCore()), 0);
    let core_index = 0;
    for (let entry = this.p.FirstEntry; entry != null; entry = entry.Next) {
      if (entry.Status !== 3) {
        $oidx(save_core, core_index).$assign(entry.$clone());
        $oidx(save_core, core_index).Offset = contents_size;
        contents_size = contents_size + entry.Size | 0;
        core_index = core_index + 1 | 0;
      }
    }
    let hold_in_memory = !reopen && this.p.Mother != null && contents_size < 0xa00000;
    if (!hold_in_memory) {
      $.SCopy$pi8$pi8$u64(this.GetName(), P(group_filename, 0), 255);
      if ($.C4Group_TempPath[0] !== 0) {
        $.SCopy$pi8$pi8$u64(P($.C4Group_TempPath, 0), P(temp_filename, 0), 255);
        $.SAppend($.GetFilename(this.GetName()), P(temp_filename, 0), 255);
      } else {
        $.SCopy$pi8$pi8$u64(this.GetName(), P(temp_filename, 0), 255);
      }
      $.MakeTempFilename$pi8(P(temp_filename, 0));
      if ($.SEqual(P(temp_filename, 0), P(group_filename, 0))) {
        $.SAppend(S(".tmp"), P(temp_filename, 0));
        $.MakeTempFilename$pi8(P(temp_filename, 0));
      }
    }
    let temp_file = new $.CStdFile().init();
    if (!temp_file.Create(P(temp_filename, 0), true, false, hold_in_memory)) {
      $delete(save_core);
      return this.Error_(S("Close: ..."));
    }
    let header_buffer = this.Head.$clone();
    MemScramble($bytesView(header_buffer, [["Id", 0, "i8", 28], ["Ver1", 28, "i32", 0], ["Ver2", 32, "i32", 0], ["Entries", 36, "i32", 0], ["Reserved", 40, "i8", 164]], 204), 204);
    if (!temp_file.Write($bytesView(header_buffer, [["Id", 0, "i8", 28], ["Ver1", 28, "i32", 0], ["Ver2", 32, "i32", 0], ["Entries", 36, "i32", 0], ["Reserved", 40, "i8", 164]], 204), 204) || !temp_file.Write($bytesView(save_core, [["FileName", 0, "i8", 260], ["Packed", 260, "i32", 0], ["ChildGroup", 264, "i32", 0], ["Size", 268, "i32", 0], ["Offset", 272, "i32", 0], ["Reserved1", 276, "i32", 0], ["Reserved2", 280, "i32", 0], ["Reserved3", 284, "i8", 0], ["Reserved4", 285, "u32", 0], ["Executable", 289, "i8", 0], ["Buffer", 290, "u8", 26]], 316), $u64n(this.Head.Entries) * 316 | 0)) {
      temp_file.Close$ppStdBuf();
      $delete(save_core);
      return this.Error_(S("Close: ..."));
    }
    $delete(save_core);
    let total_size = 0;
    for (let entry = this.p.FirstEntry; entry != null; entry = entry.Next) {
      total_size = total_size + entry.Size | 0;
    }
    let size_done = 0;
    for (let entry = this.p.FirstEntry; entry != null; entry = entry.Next) {
      if (this.AppendEntry2StdFile(entry, temp_file)) {
        size_done = size_done + entry.Size | 0;
        if (total_size !== 0 && this.p.ProcessCallback != null) {
          this.p.ProcessCallback(P(entry.FileName, 0), Math.imul(100, size_done) / total_size | 0);
        }
      } else {
        temp_file.Close$ppStdBuf();
        return false;
      }
    }
    const buffer = [null];
    temp_file.Close$ppStdBuf(hold_in_memory ? P(buffer, 0) : null);
    if (this.p.Mother != null) {
      if (hold_in_memory) {
        if (!this.p.Mother.Add$pi8$rStdBuf$b$b$b($.GetFilename(this.GetName()), buffer[0], true, true)) {
          $delete(buffer[0]);
          this.CloseExclusiveMother();
          this.Clear();
          return this.Error_(S("Close: Cannot move rewritten child data to mother"));
        }
        $delete(buffer[0]);
      } else {
        if (!this.p.Mother.Move(P(temp_filename, 0), $.GetFilename(this.GetName()))) {
          this.CloseExclusiveMother();
          this.Clear();
          return this.Error_(S("Close: Cannot move rewritten child temp file to mother"));
        }
      }
      this.Clear();
      return true;
    }
    this.Clear();
    if (!$.EraseFile(P(group_filename, 0))) {
      return this.Error_(S("Close: Cannot erase temp file"));
    }
    if (!$.RenameFile(P(temp_filename, 0), P(group_filename, 0))) {
      return this.Error_(S("Close: Cannot rename group file"));
    }
    if (reopen) {
      this.OpenReal(P(group_filename, 0));
    }
    return true;
  }

  OpenAsChild(mother, entry_name, is_exclusive = false, do_create = false) {
    if (mother == null) {
      return this.Error_(S("OpenAsChild: No mother specified"));
    }
    if ($.SCharCount(42, entry_name) !== 0) {
      return this.Error_(S("OpenAsChild: No wildcards allowed"));
    }
    if ($.SCharCount(47, entry_name) !== 0) {
      const mothername = new Int8Array(256);
      $.SCopyUntil$pi8$pi8$i8$i32$i32(entry_name, P(mothername, 0), 47, 255);
      let mother2 = null;
      mother2 = new C4Group().init();
      mother2.SetStdOutput(this.p.LogToStdOutput);
      if (!mother2.OpenAsChild(mother, P(mothername, 0), is_exclusive)) {
        $delete(mother2);
        return this.Error_(S("OpenAsChild: Cannot open mother"));
      }
      return this.OpenAsChild(mother2, $padd($padd(entry_name, $.SLen(P(mothername, 0))), 1), true);
    }
    this.Init();
    this.p.FileName.assign(entry_name);
    this.p.Mother = mother;
    this.p.ExclusiveChild = is_exclusive;
    const path = new Int8Array(256);
    $.SCopy$pi8$pi8$u64(this.GetFullName().getData(), P(path, 0), 255);
    if ($.DirectoryExists(P(path, 0))) {
      this.p.FileName.assign(P(path, 0));
      this.p.SourceType = 2 /*ST_Unpacked*/;
      this.ResetSearch();
      return true;
    }
    let centry = null;
    if ((centry = this.p.Mother.GetEntry(this.GetName())) != null) {
      this.p.FileName.assign(P(centry.FileName, 0));
    }
    const size = [0];
    if (!this.p.Mother.AccessEntry(this.GetName(), P(size, 0), null, true)) {
      if (!do_create) {
        this.CloseExclusiveMother();
        this.Clear();
        return this.Error_(S("OpenAsChild: Entry not in mother group"));
      } else {
        this.p.SourceType = 1 /*ST_Packed*/;
        this.p.Modified = true;
        return true;
      }
    }
    if (centry != null && centry.ChildGroup === 0) {
      this.CloseExclusiveMother();
      this.Clear();
      return this.Error_(S("OpenAsChild: Is not a child group"));
    }
    if (size[0] < 204 && centry != null) {
      this.CloseExclusiveMother();
      this.Clear();
      return this.Error_(S("OpenAsChild: Entry too small"));
    }
    if (!this.p.Mother.Read$px$u64($bytesView(this.Head, [["Id", 0, "i8", 28], ["Ver1", 28, "i32", 0], ["Ver2", 32, "i32", 0], ["Entries", 36, "i32", 0], ["Reserved", 40, "i8", 164]], 204), 204)) {
      this.CloseExclusiveMother();
      this.Clear();
      return this.Error_(S("OpenAsChild: Entry reading error"));
    }
    MemScramble($bytesView(this.Head, [["Id", 0, "i8", 28], ["Ver1", 28, "i32", 0], ["Ver2", 32, "i32", 0], ["Entries", 36, "i32", 0], ["Reserved", 40, "i8", 164]], 204), 204);
    this.p.EntryOffset = $u64n(this.p.EntryOffset) + 204 | 0;
    if (!$.SEqual(P(this.Head.Id, 0), S("RedWolf Design GrpFolder")) || this.Head.Ver1 !== 1 || this.Head.Ver2 > 2) {
      this.CloseExclusiveMother();
      this.Clear();
      return this.Error_(S("OpenAsChild: Invalid Header"));
    }
    let buffer = new C4GroupEntryCore();
    let file_entries = this.Head.Entries;
    this.Head.Entries = 0;
    for (let cnt = 0; cnt < file_entries; cnt = cnt + 1 | 0) {
      if (!this.p.Mother.Read$px$u64($bytesView(buffer, [["FileName", 0, "i8", 260], ["Packed", 260, "i32", 0], ["ChildGroup", 264, "i32", 0], ["Size", 268, "i32", 0], ["Offset", 272, "i32", 0], ["Reserved1", 276, "i32", 0], ["Reserved2", 280, "i32", 0], ["Reserved3", 284, "i8", 0], ["Reserved4", 285, "u32", 0], ["Executable", 289, "i8", 0], ["Buffer", 290, "u8", 26]], 316), 316)) {
        this.CloseExclusiveMother();
        this.Clear();
        return this.Error_(S("OpenAsChild: Entry reading error"));
      }
      this.p.EntryOffset = $u64n(this.p.EntryOffset) + 316 | 0;
      if (!this.AddEntry(0 /*C4GRES_InGroup*/, !(buffer.ChildGroup === 0), P(buffer.FileName, 0), buffer.Size, null, null, false, false, !(buffer.Executable === 0))) {
        this.CloseExclusiveMother();
        this.Clear();
        return this.Error_(S("OpenAsChild: Insufficient memory"));
      }
    }
    this.ResetSearch();
    this.p.SourceType = 1 /*ST_Packed*/;
    if (centry != null) {
      this.p.MotherOffset = centry.Offset;
    }
    return true;
  }

  OpenChild(entry_name) {
    this.p.FolderSearch.Reset$v();
    let ourselves = new C4Group().init();
    ourselves.p.$assign(this.p);
    let child = new C4Group().init();
    if (!child.OpenAsChild(ourselves, entry_name, false)) {
      ourselves.p = null;
      $delete(ourselves);
      return false;
    }
    this.p.FolderSearch.Reset$v();
    child.p.FolderSearch.Reset$v();
    this.p.$assign(child.p);
    for (let group = this; group !== ourselves; group = group.p.Mother) {
      group.p.ExclusiveChild = true;
    }
    child.p = null;
    return true;
  }

  OpenMother() {
    if (this.p.Mother == null || !this.p.ExclusiveChild) {
      return false;
    }
    let mother = this.p.Mother;
    this.p.ExclusiveChild = false;
    this.Clear();
    mother.p.FolderSearch.Reset$v();
    this.p.FolderSearch.Reset$v();
    this.op_assign(mother);
    $delete(mother);
    return true;
  }

  Add$pi8$pi8(filename, entry_name) {
    let move = false;
    if (this.p.LogToStdOutput) {
      c$printf(S("%s %s as %s...\n"), P(move ? S("Moving") : S("Adding"), 0), $.GetFilename(filename), entry_name);
    }
    return this.AddEntryOnDisk(filename, entry_name, move);
  }

  Add$pi8$px$i32$b$b$b(entry_name, buffer, size, add_as_child = false, hold_buffer = false, is_executable = false) {
    return this.AddEntry(2 /*C4GRES_InMemory*/, add_as_child, entry_name, size, entry_name, $reinterpVoid(buffer, "u8"), false, hold_buffer, is_executable);
  }

  Add$pi8$rStdBuf$b$b$b(entry_name, buffer, add_as_child = false, hold_buffer = false, is_executable = false) {
    if (!this.AddEntry(2 /*C4GRES_InMemory*/, add_as_child, entry_name, $i64n($.StdBuf.prototype.getSize.call(buffer)), entry_name, $reinterpVoid($.StdBuf.prototype.getMData.call(buffer), "u8"), false, hold_buffer, is_executable, true)) {
      return false;
    }
    if (hold_buffer) {
      $.StdBuf.prototype.GrabPointer.call(buffer);
    }
    return true;
  }

  Add$pi8$rStdStrBuf$b$b$b(entry_name, buffer, add_as_child = false, hold_buffer = false, is_executable = false) {
    if (!this.AddEntry(2 /*C4GRES_InMemory*/, add_as_child, entry_name, $i64n(buffer.getLength()), entry_name, $view8(buffer.getMData(), false), false, hold_buffer, is_executable, true)) {
      return false;
    }
    if (hold_buffer) {
      buffer.GrabPointer();
    }
    return true;
  }

  Merge(folders) {
    let move = true;
    if (this.p.LogToStdOutput) {
      c$printf(S("%s...\n"), P(move ? S("Moving") : S("Adding"), 0));
    }
    const szFileName = new Int8Array(256);
    let iFileCount = 0;
    let i = new $.DirectoryIterator().init$v();
    let cSeparator = $.SCharCount(59, folders) !== 0 ? 59 : 124;
    for (let cseg = 0; $.SCopySegment(folders, cseg, P(szFileName, 0), cSeparator); cseg = cseg + 1 | 0) {
      i.Reset$pi8$b(P(szFileName, 0));
      while (i.op_mul() != null) {
        iFileCount = iFileCount + 1 | 0;
        if (this.p.LogToStdOutput) {
          c$printf(S("%s\n"), $.GetFilename(i.op_mul()));
        }
        if (this.p.ProcessCallback != null) {
          this.p.ProcessCallback($.GetFilename(i.op_mul()), 0);
        }
        this.AddEntryOnDisk(i.op_mul(), null, move);
        i.op_inc$v();
      }
    }
    if (this.p.LogToStdOutput) {
      c$printf(S("%d file(s) %s.\n"), iFileCount, P(move ? S("moved") : S("added"), 0));
    }
    return true;
  }

  Move(filename, entry_name) {
    let move = true;
    if (this.p.LogToStdOutput) {
      c$printf(S("%s %s as %s...\n"), P(move ? S("Moving") : S("Adding"), 0), $.GetFilename(filename), entry_name);
    }
    return this.AddEntryOnDisk(filename, entry_name, move);
  }

  Extract(files, destination = null, exclude = null) {
    if (this.p.LogToStdOutput) {
      c$printf(S("Extracting"));
      if (destination != null) {
        c$printf(S(" to %s"), destination);
      }
      c$printf(S("...\n"));
    }
    let filecount = 0;
    let current_bytes = 0;
    let total_bytes = this.EntrySize() | 0;
    let entry = null;
    let separator = $.SCharCount(59, files) !== 0 ? 59 : 124;
    const filename = new Int8Array(4097);
    for (let segment_index = 0; $.SCopySegment(files, segment_index, P(filename, 0), separator); segment_index = segment_index + 1 | 0) {
      this.ResetSearch();
      while ((entry = this.SearchNextEntry(P(filename, 0))) != null) {
        if (C4Group_IsExcluded(P(entry.FileName, 0), exclude)) {
          continue;
        }
        if (this.p.LogToStdOutput) {
          c$printf(S("%s\n"), P(entry.FileName, 0));
        }
        current_bytes = current_bytes + entry.Size | 0;
        if (this.p.ProcessCallback != null) {
          this.p.ProcessCallback(P(entry.FileName, 0), Math.imul(100, current_bytes) / $max(total_bytes, 1) | 0);
        }
        if (!this.ExtractEntry(P(entry.FileName, 0), destination)) {
          return this.Error_(S("Extract: Could not extract entry"));
        }
        filecount = filecount + 1 | 0;
      }
    }
    if (this.p.LogToStdOutput) {
      c$printf(S("%d file(s) extracted.\n"), filecount);
    }
    return true;
  }

  ExtractEntry(filename, destination = null) {
    let temp_file = new $.CStdFile().init();
    let dummy = new $.CStdFile().init();
    const temp_file_name = new Int8Array(256);
    const target_file_name = new Int8Array(256);
    if (destination != null) {
      $.SCopy$pi8$pi8$u64(destination, P(target_file_name, 0), 254);
      if ($.DirectoryExists(P(target_file_name, 0))) {
        $.AppendBackslash(P(target_file_name, 0));
        $.SAppend(filename, P(target_file_name, 0), 255);
      }
    } else {
      $.SCopy$pi8$pi8$u64(filename, P(target_file_name, 0), 255);
    }
    switch (this.p.SourceType) {
      case 1:
        let entry = null;
        if (!((entry = this.GetEntry(filename)) != null)) {
          return this.Error_(S("Extract: Entry not found"));
        }
        dummy.Create(P(target_file_name, 0), false);
        dummy.Write(S("Dummy"), 5);
        dummy.Close$ppStdBuf();
        $.SCopy$pi8$pi8$u64(P(target_file_name, 0), P(temp_file_name, 0), 255);
        $.MakeTempFilename$pi8(P(temp_file_name, 0));
        if (!temp_file.Create(P(temp_file_name, 0), !(entry.ChildGroup === 0), !(entry.Executable === 0))) {
          return this.Error_(S("Extract: Cannot create target file"));
        }
        if (!this.AppendEntry2StdFile(entry, temp_file)) {
          temp_file.Close$ppStdBuf();
          $.EraseItem(P(temp_file_name, 0));
          $.EraseItem(P(target_file_name, 0));
          return false;
        }
        temp_file.Close$ppStdBuf();
        if (!$.EraseItem(P(target_file_name, 0))) {
          return this.Error_(S("Extract: Cannot erase temporary file"));
        }
        if (!$.RenameItem(P(temp_file_name, 0), P(target_file_name, 0))) {
          return this.Error_(S("Extract: Cannot rename temporary file"));
        }
        break;
      case 2:
        const path = new Int8Array(256);
        $.ssprintf$7(path, S("%s%c%s"), this.GetName(), 47, filename);
        if (!$.CopyItem(P(path, 0), P(target_file_name, 0))) {
          return this.Error_(S("ExtractEntry: Cannot copy item"));
        }
        break;
    }
    return true;
  }

  Delete(files, recursive = false) {
    let fcount = 0;
    let tentry = null;
    if ($.SCharCount(59, files) !== 0 || $.SCharCount(124, files) !== 0) {
      let cSeparator = $.SCharCount(59, files) !== 0 ? 59 : 124;
      let success = true;
      const filespec = new Int8Array(256);
      for (let cseg = 0; $.SCopySegment(files, cseg, P(filespec, 0), cSeparator, 255); cseg = cseg + 1 | 0) {
        if (!this.Delete(P(filespec, 0), recursive)) {
          success = false;
        }
      }
      return success;
    }
    this.ResetSearch();
    while ((tentry = this.SearchNextEntry(files)) != null) {
      if (this.p.LogToStdOutput) {
        c$printf(S("%s\n"), P(tentry.FileName, 0));
      }
      if (!this.DeleteEntry(P(tentry.FileName, 0))) {
        return this.Error_(S("Delete: Could not delete entry"));
      }
      fcount = fcount + 1 | 0;
    }
    if (recursive) {
      let hChild = new C4Group().init();
      this.ResetSearch();
      while ((tentry = this.SearchNextEntry(S("*"))) != null) {
        if (tentry.ChildGroup !== 0) {
          if (hChild.OpenAsChild(this, P(tentry.FileName, 0))) {
            hChild.SetStdOutput(this.p.LogToStdOutput);
            hChild.Delete(files, recursive);
            hChild.Close$v();
          }
        }
      }
    }
    if (this.p.LogToStdOutput) {
      c$printf(S("%d file(s) deleted.\n"), fcount);
    }
    return true;
  }

  DeleteEntry(filename, do_recycle = false) {
    switch (this.p.SourceType) {
      case 1:
        let pEntry = null;
        if (!((pEntry = this.GetEntry(filename)) != null)) {
          return false;
        }
        if (pEntry.Status === 1) {
          if (pEntry.DeleteOnDisk) {
            $.EraseItem(P(pEntry.DiskPath, 0));
          }
        }
        pEntry.Status = 3 /*C4GRES_Deleted*/;
        this.Head.Entries = this.Head.Entries - 1 | 0;
        break;
      case 2:
        this.p.StdFile.Close$ppStdBuf();
        const path = new Int8Array(256);
        $.ssprintf$7(path, S("%s%c%s"), this.GetName(), 47, filename);
        if (do_recycle) {
          if (!$.EraseItemSafe(P(path, 0))) {
            return false;
          }
        } else {
          if (!$.EraseItem(P(path, 0))) {
            return false;
          }
        }
        this.ResetSearch(true);
        break;
      default:
        break;
    }
    return true;
  }

  Rename(filename, new_name) {
    if (this.p.LogToStdOutput) {
      c$printf(S("Renaming %s to %s...\n"), filename, new_name);
    }
    switch (this.p.SourceType) {
      case 1:
        let pEntry = null;
        if (!((pEntry = this.GetEntry(filename)) != null)) {
          return this.Error_(S("Rename: File not found"));
        }
        if (this.GetEntry(new_name) != null && !$.SEqualNoCase(new_name, filename)) {
          return this.Error_(S("Rename: File exists already"));
        }
        $.SCopy$pi8$pi8$u64(new_name, P(pEntry.FileName, 0), 255);
        this.p.Modified = true;
        break;
      case 2:
        this.p.StdFile.Close$ppStdBuf();
        const path = new Int8Array(256);
        $.SCopy$pi8$pi8$u64(this.GetName(), P(path, 0), 4095);
        $.AppendBackslash(P(path, 0));
        $.SAppend(filename, P(path, 0), 4096);
        const path2 = new Int8Array(256);
        $.SCopy$pi8$pi8$u64(this.GetName(), P(path2, 0), 4095);
        $.AppendBackslash(P(path2, 0));
        $.SAppend(new_name, P(path2, 0), 4096);
        if (!$.RenameFile(P(path, 0), P(path2, 0))) {
          return this.Error_(S("Rename: Failure"));
        }
        this.ResetSearch(true);
        break;
      default:
        break;
    }
    return true;
  }

  Sort(list) {
    let bubble = false;
    let current = null;
    let prev = null;
    let next = null;
    let nextnext = null;
    if (list == null || list.a[list.o + 0] === 0) {
      return false;
    }
    if (this.p.LogToStdOutput) {
      c$printf(S("Sorting...\n"));
    }
    do {
      bubble = false;
      for (prev = null, current = this.p.FirstEntry; current != null; prev = current, current = next) {
        if ((next = current.Next) != null) {
          let rank_a = SortRank(P(current.FileName, 0), list);
          let rank_b = SortRank(P(next.FileName, 0), list);
          if (rank_a > rank_b) {
            continue;
          }
          if (rank_a === rank_b) {
            if ($.stricmp(P(current.FileName, 0), P(next.FileName, 0)) <= 0) {
              continue;
            }
          }
          nextnext = next.Next;
          if (prev != null) {
            prev.Next = next;
          } else {
            this.p.FirstEntry = next;
          }
          next.Next = current;
          current.Next = nextnext;
          next = nextnext;
          bubble = true;
          this.p.Modified = true;
        }
      }
    } while (bubble);
    return true;
  }

  SortByList(list, filename = null) {
    if (list == null) {
      return false;
    }
    if (filename == null) {
      filename = this.GetName();
    }
    filename = $.GetFilename(filename);
    let list_entry = null;
    for (list_entry = list; list_entry.a[list_entry.o] != null; list_entry = list_entry.add(2)) {
      if ($.WildcardMatch(list_entry.a[list_entry.o], filename)) {
        break;
      }
    }
    if (list_entry.a[list_entry.o] != null && $rd($padd(list_entry, 1)) != null) {
      this.Sort($rd($padd(list_entry, 1)));
    }
    return true;
  }

  AccessEntry(wildcard, size = null, filename = null, needs_to_be_a_group = false) {
    let fname = new $.StdStrBuf();
    if (!this.FindEntry$pi8$pStdStrBuf$pu64(wildcard, fname, P(this.p, "iCurrFileSize"))) {
      return false;
    }
    let okay = this.SetFilePtr2Entry(fname.getData(), needs_to_be_a_group);
    if (!okay) {
      return false;
    }
    if (filename != null) {
      $.SCopy$pi8$pi8(fname.getData(), filename);
    }
    if (size != null) {
      size.a[size.o] = this.p.iCurrFileSize;
    }
    return true;
  }

  AccessNextEntry(wildcard, size = null, filename = null, start_at_filename = false) {
    const entry_name = new Int8Array(256);
    if (!this.FindNextEntry$pi8$pi8$pu64$b(wildcard, P(entry_name, 0), P(this.p, "iCurrFileSize"), start_at_filename)) {
      return false;
    }
    let okay = this.SetFilePtr2Entry(P(entry_name, 0));
    if (!okay) {
      return false;
    }
    if (filename != null) {
      $.SCopy$pi8$pi8(P(entry_name, 0), filename);
    }
    if (size != null) {
      size.a[size.o] = this.p.iCurrFileSize;
    }
    return true;
  }

  LoadEntry$pi8$ppi8$pu64$i32(entry_name, buffer, size_info = null, zeros_to_append = 0) {
    const size = [0];
    buffer.a[buffer.o] = null;
    if (size_info != null) {
      size_info.a[size_info.o] = 0;
    }
    if (!this.AccessEntry(entry_name, P(size, 0))) {
      return this.Error_(S("LoadEntry: Not found"));
    }
    buffer.a[buffer.o] = P(new Int8Array(size[0] + $u64n(zeros_to_append)), 0);
    if (!this.Read$px$u64(buffer.a[buffer.o], size[0])) {
      $delete(buffer.a[buffer.o]);
      buffer.a[buffer.o] = null;
      return this.Error_(S("LoadEntry: Reading error"));
    }
    if (size_info != null) {
      size_info.a[size_info.o] = size[0];
    }
    if (zeros_to_append !== 0) {
      $.ZeroMem$pi8$u64($padd(buffer.a[buffer.o], size[0]), $u64n(zeros_to_append));
    }
    return true;
  }

  LoadEntry$pi8$pStdBuf(entry_name, buffer) {
    const size = [0];
    if (!this.AccessEntry(entry_name, P(size, 0))) {
      return this.Error_(S("LoadEntry: Not found"));
    }
    buffer.New(size[0]);
    if (!this.Read$px$u64($.StdBuf.prototype.getMData.call(buffer), size[0])) {
      $.StdBuf.prototype.Clear.call(buffer);
      return this.Error_(S("LoadEntry: Reading error"));
    }
    return true;
  }

  LoadEntry$StdStrBuf$pStdBuf(name, buffer) {
    return this.LoadEntry$pi8$pStdBuf(name.getData(), buffer);
  }

  LoadEntryString$pi8$pStdStrBuf(entry_name, buffer) {
    const size = [0];
    if (!this.AccessEntry(entry_name, P(size, 0))) {
      return this.Error_(S("LoadEntry: Not found"));
    }
    buffer.SetLength(size[0]);
    if (size[0] === 0) {
      return false;
    }
    if (!this.Read$px$u64(buffer.getMData(), size[0])) {
      buffer.Clear();
      return this.Error_(S("LoadEntry: Reading error"));
    }
    return true;
  }

  LoadEntryString$StdStrBuf$pStdStrBuf(name, buffer) {
    return this.LoadEntryString$pi8$pStdStrBuf(name.getData(), buffer);
  }

  FindEntry$pi8$pStdStrBuf$pu64(wildcard, filename = null, size = null) {
    this.ResetSearch();
    return this.FindNextEntry$pi8$pStdStrBuf$pu64$b(wildcard, filename, size);
  }

  FindEntry$pi8$pi8(wildcard, filename) {
    let name = new $.StdStrBuf();
    let found_entry = this.FindEntry$pi8$pStdStrBuf$pu64(wildcard, name);
    if (filename != null) {
      $.SCopy$pi8$pi8(name.getData(), filename);
    }
    return found_entry;
  }

  FindNextEntry$pi8$pStdStrBuf$pu64$b(wildcard, filename = null, size = null, start_at_filename = false) {
    if (wildcard == null) {
      return false;
    }
    if (start_at_filename) {
      this.FindEntry$pi8$pStdStrBuf$pu64(filename.getData());
    }
    let entry = null;
    if (!((entry = this.SearchNextEntry(wildcard)) != null)) {
      return false;
    }
    if (filename != null) {
      filename.Copy$pi8(P(entry.FileName, 0));
    }
    if (size != null) {
      size.a[size.o] = $u64n(entry.Size);
    }
    return true;
  }

  FindNextEntry$pi8$pi8$pu64$b(wildcard, filename, size = null, start_at_filename = false) {
    let name = new $.StdStrBuf().init$pi8$b(start_at_filename ? filename : S(""));
    let found_entry = this.FindNextEntry$pi8$pStdStrBuf$pu64$b(wildcard, name, size, start_at_filename);
    if (found_entry && filename != null) {
      $.SCopy$pi8$pi8(name.getData(), filename);
    }
    return found_entry;
  }

  Read$px$u64(buffer, size) {
    if (this.p.pInMemEntry != null) {
      if (this.p.iInMemEntrySize < size) {
        return this.Error_(S("ReadCached:"));
      }
      c$memcpy(buffer, this.p.pInMemEntry, size);
      this.p.iInMemEntrySize = this.p.iInMemEntrySize - size;
      this.p.pInMemEntry = this.p.pInMemEntry.add(size);
      return true;
    }
    switch (this.p.SourceType) {
      case 1:
        if (this.p.Mother != null) {
          if (!this.p.Mother.Read$px$u64(buffer, size)) {
            this.RewindFilePtr();
            return this.Error_(S("Read:"));
          }
        } else {
          if (!this.p.StdFile.Read$px$u64(buffer, size)) {
            this.RewindFilePtr();
            return this.Error_(S("Read:"));
          }
        }
        this.p.FilePtr = $u64n(this.p.FilePtr) + size | 0;
        break;
      case 2:
        if (!this.p.StdFile.Read$px$u64(buffer, size)) {
          return this.Error_(S("Read: Error reading from folder contents"));
        }
        break;
      default:
        break;
    }
    return true;
  }

  Advance(offset) {
    0;
    if (this.p.pInMemEntry != null) {
      if (this.p.iInMemEntrySize < $u64n(offset)) {
        return false;
      }
      this.p.iInMemEntrySize = this.p.iInMemEntrySize - $u64n(offset);
      this.p.pInMemEntry = this.p.pInMemEntry.add(offset);
      return true;
    }
    if (this.p.SourceType === 2) {
      return !!this.p.StdFile.Advance(offset);
    }
    const buf = [0];
    for (; offset > 0; offset = offset - 1 | 0) {
      if (!this.Read$px$u64(P(buf, 0), 1)) {
        return false;
      }
    }
    return true;
  }

  SetStdOutput(log_status) {
    this.p.LogToStdOutput = log_status;
  }

  ResetSearch(reload_contents = false) {
    switch (this.p.SourceType) {
      case 2:
        this.p.SearchPtr = null;
        this.p.FolderSearch.Reset$pi8$b(this.GetName(), reload_contents);
        if (this.p.FolderSearch.op_mul() != null) {
          this.p.FolderSearchEntry.Set(this.p.FolderSearch, this.GetName());
          this.p.SearchPtr = this.p.FolderSearchEntry;
        }
        break;
      case 1:
        this.p.SearchPtr = this.p.FirstEntry;
        break;
      default:
        break;
    }
  }

  GetError() {
    return this.p.ErrorString.c_str();
  }

  GetName() {
    return this.p.FileName.c_str();
  }

  GetFullName() {
    const name = new Int8Array(4097);
    $wr(P(name, 0), 0, 0);
    const sep = $cs(S("/"), 2);
    sep[0] = 47;
    for (let pGroup = this; pGroup != null; pGroup = pGroup.p.Mother) {
      if ($rd(P(name, 0)) !== 0) {
        $.SInsert(P(name, 0), P(sep, 0), 0, 4096);
      }
      if (pGroup === this || pGroup.p.FileName.length() > 1 || pGroup.p.FileName.d[0] !== 47) {
        $.SInsert(P(name, 0), pGroup.GetName(), 0, 4096);
      }
      if (pGroup.p.SourceType === 2) {
        break;
      }
    }
    let result = new $.StdStrBuf();
    result.Copy$pi8(P(name, 0));
    return result;
  }

  EntryCount(wildcard = null) {
    if (wildcard == null) {
      wildcard = S("*");
    }
    this.ResetSearch();
    let filecount = 0;
    let entry = null;
    while ((entry = this.SearchNextEntry(wildcard)) != null) {
      filecount = filecount + 1 | 0;
    }
    return filecount;
  }

  EntrySize(wildcard = null) {
    if (wildcard == null) {
      wildcard = S("*");
    }
    this.ResetSearch();
    let filesize = 0;
    let entry = null;
    while ((entry = this.SearchNextEntry(wildcard)) != null) {
      filesize = filesize + entry.Size | 0;
    }
    return $u64n(filesize);
  }

  AccessedEntrySize() {
    return this.p.iCurrFileSize;
  }

  EntryCRC32(wildcard = null) {
    if (wildcard == null) {
      wildcard = S("*");
    }
    this.ResetSearch();
    let CRC = 0;
    let entry = null;
    while ((entry = this.SearchNextEntry(wildcard)) != null) {
      CRC = (CRC ^ this.CalcCRC32(entry)) >>> 0;
    }
    return CRC;
  }

  IsOpen() {
    return this.p.SourceType !== 0;
  }

  GetMother() {
    return this.p.Mother;
  }

  IsPacked() {
    return this.p.SourceType === 1;
  }

  HasPackedMother() {
    if (this.p.Mother == null) {
      return false;
    }
    return this.p.Mother.IsPacked();
  }

  SetNoSort(no_sorting) {
    this.p.NoSort = no_sorting;
    return true;
  }

  PreCacheEntries(search_pattern, cache_previous = false) {
    0;
    let result = 0;
    for (let entry = this.p.FirstEntry; entry != null; entry = entry.Next) {
      if (!$.WildcardListMatch(search_pattern, P(entry.FileName, 0))) {
        continue;
      }
      if (cache_previous && this.p.SourceType === 1) {
        for (let e_pre = this.p.FirstEntry; e_pre !== entry; e_pre = e_pre.Next) {
          if (e_pre.Offset >= this.p.FilePtr) {
            this.PreCacheEntry(e_pre);
          }
        }
      }
      this.PreCacheEntry(entry);
    }
    return result;
  }

  GetHeader() {
    return this.Head;
  }

  GetFirstEntry() {
    return this.p.FirstEntry;
  }

  Init() {
    let new_p = new C4Group$P_c4group_C4Group().None();
    new_p.ProcessCallback = this.p.ProcessCallback;
    new_p.NoSort = this.p.NoSort;
    new_p.LogToStdOutput = this.p.LogToStdOutput;
    $.InplaceReconstruct$pC4GroupHeader(this.Head);
    (this.p = new_p, new_p = null);
  }

  EnsureChildFilePtr(child) {
    if (this.p.SourceType === 1) {
      if (this.p.FilePtr !== ((child.p.MotherOffset + child.p.EntryOffset | 0) + child.p.FilePtr | 0)) {
        if (!this.SetFilePtr((child.p.MotherOffset + child.p.EntryOffset | 0) + child.p.FilePtr | 0)) {
          return false;
        }
      }
      return true;
    }
    const child_path = new Int8Array(4097);
    $.ssprintf$13(child_path, S("%s%c%s"), this.GetName(), 47, $.GetFilename(child.GetName()));
    if (!$.ItemIdentical(P(this.p.StdFile.Name, 0), P(child_path, 0))) {
      if (!this.SetFilePtr2Entry($.GetFilename(child.GetName()), true)) {
        return false;
      }
      if (!this.AdvanceFilePtr(child.p.EntryOffset + child.p.FilePtr | 0)) {
        return false;
      }
    }
    return true;
  }

  CloseExclusiveMother() {
    if (this.p.Mother != null && this.p.ExclusiveChild) {
      this.p.Mother.Close$v();
      $delete(this.p.Mother);
      this.p.Mother = null;
      return true;
    }
    return false;
  }

  Error_(status_message) {
    this.p.ErrorString.assign(status_message);
    return false;
  }

  OpenReal(filename) {
    if (filename == null) {
      return false;
    }
    this.p.FileName.assign(filename);
    if ($.DirectoryExists(this.GetName())) {
      if (C4Group_TestIgnore(filename)) {
        return this.Error_($.FormatString(S("OpenReal: filename '%s' ignored"), filename).getData());
      }
      this.p.SourceType = 2 /*ST_Unpacked*/;
      this.ResetSearch();
      return true;
    }
    if (this.OpenRealGrpFile()) {
      this.p.SourceType = 1 /*ST_Packed*/;
      this.ResetSearch();
      return true;
    } else {
      return false;
    }
    return this.Error_(S("OpenReal: Not a valid group"));
  }

  OpenRealGrpFile() {
    if (!this.p.StdFile.Open(this.GetName(), true)) {
      return this.Error_(S("OpenRealGrpFile: Cannot open standard file"));
    }
    if (!this.p.StdFile.Read$px$u64($bytesView(this.Head, [["Id", 0, "i8", 28], ["Ver1", 28, "i32", 0], ["Ver2", 32, "i32", 0], ["Entries", 36, "i32", 0], ["Reserved", 40, "i8", 164]], 204), 204)) {
      return this.Error_(S("OpenRealGrpFile: Error reading header"));
    }
    MemScramble($bytesView(this.Head, [["Id", 0, "i8", 28], ["Ver1", 28, "i32", 0], ["Ver2", 32, "i32", 0], ["Entries", 36, "i32", 0], ["Reserved", 40, "i8", 164]], 204), 204);
    this.p.EntryOffset = $u64n(this.p.EntryOffset) + 204 | 0;
    if (!$.SEqual(P(this.Head.Id, 0), S("RedWolf Design GrpFolder")) || this.Head.Ver1 !== 1 || this.Head.Ver2 > 2) {
      return this.Error_(S("OpenRealGrpFile: Invalid header"));
    }
    let file_entries = this.Head.Entries;
    this.Head.Entries = 0;
    let corebuf = new C4GroupEntryCore();
    for (let cnt = 0; cnt < file_entries; cnt = cnt + 1 | 0) {
      if (!this.p.StdFile.Read$px$u64($bytesView(corebuf, [["FileName", 0, "i8", 260], ["Packed", 260, "i32", 0], ["ChildGroup", 264, "i32", 0], ["Size", 268, "i32", 0], ["Offset", 272, "i32", 0], ["Reserved1", 276, "i32", 0], ["Reserved2", 280, "i32", 0], ["Reserved3", 284, "i8", 0], ["Reserved4", 285, "u32", 0], ["Executable", 289, "i8", 0], ["Buffer", 290, "u8", 26]], 316), 316)) {
        return this.Error_(S("OpenRealGrpFile: Error reading entries"));
      }
      let entryname = new $.StdStrBuf().init$pi8$b(P(corebuf.FileName, 0));
      entryname.EnsureUnicode();
      $.ValidateFilename(entryname.getData(), entryname.getLength());
      this.p.EntryOffset = $u64n(this.p.EntryOffset) + 316 | 0;
      if (!this.AddEntry(0 /*C4GRES_InGroup*/, !(corebuf.ChildGroup === 0), P(corebuf.FileName, 0), corebuf.Size, entryname.getData(), null, false, false, !(corebuf.Executable === 0))) {
        return this.Error_(S("OpenRealGrpFile: Cannot add entry"));
      }
    }
    return true;
  }

  SetFilePtr(offset) {
    if (this.p.SourceType === 2) {
      return this.Error_(S("SetFilePtr not implemented for Folders"));
    }
    if (this.p.Mother != null) {
      this.p.Mother.EnsureChildFilePtr(this);
    }
    if (this.p.FilePtr > offset) {
      if (!this.RewindFilePtr()) {
        return false;
      }
    }
    if (this.p.FilePtr < offset) {
      if (!this.AdvanceFilePtr(offset - this.p.FilePtr | 0)) {
        return false;
      }
    }
    return true;
  }

  RewindFilePtr() {
    if (this.p.SourceType === 1 && this.p.Mother != null) {
      if (!this.p.Mother.SetFilePtr2Entry(this.GetName(), true)) {
        return false;
      }
      if (!this.p.Mother.AdvanceFilePtr(this.p.EntryOffset)) {
        return false;
      }
    } else {
      if (!this.p.StdFile.Rewind()) {
        return false;
      }
      if (!this.p.StdFile.Advance(this.p.EntryOffset)) {
        return false;
      }
    }
    this.p.FilePtr = 0;
    return true;
  }

  AdvanceFilePtr(offset) {
    if (this.p.SourceType === 1 && this.p.Mother != null) {
      if (!this.p.Mother.EnsureChildFilePtr(this)) {
        return false;
      }
      if (!this.p.Mother.AdvanceFilePtr(offset)) {
        return false;
      }
    } else if (this.p.SourceType === 1) {
      if (!this.p.StdFile.Advance(offset)) {
        return false;
      }
    } else {
      if (!this.p.StdFile.Advance(offset)) {
        return false;
      }
    }
    this.p.FilePtr = this.p.FilePtr + offset | 0;
    return true;
  }

  AddEntry(status, add_as_child, filename, size, entry_name = null, buffer = null, delete_on_disk = false, hold_buffer = false, is_executable = false, buffer_is_stdbuf = false) {
    if (this.p.SourceType === 2) {
      this.p.StdFile.Close$ppStdBuf();
      const target_folder_name = new Int8Array(255);
      $.SCopy$pi8$pi8$u64(this.GetName(), P(target_folder_name, 0), 255);
      $.AppendBackslash(P(target_folder_name, 0));
      if (entry_name != null) {
        $.SAppend(entry_name, P(target_folder_name, 0));
      } else {
        $.SAppend($.GetFilename(filename), P(target_folder_name, 0));
      }
      switch (status) {
        case 1:
          if (!$.CopyItem(filename, P(target_folder_name, 0))) {
            return false;
          }
          this.ResetSearch(true);
          if (delete_on_disk && !$.EraseItem(filename)) {
            return false;
          }
          return true;
        case 2:
          {
            let file = new $.CStdFile().init();
            let okay = false;
            if (file.Create(P(target_folder_name, 0), !!add_as_child)) {
              okay = !!file.Write(buffer, size | 0);
            }
            file.Close$ppStdBuf();
            this.ResetSearch(true);
            if (hold_buffer) {
              if (buffer_is_stdbuf) {
                $.StdBuf.DeletePointer(buffer);
              } else {
                $delete(buffer);
              }
            }
            return okay;
          }
        default:
          break;
      }
      return this.Error_(S("Add to folder: Invalid request"));
    }
    let next = null;
    let last = null;
    let current = null;
    current = this.GetEntry($.GetFilename(entry_name != null ? entry_name : filename));
    if (current != null) {
      current.Status = 3 /*C4GRES_Deleted*/;
      this.Head.Entries = this.Head.Entries - 1 | 0;
    }
    next = new C4GroupEntry();
    for (last = this.p.FirstEntry; last != null && last.Next != null; last = last.Next) {
    }
    if (entry_name != null) {
      $.SCopy$pi8$pi8$u64(entry_name, P(next.FileName, 0), 255);
    } else {
      $.SCopy$pi8$pi8$u64($.GetFilename(filename), P(next.FileName, 0), 255);
    }
    next.Size = size | 0;
    next.ChildGroup = add_as_child ? 1 : 0;
    next.Offset = 0;
    next.Executable = is_executable ? 1 : 0;
    next.DeleteOnDisk = delete_on_disk;
    next.HoldBuffer = hold_buffer;
    next.BufferIsStdbuf = buffer_is_stdbuf;
    if (last != null) {
      next.Offset = last.Offset + last.Size | 0;
    }
    $.SCopy$pi8$pi8$u64(filename, P(next.DiskPath, 0), 255);
    next.Status = status;
    next.MemoryBuffer = buffer;
    next.Next = null;
    next.NoSort = this.p.NoSort;
    if (last != null) {
      last.Next = next;
    } else {
      this.p.FirstEntry = next;
    }
    this.Head.Entries = this.Head.Entries + 1 | 0;
    return true;
  }

  AddEntryOnDisk(filename, entry_name = null, move = false) {
    if ($.ItemIdentical(filename, this.GetName())) {
      return true;
    }
    if ($.DirectoryExists(filename)) {
      if (C4Group_TestIgnore(filename)) {
        return true;
      }
      const temp_filename = new Int8Array(4097);
      if ($.C4Group_TempPath[0] !== 0) {
        $.SCopy$pi8$pi8$u64(P($.C4Group_TempPath, 0), P(temp_filename, 0), 4096);
        $.SAppend($.GetFilename(filename), P(temp_filename, 0), 4096);
      } else {
        $.SCopy$pi8$pi8$u64(filename, P(temp_filename, 0), 4096);
      }
      $.MakeTempFilename$pi8(P(temp_filename, 0));
      if (move) {
        if (!$.MoveItem(filename, P(temp_filename, 0))) {
          return this.Error_(S("AddEntryOnDisk: Move failure"));
        }
      } else {
        if (!$.CopyItem(filename, P(temp_filename, 0))) {
          return this.Error_(S("AddEntryOnDisk: Copy failure"));
        }
      }
      if (!C4Group_PackDirectory(P(temp_filename, 0))) {
        return this.Error_(S("AddEntryOnDisk: Pack directory failure"));
      }
      if (entry_name == null) {
        entry_name = $.GetFilename(filename);
      }
      filename = P(temp_filename, 0);
      move = true;
    }
    let fIsGroup = !!C4Group_IsGroup(filename);
    let size = (fIsGroup ? $u64n($.UncompressedFileSize(filename)) : $.FileSize$pi8(filename)) | 0;
    let is_executable = false;
    is_executable = c$access(filename, 1) === 0;
    return this.AddEntry(1 /*C4GRES_OnDisk*/, fIsGroup, filename, size, entry_name, null, move, false, is_executable);
  }

  SetFilePtr2Entry(entry_name, needs_to_be_a_group = false) {
    let entry = this.GetEntry(entry_name);
    if (entry != null && entry.MemoryBuffer != null && !needs_to_be_a_group) {
      this.p.pInMemEntry = entry.MemoryBuffer;
      this.p.iInMemEntrySize = $u64n(entry.Size);
      return true;
    } else {
      this.p.pInMemEntry = null;
    }
    switch (this.p.SourceType) {
      case 1:
        if (entry == null || entry.Status !== 0) {
          return false;
        }
        return this.SetFilePtr(entry.Offset);
      case 2:
        this.p.StdFile.Close$ppStdBuf();
        const path = new Int8Array(256);
        $.SCopy$pi8$pi8$u64(this.GetName(), P(path, 0), 255);
        $.AppendBackslash(P(path, 0));
        $.SAppend(entry_name, P(path, 0));
        return this.p.StdFile.Open(P(path, 0), needs_to_be_a_group);
      default:
        break;
    }
    return false;
  }

  AppendEntry2StdFile(entry, target) {
    let source = new $.CStdFile().init();
    const buffer = [0];
    switch (entry.Status) {
      case 0:
        if (!this.SetFilePtr(entry.Offset)) {
          return this.Error_(S("AE2S: Cannot set file pointer"));
        }
        for (let current_size = entry.Size; current_size > 0; current_size = current_size - 1) {
          if (!this.Read$px$u64(P(buffer, 0), 1)) {
            return this.Error_(S("AE2S: Cannot read entry from group file"));
          }
          if (!target.Write(P(buffer, 0), 1)) {
            return this.Error_(S("AE2S: Cannot write to target file"));
          }
        }
        break;
      case 1:
        {
          const file_source = new Int8Array(256);
          $.SCopy$pi8$pi8$u64(P(entry.DiskPath, 0), P(file_source, 0), 255);
          if ($.DirectoryExists(P(entry.DiskPath, 0))) {
            return this.Error_(S("AE2S: Cannot add directory to group file"));
          }
          let has_temp_file = false;
          if (entry.ChildGroup !== 0 && !entry.NoSort && !$.SEqual($.GetFilename$2(P(file_source, 0)), P(entry.FileName, 0))) {
            $.MakeTempFilename$pi8(P(file_source, 0));
            if (!$.CopyItem(P(entry.DiskPath, 0), P(file_source, 0))) {
              return this.Error_(S("AE2S: Cannot copy item"));
            }
            let SortGrp = new C4Group().init();
            if (!SortGrp.Open(P(file_source, 0))) {
              return this.Error_(S("AE2S: Cannot open group"));
            }
            if (!SortGrp.SortByList($.C4Group_SortList, P(entry.FileName, 0))) {
              return this.Error_(S("AE2S: Cannot resort group"));
            }
            has_temp_file = true;
            SortGrp.Close$v();
          }
          if (!source.Open(P(file_source, 0), !(entry.ChildGroup === 0))) {
            return this.Error_(S("AE2S: Cannot open on-disk file"));
          }
          for (let current_size$2 = entry.Size; current_size$2 > 0; current_size$2 = current_size$2 - 1) {
            if (!source.Read$px$u64(P(buffer, 0), 1)) {
              source.Close$ppStdBuf();
              return this.Error_(S("AE2S: Cannot read on-disk file"));
            }
            if (!target.Write(P(buffer, 0), 1)) {
              source.Close$ppStdBuf();
              return this.Error_(S("AE2S: Cannot write to target file"));
            }
          }
          source.Close$ppStdBuf();
          if (has_temp_file) {
            $.EraseItem(P(file_source, 0));
          }
          if (entry.DeleteOnDisk) {
            $.EraseItem(P(entry.DiskPath, 0));
          }
          break;
        }
      case 2:
        if (entry.MemoryBuffer == null) {
          return this.Error_(S("AE2S: no buffer"));
        }
        if (!target.Write(entry.MemoryBuffer, entry.Size)) {
          return this.Error_(S("AE2S: writing error"));
        }
        break;
      case 3:
        break;
      default:
        return this.Error_(S("AE2S: Unknown file status"));
    }
    return true;
  }

  SearchNextEntry(entry_name) {
    if ($.SEqual(entry_name, S("*.*"))) {
      entry_name = S("*");
    }
    let pEntry = null;
    switch (this.p.SourceType) {
      case 1:
        for (pEntry = this.p.SearchPtr; pEntry != null; pEntry = pEntry.Next) {
          if (pEntry.Status !== 3) {
            if ($.WildcardMatch(entry_name, P(pEntry.FileName, 0))) {
              this.p.SearchPtr = pEntry.Next;
              return pEntry;
            }
          }
        }
        break;
      case 2:
        for (pEntry = this.p.SearchPtr; pEntry != null; pEntry = this.GetNextFolderEntry()) {
          if ($.WildcardMatch(entry_name, P(pEntry.FileName, 0))) {
            if (!C4Group_TestIgnore(P(pEntry.FileName, 0))) {
              this.p.LastFolderSearchEntry.$assign(pEntry);
              pEntry = this.p.LastFolderSearchEntry;
              this.p.SearchPtr = this.GetNextFolderEntry();
              return pEntry;
            }
          }
        }
        break;
      default:
        break;
    }
    this.p.SearchPtr = null;
    return null;
  }

  GetNextFolderEntry() {
    if (this.p.FolderSearch.op_inc$v().op_mul() != null) {
      this.p.FolderSearchEntry.Set(this.p.FolderSearch, this.GetName());
      return this.p.FolderSearchEntry;
    } else {
      return null;
    }
  }

  CalcCRC32(entry) {
    let CRC = 0;
    if (entry.ChildGroup !== 0 || entry.Status === 1 && ($.DirectoryExists(P(entry.DiskPath, 0)) || C4Group_IsGroup(P(entry.DiskPath, 0)))) {
      let Child = new C4Group().init();
      switch (entry.Status) {
        case 0:
          if (!Child.OpenAsChild(this, P(entry.FileName, 0))) {
            return 0;
          }
          break;
        case 1:
          if (!Child.Open(P(entry.DiskPath, 0))) {
            return 0;
          }
          break;
        default:
          return 0;
      }
      CRC = Child.EntryCRC32();
    } else if (entry.Size === 0) {
      CRC = 0;
    } else {
      let data = null;
      let own_data = false;
      let file = new $.CStdFile().init();
      switch (entry.Status) {
        case 0:
          data = P(new Uint8Array($u64n(entry.Size)), 0);
          own_data = true;
          if (!this.SetFilePtr2Entry(P(entry.FileName, 0))) {
            $delete(data);
            return 0;
          }
          if (!this.Read$px$u64(data, $u64n(entry.Size))) {
            $delete(data);
            return 0;
          }
          break;
        case 1:
          data = P(new Uint8Array($u64n(entry.Size)), 0);
          own_data = true;
          if (!file.Open(P(entry.DiskPath, 0))) {
            $delete(data);
            return 0;
          }
          if (!file.Read$px$u64(data, $u64n(entry.Size))) {
            $delete(data);
            return 0;
          }
          break;
        case 2:
          data = entry.MemoryBuffer;
          own_data = false;
          break;
        default:
          return 0;
      }
      if (data == null) {
        return 0;
      }
      CRC = c$crc32(0, data, entry.Size >>> 0) >>> 0;
      if (own_data) {
        $delete(data);
      }
      CRC = c$crc32(CRC, $view8(P(entry.FileName, 0), false), $.SLen(P(entry.FileName, 0)) >>> 0) >>> 0;
    }
    return CRC;
  }

  PreCacheEntry(entry) {
    if (entry.ChildGroup !== 0 || entry.MemoryBuffer != null || entry.Size === 0) {
      return;
    }
    let buffer = new $.StdBuf();
    if (!this.LoadEntry$pi8$pStdBuf(P(entry.FileName, 0), buffer)) {
      return;
    }
    entry.HoldBuffer = true;
    entry.BufferIsStdbuf = true;
    entry.Size = $.StdBuf.prototype.getSize.call(buffer) | 0;
    entry.MemoryBuffer = $reinterpVoid($.StdBuf.prototype.GrabPointer.call(buffer), "u8");
  }

  $clone() { return new C4Group().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.p = o.p;
    this.Head.$assign(o.Head);
    return this;
  }
}










export function C4Group_SetProcessCallback(callback) {
  $.C4Group_ProcessCallback = callback;
}

export function C4Group_SetSortList(sort_list) {
  $.C4Group_SortList = sort_list;
}

export function C4Group_SetTempPath(path) {
  if (path == null || path.a[path.o + 0] === 0) {
    $.C4Group_TempPath[0] = 0;
  } else {
    $.SCopy$pi8$pi8$u64(path, P($.C4Group_TempPath, 0), 4096);
    $.AppendBackslash(P($.C4Group_TempPath, 0));
  }
}

export function C4Group_GetTempPath() {
  return P($.C4Group_TempPath, 0);
}

export function C4Group_TestIgnore(filename) {
  if (filename.a[filename.o] === 0) {
    return true;
  }
  let name = $.GetFilename(filename);
  return name.a[name.o] === 46 || name.a[name.o + (c$strlen(name) - 1)] === 126 || $.SIsModule(P($.C4Group_Ignore, 0), name);
}

export function C4Group_IsGroup(filename) {
  let group = new C4Group().init();
  if (group.Open(filename)) {
    group.Close$v();
    return true;
  }
  return false;
}

export function C4Group_CopyItem(source, target, no_sorting = false, reset_attributes = false) {
  if (source == null || target == null || source.a[source.o + 0] === 0 || target.a[target.o + 0] === 0) {
    return false;
  }
  const target_path = new Int8Array(4097);
  $.SCopy$pi8$pi8$u64(target, P(target_path, 0), 4096);
  if (target_path[$.SLen(P(target_path, 0)) - 1] === 47) {
    $.SAppend($.GetFilename(source), P(target_path, 0));
  }
  if ($.ItemIdentical(source, P(target_path, 0))) {
    return true;
  }
  if ($.ItemExists(source) && $.CreateItem(P(target_path, 0))) {
    return $.CopyItem(source, P(target_path, 0), reset_attributes);
  }
  let source_parent = new C4Group().init();
  let target_parent = new C4Group().init();
  const source_parent_path = new Int8Array(4097);
  const target_parent_path = new Int8Array(4097);
  $.GetParentPath$pi8$pi8(source, P(source_parent_path, 0));
  $.GetParentPath$pi8$pi8(P(target_path, 0), P(target_parent_path, 0));
  const temp_filename = new Int8Array(4097);
  $.SCopy$pi8$pi8$u64(P($.C4Group_TempPath, 0), P(temp_filename, 0), 4096);
  $.SAppend($.GetFilename(source), P(temp_filename, 0));
  $.MakeTempFilename$pi8(P(temp_filename, 0));
  if (!source_parent.Open(P(source_parent_path, 0)) || !source_parent.Extract($.GetFilename(source), P(temp_filename, 0)) || !source_parent.Close$v()) {
    return false;
  }
  if (!target_parent.Open(P(target_parent_path, 0)) || !target_parent.SetNoSort(no_sorting) || !target_parent.Move(P(temp_filename, 0), $.GetFilename$2(P(target_path, 0))) || !target_parent.Close$v()) {
    $.EraseItem(P(temp_filename, 0));
    return false;
  }
  return true;
}

export function C4Group_MoveItem(source, target, no_sorting = false) {
  if (source == null || target == null || source.a[source.o + 0] === 0 || target.a[target.o + 0] === 0) {
    return false;
  }
  const target_path = new Int8Array(4097);
  $.SCopy$pi8$pi8$u64(target, P(target_path, 0), 4096);
  if (target_path[$.SLen(P(target_path, 0)) - 1] === 47) {
    $.SAppend($.GetFilename(source), P(target_path, 0));
  }
  if ($.ItemIdentical(source, P(target_path, 0))) {
    return true;
  }
  if ($.ItemExists(source) && $.CreateItem(P(target_path, 0))) {
    $.EraseItem(P(target_path, 0));
    return $.MoveItem(source, P(target_path, 0));
  }
  let source_parent = new C4Group().init();
  let target_parent = new C4Group().init();
  const source_parent_path = new Int8Array(4097);
  const target_parent_path = new Int8Array(4097);
  $.GetParentPath$pi8$pi8(source, P(source_parent_path, 0));
  $.GetParentPath$pi8$pi8(P(target_path, 0), P(target_parent_path, 0));
  const temp_filename = new Int8Array(4097);
  $.SCopy$pi8$pi8$u64(P($.C4Group_TempPath, 0), P(temp_filename, 0), 4096);
  $.SAppend($.GetFilename(source), P(temp_filename, 0));
  $.MakeTempFilename$pi8(P(temp_filename, 0));
  if (!source_parent.Open(P(source_parent_path, 0)) || !source_parent.Extract($.GetFilename(source), P(temp_filename, 0)) || !source_parent.Close$v()) {
    return false;
  }
  if (!target_parent.Open(P(target_parent_path, 0)) || !target_parent.SetNoSort(no_sorting) || !target_parent.Move(P(temp_filename, 0), $.GetFilename$2(P(target_path, 0))) || !target_parent.Close$v()) {
    $.EraseItem(P(temp_filename, 0));
    return false;
  }
  if (!source_parent.Open(P(source_parent_path, 0)) || !source_parent.DeleteEntry($.GetFilename(source)) || !source_parent.Close$v()) {
    return false;
  }
  return true;
}

export function C4Group_DeleteItem(item_name, do_recycle = false) {
  if (item_name == null || item_name.a[item_name.o + 0] === 0) {
    return false;
  }
  if ($.ItemExists(item_name)) {
    if (do_recycle) {
      return $.EraseItemSafe(item_name);
    } else {
      return $.EraseItem(item_name);
    }
  }
  let parent = new C4Group().init();
  const parent_path = new Int8Array(4097);
  $.GetParentPath$pi8$pi8(item_name, P(parent_path, 0));
  if (!parent.Open(P(parent_path, 0)) || !parent.DeleteEntry($.GetFilename(item_name), do_recycle) || !parent.Close$v()) {
    return false;
  }
  return true;
}

export function C4Group_PackDirectoryTo(filename, to_filename) {
  if (!$.DirectoryExists(filename)) {
    return false;
  }
  if ($.FileExists(to_filename)) {
    return false;
  }
  if (C4Group_TestIgnore(filename)) {
    return true;
  }
  if ($.C4Group_ProcessCallback != null) {
    $.C4Group_ProcessCallback(filename, 0);
  }
  let group = new C4Group().init();
  if (!group.Open(to_filename, true)) {
    return false;
  }
  let i = new $.DirectoryIterator().init$pi8(filename);
  for (; i.op_mul() != null; i.op_inc$i32(0)) {
    if (C4Group_TestIgnore(i.op_mul())) {
      continue;
    }
    if ($.DirectoryExists(i.op_mul())) {
      const temp_filename = new Int8Array(4097);
      $.SCopy$pi8$pi8$u64(P($.C4Group_TempPath, 0), P(temp_filename, 0), 4096);
      $.SAppend($.GetFilename(i.op_mul()), P(temp_filename, 0), 4096);
      $.MakeTempFilename$pi8(P(temp_filename, 0));
      if (!C4Group_PackDirectoryTo(i.op_mul(), P(temp_filename, 0))) {
        break;
      }
      if (!group.Move(P(temp_filename, 0), $.GetFilename(i.op_mul()))) {
        $.EraseFile(P(temp_filename, 0));
        break;
      }
    } else if (!group.Add$pi8$pi8(i.op_mul(), null)) {
      break;
    }
  }
  if (i.op_mul() != null) {
    group.Close$v();
    $.EraseItem(to_filename);
    return false;
  }
  i.Reset$v();
  group.SortByList($.C4Group_SortList, filename);
  return group.Close$v();
}

export function C4Group_PackDirectory(filename) {
  const temp_filename = new Int8Array(4097);
  $.SCopy$pi8$pi8$u64(filename, P(temp_filename, 0), 4096);
  $.MakeTempFilename$pi8(P(temp_filename, 0));
  if (!C4Group_PackDirectoryTo(filename, P(temp_filename, 0))) {
    return false;
  }
  const temp_filename2 = new Int8Array(4097);
  $.SCopy$pi8$pi8$u64(filename, P(temp_filename2, 0), 4096);
  $.MakeTempFilename$pi8(P(temp_filename2, 0));
  if (!$.RenameFile(filename, P(temp_filename2, 0))) {
    return false;
  }
  if (!$.RenameFile(P(temp_filename, 0), filename)) {
    return false;
  }
  return $.EraseDirectory(P(temp_filename2, 0));
}

export function C4Group_UnpackDirectory(filename) {
  if ($.DirectoryExists(filename)) {
    return true;
  }
  const parent_filename = new Int8Array(4097);
  if (!$.FileExists(filename) && $.GetParentPath$pi8$pi8(filename, P(parent_filename, 0)) && !C4Group_UnpackDirectory(P(parent_filename, 0))) {
    return false;
  }
  let group = new C4Group().init();
  if (!group.Open(filename)) {
    return false;
  }
  if ($.C4Group_ProcessCallback != null) {
    $.C4Group_ProcessCallback(filename, 0);
  }
  const target_directory = new Int8Array(4097);
  $.SCopy$pi8$pi8$u64(filename, P(target_directory, 0), 4096);
  $.MakeTempFilename$pi8(P(target_directory, 0));
  if (!$.CreatePath(StdString.of(P(target_directory, 0)))) {
    group.Close$v();
    return false;
  }
  if (!group.Extract(S("*"), P(target_directory, 0))) {
    group.Close$v();
    return false;
  }
  group.Close$v();
  const temp_filename = new Int8Array(4097);
  $.SCopy$pi8$pi8$u64(filename, P(temp_filename, 0), 4096);
  $.MakeTempFilename$pi8(P(temp_filename, 0));
  if (!$.RenameFile(filename, P(temp_filename, 0))) {
    return false;
  }
  if (!$.RenameFile(P(target_directory, 0), filename)) {
    return false;
  }
  return $.EraseItem(P(temp_filename, 0));
}

export function C4Group_ExplodeDirectory(filename) {
  if (C4Group_TestIgnore(filename)) {
    return true;
  }
  if (!C4Group_UnpackDirectory(filename)) {
    return false;
  }
  $.ForEachFile(filename, C4Group_ExplodeDirectory);
  return true;
}

export function C4Group_ReadFile(filename, data, size) {
  if (filename == null || data == null) {
    return false;
  }
  const parent_path = new Int8Array(4097);
  $.GetParentPath$pi8$pi8(filename, P(parent_path, 0));
  let entry_name = $.GetFilename(filename);
  let parent_group = new C4Group().init();
  if (!parent_group.Open(P(parent_path, 0))) {
    return false;
  }
  const filesize = [0];
  if (!parent_group.AccessEntry(entry_name, P(filesize, 0))) {
    return false;
  }
  data.a[data.o] = P(new Int8Array(filesize[0]), 0);
  if (!parent_group.Read$px$u64(data.a[data.o], filesize[0])) {
    $delete(data.a[data.o]);
    data.a[data.o] = null;
    return false;
  }
  parent_group.Close$v();
  if (size != null) {
    size.a[size.o] = filesize[0];
  }
  return true;
}

export function MemScramble(buffer, size) {
  let $t1;
  for (let cnt = 0; cnt < size; cnt = cnt + 1 | 0) {
    ($t1 = $padd(buffer, cnt), $t1.a[$t1.o] = ($t1.a[$t1.o] ^ 237) & 0xff);
  }
  for (let cnt = 0; (cnt + 2 | 0) < size; cnt = cnt + 3 | 0) {
    let temp = buffer.a[buffer.o + cnt];
    buffer.a[buffer.o + cnt] = buffer.a[buffer.o + (cnt + 2 | 0)];
    buffer.a[buffer.o + (cnt + 2 | 0)] = temp;
  }
}

export function C4Group_IsExcluded(filename, exclude_list) {
  if (filename == null || filename.a[filename.o + 0] === 0 || exclude_list == null || exclude_list.a[exclude_list.o + 0] === 0) {
    return false;
  }
  let separator = $.SCharCount(59, exclude_list) !== 0 ? 59 : 124;
  const segment = new Int8Array(4097);
  for (let i = 0; $.SCopySegment(exclude_list, i, P(segment, 0), separator); i = i + 1 | 0) {
    if ($.WildcardMatch(P(segment, 0), $.GetFilename(filename))) {
      return true;
    }
  }
  return false;
}

export function SortRank(element, sort_list) {
  const segment = new Int8Array(256);
  for (let cnt = 0; $.SCopySegment(sort_list, cnt, P(segment, 0), 124, 255); cnt = cnt + 1 | 0) {
    if ($.WildcardMatch(P(segment, 0), element)) {
      return ($.SCharCount(124, sort_list) + 1 >>> 0) - (cnt >>> 0) >>> 0 | 0;
    }
  }
  return 0;
}

export function $init(): void {
  $.C4CFN_FLS = [
  S("System.ocg"),
  S("*.hlp|*.cnt|Language*.txt|*.fon|*.fnt|*.ttf|*.ttc|*.fot|*.otf|Fonts.txt|StringTbl*.txt|PlayerControls.txt|*.c|Names.txt"),
  S("Material.ocg"),
  S("TexMap.txt|*.ocm|*.jpeg|*.jpg|*.bmp|*.png"),
  S("Graphics.ocg"),
  S("Loader*.bmp|Loader*.png|Loader*.jpeg|Loader*.jpg|*.glsl|Font*.png|GUIProgress.png|Endeavour.ttf|GUICaption.png|GUIButton.png|GUIButtonDown.png|GUIButtonHighlight.png|GUIButtonHighlightRound.png|GUIIcons.png|GUIIcons2.png|GUIScroll.png|GUIContext.png|GUISubmenu.png|GUICheckBox.png|GUIBigArrows.png|Control.png|ClonkSkins.png|Fire.png|Background.png|Flag.png|Crew.png|Wealth.png|Player.png|Rank.png|Captain.png|Cursor.png|SelectMark.png|MenuSymbol.png|Menu.png|Logo.png|Construction.png|Energy.png|Options.png|UpperBoard.png|Arrow.png|Exit.png|Hand.png|Gamepad.png|Build.png|TransformKnob.png|Achv*.png|StartupMainMenuBG.*|StartupScenSelBG.*|StartupPlrSelBG.*|StartupPlrPropBG.*|StartupNetworkBG.*|StartupAboutBG.*|StartupBigButton.png|StartupBigButtonDown.png|StartupBookScroll.png|StartupContext.png|StartupScenSelIcons.png|StartupScenSelTitleOv.png|StartupDlgPaper.png|StartupOptionIcons.png|StartupTabClip.png|StartupNetGetRef.png|StartupLogo.png"),
  S("*.ocd"),
  S("*.glsl|*.png|*.bmp|*.jpeg|*.jpg|*.material|Particle.txt|DefCore.txt|*.wav|*.ogg|*.skeleton|Graphics.mesh|*.mesh|StringTbl*.txt|Script.c|Script*.c|C4Script.c|Names*.txt|Title*.txt|ClonkNames.txt|Rank.txt|Rank*.txt|Desc*.txt|Author.txt|Version.txt|*.ocd"),
  S("*.ocp"),
  S("Player.txt|BigIcon.png|*.oci"),
  S("*.oci"),
  S("ObjectInfo.txt"),
  S("*.ocs"),
  S("Loader*.bmp|Loader*.png|Loader*.jpeg|Loader*.jpg|Fonts.txt|Scenario.txt|Title*.txt|Info.txt|Desc*.txt|Icon.png|Icon.bmp|Achv*.png|Game.txt|StringTbl*.txt|ParameterDefs.txt|Teams.txt|Parameters.txt|Info.txt|Sect*.ocg|Music.ocg|*.mid|*.wav|Desc*.txt|Title.png|Title.jpg|*.ocd|Script.c|Script*.c|Map.c|Objects.c|System.ocg|Material.ocg|MatMap.txt|Map.bmp|MapFg.bmp|MapBg.bmp|Landscape.bmp|LandscapeFg.bmp|LandscapeBg.bmp|DiffLandscape.bmp|DiffLandscapeBkg.bmp|Sky.bmp|Sky.png|Sky.jpeg|Sky.jpg|PXS.ocb|MassMover.ocb|CtrlRec.ocb|Strings.txt|Objects.txt|RoundResults.txt|Author.txt|Version.txt|Names.txt"),
  S("*.ocf"),
  S("Folder.txt|Title*.txt|Info.txt|Desc*.txt|Title.png|Title.jpg|Icon.png|Icon.bmp|Author.txt|Version.txt|StringTbl*.txt|ParameterDefs.txt|Achv*.png|*.ocs|Loader*.bmp|Loader*.png|Loader*.jpeg|Loader*.jpg|FolderMap.txt|FolderMap.png"),
  S("Sect*.ocg"),
  S("Scenario.txt|Game.txt|Map.bmp|MapFg.bmp|MapBg.bmp|Landscape.bmp|LandscapeFg.bmp|LandscapeBg.bmp|Sky.bmp|Sky.png|Sky.jpeg|Sky.jpg|PXS.ocb|MassMover.ocb|CtrlRec.ocb|Strings.txt|Objects.txt|Objects.c"),
  S("Sound.ocg"),
  S("*.wav|*.ogg|*.ocg"),
  S("Music.ocg"),
  S("*.ogg"),
  null,
  null,
];
  $.C4Group_TempPath = $cs(S(""), 4097);
  $.C4Group_Ignore = $cs(S("cvs;CVS;Thumbs.db;.orig;.svn"), 4097);
  $.C4Group_SortList = null;
  $.C4Group_ProcessCallback = null;
  $.C4GroupFileVer1$C4Group = 1;
  $.C4GroupFileVer2$C4Group = 2;
  $.C4GroupMaxError$C4Group = 100;
  $.C4GroupSwapThreshold$C4Group = 0xa00000;
}

Object.assign($, { C4Group, C4Group$P_c4group_C4Group, C4GroupEntry, C4GroupEntryCore, C4GroupHeader, C4Group_CopyItem, C4Group_DeleteItem, C4Group_ExplodeDirectory, C4Group_GetTempPath, C4Group_IsExcluded, C4Group_IsGroup, C4Group_MoveItem, C4Group_PackDirectory, C4Group_PackDirectoryTo, C4Group_ReadFile, C4Group_SetProcessCallback, C4Group_SetSortList, C4Group_SetTempPath, C4Group_TestIgnore, C4Group_UnpackDirectory, MemScramble, SortRank });
