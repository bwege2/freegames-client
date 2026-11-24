// @ts-nocheck
// OpenClonk 36de799: src/script/C4AulAST.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { P } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $mixin, StdString } from '../../rt/std.ts';

export class AstVisitor {

  visit$pNoop(_0) {
  }

  visit$pStringLit(_0) {
  }

  visit$pIntLit(_0) {
  }

  visit$pBoolLit(_0) {
  }

  visit$pArrayLit(_0) {
  }

  visit$pProplistLit(_0) {
  }

  visit$pNilLit(_0) {
  }

  visit$pThisLit(_0) {
  }

  visit$pVarExpr(_n) {
  }

  visit$pUnOpExpr(_0) {
  }

  visit$pBinOpExpr(_0) {
  }

  visit$pAssignmentExpr(_0) {
  }

  visit$pSubscriptExpr(_0) {
  }

  visit$pSliceExpr(_0) {
  }

  visit$pCallExpr(_0) {
  }

  visit$pParExpr(_0) {
  }

  visit$pBlock(_0) {
  }

  visit$pReturn(_0) {
  }

  visit$pForLoop(_0) {
  }

  visit$pRangeLoop(_0) {
  }

  visit$pDoLoop(_0) {
  }

  visit$pWhileLoop(_0) {
  }

  visit$pBreak(_0) {
  }

  visit$pContinue(_0) {
  }

  visit$pIf(_0) {
  }

  visit$pVarDecl(_0) {
  }

  visit$pFunctionDecl(_0) {
  }

  visit$pFunctionExpr(_0) {
  }

  visit$pIncludePragma(_0) {
  }

  visit$pAppendtoPragma(_0) {
  }

  visit$pScript(_0) {
  }

  $clone() { return new AstVisitor().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class Node {
  loc = null;

  $clone() { return new Node().$assign(this); }
  $assign(o) {
    this.loc = o.loc;
    return this;
  }
}

export class VarDecl$Var {
  name = new StdString();
  init = null;

  $clone() { return new VarDecl$Var().$assign(this); }
  $assign(o) {
    this.name = o.name.$clone();
    this.init = o.init;
    return this;
  }
}

export class Function {
  params = [];
  has_unnamed_params = false;
  body = null;

  $clone() { return new Function().$assign(this); }
  $assign(o) {
    this.params = o.params.slice();
    this.has_unnamed_params = o.has_unnamed_params;
    this.body = o.body;
    return this;
  }
}

export class Function$Parameter {
  name = new StdString();
  type = 0;

  init(name, type = 10 /*C4V_Any*/) {
    this.name = name.$clone();
    this.type = type;
    return this;
  }

  $clone() { return new Function$Parameter().$assign(this); }
  $assign(o) {
    this.name = o.name.$clone();
    this.type = o.type;
    return this;
  }
}

export class Stmt extends Node {

  has_value() {
    return false;
  }

  $clone() { return new Stmt().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class Script extends Node {
  declarations = [];

  accept(v) {
    v.visit$pScript(this);
  }

  static New$pi8(loc) {
    let n = new Script().None();
    n.loc = loc;
    return n;
  }

  None() {
    this.declarations = [];
    return this;
  }

  $clone() { return new Script().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.declarations = o.declarations.slice();
    return this;
  }
}

export class DefaultRecursiveVisitor extends AstVisitor {

  visit$pArrayLit(n) {
    let $t1;
    $t1 = n.values;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const c = P($t1, $i1);
      c.a[c.o].accept(this);
    }
  }

  visit$pProplistLit(n) {
    for (const c of n.values) {
      c.second.accept(this);
    }
  }

  visit$pUnOpExpr(n) {
    n.operand.accept(this);
  }

  visit$pBinOpExpr(n) {
    n.lhs.accept(this);
    n.rhs.accept(this);
  }

  visit$pAssignmentExpr(n) {
    n.lhs.accept(this);
    n.rhs.accept(this);
  }

  visit$pSubscriptExpr(n) {
    n.object.accept(this);
    n.index.accept(this);
  }

  visit$pSliceExpr(n) {
    n.object.accept(this);
    n.start.accept(this);
    n.end.accept(this);
  }

  visit$pCallExpr(n) {
    let $t1;
    if (n.context != null) {
      n.context.accept(this);
    }
    $t1 = n.args;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const a = P($t1, $i1);
      a.a[a.o].accept(this);
    }
  }

  visit$pParExpr(n) {
    n.arg.accept(this);
  }

  visit$pBlock(n) {
    let $t1;
    $t1 = n.children;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const s = P($t1, $i1);
      s.a[s.o].accept(this);
    }
  }

  visit$pReturn(n) {
    n.value.accept(this);
  }

  visit$pForLoop(n) {
    if (n.init != null) {
      n.init.accept(this);
    }
    if (n.cond != null) {
      n.cond.accept(this);
    }
    if (n.incr != null) {
      n.incr.accept(this);
    }
    n.body.accept(this);
  }

  visit$pRangeLoop(n) {
    n.cond.accept(this);
    n.body.accept(this);
  }

  visit$pDoLoop(n) {
    n.body.accept(this);
    n.cond.accept(this);
  }

  visit$pWhileLoop(n) {
    n.cond.accept(this);
    n.body.accept(this);
  }

  visit$pIf(n) {
    n.cond.accept(this);
    n.iftrue.accept(this);
    if (n.iffalse != null) {
      n.iffalse.accept(this);
    }
  }

  visit$pVarDecl(n) {
    for (const d of n.decls) {
      if (d.init != null) {
        d.init.accept(this);
      }
    }
  }

  visit$pFunctionDecl(n) {
    n.body.accept(this);
  }

  visit$pFunctionExpr(n) {
    n.body.accept(this);
  }

  visit$pScript(n) {
    let $t1;
    $t1 = n.declarations;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const d = P($t1, $i1);
      d.a[d.o].accept(this);
    }
  }

