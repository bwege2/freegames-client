// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/messages/Languages.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
/*
 * Pixel Dungeon
 * Copyright (C) 2012-2015 Oleg Dolya
 *
 * Shattered Pixel Dungeon
 * Copyright (C) 2014-2026 Evan Debenham
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 */
import { $J, JEnum, JString } from '../../../../../jre/index.ts';

export class Languages extends JEnum {
  name_: string = null;
  code_: string = null;
  status_: Languages$Status = null;
  reviewers_: string[] = null;
  translators_: string[] = null;
  static ENGLISH: Languages = null;
  static CHI_SMPL: Languages = null;
  static KOREAN: Languages = null;
  static RUSSIAN: Languages = null;
  static SPANISH: Languages = null;
  static PORTUGUESE: Languages = null;
  static FRENCH: Languages = null;
  static GERMAN: Languages = null;
  static CHI_TRAD: Languages = null;
  static JAPANESE: Languages = null;
  static POLISH: Languages = null;
  static ITALIAN: Languages = null;
  static TURKISH: Languages = null;
  static VIETNAMESE: Languages = null;
  static UKRANIAN: Languages = null;
  static INDONESIAN: Languages = null;
  static CZECH: Languages = null;
  static DUTCH: Languages = null;
  static SWEDISH: Languages = null;
  static HUNGARIAN: Languages = null;
  static GREEK: Languages = null;
  static BELARUSIAN: Languages = null;
  static ESPERANTO: Languages = null;
  static $VALUES: Languages[] = null;
  _Languages($name: string, $ordinal: number, name: string, code: string, status: Languages$Status, reviewers: string[], translators: string[]): this {
    this._JEnum($name, $ordinal);
    this.name_ = name;
    this.code_ = code;
    this.status_ = status;
    this.reviewers_ = reviewers;
    this.translators_ = translators;
    return this;
  }
  nativeName(): string {
    return this.name_;
  }
  code(): string {
    return this.code_;
  }
  status(): Languages$Status {
    return this.status_;
  }
  reviewers(): string[] {
    if (this.reviewers_ == null) {
      return [];
    } else {
      return this.reviewers_.slice();
    }
  }
  translators(): string[] {
    if (this.translators_ == null) {
      return [];
    } else {
      return this.translators_.slice();
    }
  }
  static matchLocale(locale: Locale): Languages {
    if ($J.equals(locale.getLanguage(), 'zh') && locale.toString().includes('Hant')) {
      return Languages.CHI_TRAD;
    }
    return Languages.matchCode(locale.getLanguage());
  }
  static matchCode(code: string): Languages {
    for (let lang of Languages.values()) {
      if ($J.equals(lang.code(), code)) {
        return lang;
      }
    }
    return Languages.ENGLISH;
  }
  static values(): Languages[] { return Languages.$VALUES.slice(); }
  static valueOf(name: string): Languages { return $J.enumValueOf(Languages, name); }
  static $clinit() {
    Languages.ENGLISH = new Languages()._Languages('ENGLISH', 0, 'english', 'en', Languages$Status.O_COMPLETE, null, null);
    Languages.CHI_SMPL = new Languages()._Languages('CHI_SMPL', 1, '简体中文', 'zh', Languages$Status.O_COMPLETE, ['Chronie_Lynn_Iwa', 'Jinkeloid(zdx00793)', 'endlesssolitude'], ['931451545', 'Budding', 'DM_216', 'Fatir', 'Fishbone', 'Hcat', 'HoofBumpBlurryface', 'Horr_lski', 'Lery', 'Lyn_0401', 'Lyx0527', 'Ooooscar', 'RainSlide', 'ShatteredFlameBlast', 'SpaceAnchor', 'SunsetGlowTheDOGE', 'Teller', 'hmdzl001', 'leo', 'tempest102', 'tequilasunset', '户方狸奴']);
    Languages.KOREAN = new Languages()._Languages('KOREAN', 2, '한국어', 'ko', Languages$Status.O_COMPLETE, ['Cocoa', 'Flameblast12', 'GameConqueror', 'Korean2017'], ['AFS', 'N8fall', 'WondarRabb1t', 'benepaper', 'chlrhwnstkd', 'ddojin0115', 'eeeei', 'enjuxx', 'hancyel', 'linterpreteur', 'lemonam', 'lsiebnie', 'sora0430']);
    Languages.RUSSIAN = new Languages()._Languages('RUSSIAN', 3, 'русский', 'ru', Languages$Status.__UNREVIEW, ['AprilRain(Vadzim Navumaû)', 'ConsideredHamster', 'Dominowood371', 'Inevielle', 'apxwn', 'yarikonline'], ['5r', 'Alternative15', 'AngryPotato', 'AttHawk46', 'BlueberryShortcake', 'CatGirlSasha', 'Enwviun', 'HerrGotlieb', 'HoloTheWise', 'Ilbko', 'JleHuBbluKoT', 'KirStaLong', 'MrXantar', 'Nikets', 'OneDuo', 'Originalej0name', 'Provitia', 'Raymundo', 'Roycce', 'Shamahan', 'Thomasg63', 'XAutumn', 'Ya6lo4ko', 'chelikchelik', 'dasfan123', 'ifritdiezel', 'katyp2005', 'kirusyaga', 'kptmx', 'leondorus', 'long_live_the_9', 'pancreper1', 'perefrazz', 'ponfertato', 'roman.yagodin', 'tibby', 'un_logic', 'vivatimperia', 'wntrau', 'xenrun', 'Вoвa']);
    Languages.SPANISH = new Languages()._Languages('SPANISH', 4, 'español', 'es', Languages$Status.__UNREVIEW, ['KeyKai', 'Kiroto', 'Kohru', 'airman12', 'grayscales'], ['2001sergiobr', 'AdventurerKilly', 'Alesxanderk', 'Bryan092', 'CorvosUtopy', 'D0n.Kak0', 'Dewstend', 'Dyrran', 'Enddox', 'Fervoreking', 'Illyatwo2', 'Fuwn', 'JPCHZ', 'LastCry', 'Marquezo_577_284', 'NAVI1237', 'No_se145', 'STKmonoqui', 'Sh4rkill3r', 'Uri2523', 'alfongad', 'alquimistamyl', 'anauta', 'benzarr410', 'chepe567.jc', 'ctrijueque', 'damc0616', 'desen90', 'dhg121', 'javifs', 'jonismack1', 'magmax', 'rechebeltran', 'saadhabibi077', 'tres.14159']);
    Languages.PORTUGUESE = new Languages()._Languages('PORTUGUESE', 5, 'português', 'pt', Languages$Status.O_COMPLETE, ['NicholasPainek', 'TDF2001', 'matheus208'], ['14NGiestas', 'Aetheryll', 'Andrew_px1', 'Arthur_Mastriaga', 'Bigode935', 'Bionic64', 'Chacal.Ex', 'ChainedFreaK', 'DAVICCOSTA', 'DRACOnicus', 'Derik', 'DredgenVale', 'ElefanteFome', 'Helen0903', 'JST', 'Kotaroo05', 'MadHorus', 'Maria_João', 'MarkusCoisa', 'Matie', 'Ninguem.EXE', 'OtávioMoraes', 'PingasOwner', 'Piraldo', 'Sr.BaconDelicioso', 'Tete_Teli', 'Tio_P_(Krampus)', 'Zukkine', 'ancientorange', 'danypr23', 'denis.gnl', 'efverick', 'gBiazon', 'ismael.henriques12', 'juniorsilve33', 'mfcord', 'nattlegal', 'owenreilly', 'phobos445', 'rafazago', 'renan408', 'try31']);
    Languages.FRENCH = new Languages()._Languages('FRENCH', 6, 'français', 'fr', Languages$Status.O_COMPLETE, ['Emether', 'TheKappaDuWeb', 'Weende_Bellet', 'Xalofar', 'canc42', 'kultissim', 'minikrob', 'Lucasgstar'], ['3raven', 'Alsydis', 'Anonyme48', 'Axce', 'Az_zahr', 'Bastien72', 'Basttee', 'Coco_EC', 'Dekadisk', 'Draal', 'Eragem', 'Karnot', 'L.E.V.', 'Lama', 'Le_Valla', 'Leandre', 'Louson', 'Martin.Bellet', 'Neopolitan', 'NoGi', 'Nyrnx', 'Opidox', 'Pandaman516', 'Petit_Chat', 'RomTheMareep', 'RunningColours', 'STPayoube', 'Soeiz', 'SpeagleZNT', 'Teddywestside', 'Tronche2Cake', 'VRad', 'Ygdrazil', '_nim_', 'adamch', 'adeb', 'antoine9298', 'clexanis', 'eloiseflo', 'fricht', 'gdavid2', 'go11um', 'hydrasho', 'jan.', 'jazzzz', 'levilbatard', 'linterpreteur', 'luffah', 'maeltur70', 'marmous', 'mcbaba29000', 'mluzarreta', 'panopano', 'solthaar', 'speagle', 'tkf_', 'typhr80', 'vavavoum', 'whereisfelix', 'willi3725', 'zM_']);
    Languages.GERMAN = new Languages()._Languages('GERMAN', 7, 'deutsch', 'de', Languages$Status.X_UNFINISH, ['Dallukas', 'KrystalCroft', 'Wuzzy', 'Zap0', 'apxwn', 'bernhardreiter', 'davedude'], ['2711chrissi', 'Abracadabra', 'Anaklysmos', 'Ceeee', 'DarkPixel', 'David.transifex', 'EmilKevinManuel', 'ErichME', 'Faquarl', 'JorahEtLabora', 'LenzB', 'MacMoff', 'Micksha', 'Niseko', 'Ordoviz', 'Sarius', 'Shtynow', 'SirEddi', 'Sorpl3x', 'SurmanPP', 'SwissQ', 'ThunfischGott', 'Timo_S', 'Topicranger', 'azrdev', 'carrageen', 'dome.scheidler', 'galactictrans', 'gekko303', 'jeinzi', 'johannes.schobel', 'karoshi42', 'koryphea', 'luciocarreras', 'lukasghesse', 'mklr', 'niemand', 'oragothen', 'razzifazzi0', 'spixi', 'tanjay', 'unbekannterTyp', 'wunst']);
    Languages.CHI_TRAD = new Languages()._Languages('CHI_TRAD', 8, '繁體中文', 'zh-hant', Languages$Status.__UNREVIEW, ['JZR', 'Yichm', 'p2635'], ['DT227', 'Fishbone', 'Ken4Ro', 'Lstron', 'Relrin167', 'Sotis425', 'Zoe096423', 'arnolam', 'jackymaxj', 'redbrow', 'shiba', '唐延諭']);
    Languages.JAPANESE = new Languages()._Languages('JAPANESE', 9, '日本語', 'ja', Languages$Status.O_COMPLETE, ['daingewuvzeevisiddfddd', 'oz51199'], ['Gosamaru', 'NickZhrbin', 'Otogiri', 'Siraore_Rou', 'amama', 'grassedge', 'kiyofumimanabe', 'librada', 'mocklike', 'tomofumikitano']);
    Languages.POLISH = new Languages()._Languages('POLISH', 10, 'polski', 'pl', Languages$Status.X_UNFINISH, ['Daniel Witański', 'Deksippos', 'MrKukurykpl', 'chronon', 'kuadziw', 'szymex73'], ['Akmetari', 'AntiTime', 'Boguc', 'Chasseur', 'Ciechu', 'Darden', 'DarkKnightComes', 'DogeseleQ', 'GRan0000', 'Hammil', 'I256I', 'KarixDaii', 'KrnąbrnyOlaf', 'Lufix', 'MJedi', 'MrCommander', 'Odiihinia', 'Ostsee0912', 'Peperos', 'RolsoN', 'Scharnvirk', 'Serpens13', 'Tangens', 'VasteelXolotl', 'Voyteq', 'Wiiiiiii', 'bobas10', 'bogumilg', 'bvader95', 'dusakus', 'elchudy', 'jajkoswinka', 'michaub', 'mikolka9144', 'ozziezombie', 'szczoteczka22', 'taki1', 'transportowiec96']);
    Languages.ITALIAN = new Languages()._Languages('ITALIAN', 11, 'italiano', 'it', Languages$Status.O_COMPLETE, ['MottledElm', 'NeoAugustus', 'bizzolino', 'funnydwarf', 'inkubo87'], ['4est', 'Danelix', 'DaniMare', 'Danzl', 'Dj1234', 'Eriliken', 'Esse78', 'Guiller124', 'Hydr46605', 'IoannesMaria', 'LN_90', 'Mat323', 'Mister64', 'Noostale', 'PicchiSeba', 'Tugamer89', 'Tysal', 'andrea049ita', 'andreafaffo', 'andrearubbino00', 'angelica.caruso', 'cantarini', 'carinellialessandro31', 'dmytro.tokayev', 'lorenzofrosi05', 'mamon68596', 'mattiuw', 'max1234ita', 'maxifire32', 'nessunluogo', 'righi.a', 'umby000', 'unknown888', 'valerio.bozzolan']);
    Languages.TURKISH = new Languages()._Languages('TURKISH', 12, 'türkçe', 'tr', Languages$Status.__UNREVIEW, ['LokiofMillenium', 'Mustafa.10', 'T3kin5iZ', 'emrebnk', 'gorkem_yılmaz'], ['AGORAAA', 'AchernarPrime', 'AcuriousPotato', 'BurningDaylight', 'ErenayDev', 'Helgon', 'Koga', 'Mehmet_Emin_21', 'MuratEfeYilmaz', 'OzanAlkan', 'TR_Muhittin', 'Talha_0_0', 'TheMBDsvs', 'Yllcare', 'YORGANSIZMTAV', 'ahmetbakicakir', 'akkaya.mustafa', 'alikeremozfidan', 'alpekin98', 'barankrky', 'denizakalin', 'eraysall402', 'erdemozdemir98', 'hasantahsin160', 'immortalsamuraicn', 'kayikyaki', 'kempilbey', 'melezorus34', 'mitux', 'mustafadoslu', 'ryuga', 'superDpermn', 'utkanozer13', 'yasirckr85', 'yukete']);
    Languages.VIETNAMESE = new Languages()._Languages('VIETNAMESE', 13, 'tiếng việt', 'vi', Languages$Status.O_COMPLETE, ['Chuseko', 'The_Hood', 'nguyenanhkhoapythus'], ['BlueSheepAlgodoo', 'Phuc2401', 'SpaceMetropolis', 'Teh_boi', 'Threyja', 'Toluu', 'bruhwut', 'buicongminh_t63', 'deadlevel13', 'duongfg250', 'h4ndy_c4ndy', 'hniV', 'khangxyz3g', 'ngolamaz3', 'nkhhu', 'vdgiapp', 'vtvinh24']);
    Languages.UKRANIAN = new Languages()._Languages('UKRANIAN', 14, 'українська', 'uk', Languages$Status.O_COMPLETE, ['Oster', 'Snikewin', 'zhushman00'], ['AlexFenixUA', 'Buster54', 'Doodlinka', 'Dotsent', 'Lyttym', 'MaxQuiet', 'Mops', 'Sadsaltan1', 'TarasUA', 'TheGuyBill', 'Tomfire', 'Volkov', 'ZverWolf', '_bor_', 'alexfenixva', 'ddmaster3463', 'filalex77', 'holuydadko', 'ingvarfed', 'iu0v1', 'jesternotricks', 'lezzen', 'myshokoleksander05', 'oliolioxinfree', 'qweez', 'romanokurg', 'so1der', 'sterenkevicsasa', 'vlisivka', 'xojltoh', 'yukete', 'zhawty', 'Мальвочка']);
    Languages.INDONESIAN = new Languages()._Languages('INDONESIAN', 15, 'indonesia', 'in', Languages$Status.__UNREVIEW, ['RF_4R4F1_03', 'rakapratama'], ['An_Ironstone', 'Flasherx', 'INDRA_SYAHPUTRA', 'Izulhaaq', 'Karanh', 'M.Bintang.K', 'PineFirebloom', 'QiuQiuQi', 'Ruzz_Axleod', 'Taka31', 'ZakyM313', 'ZangieF347', 'aachunemiku', 'anagakenny24', 'aryasatya_arifien', 'atmorojo', 'di9526985', 'esprogarap', 'hatsunnimiku', 'icebearwand', 'kirimaja', 'lupar21', 'luthfidzaky_ldzy', 'mkakhsan301', 'nicoalvito', 'noeldycreator', 'oolek', 'wisnugafur']);
    Languages.CZECH = new Languages()._Languages('CZECH', 16, 'čeština', 'cs', Languages$Status.__UNREVIEW, ['16cnovotny', 'ObisMike', 'novotnyvaclav'], ['AshenShugar', 'Autony', 'Block_Vader', 'Buba237', 'JStrange', 'Nerdiniel', 'Patrik123', 'RealBrofessor', 'Thorn_123', 'chuckjirka', 'emteckos2', 'kristanka', 'luhan.lukas']);
    Languages.DUTCH = new Languages()._Languages('DUTCH', 17, 'nederlands', 'nl', Languages$Status.O_COMPLETE, ['AlbertBrand', 'Mvharen'], ['AvanLieshout', 'Blokheck011', 'Frankwert', 'Gehenna', 'Valco', 'ZephyrZodiac', 'link200023', 'ojppe', 'rmw', 'th3f4llenh0rr0r']);
    Languages.SWEDISH = new Languages()._Languages('SWEDISH', 18, 'svenska', 'sv', Languages$Status.__UNREVIEW, ['leowitchhh', 'yeager'], ['KeyB', 'Moistmemesneverlie', 'antonaut', 'dotMavriQ']);
    Languages.HUNGARIAN = new Languages()._Languages('HUNGARIAN', 19, 'magyar', 'hu', Languages$Status.O_COMPLETE, ['dorheim', 'summoner001', 'szalaik'], ['Csanevox', 'Navetelen', 'acszoltan111', 'balazsszalab', 'clarovani', 'dhialub', 'nanometer', 'nardomaa', 'savarall', 'szemetvodor']);
    Languages.GREEK = new Languages()._Languages('GREEK', 20, 'ελληνικά', 'el', Languages$Status.X_UNFINISH, ['Aeonius', 'Saxy'], ['DU_Clouds', 'VasKyr', 'YiorgosH', 'fr3sh', 'nikolaoskelirakis', 'stefboi', 'toumbo', 'val.exe']);
    Languages.BELARUSIAN = new Languages()._Languages('BELARUSIAN', 21, 'беларуская', 'be', Languages$Status.X_UNFINISH, ['AprilRain(Vadzim Navumaû)'], ['4ebotar', 'Loentrin']);
    Languages.ESPERANTO = new Languages()._Languages('ESPERANTO', 22, 'esperanto', 'eo', Languages$Status.O_COMPLETE, ['Verdulo'], ['Raizin', 'Rwelean', 'kameluloj']);
    Languages.$VALUES = [Languages.ENGLISH, Languages.CHI_SMPL, Languages.KOREAN, Languages.RUSSIAN, Languages.SPANISH, Languages.PORTUGUESE, Languages.FRENCH, Languages.GERMAN, Languages.CHI_TRAD, Languages.JAPANESE, Languages.POLISH, Languages.ITALIAN, Languages.TURKISH, Languages.VIETNAMESE, Languages.UKRANIAN, Languages.INDONESIAN, Languages.CZECH, Languages.DUTCH, Languages.SWEDISH, Languages.HUNGARIAN, Languages.GREEK, Languages.BELARUSIAN, Languages.ESPERANTO];
  }
}

