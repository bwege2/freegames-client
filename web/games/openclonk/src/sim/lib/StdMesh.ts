// @ts-nocheck
// OpenClonk 36de799: src/lib/StdMesh.cpp, src/lib/StdMesh.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $u64n } from '../../rt/int.ts';
import { c$strcmp } from '../../rt/libc.ts';
import { $oat, $own, $rd, $wr, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $begin, $copy, $delete, $dyncast, $end, $filled, $itcopy, $max, $reserve, $throw, StdException, StdMap, StdPair, StdString, resize, seq_erase, seq_insert, std_find } from '../../rt/std.ts';

export class StdMeshBone {
  Index = 0;
  ID = 0;
  Name = new $.StdCopyStrBuf();
  Transformation = new $.StdMeshTransformation().None();
  InverseTransformation = new $.StdMeshTransformation().None();
  Parent = null;
  Children = [];

  init() {
    this.Name = new $.StdCopyStrBuf();
    this.Transformation = new $.StdMeshTransformation().None();
    this.InverseTransformation = new $.StdMeshTransformation().None();
    this.Children = [];
    return this;
  }

  GetParent() {
    return this.Parent;
  }

  $clone() { return new StdMeshBone().$assign(this); }
  $assign(o) {
    this.Index = o.Index;
    this.ID = o.ID;
    this.Name.$assign(o.Name);
    this.Transformation.$assign(o.Transformation);
    this.InverseTransformation.$assign(o.InverseTransformation);
    this.Parent = o.Parent;
    this.Children = o.Children.slice();
    return this;
  }
}

export class StdMeshFaceOrderHelper {
  z = 0;
  i = 0;

  $clone() { return new StdMeshFaceOrderHelper().$assign(this); }
  $assign(o) {
    this.z = o.z;
    this.i = o.i;
    return this;
  }
}

export class StdMeshVertexBoneAssignment {
  BoneIndex = 0;
  Weight = 0;

  $clone() { return new StdMeshVertexBoneAssignment().$assign(this); }
  $assign(o) {
    this.BoneIndex = o.BoneIndex;
    this.Weight = o.Weight;
    return this;
  }
}

export class StdMeshFace {
  Vertices = new Uint32Array(3);

  $clone() { return new StdMeshFace().$assign(this); }
  $assign(o) {
    this.Vertices = o.Vertices.slice();
    return this;
  }
}

export class StdMeshKeyFrame {
  Transformation = new $.StdMeshTransformation().None();

  $clone() { return new StdMeshKeyFrame().$assign(this); }
  $assign(o) {
    this.Transformation.$assign(o.Transformation);
    return this;
  }
}

export class StdMeshTrack {
  Frames = new StdMap();

  GetTransformAt(time, length) {
    let iter = this.Frames.lower_bound(time);
    if (iter.eq(this.Frames.begin())) {
      return iter.v.second.Transformation.$clone();
    }
    let prev_iter = $itcopy(iter);
    prev_iter.dec();
    let iter_pos = 0;
    if (iter.eq(this.Frames.end())) {
      iter = this.Frames.begin().copy();
      iter_pos = length;
    } else {
      iter_pos = iter.v.first;
    }
    0;
    0;
    0;
    let dt = Math.fround(iter_pos - prev_iter.v.first);
    let weight1 = Math.fround(Math.fround(time - prev_iter.v.first) / dt);
    let weight2 = Math.fround(Math.fround(iter_pos - time) / dt);
    weight2;
    0;
    0;
    return $.StdMeshTransformation.Nlerp(prev_iter.v.second.Transformation, iter.v.second.Transformation, weight1);
  }

  None() {
    this.Frames = new StdMap();
    return this;
  }

  $clone() { return new StdMeshTrack().$assign(this); }
  $assign(o) {
    this.Frames = o.Frames.$clone();
    return this;
  }
}

export class StdMeshAnimation {
  Name = new $.StdCopyStrBuf();
  Length = 0;
  Tracks = [];
  OriginSkeleton = null;

  init() {
    this.Name = new $.StdCopyStrBuf();
    this.Tracks = [];
    return this;
  }

  $dtor() {
    let $t1;
    $t1 = this.Tracks;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const Track = P($t1, $i1);
      $delete(Track.a[Track.o]);
    }
  }

  $copy(other) {
    this.Name = new $.StdCopyStrBuf().init$StdCopyStrBuf$b(other.Name);
    this.Length = other.Length;
    this.Tracks = $filled(other.Tracks.length, () => null);
    for (let i = 0; i < this.Tracks.length; i = i + 1 >>> 0) {
      if (other.Tracks[i] != null) {
        this.Tracks[i] = other.Tracks[i].$clone();
      }
    }
    this.OriginSkeleton = other.OriginSkeleton;
    return this;
  }
  $clone() { return new StdMeshAnimation().$copy(this); }
  $assign(other) {
    let $t1;
    if (this === other) {
      return this;
    }
    this.Name.$assign(other.Name);
    this.Length = other.Length;
    $t1 = this.Tracks;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const Track = P($t1, $i1);
      $delete(Track.a[Track.o]);
    }
    resize(this.Tracks, other.Tracks.length, () => null);
    for (let i = 0; i < this.Tracks.length; i = i + 1 >>> 0) {
      if (other.Tracks[i] != null) {
        this.Tracks[i] = other.Tracks[i].$clone();
      }
    }
    return this;
  }
}

export class StdMeshSkeleton {
  Bones = [];
  Animations = new StdMap((a, b) => a.op_lt(b));

  init() {
    this.Bones = [];
    this.Animations = new StdMap((a, b) => a.op_lt(b));
    return this;
  }

  $dtor() {
    let $t1;
    $t1 = this.Bones;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const Bone = P($t1, $i1);
      $delete(Bone.a[Bone.o]);
    }
  }

  GetBone(i) {
    return this.Bones[i];
  }

  GetNumBones() {
    return this.Bones.length;
  }

  GetBoneByName(name) {
    for (const Bone of this.Bones) {
      if (Bone.Name.op_eq$StdStrBuf(name)) {
        return Bone;
      }
    }
    return null;
  }

  GetAnimationByName(name) {
    let name2 = new $.StdCopyStrBuf().init$StdStrBuf$b(name);
    let iter = this.Animations.find(name2);
    if (iter.eq(this.Animations.end())) {
      return null;
    }
    return iter.v.second;
  }

  IsAnimated() {
    return !this.Animations.empty();
  }

  MirrorAnimation(animation) {
    let name = new $.StdCopyStrBuf().init$StdCopyStrBuf$b(animation.Name);
    if (!MirrorName(name) || !this.Animations.find(name).eq(this.Animations.end())) {
      return;
    }
    const new_anim = this.Animations.insertPair(new StdPair($copy(name), $copy(animation))).first.v.second;
    new_anim.Name.$assign(name);
    for (let i = 0; i < this.GetNumBones(); i = i + 1 >>> 0) {
      const bone = this.GetBone(i);
      let other_bone_name = new $.StdCopyStrBuf().init$StdCopyStrBuf$b(bone.Name);
      if (MirrorName(other_bone_name)) {
        let other_bone = this.GetBoneByName(other_bone_name);
        if (other_bone == null) {
          $throw(new StdException(StdString.of(S("No counterpart for bone ")).plus(bone.Name.getData()).plus(S(" found")), "runtime_error"));
        }
        if ((animation.Tracks[i] != null || animation.Tracks[other_bone.Index] != null) && other_bone.Index > bone.Index) {
          [new_anim.Tracks[i], new_anim.Tracks[other_bone.Index]] = [new_anim.Tracks[other_bone.Index], new_anim.Tracks[i]];
          let own_trans = $.op_mul$StdMeshTransformation$StdMeshTransformation(bone.GetParent().InverseTransformation, bone.Transformation);
          let other_own_trans = $.op_mul$StdMeshTransformation$StdMeshTransformation(other_bone.GetParent().InverseTransformation, other_bone.Transformation);
          if (new_anim.Tracks[i] != null) {
            for (const Frame of new_anim.Tracks[i].Frames) {
              MirrorKeyFrame(Frame.second, own_trans, $.StdMeshTransformation.Inverse(other_own_trans));
            }
          }
          if (new_anim.Tracks[other_bone.Index] != null) {
            for (const Frame of new_anim.Tracks[other_bone.Index].Frames) {
              MirrorKeyFrame(Frame.second, other_own_trans, $.StdMeshTransformation.Inverse(own_trans));
            }
          }
        }
      } else if (bone.Name.Compare_(S(".N"), bone.Name.getLength() - 2) !== 0) {
        if (new_anim.Tracks[i] != null) {
          let own_trans = bone.Transformation.$clone();
          if (bone.GetParent() != null) {
            own_trans.$assign($.op_mul$StdMeshTransformation$StdMeshTransformation(bone.GetParent().InverseTransformation, bone.Transformation));
          }
          for (const Frame of new_anim.Tracks[i].Frames) {
            MirrorKeyFrame(Frame.second, own_trans, $.StdMeshTransformation.Inverse(own_trans));
          }
        }
      }
    }
  }

  InsertAnimation$StdMeshAnimation(animation) {
    0;
    this.Animations.insertPair(new StdPair($copy(animation.Name), $copy(animation)));
  }

  InsertAnimation$StdMeshSkeleton$StdMeshAnimation(source, animation) {
    0;
    let bone_index_source = source.GetMatchingBones(this);
    let anim = new StdMeshAnimation().init();
    anim.Name.$assign(animation.Name);
    anim.Length = animation.Length;
    resize(anim.Tracks, this.GetNumBones(), () => null);
    anim.OriginSkeleton = source;
    for (let i = 0; i < anim.Tracks.length; i = i + 1 >>> 0) {
      if (bone_index_source[i] > -1 && animation.Tracks[$u64n(bone_index_source[i])] != null) {
        anim.Tracks[i] = animation.Tracks[$u64n(bone_index_source[i])].$clone();
      }
    }
    this.Animations.insertPair(new StdPair($copy(animation.Name), $copy(anim)));
  }

  PostInit() {
    for (const Animation of this.Animations) {
      this.MirrorAnimation(Animation.second);
    }
  }

  GetMatchingBones(child_skeleton) {
    let MatchedBoneInParentSkeleton = [];
    for (let i = 0; i < child_skeleton.GetNumBones(); i = i + 1 >>> 0) {
      let parent_bone_index = -1;
      for (let j = 0; j < this.GetNumBones(); j = j + 1 >>> 0) {
        let sample_index = (i + j >>> 0) % this.GetNumBones() | 0;
        if (this.GetBone($u64n(sample_index)).Name.op_eq$StdStrBuf(child_skeleton.GetBone(i).Name)) {
          parent_bone_index = sample_index;
          break;
        }
      }
      MatchedBoneInParentSkeleton.push(parent_bone_index);
    }
    return MatchedBoneInParentSkeleton;
  }

  GetAnimations() {
    let result = [];
    $reserve(result, this.Animations.size());
    for (const Animation of this.Animations) {
      result.push(Animation.second);
    }
    return result;
  }

  AddMasterBone(bone) {
    let $t1;
    bone.Index = this.Bones.length >>> 0;
    this.Bones.push(bone);
    $t1 = bone.Children;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const i = P($t1, $i1);
      this.AddMasterBone(i.a[i.o]);
    }
  }

  $clone() { return new StdMeshSkeleton().$assign(this); }
  $assign(o) {
    this.Bones = o.Bones.slice();
    this.Animations = o.Animations.$clone();
    return this;
  }
}

