// @ts-nocheck
// OpenClonk 36de799: src/script/C4AulParse.cpp, src/script/C4AulParse.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n } from '../../rt/int.ts';
import { c$isxdigit } from '../../rt/libc.ts';
import { $oadd, $oat, $own, $padd, $peq, $rd, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $fill_list, $itcopy, $min, $throw, $vpush, StdMap, StdPair, StdString, std_begin, std_equal, std_find_if, std_find_if_not } from '../../rt/std.ts';

export class C4ScriptOpDef {
  Priority = 0;
  Identifier = null;
  Code = 0;
  Postfix = false;
  Changer = false;
  NoSecondStatement = false;
  RetType = 0;
  Type1 = 0;
  Type2 = 0;

  $clone() { return new C4ScriptOpDef().$assign(this); }
  $assign(o) {
    this.Priority = o.Priority;
    this.Identifier = o.Identifier;
    this.Code = o.Code;
    this.Postfix = o.Postfix;
    this.Changer = o.Changer;
    this.NoSecondStatement = o.NoSecondStatement;
    this.RetType = o.RetType;
    this.Type1 = o.Type1;
    this.Type2 = o.Type2;
    return this;
  }
}

export class C4AulParse {
  Fn = null;
  Host = null;
  pOrgScript = null;
  Engine = null;
  SPos = null;
  TokenSPos = null;
  Idtf = new Int8Array(100);
  TokenType = 0;
  cInt = 0;
  cStr = null;
  ContextToExecIn = null;
  parse_pos_stack = [];

  init$pC4ScriptHost(a) {
    this.Fn = null;
    this.Host = a;
    this.pOrgScript = a;
    this.Engine = a.Engine;
    this.SPos = a.Script.getData();
    this.TokenSPos = this.SPos;
    this.TokenType = 0 /*ATT_INVALID*/;
    this.ContextToExecIn = null;
    this.parse_pos_stack = [];
    return this;
  }

  init$pC4AulScriptFunc$pC4AulScriptContext$pC4AulScriptEngine(Fn, context, Engine) {
    this.Fn = Fn;
    this.Host = null;
    this.pOrgScript = null;
    this.Engine = Engine;
    this.SPos = Fn.Script;
    this.TokenSPos = this.SPos;
    this.TokenType = 0 /*ATT_INVALID*/;
    this.ContextToExecIn = context;
    this.parse_pos_stack = [];
    return this;
  }

  $dtor() {
    C4AulParse.prototype.ClearToken.call(this);
  }

  Parse_DirectExec(_code, whole_function) {
    this.Shift();
    let func = null;
    if (whole_function) {
      func = this.Parse_ToplevelFunctionDecl();
    } else {
      let expr = this.Parse_Expression();
      func = new $.FunctionDecl().init(StdString.of(S("$internal$eval")));
      func.body = new $.Block().None();
      func.body.children.push(new $.Return().init(expr));
    }
    this.Match(20 /*ATT_EOF*/);
    return func;
  }

  Parse_Script(scripthost) {
    this.pOrgScript = scripthost;
    this.SPos = this.pOrgScript.Script.getData();
    let SPos0 = this.SPos;
    let first_error = true;
    let script = $.Script.New$pi8(SPos0);
    while (true) {
      try {
        if ($peq(this.SPos, SPos0)) {
          this.Shift();
        }
        SPos0 = this.SPos;
        switch (this.TokenType) {
          case 1:
            if ($.SEqual(P(this.Idtf, 0), S("#include"))) {
              this.Shift();
              this.Check(2 /*ATT_IDTF*/, S("script name"));
              script.declarations.push($.IncludePragma.New$pi8$rx(this.TokenSPos, this.Idtf));
              this.Shift();
            } else if ($.SEqual(P(this.Idtf, 0), S("#appendto"))) {
              if (this.pOrgScript.GetPropList$v().GetDef$v() != null) {
                $throw(new $.C4AulParseError().init$pC4AulParse$pi8(this, S("#appendto in a Definition")));
              }
              this.Shift();
              switch (this.TokenType) {
                case 2:
                  script.declarations.push($.AppendtoPragma.New$pi8$rx(this.TokenSPos, this.Idtf));
                  break;
                case 19:
                  if ($.SEqual($.C4ScriptOpMap[this.cInt].Identifier, S("*"))) {
                    script.declarations.push($.AppendtoPragma.New$pi8(this.TokenSPos));
                    break;
                  }
                default:
                  this.UnexpectedToken(S("identifier or '*'"));
              }
              this.Shift();
            } else {
              this.Error_(S("unknown directive: %s"), P(this.Idtf, 0));
            }
            break;
          case 2:
            if ($.SEqual(P(this.Idtf, 0), S("local")) || $.SEqual(P(this.Idtf, 0), S("static"))) {
              script.declarations.push(this.Parse_Var());
              this.Match(8 /*ATT_SCOLON*/);
            } else {
              script.declarations.push(this.Parse_ToplevelFunctionDecl());
            }
            break;
          case 20:
            return script;
          default:
            this.UnexpectedToken(S("declaration"));
        }
        first_error = true;
      } catch ($e2) {
        if ($e2 instanceof $.C4AulError) {
          const err = $e2;
          if (first_error) {
            this.Engine.errCnt = this.Engine.errCnt + 1 | 0;
            $.ScriptEngine.ErrorHandler.OnError(err.what());
          }
          first_error = false;
        } else {
          throw $e2;
        }
      }
    }
  }

