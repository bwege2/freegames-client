// game.cpp's playGame(): the title, then one life, frame by frame at the original's locked 15 fps.
// Everything here is the original's logic in the original's order; the screen, keys, timing and sound
// come from index.ts (the SDL parts of game.cpp).
import { World, GraphicContainer, type WorldGraphics } from './World.ts';
import { CHEST_CLOSED, TILE_W } from './map.ts';
import { Score, SCORE_HEIGHT } from './score.ts';

export const WIDTH = 100, HEIGHT = 12;
export const TOTAL_HEIGHT = HEIGHT + SCORE_HEIGHT;
export const FRAME_RATE = 15;
const GAME_TIME = 5 * 60;
/** life time that passes per frame */
const TIME_DELTA = -(WIDTH / (GAME_TIME * FRAME_RATE));
const NUM_TITLE_FADE_FRAMES = 200;

/** The keys the original reads with getKeyDown() each frame (held, not pressed). */
export interface Keys {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  /** s: no smoothed stepping */
  s?: boolean;
  /** p, o, i: pause, unpause, step (pausing is disabled in the release: canPause = false) */
  p?: boolean;
  o?: boolean;
  i?: boolean;
}

export interface GameHooks {
  setMusicLoudness(l: number): void;
  restartMusic(): void;
}

export interface Graphics extends WorldGraphics {
  numerals: GraphicContainer;
  title: GraphicContainer;
}

// globals of game.cpp that outlive one game
let paused = false;
const canPause = false;

export class PassageGame {
  /** the 100x16 picture, 0xRRGGBB, the score strip on top */
  readonly image = new Uint32Array(WIDTH * TOTAL_HEIGHT);
  readonly world: World;
  private readonly score: Score;
  private readonly titlePixels: Uint32Array;
  private readonly hooks: GameHooks;
  // playGame()'s locals
  private currentSpriteIndex = 2;
  private playerX = 0;
  private playerY = 0;
  private maxPlayerX = 0;
  private points = 0;
  private specialGem = 0;
  private exploreScore = 0;
  private exploreSubPoints = 0;
  private maxExploreScore = 0;
  private chestScore = 0;
  private knowSpouse = false;
  private dX = 0;
  private dY = 0;
  private movingThisFrame = true;
  private frameCount = 0;
  private titleFadeFrame = 0;
  private stepDX = true;
  done = false;
  /** the title is up, waiting for a key or button */
  onTitle = true;

  constructor(g: Graphics, hooks: GameHooks) {
    this.world = new World(g);
    this.score = new Score(g.numerals);
    this.hooks = hooks;
    const t = g.title;
    this.titlePixels = new Uint32Array(t.w * t.h);
    for (let i = 0; i < t.w * t.h; i++) {
      // (unsigned char)( channel * 255 ) per channel
      this.titlePixels[i] = ((Math.trunc(t.red[i]) & 0xff) << 16) | ((Math.trunc(t.green[i]) & 0xff) << 8) | (Math.trunc(t.blue[i]) & 0xff);
    }
  }

  get scoreValue(): number { return this.points; }

  /** The start of playGame(), up to the title on screen. `time` is time(NULL), read twice as the original does. */
  newGame(time: () => number): void {
    this.currentSpriteIndex = 2;
    this.maxPlayerX = 0;
    this.points = 0;
    this.specialGem = time() % 4; // the gem that marks chests with points
    this.exploreScore = this.exploreSubPoints = this.maxExploreScore = this.chestScore = 0;
    this.knowSpouse = false;
    this.world.init(time());
    this.image.fill(0);
    this.done = false;
    this.playerX = TILE_W;
    this.maxPlayerX = this.playerX;
    this.dX = this.playerX;
    this.playerY = 2 + HEIGHT / 2;
    this.dY = 0;
    this.world.setPlayerPosition(Math.trunc(this.playerX), Math.trunc(this.playerY));
    this.world.setPlayerSpriteFrame(this.currentSpriteIndex);
    this.movingThisFrame = true;
    this.image.set(this.titlePixels); // the title fills the screen
    this.onTitle = true;
  }

  /** A key or button on the title: the life begins (the music starts over, turned up). */
  start(): void {
    this.hooks.restartMusic();
    this.hooks.setMusicLoudness(1.0);
    this.image.fill(0);
    this.frameCount = 0;
    this.titleFadeFrame = 0;
    this.stepDX = true;
    this.onTitle = false;
  }