export class StdMeshBox {
  x1 = 0;
  y1 = 0;
  z1 = 0;
  x2 = 0;
  y2 = 0;
  z2 = 0;

  GetCenter() {
    return ((($o) => ($o.x = Math.fround(Math.fround(this.x2 + this.x1) / 2), $o.y = Math.fround(Math.fround(this.y2 + this.y1) / 2), $o.z = Math.fround(Math.fround(this.z2 + this.z1) / 2), $o))(new $.StdMeshVector()));
  }

  $clone() { return new StdMeshBox().$assign(this); }
  $assign(o) {
    this.x1 = o.x1;
    this.y1 = o.y1;
    this.z1 = o.z1;
    this.x2 = o.x2;
    this.y2 = o.y2;
    this.z2 = o.z2;
    return this;
  }
}

export class ValueProviderAdapt {
  ValueProvider = null;

  init(Provider) {
    this.ValueProvider = Provider;
    return this;
  }

  CompileFunc(pComp) {
    let id = null;
    const svp = [null];
    if (pComp.isDeserializer()) {
      let id_str = new $.StdCopyStrBuf();
      pComp.Value$StdParameterAdapt$StdCopyStrBuf$i32($.mkParAdapt$rStdCopyStrBuf$mi32(id_str, 2 /*RCT_Idtf*/));
      id = StdMeshInstance$SerializableValueProvider.Lookup$pi8(id_str.getData());
      if (id == null) {
        pComp.excCorrupt(S("No value provider for ID \"%s\""), id_str.getData());
      }
    } else {
      svp[0] = $dyncast(this.ValueProvider.a[this.ValueProvider.o], StdMeshInstance$SerializableValueProvider);
      if (svp[0] == null) {
        pComp.excCorrupt(S("Value provider cannot be compiled"));
      }
      id = StdMeshInstance$SerializableValueProvider.Lookup$type_info(svp[0].constructor);
      if (id == null) {
        pComp.excCorrupt(S("No ID for value provider registered"));
      }
      let id_str = new $.StdCopyStrBuf().init$pi8$b(id.name);
      pComp.Value$StdParameterAdapt$StdCopyStrBuf$i32($.mkParAdapt$rStdCopyStrBuf$mi32(id_str, 2 /*RCT_Idtf*/));
    }
    pComp.Separator(7 /*SEP_START*/);
    pComp.Value$StdContextPtrAdapt$SerializableValueProvider$IDBase($.mkContextPtrAdapt(P(svp, 0), id, false));
    pComp.Separator(8 /*SEP_END*/);
    if (pComp.isDeserializer()) {
      this.ValueProvider.a[this.ValueProvider.o] = svp[0];
    }
  }

  $clone() { return new ValueProviderAdapt().$assign(this); }
  $assign(o) {
    this.ValueProvider = o.ValueProvider;
    return this;
  }
}

export class StdSubMesh {
  Vertices = [];
  Faces = [];
  vertex_buffer_offset = 0;
  index_buffer_offset = 0;
  Material = null;

  GetVertices() {
    return this.Vertices;
  }

  GetVertex(i) {
    return this.Vertices[i];
  }

  GetNumVertices() {
    return this.Vertices.length;
  }

  GetFace(i) {
    return this.Faces[i];
  }

  GetNumFaces() {
    return this.Faces.length;
  }

  GetMaterial() {
    return this.Material;
  }

  GetOffsetInVBO() {
    return this.vertex_buffer_offset;
  }

  GetOffsetInIBO() {
    return this.index_buffer_offset;
  }

  init() {
    this.Vertices = [];
    this.Faces = [];
    this.vertex_buffer_offset = 0;
    this.index_buffer_offset = 0;
    this.Material = null;
    return this;
  }

  $clone() { return new StdSubMesh().$assign(this); }
  $assign(o) {
    this.Vertices = o.Vertices.slice();
    this.Faces = o.Faces.slice();
    this.vertex_buffer_offset = o.vertex_buffer_offset;
    this.index_buffer_offset = o.index_buffer_offset;
    this.Material = o.Material;
    return this;
  }
}

export class StdMesh {
  SharedVertices = [];
  SubMeshes = [];
  Skeleton = null;
  Label = new StdString();
  BoundingBox = new StdMeshBox();
  BoundingRadius = 0;

  init() {
    this.SharedVertices = [];
    this.SubMeshes = [];
    this.Skeleton = new StdMeshSkeleton().init();
    this.Label = new StdString();
    this.BoundingBox = new StdMeshBox();
    this.BoundingBox.x1 = this.BoundingBox.y1 = this.BoundingBox.z1 = 0;
    this.BoundingBox.x2 = this.BoundingBox.y2 = this.BoundingBox.z2 = 0;
    this.BoundingRadius = 0;
    return this;
  }

  GetSubMesh(i) {
    return this.SubMeshes[i];
  }

  GetNumSubMeshes() {
    return this.SubMeshes.length;
  }

  GetSharedVertices() {
    return this.SharedVertices;
  }

  GetSkeleton$v$c() {
    return this.Skeleton;
  }

  GetSkeleton$v() {
    return this.Skeleton;
  }

  GetBoundingBox() {
    return this.BoundingBox;
  }

  GetBoundingRadius() {
    return this.BoundingRadius;
  }

  PostInit() {
  }

  SetLabel(label) {
    this.Label.assign(label);
  }

  $clone() { return new StdMesh().$assign(this); }
  $assign(o) {
    this.SharedVertices = o.SharedVertices.slice();
    this.SubMeshes = o.SubMeshes.slice();
    this.Skeleton = o.Skeleton;
    this.Label = o.Label.$clone();
    this.BoundingBox.$assign(o.BoundingBox);
    this.BoundingRadius = o.BoundingRadius;
    return this;
  }
}

export class MatrixAdapt {
  Matrix = null;

  init(matrix) {
    this.Matrix = matrix;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Separator(7 /*SEP_START*/);
    for (let i = 0; i < 3; i = i + 1 >>> 0) {
      for (let j = 0; j < 4; j = j + 1 >>> 0) {
        if (i !== 0 || j !== 0) {
          pComp.Separator();
        }
        CompileFloat(pComp, this.Matrix.op_call$i32$i32(i | 0, j | 0));
      }
    }
    pComp.Separator(8 /*SEP_END*/);
  }

  $clone() { return new MatrixAdapt().$assign(this); }
  $assign(o) {
    this.Matrix = o.Matrix;
    return this;
  }
}

export class TransformAdapt {
  Trans = null;

  init(trans) {
    this.Trans = trans;
    return this;
  }

  CompileFunc(pComp) {
    pComp.Separator(7 /*SEP_START*/);
    CompileFloat(pComp, P(this.Trans.translate, "x"));
    CompileFloat(pComp, P(this.Trans.translate, "y"));
    CompileFloat(pComp, P(this.Trans.translate, "z"));
    CompileFloat(pComp, P(this.Trans.rotate, "w"));
    CompileFloat(pComp, P(this.Trans.rotate, "x"));
    CompileFloat(pComp, P(this.Trans.rotate, "y"));
    CompileFloat(pComp, P(this.Trans.rotate, "z"));
    CompileFloat(pComp, P(this.Trans.scale, "x"));
    CompileFloat(pComp, P(this.Trans.scale, "y"));
    CompileFloat(pComp, P(this.Trans.scale, "z"));
    pComp.Separator(8 /*SEP_END*/);
  }

  $clone() { return new TransformAdapt().$assign(this); }
  $assign(o) {
    this.Trans = o.Trans;
    return this;
  }
}

export class StdSubMeshInstance {
  base = null;
  Faces = [];
  Material = null;
  PassData = [];
  CurrentFaceOrdering = 0;

  init(_instance, submesh, _completion) {
    this.base = submesh;
    this.Faces = [];
    this.Material = null;
    this.PassData = [];
    this.CurrentFaceOrdering = 0 /*FO_Fixed*/;
    StdSubMeshInstance.prototype.SetMaterial.call(this, submesh.GetMaterial());
    return this;
  }

  LoadFacesForCompletion(_instance, _submesh, _completion) {
  }

  CompileFunc(pComp) {
    if (pComp.isDeserializer()) {
      let material_name = new $.StdCopyStrBuf();
      pComp.Value$StdNamingAdapt$StdCopyStrBuf($.mkNamingAdapt$rStdCopyStrBuf$pi8(material_name, S("Material")));
      if (material_name.op_ne$StdStrBuf(this.Material.Name)) {
        let material = $.MeshMaterialManager.GetMaterial(material_name.getData());
        if (material == null) {
          let buf = new $.StdStrBuf();
          buf.Format(S("There is no such material with name \"%s\""), material_name.getData());
          pComp.excCorrupt(buf.getData());
        }
        this.SetMaterial(material);
      }
    } else {
      let material_name = new $.StdCopyStrBuf().init$StdCopyStrBuf$b(this.Material.Name);
      pComp.Value$StdNamingAdapt$StdCopyStrBuf($.mkNamingAdapt$rStdCopyStrBuf$pi8(material_name, S("Material")));
    }
  }

  GetFaces() {
    return this.Faces.length > 0 ? this.Faces[0] : null;
  }

  GetNumFaces() {
    return this.Faces.length;
  }

  GetSubMesh() {
    return this.base;
  }

  GetTexturePhase(pass, texunit) {
    return this.PassData[pass].TexUnits[texunit].Phase;
  }

  GetTexturePosition(pass, texunit) {
    return this.PassData[pass].TexUnits[texunit].Position;
  }

  GetMaterial() {
    return this.Material;
  }

  GetFaceOrdering() {
    return this.CurrentFaceOrdering;
  }

  SetMaterial(material) {
    this.Material = material;
  }

  SetFaceOrdering(_instance, _submesh, _ordering) {
  }

  SetFaceOrderingForClrModulation(_instance, _submesh, _clrmod) {
  }