  Parse_WarningPragma() {
    0;
    let line = StdString.of($padd($padd(this.TokenSPos, 9), -1), this.SPos);
    let end = line.end();
    let cursor = std_find_if_not(std_begin(line), $itcopy(end), $.IsWhiteSpace);
    if (cursor.eq(end)) {
      $throw(new $.C4AulParseError().init$pC4AulParse$pi8(this, S("'enable' or 'disable' expected, but found end of line")));
    }
    let start = $itcopy(cursor);
    cursor = std_find_if($itcopy(start), $itcopy(end), $.IsWhiteSpace).copy();
    let enable_warning = false;
    if ($u64n(cursor.i - start.i) === 6 && std_equal($itcopy(start), $itcopy(cursor), S("enable"))) {
      enable_warning = true;
    } else if ($u64n(cursor.i - start.i) === 7 && std_equal($itcopy(start), $itcopy(cursor), S("disable"))) {
      enable_warning = false;
    } else {
      $throw(new $.C4AulParseError().init$pC4AulParse$pi8(this, $.FormatString(S("'enable' or 'disable' expected, but found '%s'"), StdString.of($itcopy(start), $itcopy(cursor)).c_str()).getData()));
    }
    if (this.pOrgScript == null) {
      return;
    }
    cursor = std_find_if_not($itcopy(cursor), $itcopy(end), $.IsWhiteSpace).copy();
    if (cursor.eq(end)) {
      this.pOrgScript.EnableWarning(this.TokenSPos, 0 /*invalid_escape_sequence*/, enable_warning);
      this.pOrgScript.EnableWarning(this.TokenSPos, 1 /*invalid_hex_escape*/, enable_warning);
      this.pOrgScript.EnableWarning(this.TokenSPos, 2 /*type_name_used_as_par_name*/, enable_warning);
      this.pOrgScript.EnableWarning(this.TokenSPos, 3 /*empty_parameter_in_call*/, enable_warning);
      this.pOrgScript.EnableWarning(this.TokenSPos, 4 /*empty_parameter_in_array*/, enable_warning);
      this.pOrgScript.EnableWarning(this.TokenSPos, 5 /*implicit_range_loop_var_decl*/, enable_warning);
      this.pOrgScript.EnableWarning(this.TokenSPos, 6 /*non_global_var_is_never_const*/, enable_warning);
      this.pOrgScript.EnableWarning(this.TokenSPos, 7 /*variable_shadows_variable*/, enable_warning);
      this.pOrgScript.EnableWarning(this.TokenSPos, 8 /*variable_out_of_scope*/, enable_warning);
      this.pOrgScript.EnableWarning(this.TokenSPos, 9 /*redeclaration*/, enable_warning);
      this.pOrgScript.EnableWarning(this.TokenSPos, 10 /*undeclared_varargs*/, enable_warning);
      this.pOrgScript.EnableWarning(this.TokenSPos, 11 /*arg_count_mismatch*/, enable_warning);
      this.pOrgScript.EnableWarning(this.TokenSPos, 12 /*arg_type_mismatch*/, enable_warning);
      this.pOrgScript.EnableWarning(this.TokenSPos, 13 /*empty_if*/, enable_warning);
      this.pOrgScript.EnableWarning(this.TokenSPos, 14 /*suspicious_assignment*/, enable_warning);
      return;
    }
    if (!('C4AulParse$Parse_WarningPragma$warnings' in $)) $.C4AulParse$Parse_WarningPragma$warnings = $fill_list(new StdMap(), $own([
  (($p) => new StdPair(StdString.of($p.first), $p.second))(new StdPair(S("invalid_escape_sequence"), 0 /*invalid_escape_sequence*/)),
  (($p) => new StdPair(StdString.of($p.first), $p.second))(new StdPair(S("invalid_hex_escape"), 1 /*invalid_hex_escape*/)),
  (($p) => new StdPair(StdString.of($p.first), $p.second))(new StdPair(S("type_name_used_as_par_name"), 2 /*type_name_used_as_par_name*/)),
  (($p) => new StdPair(StdString.of($p.first), $p.second))(new StdPair(S("empty_parameter_in_call"), 3 /*empty_parameter_in_call*/)),
  (($p) => new StdPair(StdString.of($p.first), $p.second))(new StdPair(S("empty_parameter_in_array"), 4 /*empty_parameter_in_array*/)),
  (($p) => new StdPair(StdString.of($p.first), $p.second))(new StdPair(S("implicit_range_loop_var_decl"), 5 /*implicit_range_loop_var_decl*/)),
  (($p) => new StdPair(StdString.of($p.first), $p.second))(new StdPair(S("non_global_var_is_never_const"), 6 /*non_global_var_is_never_const*/)),
  (($p) => new StdPair(StdString.of($p.first), $p.second))(new StdPair(S("variable_shadows_variable"), 7 /*variable_shadows_variable*/)),
  (($p) => new StdPair(StdString.of($p.first), $p.second))(new StdPair(S("variable_out_of_scope"), 8 /*variable_out_of_scope*/)),
  (($p) => new StdPair(StdString.of($p.first), $p.second))(new StdPair(S("redeclaration"), 9 /*redeclaration*/)),
  (($p) => new StdPair(StdString.of($p.first), $p.second))(new StdPair(S("undeclared_varargs"), 10 /*undeclared_varargs*/)),
  (($p) => new StdPair(StdString.of($p.first), $p.second))(new StdPair(S("arg_count_mismatch"), 11 /*arg_count_mismatch*/)),
  (($p) => new StdPair(StdString.of($p.first), $p.second))(new StdPair(S("arg_type_mismatch"), 12 /*arg_type_mismatch*/)),
  (($p) => new StdPair(StdString.of($p.first), $p.second))(new StdPair(S("empty_if"), 13 /*empty_if*/)),
  (($p) => new StdPair(StdString.of($p.first), $p.second))(new StdPair(S("suspicious_assignment"), 14 /*suspicious_assignment*/)),
]));
    while (!cursor.eq(end)) {
      start = std_find_if_not($itcopy(cursor), $itcopy(end), $.IsWhiteSpace).copy();
      cursor = std_find_if($itcopy(start), $itcopy(end), $.IsWhiteSpace).copy();
      let entry = $.C4AulParse$Parse_WarningPragma$warnings.find(StdString.of($itcopy(start), $itcopy(cursor)));
      if (!entry.eq($.C4AulParse$Parse_WarningPragma$warnings.end())) {
        this.pOrgScript.EnableWarning(this.TokenSPos, entry.v.second, enable_warning);
      }
    }
  }

  Parse_ToplevelFunctionDecl() {
    let NodeStart = this.TokenSPos;
    let is_global = $.SEqual(P(this.Idtf, 0), S("global"));
    if ($.SEqual(P(this.Idtf, 0), S("private")) || $.SEqual(P(this.Idtf, 0), S("protected")) || $.SEqual(P(this.Idtf, 0), S("public")) || $.SEqual(P(this.Idtf, 0), S("global"))) {
      this.Shift();
    }
    if (!$.SEqual(P(this.Idtf, 0), S("func"))) {
      this.Error_(S("Declaration expected, but found identifier: %s"), P(this.Idtf, 0));
    }
    this.Shift();
    this.Check(2 /*ATT_IDTF*/, S("function name"));
    let func = $.FunctionDecl.New$pi8$rx(NodeStart, this.Idtf);
    func.is_global = is_global;
    this.Shift();
    this.Parse_Function$pFunction(func);
    return func;
  }

  Parse_Statement() {
    let NodeStart = this.TokenSPos;
    let stmt = null;
    switch (this.TokenType) {
      case 13:
        return this.Parse_Block();
      case 9:
      case 11:
      case 18:
      case 19:
      case 3:
      case 4:
        {
          stmt = this.Parse_Expression();
          this.Match(8 /*ATT_SCOLON*/);
          return stmt;
        }
      case 8:
        this.Shift();
        return $.Noop.New$pi8(NodeStart);
      case 2:
        if ($.SEqual(P(this.Idtf, 0), S("var")) || $.SEqual(P(this.Idtf, 0), S("local")) || $.SEqual(P(this.Idtf, 0), S("static"))) {
          stmt = this.Parse_Var();
        } else if ($.SEqual(P(this.Idtf, 0), S("func")) || $.SEqual(P(this.Idtf, 0), S("private")) || $.SEqual(P(this.Idtf, 0), S("protected")) || $.SEqual(P(this.Idtf, 0), S("public")) || $.SEqual(P(this.Idtf, 0), S("global"))) {
          $throw(new $.C4AulParseError().init$pC4AulParse$pi8(this, S("unexpected end of function")));
        } else if ($.SEqual(P(this.Idtf, 0), S("if"))) {
          return this.Parse_If();
        } else if ($.SEqual(P(this.Idtf, 0), S("else"))) {
          $throw(new $.C4AulParseError().init$pC4AulParse$pi8(this, S("misplaced 'else'")));
        } else if ($.SEqual(P(this.Idtf, 0), S("do"))) {
          stmt = this.Parse_DoWhile();
        } else if ($.SEqual(P(this.Idtf, 0), S("while"))) {
          return this.Parse_While();
        } else if ($.SEqual(P(this.Idtf, 0), S("for"))) {
          this.PushParsePos();
          this.Shift();
          this.Match(9 /*ATT_BOPEN*/);
          if (this.TokenType === 2 && $.SEqual(P(this.Idtf, 0), S("var"))) {
            this.Shift();
          }
          if (this.TokenType === 2 && this.GetNextToken() === 2 && $.SEqual(P(this.Idtf, 0), S("in"))) {
            this.PopParsePos();
            return this.Parse_ForEach();
          } else {
            this.PopParsePos();
            return this.Parse_For();
          }
        } else if ($.SEqual(P(this.Idtf, 0), S("return"))) {
          this.Shift();
          if (this.TokenType === 8) {
            stmt = $.Return.New$pi8$munique_ptr$2(NodeStart, $.NilLit.New$pi8(NodeStart));
          } else {
            stmt = $.Return.New$pi8$munique_ptr(NodeStart, this.Parse_Expression());
          }
        } else if ($.SEqual(P(this.Idtf, 0), S("break"))) {
          this.Shift();
          stmt = $.Break.New$pi8(NodeStart);
        } else if ($.SEqual(P(this.Idtf, 0), S("continue"))) {
          this.Shift();
          stmt = $.Continue.New$pi8(NodeStart);
        } else {
          stmt = this.Parse_Expression();
        }
        this.Match(8 /*ATT_SCOLON*/);
        0;
        return stmt;
      default:
        this.UnexpectedToken(S("statement"));
    }
  }

  Parse_Block() {
    let block = $.Block.New$pi8(this.TokenSPos);
    this.Match(13 /*ATT_BLOPEN*/);
    while (this.TokenType !== 14) {
      block.children.push(this.Parse_Statement());
    }
    this.Shift();
    return block;
  }

  Parse_Array() {
    let arr = $.ArrayLit.New$pi8(this.TokenSPos);
    this.Match(11 /*ATT_BOPEN2*/);
    while (this.TokenType !== 12) {
      if (this.TokenType === 6) {
        this.Warn(4 /*empty_parameter_in_array*/, arr.values.length >>> 0);
        arr.values.push($.NilLit.New$pi8(this.TokenSPos));
      } else {
        arr.values.push(this.Parse_Expression());
      }
      if (this.TokenType === 12) {
        break;
      }
      this.Match(6 /*ATT_COMMA*/, S("',' or ']'"));
      if (this.TokenType === 12) {
        this.Warn(4 /*empty_parameter_in_array*/, arr.values.length >>> 0);
        arr.values.push($.NilLit.New$pi8(this.TokenSPos));
      }
    }
    this.Shift();
    return arr;
  }

