// @ts-nocheck
// OpenClonk 36de799: src/gui/C4Scoreboard.cpp, src/gui/C4Scoreboard.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { Dialog } from './C4Gui.ts';
import { $u64n, ftoi32 } from '../../rt/int.ts';
import { $oadd, $oarr, $oat, $oidx, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $max } from '../../rt/std.ts';

export class C4Scoreboard {
  iRows = 0;
  iCols = 0;
  pEntries = null;
  pDlg = null;
  iDlgShow = 0;

  AddRow(iInsertBefore) {
    let iNewEntryCount = Math.imul(this.iRows + 1 | 0, this.iCols);
    if (iNewEntryCount === 0) {
      this.iRows = this.iRows + 1 | 0;
      return;
    }
    let pNewEntries = $oat($oarr($u64n(iNewEntryCount), () => new C4Scoreboard$Entry().init()), 0);
    for (let iRow = 0, iFromRow = 0; iFromRow < this.iRows; iRow = iRow + 1 | 0, iFromRow = iFromRow + 1 | 0) {
      if (iFromRow === iInsertBefore) {
        iRow = iRow + 1 | 0;
      }
      for (let iCol = 0; iCol < this.iCols; iCol = iCol + 1 | 0) {
        $oidx(pNewEntries, Math.imul(iRow, this.iCols) + iCol | 0).GrabFrom(this.GetCell(iCol, iFromRow));
      }
    }
    this.iRows = this.iRows + 1 | 0;
    $delete(this.pEntries);
    this.pEntries = pNewEntries;
  }

  AddCol(iInsertBefore) {
    let iNewEntryCount = Math.imul(this.iRows, this.iCols + 1 | 0);
    if (iNewEntryCount === 0) {
      this.iCols = this.iCols + 1 | 0;
      return;
    }
    let pNewEntries = $oat($oarr($u64n(iNewEntryCount), () => new C4Scoreboard$Entry().init()), 0);
    for (let iRow = 0; iRow < this.iRows; iRow = iRow + 1 | 0) {
      for (let iCol = 0, iFromCol = 0; iFromCol < this.iCols; iCol = iCol + 1 | 0, iFromCol = iFromCol + 1 | 0) {
        if (iFromCol === iInsertBefore) {
          iCol = iCol + 1 | 0;
        }
        $oidx(pNewEntries, Math.imul(iRow, this.iCols + 1 | 0) + iCol | 0).GrabFrom(this.GetCell(iFromCol, iRow));
      }
    }
    this.iCols = this.iCols + 1 | 0;
    $delete(this.pEntries);
    this.pEntries = pNewEntries;
  }

  DelRow(iDelIndex) {
    let $t1;
    let iNewEntryCount = Math.imul(this.iRows - 1 | 0, this.iCols);
    if (iNewEntryCount === 0) {
      this.iRows = this.iRows - 1 | 0;
      $delete(this.pEntries);
      this.pEntries = null;
      return;
    }
    let pNewEntries = $oat($oarr($u64n(iNewEntryCount), () => new C4Scoreboard$Entry().init()), 0);
    let pCpy = pNewEntries;
    for (let iRow = 0, iFromRow = 0; iRow < (this.iRows - 1 | 0); iRow = iRow + 1 | 0, iFromRow = iFromRow + 1 | 0) {
      if (iFromRow === iDelIndex) {
        iFromRow = iFromRow + 1 | 0;
      }
      for (let iCol = 0; iCol < this.iCols; iCol = iCol + 1 | 0) {
        ($t1 = pCpy, pCpy = $oadd(pCpy, 1), $t1).GrabFrom(this.GetCell(iCol, iFromRow));
      }
    }
    this.iRows = this.iRows - 1 | 0;
    $delete(this.pEntries);
    this.pEntries = pNewEntries;
  }

