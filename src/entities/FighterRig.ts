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
  nameplateSprite: THREE.Sprite;
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

  private createMat(
    color: number,
    roughness = 0.45,
    metalness = 0.15,
    emissive = 0x000000,
    emissiveIntensity = 0
  ): THREE.MeshStandardMaterial {
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

  private createFloatingNameplate(): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    // Rounded dark pill background with glowing border
    const p = this.profile;
    ctx.fillStyle = 'rgba(7, 11, 20, 0.86)';
    ctx.strokeStyle = p.colors.uiHex;
    ctx.lineWidth = 8;

    const r = 34;
    const x = 16;
    const y = 20;
    const w = 480;
    const h = 88;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Character Icon + Short Name
    const icon =
      p.id === 'modi'
        ? '🪷 '
        : p.id === 'mamata'
        ? '🩴 '
        : p.id === 'yogi'
        ? '🚜 '
        : p.id === 'kejriwal'
        ? '🧹 '
        : '✋ ';

    ctx.font = '900 44px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = p.colors.uiHex;
    ctx.shadowBlur = 12;
    ctx.fillText(`${icon}${p.shortName}`, 256, 65);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthTest: false
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(1.18, 0.3, 1);
    sprite.position.set(0, 2.32, 0);
    return sprite;
  }

  private buildRig(): RigJoints {
    const p = this.profile;
    const bulk = p.scale.bulk;
    const heightScale = p.scale.height;

    const skinMat = this.createMat(p.colors.skin, 0.48, 0.04);
    const primaryMat = this.createMat(p.colors.primary, 0.48, 0.1);
    const secondaryMat = this.createMat(p.colors.secondary, 0.35, 0.22);
    const accentMat = this.createMat(p.colors.accent, 0.25, 0.5, p.colors.glow, 0.38);
    const hairMat = this.createMat(p.colors.hair, 0.62, 0.05);
    const darkMat = this.createMat(0x111827, 0.38, 0.3);
    const whiteMat = this.createMat(0xffffff, 0.35, 0.05);
    const glassesMat = this.createMat(0xd4af37, 0.18, 0.88);
    const lensGlassMat = new THREE.MeshStandardMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.36,
      roughness: 0.1,
      metalness: 0.9
    });
    const rudrakshaMat = this.createMat(0x5c2c16, 0.7, 0.08);
    const sandalwoodMat = this.createMat(0xfde047, 0.3, 0.1, 0xf59e0b, 0.25);
    const vermilionMat = this.createMat(0xd90429, 0.3, 0.1, 0xff003c, 0.35);

    const root = new THREE.Group();
    root.scale.set(bulk, heightScale, bulk);
    this.group.add(root);

    // Floating 3D Nameplate Banner above fighter head for 100% instant identification!
    const nameplateSprite = this.createFloatingNameplate();
    root.add(nameplateSprite);

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

    // Lower Garment Drapes (Saree / Saffron Monastic Dhoti Robe / Kurta Tunic)
    if (p.id === 'mamata') {
      // Iconic Bengal White Tant Saree with Crisp Blue Border Pleats
      const sareeSkirt = this.registerMesh(
        new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.34, 0.74, 16), primaryMat)
      );
      sareeSkirt.position.y = -0.35;
      hips.add(sareeSkirt);

      const blueBorder = this.registerMesh(
        new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.35, 0.13, 16), secondaryMat)
      );
      blueBorder.position.y = -0.66;
      hips.add(blueBorder);

      // Front Saree Pleats Fold
      const frontPleat = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.72, 0.06), secondaryMat)
      );
      frontPleat.position.set(0, -0.35, 0.29);
      hips.add(frontPleat);
    } else if (p.id === 'yogi') {
      // Flowing Bhagwa / Saffron Monastic Dhoti-Chola Robe
      const dhotiRobe = this.registerMesh(
        new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.34, 0.64, 16), primaryMat)
      );
      dhotiRobe.position.y = -0.3;
      hips.add(dhotiRobe);

      const sashFold = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.62, 0.07), secondaryMat)
      );
      sashFold.position.set(0, -0.29, 0.28);
      hips.add(sashFold);
    } else if (p.id === 'modi') {
      // Crisp Long Cream Kurta Tunic
      const kurtaBottom = this.registerMesh(
        new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.31, 0.42, 14), primaryMat)
      );
      kurtaBottom.position.y = -0.18;
      hips.add(kurtaBottom);
    }

    // Torso & Chest
    const torso = new THREE.Group();
    torso.position.y = 0.1;
    hips.add(torso);

    const abdomenMesh = this.registerMesh(
      new THREE.Mesh(new THREE.BoxGeometry(0.41, 0.28, 0.27), primaryMat)
    );
    abdomenMesh.position.y = 0.14;
    torso.add(abdomenMesh);

    const chest = new THREE.Group();
    chest.position.y = 0.28;
    torso.add(chest);

    const chestWidth = p.id === 'modi' ? 0.56 : p.id === 'yogi' ? 0.5 : 0.46;
    const chestDepth = p.id === 'modi' ? 0.35 : 0.3;
    const chestMesh = this.registerMesh(
      new THREE.Mesh(
        new THREE.BoxGeometry(chestWidth, 0.39, chestDepth),
        p.id === 'modi' ? secondaryMat : primaryMat
      )
    );
    chestMesh.position.y = 0.18;
    chest.add(chestMesh);

    // ================= CHARACTER-SPECIFIC CHEST & OUTFIT DETAILS =================
    if (p.id === 'modi') {
      // 1. NARENDRA MODI: Saffron Mandarin-Collar Nehru Jacket + Angavastram Scarf + Gold Buttons + Lotus Badge
      const collar = this.registerMesh(
        new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.155, 0.13, 14), secondaryMat)
      );
      collar.position.set(0, 0.39, 0);
      chest.add(collar);

      // White V-Neck Kurta Placket visible under collar
      const vNeck = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.03), primaryMat)
      );
      vNeck.position.set(0, 0.33, chestDepth / 2 + 0.008);
      chest.add(vNeck);

      // 4 Gold Jacket Buttons down the center
      for (let b = 0; b < 4; b++) {
        const btn = this.registerMesh(
          new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), glassesMat)
        );
        btn.position.set(0, 0.29 - b * 0.075, chestDepth / 2 + 0.014);
        chest.add(btn);
      }

      // Saffron & Gold Angavastram Stole draped around neck & shoulders
      const stoleLeft = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.42, 0.04), primaryMat)
      );
      stoleLeft.position.set(0.16, 0.17, chestDepth / 2 + 0.018);
      const stoleRight = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.42, 0.04), primaryMat)
      );
      stoleRight.position.set(-0.16, 0.17, chestDepth / 2 + 0.018);
      chest.add(stoleLeft, stoleRight);

      // Glowing Lotus Pin on Left Pocket
      const lotusPin = this.registerMesh(
        new THREE.Mesh(new THREE.OctahedronGeometry(0.052, 0), accentMat)
      );
      lotusPin.position.set(0.15, 0.27, chestDepth / 2 + 0.025);
      chest.add(lotusPin);
    } else if (p.id === 'mamata') {
      // 2. MAMATA BANERJEE: White Tant Saree + Diagonal Blue-Border Pallu over Left Shoulder + Jhola Shoulder Bag
      const palluMain = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.51, 0.42, 0.32), primaryMat)
      );
      palluMain.position.set(0.01, 0.18, 0);
      palluMain.scale.set(0.52, 1.03, 1.04);
      palluMain.rotation.z = -0.36;
      chest.add(palluMain);

      const palluBlueStripe1 = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.45, 0.33), secondaryMat)
      );
      palluBlueStripe1.position.set(0.09, 0.19, 0);
      palluBlueStripe1.rotation.z = -0.36;
      const palluBlueStripe2 = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.45, 0.33), secondaryMat)
      );
      palluBlueStripe2.position.set(-0.07, 0.17, 0);
      palluBlueStripe2.rotation.z = -0.36;
      chest.add(palluBlueStripe1, palluBlueStripe2);
    } else if (p.id === 'yogi') {
      // 3. YOGI BABA: Bhagwa Saffron Monastic Robes + Rudraksha Mala Necklace + Draped Saffron Angavastram Shawl
      const shawl = this.registerMesh(
        new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.055, 10, 18), secondaryMat)
      );
      shawl.rotation.x = Math.PI / 2 + 0.18;
      shawl.position.set(0, 0.36, 0.02);
      chest.add(shawl);

      // Sacred Rudraksha Bead Mala around neck/chest
      const malaGroup = new THREE.Group();
      const beadCount = 14;
      for (let i = 0; i < beadCount; i++) {
        const ang = (i / beadCount) * Math.PI * 2;
        const bead = this.registerMesh(
          new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), rudrakshaMat)
        );
        bead.position.set(
          Math.sin(ang) * 0.14,
          0.34 - Math.max(0, Math.cos(ang)) * 0.11,
          Math.cos(ang) * 0.155
        );
        malaGroup.add(bead);
      }
      chest.add(malaGroup);

      // Gold Bulldozer Crest Emblem on Chest
      const crest = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.03), accentMat)
      );
      crest.position.set(0, 0.22, chestDepth / 2 + 0.015);
      chest.add(crest);
    } else if (p.id === 'kejriwal') {
      // 4. ARVIND KEJRIWAL: Blue V-Neck SweaterVest Pattern + Thick Maroon Winter Muffler + Pocket Pen
      const mufflerRing = this.registerMesh(
        new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.06, 12, 20), secondaryMat)
      );
      mufflerRing.rotation.x = Math.PI / 2;
      mufflerRing.position.set(0, 0.39, 0.01);
      chest.add(mufflerRing);

      const mufflerTail1 = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.34, 0.06), secondaryMat)
      );
      mufflerTail1.position.set(0.06, 0.2, chestDepth / 2 + 0.035);
      const mufflerTail2 = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.28, 0.05), secondaryMat)
      );
      mufflerTail2.position.set(-0.05, 0.23, chestDepth / 2 + 0.025);
      chest.add(mufflerTail1, mufflerTail2);

      // Shirt Pocket + 2 Pens clipped in pocket!
      const pen1 = this.registerMesh(
        new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.09, 6), glassesMat)
      );
      pen1.position.set(0.14, 0.26, chestDepth / 2 + 0.016);
      chest.add(pen1);
    } else if (p.id === 'rahul') {
      // 5. RAHUL GANDHI: Crisp White Polo Collar + Placket Buttons + Tricolor Bharat Jodo Yatra Arm/Chest Badge
      const poloCollar = this.registerMesh(
        new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.032, 8, 16), whiteMat)
      );
      poloCollar.rotation.x = Math.PI / 2;
      poloCollar.position.set(0, 0.38, 0);
      chest.add(poloCollar);

      const placket = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.15, 0.025), darkMat)
      );
      placket.position.set(0, 0.29, chestDepth / 2 + 0.01);
      chest.add(placket);

      // Tricolor Ribbon Badge on Left Chest
      const triOrange = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.02), this.createMat(0xff6b00));
      triOrange.position.set(0.14, 0.28, chestDepth / 2 + 0.016);
      const triWhite = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.02), whiteMat);
      triWhite.position.set(0.14, 0.26, chestDepth / 2 + 0.016);
      const triGreen = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.02), accentMat);
      triGreen.position.set(0.14, 0.24, chestDepth / 2 + 0.016);
      chest.add(triOrange, triWhite, triGreen);
    }

    // ================= NECK & SCULPTED EXPRESSIVE HEAD =================
    const neck = new THREE.Group();
    neck.position.y = 0.4;
    chest.add(neck);

    const neckMesh = this.registerMesh(
      new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.105, 0.12, 12), skinMat)
    );
    neckMesh.position.y = 0.04;
    neck.add(neckMesh);

    const head = new THREE.Group();
    head.position.y = 0.11;
    neck.add(head);

    // Sculpted Cranium + Jawline + Ears + Expressive Eyes (Sclera + Pupils + Eyebrows)
    const headMesh = this.registerMesh(
      new THREE.Mesh(new THREE.SphereGeometry(0.205, 22, 22), skinMat)
    );
    headMesh.scale.set(0.96, 1.1, 0.98);
    headMesh.position.y = 0.16;
    head.add(headMesh);

    // Left & Right Ears
    [-1, 1].forEach((sign) => {
      const ear = this.registerMesh(
        new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 10), skinMat)
      );
      ear.scale.set(0.45, 1.15, 0.7);
      ear.position.set(sign * 0.195, 0.15, 0.0);
      head.add(ear);
    });

    // Expressive White Sclera + Dark Iris/Pupils
    [-1, 1].forEach((sign) => {
      const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.034, 12, 12), whiteMat);
      sclera.scale.set(1.1, 0.85, 0.6);
      sclera.position.set(sign * 0.072, 0.185, 0.175);

      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.019, 10, 10), darkMat);
      pupil.position.set(sign * 0.072, 0.185, 0.195);

      // Expressive Eyebrow
      const browMat = p.id === 'modi' ? hairMat : darkMat;
      const brow = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.072, 0.018, 0.025), browMat)
      );
      brow.position.set(sign * 0.072, 0.228, 0.185);
      brow.rotation.z = sign * -0.14;

      head.add(sclera, pupil, brow);
    });

    // Sculpted Nose Bridge & Tip
    const nose = this.registerMesh(
      new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.085, 10), skinMat)
    );
    nose.rotation.x = Math.PI / 2 - 0.15;
    nose.position.set(0, 0.145, 0.21);
    head.add(nose);

    // Expressive Mouth / Smile Line
    const mouth = new THREE.Mesh(
      new THREE.BoxGeometry(0.075, 0.016, 0.02),
      this.createMat(0x7f1d1d, 0.5)
    );
    mouth.position.set(0, 0.075, 0.188);
    head.add(mouth);

    // ================= CHARACTER-SPECIFIC HEAD / HAIR / GLASSES / IDENTIFIERS =================
    if (p.id === 'modi') {
      // NARENDRA MODI: Iconic Full Snowy-White Beard, Mustache, Swept White Hair & Gold Rimless Spectacles
      const beardMain = this.registerMesh(
        new THREE.Mesh(new THREE.SphereGeometry(0.185, 16, 14), hairMat)
      );
      beardMain.scale.set(1.06, 1.08, 0.98);
      beardMain.position.set(0, 0.055, 0.075);
      head.add(beardMain);

      const beardChin = this.registerMesh(
        new THREE.Mesh(new THREE.ConeGeometry(0.135, 0.18, 14), hairMat)
      );
      beardChin.rotation.x = Math.PI;
      beardChin.position.set(0, -0.04, 0.11);
      head.add(beardChin);

      const mustache = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.135, 0.034, 0.05), hairMat)
      );
      mustache.position.set(0, 0.105, 0.195);
      head.add(mustache);

      // Swept White Hair Dome + Sideburns
      const hairDome = this.registerMesh(
        new THREE.Mesh(
          new THREE.SphereGeometry(0.212, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.58),
          hairMat
        )
      );
      hairDome.position.set(0, 0.18, -0.01);
      head.add(hairDome);

      // Gold Rimless Rectangular Spectacles + Bridge + Ear Temples
      [-1, 1].forEach((sign) => {
        const frame = new THREE.Mesh(new THREE.TorusGeometry(0.046, 0.006, 8, 18), glassesMat);
        frame.scale.set(1.15, 0.85, 1);
        frame.position.set(sign * 0.072, 0.185, 0.198);
        const lens = new THREE.Mesh(new THREE.CircleGeometry(0.043, 16), lensGlassMat);
        lens.scale.set(1.15, 0.85, 1);
        lens.position.set(sign * 0.072, 0.185, 0.199);
        head.add(frame, lens);
      });
      const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.008, 0.01), glassesMat);
      bridge.position.set(0, 0.19, 0.2);
      head.add(bridge);
    } else if (p.id === 'mamata') {
      // MAMATA BANERJEE: Center-Parted Dark Hair, Prominent Back Bun (Jura), Red Bindi & Spectacles
      const hairCap = this.registerMesh(
        new THREE.Mesh(
          new THREE.SphereGeometry(0.212, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.56),
          hairMat
        )
      );
      hairCap.position.set(0, 0.18, -0.015);
      head.add(hairCap);

      // Large Recognizable Back Jura Bun + Blue Hair Tie Ring
      const bun = this.registerMesh(
        new THREE.Mesh(new THREE.SphereGeometry(0.115, 14, 14), hairMat)
      );
      bun.position.set(0, 0.14, -0.23);
      const bunRibbon = this.registerMesh(
        new THREE.Mesh(new THREE.TorusGeometry(0.088, 0.016, 8, 16), secondaryMat)
      );
      bunRibbon.position.set(0, 0.14, -0.17);
      head.add(bun, bunRibbon);

      // Prominent Red Forehead Bindi
      const bindi = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 10), vermilionMat);
      bindi.position.set(0, 0.24, 0.195);
      head.add(bindi);

      // Rectangular Spectacles
      [-1, 1].forEach((sign) => {
        const frame = new THREE.Mesh(new THREE.TorusGeometry(0.044, 0.006, 8, 16), darkMat);
        frame.scale.set(1.15, 0.82, 1);
        frame.position.set(sign * 0.072, 0.185, 0.198);
        const lens = new THREE.Mesh(new THREE.CircleGeometry(0.041, 14), lensGlassMat);
        lens.scale.set(1.15, 0.82, 1);
        lens.position.set(sign * 0.072, 0.185, 0.199);
        head.add(frame, lens);
      });
    } else if (p.id === 'yogi') {
      // YOGI BABA: Clean-Shaven Monk Head, Sacred Chandan/Vermilion Forehead Tilak, Golden Kundal Hoop Earrings & Tinted Aviator Shades!
      // 1. Sacred Forehead Tilak (Yellow Sandalwood U-Tripundra + Red Vermilion Bindu)
      const tilakOuter = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.075, 0.015), sandalwoodMat)
      );
      tilakOuter.position.set(0, 0.255, 0.192);
      tilakOuter.rotation.x = -0.18;
      const tilakCenter = this.registerMesh(
        new THREE.Mesh(new THREE.SphereGeometry(0.016, 10, 10), vermilionMat)
      );
      tilakCenter.position.set(0, 0.245, 0.2);
      head.add(tilakOuter, tilakCenter);

      // 2. Iconic Nath Sampradaya Golden Kundal Earrings in Both Ears!
      [-1, 1].forEach((sign) => {
        const kundal = this.registerMesh(
          new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.009, 8, 16), glassesMat)
        );
        kundal.rotation.y = Math.PI / 2;
        kundal.position.set(sign * 0.205, 0.105, 0.01);
        head.add(kundal);
      });

      // 3. Back Shikha (Small tuft on crown back)
      const shikha = this.registerMesh(
        new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.08, 8), darkMat)
      );
      shikha.rotation.x = -0.8;
      shikha.position.set(0, 0.31, -0.15);
      head.add(shikha);

      // 4. Badass "Bulldozer Baba" Dark Aviator Sunglasses (Optional signature swag!)
      const aviatorLensMat = new THREE.MeshStandardMaterial({
        color: 0x1e1b4b,
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.72
      });
      [-1, 1].forEach((sign) => {
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.046, 0.006, 8, 16), glassesMat);
        rim.scale.set(1.18, 0.9, 1);
        rim.position.set(sign * 0.072, 0.185, 0.198);
        const shade = new THREE.Mesh(new THREE.CircleGeometry(0.044, 14), aviatorLensMat);
        shade.scale.set(1.18, 0.9, 1);
        shade.position.set(sign * 0.072, 0.185, 0.199);
        head.add(rim, shade);
      });
      const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.008, 0.01), glassesMat);
      bridge.position.set(0, 0.195, 0.2);
      head.add(bridge);
    } else if (p.id === 'kejriwal') {
      // ARVIND KEJRIWAL: Crisp White Boat-Shaped Gandhi Topi ("MEIN AAM AADMI"), Thick Mustache, Glasses & Maroon Muffler Ear-Wrap
      const hairSides = this.registerMesh(
        new THREE.Mesh(
          new THREE.SphereGeometry(0.208, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.52),
          hairMat
        )
      );
      hairSides.position.set(0, 0.17, -0.01);
      head.add(hairSides);

      // Boat-shaped White Gandhi Topi
      const topiGroup = new THREE.Group();
      const topiBase = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.11, 0.38), whiteMat)
      );
      topiBase.position.set(0, 0.34, 0.01);
      const topiPeak = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, 0.39), whiteMat)
      );
      topiPeak.position.set(0, 0.4, 0.01);
      // Black band trim on Topi
      const topiBand = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.215, 0.024, 0.385), darkMat)
      );
      topiBand.position.set(0, 0.3, 0.01);
      topiGroup.add(topiBase, topiPeak, topiBand);
      head.add(topiGroup);

      // Prominent Thick Black Mustache
      const mustache = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.135, 0.038, 0.05), darkMat)
      );
      mustache.position.set(0, 0.105, 0.198);
      head.add(mustache);

      // Black-Rimmed Spectacles
      [-1, 1].forEach((sign) => {
        const frame = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.008, 8, 16), darkMat);
        frame.scale.set(1.15, 0.85, 1);
        frame.position.set(sign * 0.072, 0.185, 0.198);
        const lens = new THREE.Mesh(new THREE.CircleGeometry(0.042, 14), lensGlassMat);
        lens.scale.set(1.15, 0.85, 1);
        lens.position.set(sign * 0.072, 0.185, 0.199);
        head.add(frame, lens);
      });

      // Iconic Maroon Muffler Wrapped Over Ears & Under Chin
      const earWrap = this.registerMesh(
        new THREE.Mesh(new THREE.TorusGeometry(0.198, 0.034, 10, 20), secondaryMat)
      );
      earWrap.rotation.y = Math.PI / 2;
      earWrap.position.set(0, 0.15, 0);
      head.add(earWrap);
    } else if (p.id === 'rahul') {
      // RAHUL GANDHI: Volumetric Wavy Curly Salt-and-Pepper Hair, Dimples & Full Bharat Jodo Beard
      const hairCap = this.registerMesh(
        new THREE.Mesh(
          new THREE.SphereGeometry(0.214, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.58),
          hairMat
        )
      );
      hairCap.position.set(0, 0.185, -0.01);
      head.add(hairCap);

      // Sculpted Wavy Hair Curls along forehead & crown
      const curlOffsets = [
        [-0.09, 0.34, 0.1],
        [-0.03, 0.36, 0.12],
        [0.04, 0.36, 0.12],
        [0.1, 0.34, 0.09],
        [-0.14, 0.29, 0.04],
        [0.14, 0.29, 0.04]
      ];
      for (const [cx, cy, cz] of curlOffsets) {
        const curl = this.registerMesh(
          new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), hairMat)
        );
        curl.position.set(cx, cy, cz);
        head.add(curl);
      }

      // Salt & Pepper Bharat Jodo Beard + Mustache
      const beard = this.registerMesh(
        new THREE.Mesh(new THREE.SphereGeometry(0.168, 14, 12), hairMat)
      );
      beard.scale.set(1.02, 0.96, 0.95);
      beard.position.set(0, 0.065, 0.065);
      const mustache = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.028, 0.045), hairMat)
      );
      mustache.position.set(0, 0.105, 0.195);
      head.add(beard, mustache);
    }

    // ================= ARMS & HANDS =================
    const buildArm = (isLeft: boolean) => {
      const sign = isLeft ? 1 : -1;
      const shoulder = new THREE.Group();
      shoulder.position.set(sign * (chestWidth / 2 + 0.06), 0.31, 0);
      chest.add(shoulder);

      const sleeveMat =
        p.id === 'kejriwal' || p.id === 'yogi' ? primaryMat : whiteMat;
      const upperArm = this.registerMesh(
        new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.064, 0.28, 12), sleeveMat)
      );
      upperArm.position.y = -0.13;
      shoulder.add(upperArm);

      const elbow = new THREE.Group();
      elbow.position.y = -0.27;
      shoulder.add(elbow);

      const forearm = this.registerMesh(
        new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.054, 0.26, 12), skinMat)
      );
      forearm.position.y = -0.13;
      elbow.add(forearm);

      // Glowing Aura Wristband (Rudraksha wrist mala for Yogi Baba)
      const wristBand = this.registerMesh(
        new THREE.Mesh(
          new THREE.CylinderGeometry(0.065, 0.065, 0.06, 12),
          p.id === 'yogi' ? rudrakshaMat : accentMat
        )
      );
      wristBand.position.y = -0.22;
      elbow.add(wristBand);

      const hand = new THREE.Group();
      hand.position.y = -0.27;
      elbow.add(hand);

      const fist = this.registerMesh(
        new THREE.Mesh(new THREE.SphereGeometry(0.076, 12, 12), skinMat)
      );
      hand.add(fist);

      return { shoulder, elbow, hand };
    };

    const leftArm = buildArm(true);
    const rightArm = buildArm(false);

    // ================= SIGNATURE 3D WEAPON PROPS IN RIGHT HAND =================
    const weaponProp = new THREE.Group();
    rightArm.hand.add(weaponProp);

    if (p.signatureProp === 'lotus_mic') {
      // Golden Parliamentary Microphone with Saffron Lotus Petals
      const handle = this.registerMesh(
        new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.28, 10), glassesMat)
      );
      handle.rotation.x = Math.PI / 2;
      handle.position.z = 0.1;
      const micHead = this.registerMesh(
        new THREE.Mesh(new THREE.OctahedronGeometry(0.068, 1), accentMat)
      );
      micHead.position.z = 0.26;
      weaponProp.add(handle, micHead);
    } else if (p.signatureProp === 'hawai_chappal') {
      // Iconic Blue & White Hawai Chappal held ready for action!
      const sole = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.032, 0.28), whiteMat)
      );
      sole.position.z = 0.15;
      const strap = this.registerMesh(
        new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.014, 8, 14, Math.PI), secondaryMat)
      );
      strap.position.set(0, 0.025, 0.17);
      weaponProp.add(sole, strap);
    } else if (p.signatureProp === 'bulldozer_blade') {
      // YOGI BABA: Heavy JCB Yellow Bulldozer Loader Bucket & Hydraulic Arm Gauntlet!
      const jcbYellowMat = this.createMat(0xfacc15, 0.25, 0.7, 0xf59e0b, 0.25);
      const hydraulicArm = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.055, 0.26), darkMat)
      );
      hydraulicArm.position.z = 0.12;

      const loaderBucket = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.14, 0.11), jcbYellowMat)
      );
      loaderBucket.position.set(0, 0, 0.26);

      // Steel Bulldozer Teeth along front edge
      for (let t = -2; t <= 2; t++) {
        const tooth = this.registerMesh(
          new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.06, 6), glassesMat)
        );
        tooth.rotation.x = Math.PI / 2;
        tooth.position.set(t * 0.048, -0.04, 0.33);
        weaponProp.add(tooth);
      }
      weaponProp.add(hydraulicArm, loaderBucket);
    } else if (p.signatureProp === 'muffler_broom') {
      // Legendary Aam Aadmi Jhadu (Broom)
      const stick = this.registerMesh(
        new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.026, 0.34, 10), this.createMat(0x854d0e))
      );
      stick.rotation.x = Math.PI / 2;
      stick.position.z = 0.15;
      const bristles = this.registerMesh(
        new THREE.Mesh(new THREE.ConeGeometry(0.082, 0.28, 12), accentMat)
      );
      bristles.rotation.x = -Math.PI / 2;
      bristles.position.z = 0.39;
      weaponProp.add(stick, bristles);
    } else if (p.signatureProp === 'padyatra_torch') {
      // Glowing Tricolor Bharat Jodo Baton
      const baton = this.registerMesh(
        new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.024, 0.32, 10), accentMat)
      );
      baton.rotation.x = Math.PI / 2;
      baton.position.z = 0.15;
      weaponProp.add(baton);
    }

    // ================= LEGS & FEET =================
    const buildLeg = (isLeft: boolean) => {
      const sign = isLeft ? 1 : -1;
      const hip = new THREE.Group();
      hip.position.set(sign * 0.13, -0.06, 0);
      hips.add(hip);

      const legMat = p.id === 'rahul' || p.id === 'kejriwal' ? darkMat : primaryMat;
      const thigh = this.registerMesh(
        new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.078, 0.42, 12), legMat)
      );
      thigh.position.y = -0.21;
      hip.add(thigh);

      const knee = new THREE.Group();
      knee.position.y = -0.42;
      hip.add(knee);

      const shin = this.registerMesh(
        new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.06, 0.42, 12), legMat)
      );
      shin.position.y = -0.21;
      knee.add(shin);

      const ankle = new THREE.Group();
      ankle.position.y = -0.43;
      knee.add(ankle);

      // Footwear: Hawai Chappal for Mamata, Wooden Paduka / Saffron Sandals for Yogi, Shoes for others
      const shoeMat =
        p.id === 'mamata'
          ? secondaryMat
          : p.id === 'yogi'
          ? this.createMat(0x9a3412, 0.5)
          : darkMat;
      const foot = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.115, 0.072, 0.245), shoeMat)
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
      weaponProp,
      nameplateSprite
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

    // Subtle bobbing on floating nameplate
    this.joints.nameplateSprite.position.y = 2.34 + Math.sin(time * 3.5) * 0.03;

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

  public getLimbWorldPosition(
    limb: 'leftHand' | 'rightHand' | 'leftFoot' | 'rightFoot' | 'torso' | 'bothHands'
  ): THREE.Vector3 {
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
