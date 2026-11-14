// Typing Warriors: GPL-3.0-or-later (LICENSE.md).
// The game's look: dark, one accent, the text to type in a monospace face. Phone first; wider screens get columns.
export const CSS = `
.tw { --bg: #12141c; --panel: #1c2030; --panel2: #262b3f; --ink: #eef0f7; --muted: #99a0b8; --accent: #ffb703; --accent2: #3ddc97;
  --bad: #ff5d73; --seg0: #5cc8ff; --seg1: #ff9f6b; --mono: ui-monospace, "SF Mono", "Cascadia Mono", Menlo, Consolas, "DejaVu Sans Mono", monospace;
  position: absolute; inset: 0; overflow: auto; background: var(--bg); color: var(--ink); font: 16px/1.5 system-ui, sans-serif;
  -webkit-text-size-adjust: 100%; }
.tw *, .tw *::before { box-sizing: border-box; }
.tw-screen { max-width: 60rem; margin: 0 auto; padding: .75rem 1rem 2rem; min-height: 100%; display: flex; flex-direction: column; gap: .75rem; }
.tw-typing { max-width: 72rem; padding-bottom: .5rem; }
.tw-main { display: flex; flex-direction: column; gap: .75rem; }
.tw h1, .tw h2, .tw h3, .tw p { margin: 0; }
.tw h3 { font-size: .8rem; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); margin-top: .5rem; }
.tw-head { display: flex; align-items: center; gap: .6rem; flex-wrap: wrap; }
.tw-title { font-size: 1.15rem; flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tw-muted { color: var(--muted); font-size: .9rem; }
.tw-center { text-align: center; justify-content: center; }
.tw-error { color: var(--bad); font-size: .95rem; }
.tw-hidden { display: none !important; }
.tw-btn { font: inherit; font-weight: 600; padding: .55rem 1.1rem; border-radius: 8px; border: 1px solid var(--accent); background: var(--accent); color: #1a1400;
  cursor: pointer; touch-action: manipulation; }
.tw-btn:hover { filter: brightness(1.08); }
.tw-btn.tw-quiet { background: transparent; color: var(--ink); border-color: #454c68; font-weight: 500; }
.tw-btn.tw-back { padding: .35rem .7rem; }
.tw-row { display: flex; gap: .6rem; flex-wrap: wrap; align-items: center; }
.tw-card { background: var(--panel); border-radius: 12px; padding: 1rem; display: flex; flex-direction: column; gap: .7rem; }
.tw-card > .tw-btn { align-self: flex-start; }
.tw label { display: flex; align-items: center; gap: .6rem; flex-wrap: wrap; font-size: .95rem; color: var(--muted); }
.tw label.tw-check { color: var(--ink); }
.tw label.tw-inline { color: var(--muted); }
.tw-select { font: inherit; color: var(--ink); background: var(--panel2); border: 1px solid #454c68; border-radius: 8px; padding: .4rem .6rem; max-width: 100%; }
.tw-chip { background: var(--panel2); border-radius: 999px; padding: .15rem .7rem; font-size: .85rem; color: var(--muted); white-space: nowrap; }
.tw-chip b { color: var(--ink); font-variant-numeric: tabular-nums; }
.tw-stats { display: flex; gap: .4rem; flex-wrap: wrap; }
.tw kbd { font: 600 1rem var(--mono); background: var(--panel2); border-radius: 6px; padding: .1rem .5rem; margin-right: .3rem; border-bottom: 2px solid #0a0c12; }

/* home */
.tw-hero { text-align: center; padding: 1.2rem 0 .4rem; }
.tw-hero h1 { font-size: clamp(2rem, 8vw, 3.4rem); letter-spacing: -.02em; line-height: 1.05; }
.tw-hero h1 span { color: var(--accent); }
.tw-hero p { color: var(--muted); margin-top: .4rem; }
.tw-me-stats { display: flex; gap: .4rem; flex-wrap: wrap; }
.tw-tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr)); gap: .7rem; }
.tw-tile { font: inherit; text-align: left; color: var(--ink); background: var(--panel); border: 1px solid transparent; border-radius: 12px; padding: 1rem;
  display: flex; flex-direction: column; gap: .2rem; cursor: pointer; }
.tw-tile:hover { border-color: var(--accent); }
.tw-tile b { font-size: 1.1rem; }
.tw-tile span { color: var(--muted); font-size: .9rem; }
.tw-tile-main { background: linear-gradient(135deg, #3a2a00, #1c2030 70%); border-color: var(--accent); }
.tw-tile-main b { color: var(--accent); }

/* the duel's setup */
.tw-modes { display: grid; grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr)); gap: .6rem; }
.tw-mode { font: inherit; text-align: left; color: var(--ink); background: var(--panel); border: 2px solid transparent; border-radius: 12px; padding: .8rem;
  display: flex; flex-direction: column; gap: .2rem; cursor: pointer; }
.tw-mode span { color: var(--muted); font-size: .85rem; }
.tw-mode.tw-on { border-color: var(--accent); background: var(--panel2); }
.tw-bots { display: flex; gap: .5rem; flex-wrap: wrap; align-items: center; }
.tw-bot { display: inline-flex; gap: .2rem; }
.tw-bot .tw-btn { padding: .3rem .6rem; }

/* the course */
.tw-lessons { display: grid; grid-template-columns: repeat(auto-fill, minmax(9.5rem, 1fr)); gap: .5rem; }
.tw-lesson { font: inherit; color: var(--ink); background: var(--panel); border: 1px solid transparent; border-radius: 10px; padding: .6rem .7rem; cursor: pointer;
  display: grid; grid-template-columns: auto 1fr; gap: .1rem .5rem; text-align: left; align-items: center; }
.tw-lesson:hover { border-color: var(--accent); }
.tw-lesson-no { grid-row: span 2; font-weight: 700; font-size: 1.2rem; color: var(--muted); min-width: 1.6rem; }
.tw-lesson-done .tw-lesson-no { color: var(--accent2); }
.tw-lesson-keys { font: 600 .95rem var(--mono); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tw-lesson-stars { color: var(--accent); font-size: .85rem; letter-spacing: .05em; }
.tw-lesson-stars i, .tw-stars-off { color: #454c68; font-style: normal; }
.tw-lesson-best { grid-column: 1 / -1; color: var(--muted); font-size: .75rem; }

/* typing */
.tw-input { position: absolute; left: 0; top: 0; width: 1px; height: 1px; opacity: 0; border: 0; padding: 0; font-size: 16px; }
.tw-body { display: flex; flex-direction: column; gap: .6rem; position: relative; flex: 1 0 auto; }
.tw-pad { font: 500 clamp(1.15rem, 3.6vw, 1.7rem)/1.7 var(--mono); background: var(--panel); border-radius: 12px; padding: .6rem 1rem;
  height: calc(var(--tw-lines, 3) * 1.7em + 1.2rem); overflow: hidden; position: relative; scroll-behavior: smooth; }
.tw-pad-inner { position: relative; }
.tw-word { display: inline-block; white-space: nowrap; }
.tw-ch { color: var(--ink); border-radius: 3px; }
.tw-ch.tw-seg0 { color: var(--seg0); }
.tw-ch.tw-seg1 { color: var(--seg1); }
.tw-ch.tw-done { color: #56607e; }
.tw-ch.tw-cur { background: var(--accent); color: #1a1400; }
.tw-ch.tw-space.tw-cur { background: transparent; box-shadow: inset 0 -3px 0 var(--accent); }
.tw-ch.tw-miss { animation: tw-miss .25s; }
@keyframes tw-miss { 0% { background: var(--bad); color: #fff; } 100% { } }
.tw-hint, .tw-fresh { color: var(--muted); font-size: .95rem; min-height: 1.5em; }
.tw-banner { border-radius: 10px; padding: .45rem .9rem; font-weight: 700; text-align: center; background: var(--panel2); }
.tw-banner.tw-seg0 { color: var(--seg0); box-shadow: inset 0 0 0 2px var(--seg0); }
.tw-banner.tw-seg1 { color: var(--seg1); box-shadow: inset 0 0 0 2px var(--seg1); }
.tw-banner.tw-banner-now { animation: tw-pulse .5s infinite alternate; }
@keyframes tw-pulse { from { transform: scale(1); } to { transform: scale(1.015); filter: brightness(1.4); } }

/* results */
.tw-result { align-items: center; text-align: center; }
.tw-result h3 { font-size: 1.5rem; text-transform: none; letter-spacing: 0; color: var(--ink); margin: 0; }
.tw-stars { font-size: 2.4rem; color: var(--accent); letter-spacing: .1em; line-height: 1; }
.tw-result-grid { display: flex; gap: 1.5rem; flex-wrap: wrap; justify-content: center; }
.tw-result-grid div { display: flex; flex-direction: column; color: var(--muted); font-size: .85rem; }
.tw-result-grid b { font-size: 1.8rem; color: var(--ink); font-variant-numeric: tabular-nums; }
.tw-elo { font-size: 1.1rem; }
.tw-elo b { color: var(--accent); font-size: 1.4rem; }
.tw-table { border-collapse: collapse; width: 100%; font-size: .9rem; font-variant-numeric: tabular-nums; }
.tw-table th { text-align: left; color: var(--muted); font-weight: 500; font-size: .8rem; }
.tw-table td, .tw-table th { padding: .3rem .4rem; border-bottom: 1px solid #2c3247; text-align: left; }
.tw-table .tw-row-me td { color: var(--accent); font-weight: 600; }

/* a round */
.tw-lanes { display: flex; flex-direction: column; gap: .25rem; }
.tw-lane { display: grid; grid-template-columns: minmax(6rem, 11rem) 1fr minmax(4.5rem, auto); gap: .5rem; align-items: center; font-size: .85rem; }
.tw-lane-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tw-lane-name small { color: var(--muted); }
.tw-lane-bar { height: .55rem; background: var(--panel2); border-radius: 999px; overflow: hidden; }
.tw-lane-bar i { display: block; height: 100%; width: 0; background: #7d88b3; border-radius: 999px; transition: width .2s linear; }
.tw-lane-me { font-weight: 700; }
.tw-lane-me .tw-lane-bar i { background: var(--accent); }
.tw-lane-val { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; color: var(--muted); }
.tw-lane-out { opacity: .45; }
.tw-feed { min-height: 1.4em; font-size: .85rem; color: var(--accent2); display: flex; flex-direction: column; }
.tw-stage { display: flex; flex-direction: column; gap: .6rem; }
.tw-stage.tw-frozen { filter: saturate(.3) brightness(.7); outline: 3px solid var(--seg0); border-radius: 12px; }
.tw-stage.tw-double .tw-pool { box-shadow: 0 0 0 2px var(--accent); border-radius: 12px; }
.tw-count { position: absolute; inset: 0; display: grid; place-items: center; font: 800 6rem/1 system-ui, sans-serif; color: var(--accent);
  background: rgb(18 20 28 / .6); border-radius: 12px; pointer-events: none; }
.tw-wave { font: 700 clamp(2rem, 9vw, 4rem)/1.2 var(--mono); text-align: center; background: var(--panel); border-radius: 12px; padding: 1rem .5rem; overflow-wrap: anywhere; }
.tw-stage.tw-safe .tw-wave { box-shadow: inset 0 0 0 3px var(--accent2); }
.tw-timebar { height: .6rem; background: var(--panel2); border-radius: 999px; overflow: hidden; }
.tw-timebar i { display: block; height: 100%; background: var(--accent2); }
.tw-timebar i.tw-low { background: var(--bad); }
.tw-pool { display: grid; grid-template-columns: repeat(auto-fill, minmax(8.5rem, 1fr)); gap: .5rem; }
.tw-slot { background: var(--panel); border-radius: 10px; padding: .55rem .7rem; min-height: 4.1rem; border: 2px solid transparent; display: flex; flex-direction: column; gap: .1rem; }
.tw-slot-word { font: 600 1.25rem var(--mono); }
.tw-slot-word b { color: #56607e; }
.tw-slot-mine { border-color: var(--accent); background: var(--panel2); }
.tw-slot-power { border-style: dashed; border-color: var(--accent2); }
.tw-slot-mine.tw-slot-power { border-color: var(--accent); }
.tw-slot-badge { align-self: flex-start; font-size: .7rem; font-weight: 700; color: #06281a; background: var(--accent2); border-radius: 4px; padding: 0 .35rem; }
.tw-slot-rivals { font-size: .7rem; color: var(--bad); }

/* the helper keyboard */
.tw-kbwrap { display: flex; flex-direction: column; gap: .3rem; align-items: center; margin-top: auto; }
.tw-kb { width: 100%; max-width: 46rem; font-size: clamp(8px, 2.05vw, 15px); user-select: none; -webkit-user-select: none; }
.tw-kb-head { display: flex; align-items: center; gap: .5em; margin-bottom: .4em; font-size: max(11px, .85em); flex-wrap: wrap; }
.tw-kb-name { color: var(--muted); font-weight: 600; margin-right: auto; }
.tw-kb-tabs { display: flex; gap: .3em; }
.tw-kb-tab { font: inherit; color: var(--muted); background: transparent; border: 1px solid #454c68; border-radius: 6px; padding: .1em .6em; cursor: pointer; }
.tw-kb-tab.tw-on { color: var(--ink); border-color: var(--ink); }
.tw-kb-tab.tw-pinned { background: var(--ink); color: var(--bg); }
.tw-kb-board { display: flex; flex-direction: column; gap: .28em; }
.tw-kb-row { display: flex; gap: .28em; }
.tw-key { flex: 1 1 2em; min-width: 0; height: 2.5em; border-radius: .4em; display: grid; place-items: center; font: 600 1.15em var(--mono);
  background: var(--panel2); color: var(--ink); border-bottom: .22em solid var(--fc, #454c68); overflow: hidden; white-space: nowrap; }
.tw-key-mod { font-size: .8em; color: var(--muted); background: #191c29; }
.tw-key-empty { opacity: .45; }
.tw-key-dead { color: var(--muted); }
.tw-f0 { --fc: #e05780; } .tw-f1 { --fc: #f4a259; } .tw-f2 { --fc: #f2e86d; } .tw-f3 { --fc: #5fcf80; }
.tw-f4 { --fc: #4fc3f7; } .tw-f5 { --fc: #7c83fd; } .tw-f6 { --fc: #c77dff; } .tw-f7 { --fc: #ff8fab; } .tw-f8 { --fc: #8d99ae; }
.tw-key-next { background: var(--fc); color: #101218; box-shadow: 0 0 0 .18em #fff; }
.tw-key-hold { box-shadow: inset 0 0 0 .18em var(--accent); color: var(--accent); }
.tw-key-ok { animation: tw-ok .2s; }
.tw-key-bad { animation: tw-bad .3s; }
@keyframes tw-ok { 0% { filter: brightness(1.8); } 100% { } }
@keyframes tw-bad { 0% { background: var(--bad); } 100% { } }
.tw-note { font-size: .8rem; color: var(--muted); min-height: 1.3em; text-align: center; }
.tw-note-ok { color: var(--accent2); }
.tw-note-bad { color: var(--bad); }

@media (max-width: 480px) {
  .tw-mode:not(.tw-on) span { display: none; }
  .tw-mode { padding: .55rem .8rem; }
  .tw-screen { padding: .5rem .6rem 1.5rem; }
  .tw-lane { grid-template-columns: 5.5rem 1fr auto; font-size: .78rem; }
  .tw-table { font-size: .78rem; }
  .tw-card { padding: .75rem; }
}
@media (prefers-reduced-motion: reduce) { .tw * { animation: none !important; transition: none !important; } }
`;
