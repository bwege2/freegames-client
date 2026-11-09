// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/TitleBackground.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../jre/index.ts';
import { Component } from '../../../watabou/noosa/ui/Component.ts';

let Assets$Splashes$Title, TextureCache, Game, Group, Image, TextureFilm, Random;

export class TitleBackground extends Component {
  static SCROLL_SPEED: number = 0;
  density: number = 0;
  static ARCH_FILM: TextureFilm = null;
  static archLayer: Group = null;
  static archs: ArrayList<Image> = null;
  static CLUSTER_FILM: TextureFilm = null;
  static clusters: ArrayList<Image> = null;
  static clusterLayer: Group = null;
  static clustersFar: ArrayList<Image> = null;
  static clustersFarLayer: Group = null;
  static SMALL_FILM: TextureFilm = null;
  static smallFars: ArrayList<Image> = null;
  static smallFarLayer: Group = null;
  static MID_FILM: TextureFilm = null;
  static mids1: ArrayList<Image> = null;
  static mids1Layer: Group = null;
  static mids2: ArrayList<Image> = null;
  static mids2Layer: Group = null;
  static smallCloses: ArrayList<Image> = null;
  static smallCloseLayer: Group = null;
  static wasLandscape: boolean = false;
  static oldBaseScale: number = 0;
  static oldWidth: number = 0;
  toMove: ArrayList<Image> = null;
  static INIT_ARCH_CHANCES: number[] = null;
  static arch_chances: number[] = null;
  static INIT_CLUSTER_CHANCES: number[] = null;
  static cluster_chances: number[] = null;
  static INIT_MID_CHANCES: number[] = null;
  static mid_chances: number[] = null;
  static lastMids: ArrayList<number> = null;
  static INIT_SMALL_CHANCES: number[] = null;
  static small_chances: number[] = null;
  static lastSmalls: ArrayList<number> = null;
  _TitleBackground(width: number, height: number): this {
    this._Component();
    this.density = 1;
    this.toMove = new ArrayList();
    this.x = this.y = 0;
    this.width_ = Math.fround(width);
    this.height_ = Math.fround(height);
    this.setupObjects();
    return this;
  }
  static reset(): void {
    TitleBackground.archs = null;
    TitleBackground.clusters = null;
    TitleBackground.clustersFar = null;
    TitleBackground.smallFars = null;
    TitleBackground.mids1 = null;
    TitleBackground.mids2 = null;
    TitleBackground.smallCloses = null;
  }
  setupObjects(): void {
    let landscape = this.width_ > this.height_;
    let scale = Math.fround(this.height_ / 450);
    if (TitleBackground.archs != null && (landscape !== TitleBackground.wasLandscape)) {
      TitleBackground.archs = null;
      TitleBackground.clustersFar = null;
      TitleBackground.clusters = null;
      TitleBackground.smallFarLayer = null;
      TitleBackground.mids1 = null;
      TitleBackground.mids2 = null;
      TitleBackground.smallCloses = null;
    }
    TitleBackground.wasLandscape = landscape;
    TitleBackground.archLayer = new Group()._Group();
    if (TitleBackground.archs == null) {
      TitleBackground.archs = new ArrayList();
    } else {
      this.convertArchLayer(TitleBackground.archs, TitleBackground.archLayer, scale);
    }
    this.add$Gizmo(TitleBackground.archLayer);
    let darkness = new Image()._Image$Object(TextureCache.createGradient([0, 285212672, 570425344, 855638016, 1140850688, -2013265920]));
    darkness.angle = 90;
    darkness.x = this.width_;
    darkness.scale_.x = Math.fround(this.height_ / 6);
    darkness.scale_.y = this.width_;
    this.add$Gizmo(darkness);
    if (!landscape) {
      scale = Math.fround(scale / 1.5);
      TitleBackground.oldBaseScale = Math.fround(TitleBackground.oldBaseScale / 1.5);
    }
    this.density = Math.fround(this.width_ / (Math.fround(800 * scale)));
    this.density = Math.fround((Math.fround(this.density + 0.5)) / 1.5);
    TitleBackground.clustersFarLayer = new Group()._Group();
    if (TitleBackground.clustersFar == null) {
      TitleBackground.clustersFar = new ArrayList();
    } else {
      this.convertFloatingLayer(TitleBackground.clustersFar, TitleBackground.clustersFarLayer, scale, TitleBackground.oldWidth);
    }
    this.add$Gizmo(TitleBackground.clustersFarLayer);
    TitleBackground.clusterLayer = new Group()._Group();
    if (TitleBackground.clusters == null) {
      TitleBackground.clusters = new ArrayList();
    } else {
      this.convertFloatingLayer(TitleBackground.clusters, TitleBackground.clusterLayer, scale, TitleBackground.oldWidth);
    }
    this.add$Gizmo(TitleBackground.clusterLayer);
    TitleBackground.smallFarLayer = new Group()._Group();
    if (TitleBackground.smallFars == null) {
      TitleBackground.smallFars = new ArrayList();
    } else {
      this.convertFloatingLayer(TitleBackground.smallFars, TitleBackground.smallFarLayer, scale, TitleBackground.oldWidth);
    }
    this.add$Gizmo(TitleBackground.smallFarLayer);
    TitleBackground.mids1Layer = new Group()._Group();
    if (TitleBackground.mids1 == null) {
      TitleBackground.mids1 = new ArrayList();
    } else {
      this.convertFloatingLayer(TitleBackground.mids1, TitleBackground.mids1Layer, scale, TitleBackground.oldWidth);
    }
    this.add$Gizmo(TitleBackground.mids1Layer);
    TitleBackground.mids2Layer = new Group()._Group();
    if (TitleBackground.mids2 == null) {
      TitleBackground.mids2 = new ArrayList();
    } else {
      this.convertFloatingLayer(TitleBackground.mids2, TitleBackground.mids2Layer, scale, TitleBackground.oldWidth);
    }
    this.add$Gizmo(TitleBackground.mids2Layer);
    TitleBackground.smallCloseLayer = new Group()._Group();
    if (TitleBackground.smallCloses == null) {
      TitleBackground.smallCloses = new ArrayList();
    } else {
      this.convertFloatingLayer(TitleBackground.smallCloses, TitleBackground.smallCloseLayer, scale, TitleBackground.oldWidth);
    }
    this.add$Gizmo(TitleBackground.smallCloseLayer);
    TitleBackground.oldWidth = Math.fround(this.width_ / scale);
    if (!landscape) {
      scale = Math.fround(scale * 1.5);
    }
    TitleBackground.oldBaseScale = scale;
  }
  convertImage(oldImg: Image, newBaseScale: number): Image {
    let newImg = new Image()._Image$Object(oldImg.texture_);
    newImg.frame$RectF(oldImg.frame$());
    let oldScale = Math.fround(oldImg.scale_.x / TitleBackground.oldBaseScale);
    newImg.scale_.set$float(Math.fround(newBaseScale * oldScale));
    newImg.brightness(oldImg.rm);
    let scaleDiff = Math.fround(newImg.scale_.y / oldImg.scale_.y);
    newImg.x = Math.fround(oldImg.x * scaleDiff);
    newImg.y = Math.fround(oldImg.y * scaleDiff);
    newImg.angle = oldImg.angle;
    return newImg;
  }
  convertArchLayer(layerList: ArrayList<Image>, layerGroup: Group, newBaseScale: number): void {
    let oldImages = new ArrayList(layerList);
    layerList.clear();
    for (let i = 0; i < oldImages.size(); i++) {
      let oldArch = oldImages.get(i);
      let newArch = this.convertImage(oldArch, newBaseScale);
      layerList.add(newArch);
      layerGroup.add$Gizmo(newArch);
      while (Math.fround(newArch.x + newArch.width()) < this.width_ && (i === ((oldImages.size() - 1) | 0) || oldImages.get((i + 1) | 0).y !== oldArch.y)) {
        let extraArch = new Image()._Image$Object(Assets$Splashes$Title.ARCHS);
        extraArch.frame$RectF(this.getArchFrame());
        extraArch.scale_.set$float(newBaseScale);
        extraArch.x = Math.fround(newArch.x + newArch.width());
        extraArch.x = Math.fround(extraArch.x - Math.fround(9 * newArch.scale_.x));
        extraArch.y = newArch.y;
        layerList.add(extraArch);
        layerGroup.add$Gizmo(extraArch);
        newArch = extraArch;
      }
    }
  }
  convertFloatingLayer(layerList: ArrayList<Image>, layerGroup: Group, newBaseScale: number, oldWidth: number): void {
    let oldImages = new ArrayList(layerList);
    layerList.clear();
    let xShift = Math.fround((Math.fround(this.width() / newBaseScale)) / oldWidth);
    for (let i = 0; i < oldImages.size(); i++) {
      let oldImage = oldImages.get(i);
      let newImage = this.convertImage(oldImage, newBaseScale);
      if (newImage.x > Math.fround(0)) {
        newImage.x = Math.fround(newImage.x * xShift);
      }
      layerList.add(newImage);
      layerGroup.add$Gizmo(newImage);
    }
  }
  update(): void {
    super.update();
    let scale = Math.fround(this.height_ / 450);
    let shift = Math.fround(Math.fround(Game.elapsed * TitleBackground.SCROLL_SPEED) * scale);
    if (this.width_ <= this.height_) {
      shift = Math.fround(shift / 1.5);
    }
    this.updateArchLayer(scale, shift);
    if (this.width_ <= this.height_) {
      scale = Math.fround(scale / 1.5);
    }
    shift = Math.fround(shift * Math.fround(1.33));
    this.updateClusterFarLayer(scale, shift);
    shift = Math.fround(shift * 1.5);
    this.updateClusterLayer(scale, shift);
    shift = Math.fround(shift * Math.fround(1.33));
    this.updateFarSmallLayer(scale, shift);
    shift = Math.fround(shift * Math.fround(1.33));
    this.updateMid1Layer(scale, shift);
    shift = Math.fround(shift * Math.fround(1.33));
    this.updateMid2Layer(scale, shift);
    shift = Math.fround(shift * Math.fround(1.33));
    this.updateFrontSmallLayer(scale, shift);
  }
  getArchFrame(): RectF {
    let tile = Random.chances$floatArr(TitleBackground.arch_chances);
    if (tile === -1) {
      TitleBackground.arch_chances = TitleBackground.INIT_ARCH_CHANCES.slice();
      tile = Random.chances$floatArr(TitleBackground.arch_chances);
    }
    TitleBackground.arch_chances[tile]--;
    return TitleBackground.ARCH_FILM.get$Object(tile);
  }
  updateArchLayer(scale: number, shift: number): void {
    let bottom = 0;
    for (const $it0 = TitleBackground.archs.iterator(); $it0.hasNext(); ) {
      let arch = $it0.next();
      arch.y = Math.fround(arch.y - shift);
      if (Math.fround(arch.y + arch.height()) < Math.fround(0)) {
        this.toMove.add(arch);
      } else if (Math.fround(arch.y + arch.height()) > bottom) {
        bottom = Math.fround(arch.y + arch.height());
      }
    }
    if (!this.toMove.isEmpty()) {
      for (const $it1 = this.toMove.iterator(); $it1.hasNext(); ) {
        let arch = $it1.next();
        arch.frame$RectF(this.getArchFrame());
        arch.y = Math.fround(bottom - Math.fround(5 * scale));
      }
      bottom = Math.fround(bottom + Math.fround(100 * scale));
      this.toMove.clear();
    }
    while (bottom < this.height_) {
      let left = Math.fround(-5 + (Math.fround(Math.fround(Math.fround(-Math.fround(33.334)) * Random.Int$int$int(1, 9)) * scale)));
      while (left < this.width_) {
        let arch = new Image()._Image$Object(Assets$Splashes$Title.ARCHS);
        arch.frame$RectF(this.getArchFrame());
        arch.scale_.set$float(scale);
        arch.x = left;
        arch.y = Math.fround(bottom - Math.fround(5 * scale));
        TitleBackground.archLayer.add$Gizmo(arch);
        TitleBackground.archs.add(arch);
        left = Math.fround(left + Math.fround(arch.width() - (Math.fround(9 * scale))));
      }
      bottom = Math.fround(bottom + Math.fround(100 * scale));
    }
  }
  getClusterFrame(): RectF {
    let tile = Random.chances$floatArr(TitleBackground.cluster_chances);
    if (tile === -1) {
      TitleBackground.cluster_chances = TitleBackground.INIT_CLUSTER_CHANCES.slice();
      tile = Random.chances$floatArr(TitleBackground.cluster_chances);
    }
    TitleBackground.cluster_chances[tile]--;
    return TitleBackground.CLUSTER_FILM.get$Object(tile);
  }
  updateClusterFarLayer(scale: number, shift: number): void {
    let bottom = 0;
    let lastX = 0;
    for (const $it2 = TitleBackground.clustersFar.iterator(); $it2.hasNext(); ) {
      let cluster = $it2.next();
      cluster.y = Math.fround(cluster.y - shift);
      if (Math.fround(cluster.y + cluster.height()) < Math.fround(-20)) {
        this.toMove.add(cluster);
      } else if (Math.fround(cluster.y + cluster.height()) > bottom) {
        bottom = Math.fround(cluster.y + cluster.height());
        lastX = cluster.x;
      }
    }
    if (!this.toMove.isEmpty()) {
      for (const $it3 = this.toMove.iterator(); $it3.hasNext(); ) {
        let cluster = $it3.next();
        cluster.frame$RectF(this.getClusterFrame());
        let flex = 0;
        do {
          cluster.x = Random.Float$float$float(Math.fround(Math.fround(-cluster.width()) / 3), Math.fround(this.width_ - Math.fround(Math.fround(2 * cluster.width()) / 3)));
          flex = Math.fround(flex + 1);
        } while (Math.fround(Math.abs(Math.fround(cluster.x - lastX))) < Math.fround(this.density * (Math.fround(Math.fround(cluster.width() / 2) - flex))));
        cluster.y = Math.fround(Math.fround(bottom - cluster.height()) + Math.fround(Random.Float$float$float(Math.fround(cluster.height() / 2), cluster.height()) / this.density));
        cluster.angle = Random.Float$float$float(-20, 20);
        bottom = Math.fround(cluster.y + cluster.height());
        lastX = cluster.x;
      }
      this.toMove.clear();
    }
    let padding = Math.fround(300 - (Math.fround(Math.fround(300 / 2) / this.density)));
    while (bottom < (Math.fround(this.height_ + padding))) {
      let cluster = new Image()._Image$Object(Assets$Splashes$Title.BACK_CLUSTERS);
      cluster.frame$RectF(this.getClusterFrame());
      cluster.scale_.set$float(Math.fround(scale * 0.5));
      let flex = 0;
      do {
        cluster.x = Random.Float$float$float(Math.fround(Math.fround(-cluster.width()) / 3), Math.fround(this.width_ - Math.fround(Math.fround(2 * cluster.width()) / 3)));
        flex = Math.fround(flex + 1);
      } while (Math.fround(Math.abs(Math.fround(cluster.x - lastX))) < Math.fround(this.density * (Math.fround(Math.fround(cluster.width() / 2) - flex))));
      cluster.y = Math.fround(Math.fround(bottom - cluster.height()) + Math.fround(Random.Float$float$float(Math.fround(cluster.height() / 2), cluster.height()) / this.density));
      cluster.angle = Random.Float$float$float(-20, 20);
      cluster.brightness(0.5);
      TitleBackground.clustersFar.add(cluster);
      TitleBackground.clustersFarLayer.add$Gizmo(cluster);
      bottom = Math.fround(cluster.y + cluster.height());
      lastX = cluster.x;
    }
  }
  updateClusterLayer(scale: number, shift: number): void {
    let bottom = 0;
    let lastX = 0;
    for (const $it4 = TitleBackground.clusters.iterator(); $it4.hasNext(); ) {
      let cluster = $it4.next();
      cluster.y = Math.fround(cluster.y - shift);
      if (Math.fround(cluster.y + cluster.height()) < Math.fround(-20)) {
        this.toMove.add(cluster);
      } else if (Math.fround(cluster.y + cluster.height()) > bottom) {
        bottom = Math.fround(cluster.y + cluster.height());
        lastX = cluster.x;
      }
    }
    if (!this.toMove.isEmpty()) {
      for (const $it5 = this.toMove.iterator(); $it5.hasNext(); ) {
        let cluster = $it5.next();
        cluster.frame$RectF(this.getClusterFrame());
        let flex = 0;
        do {
          cluster.x = Random.Float$float$float(Math.fround(Math.fround(-cluster.width()) / 3), Math.fround(this.width_ - Math.fround(Math.fround(2 * cluster.width()) / 3)));
          flex = Math.fround(flex + 1);
        } while (Math.fround(Math.abs(Math.fround(cluster.x - lastX))) < Math.fround(this.density * (Math.fround(Math.fround(cluster.width() / 2) - flex))));
        cluster.y = Math.fround(Math.fround(bottom - cluster.height()) + Math.fround(Random.Float$float$float(Math.fround(cluster.height() / 2), cluster.height()) / this.density));
        cluster.angle = Random.Float$float$float(-20, 20);
        bottom = Math.fround(cluster.y + cluster.height());
        lastX = cluster.x;
      }
      this.toMove.clear();
    }
    let padding = Math.fround(300 - (Math.fround(Math.fround(300 / 2) / this.density)));
    while (bottom < (Math.fround(this.height_ + padding))) {
      let cluster = new Image()._Image$Object(Assets$Splashes$Title.BACK_CLUSTERS);
      cluster.frame$RectF(this.getClusterFrame());
      cluster.scale_.set$float(scale);
      let flex = 0;
      do {
        cluster.x = Random.Float$float$float(Math.fround(Math.fround(-cluster.width()) / 3), Math.fround(this.width_ - Math.fround(Math.fround(2 * cluster.width()) / 3)));
        flex = Math.fround(flex + 1);
      } while (Math.fround(Math.abs(Math.fround(cluster.x - lastX))) < Math.fround(this.density * (Math.fround(Math.fround(cluster.width() / 2) - flex))));
      cluster.y = Math.fround(Math.fround(bottom - cluster.height()) + Math.fround(Random.Float$float$float(Math.fround(cluster.height() / 2), cluster.height()) / this.density));
      cluster.angle = Random.Float$float$float(-20, 20);
      cluster.brightness(0.75);
      TitleBackground.clusters.add(cluster);
      TitleBackground.clusterLayer.add$Gizmo(cluster);
      bottom = Math.fround(cluster.y + cluster.height());
      lastX = cluster.x;
    }
  }
  getMidFrame(): RectF {
    let tile = -1;
    do {
      tile = Random.chances$floatArr(TitleBackground.mid_chances);
      if (tile === -1) {
        TitleBackground.mid_chances = TitleBackground.INIT_MID_CHANCES.slice();
        tile = Random.chances$floatArr(TitleBackground.mid_chances);
      }
    } while (TitleBackground.lastMids.contains(tile));
    TitleBackground.mid_chances[tile]--;
    TitleBackground.lastMids.add(0, tile);
    if (TitleBackground.lastMids.size() >= 20) {
      TitleBackground.lastMids.removeAt(19);
    }
    return TitleBackground.MID_FILM.get$Object(tile);
  }
  updateMid1Layer(scale: number, shift: number): void {
    let bottom = 0;
    let lastX = 0;
    for (const $it6 = TitleBackground.mids1.iterator(); $it6.hasNext(); ) {
      let mid = $it6.next();
      mid.y = Math.fround(mid.y - shift);
      if (Math.fround(mid.y + mid.height()) < Math.fround(-20)) {
        this.toMove.add(mid);
      } else if (Math.fround(mid.y + mid.height()) > bottom) {
        bottom = Math.fround(mid.y + mid.height());
        lastX = mid.x;
      }
    }
    if (!this.toMove.isEmpty()) {
      for (const $it7 = this.toMove.iterator(); $it7.hasNext(); ) {
        let mid = $it7.next();
        mid.frame$RectF(this.getMidFrame());
        mid.scale_.set$float(Math.fround(scale * Random.Float$float$float(0.75, 1.25)));
        let flex = 0;
        do {
          mid.x = Random.Float$float$float(Math.fround(Math.fround(-mid.width()) / 3), Math.fround(this.width_ - Math.fround(Math.fround(2 * mid.width()) / 3)));
          flex = Math.fround(flex + 1);
        } while (Math.fround(Math.abs(Math.fround(mid.x - lastX))) < Math.fround(this.density * (Math.fround(Math.fround(mid.width() * 0.75) - flex))));
        mid.y = Math.fround(Math.fround(bottom - mid.height()) + Math.fround(Random.Float$float$float(Math.fround(mid.height() * 0.75), mid.height()) / this.density));
        mid.angle = Random.Float$float$float(-20, 20);
        bottom = Math.fround(mid.y + mid.height());
        lastX = mid.x;
      }
      this.toMove.clear();
    }
    let padding = Math.fround(300 - (Math.fround(Math.fround(300 / 2) / this.density)));
    while (bottom < (Math.fround(this.height_ + padding))) {
      let mid = new Image()._Image$Object(Assets$Splashes$Title.MID_MIXED);
      mid.frame$RectF(this.getMidFrame());
      mid.scale_.set$float(Math.fround(scale * Random.Float$float$float(0.75, 1.25)));
      mid.brightness(Math.fround(0.9));
      let flex = 0;
      do {
        mid.x = Random.Float$float$float(Math.fround(Math.fround(-mid.width()) / 3), Math.fround(this.width_ - Math.fround(Math.fround(2 * mid.width()) / 3)));
        flex = Math.fround(flex + 1);
      } while (Math.fround(Math.abs(Math.fround(mid.x - lastX))) < Math.fround(this.density * (Math.fround(Math.fround(mid.width() * 0.75) - flex))));
      mid.y = Math.fround(Math.fround(bottom - mid.height()) + Math.fround(Random.Float$float$float(Math.fround(mid.height() / 2), mid.height()) / this.density));
      mid.angle = Random.Float$float$float(-20, 20);
      TitleBackground.mids1.add(mid);
      TitleBackground.mids1Layer.add$Gizmo(mid);
      bottom = Math.fround(mid.y + mid.height());
      lastX = mid.x;
    }
  }
  updateMid2Layer(scale: number, shift: number): void {
    let bottom = 0;
    let lastX = 0;
    for (const $it8 = TitleBackground.mids2.iterator(); $it8.hasNext(); ) {
      let mid = $it8.next();
      mid.y = Math.fround(mid.y - shift);
      if (Math.fround(mid.y + mid.height()) < Math.fround(-20)) {
        this.toMove.add(mid);
      } else if (Math.fround(mid.y + mid.height()) > bottom) {
        bottom = Math.fround(mid.y + mid.height());
        lastX = mid.x;
      }
    }
    if (!this.toMove.isEmpty()) {
      for (const $it9 = this.toMove.iterator(); $it9.hasNext(); ) {
        let mid = $it9.next();
        mid.frame$RectF(this.getMidFrame());
        mid.scale_.set$float(Math.fround(scale * Random.Float$float$float(1.25, 1.75)));
        let flex = 0;
        do {
          mid.x = Random.Float$float$float(Math.fround(Math.fround(-mid.width()) / 3), Math.fround(this.width_ - Math.fround(Math.fround(2 * mid.width()) / 3)));
          flex = Math.fround(flex + 1);
        } while (Math.fround(Math.abs(Math.fround(mid.x - lastX))) < Math.fround(this.density * (Math.fround(Math.fround(mid.width() * 0.75) - flex))));
        mid.y = Math.fround(Math.fround(bottom - mid.height()) + Math.fround(Random.Float$float$float(Math.fround(mid.height() / 2), mid.height()) / this.density));
        mid.angle = Random.Float$float$float(-20, 20);
        bottom = Math.fround(mid.y + mid.height());
        lastX = mid.x;
      }
      this.toMove.clear();
    }
    let padding = Math.fround(300 - (Math.fround(Math.fround(300 / 2) / this.density)));
    while (bottom < (Math.fround(this.height_ + padding))) {
      let mid = new Image()._Image$Object(Assets$Splashes$Title.MID_MIXED);
      mid.frame$RectF(this.getMidFrame());
      mid.scale_.set$float(Math.fround(scale * Random.Float$float$float(1.25, 1.75)));
      let flex = 0;
      do {
        mid.x = Random.Float$float$float(Math.fround(Math.fround(-mid.width()) / 3), Math.fround(this.width_ - Math.fround(Math.fround(2 * mid.width()) / 3)));
        flex = Math.fround(flex + 1);
      } while (Math.fround(Math.abs(Math.fround(mid.x - lastX))) < Math.fround(this.density * (Math.fround(Math.fround(mid.width() * 0.75) - flex))));
      mid.y = Math.fround(Math.fround(bottom - mid.height()) + Math.fround(Random.Float$float$float(Math.fround(mid.height() / 2), mid.height()) / this.density));
      mid.angle = Random.Float$float$float(-20, 20);
      TitleBackground.mids2.add(mid);
      TitleBackground.mids2Layer.add$Gizmo(mid);
      bottom = Math.fround(mid.y + mid.height());
      lastX = mid.x;
    }
  }
  getSmallFrame(): RectF {
    let tile = -1;
    do {
      tile = Random.chances$floatArr(TitleBackground.small_chances);
      if (tile === -1) {
        TitleBackground.small_chances = TitleBackground.INIT_SMALL_CHANCES.slice();
        tile = Random.chances$floatArr(TitleBackground.small_chances);
      }
    } while (TitleBackground.lastSmalls.contains(tile));
    TitleBackground.small_chances[tile]--;
    TitleBackground.lastSmalls.add(0, tile);
    if (TitleBackground.lastSmalls.size() >= 15) {
      TitleBackground.lastSmalls.removeAt(14);
    }
    return TitleBackground.SMALL_FILM.get$Object(tile);
  }
  updateFarSmallLayer(scale: number, shift: number): void {
    let bottom = 0;
    let lastX = 0;
    for (const $it10 = TitleBackground.smallFars.iterator(); $it10.hasNext(); ) {
      let small = $it10.next();
      small.y = Math.fround(small.y - shift);
      if (Math.fround(small.y + small.height()) < Math.fround(-20)) {
        this.toMove.add(small);
      } else if (Math.fround(small.y + small.height()) > bottom) {
        bottom = Math.fround(small.y + small.height());
        lastX = small.x;
      }
    }
    if (!this.toMove.isEmpty()) {
      for (const $it11 = this.toMove.iterator(); $it11.hasNext(); ) {
        let small = $it11.next();
        small.frame$RectF(this.getSmallFrame());
        small.scale_.set$float(Math.fround(scale * Random.Float$float$float(0.75, 1.25)));
        let flex = 0;
        do {
          small.x = Random.Float$float$float(Math.fround(small.width() / 3), Math.fround(this.width_ - Math.fround(Math.fround(4 * small.width()) / 3)));
          flex = Math.fround(flex + 1);
        } while (Math.fround(Math.abs(Math.fround(small.x - lastX))) < Math.fround(this.density * (Math.fround(small.width() - flex))));
        small.y = Math.fround(Math.fround(bottom - Math.fround(small.height() / 2)) + Math.fround(Random.Float$float$float(Math.fround(small.height() / 2), small.height()) / this.density));
        small.angle = Random.Float$float$float(-20, 20);
        bottom = Math.fround(small.y + small.height());
        lastX = small.x;
      }
      this.toMove.clear();
    }
    let padding = Math.fround(150 - (Math.fround(Math.fround(150 / 2) / this.density)));
    while (bottom < (Math.fround(this.height_ + padding))) {
      let small = new Image()._Image$Object(Assets$Splashes$Title.FRONT_SMALL);
      small.frame$RectF(this.getSmallFrame());
      small.scale_.set$float(Math.fround(scale * Random.Float$float$float(0.75, 1.25)));
      small.brightness(Math.fround(0.8));
      let flex = 0;
      do {
        small.x = Random.Float$float$float(Math.fround(small.width() / 3), Math.fround(this.width_ - Math.fround(Math.fround(4 * small.width()) / 3)));
        flex = Math.fround(flex + 1);
      } while (Math.fround(Math.abs(Math.fround(small.x - lastX))) < Math.fround(this.density * (Math.fround(small.width() - flex))));
      small.y = Math.fround(Math.fround(bottom - Math.fround(small.height() / 2)) + Math.fround(Random.Float$float$float(Math.fround(small.height() / 2), small.height()) / this.density));
      small.angle = Random.Float$float$float(-20, 20);
      TitleBackground.smallFars.add(small);
      TitleBackground.smallFarLayer.add$Gizmo(small);
      bottom = Math.fround(small.y + small.height());
      lastX = small.x;
    }
  }
  updateFrontSmallLayer(scale: number, shift: number): void {
    let bottom = 0;
    let lastX = 0;
    for (const $it12 = TitleBackground.smallCloses.iterator(); $it12.hasNext(); ) {
      let small = $it12.next();
      small.y = Math.fround(small.y - shift);
      if (Math.fround(small.y + small.height()) < Math.fround(-20)) {
        this.toMove.add(small);
      } else if (Math.fround(small.y + small.height()) > bottom) {
        bottom = Math.fround(small.y + small.height());
        lastX = small.x;
      }
    }
    if (!this.toMove.isEmpty()) {
      for (const $it13 = this.toMove.iterator(); $it13.hasNext(); ) {
        let small = $it13.next();
        small.frame$RectF(this.getSmallFrame());
        small.scale_.set$float(Math.fround(scale * Random.Float$float$float(2, 2.5)));
        let flex = 0;
        do {
          small.x = Random.Float$float$float(Math.fround(Math.fround(-small.width()) / 3), Math.fround(this.width_ - Math.fround(Math.fround(2 * small.width()) / 3)));
          flex = Math.fround(flex + 1);
        } while (Math.fround(Math.abs(Math.fround(small.x - lastX))) < Math.fround(this.density * (Math.fround(small.width() - flex))));
        small.y = Math.fround(Math.fround(bottom - small.height()) + Math.fround(Random.Float$float$float(Math.fround(small.height() / 2), small.height()) / this.density));
        small.angle = Random.Float$float$float(-20, 20);
        bottom = Math.fround(small.y + small.height());
        lastX = small.x;
      }
      this.toMove.clear();
    }
    let padding = Math.fround(150 - (Math.fround(Math.fround(150 / 2) / this.density)));
    while (bottom < (Math.fround(this.height_ + padding))) {
      let small = new Image()._Image$Object(Assets$Splashes$Title.FRONT_SMALL);
      small.frame$RectF(this.getSmallFrame());
      small.scale_.set$float(Math.fround(scale * Random.Float$float$float(2, 2.5)));
      let flex = 0;
      do {
        small.x = Random.Float$float$float(Math.fround(Math.fround(-small.width()) / 3), Math.fround(this.width_ - Math.fround(Math.fround(2 * small.width()) / 3)));
        flex = Math.fround(flex + 1);
      } while (Math.fround(Math.abs(Math.fround(small.x - lastX))) < Math.fround(this.density * (Math.fround(small.width() - flex))));
      small.y = Math.fround(Math.fround(bottom - small.height()) + Math.fround(Random.Float$float$float(Math.fround(small.height() / 2), small.height()) / this.density));
      small.angle = Random.Float$float$float(-20, 20);
      TitleBackground.smallCloses.add(small);
      TitleBackground.smallCloseLayer.add$Gizmo(small);
      bottom = Math.fround(small.y + small.height());
      lastX = small.x;
    }
  }
  static $clinit() {
    TitleBackground.SCROLL_SPEED = 15;
    TitleBackground.ARCH_FILM = new TextureFilm()._TextureFilm$Object$int$int(Assets$Splashes$Title.ARCHS, 333, 100);
    TitleBackground.CLUSTER_FILM = new TextureFilm()._TextureFilm$Object$int$int(Assets$Splashes$Title.BACK_CLUSTERS, 450, 250);
    TitleBackground.SMALL_FILM = new TextureFilm()._TextureFilm$Object$int$int(Assets$Splashes$Title.FRONT_SMALL, 112, 116);
    TitleBackground.MID_FILM = new TextureFilm()._TextureFilm$Object$int$int(Assets$Splashes$Title.MID_MIXED, 273, 242);
    TitleBackground.oldBaseScale = 1;
    TitleBackground.oldWidth = 0;
    TitleBackground.INIT_ARCH_CHANCES = [5, 5, 2, 2, 2, 2];
    TitleBackground.arch_chances = TitleBackground.INIT_ARCH_CHANCES.slice();
    TitleBackground.INIT_CLUSTER_CHANCES = [2, 2];
    TitleBackground.cluster_chances = TitleBackground.INIT_CLUSTER_CHANCES.slice();
    TitleBackground.INIT_MID_CHANCES = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    TitleBackground.mid_chances = TitleBackground.INIT_MID_CHANCES.slice();
    TitleBackground.lastMids = new ArrayList();
    TitleBackground.INIT_SMALL_CHANCES = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    TitleBackground.small_chances = TitleBackground.INIT_SMALL_CHANCES.slice();
    TitleBackground.lastSmalls = new ArrayList();
  }
}