  DelCol(iDelIndex) {
    let $t1;
    let iNewEntryCount = Math.imul(this.iRows, this.iCols - 1 | 0);
    if (iNewEntryCount === 0) {
      this.iCols = this.iCols - 1 | 0;
      $delete(this.pEntries);
      this.pEntries = null;
      return;
    }
    let pNewEntries = $oat($oarr($u64n(iNewEntryCount), () => new C4Scoreboard$Entry().init()), 0);
    let pCpy = pNewEntries;
    for (let iRow = 0; iRow < this.iRows; iRow = iRow + 1 | 0) {
      for (let iCol = 0, iFromCol = 0; iCol < (this.iCols - 1 | 0); iCol = iCol + 1 | 0, iFromCol = iFromCol + 1 | 0) {
        if (iFromCol === iDelIndex) {
          iFromCol = iFromCol + 1 | 0;
        }
        ($t1 = pCpy, pCpy = $oadd(pCpy, 1), $t1).GrabFrom(this.GetCell(iFromCol, iRow));
      }
    }
    this.iCols = this.iCols - 1 | 0;
    $delete(this.pEntries);
    this.pEntries = pNewEntries;
  }

  GetColByKey(iKey) {
    let $t1;
    if (this.iRows === 0) {
      return -1;
    }
    let pCheck = this.pEntries;
    for (let i = 0; i < this.iCols; i = i + 1 | 0) {
      if (($t1 = pCheck, pCheck = $oadd(pCheck, 1), $t1).iVal === iKey) {
        return i;
      }
    }
    return -1;
  }

  GetRowByKey(iKey) {
    if (this.iCols === 0) {
      return -1;
    }
    let pCheck = this.pEntries;
    for (let i = 0; i < this.iRows; i = i + 1 | 0, pCheck = $oadd(pCheck, this.iCols)) {
      if (pCheck.iVal === iKey) {
        return i;
      }
    }
    return -1;
  }

  SwapRows(iRow1, iRow2) {
    let $t1, $t2, $t3;
    let pXChg1 = $oadd(this.pEntries, Math.imul(iRow1, this.iCols));
    let pXChg2 = $oadd(this.pEntries, Math.imul(iRow2, this.iCols));
    let i = this.iCols;
    while (($t1 = i, i = i - 1 | 0, $t1) !== 0) {
      ($t3 = pXChg1, pXChg1 = $oadd(pXChg1, 1), $t3).SwapWith(($t2 = pXChg2, pXChg2 = $oadd(pXChg2, 1), $t2));
    }
  }

  InvalidateRows() {
    if (this.pDlg != null) {
      this.pDlg.InvalidateRows();
    }
  }

  GetCell(iCol, iRow) {
    return $oadd($oadd(this.pEntries, Math.imul(iRow, this.iCols)), iCol);
  }

  $dtor() {
    C4Scoreboard.prototype.Clear.call(this);
  }

  Clear() {
    $delete(this.pEntries);
    this.pEntries = null;
    this.iRows = this.iCols = 0;
    this.iDlgShow = 0;
    if (this.pDlg != null) {
      $delete(this.pDlg);
      this.pDlg = null;
    }
  }

  SetCell(iColKey, iRowKey, szValue, iValue) {
    if (this.iCols === 0 || this.iRows === 0) {
      if (this.iCols === 0) {
        this.AddCol(0);
      }
      if (this.iRows === 0) {
        this.AddRow(0);
      }
      this.GetCell(0, 0).iVal = -1;
    }
    let iCol = this.GetColByKey(iColKey);
    if (iCol < 0) {
      this.AddCol(iCol = this.iCols);
      this.GetCell(iCol, 0).iVal = iColKey;
    }
    let iRow = this.GetRowByKey(iRowKey);
    if (iRow < 0) {
      this.AddRow(iRow = this.iRows);
      this.GetCell(0, iRow).iVal = iRowKey;
    }
    let pCell = this.GetCell(iCol, iRow);
    pCell.Text.Copy$pi8(szValue);
    if (iCol !== 0 && iRow !== 0) {
      pCell.iVal = iValue;
    }
    if (szValue == null || szValue.a[szValue.o] === 0) {
      let i = 0;
      if (iRow !== 0) {
        for (i = 1; i < this.iCols; i = i + 1 | 0) {
          if (this.GetCell(i, iRow).Text.op_const_void_() != null) {
            break;
          }
        }
        if (i === this.iCols) {
          this.DelRow(iRow);
        }
      }
      if (iCol !== 0) {
        for (i = 1; i < this.iRows; i = i + 1 | 0) {
          if (this.GetCell(iCol, i).Text.op_const_void_() != null) {
            break;
          }
        }
        if (i === this.iRows) {
          this.DelCol(iCol);
        }
      }
    }
    this.InvalidateRows();
  }

