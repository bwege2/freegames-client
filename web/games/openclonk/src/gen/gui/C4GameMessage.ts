// @ts-nocheck
// OpenClonk 36de799: src/gui/C4GameMessage.cpp, src/gui/C4GameMessage.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n, ftoi32 } from '../../rt/int.ts';
import { P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $max, $min } from '../../rt/std.ts';

export class C4GameMessage {
  X = 0;
  Y = 0;
  Wdt = 0;
  Hgt = 0;
  Delay = 0;
  ColorDw = 0;
  Player = 0;
  Type = 0;
  Target = null;
  Text = new $.StdCopyStrBuf();
  Next = null;
  DecoID = new $.C4ID().init$v();
  PictureDef = null;
  PictureDefVal = new $.C4Value().init$v();
  pFrameDeco = null;
  dwFlags = 0;

  Draw(cgo, iPlayer) {
    if (this.Type === 1 || this.Type === 2 && iPlayer === this.Player) {
      const iTextWdt = [0];
      const iTextHgt = [0];
      let sText = new $.StdStrBuf();
      let x = 0;
      let y = 0;
      let wdt = 0;
      if ((this.dwFlags & 1024) >>> 0 !== 0) {
        x = ftoi32(Math.fround(Math.fround(Math.fround(this.X) * cgo.Wdt) / Math.fround(100)));
      } else {
        x = this.X;
      }
      if ((this.dwFlags & 2048) >>> 0 !== 0) {
        y = ftoi32(Math.fround(Math.fround(Math.fround(this.Y) * cgo.Hgt) / Math.fround(100)));
      } else {
        y = this.Y;
      }
      if ((this.dwFlags & 512) >>> 0 !== 0) {
        wdt = ftoi32(Math.fround(Math.fround(Math.fround(this.Wdt) * cgo.Wdt) / Math.fround(100)));
      } else {
        wdt = this.Wdt;
      }
      if ((~this.dwFlags >>> 0 & 1) >>> 0 !== 0) {
        if (this.PictureDef != null) {
          if (wdt === 0) {
            wdt = $.Clamp$i32$i32$i32(ftoi32(Math.fround(cgo.Wdt / Math.fround(2))), 50, $min(500, ftoi32(Math.fround(cgo.Wdt - Math.fround(10)))));
          }
          let iUnbrokenTextWidth = $.GraphicsResource.FontRegular.GetTextWidth(this.Text.getData(), true);
          wdt = $min(wdt, iUnbrokenTextWidth + 10 | 0);
        } else {
          if (wdt === 0) {
            wdt = $.Clamp$i32$i32$i32(ftoi32(Math.fround(cgo.Wdt - Math.fround(50))), 50, 500);
          } else {
            wdt = $.Clamp$i32$i32$i32(wdt, 10, ftoi32(Math.fround(cgo.Wdt - Math.fround(10))));
          }
        }
        iTextWdt[0] = ftoi32(Math.fround(Math.fround(wdt) * cgo.Zoom));
        iTextHgt[0] = $.GraphicsResource.FontRegular.BreakMessage$pi8$i32$pStdStrBuf$b$f32(this.Text.getData(), iTextWdt[0], sText, true);
      } else {
        $.GraphicsResource.FontRegular.GetTextExtent(this.Text.getData(), P(iTextWdt, 0), P(iTextHgt, 0), true);
        sText.Ref$StdStrBuf(this.Text);
      }
      let iDrawX = ftoi32(Math.fround(cgo.X + Math.fround(x)));
      let iDrawY = ftoi32(Math.fround(cgo.Y + Math.fround(y)));
      if (this.PictureDef != null) {
        if ((this.dwFlags & 2) >>> 0 !== 0) {
          iDrawY = ftoi32(Math.fround(Math.fround(iDrawY) + cgo.Hgt));
        } else if ((this.dwFlags & 128) >>> 0 !== 0) {
          iDrawY = ftoi32(Math.fround(Math.fround(iDrawY) + Math.fround(cgo.Hgt / Math.fround(2))));
        }
        if ((this.dwFlags & 32) >>> 0 !== 0) {
          iDrawX = ftoi32(Math.fround(Math.fround(iDrawX) + cgo.Wdt));
        } else if ((this.dwFlags & 64) >>> 0 !== 0) {
          iDrawX = ftoi32(Math.fround(Math.fround(iDrawX) + Math.fround(cgo.Wdt / Math.fround(2))));
        }
        if (this.pFrameDeco != null) {
          iDrawX = ftoi32(Math.fround(Math.fround(iDrawX) * cgo.Zoom));
          iDrawY = ftoi32(Math.fround(Math.fround(iDrawY) * cgo.Zoom));
          let rect = new $.C4Rect().init$i32$i32$i32$i32(ftoi32(Math.fround(Math.fround(iDrawX) - cgo.TargetX)), ftoi32(Math.fround(Math.fround(iDrawY) - cgo.TargetY)), (((iTextWdt[0] + $.PictureWidth | 0) + $.PictureIndent | 0) + this.pFrameDeco.iBorderLeft | 0) + this.pFrameDeco.iBorderRight | 0, ($max(iTextHgt[0], $.PictureWidth) + this.pFrameDeco.iBorderTop | 0) + this.pFrameDeco.iBorderBottom | 0);
          if ((this.dwFlags & 2) >>> 0 !== 0) {
            rect.y = rect.y - rect.Hgt | 0;
            iDrawY = iDrawY - rect.Hgt | 0;
          } else if ((this.dwFlags & 128) >>> 0 !== 0) {
            rect.y = rect.y - (rect.Hgt / 2 | 0) | 0;
            iDrawY = iDrawY - (rect.Hgt / 2 | 0) | 0;
          }
          if ((this.dwFlags & 32) >>> 0 !== 0) {
            rect.x = rect.x - rect.Wdt | 0;
            iDrawX = iDrawX - rect.Wdt | 0;
          } else if ((this.dwFlags & 64) >>> 0 !== 0) {
            rect.x = rect.x - (rect.Wdt / 2 | 0) | 0;
            iDrawX = iDrawX - (rect.Wdt / 2 | 0) | 0;
          }
          this.pFrameDeco.Draw(cgo, rect);
          iDrawX = iDrawX + this.pFrameDeco.iBorderLeft | 0;
          iDrawY = iDrawY + this.pFrameDeco.iBorderTop | 0;
        } else {
          iDrawY = iDrawY - iTextHgt[0] | 0;
        }
        let facet = new $.C4Facet().init$pC4Surface$f32$f32$f32$f32(cgo.Surface, Math.fround(iDrawX), Math.fround(iDrawY), Math.fround($.PictureWidth), Math.fround($.PictureWidth));
        if (this.PictureDef.GetObject$v() != null) {
          this.PictureDef.GetObject$v().DrawPicture(facet);
        } else if (this.PictureDef.GetDef$v() != null) {
          this.PictureDef.GetDef$v().Draw$rC4Facet$b$u32$pC4Object$i32$i32$pC4DrawTransform$pi8(facet);
        } else {
          $.Game.DrawPropListSpecImage(facet, this.PictureDef);
        }
        $.pDraw.TextOut(sText.getData(), $.GraphicsResource.FontRegular, Math.fround(1), cgo.Surface, Math.fround((iDrawX + $.PictureWidth | 0) + $.PictureIndent | 0), Math.fround(iDrawY), this.ColorDw, 0);
      } else {
        iDrawX = ftoi32(Math.fround(Math.fround(iDrawX) + Math.fround(Math.fround(cgo.Wdt / Math.fround(2)) * cgo.Zoom)));
        iDrawY = ftoi32(Math.fround(Math.fround(iDrawY) + Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(2) * cgo.Hgt) / Math.fround(3)) + Math.fround(50)) * cgo.Zoom)));
        if (!((this.dwFlags & 2) >>> 0 !== 0)) {
          iDrawY = iDrawY + $.DrawMessageOffset | 0;
        }
        $.pDraw.TextOut(sText.getData(), $.GraphicsResource.FontRegular, Math.fround(1), cgo.Surface, Math.fround(iDrawX), Math.fround(iDrawY), this.ColorDw, 1);
      }
    } else if (this.Type === 3 || this.Type === 4 && iPlayer === this.Player) {
      const iMsgX = [0];
      const iMsgY = [0];
      const newzoom = [0];
      this.Target.GetDrawPosition$C4TargetFacet$rf32$rf32$rf32(cgo, P(iMsgX, 0), P(iMsgY, 0), P(newzoom, 0));
      if ((~this.dwFlags >>> 0 & 2048) >>> 0 !== 0) {
        iMsgY[0] = Math.fround(iMsgY[0] - Math.fround((this.Target.Def.Shape.Hgt / 2 | 0) + 5 | 0));
      }
      iMsgX[0] = Math.fround(iMsgX[0] + Math.fround(this.X));
      iMsgY[0] = Math.fround(iMsgY[0] + Math.fround(this.Y));
      if ($.Inside$f32$i32$f32(Math.fround(Math.fround(iMsgX[0] - cgo.X) * newzoom[0]), 0, Math.fround(Math.fround(cgo.Wdt * cgo.Zoom) - Math.fround(1))) || (this.dwFlags & 1024) >>> 0 !== 0) {
        if ($.Inside$f32$i32$f32(Math.fround(Math.fround(iMsgY[0] - cgo.Y) * newzoom[0]), 0, Math.fround(Math.fround(cgo.Hgt * cgo.Zoom) - Math.fround(1))) || (this.dwFlags & 2048) >>> 0 !== 0) {
          if (this.Type === 3) {
            if (!this.Target.IsVisible(iPlayer, false)) {
              return;
            }
          }
          let sText = new $.StdStrBuf();
          if ((~this.dwFlags >>> 0 & 1) >>> 0 !== 0) {
            let breakWdt = $.Clamp$i32$i32$i32(ftoi32(Math.fround(cgo.Wdt * cgo.Zoom)), 50, 200);
            if (this.Wdt !== 0) {
              breakWdt = this.Wdt;
            }
            $.GraphicsResource.FontRegular.BreakMessage$pi8$i32$pStdStrBuf$b$f32(this.Text.getData(), breakWdt, sText, true);
          } else {
            sText.Ref$StdStrBuf(this.Text);
          }
          if ((this.dwFlags & 2) >>> 0 !== 0) {
            iMsgY[0] = Math.fround(iMsgY[0] + Math.fround(this.Hgt));
          } else if ((this.dwFlags & 8) >>> 0 !== 0) {
            ;
          } else if ((this.dwFlags & 128) >>> 0 !== 0) {
            iMsgY[0] = Math.fround(iMsgY[0] + Math.fround(this.Hgt / 2 | 0));
          }
          let alignment = 1;
          if ((this.dwFlags & 16) >>> 0 !== 0) {
            alignment = 0;
          } else if ((this.dwFlags & 32) >>> 0 !== 0) {
            alignment = 2;
            iMsgX[0] = Math.fround(iMsgX[0] + Math.fround(this.Wdt));
          } else if ((this.dwFlags & 64) >>> 0 !== 0) {
            iMsgX[0] = Math.fround(iMsgX[0] + Math.fround(this.Wdt / 2 | 0));
          }
          let iTX = 0;
          let iTY = 0;
          iTX = Math.fround(Math.fround(iMsgX[0] - cgo.X) * newzoom[0]);
          iTY = Math.fround(Math.fround(iMsgY[0] - cgo.Y) * newzoom[0]);
          const iTWdt = [0];
          const iTHgt = [0];
          $.GraphicsResource.FontRegular.GetTextExtent(sText.getData(), P(iTWdt, 0), P(iTHgt, 0), true);
          let zoom = Math.fround(1);
          if ((this.dwFlags & 4096) >>> 0 !== 0) {
            zoom = cgo.Zoom;
          }
          if ((this.dwFlags & 2) >>> 0 !== 0) {
            iTY = Math.fround(iTY - Math.fround(zoom * Math.fround(iTHgt[0])));
          } else if ((this.dwFlags & 128) >>> 0 !== 0) {
            iTY = Math.fround(iTY - Math.fround(zoom * Math.fround(iTHgt[0] / 2 | 0)));
          } else if ((~this.dwFlags >>> 0 & 8) >>> 0 !== 0) {
            iTY = Math.fround(iTY - Math.fround(zoom * Math.fround(iTHgt[0])));
          }
          if ((this.dwFlags & 32) >>> 0 !== 0) {
            iTX = Math.fround(iTX + Math.fround(Math.fround(0.25 * Math.fround(iTWdt[0])) * Math.fround(1 - zoom)));
          }
          if ((~this.dwFlags >>> 0 & 1024) >>> 0 !== 0) {
            iTX = Math.fround($.Clamp$f32$f32$f32(iTX, Math.fround(iTWdt[0] / 2 | 0), Math.fround(Math.fround(cgo.Wdt * cgo.Zoom) - Math.fround(iTWdt[0] / 2 | 0))) + 0.5);
          }
          if ((~this.dwFlags >>> 0 & 2048) >>> 0 !== 0) {
            iTY = Math.fround($.Clamp$f32$f32$f32(iTY, Math.fround(0), Math.fround(Math.fround(cgo.Hgt * cgo.Zoom) - Math.fround(iTHgt[0]))) + 0.5);
          }
          $.pDraw.TextOut(sText.getData(), $.GraphicsResource.FontRegular, zoom, cgo.Surface, Math.fround(cgo.X + iTX), Math.fround(cgo.Y + iTY), this.ColorDw, alignment & 0xff);
          return;
        }
      }
    }
  }

  init() {
    this.Text = new $.StdCopyStrBuf();
    this.DecoID = new $.C4ID().init$v();
    this.PictureDefVal = new $.C4Value().init$v();
    this.pFrameDeco = null;
    return this;
  }

  $dtor() {
    $delete(this.pFrameDeco);
  }

  Init(iType, sText, pTarget, iPlayer, iX, iY, dwClr, idDecoID, pSrc, dwFlags, width) {
    if (pTarget != null && pTarget.Status === 0) {
      pTarget = null;
    }
    this.Text.Copy$StdStrBuf(sText);
    this.Target = pTarget;
    this.X = iX;
    this.Y = iY;
    this.Wdt = width;
    this.Hgt = 0;
    this.Player = iPlayer;
    this.ColorDw = dwClr;
    this.Type = iType;
    this.Delay = $max($.C4GM_MinDelay$C4GameMessage, this.Text.getLength() * $u64n(this.Target != null ? $.ObjectMsgDelayFactor$C4GameMessage : $.GlobalMsgDelayFactor$C4GameMessage) | 0);
    this.DecoID.$assign(idDecoID);
    this.dwFlags = dwFlags;
    this.PictureDef = null;
    this.PictureDefVal.Set0();
    if (pSrc != null) {
      if (this.Target != null) {
        let val = new $.C4Value().init$v();
        if (pSrc.GetProperty(35 /*P_Wdt*/, val)) {
          this.Wdt = val.getInt();
        }
        if (pSrc.GetProperty(36 /*P_Hgt*/, val)) {
          this.Hgt = val.getInt();
        }
      }
      this.PictureDef = pSrc.GetObject$v();
      if (this.PictureDef == null) {
        this.PictureDef = pSrc.GetDef$v();
      }
      if (this.PictureDef == null && pSrc.GetPropertyPropList(140 /*P_Source*/) != null) {
        this.PictureDef = pSrc;
        this.PictureDefVal.SetPropList(pSrc);
      }
    }
    if (64 === this.Text.op_index(0)) {
      this.Delay = -1;
      this.Text.Move(1, this.Text.getLength());
      this.Text.Shrink(1);
    }
    $delete(this.pFrameDeco);
    this.pFrameDeco = null;
    if (this.DecoID.op_unsigned_long_C4ID_() != null) {
      this.pFrameDeco = new $.FrameDecoration().init();
      if (!this.pFrameDeco.SetByDef$C4ID(this.DecoID.$clone())) {
        $delete(this.pFrameDeco);
        this.pFrameDeco = null;
      }
    }
  }

  Append(szText, fNoDuplicates = false) {
    if (fNoDuplicates) {
      for (let pPos = this.Text.getData(); pPos.a[pPos.o] !== 0; pPos = $.SAdvancePast(pPos, 124)) {
        if ($.SEqual2(pPos, szText)) {
          return;
        }
      }
    }
    this.Text.AppendFormat(S("|%s"), szText);
    this.Delay = $u64n(this.Delay) + $.SLen(szText) * $u64n(this.Target != null ? $.ObjectMsgDelayFactor$C4GameMessage : $.GlobalMsgDelayFactor$C4GameMessage) | 0;
  }

  Execute() {
    if (this.Delay > 0) {
      this.Delay = this.Delay - 1 | 0;
    }
    if (this.Delay === 0) {
      return false;
    }
    return true;
  }

  UpdateDef(_idUpdDef) {
    if (this.pFrameDeco != null) {
      if (!this.pFrameDeco.UpdateGfx()) {
        $delete(this.pFrameDeco);
        this.pFrameDeco = null;
      }
    }
  }

  GetPositioningFlags() {
    return (this.dwFlags & 250) >>> 0 | 0;
  }

  $clone() { return new C4GameMessage().$assign(this); }
  $assign(o) {
    this.X = o.X;
    this.Y = o.Y;
    this.Wdt = o.Wdt;
    this.Hgt = o.Hgt;
    this.Delay = o.Delay;
    this.ColorDw = o.ColorDw;
    this.Player = o.Player;
    this.Type = o.Type;
    this.Target = o.Target;
    this.Text.$assign(o.Text);
    this.Next = o.Next;
    this.DecoID.$assign(o.DecoID);
    this.PictureDef = o.PictureDef;
    this.PictureDefVal.$assign(o.PictureDefVal);
    this.pFrameDeco = o.pFrameDeco;
    this.dwFlags = o.dwFlags;
    return this;
  }
}