  $clone() { return new StdSubMeshInstance().$assign(this); }
  $assign(o) {
    this.base = o.base;
    this.Faces = o.Faces.slice();
    this.Material = o.Material;
    this.PassData = o.PassData.slice();
    this.CurrentFaceOrdering = o.CurrentFaceOrdering;
    return this;
  }
}

export class StdMeshInstanceValueProvider {
  Value = new $.C4Fixed();

  init() {
    this.Value = $.Fix0$C4Real.$clone();
    return this;
  }

  $clone() { return new StdMeshInstanceValueProvider().$assign(this); }
  $assign(o) {
    this.Value.$assign(o.Value);
    return this;
  }
}

export class StdMeshInstanceAnimationNode {
  Slot = 0;
  Number = 0;
  Type = 0 /*LeafNode*/;
  Parent = null;
  $u1 = new StdMeshInstanceAnimationNode$$anon1();

  init$v() {
    this.Type = 0 /*LeafNode*/;
    this.Parent = null;
    this.$u1.Leaf.Animation = null;
    this.$u1.Leaf.Position = null;
    return this;
  }

  init$pStdMeshAnimation$pValueProvider(animation, position) {
    this.Type = 0 /*LeafNode*/;
    this.Parent = null;
    this.$u1.Leaf.Animation = animation;
    this.$u1.Leaf.Position = position;
    return this;
  }

  init$pStdMeshBone$StdMeshTransformation(bone, trans) {
    this.Type = 1 /*CustomNode*/;
    this.Parent = null;
    this.$u1.Custom.BoneIndex = bone.Index;
    this.$u1.Custom.Transformation = trans.$clone();
    return this;
  }

  init$pAnimationNode$pAnimationNode$pValueProvider(child_left, child_right, weight) {
    this.Type = 2 /*LinearInterpolationNode*/;
    this.Parent = null;
    this.$u1.LinearInterpolation.ChildLeft = child_left;
    this.$u1.LinearInterpolation.ChildRight = child_right;
    this.$u1.LinearInterpolation.Weight = weight;
    return this;
  }

  $dtor() {
    switch (this.Type) {
      case 0:
        $delete(this.$u1.Leaf.Position);
        break;
      case 1:
        $delete(this.$u1.Custom.Transformation);
        break;
      case 2:
        $delete(this.$u1.LinearInterpolation.ChildLeft);
        $delete(this.$u1.LinearInterpolation.ChildRight);
        $delete(this.$u1.LinearInterpolation.Weight);
        break;
    }
  }

  GetBoneTransform(bone, transformation) {
    let combine_with = new $.StdMeshTransformation().None();
    let track = null;
    switch (this.Type) {
      case 0:
        track = this.$u1.Leaf.Animation.Tracks[bone];
        if (track == null) {
          return false;
        }
        transformation.$assign(track.GetTransformAt($.fixtof(this.$u1.Leaf.Position.Value), this.$u1.Leaf.Animation.Length));
        return true;
      case 1:
        if (bone === this.$u1.Custom.BoneIndex) {
          transformation.$assign(this.$u1.Custom.Transformation);
        } else {
          return false;
        }
        return true;
      case 2:
        if (!this.$u1.LinearInterpolation.ChildLeft.GetBoneTransform(bone, transformation)) {
          return this.$u1.LinearInterpolation.ChildRight.GetBoneTransform(bone, transformation);
        }
        if (!this.$u1.LinearInterpolation.ChildRight.GetBoneTransform(bone, combine_with)) {
          return true;
        }
        transformation.$assign($.StdMeshTransformation.Nlerp(transformation, combine_with, $.fixtof(this.$u1.LinearInterpolation.Weight.Value)));
        return true;
      default:
        0;
        return false;
    }
  }

  GetSlot() {
    return this.Slot;
  }

  GetNumber() {
    return this.Number;
  }

  GetType() {
    return this.Type;
  }

  GetParent() {
    return this.Parent;
  }

  GetAnimation() {
    0;
    return this.$u1.Leaf.Animation;
  }

  GetPositionProvider() {
    0;
    return this.$u1.Leaf.Position;
  }

  GetPosition() {
    0;
    return this.$u1.Leaf.Position.Value.$clone();
  }

  GetLeftChild() {
    0;
    return this.$u1.LinearInterpolation.ChildLeft;
  }

  GetRightChild() {
    0;
    return this.$u1.LinearInterpolation.ChildRight;
  }

  GetWeightProvider() {
    0;
    return this.$u1.LinearInterpolation.Weight;
  }

  GetWeight() {
    0;
    return this.$u1.LinearInterpolation.Weight.Value.$clone();
  }

  CompileFunc(pComp, Mesh) {
    if (!('StdMeshInstanceAnimationNode$CompileFunc$NodeTypes' in $)) $.StdMeshInstanceAnimationNode$CompileFunc$NodeTypes = $own([((($o) => ($o.Name = S("Leaf"), $o.Val = 0 /*LeafNode*/, $o))(new $.StdEnumEntry$i32$12())), ((($o) => ($o.Name = S("Custom"), $o.Val = 1 /*CustomNode*/, $o))(new $.StdEnumEntry$i32$12())), ((($o) => ($o.Name = S("LinearInterpolation"), $o.Val = 2 /*LinearInterpolationNode*/, $o))(new $.StdEnumEntry$i32$12())), ((($o) => ($o.Name = null, $o.Val = 0, $o))(new $.StdEnumEntry$i32$12()))]);
    pComp.Value$StdNamingAdapt$i32($.mkNamingAdapt$ri32$pi8(P(this, "Slot"), S("Slot")));
    pComp.Value$StdNamingAdapt$u32($.mkNamingAdapt$ru32$pi8(P(this, "Number"), S("Number")));
    pComp.Value$StdNamingAdapt$StdEnumAdapt$i32$u8($.mkNamingAdapt$mStdEnumAdapt$i32$u8$pi8($.mkEnumAdaptT$8(P(this, "Type"), $oat($.StdMeshInstanceAnimationNode$CompileFunc$NodeTypes, 0)), S("Type")));
    switch (this.Type) {
      case 0:
        if (pComp.isDeserializer()) {
          let anim_name = new $.StdCopyStrBuf();
          pComp.Value$StdNamingAdapt$StdParameterAdapt$StdCopyStrBuf$i32($.mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8($.mkParAdapt$rStdCopyStrBuf$mi32(anim_name, 1 /*RCT_All*/), S("Animation")));
          this.$u1.Leaf.Animation = Mesh.GetSkeleton$v$c().GetAnimationByName(anim_name);
          if (this.$u1.Leaf.Animation == null) {
            pComp.excCorrupt(S("No such animation: \"%s\""), anim_name.getData());
          }
        } else {
          pComp.Value$StdNamingAdapt$StdParameterAdapt$StdDecompileAdapt$StdCopyStrBuf$i32($.mkNamingAdapt$mStdParameterAdapt$StdDecompileAdapt$StdCopyStrBuf$i32$pi8($.mkParAdapt$mStdDecompileAdapt$StdCopyStrBuf$mi32($.mkDecompileAdapt$StdCopyStrBuf(this.$u1.Leaf.Animation.Name), 1 /*RCT_All*/), S("Animation")));
        }
        pComp.Value$StdNamingAdapt$ValueProviderAdapt($.mkNamingAdapt$mValueProviderAdapt$pi8(mkValueProviderAdapt(P(this.$u1.Leaf, "Position")), S("Position")));
        break;
      case 1:
        if (pComp.isDeserializer()) {
          let bone_name = new $.StdCopyStrBuf();
          pComp.Value$StdNamingAdapt$StdParameterAdapt$StdCopyStrBuf$i32($.mkNamingAdapt$mStdParameterAdapt$StdCopyStrBuf$i32$pi8($.mkParAdapt$rStdCopyStrBuf$mi32(bone_name, 1 /*RCT_All*/), S("Bone")));
          let bone = Mesh.GetSkeleton$v$c().GetBoneByName(bone_name);
          if (bone == null) {
            pComp.excCorrupt(S("No such bone: \"%s\""), bone_name.getData());
          }
          this.$u1.Custom.BoneIndex = bone.Index;
          this.$u1.Custom.Transformation = new $.StdMeshTransformation().None();
        } else {
          pComp.Value$StdNamingAdapt$StdParameterAdapt$StdDecompileAdapt$StdCopyStrBuf$i32($.mkNamingAdapt$mStdParameterAdapt$StdDecompileAdapt$StdCopyStrBuf$i32$pi8($.mkParAdapt$mStdDecompileAdapt$StdCopyStrBuf$mi32($.mkDecompileAdapt$StdCopyStrBuf(Mesh.GetSkeleton$v$c().GetBone(this.$u1.Custom.BoneIndex).Name), 1 /*RCT_All*/), S("Bone")));
        }
        pComp.Value$StdNamingAdapt$TransformAdapt($.mkNamingAdapt$mTransformAdapt$pi8(mkTransformAdapt(this.$u1.Custom.Transformation), S("Transformation")));
        break;
      case 2:
        pComp.Value$StdParameterAdapt$StdPtrAdapt$StdMeshInstanceAnimationNode$pStdMesh($.mkParAdapt$mStdPtrAdapt$StdMeshInstanceAnimationNode$pStdMesh($.mkNamingPtrAdapt$rpStdMeshInstanceAnimationNode$pi8(P(this.$u1.LinearInterpolation, "ChildLeft"), S("ChildLeft")), Mesh));
        pComp.Value$StdParameterAdapt$StdPtrAdapt$StdMeshInstanceAnimationNode$pStdMesh($.mkParAdapt$mStdPtrAdapt$StdMeshInstanceAnimationNode$pStdMesh($.mkNamingPtrAdapt$rpStdMeshInstanceAnimationNode$pi8(P(this.$u1.LinearInterpolation, "ChildRight"), S("ChildRight")), Mesh));
        pComp.Value$StdNamingAdapt$ValueProviderAdapt($.mkNamingAdapt$mValueProviderAdapt$pi8(mkValueProviderAdapt(P(this.$u1.LinearInterpolation, "Weight")), S("Weight")));
        if (pComp.isDeserializer()) {
          if (this.$u1.LinearInterpolation.ChildLeft.Slot !== this.Slot) {
            pComp.excCorrupt(S("Slot of left child does not match parent slot"));
          }
          if (this.$u1.LinearInterpolation.ChildRight.Slot !== this.Slot) {
            pComp.excCorrupt(S("Slof of right child does not match parent slot"));
          }
          this.$u1.LinearInterpolation.ChildLeft.Parent = this;
          this.$u1.LinearInterpolation.ChildRight.Parent = this;
        }
        break;
      default:
        pComp.excCorrupt(S("Invalid animation node type"));
        break;
    }
  }