  $clone() { return new DefaultRecursiveVisitor().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class Noop extends Stmt {

  accept(v) {
    v.visit$pNoop(this);
  }

  static New$pi8(loc) {
    let n = new Noop();
    n.loc = loc;
    return n;
  }

  $clone() { return new Noop().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class Expr extends Stmt {

  has_value() {
    return true;
  }

  $clone() { return new Expr().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class Block extends Stmt {
  children = [];

  accept(v) {
    v.visit$pBlock(this);
  }

  static New$pi8(loc) {
    let n = new Block().None();
    n.loc = loc;
    return n;
  }

  None() {
    this.children = [];
    return this;
  }

  $clone() { return new Block().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.children = o.children.slice();
    return this;
  }
}

export class ControlFlow extends Stmt {

  $clone() { return new ControlFlow().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class Decl extends Stmt {

  $clone() { return new Decl().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class Literal extends Expr {

  $clone() { return new Literal().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class VarExpr extends Expr {
  identifier = new StdString();

  accept(v) {
    v.visit$pVarExpr(this);
  }

  init(identifier) {
    this.identifier = identifier.$clone();
    return this;
  }

  static New$pi8$rbasic_string(loc, t) {
    let n = new VarExpr().init(t);
    n.loc = loc;
    return n;
  }

  $clone() { return new VarExpr().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.identifier = o.identifier.$clone();
    return this;
  }
}

export class UnOpExpr extends Expr {
  operand = null;
  op = 0;

  accept(v) {
    v.visit$pUnOpExpr(this);
  }

  init(op, operand) {
    this.operand = operand;
    this.op = op;
    return this;
  }

  static New$pi8$mi64$munique_ptr(loc, t, t$2) {
    let n = new UnOpExpr().init(t, t$2);
    n.loc = loc;
    return n;
  }

  $clone() { return new UnOpExpr().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.operand = o.operand;
    this.op = o.op;
    return this;
  }
}

export class BinOpExpr extends Expr {
  lhs = null;
  rhs = null;
  op = 0;

  accept(v) {
    v.visit$pBinOpExpr(this);
  }

  init(op, lhs, rhs) {
    this.lhs = lhs;
    this.rhs = rhs;
    this.op = op;
    return this;
  }

  static New$pi8$mi64$munique_ptr$munique_ptr(loc, t, t$2, t$3) {
    let n = new BinOpExpr().init(t, t$2, t$3);
    n.loc = loc;
    return n;
  }

  $clone() { return new BinOpExpr().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.lhs = o.lhs;
    this.rhs = o.rhs;
    this.op = o.op;
    return this;
  }
}

export class AssignmentExpr extends Expr {
  lhs = null;
  rhs = null;

  accept(v) {
    v.visit$pAssignmentExpr(this);
  }

  init(lhs, rhs) {
    this.lhs = lhs;
    this.rhs = rhs;
    return this;
  }

  static New$pi8$munique_ptr$munique_ptr(loc, t, t$2) {
    let n = new AssignmentExpr().init(t, t$2);
    n.loc = loc;
    return n;
  }

  $clone() { return new AssignmentExpr().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.lhs = o.lhs;
    this.rhs = o.rhs;
    return this;
  }
}

export class SubscriptExpr extends Expr {
  object = null;
  index = null;

  accept(v) {
    v.visit$pSubscriptExpr(this);
  }

  init(object, index) {
    this.object = object;
    this.index = index;
    return this;
  }

  static New$pi8$munique_ptr$munique_ptr$2(loc, t, t$2) {
    let n = new SubscriptExpr().init(t, t$2);
    n.loc = loc;
    return n;
  }

  static New$pi8$munique_ptr$munique_ptr(loc, t, t$2) {
    let n = new SubscriptExpr().init(t, t$2);
    n.loc = loc;
    return n;
  }

  $clone() { return new SubscriptExpr().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.object = o.object;
    this.index = o.index;
    return this;
  }
}

export class SliceExpr extends Expr {
  object = null;
  start = null;
  end = null;

  accept(v) {
    v.visit$pSliceExpr(this);
  }

  init(object, start, end) {
    this.object = object;
    this.start = start;
    this.end = end;
    return this;
  }

  static New$pi8$munique_ptr$munique_ptr$munique_ptr(loc, t, t$2, t$3) {
    let n = new SliceExpr().init(t, t$2, t$3);
    n.loc = loc;
    return n;
  }

  $clone() { return new SliceExpr().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.object = o.object;
    this.start = o.start;
    this.end = o.end;
    return this;
  }
}

export class CallExpr extends Expr {
  safe_call = false;
  append_unnamed_pars = false;
  context = null;
  args = [];
  callee = new StdString();

  accept(v) {
    v.visit$pCallExpr(this);
  }

  static New$pi8(loc) {
    let n = new CallExpr().None();
    n.loc = loc;
    return n;
  }

  None() {
    this.safe_call = false;
    this.append_unnamed_pars = false;
    this.context = null;
    this.args = [];
    this.callee = new StdString();
    return this;
  }

  $clone() { return new CallExpr().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.safe_call = o.safe_call;
    this.append_unnamed_pars = o.append_unnamed_pars;
    this.context = o.context;
    this.args = o.args.slice();
    this.callee = o.callee.$clone();
    return this;
  }
}

export class ParExpr extends Expr {
  arg = null;

  accept(v) {
    v.visit$pParExpr(this);
  }

  init(arg) {
    this.arg = arg;
    return this;
  }

  static New$pi8$munique_ptr(loc, t) {
    let n = new ParExpr().init(t);
    n.loc = loc;
    return n;
  }

  $clone() { return new ParExpr().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.arg = o.arg;
    return this;
  }
}

export class Return extends ControlFlow {
  value = null;

  accept(v) {
    v.visit$pReturn(this);
  }

  init(value) {
    this.value = value;
    return this;
  }

  static New$pi8$munique_ptr$2(loc, t) {
    let n = new Return().init(t);
    n.loc = loc;
    return n;
  }

  static New$pi8$munique_ptr(loc, t) {
    let n = new Return().init(t);
    n.loc = loc;
    return n;
  }

  $clone() { return new Return().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.value = o.value;
    return this;
  }
}

export class Loop extends ControlFlow {
  cond = null;
  body = null;

  $clone() { return new Loop().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.cond = o.cond;
    this.body = o.body;
    return this;
  }
}

export class LoopControl extends ControlFlow {

  $clone() { return new LoopControl().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class If extends ControlFlow {
  cond = null;
  iftrue = null;
  iffalse = null;

  accept(v) {
    v.visit$pIf(this);
  }

  static New$pi8(loc) {
    let n = new If().None();
    n.loc = loc;
    return n;
  }

  None() {
    this.cond = null;
    this.iftrue = null;
    this.iffalse = null;
    return this;
  }

  $clone() { return new If().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.cond = o.cond;
    this.iftrue = o.iftrue;
    this.iffalse = o.iffalse;
    return this;
  }
}

export class VarDecl extends Decl {
  scope = 0;
  constant = false;
  decls = [];

  accept(v) {
    v.visit$pVarDecl(this);
  }

  static New$pi8(loc) {
    let n = new VarDecl().None();
    n.loc = loc;
    return n;
  }

  None() {
    this.decls = [];
    return this;
  }

  $clone() { return new VarDecl().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.scope = o.scope;
    this.constant = o.constant;
    this.decls = o.decls.slice();
    return this;
  }
}

export class FunctionDecl extends Decl {
  name = new StdString();
  is_global = false;
  params = [];
  has_unnamed_params = false;
  body = null;

  accept(v) {
    v.visit$pFunctionDecl(this);
  }

  init(name) {
    this.name = name.$clone();
    this.is_global = false;
    return this;
  }

  static New$pi8$rx(loc, t) {
    let n = new FunctionDecl().init(StdString.of(t));
    n.loc = loc;
    return n;
  }

  $clone() { return new FunctionDecl().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.name = o.name.$clone();
    this.is_global = o.is_global;
    this.params = o.params.slice();
    this.has_unnamed_params = o.has_unnamed_params;
    this.body = o.body;
    return this;
  }
}

export class FunctionExpr extends Expr {
  params = [];
  has_unnamed_params = false;
  body = null;

  accept(v) {
    v.visit$pFunctionExpr(this);
  }

  static New$pi8(loc) {
    let n = new FunctionExpr().None();
    n.loc = loc;
    return n;
  }

  None() {
    return this;
  }

  $clone() { return new FunctionExpr().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.params = o.params.slice();
    this.has_unnamed_params = o.has_unnamed_params;
    this.body = o.body;
    return this;
  }
}

export class Pragma extends Decl {

  $clone() { return new Pragma().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StringLit extends Literal {
  value = new StdString();

  accept(v) {
    v.visit$pStringLit(this);
  }

  init(value) {
    this.value = value.$clone();
    return this;
  }

  static New$pi8$mpi8(loc, t) {
    let n = new StringLit().init(StdString.of(t));
    n.loc = loc;
    return n;
  }

  static New$pi8$rx(loc, t) {
    let n = new StringLit().init(StdString.of(t));
    n.loc = loc;
    return n;
  }

  $clone() { return new StringLit().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.value = o.value.$clone();
    return this;
  }
}

export class IntLit extends Literal {
  value = 0;

  accept(v) {
    v.visit$pIntLit(this);
  }

  init(value) {
    this.value = value >>> 0;
    return this;
  }

  static New$pi8$ri32(loc, t) {
    let n = new IntLit().init(t.a[t.o]);
    n.loc = loc;
    return n;
  }

  static New$pi8$mi32(loc, t) {
    let n = new IntLit().init(t);
    n.loc = loc;
    return n;
  }

  $clone() { return new IntLit().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.value = o.value;
    return this;
  }
}

export class BoolLit extends Literal {
  value = false;

  accept(v) {
    v.visit$pBoolLit(this);
  }

  init(value) {
    this.value = value;
    return this;
  }

  static New$pi8$mb(loc, t) {
    let n = new BoolLit().init(t);
    n.loc = loc;
    return n;
  }

  $clone() { return new BoolLit().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.value = o.value;
    return this;
  }
}

export class ArrayLit extends Literal {
  values = [];

  accept(v) {
    v.visit$pArrayLit(this);
  }

  static New$pi8(loc) {
    let n = new ArrayLit().None();
    n.loc = loc;
    return n;
  }

  None() {
    this.values = [];
    return this;
  }

  $clone() { return new ArrayLit().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.values = o.values.slice();
    return this;
  }
}

export class ProplistLit extends Literal {
  values = [];

  accept(v) {
    v.visit$pProplistLit(this);
  }

  static New$pi8(loc) {
    let n = new ProplistLit().None();
    n.loc = loc;
    return n;
  }

  None() {
    this.values = [];
    return this;
  }

  $clone() { return new ProplistLit().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.values = o.values.slice();
    return this;
  }
}

export class NilLit extends Literal {

  accept(v) {
    v.visit$pNilLit(this);
  }

  static New$pi8(loc) {
    let n = new NilLit();
    n.loc = loc;
    return n;
  }

  $clone() { return new NilLit().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class ThisLit extends Literal {

  accept(v) {
    v.visit$pThisLit(this);
  }

  static New$pi8(loc) {
    let n = new ThisLit();
    n.loc = loc;
    return n;
  }

  $clone() { return new ThisLit().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class ForLoop extends Loop {
  init = null;
  incr = null;

  accept(v) {
    v.visit$pForLoop(this);
  }

  static New$pi8(loc) {
    let n = new ForLoop().None();
    n.loc = loc;
    return n;
  }

  None() {
    this.init = null;
    this.incr = null;
    return this;
  }

  $clone() { return new ForLoop().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.init = o.init;
    this.incr = o.incr;
    return this;
  }
}

export class RangeLoop extends Loop {
  var = new StdString();
  scoped_var = false;

  accept(v) {
    v.visit$pRangeLoop(this);
  }

  static New$pi8(loc) {
    let n = new RangeLoop().None();
    n.loc = loc;
    return n;
  }

  None() {
    this.var = new StdString();
    this.scoped_var = false;
    return this;
  }

  $clone() { return new RangeLoop().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.var = o.var.$clone();
    this.scoped_var = o.scoped_var;
    return this;
  }
}

export class DoLoop extends Loop {

  accept(v) {
    v.visit$pDoLoop(this);
  }

  static New$pi8(loc) {
    let n = new DoLoop().None();
    n.loc = loc;
    return n;
  }

  None() {
    return this;
  }

  $clone() { return new DoLoop().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class WhileLoop extends Loop {

  accept(v) {
    v.visit$pWhileLoop(this);
  }

  static New$pi8(loc) {
    let n = new WhileLoop().None();
    n.loc = loc;
    return n;
  }

  None() {
    return this;
  }

  $clone() { return new WhileLoop().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class Break extends LoopControl {

  accept(v) {
    v.visit$pBreak(this);
  }

  static New$pi8(loc) {
    let n = new Break();
    n.loc = loc;
    return n;
  }

  $clone() { return new Break().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class Continue extends LoopControl {

  accept(v) {
    v.visit$pContinue(this);
  }

  static New$pi8(loc) {
    let n = new Continue();
    n.loc = loc;
    return n;
  }

  $clone() { return new Continue().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class IncludePragma extends Pragma {
  what = new StdString();

  accept(v) {
    v.visit$pIncludePragma(this);
  }

  init(what) {
    this.what = what.$clone();
    return this;
  }

  static New$pi8$rx(loc, t) {
    let n = new IncludePragma().init(StdString.of(t));
    n.loc = loc;
    return n;
  }

  $clone() { return new IncludePragma().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.what = o.what.$clone();
    return this;
  }
}

export class AppendtoPragma extends Pragma {
  what = new StdString();

  accept(v) {
    v.visit$pAppendtoPragma(this);
  }

  init$v() {
    this.what = new StdString();
    return this;
  }

  init$string(what) {
    this.what = what.$clone();
    return this;
  }

  static New$pi8$rx(loc, t) {
    let n = new AppendtoPragma().init$string(StdString.of(t));
    n.loc = loc;
    return n;
  }

  static New$pi8(loc) {
    let n = new AppendtoPragma().init$v();
    n.loc = loc;
    return n;
  }

  $clone() { return new AppendtoPragma().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.what = o.what.$clone();
    return this;
  }
}

export function $init(): void {
  $mixin(FunctionDecl, Function);
  $mixin(FunctionExpr, Function);
}

Object.assign($, { AppendtoPragma, ArrayLit, AssignmentExpr, AstVisitor, BinOpExpr, Block, BoolLit, Break, CallExpr, Continue, ControlFlow, Decl, DefaultRecursiveVisitor, DoLoop, Expr, ForLoop, Function, Function$Parameter, FunctionDecl, FunctionExpr, If, IncludePragma, IntLit, Literal, Loop, LoopControl, NilLit, Node, Noop, ParExpr, Pragma, ProplistLit, RangeLoop, Return, Script, SliceExpr, Stmt, StringLit, SubscriptExpr, ThisLit, UnOpExpr, VarDecl, VarDecl$Var, VarExpr, WhileLoop });
