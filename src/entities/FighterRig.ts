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

const portraitUrlCache = new Map<string, string>();

/**
 * Generates a high-detail 512x512 recognizable facial likeness canvas for each political leader.
 * Used both as a 3D UV-mapped curved face texture on the 3D head mesh AND as a portrait avatar!
 */
export function createDetailedFaceCanvas(profile: FighterProfile, isAvatarBadge = false): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const id = profile.id;

  // Base skin tone hex
  const skinHex = `#${profile.colors.skin.toString(16).padStart(6, '0')}`;
  if (isAvatarBadge) {
    // Rich radial backdrop for UI portrait badge
    const bgGrad = ctx.createRadialGradient(256, 256, 40, 256, 256, 256);
    bgGrad.addColorStop(0, profile.colors.uiHex);
    bgGrad.addColorStop(1, '#090d16');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 512, 512);

    // Sculpted head silhouette oval for 2D badge
    ctx.fillStyle = skinHex;
    ctx.beginPath();
    ctx.ellipse(256, 272, 165, 198, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Seamless 3D skin base with warm anatomical cheek & temple shading
    ctx.fillStyle = skinHex;
    ctx.fillRect(0, 0, 512, 512);
  }

  // Subtle anatomical shading (forehead highlight, cheek warmth, jawline contour)
  const cheekGradL = ctx.createRadialGradient(155, 290, 10, 155, 290, 85);
  cheekGradL.addColorStop(0, 'rgba(185, 95, 65, 0.24)');
  cheekGradL.addColorStop(1, 'rgba(185, 95, 65, 0)');
  ctx.fillStyle = cheekGradL;
  ctx.fillRect(0, 0, 512, 512);

  const cheekGradR = ctx.createRadialGradient(357, 290, 10, 357, 290, 85);
  cheekGradR.addColorStop(0, 'rgba(185, 95, 65, 0.24)');
  cheekGradR.addColorStop(1, 'rgba(185, 95, 65, 0)');
  ctx.fillStyle = cheekGradR;
  ctx.fillRect(0, 0, 512, 512);

  // Forehead expression creases
  ctx.strokeStyle = 'rgba(110, 62, 38, 0.35)';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  if (id === 'modi' || id === 'kejriwal' || id === 'yogi') {
    ctx.beginPath();
    ctx.moveTo(175, 132);
    ctx.quadraticCurveTo(256, 124, 337, 132);
    ctx.moveTo(190, 148);
    ctx.quadraticCurveTo(256, 141, 322, 148);
    ctx.stroke();
  }

  // Glabella (between-eyebrows intense furrow lines for fighting determination)
  ctx.beginPath();
  ctx.moveTo(244, 166);
  ctx.lineTo(247, 195);
  ctx.moveTo(268, 166);
  ctx.lineTo(265, 195);
  ctx.stroke();

  // ================= CHARACTER-SPECIFIC FOREHEAD / HAIRLINE IDENTIFIERS =================
  if (id === 'yogi') {
    // YOGI BABA: Iconic Yellow Sandalwood (Chandan) Tripundra / U-Tilak + Bright Vermilion (Kumkum) Bindu & Streak!
    ctx.save();
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(256, 135, 34, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    // Vertical Chandan U-fork
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(238, 102);
    ctx.quadraticCurveTo(256, 162, 274, 102);
    ctx.stroke();

    // Central Vermilion Red Kumkum Streak & Bindu
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(256, 142, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(256, 106);
    ctx.lineTo(256, 162);
    ctx.stroke();
    ctx.restore();
  } else if (id === 'mamata') {
    // MAMATA DIDI: Iconic Bright Red Round Bindi on Forehead + Parted Black Hairline
    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.arc(256, 156, 14, 0, Math.PI * 2);
    ctx.fill();

    // Center-parted dark hair framing forehead
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.moveTo(60, 160);
    ctx.quadraticCurveTo(160, 65, 256, 96);
    ctx.quadraticCurveTo(352, 65, 452, 160);
    ctx.lineTo(452, 40);
    ctx.lineTo(60, 40);
    ctx.closePath();
    ctx.fill();
  } else if (id === 'modi') {
    // MODI JI: Swept Silver-White Hairline at top
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.moveTo(70, 125);
    ctx.quadraticCurveTo(256, 65, 442, 125);
    ctx.lineTo(442, 30);
    ctx.lineTo(70, 30);
    ctx.closePath();
    ctx.fill();
  } else if (id === 'kejriwal') {
    // KEJRIWAL: White Gandhi Topi Brim across top of forehead with "मैं आम आदमी"
    if (isAvatarBadge) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(85, 135);
      ctx.quadraticCurveTo(256, 48, 427, 135);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = '#0f172a';
      ctx.font = '900 22px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('मैं आम आदमी', 256, 112);
    }
  } else if (id === 'rahul') {
    // RAHUL GANDHI: Wavy Dark Salt-and-Pepper Hairline
    ctx.fillStyle = '#27272a';
    ctx.beginPath();
    ctx.moveTo(65, 145);
    ctx.quadraticCurveTo(175, 72, 256, 102);
    ctx.quadraticCurveTo(340, 72, 447, 145);
    ctx.lineTo(447, 30);
    ctx.lineTo(65, 30);
    ctx.closePath();
    ctx.fill();
  }

  // ================= REALISTIC EXPRESSIVE EYES & EYEBROWS =================
  const drawEyeAndBrow = (cx: number, cy: number, isLeft: boolean) => {
    const sign = isLeft ? -1 : 1;

    // Eye socket shadow
    const sockGrad = ctx.createRadialGradient(cx, cy, 8, cx, cy, 44);
    sockGrad.addColorStop(0, 'rgba(92, 48, 28, 0.34)');
    sockGrad.addColorStop(1, 'rgba(92, 48, 28, 0)');
    ctx.fillStyle = sockGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 44, 0, Math.PI * 2);
    ctx.fill();

    // Almond Sclera (White of Eye)
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(cx - 32, cy + 2);
    ctx.quadraticCurveTo(cx, cy - 23, cx + 32, cy + 2);
    ctx.quadraticCurveTo(cx, cy + 21, cx - 32, cy + 2);
    ctx.closePath();
    ctx.fill();

    // Iris (Deep Warm Brown)
    ctx.fillStyle = '#3b1d0e';
    ctx.beginPath();
    ctx.arc(cx, cy + 1, 14.5, 0, Math.PI * 2);
    ctx.fill();

    // Black Pupil
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.arc(cx, cy + 1, 7.5, 0, Math.PI * 2);
    ctx.fill();

    // Specular Eye Catchlight (Brings the face to life!)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - 4.5, cy - 4, 3.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 4, cy + 4, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Upper Eyelid Fold & Lash Line
    ctx.strokeStyle = '#1e1b18';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(cx - 34, cy + 3);
    ctx.quadraticCurveTo(cx, cy - 24, cx + 34, cy + 3);
    ctx.stroke();

    // Lower Eyelid Crease / Under-eye bag
    ctx.strokeStyle = 'rgba(105, 55, 35, 0.45)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx - 26, cy + 18);
    ctx.quadraticCurveTo(cx, cy + 28, cx + 26, cy + 16);
    ctx.stroke();

    // Character-Specific Eyebrows
    ctx.save();
    ctx.strokeStyle = id === 'modi' ? '#e2e8f0' : '#18181b';
    ctx.lineWidth = id === 'mamata' ? 7.5 : 11.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (id === 'mamata') {
      // High arched expressive eyebrows
      ctx.moveTo(cx - sign * 34, cy - 24);
      ctx.quadraticCurveTo(cx, cy - 42, cx + sign * 34, cy - 28);
    } else if (id === 'yogi') {
      // Intense authoritative angled brows
      ctx.moveTo(cx - sign * 18, cy - 22);
      ctx.quadraticCurveTo(cx, cy - 35, cx + sign * 38, cy - 28);
    } else {
      // Thick distinct brows
      ctx.moveTo(cx - sign * 28, cy - 23);
      ctx.quadraticCurveTo(cx, cy - 36, cx + sign * 36, cy - 25);
    }
    ctx.stroke();
    ctx.restore();
  };

  drawEyeAndBrow(182, 212, true);
  drawEyeAndBrow(330, 212, false);

  // Spectacles drawn cleanly on portrait for Modi, Mamata, Kejriwal
  if (id === 'modi' || id === 'mamata' || id === 'kejriwal') {
    ctx.save();
    ctx.strokeStyle = id === 'modi' ? '#d4af37' : '#1e293b';
    ctx.lineWidth = id === 'kejriwal' ? 6.5 : 4.2;
    ctx.fillStyle = 'rgba(186, 230, 253, 0.14)';
    // Left lens
    ctx.beginPath();
    ctx.roundRect(134, 184, 96, 56, 12);
    ctx.fill();
    ctx.stroke();
    // Right lens
    ctx.beginPath();
    ctx.roundRect(282, 184, 96, 56, 12);
    ctx.fill();
    ctx.stroke();
    // Bridge
    ctx.beginPath();
    ctx.moveTo(230, 206);
    ctx.lineTo(282, 206);
    ctx.stroke();
    ctx.restore();
  }

  // ================= SCULPTED NOSE SHADING & NOSTRILS =================
  ctx.strokeStyle = 'rgba(105, 55, 32, 0.55)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(242, 208);
  ctx.quadraticCurveTo(232, 265, 224, 288);
  ctx.quadraticCurveTo(256, 304, 288, 288);
  ctx.quadraticCurveTo(280, 265, 270, 208);
  ctx.stroke();

  // Nostrils
  ctx.fillStyle = 'rgba(68, 32, 18, 0.65)';
  ctx.beginPath();
  ctx.ellipse(238, 291, 7, 4, -0.3, 0, Math.PI * 2);
  ctx.ellipse(274, 291, 7, 4, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Nasolabial Folds (Smile / Expression Lines)
  ctx.strokeStyle = 'rgba(100, 52, 30, 0.5)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(214, 282);
  ctx.quadraticCurveTo(182, 322, 192, 362);
  ctx.moveTo(298, 282);
  ctx.quadraticCurveTo(330, 322, 320, 362);
  ctx.stroke();

  // ================= CHARACTER-SPECIFIC FACIAL HAIR, DIMPLES & MOUTH =================
  if (id === 'modi') {
    // NARENDRA MODI: Iconic Full Snowy-White Beard & Mustache with Silver Strands!
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.moveTo(95, 260);
    ctx.quadraticCurveTo(135, 320, 175, 315);
    ctx.quadraticCurveTo(256, 295, 337, 315);
    ctx.quadraticCurveTo(377, 320, 417, 260);
    ctx.quadraticCurveTo(432, 415, 256, 495);
    ctx.quadraticCurveTo(80, 415, 95, 260);
    ctx.closePath();
    ctx.fill();

    // Full White Mustache
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(175, 332);
    ctx.quadraticCurveTo(256, 292, 337, 332);
    ctx.quadraticCurveTo(256, 355, 175, 332);
    ctx.closePath();
    ctx.fill();

    // Beard Hair Strand Texture Lines
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2.5;
    for (let x = 135; x <= 375; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, 335);
      ctx.quadraticCurveTo(256 + (x - 256) * 0.65, 415, 256 + (x - 256) * 0.35, 480);
      ctx.stroke();
    }

    // Expressive Mouth visible beneath mustache
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.roundRect(222, 344, 68, 16, 8);
    ctx.fill();
  } else if (id === 'kejriwal') {
    // ARVIND KEJRIWAL: Prominent Thick Black Mustache + Expressive Mouth + Maroon Muffler Chin Wrap
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.moveTo(178, 336);
    ctx.quadraticCurveTo(218, 304, 256, 316);
    ctx.quadraticCurveTo(294, 304, 334, 336);
    ctx.quadraticCurveTo(295, 348, 256, 336);
    ctx.quadraticCurveTo(217, 348, 178, 336);
    ctx.closePath();
    ctx.fill();

    // Mouth below mustache
    ctx.fillStyle = '#881337';
    ctx.beginPath();
    ctx.moveTo(212, 352);
    ctx.quadraticCurveTo(256, 368, 300, 352);
    ctx.quadraticCurveTo(256, 382, 212, 352);
    ctx.fill();

    // Maroon Muffler framing jaw
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(70, 425, 372, 85);
  } else if (id === 'rahul') {
    // RAHUL GANDHI: Signature Cheek Dimples + Salt-and-Pepper Bharat Jodo Beard & Mustache!
    // Cheek Dimples
    ctx.strokeStyle = 'rgba(95, 48, 28, 0.68)';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(166, 330, 14, -0.35 * Math.PI, 0.35 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(346, 330, 14, 0.65 * Math.PI, 1.35 * Math.PI);
    ctx.stroke();

    // Salt-and-Pepper Full Beard
    ctx.fillStyle = '#27272a';
    ctx.beginPath();
    ctx.moveTo(108, 275);
    ctx.quadraticCurveTo(150, 332, 188, 324);
    ctx.quadraticCurveTo(256, 305, 324, 324);
    ctx.quadraticCurveTo(362, 332, 404, 275);
    ctx.quadraticCurveTo(412, 415, 256, 478);
    ctx.quadraticCurveTo(100, 415, 108, 275);
    ctx.closePath();
    ctx.fill();

    // Silver-Grey Salt-and-Pepper Beard Streaks
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2.5;
    for (let x = 145; x <= 365; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, 342);
      ctx.lineTo(256 + (x - 256) * 0.55, 455);
      ctx.stroke();
    }

    // Warm smile
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.roundRect(222, 345, 68, 16, 8);
    ctx.fill();
  } else if (id === 'yogi') {
    // YOGI BABA: Clean-Shaven Monk Jawline with Authoritative Expression
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 6.5;
    ctx.beginPath();
    ctx.moveTo(210, 352);
    ctx.quadraticCurveTo(256, 366, 302, 352);
    ctx.stroke();

    // Lower lip shadow
    ctx.strokeStyle = 'rgba(100, 52, 30, 0.55)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(232, 372);
    ctx.quadraticCurveTo(256, 382, 280, 372);
    ctx.stroke();
  } else if (id === 'mamata') {
    // MAMATA BANERJEE: Expressive Determined Lips
    ctx.fillStyle = '#be123c';
    ctx.beginPath();
    ctx.moveTo(208, 352);
    ctx.quadraticCurveTo(256, 338, 304, 352);
    ctx.quadraticCurveTo(256, 374, 208, 352);
    ctx.closePath();
    ctx.fill();
  }

  return canvas;
}

