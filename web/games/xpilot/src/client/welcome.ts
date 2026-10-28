// x11/welcome.c: the welcome screen. "Local" searches the local network (there is none in the
// browser: no servers are found), "Internet" lists the rooms of our server where the original
// listed the meta server's servers (same pages, columns and status page; joining a row enters that
// room), and the list page has a "Create Room" button for a page that picks a map and options (the
// original's planned server page, welcome.c Server_cb). "Quit" goes back to the website.
import { G } from './G.ts';
import { BLACK, WHITE, MSG_LEN, MIN_TOP_WIDTH, MAX_TOP_WIDTH, MIN_TOP_HEIGHT, MAX_TOP_HEIGHT } from './consts.ts';
import { LIMIT, MAX, onReset, sprintf } from './cutil.ts';
import * as X from '../xlib/xlib.ts';
import type { XEvent } from '../xlib/xlib.ts';
import { sys } from './sys.ts';
import type { RoomEntry } from './sys.ts';
import { xpprintf } from './error.ts';
import { Init_top, Platform_specific_cleanup } from './xinit.ts';
import {
  NO_WIDGET, Widget_create_activate, Widget_create_arrow_left, Widget_create_arrow_right, Widget_create_bool, Widget_create_colored_label,
  Widget_create_form, Widget_create_int, Widget_create_label, Widget_destroy, Widget_destroy_children, Widget_event,
  Widget_get_dimensions, Widget_map, Widget_map_sub, Widget_set_background, Widget_unmap,
} from './widget.ts';
import type { Callback } from './widget.ts';

interface server_info_t {
  version: string; hostname: string; users_str: string; mapname: string; mapsize: string; author: string; status: string;
  bases_str: string; fps_str: string; playlist: string; sound: string; teambases_str: string; timing: string; ip_str: string;
  freebases: string; queue_str: string; port: number; users: number; teambases: number; queue: number; pingtime: number;
  room: RoomEntry;
}

const PING_UNKNOWN = 10000, PING_NORESP = 9999, PING_SLOW = 9998;
const ModeWaiting = 0, ModeLocalnet = 1, ModeInternet = 2, ModeServer = 3, ModeStatus = 4, ModeQuit = 6;

const next_text = 'Next Server Page >>>';
const first_text = '<< First Server Page';
const ping_text = 'Ping Servers';
const create_text = 'Create Room';

const labels = [
  { label: 'Server', commas: 0, yoff: 0, height: 0 }, { label: 'IP:Port', commas: 0, yoff: 0, height: 0 },
  { label: 'Version', commas: 0, yoff: 0, height: 0 }, { label: 'Users', commas: 0, yoff: 0, height: 0 },
  { label: 'Map name', commas: 0, yoff: 0, height: 0 }, { label: 'Map size', commas: 0, yoff: 0, height: 0 },
  { label: 'Map author', commas: 0, yoff: 0, height: 0 }, { label: 'Status', commas: 0, yoff: 0, height: 0 },
  { label: 'Bases', commas: 0, yoff: 0, height: 0 }, { label: 'Teambases', commas: 0, yoff: 0, height: 0 },
  { label: 'Free bases', commas: 0, yoff: 0, height: 0 }, { label: 'Queued players', commas: 0, yoff: 0, height: 0 },
  { label: 'FPS', commas: 0, yoff: 0, height: 0 }, { label: 'Sound', commas: 0, yoff: 0, height: 0 },
  { label: 'Timing', commas: 0, yoff: 0, height: 0 }, { label: 'Playlist', commas: 1, yoff: 0, height: 0 },
];

const W = {
  joining: false,
  form_widget: NO_WIDGET, subform_widget: NO_WIDGET, subform_label_widget: NO_WIDGET,
  subform_width: 0, subform_height: 0,
  next_page_widget: NO_WIDGET, first_page_widget: NO_WIDGET, ping_servers_widget: NO_WIDGET, create_room_widget: NO_WIDGET,
  welcome_mode: ModeWaiting,
  server_list: null as server_info_t[] | null, server_list_creation_time: 0, server_it: 0,
  // the room page
  maps: [] as string[], map: '', teamPlay: false, limitedLives: false, robots: 0,
};
onReset(() => {
  for (const l of labels) Object.assign(l, { commas: l.label === 'Playlist' ? 1 : 0, yoff: 0, height: 0 });
});
onReset(() => Object.assign(W, {
  joining: false, form_widget: NO_WIDGET, subform_widget: NO_WIDGET, subform_label_widget: NO_WIDGET, subform_width: 0, subform_height: 0,
  next_page_widget: NO_WIDGET, first_page_widget: NO_WIDGET, ping_servers_widget: NO_WIDGET, create_room_widget: NO_WIDGET,
  welcome_mode: ModeWaiting, server_list: null, server_list_creation_time: 0, server_it: 0, maps: [], map: '', teamPlay: false,
  limitedLives: false, robots: 0,
}));

