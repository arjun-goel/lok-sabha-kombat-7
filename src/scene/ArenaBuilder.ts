import * as THREE from 'three';
import { StageId } from '../types';
import { STAGES } from '../data/fighters';

export class ArenaBuilder {
  private scene: THREE.Scene;
  private stageGroup: THREE.Group;
  private animatedObjects: { mesh: THREE.Object3D; speed: number; type: 'spin' | 'bob' | 'pulse'; baseY: number }[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.stageGroup = new THREE.Group();
    this.scene.add(this.stageGroup);
  }

  public buildStage(stageId: StageId): void {
    // Clear existing stage
    while (this.stageGroup.children.length > 0) {
      const child = this.stageGroup.children[0];
      this.stageGroup.remove(child);
    }
    this.animatedObjects = [];

    const meta = STAGES.find((s) => s.id === stageId) || STAGES[0];
    this.scene.background = new THREE.Color(meta.fogHex);
    this.scene.fog = new THREE.FogExp2(meta.fogHex, 0.025);

    if (stageId === 'sansad') {
      this.buildSansadArena();
    } else if (stageId === 'howrah') {
      this.buildHowrahArena();
    } else {
      this.buildPrimeTimeStudio();
    }
  }

  private buildSansadArena(): void {
    // Red Sandstone Octagonal Akhada Floor with Glowing Ashoka Chakra / Lotus Ring
    const floorGeo = new THREE.CylinderGeometry(11.5, 12.2, 0.8, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x7c2d12,
      roughness: 0.45,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.4;
    floor.receiveShadow = true;
    this.stageGroup.add(floor);

    // Glowing Gold & Saffron Ring Borders
    const innerRing = new THREE.Mesh(
      new THREE.RingGeometry(6.8, 7.1, 48),
      new THREE.MeshBasicMaterial({ color: 0xff8800, side: THREE.DoubleSide })
    );
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.015;
    this.stageGroup.add(innerRing);

    const centerEmblem = new THREE.Mesh(
      new THREE.RingGeometry(1.4, 1.75, 24),
      new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide })
    );
    centerEmblem.rotation.x = -Math.PI / 2;
    centerEmblem.position.y = 0.015;
    this.stageGroup.add(centerEmblem);

