// FreeCol's rules against the original: the port reads a rule set (data/rules, classic and freecol),
// prepares it for a difficulty level as a new game does, and writes it out; the text is the original's
// (re/freecol/oracle/SpecDump.java, run on the reference release).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { bootPort, firstDiff, oracleMissing, oracleOutput, runOracle } from './harness.ts';

const cases = ['freecol:medium', 'classic:medium', 'freecol:veryHard', 'classic:veryEasy', 'freecol:veryEasy', 'classic:veryHard'];
const missing = oracleMissing();

test('the rule sets read and prepared as the original reads them', { skip: missing ? `the oracle is missing: ${missing}` : false, timeout: 600000 }, async () => {
  const dir = oracleOutput('rules', cases.map((c) => c.replace(':', '-') + '.xml'), (d) => runOracle(['SpecDump', d, ...cases]));
  const fc = await bootPort();
  const FreeCol = fc.java('net.sf.freecol.FreeCol');
  const FreeColRules = fc.java('net.sf.freecol.common.io.FreeColRules');
  const { StringWriter } = await import('../src/jre/index.ts');
  const WriteScope = fc.java('net.sf.freecol.common.io.FreeColXMLWriter$WriteScope');
  for (const c of cases) {
    const [rules, difficulty] = c.split(':');
    const spec = FreeCol.loadSpecification(FreeColRules.getFreeColRulesFile(rules), null, 'model.difficulty.' + difficulty);
    assert.ok(spec, `${rules} loads`);
    const sw = new StringWriter();
    const xw = fc.jnew('net.sf.freecol.common.io.FreeColXMLWriter', 'java.io.Writer,net.sf.freecol.common.io.FreeColXMLWriter$WriteScope', sw, WriteScope.toSave());
    spec[fc.jmethod('net.sf.freecol.common.model.Specification', 'toXML(net.sf.freecol.common.io.FreeColXMLWriter)')](xw);
    xw.close();
    const mine = sw.toString();
    const theirs = fs.readFileSync(path.join(dir, c.replace(':', '-') + '.xml'), 'utf8');
    if (mine !== theirs) assert.fail(`${c}: the specification differs ${firstDiff(mine, theirs)}`);
  }
});