async function nextEvent(): Promise<XEvent> {
  for (;;) {
    const e = X.XPending(G.dpy) ? X.XNextEvent(G.dpy) : null;
    if (e) return e;
    await sys.waitX();
  }
}

async function Welcome_process_exposure_events(): Promise<void> {
  let event;
  while ((event = X.XCheckMaskEvent(G.dpy, X.ExposureMask)) !== null) await Welcome_process_one_event(event);
}

function dims(): void {
  const d = Widget_get_dimensions(W.subform_widget);
  if (d) {
    W.subform_width = d.width;
    W.subform_height = d.height;
  }
}

async function Welcome_create_label(pos: number, label_text: string): Promise<number> {
  Widget_destroy_children(W.subform_widget);
  W.subform_label_widget = NO_WIDGET;
  dims();
  const tf = G.textFont;
  const label_width = X.XTextWidth(tf, label_text, label_text.length) + 40;
  let label_height = tf.ascent + tf.descent;
  const label_x = Math.trunc((W.subform_width - label_width) / 2);
  let label_y;
  switch (pos) {
    default:
    case 0:
      label_y = 10;
      label_height += 10;
      break;
    case 1:
      label_y = Math.trunc(W.subform_height / 2) - tf.ascent - 10;
      label_height += 20;
      break;
    case 2:
      label_y = W.subform_height - 10 - tf.ascent - tf.descent;
      label_height += 10;
      break;
  }
  W.subform_label_widget = Widget_create_label(W.subform_widget, label_x, label_y, label_width, label_height, true, 0, label_text);
  if (W.subform_label_widget !== NO_WIDGET) {
    Widget_map_sub(W.subform_widget);
    X.XSync(G.dpy, false);
    await Welcome_process_exposure_events();
  }
  return W.subform_label_widget;
}

function Internet_widget_cleanup(): void {
  if (W.ping_servers_widget) Widget_unmap(W.ping_servers_widget);
  if (W.first_page_widget) Widget_unmap(W.first_page_widget);
  if (W.next_page_widget) Widget_unmap(W.next_page_widget);
  if (W.create_room_widget) Widget_unmap(W.create_room_widget);
  Widget_map(W.form_widget);
}

const Localnet_cb: Callback = async () => {
  Internet_widget_cleanup();
  Welcome_set_mode(ModeLocalnet);
  await Welcome_create_label(1, 'Searching for XPilot servers on your local network...');
  dims();
  // Contact_servers(): a browser cannot broadcast to the local network, so there are none
  Widget_destroy_children(W.subform_widget);
  await Welcome_create_label(1, 'No servers were found on your local network.');
  Widget_map_sub(W.subform_widget);
  return 0;
};

/** the contact stage is over: the room is the server we join (Contact_servers fills conpar) */
function entered(name: string): void {
  G.connectParam.server_name = name;
  G.connectParam.server_addr = name;
  G.connectParam.server_version = 0x4f15;
  W.joining = true;
}

const Internet_server_join_cb: Callback = async (_w, user_data) => {
  const sip = user_data as server_info_t;
  if (sys.rooms && (await sys.rooms.join(sip.room.id))) entered(sip.hostname);
  else xpprintf(`Server ${sip.hostname} (${sip.ip_str}) didn't respond on port ${sip.port}\n`);
  return 0;
};