  Parse_PropList() {
    let proplist = $.ProplistLit.New$pi8(this.TokenSPos);
    if (this.TokenType === 2 && $.SEqual(P(this.Idtf, 0), S("new"))) {
      this.Shift();
      proplist.values.push(new StdPair(StdString.of($.Strings.P[0 /*P_Prototype*/].GetCStr()), this.Parse_Expression()));
    }
    this.Match(13 /*ATT_BLOPEN*/);
    while (this.TokenType !== 14) {
      let key = new StdString();
      if (this.TokenType === 2) {
        key.assign(P(this.Idtf, 0));
        this.Shift();
      } else if (this.TokenType === 4) {
        key.assign(this.cStr.GetCStr());
        this.Shift();
      } else {
        this.UnexpectedToken(S("string or identifier"));
      }
      if (this.TokenType !== 7 && this.TokenType !== 18) {
        this.UnexpectedToken(S("':' or '='"));
      }
      this.Shift();
      proplist.values.push(new StdPair(key, this.Parse_Expression()));
      if (this.TokenType === 6) {
        this.Shift();
      } else if (this.TokenType !== 14) {
        this.UnexpectedToken(S("'}' or ','"));
      }
    }
    this.Shift();
    return proplist;
  }

  Parse_DoWhile() {
    let loop = $.DoLoop.New$pi8(this.TokenSPos);
    this.Shift();
    loop.body = this.Parse_Statement();
    if (this.TokenType !== 2 || !$.SEqual(P(this.Idtf, 0), S("while"))) {
      this.UnexpectedToken(S("'while'"));
    }
    this.Shift();
    this.Match(9 /*ATT_BOPEN*/);
    loop.cond = this.Parse_Expression();
    this.Match(10 /*ATT_BCLOSE*/);
    return loop;
  }

  Parse_While() {
    let loop = $.WhileLoop.New$pi8(this.TokenSPos);
    this.Shift();
    this.Match(9 /*ATT_BOPEN*/);
    loop.cond = this.Parse_Expression();
    this.Match(10 /*ATT_BCLOSE*/);
    loop.body = this.Parse_Statement();
    return loop;
  }

  Parse_If() {
    let stmt = $.If.New$pi8(this.TokenSPos);
    this.Shift();
    this.Match(9 /*ATT_BOPEN*/);
    stmt.cond = this.Parse_Expression();
    this.Match(10 /*ATT_BCLOSE*/);
    stmt.iftrue = this.Parse_Statement();
    if (this.TokenType === 2 && $.SEqual(P(this.Idtf, 0), S("else"))) {
      this.Shift();
      stmt.iffalse = this.Parse_Statement();
    }
    return stmt;
  }

  Parse_For() {
    let loop = $.ForLoop.New$pi8(this.TokenSPos);
    this.Match(2 /*ATT_IDTF*/);
    this.Match(9 /*ATT_BOPEN*/);
    if (this.TokenType === 2 && $.SEqual(P(this.Idtf, 0), S("var"))) {
      loop.init = this.Parse_Var();
    } else if (this.TokenType !== 8) {
      loop.init = this.Parse_Expression();
    }
    this.Match(8 /*ATT_SCOLON*/);
    if (this.TokenType !== 8) {
      loop.cond = this.Parse_Expression();
    }
    this.Match(8 /*ATT_SCOLON*/);
    if (this.TokenType !== 10) {
      loop.incr = this.Parse_Expression();
    }
    this.Match(10 /*ATT_BCLOSE*/);
    loop.body = this.Parse_Statement();
    return loop;
  }

  Parse_ForEach() {
    let loop = $.RangeLoop.New$pi8(this.TokenSPos);
    this.Match(2 /*ATT_IDTF*/);
    this.Match(9 /*ATT_BOPEN*/);
    if (this.TokenType === 2 && $.SEqual(P(this.Idtf, 0), S("var"))) {
      loop.scoped_var = true;
      this.Shift();
    }
    this.Check(2 /*ATT_IDTF*/, S("variable name"));
    loop.var.assign(P(this.Idtf, 0));
    this.Shift();
    if (this.TokenType !== 2 || !$.SEqual(P(this.Idtf, 0), S("in"))) {
      this.UnexpectedToken(S("'in'"));
    }
    this.Shift();
    loop.cond = this.Parse_Expression();
    this.Match(10 /*ATT_BCLOSE*/);
    loop.body = this.Parse_Statement();
    return loop;
  }

  Parse_Expression(iParentPrio = -1) {
    let NodeStart = this.TokenSPos;
    let expr = null;
    let op = null;
    let val = new $.C4Value().init$v();
    switch (this.TokenType) {
      case 2:
        if ($.SEqual(P(this.Idtf, 0), S("true"))) {
          this.Shift();
          expr = $.BoolLit.New$pi8$mb(NodeStart, true);
        } else if ($.SEqual(P(this.Idtf, 0), S("false"))) {
          this.Shift();
          expr = $.BoolLit.New$pi8$mb(NodeStart, false);
        } else if ($.SEqual(P(this.Idtf, 0), S("nil"))) {
          this.Shift();
          expr = $.NilLit.New$pi8(NodeStart);
        } else if ($.SEqual(P(this.Idtf, 0), S("this"))) {
          this.Shift();
          if (this.TokenType === 9) {
            this.Shift();
            this.Match(10 /*ATT_BCLOSE*/);
          }
          expr = $.ThisLit.New$pi8(NodeStart);
        } else if ($.SEqual(P(this.Idtf, 0), S("if")) || $.SEqual(P(this.Idtf, 0), S("else")) || $.SEqual(P(this.Idtf, 0), S("for")) || $.SEqual(P(this.Idtf, 0), S("while")) || $.SEqual(P(this.Idtf, 0), S("do")) || $.SEqual(P(this.Idtf, 0), S("return"))) {
          this.Error_(S("reserved identifier not allowed in expressions: %s"), P(this.Idtf, 0));
        } else if ($.SEqual(P(this.Idtf, 0), S("Par"))) {
          this.Shift();
          this.Match(9 /*ATT_BOPEN*/);
          expr = $.ParExpr.New$pi8$munique_ptr(NodeStart, this.Parse_Expression());
          this.Match(10 /*ATT_BCLOSE*/);
        } else if ($.SEqual(P(this.Idtf, 0), S("new"))) {
          this.PushParsePos();
          this.Shift();
          if (this.TokenType === 2) {
            this.PopParsePos();
            expr = this.Parse_PropList();
          } else {
            this.PopParsePos();
          }
        } else if ($.SEqual(P(this.Idtf, 0), S("func"))) {
          this.PushParsePos();
          this.Shift();
          if (this.TokenType === 9) {
            let func = $.FunctionExpr.New$pi8(NodeStart);
            this.Parse_Function$pFunction(func);
            (expr = func, func = null);
            this.DiscardParsePos();
          } else {
            this.PopParsePos();
          }
        }
        if (expr == null) {
          let identifier = StdString.of(P(this.Idtf, 0));
          this.Shift();
          if (this.TokenType === 9) {
            let func = $.CallExpr.New$pi8(NodeStart);
            func.callee.assign(identifier);
            this.Parse_CallParams(func);
            (expr = func, func = null);
          } else {
            expr = $.VarExpr.New$pi8$rbasic_string(NodeStart, identifier);
          }
        }
        break;
      case 3:
        expr = $.IntLit.New$pi8$ri32(NodeStart, P(this, "cInt"));
        this.Shift();
        break;
      case 4:
        expr = $.StringLit.New$pi8$mpi8(NodeStart, this.cStr.GetCStr());
        this.Shift();
        break;
      case 19:
        op = $oat($.C4ScriptOpMap, this.cInt);
        if (op.Postfix) {
          $throw(new $.C4AulParseError().init$pC4AulParse$pi8(this, S("postfix operator without first expression")));
        }
        this.Shift();
        expr = this.Parse_Expression(op.Priority);
        if ($.SEqual(op.Identifier, S("+"))) {
        } else {
          expr = $.UnOpExpr.New$pi8$mi64$munique_ptr(NodeStart, op.$i - $oat($.C4ScriptOpMap, 0).$i, expr);
        }
        break;
      case 9:
        this.Shift();
        expr = this.Parse_Expression();
        this.Match(10 /*ATT_BCLOSE*/);
        break;
      case 11:
        expr = this.Parse_Array();
        break;
      case 13:
        expr = this.Parse_PropList();
        break;
      default:
        this.UnexpectedToken(S("expression"));
    }
    0;
    while (true) {
      NodeStart = this.TokenSPos;
      switch (this.TokenType) {
        case 18:
          {
            if (iParentPrio > 1) {
              return expr;
            }
            this.Shift();
            expr = $.AssignmentExpr.New$pi8$munique_ptr$munique_ptr(NodeStart, expr, this.Parse_Expression(1));
            break;
          }
        case 19:
          {
            let op$2 = $oat($.C4ScriptOpMap, this.cInt);
            if (!op$2.Postfix) {
              let postfixop = null;
              for (postfixop = $oadd(op$2, 1); postfixop.Identifier != null; postfixop = $oadd(postfixop, 1)) {
                if ($.SEqual(op$2.Identifier, postfixop.Identifier)) {
                  if (postfixop.Postfix) {
                    break;
                  }
                }
              }
              if (postfixop.Identifier == null) {
                this.Error_(S("unexpected prefix operator: %s"), op$2.Identifier);
              }
              op$2 = postfixop;
            }
            if ((iParentPrio + (!op$2.Changer ? 1 : 0) | 0) > op$2.Priority) {
              return expr;
            }
            this.Shift();
            if (op$2.NoSecondStatement) {
              expr = $.UnOpExpr.New$pi8$mi64$munique_ptr(NodeStart, op$2.$i - $oat($.C4ScriptOpMap, 0).$i, expr);
            } else {
              expr = $.BinOpExpr.New$pi8$mi64$munique_ptr$munique_ptr(NodeStart, op$2.$i - $oat($.C4ScriptOpMap, 0).$i, expr, this.Parse_Expression(op$2.Priority));
            }
            break;
          }
        case 11:
          {
            this.Shift();
            let start = null;
            if (this.TokenType === 7) {
              start = $.IntLit.New$pi8$mi32(this.TokenSPos, 0);
            } else {
              start = this.Parse_Expression();
            }
            if (this.TokenType === 12) {
              expr = $.SubscriptExpr.New$pi8$munique_ptr$munique_ptr$2(NodeStart, expr, start);
            } else if (this.TokenType === 7) {
              this.Shift();
              let end = null;
              if (this.TokenType === 12) {
                end = $.IntLit.New$pi8$mi32(this.TokenSPos, 0x7fffffff);
              } else {
                end = this.Parse_Expression();
              }
              expr = $.SliceExpr.New$pi8$munique_ptr$munique_ptr$munique_ptr(NodeStart, expr, start, end);
            } else {
              this.UnexpectedToken(S("']' or ':'"));
            }
            this.Match(12 /*ATT_BCLOSE2*/);
            break;
          }
        case 5:
          this.Shift();
          this.Check(2 /*ATT_IDTF*/, S("property name"));
          expr = $.SubscriptExpr.New$pi8$munique_ptr$munique_ptr(NodeStart, expr, $.StringLit.New$pi8$rx(this.TokenSPos, this.Idtf));
          this.Shift();
          break;
        case 15:
        case 16:
          {
            let call = $.CallExpr.New$pi8(NodeStart);
            (call.context = expr, expr = null);
            call.safe_call = this.TokenType === 16;
            this.Shift();
            this.Check(2 /*ATT_IDTF*/, S("function name after '->'"));
            call.callee.assign(P(this.Idtf, 0));
            this.Shift();
            this.Parse_CallParams(call);
            (expr = call, call = null);
            break;
          }
        default:
          return expr;
      }
    }
  }

