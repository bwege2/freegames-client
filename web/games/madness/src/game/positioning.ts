// Madness Interactive Reloaded port (GPL-3.0). Character/Systems/CharacterPositionSystem.cs (where every limb
// goes, every frame), Character/HandPosingFunctions.cs, CharacterUtilities.PositionHandsForWeapon and
// CalculateMixedAnimation / CalculateAnimationResult, translated line by line.
import { AC, HandLook, type LimbAnimation } from '../data/animation.ts';
import { floorLevelAt } from '../data/registry.ts';
import { mmul, rotation, scaling, transformPoint } from '../engine/matrix.ts';
import { noiseFractal, noiseValue } from '../engine/noise.ts';
import {
  add, angleToVector, clamp, DEG2RAD, distSq, Easings, lerp, lerpAngle, lerpV, mapRange, mul, normalize, RAD2DEG, rotatePoint,
  smoothApproach, smoothApproachV, sub, v2, vectorToAngle, type Vec2, deltaAngle, randomFloat,
} from '../engine/util.ts';
import {
  BodyRotationPivot, getFloorOffset, HandOffset1, HandOffset2, HeadOffsetRelativeToBody, HeadRotationPivot, IronsightOffset,
  RenderOrders, HandPositionMode, type Character, type HandLimb, type Weapon,
} from './character.ts';
import type { Scene } from './scene.ts';

/** Textures.Character.GetTextureForHandLook */
export function handTexture(c: Character, look: HandLook, back: boolean, weaponType: 'Firearm' | 'Melee'): string {
  if (look === HandLook.HoldPistol && weaponType === 'Melee') look = HandLook.Fist;
  const gloves = c.look.hands;
  if (gloves) {
    const e = gloves.looks.get(look);
    if (e) return back ? e.back : e.front;
  }
  const d = 'textures/bodies/default/';
  switch (look) {
    case HandLook.Open: return d + (back ? 'hand_open_back.png' : 'hand_open.png');
    case HandLook.HoldPistol: return d + (back ? 'hand_pistol_back.png' : 'hand_pistol.png');
    case HandLook.HoldRifle: return d + (back ? 'hand_rifle_back.png' : 'hand_rifle.png');
    case HandLook.HoldUnderside: return d + (back ? 'hand_underside_back.png' : 'hand_underside.png');
    case HandLook.Point: return d + (back ? 'hand_point_back.png' : 'hand_point.png');
    case HandLook.HoldStock: return d + (back ? 'hand_stock_back.png' : 'hand_stock.png');
    default: return d + (back ? 'hand_fist_back.png' : 'hand_fist.png');
  }
}

interface AnimationResult {
  bodyPosition: Vec2; bodyRotation: number; bodyScale: Vec2;
  headPosition: Vec2; headRotation: number; headScale: Vec2;
  hand1Position: Vec2; hand1Rotation: number; hand1Scale: Vec2;
  hand2Position: Vec2; hand2Rotation: number; hand2Scale: Vec2;
  hand1Look: HandLook | null; hand2Look: HandLook | null;
}
const emptyResult = (): AnimationResult => ({
  bodyPosition: v2(), bodyRotation: 0, bodyScale: v2(), headPosition: v2(), headRotation: 0, headScale: v2(),
  hand1Position: v2(), hand1Rotation: 0, hand1Scale: v2(), hand2Position: v2(), hand2Rotation: 0, hand2Scale: v2(), hand1Look: null, hand2Look: null,
});

/** CharacterUtilities.CalculateAnimationResult */
function animationResult(c: Character, idx: number): AnimationResult {
  const active = c.animations[idx];
  const anim = active.animation;
  const flip = c.positioning.isFlipped ? -1 : 1;
  const r = emptyResult();
  const t = (a: LimbAnimation): number => active.progress(a);
  if (anim.body?.translation) { r.bodyPosition = anim.body.evalTranslation(t(anim.body)); r.bodyPosition.x *= flip; }
  if (anim.body?.rotation) r.bodyRotation = anim.body.evalRotation(t(anim.body)) * flip;
  r.bodyScale = anim.body?.scale ? anim.body.evalScale(t(anim.body)) : v2(1, 1);
  if (anim.head?.translation) { r.headPosition = anim.head.evalTranslation(t(anim.head)); r.headPosition.x *= flip; }
  if (anim.head?.rotation) r.headRotation = anim.head.evalRotation(t(anim.head)) * flip;
  r.headScale = anim.head?.scale ? anim.head.evalScale(t(anim.head)) : v2(1, 1);
  if (anim.hands) {
    const pos = c.positioning;
    const handRot = (a: LimbAnimation): number => {
      let off = 0;
      if (a.adjustForAim) off = vectorToAngle(mul(c.aimDirection, flip));
      if (a.rotation) off += a.evalRotation(t(a)) * flip;
      return off;
    };
    const handPos = (a: LimbAnimation, hand: HandLimb): Vec2 => {
      let res = a.evalTranslation(t(a));
      res.x *= flip;
      res = mul(res, pos.scale);
      res = add(res, pos.globalCenter);
      if (anim.relativeHandPosition) {
        res = add(res, hand.posePosition);
        const t1 = a.translation ? a.evalTranslation(0) : v2();
        t1.x *= flip;
        res = sub(res, t1);
      }
      if (a.adjustForAim) {
        const pivot = add(hand.posePosition, pos.globalCenter);
        let dir = c.aimDirection;
        if (pos.isFlipped) dir = mul(dir, -1);
        res = rotatePoint(res, vectorToAngle(dir), pivot);
      }
      return res;
    };
    if (anim.hands.length >= 1) {
      const a = anim.hands[0];
      if (a.translation) r.hand1Position = handPos(a, pos.isFlipped ? pos.hands[1] : pos.hands[0]);
      r.hand1Rotation = handRot(a);
      r.hand1Scale = a.evalScale(t(a));
      if (a.handLooks && a.handLooks.length > 0) r.hand1Look = a.handLookFor(active.unscaledTimer / a.duration);
    }
    if (anim.hands.length >= 2) {
      const a = anim.hands[1];
      if (a.translation) r.hand2Position = handPos(a, pos.isFlipped ? pos.hands[0] : pos.hands[1]);
      r.hand2Rotation = handRot(a);
      r.hand2Scale = a.evalScale(t(a));
      if (a.handLooks && a.handLooks.length > 0) r.hand2Look = a.handLookFor(active.unscaledTimer / a.duration);
    }
  }
  return r;
}