  DenumeratePointers() {
    let value_provider = null;
    switch (this.Type) {
      case 0:
        value_provider = $dyncast(this.$u1.Leaf.Position, StdMeshInstance$SerializableValueProvider);
        break;
      case 1:
        value_provider = null;
        break;
      case 2:
        value_provider = $dyncast(this.$u1.LinearInterpolation.Weight, StdMeshInstance$SerializableValueProvider);
        break;
    }
    if (value_provider != null) {
      value_provider.DenumeratePointers();
    }
  }

  ClearPointers(pObj) {
    let value_provider = null;
    switch (this.Type) {
      case 0:
        value_provider = $dyncast(this.$u1.Leaf.Position, StdMeshInstance$SerializableValueProvider);
        break;
      case 1:
        value_provider = null;
        break;
      case 2:
        value_provider = $dyncast(this.$u1.LinearInterpolation.Weight, StdMeshInstance$SerializableValueProvider);
        break;
    }
    if (value_provider != null) {
      value_provider.ClearPointers(pObj);
    }
  }

  $clone() { return new StdMeshInstanceAnimationNode().$assign(this); }
  $assign(o) {
    this.Slot = o.Slot;
    this.Number = o.Number;
    this.Type = o.Type;
    this.Parent = o.Parent;
    this.$u1.$assign(o.$u1);
    return this;
  }
}

export class StdMeshInstanceAnimationNode$$anon1 {
  $v = 0;
  get Leaf() { const v = this.$v; return v instanceof StdMeshInstanceAnimationNode$$anon1$$anon1 ? v : (this.$v = new StdMeshInstanceAnimationNode$$anon1$$anon1()); }
  set Leaf(v) { this.$v = v.$clone(); }
  get Custom() { const v = this.$v; return v instanceof StdMeshInstanceAnimationNode$$anon1$$anon2 ? v : (this.$v = new StdMeshInstanceAnimationNode$$anon1$$anon2()); }
  set Custom(v) { this.$v = v.$clone(); }
  get LinearInterpolation() { const v = this.$v; return v instanceof StdMeshInstanceAnimationNode$$anon1$$anon3 ? v : (this.$v = new StdMeshInstanceAnimationNode$$anon1$$anon3()); }
  set LinearInterpolation(v) { this.$v = v.$clone(); }
  $clone() { const u = new StdMeshInstanceAnimationNode$$anon1(); u.$v = this.$v && this.$v.$clone ? this.$v.$clone() : this.$v; return u; }
  $assign(o) { this.$v = o.$v && o.$v.$clone ? o.$v.$clone() : o.$v; return this; }
}

export class StdMeshInstanceAnimationNode$$anon1$$anon1 {
  Animation = null;
  Position = null;

  $clone() { return new StdMeshInstanceAnimationNode$$anon1$$anon1().$assign(this); }
  $assign(o) {
    this.Animation = o.Animation;
    this.Position = o.Position;
    return this;
  }
}

export class StdMeshInstanceAnimationNode$$anon1$$anon2 {
  BoneIndex = 0;
  Transformation = null;

  $clone() { return new StdMeshInstanceAnimationNode$$anon1$$anon2().$assign(this); }
  $assign(o) {
    this.BoneIndex = o.BoneIndex;
    this.Transformation = o.Transformation;
    return this;
  }
}

export class StdMeshInstanceAnimationNode$$anon1$$anon3 {
  ChildLeft = null;
  ChildRight = null;
  Weight = null;

  $clone() { return new StdMeshInstanceAnimationNode$$anon1$$anon3().$assign(this); }
  $assign(o) {
    this.ChildLeft = o.ChildLeft;
    this.ChildRight = o.ChildRight;
    this.Weight = o.Weight;
    return this;
  }
}

export class StdMeshInstance {
  Mesh = null;
  Completion = 0;
  AnimationNodes = [];
  AnimationStack = [];
  BoneTransforms = [];
  SubMeshInstances = [];
  SubMeshInstancesOrdered = [];
  AttachChildren = [];
  AttachParent = null;
  BoneTransformsDirty = false;

  init(mesh, completion = 1) {
    this.Mesh = mesh;
    this.Completion = completion;
    this.AnimationNodes = [];
    this.AnimationStack = [];
    this.BoneTransforms = $filled(this.Mesh.GetSkeleton$v$c().GetNumBones(), () => $.StdMeshMatrix.Identity());
    this.SubMeshInstances = $filled(this.Mesh.GetNumSubMeshes(), () => null);
    this.SubMeshInstancesOrdered = [];
    this.AttachChildren = [];
    this.AttachParent = null;
    this.BoneTransformsDirty = false;
    for (let i = 0; i < this.Mesh.GetNumSubMeshes(); i = i + 1 >>> 0) {
      const submesh = this.Mesh.GetSubMesh(i);
      this.SubMeshInstances[i] = new StdSubMeshInstance().init(this, submesh, completion);
    }
    this.SubMeshInstancesOrdered = this.SubMeshInstances.slice();
    return this;
  }