  Parse_Var() {
    let decl = $.VarDecl.New$pi8(this.TokenSPos);
    if ($.SEqual(P(this.Idtf, 0), S("var"))) {
      decl.scope = 0 /*Func*/;
    } else if ($.SEqual(P(this.Idtf, 0), S("local"))) {
      decl.scope = 1 /*Object*/;
    } else if ($.SEqual(P(this.Idtf, 0), S("static"))) {
      decl.scope = 2 /*Global*/;
    } else {
      0;
      this.Error_(S("internal error: C4AulParse::Parse_Var called with invalid parse state (current token should be scope of variable, but is '%s')"), P(this.Idtf, 0));
    }
    this.Shift();
    if (this.TokenType === 2 && $.SEqual(P(this.Idtf, 0), S("const"))) {
      decl.constant = true;
      this.Shift();
    }
    while (true) {
      this.Check(2 /*ATT_IDTF*/, S("variable name"));
      let identifier = StdString.of(P(this.Idtf, 0));
      this.Shift();
      let init = null;
      if (this.TokenType === 18) {
        this.Shift();
        init = this.Parse_Expression();
      }
      $vpush(decl.decls, ((($o) => ($o.name = identifier.$clone(), $o.init = init, $o))(new $.VarDecl$Var())));
      if (this.TokenType === 8) {
        return decl;
      }
      this.Match(6 /*ATT_COMMA*/, S("',' or ';'"));
    }
  }

  Shift() {
    this.TokenType = this.GetNextToken();
  }

  Parse_Function$pFunction(func) {
    this.Match(9 /*ATT_BOPEN*/);
    while (this.TokenType !== 10) {
      if (func.params.length >= 10) {
        $throw(new $.C4AulParseError().init$pC4AulParse$pi8(this, S("'func' parameter list: too many parameters (max 10)")));
      }
      if (this.TokenType === 17) {
        func.has_unnamed_params = true;
        this.Shift();
        break;
      }
      this.Check(2 /*ATT_IDTF*/, S("parameter, '...', or ')'"));
      let parameter_type = 10 /*C4V_Any*/;
      if ($.SEqual(P(this.Idtf, 0), S("int"))) {
        parameter_type = 1 /*C4V_Int*/;
        this.Shift();
      } else if ($.SEqual(P(this.Idtf, 0), S("bool"))) {
        parameter_type = 2 /*C4V_Bool*/;
        this.Shift();
      } else if ($.SEqual(P(this.Idtf, 0), S("id"))) {
        parameter_type = 12 /*C4V_Def*/;
        this.Shift();
      } else if ($.SEqual(P(this.Idtf, 0), S("def"))) {
        parameter_type = 12 /*C4V_Def*/;
        this.Shift();
      } else if ($.SEqual(P(this.Idtf, 0), S("effect"))) {
        parameter_type = 13 /*C4V_Effect*/;
        this.Shift();
      } else if ($.SEqual(P(this.Idtf, 0), S("object"))) {
        parameter_type = 11 /*C4V_Object*/;
        this.Shift();
      } else if ($.SEqual(P(this.Idtf, 0), S("proplist"))) {
        parameter_type = 3 /*C4V_PropList*/;
        this.Shift();
      } else if ($.SEqual(P(this.Idtf, 0), S("string"))) {
        parameter_type = 4 /*C4V_String*/;
        this.Shift();
      } else if ($.SEqual(P(this.Idtf, 0), S("array"))) {
        parameter_type = 5 /*C4V_Array*/;
        this.Shift();
      } else if ($.SEqual(P(this.Idtf, 0), S("func"))) {
        parameter_type = 6 /*C4V_Function*/;
        this.Shift();
      } else if ($.SEqual(P(this.Idtf, 0), S("any"))) {
        parameter_type = 10 /*C4V_Any*/;
        this.Shift();
      }
      let par_name = new StdString();
      if (this.TokenType === 10 || this.TokenType === 6) {
        par_name.assign(P(this.Idtf, 0));
        this.Warn(2 /*type_name_used_as_par_name*/, P(this.Idtf, 0));
      } else {
        this.Check(2 /*ATT_IDTF*/, S("parameter name"));
        par_name.assign(P(this.Idtf, 0));
        this.Shift();
      }
      $vpush(func.params, new $.Function$Parameter().init(par_name, parameter_type));
      if (this.TokenType === 10) {
        break;
      }
      this.Match(6 /*ATT_COMMA*/, S("',' or ')'"));
    }
    this.Match(10 /*ATT_BCLOSE*/);
    func.body = this.Parse_Block();
  }