/** CharacterUtilities.CalculateMixedAnimation */
function mixedAnimation(c: Character): AnimationResult {
  if (!c.isPlayingAnimation) return emptyResult();
  const f = Easings.quadInOut(c.animationMixProgress);
  const r = animationResult(c, c.animations.length - 1);
  if (c.animations.length > 1) {
    const p = animationResult(c, c.animations.length - 2);
    r.bodyPosition = lerpV(p.bodyPosition, r.bodyPosition, f);
    r.bodyRotation = lerpAngle(p.bodyRotation, r.bodyRotation, f);
    r.bodyScale = lerpV(p.bodyScale, r.bodyScale, f);
    r.headPosition = lerpV(p.headPosition, r.headPosition, f);
    r.headRotation = lerpAngle(p.headRotation, r.headRotation, f);
    r.headScale = lerpV(p.headScale, r.headScale, f);
    r.hand1Position = lerpV(p.hand1Position, r.hand1Position, f);
    r.hand1Rotation = lerpAngle(p.hand1Rotation, r.hand1Rotation, f);
    r.hand1Scale = lerpV(p.hand1Scale, r.hand1Scale, f);
    r.hand1Look = f < 0.5 ? p.hand1Look : r.hand1Look;
    r.hand2Position = lerpV(p.hand2Position, r.hand2Position, f);
    r.hand2Rotation = lerpAngle(p.hand2Rotation, r.hand2Rotation, f);
    r.hand2Scale = lerpV(p.hand1Scale, r.hand2Scale, f); // sic: the original mixes hand 2's scale from hand 1's
    r.hand2Look = f < 0.5 ? p.hand2Look : r.hand2Look;
  }
  return r;
}

