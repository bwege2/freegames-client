// @ts-nocheck
// OpenClonk 36de799: src/script/C4AulDebug.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $ } from '../../rt/registry.ts';

export class C4AulDebug {
  static pDebug;
  fInit = false;
  fConnected = false;
  pExec = null;
  PeerAddr = new $.C4NetIO$EndpointAddress().init$v();
  AllowedAddr = new $.C4NetIO$EndpointAddress().init$v();
  Password = new $.StdCopyStrBuf();
  eState = 0;
  iStepCallDepth = 0;
  StackTrace = [];

  static GetDebugger() {
    return C4AulDebug.pDebug;
  }

  DebugStep(_0, _1) {
  }

  $clone() { return new C4AulDebug().$assign(this); }
  $assign(o) {
    this.fInit = o.fInit;
    this.fConnected = o.fConnected;
    this.pExec = o.pExec;
    this.PeerAddr.$assign(o.PeerAddr);
    this.AllowedAddr.$assign(o.AllowedAddr);
    this.Password.$assign(o.Password);
    this.eState = o.eState;
    this.iStepCallDepth = o.iStepCallDepth;
    this.StackTrace = o.StackTrace.slice();
    return this;
  }
}

export function $init(): void {
  C4AulDebug.pDebug = null;
}

Object.assign($, { C4AulDebug });