  Parse_CallParams(call) {
    0;
    0;
    this.Match(9 /*ATT_BOPEN*/);
    while (this.TokenType !== 10) {
      switch (this.TokenType) {
        case 6:
          this.Warn(3 /*empty_parameter_in_call*/, call.args.length >>> 0, call.callee.c_str());
          call.args.push($.NilLit.New$pi8(this.TokenSPos));
          this.Shift();
          break;
        case 17:
          this.Shift();
          call.append_unnamed_pars = true;
          this.Check(10 /*ATT_BCLOSE*/);
          break;
        default:
          call.args.push(this.Parse_Expression());
          if (this.TokenType !== 10) {
            this.Match(6 /*ATT_COMMA*/, S("',' or ')'"));
          }
          break;
      }
    }
    this.Match(10 /*ATT_BCLOSE*/);
  }

  AdvanceSpaces() {
    if (this.SPos == null) {
      return false;
    }
    while (this.SPos.a[this.SPos.o] !== 0) {
      if (this.SPos.a[this.SPos.o] === 47) {
        if (this.SPos.a[this.SPos.o + 1] === 47) {
          this.SPos = this.SPos.add(2);
          while (this.SPos.a[this.SPos.o] !== 0 && this.SPos.a[this.SPos.o] !== 13 && this.SPos.a[this.SPos.o] !== 10) {
            this.SPos = this.SPos.add(1);
          }
        } else if (this.SPos.a[this.SPos.o + 1] === 42) {
          this.SPos = this.SPos.add(2);
          while (this.SPos.a[this.SPos.o] !== 0 && (this.SPos.a[this.SPos.o] !== 42 || this.SPos.a[this.SPos.o + 1] !== 47)) {
            this.SPos = this.SPos.add(1);
          }
          this.SPos = this.SPos.add(2);
        } else {
          return true;
        }
      } else if (this.SPos.a[this.SPos.o] === -17 && this.SPos.a[this.SPos.o + 1] === -69 && this.SPos.a[this.SPos.o + 2] === -65) {
        this.SPos = this.SPos.add(3);
      } else if (this.SPos.a[this.SPos.o] >>> 0 > 32) {
        return true;
      } else {
        this.SPos = this.SPos.add(1);
      }
    }
    return false;
  }

  GetOperator(pScript) {
    let i = 0;
    if (pScript.a[pScript.o] === 0) {
      return 0;
    }
    if (pScript.a[pScript.o] >= 97 && pScript.a[pScript.o] <= 122 || pScript.a[pScript.o] >= 65 && pScript.a[pScript.o] <= 90) {
      return -1;
    }
    let len = 0;
    let maxfound = -1;
    for (i = 0; $.C4ScriptOpMap[i].Identifier != null; i = i + 1 >>> 0) {
      if ($.SEqual2(pScript, $.C4ScriptOpMap[i].Identifier)) {
        let oplen = $.SLen($.C4ScriptOpMap[i].Identifier) | 0;
        if (oplen > len) {
          len = oplen;
          maxfound = i | 0;
        }
      }
    }
    return maxfound;
  }

  ClearToken() {
    if (this.TokenType === 4 && this.cStr != null) {
      this.cStr.DecRef();
      this.TokenType = 0 /*ATT_INVALID*/;
    }
  }

  GetNextToken() {
    let $t1, $t2;
    this.ClearToken();
    if (!this.AdvanceSpaces()) {
      return 20 /*ATT_EOF*/;
    }
    this.TokenSPos = this.SPos;
    let C = $rd(($t1 = this.SPos, this.SPos = this.SPos.add(1), $t1));
    if ($.Inside$i8$i8$i8(C, 97, 122) || $.Inside$i8$i8$i8(C, 65, 90) || C === 95 || C === 35) {
      let dir = C === 35;
      let Len = 1;
      C = this.SPos.a[this.SPos.o];
      while ($.Inside$i8$i8$i8(C, 48, 57) || $.Inside$i8$i8$i8(C, 97, 122) || $.Inside$i8$i8$i8(C, 65, 90) || C === 95) {
        Len = Len + 1 | 0;
        C = $rd((this.SPos = this.SPos.add(1)));
      }
      if (dir && $.SEqual2(this.TokenSPos, S("#warning"))) {
        while (this.SPos.a[this.SPos.o] !== 10 && this.SPos.a[this.SPos.o] !== 0) {
          this.SPos = this.SPos.add(1);
        }
        this.Parse_WarningPragma();
        return this.GetNextToken();
      }
      Len = $min(Len, 100);
      $.SCopy$pi8$pi8$u64(this.TokenSPos, P(this.Idtf, 0), $u64n(Len));
      return dir ? 1 /*ATT_DIR*/ : 2 /*ATT_IDTF*/;
    } else if (C === 40) {
      return 9 /*ATT_BOPEN*/;
    } else if (C === 41) {
      return 10 /*ATT_BCLOSE*/;
    } else if (C === 44) {
      return 6 /*ATT_COMMA*/;
    } else if (C === 59) {
      return 8 /*ATT_SCOLON*/;
    } else if ($.Inside$i8$i8$i8(C, 48, 57)) {
      if (C === 48 && this.SPos.a[this.SPos.o] === 120) {
        this.cInt = $.StrToI32($padd(this.SPos, 1), 16, P(this, "SPos"));
        return 3 /*ATT_INT*/;
      } else {
        this.cInt = $.StrToI32(this.TokenSPos, 10, P(this, "SPos"));
        return 3 /*ATT_INT*/;
      }
    } else if (C === 45 && this.SPos.a[this.SPos.o] === 62 && $rd($padd(this.SPos, 1)) === 126) {
      this.SPos = this.SPos.add(2);
      return 16 /*ATT_CALLFS*/;
    } else if (C === 45 && this.SPos.a[this.SPos.o] === 62) {
      this.SPos = this.SPos.add(1);
      return 15 /*ATT_CALL*/;
    } else if ((this.cInt = this.GetOperator($padd(this.SPos, -1))) !== -1) {
      this.SPos = this.SPos.add($.SLen($.C4ScriptOpMap[this.cInt].Identifier) - 1);
      return 19 /*ATT_OPERATOR*/;
    } else if (C === 61) {
      return 18 /*ATT_SET*/;
    } else if (C === 123) {
      return 13 /*ATT_BLOPEN*/;
    } else if (C === 125) {
      return 14 /*ATT_BLCLOSE*/;
    } else if (C === 34) {
      let strbuf = new StdString();
      strbuf.reserve(512);
      while (this.SPos.a[this.SPos.o] !== 34) {
        C = this.SPos.a[this.SPos.o];
        this.SPos = this.SPos.add(1);
        if (C === 92) {
          switch (this.SPos.a[this.SPos.o]) {
            case 34:
              this.SPos = this.SPos.add(1);
              strbuf.push_back(34);
              break;
            case 92:
              this.SPos = this.SPos.add(1);
              strbuf.push_back(92);
              break;
            case 110:
              this.SPos = this.SPos.add(1);
              strbuf.push_back(10);
              break;
            case 116:
              this.SPos = this.SPos.add(1);
              strbuf.push_back(9);
              break;
            case 120:
              {
                this.SPos = this.SPos.add(1);
                if (!(c$isxdigit(this.SPos.a[this.SPos.o]) !== 0)) {
                  this.Warn(1 /*invalid_hex_escape*/);
                  strbuf.push_back(92);
                  strbuf.push_back(120);
                } else {
                  let ch = 0;
                  while (c$isxdigit(this.SPos.a[this.SPos.o]) !== 0) {
                    ch = Math.imul(ch, 16) << 24 >> 24;
                    if (this.SPos.a[this.SPos.o] >= 48 && this.SPos.a[this.SPos.o] <= 57) {
                      ch = (ch + (this.SPos.a[this.SPos.o] - 48 | 0) | 0) << 24 >> 24;
                    } else if (this.SPos.a[this.SPos.o] >= 97 && this.SPos.a[this.SPos.o] <= 102) {
                      ch = (ch + ((this.SPos.a[this.SPos.o] - 97 | 0) + 10 | 0) | 0) << 24 >> 24;
                    } else if (this.SPos.a[this.SPos.o] >= 65 && this.SPos.a[this.SPos.o] <= 70) {
                      ch = (ch + ((this.SPos.a[this.SPos.o] - 65 | 0) + 10 | 0) | 0) << 24 >> 24;
                    }
                    this.SPos = this.SPos.add(1);
                  }
                  ;
                  strbuf.push_back(ch);
                }
                break;
              }
            case 48:
            case 49:
            case 50:
            case 51:
            case 52:
            case 53:
            case 54:
            case 55:
              {
                let ch = 0;
                while (this.SPos.a[this.SPos.o + 0] >= 48 && this.SPos.a[this.SPos.o + 0] <= 55) {
                  ch = Math.imul(ch, 8) << 24 >> 24;
                  ch = (ch + ($rd(($t2 = this.SPos, this.SPos = this.SPos.add(1), $t2)) - 48 | 0) | 0) << 24 >> 24;
                }
                strbuf.push_back(ch);
                break;
              }
            default:
              {
                strbuf.push_back(92);
                this.Warn(0 /*invalid_escape_sequence*/, $rd($padd(this.SPos, 1)));
              }
          }
        } else if (C === 0 || C === 10 || C === 13) {
          $throw(new $.C4AulParseError().init$pC4AulParse$pi8(this, S("string not closed")));
        } else {
          strbuf.push_back(C);
        }
      }
      this.SPos = this.SPos.add(1);
      this.cStr = $.Strings.RegString$StdStrBuf(new $.StdStrBuf().init$pi8$u64$b(strbuf.data(), strbuf.size()));
      this.cStr.IncRef();
      return 4 /*ATT_STRING*/;
    } else if (C === 91) {
      return 11 /*ATT_BOPEN2*/;
    } else if (C === 93) {
      return 12 /*ATT_BCLOSE2*/;
    } else if (C === 46 && this.SPos.a[this.SPos.o] === 46 && $rd($padd(this.SPos, 1)) === 46) {
      this.SPos = this.SPos.add(2);
      return 17 /*ATT_LDOTS*/;
    } else if (C === 46) {
      return 5 /*ATT_DOT*/;
    } else if (C === 58) {
      return 7 /*ATT_COLON*/;
    } else {
      if (C >= 33 && C <= 126) {
        $throw(new $.C4AulParseError().init$pC4AulParse$pi8(this, $.FormatString(S("unexpected character '%c' found"), C).getData()));
      } else {
        $throw(new $.C4AulParseError().init$pC4AulParse$pi8(this, $.FormatString(S("unexpected character \\x%x found"), C & 0xff).getData()));
      }
    }
  }

