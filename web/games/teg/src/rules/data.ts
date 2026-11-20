// The game's data, translated from TEG 0.13.0: common/country.cpp, common/cont.cpp,
// common/missions.cpp, common/limitrof.h and common/common.cpp (colors). Country ids, continent
// order, card kinds, continent sizes and bonuses and the adjacency matrix are the original's.

export const COUNTRY_COUNT = 50;
export const CONTINENT_COUNT = 6;
/** maximum_player_count in common/common.h */
export const MAX_PLAYERS = 6;
/** maximum_country_cards */
export const MAX_CARDS = 5;

export type CardKind = 'galleon' | 'cannon' | 'balloon' | 'joker';
/** CardKind::TARJ_GALEON = 1, TARJ_CANION = 4, TARJ_GLOBO = 8, TARJ_COMODIN = 16 */
export const CARD_VALUE: Record<CardKind, number> = { galleon: 1, cannon: 4, balloon: 8, joker: 16 };

export interface ContinentDef {
  id: number;
  name: string;
  countries: number;
  /** fichas_x_cont: additional armies for a complete continent */
  bonus: number;
}

/** g_conts[] in common/cont.cpp, in CONTINENTE order */
export const CONTINENTS: ContinentDef[] = [
  { id: 0, name: 'South America', countries: 6, bonus: 3 },
  { id: 1, name: 'North America', countries: 10, bonus: 5 },
  { id: 2, name: 'Africa', countries: 6, bonus: 3 },
  { id: 3, name: 'Oceania', countries: 4, bonus: 2 },
  { id: 4, name: 'Europe', countries: 9, bonus: 5 },
  { id: 5, name: 'Asia', countries: 15, bonus: 7 },
];

export interface CountryDef {
  id: number;
  name: string;
  continent: number;
  card: CardKind;
  /** countries_eslimitrofe() as a symmetric list (common/limitrof.h) */
  adj: number[];
}