export class Languages$Status extends JEnum {
  static X_UNFINISH: Languages$Status = null;
  static __UNREVIEW: Languages$Status = null;
  static O_COMPLETE: Languages$Status = null;
  static $VALUES: Languages$Status[] = null;
  _Languages$Status($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Languages$Status[] { return Languages$Status.$VALUES.slice(); }
  static valueOf(name: string): Languages$Status { return $J.enumValueOf(Languages$Status, name); }
  static $clinit() {
    Languages$Status.X_UNFINISH = new Languages$Status()._Languages$Status('X_UNFINISH', 0);
    Languages$Status.__UNREVIEW = new Languages$Status()._Languages$Status('__UNREVIEW', 1);
    Languages$Status.O_COMPLETE = new Languages$Status()._Languages$Status('O_COMPLETE', 2);
    Languages$Status.$VALUES = [Languages$Status.X_UNFINISH, Languages$Status.__UNREVIEW, Languages$Status.O_COMPLETE];
  }
}

$J.define(Languages, 'com.shatteredpixel.shatteredpixeldungeon.messages.Languages', { kind: 'enum', sup: 'java.lang.Enum', ctors: { 'java.lang.String,java.lang.String,com.shatteredpixel.shatteredpixeldungeon.messages.Languages$Status,java.lang.String[],java.lang.String[]': '_Languages' }, clinit: true, lazy: ['$VALUES', 'ENGLISH', 'CHI_SMPL', 'KOREAN', 'RUSSIAN', 'SPANISH', 'PORTUGUESE', 'FRENCH', 'GERMAN', 'CHI_TRAD', 'JAPANESE', 'POLISH', 'ITALIAN', 'TURKISH', 'VIETNAMESE', 'UKRANIAN', 'INDONESIAN', 'CZECH', 'DUTCH', 'SWEDISH', 'HUNGARIAN', 'GREEK', 'BELARUSIAN', 'ESPERANTO'] });
$J.define(Languages$Status, 'com.shatteredpixel.shatteredpixeldungeon.messages.Languages$Status', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Languages$Status' }, clinit: true, lazy: ['$VALUES', 'X_UNFINISH', '__UNREVIEW', 'O_COMPLETE'] });