  Match(RefTokenType, Expected = null) {
    this.Check(RefTokenType, Expected);
    this.Shift();
  }

  Check(RefTokenType, Expected = null) {
    if (this.TokenType !== RefTokenType) {
      this.UnexpectedToken(Expected != null ? Expected : GetTokenName(RefTokenType));
    }
  }

  UnexpectedToken(Expected) {
    $throw(new $.C4AulParseError().init$pC4AulParse$pi8(this, $.FormatString(S("%s expected, but found %s"), Expected, GetTokenName(this.TokenType)).getData()));
  }

  Warn(warning, ...$va) {
    if (!this.IsWarningEnabled(this.TokenSPos, warning)) {
      return;
    }
    let args = null;
    args = { a: $va, i: 0 };
    let Buf = $.FormatStringV($.C4AulWarningMessages[$u64n(warning)], args);
    this.AppendPosition(Buf);
    Buf.AppendFormat(S(" [%s]"), $.C4AulWarningIDs[$u64n(warning)]);
    this.Engine.GetErrorHandler().OnWarning(Buf.getData());
    void 0;
  }

  IsWarningEnabled(pos, warning) {
    if (this.pOrgScript != null) {
      return this.pOrgScript.IsWarningEnabled(pos, warning);
    }
    switch (warning) {
      case 0:
        return true;
      case 1:
        return true;
      case 2:
        return false;
      case 3:
        return false;
      case 4:
        return false;
      case 5:
        return true;
      case 6:
        return true;
      case 7:
        return true;
      case 8:
        return true;
      case 9:
        return true;
      case 10:
        return true;
      case 11:
        return true;
      case 12:
        return true;
      case 13:
        return true;
      case 14:
        return true;
      default:
        return false;
    }
  }

  Error_(pMsg, ...$va) {
    let args = null;
    args = { a: $va, i: 0 };
    let Buf = new $.StdStrBuf();
    Buf.FormatV(pMsg, args);
    $throw(new $.C4AulParseError().init$pC4AulParse$pi8(this, Buf.getData()));
  }

  AppendPosition(Buf) {
    if (this.Fn != null && this.Fn.GetName() != null) {
      Buf.AppendFormat(S(" (in %s"), this.Fn.GetName());
      if (this.Fn.pOrgScript != null && this.TokenSPos != null) {
        Buf.AppendFormat(S(", %s:%d:%d)"), this.Fn.pOrgScript.ScriptName.getData(), $.SGetLine(this.Fn.pOrgScript.GetScript(), this.TokenSPos), $.SLineGetCharacters(this.Fn.pOrgScript.GetScript(), this.TokenSPos));
      } else {
        Buf.AppendChar(41);
      }
    } else if (this.pOrgScript != null) {
      Buf.AppendFormat(S(" (%s:%d:%d)"), this.pOrgScript.ScriptName.getData(), $.SGetLine(this.pOrgScript.GetScript(), this.TokenSPos), $.SLineGetCharacters(this.pOrgScript.GetScript(), this.TokenSPos));
    }
    if (this.pOrgScript !== this.Host && this.Host != null) {
      Buf.AppendFormat(S(" (as #appendto/#include to %s)"), this.Host.ScriptName.getData());
    }
  }

  PushParsePos() {
    this.parse_pos_stack.push(this.TokenSPos);
  }

  PopParsePos() {
    0;
    this.SPos = this.parse_pos_stack[this.parse_pos_stack.length - 1];
    this.DiscardParsePos();
    this.Shift();
  }

  DiscardParsePos() {
    0;
    this.parse_pos_stack.pop();
  }

  $clone() { return new C4AulParse().$assign(this); }
  $assign(o) {
    this.Fn = o.Fn;
    this.Host = o.Host;
    this.pOrgScript = o.pOrgScript;
    this.Engine = o.Engine;
    this.SPos = o.SPos;
    this.TokenSPos = o.TokenSPos;
    this.Idtf = o.Idtf.slice();
    this.TokenType = o.TokenType;
    this.cInt = o.cInt;
    this.cStr = o.cStr;
    this.ContextToExecIn = o.ContextToExecIn;
    this.parse_pos_stack = o.parse_pos_stack.$clone();
    return this;
  }
}


function GetTTName(e) {
  switch (e) {
    case 0:
      return S("ARRAYA");
    case 1:
      return S("ARRAYA_SET");
    case 2:
      return S("PROP");
    case 3:
      return S("PROP_SET");
    case 4:
      return S("ARRAY_SLICE");
    case 5:
      return S("ARRAY_SLICE_SET");
    case 8:
      return S("STACK_SET");
    case 10:
      return S("LOCALN");
    case 11:
      return S("LOCALN_SET");
    case 12:
      return S("GLOBALN");
    case 13:
      return S("GLOBALN_SET");
    case 14:
      return S("PAR");
    case 15:
      return S("THIS");
    case 16:
      return S("FUNC");
    case 17:
      return S("Inc");
    case 18:
      return S("Dec");
    case 19:
      return S("BitNot");
    case 20:
      return S("Not");
    case 21:
      return S("Neg");
    case 22:
      return S("Pow");
    case 23:
      return S("Div");
    case 24:
      return S("Mul");
    case 25:
      return S("Mod");
    case 26:
      return S("Sub");
    case 27:
      return S("Sum");
    case 28:
      return S("LeftShift");
    case 29:
      return S("RightShift");
    case 30:
      return S("LessThan");
    case 31:
      return S("LessThanEqual");
    case 32:
      return S("GreaterThan");
    case 33:
      return S("GreaterThanEqual");
    case 34:
      return S("Equal");
    case 35:
      return S("NotEqual");
    case 36:
      return S("BitAnd");
    case 37:
      return S("BitXOr");
    case 38:
      return S("BitOr");
    case 39:
      return S("CALL");
    case 40:
      return S("CALLFS");
    case 41:
      return S("STACK");
    case 42:
      return S("INT");
    case 43:
      return S("BOOL");
    case 44:
      return S("STRING");
    case 45:
      return S("CPROPLIST");
    case 46:
      return S("CARRAY");
    case 47:
      return S("CFUNCTION");
    case 48:
      return S("NIL");
    case 49:
      return S("NEW_ARRAY");
    case 6:
      return S("DUP");
    case 7:
      return S("AB_DUP_CONTEXT");
    case 50:
      return S("NEW_PROPLIST");
    case 9:
      return S("POP_TO");
    case 51:
      return S("JUMP");
    case 52:
      return S("JUMPAND");
    case 53:
      return S("JUMPOR");
    case 54:
      return S("JUMPNNIL");
    case 55:
      return S("CONDN");
    case 56:
      return S("COND");
    case 57:
      return S("FOREACH_NEXT");
    case 58:
      return S("RETURN");
    case 59:
      return S("ERR");
    case 60:
      return S("DEBUG");
    case 61:
      return S("EOFN");
  }
  0;
  return S("UNKNOWN");
}

