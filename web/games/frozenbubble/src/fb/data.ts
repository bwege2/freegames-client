// fb_stuff.pm: the screen positions of every player's field and its parts, and the constants.

export interface XY { x: number; y: number }
export interface PlayerPos {
  left_limit: number; right_limit: number; top_limit: number; initial_bubble_y: number;
  canon: XY; simpleshooter: XY & { diameter: number }; pinguin: XY; next_bubble: XY; on_top_next_relpos: XY;
  hurry: XY; scores: XY; progress: XY;
  malus?: XY; chatting?: XY; left?: XY; attackme?: XY; attack?: XY;
}
export type Player = 'p1' | 'p2' | 'rp1' | 'rp2' | 'rp3' | 'rp4';
export interface PosTable {
  p1?: PlayerPos; p2?: PlayerPos; rp1?: PlayerPos; rp2?: PlayerPos; rp3?: PlayerPos; rp4?: PlayerPos;
  centerpanel: XY;
  pause_clip?: XY;
  compressor_xpos?: number;
  bottom_limit?: number;
}

const xy = (x: number, y: number): XY => ({ x, y });

export const POS_1P: PosTable = {
  p1: {
    left_limit: 190, right_limit: 446, top_limit: 44, initial_bubble_y: 390,
    canon: xy(268, 356), simpleshooter: { x: 317, y: 405, diameter: 60 }, pinguin: xy(214, 420),
    next_bubble: xy(112, 440), on_top_next_relpos: xy(-3, -3), hurry: xy(10, 265), scores: xy(74, 103),
    progress: xy(447, 28),
  },
  centerpanel: xy(149, 190),
  pause_clip: xy(263, 212),
  compressor_xpos: 318,
};

const P2_P2: PlayerPos = {
  left_limit: 30, right_limit: 286, top_limit: 40, initial_bubble_y: 390,
  canon: xy(108, 356), simpleshooter: { x: 157, y: 405, diameter: 60 }, pinguin: xy(-35, 420),
  next_bubble: xy(112, 440), on_top_next_relpos: xy(-4, -3), hurry: xy(10, 265), malus: xy(308, 402),
  scores: xy(160, 11), chatting: xy(70, 465), left: xy(30, 40), progress: xy(287, 28),
};

export const POS_2P: PosTable = {
  p2: P2_P2,
  p1: {
    left_limit: 354, right_limit: 610, top_limit: 40, initial_bubble_y: 390,
    canon: xy(432, 356), simpleshooter: { x: 481, y: 405, diameter: 60 }, pinguin: xy(210, 420),
    next_bubble: xy(112, 440), on_top_next_relpos: xy(-4, -3), hurry: xy(10, 265), malus: xy(331, 402),
    scores: xy(480, 11), chatting: xy(390, 442), progress: xy(345, 28),
  },
  // in net/lan 2p mode, use bigger graphics and positions
  rp1: P2_P2,
  centerpanel: xy(153, 190),
};

export const POS_MP: PosTable = {
  p1: {
    left_limit: 190, right_limit: 446, top_limit: 44, initial_bubble_y: 390,
    canon: xy(268, 356), simpleshooter: { x: 317, y: 405, diameter: 60 }, pinguin: xy(213, 420),
    next_bubble: xy(112, 440), on_top_next_relpos: xy(-4, -3), hurry: xy(10, 265), malus: xy(169, 464),
    scores: xy(320, 12), chatting: xy(215, 442), attackme: xy(185, 448), progress: xy(447, 28),
  },
  rp1: {
    left_limit: 20, right_limit: 148, top_limit: 19, initial_bubble_y: 192,
    canon: xy(59, 175), simpleshooter: { x: 83, y: 197, diameter: 30 }, pinguin: xy(94, 211),
    next_bubble: xy(56, 216), on_top_next_relpos: xy(-2, -2), hurry: xy(5, 128), malus: xy(12, 183),
    scores: xy(83, 2), chatting: xy(5, 230), left: xy(19, 17), attack: xy(25, 213), progress: xy(149, 28),
  },
  rp2: {
    left_limit: 492, right_limit: 620, top_limit: 19, initial_bubble_y: 192,
    canon: xy(531, 175), simpleshooter: { x: 555, y: 197, diameter: 30 }, pinguin: xy(94, 211),
    next_bubble: xy(56, 216), on_top_next_relpos: xy(-2, -2), hurry: xy(5, 128), malus: xy(628, 183),
    scores: xy(553, 2), chatting: xy(460, 230), left: xy(491, 17), attack: xy(496, 214), progress: xy(483, 28),
  },
  rp3: {
    left_limit: 20, right_limit: 148, top_limit: 247, initial_bubble_y: 420,
    canon: xy(59, 404), simpleshooter: { x: 83, y: 427, diameter: 30 }, pinguin: xy(94, 439),
    next_bubble: xy(56, 445), on_top_next_relpos: xy(-2, -2), hurry: xy(5, 345), malus: xy(12, 411),
    scores: xy(83, 465), chatting: xy(5, 460), left: xy(19, 245), attack: xy(24, 442), progress: xy(149, 258),
  },
  rp4: {
    left_limit: 492, right_limit: 620, top_limit: 247, initial_bubble_y: 420,
    canon: xy(531, 404), simpleshooter: { x: 555, y: 427, diameter: 30 }, pinguin: xy(94, 439),
    next_bubble: xy(56, 445), on_top_next_relpos: xy(-2, -2), hurry: xy(5, 345), malus: xy(628, 411),
    scores: xy(553, 465), chatting: xy(460, 460), left: xy(491, 245), attack: xy(496, 442), progress: xy(483, 258),
  },
  centerpanel: xy(149, 190),
};

export const BUBBLE_SIZE0 = 32;
export const ROW_SIZE0 = BUBBLE_SIZE0 * 7 / 8;
export const PI = 3.1415926535897932384626433832795028841972;

export const TARGET_ANIM_SPEED = 20;
export const LAUNCHER_SPEED = 0.03;
export const BUBBLE_SPEED0 = 10;
export const MALUS_BUBBLE_SPEED = 30;
export const CANON_ROTATIONS_NB = 100;
export const TIMEOUT_PINGUIN_SLEEP = 200;
export const FREE_FALL_CONSTANT0 = 0.5;

export const ALL_PLAYERS: Player[] = ['p1', 'p2', 'rp1', 'rp2', 'rp3', 'rp4'];