  GetCellString(iColKey, iRowKey) {
    let iCol = this.GetColByKey(iColKey);
    let iRow = this.GetRowByKey(iRowKey);
    if (iCol < 0 || iRow < 0) {
      return null;
    }
    let pCell = this.GetCell(iCol, iRow);
    return pCell.Text.getData();
  }

  GetCellData(iColKey, iRowKey) {
    let iCol = this.GetColByKey(iColKey);
    let iRow = this.GetRowByKey(iRowKey);
    if (iCol < 0 || iRow < 0) {
      return 0;
    }
    let pCell = this.GetCell(iCol, iRow);
    return pCell.iVal;
  }

  RemoveCol(iColKey) {
    let iCol = this.GetColByKey(iColKey);
    if (iCol >= 0) {
      this.DelCol(iCol);
    }
    this.InvalidateRows();
  }

  RemoveRow(iRowKey) {
    let iRow = this.GetRowByKey(iRowKey);
    if (iRow >= 0) {
      this.DelRow(iRow);
    }
    this.InvalidateRows();
  }

  SortBy(iColKey, fReverse) {
    let iCol = this.GetColByKey(iColKey);
    if (iCol < 0) {
      return false;
    }
    let iSortDir = fReverse ? -1 : 1;
    let iSortBegin = 1;
    let iSortEnd = this.iRows - 1 | 0;
    while (iSortBegin < iSortEnd) {
      let iNewBorder = iSortBegin;
      let i = 0;
      for (i = iSortBegin; i < iSortEnd; i = i + 1 | 0) {
        if (Math.imul(this.GetCell(iCol, i).iVal, iSortDir) > Math.imul(this.GetCell(iCol, i + 1 | 0).iVal, iSortDir)) {
          this.SwapRows(i, i + 1 | 0);
          iNewBorder = i;
        }
      }
      iSortEnd = iNewBorder;
      for (i = iSortEnd; i > iSortBegin; i = i - 1 | 0) {
        if (Math.imul(this.GetCell(iCol, i - 1 | 0).iVal, iSortDir) > Math.imul(this.GetCell(iCol, i).iVal, iSortDir)) {
          this.SwapRows(i - 1 | 0, i);
          iNewBorder = i;
        }
      }
      iSortBegin = iNewBorder;
    }
    return true;
  }

  DoDlgShow(iChange, fUserToggle) {
    if ($.pGUI.IsExclusive()) {
      return;
    }
    this.iDlgShow = this.iDlgShow + iChange | 0;
    if (!fUserToggle) {
      fUserToggle = (this.ShouldBeShown() ? 1 : 0) === (this.pDlg == null ? 1 : 0);
    } else if (!this.CanBeShown() && this.pDlg == null) {
      fUserToggle = false;
    }
    if (fUserToggle) {
      if (this.pDlg == null) {
        if (!$.C4GameOverDlg.IsShown()) {
          $.pGUI.ShowRemoveDlg(this.pDlg = new C4ScoreboardDlg().init(this));
        }
      } else {
        this.pDlg.Close$b(false);
      }
    }
  }

  HideDlg() {
    if ($.pGUI.IsExclusive()) {
      return;
    }
    if (this.pDlg != null) {
      this.pDlg.Close$b(false);
    }
  }

  ShouldBeShown() {
    return this.iDlgShow > 0 && this.iRows !== 0 && this.iCols !== 0;
  }

  CanBeShown() {
    return this.iDlgShow >= 0 && this.iRows !== 0 && this.iCols !== 0;
  }

  KeyUserShow() {
    this.DoDlgShow(0, true);
    return true;
  }

