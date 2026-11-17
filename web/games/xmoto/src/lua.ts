// The level scripts' Lua (xmoto/LuaLibBase.cpp): a state with the base, math and table libraries and one
// global library table ("Game"), the scriptCall* entry points, and loading of the level's script. X-Moto
// 0.6.3 embeds Lua 5.1.5; the port runs the scripts on fengari 0.1.5 (Lua 5.3 written in JavaScript, MIT),
// with the 5.1 names the levels use (math.mod, table.getn, unpack, ...) added back.
// @ts-expect-error fengari ships no types
import * as fengari from 'fengari';

const { lua, lauxlib, lualib, to_luastring, to_jsstring } = fengari as {
  lua: any; lauxlib: any; lualib: any; to_luastring: (s: string) => Uint8Array; to_jsstring: (b: Uint8Array) => string;
};

export type LuaArg = number | string | boolean;
/** a library function: gets its arguments, returns its results */
export type LuaFn = (args: LuaArgs) => LuaArg[] | void;

export class LuaArgs {
  private L: unknown;
  constructor(L: unknown) { this.L = L; }
  get count(): number { return lua.lua_gettop(this.L); }
  /** luaL_checknumber */
  num(i: number): number { return lauxlib.luaL_checknumber(this.L, i); }
  /** luaL_checkstring */
  str(i: number): string { return to_jsstring(lauxlib.luaL_checklstring(this.L, i)); }
  error(msg: string): never { lauxlib.luaL_error(this.L, to_luastring(msg)); throw new Error(msg); }
}

const SHIMS = `
math.mod = math.mod or math.fmod
math.atan2 = math.atan2 or function(y, x) return math.atan(y, x) end
math.pow = math.pow or function(x, y) return x ^ y end
math.ldexp = math.ldexp or function(m, e) return m * 2.0 ^ e end
math.log10 = math.log10 or function(x) return math.log(x, 10) end
math.cosh = math.cosh or function(x) return (math.exp(x) + math.exp(-x)) / 2 end
math.sinh = math.sinh or function(x) return (math.exp(x) - math.exp(-x)) / 2 end
math.tanh = math.tanh or function(x) local a, b = math.exp(x), math.exp(-x) return (a - b) / (a + b) end
table.getn = table.getn or function(t) return #t end
unpack = unpack or table.unpack
loadstring = loadstring or load
`;

export class LuaState {
  private L: any;
  constructor(libName: string, fns: Record<string, LuaFn>) {
    const L = (this.L = lauxlib.luaL_newstate());
    lauxlib.luaL_requiref(L, to_luastring('_G'), lualib.luaopen_base, 1);
    lauxlib.luaL_requiref(L, to_luastring('math'), lualib.luaopen_math, 1);
    lauxlib.luaL_requiref(L, to_luastring('table'), lualib.luaopen_table, 1);
    lua.lua_settop(L, 0);
    lua.lua_newtable(L);
    for (const [name, fn] of Object.entries(fns)) {
      lua.lua_pushcfunction(L, (Ls: unknown) => {
        const res = fn(new LuaArgs(Ls)) ?? [];
        for (const r of res) push(Ls, r);
        return res.length;
      });
      lua.lua_setfield(L, -2, to_luastring(name));
    }
    lua.lua_setglobal(L, to_luastring(libName));
    this.run(SHIMS, 'shims');
  }

  /** LuaLibBase::loadScript */
  load(code: string, name: string): void {
    const r = lauxlib.luaL_loadbuffer(this.L, to_luastring(code), null, to_luastring(name || '?'));
    if (r !== 0 || lua.lua_pcall(this.L, 0, 0, 0) !== 0) {
      const msg = this.errorMsg();
      lua.lua_settop(this.L, 0);
      throw new Error(`failed to load level script: ${msg}`);
    }
  }
  private run(code: string, name: string): void { this.load(code, name); }
  private errorMsg(): string {
    const s = lua.lua_tostring(this.L, -1);
    return s ? to_jsstring(s) : 'No error available';
  }
  private call(nargs: number, nres: number, what: string): void {
    if (lua.lua_pcall(this.L, nargs, nres, 0) !== 0) {
      const msg = this.errorMsg();
      lua.lua_settop(this.L, 0);
      throw new Error(`failed to invoke ${what}(): ${msg}`);
    }
  }
  /** scriptCallBool: the global function's result, bDefault when there is no such function */
  callBool(fn: string, def: boolean): boolean {
    const L = this.L;
    let ret = def;
    lua.lua_getglobal(L, to_luastring(fn));
    if (lua.lua_isfunction(L, -1)) {
      this.call(0, 1, fn);
      ret = !!lua.lua_toboolean(L, -1);
    }
    lua.lua_settop(L, 0);
    return ret;
  }
  /** scriptCallVoid / scriptCallVoidNumberArg */
  callVoid(fn: string, ...nums: number[]): void {
    const L = this.L;
    lua.lua_getglobal(L, to_luastring(fn));
    if (lua.lua_isfunction(L, -1)) {
      for (const n of nums) push(L, n);
      this.call(nums.length, 0, fn);
    }
    lua.lua_settop(L, 0);
  }
  /** scriptCallTblVoid: table.fn(...) when both exist */
  callTblVoid(table: string, fn: string, ...nums: number[]): void {
    const L = this.L;
    lua.lua_getglobal(L, to_luastring(table));
    if (lua.lua_istable(L, -1)) {
      lua.lua_pushstring(L, to_luastring(fn));
      lua.lua_gettable(L, -2);
      if (lua.lua_isfunction(L, -1)) {
        for (const n of nums) push(L, n);
        this.call(nums.length, 0, `${table}.${fn}`);
      }
    }
    lua.lua_settop(L, 0);
  }
}

/** numbers with an integral value go in as Lua integers, so that "x .. y" prints them like Lua 5.1 */
function push(L: unknown, v: LuaArg): void {
  if (typeof v === 'number') {
    if ((v | 0) === v && !Object.is(v, -0)) lua.lua_pushinteger(L, v);
    else lua.lua_pushnumber(L, v);
  } else if (typeof v === 'string') lua.lua_pushstring(L, to_luastring(v));
  else lua.lua_pushboolean(L, v);
}
