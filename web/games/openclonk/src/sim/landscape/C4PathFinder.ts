// @ts-nocheck
// OpenClonk 36de799: src/landscape/C4PathFinder.cpp, src/landscape/C4PathFinder.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { ftoi32 } from '../../rt/int.ts';
import { P } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete } from '../../rt/std.ts';

export class C4PathFinder {
  PointFree = null;
  SetWaypoint = null;
  FirstRay = null;
  Success = false;
  TransferZones = null;
  TransferZonesEnabled = false;
  Level = 0;

  init() {
    this.PointFree = null;
    this.SetWaypoint = null;
    C4PathFinder.prototype.Default.call(this);
    return this;
  }

  $dtor() {
    C4PathFinder.prototype.Clear.call(this);
  }

  Draw(cgo) {
    if (this.TransferZones != null) {
      this.TransferZones.Draw(cgo);
    }
    for (let pRay = this.FirstRay; pRay != null; pRay = pRay.Next) {
      pRay.Draw(cgo);
    }
  }

  Clear() {
    let pRay = null;
    let pNext = null;
    for (pRay = this.FirstRay; pRay != null; pRay = pNext) {
      pNext = pRay.Next;
      $delete(pRay);
    }
    this.FirstRay = null;
  }

  Default() {
    this.PointFree = null;
    this.SetWaypoint = null;
    this.FirstRay = null;
    this.Success = false;
    this.TransferZones = null;
    this.TransferZonesEnabled = true;
    this.Level = 1;
  }

  Init(fnPointFree, pTransferZones = null) {
    this.PointFree = fnPointFree;
    this.TransferZones = pTransferZones;
  }

  Find(iFromX, iFromY, iToX, iToY, fnSetWaypoint) {
    this.Clear();
    if (fnSetWaypoint == null) {
      return false;
    }
    this.SetWaypoint = fnSetWaypoint;
    if (!this.PointFree(iFromX, iFromY) || !this.PointFree(iToX, iToY)) {
      return false;
    }
    if (!this.AddRay(iFromX, iFromY, iToX, iToY, 0, -1, null)) {
      return false;
    }
    if (!this.AddRay(iFromX, iFromY, iToX, iToY, 0, 1, null)) {
      return false;
    }
    this.Run();
    return this.Success;
  }

  EnableTransferZones(fEnabled) {
    this.TransferZonesEnabled = fEnabled;
  }

  SetLevel(iLevel) {
    this.Level = $.Clamp$i32$i32$i32(iLevel, 1, 10);
  }

  Run() {
    if (this.TransferZones != null) {
      this.TransferZones.ClearUsed();
    }
    this.Success = false;
    while (!this.Success && this.Execute()) {
    }
  }

  AddRay(iFromX, iFromY, iToX, iToY, iDepth, iDirection, pFrom, pUseZone = null) {
    if (iDepth >= Math.imul(35, this.Level)) {
      return false;
    }
    let pRay = null;
    if (!((pRay = new C4PathFinderRay().init()) != null)) {
      return false;
    }
    pRay.X = iFromX;
    pRay.Y = iFromY;
    pRay.X2 = iFromX;
    pRay.Y2 = iFromY;
    pRay.TargetX = iToX;
    pRay.TargetY = iToY;
    pRay.Depth = iDepth;
    pRay.Direction = iDirection;
    pRay.From = pFrom;
    pRay.pPathFinder = this;
    pRay.Next = this.FirstRay;
    pRay.UseZone = pUseZone;
    this.FirstRay = pRay;
    return true;
  }

  SplitRay(pRay, iAtX, iAtY) {
    if (pRay.Depth >= Math.imul(35, this.Level)) {
      return false;
    }
    let pNewRay = null;
    if (!((pNewRay = new C4PathFinderRay().init()) != null)) {
      return false;
    }
    pNewRay.Status = 2;
    pNewRay.X = pRay.X;
    pNewRay.Y = pRay.Y;
    pNewRay.X2 = iAtX;
    pNewRay.Y2 = iAtY;
    pNewRay.TargetX = pRay.TargetX;
    pNewRay.TargetY = pRay.TargetY;
    pNewRay.Depth = pRay.Depth;
    pNewRay.Direction = pRay.Direction;
    pNewRay.From = pRay.From;
    pNewRay.pPathFinder = this;
    pNewRay.Next = this.FirstRay;
    this.FirstRay = pNewRay;
    pRay.From = pNewRay;
    pRay.X = iAtX;
    pRay.Y = iAtY;
    return true;
  }

