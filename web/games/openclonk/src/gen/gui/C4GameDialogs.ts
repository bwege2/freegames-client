// @ts-nocheck
// OpenClonk 36de799: src/gui/C4GameDialogs.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { ConfirmationDialog } from './C4Gui.ts';
import { S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';

export class C4AbortGameDialog extends ConfirmationDialog {
  static is_shown;
  fGameHalted = false;

  init() {
    super.init($.LoadResStr(S("IDS_HOLD_ABORT")), $.LoadResStr(S("IDS_DLG_ABORT")), null, 12, true, 33 /*Ico_Exit*/);
    this.fGameHalted = false;
    this.$dyn = C4AbortGameDialog;
    C4AbortGameDialog.is_shown = true;
    return this;
  }

  $dtor() {
    C4AbortGameDialog.is_shown = false;
    super.$dtor();
  }

  OnShown$v() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4AbortGameDialog && C4AbortGameDialog.prototype instanceof $c) return $c.prototype.OnShown$v.apply(this, arguments); }
    if (!$.Network.isEnabled()) {
      this.fGameHalted = true;
      $.Game.HaltCount = $.Game.HaltCount + 1 | 0;
    }
  }

  OnClosed(fOK) {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4AbortGameDialog && C4AbortGameDialog.prototype instanceof $c) return $c.prototype.OnClosed.apply(this, arguments); }
    if (this.fGameHalted) {
      $.Game.HaltCount = $.Game.HaltCount - 1 | 0;
    }
    $.ConfirmationDialog.prototype.OnClosed.call(this, fOK);
    if (fOK) {
      $.Game.Abort();
    }
  }

  GetID$v() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4AbortGameDialog && C4AbortGameDialog.prototype instanceof $c) return $c.prototype.GetID$v.apply(this, arguments); }
    return S("AbortGameDialog");
  }

  IsFreePlaceDialog() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4AbortGameDialog && C4AbortGameDialog.prototype instanceof $c) return $c.prototype.IsFreePlaceDialog.apply(this, arguments); }
    return true;
  }

  IsExclusiveDialog() {
    { const $c = this.$dyn; if ($c !== undefined && $c !== C4AbortGameDialog && C4AbortGameDialog.prototype instanceof $c) return $c.prototype.IsExclusiveDialog.apply(this, arguments); }
    return true;
  }

  static IsShown() {
    return C4AbortGameDialog.is_shown;
  }

  $clone() { return new C4AbortGameDialog().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.fGameHalted = o.fGameHalted;
    return this;
  }
}

export function $init(): void {
  C4AbortGameDialog.is_shown = false;
}

Object.assign($, { C4AbortGameDialog });