  $dtor() {
    let $t1;
    if (this.AttachParent != null) {
      this.AttachParent.Parent.DetachMesh(this.AttachParent.Number);
    }
    while (!(this.AttachChildren.length === 0)) {
      StdMeshInstance.prototype.DetachMesh.call(this, this.AttachChildren[this.AttachChildren.length - 1].Number);
    }
    while (!(this.AnimationStack.length === 0)) {
      StdMeshInstance.prototype.StopAnimation.call(this, this.AnimationStack[0]);
    }
    0;
    $t1 = this.SubMeshInstances;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const SubMeshInstance = P($t1, $i1);
      $delete(SubMeshInstance.a[SubMeshInstance.o]);
    }
  }

  SetFaceOrdering(_ordering) {
  }

  SetFaceOrderingForClrModulation(_clrmod) {
  }

  GetSharedVertices() {
    return this.Mesh.GetSharedVertices();
  }

  GetNumSharedVertices() {
    return this.GetSharedVertices().length;
  }

  SetCompletion(completion) {
    this.Completion = completion;
  }

  GetCompletion() {
    return this.Completion;
  }

  PlayAnimation$StdStrBuf$i32$pAnimationNode$pValueProvider$pValueProvider$b(animation_name, slot, sibling, position, weight, stop_previous_animation) {
    let animation = this.Mesh.GetSkeleton$v$c().GetAnimationByName(animation_name);
    if (animation == null) {
      $delete(position);
      $delete(weight);
      return null;
    }
    return this.PlayAnimation$StdMeshAnimation$i32$pAnimationNode$pValueProvider$pValueProvider$b(animation, slot, sibling, position, weight, stop_previous_animation);
  }

  PlayAnimation$StdMeshAnimation$i32$pAnimationNode$pValueProvider$pValueProvider$b(animation, slot, sibling, position, weight, stop_previous_animation) {
    position.Value.$assign($.Clamp$C4Fixed$C4Fixed$C4Fixed(position.Value.$clone(), $.Fix0$C4Real.$clone(), $.ftofix(animation.Length)));
    let child = new StdMeshInstanceAnimationNode().init$pStdMeshAnimation$pValueProvider(animation, position);
    this.InsertAnimationNode(child, slot, sibling, weight, stop_previous_animation);
    return child;
  }

  PlayAnimation$pStdMeshBone$StdMeshTransformation$i32$pAnimationNode$pValueProvider$b(bone, trans, slot, sibling, weight, stop_previous_animation) {
    let child = new StdMeshInstanceAnimationNode().init$pStdMeshBone$StdMeshTransformation(bone, trans);
    this.InsertAnimationNode(child, slot, sibling, weight, stop_previous_animation);
    return child;
  }

  StopAnimation(node) {
    ClearAnimationListRecursively(this.AnimationNodes, node);
    let parent = node.Parent;
    if (parent == null) {
      let iter = this.GetStackIterForSlot(node.Slot, false);
      0;
      seq_erase(this.AnimationStack, $itcopy(iter));
      $delete(node);
    } else {
      0;
      let other_child = null;
      if (parent.$u1.LinearInterpolation.ChildLeft === node) {
        other_child = parent.$u1.LinearInterpolation.ChildRight;
        parent.$u1.LinearInterpolation.ChildRight = null;
      } else {
        other_child = parent.$u1.LinearInterpolation.ChildLeft;
        parent.$u1.LinearInterpolation.ChildLeft = null;
      }
      if (parent.Parent != null) {
        0;
        if (parent.Parent.$u1.LinearInterpolation.ChildLeft === parent) {
          parent.Parent.$u1.LinearInterpolation.ChildLeft = other_child;
        } else {
          parent.Parent.$u1.LinearInterpolation.ChildRight = other_child;
        }
        other_child.Parent = parent.Parent;
      } else {
        let iter = this.GetStackIterForSlot(node.Slot, false);
        0;
        iter.v = other_child;
        other_child.Parent = null;
      }
      this.AnimationNodes[parent.Number] = null;
      $delete(parent);
    }
    while (!(this.AnimationNodes.length === 0) && this.AnimationNodes[this.AnimationNodes.length - 1] == null) {
      seq_erase(this.AnimationNodes, $end(this.AnimationNodes).add(-1));
    }
    this.SetBoneTransformsDirty(true);
  }

  GetAnimationNodeByNumber(number) {
    if (number >= this.AnimationNodes.length) {
      return null;
    }
    return this.AnimationNodes[number];
  }

  GetRootAnimationForSlot(slot) {
    let iter = this.GetStackIterForSlot(slot, false);
    if (iter.eq($end(this.AnimationStack))) {
      return null;
    }
    return iter.v;
  }

  SetAnimationPosition(node, position) {
    0;
    $delete(node.$u1.Leaf.Position);
    node.$u1.Leaf.Position = position;
    position.Value.$assign($.Clamp$C4Fixed$C4Fixed$C4Fixed(position.Value.$clone(), $.Fix0$C4Real.$clone(), $.ftofix(node.$u1.Leaf.Animation.Length)));
    this.SetBoneTransformsDirty(true);
  }

  SetAnimationBoneTransform(node, trans) {
    0;
    node.$u1.Custom.Transformation.$assign(trans);
    this.SetBoneTransformsDirty(true);
  }

  SetAnimationWeight(node, weight) {
    0;
    $delete(node.$u1.LinearInterpolation.Weight);
    node.$u1.LinearInterpolation.Weight = weight;
    weight.Value.$assign($.Clamp$C4Fixed$C4Fixed$C4Fixed(weight.Value.$clone(), $.Fix0$C4Real.$clone(), $.itofix$i32(1)));
    this.SetBoneTransformsDirty(true);
  }

  ExecuteAnimation(dt) {
    let $t1;
    for (let i = this.AnimationStack.length >>> 0; i > 0; i = i - 1 >>> 0) {
      if (!this.ExecuteAnimationNode(this.AnimationStack[i - 1 >>> 0])) {
        this.StopAnimation(this.AnimationStack[i - 1 >>> 0]);
      }
    }
    $t1 = this.AttachChildren;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const iter = P($t1, $i1);
      iter.a[iter.o].Child.ExecuteAnimation(dt);
    }
  }

  AttachMesh$StdMesh$pDenumerator$StdStrBuf$StdStrBuf$StdMeshMatrix$u32$u32(mesh, denumerator, parent_bone, child_bone, transformation = $.StdMeshMatrix.Identity(), flags = 0, attach_number = 0) {
    let $t1;
    let auto_denumerator = denumerator;
    let instance = new StdMeshInstance().init(mesh, 1);
    let attach = this.AttachMesh$rStdMeshInstance$pDenumerator$StdStrBuf$StdStrBuf$StdMeshMatrix$u32$b$u32(instance, ($t1 = auto_denumerator, auto_denumerator = null, $t1), parent_bone, child_bone, transformation, flags, true, attach_number);
    if (attach == null) {
      $delete(instance);
      return null;
    }
    return attach;
  }

  AttachMesh$rStdMeshInstance$pDenumerator$StdStrBuf$StdStrBuf$StdMeshMatrix$u32$b$u32(instance, denumerator, parent_bone, child_bone, transformation = $.StdMeshMatrix.Identity(), flags = 0, own_child = false, attach_number = 0) {
    let $t1;
    let auto_denumerator = denumerator;
    if (this.AttachParent != null && this.AttachParent.OwnChild) {
      return null;
    }
    let number = 0;
    StdMeshInstance.ScanAttachTree$3($begin(this.AttachChildren), $end(this.AttachChildren), ((iter) => {
  number = $max(number, iter.v.Number);
  return true;
}));
    number = number + 1 >>> 0;
    let direct_parent = this;
    if (attach_number !== 0) {
      let attach = this.GetAttachedMeshByNumber(attach_number);
      if (attach == null) {
        return null;
      }
      direct_parent = attach.Child;
    }
    return direct_parent.AttachMeshImpl(instance, ($t1 = auto_denumerator, auto_denumerator = null, $t1), parent_bone, child_bone, transformation, flags, own_child, number);
  }

  DetachMesh(number) {
    return !StdMeshInstance.ScanAttachTree$4($begin(this.AttachChildren), $end(this.AttachChildren), ((iter) => {
  if (iter.v.Number === number) {
    let attached = iter.v;
    attached.Child.AttachParent = null;
    seq_erase(attached.Parent.AttachChildren, $itcopy(iter));
    $delete(attached);
    return false;
  }
  return true;
}));
  }

  GetAttachedMeshByNumber(number) {
    let result = null;
    StdMeshInstance.ScanAttachTree($begin(this.AttachChildren), $end(this.AttachChildren), ((iter) => {
  if (iter.v.Number === number) {
    result = iter.v;
    return false;
  }
  return true;
}));
    return result;
  }

  AttachedMeshesBegin() {
    return $begin(this.AttachChildren);
  }

  AttachedMeshesEnd() {
    return $end(this.AttachChildren);
  }

  GetAttachParent() {
    return this.AttachParent;
  }

  GetNumSubMeshes() {
    return this.SubMeshInstances.length;
  }

  GetSubMesh$u64(i) {
    return this.SubMeshInstances[i];
  }

  GetSubMesh$u64$c(i) {
    return this.SubMeshInstances[i];
  }

  GetSubMeshOrdered(i) {
    return this.SubMeshInstancesOrdered[i];
  }

  SetMaterial(i, material) {
    0;
    this.SubMeshInstances[i].SetMaterial(material);
  }

  GetBoneTransform(i) {
    if (this.AttachParent != null && (this.AttachParent.GetFlags() & 2) >>> 0 !== 0) {
      0;
      let parent_bone_index = this.AttachParent.MatchedBoneInParentSkeleton[i];
      if (parent_bone_index > -1) {
        return this.AttachParent.Parent.BoneTransforms[i];
      }
    }
    return this.BoneTransforms[i];
  }

  GetBoneCount() {
    if (this.AttachParent != null && (this.AttachParent.GetFlags() & 2) >>> 0 !== 0) {
      return this.AttachParent.MatchedBoneInParentSkeleton.length;
    } else {
      return this.BoneTransforms.length;
    }
  }

  UpdateBoneTransforms() {
    let $t1;
    let was_dirty = this.BoneTransformsDirty;
    if (this.BoneTransformsDirty) {
      for (let i = 0; i < this.BoneTransforms.length; i = i + 1 >>> 0) {
        let Transformation = new $.StdMeshTransformation().None();
        const bone = this.Mesh.GetSkeleton$v$c().GetBone(i);
        let parent = bone.GetParent();
        0;
        let have_transform = false;
        $t1 = this.AnimationStack;
        for (let $i3 = 0; $i3 < $t1.length; $i3++) {
          const j = P($t1, $i3);
          if (have_transform) {
            let other = new $.StdMeshTransformation().None();
            if (j.a[j.o].GetBoneTransform(i, other)) {
              Transformation.$assign($.StdMeshTransformation.Nlerp(Transformation, other, 1));
            }
          } else {
            have_transform = j.a[j.o].GetBoneTransform(i, Transformation);
          }
        }
        if (!have_transform) {
          if (parent != null) {
            this.BoneTransforms[i].$assign(this.BoneTransforms[parent.Index]);
          } else {
            this.BoneTransforms[i].$assign($.StdMeshMatrix.Identity());
          }
        } else {
          this.BoneTransforms[i].$assign($.StdMeshMatrix.Transform($.op_mul$StdMeshTransformation$StdMeshTransformation($.op_mul$StdMeshTransformation$StdMeshTransformation(bone.Transformation, Transformation), bone.InverseTransformation)));
          if (parent != null) {
            this.BoneTransforms[i].$assign($.op_mul$StdMeshMatrix$StdMeshMatrix(this.BoneTransforms[parent.Index], this.BoneTransforms[i]));
          }
        }
      }
    }
    for (const attach of this.AttachChildren) {
      let ChildBoneTransformsDirty = attach.Child.BoneTransformsDirty;
      attach.Child.UpdateBoneTransforms();
      if (this.BoneTransformsDirty || ChildBoneTransformsDirty || attach.FinalTransformDirty) {
        was_dirty = true;
        attach.FinalTrans.$assign($.op_mul$StdMeshMatrix$StdMeshMatrix($.op_mul$StdMeshMatrix$StdMeshMatrix($.op_mul$StdMeshMatrix$StdMeshMatrix($.op_mul$StdMeshMatrix$StdMeshMatrix(this.GetBoneTransform(attach.ParentBone), $.StdMeshMatrix.Transform(this.Mesh.GetSkeleton$v$c().GetBone(attach.ParentBone).Transformation)), attach.AttachTrans), $.StdMeshMatrix.Transform(attach.Child.Mesh.GetSkeleton$v$c().GetBone(attach.ChildBone).InverseTransformation)), $.StdMeshMatrix.Inverse(attach.Child.GetBoneTransform(attach.ChildBone))));
        attach.FinalTransformDirty = false;
      }
    }
    this.SetBoneTransformsDirty(false);
    return was_dirty;
  }

  ReorderFaces(_global_trans) {
  }

  CompileFunc(pComp, Factory) {
    let $t1, $t2;
    if (pComp.isDeserializer()) {
      0;
      0;
      0;
      this.SetBoneTransformsDirty(true);
      const valid = [false];
      pComp.Value$StdNamingAdapt$b($.mkNamingAdapt$rb$pi8(P(valid, 0), S("Valid")));
      if (!valid[0]) {
        pComp.excCorrupt(S("Mesh instance is invalid"));
      }
      const iSubMeshCnt = [0];
      pComp.Value$StdNamingCountAdapt$i32($.mkNamingCountAdapt$ri32$pi8(P(iSubMeshCnt, 0), S("SubMesh")));
      if (iSubMeshCnt[0] >>> 0 !== this.SubMeshInstances.length) {
        pComp.excCorrupt(S("Invalid number of submeshes"));
      }
      for (let i = 0; i < iSubMeshCnt[0]; i = i + 1 | 0) {
        pComp.Value$StdNamingAdapt$StdSubMeshInstance($.mkNamingAdapt$rStdSubMeshInstance$pi8(this.SubMeshInstances[$u64n(i)], S("SubMesh")));
      }
      const iAnimCnt = [this.AnimationStack.length | 0];
      pComp.Value$StdNamingCountAdapt$i32($.mkNamingCountAdapt$ri32$pi8(P(iAnimCnt, 0), S("AnimationNode")));
      for (let i = 0; i < iAnimCnt[0]; i = i + 1 | 0) {
        const node = [null];
        pComp.Value$StdParameterAdapt$StdPtrAdapt$StdMeshInstanceAnimationNode$pStdMesh($.mkParAdapt$mStdPtrAdapt$StdMeshInstanceAnimationNode$pStdMesh($.mkNamingPtrAdapt$rpStdMeshInstanceAnimationNode$pi8(P(node, 0), S("AnimationNode")), this.Mesh));
        let iter = this.GetStackIterForSlot(node[0].Slot, true);
        if (iter.v != null) {
          $delete(node[0]);
          pComp.excCorrupt(S("Duplicate animation slot index"));
        }
        iter.v = node[0];
        let nodes = $filled(1, () => node[0]);
        while (!(nodes.length === 0)) {
          node[0] = nodes[nodes.length - 1];
          seq_erase(nodes, $end(nodes).add(-1));
          if (this.AnimationNodes.length <= node[0].Number) {
            resize(this.AnimationNodes, node[0].Number + 1 >>> 0, () => null);
          }
          if (this.AnimationNodes[node[0].Number] != null) {
            pComp.excCorrupt(S("Duplicate animation node number"));
          }
          this.AnimationNodes[node[0].Number] = node[0];
          if (node[0].Type === 2) {
            nodes.push(node[0].$u1.LinearInterpolation.ChildLeft);
            nodes.push(node[0].$u1.LinearInterpolation.ChildRight);
          }
        }
      }
      const iAttachedCnt = [0];
      pComp.Value$StdNamingCountAdapt$i32($.mkNamingCountAdapt$ri32$pi8(P(iAttachedCnt, 0), S("Attached")));
      for (let i = 0; i < iAttachedCnt[0]; i = i + 1 | 0) {
        this.AttachChildren.push(new StdMeshInstance$AttachedMesh().init$v());
        let attach = this.AttachChildren[this.AttachChildren.length - 1];
        attach.Parent = this;
        pComp.Value$StdNamingAdapt$StdParameterAdapt$AttachedMesh$x($.mkNamingAdapt$mStdParameterAdapt$AttachedMesh$x$pi8($.mkParAdapt$rStdMeshInstance$AttachedMesh$x(attach, Factory), S("Attached")));
      }
    } else {
      const valid = [true];
      pComp.Value$StdNamingAdapt$b($.mkNamingAdapt$rb$pi8(P(valid, 0), S("Valid")));
      const iSubMeshCnt = [this.SubMeshInstances.length | 0];
      pComp.Value$StdNamingCountAdapt$i32($.mkNamingCountAdapt$ri32$pi8(P(iSubMeshCnt, 0), S("SubMesh")));
      for (let i = 0; i < iSubMeshCnt[0]; i = i + 1 | 0) {
        pComp.Value$StdNamingAdapt$StdSubMeshInstance($.mkNamingAdapt$rStdSubMeshInstance$pi8(this.SubMeshInstances[$u64n(i)], S("SubMesh")));
      }
      const iAnimCnt = [this.AnimationStack.length | 0];
      pComp.Value$StdNamingCountAdapt$i32($.mkNamingCountAdapt$ri32$pi8(P(iAnimCnt, 0), S("AnimationNode")));
      $t1 = this.AnimationStack;
      for (let $i2 = 0; $i2 < $t1.length; $i2++) {
        const iter = P($t1, $i2);
        pComp.Value$StdParameterAdapt$StdPtrAdapt$StdMeshInstanceAnimationNode$pStdMesh($.mkParAdapt$mStdPtrAdapt$StdMeshInstanceAnimationNode$pStdMesh($.mkNamingPtrAdapt$rpStdMeshInstanceAnimationNode$pi8(iter, S("AnimationNode")), this.Mesh));
      }
      const iAttachedCnt = [this.AttachChildren.length | 0];
      pComp.Value$StdNamingCountAdapt$i32($.mkNamingCountAdapt$ri32$pi8(P(iAttachedCnt, 0), S("Attached")));
      $t2 = this.AttachChildren;
      for (let $i2 = 0; $i2 < $t2.length; $i2++) {
        const i = P($t2, $i2);
        pComp.Value$StdNamingAdapt$StdParameterAdapt$AttachedMesh$x($.mkNamingAdapt$mStdParameterAdapt$AttachedMesh$x$pi8($.mkParAdapt$rStdMeshInstance$AttachedMesh$x(i.a[i.o], Factory), S("Attached")));
      }
    }
  }

  DenumeratePointers() {
    let $t1, $t2;
    $t1 = this.AnimationNodes;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const AnimationNode = P($t1, $i1);
      if (AnimationNode.a[AnimationNode.o] != null) {
        AnimationNode.a[AnimationNode.o].DenumeratePointers();
      }
    }
    $t2 = this.AttachChildren;
    for (let $i1 = 0; $i1 < $t2.length; $i1++) {
      const i = P($t2, $i1);
      i.a[i.o].DenumeratePointers();
    }
  }

  ClearPointers(pObj) {
    let $t1, $t2;
    $t1 = this.AnimationNodes;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const AnimationNode = P($t1, $i1);
      if (AnimationNode.a[AnimationNode.o] != null) {
        AnimationNode.a[AnimationNode.o].ClearPointers(pObj);
      }
    }
    let Removal = [];
    $t2 = this.AttachChildren;
    for (let $i1 = 0; $i1 < $t2.length; $i1++) {
      const i = P($t2, $i1);
      if (!i.a[i.o].ClearPointers(pObj)) {
        Removal.push(i.a[i.o].Number);
      }
    }
    for (const i of Removal) {
      this.DetachMesh(i);
    }
  }

  GetMesh() {
    return this.Mesh;
  }

  AttachMeshImpl(instance, denumerator, parent_bone, child_bone, transformation, flags, own_child, new_attach_number) {
    let $t1;
    let auto_denumerator = denumerator;
    if (instance.AttachParent != null) {
      return null;
    }
    for (let Parent = this; Parent.AttachParent != null; Parent = Parent.AttachParent.Parent) {
      if (Parent === instance) {
        return null;
      }
    }
    let parent_bone_obj = this.Mesh.GetSkeleton$v$c().GetBoneByName(parent_bone);
    let child_bone_obj = instance.Mesh.GetSkeleton$v$c().GetBoneByName(child_bone);
    if (parent_bone_obj == null || child_bone_obj == null) {
      return null;
    }
    let attach = new StdMeshInstance$AttachedMesh().init$u32$pStdMeshInstance$pStdMeshInstance$b$pDenumerator$u32$u32$StdMeshMatrix$u32(new_attach_number, this, instance, own_child, ($t1 = auto_denumerator, auto_denumerator = null, $t1), parent_bone_obj.Index, child_bone_obj.Index, transformation, flags);
    instance.AttachParent = attach;
    if ((flags & 1) >>> 0 !== 0) {
      seq_insert(this.AttachChildren, $begin(this.AttachChildren), attach);
    } else {
      seq_insert(this.AttachChildren, $end(this.AttachChildren), attach);
    }
    return attach;
  }

  GetStackIterForSlot(slot, create) {
    for (let iter = $begin(this.AnimationStack); !iter.eq($end(this.AnimationStack)); iter.inc()) {
      if (iter.v.Slot === slot) {
        return iter;
      } else if (iter.v.Slot > slot) {
        if (!create) {
          return $end(this.AnimationStack);
        } else {
          return seq_insert(this.AnimationStack, $itcopy(iter), null);
        }
      }
    }
    if (!create) {
      return $end(this.AnimationStack);
    } else {
      return seq_insert(this.AnimationStack, $end(this.AnimationStack), null);
    }
  }

  InsertAnimationNode(node, slot, sibling, weight, stop_previous_animation) {
    0;
    if (sibling == null) {
      sibling = this.GetRootAnimationForSlot(slot);
    }
    0;
    if (sibling != null && stop_previous_animation) {
      this.StopAnimation(sibling);
      sibling = null;
    }
    let Number1 = 0;
    let Number2 = 0;
    for (Number1 = 0; Number1 < this.AnimationNodes.length; Number1 = Number1 + 1 >>> 0) {
      if (this.AnimationNodes[Number1] == null && (sibling == null || Number1 + 1 >>> 0 === this.AnimationNodes.length || this.AnimationNodes[Number1 + 1 >>> 0] == null)) {
        break;
      }
    }
    Number2 = Number1 + 1 >>> 0;
    weight.Value.$assign($.Clamp$C4Fixed$C4Fixed$C4Fixed(weight.Value.$clone(), $.Fix0$C4Real.$clone(), $.itofix$i32(1)));
    if (Number1 === this.AnimationNodes.length) {
      this.AnimationNodes.push(null);
    }
    if (sibling != null && Number2 === this.AnimationNodes.length) {
      this.AnimationNodes.push(null);
    }
    this.AnimationNodes[Number1] = node;
    node.Number = Number1;
    node.Slot = slot;
    if (sibling != null) {
      let parent = new StdMeshInstanceAnimationNode().init$pAnimationNode$pAnimationNode$pValueProvider(node, sibling, weight);
      this.AnimationNodes[Number2] = parent;
      parent.Number = Number2;
      parent.Slot = slot;
      node.Parent = parent;
      parent.Parent = sibling.Parent;
      parent.$u1.LinearInterpolation.ChildLeft = sibling;
      parent.$u1.LinearInterpolation.ChildRight = node;
      if (sibling.Parent != null) {
        if (sibling.Parent.$u1.LinearInterpolation.ChildLeft === sibling) {
          sibling.Parent.$u1.LinearInterpolation.ChildLeft = parent;
        } else {
          sibling.Parent.$u1.LinearInterpolation.ChildRight = parent;
        }
      } else {
        let iter = this.GetStackIterForSlot(slot, false);
        0;
        iter.v = parent;
      }
      sibling.Parent = parent;
    } else {
      $delete(weight);
      let iter = this.GetStackIterForSlot(slot, true);
      0;
      iter.v = node;
    }
    this.SetBoneTransformsDirty(true);
  }

  ExecuteAnimationNode(node) {
    let provider = null;
    let min = new $.C4Fixed();
    let max = new $.C4Fixed();
    switch (node.GetType()) {
      case 0:
        provider = node.GetPositionProvider();
        min.$assign($.Fix0$C4Real);
        max.$assign($.ftofix(node.GetAnimation().Length));
        break;
      case 1:
        return true;
      case 2:
        provider = node.GetWeightProvider();
        min.$assign($.Fix0$C4Real);
        max.$assign($.itofix$i32(1));
        break;
      default:
        0;
        break;
    }
    0;
    let old_value = provider.Value.$clone();
    if (!provider.Execute()) {
      if (node.GetType() === 0) {
        return false;
      }
      if (node.GetWeight().op_gt$C4Fixed($.itofix$i32$i32(1, 2))) {
        if (!this.ExecuteAnimationNode(node.GetRightChild())) {
          return false;
        }
        this.StopAnimation(node.$u1.LinearInterpolation.ChildLeft);
      } else {
        if (!this.ExecuteAnimationNode(node.GetLeftChild())) {
          return false;
        }
        this.StopAnimation(node.$u1.LinearInterpolation.ChildRight);
      }
    } else {
      if (provider.Value.op_ne$C4Fixed(old_value)) {
        provider.Value.$assign($.Clamp$C4Fixed$C4Fixed$C4Fixed(provider.Value.$clone(), min.$clone(), max.$clone()));
        this.SetBoneTransformsDirty(true);
      }
      if (node.GetType() === 2) {
        let left_result = this.ExecuteAnimationNode(node.GetLeftChild());
        let right_result = this.ExecuteAnimationNode(node.GetRightChild());
        if (!left_result && !right_result) {
          return false;
        }
        if (!left_result) {
          this.StopAnimation(node.GetLeftChild());
        }
        if (!right_result) {
          this.StopAnimation(node.GetRightChild());
        }
      }
    }
    return true;
  }

  SetBoneTransformsDirty(value) {
    this.BoneTransformsDirty = value;
    if (value) {
      for (const attach of this.AttachChildren) {
        if ((attach.GetFlags() & 2) >>> 0 !== 0) {
          attach.Child.SetBoneTransformsDirty(value);
        }
      }
    }
  }

  static ScanAttachTree$3(begin, end, obj) {
    for (let iter = $itcopy(begin); !iter.eq(end); iter.inc()) {
      if (!obj($itcopy(iter))) {
        return false;
      }
      if (iter.v.OwnChild) {
        if (!StdMeshInstance.ScanAttachTree$3($begin(iter.v.Child.AttachChildren), $end(iter.v.Child.AttachChildren), obj)) {
          return false;
        }
      }
    }
    return true;
  }

  static ScanAttachTree$4(begin, end, obj) {
    for (let iter = $itcopy(begin); !iter.eq(end); iter.inc()) {
      if (!obj($itcopy(iter))) {
        return false;
      }
      if (iter.v.OwnChild) {
        if (!StdMeshInstance.ScanAttachTree$4($begin(iter.v.Child.AttachChildren), $end(iter.v.Child.AttachChildren), obj)) {
          return false;
        }
      }
    }
    return true;
  }

  static ScanAttachTree(begin, end, obj) {
    for (let iter = $itcopy(begin); !iter.eq(end); iter.inc()) {
      if (!obj($itcopy(iter))) {
        return false;
      }
      if (iter.v.OwnChild) {
        if (!StdMeshInstance.ScanAttachTree$2($begin(iter.v.Child.AttachChildren), $end(iter.v.Child.AttachChildren), obj)) {
          return false;
        }
      }
    }
    return true;
  }

  static ScanAttachTree$2(begin, end, obj) {
    for (let iter = $itcopy(begin); !iter.eq(end); iter.inc()) {
      if (!obj($itcopy(iter))) {
        return false;
      }
      if (iter.v.OwnChild) {
        if (!StdMeshInstance.ScanAttachTree$2($begin(iter.v.Child.AttachChildren), $end(iter.v.Child.AttachChildren), obj)) {
          return false;
        }
      }
    }
    return true;
  }

  $clone() { return new StdMeshInstance().$assign(this); }
  $assign(o) {
    this.Mesh = o.Mesh;
    this.Completion = o.Completion;
    this.AnimationNodes = o.AnimationNodes.slice();
    this.AnimationStack = o.AnimationStack.slice();
    this.BoneTransforms = o.BoneTransforms.slice();
    this.SubMeshInstances = o.SubMeshInstances.slice();
    this.SubMeshInstancesOrdered = o.SubMeshInstancesOrdered.slice();
    this.AttachChildren = o.AttachChildren.slice();
    this.AttachParent = o.AttachParent;
    this.BoneTransformsDirty = o.BoneTransformsDirty;
    return this;
  }
}