  Execute() {
    let fContinue = false;
    let iRays = 0;
    for (let pRay = this.FirstRay; pRay != null && !this.Success; pRay = pRay.Next, iRays = iRays + 1 | 0) {
      if (pRay.Execute()) {
        fContinue = true;
      }
    }
    if (iRays >= 350) {
      return false;
    }
    if ($.GraphicsSystem.ShowPathfinder) {
      if (!('C4PathFinder$Execute$iDelay' in $)) $.C4PathFinder$Execute$iDelay = 0;
      $.C4PathFinder$Execute$iDelay = $.C4PathFinder$Execute$iDelay + 1 | 0;
      if ($.C4PathFinder$Execute$iDelay > 10) {
        $.C4PathFinder$Execute$iDelay = 0;
        $.GraphicsSystem.Execute();
      }
    }
    return fContinue;
  }

  $clone() { return new C4PathFinder().$assign(this); }
  $assign(o) {
    this.PointFree = o.PointFree;
    this.SetWaypoint = o.SetWaypoint;
    this.FirstRay = o.FirstRay;
    this.Success = o.Success;
    this.TransferZones = o.TransferZones;
    this.TransferZonesEnabled = o.TransferZonesEnabled;
    this.Level = o.Level;
    return this;
  }
}

export class C4PathFinderRay {
  Status = 0;
  X = 0;
  Y = 0;
  X2 = 0;
  Y2 = 0;
  TargetX = 0;
  TargetY = 0;
  CrawlStartX = 0;
  CrawlStartY = 0;
  CrawlAttach = 0;
  CrawlLength = 0;
  CrawlStartAttach = 0;
  Direction = 0;
  Depth = 0;
  UseZone = null;
  From = null;
  Next = null;
  pPathFinder = null;

  init() {
    C4PathFinderRay.prototype.Default.call(this);
    return this;
  }

  $dtor() {
    C4PathFinderRay.prototype.Clear.call(this);
  }

  Clear() {
  }

  Default() {
    this.Status = 0;
    this.X = this.Y = this.X2 = this.Y2 = this.TargetX = this.TargetY = 0;
    this.Direction = 0;
    this.Depth = 0;
    this.UseZone = null;
    this.From = null;
    this.Next = null;
    this.pPathFinder = null;
    this.CrawlStartX = this.CrawlStartY = this.CrawlAttach = 0;
  }

  SetCompletePath() {
    let pRay = null;
    for (pRay = this; pRay.From != null; pRay = pRay.From) {
      while (pRay.CheckBackRayShorten()) {
      }
    }
    for (pRay = this; pRay.From != null; pRay = pRay.From) {
      if (pRay.UseZone != null) {
        this.pPathFinder.SetWaypoint(pRay.X2, pRay.Y2, pRay.UseZone.Object);
      } else {
        this.pPathFinder.SetWaypoint(pRay.From.X2, pRay.From.Y2, null);
      }
    }
  }

  TurnAttach(rAttach, iDirection) {
    rAttach.a[rAttach.o] = rAttach.a[rAttach.o] + iDirection | 0;
    if (rAttach.a[rAttach.o] > 4) {
      rAttach.a[rAttach.o] = 1;
    }
    if (rAttach.a[rAttach.o] < 1) {
      rAttach.a[rAttach.o] = 4;
    }
  }

  CrawlToAttach(rX, rY, iAttach) {
    switch (iAttach) {
      case 1:
        rY.a[rY.o] = rY.a[rY.o] - 1 | 0;
        break;
      case 3:
        rY.a[rY.o] = rY.a[rY.o] + 1 | 0;
        break;
      case 4:
        rX.a[rX.o] = rX.a[rX.o] - 1 | 0;
        break;
      case 2:
        rX.a[rX.o] = rX.a[rX.o] + 1 | 0;
        break;
    }
  }

  CrawlByAttach(rX, rY, iAttach, iDirection) {
    switch (iAttach) {
      case 1:
        rX.a[rX.o] = rX.a[rX.o] + iDirection | 0;
        break;
      case 3:
        rX.a[rX.o] = rX.a[rX.o] - iDirection | 0;
        break;
      case 4:
        rY.a[rY.o] = rY.a[rY.o] - iDirection | 0;
        break;
      case 2:
        rY.a[rY.o] = rY.a[rY.o] + iDirection | 0;
        break;
    }
  }