  CompileFunc(pComp) {
    let deserializing = pComp.isDeserializer();
    if (deserializing) {
      this.Clear();
    }
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iRows"), S("Rows"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iCols"), S("Cols"), 0));
    pComp.Value$StdNamingDefaultAdapt$i32$i32($.mkNamingAdapt$ri32$pi8$i32$b$b(P(this, "iDlgShow"), S("DlgShow"), 0));
    if (Math.imul(this.iRows, this.iCols) !== 0) {
      if (deserializing) {
        this.pEntries = $oat($oarr($u64n(Math.imul(this.iRows, this.iCols)), () => new C4Scoreboard$Entry().init()), 0);
      }
      for (let iRow = 0; iRow < this.iRows; iRow = iRow + 1 | 0) {
        for (let iCol = 0; iCol < this.iCols; iCol = iCol + 1 | 0) {
          let pEnt = this.GetCell(iCol, iRow);
          pComp.Value$StdNamingAdapt$StdStrBuf($.mkNamingAdapt$rStdStrBuf$pi8(pEnt.Text, $.FormatString(S("Cell%i_%iString"), iCol, iRow).getData()));
          pComp.Value$StdNamingAdapt$i32($.mkNamingAdapt$ri32$pi8(P(pEnt, "iVal"), $.FormatString(S("Cell%i_%iValue"), iCol, iRow).getData()));
        }
      }
      if (pComp.isDeserializer()) {
        this.DoDlgShow(0, false);
      }
    }
  }

  $clone() { return new C4Scoreboard().$assign(this); }
  $assign(o) {
    this.iRows = o.iRows;
    this.iCols = o.iCols;
    this.pEntries = o.pEntries;
    this.pDlg = o.pDlg;
    this.iDlgShow = o.iDlgShow;
    return this;
  }
}

export class C4Scoreboard$Entry {
  Text = new $.StdStrBuf();
  iVal = 0;

  init() {
    this.Text = new $.StdStrBuf();
    this.iVal = 0;
    return this;
  }

  GrabFrom(pFrom) {
    this.Text.Take$mStdStrBuf(pFrom.Text);
    this.iVal = pFrom.iVal;
  }

  SwapWith(pSwap) {
    let swp = new C4Scoreboard$Entry().init();
    swp.Text.Take$mStdStrBuf(this.Text);
    swp.iVal = this.iVal;
    this.Text.Take$mStdStrBuf(pSwap.Text);
    this.iVal = pSwap.iVal;
    pSwap.Text.Take$mStdStrBuf(swp.Text);
    pSwap.iVal = swp.iVal;
  }

  $clone() { return new C4Scoreboard$Entry().$assign(this); }
  $assign(o) {
    this.Text.$assign(o.Text);
    this.iVal = o.iVal;
    return this;
  }
}

export class C4ScoreboardDlg extends Dialog {
  piColWidths = null;
  pBrd = null;

  init(pForScoreboard) {
    super.init(100, 100, S("nops"), false);
    this.piColWidths = null;
    this.pBrd = pForScoreboard;
    this.$dyn = C4ScoreboardDlg;
    C4ScoreboardDlg.prototype.Update$v.call(this);
    return this;
  }

  $dtor() {
    $delete(this.piColWidths);
    this.pBrd.pDlg = null;
    super.$dtor();
  }

  InvalidateRows() {
    $delete(this.piColWidths);
    this.piColWidths = null;
  }

  Update$v() {
    let iRowCount = this.pBrd.iRows;
    let iColCount = this.pBrd.iCols;
    $delete(this.piColWidths);
    this.piColWidths = null;
    if (iRowCount === 0 || iColCount === 0) {
      return;
    }
    this.piColWidths = P(new Int32Array($u64n(iColCount)), 0);
    let iWdt = 6;
    let iHgt = 6;
    for (let iCol = 0; iCol < iColCount; iCol = iCol + 1 | 0) {
      this.piColWidths.a[this.piColWidths.o + iCol] = 4;
      for (let iRow = 0; iRow < iRowCount; iRow = iRow + 1 | 0) {
        let pCell = this.pBrd.GetCell(iCol, iRow);
        if ((iRow !== 0 || iCol !== 0) && !pCell.Text.isNull()) {
          this.piColWidths.a[this.piColWidths.o + iCol] = $max(this.piColWidths.a[this.piColWidths.o + iCol], $.GraphicsResource.FontRegular.GetTextWidth(pCell.Text.getData()) + 4 | 0);
        }
      }
      iWdt = iWdt + this.piColWidths.a[this.piColWidths.o + iCol] | 0;
    }
    iHgt = iHgt + Math.imul(iRowCount, $.GraphicsResource.FontRegular.GetLineHeight() + 4 | 0) | 0;
    let szTitle = this.pBrd.GetCell(0, 0).Text.getData();
    if (szTitle != null) {
      iWdt = $max(iWdt, $.GraphicsResource.FontRegular.GetTextWidth(szTitle) + 40 | 0);
    }
    if ((this.pTitle == null ? 1 : 0) !== (szTitle == null ? 1 : 0)) {
      this.SetTitle$pi8$b(szTitle);
    }
    iWdt = iWdt + (this.GetMarginLeft() + this.GetMarginRight() | 0) | 0;
    iHgt = iHgt + (this.GetMarginTop() + this.GetMarginBottom() | 0) | 0;
    this.SetBounds(new $.C4Rect().init$i32$i32$i32$i32(this.rcBounds.x, this.rcBounds.y, iWdt, iHgt));
    this.SetTitle$pi8$b(szTitle);
    if (szTitle != null && this.pTitle != null) {
      this.pTitle.SetIcon$C4Facet($.Icon.GetIconFacet$i32(9 /*Ico_Player*/));
    }
    let pScr = this.GetScreen();
    if (pScr != null) {
      this.DoPlacement(pScr, pScr.GetPreferredDlgRect());
    }
  }