export class StdMeshInstance$SerializableValueProvider$IDBase {
  name = null;
  type = null;
  newfunc = null;

  init(name, type, newfunc) {
    this.name = name;
    this.newfunc = newfunc;
    this.type = type;
    if (StdMeshInstance$SerializableValueProvider.IDs == null) {
      StdMeshInstance$SerializableValueProvider.IDs = [];
    }
    StdMeshInstance$SerializableValueProvider.IDs.push(this);
    return this;
  }

  $dtor() {
    0;
    seq_erase(StdMeshInstance$SerializableValueProvider.IDs, std_find($begin(StdMeshInstance$SerializableValueProvider.IDs), $end(StdMeshInstance$SerializableValueProvider.IDs), this));
    if (StdMeshInstance$SerializableValueProvider.IDs.length === 0) {
      $delete(StdMeshInstance$SerializableValueProvider.IDs);
      StdMeshInstance$SerializableValueProvider.IDs = null;
    }
  }

  $clone() { return new StdMeshInstance$SerializableValueProvider$IDBase().$assign(this); }
  $assign(o) {
    this.name = o.name;
    this.type = o.type;
    this.newfunc = o.newfunc;
    return this;
  }
}

export class StdMeshInstance$AttachedMesh {
  Number = 0;
  Parent = null;
  Child = null;
  OwnChild = true;
  ChildDenumerator = null;
  ParentBone = 0;
  ChildBone = 0;
  AttachTrans = new $.StdMeshMatrix();
  Flags = 0;
  FinalTrans = new $.StdMeshMatrix();
  FinalTransformDirty = false;
  MatchedBoneInParentSkeleton = [];