  Draw(cgo) {
    let Color = 0xffff0000;
    switch (this.Status) {
      case 1:
        Color = 0xffff0000;
        break;
      case 2:
        Color = 0xff500000;
        break;
      case 3:
        Color = 0xffffff00;
        break;
      case 4:
        Color = 0xff595959;
        break;
    }
    if (this.UseZone != null) {
      Color = 0xff0000ff;
    }
    if (this.Status === 1) {
      const iX = [0];
      const iY = [0];
      this.CrawlToAttach(P(iX, 0), P(iY, 0), this.CrawlAttach);
      $.pDraw.DrawLineDw(cgo.Surface, Math.fround(Math.fround(cgo.X + Math.fround(this.X2)) - cgo.TargetX), Math.fround(Math.fround(cgo.Y + Math.fround(this.Y2)) - cgo.TargetY), Math.fround(Math.fround(Math.fround(cgo.X + Math.fround(this.X2)) - cgo.TargetX) + Math.fround(Math.imul(7, iX[0]))), Math.fround(Math.fround(Math.fround(cgo.Y + Math.fround(this.Y2)) - cgo.TargetY) + Math.fround(Math.imul(7, iY[0]))), 0xffff0000);
    }
    $.pDraw.DrawLineDw(cgo.Surface, Math.fround(Math.fround(cgo.X + Math.fround(this.X)) - cgo.TargetX), Math.fround(Math.fround(cgo.Y + Math.fround(this.Y)) - cgo.TargetY), Math.fround(Math.fround(cgo.X + Math.fround(this.X2)) - cgo.TargetX), Math.fround(Math.fround(cgo.Y + Math.fround(this.Y2)) - cgo.TargetY), Color);
    $.pDraw.DrawFrameDw(cgo.Surface, ftoi32(Math.fround(Math.fround(Math.fround(cgo.X + Math.fround(this.X2)) - cgo.TargetX) - Math.fround(1))), ftoi32(Math.fround(Math.fround(Math.fround(cgo.Y + Math.fround(this.Y2)) - cgo.TargetY) - Math.fround(1))), ftoi32(Math.fround(Math.fround(Math.fround(cgo.X + Math.fround(this.X2)) - cgo.TargetX) + Math.fround(1))), ftoi32(Math.fround(Math.fround(Math.fround(cgo.Y + Math.fround(this.Y2)) - cgo.TargetY) + Math.fround(1))), this.Status === 1 ? this.Direction === -1 ? 0xff00ff00 : 0xff0000ff : Color);
    $.pDraw.DrawFrameDw(cgo.Surface, ftoi32(Math.fround(Math.fround(Math.fround(cgo.X + Math.fround(this.TargetX)) - cgo.TargetX) - Math.fround(2))), ftoi32(Math.fround(Math.fround(Math.fround(cgo.Y + Math.fround(this.TargetY)) - cgo.TargetY) - Math.fround(2))), ftoi32(Math.fround(Math.fround(Math.fround(cgo.X + Math.fround(this.TargetX)) - cgo.TargetX) + Math.fround(2))), ftoi32(Math.fround(Math.fround(Math.fround(cgo.Y + Math.fround(this.TargetY)) - cgo.TargetY) + Math.fround(2))), 0xffffff00);
  }

  FindCrawlAttachDiagonal(iX, iY, iDirection) {
    if (iDirection === -1) {
      if (!this.PointFree(iX - 1 | 0, iY - 1 | 0)) {
        return 1;
      }
      if (!this.PointFree(iX - 1 | 0, iY + 1 | 0)) {
        return 4;
      }
      if (!this.PointFree(iX + 1 | 0, iY - 1 | 0)) {
        return 2;
      }
      if (!this.PointFree(iX + 1 | 0, iY + 1 | 0)) {
        return 3;
      }
    }
    if (iDirection === 1) {
      if (!this.PointFree(iX - 1 | 0, iY - 1 | 0)) {
        return 4;
      }
      if (!this.PointFree(iX - 1 | 0, iY + 1 | 0)) {
        return 3;
      }
      if (!this.PointFree(iX + 1 | 0, iY - 1 | 0)) {
        return 1;
      }
      if (!this.PointFree(iX + 1 | 0, iY + 1 | 0)) {
        return 2;
      }
    }
    return 0;
  }

