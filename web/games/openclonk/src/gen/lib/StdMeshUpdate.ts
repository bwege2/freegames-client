// @ts-nocheck
// OpenClonk 36de799: src/lib/StdMeshUpdate.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { P } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, $filled, StdMap, resize } from '../../rt/std.ts';

export class StdMeshMaterialUpdate {
  MaterialManager = null;
  Materials = new StdMap();

  init(manager) {
    this.Materials = new StdMap();
    this.MaterialManager = manager;
    return this;
  }

  Update$pStdMesh(mesh) {
    for (const SubMesh of mesh.SubMeshes) {
      let mat_iter = this.Materials.find(SubMesh.Material);
      if (!mat_iter.eq(this.Materials.end())) {
        let new_material = this.MaterialManager.GetMaterial(mat_iter.v.second.Name.getData());
        if (new_material != null) {
          SubMesh.Material = new_material;
        } else {
          this.MaterialManager.Materials.entry(mat_iter.v.second.Name, () => new $.StdMeshMaterial().init()).second.$assign(mat_iter.v.second);
          SubMesh.Material = this.MaterialManager.GetMaterial(mat_iter.v.second.Name.getData());
        }
      }
    }
  }

  Update$pStdMeshInstance(instance) {
    for (let i = 0; i < instance.SubMeshInstances.length; i = i + 1 >>> 0) {
      let sub_instance = instance.SubMeshInstances[i];
      let mat_iter = this.Materials.find(sub_instance.Material);
      if (!mat_iter.eq(this.Materials.end())) {
        let new_material = this.MaterialManager.GetMaterial(mat_iter.v.second.Name.getData());
        if (new_material == null) {
          new_material = instance.GetMesh().GetSubMesh(i).Material;
        }
        sub_instance.SetMaterial(new_material);
      }
    }
  }

  Cancel() {
    for (const Material of this.Materials) {
      this.MaterialManager.Materials.entry(Material.second.Name, () => new $.StdMeshMaterial().init()).second.$assign(Material.second);
    }
  }

  Add(material) {
    0;
    this.Materials.entry(material, () => new $.StdMeshMaterial().init()).second.$assign(material);
  }

  $clone() { return new StdMeshMaterialUpdate().$assign(this); }
  $assign(o) {
    this.MaterialManager = o.MaterialManager;
    this.Materials = o.Materials.$clone();
    return this;
  }
}

export class StdMeshUpdate {
  OldMesh = null;
  BoneNamesByIndex = [];

  init(old_mesh) {
    this.OldMesh = old_mesh;
    this.BoneNamesByIndex = $filled(this.OldMesh.GetSkeleton$v$c().GetNumBones(), () => new $.StdCopyStrBuf());
    for (let i = 0; i < this.OldMesh.GetSkeleton$v$c().GetNumBones(); i = i + 1 >>> 0) {
      this.BoneNamesByIndex[i].$assign(this.OldMesh.GetSkeleton$v$c().GetBone(i).Name);
    }
    return this;
  }

  Update(instance, new_mesh) {
    let $t1;
    0;
    instance.Mesh = new_mesh;
    instance.BoneTransforms = $filled(new_mesh.GetSkeleton$v$c().GetNumBones(), () => $.StdMeshMatrix.Identity()).slice();
    instance.BoneTransformsDirty = true;
    $t1 = instance.SubMeshInstances;
    for (let $i1 = 0; $i1 < $t1.length; $i1++) {
      const SubMeshInstance = P($t1, $i1);
      $delete(SubMeshInstance.a[SubMeshInstance.o]);
    }
    resize(instance.SubMeshInstances, new_mesh.GetNumSubMeshes(), () => null);
    for (let i = 0; i < instance.SubMeshInstances.length; i = i + 1 >>> 0) {
      instance.SubMeshInstances[i] = new $.StdSubMeshInstance().init(instance, new_mesh.GetSubMesh(i), instance.GetCompletion());
      instance.SubMeshInstancesOrdered = instance.SubMeshInstances.slice();
    }
    if (instance.AttachParent != null) {
      if (!instance.AttachParent.SetChildBone(this.BoneNamesByIndex[instance.AttachParent.ChildBone])) {
        let OwnChild = instance.AttachParent.OwnChild;
        instance.AttachParent.Parent.DetachMesh(instance.AttachParent.Number);
        if (OwnChild) {
          return;
        }
      }
    }
    let Removal = [];
    for (let iter = instance.AttachedMeshesBegin(); !iter.eq(instance.AttachedMeshesEnd()); iter.inc()) {
      if (!iter.v.SetParentBone(this.BoneNamesByIndex[iter.v.ParentBone])) {
        Removal.push(iter.v.Number);
      }
    }
    for (const i of Removal) {
      instance.DetachMesh(i);
    }
    for (let i = instance.AnimationStack.length >>> 0; i > 0; i = i - 1 >>> 0) {
      if (!this.UpdateAnimationNode(instance, instance.AnimationStack[i - 1 >>> 0])) {
        instance.StopAnimation(instance.AnimationStack[i - 1 >>> 0]);
      }
    }
  }