// HandPosingFunctions
function deflectionPose(c: Character, hand: HandLimb): void {
  const pos = c.positioning;
  const flip = pos.flipScaling;
  const intensity = pos.smoothedMeleeBlockImpactIntensity * 4;
  const deflectPosition = add(v2(pos.isFlipped ? -150 : -50, pos.isFlipped ? 200 : 150), mul(c.aimDirection, 48 * pos.scale));
  let deflectAngle = 230;
  deflectPosition.x -= flip * Math.abs(intensity) * 32;
  deflectAngle += vectorToAngle(v2(Math.abs(c.aimDirection.x), c.aimDirection.y)) * -0.2;
  deflectAngle -= flip * intensity * 8;
  if (pos.isFlipped) deflectAngle -= 190;
  const f = Easings.cubicInOut(pos.meleeBlockProgress);
  hand.posePosition = lerpV(hand.posePosition, deflectPosition, f);
  hand.poseRotation = lerpAngle(hand.poseRotation, deflectAngle, f);
  if (f > 0.5) pos.hands[1].look = HandLook.Open;
}
function unarmedProtective(c: Character, hand: HandLimb, index: number): void {
  const pos = c.positioning;
  const flip = pos.flipScaling;
  const f = Easings.cubicInOut(pos.meleeBlockProgress);
  const yOffset = c.aimDirection.y * 40;
  const targetPos = v2(flip * (150 + 50 * index), 30 + 60 * index + yOffset);
  let th = pos.head.globalRotation + 60 + 25 * index;
  if (pos.isFlipped) { th *= -1; th -= 180; }
  hand.posePosition = lerpV(hand.posePosition, targetPos, f);
  hand.poseRotation = lerpAngle(hand.poseRotation, th, f);
}
function fistOffsets(c: Character): { pos1: Vec2; pos2: Vec2; angle: number } {
  const pos = c.positioning;
  const d = c.aimDirection;
  const flip = pos.flipScaling;
  const cd = normalize(v2(Math.sign(d.x) * Math.max(Math.abs(d.x), 0.5), clamp(d.y, -0.2, 0.2)));
  const rad = Math.atan2(cd.y, cd.x);
  const r = (o: Vec2): Vec2 => mul(rotatePoint(v2(o.x, o.y * flip), rad * RAD2DEG), pos.scale);
  return { pos1: r(HandOffset1), pos2: r(HandOffset2), angle: rad * RAD2DEG };
}
function fistFight(c: Character): void {
  const pos = c.positioning;
  const { pos1, pos2, angle } = fistOffsets(c);
  const flip = pos.flipScaling;
  pos.hands[0].posePosition = flip < 0 ? pos2 : pos1;
  pos.hands[0].poseRotation = angle;
  pos.hands[0].look = HandLook.Fist;
  pos.hands[1].posePosition = flip < 0 ? pos1 : pos2;
  pos.hands[1].poseRotation = angle;
  pos.hands[1].look = HandLook.Fist;
  unarmedProtective(c, pos.hands[0], pos.isFlipped ? 1 : 0);
  unarmedProtective(c, pos.hands[1], pos.isFlipped ? 0 : 1);
}
function twoHandedGun(c: Character, w: Weapon | null): void {
  const pos = c.positioning;
  pos.secondaryHandFollowsPrimary = true;
  const main = pos.hands[0];
  main.posePosition = pos.handMousePosition;
  main.poseRotation = vectorToAngle(c.aimDirection);
  main.look = HandLook.HoldPistol;
  main.shouldFollowRecoil = true;
  const second = pos.hands[1];
  if (w && w.holdPoints.length >= 2) {
    second.shouldFollowRecoil = false;
    let hp = sub(w.holdPoints[1], w.transform.localPivot);
    if (w.data.isPumpAction) hp = add(hp, pumpHandPos(w, hp));
    hp.y *= pos.flipScaling;
    second.posePosition = hp;
    second.look = w.instr.holdForGrip ? HandLook.HoldRifle : HandLook.HoldUnderside;
    if (w.instr.holdStockHandPose) main.look = HandLook.HoldStock;
  } else {
    second.posePosition = add(main.posePosition, v2(-10, 10));
    second.look = HandLook.HoldPistol;
    second.shouldFollowRecoil = main.shouldFollowRecoil;
  }
  second.poseRotation = 0;
}
function pumpHandPos(w: Weapon, fallback: Vec2): Vec2 {
  if (w.parts.length > 0) return sub(w.parts[0].transform.position, v2(0, 15));
  return fallback;
}
function oneHandedGun(c: Character, w: Weapon | null): void {
  const pos = c.positioning;
  const main = pos.hands[0];
  main.posePosition = pos.handMousePosition;
  main.poseRotation = vectorToAngle(c.aimDirection);
  main.look = w?.instr.holdStockHandPose ? HandLook.HoldStock : HandLook.HoldPistol;
  main.shouldFollowRecoil = true;
  const cy = Easings.circInOut(pos.ironSightProgress);
  const cx = Easings.circInOut(pos.ironSightProgress + 0.1);
  const h = pos.hands[1];
  h.shouldFollowRecoil = pos.ironSightProgress >= 0.9;
  h.posePosition = v2(pos.isFlipped ? 50 : 100, -80);
  h.poseRotation = pos.isFlipped ? 180 : 0;
  h.posePosition.x = lerp(h.posePosition.x, main.posePosition.x, cx);
  h.posePosition.y = lerp(h.posePosition.y, main.posePosition.y, cy);
  h.poseRotation = lerpAngle(h.poseRotation, main.poseRotation, cx);
  if (pos.ironSightProgress > 0.1 && pos.ironSightProgress < 0.9) h.look = HandLook.Open;
  else if (w) h.look = ((pos.ironSightProgress > 0.9 && w.instr.holdStockHandPose) || w.holdPoints.length > 1) ? HandLook.HoldStock : HandLook.Fist;
  else h.look = HandLook.Fist;
}
function oneHandedSword(c: Character): void {
  const pos = c.positioning;
  const flip = pos.isFlipped ? -1 : 1;
  const angle = pos.isFlipped ? 180 : 0;
  const pos1 = add(v2(HandOffset1.x * flip, HandOffset1.y), mul(pos.head.direction, -24 * pos.scale));
  const pos2 = add(v2(HandOffset2.x * flip, HandOffset2.y), mul(pos.head.direction, 24 * pos.scale));
  pos.currentRecoil = 0;
  const main = pos.hands[0];
  main.posePosition = flip < 0 ? pos2 : pos1;
  main.poseRotation = angle - 17.76 * flip;
  main.look = HandLook.HoldPistol;
  const h = pos.hands[1];
  h.posePosition = { ...(flip < 0 ? pos1 : pos2) };
  h.posePosition.x -= flip * 50;
  h.posePosition.y -= 100;
  h.poseRotation = angle;
  h.look = HandLook.Fist;
  c.deflectionLine.a = main.globalPosition;
  c.deflectionLine.b = add(main.globalPosition, mul(angleToVector(main.poseRotation + 90), 500 * flip));
  deflectionPose(c, main);
}
function twoHandedSword(c: Character): void {
  const pos = c.positioning;
  const flip = pos.isFlipped ? -1 : 1;
  for (const hand of pos.hands) {
    const angle = pos.isFlipped ? 180 : 0;
    const pos1 = add(v2(HandOffset1.x * flip, HandOffset1.y), mul(pos.head.direction, -24 * pos.scale));
    const pos2 = add(v2(HandOffset2.x * flip, HandOffset2.y), mul(pos.head.direction, 24 * pos.scale));
    pos.currentRecoil = 0;
    hand.posePosition = flip < 0 ? pos2 : pos1;
    hand.poseRotation = angle - 17.76 * flip;
    hand.look = HandLook.HoldPistol;
  }
  c.deflectionLine.a = pos.hands[0].globalPosition;
  c.deflectionLine.b = add(pos.hands[0].globalPosition, mul(angleToVector(pos.hands[0].poseRotation + 90), 500 * flip));
  deflectionPose(c, pos.hands[0]);
  deflectionPose(c, pos.hands[1]);
}
function twoHandedAxe(c: Character, w: Weapon | null): void {
  const pos = c.positioning;
  pos.secondaryHandFollowsPrimary = true;
  const main = pos.hands[0];
  const off = pos.hands[1];
  const angle = pos.isFlipped ? 180 : 0;
  const pos1 = add(v2(-HandOffset1.x * 2, HandOffset1.y), mul(pos.head.direction, -24 * pos.scale));
  const pos2 = add(v2(HandOffset1.x * 2, HandOffset1.y), mul(pos.head.direction, 24 * pos.scale));
  pos.currentRecoil = 0;
  main.posePosition = pos.isFlipped ? pos2 : pos1;
  main.poseRotation = angle - 17.76 * pos.flipScaling;
  main.look = HandLook.HoldPistol;
  if (w) {
    off.posePosition = sub(w.holdPoints[1 % w.holdPoints.length], w.transform.localPivot);
    off.posePosition.y *= pos.flipScaling;
  } else off.posePosition = pos2;
  off.poseRotation = 0;
  off.look = HandLook.HoldPistol;
  c.deflectionLine.a = main.globalPosition;
  c.deflectionLine.b = add(main.globalPosition, mul(angleToVector(main.poseRotation + 90), 500 * pos.flipScaling));
  deflectionPose(c, main);
}