  FindCrawlAttach(iX, iY) {
    if (!this.PointFree(iX, iY - 1 | 0)) {
      return 1;
    }
    if (!this.PointFree(iX, iY + 1 | 0)) {
      return 3;
    }
    if (!this.PointFree(iX - 1 | 0, iY)) {
      return 4;
    }
    if (!this.PointFree(iX + 1 | 0, iY)) {
      return 2;
    }
    return 0;
  }

  IsCrawlAttach(iX$, iY$, iAttach) {
    const iX = [iX$];
    const iY = [iY$];
    this.CrawlToAttach(P(iX, 0), P(iY, 0), iAttach);
    return !this.PointFree(iX[0], iY[0]);
  }

  CheckBackRayShorten() {
    let pRay = null;
    let pRay2 = null;
    const iX = [0];
    const iY = [0];
    for (pRay = this.From; pRay != null; pRay = pRay.From) {
      if (pRay.UseZone != null) {
        return false;
      }
      if (pRay === this.From) {
        continue;
      }
      iX[0] = this.X;
      iY[0] = this.Y;
      if (this.PathFree(P(iX, 0), P(iY, 0), pRay.X, pRay.Y)) {
        for (pRay2 = this.From; pRay2 !== pRay; pRay2 = pRay2.From) {
          pRay2.Status = 4;
        }
        pRay.X2 = this.X;
        pRay.Y2 = this.Y;
        this.From = pRay;
        return true;
      }
    }
    return false;
  }

  Execute() {
    const pZone = [null];
    const iX = [0];
    const iY = [0];
    let iLastX = 0;
    let iLastY = 0;
    switch (this.Status) {
      case 0:
        if (this.UseZone != null) {
          this.UseZone.Used = true;
          if (this.UseZone.At(this.TargetX, this.TargetY)) {
            this.X2 = this.TargetX;
            this.Y2 = this.TargetY;
            this.SetCompletePath();
            this.pPathFinder.Success = true;
            this.Status = 2;
          } else {
            if (!this.UseZone.GetEntryPoint(P(this, "X2"), P(this, "Y2"), this.TargetX, this.TargetY)) {
              this.Status = 3;
              break;
            }
            if (!this.pPathFinder.AddRay(this.X2, this.Y2, this.TargetX, this.TargetY, this.Depth + 1 | 0, this.Direction, this)) {
              this.Status = 3;
              break;
            }
            this.Status = 2;
          }
          return true;
        } else if (this.PathFree(P(this, "X2"), P(this, "Y2"), this.TargetX, this.TargetY, P(pZone, 0))) {
          this.SetCompletePath();
          this.pPathFinder.Success = true;
          this.Status = 2;
          return true;
        } else if (pZone[0] != null) {
          if (!pZone[0].At(this.X, this.Y)) {
            pZone[0].GetEntryPoint(P(this, "X2"), P(this, "Y2"), this.X2, this.Y2);
          }
          if (!this.pPathFinder.AddRay(this.X2, this.Y2, this.TargetX, this.TargetY, this.Depth + 1 | 0, this.Direction, this, pZone[0])) {
            this.Status = 3;
            break;
          }
          this.Status = 2;
          return true;
        } else {
          this.Status = 1;
          this.CrawlStartX = this.X2;
          this.CrawlStartY = this.Y2;
          this.CrawlAttach = this.FindCrawlAttach(this.X2, this.Y2);
          this.CrawlLength = 0;
          if (this.CrawlAttach === 0) {
            this.CrawlAttach = this.FindCrawlAttachDiagonal(this.X2, this.Y2, this.Direction);
          }
          this.CrawlStartAttach = this.CrawlAttach;
          if (this.CrawlAttach === 0) {
            this.Status = 3;
            break;
          }
          return true;
        }
        break;
      case 1:
        iLastX = this.X2;
        iLastY = this.Y2;
        if (!this.Crawl()) {
          this.Status = 3;
          break;
        }
        if (this.X2 === this.CrawlStartX && this.Y2 === this.CrawlStartY && this.CrawlAttach === this.CrawlStartAttach) {
          this.Status = 2;
          break;
        }
        if (this.pPathFinder.TransferZonesEnabled) {
          if (this.pPathFinder.TransferZones != null) {
            if ((pZone[0] = this.pPathFinder.TransferZones.Find$i32$i32(this.X2, this.Y2)) != null) {
              if (!pZone[0].Used) {
                iX[0] = this.X2;
                iY[0] = this.Y2;
                if (pZone[0].GetEntryPoint(P(iX, 0), P(iY, 0), this.X2, this.Y2)) {
                  if (!this.pPathFinder.AddRay(iX[0], iY[0], this.TargetX, this.TargetY, this.Depth + 1 | 0, this.Direction, this, pZone[0])) {
                    this.Status = 3;
                    break;
                  }
                }
                return true;
              }
            }
          }
        }
        this.CrawlLength = this.CrawlLength + 1 | 0;
        if (this.CrawlLength >= Math.imul(800, this.pPathFinder.Level)) {
          this.Status = 2;
          break;
        }
        iX[0] = this.X;
        iY[0] = this.Y;
        if (!this.PathFree(P(iX, 0), P(iY, 0), this.X2, this.Y2)) {
          if (!this.pPathFinder.SplitRay(this, iLastX, iLastY)) {
            this.Status = 3;
            break;
          }
        }
        iX[0] = this.X2;
        iY[0] = this.Y2;
        if (this.CrawlLength > 10) {
          if (this.PathFree(P(iX, 0), P(iY, 0), this.TargetX, this.TargetY) || $.Distance(iX[0], iY[0], this.X2, this.Y2) > 10 && $.Distance(iX[0], iY[0], this.CrawlStartX, this.CrawlStartY) > $.Distance(this.X2, this.Y2, this.CrawlStartX, this.CrawlStartY)) {
            this.Status = 2;
            if (!this.pPathFinder.AddRay(this.X2, this.Y2, this.TargetX, this.TargetY, this.Depth + 1 | 0, -1, this) || !this.pPathFinder.AddRay(this.X2, this.Y2, this.TargetX, this.TargetY, this.Depth + 1 | 0, 1, this)) {
              this.Status = 3;
              break;
            }
          }
        }
        break;
      case 2:
      case 3:
      case 4:
        return false;
    }
    return true;
  }