const Internet_server_show_cb: Callback = (_w, user_data) => {
  const sip = user_data as server_info_t;
  Widget_destroy_children(W.subform_widget);
  W.welcome_mode = ModeStatus;
  dims();
  const label_x = 10;
  let label_y = 10;
  const label_border = 1, label_space = 5;
  const tf = G.textFont;
  const label_height = tf.ascent + tf.descent + 5;
  const longest_text = '                                 ';
  const data_label_width = X.XTextWidth(G.buttonFont, longest_text, longest_text.length);
  const player_label_width = 200, host_label_width = 400;
  let max_label_width = 0;
  for (const l of labels) {
    max_label_width = MAX(X.XTextWidth(tf, l.label, l.label.length), max_label_width);
    l.yoff = label_y;
    label_y += label_height + label_space;
    if (l.commas) {
      l.commas = 0;
      for (let p = sip.playlist.indexOf(','); p >= 0; p = sip.playlist.indexOf(',', p + 1)) {
        l.commas++;
        label_y += label_height + label_space;
      }
      label_y += label_height + label_space;
    }
    l.height = label_y - l.yoff - label_space;
  }
  const label_width = max_label_width + 2 * label_space;
  for (const l of labels) Widget_create_colored_label(W.subform_widget, label_x, l.yoff, label_width, l.height, true, label_border, 9, WHITE, l.label);
  const data = (i: number, text: string) => Widget_create_colored_label(W.subform_widget, label_x + label_width, labels[i].yoff, data_label_width,
    labels[i].height, true, label_border, BLACK, WHITE, text);
  const bx = label_x + label_width + data_label_width + label_space;
  data(0, sip.hostname);
  Widget_create_activate(W.subform_widget, bx, labels[0].yoff, data_label_width, labels[0].height, label_border, 'Join This Server',
    Internet_server_join_cb, sip);
  data(1, `${sip.ip_str}:${sip.port}`);
  Widget_create_activate(W.subform_widget, bx, labels[1].yoff, data_label_width, labels[1].height, label_border, 'Back to List', Internet_cb, null);
  data(2, sip.version);
  data(3, sip.users ? sip.users_str : '');
  data(4, sip.mapname);
  data(5, sip.mapsize);
  data(6, sip.author);
  data(7, sip.status);
  data(8, sip.bases_str);
  data(9, sip.teambases_str);
  data(10, sip.freebases);
  data(11, sip.queue_str);
  data(12, sip.fps_str);
  data(13, sip.sound);
  data(14, sip.timing === '0' ? 'Not a race' : 'Race!');
  label_y = labels[15].yoff;
  if (sip.users !== 0) {
    Widget_create_colored_label(W.subform_widget, label_x + label_width, label_y, player_label_width, label_height, true, label_border, 9, WHITE, 'Player Name');
    Widget_create_colored_label(W.subform_widget, label_x + label_width + player_label_width, label_y, host_label_width, label_height, true,
      label_border, 9, WHITE, 'Player Host');
    label_y += label_height + label_space;
  }
  for (const p of sip.playlist.split(',').filter((s) => s.length)) {
    const eq = p.indexOf('=');
    if (eq < 0) continue;
    Widget_create_colored_label(W.subform_widget, label_x + label_width, label_y, player_label_width, label_height, false, label_border, BLACK, WHITE, p.slice(0, eq));
    Widget_create_colored_label(W.subform_widget, label_x + label_width + player_label_width, label_y, host_label_width, label_height, false,
      label_border, BLACK, WHITE, p.slice(eq + 1));
    label_y += label_height + label_space;
  }
  Widget_map_sub(W.subform_widget);
  return 0;
};

const Internet_next_page_cb: Callback = () => {
  Welcome_show_server_list();
  return 0;
};

const Internet_first_page_cb: Callback = () => {
  W.server_it = 0;
  Welcome_show_server_list();
  return 0;
};

const Internet_ping_cb: Callback = async () => {
  await Welcome_create_label(1, 'Pinging servers...');
  // Ping_servers(): the rooms are on our own server, there is nothing to ping
  Welcome_sort_server_list();
  W.server_it = 0;
  Welcome_show_server_list();
  return 0;
};

