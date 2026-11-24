// @ts-nocheck
// OpenClonk 36de799: src/script/C4AulCompiler.cpp, src/script/C4AulCompiler.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { C4AulParseError } from './C4Aul.ts';
import { AstVisitor, DefaultRecursiveVisitor } from './C4AulAST.ts';
import { $u64n } from '../../rt/int.ts';
import { $oadd, $padd, $rd, $tmp, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $dyncast, $min, $rbegin, $throw, $vpush, $vunshift, StdSet, StdString, resize, seq_assign, std_begin, std_end, std_find, std_find_if } from '../../rt/std.ts';

export class C4AulCompiler {

  static Compile$pC4AulScriptFunc$pFunction(func, def) {
    {
      let v = new PreparseAstVisitor().init$pC4AulScriptFunc(func);
      def.body.accept(v);
    }
    {
      let v = new CodegenAstVisitor().init$pC4AulScriptFunc(func);
      v.EmitFunctionCode$pFunction(def);
    }
  }

  static Preparse(host, source_host, script) {
    let v = new PreparseAstVisitor().init$pC4ScriptHost$pC4ScriptHost$pC4AulScriptFunc(host, source_host);
    v.visit$pScript(script);
    ConstantResolver.resolve_quiet(host, script);
  }

  static Compile$pC4ScriptHost$pC4ScriptHost$pScript(host, source_host, script) {
    ConstantResolver.resolve(host, script);
    let v = new CodegenAstVisitor().init$pC4ScriptHost$pC4ScriptHost(host, source_host);
    v.visit$pScript(script);
  }