$J.define(TitleBackground, 'com.shatteredpixel.shatteredpixeldungeon.ui.TitleBackground', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { 'int,int': '_TitleBackground' }, clinit: true, lazy: ['SCROLL_SPEED', 'ARCH_FILM', 'archLayer', 'archs', 'CLUSTER_FILM', 'clusters', 'clusterLayer', 'clustersFar', 'clustersFarLayer', 'SMALL_FILM', 'smallFars', 'smallFarLayer', 'MID_FILM', 'mids1', 'mids1Layer', 'mids2', 'mids2Layer', 'smallCloses', 'smallCloseLayer', 'wasLandscape', 'oldBaseScale', 'oldWidth', 'INIT_ARCH_CHANCES', 'arch_chances', 'INIT_CLUSTER_CHANCES', 'cluster_chances', 'INIT_MID_CHANCES', 'mid_chances', 'lastMids', 'INIT_SMALL_CHANCES', 'small_chances', 'lastSmalls'] });
$J.module(() => {
  Assets$Splashes$Title = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Splashes$Title');
  TextureCache = $J.load('com.watabou.gltextures.TextureCache');
  Game = $J.load('com.watabou.noosa.Game');
  Group = $J.load('com.watabou.noosa.Group');
  Image = $J.load('com.watabou.noosa.Image');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
  Random = $J.load('com.watabou.utils.Random');
});
