// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/awt/image/SunWritableRaster.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2001, 2008, Oracle and/or its affiliates. All rights reserved.
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * This code is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License version 2 only, as
 * published by the Free Software Foundation.  Oracle designates this
 * particular file as subject to the "Classpath" exception as provided
 * by Oracle in the LICENSE file that accompanied this code.
 *
 * This code is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * version 2 for more details (a copy is included in the LICENSE file that
 * accompanied this code).
 *
 * You should have received a copy of the GNU General Public License version
 * 2 along with this work; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * Please contact Oracle, 500 Oracle Parkway, Redwood Shores, CA 94065 USA
 * or visit www.oracle.com if you need additional information or have any
 * questions.
 */
import { $J, InternalError } from '../../../../jre/index.ts';
import { WritableRaster } from '../../../java/awt/image/WritableRaster.ts';

/**
 * This class exists as a middle layer between WritableRaster and its
 * implementation specific subclasses (ByteComponentRaster, ShortBandedRaster,
 * etc).
 * It provides utilities to steal the data arrays from the standard DataBuffer
 * types and also steals the StateTrackableDelegate from the associated
 * DataBuffer so that it can be updated when the data is changed.
 */
export class SunWritableRaster extends WritableRaster {
  static stealer: SunWritableRaster$DataStealer = null;
  theTrackable: StateTrackableDelegate = null;
  _SunWritableRaster$SampleModel$Point(sampleModel: SampleModel, origin: Point): this {
    this._WritableRaster$SampleModel$Point(sampleModel, origin);
    this.theTrackable = SunWritableRaster.stealTrackable(this.dataBuffer);
    return this;
  }
  _SunWritableRaster$SampleModel$DataBuffer$Point(sampleModel: SampleModel, dataBuffer: DataBuffer, origin: Point): this {
    this._WritableRaster$SampleModel$DataBuffer$Point(sampleModel, dataBuffer, origin);
    this.theTrackable = SunWritableRaster.stealTrackable(dataBuffer);
    return this;
  }
  _SunWritableRaster$SampleModel$DataBuffer$Rectangle$Point$WritableRaster(sampleModel: SampleModel, dataBuffer: DataBuffer, aRegion: Rectangle, sampleModelTranslate: Point, parent: WritableRaster): this {
    this._WritableRaster$SampleModel$DataBuffer$Rectangle$Point$WritableRaster(sampleModel, dataBuffer, aRegion, sampleModelTranslate, parent);
    this.theTrackable = SunWritableRaster.stealTrackable(dataBuffer);
    return this;
  }
  static setDataStealer(ds: SunWritableRaster$DataStealer): void {
    if (SunWritableRaster.stealer != null) {
      throw new InternalError('Attempt to set DataStealer twice');
    }
    SunWritableRaster.stealer = ds;
  }
  static stealData$DataBufferByte$int(dbb: DataBufferByte, bank: number): number[] {
    return SunWritableRaster.stealer.getData$DataBufferByte$int(dbb, bank);
  }
  static stealData$DataBufferUShort$int(dbus: DataBufferUShort, bank: number): number[] {
    return SunWritableRaster.stealer.getData$DataBufferUShort$int(dbus, bank);
  }
  static stealData$DataBufferInt$int(dbi: DataBufferInt, bank: number): number[] {
    return SunWritableRaster.stealer.getData$DataBufferInt$int(dbi, bank);
  }
  static stealTrackable(db: DataBuffer): StateTrackableDelegate {
    return SunWritableRaster.stealer.getTrackable(db);
  }
  /**
   * Mark the TrackableDelegate of the associated DataBuffer dirty.
   */
  markDirty(): void {
    this.theTrackable.markDirty();
  }
}

export class SunWritableRaster$DataStealer {
}

$J.define(SunWritableRaster, 'sun.awt.image.SunWritableRaster', { kind: 'class', sup: 'java.awt.image.WritableRaster', ctors: { 'java.awt.image.SampleModel,java.awt.image.DataBuffer,java.awt.Rectangle,java.awt.Point,java.awt.image.WritableRaster': '_SunWritableRaster$SampleModel$DataBuffer$Rectangle$Point$WritableRaster', 'java.awt.image.SampleModel,java.awt.image.DataBuffer,java.awt.Point': '_SunWritableRaster$SampleModel$DataBuffer$Point', 'java.awt.image.SampleModel,java.awt.Point': '_SunWritableRaster$SampleModel$Point' }, meths: { 'markDirty(java.awt.Image)': 'markDirty$Image', 'markDirty(java.awt.image.WritableRaster)': 'markDirty$WritableRaster', 'markDirty(java.awt.image.DataBuffer)': 'markDirty$DataBuffer', 'stealData(java.awt.image.DataBufferInt,int)': 'stealData$DataBufferInt$int', 'stealData(java.awt.image.DataBufferUShort,int)': 'stealData$DataBufferUShort$int', 'stealData(java.awt.image.DataBufferByte,int)': 'stealData$DataBufferByte$int' } });
$J.define(SunWritableRaster$DataStealer, 'sun.awt.image.SunWritableRaster$DataStealer', { kind: 'interface', meths: { 'getData(java.awt.image.DataBufferInt,int)': 'getData$DataBufferInt$int', 'getData(java.awt.image.DataBufferUShort,int)': 'getData$DataBufferUShort$int', 'getData(java.awt.image.DataBufferByte,int)': 'getData$DataBufferByte$int' } });
