// The Swing component tree as re/freecol/oracle/ClientDump.java writes it (class, bounds, visibility,
// preferred size, font, text), for comparing the port's client with the original's.

export function dumpTree(java: (n: string) => any, $J: any, root: any): string {
  const JLabel = java('javax.swing.JLabel');
  const AbstractButton = java('javax.swing.AbstractButton');
  const JTextComponent = java('javax.swing.text.JTextComponent');
  const m = (c: string, sig: string) => $J.m(c, sig);
  const getBounds = m('java.awt.Component', 'getBounds()');
  const getFamily = m('java.awt.Font', 'getFamily()');
  const isVisible = m('java.awt.Component', 'isVisible()');
  const getPref = m('java.awt.Component', 'getPreferredSize()');
  const textOf = (c: any) => {
    if (c instanceof JLabel) return c[m('javax.swing.JLabel', 'getText()')]();
    if (c instanceof AbstractButton) return c[m('javax.swing.AbstractButton', 'getText()')]();
    if (c instanceof JTextComponent) return c[m('javax.swing.text.JTextComponent', 'getText()')]();
    return null;
  };
  const out: string[] = [];
  const num = (v: number) => (Number.isInteger(v) ? v.toFixed(1) : String(v));
  const walk = (c: any, depth: number) => {
    const b = c[getBounds]();
    let s = '  '.repeat(depth) + $J.getClass(c).getName() + ' ' + b.getX() + ',' + b.getY() + ' ' + b.getWidth() + 'x' + b.getHeight();
    if (!c[isVisible]()) s += ' hidden';
    const p = c[getPref]();
    s += ' pref ' + p.getWidth() + 'x' + p.getHeight();
    const f = c.getFont();
    if (f != null) s += ' font ' + f[getFamily]() + '/' + f.getStyle() + '/' + num(f.getSize2D());
    const text = textOf(c);
    if (text != null && text !== '') s += ' "' + text.replace(/\n/g, '\\n') + '"';
    out.push(s);
    if (c.getComponents) for (const k of c.getComponents()) walk(k, depth + 1);
  };
  walk(root, 0);
  return out.join('\n') + '\n';
}
