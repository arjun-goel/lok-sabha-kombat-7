import * as THREE from 'three';
import { FighterProfile } from '../types';

export interface RigJoints {
  root: THREE.Group;
  hips: THREE.Group;
  torso: THREE.Group;
  chest: THREE.Group;
  neck: THREE.Group;
  head: THREE.Group;
  leftShoulder: THREE.Group;
  leftElbow: THREE.Group;
  leftHand: THREE.Group;
  rightShoulder: THREE.Group;
  rightElbow: THREE.Group;
  rightHand: THREE.Group;
  leftHip: THREE.Group;
  leftKnee: THREE.Group;
  leftAnkle: THREE.Group;
  rightHip: THREE.Group;
  rightKnee: THREE.Group;
  rightAnkle: THREE.Group;
  rageAura: THREE.Mesh;
  weaponProp: THREE.Group;
}

export class FighterRig {
  public group: THREE.Group;
  public joints: RigJoints;
  private profile: FighterProfile;
  private hitFlashTime = 0;
  private meshes: THREE.Mesh[] = [];

  constructor(profile: FighterProfile) {
    this.profile = profile;
    this.group = new THREE.Group();
    this.joints = this.buildRig();
  }

  private createMat(color: number, roughness = 0.45, metalness = 0.15, emissive = 0x000000, emissiveIntensity = 0): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness,
      emissive,
      emissiveIntensity
    });
  }

  private registerMesh(mesh: THREE.Mesh): THREE.Mesh {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.meshes.push(mesh);
    return mesh;
  }

  private buildRig(): RigJoints {
    const p = this.profile;
    const bulk = p.scale.bulk;
    const heightScale = p.scale.height;

    const skinMat = this.createMat(p.colors.skin, 0.55, 0.05);
    const primaryMat = this.createMat(p.colors.primary, 0.5, 0.1);
    const secondaryMat = this.createMat(p.colors.secondary, 0.35, 0.25);
    const accentMat = this.createMat(p.colors.accent, 0.25, 0.5, p.colors.glow, 0.35);
    const hairMat = this.createMat(p.colors.hair, 0.65, 0.05);
    const darkMat = this.createMat(0x111827, 0.4, 0.3);
    const glassesMat = this.createMat(0xd4af37, 0.2, 0.85);

    const root = new THREE.Group();
    root.scale.set(bulk, heightScale, bulk);
    this.group.add(root);

    // Rage crimson lightning aura around fighter
    const auraGeo = new THREE.CylinderGeometry(0.75, 0.95, 2.2, 16, 1, true);
    const auraMat = new THREE.MeshBasicMaterial({
      color: p.colors.glow,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const rageAura = new THREE.Mesh(auraGeo, auraMat);
    rageAura.position.y = 1.1;
    root.add(rageAura);

    // Hips (Pelvis center at y = 0.98)
    const hips = new THREE.Group();
    hips.position.y = 0.98;
    root.add(hips);

    const pelvisGeo = new THREE.BoxGeometry(0.42, 0.22, 0.28);
    const pelvisMesh = this.registerMesh(new THREE.Mesh(pelvisGeo, primaryMat));
    hips.add(pelvisMesh);

    // Lower Kurta / Saree drape around hips
    if (p.id === 'mamata') {
      // Iconic White Saree with Blue Border lower pleat skirt
      const sareeSkirt = this.registerMesh(
        new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.33, 0.72, 14), primaryMat)
      );
      sareeSkirt.position.y = -0.34;
      hips.add(sareeSkirt);

      const blueBorder = this.registerMesh(
        new THREE.Mesh(new THREE.CylinderGeometry(0.325, 0.34, 0.12, 14), secondaryMat)
      );
      blueBorder.position.y = -0.65;
      hips.add(blueBorder);
    } else if (p.id === 'modi') {
      // Crisp Long Kurta Bottom Tunic
      const kurtaBottom = this.registerMesh(
        new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.29, 0.36, 12), primaryMat)
      );
      kurtaBottom.position.y = -0.15;
      hips.add(kurtaBottom);
    }

    // Torso & Chest
    const torso = new THREE.Group();
    torso.position.y = 0.1;
    hips.add(torso);

    const abdomenMesh = this.registerMesh(
      new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.28, 0.26), primaryMat)
    );
    abdomenMesh.position.y = 0.14;
    torso.add(abdomenMesh);

    const chest = new THREE.Group();
    chest.position.y = 0.28;
    torso.add(chest);

    // Upper Chest (Modi has 56-inch broad Nehru jacket; Mamata has Saree Pallu; Kejriwal has Blue Sweater; Rahul has White Polo)
    const chestWidth = p.id === 'modi' ? 0.54 : 0.46;
    const chestDepth = p.id === 'modi' ? 0.34 : 0.29;
    const chestMesh = this.registerMesh(
      new THREE.Mesh(
        new THREE.BoxGeometry(chestWidth, 0.38, chestDepth),
        p.id === 'modi' ? secondaryMat : primaryMat
      )
    );
    chestMesh.position.y = 0.18;
    chest.add(chestMesh);

    // Character-specific Chest Accents
    if (p.id === 'modi') {
      // Saffron Nehru Jacket Collar + Pocket Square + Gold Buttons
      const collar = this.registerMesh(
        new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.15, 0.12, 12), secondaryMat)
      );
      collar.position.set(0, 0.38, 0);
      chest.add(collar);

      for (let b = 0; b < 3; b++) {
        const btn = this.registerMesh(
          new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), glassesMat)
        );
        btn.position.set(0, 0.28 - b * 0.09, chestDepth / 2 + 0.01);
        chest.add(btn);
      }

      // Lotus Brooch Pin on Left Chest
      const lotusPin = this.registerMesh(
        new THREE.Mesh(new THREE.OctahedronGeometry(0.045, 0), accentMat)
      );
      lotusPin.position.set(0.14, 0.26, chestDepth / 2 + 0.015);
      chest.add(lotusPin);
    } else if (p.id === 'mamata') {
      // Diagonal Blue-Border Saree Pallu across chest to left shoulder
      const pallu = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.49, 0.40, 0.31), secondaryMat)
      );
      pallu.position.set(0.01, 0.18, 0);
      pallu.scale.set(0.45, 1.02, 1.04);
      pallu.rotation.z = -0.38;
      chest.add(pallu);
    } else if (p.id === 'kejriwal') {
      // Iconic Maroon Winter Muffler wrapped around neck & hanging down chest
      const mufflerRing = this.registerMesh(
        new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.055, 10, 18), secondaryMat)
      );
      mufflerRing.rotation.x = Math.PI / 2;
      mufflerRing.position.set(0, 0.39, 0);
      chest.add(mufflerRing);

      const mufflerTail = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.32, 0.06), secondaryMat)
      );
      mufflerTail.position.set(0.06, 0.21, chestDepth / 2 + 0.03);
      chest.add(mufflerTail);
    } else if (p.id === 'rahul') {
      // White Polo Collar + Tricolor badge
      const badge = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.05, 0.02), accentMat)
      );
      badge.position.set(0.13, 0.26, chestDepth / 2 + 0.015);
      chest.add(badge);
    }

    // Neck & Head
    const neck = new THREE.Group();
    neck.position.y = 0.40;
    chest.add(neck);

    const neckMesh = this.registerMesh(
      new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.1, 0.11, 10), skinMat)
    );
    neckMesh.position.y = 0.04;
    neck.add(neckMesh);

    const head = new THREE.Group();
    head.position.y = 0.1;
    neck.add(head);

    // Stylized Caricature Head (slightly larger for hilarious expressive readability)
    const headMesh = this.registerMesh(
      new THREE.Mesh(new THREE.SphereGeometry(0.185, 16, 16), skinMat)
    );
    headMesh.scale.set(0.95, 1.08, 0.98);
    headMesh.position.y = 0.15;
    head.add(headMesh);

    // Eyes & Eyebrows
    const eyeGeo = new THREE.SphereGeometry(0.024, 8, 8);
    const leftEye = new THREE.Mesh(eyeGeo, darkMat);
    leftEye.position.set(0.065, 0.17, 0.16);
    const rightEye = new THREE.Mesh(eyeGeo, darkMat);
    rightEye.position.set(-0.065, 0.17, 0.16);
    head.add(leftEye, rightEye);

    // Nose
    const nose = this.registerMesh(
      new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.07, 8), skinMat)
    );
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, 0.14, 0.19);
    head.add(nose);

    // Character-Specific Facial Features, Glasses, Beard & Hair!
    if (p.id === 'modi') {
      // Iconic Full White Beard & Mustache
      const beard = this.registerMesh(
        new THREE.Mesh(new THREE.SphereGeometry(0.165, 14, 12), hairMat)
      );
      beard.scale.set(1.02, 1.05, 0.95);
      beard.position.set(0, 0.06, 0.06);
      head.add(beard);

      // White Hair Dome
      const hairDome = this.registerMesh(
        new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.58), hairMat)
      );
      hairDome.position.set(0, 0.17, -0.01);
      head.add(hairDome);

      // Rimless Gold Spectacles
      const leftLens = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.007, 8, 16), glassesMat);
      leftLens.position.set(0.065, 0.17, 0.175);
      const rightLens = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.007, 8, 16), glassesMat);
      rightLens.position.set(-0.065, 0.17, 0.175);
      head.add(leftLens, rightLens);
    } else if (p.id === 'mamata') {
      // Dark Hair + Classic Back Bun (Jura)
      const hairCap = this.registerMesh(
        new THREE.Mesh(new THREE.SphereGeometry(0.192, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.56), hairMat)
      );
      hairCap.position.set(0, 0.17, -0.01);
      head.add(hairCap);

      const bun = this.registerMesh(
        new THREE.Mesh(new THREE.SphereGeometry(0.095, 12, 12), hairMat)
      );
      bun.position.set(0, 0.14, -0.21);
      head.add(bun);

      // Rectangular Spectacles + Bindi
      const leftLens = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.006, 8, 16), darkMat);
      leftLens.position.set(0.065, 0.17, 0.175);
      const rightLens = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.006, 8, 16), darkMat);
      rightLens.position.set(-0.065, 0.17, 0.175);
      const bindi = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), this.createMat(0xd90429));
      bindi.position.set(0, 0.215, 0.178);
      head.add(leftLens, rightLens, bindi);
    } else if (p.id === 'kejriwal') {
      // Iconic White Gandhi Topi (Aam Aadmi Cap) + Mustache + Glasses + Muffler Wrap
      const capGeo = new THREE.BoxGeometry(0.22, 0.11, 0.34);
      const whiteMat = this.createMat(0xffffff, 0.4, 0.05);
      const topi = this.registerMesh(new THREE.Mesh(capGeo, whiteMat));
      topi.position.set(0, 0.33, 0.01);
      head.add(topi);

      const mustache = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.028, 0.04), hairMat)
      );
      mustache.position.set(0, 0.10, 0.18);
      head.add(mustache);

      const leftLens = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.008, 8, 16), darkMat);
      leftLens.position.set(0.065, 0.17, 0.175);
      const rightLens = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.008, 8, 16), darkMat);
      rightLens.position.set(-0.065, 0.17, 0.175);
      head.add(leftLens, rightLens);

      // Muffler Ear-Wrap
      const earWrap = this.registerMesh(
        new THREE.Mesh(new THREE.TorusGeometry(0.182, 0.028, 8, 16), secondaryMat)
      );
      earWrap.rotation.y = Math.PI / 2;
      earWrap.position.set(0, 0.15, 0);
      head.add(earWrap);
    } else if (p.id === 'rahul') {
      // Salt & Pepper Wavy Hair + Bharat Jodo Beard
      const hairCap = this.registerMesh(
        new THREE.Mesh(new THREE.SphereGeometry(0.198, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.58), hairMat)
      );
      hairCap.position.set(0, 0.18, -0.01);
      head.add(hairCap);

      const beard = this.registerMesh(
        new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), hairMat)
      );
      beard.position.set(0, 0.07, 0.055);
      head.add(beard);
    }

    // Arms & Hands
    const buildArm = (isLeft: boolean) => {
      const sign = isLeft ? 1 : -1;
      const shoulder = new THREE.Group();
      shoulder.position.set(sign * (chestWidth / 2 + 0.06), 0.31, 0);
      chest.add(shoulder);

      const sleeveMat = p.id === 'kejriwal' ? primaryMat : this.createMat(0xffffff, 0.5, 0.1);
      const upperArm = this.registerMesh(
        new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.062, 0.28, 10), sleeveMat)
      );
      upperArm.position.y = -0.13;
      shoulder.add(upperArm);

      const elbow = new THREE.Group();
      elbow.position.y = -0.27;
      shoulder.add(elbow);

      const forearm = this.registerMesh(
        new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.052, 0.26, 10), skinMat)
      );
      forearm.position.y = -0.13;
      elbow.add(forearm);

      // Glowing Aura Wristband for clear limb strike visibility
      const wristBand = this.registerMesh(
        new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.06, 10), accentMat)
      );
      wristBand.position.y = -0.22;
      elbow.add(wristBand);

      const hand = new THREE.Group();
      hand.position.y = -0.27;
      elbow.add(hand);

      const fist = this.registerMesh(
        new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 10), skinMat)
      );
      hand.add(fist);

      return { shoulder, elbow, hand };
    };

    const leftArm = buildArm(true);
    const rightArm = buildArm(false);

    // Signature Comedic Prop in Right Hand!
    const weaponProp = new THREE.Group();
    rightArm.hand.add(weaponProp);

    if (p.signatureProp === 'lotus_mic') {
      // Golden Parliamentary Microphone with Saffron Lotus Crest
      const handle = this.registerMesh(
        new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.28, 8), glassesMat)
      );
      handle.rotation.x = Math.PI / 2;
      handle.position.z = 0.1;
      const micHead = this.registerMesh(
        new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), accentMat)
      );
      micHead.position.z = 0.25;
      weaponProp.add(handle, micHead);
    } else if (p.signatureProp === 'hawai_chappal') {
      // Iconic Blue & White Hawai Chappal held ready for action!
      const sole = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.028, 0.26), this.createMat(0xffffff))
      );
      sole.position.z = 0.14;
      const strap = this.registerMesh(
        new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.012, 6, 12, Math.PI), secondaryMat)
      );
      strap.position.set(0, 0.02, 0.16);
      weaponProp.add(sole, strap);
    } else if (p.signatureProp === 'muffler_broom') {
      // Legendary Aam Aadmi Jhadu (Broom)
      const stick = this.registerMesh(
        new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.34, 8), this.createMat(0x854d0e))
      );
      stick.rotation.x = Math.PI / 2;
      stick.position.z = 0.15;
      const bristles = this.registerMesh(
        new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.26, 10), accentMat)
      );
      bristles.rotation.x = -Math.PI / 2;
      bristles.position.z = 0.38;
      weaponProp.add(stick, bristles);
    } else if (p.signatureProp === 'padyatra_torch') {
      // Glowing Emerald-Gold Padyatra Baton
      const baton = this.registerMesh(
        new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.022, 0.3, 8), accentMat)
      );
      baton.rotation.x = Math.PI / 2;
      baton.position.z = 0.14;
      weaponProp.add(baton);
    }

    // Legs & Feet
    const buildLeg = (isLeft: boolean) => {
      const sign = isLeft ? 1 : -1;
      const hip = new THREE.Group();
      hip.position.set(sign * 0.13, -0.06, 0);
      hips.add(hip);

      const legMat = p.id === 'rahul' || p.id === 'kejriwal' ? darkMat : primaryMat;
      const thigh = this.registerMesh(
        new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.078, 0.42, 10), legMat)
      );
      thigh.position.y = -0.21;
      hip.add(thigh);

      const knee = new THREE.Group();
      knee.position.y = -0.42;
      hip.add(knee);

      const shin = this.registerMesh(
        new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.06, 0.42, 10), legMat)
      );
      shin.position.y = -0.21;
      knee.add(shin);

      const ankle = new THREE.Group();
      ankle.position.y = -0.43;
      knee.add(ankle);

      // Footwear: Hawai Chappal for Mamata, Sandals/Shoes for others
      const shoeMat = p.id === 'mamata' ? secondaryMat : darkMat;
      const foot = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.07, 0.24), shoeMat)
      );
      foot.position.set(0, -0.03, 0.05);
      ankle.add(foot);

      return { hip, knee, ankle };
    };

    const leftLeg = buildLeg(true);
    const rightLeg = buildLeg(false);

    return {
      root,
      hips,
      torso,
      chest,
      neck,
      head,
      leftShoulder: leftArm.shoulder,
      leftElbow: leftArm.elbow,
      leftHand: leftArm.hand,
      rightShoulder: rightArm.shoulder,
      rightElbow: rightArm.elbow,
      rightHand: rightArm.hand,
      leftHip: leftLeg.hip,
      leftKnee: leftLeg.knee,
      leftAnkle: leftLeg.ankle,
      rightHip: rightLeg.hip,
      rightKnee: rightLeg.knee,
      rightAnkle: rightLeg.ankle,
      rageAura,
      weaponProp
    };
  }

  public triggerHitFlash(): void {
    this.hitFlashTime = 0.11;
  }

  public updateVisuals(dt: number, isRage: boolean, isPowerCrush: boolean, time: number): void {
    // Update hit flash
    if (this.hitFlashTime > 0) {
      this.hitFlashTime -= dt;
      const flash = this.hitFlashTime > 0;
      for (const m of this.meshes) {
        const mat = m.material as THREE.MeshStandardMaterial;
        if (mat && mat.emissive) {
          mat.emissive.setHex(flash ? 0xffffff : 0x000000);
          mat.emissiveIntensity = flash ? 0.65 : 0;
        }
      }
    }

    // Update Rage / Power Crush Aura
    const auraMat = this.joints.rageAura.material as THREE.MeshBasicMaterial;
    if (isPowerCrush) {
      auraMat.color.setHex(0xffffff);
      auraMat.opacity = 0.45 + Math.sin(time * 30) * 0.15;
      this.joints.rageAura.rotation.y += dt * 8;
    } else if (isRage) {
      auraMat.color.setHex(0xff003c);
      auraMat.opacity = 0.28 + Math.sin(time * 18) * 0.12;
      this.joints.rageAura.rotation.y += dt * 4;
    } else {
      auraMat.opacity = 0;
    }
  }

  public getLimbWorldPosition(limb: 'leftHand' | 'rightHand' | 'leftFoot' | 'rightFoot' | 'torso' | 'bothHands'): THREE.Vector3 {
    const pos = new THREE.Vector3();
    switch (limb) {
      case 'leftHand':
        this.joints.leftHand.getWorldPosition(pos);
        break;
      case 'rightHand':
      case 'bothHands':
        this.joints.rightHand.getWorldPosition(pos);
        break;
      case 'leftFoot':
        this.joints.leftAnkle.getWorldPosition(pos);
        break;
      case 'rightFoot':
        this.joints.rightAnkle.getWorldPosition(pos);
        break;
      case 'torso':
        this.joints.chest.getWorldPosition(pos);
        break;
    }
    return pos;
  }
}