export class C4GameMessageList {
  First = null;

  init() {
    C4GameMessageList.prototype.Default.call(this);
    return this;
  }

  $dtor() {
    C4GameMessageList.prototype.Clear.call(this);
  }

  Default() {
    this.First = null;
  }

  Clear() {
    let cmsg = null;
    let next = null;
    for (cmsg = this.First; cmsg != null; cmsg = next) {
      next = cmsg.Next;
      $delete(cmsg);
    }
    this.First = null;
  }

  Execute() {
    let cmsg = null;
    let next = null;
    let prev = null;
    for (cmsg = this.First; cmsg != null; cmsg = next) {
      next = cmsg.Next;
      if (!cmsg.Execute()) {
        $delete(cmsg);
        if (prev != null) {
          prev.Next = next;
        } else {
          this.First = next;
        }
      } else {
        prev = cmsg;
      }
    }
  }

  Draw(gui_cgo, cgo, iPlayer) {
    let cmsg = null;
    for (cmsg = this.First; cmsg != null; cmsg = cmsg.Next) {
      if (cmsg.Target != null && (cmsg.Target.Category & 32768) !== 0 || cmsg.Type === 1 || cmsg.Type === 2) {
        cmsg.Draw(gui_cgo, iPlayer);
      } else {
        cmsg.Draw(cgo, iPlayer);
      }
    }
  }