function Welcome_show_server_list(): number {
  const border = 0, extra_width = 6, extra_height = 4;
  const space_width = 0 + 2 * border, space_height = 4 + 2 * border;
  const max_map_length = 30, max_version_length = 11, max_server_length = 37;
  const tf = G.textFont, bf = G.buttonFont;
  const player_width = X.XTextWidth(tf, 'Pl', 2) + extra_width + 2 * border;
  const queue_width = X.XTextWidth(tf, '99', 2) + extra_width + 2 * border;
  const bases_width = X.XTextWidth(tf, 'Ba', 2) + extra_width + 2 * border;
  const team_width = X.XTextWidth(tf, 'Tm', 2) + extra_width + 2 * border;
  const fps_width = X.XTextWidth(tf, 'FPS', 3) + extra_width + 2 * border;
  const status_width = X.XTextWidth(tf, 'Stat', 4) + extra_width + 2 * border;
  const version_width = X.XTextWidth(tf, '4.2.0alpha7', max_version_length) + extra_width + 2 * border;
  const map_width = X.XTextWidth(tf, '', max_map_length) + extra_width + 2 * border;
  const server_width = X.XTextWidth(bf, 'Server', max_server_length);
  const server_border_width = 2 * (border ? border : 1);
  const ping_width = X.XTextWidth(tf, 'Ping', 5);
  const stat_width = X.XTextWidth(tf, 'Stat', 8) + extra_width + 2 * border;
  let yoff = space_height;
  const label_height = MAX(tf.ascent + tf.descent, bf.ascent + bf.descent) + extra_height + 2 * border + 4;
  const player_offset = space_width;
  const queue_offset = player_offset + player_width + space_width;
  const bases_offset = queue_offset + queue_width + space_width;
  const team_offset = bases_offset + bases_width + space_width;
  const fps_offset = team_offset + team_width + space_width;
  const status_offset = fps_offset + fps_width + space_width;
  let version_offset = status_offset + status_width + space_width;
  let map_offset = version_offset + version_width + space_width;
  let server_offset = map_offset + map_width + space_width;
  let ping_offset = server_offset + server_width + server_border_width + space_width;
  let stat_offset = ping_offset + ping_width + space_width;
  const start_server_it = W.server_it;
  dims();
  const all_offset = player_width + queue_width + bases_width + team_width + fps_width + stat_width + version_width + server_width
    + map_width + ping_width + status_width;
  Widget_destroy_children(W.subform_widget);
  const sf = W.subform_widget;
  if (!Widget_create_label(sf, player_offset, yoff, player_width, label_height, true, border, 'Pl')) return -1;
  if (!Widget_create_label(sf, queue_offset, yoff, queue_width, label_height, true, border, 'Q')) return -1;
  const wide = all_offset < W.subform_width;
  if (wide) {
    Widget_create_label(sf, bases_offset, yoff, bases_width, label_height, true, border, 'Ba');
    Widget_create_label(sf, team_offset, yoff, team_width, label_height, true, border, 'Tm');
    Widget_create_label(sf, fps_offset, yoff, fps_width, label_height, true, border, 'FPS');
    Widget_create_label(sf, status_offset, yoff, status_width, label_height, true, border, 'Stat');
  } else {
    version_offset = queue_offset + queue_width + space_width;
    map_offset = version_offset + version_width + space_width;
    server_offset = map_offset + map_width + space_width;
    ping_offset = server_offset + server_width + server_border_width + space_width;
    stat_offset = ping_offset + ping_width + space_width;
  }
  Widget_create_label(sf, version_offset, yoff, version_width, label_height, true, border, 'Version');
  Widget_create_label(sf, map_offset, yoff, map_width, label_height, true, border, 'Map Name');
  Widget_create_label(sf, server_offset, yoff, server_width + server_border_width, label_height, true, border, 'Server');
  Widget_create_label(sf, ping_offset, yoff, ping_width, label_height, true, border, 'Ping');
  Widget_create_label(sf, stat_offset, yoff, stat_width, label_height, true, border, 'Status');
  const list = W.server_list ?? [];
  for (; W.server_it < list.length; W.server_it++) {
    yoff += label_height + space_height;
    if (yoff + 1 * label_height >= W.subform_height) break;
    const sip = list[W.server_it];
    Widget_create_label(sf, player_offset, yoff, player_width, label_height, true, border, sip.users ? sip.users_str : '');
    Widget_create_label(sf, queue_offset, yoff, queue_width, label_height, true, border, sip.queue ? sip.queue_str : '');
    if (wide) {
      Widget_create_label(sf, bases_offset, yoff, bases_width, label_height, true, border, sip.bases_str);
      Widget_create_label(sf, team_offset, yoff, team_width, label_height, true, border, sip.teambases > 0 ? sip.teambases_str : '');
      Widget_create_label(sf, fps_offset, yoff, fps_width, label_height, true, border, sip.fps_str);
      if (sip.status.length > 4) sip.status = sip.status.slice(0, 4);
      Widget_create_label(sf, status_offset, yoff, status_width, label_height, true, border, sip.status !== 'ok' ? sip.status : '');
    }
    if (sip.version.length > max_version_length) sip.version = sip.version.slice(0, max_version_length);
    sip.version = sip.version.toLowerCase();
    Widget_create_label(sf, version_offset, yoff, version_width, label_height, true, border, sip.version);
    Widget_create_label(sf, map_offset, yoff, map_width, label_height, true, border, sip.mapname);
    Widget_create_activate(sf, server_offset, yoff - (border === 0 ? 1 : 0), server_width, label_height, border ? border : 1, sip.hostname,
      Internet_server_join_cb, sip);
    const pingtime_str = sprintf('%4d', sip.pingtime);
    Widget_create_label(sf, ping_offset, yoff, ping_width, label_height, true, border,
      sip.pingtime === PING_NORESP ? 'None' : sip.pingtime === PING_SLOW ? 'Slow' : sip.pingtime === PING_UNKNOWN ? '' : pingtime_str);
    Widget_create_activate(sf, stat_offset, yoff - (border === 0 ? 1 : 0), stat_width, label_height, border ? border : 1, 'Status',
      Internet_server_show_cb, sip);
  }
  const next_border = border ? border : 1, first_border = next_border;
  const next_width = X.XTextWidth(bf, next_text, next_text.length) + extra_width + 2 * next_border;
  const first_width = X.XTextWidth(bf, first_text, first_text.length) + extra_width + 2 * first_border;
  const pingw_width = X.XTextWidth(bf, ping_text, ping_text.length) + extra_width + 2 * first_border;
  const create_width = X.XTextWidth(bf, create_text, create_text.length) + extra_width + 2 * first_border;
  const next_height = label_height + 2 * (next_border - border), first_height = next_height;
  const by = G.top_height - next_height - space_height;
  if (!W.next_page_widget) {
    W.next_page_widget = Widget_create_activate(W.form_widget, 2 * Math.trunc(G.top_width / 4) + next_width, by, next_width, next_height,
      next_border, next_text, Internet_next_page_cb, null);
  }
  if (!W.first_page_widget) {
    W.first_page_widget = Widget_create_activate(W.form_widget, 2 * Math.trunc(G.top_width / 4), by, first_width, first_height, first_border,
      first_text, Internet_first_page_cb, null);
  }
  if (!W.ping_servers_widget) {
    W.ping_servers_widget = Widget_create_activate(W.form_widget, next_height, by, pingw_width, first_height, first_border, ping_text,
      Internet_ping_cb, null);
  }
  if (!W.create_room_widget) {
    W.create_room_widget = Widget_create_activate(W.form_widget, 2 * next_height + pingw_width, by, create_width, first_height, first_border,
      create_text, Create_room_cb, null);
  }
  if (W.server_it !== list.length) {
    Widget_map(W.next_page_widget);
    Widget_unmap(W.first_page_widget);
  } else if (start_server_it !== 0) {
    Widget_unmap(W.next_page_widget);
    Widget_map(W.first_page_widget);
  }
  Widget_map(W.ping_servers_widget);
  Widget_map(W.create_room_widget);
  Widget_map_sub(W.subform_widget);
  return -1;
}

