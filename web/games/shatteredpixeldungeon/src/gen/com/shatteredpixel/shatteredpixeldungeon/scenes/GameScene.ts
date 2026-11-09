// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/scenes/GameScene.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, IOException, JObject, JString, Locale, RuntimeException, Throwable } from '../../../../../jre/index.ts';
import { PixelScene } from './PixelScene.ts';

let Assets$Sounds, Badges, Challenges, Chrome$Type, Dungeon, GamesInProgress, Rankings, SPDAction, SPDSettings, ShatteredPixelDungeon, Statistics, Actor, Char, Char$Alignment, Char$Property, AscensionChallenge, ChampionEnemy, Hero, Talent, DemonSpawner, Ghoul, Ghoul$GhoulLifeLink, Mimic, Mob, Snake, BannerSprites, BannerSprites$Type, BlobEmitter, CheckedCell, Flare, FloatingText, Ripple, SpellSprite, TargetedCell, Ankh, Heap, Heap$Type, Honeypot, DriedRose$GhostHero, Guidebook, Potion, InventoryScroll$WndConfirmCancel, ScrollOfTeleportation, DimensionalSundial, TrinketCatalyst, TrinketCatalyst$WndTrinket, MeleeWeapon$Charger, Bestiary, Document, Journal, Notes, Notes$Landmark, Level$Feeling, RegularLevel, Terrain, SecretRoom, Trap, Messages, Plant, Plant$Seed, CellSelector, CellSelector$Listener, HeroSelectScene, InterlevelScene, InterlevelScene$Mode, StartScene, TitleScene, CharSprite, DiscardedItemSprite, HeroSprite, ItemSprite, DungeonTerrainTilemap, DungeonTileSheet, DungeonTilemap, DungeonWallsTilemap, FogOfWar, GridTileMap, RaisedTerrainTilemap, TerrainFeaturesTilemap, WallBlockingTilemap, WallOcclusionTilemap, ActionIndicator, AttackIndicator, Banner, BossHealthBar, GameLog, Icons, InventoryPane, LootIndicator, MenuPane, QuickSlotButton, ResumeIndicator, RightClickMenu, StatusPane, StyledButton, Tag, TargetHealthIndicator, Toast, Toolbar, Window, GLog, WndBag, WndGame, WndHero, WndInfoCell, WndInfoItem, WndInfoMob, WndInfoPlant, WndInfoTrap, WndKeyBindings, WndMessage, WndOptions, WndResurrect, WndUpgrade, TextureCache, Blending, ControllerHandler, KeyBindings, PointerEvent, Camera, Game, Group, NoosaScriptNoLighting, PointerArea, SkinnedBlock, Visual, Sample, Emitter, Tweener, GameMath, PlatformSupport, Point, Random;

