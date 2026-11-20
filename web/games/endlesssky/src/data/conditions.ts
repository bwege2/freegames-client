// Endless Sky condition sets (source/ConditionSet.cpp): the expressions in
// `to display`, `to offer`, mission filters and conversations. The original
// stores conditions in a store of integer values; a bare condition name is its
// value, and comparisons, and/or/not and arithmetic work on those values.
import type { DataNode } from './node.ts';
import { token } from './node.ts';

export type Conditions = ReadonlyMap<string, number>;
export type Condition = (conditions: Conditions) => boolean;

export const ALWAYS: Condition = () => true;
export const NEVER: Condition = () => false;

const numberToken = /^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/;
const isNumber = (s: string): boolean => numberToken.test(s);

/** The default value of an unset condition is 0, as in ConditionsStore. */
export const conditionValue = (conditions: Conditions, name: string): number => conditions.get(name) ?? 0;

/** Node-style `has X`, `not X`, `never`, `and`, `or`; anything else is an expression line. */
export function parseConditionNode(node: DataNode): Condition {
  const key = token(node, 0);
  if (key === 'never') return NEVER;
  if (key === 'has' && node.tokens.length >= 2) return (c) => conditionValue(c, token(node, 1)) !== 0;
  if (key === 'not' && node.tokens.length >= 2 && !node.children.length)
    return (c) => conditionValue(c, token(node, 1)) === 0;
  if (key === 'and' && node.tokens.length === 1) return and(node.children.map(parseConditionNode));
  if (key === 'or' && node.tokens.length === 1) return or(node.children.map(parseConditionNode));
  if (key === 'not' && node.children.length) return not(parseConditionNode(node.children[0]));
  return parseExpression(node.tokens);
}

/** A `to display`/`to offer`/... block: its children are ANDed. */
export function parseConditionSet(nodes: readonly DataNode[]): Condition {
  if (!nodes.length) return ALWAYS;
  return and(nodes.map(parseConditionNode));
}

export const and = (list: readonly Condition[]): Condition => (c) => list.every((f) => f(c));
export const or = (list: readonly Condition[]): Condition => (c) => list.some((f) => f(c));
export const not = (f: Condition): Condition => (c) => !f(c);

type ValueExpr = (c: Conditions) => number;

/**
 * Parse one expression line: `has "foo"`, `not "foo"`, `"credits" >= 1000000`,
 * `"ships: Shuttle" + "ships: Star Barge" > 2`, or `and`/`or` between such
 * expressions. The original's ConditionSet has full precedence climbing; this
 * is the same grammar for the tokens the data uses.
 */
export function parseExpression(tokens: readonly string[]): Condition {
  if (!tokens.length) return ALWAYS;
  const input = tokens.map((text) => ({ text }));
  let index = 0;

  const peek = (): string => input[index]?.text ?? '';
  const take = (): string => input[index++]?.text ?? '';

  const parsePrimary = (): ValueExpr => {
    const t = take();
    if (t === '(') {
      const inner = parseOr();
      if (peek() === ')') ++index;
      return inner;
    }
    if (t === 'has') return (c) => (conditionValue(c, take()) !== 0 ? 1 : 0);
    if (t === 'not') {
      // `not X` as a value is 1 - X, like the original's EQ to 0.
      const name = take();
      return (c) => (conditionValue(c, name) === 0 ? 1 : 0);
    }
    if (t === 'never') return () => 0;
    if (isNumber(t)) {
      const n = Number(t);
      return () => n;
    }
    return (c) => conditionValue(c, t);
  };

  const parseMul = (): ValueExpr => {
    let left = parsePrimary();
    for (;;) {
      const op = peek();
      if (op !== '*' && op !== '/' && op !== '%') break;
      ++index;
      const right = parsePrimary();
      const l = left;
      if (op === '*') left = (c) => l(c) * right(c);
      else if (op === '/') left = (c) => (right(c) ? l(c) / right(c) : 0);
      else left = (c) => (right(c) ? l(c) % right(c) : 0);
    }
    return left;
  };

  const parseAdd = (): ValueExpr => {
    let left = parseMul();
    for (;;) {
      const op = peek();
      if (op !== '+' && op !== '-') break;
      ++index;
      const right = parseMul();
      const l = left;
      left = op === '+' ? (c) => l(c) + right(c) : (c) => l(c) - right(c);
    }
    return left;
  };

  const parseCompare = (): ValueExpr => {
    const left = parseAdd();
    const op = peek();
    if (op !== '==' && op !== '!=' && op !== '>' && op !== '<' && op !== '>=' && op !== '<=') return left;
    ++index;
    const right = parseAdd();
    const l = left;
    switch (op) {
      case '==': return (c) => (l(c) === right(c) ? 1 : 0);
      case '!=': return (c) => (l(c) !== right(c) ? 1 : 0);
      case '>': return (c) => (l(c) > right(c) ? 1 : 0);
      case '<': return (c) => (l(c) < right(c) ? 1 : 0);
      case '>=': return (c) => (l(c) >= right(c) ? 1 : 0);
      default: return (c) => (l(c) <= right(c) ? 1 : 0);
    }
  };

  const parseAnd = (): ValueExpr => {
    let left = parseCompare();
    while (peek() === 'and') {
      ++index;
      const right = parseCompare();
      const l = left;
      left = (c) => (l(c) !== 0 && right(c) !== 0 ? 1 : 0);
    }
    return left;
  };

  const parseOr = (): ValueExpr => {
    let left = parseAnd();
    while (peek() === 'or') {
      ++index;
      const right = parseAnd();
      const l = left;
      left = (c) => (l(c) !== 0 || right(c) !== 0 ? 1 : 0);
    }
    return left;
  };

  const expression = parseOr();
  return (c) => expression(c) !== 0;
}

/** Parse the simple `to display`-style children of a data node. */
export function conditionOf(node: DataNode | undefined): Condition {
  return node ? parseConditionNode(node) : ALWAYS;
}

/** A text with the condition under which Endless Sky shows it (Paragraphs). */
export interface ConditionalText {
  condition: Condition;
  text: string;
}

export function loadParagraphs(node: DataNode): ConditionalText {
  // Paragraphs::Load uses the last token of the line as the paragraph and a
  // single `to display` child as its condition.
  const text = node.tokens[node.tokens.length - 1] ?? '';
  const display = node.children.find((c) => token(c, 0) === 'to' && token(c, 1) === 'display');
  return { condition: display ? parseConditionSet(display.children) : ALWAYS, text: text + '\n' };
}

export function paragraphsText(paragraphs: readonly ConditionalText[], conditions: Conditions): string {
  return paragraphs.filter((p) => p.text && p.condition(conditions)).map((p) => p.text).join('');
}