  $clone() { return new C4AulCompiler().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class CodegenAstVisitor$Loop {
  stack_height = 0;
  continues = [];
  breaks = [];

  init(stack_height) {
    this.stack_height = stack_height;
    this.continues = [];
    this.breaks = [];
    return this;
  }

  $clone() { return new CodegenAstVisitor$Loop().$assign(this); }
  $assign(o) {
    this.stack_height = o.stack_height;
    this.continues = o.continues.slice();
    this.breaks = o.breaks.slice();
    return this;
  }
}

export class CodegenAstVisitor$Scope {
  variables = new StdSet();

  None() {
    this.variables = new StdSet();
    return this;
  }

  $clone() { return new CodegenAstVisitor$Scope().$assign(this); }
  $assign(o) {
    this.variables = o.variables.$clone();
    return this;
  }
}

export class CodegenAstVisitor$StackGuard {
  parent = null;
  target_stack_height = 0;

  init(parent, offset = 0) {
    this.parent = parent;
    this.target_stack_height = parent.stack_height + offset | 0;
    return this;
  }

  $dtor() {
    0;
    if (this.parent.stack_height !== this.target_stack_height) {
      this.parent.HandleError(Error$pC4ScriptHost$pC4ScriptHost$x$pC4AulScriptFunc$pi8(this.parent.target_host, this.parent.host, null, this.parent.Fn, S("internal error: value stack left unbalanced")));
      this.parent.AddBCC$pi8$i32$i32(null, 41 /*AB_STACK*/, this.target_stack_height - this.parent.stack_height | 0);
    }
  }

  $clone() { return new CodegenAstVisitor$StackGuard().$assign(this); }
  $assign(o) {
    this.parent = o.parent;
    this.target_stack_height = o.target_stack_height;
    return this;
  }
}

export class CodegenAstVisitor$ScopeGuard {
  parent = null;

  init(parent) {
    this.parent = parent;
    $vunshift(parent.scopes, new CodegenAstVisitor$Scope().None());
    return this;
  }

  $dtor() {
    this.parent.scopes.shift();
  }

  $clone() { return new CodegenAstVisitor$ScopeGuard().$assign(this); }
  $assign(o) {
    this.parent = o.parent;
    return this;
  }
}

export class ConstexprEvaluator$ProplistMagic {
  active = false;
  parent = null;
  key = new StdString();

  init$v() {
    this.active = false;
    this.parent = null;
    this.key = new StdString();
    return this;
  }

  init$b$pC4PropListStatic$basic_string(active, parent, key) {
    this.active = active;
    this.parent = parent;
    this.key = key.$clone();
    return this;
  }

  $clone() { return new ConstexprEvaluator$ProplistMagic().$assign(this); }
  $assign(o) {
    this.active = o.active;
    this.parent = o.parent;
    this.key = o.key.$clone();
    return this;
  }
}

export class ConstexprEvaluator extends AstVisitor {
  host = null;
  v = new $.C4Value().init$v();
  ignore_unset_values = false;
  quiet = false;
  proplist_magic = new ConstexprEvaluator$ProplistMagic().init$v();

  static eval_(host, e, flags = 0) {
    let ce = new ConstexprEvaluator().init(host);
    ce.ignore_unset_values = (flags & 1) === 1;
    try {
      e.accept(ce);
      return new $.C4Value().$copy(ce.v);
    } catch ($e1) {
      if ($e1 instanceof $.C4AulParseError) {
        const e = $e1;
        if ((flags & 2) === 0) {
          host.Engine.ErrorHandler.OnError(e.what());
        }
        return new $.C4Value().$copy($.C4VNull);
      } else {
        throw $e1;
      }
    }
  }

  static eval_static(host, parent, parent_key, e, flags = 0) {
    let ce = new ConstexprEvaluator().init(host);
    ce.proplist_magic.$assign(new ConstexprEvaluator$ProplistMagic().init$b$pC4PropListStatic$basic_string(true, parent, parent_key.$clone()));
    ce.ignore_unset_values = (flags & 1) === 1;
    try {
      e.accept(ce);
      return new $.C4Value().$copy(ce.v);
    } catch ($e1) {
      if ($e1 instanceof $.C4AulParseError) {
        const e = $e1;
        if ((flags & 2) === 0) {
          host.Engine.ErrorHandler.OnError(e.what());
        }
        return new $.C4Value().$copy($.C4VNull);
      } else {
        throw $e1;
      }
    }
  }

  init(host) {
    this.host = host;
    this.v = new $.C4Value().init$v();
    this.ignore_unset_values = false;
    this.quiet = false;
    this.proplist_magic = new ConstexprEvaluator$ProplistMagic().init$v();
    return this;
  }

  nonconst$pNode$pi8(n, msg) {
    $throw(new ConstexprEvaluator$ExpressionNotConstant().init$pC4ScriptHost$pNode$pi8(this.host, n, msg));
  }

  nonconst$pNode$pi8$pi8$2(n, msg, args) {
    $throw(new ConstexprEvaluator$ExpressionNotConstant().init$pC4ScriptHost$pNode$pi8$pi8$2(this.host, n, msg, args));
  }

  nonconst$pNode$pi8$pi8(n, msg, args) {
    $throw(new ConstexprEvaluator$ExpressionNotConstant().init$pC4ScriptHost$pNode$pi8$pi8(this.host, n, msg, args));
  }

  nonconst$pNode$pi8$mpi8(n, msg, args) {
    $throw(new ConstexprEvaluator$ExpressionNotConstant().init$pC4ScriptHost$pNode$pi8$mpi8(this.host, n, msg, args));
  }

  AssertValueType(v, Type1, opname, n) {
    if (!v.CheckParConversion(Type1)) {
      $throw(Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8$pi8$mpi8$mpi8(this.host, this.host, n, null, S("operator \"%s\": got %s, but expected %s"), opname, v.GetTypeName(), $.GetC4VName(Type1)));
    }
  }

  visit$pStringLit(n) {
    this.v.$assign($.C4VString$pi8(n.value.c_str()));
  }

  visit$pIntLit(n) {
    this.v.$assign($.C4VInt(n.value | 0));
  }

  visit$pBoolLit(n) {
    this.v.$assign($.C4VBool(n.value));
  }

  visit$pArrayLit(n) {
    let $t1;
    let a = new $.C4ValueArray().init$i32(n.values.length);
    for (let i = 0; i < n.values.length; i = i + 1) {
      n.values[i].accept(this);
      a.SetItem(i | 0, this.v);
    }
    this.v.$assign($.C4VArray(($t1 = a, a = null, $t1)));
  }

  visit$pProplistLit(n) {
    let $t1;
    let new_proplist = null;
    let p = null;
    let first_pass = true;
    if (this.proplist_magic.active) {
      let key = $.Strings.RegString$pi8(this.proplist_magic.key.c_str());
      let old = new $.C4Value().init$v();
      if (this.proplist_magic.parent != null) {
        this.proplist_magic.parent.GetPropertyByS(key, old);
      } else {
        this.host.Engine.GetGlobalConstant(key.GetCStr(), old);
      }
      if (old.getPropList() != null) {
        p = old.getPropList();
        first_pass = false;
      } else {
        p = $.C4PropList.NewStatic(null, this.proplist_magic.parent, key);
        new_proplist = p;
      }
    } else {
      p = $.C4PropList.New$pC4PropList();
      new_proplist = p;
    }
    if (first_pass) {
      for (const kv of n.values) {
        p.SetPropertyByS($.Strings.RegString$pi8(kv.first.c_str()), $.C4VNull);
      }
    }
    let saved_magic = this.proplist_magic.$clone();
    for (const kv of n.values) {
      this.proplist_magic.$assign(new ConstexprEvaluator$ProplistMagic().init$b$pC4PropListStatic$basic_string(saved_magic.active, p.IsStatic$v(), kv.first.$clone()));
      kv.second.accept(this);
      p.SetPropertyByS($.Strings.RegString$pi8(kv.first.c_str()), this.v);
    }
    this.proplist_magic.$assign(saved_magic);
    this.v.$assign($.C4VPropList(p));
    ($t1 = new_proplist, new_proplist = null, $t1);
  }

  visit$pNilLit(_0) {
    this.v.$assign($.C4VNull);
  }

  visit$pThisLit(n) {
    this.nonconst$pNode$pi8(n, S("\"this\" is not a global constant"));
  }

  visit$pVarExpr(n) {
    let cname = n.identifier.c_str();
    let interned = $.Strings.FindString(cname);
    if (interned != null && this.host.GetPropList$v().GetPropertyByS(interned, this.v)) {
      return;
    }
    if (this.host.Engine.GetGlobalConstant(cname, this.v)) {
      return;
    }
    if (this.ignore_unset_values) {
      this.v.$assign($.C4VNull);
      return;
    }
    this.nonconst$pNode$pi8$pi8$2(n, S("the variable \"%s\" is not a global constant"), cname);
  }

  visit$pUnOpExpr(n) {
    n.operand.accept(this);
    0;
    const op = $.C4ScriptOpMap[n.op];
    if (op.Changer) {
      this.nonconst$pNode$pi8$pi8(n, S("unary operator %s is applied in a non-const fashion"), op.Identifier);
    }
    this.AssertValueType(this.v, op.Type1, op.Identifier, n);
    switch (op.Code) {
      case 19:
        this.v.SetInt(~this.v._getInt());
        break;
      case 20:
        this.v.SetBool(!this.v.getBool());
        break;
      case 21:
        this.v.SetInt(-this.v._getInt() | 0);
        break;
      default:
        0;
        $throw(Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8(this.host, this.host, n, null, S("internal error: unary operator not found in operator table")));
    }
  }

  visit$pBinOpExpr(n) {
    0;
    const op = $.C4ScriptOpMap[n.op];
    if (op.Changer) {
      this.nonconst$pNode$pi8$pi8(n, S("binary operator %s is applied in a non-const fashion"), op.Identifier);
    }
    n.lhs.accept(this);
    let lhs = new $.C4Value().$copy(this.v);
    if (op.Code === 52 && lhs.op_not() || op.Code === 53 && lhs.op_const_void_() != null || op.Code === 54 && lhs.GetType() !== 0) {
      this.v.$assign(lhs);
      return;
    }
    n.rhs.accept(this);
    const rhs = this.v;
    this.AssertValueType(lhs, op.Type1, op.Identifier, n);
    this.AssertValueType(rhs, op.Type2, op.Identifier, n);
    switch (op.Code) {
      case 22:
        this.v.SetInt($.Pow(lhs._getInt(), rhs._getInt()));
        break;
      case 23:
        do {
          if (!(rhs._getInt() !== 0)) {
            $throw(Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8(this.host, this.host, n, null, S("division by zero")));
          }
        } while (false);
        do {
          if (!(lhs._getInt() !== -0x80000000 || rhs._getInt() !== -1)) {
            $throw(Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8(this.host, this.host, n, null, S("division overflow")));
          }
        } while (false);
        this.v.SetInt(lhs._getInt() / rhs._getInt() | 0);
        break;
      case 24:
        this.v.SetInt(Math.imul(lhs._getInt(), rhs._getInt()));
        break;
      case 25:
        do {
          if (!(rhs._getInt() !== 0)) {
            $throw(Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8(this.host, this.host, n, null, S("division by zero")));
          }
        } while (false);
        do {
          if (!(lhs._getInt() !== -0x80000000 || rhs._getInt() !== -1)) {
            $throw(Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8(this.host, this.host, n, null, S("division overflow")));
          }
        } while (false);
        this.v.SetInt(lhs._getInt() / rhs._getInt() | 0);
        break;
      case 27:
        this.v.SetInt(lhs._getInt() + rhs._getInt() | 0);
        break;
      case 26:
        this.v.SetInt(lhs._getInt() - rhs._getInt() | 0);
        break;
      case 28:
        this.v.SetInt(lhs._getInt() << rhs._getInt() | 0);
        break;
      case 29:
        this.v.SetInt(lhs._getInt() >> rhs._getInt());
        break;
      case 36:
        this.v.SetInt(lhs._getInt() & rhs._getInt());
        break;
      case 37:
        this.v.SetInt(lhs._getInt() ^ rhs._getInt());
        break;
      case 38:
        this.v.SetInt(lhs._getInt() | rhs._getInt());
        break;
      case 30:
        this.v.SetBool(lhs._getInt() < rhs._getInt());
        break;
      case 31:
        this.v.SetBool(lhs._getInt() <= rhs._getInt());
        break;
      case 32:
        this.v.SetBool(lhs._getInt() > rhs._getInt());
        break;
      case 33:
        this.v.SetBool(lhs._getInt() >= rhs._getInt());
        break;
      case 34:
        this.v.SetBool(lhs.IsIdenticalTo(rhs));
        break;
      case 35:
        this.v.SetBool(!lhs.IsIdenticalTo(rhs));
        break;
      case 52:
      case 53:
      case 54:
        this.v.$assign(rhs);
        break;
      default:
        0;
        $throw(Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8(this.host, this.host, n, null, S("internal error: binary operator not found in operator table")));
        break;
    }
  }

  visit$pAssignmentExpr(n) {
    this.nonconst$pNode$pi8(n, S("updating assignment used in a non-const fashion"));
  }

  visit$pSubscriptExpr(n) {
    n.object.accept(this);
    let obj = new $.C4Value().$copy(this.v);
    n.index.accept(this);
    const index = this.v;
    if (obj.CheckConversion(5 /*C4V_Array*/)) {
      do {
        if (!index.CheckConversion(1 /*C4V_Int*/)) {
          $throw(Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8(this.host, this.host, n, null, $.FormatString(S("array access: index of type %s, but expected int"), index.GetTypeName()).getData()));
        }
      } while (false);
      this.v.$assign(obj.getArray().GetItem(index.getInt()));
    } else if (obj.CheckConversion(3 /*C4V_PropList*/)) {
      do {
        if (!index.CheckConversion(4 /*C4V_String*/)) {
          $throw(Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8(this.host, this.host, n, null, $.FormatString(S("proplist access: index of type %s, but expected string"), index.GetTypeName()).getData()));
        }
      } while (false);
      if (!obj.getPropList().GetPropertyByS(index.getStr(), this.v)) {
        this.v.Set0();
      }
    } else {
      do {
        if (true) {
          $throw(Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8(this.host, this.host, n, null, $.FormatString(S("can't access %s as array or proplist"), obj.GetTypeName()).getData()));
        }
      } while (false);
    }
  }

  visit$pSliceExpr(n) {
    n.object.accept(this);
    let obj = new $.C4Value().$copy(this.v);
    n.start.accept(this);
    let start = new $.C4Value().$copy(this.v);
    n.end.accept(this);
    const end = this.v;
    do {
      if (!obj.CheckConversion(5 /*C4V_Array*/)) {
        $throw(Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8(this.host, this.host, n, null, $.FormatString(S("array slice: can't access %s as an array"), obj.GetTypeName()).getData()));
      }
    } while (false);
    do {
      if (!start.CheckConversion(1 /*C4V_Int*/)) {
        $throw(Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8(this.host, this.host, n, null, $.FormatString(S("array slice: start index of type %s, int expected"), start.GetTypeName()).getData()));
      }
    } while (false);
    do {
      if (!end.CheckConversion(1 /*C4V_Int*/)) {
        $throw(Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8(this.host, this.host, n, null, $.FormatString(S("array slice: end index of type %s, int expected"), end.GetTypeName()).getData()));
      }
    } while (false);
    this.v.SetArray(obj.getArray().GetSlice(start.getInt(), end.getInt()));
  }

  visit$pCallExpr(n) {
    this.nonconst$pNode$pi8$mpi8(n, S("call to function (%s) not supported in constant expressions"), n.callee.c_str());
  }

  visit$pFunctionExpr(n) {
    do {
      if (!this.proplist_magic.active) {
        $throw(Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8(this.host, this.host, n, null, S("internal error: function expression outside of static proplist")));
      }
    } while (false);
    let sfunc = null;
    let first_pass = true;
    {
      let func = this.proplist_magic.parent.GetFunc$pi8(this.proplist_magic.key.c_str());
      if (func != null) {
        sfunc = func.SFunc();
        first_pass = false;
      } else {
        sfunc = new $.C4AulScriptFunc().init$pC4PropListStatic$pC4ScriptHost$pi8$pi8(this.proplist_magic.parent, this.host, this.proplist_magic.key.c_str(), n.loc);
      }
    }
    do {
      if (sfunc == null) {
        $throw(Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8(this.host, this.host, n, null, S("internal error: function expression target resolved to non-function value")));
      }
    } while (false);
    if (first_pass) {
      for (const param of n.params) {
        sfunc.AddPar(param.name.c_str());
      }
      if (n.has_unnamed_params) {
        sfunc.ParCount = 10;
      }
      let preparser = new PreparseAstVisitor().init$pC4ScriptHost$pC4ScriptHost$pC4AulScriptFunc(this.host, this.host, sfunc);
      preparser.visit$pBlock(n.body);
    } else {
      let cg = new CodegenAstVisitor().init$pC4AulScriptFunc(sfunc);
      cg.EmitFunctionCode$pFunctionExpr(n);
    }
    this.v.SetFunction(sfunc);
  }

  $clone() { return new ConstexprEvaluator().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.host = o.host;
    this.v.$assign(o.v);
    this.ignore_unset_values = o.ignore_unset_values;
    this.quiet = o.quiet;
    this.proplist_magic.$assign(o.proplist_magic);
    return this;
  }
}

export class PreparseAstVisitor extends DefaultRecursiveVisitor {
  target_host = null;
  host = null;
  Fn = null;

  init$pC4ScriptHost$pC4ScriptHost$pC4AulScriptFunc(host, source_host, func = null) {
    this.target_host = host;
    this.host = source_host;
    this.Fn = func;
    return this;
  }

  init$pC4AulScriptFunc(func) {
    this.target_host = func.pOrgScript;
    this.host = this.target_host;
    this.Fn = func;
    return this;
  }

  visit$pRangeLoop(n) {
    let cname = n.var.c_str();
    if (n.scoped_var) {
      this.Fn.VarNamed.AddName(cname);
    } else {
      if (this.Fn.VarNamed.GetItemNr(cname) === -1) {
        Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32$pi8(this.target_host, this.host, n, this.Fn, 5 /*implicit_range_loop_var_decl*/, cname);
        this.Fn.VarNamed.AddName(cname);
      }
    }
    $.DefaultRecursiveVisitor.prototype.visit$pRangeLoop.call(this, n);
  }

  visit$pVarDecl(n) {
    if (n.constant && n.scope !== 2 /*Global*/) {
      Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32(this.target_host, this.host, n, this.Fn, 6 /*non_global_var_is_never_const*/);
    }
    for (const var_ of n.decls) {
      let cname = var_.name.c_str();
      switch (n.scope) {
        case 0:
          {
            0;
            if (this.Fn == null) {
              $throw(Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8(this.target_host, this.host, n, this.Fn, S("internal error: function-local var declaration outside of function")));
            }
            if (this.target_host != null) {
              if (this.target_host.Engine.GlobalNamedNames.GetItemNr(cname) >= 0 || this.target_host.Engine.GlobalConstNames.GetItemNr(cname) >= 0) {
                Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32$x$pi8$x$2(this.target_host, this.host, n, this.Fn, 7 /*variable_shadows_variable*/, S("local variable"), cname, S("global variable"));
              }
              let s = $.Strings.FindString(cname);
              if (s != null && this.target_host.GetPropList$v().HasProperty(s)) {
                Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32$x$pi8$x$3(this.target_host, this.host, n, this.Fn, 7 /*variable_shadows_variable*/, S("local variable"), cname, S("object-local variable"));
              }
              if (this.Fn.ParNamed.GetItemNr(cname) !== -1) {
                Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32$x$pi8$x(this.target_host, this.host, n, this.Fn, 7 /*variable_shadows_variable*/, S("parameter"), cname, S("local variable"));
              }
            }
            this.Fn.VarNamed.AddName(cname);
            break;
          }
        case 1:
          {
            if (this.host.Engine.GlobalNamedNames.GetItemNr(cname) >= 0 || this.host.Engine.GlobalConstNames.GetItemNr(cname) >= 0) {
              Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32$x$pi8$x$4(this.target_host, this.host, n, this.Fn, 7 /*variable_shadows_variable*/, S("object-local variable"), cname, S("global variable"));
            }
            let s = $.Strings.RegString$pi8(cname);
            if (this.target_host.GetPropList$v().HasProperty(s)) {
              Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32$x$pi8$2(this.target_host, this.host, n, this.Fn, 9 /*redeclaration*/, S("object-local variable"), cname);
            } else {
              this.target_host.GetPropList$v().SetPropertyByS(s, $.C4VNull);
            }
            break;
          }
        case 2:
          0;
          if (this.Fn != null) {
            $throw(Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8(this.target_host, this.host, n, this.Fn, S("internal error: global var declaration inside function")));
          }
          if (this.host.Engine.GlobalNamedNames.GetItemNr(cname) >= 0 || this.host.Engine.GlobalConstNames.GetItemNr(cname) >= 0) {
            Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32$x$pi8(this.target_host, this.host, n, this.Fn, 9 /*redeclaration*/, S("global variable"), cname);
          }
          if (n.constant) {
            this.host.Engine.GlobalConstNames.AddName(cname);
          } else {
            this.host.Engine.GlobalNamedNames.AddName(cname);
          }
          break;
      }
    }
    if (n.scope === 0 /*Func*/) {
      $.DefaultRecursiveVisitor.prototype.visit$pVarDecl.call(this, n);
    }
  }

  visit$pFunctionDecl(n) {
    let Parent = n.is_global ? this.target_host.Engine.GetPropList() : this.target_host.GetPropList$v();
    let cname = n.name.c_str();
    0;
    let parent_func = Parent.GetFunc$pi8(cname);
    this.Fn = new $.C4AulScriptFunc().init$pC4PropListStatic$pC4ScriptHost$pi8$pi8(Parent, this.target_host, cname, n.loc);
    $vpush(this.host.ownedFunctions, $.C4VFunction(this.Fn));
    for (const param of n.params) {
      this.Fn.AddPar(param.name.c_str(), param.type);
    }
    if (n.has_unnamed_params) {
      this.Fn.ParCount = 10;
    }
    this.Fn.SetOverloaded(parent_func);
    Parent.SetPropertyByS(this.Fn.Name.op_C4String_(), $.C4VFunction(this.Fn));
    try {
      $.DefaultRecursiveVisitor.prototype.visit$pFunctionDecl.call(this, n);
      this.Fn = null;
    } catch ($e1) {
      {
        this.Fn = null;
        $throw($e1);
      }
    }
  }

  visit$pCallExpr(n) {
    if (n.append_unnamed_pars && this.Fn.ParCount !== 10) {
      this.Fn.ParCount = 10;
    }
    $.DefaultRecursiveVisitor.prototype.visit$pCallExpr.call(this, n);
  }

  visit$pParExpr(n) {
    if (this.Fn.ParCount !== 10) {
      Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32$x(this.target_host, this.host, n, this.Fn, 10 /*undeclared_varargs*/, S("Par()"));
      this.Fn.ParCount = 10;
    }
    $.DefaultRecursiveVisitor.prototype.visit$pParExpr.call(this, n);
  }

  visit$pAppendtoPragma(n) {
    if (n.what.empty()) {
      $vpush(this.host.Appends, new $.StdCopyStrBuf().init$string(StdString.of(S("*"))));
    } else {
      $vpush(this.host.Appends, new $.StdCopyStrBuf().init$pi8$b(n.what.c_str()));
    }
  }

  visit$pIncludePragma(n) {
    $vpush(this.host.Includes, new $.StdCopyStrBuf().init$pi8$b(n.what.c_str()));
  }

  visit$pScript(n) {
    for (const d of n.declarations) {
      try {
        d.accept(this);
      } catch ($e2) {
        if ($e2 instanceof $.C4AulParseError) {
          const e = $e2;
          this.target_host.Engine.GetErrorHandler().OnError(e.what());
        } else {
          throw $e2;
        }
      }
    }
  }

  $clone() { return new PreparseAstVisitor().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.target_host = o.target_host;
    this.host = o.host;
    this.Fn = o.Fn;
    return this;
  }
}

export class CodegenAstVisitor extends DefaultRecursiveVisitor {
  Fn = null;
  target_host = null;
  host = null;
  stack_height = 0;
  at_jump_target = false;
  active_loops = [];
  scopes = [];
  type_of_stack_top = 10 /*C4V_Any*/;

  static IsJump(t) {
    return t === 51 || t === 52 || t === 53 || t === 54 || t === 55 || t === 56;
  }

  AddJumpTarget() {
    0;
    if (this.Fn == null) {
      $throw(new $.C4AulParseError().init$pC4ScriptHost$pi8(this.host, S("internal error: jump target outside of function")));
    }
    this.at_jump_target = true;
    return this.Fn.GetCodePos();
  }

  AddJumpTo(loc, type, target) {
    this.AddBCC$pi8$i32$i32(loc, type, target - this.Fn.GetCodePos() | 0);
  }

  UpdateJump(jump, target) {
    let code = this.Fn.GetCodeByPos(jump);
    0;
    code.Par.i = target - jump | 0;
  }

  PushLoop() {
    this.active_loops.push(new CodegenAstVisitor$Loop().init(this.stack_height));
  }

  PopLoop(continue_target) {
    0;
    0;
    const loop = this.active_loops[this.active_loops.length - 1];
    for (const c of loop.continues) {
      this.UpdateJump(c, continue_target);
    }
    let loop_exit = this.AddJumpTarget();
    for (const b of loop.breaks) {
      this.UpdateJump(b, loop_exit);
    }
    this.active_loops.pop();
  }

  AddLoopControl(loc, c) {
    0;
    if (this.active_loops.length === 0) {
      $throw(new $.C4AulParseError().init$pC4ScriptHost$pi8(this.host, S("internal error: loop control code emitted outside of loop")));
    }
    0;
    if ((this.active_loops[this.active_loops.length - 1].stack_height - this.stack_height | 0) > 0) {
      this.AddBCC$pi8$i32$i32(loc, 41 /*AB_STACK*/, this.active_loops[this.active_loops.length - 1].stack_height - this.stack_height | 0);
    }
    let jump = this.AddBCC$pi8$i32$i32(loc, 51 /*AB_JUMP*/, 0);
    switch (c) {
      case 0 /*Continue*/:
        this.active_loops[this.active_loops.length - 1].continues.push(jump);
        break;
      case 1 /*Break*/:
        this.active_loops[this.active_loops.length - 1].breaks.push(jump);
        break;
    }
  }

  AddVarAccess(TokenSPos, eType, varnum) {
    return this.AddBCC$pi8$i32$i32(TokenSPos, eType, (1 + varnum | 0) - (this.stack_height + this.Fn.VarNamed.iSize | 0) | 0);
  }

  AddBCC$pi8$i32$i32(TokenSPos, eType, X = 0) {
    this.stack_height = this.stack_height + CodegenAstVisitor.GetStackValue(eType, X) | 0;
    if (eType === 48) {
      eType = 41 /*AB_STACK*/;
      X = 1;
    }
    0;
    if (!this.at_jump_target && this.Fn.GetLastCode() != null) {
      let pCPos1 = this.Fn.GetLastCode();
      if (eType === 41 && X === 0) {
        return this.Fn.GetCodePos() - 1 | 0;
      }
      if (eType === 41 && pCPos1.bccType === 41 && (X <= 0 || pCPos1.Par.i >= 0)) {
        pCPos1.Par.i = pCPos1.Par.i + X | 0;
        if (pCPos1.Par.i === 0) {
          this.Fn.RemoveLastBCC();
        }
        return this.Fn.GetCodePos() - 1 | 0;
      }
      if (eType === 41 && X < 0 && (pCPos1.bccType === 17 || pCPos1.bccType === 18)) {
        if (pCPos1.Par.X === 0) {
          pCPos1.bccType = eType;
          pCPos1.Par.i = X;
          return this.Fn.GetCodePos() - 1 | 0;
        } else {
          this.Fn.RemoveLastBCC();
          pCPos1 = $oadd(pCPos1, -1);
        }
      }
      if (eType === 41 && X === -1 && pCPos1.bccType === 8) {
        pCPos1.bccType = 9 /*AB_POP_TO*/;
        return this.Fn.GetCodePos() - 1 | 0;
      }
      if (eType === 6 && pCPos1.bccType === 9 && X === (pCPos1.Par.i + 1 | 0)) {
        pCPos1.bccType = 8 /*AB_STACK_SET*/;
        return this.Fn.GetCodePos() - 1 | 0;
      }
      if ((eType === 27 || eType === 26) && pCPos1.bccType === 42 && (pCPos1.Par.i === 1 || pCPos1.Par.i === -1)) {
        if ((pCPos1.Par.i > 0 ? 1 : 0) === (eType === 27 ? 1 : 0)) {
          pCPos1.bccType = 17 /*AB_Inc*/;
        } else {
          pCPos1.bccType = 18 /*AB_Dec*/;
        }
        pCPos1.Par.i = X;
        return this.Fn.GetCodePos() - 1 | 0;
      }
      if ((eType === 55 || eType === 56) && pCPos1.bccType === 20) {
        pCPos1.bccType = eType === 55 ? 56 /*AB_COND*/ : 55 /*AB_CONDN*/;
        pCPos1.Par.i = X + 1 | 0;
        return this.Fn.GetCodePos() - 1 | 0;
      }
      if (eType === 0 && pCPos1.bccType === 44) {
        pCPos1.bccType = 2 /*AB_PROP*/;
        return this.Fn.GetCodePos() - 1 | 0;
      }
      if (eType === 21 && pCPos1.bccType === 42) {
        pCPos1.Par.i = Math.imul(pCPos1.Par.i, -1);
        return this.Fn.GetCodePos() - 1 | 0;
      }
    }
    this.Fn.AddBCC(eType, X, TokenSPos);
    this.at_jump_target = false;
    return this.Fn.GetCodePos() - 1 | 0;
  }

  AddBCC$pi8$C4AulBCC(SPos, bcc) {
    return this.AddBCC$pi8$i32$i32(SPos, bcc.bccType, bcc.Par.X);
  }

  MaybePopValueOf(n) {
    if (n == null) {
      return;
    }
    if (!n.has_value()) {
      return;
    }
    this.AddBCC$pi8$i32$i32(n.loc, 41 /*AB_STACK*/, -1);
  }

  MaybePopValueOf(n) {
    if (n == null) {
      return;
    }
    if (!n.has_value()) {
      return;
    }
    this.AddBCC$pi8$i32$i32(n.loc, 41 /*AB_STACK*/, -1);
  }

  static GetStackValue(eType, X) {
    switch (eType) {
      case 42:
      case 43:
      case 44:
      case 45:
      case 46:
      case 47:
      case 48:
      case 10:
      case 12:
      case 6:
      case 7:
      case 15:
        return 1;
      case 22:
      case 23:
      case 24:
      case 25:
      case 26:
      case 27:
      case 28:
      case 29:
      case 30:
      case 31:
      case 32:
      case 33:
      case 34:
      case 35:
      case 36:
      case 37:
      case 38:
      case 3:
      case 0:
      case 55:
      case 56:
      case 9:
      case 58:
      case 52:
      case 53:
      case 54:
        return -1;
      case 16:
        return (-X.GetParCount() | 0) + 1 | 0;
      case 39:
      case 40:
        return -10;
      case 8:
      case 11:
      case 2:
      case 13:
      case 17:
      case 18:
      case 19:
      case 20:
      case 21:
      case 14:
      case 57:
      case 59:
      case 61:
      case 51:
      case 60:
        return 0;
      case 41:
        return X;
      case 49:
        return (-X | 0) + 1 | 0;
      case 50:
        return Math.imul(-X | 0, 2) + 1 | 0;
      case 1:
      case 4:
        return -2;
      case 5:
        return -3;
    }
    0;
    return 0;
  }

  RemoveLastBCC() {
    let pBCC = this.Fn.GetLastCode();
    0;
    this.stack_height = this.stack_height - CodegenAstVisitor.GetStackValue(pBCC.bccType, pBCC.Par.X) | 0;
    this.Fn.RemoveLastBCC();
  }

  MakeSetter(SPos, fLeaveValue) {
    0;
    let Value = new $.C4AulBCC().$copy(this.Fn.GetLastCode());
    let Setter = new $.C4AulBCC().$copy(Value);
    switch (Value.bccType) {
      case 0:
        Setter.bccType = 1 /*AB_ARRAYA_SET*/;
        break;
      case 4:
        Setter.bccType = 5 /*AB_ARRAY_SLICE_SET*/;
        break;
      case 6:
        Setter.bccType = 8 /*AB_STACK_SET*/;
        Setter.Par.i = Setter.Par.i - 1 | 0;
        break;
      case 8:
        Setter.bccType = 8 /*AB_STACK_SET*/;
        break;
      case 10:
        Setter.bccType = 11 /*AB_LOCALN_SET*/;
        break;
      case 2:
        Setter.bccType = 3 /*AB_PROP_SET*/;
        break;
      case 12:
        Setter.bccType = 13 /*AB_GLOBALN_SET*/;
        break;
      default:
        $throw(Error$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$pi8(this.target_host, this.host, SPos, this.Fn, S("assignment to a constant")));
    }
    let iParCount = 1 - CodegenAstVisitor.GetStackValue(Value.bccType, Value.Par.X) | 0;
    if (Value.bccType === 8) {
      if (!fLeaveValue) {
        this.AddBCC$pi8$i32$i32(SPos, 41 /*AB_STACK*/, -1);
      }
      iParCount = 0;
    } else if (!fLeaveValue || iParCount !== 0) {
      this.RemoveLastBCC();
      this.at_jump_target = true;
    }
    if (fLeaveValue && iParCount !== 0) {
      for (let i = 0; i < iParCount; i = i + 1 | 0) {
        this.AddBCC$pi8$i32$i32(SPos, 6 /*AB_DUP*/, 1 - iParCount | 0);
      }
      this.AddBCC$pi8$i32$i32(SPos, Value.bccType, Value.Par.X);
    }
    0;
    return Setter;
  }

  HandleError(e) {
    if (this.Fn != null) {
      this.AddBCC$pi8$i32$i32(null, 59 /*AB_ERR*/, $.Strings.RegString$pi8(e.what()));
    }
    if (this.target_host != null) {
      this.target_host.Engine.ErrorHandler.OnError(e.what());
    }
  }

  SafeVisit(node) {
    try {
      node.accept(this);
      return true;
    } catch ($e1) {
      if ($e1 instanceof $.C4AulParseError) {
        const e = $e1;
        this.HandleError(e);
        return false;
      } else {
        throw $e1;
      }
    }
  }

  SafeVisit(node) {
    try {
      node.accept(this);
      return true;
    } catch ($e1) {
      if ($e1 instanceof $.C4AulParseError) {
        const e = $e1;
        this.HandleError(e);
        return false;
      } else {
        throw $e1;
      }
    }
  }

  SafeVisit(node) {
    try {
      node.accept(this);
      return true;
    } catch ($e1) {
      if ($e1 instanceof $.C4AulParseError) {
        const e = $e1;
        this.HandleError(e);
        return false;
      } else {
        throw $e1;
      }
    }
  }

  enterScope() {
    return new CodegenAstVisitor$ScopeGuard().init(this);
  }

  WarnOnAssignment(n) {
    if ($dyncast(n, $.AssignmentExpr) != null) {
      Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32(this.target_host, this.host, n, this.Fn, 14 /*suspicious_assignment*/);
    }
  }

  init$pC4ScriptHost$pC4ScriptHost(host, source_host) {
    this.Fn = null;
    this.target_host = host;
    this.host = source_host;
    this.stack_height = 0;
    this.at_jump_target = false;
    this.active_loops = [];
    this.scopes = [];
    this.type_of_stack_top = 10 /*C4V_Any*/;
    return this;
  }

  init$pC4AulScriptFunc(func) {
    this.Fn = func;
    this.target_host = func.pOrgScript;
    this.host = this.target_host;
    this.stack_height = 0;
    this.at_jump_target = false;
    this.active_loops = [];
    this.scopes = [];
    this.type_of_stack_top = 10 /*C4V_Any*/;
    return this;
  }

  visit$pNoop(_0) {
  }

  visit$pStringLit(n) {
    let g = new CodegenAstVisitor$StackGuard().init(this, 1);
    try {
      this.AddBCC$pi8$i32$i32(n.loc, 44 /*AB_STRING*/, $.Strings.RegString$pi8(n.value.c_str()));
      this.type_of_stack_top = 4 /*C4V_String*/;
    } finally { g.$dtor(); }
  }

  visit$pIntLit(n) {
    let g = new CodegenAstVisitor$StackGuard().init(this, 1);
    try {
      this.AddBCC$pi8$i32$i32(n.loc, 42 /*AB_INT*/, n.value | 0);
      this.type_of_stack_top = 1 /*C4V_Int*/;
    } finally { g.$dtor(); }
  }

  visit$pBoolLit(n) {
    let g = new CodegenAstVisitor$StackGuard().init(this, 1);
    try {
      this.AddBCC$pi8$i32$i32(n.loc, 43 /*AB_BOOL*/, n.value ? 1 : 0);
      this.type_of_stack_top = 2 /*C4V_Bool*/;
    } finally { g.$dtor(); }
  }

  visit$pArrayLit(n) {
    let g = new CodegenAstVisitor$StackGuard().init(this, 1);
    try {
      for (const e of n.values) {
        this.SafeVisit(e);
      }
      this.AddBCC$pi8$i32$i32(n.loc, 49 /*AB_NEW_ARRAY*/, n.values.length | 0);
      this.type_of_stack_top = 5 /*C4V_Array*/;
    } finally { g.$dtor(); }
  }

  visit$pProplistLit(n) {
    let g = new CodegenAstVisitor$StackGuard().init(this, 1);
    try {
      for (const e of n.values) {
        let g = new CodegenAstVisitor$StackGuard().init(this, 2);
        try {
          this.AddBCC$pi8$i32$i32(n.loc, 44 /*AB_STRING*/, $.Strings.RegString$pi8(e.first.c_str()));
          this.SafeVisit(e.second);
        } finally { g.$dtor(); }
      }
      this.AddBCC$pi8$i32$i32(n.loc, 50 /*AB_NEW_PROPLIST*/, n.values.length | 0);
      this.type_of_stack_top = 3 /*C4V_PropList*/;
    } finally { g.$dtor(); }
  }

  visit$pNilLit(n) {
    let g = new CodegenAstVisitor$StackGuard().init(this, 1);
    try {
      this.AddBCC$pi8$i32$i32(n.loc, 48 /*AB_NIL*/);
      this.type_of_stack_top = 0 /*C4V_Nil*/;
    } finally { g.$dtor(); }
  }

  visit$pThisLit(n) {
    let g = new CodegenAstVisitor$StackGuard().init(this, 1);
    try {
      this.AddBCC$pi8$i32$i32(n.loc, 15 /*AB_THIS*/);
      this.type_of_stack_top = 3 /*C4V_PropList*/;
    } finally { g.$dtor(); }
  }

  visit$pVarExpr(n) {
    let g = new CodegenAstVisitor$StackGuard().init(this, 1);
    try {
      0;
      0;
      let dummy = new $.C4Value().init$v();
      let cname = n.identifier.c_str();
      let interned = $.Strings.FindString(cname);
      this.type_of_stack_top = 10 /*C4V_Any*/;
      if (this.Fn.ParNamed.GetItemNr(cname) !== -1) {
        let pos = this.Fn.ParNamed.GetItemNr(cname);
        this.AddVarAccess(n.loc, 6 /*AB_DUP*/, (-this.Fn.GetParCount() | 0) + pos | 0);
        this.type_of_stack_top = $rd(this.Fn.GetParType(), pos);
      } else if (this.Fn.VarNamed.GetItemNr(cname) !== -1) {
        let in_scope = !std_end(this.scopes).eq(std_find_if(std_begin(this.scopes), std_end(this.scopes), ((scope) => {
  return !scope.variables.find(n.identifier).eq(scope.variables.end());
})));
        if (!in_scope) {
          Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32$pi8(this.target_host, this.host, n, this.Fn, 8 /*variable_out_of_scope*/, cname);
        }
        this.AddVarAccess(n.loc, 6 /*AB_DUP*/, this.Fn.VarNamed.GetItemNr(cname));
      } else if (this.Fn.Parent != null && interned != null && this.Fn.Parent.GetPropertyByS(interned, dummy)) {
        this.AddBCC$pi8$i32$i32(n.loc, 10 /*AB_LOCALN*/, interned);
      } else if ($.ScriptEngine.GlobalNamedNames.GetItemNr(cname) !== -1) {
        this.AddBCC$pi8$i32$i32(n.loc, 12 /*AB_GLOBALN*/, $.ScriptEngine.GlobalNamedNames.GetItemNr(cname));
      } else if ($.ScriptEngine.GlobalConstNames.GetItemNr(cname) !== -1) {
        let v = new $.C4Value().init$v();
        do {
          if (!$.ScriptEngine.GetGlobalConstant(cname, v)) {
            $throw(Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8(this.target_host, this.host, n, this.Fn, S("internal error: global constant not retrievable")));
          }
        } while (false);
        switch (v.GetType()) {
          case 0:
            this.AddBCC$pi8$i32$i32(n.loc, 48 /*AB_NIL*/);
            break;
          case 1:
            this.AddBCC$pi8$i32$i32(n.loc, 42 /*AB_INT*/, v._getInt());
            break;
          case 2:
            this.AddBCC$pi8$i32$i32(n.loc, 43 /*AB_BOOL*/, v._getBool() ? 1 : 0);
            break;
          case 3:
            this.AddBCC$pi8$i32$i32(n.loc, 45 /*AB_CPROPLIST*/, v._getPropList());
            break;
          case 4:
            this.AddBCC$pi8$i32$i32(n.loc, 44 /*AB_STRING*/, v._getStr());
            break;
          case 5:
            this.AddBCC$pi8$i32$i32(n.loc, 46 /*AB_CARRAY*/, v._getArray());
            break;
          case 6:
            this.AddBCC$pi8$i32$i32(n.loc, 47 /*AB_CFUNCTION*/, v._getFunction());
          default:
            this.AddBCC$pi8$i32$i32(n.loc, 48 /*AB_NIL*/);
            $throw(Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8$pi8$mpi8(this.target_host, this.host, n, this.Fn, S("internal error: global constant of unexpected type: %s (of type %s)"), cname, v.GetTypeName()));
        }
        this.type_of_stack_top = v.GetType();
      } else {
        this.AddBCC$pi8$i32$i32(n.loc, 48 /*AB_NIL*/);
        $throw(Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8$pi8$2(this.target_host, this.host, n, this.Fn, S("symbol not found in any symbol table: %s"), cname));
      }
    } finally { g.$dtor(); }
  }

  visit$pUnOpExpr(n) {
    let g = new CodegenAstVisitor$StackGuard().init(this, 1);
    try {
      n.operand.accept(this);
      const op = $.C4ScriptOpMap[n.op];
      if (op.Changer) {
        let setter = this.MakeSetter(n.loc, true);
        this.AddBCC$pi8$i32$i32(n.loc, op.Code, 0);
        this.AddBCC$pi8$C4AulBCC(n.loc, setter);
        if (op.Postfix && (op.Code === 17 || op.Code === 18)) {
          this.AddBCC$pi8$i32$i32(n.loc, op.Code === 17 ? 18 /*AB_Dec*/ : 17 /*AB_Inc*/, 1);
        }
      } else {
        this.AddBCC$pi8$i32$i32(n.loc, op.Code);
      }
      this.type_of_stack_top = op.RetType;
    } finally { g.$dtor(); }
  }

  visit$pBinOpExpr(n) {
    let g = new CodegenAstVisitor$StackGuard().init(this, 1);
    try {
      this.SafeVisit(n.lhs);
      const op = $.C4ScriptOpMap[n.op];
      if (op.Code === 52 || op.Code === 53 || op.Code === 54) {
        let jump = this.AddBCC$pi8$i32$i32(n.loc, op.Code);
        this.SafeVisit(n.rhs);
        this.UpdateJump(jump, this.AddJumpTarget());
      } else if (op.Changer) {
        try {
          let setter = this.MakeSetter(n.loc, true);
          this.SafeVisit(n.rhs);
          this.AddBCC$pi8$i32$i32(n.loc, op.Code);
          this.AddBCC$pi8$C4AulBCC(n.loc, setter);
        } catch ($e3) {
          if ($e3 instanceof $.C4AulParseError) {
            const e = $e3;
            this.HandleError(e);
          } else {
            throw $e3;
          }
        }
      } else {
        this.SafeVisit(n.rhs);
        this.AddBCC$pi8$i32$i32(n.loc, op.Code, 0);
      }
      this.type_of_stack_top = op.RetType;
    } finally { g.$dtor(); }
  }

  visit$pAssignmentExpr(n) {
    let g = new CodegenAstVisitor$StackGuard().init(this, 1);
    try {
      this.SafeVisit(n.lhs);
      try {
        let setter = this.MakeSetter(n.loc, false);
        this.SafeVisit(n.rhs);
        this.AddBCC$pi8$C4AulBCC(n.loc, setter);
      } catch ($e2) {
        if ($e2 instanceof $.C4AulParseError) {
          const e = $e2;
          this.HandleError(e);
        } else {
          throw $e2;
        }
      }
    } finally { g.$dtor(); }
  }

  visit$pSubscriptExpr(n) {
    let g = new CodegenAstVisitor$StackGuard().init(this, 1);
    try {
      this.SafeVisit(n.object);
      this.SafeVisit(n.index);
      this.AddBCC$pi8$i32$i32(n.loc, 0 /*AB_ARRAYA*/);
      this.type_of_stack_top = 10 /*C4V_Any*/;
    } finally { g.$dtor(); }
  }

  visit$pSliceExpr(n) {
    let g = new CodegenAstVisitor$StackGuard().init(this, 1);
    try {
      this.SafeVisit(n.object);
      this.SafeVisit(n.start);
      this.SafeVisit(n.end);
      this.AddBCC$pi8$i32$i32(n.loc, 4 /*AB_ARRAY_SLICE*/);
      this.type_of_stack_top = 5 /*C4V_Array*/;
    } finally { g.$dtor(); }
  }

  visit$pCallExpr(n) {
    let cname = n.callee.c_str();
    if (n.callee.eq(S("__debugbreak"))) {
      if (n.context != null) {
        $throw(Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8$pi8$2(this.target_host, this.host, n, this.Fn, S("\"%s\" can't be called in a different context"), cname));
      }
      if (!(n.args.length === 0)) {
        $throw(Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8$pi8$2(this.target_host, this.host, n, this.Fn, S("\"%s\" must not have any arguments"), cname));
      }
      this.AddBCC$pi8$i32$i32(n.loc, 60 /*AB_DEBUG*/);
      this.AddBCC$pi8$i32$i32(n.loc, 48 /*AB_NIL*/);
      this.type_of_stack_top = 0 /*C4V_Nil*/;
      return;
    }
    if (n.callee.eq(S("inherited")) || n.callee.eq(S("_inherited"))) {
      if (n.context != null) {
        $throw(Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8$pi8$2(this.target_host, this.host, n, this.Fn, S("\"%s\" can't be called in a different context"), cname));
      }
    }
    if (n.callee.eq(S("inherited")) && this.Fn.OwnerOverloaded == null) {
      $throw(Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8(this.target_host, this.host, n, this.Fn, S("inherited function not found (use _inherited to disable this message)")));
    }
    let pre_call_stack = this.stack_height;
    if (n.context != null) {
      this.SafeVisit(n.context);
    }
    let known_par_types = [];
    void 0;
    for (const arg of n.args) {
      this.SafeVisit(arg);
      known_par_types.push(this.type_of_stack_top);
    }
    let callee = null;
    if (n.callee.eq(S("inherited")) || n.callee.eq(S("_inherited"))) {
      callee = this.Fn.OwnerOverloaded;
    }
    const fn_argc = [10];
    if (n.context == null) {
      if (callee == null) {
        callee = this.Fn.Parent.GetFunc$pi8(cname);
      }
      if (callee == null && this.target_host != null) {
        callee = this.target_host.Engine.GetFunc$pi8(cname);
      }
      if (callee != null) {
        fn_argc[0] = $u64n(callee.GetParCount());
      } else {
        if (!(n.args.length === 0)) {
          this.AddBCC$pi8$i32$i32(n.loc, 41 /*AB_STACK*/, -(n.args.length | 0) | 0);
        }
        this.AddBCC$pi8$i32$i32(n.loc, 48 /*AB_NIL*/);
        this.type_of_stack_top = 0 /*C4V_Nil*/;
        if (n.callee.ne(S("_inherited"))) {
          this.HandleError(Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8$pi8$2(this.target_host, this.host, n, this.Fn, S("called function not found: %s"), cname));
        }
        return;
      }
    }
    if (n.args.length > fn_argc[0]) {
      Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32$pi8$mu32$ru64(this.target_host, this.host, n.args[fn_argc[0]], this.Fn, 11 /*arg_count_mismatch*/, cname, n.args.length >>> 0, P(fn_argc, 0));
      this.AddBCC$pi8$i32$i32(n.loc, 41 /*AB_STACK*/, fn_argc[0] - n.args.length | 0);
    } else if (n.args.length < fn_argc[0]) {
      if (n.append_unnamed_pars) {
        0;
        let missing_par_count = fn_argc[0] - n.args.length | 0;
        let available_par_count = this.Fn.GetParCount() - this.Fn.ParNamed.iSize | 0;
        for (let i = 0; i < $min(missing_par_count, available_par_count); i = i + 1 | 0) {
          this.AddVarAccess(n.loc, 6 /*AB_DUP*/, ((-this.Fn.GetParCount() | 0) + this.Fn.ParNamed.iSize | 0) + i | 0);
        }
        if (available_par_count < missing_par_count) {
          this.AddBCC$pi8$i32$i32(n.loc, 41 /*AB_STACK*/, missing_par_count - available_par_count | 0);
        }
      } else if (fn_argc[0] > n.args.length) {
        this.AddBCC$pi8$i32$i32(n.loc, 41 /*AB_STACK*/, fn_argc[0] - n.args.length | 0);
      }
    }
    let expected_par_types = [];
    if (n.context != null) {
      this.AddBCC$pi8$i32$i32(n.loc, n.safe_call ? 40 /*AB_CALLFS*/ : 39 /*AB_CALL*/, $.Strings.RegString$pi8(cname));
      let candidate = this.target_host != null ? this.target_host.Engine.GetFirstFunc(cname) : null;
      if (candidate != null) {
        seq_assign(expected_par_types, candidate.GetParType(), $padd(candidate.GetParType(), candidate.GetParCount()));
        while ((candidate = this.target_host.Engine.GetNextSNFunc(candidate)) != null) {
          if ($u64n(candidate.GetParCount()) > expected_par_types.length) {
            resize(expected_par_types, $u64n(candidate.GetParCount()), () => 10 /*C4V_Any*/);
          }
          for (let i = 0; i < expected_par_types.length; i = i + 1) {
            let a = expected_par_types[i];
            let b = $rd(candidate.GetParType(), i);
            let implicit_a_to_b = !$.C4Value.WarnAboutConversion(a, b);
            let implicit_b_to_a = !$.C4Value.WarnAboutConversion(b, a);
            if (implicit_a_to_b && !implicit_b_to_a) {
              expected_par_types[i] = b;
            } else if (implicit_b_to_a && !implicit_a_to_b) {
              expected_par_types[i] = a;
            } else if (!implicit_a_to_b && !implicit_b_to_a) {
              expected_par_types[i] = 10 /*C4V_Any*/;
            }
          }
        }
      }
      this.type_of_stack_top = 10 /*C4V_Any*/;
    } else {
      0;
      this.AddBCC$pi8$i32$i32(n.loc, 16 /*AB_FUNC*/, callee);
      seq_assign(expected_par_types, callee.GetParType(), $padd(callee.GetParType(), callee.GetParCount()));
      this.type_of_stack_top = callee.GetRetType();
    }
    for (let i = 0; i < $min(known_par_types.length, expected_par_types.length); i = i + 1) {
      let from = known_par_types[i];
      let to = expected_par_types[i];
      if ($.C4Value.WarnAboutConversion(from, to)) {
        Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32$mu32$pi8$mpi8$mpi8(this.target_host, this.host, n.args[i], this.Fn, 12 /*arg_type_mismatch*/, i >>> 0, cname, $.GetC4VName(from), $.GetC4VName(to));
      }
    }
    0;
  }

  visit$pParExpr(n) {
    let g = new CodegenAstVisitor$StackGuard().init(this, 1);
    try {
      this.SafeVisit(n.arg);
      this.AddBCC$pi8$i32$i32(n.loc, 14 /*AB_PAR*/);
      this.type_of_stack_top = 10 /*C4V_Any*/;
    } finally { g.$dtor(); }
  }

  visit$pBlock(n) {
    let scope = this.enterScope();
    try {
      for (const s of n.children) {
        let g = new CodegenAstVisitor$StackGuard().init(this, 0);
        try {
          if (this.SafeVisit(s)) {
            this.MaybePopValueOf(s);
          }
        } finally { g.$dtor(); }
      }
    } finally { scope.$dtor(); }
  }

  visit$pReturn(n) {
    let g = new CodegenAstVisitor$StackGuard().init(this, 0);
    try {
      this.WarnOnAssignment(n.value);
      this.SafeVisit(n.value);
      this.AddBCC$pi8$i32$i32(n.loc, 58 /*AB_RETURN*/);
    } finally { g.$dtor(); }
  }

  visit$pForLoop(n) {
    let scope = this.enterScope();
    try {
      if (n.init != null) {
        if (this.SafeVisit(n.init)) {
          this.MaybePopValueOf(n.init);
        }
      }
      let cond = -1;
      this.PushLoop();
      if (n.cond != null) {
        cond = this.AddJumpTarget();
        this.SafeVisit(n.cond);
        this.active_loops[this.active_loops.length - 1].breaks.push(this.AddBCC$pi8$i32$i32(n.cond.loc, 55 /*AB_CONDN*/));
      }
      let body = this.AddJumpTarget();
      if (n.cond == null) {
        cond = body;
      }
      if (this.SafeVisit(n.body)) {
        this.MaybePopValueOf(n.body);
      }
      let incr = -1;
      if (n.incr != null) {
        incr = this.AddJumpTarget();
        if (this.SafeVisit(n.incr)) {
          this.MaybePopValueOf(n.incr);
        }
      } else {
        incr = cond;
      }
      this.AddJumpTo(n.loc, 51 /*AB_JUMP*/, cond);
      this.PopLoop(incr);
    } finally { scope.$dtor(); }
  }

  visit$pRangeLoop(n) {
    let scope = this.enterScope();
    try {
      this.scopes[0].variables.insert(n.var);
      let cname = n.var.c_str();
      let var_id = this.Fn.VarNamed.GetItemNr(cname);
      0;
      if (var_id === -1) {
        $throw(Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8$pi8$2(this.target_host, this.host, n, this.Fn, S("internal error: unable to find variable in foreach: %s"), cname));
      }
      this.SafeVisit(n.cond);
      this.AddBCC$pi8$i32$i32(n.loc, 42 /*AB_INT*/, 0);
      let cond = this.AddJumpTarget();
      this.PushLoop();
      this.AddVarAccess(n.loc, 57 /*AB_FOREACH_NEXT*/, var_id);
      this.AddLoopControl(n.loc, 1 /*Break*/);
      if (this.SafeVisit(n.body)) {
        this.MaybePopValueOf(n.body);
      }
      this.AddLoopControl(n.loc, 0 /*Continue*/);
      this.PopLoop(cond);
      this.AddBCC$pi8$i32$i32(n.loc, 41 /*AB_STACK*/, -2);
    } finally { scope.$dtor(); }
  }

  visit$pDoLoop(n) {
    let scope = this.enterScope();
    try {
      let body = this.AddJumpTarget();
      this.PushLoop();
      if (this.SafeVisit(n.body)) {
        this.MaybePopValueOf(n.body);
      }
      let cond = this.AddJumpTarget();
      this.SafeVisit(n.cond);
      this.AddJumpTo(n.loc, 56 /*AB_COND*/, body);
      this.PopLoop(cond);
    } finally { scope.$dtor(); }
  }

  visit$pWhileLoop(n) {
    let scope = this.enterScope();
    try {
      let cond = this.AddJumpTarget();
      this.PushLoop();
      this.SafeVisit(n.cond);
      this.active_loops[this.active_loops.length - 1].breaks.push(this.AddBCC$pi8$i32$i32(n.cond.loc, 55 /*AB_CONDN*/));
      if (this.SafeVisit(n.body)) {
        this.MaybePopValueOf(n.body);
      }
      this.AddLoopControl(n.loc, 0 /*Continue*/);
      this.PopLoop(cond);
    } finally { scope.$dtor(); }
  }

  visit$pBreak(n) {
    do {
      if (!!(this.active_loops.length === 0)) {
        $throw(Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8(this.target_host, this.host, n, this.Fn, S("'break' outside loop")));
      }
    } while (false);
    this.AddLoopControl(n.loc, 1 /*Break*/);
  }

  visit$pContinue(n) {
    do {
      if (!!(this.active_loops.length === 0)) {
        $throw(Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8(this.target_host, this.host, n, this.Fn, S("'continue' outside loop")));
      }
    } while (false);
    this.AddLoopControl(n.loc, 0 /*Continue*/);
  }

  visit$pIf(n) {
    let scope = this.enterScope();
    try {
      this.WarnOnAssignment(n.cond);
      this.SafeVisit(n.cond);
      let jump = this.AddBCC$pi8$i32$i32(n.loc, 55 /*AB_CONDN*/);
      if ($dyncast(n.iftrue, $.Noop) != null) {
        Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32(this.target_host, this.host, n.iftrue.loc, this.Fn, 13 /*empty_if*/);
      }
      if (this.SafeVisit(n.iftrue)) {
        this.MaybePopValueOf(n.iftrue);
      }
      if ($dyncast(n.iffalse, $.Noop) != null) {
        Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32(this.target_host, this.host, n.iffalse.loc, this.Fn, 13 /*empty_if*/);
      }
      if (n.iffalse != null) {
        let jumpout = this.AddBCC$pi8$i32$i32(n.loc, 51 /*AB_JUMP*/);
        this.UpdateJump(jump, this.AddJumpTarget());
        jump = jumpout;
        if (this.SafeVisit(n.iffalse)) {
          this.MaybePopValueOf(n.iffalse);
        }
      }
      this.UpdateJump(jump, this.AddJumpTarget());
    } finally { scope.$dtor(); }
  }

  visit$pVarDecl(n) {
    for (const dec of n.decls) {
      let cname = dec.name.c_str();
      switch (n.scope) {
        case 0:
          this.scopes[0].variables.insert(dec.name);
          if (dec.init != null) {
            this.SafeVisit(dec.init);
            let var_idx = this.Fn.VarNamed.GetItemNr(cname);
            0;
            if (var_idx < 0) {
              this.AddBCC$pi8$i32$i32(n.loc, 41 /*AB_STACK*/, -1);
              $throw(Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8$pi8$2(this.target_host, this.host, n, this.Fn, S("internal error: var not found in variable table: %s"), cname));
            }
            this.AddVarAccess(n.loc, 9 /*AB_POP_TO*/, var_idx);
          }
          break;
        case 1:
        case 2:
          break;
      }
    }
  }

  visit$pFunctionDecl(n) {
    0;
    if (this.Fn != null) {
      $throw(Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8$mpi8(this.target_host, this.host, n, this.Fn, S("internal error: function declaration for '%s' encountered within active function"), n.name.c_str()));
    }
    let Parent = n.is_global ? this.target_host.Engine.GetPropList() : this.target_host.GetPropList$v();
    let name = $.Strings.FindString(n.name.c_str());
    let f = Parent.GetFunc$pC4String(name);
    while (f != null) {
      if (f.SFunc() != null && f.SFunc().pOrgScript === this.host && f.Parent === Parent) {
        if (this.Fn != null) {
          Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32$x$mpi8(this.target_host, this.host, n, this.Fn, 9 /*redeclaration*/, S("function"), f.GetName());
        }
        this.Fn = f.SFunc();
      }
      f = f.SFunc() != null ? f.SFunc().OwnerOverloaded : null;
    }
    if (this.Fn == null && Parent.HasProperty(name)) {
      $throw(Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8$mpi8$mpi8(this.target_host, this.host, n, this.Fn, S("declaration of '%s': cannot override local variable via 'func %s'"), n.name.c_str(), n.name.c_str()));
    }
    0;
    if (this.Fn == null) {
      $throw(Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8$mpi8(this.target_host, this.host, n, this.Fn, S("internal error: unable to find function definition for %s"), n.name.c_str()));
    }
    if (!n.is_global && this.Fn.OwnerOverloaded == null) {
      let global_parent = this.target_host.Engine.GetFunc$pi8(this.Fn.GetName());
      if (global_parent != null) {
        this.Fn.SetOverloaded(global_parent);
      }
    }
    try {
      this.EmitFunctionCode$pFunctionDecl(n);
      this.Fn = null;
    } catch ($e1) {
      {
        this.Fn = null;
        $throw($e1);
      }
    }
  }

  visit$pFunctionExpr(n) {
    this.AddBCC$pi8$i32$i32(n.loc, 48 /*AB_NIL*/);
    $throw(Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8(this.target_host, this.host, n, this.Fn, S("can't define a function in a function-scoped proplist")));
  }

  visit$pScript(n) {
    for (const d of n.declarations) {
      this.SafeVisit(d);
    }
  }

  EmitFunctionCode$pFunction(n) {
    this.EmitFunctionCode$pFunction$pNode(n, $dyncast(n, $.Node));
  }

  EmitFunctionCode$pFunctionDecl(n) {
    this.EmitFunctionCode$pFunction$pNode(n, $dyncast(n, $.Node));
  }

  EmitFunctionCode$pFunctionExpr(n) {
    this.EmitFunctionCode$pFunction$pNode(n, $dyncast(n, $.Node));
  }

  EmitFunctionCode$pFunction$pNode(f, n) {
    0;
    0;
    this.Fn.ClearCode();
    if (this.Fn.VarNamed.iSize > 0) {
      this.AddBCC$pi8$i32$i32(n.loc, 41 /*AB_STACK*/, this.Fn.VarNamed.iSize);
    }
    this.stack_height = 0;
    let scope = this.enterScope();
    try {
      try {
        f.body.accept(this);
      } catch ($e2) {
        if ($e2 instanceof $.C4AulParseError) {
          const e = $e2;
          this.AddBCC$pi8$i32$i32(null, 59 /*AB_ERR*/, $.Strings.RegString$pi8(e.what()));
          $throw($e2);
        } else {
          throw $e2;
        }
      }
      if (f.body.children.length === 0 || !($dyncast($rbegin(f.body.children).v, $.Return) != null)) {
        this.AddBCC$pi8$i32$i32(n.loc, 48 /*AB_NIL*/);
        this.AddBCC$pi8$i32$i32(n.loc, 58 /*AB_RETURN*/);
      }
      this.Fn.DumpByteCode();
      this.AddBCC$pi8$i32$i32(n.loc, 61 /*AB_EOFN*/);
      0;
    } finally { scope.$dtor(); }
  }

  $clone() { return new CodegenAstVisitor().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Fn = o.Fn;
    this.target_host = o.target_host;
    this.host = o.host;
    this.stack_height = o.stack_height;
    this.at_jump_target = o.at_jump_target;
    this.active_loops = o.active_loops.$clone();
    this.scopes = o.scopes.slice();
    this.type_of_stack_top = o.type_of_stack_top;
    return this;
  }
}

export class ConstexprEvaluator$ExpressionNotConstant extends C4AulParseError {

  init$pC4ScriptHost$pNode$pi8(host, n, reason) {
    super.$assign(Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8(host, host, n, null, reason));
    return this;
  }

  init$pC4ScriptHost$pNode$pi8$pi8$2(host, n, reason, args) {
    super.$assign(Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8$pi8$2(host, host, n, null, reason, args));
    return this;
  }

  init$pC4ScriptHost$pNode$pi8$pi8(host, n, reason, args) {
    super.$assign(Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8$pi8(host, host, n, null, reason, args));
    return this;
  }

  init$pC4ScriptHost$pNode$pi8$mpi8(host, n, reason, args) {
    super.$assign(Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8$mpi8(host, host, n, null, reason, args));
    return this;
  }

  $clone() { return new ConstexprEvaluator$ExpressionNotConstant().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class ConstantResolver extends DefaultRecursiveVisitor {
  host = null;
  quiet = false;

  init(host) {
    this.host = host;
    this.quiet = false;
    return this;
  }

  static resolve_quiet(host, script) {
    let r = new ConstantResolver().init(host);
    r.quiet = true;
    r.visit$pScript(script);
  }

  static resolve(host, script) {
    let r = new ConstantResolver().init(host);
    r.visit$pScript(script);
  }

  visit$pScript(n) {
    for (const d of n.declarations) {
      try {
        d.accept(this);
      } catch ($e2) {
        if ($e2 instanceof $.C4AulParseError) {
          const e = $e2;
          this.host.Engine.GetErrorHandler().OnError(e.what());
        } else {
          throw $e2;
        }
      }
    }
  }

  visit$pVarDecl(n) {
    let quiet_flag = this.quiet ? 2 : 0;
    for (const dec of n.decls) {
      let cname = dec.name.c_str();
      let name = new $.C4RefCntPointer$C4String().init$pC4String($.Strings.RegString$pi8(cname));
      switch (n.scope) {
        case 0:
          break;
        case 1:
          if (!this.host.GetPropList$v().HasProperty(name.op_C4String_())) {
            this.host.GetPropList$v().SetPropertyByS(name.op_C4String_(), $.C4VNull);
          }
          if (dec.init != null) {
            0;
            try {
              let v = ConstexprEvaluator.eval_static(this.host, this.host.GetPropList$v().IsStatic$v(), dec.name, dec.init, 1 | quiet_flag);
              this.host.GetPropList$v().SetPropertyByS(name.op_C4String_(), v);
            } catch ($e5) {
              if ($e5 instanceof $.C4AulParseError) {
                const e = $e5;
                if (!this.quiet) {
                  this.host.Engine.ErrorHandler.OnError(e.what());
                }
              } else {
                throw $e5;
              }
            }
          }
          break;
        case 2:
          if ((dec.init != null ? 1 : 0) !== (n.constant ? 1 : 0)) {
            if (!this.quiet) {
              this.host.Engine.ErrorHandler.OnError(Error$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$pi8$pi8$2(this.host, this.host, n.loc, null, S("global variable must be either constant or uninitialized: %s"), cname).what());
            }
          } else if (dec.init != null) {
            try {
              0;
              let v = this.host.Engine.GlobalConsts.GetItem$pi8(cname);
              0;
              if (v == null) {
                $throw(Error$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$pi8$pi8$2(this.host, this.host, n.loc, null, S("internal error: global constant not found in variable table: %s"), cname));
              }
              v.$assign(ConstexprEvaluator.eval_static(this.host, null, dec.name, dec.init, 1 | quiet_flag));
            } catch ($e5) {
              if ($e5 instanceof $.C4AulParseError) {
                const e = $e5;
                if (!this.quiet) {
                  this.host.Engine.ErrorHandler.OnError(e.what());
                }
              } else {
                throw $e5;
              }
            }
          }
          break;
      }
    }
  }

  $clone() { return new ConstantResolver().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.host = o.host;
    this.quiet = o.quiet;
    return this;
  }
}

function GetScriptLinkType(source_host, target_host) {
  if (source_host === target_host) {
    return 1 /*Same*/;
  }
  const sources = target_host.SourceScripts;
  let source_script_index = std_find(std_begin(sources), std_end(sources), source_host);
  let target_script_index = std_find(std_begin(sources), std_end(sources), target_host);
  0;
  if (source_script_index.i < target_script_index.i) {
    return 0 /*Include*/;
  } else if (source_script_index.i > target_script_index.i) {
    return 2 /*Appendto*/;
  }
  return 1 /*Same*/;
}

function FormatCodePosition(source_host, pos, target_host = null, func = null) {
  let s = new StdString();
  if (func != null && func.GetFullName().op_const_void_() != null) {
    s.append($.strprintf(S(" (in %s"), func.GetFullName().getData()));
    if (source_host != null && pos != null) {
      s.append(S(", "));
    } else {
      s.append(S(")"));
    }
  }
  if (source_host != null && pos != null) {
    if (func == null || func.GetFullName().op_not()) {
      s.append(S(" ("));
    }
    let line = $.SGetLine(source_host.GetScript(), pos);
    let col = $.SLineGetCharacters(source_host.GetScript(), pos);
    s.append($.strprintf(S("%s:%d:%d)"), source_host.GetFilePath(), line, col));
  }
  if (target_host != null && source_host !== target_host) {
    if (GetScriptLinkType(source_host, target_host) === 0 /*Include*/) {
      s.append($.strprintf(S(" (included by %s)"), target_host.ScriptName.getData()));
    } else {
      s.append($.strprintf(S(" (appended to %s)"), target_host.ScriptName.getData()));
    }
  }
  return s;
}

function Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32(target_host, host, SPos, func, warning) {
  if (host == null) {
    if (warning === 0 /*invalid_escape_sequence*/ && false) {
      return;
    }
    if (warning === 1 /*invalid_hex_escape*/ && false) {
      return;
    }
    if (warning === 2 /*type_name_used_as_par_name*/ && true) {
      return;
    }
    if (warning === 3 /*empty_parameter_in_call*/ && true) {
      return;
    }
    if (warning === 4 /*empty_parameter_in_array*/ && true) {
      return;
    }
    if (warning === 5 /*implicit_range_loop_var_decl*/ && false) {
      return;
    }
    if (warning === 6 /*non_global_var_is_never_const*/ && false) {
      return;
    }
    if (warning === 7 /*variable_shadows_variable*/ && false) {
      return;
    }
    if (warning === 8 /*variable_out_of_scope*/ && false) {
      return;
    }
    if (warning === 9 /*redeclaration*/ && false) {
      return;
    }
    if (warning === 10 /*undeclared_varargs*/ && false) {
      return;
    }
    if (warning === 11 /*arg_count_mismatch*/ && false) {
      return;
    }
    if (warning === 12 /*arg_type_mismatch*/ && false) {
      return;
    }
    if (warning === 13 /*empty_if*/ && false) {
      return;
    }
    if (warning === 14 /*suspicious_assignment*/ && false) {
      return;
    }
  } else if (target_host != null && GetScriptLinkType(host, target_host) === 0 /*Include*/) {
    return;
  } else if (!host.IsWarningEnabled(SPos, warning)) {
    return;
  }
  let msg = $.C4AulWarningMessages[$u64n(warning)];
  let message = false ? $.strprintf(msg) : StdString.of(msg);
  message.append(FormatCodePosition(host, SPos, target_host, func));
  message.append(S(" ["));
  message.append($.C4AulWarningIDs[$u64n(warning)]);
  message.append(93);
  $.ScriptEngine.GetErrorHandler().OnWarning(message.c_str());
}

function Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32$x$pi8$x(target_host, host, SPos, func, warning, args, args$2, args$3) {
  if (host == null) {
    if (warning === 0 /*invalid_escape_sequence*/ && false) {
      return;
    }
    if (warning === 1 /*invalid_hex_escape*/ && false) {
      return;
    }
    if (warning === 2 /*type_name_used_as_par_name*/ && true) {
      return;
    }
    if (warning === 3 /*empty_parameter_in_call*/ && true) {
      return;
    }
    if (warning === 4 /*empty_parameter_in_array*/ && true) {
      return;
    }
    if (warning === 5 /*implicit_range_loop_var_decl*/ && false) {
      return;
    }
    if (warning === 6 /*non_global_var_is_never_const*/ && false) {
      return;
    }
    if (warning === 7 /*variable_shadows_variable*/ && false) {
      return;
    }
    if (warning === 8 /*variable_out_of_scope*/ && false) {
      return;
    }
    if (warning === 9 /*redeclaration*/ && false) {
      return;
    }
    if (warning === 10 /*undeclared_varargs*/ && false) {
      return;
    }
    if (warning === 11 /*arg_count_mismatch*/ && false) {
      return;
    }
    if (warning === 12 /*arg_type_mismatch*/ && false) {
      return;
    }
    if (warning === 13 /*empty_if*/ && false) {
      return;
    }
    if (warning === 14 /*suspicious_assignment*/ && false) {
      return;
    }
  } else if (target_host != null && GetScriptLinkType(host, target_host) === 0 /*Include*/) {
    return;
  } else if (!host.IsWarningEnabled(SPos, warning)) {
    return;
  }
  let msg = $.C4AulWarningMessages[$u64n(warning)];
  let message = true ? $.strprintf(msg, P(args, 0), args$2, P(args$3, 0)) : StdString.of(msg);
  message.append(FormatCodePosition(host, SPos, target_host, func));
  message.append(S(" ["));
  message.append($.C4AulWarningIDs[$u64n(warning)]);
  message.append(93);
  $.ScriptEngine.GetErrorHandler().OnWarning(message.c_str());
}

function Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32$x$pi8$x$2(target_host, host, SPos, func, warning, args, args$2, args$3) {
  if (host == null) {
    if (warning === 0 /*invalid_escape_sequence*/ && false) {
      return;
    }
    if (warning === 1 /*invalid_hex_escape*/ && false) {
      return;
    }
    if (warning === 2 /*type_name_used_as_par_name*/ && true) {
      return;
    }
    if (warning === 3 /*empty_parameter_in_call*/ && true) {
      return;
    }
    if (warning === 4 /*empty_parameter_in_array*/ && true) {
      return;
    }
    if (warning === 5 /*implicit_range_loop_var_decl*/ && false) {
      return;
    }
    if (warning === 6 /*non_global_var_is_never_const*/ && false) {
      return;
    }
    if (warning === 7 /*variable_shadows_variable*/ && false) {
      return;
    }
    if (warning === 8 /*variable_out_of_scope*/ && false) {
      return;
    }
    if (warning === 9 /*redeclaration*/ && false) {
      return;
    }
    if (warning === 10 /*undeclared_varargs*/ && false) {
      return;
    }
    if (warning === 11 /*arg_count_mismatch*/ && false) {
      return;
    }
    if (warning === 12 /*arg_type_mismatch*/ && false) {
      return;
    }
    if (warning === 13 /*empty_if*/ && false) {
      return;
    }
    if (warning === 14 /*suspicious_assignment*/ && false) {
      return;
    }
  } else if (target_host != null && GetScriptLinkType(host, target_host) === 0 /*Include*/) {
    return;
  } else if (!host.IsWarningEnabled(SPos, warning)) {
    return;
  }
  let msg = $.C4AulWarningMessages[$u64n(warning)];
  let message = true ? $.strprintf(msg, P(args, 0), args$2, P(args$3, 0)) : StdString.of(msg);
  message.append(FormatCodePosition(host, SPos, target_host, func));
  message.append(S(" ["));
  message.append($.C4AulWarningIDs[$u64n(warning)]);
  message.append(93);
  $.ScriptEngine.GetErrorHandler().OnWarning(message.c_str());
}

function Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32$x$pi8$x$3(target_host, host, SPos, func, warning, args, args$2, args$3) {
  if (host == null) {
    if (warning === 0 /*invalid_escape_sequence*/ && false) {
      return;
    }
    if (warning === 1 /*invalid_hex_escape*/ && false) {
      return;
    }
    if (warning === 2 /*type_name_used_as_par_name*/ && true) {
      return;
    }
    if (warning === 3 /*empty_parameter_in_call*/ && true) {
      return;
    }
    if (warning === 4 /*empty_parameter_in_array*/ && true) {
      return;
    }
    if (warning === 5 /*implicit_range_loop_var_decl*/ && false) {
      return;
    }
    if (warning === 6 /*non_global_var_is_never_const*/ && false) {
      return;
    }
    if (warning === 7 /*variable_shadows_variable*/ && false) {
      return;
    }
    if (warning === 8 /*variable_out_of_scope*/ && false) {
      return;
    }
    if (warning === 9 /*redeclaration*/ && false) {
      return;
    }
    if (warning === 10 /*undeclared_varargs*/ && false) {
      return;
    }
    if (warning === 11 /*arg_count_mismatch*/ && false) {
      return;
    }
    if (warning === 12 /*arg_type_mismatch*/ && false) {
      return;
    }
    if (warning === 13 /*empty_if*/ && false) {
      return;
    }
    if (warning === 14 /*suspicious_assignment*/ && false) {
      return;
    }
  } else if (target_host != null && GetScriptLinkType(host, target_host) === 0 /*Include*/) {
    return;
  } else if (!host.IsWarningEnabled(SPos, warning)) {
    return;
  }
  let msg = $.C4AulWarningMessages[$u64n(warning)];
  let message = true ? $.strprintf(msg, P(args, 0), args$2, P(args$3, 0)) : StdString.of(msg);
  message.append(FormatCodePosition(host, SPos, target_host, func));
  message.append(S(" ["));
  message.append($.C4AulWarningIDs[$u64n(warning)]);
  message.append(93);
  $.ScriptEngine.GetErrorHandler().OnWarning(message.c_str());
}

function Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32$x$pi8(target_host, host, SPos, func, warning, args, args$2) {
  if (host == null) {
    if (warning === 0 /*invalid_escape_sequence*/ && false) {
      return;
    }
    if (warning === 1 /*invalid_hex_escape*/ && false) {
      return;
    }
    if (warning === 2 /*type_name_used_as_par_name*/ && true) {
      return;
    }
    if (warning === 3 /*empty_parameter_in_call*/ && true) {
      return;
    }
    if (warning === 4 /*empty_parameter_in_array*/ && true) {
      return;
    }
    if (warning === 5 /*implicit_range_loop_var_decl*/ && false) {
      return;
    }
    if (warning === 6 /*non_global_var_is_never_const*/ && false) {
      return;
    }
    if (warning === 7 /*variable_shadows_variable*/ && false) {
      return;
    }
    if (warning === 8 /*variable_out_of_scope*/ && false) {
      return;
    }
    if (warning === 9 /*redeclaration*/ && false) {
      return;
    }
    if (warning === 10 /*undeclared_varargs*/ && false) {
      return;
    }
    if (warning === 11 /*arg_count_mismatch*/ && false) {
      return;
    }
    if (warning === 12 /*arg_type_mismatch*/ && false) {
      return;
    }
    if (warning === 13 /*empty_if*/ && false) {
      return;
    }
    if (warning === 14 /*suspicious_assignment*/ && false) {
      return;
    }
  } else if (target_host != null && GetScriptLinkType(host, target_host) === 0 /*Include*/) {
    return;
  } else if (!host.IsWarningEnabled(SPos, warning)) {
    return;
  }
  let msg = $.C4AulWarningMessages[$u64n(warning)];
  let message = true ? $.strprintf(msg, P(args, 0), args$2) : StdString.of(msg);
  message.append(FormatCodePosition(host, SPos, target_host, func));
  message.append(S(" ["));
  message.append($.C4AulWarningIDs[$u64n(warning)]);
  message.append(93);
  $.ScriptEngine.GetErrorHandler().OnWarning(message.c_str());
}

function Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32$x$pi8$2(target_host, host, SPos, func, warning, args, args$2) {
  if (host == null) {
    if (warning === 0 /*invalid_escape_sequence*/ && false) {
      return;
    }
    if (warning === 1 /*invalid_hex_escape*/ && false) {
      return;
    }
    if (warning === 2 /*type_name_used_as_par_name*/ && true) {
      return;
    }
    if (warning === 3 /*empty_parameter_in_call*/ && true) {
      return;
    }
    if (warning === 4 /*empty_parameter_in_array*/ && true) {
      return;
    }
    if (warning === 5 /*implicit_range_loop_var_decl*/ && false) {
      return;
    }
    if (warning === 6 /*non_global_var_is_never_const*/ && false) {
      return;
    }
    if (warning === 7 /*variable_shadows_variable*/ && false) {
      return;
    }
    if (warning === 8 /*variable_out_of_scope*/ && false) {
      return;
    }
    if (warning === 9 /*redeclaration*/ && false) {
      return;
    }
    if (warning === 10 /*undeclared_varargs*/ && false) {
      return;
    }
    if (warning === 11 /*arg_count_mismatch*/ && false) {
      return;
    }
    if (warning === 12 /*arg_type_mismatch*/ && false) {
      return;
    }
    if (warning === 13 /*empty_if*/ && false) {
      return;
    }
    if (warning === 14 /*suspicious_assignment*/ && false) {
      return;
    }
  } else if (target_host != null && GetScriptLinkType(host, target_host) === 0 /*Include*/) {
    return;
  } else if (!host.IsWarningEnabled(SPos, warning)) {
    return;
  }
  let msg = $.C4AulWarningMessages[$u64n(warning)];
  let message = true ? $.strprintf(msg, P(args, 0), args$2) : StdString.of(msg);
  message.append(FormatCodePosition(host, SPos, target_host, func));
  message.append(S(" ["));
  message.append($.C4AulWarningIDs[$u64n(warning)]);
  message.append(93);
  $.ScriptEngine.GetErrorHandler().OnWarning(message.c_str());
}

function Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32$x$pi8$x$4(target_host, host, SPos, func, warning, args, args$2, args$3) {
  if (host == null) {
    if (warning === 0 /*invalid_escape_sequence*/ && false) {
      return;
    }
    if (warning === 1 /*invalid_hex_escape*/ && false) {
      return;
    }
    if (warning === 2 /*type_name_used_as_par_name*/ && true) {
      return;
    }
    if (warning === 3 /*empty_parameter_in_call*/ && true) {
      return;
    }
    if (warning === 4 /*empty_parameter_in_array*/ && true) {
      return;
    }
    if (warning === 5 /*implicit_range_loop_var_decl*/ && false) {
      return;
    }
    if (warning === 6 /*non_global_var_is_never_const*/ && false) {
      return;
    }
    if (warning === 7 /*variable_shadows_variable*/ && false) {
      return;
    }
    if (warning === 8 /*variable_out_of_scope*/ && false) {
      return;
    }
    if (warning === 9 /*redeclaration*/ && false) {
      return;
    }
    if (warning === 10 /*undeclared_varargs*/ && false) {
      return;
    }
    if (warning === 11 /*arg_count_mismatch*/ && false) {
      return;
    }
    if (warning === 12 /*arg_type_mismatch*/ && false) {
      return;
    }
    if (warning === 13 /*empty_if*/ && false) {
      return;
    }
    if (warning === 14 /*suspicious_assignment*/ && false) {
      return;
    }
  } else if (target_host != null && GetScriptLinkType(host, target_host) === 0 /*Include*/) {
    return;
  } else if (!host.IsWarningEnabled(SPos, warning)) {
    return;
  }
  let msg = $.C4AulWarningMessages[$u64n(warning)];
  let message = true ? $.strprintf(msg, P(args, 0), args$2, P(args$3, 0)) : StdString.of(msg);
  message.append(FormatCodePosition(host, SPos, target_host, func));
  message.append(S(" ["));
  message.append($.C4AulWarningIDs[$u64n(warning)]);
  message.append(93);
  $.ScriptEngine.GetErrorHandler().OnWarning(message.c_str());
}

function Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32$x(target_host, host, SPos, func, warning, args) {
  if (host == null) {
    if (warning === 0 /*invalid_escape_sequence*/ && false) {
      return;
    }
    if (warning === 1 /*invalid_hex_escape*/ && false) {
      return;
    }
    if (warning === 2 /*type_name_used_as_par_name*/ && true) {
      return;
    }
    if (warning === 3 /*empty_parameter_in_call*/ && true) {
      return;
    }
    if (warning === 4 /*empty_parameter_in_array*/ && true) {
      return;
    }
    if (warning === 5 /*implicit_range_loop_var_decl*/ && false) {
      return;
    }
    if (warning === 6 /*non_global_var_is_never_const*/ && false) {
      return;
    }
    if (warning === 7 /*variable_shadows_variable*/ && false) {
      return;
    }
    if (warning === 8 /*variable_out_of_scope*/ && false) {
      return;
    }
    if (warning === 9 /*redeclaration*/ && false) {
      return;
    }
    if (warning === 10 /*undeclared_varargs*/ && false) {
      return;
    }
    if (warning === 11 /*arg_count_mismatch*/ && false) {
      return;
    }
    if (warning === 12 /*arg_type_mismatch*/ && false) {
      return;
    }
    if (warning === 13 /*empty_if*/ && false) {
      return;
    }
    if (warning === 14 /*suspicious_assignment*/ && false) {
      return;
    }
  } else if (target_host != null && GetScriptLinkType(host, target_host) === 0 /*Include*/) {
    return;
  } else if (!host.IsWarningEnabled(SPos, warning)) {
    return;
  }
  let msg = $.C4AulWarningMessages[$u64n(warning)];
  let message = true ? $.strprintf(msg, P(args, 0)) : StdString.of(msg);
  message.append(FormatCodePosition(host, SPos, target_host, func));
  message.append(S(" ["));
  message.append($.C4AulWarningIDs[$u64n(warning)]);
  message.append(93);
  $.ScriptEngine.GetErrorHandler().OnWarning(message.c_str());
}

function Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32$x$mpi8(target_host, host, SPos, func, warning, args, args$2) {
  if (host == null) {
    if (warning === 0 /*invalid_escape_sequence*/ && false) {
      return;
    }
    if (warning === 1 /*invalid_hex_escape*/ && false) {
      return;
    }
    if (warning === 2 /*type_name_used_as_par_name*/ && true) {
      return;
    }
    if (warning === 3 /*empty_parameter_in_call*/ && true) {
      return;
    }
    if (warning === 4 /*empty_parameter_in_array*/ && true) {
      return;
    }
    if (warning === 5 /*implicit_range_loop_var_decl*/ && false) {
      return;
    }
    if (warning === 6 /*non_global_var_is_never_const*/ && false) {
      return;
    }
    if (warning === 7 /*variable_shadows_variable*/ && false) {
      return;
    }
    if (warning === 8 /*variable_out_of_scope*/ && false) {
      return;
    }
    if (warning === 9 /*redeclaration*/ && false) {
      return;
    }
    if (warning === 10 /*undeclared_varargs*/ && false) {
      return;
    }
    if (warning === 11 /*arg_count_mismatch*/ && false) {
      return;
    }
    if (warning === 12 /*arg_type_mismatch*/ && false) {
      return;
    }
    if (warning === 13 /*empty_if*/ && false) {
      return;
    }
    if (warning === 14 /*suspicious_assignment*/ && false) {
      return;
    }
  } else if (target_host != null && GetScriptLinkType(host, target_host) === 0 /*Include*/) {
    return;
  } else if (!host.IsWarningEnabled(SPos, warning)) {
    return;
  }
  let msg = $.C4AulWarningMessages[$u64n(warning)];
  let message = true ? $.strprintf(msg, P(args, 0), args$2) : StdString.of(msg);
  message.append(FormatCodePosition(host, SPos, target_host, func));
  message.append(S(" ["));
  message.append($.C4AulWarningIDs[$u64n(warning)]);
  message.append(93);
  $.ScriptEngine.GetErrorHandler().OnWarning(message.c_str());
}

function Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32$pi8(target_host, host, SPos, func, warning, args) {
  if (host == null) {
    if (warning === 0 /*invalid_escape_sequence*/ && false) {
      return;
    }
    if (warning === 1 /*invalid_hex_escape*/ && false) {
      return;
    }
    if (warning === 2 /*type_name_used_as_par_name*/ && true) {
      return;
    }
    if (warning === 3 /*empty_parameter_in_call*/ && true) {
      return;
    }
    if (warning === 4 /*empty_parameter_in_array*/ && true) {
      return;
    }
    if (warning === 5 /*implicit_range_loop_var_decl*/ && false) {
      return;
    }
    if (warning === 6 /*non_global_var_is_never_const*/ && false) {
      return;
    }
    if (warning === 7 /*variable_shadows_variable*/ && false) {
      return;
    }
    if (warning === 8 /*variable_out_of_scope*/ && false) {
      return;
    }
    if (warning === 9 /*redeclaration*/ && false) {
      return;
    }
    if (warning === 10 /*undeclared_varargs*/ && false) {
      return;
    }
    if (warning === 11 /*arg_count_mismatch*/ && false) {
      return;
    }
    if (warning === 12 /*arg_type_mismatch*/ && false) {
      return;
    }
    if (warning === 13 /*empty_if*/ && false) {
      return;
    }
    if (warning === 14 /*suspicious_assignment*/ && false) {
      return;
    }
  } else if (target_host != null && GetScriptLinkType(host, target_host) === 0 /*Include*/) {
    return;
  } else if (!host.IsWarningEnabled(SPos, warning)) {
    return;
  }
  let msg = $.C4AulWarningMessages[$u64n(warning)];
  let message = true ? $.strprintf(msg, args) : StdString.of(msg);
  message.append(FormatCodePosition(host, SPos, target_host, func));
  message.append(S(" ["));
  message.append($.C4AulWarningIDs[$u64n(warning)]);
  message.append(93);
  $.ScriptEngine.GetErrorHandler().OnWarning(message.c_str());
}

function Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32$pi8$mu32$ru64(target_host, host, SPos, func, warning, args, args$2, args$3) {
  if (host == null) {
    if (warning === 0 /*invalid_escape_sequence*/ && false) {
      return;
    }
    if (warning === 1 /*invalid_hex_escape*/ && false) {
      return;
    }
    if (warning === 2 /*type_name_used_as_par_name*/ && true) {
      return;
    }
    if (warning === 3 /*empty_parameter_in_call*/ && true) {
      return;
    }
    if (warning === 4 /*empty_parameter_in_array*/ && true) {
      return;
    }
    if (warning === 5 /*implicit_range_loop_var_decl*/ && false) {
      return;
    }
    if (warning === 6 /*non_global_var_is_never_const*/ && false) {
      return;
    }
    if (warning === 7 /*variable_shadows_variable*/ && false) {
      return;
    }
    if (warning === 8 /*variable_out_of_scope*/ && false) {
      return;
    }
    if (warning === 9 /*redeclaration*/ && false) {
      return;
    }
    if (warning === 10 /*undeclared_varargs*/ && false) {
      return;
    }
    if (warning === 11 /*arg_count_mismatch*/ && false) {
      return;
    }
    if (warning === 12 /*arg_type_mismatch*/ && false) {
      return;
    }
    if (warning === 13 /*empty_if*/ && false) {
      return;
    }
    if (warning === 14 /*suspicious_assignment*/ && false) {
      return;
    }
  } else if (target_host != null && GetScriptLinkType(host, target_host) === 0 /*Include*/) {
    return;
  } else if (!host.IsWarningEnabled(SPos, warning)) {
    return;
  }
  let msg = $.C4AulWarningMessages[$u64n(warning)];
  let message = true ? $.strprintf(msg, args, args$2, args$3.a[args$3.o]) : StdString.of(msg);
  message.append(FormatCodePosition(host, SPos, target_host, func));
  message.append(S(" ["));
  message.append($.C4AulWarningIDs[$u64n(warning)]);
  message.append(93);
  $.ScriptEngine.GetErrorHandler().OnWarning(message.c_str());
}

function Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32$mu32$pi8$mpi8$mpi8(target_host, host, SPos, func, warning, args, args$2, args$3, args$4) {
  if (host == null) {
    if (warning === 0 /*invalid_escape_sequence*/ && false) {
      return;
    }
    if (warning === 1 /*invalid_hex_escape*/ && false) {
      return;
    }
    if (warning === 2 /*type_name_used_as_par_name*/ && true) {
      return;
    }
    if (warning === 3 /*empty_parameter_in_call*/ && true) {
      return;
    }
    if (warning === 4 /*empty_parameter_in_array*/ && true) {
      return;
    }
    if (warning === 5 /*implicit_range_loop_var_decl*/ && false) {
      return;
    }
    if (warning === 6 /*non_global_var_is_never_const*/ && false) {
      return;
    }
    if (warning === 7 /*variable_shadows_variable*/ && false) {
      return;
    }
    if (warning === 8 /*variable_out_of_scope*/ && false) {
      return;
    }
    if (warning === 9 /*redeclaration*/ && false) {
      return;
    }
    if (warning === 10 /*undeclared_varargs*/ && false) {
      return;
    }
    if (warning === 11 /*arg_count_mismatch*/ && false) {
      return;
    }
    if (warning === 12 /*arg_type_mismatch*/ && false) {
      return;
    }
    if (warning === 13 /*empty_if*/ && false) {
      return;
    }
    if (warning === 14 /*suspicious_assignment*/ && false) {
      return;
    }
  } else if (target_host != null && GetScriptLinkType(host, target_host) === 0 /*Include*/) {
    return;
  } else if (!host.IsWarningEnabled(SPos, warning)) {
    return;
  }
  let msg = $.C4AulWarningMessages[$u64n(warning)];
  let message = true ? $.strprintf(msg, args, args$2, args$3, args$4) : StdString.of(msg);
  message.append(FormatCodePosition(host, SPos, target_host, func));
  message.append(S(" ["));
  message.append($.C4AulWarningIDs[$u64n(warning)]);
  message.append(93);
  $.ScriptEngine.GetErrorHandler().OnWarning(message.c_str());
}

function Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32(target_host, host, n, func, warning) {
  return Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32(target_host, host, n.loc, func, warning);
}

function Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32$x$pi8$x(target_host, host, n, func, warning, args, args$2, args$3) {
  return Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32$x$pi8$x(target_host, host, n.loc, func, warning, args, args$2, args$3);
}

function Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32$x$pi8$x$2(target_host, host, n, func, warning, args, args$2, args$3) {
  return Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32$x$pi8$x$2(target_host, host, n.loc, func, warning, args, args$2, args$3);
}

function Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32$x$pi8$x$3(target_host, host, n, func, warning, args, args$2, args$3) {
  return Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32$x$pi8$x$3(target_host, host, n.loc, func, warning, args, args$2, args$3);
}

function Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32$x$pi8(target_host, host, n, func, warning, args, args$2) {
  return Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32$x$pi8(target_host, host, n.loc, func, warning, args, args$2);
}

function Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32$x$pi8$2(target_host, host, n, func, warning, args, args$2) {
  return Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32$x$pi8$2(target_host, host, n.loc, func, warning, args, args$2);
}

function Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32$x$pi8$x$4(target_host, host, n, func, warning, args, args$2, args$3) {
  return Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32$x$pi8$x$4(target_host, host, n.loc, func, warning, args, args$2, args$3);
}

function Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32$x(target_host, host, n, func, warning, args) {
  return Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32$x(target_host, host, n.loc, func, warning, args);
}

function Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32$x$mpi8(target_host, host, n, func, warning, args, args$2) {
  return Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32$x$mpi8(target_host, host, n.loc, func, warning, args, args$2);
}

function Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32$pi8(target_host, host, n, func, warning, args) {
  return Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32$pi8(target_host, host, n.loc, func, warning, args);
}

function Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32$pi8$mu32$ru64(target_host, host, n, func, warning, args, args$2, args$3) {
  return Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32$pi8$mu32$ru64(target_host, host, n.loc, func, warning, args, args$2, $tmp(args$3.a[args$3.o]));
}

function Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32$mu32$pi8$mpi8$mpi8(target_host, host, n, func, warning, args, args$2, args$3, args$4) {
  return Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32$mu32$pi8$mpi8$mpi8(target_host, host, n.loc, func, warning, args, args$2, args$3, args$4);
}

function Error$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$pi8(target_host, host, SPos, func, msg) {
  let message = false ? $.strprintf(msg) : StdString.of(msg);
  message.append(FormatCodePosition(host, SPos, target_host, func));
  return new $.C4AulParseError().init$pC4ScriptHost$pi8(null, message.c_str());
}

function Error$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$pi8$mpi8(target_host, host, SPos, func, msg, args) {
  let message = true ? $.strprintf(msg, args) : StdString.of(msg);
  message.append(FormatCodePosition(host, SPos, target_host, func));
  return new $.C4AulParseError().init$pC4ScriptHost$pi8(null, message.c_str());
}

function Error$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$pi8$mpi8$mpi8(target_host, host, SPos, func, msg, args, args$2) {
  let message = true ? $.strprintf(msg, args, args$2) : StdString.of(msg);
  message.append(FormatCodePosition(host, SPos, target_host, func));
  return new $.C4AulParseError().init$pC4ScriptHost$pi8(null, message.c_str());
}

function Error$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$pi8$pi8(target_host, host, SPos, func, msg, args) {
  let message = true ? $.strprintf(msg, args) : StdString.of(msg);
  message.append(FormatCodePosition(host, SPos, target_host, func));
  return new $.C4AulParseError().init$pC4ScriptHost$pi8(null, message.c_str());
}

function Error$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$pi8$pi8$2(target_host, host, SPos, func, msg, args) {
  let message = true ? $.strprintf(msg, args) : StdString.of(msg);
  message.append(FormatCodePosition(host, SPos, target_host, func));
  return new $.C4AulParseError().init$pC4ScriptHost$pi8(null, message.c_str());
}

function Error$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$pi8$pi8$mpi8(target_host, host, SPos, func, msg, args, args$2) {
  let message = true ? $.strprintf(msg, args, args$2) : StdString.of(msg);
  message.append(FormatCodePosition(host, SPos, target_host, func));
  return new $.C4AulParseError().init$pC4ScriptHost$pi8(null, message.c_str());
}

function Error$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$pi8$pi8$mpi8$mpi8(target_host, host, SPos, func, msg, args, args$2, args$3) {
  let message = true ? $.strprintf(msg, args, args$2, args$3) : StdString.of(msg);
  message.append(FormatCodePosition(host, SPos, target_host, func));
  return new $.C4AulParseError().init$pC4ScriptHost$pi8(null, message.c_str());
}

function Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8(target_host, host, n, func, msg) {
  return Error$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$pi8(target_host, host, n.loc, func, msg);
}

function Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8$mpi8(target_host, host, n, func, msg, args) {
  return Error$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$pi8$mpi8(target_host, host, n.loc, func, msg, args);
}

function Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8$mpi8$mpi8(target_host, host, n, func, msg, args, args$2) {
  return Error$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$pi8$mpi8$mpi8(target_host, host, n.loc, func, msg, args, args$2);
}

function Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8$pi8(target_host, host, n, func, msg, args) {
  return Error$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$pi8$pi8(target_host, host, n.loc, func, msg, args);
}

function Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8$pi8$2(target_host, host, n, func, msg, args) {
  return Error$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$pi8$pi8$2(target_host, host, n.loc, func, msg, args);
}

function Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8$pi8$mpi8(target_host, host, n, func, msg, args, args$2) {
  return Error$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$pi8$pi8$mpi8(target_host, host, n.loc, func, msg, args, args$2);
}

function Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8$pi8$mpi8$mpi8(target_host, host, n, func, msg, args, args$2, args$3) {
  return Error$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$pi8$pi8$mpi8$mpi8(target_host, host, n.loc, func, msg, args, args$2, args$3);
}

function Error$pC4ScriptHost$pC4ScriptHost$x$pC4AulScriptFunc$pi8(target_host, host, _2, func, msg) {
  return Error$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$pi8(target_host, host, null, func, msg);
}

export function $init(): void {
}

Object.assign($, { C4AulCompiler, CodegenAstVisitor, CodegenAstVisitor$Loop, CodegenAstVisitor$Scope, CodegenAstVisitor$ScopeGuard, CodegenAstVisitor$StackGuard, ConstantResolver, ConstexprEvaluator, ConstexprEvaluator$ExpressionNotConstant, ConstexprEvaluator$ProplistMagic, Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8, Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8$mpi8, Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8$mpi8$mpi8, Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8$pi8, Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8$pi8$2, Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8$pi8$mpi8, Error$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$pi8$pi8$mpi8$mpi8, Error$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$pi8, Error$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$pi8$mpi8, Error$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$pi8$mpi8$mpi8, Error$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$pi8$pi8, Error$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$pi8$pi8$2, Error$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$pi8$pi8$mpi8, Error$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$pi8$pi8$mpi8$mpi8, Error$pC4ScriptHost$pC4ScriptHost$x$pC4AulScriptFunc$pi8, FormatCodePosition, GetScriptLinkType, PreparseAstVisitor, Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32, Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32$mu32$pi8$mpi8$mpi8, Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32$pi8, Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32$pi8$mu32$ru64, Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32$x, Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32$x$mpi8, Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32$x$pi8, Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32$x$pi8$2, Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32$x$pi8$x, Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32$x$pi8$x$2, Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32$x$pi8$x$3, Warn$pC4ScriptHost$pC4ScriptHost$pNode$pC4AulScriptFunc$i32$x$pi8$x$4, Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32, Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32$mu32$pi8$mpi8$mpi8, Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32$pi8, Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32$pi8$mu32$ru64, Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32$x, Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32$x$mpi8, Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32$x$pi8, Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32$x$pi8$2, Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32$x$pi8$x, Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32$x$pi8$x$2, Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32$x$pi8$x$3, Warn$pC4ScriptHost$pC4ScriptHost$pi8$pC4AulScriptFunc$i32$x$pi8$x$4 });