  GetOldMesh() {
    return this.OldMesh;
  }

  UpdateAnimationNode(instance, node) {
    const new_mesh = instance.Mesh;
    switch (node.GetType()) {
      case 0:
        return true;
      case 1:
        {
          let bone_name = new $.StdCopyStrBuf().init$StdCopyStrBuf$b(this.BoneNamesByIndex[node.$u1.Custom.BoneIndex]);
          let bone = new_mesh.GetSkeleton$v$c().GetBoneByName(bone_name);
          if (bone == null) {
            return false;
          }
          node.$u1.Custom.BoneIndex = bone.Index;
          return true;
        }
      case 2:
        {
          let left_result = this.UpdateAnimationNode(instance, node.GetLeftChild());
          let right_result = this.UpdateAnimationNode(instance, node.GetRightChild());
          if (!left_result && !right_result) {
            return false;
          }
          if (!left_result) {
            instance.StopAnimation(node.GetLeftChild());
          }
          if (!right_result) {
            instance.StopAnimation(node.GetRightChild());
          }
          return true;
        }
      default:
        0;
        return false;
    }
  }

  $clone() { return new StdMeshUpdate().$assign(this); }
  $assign(o) {
    this.OldMesh = o.OldMesh;
    this.BoneNamesByIndex = o.BoneNamesByIndex.slice();
    return this;
  }
}

export class StdMeshAnimationUpdate {
  AnimationNames = new StdMap();

  init(skeleton_loader) {
    this.AnimationNames = new StdMap();
    for (let iter = skeleton_loader.skeletons_begin(); !iter.eq(skeleton_loader.skeletons_end()); iter.inc()) {
      const skeleton = iter.v.second;
      for (const Animation of skeleton.Animations) {
        this.AnimationNames.entry(Animation.second, () => new $.StdCopyStrBuf()).second.$assign(Animation.first);
      }
    }
    return this;
  }

  Update(instance) {
    for (let i = instance.AnimationStack.length >>> 0; i > 0; i = i - 1 >>> 0) {
      if (!this.UpdateAnimationNode(instance, instance.AnimationStack[i - 1 >>> 0])) {
        instance.StopAnimation(instance.AnimationStack[i - 1 >>> 0]);
      }
    }
  }

  UpdateAnimationNode(instance, node) {
    const new_mesh = instance.Mesh;
    switch (node.GetType()) {
      case 0:
        {
          let iter = this.AnimationNames.find(node.$u1.Leaf.Animation);
          0;
          node.$u1.Leaf.Animation = new_mesh.GetSkeleton$v$c().GetAnimationByName(iter.v.second);
          if (node.$u1.Leaf.Animation == null) {
            return false;
          }
          let provider = node.GetPositionProvider();
          let min = $.Fix0$C4Real.$clone();
          let max = $.ftofix(node.GetAnimation().Length);
          provider.Value.$assign($.Clamp$C4Fixed$C4Fixed$C4Fixed(provider.Value.$clone(), min.$clone(), max.$clone()));
          return true;
        }
      case 1:
        return true;
      case 2:
        {
          let left_result = this.UpdateAnimationNode(instance, node.GetLeftChild());
          let right_result = this.UpdateAnimationNode(instance, node.GetRightChild());
          if (!left_result && !right_result) {
            return false;
          }
          if (!left_result) {
            instance.StopAnimation(node.GetLeftChild());
          }
          if (!right_result) {
            instance.StopAnimation(node.GetRightChild());
          }
          return true;
        }
      default:
        0;
        return false;
    }
  }

  $clone() { return new StdMeshAnimationUpdate().$assign(this); }
  $assign(o) {
    this.AnimationNames = o.AnimationNames.$clone();
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { StdMeshAnimationUpdate, StdMeshMaterialUpdate, StdMeshUpdate });