    // Grand Red Sandstone Pillars & Central Parliament Dome in Background
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.5, metalness: 0.15 });
    const creamMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.4, metalness: 0.2 });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0xff6b00,
      emissiveIntensity: 0.35
    });

    for (let i = -5; i <= 5; i++) {
      const angle = (i / 11) * Math.PI * 0.85;
      const px = Math.sin(angle) * 11.2;
      const pz = -Math.cos(angle) * 9.5 - 2.2;

      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.52, 6.5, 14), creamMat);
      pillar.position.set(px, 3.25, pz);
      pillar.castShadow = true;
      this.stageGroup.add(pillar);

      // Glowing Saffron Brazier Torch on top of each colonnade pillar
      const torch = new THREE.Mesh(new THREE.OctahedronGeometry(0.35, 0), goldMat);
      torch.position.set(px, 6.8, pz);
      this.stageGroup.add(torch);
      this.animatedObjects.push({ mesh: torch, speed: 2.5 + Math.abs(i) * 0.3, type: 'spin', baseY: 6.8 });
    }

    // Central Grand Sansad Dome
    const domeBase = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 6.0, 4.2, 24), pillarMat);
    domeBase.position.set(0, 2.1, -13.5);
    this.stageGroup.add(domeBase);

    const domeCap = new THREE.Mesh(
      new THREE.SphereGeometry(5.2, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
      creamMat
    );
    domeCap.position.set(0, 4.2, -13.5);
    this.stageGroup.add(domeCap);

    // Tricolor Spotlights in the sky
    const colors = [0xff6b00, 0xffffff, 0x10b981];
    colors.forEach((col, idx) => {
      const beam = new THREE.Mesh(
        new THREE.ConeGeometry(1.8, 16, 16, 1, true),
        new THREE.MeshBasicMaterial({
          color: col,
          transparent: true,
          opacity: 0.11,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      beam.position.set((idx - 1) * 6.5, 7.5, -10.5);
      beam.rotation.z = (idx - 1) * -0.18;
      this.stageGroup.add(beam);
    });
  }

  private buildHowrahArena(): void {
    // Hooghly Riverfront Pier Deck
    const deck = new THREE.Mesh(
      new THREE.CylinderGeometry(11.5, 12.0, 0.8, 32),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.45 })
    );
    deck.position.y = -0.4;
    deck.receiveShadow = true;
    this.stageGroup.add(deck);

    // Bengal Blue & White Neon Ring Border ("Khela Hobe Arena")
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(6.8, 7.15, 48),
      new THREE.MeshBasicMaterial({ color: 0x00e5ff, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.015;
    this.stageGroup.add(ring);

    // Giant Iconic Howrah Cantilever Steel Bridge Trusses in Background!
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.3,
      metalness: 0.75,
      emissive: 0x0284c7,
      emissiveIntensity: 0.22
    });

    // Left & Right Bridge Towers
    [-8.5, 8.5].forEach((tx) => {
      const tower = new THREE.Mesh(new THREE.BoxGeometry(1.4, 13, 1.4), steelMat);
      tower.position.set(tx, 6.2, -10.5);
      this.stageGroup.add(tower);
    });

    // Bridge Arch Truss Beams
    for (let i = -8; i <= 8; i++) {
      const x = i * 1.1;
      const archHeight = 5.5 + Math.cos((i / 8) * (Math.PI / 2)) * 4.8;
      const strut = new THREE.Mesh(new THREE.BoxGeometry(0.26, archHeight, 0.26), steelMat);
      strut.position.set(x, archHeight / 2 + 1.5, -10.5);
      this.stageGroup.add(strut);
    }

    // Classic Yellow Kolkata Ambassador Taxis on the side of the pier!
    const yellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3, metalness: 0.3 });
    [-6.2, 6.2].forEach((tx, idx) => {
      const taxiGroup = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.65, 1.1), yellowMat);
      body.position.y = 0.45;
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.52, 0.98), yellowMat);
      cabin.position.set(0, 0.95, 0);
      taxiGroup.add(body, cabin);
      taxiGroup.position.set(tx, 0, -4.8);
      taxiGroup.rotation.y = idx === 0 ? 0.45 : -0.45;
      this.stageGroup.add(taxiGroup);
    });

    // Floating Giant Footballs ("KHELA HOBE!")
    const ballMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      emissive: 0x00e5ff,
      emissiveIntensity: 0.3
    });
    [-4.5, 4.5].forEach((bx, idx) => {
      const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(0.65, 1), ballMat);
      ball.position.set(bx, 2.2, -5.8);
      this.stageGroup.add(ball);
      this.animatedObjects.push({ mesh: ball, speed: 2.2 + idx, type: 'bob', baseY: 2.2 });
    });
  }

  private buildPrimeTimeStudio(): void {
    // Glossy 9 PM Breaking News Debate Studio Stage!
    const floor = new THREE.Mesh(
      new THREE.CylinderGeometry(11.5, 12.0, 0.8, 32),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.15, metalness: 0.65 })
    );
    floor.position.y = -0.4;
    floor.receiveShadow = true;
    this.stageGroup.add(floor);

    // Glowing Crimson "BREAKING NEWS" Neon Ring
    const redRing = new THREE.Mesh(
      new THREE.RingGeometry(6.8, 7.2, 48),
      new THREE.MeshBasicMaterial({ color: 0xff003c, side: THREE.DoubleSide })
    );
    redRing.rotation.x = -Math.PI / 2;
    redRing.position.y = 0.015;
    this.stageGroup.add(redRing);

    // Curved LED Studio Video Wall Panels in Background
    const redGlowMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      emissive: 0xff003c,
      emissiveIntensity: 0.6,
      roughness: 0.2
    });
    const cyanGlowMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x00e5ff,
      emissiveIntensity: 0.5,
      roughness: 0.2
    });

    for (let i = -4; i <= 4; i++) {
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(2.1, 4.2, 0.25),
        i % 2 === 0 ? redGlowMat : cyanGlowMat
      );
      const angle = i * 0.22;
      panel.position.set(Math.sin(angle) * 10.5, 2.6, -Math.cos(angle) * 8.5 - 2.0);
      panel.rotation.y = -angle;
      this.stageGroup.add(panel);
      this.animatedObjects.push({ mesh: panel, speed: 2 + Math.abs(i) * 0.4, type: 'pulse', baseY: 2.6 });
    }
  }

  public update(time: number): void {
    for (const item of this.animatedObjects) {
      if (item.type === 'spin') {
        item.mesh.rotation.y = time * item.speed;
        item.mesh.position.y = item.baseY + Math.sin(time * item.speed) * 0.15;
      } else if (item.type === 'bob') {
        item.mesh.rotation.x = time * item.speed;
        item.mesh.rotation.z = time * item.speed * 0.7;
        item.mesh.position.y = item.baseY + Math.abs(Math.sin(time * item.speed)) * 0.85;
      } else if (item.type === 'pulse') {
        item.mesh.position.y = item.baseY + Math.sin(time * item.speed) * 0.12;
      }
    }
  }
}