function GetTokenName(TokenType) {
  switch (TokenType) {
    case 0:
      return S("invalid token");
    case 1:
      return S("directive");
    case 2:
      return S("identifier");
    case 3:
      return S("integer constant");
    case 4:
      return S("string constant");
    case 5:
      return S("'.'");
    case 6:
      return S("','");
    case 7:
      return S("':'");
    case 8:
      return S("';'");
    case 9:
      return S("'('");
    case 10:
      return S("')'");
    case 11:
      return S("'['");
    case 12:
      return S("']'");
    case 13:
      return S("'{'");
    case 14:
      return S("'}'");
    case 15:
      return S("'->'");
    case 16:
      return S("'->~'");
    case 17:
      return S("'...'");
    case 18:
      return S("'='");
    case 19:
      return S("operator");
    case 20:
      return S("end of file");
    default:
      return S("unrecognized token");
  }
}

export function $init(): void {
  $.C4ScriptOpMap = $own([
  ((($o) => ($o.Priority = 15, $o.Identifier = S("++"), $o.Code = 17 /*AB_Inc*/, $o.Postfix = false, $o.Changer = true, $o.NoSecondStatement = false, $o.RetType = 1 /*C4V_Int*/, $o.Type1 = 1 /*C4V_Int*/, $o.Type2 = 10 /*C4V_Any*/, $o))(new C4ScriptOpDef())),
  ((($o) => ($o.Priority = 15, $o.Identifier = S("--"), $o.Code = 18 /*AB_Dec*/, $o.Postfix = false, $o.Changer = true, $o.NoSecondStatement = false, $o.RetType = 1 /*C4V_Int*/, $o.Type1 = 1 /*C4V_Int*/, $o.Type2 = 10 /*C4V_Any*/, $o))(new C4ScriptOpDef())),
  ((($o) => ($o.Priority = 15, $o.Identifier = S("~"), $o.Code = 19 /*AB_BitNot*/, $o.Postfix = false, $o.Changer = false, $o.NoSecondStatement = false, $o.RetType = 1 /*C4V_Int*/, $o.Type1 = 1 /*C4V_Int*/, $o.Type2 = 10 /*C4V_Any*/, $o))(new C4ScriptOpDef())),
  ((($o) => ($o.Priority = 15, $o.Identifier = S("!"), $o.Code = 20 /*AB_Not*/, $o.Postfix = false, $o.Changer = false, $o.NoSecondStatement = false, $o.RetType = 2 /*C4V_Bool*/, $o.Type1 = 2 /*C4V_Bool*/, $o.Type2 = 10 /*C4V_Any*/, $o))(new C4ScriptOpDef())),
  ((($o) => ($o.Priority = 15, $o.Identifier = S("+"), $o.Code = 59 /*AB_ERR*/, $o.Postfix = false, $o.Changer = false, $o.NoSecondStatement = false, $o.RetType = 1 /*C4V_Int*/, $o.Type1 = 1 /*C4V_Int*/, $o.Type2 = 10 /*C4V_Any*/, $o))(new C4ScriptOpDef())),
  ((($o) => ($o.Priority = 15, $o.Identifier = S("-"), $o.Code = 21 /*AB_Neg*/, $o.Postfix = false, $o.Changer = false, $o.NoSecondStatement = false, $o.RetType = 1 /*C4V_Int*/, $o.Type1 = 1 /*C4V_Int*/, $o.Type2 = 10 /*C4V_Any*/, $o))(new C4ScriptOpDef())),
  ((($o) => ($o.Priority = 16, $o.Identifier = S("++"), $o.Code = 17 /*AB_Inc*/, $o.Postfix = true, $o.Changer = true, $o.NoSecondStatement = true, $o.RetType = 1 /*C4V_Int*/, $o.Type1 = 1 /*C4V_Int*/, $o.Type2 = 10 /*C4V_Any*/, $o))(new C4ScriptOpDef())),
  ((($o) => ($o.Priority = 16, $o.Identifier = S("--"), $o.Code = 18 /*AB_Dec*/, $o.Postfix = true, $o.Changer = true, $o.NoSecondStatement = true, $o.RetType = 1 /*C4V_Int*/, $o.Type1 = 1 /*C4V_Int*/, $o.Type2 = 10 /*C4V_Any*/, $o))(new C4ScriptOpDef())),
  ((($o) => ($o.Priority = 14, $o.Identifier = S("**"), $o.Code = 22 /*AB_Pow*/, $o.Postfix = true, $o.Changer = false, $o.NoSecondStatement = false, $o.RetType = 1 /*C4V_Int*/, $o.Type1 = 1 /*C4V_Int*/, $o.Type2 = 1 /*C4V_Int*/, $o))(new C4ScriptOpDef())),
  ((($o) => ($o.Priority = 13, $o.Identifier = S("/"), $o.Code = 23 /*AB_Div*/, $o.Postfix = true, $o.Changer = false, $o.NoSecondStatement = false, $o.RetType = 1 /*C4V_Int*/, $o.Type1 = 1 /*C4V_Int*/, $o.Type2 = 1 /*C4V_Int*/, $o))(new C4ScriptOpDef())),
  ((($o) => ($o.Priority = 13, $o.Identifier = S("*"), $o.Code = 24 /*AB_Mul*/, $o.Postfix = true, $o.Changer = false, $o.NoSecondStatement = false, $o.RetType = 1 /*C4V_Int*/, $o.Type1 = 1 /*C4V_Int*/, $o.Type2 = 1 /*C4V_Int*/, $o))(new C4ScriptOpDef())),
  ((($o) => ($o.Priority = 13, $o.Identifier = S("%"), $o.Code = 25 /*AB_Mod*/, $o.Postfix = true, $o.Changer = false, $o.NoSecondStatement = false, $o.RetType = 1 /*C4V_Int*/, $o.Type1 = 1 /*C4V_Int*/, $o.Type2 = 1 /*C4V_Int*/, $o))(new C4ScriptOpDef())),
  ((($o) => ($o.Priority = 12, $o.Identifier = S("-"), $o.Code = 26 /*AB_Sub*/, $o.Postfix = true, $o.Changer = false, $o.NoSecondStatement = false, $o.RetType = 1 /*C4V_Int*/, $o.Type1 = 1 /*C4V_Int*/, $o.Type2 = 1 /*C4V_Int*/, $o))(new C4ScriptOpDef())),
  ((($o) => ($o.Priority = 12, $o.Identifier = S("+"), $o.Code = 27 /*AB_Sum*/, $o.Postfix = true, $o.Changer = false, $o.NoSecondStatement = false, $o.RetType = 1 /*C4V_Int*/, $o.Type1 = 1 /*C4V_Int*/, $o.Type2 = 1 /*C4V_Int*/, $o))(new C4ScriptOpDef())),
  ((($o) => ($o.Priority = 11, $o.Identifier = S("<<"), $o.Code = 28 /*AB_LeftShift*/, $o.Postfix = true, $o.Changer = false, $o.NoSecondStatement = false, $o.RetType = 1 /*C4V_Int*/, $o.Type1 = 1 /*C4V_Int*/, $o.Type2 = 1 /*C4V_Int*/, $o))(new C4ScriptOpDef())),
  ((($o) => ($o.Priority = 11, $o.Identifier = S(">>"), $o.Code = 29 /*AB_RightShift*/, $o.Postfix = true, $o.Changer = false, $o.NoSecondStatement = false, $o.RetType = 1 /*C4V_Int*/, $o.Type1 = 1 /*C4V_Int*/, $o.Type2 = 1 /*C4V_Int*/, $o))(new C4ScriptOpDef())),
  ((($o) => ($o.Priority = 10, $o.Identifier = S("<"), $o.Code = 30 /*AB_LessThan*/, $o.Postfix = true, $o.Changer = false, $o.NoSecondStatement = false, $o.RetType = 2 /*C4V_Bool*/, $o.Type1 = 1 /*C4V_Int*/, $o.Type2 = 1 /*C4V_Int*/, $o))(new C4ScriptOpDef())),
  ((($o) => ($o.Priority = 10, $o.Identifier = S("<="), $o.Code = 31 /*AB_LessThanEqual*/, $o.Postfix = true, $o.Changer = false, $o.NoSecondStatement = false, $o.RetType = 2 /*C4V_Bool*/, $o.Type1 = 1 /*C4V_Int*/, $o.Type2 = 1 /*C4V_Int*/, $o))(new C4ScriptOpDef())),
  ((($o) => ($o.Priority = 10, $o.Identifier = S(">"), $o.Code = 32 /*AB_GreaterThan*/, $o.Postfix = true, $o.Changer = false, $o.NoSecondStatement = false, $o.RetType = 2 /*C4V_Bool*/, $o.Type1 = 1 /*C4V_Int*/, $o.Type2 = 1 /*C4V_Int*/, $o))(new C4ScriptOpDef())),
  ((($o) => ($o.Priority = 10, $o.Identifier = S(">="), $o.Code = 33 /*AB_GreaterThanEqual*/, $o.Postfix = true, $o.Changer = false, $o.NoSecondStatement = false, $o.RetType = 2 /*C4V_Bool*/, $o.Type1 = 1 /*C4V_Int*/, $o.Type2 = 1 /*C4V_Int*/, $o))(new C4ScriptOpDef())),
  ((($o) => ($o.Priority = 9, $o.Identifier = S("=="), $o.Code = 34 /*AB_Equal*/, $o.Postfix = true, $o.Changer = false, $o.NoSecondStatement = false, $o.RetType = 2 /*C4V_Bool*/, $o.Type1 = 10 /*C4V_Any*/, $o.Type2 = 10 /*C4V_Any*/, $o))(new C4ScriptOpDef())),
  ((($o) => ($o.Priority = 9, $o.Identifier = S("!="), $o.Code = 35 /*AB_NotEqual*/, $o.Postfix = true, $o.Changer = false, $o.NoSecondStatement = false, $o.RetType = 2 /*C4V_Bool*/, $o.Type1 = 10 /*C4V_Any*/, $o.Type2 = 10 /*C4V_Any*/, $o))(new C4ScriptOpDef())),
  ((($o) => ($o.Priority = 8, $o.Identifier = S("&"), $o.Code = 36 /*AB_BitAnd*/, $o.Postfix = true, $o.Changer = false, $o.NoSecondStatement = false, $o.RetType = 1 /*C4V_Int*/, $o.Type1 = 1 /*C4V_Int*/, $o.Type2 = 1 /*C4V_Int*/, $o))(new C4ScriptOpDef())),
  ((($o) => ($o.Priority = 6, $o.Identifier = S("^"), $o.Code = 37 /*AB_BitXOr*/, $o.Postfix = true, $o.Changer = false, $o.NoSecondStatement = false, $o.RetType = 1 /*C4V_Int*/, $o.Type1 = 1 /*C4V_Int*/, $o.Type2 = 1 /*C4V_Int*/, $o))(new C4ScriptOpDef())),
  ((($o) => ($o.Priority = 6, $o.Identifier = S("|"), $o.Code = 38 /*AB_BitOr*/, $o.Postfix = true, $o.Changer = false, $o.NoSecondStatement = false, $o.RetType = 1 /*C4V_Int*/, $o.Type1 = 1 /*C4V_Int*/, $o.Type2 = 1 /*C4V_Int*/, $o))(new C4ScriptOpDef())),
  ((($o) => ($o.Priority = 5, $o.Identifier = S("&&"), $o.Code = 52 /*AB_JUMPAND*/, $o.Postfix = true, $o.Changer = false, $o.NoSecondStatement = false, $o.RetType = 2 /*C4V_Bool*/, $o.Type1 = 2 /*C4V_Bool*/, $o.Type2 = 2 /*C4V_Bool*/, $o))(new C4ScriptOpDef())),
  ((($o) => ($o.Priority = 4, $o.Identifier = S("||"), $o.Code = 53 /*AB_JUMPOR*/, $o.Postfix = true, $o.Changer = false, $o.NoSecondStatement = false, $o.RetType = 2 /*C4V_Bool*/, $o.Type1 = 2 /*C4V_Bool*/, $o.Type2 = 2 /*C4V_Bool*/, $o))(new C4ScriptOpDef())),
  ((($o) => ($o.Priority = 3, $o.Identifier = S("??"), $o.Code = 54 /*AB_JUMPNNIL*/, $o.Postfix = true, $o.Changer = false, $o.NoSecondStatement = false, $o.RetType = 10 /*C4V_Any*/, $o.Type1 = 10 /*C4V_Any*/, $o.Type2 = 10 /*C4V_Any*/, $o))(new C4ScriptOpDef())),
  ((($o) => ($o.Priority = 2, $o.Identifier = S("*="), $o.Code = 24 /*AB_Mul*/, $o.Postfix = true, $o.Changer = true, $o.NoSecondStatement = false, $o.RetType = 1 /*C4V_Int*/, $o.Type1 = 1 /*C4V_Int*/, $o.Type2 = 1 /*C4V_Int*/, $o))(new C4ScriptOpDef())),
  ((($o) => ($o.Priority = 2, $o.Identifier = S("/="), $o.Code = 23 /*AB_Div*/, $o.Postfix = true, $o.Changer = true, $o.NoSecondStatement = false, $o.RetType = 1 /*C4V_Int*/, $o.Type1 = 1 /*C4V_Int*/, $o.Type2 = 1 /*C4V_Int*/, $o))(new C4ScriptOpDef())),
  ((($o) => ($o.Priority = 2, $o.Identifier = S("%="), $o.Code = 25 /*AB_Mod*/, $o.Postfix = true, $o.Changer = true, $o.NoSecondStatement = false, $o.RetType = 1 /*C4V_Int*/, $o.Type1 = 1 /*C4V_Int*/, $o.Type2 = 1 /*C4V_Int*/, $o))(new C4ScriptOpDef())),
  ((($o) => ($o.Priority = 2, $o.Identifier = S("+="), $o.Code = 27 /*AB_Sum*/, $o.Postfix = true, $o.Changer = true, $o.NoSecondStatement = false, $o.RetType = 1 /*C4V_Int*/, $o.Type1 = 1 /*C4V_Int*/, $o.Type2 = 1 /*C4V_Int*/, $o))(new C4ScriptOpDef())),
  ((($o) => ($o.Priority = 2, $o.Identifier = S("-="), $o.Code = 26 /*AB_Sub*/, $o.Postfix = true, $o.Changer = true, $o.NoSecondStatement = false, $o.RetType = 1 /*C4V_Int*/, $o.Type1 = 1 /*C4V_Int*/, $o.Type2 = 1 /*C4V_Int*/, $o))(new C4ScriptOpDef())),
  ((($o) => ($o.Priority = 2, $o.Identifier = S("&="), $o.Code = 36 /*AB_BitAnd*/, $o.Postfix = true, $o.Changer = true, $o.NoSecondStatement = false, $o.RetType = 1 /*C4V_Int*/, $o.Type1 = 1 /*C4V_Int*/, $o.Type2 = 1 /*C4V_Int*/, $o))(new C4ScriptOpDef())),
  ((($o) => ($o.Priority = 2, $o.Identifier = S("|="), $o.Code = 38 /*AB_BitOr*/, $o.Postfix = true, $o.Changer = true, $o.NoSecondStatement = false, $o.RetType = 1 /*C4V_Int*/, $o.Type1 = 1 /*C4V_Int*/, $o.Type2 = 1 /*C4V_Int*/, $o))(new C4ScriptOpDef())),
  ((($o) => ($o.Priority = 2, $o.Identifier = S("^="), $o.Code = 37 /*AB_BitXOr*/, $o.Postfix = true, $o.Changer = true, $o.NoSecondStatement = false, $o.RetType = 1 /*C4V_Int*/, $o.Type1 = 1 /*C4V_Int*/, $o.Type2 = 1 /*C4V_Int*/, $o))(new C4ScriptOpDef())),
  ((($o) => ($o.Priority = 0, $o.Identifier = null, $o.Code = 59 /*AB_ERR*/, $o.Postfix = false, $o.Changer = false, $o.NoSecondStatement = false, $o.RetType = 0 /*C4V_Nil*/, $o.Type1 = 0 /*C4V_Nil*/, $o.Type2 = 0 /*C4V_Nil*/, $o))(new C4ScriptOpDef())),
]);
}

Object.assign($, { C4AulParse, C4ScriptOpDef, GetTTName, GetTokenName });
