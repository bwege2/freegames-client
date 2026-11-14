// Typing Warriors: GPL-3.0-or-later (LICENSE.md).
// The words of the practice area: the same lists the server uses for its rounds
// (server/.../games/typingwarriors/Words.java). Everyday words, written for this game.

const split = (s: string): string[] => s.trim().split(/\s+/);

export const WORDS_EN = split(`
about above across after again air all almost along also always animal another answer any apple
area arm around ask autumn away baby back ball bank bath beach bear because bed before begin behind
bell best better between big bird black blue boat body book both bottle box boy bread bridge bright
bring brother brown build busy butter buy cake call camera can car card care carry cat catch chair
change cheese child city class clean clear climb clock close cloud coat coffee cold colour come cook
corner count country cover cross cup dance dark day deep desk dinner doctor dog door down draw dream
dress drink drive dry early earth east easy eat egg eight empty end enough evening every eye face fall
family far farm fast father feel field find fine finger fire first fish five floor flower fly follow
food foot forest four friend from front fruit full funny game garden gate give glass go gold good
grass great green ground group grow hair half hand happy hard hat have head hear heart heavy help
here high hill hold home horse hot hour house hundred idea important inside island jump just keep key
kind king kitchen know lake land large last late laugh leaf learn left leg letter life light like line
listen little live long look lose love low lunch make many map market may meet middle milk minute money
month moon more morning mother mountain mouth move much music name near need never new next nice night
nine north nose nothing now number ocean off often old once one only open orange other out over page
paint paper park part pass past pay people picture piece place plan plant play please point pull push
put queen question quick quiet rain reach read ready red rest rice right ring river road rock room
round run salt same sand say school sea second see seven shape sheep ship shirt shoe shop short show
side sing sister sit six sky sleep slow small smile snow soft some song soon sound south speak spring
stand star start stay step still stone stop story street strong sugar summer sun sweet swim table take
talk tall tea teach tell ten thank that their then there thing think third three through time tired
today together tomorrow top town train travel tree true try turn two under until use very village
visit voice wait walk wall want warm wash watch water way week well west wet what wheel when where
white who why wide wind window winter wish with woman wood word work world write year yellow yes
young zero
`);

export const WORDS_DE = split(`
abend aber acht alle allein alt andere anfang angst antwort apfel arbeit arm auch auf auge aus auto
bach bad bahn bald ball bank bauen baum bein beispiel berg besser bett bild bis bitte blatt blau
bleiben blume boden boot brauchen braun brief bringen brot bruder brücke buch bunt butter dach danke
dann decke denken deutsch dick ding doch dorf dort draußen drei dunkel dünn durch durst ecke ei eigen
einfach eins eis eltern ende eng erde erst essen etwas fahren fahrrad fallen familie farbe fast feld
fenster ferien fest feuer finden finger fisch flasche fleiß fliegen fluss frage frau frei freund
frisch froh früh frühling fünf fuß ganz garten gast geben gehen gelb geld gemüse genau gern geschichte
gesicht gestern gesund glas glück gold gras groß grün gruß gut haar haben hafen halb hallo hals halten
hand hart haus heiß heißen helfen hell hemd herbst herz heute hier himmel hinter hoch hof holz hören
hose hund hunger hut idee immer insel jahr jacke jeder jetzt jung junge kaffee kalt karte käse katze
kaufen kein kennen kind kirche klar klasse kleid klein kochen kommen könig kopf kraft krank kreis
küche kuchen kuh kurz lachen land lang langsam laufen laut leben leer legen lehrer leicht leise lernen
lesen letzte leute licht lieb lied liegen links löffel luft machen mädchen mann mantel markt mauer
maus meer mehr mensch messer milch minute mit mittag mitte monat mond morgen müde mund musik mutter
nach nacht nah name nase nass natur neben nehmen nein neu neun nicht nie noch norden nur oben obst
oder offen oft ohne ohr onkel ort osten paar papier park pause pferd pflanze platz preis quelle rad
rand raum rechts reden regen reich reise richtig ring rock rot rücken rufen ruhe rund sache saft sagen
salz sand satz sauber schaf schiff schlafen schlüssel schnee schnell schön schrank schreiben schuh
schule schwarz schwer schwester sechs see sehen sehr seife seite sessel sieben singen sitzen sommer
sonne spät spiegel spiel sprache springen stadt stark stehen stein stern still stimme straße stück
stuhl stunde suchen süden suppe süß tafel tag tal tante tanzen tasche tasse tee teil teller tief tier
tisch tochter tor tragen traum treffen treppe trinken trocken tür turm über uhr und unten vater vier
viel vogel voll von vor wagen wald wand wann warm warten was waschen wasser weg weich weihnachten
weiß weit welt wenig wer werden wetter wichtig wie wiese wind winter wissen woche wohnen wolke wort
wunsch zahl zahn zehn zeit zeitung ziel zimmer zucker zug zusammen zwei zwischen
`);

export const wordsOf = (lang: 'en' | 'de'): string[] => (lang === 'de' ? WORDS_DE : WORDS_EN);

/** Random words, no word twice in a row. */
export function someWords(list: string[], n: number, rnd: () => number = Math.random): string[] {
  const out: string[] = [];
  if (!list.length) return out;
  while (out.length < n) {
    const w = list[Math.floor(rnd() * list.length)];
    if (list.length > 1 && w === out[out.length - 1]) continue;
    out.push(w);
  }
  return out;
}