/** g_countries[] in common/country.cpp, in id order */
export const COUNTRIES: CountryDef[] = [
  { id: 0, name: 'Argentina', continent: 0, card: 'joker', adj: [1, 2, 4, 5] },
  { id: 1, name: 'Brazil', continent: 0, card: 'galleon', adj: [0, 3, 4, 5, 16] },
  { id: 2, name: 'Chile', continent: 0, card: 'balloon', adj: [0, 4, 22] },
  { id: 3, name: 'Colombia', continent: 0, card: 'balloon', adj: [1, 4, 6] },
  { id: 4, name: 'Peru', continent: 0, card: 'galleon', adj: [0, 1, 2, 3] },
  { id: 5, name: 'Uruguay', continent: 0, card: 'balloon', adj: [0, 1] },
  { id: 6, name: 'Mexico', continent: 1, card: 'cannon', adj: [3, 7] },
  { id: 7, name: 'California', continent: 1, card: 'cannon', adj: [6, 8, 9] },
  { id: 8, name: 'Oregon', continent: 1, card: 'cannon', adj: [7, 9, 10, 11, 12] },
  { id: 9, name: 'New York', continent: 1, card: 'galleon', adj: [7, 8, 12, 13, 15] },
  { id: 10, name: 'Alaska', continent: 1, card: 'galleon', adj: [8, 11, 48] },
  { id: 11, name: 'Yukon', continent: 1, card: 'balloon', adj: [8, 10, 12] },
  { id: 12, name: 'Canada', continent: 1, card: 'cannon', adj: [8, 9, 11, 13] },
  { id: 13, name: 'Terranova', continent: 1, card: 'cannon', adj: [9, 12, 14] },
  { id: 14, name: 'Labrador', continent: 1, card: 'cannon', adj: [13, 15] },
  { id: 15, name: 'Greenland', continent: 1, card: 'galleon', adj: [9, 14, 34] },
  { id: 16, name: 'Sahara', continent: 2, card: 'cannon', adj: [1, 17, 18, 19, 26] },
  { id: 17, name: 'Zaire', continent: 2, card: 'galleon', adj: [16, 18, 20, 21] },
  { id: 18, name: 'Etiopia', continent: 2, card: 'balloon', adj: [16, 17, 19, 21] },
  { id: 19, name: 'Egypt', continent: 2, card: 'balloon', adj: [16, 18, 20, 30, 36, 37] },
  { id: 20, name: 'Madagascar', continent: 2, card: 'galleon', adj: [17, 19] },
  { id: 21, name: 'South Africa', continent: 2, card: 'cannon', adj: [17, 18] },
  { id: 22, name: 'Australia', continent: 3, card: 'cannon', adj: [2, 23, 24, 25] },
  { id: 23, name: 'Borneo', continent: 3, card: 'galleon', adj: [22, 39] },
  { id: 24, name: 'Java', continent: 3, card: 'cannon', adj: [22] },
  { id: 25, name: 'Sumatra', continent: 3, card: 'balloon', adj: [22, 38] },
  { id: 26, name: 'Spain', continent: 4, card: 'balloon', adj: [16, 27, 33] },
  { id: 27, name: 'France', continent: 4, card: 'balloon', adj: [26, 28, 29] },
  { id: 28, name: 'Germany', continent: 4, card: 'galleon', adj: [27, 29, 30, 33] },
  { id: 29, name: 'Italy', continent: 4, card: 'balloon', adj: [27, 28] },
  { id: 30, name: 'Poland', continent: 4, card: 'cannon', adj: [19, 28, 31, 37] },
  { id: 31, name: 'Russia', continent: 4, card: 'balloon', adj: [30, 32, 37, 40, 45] },
  { id: 32, name: 'Sweden', continent: 4, card: 'galleon', adj: [31, 34] },
  { id: 33, name: 'Great Britain', continent: 4, card: 'galleon', adj: [26, 28, 34] },
  { id: 34, name: 'Iceland', continent: 4, card: 'galleon', adj: [15, 32, 33] },
  { id: 35, name: 'Arabia', continent: 5, card: 'cannon', adj: [36, 37] },
  { id: 36, name: 'Israel', continent: 5, card: 'galleon', adj: [19, 35, 37] },
  { id: 37, name: 'Turkey', continent: 5, card: 'galleon', adj: [19, 30, 31, 35, 36, 40] },
  { id: 38, name: 'India', continent: 5, card: 'balloon', adj: [25, 39, 40, 42] },
  { id: 39, name: 'Malaysia', continent: 5, card: 'cannon', adj: [23, 38, 42] },
  { id: 40, name: 'Iran', continent: 5, card: 'balloon', adj: [31, 37, 38, 41, 42, 43, 45] },
  { id: 41, name: 'Gobi', continent: 5, card: 'balloon', adj: [40, 42, 43] },
  { id: 42, name: 'China', continent: 5, card: 'galleon', adj: [38, 39, 40, 41, 43, 44, 48, 49] },
  { id: 43, name: 'Mongolia', continent: 5, card: 'galleon', adj: [40, 41, 42, 44, 45] },
  { id: 44, name: 'Siberia', continent: 5, card: 'galleon', adj: [42, 43, 45, 46, 47, 48] },
  { id: 45, name: 'Aral', continent: 5, card: 'cannon', adj: [31, 40, 43, 44, 46] },
  { id: 46, name: 'Tartary', continent: 5, card: 'cannon', adj: [44, 45, 47] },
  { id: 47, name: 'Taymir', continent: 5, card: 'joker', adj: [44, 46] },
  { id: 48, name: 'Katchatka', continent: 5, card: 'balloon', adj: [10, 42, 44, 49] },
  { id: 49, name: 'Japan', continent: 5, card: 'cannon', adj: [42, 48] },
];

export interface MissionDef {
  /** the original's gettext name; &0..&5 are replaced by the continent names */
  name: string;
  /** countries needed in each continent */
  continents: number[];
  /** optionally, countries on the border of another continent (only the disabled mission uses it) */
  frontier: number;
  /** an alternative number of countries anywhere (the common mission) */
  total: number;
}