/** CharacterUtilities.PositionHandsForWeapon */
function positionHandsForWeapon(c: Character, w: Weapon | null): void {
  c.positioning.secondaryHandFollowsPrimary = false;
  const mode = c.positioning.handPositionMode;
  if (!c.hasWeaponEquipped || !w) fistFight(c);
  else if (w.data.weaponType === 'Firearm') {
    if (mode === HandPositionMode.OneHand) oneHandedGun(c, w);
    else if (mode === HandPositionMode.TwoHands) twoHandedGun(c, w);
  } else if (mode === HandPositionMode.OneHand) {
    oneHandedSword(c); // Blade, Axe (OneHandedAxe = OneHandedSword) and Blunt (= OneHandedAxe)
  } else if (mode === HandPositionMode.TwoHands) {
    if (w.data.meleeDamageType === 'Blade') twoHandedSword(c); else twoHandedAxe(c, w);
  }
  for (const o of c.positioning.handPoseFunctionOverride) o(c);
}

const additionalFor = (rotDeg: number, s: Vec2, p: Vec2) => {
  const th = rotDeg * DEG2RAD;
  return mmul(mmul(rotation(-th, p), scaling(s.x, s.y, p)), rotation(th, p));
};

/** CharacterPositionSystem.Update for one character */
export function positionCharacter(s: Scene, c: Character): void {
  if (c.hasBeenRagdolled) return;
  const dt = s.clock.dt;
  const pos = c.positioning;
  const equipped = c.hasWeaponEquipped ? c.equipped : null;
  pos.ironSightProgress = clamp(pos.ironSightProgress + (c.isIronSighting ? 1 : -1) * dt / 0.2);
  pos.meleeBlockProgress = clamp(pos.meleeBlockProgress + (c.isMeleeBlocking ? 1 : -1) * dt / 0.25);
  processRecoil(c, equipped, dt);
  processRenderers(s, c, equipped);
  pos.head.scale = { ...pos.head.transform.scale };
  pos.body.scale = { ...pos.body.transform.scale };
  pos.hands[0].scale = { ...pos.hands[0].transform.scale };
  pos.hands[1].scale = { ...pos.hands[1].transform.scale };
  processArmour(s, c);
  c.needsLookUpdate = false;
  positionCenter(s, c);
  prepareAnimation(c, dt);
  positionBody(s, c);
  positionHead(s, c);
  positionHands(s, c, equipped);
  positionFeet(c);
  if (equipped && !equipped.removed) applyWeaponPosition(c, equipped);
  if (c.isPlayingAnimationGroup('deaths') && !c.constrainsAny(AC.PreventRagdoll)) {
    const hc = transformPoint(v2(), pos.head.transform.localToWorld);
    const bc = transformPoint(v2(), pos.body.transform.localToWorld);
    if (s.physics.queryCircle(hc, 10, 2).length > 0 || s.physics.queryCircle(bc, 10, 2).length > 0) s.turnIntoRagdoll(c);
  }
}