function Room_to_server_info(r: RoomEntry): server_info_t {
  const opt = (name: string, def: string) => {
    const o = r.options.find(([k]) => k.toLowerCase() === name.toLowerCase());
    return o ? o[1] : def;
  };
  return {
    version: '4.7.3', hostname: r.name, users_str: String(r.users), mapname: r.map, mapsize: opt('mapSize', ''), author: opt('mapAuthor', ''),
    status: 'ok', bases_str: String(r.maxUsers), fps_str: opt('framesPerSecond', '50'), playlist: r.players.join(','), sound: 'no',
    teambases_str: opt('teamPlay', 'false') === 'true' ? String(r.maxUsers) : '0', timing: opt('timing', 'false') === 'true' ? '1' : '0',
    ip_str: 'room', freebases: String(Math.max(0, r.maxUsers - r.users)), queue_str: '0', port: r.id, users: r.users,
    teambases: opt('teamPlay', 'false') === 'true' ? r.maxUsers : 0, queue: 0, pingtime: PING_UNKNOWN, room: r,
  };
}

/** meta.c Welcome_sort_server_list: by players, ping, (domain,) name and port */
function Welcome_sort_server_list(): void {
  const list = W.server_list ?? [];
  list.sort((a, b) => b.users - a.users || a.pingtime - b.pingtime || (a.hostname < b.hostname ? -1 : a.hostname > b.hostname ? 1 : 0) || a.port - b.port);
}