  CrawlTargetFree(iX$, iY$, iAttach, iDirection) {
    const iX = [iX$];
    const iY = [iY$];
    this.CrawlByAttach(P(iX, 0), P(iY, 0), iAttach, iDirection);
    return this.PointFree(iX[0], iY[0]);
  }

  PointFree(iX, iY) {
    return this.pPathFinder.PointFree(iX, iY);
  }

  Crawl() {
    if (this.CrawlAttach === 0) {
      return false;
    }
    if (this.CrawlLength !== 0) {
      if (!this.IsCrawlAttach(this.X2, this.Y2, this.CrawlAttach)) {
        this.CrawlToAttach(P(this, "X2"), P(this, "Y2"), this.CrawlAttach);
        this.TurnAttach(P(this, "CrawlAttach"), -this.Direction | 0);
        if (!this.IsCrawlAttach(this.X2, this.Y2, this.CrawlAttach)) {
          return false;
        }
        return true;
      }
    }
    let iTurned = 0;
    while (!this.CrawlTargetFree(this.X2, this.Y2, this.CrawlAttach, this.Direction)) {
      this.TurnAttach(P(this, "CrawlAttach"), this.Direction);
      iTurned = iTurned + 1 | 0;
      if (iTurned === 4) {
        return false;
      }
    }
    this.CrawlByAttach(P(this, "X2"), P(this, "Y2"), this.CrawlAttach, this.Direction);
    return true;
  }