function processRenderers(s: Scene, c: Character, equipped: Weapon | null): void {
  const pos = c.positioning;
  const lookUpdate = c.needsLookUpdate;
  const head = pos.head;
  head.renderer.hflip = pos.isFlipped;
  head.renderer.layer = c.layer;
  head.renderer.order = RenderOrders.HeadBaseOrder;
  if (lookUpdate) {
    const tex = pos.isFlipped ? c.look.head.left : c.look.head.right;
    const sz = s.textureSize(tex);
    head.renderer.texture = tex;
    head.renderer.tint = c.tint;
    head.transform.scale = v2(sz.w * pos.scale * c.look.head.textureScale, sz.h * pos.scale * c.look.head.textureScale);
  }
  head.renderer.additional = c.isHeadAnimated() && !head.unscaled ? additionalFor(head.globalRotation, head.animationScale, head.globalPosition) : null;
  const body = pos.body;
  body.renderer.hflip = pos.isFlipped;
  body.renderer.layer = c.layer;
  body.renderer.order = RenderOrders.BodyBaseOrder;
  if (lookUpdate) {
    const tex = pos.isFlipped ? c.look.body.left : c.look.body.right;
    const sz = s.textureSize(tex);
    body.renderer.texture = tex;
    body.renderer.tint = c.tint;
    body.transform.scale = v2(sz.w * pos.scale * c.look.body.textureScale, sz.h * pos.scale * c.look.body.textureScale);
  }
  body.renderer.additional = c.isBodyAnimated() && !body.unscaled ? additionalFor(body.globalRotation, body.animationScale, body.globalPosition) : null;
  for (const hand of pos.hands) {
    const hr = hand.renderer;
    hr.vflip = pos.isFlipped;
    const animated = c.isHandAnimated(hand);
    let look = hand.look;
    if (animated && hand.animatedHandLook !== null) look = hand.animatedHandLook;
    const back = pos.isFlipped !== hand.isLeftHand;
    const tex = handTexture(c, look, back, equipped?.data.weaponType ?? 'Firearm');
    const twoHanded = !!equipped && equipped.holdPoints.length >= 2;
    let order: number;
    if (!hand.isLeftHand && pos.meleeBlockProgress > 0.5) order = RenderOrders.MainHandOrder + 101;
    else if (twoHanded) order = pos.isFlipped ? RenderOrders.OtherHandOrder : RenderOrders.MainHandOrder;
    else order = back ? RenderOrders.OtherHandOrder : RenderOrders.MainHandOrder;
    const armourScale = c.look.hands?.textureScale ?? 1;
    const sz = s.textureSize(tex);
    hand.transform.scale = v2(armourScale * pos.scale * sz.w, armourScale * pos.scale * sz.h);
    hr.additional = animated && c.isAlive && !hand.unscaled ? additionalFor(hand.globalRotation, hand.animationScale, hand.globalPosition) : null;
    hr.layer = c.layer;
    hr.order = order;
    hr.texture = tex;
    hr.tint = c.tint;
    hand.apparentLayer = c.layer;
    hand.apparentOrder = order;
  }
  pos.feet.forEach((foot, i) => {
    if (lookUpdate) {
      const tex = c.look.feet ?? 'textures/bodies/default/foot.png';
      foot.renderer.texture = tex;
      const sz = s.textureSize(tex);
      foot.transform.scale = v2(pos.scale * sz.w, pos.scale * sz.h);
    }
    foot.renderer.hflip = pos.isFlipped;
    foot.renderer.layer = c.layer;
    foot.renderer.order = RenderOrders.FootBaseOrder - pos.feet.length + i;
    foot.renderer.tint = c.tint;
  });
}

function processArmour(s: Scene, c: Character): void {
  const pos = c.positioning;
  const place = (decs: typeof pos.bodyDecorations, layerOf: (i: number) => typeof decs[0]['piece'], parent: { renderer: { additional: import('../engine/matrix.ts').Mat | null } }, order: (i: number) => number): void => {
    decs.forEach((d, i) => {
      if (d.ejected) return;
      const piece = layerOf(i);
      d.piece = piece;
      d.renderer.visible = piece !== null;
      d.renderer.layer = c.layer;
      d.renderer.order = order(i);
      d.renderer.tint = c.tint;
      if (!piece) return;
      d.renderer.additional = parent.renderer.additional;
      d.renderer.hflip = pos.isFlipped;
      if (c.needsLookUpdate) {
        const tex = pos.isFlipped ? piece.left : piece.right;
        d.renderer.texture = tex;
        const sz = s.textureSize(tex);
        d.transform.scale = v2(sz.w * pos.scale * piece.textureScale, sz.h * pos.scale * piece.textureScale);
        const off = { ...(pos.isFlipped ? piece.offsetLeft : piece.offsetRight) };
        off.x /= pos.head.scale.x * pos.flipScaling;
        off.y /= -pos.head.scale.y;
        d.positionOffset = mul(off, pos.scale);
      }
    });
  };
  place(pos.bodyDecorations, (i) => c.look.bodyLayers[i] ?? null, pos.body, () => RenderOrders.BodyDecorOrder);
  place(pos.headDecorations, (i) => c.look.headLayers[i] ?? null, pos.head, (i) => i + RenderOrders.HeadDecorOrder);
}