/** g_missions[] in common/missions.cpp, built without WITH_ALL_MISSIONS */
export const MISSIONS: MissionDef[] = [
  {
    name: 'Conquer the world',
    continents: [6, 10, 6, 4, 9, 15], frontier: 0, total: 0,
  },
  {
    name: 'Conquer 30 countries',
    continents: [0, 0, 0, 0, 0, 0], frontier: 0, total: 30,
  },
  {
    name: 'Conquer &2,\n5 countries of &1 and\n4 countries of &4',
    continents: [0, 5, 6, 0, 4, 0], frontier: 0, total: 0,
  },
  {
    name: 'Conquer &5 and\n2 countries of &0',
    continents: [2, 0, 0, 0, 0, 15], frontier: 0, total: 0,
  },
  {
    name: 'Conquer &4,\n4 countries of &5 and,\n2 of &0',
    continents: [2, 0, 0, 0, 9, 4], frontier: 0, total: 0,
  },
  {
    name: 'Conquer &1,\n2 countries of &3 and\n4 countries of &5',
    continents: [0, 10, 0, 2, 0, 4], frontier: 0, total: 0,
  },
  {
    name: 'Conquer 2 countries of &3,\n2 of &2, 2 of &0,\n3 of &4, 4 of &1,\nand 3 of &5',
    continents: [2, 4, 2, 2, 3, 3], frontier: 0, total: 0,
  },
  {
    name: 'Conquer &3,\nconquer &1 and,\n2 countries of &4',
    continents: [0, 10, 0, 4, 2, 0], frontier: 0, total: 0,
  },
  {
    name: 'Conquer &0,\nconquer &2 and,\n4 countries of &5',
    continents: [6, 0, 6, 0, 0, 4], frontier: 0, total: 0,
  },
  {
    name: 'Conquer &3,\nconquer &2 and,\n5 countries of &1',
    continents: [0, 5, 6, 4, 0, 0], frontier: 0, total: 0,
  },
];

/** MISSION_CONQWORLD / MISSION_COMMON */
export const MISSION_CONQWORLD = 0;
export const MISSION_COMMON = 1;

/** missions_get_name() with the placeholders replaced */
export function missionName(index: number): string {
  const m = MISSIONS[index];
  if (!m) return 'Unknown';
  return m.name.replace(/&([0-5])/g, (_, n: string) => CONTINENTS[Number(n)].name);
}

export interface PlayerColor {
  id: number;
  name: string;
  /** the army circle's fill (G_colores[].ellip_color) */
  fill: string;
  /** the number's colour (G_colores[].text_color) */
  text: string;
}

export const PLAYER_COLORS: PlayerColor[] = [
  { id: 0, name: 'red', fill: '#ff0000', text: '#ffffff' },
  { id: 1, name: 'yellow', fill: '#ffff00', text: '#000000' },
  { id: 2, name: 'blue', fill: '#0000ff', text: '#ffffff' },
  { id: 3, name: 'black', fill: '#454545', text: '#ffffff' },
  { id: 4, name: 'pink', fill: '#ff82ab', text: '#000000' },
  { id: 5, name: 'green', fill: '#00ff00', text: '#000000' },
];
export const NO_COLOR = { name: 'grey', fill: '#bebebe', text: '#000000' };

export function colorOf(color: number): PlayerColor {
  return PLAYER_COLORS[color] ?? NO_COLOR;
}

/** the robot's own names, robot/ai_msg.cpp names[] */
export const ROBOT_NAMES = [
  'Coca Sarli', 'Ciccolina', 'Raton Perez', 'Geniol', 'Fantoche', 'Jirafa', 'Guaymayen',
  'Mono Mario', 'Havanna', 'Shakira', 'Thalia', 'Spice Girls', 'Britney Spears', 'Cameron Diaz',
  'Betty la fea', 'Pitufina', 'Topacio', 'Batman', 'Gatubela', 'La cuca', 'Bush', 'Lewinsky',
  'Clinton', 'Chupete', 'Gaturro', 'Mr.President', 'Batistuta', 'Perla', 'Maradona', 'Pele',
  'Comanche', 'Tehuelche', 'Pampita', 'Pampa', 'Pamela',
];

/** the robot's chat lines, robot/ai_msg.cpp (used for the AI's occasional table talk) */
export const ROBOT_MISC = [
  '%s, Do you have a sister ?', 'I love this game', '%s, I cant believe it!',
  "%s, Do you have Lewinsky's phone ?", 'Does anyone speak Speranto ?', '%s, You play very well',
  'Thanks', 'mmm...', '%s, Are you a robot ?', 'Geronimoooooo', "I'm a bit tired", "I'm hungry",
  'Who wants an Empanada ?', 'I like whistling', 'What is a good strategy to win this game?',
  '%s, Were you here last night ?', 'nod', 'What?', ':-)', '%s, Do you think so?',
  '%s, What can I say ?', "%s, Do you think I'm ugly ?", "%s, Do you think I'm pretty ?",
  '%s, Are you pretty ?', '%s, Where do you live ?', '%s, miauuuuuuuuu',
  'Empanadas sin dientes, para las viejas sin dientes', 'Se me escapo la tortuga',
  '%s parla tedesco', 'Alguien ha visto a mi gata?',
];