  ClearPlayers(iPlayer, dwPositioningFlags) {
    let cmsg = null;
    let next = null;
    let prev = null;
    for (cmsg = this.First; cmsg != null; cmsg = next) {
      next = cmsg.Next;
      if ((cmsg.Type === 1 || cmsg.Type === 2) && cmsg.Player === iPlayer && cmsg.GetPositioningFlags() === dwPositioningFlags) {
        $delete(cmsg);
        if (prev != null) {
          prev.Next = next;
        } else {
          this.First = next;
        }
      } else {
        prev = cmsg;
      }
    }
  }

  ClearPointers(pObj) {
    let cmsg = null;
    let next = null;
    let prev = null;
    for (cmsg = this.First; cmsg != null; cmsg = next) {
      next = cmsg.Next;
      if (cmsg.Target === pObj) {
        $delete(cmsg);
        if (prev != null) {
          prev.Next = next;
        } else {
          this.First = next;
        }
      } else {
        prev = cmsg;
      }
    }
  }

  UpdateDef(idUpdDef) {
    let cmsg = null;
    for (cmsg = this.First; cmsg != null; cmsg = cmsg.Next) {
      cmsg.UpdateDef(idUpdDef.$clone());
    }
  }

  New$i32$StdStrBuf$pC4Object$i32$i32$i32$u32$C4ID$pC4PropList$u32$i32(iType, sText, pTarget, iPlayer, iX = -1, iY = -1, dwClr = 0xffffffff, idDecoID = $.C4ID.None.$clone(), pSrc = null, dwFlags = 0, width = 0) {
    if (!((dwFlags & 4) >>> 0 !== 0)) {
      if (pTarget != null) {
        this.ClearPointers(pTarget);
      }
      if (iType === 1 || iType === 2) {
        this.ClearPlayers(iPlayer, (dwFlags & 250) >>> 0 | 0);
      }
    }
    if (pTarget != null && pTarget.Status === 0) {
      return false;
    }
    if (!(sText.getLength() !== 0)) {
      return true;
    }
    let msgNew = new C4GameMessage().init();
    msgNew.Init(iType, sText, pTarget, iPlayer, iX, iY, dwClr, idDecoID.$clone(), pSrc, dwFlags, width);
    msgNew.Next = this.First;
    this.First = msgNew;
    return true;
  }