export function getFighterPortraitDataURL(profile: FighterProfile): string {
  const cached = portraitUrlCache.get(profile.id);
  if (cached) return cached;
  const canvas = createDetailedFaceCanvas(profile, true);
  const url = canvas.toDataURL('image/png');
  portraitUrlCache.set(profile.id, url);
  return url;
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

    const p = this.profile;
    ctx.fillStyle = 'rgba(7, 11, 20, 0.88)';
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
    sprite.position.set(0, 2.34, 0);
    return sprite;
  }

  private buildRig(): RigJoints {
    const p = this.profile;
    const bulk = p.scale.bulk;
    const heightScale = p.scale.height;

    const skinMat = this.createMat(p.colors.skin, 0.46, 0.04);
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
      opacity: 0.24,
      roughness: 0.1,
      metalness: 0.9
    });
    const rudrakshaMat = this.createMat(0x5c2c16, 0.7, 0.08);
    const sandalwoodMat = this.createMat(0xfde047, 0.3, 0.1, 0xf59e0b, 0.25);
    const vermilionMat = this.createMat(0xd90429, 0.3, 0.1, 0xff003c, 0.35);

    const root = new THREE.Group();
    root.scale.set(bulk, heightScale, bulk);
    this.group.add(root);

    // Floating 3D Nameplate Banner above fighter head
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

      const frontPleat = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.72, 0.06), secondaryMat)
      );
      frontPleat.position.set(0, -0.35, 0.29);
      hips.add(frontPleat);
    } else if (p.id === 'yogi') {
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
      const collar = this.registerMesh(
        new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.155, 0.13, 14), secondaryMat)
      );
      collar.position.set(0, 0.39, 0);
      chest.add(collar);

      const vNeck = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.03), primaryMat)
      );
      vNeck.position.set(0, 0.33, chestDepth / 2 + 0.008);
      chest.add(vNeck);

      for (let b = 0; b < 4; b++) {
        const btn = this.registerMesh(
          new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), glassesMat)
        );
        btn.position.set(0, 0.29 - b * 0.075, chestDepth / 2 + 0.014);
        chest.add(btn);
      }

      const stoleLeft = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.42, 0.04), primaryMat)
      );
      stoleLeft.position.set(0.16, 0.17, chestDepth / 2 + 0.018);
      const stoleRight = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.42, 0.04), primaryMat)
      );
      stoleRight.position.set(-0.16, 0.17, chestDepth / 2 + 0.018);
      chest.add(stoleLeft, stoleRight);

      const lotusPin = this.registerMesh(
        new THREE.Mesh(new THREE.OctahedronGeometry(0.052, 0), accentMat)
      );
      lotusPin.position.set(0.15, 0.27, chestDepth / 2 + 0.025);
      chest.add(lotusPin);
    } else if (p.id === 'mamata') {
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
      const shawl = this.registerMesh(
        new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.055, 10, 18), secondaryMat)
      );
      shawl.rotation.x = Math.PI / 2 + 0.18;
      shawl.position.set(0, 0.36, 0.02);
      chest.add(shawl);

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

      const crest = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.03), accentMat)
      );
      crest.position.set(0, 0.22, chestDepth / 2 + 0.015);
      chest.add(crest);
    } else if (p.id === 'kejriwal') {
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

      const pen1 = this.registerMesh(
        new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.09, 6), glassesMat)
      );
      pen1.position.set(0.14, 0.26, chestDepth / 2 + 0.016);
      chest.add(pen1);
    } else if (p.id === 'rahul') {
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

      const triOrange = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.02), this.createMat(0xff6b00));
      triOrange.position.set(0.14, 0.28, chestDepth / 2 + 0.016);
      const triWhite = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.02), whiteMat);
      triWhite.position.set(0.14, 0.26, chestDepth / 2 + 0.016);
      const triGreen = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.02), accentMat);
      triGreen.position.set(0.14, 0.24, chestDepth / 2 + 0.016);
      chest.add(triOrange, triWhite, triGreen);
    }

    // ================= NECK & HIGH-DETAIL RECOGNIZABLE 3D HEAD =================
    const neck = new THREE.Group();
    neck.position.y = 0.4;
    chest.add(neck);

    const neckMesh = this.registerMesh(
      new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.11, 0.13, 14), skinMat)
    );
    neckMesh.position.y = 0.04;
    neck.add(neckMesh);

    const head = new THREE.Group();
    head.position.y = 0.11;
    neck.add(head);

    // 1. Base Sculpted Cranium & Jawline
    const headMesh = this.registerMesh(
      new THREE.Mesh(new THREE.SphereGeometry(0.212, 28, 28), skinMat)
    );
    headMesh.scale.set(0.98, 1.12, 1.0);
    headMesh.position.y = 0.165;
    head.add(headMesh);

    // 2. High-Resolution 512x512 Portrait Face Texture mapped onto 3D Front Facial Surface!
    const faceCanvas = createDetailedFaceCanvas(p, false);
    const faceTexture = new THREE.CanvasTexture(faceCanvas);
    faceTexture.colorSpace = THREE.SRGBColorSpace;
    faceTexture.needsUpdate = true;

    const faceSurfaceGeo = new THREE.SphereGeometry(
      0.2145,
      32,
      32,
      Math.PI * 0.16,
      Math.PI * 0.68,
      Math.PI * 0.14,
      Math.PI * 0.72
    );
    const faceSurfaceMat = new THREE.MeshStandardMaterial({
      map: faceTexture,
      roughness: 0.42,
      metalness: 0.04
    });
    const faceSurfaceMesh = new THREE.Mesh(faceSurfaceGeo, faceSurfaceMat);
    faceSurfaceMesh.scale.set(0.98, 1.12, 1.0);
    faceSurfaceMesh.position.y = 0.165;
    head.add(faceSurfaceMesh);

    // 3. Sculpted 3D Nose Bridge, Nose Tip & Cheekbones for True 3D Depth from Side/Angle Cameras
    const noseBridge = this.registerMesh(
      new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.026, 0.082, 10), skinMat)
    );
    noseBridge.position.set(0, 0.168, 0.212);
    noseBridge.rotation.x = -0.26;
    const noseTip = this.registerMesh(
      new THREE.Mesh(new THREE.SphereGeometry(0.026, 12, 12), skinMat)
    );
    noseTip.position.set(0, 0.135, 0.228);
    head.add(noseBridge, noseTip);

    // Left & Right Sculpted Ears with Inner Concha
    [-1, 1].forEach((sign) => {
      const ear = this.registerMesh(
        new THREE.Mesh(new THREE.SphereGeometry(0.052, 12, 12), skinMat)
      );
      ear.scale.set(0.45, 1.18, 0.72);
      ear.position.set(sign * 0.205, 0.16, 0.0);
      head.add(ear);
    });

    // ================= CHARACTER-SPECIFIC 3D FACIAL SCULPT, HAIR & IDENTIFIERS =================
    if (p.id === 'modi') {
      // NARENDRA MODI: Sculpted 3D Snowy-White Beard & Mustache Volume, Swept White Hair & Gold Rimless Spectacles
      const beardLower = this.registerMesh(
        new THREE.Mesh(new THREE.ConeGeometry(0.155, 0.21, 18), hairMat)
      );
      beardLower.rotation.x = Math.PI - 0.12;
      beardLower.position.set(0, -0.02, 0.105);
      head.add(beardLower);

      const jawBeard = this.registerMesh(
        new THREE.Mesh(
          new THREE.SphereGeometry(0.208, 18, 14, 0, Math.PI * 2, Math.PI * 0.55, Math.PI * 0.45),
          hairMat
        )
      );
      jawBeard.scale.set(1.04, 1.08, 1.02);
      jawBeard.position.set(0, 0.145, 0.01);
      head.add(jawBeard);

      const mustache3D = this.registerMesh(
        new THREE.Mesh(new THREE.TorusGeometry(0.058, 0.022, 10, 16, Math.PI), hairMat)
      );
      mustache3D.rotation.x = 0.2;
      mustache3D.rotation.z = Math.PI;
      mustache3D.position.set(0, 0.115, 0.205);
      head.add(mustache3D);

      // Swept White Hair Crown & Back
      const hairDome = this.registerMesh(
        new THREE.Mesh(
          new THREE.SphereGeometry(0.222, 20, 16, Math.PI * 0.82, Math.PI * 1.36, 0, Math.PI * 0.65),
          hairMat
        )
      );
      hairDome.position.set(0, 0.185, -0.015);
      const topWave = this.registerMesh(
        new THREE.Mesh(
          new THREE.SphereGeometry(0.22, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.34),
          hairMat
        )
      );
      topWave.position.set(0, 0.195, -0.005);
      head.add(hairDome, topWave);

      // 3D Gold Rimless Spectacles + Ear Temple Arms
      [-1, 1].forEach((sign) => {
        const frame = new THREE.Mesh(new THREE.TorusGeometry(0.046, 0.005, 8, 18), glassesMat);
        frame.scale.set(1.18, 0.82, 1);
        frame.position.set(sign * 0.072, 0.192, 0.214);
        const lens = new THREE.Mesh(new THREE.CircleGeometry(0.043, 16), lensGlassMat);
        lens.scale.set(1.18, 0.82, 1);
        lens.position.set(sign * 0.072, 0.192, 0.215);
        const templeArm = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.008, 0.19), glassesMat);
        templeArm.position.set(sign * 0.128, 0.195, 0.11);
        head.add(frame, lens, templeArm);
      });
      const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.007, 0.01), glassesMat);
      bridge.position.set(0, 0.196, 0.216);
      head.add(bridge);
    } else if (p.id === 'mamata') {
      // MAMATA BANERJEE: Parted Black Hair Crown, Large Recognizable Back Jura Bun with Blue Ribbon & 3D Spectacles
      const hairBack = this.registerMesh(
        new THREE.Mesh(
          new THREE.SphereGeometry(0.22, 20, 16, Math.PI * 0.8, Math.PI * 1.4, 0, Math.PI * 0.68),
          hairMat
        )
      );
      hairBack.position.set(0, 0.18, -0.015);
      const hairTop = this.registerMesh(
        new THREE.Mesh(
          new THREE.SphereGeometry(0.218, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.34),
          hairMat
        )
      );
      hairTop.position.set(0, 0.19, -0.01);
      head.add(hairBack, hairTop);

      // Iconic Back Jura Bun + Blue Hair Tie Ring
      const bun = this.registerMesh(
        new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), hairMat)
      );
      bun.position.set(0, 0.14, -0.24);
      const bunRibbon = this.registerMesh(
        new THREE.Mesh(new THREE.TorusGeometry(0.092, 0.018, 10, 18), secondaryMat)
      );
      bunRibbon.position.set(0, 0.14, -0.18);
      head.add(bun, bunRibbon);

      // 3D Red Bindi Relief
      const bindi = this.registerMesh(
        new THREE.Mesh(new THREE.SphereGeometry(0.016, 10, 10), vermilionMat)
      );
      bindi.position.set(0, 0.245, 0.208);
      head.add(bindi);

      // 3D Rectangular Spectacles
      [-1, 1].forEach((sign) => {
        const frame = new THREE.Mesh(new THREE.TorusGeometry(0.044, 0.005, 8, 16), darkMat);
        frame.scale.set(1.18, 0.8, 1);
        frame.position.set(sign * 0.072, 0.192, 0.214);
        const templeArm = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.008, 0.19), darkMat);
        templeArm.position.set(sign * 0.125, 0.195, 0.11);
        head.add(frame, templeArm);
      });
    } else if (p.id === 'yogi') {
      // YOGI BABA: Unobscured Recognizable Monk Face, 3D Forehead Tilak, Golden Nath Sampradaya Kundal Earrings & Back Shikha!
      const tilakRelief = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.068, 0.012), sandalwoodMat)
      );
      tilakRelief.position.set(0, 0.26, 0.202);
      tilakRelief.rotation.x = -0.22;
      const tilakBindu = this.registerMesh(
        new THREE.Mesh(new THREE.SphereGeometry(0.015, 10, 10), vermilionMat)
      );
      tilakBindu.position.set(0, 0.252, 0.21);
      head.add(tilakRelief, tilakBindu);

      // Iconic Nath Sampradaya Large Golden Kundal Hoop Earrings in Both Ears!
      [-1, 1].forEach((sign) => {
        const kundal = this.registerMesh(
          new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.01, 10, 18), glassesMat)
        );
        kundal.rotation.y = Math.PI / 2;
        kundal.position.set(sign * 0.215, 0.11, 0.01);
        head.add(kundal);
      });

      // Back Shikha tuft on crown
      const shikha = this.registerMesh(
        new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.085, 8), darkMat)
      );
      shikha.rotation.x = -0.8;
      shikha.position.set(0, 0.32, -0.16);
      head.add(shikha);
    } else if (p.id === 'kejriwal') {
      // ARVIND KEJRIWAL: Sculpted Boat-Shaped White Gandhi Topi with Printed Text, Thick 3D Mustache, Glasses & Maroon Muffler
      const topiGroup = new THREE.Group();

      // Custom canvas texture for the side of the Gandhi Topi ("मैं आम आदमी")
      const topiCanvas = document.createElement('canvas');
      topiCanvas.width = 256;
      topiCanvas.height = 64;
      const tCtx = topiCanvas.getContext('2d')!;
      tCtx.fillStyle = '#ffffff';
      tCtx.fillRect(0, 0, 256, 64);
      tCtx.fillStyle = '#0f172a';
      tCtx.font = '900 28px "Segoe UI", Arial, sans-serif';
      tCtx.textAlign = 'center';
      tCtx.textBaseline = 'middle';
      tCtx.fillText('मैं आम आदमी', 128, 34);
      const topiTex = new THREE.CanvasTexture(topiCanvas);
      const topiSideMat = new THREE.MeshStandardMaterial({ map: topiTex, roughness: 0.35 });

      const topiBase = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.215, 0.11, 0.39), topiSideMat)
      );
      topiBase.position.set(0, 0.345, 0.01);
      const topiPeak = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.062, 0.4), whiteMat)
      );
      topiPeak.position.set(0, 0.405, 0.01);
      const topiBand = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.022, 0.395), darkMat)
      );
      topiBand.position.set(0, 0.302, 0.01);
      topiGroup.add(topiBase, topiPeak, topiBand);
      head.add(topiGroup);

      // Prominent Thick 3D Black Mustache
      const mustache = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.135, 0.036, 0.048), darkMat)
      );
      mustache.position.set(0, 0.105, 0.212);
      head.add(mustache);

      // Black-Rimmed Prescription Spectacles
      [-1, 1].forEach((sign) => {
        const frame = new THREE.Mesh(new THREE.TorusGeometry(0.046, 0.007, 8, 16), darkMat);
        frame.scale.set(1.18, 0.84, 1);
        frame.position.set(sign * 0.072, 0.192, 0.214);
        const templeArm = new THREE.Mesh(new THREE.BoxGeometry(0.007, 0.009, 0.19), darkMat);
        templeArm.position.set(sign * 0.126, 0.195, 0.11);
        head.add(frame, templeArm);
      });

      // Maroon Winter Muffler Wrapped Over Ears & Under Chin
      const earWrap = this.registerMesh(
        new THREE.Mesh(new THREE.TorusGeometry(0.205, 0.034, 10, 20), secondaryMat)
      );
      earWrap.rotation.y = Math.PI / 2;
      earWrap.position.set(0, 0.155, 0);
      head.add(earWrap);
    } else if (p.id === 'rahul') {
      // RAHUL GANDHI: Volumetric Wavy Curly Salt-and-Pepper Hair & Full Bharat Jodo Beard
      const hairBack = this.registerMesh(
        new THREE.Mesh(
          new THREE.SphereGeometry(0.224, 20, 16, Math.PI * 0.8, Math.PI * 1.4, 0, Math.PI * 0.65),
          hairMat
        )
      );
      hairBack.position.set(0, 0.19, -0.015);
      head.add(hairBack);

      const curlOffsets = [
        [-0.09, 0.345, 0.1],
        [-0.03, 0.365, 0.12],
        [0.04, 0.365, 0.12],
        [0.1, 0.345, 0.09],
        [-0.145, 0.295, 0.04],
        [0.145, 0.295, 0.04],
        [0.0, 0.37, 0.02]
      ];
      for (const [cx, cy, cz] of curlOffsets) {
        const curl = this.registerMesh(
          new THREE.Mesh(new THREE.SphereGeometry(0.058, 12, 12), hairMat)
        );
        curl.position.set(cx, cy, cz);
        head.add(curl);
      }

      // 3D Salt-and-Pepper Jaw Beard
      const jawBeard = this.registerMesh(
        new THREE.Mesh(
          new THREE.SphereGeometry(0.204, 18, 14, 0, Math.PI * 2, Math.PI * 0.58, Math.PI * 0.42),
          hairMat
        )
      );
      jawBeard.scale.set(1.02, 1.05, 1.0);
      jawBeard.position.set(0, 0.14, 0.01);
      head.add(jawBeard);
    }

    // ================= ARMS & HANDS =================
    const buildArm = (isLeft: boolean) => {
      const sign = isLeft ? 1 : -1;
      const shoulder = new THREE.Group();
      shoulder.position.set(sign * (chestWidth / 2 + 0.06), 0.31, 0);
      chest.add(shoulder);

      const sleeveMat = p.id === 'kejriwal' || p.id === 'yogi' ? primaryMat : whiteMat;
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
      const jcbYellowMat = this.createMat(0xfacc15, 0.25, 0.7, 0xf59e0b, 0.25);
      const hydraulicArm = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.055, 0.26), darkMat)
      );
      hydraulicArm.position.z = 0.12;

      const loaderBucket = this.registerMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.14, 0.11), jcbYellowMat)
      );
      loaderBucket.position.set(0, 0, 0.26);

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

    this.joints.nameplateSprite.position.y = 2.34 + Math.sin(time * 3.5) * 0.03;

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