  PathFree(rX, rY, iToX, iToY, ppZone = null) {
    let d = 0;
    let dx = 0;
    let dy = 0;
    let aincr = 0;
    let bincr = 0;
    let xincr = 0;
    let yincr = 0;
    let x = 0;
    let y = 0;
    if ($.Abs$i32(iToX - rX.a[rX.o] | 0) < $.Abs$i32(iToY - rY.a[rY.o] | 0)) {
      xincr = iToX > rX.a[rX.o] ? 1 : -1;
      yincr = iToY > rY.a[rY.o] ? 1 : -1;
      dy = $.Abs$i32(iToY - rY.a[rY.o] | 0);
      dx = $.Abs$i32(iToX - rX.a[rX.o] | 0);
      d = Math.imul(2, dx) - dy | 0;
      aincr = Math.imul(2, dx - dy | 0);
      bincr = Math.imul(2, dx);
      x = rX.a[rX.o];
      y = rY.a[rY.o];
      for (y = rY.a[rY.o]; y !== iToY; y = y + yincr | 0) {
        if (this.PointFree(x, y)) {
          rY.a[rY.o] = y;
          rX.a[rX.o] = x;
        } else {
          return false;
        }
        if (ppZone != null) {
          if (this.pPathFinder.TransferZonesEnabled) {
            if (this.pPathFinder.TransferZones != null) {
              if ((ppZone.a[ppZone.o] = this.pPathFinder.TransferZones.Find$i32$i32(rX.a[rX.o], rY.a[rY.o])) != null) {
                return false;
              }
            }
          }
        }
        if (d >= 0) {
          x = x + xincr | 0;
          d = d + aincr | 0;
        } else {
          d = d + bincr | 0;
        }
      }
    } else {
      yincr = iToY > rY.a[rY.o] ? 1 : -1;
      xincr = iToX > rX.a[rX.o] ? 1 : -1;
      dx = $.Abs$i32(iToX - rX.a[rX.o] | 0);
      dy = $.Abs$i32(iToY - rY.a[rY.o] | 0);
      d = Math.imul(2, dy) - dx | 0;
      aincr = Math.imul(2, dy - dx | 0);
      bincr = Math.imul(2, dy);
      x = rX.a[rX.o];
      y = rY.a[rY.o];
      for (x = rX.a[rX.o]; x !== iToX; x = x + xincr | 0) {
        if (this.PointFree(x, y)) {
          rY.a[rY.o] = y;
          rX.a[rX.o] = x;
        } else {
          return false;
        }
        if (ppZone != null) {
          if (this.pPathFinder.TransferZonesEnabled) {
            if (this.pPathFinder.TransferZones != null) {
              if ((ppZone.a[ppZone.o] = this.pPathFinder.TransferZones.Find$i32$i32(rX.a[rX.o], rY.a[rY.o])) != null) {
                return false;
              }
            }
          }
        }
        if (d >= 0) {
          y = y + yincr | 0;
          d = d + aincr | 0;
        } else {
          d = d + bincr | 0;
        }
      }
    }
    return true;
  }

  $clone() { return new C4PathFinderRay().$assign(this); }
  $assign(o) {
    this.Status = o.Status;
    this.X = o.X;
    this.Y = o.Y;
    this.X2 = o.X2;
    this.Y2 = o.Y2;
    this.TargetX = o.TargetX;
    this.TargetY = o.TargetY;
    this.CrawlStartX = o.CrawlStartX;
    this.CrawlStartY = o.CrawlStartY;
    this.CrawlAttach = o.CrawlAttach;
    this.CrawlLength = o.CrawlLength;
    this.CrawlStartAttach = o.CrawlStartAttach;
    this.Direction = o.Direction;
    this.Depth = o.Depth;
    this.UseZone = o.UseZone;
    this.From = o.From;
    this.Next = o.Next;
    this.pPathFinder = o.pPathFinder;
    return this;
  }
}


















export function $init(): void {
  $.C4PF_MaxDepth$C4PathFinder = 35;
  $.C4PF_MaxCrawl$C4PathFinder = 800;
  $.C4PF_MaxRay$C4PathFinder = 350;
  $.C4PF_Threshold$C4PathFinder = 10;
  $.C4PF_Direction_Left$C4PathFinder = -1;
  $.C4PF_Direction_Right$C4PathFinder = 1;
  $.C4PF_Ray_Launch$C4PathFinder = 0;
  $.C4PF_Ray_Crawl$C4PathFinder = 1;
  $.C4PF_Ray_Still$C4PathFinder = 2;
  $.C4PF_Ray_Failure$C4PathFinder = 3;
  $.C4PF_Ray_Deleted$C4PathFinder = 4;
  $.C4PF_Crawl_NoAttach$C4PathFinder = 0;
  $.C4PF_Crawl_Top$C4PathFinder = 1;
  $.C4PF_Crawl_Right$C4PathFinder = 2;
  $.C4PF_Crawl_Bottom$C4PathFinder = 3;
  $.C4PF_Crawl_Left$C4PathFinder = 4;
  $.C4PF_Draw_Rate$C4PathFinder = 10;
}

Object.assign($, { C4PathFinder, C4PathFinderRay });