  New$i32$pi8$pC4Object$i32$i32$i32$u32$C4ID$pC4PropList$u32$i32(iType, szText, pTarget, iPlayer, iX, iY, dwClr, idDecoID = $.C4ID.None.$clone(), pSrc = null, dwFlags = 0, width = 0) {
    return this.New$i32$StdStrBuf$pC4Object$i32$i32$i32$u32$C4ID$pC4PropList$u32$i32(iType, new $.StdStrBuf().init$pi8$b(szText), pTarget, iPlayer, iX, iY, dwClr, idDecoID.$clone(), pSrc, dwFlags, width);
  }

  Append(iType, szText, pTarget, iPlayer, iX, iY, bCol, fNoDuplicates = false) {
    let cmsg = null;
    if (iType === 3) {
      for (cmsg = $.Messages.First; cmsg != null; cmsg = cmsg.Next) {
        if (pTarget === cmsg.Target) {
          break;
        }
      }
    }
    if (iType === 1 || iType === 2) {
      for (cmsg = $.Messages.First; cmsg != null; cmsg = cmsg.Next) {
        if (iPlayer === cmsg.Player) {
          break;
        }
      }
    }
    if (cmsg == null || pTarget !== cmsg.Target) {
      this.New$i32$pi8$pC4Object$i32$i32$i32$u32$C4ID$pC4PropList$u32$i32(iType, szText, pTarget, iPlayer, iX, iY, bCol);
    } else {
      cmsg.Append(szText, fNoDuplicates);
    }
    return true;
  }