/** TransformConstraintSystem for the decorations: position = parent * offset, rotation = parent's */
export function constrainDecorations(c: Character): void {
  const pos = c.positioning;
  const apply = (decs: typeof pos.bodyDecorations, parent: { transform: import('../engine/matrix.ts').Transform }): void => {
    for (const d of decs) {
      if (d.ejected || !d.piece) continue;
      d.transform.position = transformPoint(d.positionOffset, parent.transform.localToWorld);
      d.transform.rotation = parent.transform.rotation;
      d.transform.recalc();
    }
  };
  apply(pos.bodyDecorations, pos.body);
  apply(pos.headDecorations, pos.head);
}

function applyWeaponPosition(c: Character, w: Weapon): void {
  const hand = c.positioning.hands[0];
  w.transform.localPivot = v2(-w.holdPoints[0].x, -w.holdPoints[0].y);
  w.transform.rotation = hand.globalRotation;
  w.transform.position = { ...hand.globalPosition };
  w.isFlipped = c.positioning.isFlipped;
  w.transform.scale = v2(1, w.isFlipped ? -1 : 1);
  w.velocity = { ...w.measured };
  w.rotationalVelocity = w.measuredRotation;
  w.layer = hand.apparentLayer;
  w.order = hand.apparentOrder - 100;
}

function processRecoil(c: Character, w: Weapon | null, dt: number): void {
  const pos = c.positioning;
  pos.smoothRecoil = smoothApproach(pos.smoothRecoil, pos.currentRecoil, 25, dt);
  if (c.hasWeaponEquipped && w) {
    const m = (c.isIronSighting ? 2 : 1) * c.stats.recoilHandlingAbility;
    pos.currentRecoil = smoothApproach(pos.currentRecoil, 0, w.data.recoilHandling * m * 5 + 2, dt);
  } else pos.currentRecoil = smoothApproach(pos.currentRecoil, 0, 19, dt);
}

function prepareAnimation(c: Character, dt: number): void {
  const transitionFactorDuration = 0.2;
  const pos = c.positioning;
  const wasPlaying = c.isPlayingAnimation;
  const mixed = mixedAnimation(c);
  const speed = c.mainAnimation?.speed ?? 1;
  c.animationMixProgress = clamp(c.animationMixProgress + dt / c.animationMixDuration * speed);
  if (c.constrainsAny(AC.PreventMixTransition)) c.animationTransitionFactor = 1;
  else if (!c.mainAnimation || c.mainAnimation.unscaledTimer > c.mainAnimation.animation.totalDuration - transitionFactorDuration)
    c.animationTransitionFactor -= dt / transitionFactorDuration;
  else c.animationTransitionFactor += dt / transitionFactorDuration;
  c.animationTransitionFactor = clamp(c.animationTransitionFactor);
  c.animationTransitionFactorEased = Easings.quadInOut(c.animationTransitionFactor);
  if (!wasPlaying) { c.resetAnimation(); return; }
  for (let i = c.animations.length - 1; i >= 0; i--) {
    const a = c.animations[i];
    if (a.isOver) {
      a.onEnd?.();
      c.animations.splice(i, 1);
    }
    if (c.enableAnimationClock) a.unscaledTimer += dt * a.speed;
  }
  pos.head.animationPosition = mul(mixed.headPosition, pos.scale);
  pos.head.animationAngle = mixed.headRotation;
  pos.head.animationScale = mixed.headScale;
  pos.body.animationPosition = mul(mixed.bodyPosition, pos.scale);
  pos.body.animationAngle = mixed.bodyRotation;
  pos.body.animationScale = mixed.bodyScale;
  for (let i = 0; i < pos.hands.length; i++) {
    const ti = pos.isFlipped ? pos.hands.length - 1 - i : i;
    const hand = pos.hands[i];
    hand.animationPosition = ti === 0 ? mixed.hand1Position : mixed.hand2Position;
    hand.animationScale = ti === 0 ? mixed.hand1Scale : mixed.hand2Scale;
    hand.animationAngle = ti === 0 ? mixed.hand1Rotation : mixed.hand2Rotation;
    hand.animatedHandLook = ti === 0 ? mixed.hand1Look : mixed.hand2Look;
  }
}

function positionCenter(s: Scene, c: Character): void {
  const pos = c.positioning;
  if (!c.exitDoor) {
    const target = { ...pos.globalTarget };
    const floor = (s.level ? floorLevelAt(s.level, target.x) : 0) + getFloorOffset(pos.scale);
    target.y += floor;
    if (Math.max(pos.flyingAnimationOffset, pos.flyingOffset) > 0) {
      const o = Math.abs(pos.flyingVelocity);
      pos.flyingAnimationOffset = smoothApproach(pos.flyingAnimationOffset, pos.flyingOffset - o * 0.2, 10, s.clock.dt);
      target.y += pos.flyingAnimationOffset;
    } else pos.flyingAnimationOffset = 0;
    if (distSq(target, pos.globalCenter) > 400 * 400) pos.globalCenter = target;
    else pos.globalCenter = smoothApproachV(pos.globalCenter, target, 20, s.clock.dt);
  }
}