/** meta.c Get_meta_data: the rooms instead of the meta servers' lists */
async function Get_meta_data(err: { value: string }): Promise<number> {
  const rooms = sys.rooms ? await sys.rooms.list() : null;
  if (rooms === null) {
    err.value = 'Could not establish connections with any metaserver, either the meta is not responding or you have network problems';
    return -1;
  }
  W.server_list = rooms.map(Room_to_server_info);
  W.server_list_creation_time = sys.time();
  err.value = `Received information about ${rooms.length} Internet servers`;
  return W.server_list.length;
}

const Internet_cb: Callback = async () => {
  Welcome_set_mode(ModeInternet);
  if (!W.server_list || W.server_list.length < 10 || W.server_list_creation_time + 5 < sys.time()) {
    W.server_list = null;
    await Welcome_create_label(1, 'Doing a DNS lookup .. ');
    const err = { value: '' };
    // an empty room list still shows the list page, which has the Create Room button
    if ((await Get_meta_data(err)) < 0) {
      await Welcome_create_label(1, err.value.slice(0, MSG_LEN - 1));
      return 0;
    }
    Welcome_sort_server_list();
  }
  W.server_it = 0;
  Welcome_show_server_list();
  return 0;
};

/** the room page: a map, robots, team play and limited lives, then "Create Room" */
const Create_room_cb: Callback = async () => {
  Internet_widget_cleanup();
  Welcome_set_mode(ModeServer);
  if (!W.maps.length && sys.rooms) W.maps = await sys.rooms.maps();
  if (!W.map && W.maps.length) W.map = W.maps.includes('tourmination') ? 'tourmination' : W.maps[0];
  Show_room_page();
  return 0;
};

function Show_room_page(): void {
  Widget_destroy_children(W.subform_widget);
  dims();
  const sf = W.subform_widget;
  const tf = G.textFont, bf = G.buttonFont;
  const h = MAX(tf.ascent + tf.descent, bf.ascent + bf.descent) + 8;
  const space = 6;
  let y = 10;
  const title = 'Create a new room on this server';
  Widget_create_label(sf, 10, y, X.XTextWidth(tf, title, title.length) + 20, h, false, 0, title);
  y += h + 2 * space;
  const mapLabel = `Map: ${W.map}`;
  Widget_create_label(sf, 10, y, MAX(300, X.XTextWidth(tf, mapLabel, mapLabel.length) + 20), h, false, 0, mapLabel);
  y += h + space;
  // the maps as buttons in columns
  const col_width = Math.max(...W.maps.map((m) => X.XTextWidth(bf, m, m.length)), 60) + 16;
  const cols = MAX(1, Math.trunc((W.subform_width - 20) / (col_width + space)));
  const rows = Math.ceil(W.maps.length / cols);
  W.maps.forEach((m, i) => {
    const cx = 10 + (i % cols) * (col_width + space), cy = y + Math.trunc(i / cols) * (h + space);
    if (cy + h < W.subform_height - 4 * (h + space)) {
      if (m === W.map) Widget_create_colored_label(sf, cx, cy, col_width, h, true, 1, WHITE, BLACK, m);
      else Widget_create_activate(sf, cx, cy, col_width, h, 1, m, Room_map_cb, m);
    }
  });
  y += rows * (h + space) + space;
  y = Math.min(y, W.subform_height - 4 * (h + space));
  const optLabel = (text: string) => Widget_create_label(sf, 10, y, 160, h, false, 0, text);
  const bool_width = X.XTextWidth(bf, 'Yes', 3) + 6;
  optLabel('Team play');
  Widget_create_bool(sf, 180, y, bool_width, h, 0, W.teamPlay, (_w, _d, v) => { W.teamPlay = v.value; return 0; }, null);
  y += h + space;
  optLabel('Limited lives');
  Widget_create_bool(sf, 180, y, bool_width, h, 0, W.limitedLives, (_w, _d, v) => { W.limitedLives = v.value; return 0; }, null);
  y += h + space;
  optLabel('Robots');
  const intw = Widget_create_int(sf, 180, y, 4 + X.XTextWidth(bf, '10000', 5), h, 0, { get: () => W.robots, set: (v) => { W.robots = v; } }, 0, 8,
    () => 0, null);
  Widget_create_arrow_left(sf, 184 + X.XTextWidth(bf, '10000', 5), y, h, h, 0, intw);
  Widget_create_arrow_right(sf, 184 + X.XTextWidth(bf, '10000', 5) + h, y, h, h, 0, intw);
  y += h + 2 * space;
  const cw = X.XTextWidth(bf, create_text, create_text.length) + 20;
  Widget_create_activate(sf, 10, y, cw, h, 1, create_text, Room_create_cb, null);
  Widget_create_activate(sf, 20 + cw, y, X.XTextWidth(bf, 'Back to List', 12) + 20, h, 1, 'Back to List', Internet_cb, null);
  Widget_map_sub(sf);
}