  $clone() { return new C4GameMessageList().$assign(this); }
  $assign(o) {
    this.First = o.First;
    return this;
  }
}























export function GameMsgObject(szText, pTarget) {
  $.Messages.New$i32$pi8$pC4Object$i32$i32$i32$u32$C4ID$pC4PropList$u32$i32(3, szText, pTarget, -1, 0, 0, 0xffffffff);
}

export function GameMsgObjectPlayer(szText, pTarget, iPlayer) {
  $.Messages.New$i32$pi8$pC4Object$i32$i32$i32$u32$C4ID$pC4PropList$u32$i32(4, szText, pTarget, iPlayer, 0, 0, 0xffffffff);
}

export function GameMsgObjectDw(szText, pTarget, dwClr) {
  $.Messages.New$i32$pi8$pC4Object$i32$i32$i32$u32$C4ID$pC4PropList$u32$i32(3, szText, pTarget, -1, 0, 0, dwClr);
}



export function GameMsgObjectError(szText, pTarget, Red = true) {
  $.Messages.New$i32$pi8$pC4Object$i32$i32$i32$u32$C4ID$pC4PropList$u32$i32(4, szText, pTarget, pTarget.Controller, 0, 0, Red ? 0xffca0000 : 0xffffffff);
}



export function $init(): void {
  $.C4GM_MaxText$C4GameMessage = 256;
  $.C4GM_MinDelay$C4GameMessage = 20;
  $.C4GM_Global$C4GameMessage = 1;
  $.C4GM_GlobalPlayer$C4GameMessage = 2;
  $.ObjectMsgDelayFactor$C4GameMessage = 2;
  $.C4GM_Target$C4GameMessage = 3;
  $.GlobalMsgDelayFactor$C4GameMessage = 3;
  $.C4GM_TargetPlayer$C4GameMessage = 4;
  $.C4GM_NoBreak$C4GameMessage = 1;
  $.C4GM_Bottom$C4GameMessage = 2;
  $.C4GM_Multiple$C4GameMessage = 4;
  $.C4GM_Top$C4GameMessage = 8;
  $.C4GM_Left$C4GameMessage = 16;
  $.C4GM_Right$C4GameMessage = 32;
  $.C4GM_HCenter$C4GameMessage = 64;
  $.C4GM_VCenter$C4GameMessage = 128;
  $.C4GM_DropSpeech$C4GameMessage = 256;
  $.C4GM_WidthRel$C4GameMessage = 512;
  $.C4GM_XRel$C4GameMessage = 1024;
  $.C4GM_YRel$C4GameMessage = 2048;
  $.C4GM_Zoom$C4GameMessage = 4096;
  $.C4GM_PositioningFlags$C4GameMessage = 250;
  $.DrawMessageOffset = -35;
  $.PictureWidth = 64;
  $.PictureIndent = 10;
  $.Messages = new C4GameMessageList(); $.Messages.init();
}

Object.assign($, { C4GameMessage, C4GameMessageList, GameMsgObject, GameMsgObjectDw, GameMsgObjectError, GameMsgObjectPlayer });