  init$v() {
    this.Number = 0;
    this.Parent = null;
    this.Child = null;
    this.OwnChild = true;
    this.ChildDenumerator = null;
    this.ParentBone = 0;
    this.ChildBone = 0;
    this.AttachTrans = new $.StdMeshMatrix();
    this.FinalTrans = new $.StdMeshMatrix();
    this.FinalTransformDirty = false;
    this.MatchedBoneInParentSkeleton = [];
    return this;
  }

  init$u32$pStdMeshInstance$pStdMeshInstance$b$pDenumerator$u32$u32$StdMeshMatrix$u32(number, parent, child, own_child, denumerator, parent_bone, child_bone, transform, flags) {
    this.Number = number;
    this.Parent = parent;
    this.Child = child;
    this.OwnChild = own_child;
    this.ChildDenumerator = denumerator;
    this.ParentBone = parent_bone;
    this.ChildBone = child_bone;
    this.AttachTrans = transform.$clone();
    this.Flags = flags;
    this.FinalTrans = new $.StdMeshMatrix();
    this.FinalTransformDirty = true;
    this.MatchedBoneInParentSkeleton = [];
    StdMeshInstance$AttachedMesh.prototype.MapBonesOfChildToParent.call(this, parent.GetMesh().GetSkeleton$v$c(), child.GetMesh().GetSkeleton$v$c());
    return this;
  }

  $dtor() {
    if (this.OwnChild) {
      $delete(this.Child);
    }
    $delete(this.ChildDenumerator);
  }

  SetParentBone(bone) {
    let bone_obj = this.Parent.GetMesh().GetSkeleton$v$c().GetBoneByName(bone);
    if (bone_obj == null) {
      return false;
    }
    this.ParentBone = bone_obj.Index;
    this.FinalTransformDirty = true;
    return true;
  }

  SetChildBone(bone) {
    let bone_obj = this.Child.GetMesh().GetSkeleton$v$c().GetBoneByName(bone);
    if (bone_obj == null) {
      return false;
    }
    this.ChildBone = bone_obj.Index;
    this.FinalTransformDirty = true;
    return true;
  }

  SetAttachTransformation(transformation) {
    this.AttachTrans.$assign(transformation);
    this.FinalTransformDirty = true;
  }

  GetFlags() {
    return this.Flags;
  }

  CompileFunc(pComp, Factory) {
    if (pComp.isDeserializer()) {
      this.FinalTransformDirty = true;
      this.ChildDenumerator = Factory();
    }
    const AM_Entries = $own([((($o) => ($o.Name = S("MatchSkeleton"), $o.Val = 2, $o))(new $.StdBitfieldEntry$u8())), ((($o) => ($o.Name = S("DrawBefore"), $o.Val = 1, $o))(new $.StdBitfieldEntry$u8())), ((($o) => ($o.Name = null, $o.Val = 0, $o))(new $.StdBitfieldEntry$u8()))]);
    pComp.Value$StdNamingAdapt$u32($.mkNamingAdapt$ru32$pi8(P(this, "Number"), S("Number")));
    pComp.Value$StdNamingAdapt$u32($.mkNamingAdapt$ru32$pi8(P(this, "ParentBone"), S("ParentBone")));
    pComp.Value$StdNamingAdapt$u32($.mkNamingAdapt$ru32$pi8(P(this, "ChildBone"), S("ChildBone")));
    pComp.Value$StdNamingAdapt$MatrixAdapt($.mkNamingAdapt$mMatrixAdapt$pi8(mkMatrixAdapt(this.AttachTrans), S("AttachTransformation")));
    const dwSyncFlags = [this.Flags & 0xff];
    pComp.Value$StdNamingDefaultAdapt$StdBitfieldAdapt$u8$u32($.mkNamingAdapt$mStdBitfieldAdapt$u8$pi8$u32$b$b($.mkBitfieldAdapt$ru8$pStdBitfieldEntry(P(dwSyncFlags, 0), $oat(AM_Entries, 0)), S("Flags"), 0));
    if (pComp.isDeserializer()) {
      this.Flags = dwSyncFlags[0];
    }
    pComp.Value$StdParameterAdapt$Denumerator$pAttachedMesh($.mkParAdapt$rStdMeshInstance$AttachedMesh$Denumerator$mpAttachedMesh(this.ChildDenumerator, this));
  }

  DenumeratePointers() {
    this.ChildDenumerator.DenumeratePointers(this);
    0;
    this.Child.AttachParent = this;
    this.MapBonesOfChildToParent(this.Parent.GetMesh().GetSkeleton$v$c(), this.Child.GetMesh().GetSkeleton$v$c());
    if (this.OwnChild) {
      this.Child.DenumeratePointers();
    }
  }

  ClearPointers(pObj) {
    return this.ChildDenumerator.ClearPointers(pObj);
  }

  MapBonesOfChildToParent(parent_skeleton, child_skeleton) {
    if (!((this.Flags & 2) >>> 0 !== 0)) {
      return;
    }
    this.MatchedBoneInParentSkeleton.length = 0;
    this.MatchedBoneInParentSkeleton = parent_skeleton.GetMatchingBones(child_skeleton).slice();
  }

  static DenumeratorFactory() {
    return new $.C4MeshDenumerator().init$v();
  }

  $clone() { return new StdMeshInstance$AttachedMesh().$assign(this); }
  $assign(o) {
    this.Number = o.Number;
    this.Parent = o.Parent;
    this.Child = o.Child;
    this.OwnChild = o.OwnChild;
    this.ChildDenumerator = o.ChildDenumerator;
    this.ParentBone = o.ParentBone;
    this.ChildBone = o.ChildBone;
    this.AttachTrans.$assign(o.AttachTrans);
    this.Flags = o.Flags;
    this.FinalTrans.$assign(o.FinalTrans);
    this.FinalTransformDirty = o.FinalTransformDirty;
    this.MatchedBoneInParentSkeleton = o.MatchedBoneInParentSkeleton.slice();
    return this;
  }
}

export class StdMeshInstance$AttachedMesh$Denumerator {

  DenumeratePointers(_attach) {
  }

  ClearPointers(_pObj) {
    return true;
  }

  $clone() { return new StdMeshInstance$AttachedMesh$Denumerator().$assign(this); }
  $assign(o) {
    return this;
  }
}

export class StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderAbsRDir extends StdMeshInstance$SerializableValueProvider$IDBase {

  static CreateFunc() {
    return new $.C4ValueProviderAbsRDir().init$v();
  }

  init(name) {
    super.init(name, $.C4ValueProviderAbsRDir, StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderAbsRDir.CreateFunc);
    return this;
  }