  DoPlacement(_pOnScreen, rPreferredDlgRect) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4ScoreboardDlg && C4ScoreboardDlg.prototype instanceof $c) return $c.prototype.DoPlacement.apply(this, arguments); }
    this.SetPos(((rPreferredDlgRect.x + rPreferredDlgRect.Wdt | 0) - this.rcBounds.Wdt | 0) - 20 | 0, rPreferredDlgRect.y + 38 | 0);
    return true;
  }

  Draw$rC4TargetFacet(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4ScoreboardDlg && C4ScoreboardDlg.prototype instanceof $c) return $c.prototype.Draw$rC4TargetFacet.apply(this, arguments); }
    if (this.piColWidths == null) {
      this.Update$v();
    }
    $.Dialog.prototype.Draw$rC4TargetFacet.call(this, cgo);
  }

  DrawElement(cgo) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4ScoreboardDlg && C4ScoreboardDlg.prototype instanceof $c) return $c.prototype.DrawElement.apply(this, arguments); }
    $.Dialog.prototype.DrawElement.call(this, cgo);
    let iRowCount = this.pBrd.iRows;
    let iColCount = this.pBrd.iCols;
    let iY = (3 + ftoi32(cgo.TargetY) | 0) + this.rcClientRect.y | 0;
    for (let iRow = 0; iRow < iRowCount; iRow = iRow + 1 | 0) {
      let iX = (3 + ftoi32(cgo.TargetX) | 0) + this.rcClientRect.x | 0;
      for (let iCol = 0; iCol < iColCount; iCol = iCol + 1 | 0) {
        let szText = this.pBrd.GetCell(iCol, iRow).Text.getData();
        if (szText != null && szText.a[szText.o] !== 0 && (iRow !== 0 || iCol !== 0)) {
          $.pDraw.TextOut(szText, $.GraphicsResource.FontRegular, Math.fround(1), cgo.Surface, Math.fround(iCol !== 0 ? iX + (this.piColWidths.a[this.piColWidths.o + iCol] / 2 | 0) | 0 : iX), Math.fround(iY), 0xffffffff, (iCol !== 0 ? $.ACenter$C4Surface : $.ALeft$C4Surface) & 0xff);
        }
        iX = iX + this.piColWidths.a[this.piColWidths.o + iCol] | 0;
      }
      iY = iY + ($.GraphicsResource.FontRegular.GetLineHeight() + 4 | 0) | 0;
    }
  }

  GetID$v() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4ScoreboardDlg && C4ScoreboardDlg.prototype instanceof $c) return $c.prototype.GetID$v.apply(this, arguments); }
    return S("Scoreboard");
  }

  IsMouseControlled() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4ScoreboardDlg && C4ScoreboardDlg.prototype instanceof $c) return $c.prototype.IsMouseControlled.apply(this, arguments); }
    return false;
  }

  $clone() { return new C4ScoreboardDlg().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.piColWidths = o.piColWidths;
    this.pBrd = o.pBrd;
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4Scoreboard, C4Scoreboard$Entry, C4ScoreboardDlg });