export class GameScene extends PixelScene {
  static scene: GameScene = null;
  water: SkinnedBlock = null;
  tiles: DungeonTerrainTilemap = null;
  visualGrid: GridTileMap = null;
  occlusion: WallOcclusionTilemap = null;
  terrainFeatures: TerrainFeaturesTilemap = null;
  raisedTerrain: RaisedTerrainTilemap = null;
  walls: DungeonWallsTilemap = null;
  wallBlocking: WallBlockingTilemap = null;
  customTilemaps: ArrayList<Tilemap> = null;
  fog: FogOfWar = null;
  hero: HeroSprite = null;
  menu: MenuPane = null;
  status_: StatusPane = null;
  boss: BossHealthBar = null;
  log: GameLog = null;
  static cellSelector: CellSelector = null;
  terrain: Group = null;
  customTiles: Group = null;
  levelVisuals: Group = null;
  customTerrain: Group = null;
  levelWallVisuals: Group = null;
  customWalls: Group = null;
  ripples: Group = null;
  plants: Group = null;
  traps: Group = null;
  heaps: Group = null;
  mobs: Group = null;
  floorEmitters: Group = null;
  emitters: Group = null;
  effects: Group = null;
  gases: Group = null;
  spells: Group = null;
  statuses: Group = null;
  emoicons: Group = null;
  overFogEffects: Group = null;
  checkedCells: Group = null;
  targetedCells: Group = null;
  healthIndicators: Group = null;
  inventory: InventoryPane = null;
  static invVisible: boolean = false;
  toolbar: Toolbar = null;
  prompt_: Toast = null;
  attack: AttackIndicator = null;
  loot: LootIndicator = null;
  action: ActionIndicator = null;
  resume_: ResumeIndicator = null;
  static actorStarted: boolean = false;
  static actorThread: Thread = null;
  toDestroy: ArrayList<Gizmo> = null;
  notifyDelay: number = 0;
  static updateItemDisplays: boolean = false;
  static tagDisappeared: boolean = false;
  static updateTags: boolean = false;
  static waterOfs: number = 0;
  static lastOffset: Point = null;
  tagAttack: boolean = false;
  tagLoot: boolean = false;
  tagAction: boolean = false;
  tagResume: boolean = false;
  static savedSelector: WndBag$ItemSelector = null;
  static defaultCellListener: CellSelector$Listener = null;
  _GameScene(): this {
    this._PixelScene();
    this.customTilemaps = new ArrayList();
    this.inGameScene = true;
    this.toDestroy = new ArrayList();
    this.notifyDelay = Math.fround(1 / 60);
    this.tagAttack = false;
    this.tagLoot = false;
    this.tagAction = false;
    this.tagResume = false;
    return this;
  }
  create(): void {
    if (Dungeon.hero == null || Dungeon.level == null) {
      ShatteredPixelDungeon.switchNoFade$Class($J.cls(TitleScene));
      return;
    }
    Dungeon.level.playLevelMusic();
    SPDSettings.lastClass$int(Dungeon.hero.heroClass.ordinal());
    super.create();
    Camera.main.zoom$float(GameMath.gate(PixelScene.minZoom, Math.fround((PixelScene.defaultZoom + SPDSettings.zoom$()) | 0), PixelScene.maxZoom));
    Camera.main.edgeScroll.set$float(1);
    switch (SPDSettings.cameraFollow$()) {
      case 4:
      default:
        Camera.main.setFollowDeadzone(0);
        break;
      case 3:
        Camera.main.setFollowDeadzone(Math.fround(0.2));
        break;
      case 2:
        Camera.main.setFollowDeadzone(0.5);
        break;
      case 1:
        Camera.main.setFollowDeadzone(Math.fround(0.9));
        break;
    }
    let insets = this.getCommonInsets();
    let largeInsetTop = Game.platform.getSafeInsets(PlatformSupport.INSET_LRG).scale(Math.fround(1 / PixelScene.defaultZoom)).top_;
    GameScene.scene = this;
    this.terrain = new Group()._Group();
    this.add$Gizmo(this.terrain);
    this.water = new (GameScene$1())().$o(this)._SkinnedBlock(Math.fround(Math.imul(Dungeon.level.width(), DungeonTilemap.SIZE)), Math.fround(Math.imul(Dungeon.level.height(), DungeonTilemap.SIZE)), Dungeon.level.waterTex());
    this.water.autoAdjust = true;
    this.terrain.add$Gizmo(this.water);
    this.ripples = new Group()._Group();
    this.terrain.add$Gizmo(this.ripples);
    DungeonTileSheet.setupVariance(Dungeon.level.map_.length, Dungeon.seedCurDepth());
    this.tiles = new DungeonTerrainTilemap()._DungeonTerrainTilemap();
    this.terrain.add$Gizmo(this.tiles);
    this.customTiles = new Group()._Group();
    this.terrain.add$Gizmo(this.customTiles);
    this.visualGrid = new GridTileMap()._GridTileMap();
    this.terrain.add$Gizmo(this.visualGrid);
    this.occlusion = new WallOcclusionTilemap()._WallOcclusionTilemap();
    this.terrain.add$Gizmo(this.occlusion);
    this.terrainFeatures = new TerrainFeaturesTilemap()._TerrainFeaturesTilemap(Dungeon.level.plants, Dungeon.level.traps);
    this.terrain.add$Gizmo(this.terrainFeatures);
    this.customTerrain = new Group()._Group();
    this.terrain.add$Gizmo(this.customTerrain);
    this.levelVisuals = Dungeon.level.addVisuals();
    this.add$Gizmo(this.levelVisuals);
    this.floorEmitters = new Group()._Group();
    this.add$Gizmo(this.floorEmitters);
    this.heaps = new Group()._Group();
    this.add$Gizmo(this.heaps);
    for (const $it0 = Dungeon.level.heaps.valueList().iterator(); $it0.hasNext(); ) {
      let heap = $it0.next();
      this.addHeapSprite(heap);
    }
    this.emitters = new Group()._Group();
    this.effects = new Group()._Group();
    this.healthIndicators = new Group()._Group();
    this.emoicons = new Group()._Group();
    this.overFogEffects = new Group()._Group();
    this.mobs = new Group()._Group();
    this.add$Gizmo(this.mobs);
    this.hero = new HeroSprite()._HeroSprite();
    this.hero.place(Dungeon.hero.pos);
    this.hero.updateArmor();
    this.mobs.add$Gizmo(this.hero);
    for (const $it1 = Dungeon.level.mobs.iterator(); $it1.hasNext(); ) {
      let mob = $it1.next();
      this.addMobSprite(mob);
    }
    this.raisedTerrain = new RaisedTerrainTilemap()._RaisedTerrainTilemap();
    this.add$Gizmo(this.raisedTerrain);
    this.walls = new DungeonWallsTilemap()._DungeonWallsTilemap();
    this.add$Gizmo(this.walls);
    this.customWalls = new Group()._Group();
    this.add$Gizmo(this.customWalls);
    this.levelWallVisuals = Dungeon.level.addWallVisuals();
    this.add$Gizmo(this.levelWallVisuals);
    this.wallBlocking = new WallBlockingTilemap()._WallBlockingTilemap();
    this.add$Gizmo(this.wallBlocking);
    this.add$Gizmo(this.emitters);
    this.add$Gizmo(this.effects);
    this.gases = new Group()._Group();
    this.add$Gizmo(this.gases);
    for (const $it2 = Dungeon.level.blobs.values().iterator(); $it2.hasNext(); ) {
      let blob = $it2.next();
      blob.emitter_ = null;
      this.addBlobSprite(blob);
    }
    this.fog = new FogOfWar()._FogOfWar(Dungeon.level.width(), Dungeon.level.height());
    this.add$Gizmo(this.fog);
    this.spells = new Group()._Group();
    this.add$Gizmo(this.spells);
    this.add$Gizmo(this.overFogEffects);
    this.checkedCells = new Group()._Group();
    this.add$Gizmo(this.checkedCells);
    this.targetedCells = new Group()._Group();
    this.add$Gizmo(this.targetedCells);
    for (const $it3 = TargetedCell.cells.valueList().iterator(); $it3.hasNext(); ) {
      let cell = $it3.next();
      cell.reset(cell.pos, cell.time);
      this.targetedCells.add$Gizmo(cell);
    }
    for (const $it4 = Dungeon.level.customTiles.iterator(); $it4.hasNext(); ) {
      let visual = $it4.next();
      this.addCustomTile(visual);
    }
    for (const $it5 = Dungeon.level.customTerrain.iterator(); $it5.hasNext(); ) {
      let visual = $it5.next();
      this.addCustomTerrain(visual);
    }
    for (const $it6 = Dungeon.level.customWalls.iterator(); $it6.hasNext(); ) {
      let visual = $it6.next();
      this.addCustomWall(visual);
    }
    this.statuses = new Group()._Group();
    this.add$Gizmo(this.statuses);
    this.add$Gizmo(this.healthIndicators);
    this.add$Gizmo(new TargetHealthIndicator()._TargetHealthIndicator());
    this.add$Gizmo(this.emoicons);
    this.add$Gizmo(GameScene.cellSelector = new CellSelector()._CellSelector(this.tiles));
    let uiSize = SPDSettings.interfaceSize$();
    let heroPaneExtraWidth = insets.left_;
    let menuBarMaxLeft = Math.fround(Math.fround(PixelScene.uiCamera.width_ - insets.right_) - MenuPane.WIDTH);
    let hpBarMaxWidth = 50;
    let buffBarRowLimits = $J.newArray(9, 0);
    let buffBarRowAdjusts = $J.newArray(9, 0);
    if (largeInsetTop === Math.fround(0) && insets.top_ > Math.fround(0)) {
      let cutout = Game.platform.getDisplayCutout().scale(Math.fround(1 / PixelScene.defaultZoom));
      if (cutout.top_ < Math.fround(30) && cutout.left_ < Math.fround(20) && cutout.right_ > Math.fround(12)) {
        heroPaneExtraWidth = Math.max(heroPaneExtraWidth, Math.fround(cutout.right_ - 12));
        heroPaneExtraWidth = Math.min(heroPaneExtraWidth, Math.fround(PixelScene.uiCamera.width_ - PixelScene.MIN_WIDTH_P));
      } else if (cutout.top_ < Math.fround(20) && cutout.left_ < Math.fround(menuBarMaxLeft + MenuPane.WIDTH) && cutout.right_ > menuBarMaxLeft) {
        menuBarMaxLeft = Math.min(menuBarMaxLeft, Math.fround(cutout.left_ - MenuPane.WIDTH));
        menuBarMaxLeft = Math.max(menuBarMaxLeft, Math.fround(PixelScene.MIN_WIDTH_P - MenuPane.WIDTH));
      } else if (cutout.left_ < Math.fround(78) && cutout.top_ < Math.fround(4) && cutout.right_ > Math.fround(32)) {
        hpBarMaxWidth = $J.roundf(Math.fround(Math.fround(cutout.left_ - 32) + 4));
        hpBarMaxWidth = Math.max(hpBarMaxWidth, 21);
      }
      if (cutout.left_ < Math.fround(84) && cutout.top_ < Math.fround(10) && cutout.right_ > Math.fround(32) && cutout.bottom_ > Math.fround(11)) {
        let i = 1;
        let rowTop = 11;
        while (cutout.bottom_ > Math.fround(rowTop)) {
          if (i === 1 || cutout.bottom_ > Math.fround((rowTop + 2) | 0)) {
            buffBarRowLimits[i] = Math.fround(Math.fround(cutout.left_ - 32) + 3);
          } else {
            buffBarRowAdjusts[i] = Math.fround(Math.fround(cutout.bottom_ - rowTop) + 1);
            rowTop = $J.d2i(Math.fround(rowTop + buffBarRowAdjusts[i]));
          }
          i++;
          rowTop = (rowTop + 8) | 0;
        }
      }
    }
    let screentop = largeInsetTop;
    if (screentop === Math.fround(0) && uiSize === 0) {
      screentop--;
    }
    this.menu = new MenuPane()._MenuPane();
    this.menu.camera_ = PixelScene.uiCamera;
    this.menu.setPos(menuBarMaxLeft, screentop);
    this.add$Gizmo(this.menu);
    let extraRight = Math.fround(PixelScene.uiCamera.width_ - (Math.fround(menuBarMaxLeft + MenuPane.WIDTH)));
    if (extraRight > Math.fround(0)) {
      let bar = new SkinnedBlock()._SkinnedBlock(extraRight, 20, TextureCache.createSolid(-2013265920));
      bar.x = Math.fround(PixelScene.uiCamera.width_ - extraRight);
      bar.camera_ = PixelScene.uiCamera;
      this.add$Gizmo(bar);
      let blocker = new PointerArea()._PointerArea$float$float$float$float(Math.fround(PixelScene.uiCamera.width_ - extraRight), 0, extraRight, 20);
      blocker.camera_ = PixelScene.uiCamera;
      this.add$Gizmo(blocker);
    }
    this.status_ = new StatusPane()._StatusPane(SPDSettings.interfaceSize$() > 0);
    this.status_.camera_ = PixelScene.uiCamera;
    StatusPane.heroPaneExtraWidth = heroPaneExtraWidth;
    StatusPane.hpBarMaxWidth = hpBarMaxWidth;
    StatusPane.buffBarRowMaxWidths = buffBarRowLimits;
    StatusPane.buffBarRowAdjusts = buffBarRowAdjusts;
    this.status_.setRect(insets.left_, uiSize > 0 ? Math.fround(((PixelScene.uiCamera.height_ - 39) | 0) - insets.bottom_) : screentop, Math.fround(Math.fround(PixelScene.uiCamera.width_ - insets.left_) - insets.right_), 0);
    this.add$Gizmo(this.status_);
    if (uiSize < 2 && largeInsetTop !== Math.fround(0)) {
      let bar = new SkinnedBlock()._SkinnedBlock(Math.fround(PixelScene.uiCamera.width_), largeInsetTop, TextureCache.createSolid(-2013265920));
      bar.camera_ = PixelScene.uiCamera;
      this.add$Gizmo(bar);
      let blocker = new PointerArea()._PointerArea$float$float$float$float(0, 0, Math.fround(PixelScene.uiCamera.width_), largeInsetTop);
      blocker.camera_ = PixelScene.uiCamera;
      this.add$Gizmo(blocker);
    }
    this.boss = new BossHealthBar()._BossHealthBar();
    this.boss.camera_ = PixelScene.uiCamera;
    this.boss.setPos(Math.fround((Math.fround(PixelScene.uiCamera.width_ - this.boss.width())) / 2), Math.fround(screentop + (PixelScene.landscape() ? 7 : 26)));
    if (buffBarRowLimits[2] !== Math.fround(0)) {
      this.boss.setPos(this.boss.left(), Math.fround(this.boss.top() + 7));
    } else if (buffBarRowAdjusts[2] !== Math.fround(0)) {
      this.boss.setPos(this.boss.left(), Math.fround(this.boss.top() + buffBarRowAdjusts[2]));
    }
    this.add$Gizmo(this.boss);
    this.resume_ = new ResumeIndicator()._ResumeIndicator();
    this.resume_.camera_ = PixelScene.uiCamera;
    this.add$Gizmo(this.resume_);
    this.action = new ActionIndicator()._ActionIndicator();
    this.action.camera_ = PixelScene.uiCamera;
    this.add$Gizmo(this.action);
    this.loot = new LootIndicator()._LootIndicator();
    this.loot.camera_ = PixelScene.uiCamera;
    this.add$Gizmo(this.loot);
    this.attack = new AttackIndicator()._AttackIndicator();
    this.attack.camera_ = PixelScene.uiCamera;
    this.add$Gizmo(this.attack);
    this.log = new GameLog()._GameLog();
    this.log.camera_ = PixelScene.uiCamera;
    this.log.newLine();
    this.add$Gizmo(this.log);
    if (uiSize > 0) {
      this.bringToFront(this.status_);
    }
    this.toolbar = new Toolbar()._Toolbar();
    this.toolbar.camera_ = PixelScene.uiCamera;
    this.add$Gizmo(this.toolbar);
    if (uiSize === 2) {
      this.inventory = new InventoryPane()._InventoryPane();
      this.inventory.camera_ = PixelScene.uiCamera;
      this.inventory.setPos(Math.fround(Math.fround(PixelScene.uiCamera.width_ - this.inventory.width()) - insets.right_), Math.fround(Math.fround(PixelScene.uiCamera.height_ - this.inventory.height()) - insets.bottom_));
      this.add$Gizmo(this.inventory);
      this.toolbar.setRect(insets.left_, Math.fround(Math.fround(Math.fround(PixelScene.uiCamera.height_ - this.toolbar.height()) - this.inventory.height()) - insets.bottom_), Math.fround(PixelScene.uiCamera.width_ - insets.right_), this.toolbar.height());
    } else {
      this.toolbar.setRect(insets.left_, Math.fround(Math.fround(PixelScene.uiCamera.height_ - this.toolbar.height()) - insets.bottom_), Math.fround(PixelScene.uiCamera.width_ - insets.right_), this.toolbar.height());
    }
    if (insets.bottom_ > Math.fround(0)) {
      let bar = new SkinnedBlock()._SkinnedBlock(Math.fround(PixelScene.uiCamera.width_), insets.bottom_, TextureCache.createSolid(-2013265920));
      bar.camera_ = PixelScene.uiCamera;
      bar.y = Math.fround(PixelScene.uiCamera.height_ - insets.bottom_);
      this.add$Gizmo(bar);
      let blocker = new PointerArea()._PointerArea$float$float$float$float(0, Math.fround(PixelScene.uiCamera.height_ - insets.bottom_), Math.fround(PixelScene.uiCamera.width_), insets.bottom_);
      blocker.camera_ = PixelScene.uiCamera;
      this.add$Gizmo(blocker);
    }
    GameScene.layoutTags();
    switch (InterlevelScene.mode) {
      case InterlevelScene$Mode.RESURRECT:
        Sample.INSTANCE.play$Object(Assets$Sounds.TELEPORT);
        ScrollOfTeleportation.appearVFX(Dungeon.hero);
        SpellSprite.show$Char$int(Dungeon.hero, SpellSprite.ANKH);
        new Flare()._Flare(5, 16).color$int$boolean(16776960, true).show$Visual$float(this.hero, 4);
        break;
      case InterlevelScene$Mode.RETURN:
        if (Dungeon.level.pit[Dungeon.hero.pos] && !Dungeon.hero.flying) {
          Game.runOnRenderThread(new (GameScene$2())().$o(this));
        } else {
          ScrollOfTeleportation.appearVFX(Dungeon.hero);
        }
        break;
      case InterlevelScene$Mode.DESCEND:
      case InterlevelScene$Mode.FALL:
        if (Dungeon.hero.isAlive()) {
          Badges.validateNoKilling();
        }
        break;
    }
    let dropped = Dungeon.droppedItems.get(Dungeon.depth);
    if (dropped != null) {
      for (const $it7 = dropped.iterator(); $it7.hasNext(); ) {
        let item = $it7.next();
        let pos = Dungeon.level.randomRespawnCell(null);
        if (pos === -1) {
          pos = Dungeon.level.entrance();
        }
        if (item instanceof Potion) {
          (item).shatter(pos);
        } else if (item instanceof Plant$Seed && !Dungeon.isChallenged(Challenges.NO_HERBALISM)) {
          Dungeon.level.plant(item, pos);
        } else if (item instanceof Honeypot) {
          Dungeon.level.drop((item).shatter(null, pos), pos);
        } else {
          Dungeon.level.drop(item, pos);
        }
      }
      Dungeon.droppedItems.remove(Dungeon.depth);
    }
    Dungeon.hero.next();
    switch (InterlevelScene.mode) {
      case InterlevelScene$Mode.FALL:
      case InterlevelScene$Mode.DESCEND:
      case InterlevelScene$Mode.CONTINUE:
        Camera.main.snapTo$float$float(this.hero.center$().x, Math.fround(this.hero.center$().y - Math.fround(DungeonTilemap.SIZE * (Math.fround(PixelScene.defaultZoom / Camera.main.zoom_)))));
        break;
      case InterlevelScene$Mode.ASCEND:
        Camera.main.snapTo$float$float(this.hero.center$().x, Math.fround(this.hero.center$().y + Math.fround(DungeonTilemap.SIZE * (Math.fround(PixelScene.defaultZoom / Camera.main.zoom_)))));
        break;
      default:
        Camera.main.snapTo$float$float(this.hero.center$().x, this.hero.center$().y);
    }
    Camera.main.panTo(this.hero.center$(), 2.5);
    if (InterlevelScene.mode !== InterlevelScene$Mode.NONE) {
      if (Dungeon.depth === Statistics.deepestFloor && (InterlevelScene.mode === InterlevelScene$Mode.DESCEND || InterlevelScene.mode === InterlevelScene$Mode.FALL)) {
        GLog.h(Messages.get$Object$String$ObjectArr(this, 'descend', []), [Dungeon.depth]);
        Sample.INSTANCE.play$Object(Assets$Sounds.DESCEND);
        for (const $it8 = Actor.chars().iterator(); $it8.hasNext(); ) {
          let ch = $it8.next();
          if (ch instanceof DriedRose$GhostHero) {
            (ch).sayAppeared();
          }
        }
        let spawnersAbove = Statistics.spawnersAlive;
        if (spawnersAbove > 0 && Dungeon.depth <= 25) {
          for (const $it9 = Dungeon.level.mobs.iterator(); $it9.hasNext(); ) {
            let m = $it9.next();
            if (m instanceof DemonSpawner && (m).spawnRecorded) {
              spawnersAbove--;
            }
          }
          if (spawnersAbove > 0) {
            GLog.newLine();
            if (Dungeon.bossLevel$()) {
              GLog.n(Messages.get$Object$String$ObjectArr(this, 'spawner_warn_final', []), []);
            } else {
              GLog.n(Messages.get$Object$String$ObjectArr(this, 'spawner_warn', []), []);
            }
          }
        }
      } else if (InterlevelScene.mode === InterlevelScene$Mode.RESET) {
        GLog.h(Messages.get$Object$String$ObjectArr(this, 'warp', []), []);
      } else if (InterlevelScene.mode === InterlevelScene$Mode.RESURRECT) {
        GLog.h(Messages.get$Object$String$ObjectArr(this, 'resurrect', []), [Dungeon.depth]);
      } else {
        GLog.h(Messages.get$Object$String$ObjectArr(this, 'return', []), [Dungeon.depth]);
      }
      if (Dungeon.hero.hasTalent(Talent.ROGUES_FORESIGHT) && Dungeon.level instanceof RegularLevel && Dungeon.branch === 0) {
        let reqSecrets = Dungeon.level.feeling === Level$Feeling.SECRETS ? 2 : 1;
        for (const $it10 = (Dungeon.level).rooms().iterator(); $it10.hasNext(); ) {
          let r = $it10.next();
          if (r instanceof SecretRoom) {
            reqSecrets--;
          }
        }
        Random.pushGenerator$long(BigInt.asIntN(64, Dungeon.seedCurDepth() + 1n));
        if (reqSecrets <= 0 && Random.Int$int(4) < ((2 + Dungeon.hero.pointsInTalent(Talent.ROGUES_FORESIGHT)) | 0)) {
          GLog.p(Messages.get$Object$String$ObjectArr(this, 'secret_hint', []), []);
        }
        Random.popGenerator();
      }
      let unspentTalents = false;
      for (let i = 1; i <= Dungeon.hero.talents_.size(); i++) {
        if (Dungeon.hero.talentPointsAvailable(i) > 0) {
          unspentTalents = true;
          break;
        }
      }
      if (unspentTalents) {
        GLog.newLine();
        GLog.w(Messages.get$Object$String$ObjectArr(Dungeon.hero, 'unspent', []), []);
        StatusPane.talentBlink = 10;
        WndHero.lastIdx = 1;
      }
      switch (Dungeon.level.feeling) {
        case Level$Feeling.CHASM:
          GLog.w(Dungeon.level.feeling.desc(), []);
          Notes.add$Landmark(Notes$Landmark.CHASM_FLOOR);
          break;
        case Level$Feeling.WATER:
          GLog.w(Dungeon.level.feeling.desc(), []);
          Notes.add$Landmark(Notes$Landmark.WATER_FLOOR);
          break;
        case Level$Feeling.GRASS:
          GLog.w(Dungeon.level.feeling.desc(), []);
          Notes.add$Landmark(Notes$Landmark.GRASS_FLOOR);
          break;
        case Level$Feeling.DARK:
          GLog.w(Dungeon.level.feeling.desc(), []);
          Notes.add$Landmark(Notes$Landmark.DARK_FLOOR);
          break;
        case Level$Feeling.LARGE:
          GLog.w(Dungeon.level.feeling.desc(), []);
          Notes.add$Landmark(Notes$Landmark.LARGE_FLOOR);
          break;
        case Level$Feeling.TRAPS:
          GLog.w(Dungeon.level.feeling.desc(), []);
          Notes.add$Landmark(Notes$Landmark.TRAPS_FLOOR);
          break;
        case Level$Feeling.SECRETS:
          GLog.w(Dungeon.level.feeling.desc(), []);
          Notes.add$Landmark(Notes$Landmark.SECRETS_FLOOR);
          break;
      }
      for (const $it11 = Dungeon.level.mobs.iterator(); $it11.hasNext(); ) {
        let mob = $it11.next();
        if (!mob.buffs$Class($J.cls(ChampionEnemy)).isEmpty()) {
          GLog.w(Messages.get$Class$String$ObjectArr($J.cls(ChampionEnemy), 'warn', []), []);
        }
      }
      if (Dungeon.hero.buff($J.cls(AscensionChallenge)) != null) {
        Dungeon.hero.buff($J.cls(AscensionChallenge)).saySwitch();
      }
      DimensionalSundial.sundialWarned = true;
      if (DimensionalSundial.spawnMultiplierAtCurrentTime() > Math.fround(1)) {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(DimensionalSundial), 'warning', []), []);
      } else {
        DimensionalSundial.sundialWarned = false;
      }
      InterlevelScene.mode = InterlevelScene$Mode.NONE;
    }
    if (SPDSettings.intro$()) {
      if (Document.ADVENTURERS_GUIDE.isPageFound$String(Document.GUIDE_INTRO)) {
        GameScene.flashForDocument(Document.ADVENTURERS_GUIDE, Document.GUIDE_INTRO);
      } else if (ControllerHandler.isControllerConnected()) {
        GameLog.wipe();
        GLog.p(Messages.get$Class$String$ObjectArr($J.cls(GameScene), 'tutorial_move_controller', []), []);
      } else if (SPDSettings.interfaceSize$() === 0) {
        GameLog.wipe();
        GLog.p(Messages.get$Class$String$ObjectArr($J.cls(GameScene), 'tutorial_move_mobile', []), []);
      } else {
        GameLog.wipe();
        GLog.p(Messages.get$Class$String$ObjectArr($J.cls(GameScene), 'tutorial_move_desktop', []), []);
      }
      this.toolbar.visible_ = this.toolbar.active = false;
      this.status_.visible_ = this.status_.active = false;
      if (this.inventory != null) {
        this.inventory.visible_ = this.inventory.active = false;
      }
    }
    if (!SPDSettings.intro$() && Rankings.INSTANCE.totalNumber > 0 && !Document.ADVENTURERS_GUIDE.isPageRead$String(Document.GUIDE_DIEING)) {
      GameScene.flashForDocument(Document.ADVENTURERS_GUIDE, Document.GUIDE_DIEING);
    }
    let cata = Dungeon.hero.belongings.getItem($J.cls(TrinketCatalyst));
    if (cata != null && cata.hasRolledTrinkets()) {
      this.addToFront(new TrinketCatalyst$WndTrinket()._TrinketCatalyst$WndTrinket(cata));
    }
    if (!GameScene.invVisible) {
      GameScene.toggleInvPane();
    }
    this.fadeIn$();
    if (!Dungeon.hero.isAlive()) {
      let ankh = null;
      for (const $it12 = Dungeon.hero.belongings.getAllItems($J.cls(Ankh)).iterator(); $it12.hasNext(); ) {
        let i = $it12.next();
        if (!i.isBlessed()) {
          ankh = i;
        }
      }
      if (ankh != null && GamesInProgress.gameExists(GamesInProgress.curSlot)) {
        this.add$Gizmo(new WndResurrect()._WndResurrect(ankh));
      } else {
        GameScene.gameOver();
      }
    }
  }
  destroy(): void {
    if (!this.waitForActorThread(4500, true)) {
      let t = new Throwable();
      t.setStackTrace(GameScene.actorThread.getStackTrace());
      throw new RuntimeException('timeout waiting for actor thread! ', t);
    }
    Emitter.freezeEmitters = false;
    GameScene.scene = null;
    Badges.saveGlobal$();
    Journal.saveGlobal$();
    super.destroy();
  }
  static endActorThread(): void {
    if (GameScene.actorStarted) {
      Actor.interruptProcessing();
      GameScene.actorStarted = false;
    }
  }
  waitForActorThread(msToWait: number, interrupt: boolean): boolean {
    if (!GameScene.actorStarted) {
      return true;
    }
    if (interrupt) {
      Actor.interruptProcessing();
    }
    return !Actor.processing();
  }
  onPause(): void {
    try {
      if (!Dungeon.hero.ready_) {
        this.waitForActorThread(500, false);
      }
      Dungeon.saveAll();
      Badges.saveGlobal$();
      Journal.saveGlobal$();
    } catch ($e13) {
      if ($J.isa($e13, IOException)) {
        let e = $J.exc($e13);
        Game.reportException(e);
      } else {
        throw $e13;
      }
    }
  }
  update(): void {
    GameScene.lastOffset = null;
    if (GameScene.updateItemDisplays) {
      GameScene.updateItemDisplays = false;
      QuickSlotButton.refresh();
      InventoryPane.refresh();
      if (ActionIndicator.action instanceof MeleeWeapon$Charger) {
        ActionIndicator.refresh();
      }
    }
    if (Dungeon.hero == null || GameScene.scene == null) {
      return;
    }
    super.update();
    if (this.notifyDelay > Math.fround(0)) {
      this.notifyDelay = Math.fround(this.notifyDelay - Game.elapsed);
    }
    if (!Emitter.freezeEmitters) {
      GameScene.waterOfs = Math.fround(GameScene.waterOfs - Math.fround(5 * Game.elapsed));
      this.water.offsetTo(0, GameScene.waterOfs);
      GameScene.waterOfs = this.water.offsetY();
    }
    if (Actor.resumable()) {
      Actor.process();
    } else if (!Actor.processing() && Dungeon.hero.isAlive()) {
      if (!GameScene.actorStarted) {
        GameScene.actorStarted = true;
        Actor.keepActorThreadAlive = true;
        Actor.process();
      } else if (this.notifyDelay <= 0) {
        this.notifyDelay = Math.fround(this.notifyDelay + Math.fround(1 / 60));
        Actor.process();
      }
    }
    if (Dungeon.hero.ready_ && Dungeon.hero.paralysed === 0) {
      this.log.newLine();
    }
    if (GameScene.updateTags) {
      this.tagAttack = this.attack.active;
      this.tagLoot = this.loot.visible_;
      this.tagAction = this.action.visible_;
      this.tagResume = this.resume_.visible_;
      GameScene.layoutTags();
    } else if (this.tagAttack !== this.attack.active || this.tagLoot !== this.loot.visible_ || this.tagAction !== this.action.visible_ || this.tagResume !== this.resume_.visible_) {
      let tagAppearing = (this.attack.active && !this.tagAttack) || (this.loot.visible_ && !this.tagLoot) || (this.action.visible_ && !this.tagAction) || (this.resume_.visible_ && !this.tagResume);
      this.tagAttack = this.attack.active;
      this.tagLoot = this.loot.visible_;
      this.tagAction = this.action.visible_;
      this.tagResume = this.resume_.visible_;
      if (tagAppearing) {
        GameScene.layoutTags();
      } else {
        GameScene.tagDisappeared = true;
      }
    }
    GameScene.cellSelector.enable(Dungeon.hero.ready_);
    if (!this.toDestroy.isEmpty()) {
      for (const $it14 = this.toDestroy.iterator(); $it14.hasNext(); ) {
        let g = $it14.next();
        g.destroy();
      }
      this.toDestroy.clear();
    }
  }
  erase(g: Gizmo): Gizmo {
    let result = super.erase(g);
    if (result instanceof Window) {
      GameScene.lastOffset = (result).getOffset();
    }
    return result;
  }
  static layoutTags(): void {
    GameScene.updateTags = false;
    if (GameScene.scene == null) {
      return;
    }
    if (GameScene.scene.inventory != null && GameScene.scene.inventory.visible_ && (PixelScene.uiCamera.width_ < 460 && PixelScene.uiCamera.height_ < 300)) {
      Camera.main.setCenterOffset(0, Math.fround((Math.min((300 - PixelScene.uiCamera.height_) | 0, (460 - PixelScene.uiCamera.width_) | 0)) / Camera.main.zoom_));
    } else {
      Camera.main.setCenterOffset(0, 0);
    }
    let insets = Game.platform.getSafeInsets(PlatformSupport.INSET_ALL);
    insets = insets.scale(Math.fround(1 / PixelScene.uiCamera.zoom_));
    let tagsOnLeft = SPDSettings.flipTags$();
    let tagWidth = Math.fround(Tag.SIZE + (tagsOnLeft ? insets.left_ : insets.right_));
    let tagLeft = tagsOnLeft ? 0 : Math.fround(PixelScene.uiCamera.width_ - tagWidth);
    let y = SPDSettings.interfaceSize$() === 0 ? Math.fround(GameScene.scene.toolbar.top() - 2) : Math.fround(GameScene.scene.status_.top() - 2);
    if (SPDSettings.interfaceSize$() === 0) {
      if (tagsOnLeft) {
        GameScene.scene.log.setRect(tagWidth, y, Math.fround(Math.fround(PixelScene.uiCamera.width_ - tagWidth) - insets.right_), 0);
      } else {
        GameScene.scene.log.setRect(insets.left_, y, Math.fround(Math.fround(PixelScene.uiCamera.width_ - tagWidth) - insets.left_), 0);
      }
    } else {
      if (tagsOnLeft) {
        GameScene.scene.log.setRect(tagWidth, y, Math.fround(160 - tagWidth), 0);
      } else {
        GameScene.scene.log.setRect(insets.left_, y, Math.fround(160 - insets.left_), 0);
      }
    }
    let pos = GameScene.scene.toolbar.top();
    if (tagsOnLeft && SPDSettings.interfaceSize$() > 0) {
      pos = GameScene.scene.status_.top();
    }
    if (GameScene.scene.tagAttack) {
      GameScene.scene.attack.setRect(tagLeft, Math.fround(pos - Tag.SIZE), tagWidth, Math.fround(Tag.SIZE));
      GameScene.scene.attack.flip(tagsOnLeft);
      pos = GameScene.scene.attack.top();
    }
    if (GameScene.scene.tagLoot) {
      GameScene.scene.loot.setRect(tagLeft, Math.fround(pos - Tag.SIZE), tagWidth, Math.fround(Tag.SIZE));
      GameScene.scene.loot.flip(tagsOnLeft);
      pos = GameScene.scene.loot.top();
    }
    if (GameScene.scene.tagAction) {
      GameScene.scene.action.setRect(tagLeft, Math.fround(pos - Tag.SIZE), tagWidth, Math.fround(Tag.SIZE));
      GameScene.scene.action.flip(tagsOnLeft);
      pos = GameScene.scene.action.top();
    }
    if (GameScene.scene.tagResume) {
      GameScene.scene.resume_.setRect(tagLeft, Math.fround(pos - Tag.SIZE), tagWidth, Math.fround(Tag.SIZE));
      GameScene.scene.resume_.flip(tagsOnLeft);
    }
  }
  onBackPressed(): void {
    if (!GameScene.cancel()) {
      this.add$Gizmo(new WndGame()._WndGame());
    }
  }
  addCustomTile(visual: CustomTilemap): void {
    let t = visual.create();
    this.customTiles.add$Gizmo(t);
    this.customTilemaps.add(t);
  }
  addCustomTerrain(visual: CustomTilemap): void {
    let t = visual.create();
    this.customTerrain.add$Gizmo(t);
    this.customTilemaps.add(t);
  }
  addCustomWall(visual: CustomTilemap): void {
    let t = visual.create();
    this.customWalls.add$Gizmo(t);
    this.customTilemaps.add(t);
  }
  addHeapSprite(heap: Heap): void {
    let sprite = heap.sprite_ = this.heaps.recycle($J.cls(ItemSprite));
    sprite.revive();
    sprite.link$Heap(heap);
    this.heaps.add$Gizmo(sprite);
  }
  addDiscardedSprite(heap: Heap): void {
    heap.sprite_ = this.heaps.recycle($J.cls(DiscardedItemSprite));
    heap.sprite_.revive();
    heap.sprite_.link$Heap(heap);
    this.heaps.add$Gizmo(heap.sprite_);
  }
  addBlobSprite(gas: Blob): void {
    if (gas.emitter_ == null) {
      this.gases.add$Gizmo(new BlobEmitter()._BlobEmitter(gas));
    }
  }
  addMobSprite(mob: Mob): void {
    let sprite = mob.sprite();
    sprite.visible_ = sprite.visibleOutOfFFOV || Dungeon.level.heroFOV[mob.pos];
    this.mobs.add$Gizmo(sprite);
    sprite.link(mob);
    GameScene.sortMobSprites();
  }
  static sortMobSprites(): void {
    if (GameScene.scene != null) {
      {
        GameScene.scene.mobs.sort((a, b) => {
          if (a instanceof Visual && b instanceof Visual) {
            return $J.d2i(Math.fround(Math.sign(Math.fround((Math.fround((a).y + (a).height())) - (Math.fround((b).y + (b).height()))))));
          } else if (a instanceof Visual) {
            return -1;
          } else if (b instanceof Visual) {
            return 1;
          } else {
            return 0;
          }
        });
      }
    }
  }
  prompt(text: string): void {
    if (this.prompt_ != null) {
      this.prompt_.killAndErase();
      this.toDestroy.add(this.prompt_);
      this.prompt_ = null;
    }
    if (text != null) {
      this.prompt_ = new (GameScene$4())().$o(this)._Toast(text);
      this.prompt_.camera_ = PixelScene.uiCamera;
      this.prompt_.setPos(Math.fround((Math.fround(PixelScene.uiCamera.width_ - this.prompt_.width())) / 2), Math.fround((PixelScene.uiCamera.height_ - 60) | 0));
      if (this.inventory != null && this.inventory.visible_ && this.prompt_.right() > Math.fround(this.inventory.left() - 10)) {
        this.prompt_.setPos(Math.fround(Math.fround(this.inventory.left() - this.prompt_.width()) - 10), this.prompt_.top());
      }
      this.add$Gizmo(this.prompt_);
    }
  }
  showBanner(banner: Banner): void {
    banner.camera_ = PixelScene.uiCamera;
    let offset = Camera.main.centerOffset.y;
    banner.x = PixelScene.align$Camera$float(PixelScene.uiCamera, Math.fround((Math.fround(PixelScene.uiCamera.width_ - banner.width_)) / 2));
    banner.y = PixelScene.align$Camera$float(PixelScene.uiCamera, Math.fround(Math.fround(Math.fround((Math.fround(PixelScene.uiCamera.height_ - banner.height_)) / 2) - 32) - offset));
    this.addToFront(banner);
  }
  static add$Blob(gas: Blob): void {
    Actor.add$Actor(gas);
    if (GameScene.scene != null) {
      GameScene.scene.addBlobSprite(gas);
    }
  }
  static add$Heap(heap: Heap): void {
    if (GameScene.scene != null) {
      heap.autoExplored = true;
      GameScene.scene.addHeapSprite(heap);
    }
  }
  static discard(heap: Heap): void {
    if (GameScene.scene != null) {
      GameScene.scene.addDiscardedSprite(heap);
    }
  }
  static add$Mob(mob: Mob): void {
    GameScene.add$Mob$float(mob, 0);
  }
  static addSprite(mob: Mob): void {
    GameScene.scene.addMobSprite(mob);
  }
  static add$Mob$float(mob: Mob, delay: number): void {
    Dungeon.level.mobs.add(mob);
    delay = Math.fround(Math.fround(Math.ceil(Math.fround(Actor.now() + delay))) - Actor.now());
    if (GameScene.scene != null) {
      GameScene.scene.addMobSprite(mob);
      Actor.addDelayed(mob, delay);
      mob.spendToWhole();
    }
  }
  static add$EmoIcon(icon: EmoIcon): void {
    GameScene.scene.emoicons.add$Gizmo(icon);
  }
  static add$CharHealthIndicator(indicator: CharHealthIndicator): void {
    if (GameScene.scene != null) {
      GameScene.scene.healthIndicators.add$Gizmo(indicator);
    }
  }
  static add$CustomTilemap$boolean(t: CustomTilemap, wall: boolean): void {
    if (GameScene.scene == null) {
      return;
    }
    if (wall) {
      GameScene.scene.addCustomWall(t);
    } else {
      GameScene.scene.addCustomTile(t);
    }
  }
  static effect(effect: Visual): void {
    if (GameScene.scene != null) {
      GameScene.scene.effects.add$Gizmo(effect);
    }
  }
  static effectOverFog(effect: Visual): void {
    if (GameScene.scene != null) {
      GameScene.scene.overFogEffects.add$Gizmo(effect);
    }
  }
  static checkedCell(pos: number, source: number): CheckedCell {
    if (GameScene.scene != null) {
      let check = GameScene.scene.checkedCells.recycle($J.cls(CheckedCell));
      check.reset(pos, source);
      return check;
    } else {
      return null;
    }
  }
  static targetedCell$int$int$float(pos: number, color: number, delay: number): TargetedCell {
    return GameScene.targetedCell$int$float(pos, delay);
  }
  static targetedCell$int$float(pos: number, delay: number): TargetedCell {
    if (GameScene.scene != null) {
      let cell: TargetedCell;
      {
        if (TargetedCell.cells.containsKey(pos)) {
          cell = TargetedCell.cells.get(pos);
          cell.reset(pos, Math.fround(Actor.now() + delay));
          return cell;
        }
      }
      cell = GameScene.scene.targetedCells.recycle($J.cls(TargetedCell));
      cell.reset(pos, Math.fround(Actor.now() + delay));
      return cell;
    } else {
      return null;
    }
  }
  static ripple(pos: number): Ripple {
    if (GameScene.scene != null) {
      let ripple = GameScene.scene.ripples.recycle($J.cls(Ripple));
      ripple.reset(pos);
      return ripple;
    } else {
      return null;
    }
  }
  static spellSprite(): SpellSprite {
    return GameScene.scene.spells.recycle($J.cls(SpellSprite));
  }
  static emitter(): Emitter {
    if (GameScene.scene != null) {
      let emitter = GameScene.scene.emitters.recycle($J.cls(Emitter));
      emitter.revive();
      return emitter;
    } else {
      return null;
    }
  }
  static floorEmitter(): Emitter {
    if (GameScene.scene != null) {
      let emitter = GameScene.scene.floorEmitters.recycle($J.cls(Emitter));
      emitter.revive();
      return emitter;
    } else {
      return null;
    }
  }
  static status(): FloatingText {
    return GameScene.scene != null ? GameScene.scene.statuses.recycle($J.cls(FloatingText)) : null;
  }
  static pickUp(item: Item, pos: number): void {
    if (GameScene.scene != null) {
      GameScene.scene.toolbar.pickup(item, pos);
    }
  }
  static pickUpJournal(item: Item, pos: number): void {
    if (GameScene.scene != null) {
      GameScene.scene.menu.pickup(item, pos);
    }
  }
  static flashForDocument(doc: Document, page: string): void {
    if (GameScene.scene != null) {
      if (doc === Document.ADVENTURERS_GUIDE) {
        if (!$J.equals(page, Document.GUIDE_INTRO)) {
          if (SPDSettings.interfaceSize$() === 0) {
            GLog.p(Messages.get$Class$String$ObjectArr($J.cls(Guidebook), 'hint_mobile', []), []);
          } else {
            GLog.p(Messages.get$Class$String$ObjectArr($J.cls(Guidebook), 'hint_desktop', [KeyBindings.getKeyName(KeyBindings.getFirstKeyForAction(SPDAction.JOURNAL, ControllerHandler.isControllerConnected()))]), []);
          }
        }
        Dungeon.hero.sprite_.showStatus(CharSprite.POSITIVE, Messages.get$Class$String$ObjectArr($J.cls(Guidebook), 'hint_status', []), []);
      }
      GameScene.scene.menu.flashForPage(doc, page);
    }
  }
  static endIntro(): void {
    if (GameScene.scene != null) {
      SPDSettings.intro$boolean(false);
      GameScene.scene.add$Gizmo(new (GameScene$5())()._Tweener(GameScene.scene, 2));
      GameLog.wipe();
      if (SPDSettings.interfaceSize$() === 0) {
        GLog.p(Messages.get$Class$String$ObjectArr($J.cls(GameScene), 'tutorial_ui_mobile', []), []);
      } else {
        GLog.p(Messages.get$Class$String$ObjectArr($J.cls(GameScene), 'tutorial_ui_desktop', [KeyBindings.getKeyName(KeyBindings.getFirstKeyForAction(SPDAction.HERO_INFO, ControllerHandler.isControllerConnected())), KeyBindings.getKeyName(KeyBindings.getFirstKeyForAction(SPDAction.INVENTORY, ControllerHandler.isControllerConnected()))]), []);
      }
      for (let i = 0; i < Dungeon.level.length(); i++) {
        if (Dungeon.level.map_[i] === Terrain.SECRET_DOOR) {
          Dungeon.level.discover(i);
          GameScene.discoverTile(i, Terrain.SECRET_DOOR);
        }
      }
    }
  }
  static updateKeyDisplay(): void {
    if (GameScene.scene != null && GameScene.scene.menu != null) {
      GameScene.scene.menu.updateKeys();
    }
  }
  static showlevelUpStars(): void {
    if (GameScene.scene != null && GameScene.scene.status_ != null) {
      GameScene.scene.status_.showStarParticles();
    }
  }
  static updateAvatar(): void {
    if (GameScene.scene != null && GameScene.scene.status_ != null) {
      GameScene.scene.status_.updateAvatar();
    }
  }
  static resetMap(): void {
    if (GameScene.scene != null) {
      GameScene.scene.tiles.map(Dungeon.level.map_, Dungeon.level.width());
      GameScene.scene.occlusion.map(Dungeon.level.map_, Dungeon.level.width());
      GameScene.scene.visualGrid.map(Dungeon.level.map_, Dungeon.level.width());
      GameScene.scene.terrainFeatures.map(Dungeon.level.map_, Dungeon.level.width());
      GameScene.scene.raisedTerrain.map(Dungeon.level.map_, Dungeon.level.width());
      GameScene.scene.walls.map(Dungeon.level.map_, Dungeon.level.width());
    }
    GameScene.updateFog$();
  }
  static updateMap$(): void {
    if (GameScene.scene != null) {
      GameScene.scene.tiles.updateMap();
      GameScene.scene.occlusion.updateMap();
      GameScene.scene.visualGrid.updateMap();
      GameScene.scene.terrainFeatures.updateMap();
      GameScene.scene.raisedTerrain.updateMap();
      GameScene.scene.walls.updateMap();
      for (const $it15 = GameScene.scene.customTilemaps.iterator(); $it15.hasNext(); ) {
        let cust = $it15.next();
        cust.updateMap();
      }
      GameScene.updateFog$();
    }
  }
  static updateMap$int(cell: number): void {
    if (GameScene.scene != null) {
      GameScene.scene.tiles.updateMapCell(cell);
      GameScene.scene.occlusion.updateMapCell(cell);
      GameScene.scene.visualGrid.updateMapCell(cell);
      GameScene.scene.terrainFeatures.updateMapCell(cell);
      GameScene.scene.raisedTerrain.updateMapCell(cell);
      GameScene.scene.walls.updateMapCell(cell);
      for (const $it16 = GameScene.scene.customTilemaps.iterator(); $it16.hasNext(); ) {
        let cust = $it16.next();
        cust.updateMapCell(cell);
      }
      GameScene.updateFog$int$int(cell, 1);
    }
  }
  static plantSeed(cell: number): void {
    if (GameScene.scene != null) {
      GameScene.scene.terrainFeatures.growPlant(cell);
    }
  }
  static discoverTile(pos: number, oldValue: number): void {
    if (GameScene.scene != null) {
      GameScene.scene.tiles.discover(pos, oldValue);
    }
  }
  static show(wnd: Window): void {
    if (GameScene.scene != null) {
      GameScene.cancel();
      if (GameScene.scene.inventory != null && GameScene.scene.inventory.visible_) {
        let offsetToInherit = null;
        for (const $it17 = GameScene.scene.members.iterator(); $it17.hasNext(); ) {
          let g = $it17.next();
          if (g instanceof Window) {
            offsetToInherit = (g).getOffset();
          }
        }
        if (GameScene.lastOffset != null) {
          offsetToInherit = GameScene.lastOffset;
        }
        if (offsetToInherit != null && !offsetToInherit.isZero()) {
          wnd.offset$Point(offsetToInherit);
          wnd.boundOffsetWithMargin(3);
        }
      }
      GameScene.scene.addToFront(wnd);
    }
  }
  static showingWindow(): boolean {
    if (GameScene.scene == null) {
      return false;
    }
    for (const $it18 = GameScene.scene.members.iterator(); $it18.hasNext(); ) {
      let g = $it18.next();
      if (g instanceof Window) {
        return true;
      }
    }
    return false;
  }
  static interfaceBlockingHero(): boolean {
    if (GameScene.scene == null) {
      return false;
    }
    if (GameScene.showingWindow()) {
      return true;
    }
    if (GameScene.scene.inventory != null && GameScene.scene.inventory.isSelecting()) {
      return true;
    }
    return false;
  }
  static toggleInvPane(): void {
    if (GameScene.scene != null && GameScene.scene.inventory != null) {
      if (GameScene.scene.inventory.visible_) {
        GameScene.scene.inventory.visible_ = GameScene.scene.inventory.active = GameScene.invVisible = false;
        GameScene.scene.toolbar.setPos(GameScene.scene.toolbar.left(), Math.fround(PixelScene.uiCamera.height_ - GameScene.scene.toolbar.height()));
      } else {
        GameScene.scene.inventory.visible_ = GameScene.scene.inventory.active = GameScene.invVisible = true;
        GameScene.scene.toolbar.setPos(GameScene.scene.toolbar.left(), Math.fround(GameScene.scene.inventory.top() - GameScene.scene.toolbar.height()));
      }
      GameScene.layoutTags();
    }
  }
  static centerNextWndOnInvPane(): void {
    if (GameScene.scene != null && GameScene.scene.inventory != null && GameScene.scene.inventory.visible_) {
      GameScene.lastOffset = new Point()._Point$int$int(($J.d2i(GameScene.scene.inventory.centerX()) - $J.idiv(PixelScene.uiCamera.width_, 2)) | 0, ($J.d2i(GameScene.scene.inventory.centerY()) - $J.idiv(PixelScene.uiCamera.height_, 2)) | 0);
    }
  }
  static nextWndOffset(ofs: Point): void {
    if (GameScene.scene != null) {
      GameScene.lastOffset = ofs;
    }
  }
  static updateFog$(): void {
    if (GameScene.scene != null) {
      GameScene.scene.fog.updateFog$();
      GameScene.scene.wallBlocking.updateMap();
    }
  }
  static updateFog$int$int$int$int(x: number, y: number, w: number, h: number): void {
    if (GameScene.scene != null) {
      GameScene.scene.fog.updateFogArea(x, y, w, h);
      GameScene.scene.wallBlocking.updateArea$int$int$int$int(x, y, w, h);
    }
  }
  static updateFog$int$int(cell: number, radius: number): void {
    if (GameScene.scene != null) {
      GameScene.scene.fog.updateFog$int$int(cell, radius);
      GameScene.scene.wallBlocking.updateArea$int$int(cell, radius);
    }
  }
  static afterObserve(): void {
    if (GameScene.scene != null) {
      for (let mob of $J.toArrayInto(Dungeon.level.mobs.toArray(), $J.newArray(0, null))) {
        if (mob.sprite_ != null) {
          if (mob instanceof Mimic && mob.state_ === mob.PASSIVE && (mob).stealthy() && Dungeon.level.visited[mob.pos]) {
            mob.sprite_.visible_ = true;
          } else {
            mob.sprite_.visible_ = mob.sprite_.visibleOutOfFFOV || Dungeon.level.heroFOV[mob.pos];
          }
        }
        if (mob instanceof Ghoul) {
          for (const $it19 = mob.buffs$Class($J.cls(Ghoul$GhoulLifeLink)).iterator(); $it19.hasNext(); ) {
            let link = $it19.next();
            link.updateVisibility();
          }
        }
      }
    }
  }
  static flash$int(color: number): void {
    GameScene.flash$int$boolean(color, true);
  }
  static flash$int$boolean(color: number, lightmode: boolean): void {
    if (GameScene.scene != null) {
      Game.runOnRenderThread(new (GameScene$6())().$c(color, lightmode));
    }
  }
  static gameOver(): void {
    if (GameScene.scene == null) {
      return;
    }
    let gameOver = new Banner()._Banner$Image(BannerSprites.get(BannerSprites$Type.GAME_OVER));
    gameOver.show$int$float(0, 2);
    GameScene.scene.showBanner(gameOver);
    let restart = new (GameScene$7())().$c(gameOver)._StyledButton$Type$String$int(Chrome$Type.GREY_BUTTON_TR, Messages.get$Class$String$ObjectArr($J.cls(StartScene), 'new', []), 9);
    restart.icon$Image(Icons.get$Icons(Icons.ENTER));
    restart.alpha$float(0);
    restart.camera_ = PixelScene.uiCamera;
    let offset = Camera.main.centerOffset.y;
    restart.setSize(Math.max(80, restart.reqWidth()), 20);
    restart.setPos(PixelScene.align$Camera$float(PixelScene.uiCamera, Math.fround((Math.fround(restart.camera_.width_ - restart.width())) / 2)), PixelScene.align$Camera$float(PixelScene.uiCamera, Math.fround(Math.fround(Math.fround((Math.fround(restart.camera_.height_ - restart.height())) / 2) + 8) - offset)));
    GameScene.scene.add$Gizmo(restart);
    let menu = new (GameScene$8())().$c(gameOver)._StyledButton$Type$String$int(Chrome$Type.GREY_BUTTON_TR, Messages.get$Class$String$ObjectArr($J.cls(WndKeyBindings), 'menu', []), 9);
    menu.icon$Image(Icons.get$Icons(Icons.PREFS));
    menu.alpha$float(0);
    menu.camera_ = PixelScene.uiCamera;
    menu.setSize(Math.max(80, menu.reqWidth()), 20);
    menu.setPos(PixelScene.align$Camera$float(PixelScene.uiCamera, Math.fround((Math.fround(menu.camera_.width_ - menu.width())) / 2)), Math.fround(restart.bottom() + 2));
    GameScene.scene.add$Gizmo(menu);
  }
  static bossSlain(): void {
    if (Dungeon.hero.isAlive()) {
      let bossSlain = new Banner()._Banner$Image(BannerSprites.get(BannerSprites$Type.BOSS_SLAIN));
      bossSlain.show$int$float$float(16777215, Math.fround(0.3), 5);
      GameScene.scene.showBanner(bossSlain);
      Sample.INSTANCE.play$Object(Assets$Sounds.BOSS);
    }
  }
  static handleCell(cell: number): void {
    GameScene.cellSelector.select(cell, PointerEvent.LEFT);
  }
  static selectCell(listener: CellSelector$Listener): void {
    if (GameScene.cellSelector.listener != null && GameScene.cellSelector.listener !== GameScene.defaultCellListener) {
      GameScene.cellSelector.listener.onSelect(null);
    }
    GameScene.cellSelector.listener = listener;
    GameScene.cellSelector.enabled_ = Dungeon.hero.ready_;
    if (GameScene.scene != null) {
      GameScene.scene.prompt(listener.prompt());
    }
  }
  static cancelCellSelector(): boolean {
    if (GameScene.cellSelector.listener != null && GameScene.cellSelector.listener !== GameScene.defaultCellListener) {
      GameScene.cellSelector.resetKeyHold();
      GameScene.cellSelector.cancel();
      return true;
    } else {
      return false;
    }
  }
  static selectItem(listener: WndBag$ItemSelector): WndBag {
    GameScene.cancel();
    if (GameScene.scene != null) {
      if (GameScene.scene.inventory != null && GameScene.scene.inventory.visible_ && !GameScene.showingWindow()) {
        GameScene.scene.inventory.setSelector(listener);
        return null;
      } else {
        let wnd = WndBag.getBag(listener);
        GameScene.show(wnd);
        return wnd;
      }
    }
    return null;
  }
  saveWindows(): void {
    if (this.members == null) {
      return;
    }
    super.saveWindows();
    if (GameScene.scene != null && GameScene.scene.inventory != null && GameScene.scene.inventory.getSelector() != null) {
      GameScene.savedSelector = GameScene.scene.inventory.getSelector();
    } else {
      for (let g of $J.toArrayInto(this.members.toArray(), $J.newArray(0, null))) {
        if (g instanceof WndBag) {
          GameScene.savedSelector = (g).getSelector();
        } else if (g instanceof InventoryScroll$WndConfirmCancel) {
          GameScene.savedSelector = (g).getItemSelector();
        } else if (g instanceof WndUpgrade) {
          GameScene.savedSelector = (g).getItemSelector();
        }
      }
    }
  }
  restoreWindows(): void {
    super.restoreWindows();
    if (GameScene.savedSelector != null) {
      if (GameScene.scene != null && GameScene.scene.inventory != null) {
        GameScene.scene.inventory.setSelector(GameScene.savedSelector);
      } else {
        this.addToFront(new WndBag()._WndBag$Bag$ItemSelector(Dungeon.hero.belongings.backpack, GameScene.savedSelector));
      }
      GameScene.savedSelector = null;
    }
  }
  static cancel(): boolean {
    GameScene.cellSelector.resetKeyHold();
    if (Dungeon.hero != null && (Dungeon.hero.curAction != null || Dungeon.hero.resting)) {
      Dungeon.hero.curAction = null;
      Dungeon.hero.resting = false;
      return true;
    } else {
      return GameScene.cancelCellSelector();
    }
  }
  static ready(): void {
    GameScene.selectCell(GameScene.defaultCellListener);
    QuickSlotButton.cancel();
    InventoryPane.cancelTargeting();
    if (GameScene.scene != null && GameScene.scene.toolbar != null) {
      GameScene.scene.toolbar.examining = false;
    }
    if (GameScene.tagDisappeared) {
      GameScene.tagDisappeared = false;
      GameScene.updateTags = true;
    }
  }
  static checkKeyHold(): void {
    GameScene.cellSelector.processKeyHold();
  }
  static resetKeyHold(): void {
    GameScene.cellSelector.resetKeyHold();
  }
  static examineCell(cell: number): void {
    if (cell == null || cell < 0 || cell > Dungeon.level.length() || (!Dungeon.level.visited[cell] && !Dungeon.level.mapped[cell])) {
      return;
    }
    let objects = GameScene.getObjectsAtCell(cell);
    if (objects.isEmpty()) {
      GameScene.show(new WndInfoCell()._WndInfoCell(cell));
    } else if (objects.size() === 1) {
      GameScene.examineObject(objects.get(0));
    } else {
      let names = $J.toArrayInto(GameScene.getObjectNames(objects).toArray(), $J.newArray(0, null));
      GameScene.show(new (GameScene$9())().$c(objects)._WndOptions$Image$String$String$StringArr(Icons.get$Icons(Icons.INFO), Messages.get$Class$String$ObjectArr($J.cls(GameScene), 'choose_examine', []), Messages.get$Class$String$ObjectArr($J.cls(GameScene), 'multiple_examine', []), names));
    }
  }
  static getObjectsAtCell(cell: number): ArrayList<any> {
    let objects = new ArrayList();
    let ch = Actor.findChar(cell);
    if (ch != null && ch !== Dungeon.hero) {
      if (Dungeon.level.heroFOV[cell] || Char.hasProp(ch, Char$Property.OBJECT)) {
        objects.add(ch);
      }
    }
    let heap = Dungeon.level.heaps.get(cell);
    if (heap != null && heap.seen) {
      objects.add(heap);
    }
    let plant = Dungeon.level.plants.get(cell);
    if (plant != null) {
      objects.add(plant);
    }
    if (cell === Dungeon.hero.pos) {
      objects.add(Dungeon.hero);
    }
    let trap = Dungeon.level.traps.get(cell);
    if (trap != null && trap.visible_) {
      objects.add(trap);
    }
    return objects;
  }
  static getObjectNames(objects: ArrayList<any>): ArrayList<string> {
    let names = new ArrayList();
    for (const $it20 = objects.iterator(); $it20.hasNext(); ) {
      let obj = $it20.next();
      if (obj instanceof Hero) {
        names.add((obj).className().toUpperCase());
      } else if (obj instanceof Mob) {
        names.add(Messages.titleCase((obj).name()));
      } else if (obj instanceof Heap) {
        names.add(Messages.titleCase((obj).title()));
      } else if (obj instanceof Plant) {
        names.add(Messages.titleCase((obj).name()));
      } else if (obj instanceof Trap) {
        names.add(Messages.titleCase((obj).name()));
      }
    }
    return names;
  }
  static examineObject(o: any): void {
    if (o === Dungeon.hero) {
      GameScene.show(new WndHero()._WndHero());
    } else if (o instanceof Mob && (o).isActive()) {
      GameScene.show(new WndInfoMob()._WndInfoMob(o));
      if (o instanceof Snake && !Document.ADVENTURERS_GUIDE.isPageRead$String(Document.GUIDE_SURPRISE_ATKS)) {
        GameScene.flashForDocument(Document.ADVENTURERS_GUIDE, Document.GUIDE_SURPRISE_ATKS);
      }
    } else if (o instanceof Heap && !(o).isEmpty()) {
      GameScene.show(new WndInfoItem()._WndInfoItem$Heap(o));
    } else if (o instanceof Plant) {
      GameScene.show(new WndInfoPlant()._WndInfoPlant(o));
      Bestiary.setSeen($J.getClass(o));
    } else if (o instanceof Trap) {
      GameScene.show(new WndInfoTrap()._WndInfoTrap(o));
      Bestiary.setSeen($J.getClass(o));
    } else {
      GameScene.show(new WndMessage()._WndMessage(Messages.get$Class$String$ObjectArr($J.cls(GameScene), 'dont_know', [])));
    }
  }
  static $clinit() {
    GameScene.invVisible = true;
    GameScene.actorStarted = false;
    GameScene.updateItemDisplays = false;
    GameScene.tagDisappeared = false;
    GameScene.updateTags = false;
    GameScene.waterOfs = 0;
    GameScene.lastOffset = null;
    GameScene.defaultCellListener = new (GameScene$10())()._CellSelector$Listener();
  }
}