  $clone() { return new StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderAbsRDir().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderAbsX extends StdMeshInstance$SerializableValueProvider$IDBase {

  static CreateFunc() {
    return new $.C4ValueProviderAbsX().init$v();
  }

  init(name) {
    super.init(name, $.C4ValueProviderAbsX, StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderAbsX.CreateFunc);
    return this;
  }

  $clone() { return new StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderAbsX().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderAbsY extends StdMeshInstance$SerializableValueProvider$IDBase {

  static CreateFunc() {
    return new $.C4ValueProviderAbsY().init$v();
  }

  init(name) {
    super.init(name, $.C4ValueProviderAbsY, StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderAbsY.CreateFunc);
    return this;
  }

  $clone() { return new StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderAbsY().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderAction extends StdMeshInstance$SerializableValueProvider$IDBase {

  static CreateFunc() {
    return new $.C4ValueProviderAction().init$v();
  }

  init(name) {
    super.init(name, $.C4ValueProviderAction, StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderAction.CreateFunc);
    return this;
  }

  $clone() { return new StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderAction().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderCosR extends StdMeshInstance$SerializableValueProvider$IDBase {

  static CreateFunc() {
    return new $.C4ValueProviderCosR().init$v();
  }

  init(name) {
    super.init(name, $.C4ValueProviderCosR, StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderCosR.CreateFunc);
    return this;
  }

  $clone() { return new StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderCosR().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderCosV extends StdMeshInstance$SerializableValueProvider$IDBase {

  static CreateFunc() {
    return new $.C4ValueProviderCosV().init$v();
  }

  init(name) {
    super.init(name, $.C4ValueProviderCosV, StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderCosV.CreateFunc);
    return this;
  }

  $clone() { return new StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderCosV().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderDist extends StdMeshInstance$SerializableValueProvider$IDBase {

  static CreateFunc() {
    return new $.C4ValueProviderDist().init$v();
  }

  init(name) {
    super.init(name, $.C4ValueProviderDist, StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderDist.CreateFunc);
    return this;
  }

  $clone() { return new StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderDist().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderLinear extends StdMeshInstance$SerializableValueProvider$IDBase {

  static CreateFunc() {
    return new $.C4ValueProviderLinear().init$v();
  }

  init(name) {
    super.init(name, $.C4ValueProviderLinear, StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderLinear.CreateFunc);
    return this;
  }

  $clone() { return new StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderLinear().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderR extends StdMeshInstance$SerializableValueProvider$IDBase {

  static CreateFunc() {
    return new $.C4ValueProviderR().init$v();
  }

  init(name) {
    super.init(name, $.C4ValueProviderR, StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderR.CreateFunc);
    return this;
  }

  $clone() { return new StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderR().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderRDir extends StdMeshInstance$SerializableValueProvider$IDBase {

  static CreateFunc() {
    return new $.C4ValueProviderRDir().init$v();
  }

  init(name) {
    super.init(name, $.C4ValueProviderRDir, StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderRDir.CreateFunc);
    return this;
  }

  $clone() { return new StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderRDir().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderSinR extends StdMeshInstance$SerializableValueProvider$IDBase {

  static CreateFunc() {
    return new $.C4ValueProviderSinR().init$v();
  }

  init(name) {
    super.init(name, $.C4ValueProviderSinR, StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderSinR.CreateFunc);
    return this;
  }

  $clone() { return new StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderSinR().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderSinV extends StdMeshInstance$SerializableValueProvider$IDBase {

  static CreateFunc() {
    return new $.C4ValueProviderSinV().init$v();
  }

  init(name) {
    super.init(name, $.C4ValueProviderSinV, StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderSinV.CreateFunc);
    return this;
  }

  $clone() { return new StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderSinV().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderX extends StdMeshInstance$SerializableValueProvider$IDBase {

  static CreateFunc() {
    return new $.C4ValueProviderX().init$v();
  }

  init(name) {
    super.init(name, $.C4ValueProviderX, StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderX.CreateFunc);
    return this;
  }

  $clone() { return new StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderX().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderXDir extends StdMeshInstance$SerializableValueProvider$IDBase {

  static CreateFunc() {
    return new $.C4ValueProviderXDir().init$v();
  }

  init(name) {
    super.init(name, $.C4ValueProviderXDir, StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderXDir.CreateFunc);
    return this;
  }

  $clone() { return new StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderXDir().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderY extends StdMeshInstance$SerializableValueProvider$IDBase {

  static CreateFunc() {
    return new $.C4ValueProviderY().init$v();
  }

  init(name) {
    super.init(name, $.C4ValueProviderY, StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderY.CreateFunc);
    return this;
  }

  $clone() { return new StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderY().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderYDir extends StdMeshInstance$SerializableValueProvider$IDBase {

  static CreateFunc() {
    return new $.C4ValueProviderYDir().init$v();
  }

  init(name) {
    super.init(name, $.C4ValueProviderYDir, StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderYDir.CreateFunc);
    return this;
  }

  $clone() { return new StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderYDir().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdMeshInstance$SerializableValueProvider extends StdMeshInstanceValueProvider {
  static IDs;

  static Lookup$pi8(name) {
    let $t1;
    if (StdMeshInstance$SerializableValueProvider.IDs == null) {
      return null;
    }
    $t1 = StdMeshInstance$SerializableValueProvider.IDs;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const ID = P($t1, $i1);
      if (c$strcmp(ID.a[ID.o].name, name) === 0) {
        return ID.a[ID.o];
      }
    }
    return null;
  }

  static Lookup$type_info(type) {
    let $t1;
    if (StdMeshInstance$SerializableValueProvider.IDs == null) {
      return null;
    }
    $t1 = StdMeshInstance$SerializableValueProvider.IDs;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const ID = P($t1, $i1);
      if (ID.a[ID.o].type === type) {
        return ID.a[ID.o];
      }
    }
    return null;
  }

  CompileFunc(pComp) {
    pComp.Value$rC4Fixed(this.Value);
  }

  DenumeratePointers() {
  }

  ClearPointers(_pObj) {
  }

  $clone() { return new StdMeshInstance$SerializableValueProvider().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

export class StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderConst extends StdMeshInstance$SerializableValueProvider$IDBase {

  static CreateFunc() {
    return new $.C4ValueProviderConst().init$v();
  }

  init(name) {
    super.init(name, $.C4ValueProviderConst, StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderConst.CreateFunc);
    return this;
  }

  $clone() { return new StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderConst().$assign(this); }
  $assign(o) {
    super.$assign(o);
    return this;
  }
}

function StdMeshFaceCmp(h1, h2) {
  if (h1.z < h2.z) {
    return -1;
  } else if (h1.z > h2.z) {
    return 1;
  }
  return 0;
}

export function mkValueProviderAdapt(ValueProvider) {
  return new ValueProviderAdapt().init(ValueProvider);
}

export function CompileFloat(pComp, f) {
  if (pComp.isDeserializer()) {
    let r = new $.C4Fixed();
    pComp.Value$rC4Fixed(r);
    f.a[f.o] = $.fixtof(r);
  } else {
    let r = $.ftofix(f.a[f.o]);
    pComp.Value$rC4Fixed(r);
  }
}

export function mkMatrixAdapt(Matrix) {
  return new MatrixAdapt().init(Matrix);
}

export function mkTransformAdapt(Trans) {
  return new TransformAdapt().init(Trans);
}

export function ClearAnimationListRecursively(list, node) {
  list[node.GetNumber()] = null;
  if (node.GetType() === 2) {
    ClearAnimationListRecursively(list, node.GetLeftChild());
    ClearAnimationListRecursively(list, node.GetRightChild());
  }
}

export function MirrorKeyFrame(frame, old_bone_transformation, new_inverse_bone_transformation) {
  frame.Transformation.rotate.x = -frame.Transformation.rotate.x;
  frame.Transformation.rotate.y = -frame.Transformation.rotate.y;
  let d = $.op_mul$StdMeshVector$StdMeshVector(old_bone_transformation.scale, $.op_mul$StdMeshQuaternion$StdMeshVector(old_bone_transformation.rotate, frame.Transformation.translate));
  d.z = -d.z;
  frame.Transformation.translate.$assign($.op_mul$StdMeshQuaternion$StdMeshVector(new_inverse_bone_transformation.rotate, $.op_mul$StdMeshVector$StdMeshVector(new_inverse_bone_transformation.scale, d)));
}

export function MirrorName(buf) {
  let len = buf.getLength() >>> 0;
  if (buf.Compare_(S(".R"), len - 2 >>> 0) === 0) {
    $wr(buf.getMData(), len - 1 >>> 0, 76);
  } else if (buf.Compare_(S(".L"), len - 2 >>> 0) === 0) {
    $wr(buf.getMData(), len - 1 >>> 0, 82);
  } else {
    return false;
  }
  return true;
}

export function CompileNewFuncCtx$rpSerializableValueProvider$pStdCompiler$StdMeshInstance$SerializableValueProvider$IDBase(pStruct, pComp, rID) {
  let $t1;
  let temp = rID.newfunc();
  pComp.Value$rStdMeshInstance$SerializableValueProvider(temp);
  pStruct.a[pStruct.o] = ($t1 = temp, temp = null, $t1);
}

export function $init(): void {
  StdMeshInstance$SerializableValueProvider.IDs = null;
}

Object.assign($, { ClearAnimationListRecursively, CompileFloat, CompileNewFuncCtx$rpSerializableValueProvider$pStdCompiler$StdMeshInstance$SerializableValueProvider$IDBase, MatrixAdapt, MirrorKeyFrame, MirrorName, StdMesh, StdMeshAnimation, StdMeshBone, StdMeshBox, StdMeshFace, StdMeshFaceCmp, StdMeshFaceOrderHelper, StdMeshInstance, StdMeshInstance$AttachedMesh, StdMeshInstance$AttachedMesh$Denumerator, StdMeshInstance$SerializableValueProvider, StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderAbsRDir, StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderAbsX, StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderAbsY, StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderAction, StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderConst, StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderCosR, StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderCosV, StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderDist, StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderLinear, StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderR, StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderRDir, StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderSinR, StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderSinV, StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderX, StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderXDir, StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderY, StdMeshInstance$SerializableValueProvider$ID$C4ValueProviderYDir, StdMeshInstance$SerializableValueProvider$IDBase, StdMeshInstanceAnimationNode, StdMeshInstanceAnimationNode$$anon1, StdMeshInstanceAnimationNode$$anon1$$anon1, StdMeshInstanceAnimationNode$$anon1$$anon2, StdMeshInstanceAnimationNode$$anon1$$anon3, StdMeshInstanceValueProvider, StdMeshKeyFrame, StdMeshSkeleton, StdMeshTrack, StdMeshVertexBoneAssignment, StdSubMesh, StdSubMeshInstance, TransformAdapt, ValueProviderAdapt, mkMatrixAdapt, mkTransformAdapt, mkValueProviderAdapt });