function noise2D(time: number, seed: number): Vec2 {
  return v2(noiseValue(time, seed, 0), noiseValue(time, -seed, 37.29372));
}

function positionHead(s: Scene, c: Character): void {
  const pos = c.positioning;
  const head = pos.head;
  const dt = s.clock.dt;
  const t = s.clock.time;
  const target = mul(normalize(sub(c.aimTargetPosition, head.globalPosition)), 10);
  head.lookOffset = smoothApproachV(head.lookOffset, target, pos.lookOffsetSpeed, dt);
  const headTargetDir = lerpV(v2(target.x * (pos.isFlipped ? -1 : 1), target.y), v2(1, 0), 0.95);
  head.direction = smoothApproachV(head.direction, headTargetDir, pos.lookDirectionSpeed, dt);
  head.transform.localPivot = v2(HeadRotationPivot.x * pos.flipScaling, HeadRotationPivot.y);
  if (pos.isBusyHopping) {
    const intensity = 20;
    const l = pos.hopAnimationTimer;
    const hopCurve = -4 * (l * l) + 4 * l;
    let o = v2(intensity * noiseFractal(t * 0.2, -5.28, pos.noiseOffset, 3), intensity * noiseFractal(64.45, pos.noiseOffset, t * -0.2, 3) / 2);
    o = add(o, mul(c.walkAcceleration, 0.05 * (1 - hopCurve)));
    head.bobOffset = smoothApproachV(head.bobOffset, o, 7, dt);
  } else head.bobOffset = smoothApproachV(head.bobOffset, v2(), 15, dt);
  const basePos = add(pos.body.globalPosition, mul(head.bobOffset, pos.scale * clamp(pos.hopAcceleration)));
  const animatedPos = add(pos.body.globalPosition, head.animationPosition);
  let p = lerpV(basePos, animatedPos, c.animationTransitionFactorEased);
  p.y += pos.body.scale.y / 2;
  p = add(p, v2(pos.body.scale.x * HeadOffsetRelativeToBody.x * pos.flipScaling, pos.body.scale.y * HeadOffsetRelativeToBody.y));
  if (!c.isPlayer) p.y += pos.randomHeightOffset * pos.scale;
  p = rotatePoint(p, pos.body.globalRotation, pos.body.globalPosition);
  p = add(p, mul(head.impact.translation, 1 / pos.scale));
  if (c.look.jitter) p = add(p, mul(noise2D(t * 2, s.entityId(c) % 3000), 12));
  head.transform.position = p;
  head.globalPosition = p;
  const animatedRot = pos.body.animationAngle + head.animationAngle;
  let rot = c.constrainsAny(AC.FaceForwards) ? 0 : vectorToAngle(head.direction) * pos.flipScaling;
  rot += deltaAngle(rot, rot + animatedRot) * c.animationTransitionFactorEased;
  if (c.look.jitter) {
    rot += noiseValue(t * 2, s.entityId(c) % 3000, 0.3123) * 4;
    if (Math.trunc(t * 100) % 400 === 3) rot += randomFloat(-180, 180);
  }
  rot += head.impact.rotation / pos.scale;
  head.transform.rotation = rot;
  head.globalRotation = rot;
  head.transform.recalc();
}

function positionBody(s: Scene, c: Character): void {
  const pos = c.positioning;
  const body = pos.body;
  const t = s.clock.time;
  body.transform.localPivot = v2(BodyRotationPivot.x * pos.flipScaling, BodyRotationPivot.y);
  let p = add(add(pos.globalCenter, body.initialOffset), body.animationPosition);
  p = add(p, mul(body.impact.translation, 1 / pos.scale));
  if (c.look.jitter) p = add(p, mul(noise2D(t * 2, s.entityId(c) % 3000), 8));
  body.transform.position = p;
  body.globalPosition = p;
  let rot = body.animationAngle;
  if (c.isPlayingAnimationGroup('deaths')) rot += pos.flipScaling * 7.5;
  else {
    rot += pos.flipScaling * (8 + pos.head.direction.y * 15);
    rot += body.impact.rotation / pos.scale;
    rot += pos.smoothedMeleeBlockImpactIntensity;
  }
  if (c.look.jitter) rot += noiseValue(t * 2, s.entityId(c) % 3000, 0.3123) * 3;
  let walkTiltIntensity = noiseValue(0, t * 0.2, 0) * 0.5 + 0.5;
  if (pos.isFlying) walkTiltIntensity *= 3;
  const walkTiltTarget = c.walkAcceleration.x * walkTiltIntensity * -0.01;
  let recoilTilt = pos.smoothRecoil * pos.smoothRecoil * 3 * pos.flipScaling;
  if (c.isIronSighting) recoilTilt *= 2;
  const flyingTilt = pos.isFlying ? pos.flyingVelocity * -0.012 : 0;
  pos.tiltIntensity = smoothApproach(pos.tiltIntensity, walkTiltTarget + recoilTilt + flyingTilt, 15, s.clock.dt);
  rot += pos.tiltIntensity * (1 - c.animationTransitionFactorEased);
  body.transform.rotation = rot;
  body.globalRotation = rot;
  body.computedVisualCenter = rotatePoint(add(body.globalPosition, v2(0, body.scale.y / 2)), body.globalRotation, body.globalPosition);
  body.transform.recalc();
}