let $GameScene$1: any = null;
/** An anonymous class (GameScene.java:259). */
function GameScene$1(): any {
  return $GameScene$1 ??= $J.local(class extends SkinnedBlock {
    script(): NoosaScript {
      return NoosaScriptNoLighting.get();
    }
    draw(): void {
      Blending.disable();
      super.draw();
      Blending.enable();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene$1', []);
}

let $GameScene$2: any = null;
/** An anonymous class (GameScene.java:576). */
function GameScene$2(): any {
  return $GameScene$2 ??= $J.local(class extends JObject {
    call(): void {
      ScrollOfTeleportation.appearVFX(Dungeon.hero);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene$2', ['com.watabou.utils.Callback']);
}

let $GameScene$4: any = null;
/** An anonymous class (GameScene.java:1120). */
function GameScene$4(): any {
  return $GameScene$4 ??= $J.local(class extends Toast {
    onClose(): void {
      GameScene.cancel();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene$4', []);
}

let $GameScene$5: any = null;
/** An anonymous class (GameScene.java:1311). */
function GameScene$5(): any {
  return $GameScene$5 ??= $J.local(class extends Tweener {
    updateValues(progress: number): void {
      if (progress <= 0.5) {
        GameScene.scene.status_.alpha(Math.fround(2 * progress));
        GameScene.scene.status_.visible_ = GameScene.scene.status_.active = true;
        GameScene.scene.toolbar.visible_ = GameScene.scene.toolbar.active = false;
        if (GameScene.scene.inventory != null) {
          GameScene.scene.inventory.visible_ = GameScene.scene.inventory.active = false;
        }
      } else {
        GameScene.scene.status_.alpha(1);
        GameScene.scene.status_.visible_ = GameScene.scene.status_.active = true;
        GameScene.scene.toolbar.alpha(Math.fround((Math.fround(progress - 0.5)) * 2));
        GameScene.scene.toolbar.visible_ = GameScene.scene.toolbar.active = true;
        if (GameScene.scene.inventory != null) {
          GameScene.scene.inventory.visible_ = GameScene.scene.inventory.active = true;
          GameScene.scene.inventory.alpha(Math.fround((Math.fround(progress - 0.5)) * 2));
        }
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene$5', []);
}

let $GameScene$6: any = null;
/** An anonymous class (GameScene.java:1539). */
function GameScene$6(): any {
  return $GameScene$6 ??= $J.local(class extends JObject {
    call(): void {
      if (GameScene.scene != null) {
        if (this.$cv_color > 0 && this.$cv_color < 16777216) {
          GameScene.scene.fadeIn$int$boolean(-16777216 | this.$cv_color, this.$cv_lightmode);
        } else {
          GameScene.scene.fadeIn$int$boolean(this.$cv_color, this.$cv_lightmode);
        }
      }
    }
    $c($color, $lightmode): this {
      this.$cv_color = $color; this.$cv_lightmode = $lightmode;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene$6', ['com.watabou.utils.Callback']);
}

let $GameScene$7: any = null;
/** An anonymous class (GameScene.java:1562). */
function GameScene$7(): any {
  return $GameScene$7 ??= $J.local(class extends StyledButton {
    onClick(): void {
      GamesInProgress.selectedClass = Dungeon.hero.heroClass;
      GamesInProgress.curSlot = GamesInProgress.firstEmpty();
      Game.switchScene$Class($J.cls(HeroSelectScene));
    }
    update(): void {
      this.alpha$float(Math.fround($J.pow(this.$cv_gameOver.am, 2)));
      super.update();
    }
    $c($gameOver): this {
      this.$cv_gameOver = $gameOver;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene$7', []);
}

let $GameScene$8: any = null;
/** An anonymous class (GameScene.java:1587). */
function GameScene$8(): any {
  return $GameScene$8 ??= $J.local(class extends StyledButton {
    onClick(): void {
      GameScene.show(new WndGame()._WndGame());
    }
    update(): void {
      this.alpha$float(Math.fround($J.pow(this.$cv_gameOver.am, 2)));
      super.update();
    }
    $c($gameOver): this {
      this.$cv_gameOver = $gameOver;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene$8', []);
}

let $GameScene$9: any = null;
/** An anonymous class (GameScene.java:1754). */
function GameScene$9(): any {
  return $GameScene$9 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      GameScene.examineObject(this.$cv_objects.get(index));
    }
    $c($objects): this {
      this.$cv_objects = $objects;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene$9', []);
}

let $GameScene$10$1: any = null;
/** An anonymous class (GameScene.java:1914). */
function GameScene$10$1(): any {
  return $GameScene$10$1 ??= $J.local(class extends RightClickMenu {
    onSelect(index: number): void {
      if (index === 0) {
        GameScene.handleCell(this.$cv_cell);
      } else {
        if (this.$cv_objects.size() === 0) {
          GameScene.show(new WndInfoCell()._WndInfoCell(this.$cv_cell));
        } else {
          GameScene.examineObject(this.$cv_objects.get((index - 1) | 0));
        }
      }
    }
    $c($cell, $objects): this {
      this.$cv_cell = $cell; this.$cv_objects = $objects;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene$10$1', []);
}

let $GameScene$10: any = null;
/** An anonymous class (GameScene.java:1826). */
function GameScene$10(): any {
  return $GameScene$10 ??= $J.local(class extends CellSelector$Listener {
    onSelect(cell: number): void {
      if (Dungeon.hero.handle(cell)) {
        Dungeon.hero.next();
      }
    }
    onRightClick(cell: number): void {
      if (cell == null || cell < 0 || cell > Dungeon.level.length() || (!Dungeon.level.visited[cell] && !Dungeon.level.mapped[cell])) {
        return;
      }
      let objects = GameScene.getObjectsAtCell(cell);
      let textLines = GameScene.getObjectNames(objects);
      let title = null;
      let image = null;
      if (objects.isEmpty()) {
        title = WndInfoCell.cellName(cell);
        image = WndInfoCell.cellImage(cell);
      } else if (objects.size() > 1) {
        title = Messages.get$Class$String$ObjectArr($J.cls(GameScene), 'multiple', []);
        image = Icons.get$Icons(Icons.INFO);
      } else if (objects.get(0) instanceof Hero) {
        title = textLines.removeAt(0);
        image = HeroSprite.avatar$Hero(objects.get(0));
      } else if (objects.get(0) instanceof Mob) {
        title = textLines.removeAt(0);
        image = (objects.get(0)).sprite();
      } else if (objects.get(0) instanceof Heap) {
        title = textLines.removeAt(0);
        image = new ItemSprite()._ItemSprite$Heap(objects.get(0));
      } else if (objects.get(0) instanceof Plant) {
        title = textLines.removeAt(0);
        image = TerrainFeaturesTilemap.tile(cell, Dungeon.level.map_[cell]);
      } else if (objects.get(0) instanceof Trap) {
        title = textLines.removeAt(0);
        image = TerrainFeaturesTilemap.tile(cell, Dungeon.level.map_[cell]);
      }
      if (objects.isEmpty()) {
        textLines.add(0, Messages.get$Class$String$ObjectArr($J.cls(GameScene), 'go_here', []));
      } else if (objects.get(0) instanceof Hero) {
        textLines.add(0, Messages.get$Class$String$ObjectArr($J.cls(GameScene), 'cancel', []));
      } else if (objects.get(0) instanceof Mob) {
        if ((objects.get(0)).alignment !== Char$Alignment.ENEMY) {
          textLines.add(0, Messages.get$Class$String$ObjectArr($J.cls(GameScene), 'interact', []));
        } else {
          textLines.add(0, Messages.get$Class$String$ObjectArr($J.cls(GameScene), 'attack', []));
        }
      } else if (objects.get(0) instanceof Heap) {
        switch ((objects.get(0)).type_) {
          case Heap$Type.HEAP:
            textLines.add(0, Messages.get$Class$String$ObjectArr($J.cls(GameScene), 'pick_up', []));
            break;
          case Heap$Type.FOR_SALE:
            textLines.add(0, Messages.get$Class$String$ObjectArr($J.cls(GameScene), 'purchase', []));
            break;
          default:
            textLines.add(0, Messages.get$Class$String$ObjectArr($J.cls(GameScene), 'interact', []));
            break;
        }
      } else if (objects.get(0) instanceof Plant) {
        textLines.add(0, Messages.get$Class$String$ObjectArr($J.cls(GameScene), 'trample', []));
      } else if (objects.get(0) instanceof Trap) {
        textLines.add(0, Messages.get$Class$String$ObjectArr($J.cls(GameScene), 'interact', []));
      }
      if (objects.size() > 1) {
        textLines.add(0, '_' + textLines.removeAt(0) + ':_ ' + textLines.get(0));
        for (let i = 1; i < textLines.size(); i++) {
          textLines.add(i, '_' + Messages.get$Class$String$ObjectArr($J.cls(GameScene), 'examine', []) + ':_ ' + textLines.removeAt(i));
        }
      } else {
        textLines.add(0, '_' + textLines.removeAt(0) + '_');
        textLines.add(1, '_' + Messages.get$Class$String$ObjectArr($J.cls(GameScene), 'examine', []) + '_');
      }
      let menu = new (GameScene$10$1())().$o(this).$c(cell, objects)._RightClickMenu$Image$String$StringArr(image, title, $J.toArrayInto(textLines.toArray(), $J.newArray(0, null)));
      GameScene.scene.addToFront(menu);
      menu.camera_ = PixelScene.uiCamera;
      let mousePos = PointerEvent.currentHoverPos();
      mousePos = menu.camera_.screenToCamera($J.d2i(mousePos.x), $J.d2i(mousePos.y));
      menu.setPos(Math.fround(mousePos.x - 3), Math.fround(mousePos.y - 3));
    }
    prompt(): string {
      return null;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene$10', []);
}

$J.define(GameScene, 'com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene', ctors: { '': '_GameScene' }, meths: { 'flash(int,boolean)': 'flash$int$boolean', 'flash(int)': 'flash$int', 'updateFog(int,int)': 'updateFog$int$int', 'updateFog(int,int,int,int)': 'updateFog$int$int$int$int', 'updateFog()': 'updateFog$', 'updateMap(int)': 'updateMap$int', 'updateMap()': 'updateMap$', 'targetedCell(int,float)': 'targetedCell$int$float', 'targetedCell(int,int,float)': 'targetedCell$int$int$float', 'add(com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap,boolean)': 'add$CustomTilemap$boolean', 'add(com.shatteredpixel.shatteredpixeldungeon.ui.CharHealthIndicator)': 'add$CharHealthIndicator', 'add(com.shatteredpixel.shatteredpixeldungeon.effects.EmoIcon)': 'add$EmoIcon', 'add(com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob,float)': 'add$Mob$float', 'add(com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob)': 'add$Mob', 'add(com.shatteredpixel.shatteredpixeldungeon.items.Heap)': 'add$Heap', 'add(com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob)': 'add$Blob' }, clinit: true, lazy: ['scene', 'cellSelector', 'invVisible', 'actorStarted', 'actorThread', 'updateItemDisplays', 'tagDisappeared', 'updateTags', 'waterOfs', 'lastOffset', 'savedSelector', 'defaultCellListener'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Chrome$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome$Type');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  GamesInProgress = $J.load('com.shatteredpixel.shatteredpixeldungeon.GamesInProgress');
  Rankings = $J.load('com.shatteredpixel.shatteredpixeldungeon.Rankings');
  SPDAction = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDAction');
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  ShatteredPixelDungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ShatteredPixelDungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  AscensionChallenge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AscensionChallenge');
  ChampionEnemy = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ChampionEnemy');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  DemonSpawner = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DemonSpawner');
  Ghoul = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Ghoul');
  Ghoul$GhoulLifeLink = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Ghoul$GhoulLifeLink');
  Mimic = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mimic');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  Snake = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Snake');
  BannerSprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.BannerSprites');
  BannerSprites$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.BannerSprites$Type');
  BlobEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.BlobEmitter');
  CheckedCell = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CheckedCell');
  Flare = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Flare');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  Ripple = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Ripple');
  SpellSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.SpellSprite');
  TargetedCell = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.TargetedCell');
  Ankh = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Ankh');
  Heap = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  Honeypot = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Honeypot');
  DriedRose$GhostHero = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.DriedRose$GhostHero');
  Guidebook = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.journal.Guidebook');
  Potion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion');
  InventoryScroll$WndConfirmCancel = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.InventoryScroll$WndConfirmCancel');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  DimensionalSundial = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.DimensionalSundial');
  TrinketCatalyst = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.TrinketCatalyst');
  TrinketCatalyst$WndTrinket = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.TrinketCatalyst$WndTrinket');
  MeleeWeapon$Charger = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon$Charger');
  Bestiary = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Bestiary');
  Document = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Document');
  Journal = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Journal');
  Notes = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes');
  Notes$Landmark = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes$Landmark');
  Level$Feeling = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level$Feeling');
  RegularLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.RegularLevel');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  SecretRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretRoom');
  Trap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Plant = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Plant');
  Plant$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Plant$Seed');
  CellSelector = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.CellSelector');
  CellSelector$Listener = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.CellSelector$Listener');
  HeroSelectScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.HeroSelectScene');
  InterlevelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene');
  InterlevelScene$Mode = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene$Mode');
  StartScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.StartScene');
  TitleScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.TitleScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  DiscardedItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.DiscardedItemSprite');
  HeroSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.HeroSprite');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  DungeonTerrainTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTerrainTilemap');
  DungeonTileSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTileSheet');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  DungeonWallsTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonWallsTilemap');
  FogOfWar = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.FogOfWar');
  GridTileMap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.GridTileMap');
  RaisedTerrainTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.RaisedTerrainTilemap');
  TerrainFeaturesTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.TerrainFeaturesTilemap');
  WallBlockingTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.WallBlockingTilemap');
  WallOcclusionTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.WallOcclusionTilemap');
  ActionIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ActionIndicator');
  AttackIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.AttackIndicator');
  Banner = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Banner');
  BossHealthBar = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BossHealthBar');
  GameLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.GameLog');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  InventoryPane = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.InventoryPane');
  LootIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.LootIndicator');
  MenuPane = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.MenuPane');
  QuickSlotButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.QuickSlotButton');
  ResumeIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ResumeIndicator');
  RightClickMenu = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RightClickMenu');
  StatusPane = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.StatusPane');
  StyledButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.StyledButton');
  Tag = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Tag');
  TargetHealthIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TargetHealthIndicator');
  Toast = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Toast');
  Toolbar = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Toolbar');
  Window = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Window');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndBag = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag');
  WndGame = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndGame');
  WndHero = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndHero');
  WndInfoCell = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoCell');
  WndInfoItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoItem');
  WndInfoMob = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoMob');
  WndInfoPlant = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoPlant');
  WndInfoTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoTrap');
  WndKeyBindings = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndKeyBindings');
  WndMessage = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndMessage');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  WndResurrect = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndResurrect');
  WndUpgrade = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndUpgrade');
  TextureCache = $J.load('com.watabou.gltextures.TextureCache');
  Blending = $J.load('com.watabou.glwrap.Blending');
  ControllerHandler = $J.load('com.watabou.input.ControllerHandler');
  KeyBindings = $J.load('com.watabou.input.KeyBindings');
  PointerEvent = $J.load('com.watabou.input.PointerEvent');
  Camera = $J.load('com.watabou.noosa.Camera');
  Game = $J.load('com.watabou.noosa.Game');
  Group = $J.load('com.watabou.noosa.Group');
  NoosaScriptNoLighting = $J.load('com.watabou.noosa.NoosaScriptNoLighting');
  PointerArea = $J.load('com.watabou.noosa.PointerArea');
  SkinnedBlock = $J.load('com.watabou.noosa.SkinnedBlock');
  Visual = $J.load('com.watabou.noosa.Visual');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Emitter = $J.load('com.watabou.noosa.particles.Emitter');
  Tweener = $J.load('com.watabou.noosa.tweeners.Tweener');
  GameMath = $J.load('com.watabou.utils.GameMath');
  PlatformSupport = $J.load('com.watabou.utils.PlatformSupport');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
});