  /** Draws the frame (what the original flips onto the screen). */
  render(keys: Keys): void {
    this.stepDX = !keys.s;
    // dX advances linearly; drawn, it rests on whole pixels and slides to the next one on a cosine,
    // so sprites are seen unsmudged between steps
    let drawDX = Math.floor(this.dX);
    const floorWidth = 0.5;
    if (this.dX - drawDX > floorWidth) {
      const slopeValue = (this.dX - drawDX - floorWidth) / (1 - floorWidth);
      drawDX += -0.5 * Math.cos(slopeValue * Math.PI) + 0.5;
    }
    if (!this.stepDX) drawDX = this.dX;
    const world = this.world, playerX = this.playerX, dY = this.dY;
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        // the farther a column is from the player, the more of the world it squeezes in
        const trueDistance = drawDX + x - playerX;
        const maxDistance = WIDTH - 1;
        let capped = trueDistance;
        if (capped > maxDistance) capped = maxDistance;
        if (capped < -maxDistance) capped = -maxDistance;
        let worldX: number;
        const noCompressZone = 10;
        if (trueDistance > noCompressZone) {
          worldX = x + trueDistance / 2 * Math.pow(Math.tan(((capped - noCompressZone) / (WIDTH - noCompressZone)) * Math.PI / 2), 2);
        } else if (trueDistance < -noCompressZone) {
          worldX = x + trueDistance / 2 * Math.pow(Math.tan(((-capped - noCompressZone) / (WIDTH - noCompressZone)) * Math.PI / 2), 2);
        } else {
          worldX = x;
        }
        worldX += drawDX;
        const worldY = Math.trunc(Math.floor(y + dY));
        // linear interpolation of two samples
        const intWorldX = Math.trunc(Math.floor(worldX));
        const bWeight = worldX - intWorldX;
        const aWeight = 1 - bWeight;
        const sampleA = world.sample(intWorldX, worldY, aWeight);
        const sampleB = world.sample(intWorldX + 1, worldY, bWeight);
        this.image[(y + SCORE_HEIGHT) * WIDTH + x] = (sampleB + sampleA) >>> 0;
      }
    }
    this.score.draw(this.image, WIDTH, this.points);

    if (world.isPlayerDead()) {
      // fade to the title, wiping from left to right, the music fading out with it
      const titleWeight = this.titleFadeFrame / (NUM_TITLE_FADE_FRAMES - 1);
      const gameWeight = 1 - titleWeight;
      const wipePosition = Math.trunc(titleWeight * WIDTH);
      this.hooks.setMusicLoudness(1.0 - titleWeight);
      for (let i = 0; i < this.image.length; i++) {
        if (i % WIDTH > wipePosition) continue;
        const gp = this.image[i], tp = this.titlePixels[i];
        const r = Math.trunc(gameWeight * ((gp >> 16) & 0xff) + titleWeight * ((tp >> 16) & 0xff)) & 0xff;
        const g = Math.trunc(gameWeight * ((gp >> 8) & 0xff) + titleWeight * ((tp >> 8) & 0xff)) & 0xff;
        const b = Math.trunc(gameWeight * (gp & 0xff) + titleWeight * (tp & 0xff)) & 0xff;
        this.image[i] = (r << 16) | (g << 8) | b;
      }
      if (!paused) this.titleFadeFrame++;
      if (this.titleFadeFrame === NUM_TITLE_FADE_FRAMES) this.done = true;
    }
  }

  /** The rest of the frame, after the flip: keys, movement, time, chests, the spouse, the score. */
  update(keys: Keys, quitPressed: boolean): void {
    const world = this.world;
    let spouse = world.spousePosition();
    const moveDelta = world.isPlayerDead() ? 0 : 1;
    // after the spouse died, the player moves at half speed
    if (this.knowSpouse && world.isSpouseDead()) this.movingThisFrame = this.frameCount % 2 === 0;
    if (keys.p && canPause) paused = true;
    if (keys.o) paused = false;
    if (paused && keys.i) world.stepAnimations();

    const pick = (pos: number, even: number, odd: number) => (Math.trunc(Math.trunc(pos) / 2) % 2 === 0 ? even : odd);
    if (keys.left) {
      let notBlocked = !world.map.isBlocked(Math.trunc(this.playerX - moveDelta), Math.trunc(this.playerY));
      // spouse and character move, and are blocked, together
      if (world.haveMetSpouse() && world.map.isBlocked(spouse.x - moveDelta, spouse.y)) notBlocked = false;
      if (this.movingThisFrame && notBlocked) {
        this.playerX -= moveDelta;
        if (this.playerX < 0) this.playerX += moveDelta;
        else {
          this.dX -= moveDelta;
          this.currentSpriteIndex = pick(this.playerX, 6, 7);
        }
      }
    } else if (keys.right) {
      let notBlocked = !world.map.isBlocked(Math.trunc(this.playerX + moveDelta), Math.trunc(this.playerY));
      if (world.haveMetSpouse() && world.map.isBlocked(spouse.x + moveDelta, spouse.y)) notBlocked = false;
      if (this.movingThisFrame && notBlocked) {
        this.dX += moveDelta;
        this.playerX += moveDelta;
        this.currentSpriteIndex = pick(this.playerX, 3, 2);
      }
    } else if (keys.up) {
      let notBlocked = !world.map.isBlocked(Math.trunc(this.playerX), Math.trunc(this.playerY - moveDelta));
      if (world.haveMetSpouse() && world.map.isBlocked(spouse.x, spouse.y - moveDelta)) notBlocked = false;
      if (this.movingThisFrame && notBlocked) {
        this.playerY -= moveDelta;
        if (this.playerY < 0) this.playerY += moveDelta;
        else {
          this.dY -= moveDelta;
          this.currentSpriteIndex = pick(this.playerY, 0, 1);
        }
      }
    } else if (keys.down) {
      let notBlocked = !world.map.isBlocked(Math.trunc(this.playerX), Math.trunc(this.playerY + moveDelta));
      if (world.haveMetSpouse() && world.map.isBlocked(spouse.x, spouse.y + moveDelta)) notBlocked = false;
      if (this.movingThisFrame && notBlocked) {
        this.dY += moveDelta;
        this.playerY += moveDelta;
        this.currentSpriteIndex = pick(this.playerY, 5, 4);
      }
    }
    world.setPlayerPosition(Math.trunc(this.playerX), Math.trunc(this.playerY));
    world.setPlayerSpriteFrame(this.currentSpriteIndex);
    spouse = world.spousePosition(); // may change after the player moved

    if (quitPressed) this.done = true;

    this.frameCount++;
    // the other animations run whether or not the player moves
    if (!paused && this.frameCount % 6 === 0) world.stepAnimations();
    // the player's place on the screen inches forward: life passes
    if (!world.isPlayerDead() && !paused) this.dX += TIME_DELTA;
    const age = (this.playerX - this.dX) / WIDTH;
    world.setCharacterAges(age);
    if (age >= 0.85) world.dieSpouse();
    if (age >= 0.95) world.diePlayer();

    const px = Math.trunc(this.playerX), py = Math.trunc(this.playerY);
    if (world.map.isChest(px, py) === CHEST_CLOSED) {
      world.map.openChest(px, py);
      const c = world.map.getChestCenter(px, py);
      if (world.map.getChestCode(px, py) & (0x01 << this.specialGem)) {
        this.chestScore += 100;
        world.startPrizeAnimation(c.x, c.y);
      } else {
        world.startDustAnimation(c.x, c.y);
      }
    }

    const distanceFromSpouse = Math.trunc(Math.sqrt(Math.pow(spouse.x - this.playerX, 2) + Math.pow(spouse.y - this.playerY, 2)));
    if (!world.haveMetSpouse() && !world.isSpouseDead() && distanceFromSpouse < 10) {
      world.meetSpouse();
      this.knowSpouse = true;
      world.startHeartAnimation(Math.trunc((spouse.x - this.playerX) / 2 + this.playerX), Math.trunc((spouse.y - this.playerY) / 2 + this.playerY) - 2);
    }

    // stop after the player has gone off the right end of the screen
    if (this.playerX - this.dX > WIDTH) this.dX = this.playerX - WIDTH;

    let exploreDelta = 0;
    if (this.playerX > this.maxPlayerX) {
      exploreDelta = Math.trunc(this.playerX - this.maxPlayerX);
      this.maxPlayerX = this.playerX;
    }
    const spouseExploreFactor = 2;
    if (world.haveMetSpouse()) exploreDelta *= spouseExploreFactor; // exploring together is worth more
    this.exploreSubPoints += exploreDelta;
    this.exploreScore = Math.trunc(this.exploreSubPoints / 10);
    if (world.haveMetSpouse()) {
      // shown in jumps; can drop to the previous jump when the spouse joins: kept up by maxExploreScore
      this.exploreScore = Math.trunc(this.exploreScore / spouseExploreFactor) * spouseExploreFactor;
    }
    if (this.exploreScore < this.maxExploreScore) this.exploreScore = this.maxExploreScore;
    this.points = this.chestScore + this.exploreScore;
    if (this.exploreScore > this.maxExploreScore) this.maxExploreScore = this.exploreScore;
  }
}