const Room_map_cb: Callback = (_w, m) => {
  W.map = m as string;
  Show_room_page();
  return 0;
};

const Room_create_cb: Callback = async () => {
  if (!sys.rooms || !W.map) return 0;
  const options: [string, string][] = [
    ['teamPlay', W.teamPlay ? 'true' : 'false'], ['limitedLives', W.limitedLives ? 'true' : 'false'], ['maxRobots', String(W.robots)],
  ];
  if (await sys.rooms.create(W.map, options)) entered(W.map);
  else await Welcome_create_label(1, 'Could not create the room.');
  return 0;
};

const Quit_cb: Callback = () => {
  Welcome_set_mode(ModeQuit);
  G.quitting = true;
  return 0;
};

function Welcome_create_windows(): number {
  const form_border = 0;
  let form_width = G.top_width - 2 * form_border;
  let form_height = G.top_height - 2 * form_border;
  const button_border = 4;
  const button_height = G.buttonFont.ascent + G.buttonFont.descent + 2 * button_border;
  const my_buttons: [string, Callback][] = [['Local', Localnet_cb], ['Internet', Internet_cb], ['Quit', Quit_cb]];
  form_width = LIMIT(form_width, 400, 1600);
  form_height = LIMIT(form_height, 400, 1400);
  W.form_widget = Widget_create_form(0, G.topWindow, 0, 0, form_width, form_height, form_border);
  if (W.form_widget === NO_WIDGET) return -1;
  Widget_set_background(W.form_widget, BLACK);
  let max_width = 0;
  for (const [t] of my_buttons) max_width = MAX(max_width, X.XTextWidth(G.buttonFont, t, t.length));
  max_width += 20;
  const n = my_buttons.length;
  const height_available = LIMIT(form_height, n * button_height, n * (button_height + 40));
  const height_per_button = Math.trunc(height_available / n);
  let button_y = height_per_button - button_height;
  const button_x = 20;
  for (const [t, cb] of my_buttons) {
    if (Widget_create_activate(W.form_widget, button_x, button_y, max_width, button_height + 20, 1, t, cb, null) === NO_WIDGET) return -1;
    button_y += height_per_button;
  }
  const subform_x = 2 * button_x + max_width;
  const subform_y = button_x;
  const subform_border = 1;
  W.subform_width = form_width - subform_x - subform_y - 2 * subform_border;
  W.subform_height = form_height - 2 * subform_y - 2 * subform_border - button_height;
  W.subform_widget = Widget_create_form(W.form_widget, 0, subform_x, subform_y, W.subform_width, W.subform_height, subform_border);
  if (W.subform_widget === NO_WIDGET) return -1;
  Widget_set_background(W.subform_widget, BLACK);
  Widget_map_sub(W.form_widget);
  X.XMapSubwindows(G.dpy, G.topWindow);
  return 0;
}