function positionHands(s: Scene, c: Character, equipped: Weapon | null): void {
  const pos = c.positioning;
  const dt = s.clock.dt;
  const t = s.clock.time;
  {
    let recoilRotation = pos.currentRecoil * 25 * pos.flipScaling;
    if (equipped) recoilRotation *= equipped.data.rotationalRecoilIntensity;
    const recoilOffset = mul(rotatePoint(v2(-100, pos.flipScaling * 40), vectorToAngle(c.aimDirection)), pos.smoothRecoil);
    pos.recoilPositionOffset = recoilOffset;
    pos.recoilAngleOffset = recoilRotation;
    pos.smoothedMeleeBlockImpactIntensity = smoothApproach(pos.smoothedMeleeBlockImpactIntensity, pos.meleeBlockImpactIntensity, 25, dt);
    pos.meleeBlockImpactIntensity = smoothApproach(pos.meleeBlockImpactIntensity, 0, 8, dt);
  }
  const ironSightOffset = mul(IronsightOffset, Easings.quadInOut(pos.ironSightProgress) * pos.scale);
  ironSightOffset.x *= pos.flipScaling;
  positionHandsForWeapon(c, equipped);
  let index = 0;
  for (const hand of pos.hands) {
    if (pos.secondaryHandFollowsPrimary && hand !== pos.hands[0]) continue;
    const animated = c.isHandAnimated(hand);
    let rot = hand.poseRotation;
    let p = add(pos.globalCenter, hand.posePosition);
    p.x += pos.tiltIntensity * -5;
    let animatedPos = hand.animationPosition;
    let animatedRot: number;
    if (c.isPlayingAnimation) {
      if ((c.isPlayingAnimationGroup('dodge') || c.isPlayingAnimationGroup('pickup')) && !c.isPlayingAnimationGroup('melee')) animatedRot = rot;
      else animatedRot = hand.animationAngle + (pos.isFlipped ? 180 : 0);
    } else animatedRot = hand.animationAngle;
    if (!animated) {
      animatedRot = hand.previousAnimatedAngle;
      animatedPos = hand.previousAnimatedPosition;
    } else {
      hand.previousAnimatedAngle = animatedRot;
      hand.previousAnimatedPosition = animatedPos;
    }
    if (c.hasWeaponEquipped && hand.shouldFollowRecoil) {
      rot += pos.recoilAngleOffset;
      p = rotatePoint(add(p, pos.recoilPositionOffset), pos.recoilAngleOffset * 0.5, add(pos.body.computedVisualCenter, mul(pos.handMousePosition, 0.5)));
    }
    p = add(p, ironSightOffset);
    if (c.stats.dodgeAbility > 0.4 && c.dodgeMeter < 0.2) {
      p.x += noiseValue(t, index, 0) * 8;
      p.y += noiseValue(index * 23, 0, t) * 8;
    }
    p = lerpV(p, animatedPos, c.animationTransitionFactorEased);
    rot = lerpAngle(rot, animatedRot, c.animationTransitionFactorEased);
    p.y -= Math.max((354 - pos.body.scale.y) * 0.7, 0);
    if (c.look.jitter) p = add(p, mul(noise2D(t * 2, (s.entityId(c) % 1000) * index), 12));
    hand.globalPosition = p;
    hand.globalRotation = rot;
    index++;
  }
  if (pos.secondaryHandFollowsPrimary) {
    const main = pos.hands[0];
    const second = pos.hands[1];
    second.globalPosition = add(main.globalPosition, rotatePoint(second.posePosition, main.globalRotation));
    second.globalRotation = main.globalRotation + second.poseRotation;
  }
  for (const hand of pos.hands) {
    hand.transform.position = { ...hand.globalPosition };
    hand.transform.rotation = hand.globalRotation;
    hand.transform.recalc();
  }
}

function positionFeet(c: Character): void {
  const pos = c.positioning;
  for (const foot of pos.feet) {
    let p = { ...pos.globalCenter };
    const off = { ...foot.initialOffset };
    off.x *= pos.flipScaling;
    p = add(p, off);
    if (!c.constrainsAny(AC.PreventWalking) && c.isAlive && !pos.isFlying) p = add(p, mul(foot.offset, pos.scale));
    p = add(p, pos.shouldFeetFollowBody ? pos.body.animationPosition : v2(pos.body.animationPosition.x, 0));
    p = rotatePoint(p, pos.body.globalRotation, pos.body.globalPosition);
    p.x -= 5 * pos.flipScaling;
    p.y -= 7;
    const flyingOffset = pos.isFlying ? -15 * pos.flipScaling : 0;
    foot.transform.position = p;
    foot.globalPosition = p;
    foot.transform.rotation = pos.body.animationAngle + (pos.isFlipped ? 8 : -8) + flyingOffset;
    foot.transform.recalc();
  }
}

export { mapRange };
/** for the tests against MIR's own code */
export const internals = { animationResult, mixedAnimation, fistFight };
