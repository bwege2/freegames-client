// @ts-nocheck
// OpenClonk 36de799: src/network/C4NetIO.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $ } from '../../rt/registry.ts';

export class C4NetIO$HostAddress {
  $u1 = new C4NetIO$HostAddress$$anon1();

  init$v() {
    C4NetIO$HostAddress.prototype.Clear.call(this);
    return this;
  }

  $copy(other) {
    C4NetIO$HostAddress.prototype.SetHost$C4NetIO$HostAddress.call(this, other);
    return this;
  }
  $clone() { return new C4NetIO$HostAddress().$copy(this); }
  $assign(o) {
    this.$u1.$assign(o.$u1);
    return this;
  }
}

export class C4NetIO$HostAddress$$anon1 {
  $v = 0;
  get gen() { return this.$v; }
  set gen(v) { this.$v = v; }
  get v4() { return this.$v; }
  set v4(v) { this.$v = v; }
  get v6() { return this.$v; }
  set v6(v) { this.$v = v; }
  $clone() { const u = new C4NetIO$HostAddress$$anon1(); u.$v = this.$v && this.$v.$clone ? this.$v.$clone() : this.$v; return u; }
  $assign(o) { this.$v = o.$v && o.$v.$clone ? o.$v.$clone() : o.$v; return this; }
}

export class WinSockHolder {
  $clone() { return this; }
  $assign(_o) { return this; }
  procs = [];
  MusicSystem = { ClearGame() {}, Clear() {}, Stop() {} };
  SoundSystem = { ClearGame() {}, Clear() {}, Stop() {} };
  Added() {}
  Removed() {}
  Removing() {}
  OnScheduler() {}
  init() { return this; }
  init$v() { return this; }
  None() { return this; }
  Init() { return this; }
  Execute() {}
  Close() { return true; }
  Open() { return false; }
  Load() { return 0; }
  Clear() {}
  Default() {}
  Set() { return true; }
  Check() { return true; }
  Lock() {}
  Unlock() {}
  isEnabled() { return false; }
  isHost() { return false; }
  isLobbyActive() { return false; }
  DoLobby() { return true; }
  RetrieveScenario() { return false; }
  FinalInit() { return true; }
  Unload() {}
  CompileFunc() {}
  FixShiftKeys() {}
  ResolveIncompleteSkeletons() {}
  RemoveSkeletonsInGroup() {}
}

export class C4NetIO$EndpointAddress extends C4NetIO$HostAddress {
  static IPPORT_NONE;

  init$v() {
    super.init$v();
    C4NetIO$EndpointAddress.prototype.Clear.call(this);
    return this;
  }

  $copy(other) {
    super.init$v();
    C4NetIO$EndpointAddress.prototype.SetAddress$C4NetIO$EndpointAddress.call(this, other);
    return this;
  }
  $clone() { return new C4NetIO$EndpointAddress().$copy(this); }
  $assign(other) {
    this.SetAddress$C4NetIO$EndpointAddress(other);
    return this;
  }
}

export class C4NetIOPacket {
  $clone() { return this; }
  $assign(_o) { return this; }
  procs = [];
  MusicSystem = { ClearGame() {}, Clear() {}, Stop() {} };
  SoundSystem = { ClearGame() {}, Clear() {}, Stop() {} };
  Added() {}
  Removed() {}
  Removing() {}
  OnScheduler() {}
  init() { return this; }
  init$v() { return this; }
  None() { return this; }
  Init() { return this; }
  Execute() {}
  Close() { return true; }
  Open() { return false; }
  Load() { return 0; }
  Clear() {}
  Default() {}
  Set() { return true; }
  Check() { return true; }
  Lock() {}
  Unlock() {}
  isEnabled() { return false; }
  isHost() { return false; }
  isLobbyActive() { return false; }
  DoLobby() { return true; }
  RetrieveScenario() { return false; }
  FinalInit() { return true; }
  Unload() {}
  CompileFunc() {}
  FixShiftKeys() {}
  ResolveIncompleteSkeletons() {}
  RemoveSkeletonsInGroup() {}
}

export function $init(): void {
}

Object.assign($, { C4NetIO$EndpointAddress, C4NetIO$HostAddress, C4NetIO$HostAddress$$anon1, C4NetIOPacket, WinSockHolder });