function Welcome_destroy_windows(): void {
  Widget_destroy(W.form_widget);
  X.XFlush(G.dpy);
  W.form_widget = NO_WIDGET;
  W.subform_widget = NO_WIDGET;
  W.next_page_widget = NO_WIDGET;
  W.first_page_widget = NO_WIDGET;
  W.ping_servers_widget = NO_WIDGET;
  W.create_room_widget = NO_WIDGET;
}

function Welcome_cleanup(): void {
  Welcome_destroy_windows();
  W.server_list = null;
}

function Welcome_set_mode(new_mode: number): void {
  const old_mode = W.welcome_mode;
  Widget_destroy_children(W.subform_widget);
  if (old_mode === ModeInternet && new_mode !== old_mode) W.server_list = null;
  W.welcome_mode = new_mode;
}

async function Welcome_process_one_event(event: XEvent): Promise<number> {
  switch (event.type) {
    case X.ClientMessage:
      if (G.KillAtom !== 0 && event.message === G.KillAtom) {
        X.XDestroyWindow(G.dpy, G.topWindow);
        X.XSync(G.dpy, true);
        xpprintf('Quit\n');
        return -1;
      }
      break;
    case X.MapNotify:
      if (G.ignoreWindowManager) X.XSetInputFocus(G.dpy, G.topWindow, X.RevertToParent, X.CurrentTime);
      break;
    case X.FocusIn:
      G.gotFocus = true;
      break;
    case X.FocusOut:
    case X.UnmapNotify:
      G.gotFocus = false;
      break;
    case X.MappingNotify:
      break;
    case X.ConfigureNotify:
      if (event.window === G.topWindow) {
        if (G.top_width === event.width && G.top_height === event.height) return 0;
        G.top_width = LIMIT(event.width, MIN_TOP_WIDTH, MAX_TOP_WIDTH);
        G.top_height = LIMIT(event.height, MIN_TOP_HEIGHT, MAX_TOP_HEIGHT);
        switch (W.welcome_mode) {
          case ModeInternet:
          case ModeStatus:
            Welcome_destroy_windows();
            if (Welcome_create_windows() === -1) return -1;
            Welcome_set_mode(ModeInternet);
            W.server_it = 0;
            Welcome_show_server_list();
            break;
          case ModeLocalnet:
            Welcome_destroy_windows();
            W.server_list = null;
            if (Welcome_create_windows() === -1) return -1;
            Welcome_set_mode(ModeLocalnet);
            break;
          case ModeWaiting:
            Welcome_destroy_windows();
            if (Welcome_create_windows() === -1) return -1;
            Welcome_set_mode(ModeWaiting);
            break;
          case ModeServer:
            Welcome_destroy_windows();
            if (Welcome_create_windows() === -1) return -1;
            Show_room_page();
            break;
          default:
            break;
        }
      } else await Widget_event(event);
      break;
    default:
      await Widget_event(event);
      break;
  }
  if (G.quitting) {
    G.quitting = false;
    return -1;
  }
  if (W.joining) return 1;
  return 0;
}

async function Welcome_process_pending_events(): Promise<number> {
  while (X.XEventsQueued(G.dpy, 2) > 0) {
    const event = X.XNextEvent(G.dpy);
    if (!event) break;
    const result = await Welcome_process_one_event(event);
    if (result) return result;
  }
  return 0;
}

async function Welcome_input_loop(): Promise<number> {
  Welcome_set_mode(ModeWaiting);
  await Welcome_create_label(1, 'Welcome to XPilot NG!');
  while (!G.quitting && !W.joining) {
    const event = await nextEvent();
    const result = await Welcome_process_one_event(event);
    if (result) return result;
  }
  return -1;
}

async function Welcome_doit(): Promise<number> {
  if (Init_top() === -1) return -1;
  X.XMapSubwindows(G.dpy, G.topWindow);
  X.XMapWindow(G.dpy, G.topWindow);
  X.XSync(G.dpy, false);
  let result = await Welcome_process_pending_events();
  if (result) return result;
  if (Welcome_create_windows() === -1) return -1;
  result = await Welcome_process_pending_events();
  if (result) return result;
  return Welcome_input_loop();
}

/** 1 when a room was entered, -1 for quit */
export async function Welcome_screen(): Promise<number> {
  const result = await Welcome_doit();
  if (!G.quitting && W.joining) Welcome_cleanup();
  else Platform_specific_cleanup();
  return result;
}
