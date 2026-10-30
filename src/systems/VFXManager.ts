import * as THREE from 'three';

interface SparkParticle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

interface ShockwaveRing {
  mesh: THREE.Mesh;
  life: number;
  maxLife: number;
  maxScale: number;
  velocity?: THREE.Vector3;
}

export class VFXManager {
  private scene: THREE.Scene;
  private particles: SparkParticle[] = [];
  private rings: ShockwaveRing[] = [];
  private lightningLines: { line: THREE.Line; life: number }[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public spawnHitSparks(
    position: THREE.Vector3,
    colorHex: number,
    intensity: 'light' | 'medium' | 'heavy' | 'electric' | 'rage' | 'block'
  ): void {
    const count =
      intensity === 'rage' ? 42 : intensity === 'electric' ? 30 : intensity === 'heavy' ? 22 : intensity === 'medium' ? 14 : 9;

    const sparkGeo = new THREE.OctahedronGeometry(intensity === 'rage' ? 0.08 : 0.055, 0);
    for (let i = 0; i < count; i++) {
      const isCore = i % 3 === 0;
      const mat = new THREE.MeshBasicMaterial({
        color: isCore ? 0xffffff : colorHex,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const mesh = new THREE.Mesh(sparkGeo, mat);
      mesh.position.copy(position);

      const speed = (intensity === 'rage' || intensity === 'electric' ? 7.5 : 4.8) * (0.4 + Math.random() * 0.9);
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.35) * Math.PI;

      const velocity = new THREE.Vector3(
        Math.cos(theta) * Math.cos(phi) * speed,
        Math.sin(phi) * speed + 1.8,
        Math.sin(theta) * Math.cos(phi) * speed
      );

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        velocity,
        life: 0,
        maxLife: 0.22 + Math.random() * 0.22
      });
    }

    // Expanding shockwave ring on medium/heavy/electric/rage/block
    if (intensity !== 'light') {
      const ringGeo = new THREE.RingGeometry(0.15, 0.28, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: intensity === 'block' ? 0x38bdf8 : colorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(position);
      ringMesh.rotation.y = Math.random() * 0.5;
      this.scene.add(ringMesh);

      this.rings.push({
        mesh: ringMesh,
        life: 0,
        maxLife: intensity === 'rage' ? 0.42 : 0.26,
        maxScale: intensity === 'rage' ? 6.5 : intensity === 'electric' ? 4.8 : 3.2
      });
    }

    // Jagged 3D Tekken Lightning Bolts on Electric / Heavy / Rage hits!
    if (intensity === 'electric' || intensity === 'rage' || intensity === 'heavy') {
      const boltCount = intensity === 'rage' ? 6 : 3;
      for (let b = 0; b < boltCount; b++) {
        const pts: THREE.Vector3[] = [position.clone()];
        const curr = position.clone();
        for (let seg = 0; seg < 6; seg++) {
          curr.x += (Math.random() - 0.5) * 0.95;
          curr.y += (Math.random() - 0.3) * 0.95;
          curr.z += (Math.random() - 0.5) * 0.95;
          pts.push(curr.clone());
        }
        const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
        const lineMat = new THREE.LineBasicMaterial({
          color: b % 2 === 0 ? 0xffffff : colorHex,
          transparent: true,
          opacity: 1
        });
        const line = new THREE.Line(lineGeo, lineMat);
        this.scene.add(line);
        this.lightningLines.push({ line, life: 0.16 });
      }
    }
  }

  /**
   * Spawns dramatic 3D Signature Special Move VFX (e.g., Modi's "56-Inch Mann Ki Baat Lotus Blast"!)
   */
  public spawnSignatureSpecialVFX(
    position: THREE.Vector3,
    facingSign: 1 | -1,
    fighterId: string,
    colorHex: number
  ): void {
    const isModi = fighterId === 'modi';
    const primaryColor = isModi ? 0xff7700 : colorHex;
    const accentColor = isModi ? 0xfde047 : 0xffffff;

    // 1. Expanding Ground Lotus Mandala / Aura Rings
    for (let i = 0; i < 3; i++) {
      const segments = isModi ? 8 : 24; // 8-petal octagonal Lotus geometry for Modi!
      const ringGeo = new THREE.RingGeometry(0.22 + i * 0.08, 0.42 + i * 0.1, segments);
      const ringMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? primaryColor : accentColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.rotation.z = (i * Math.PI) / 8;
      ringMesh.position.set(position.x, 0.05 + i * 0.03, position.z);
      this.scene.add(ringMesh);

      this.rings.push({
        mesh: ringMesh,
        life: 0,
        maxLife: 0.5 + i * 0.1,
        maxScale: 4.5 + i * 1.2
      });
    }

    // 2. Forward-Traveling "Mann Ki Baat" Sonic Blast Rings!
    for (let w = 0; w < 4; w++) {
      const sonicGeo = new THREE.RingGeometry(0.18, 0.34, isModi ? 8 : 20);
      const sonicMat = new THREE.MeshBasicMaterial({
        color: w % 2 === 0 ? accentColor : primaryColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const sonicMesh = new THREE.Mesh(sonicGeo, sonicMat);
      sonicMesh.rotation.y = Math.PI / 2;
      sonicMesh.position.set(
        position.x + facingSign * (0.45 + w * 0.28),
        position.y + 1.25,
        position.z
      );
      this.scene.add(sonicMesh);

      this.rings.push({
        mesh: sonicMesh,
        life: 0,
        maxLife: 0.42,
        maxScale: 3.8 + w * 0.6,
        velocity: new THREE.Vector3(facingSign * (4.2 + w * 0.8), 0, 0)
      });
    }

    // 3. Burst of Swirling Saffron Lotus Petals & Golden Energy Sparks
    const centerPos = new THREE.Vector3(position.x + facingSign * 0.6, position.y + 1.25, position.z);
    this.spawnHitSparks(centerPos, primaryColor, 'rage');
  }

  public spawnGroundDust(x: number, z: number, colorHex = 0xe2e8f0): void {
    const ringGeo = new THREE.RingGeometry(0.2, 0.55, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
      depthWrite: false
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.set(x, 0.04, z);
    this.scene.add(ringMesh);

    this.rings.push({
      mesh: ringMesh,
      life: 0,
      maxLife: 0.34,
      maxScale: 3.4
    });
  }

  public update(dt: number): void {
    // Update spark particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.scene.remove(p.mesh);
        (p.mesh.material as THREE.Material).dispose();
        this.particles.splice(i, 1);
        continue;
      }
      p.velocity.y -= 14.0 * dt;
      p.mesh.position.addScaledVector(p.velocity, dt);
      p.mesh.rotation.x += dt * 12;
      p.mesh.rotation.y += dt * 12;
      const ratio = 1 - p.life / p.maxLife;
      p.mesh.scale.setScalar(ratio);
      (p.mesh.material as THREE.MeshBasicMaterial).opacity = ratio;
    }

    // Update shockwave rings
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.life += dt;
      if (r.life >= r.maxLife) {
        this.scene.remove(r.mesh);
        r.mesh.geometry.dispose();
        (r.mesh.material as THREE.Material).dispose();
        this.rings.splice(i, 1);
        continue;
      }
      if (r.velocity) {
        r.mesh.position.addScaledVector(r.velocity, dt);
      }
      const progress = r.life / r.maxLife;
      const s = THREE.MathUtils.lerp(1, r.maxScale, progress);
      r.mesh.scale.setScalar(s);
      (r.mesh.material as THREE.MeshBasicMaterial).opacity = 1 - progress;
    }

    // Update lightning bolts
    for (let i = this.lightningLines.length - 1; i >= 0; i--) {
      const item = this.lightningLines[i];
      item.life -= dt;
      if (item.life <= 0) {
        this.scene.remove(item.line);
        item.line.geometry.dispose();
        (item.line.material as THREE.Material).dispose();
        this.lightningLines.splice(i, 1);
      } else {
        (item.line.material as THREE.LineBasicMaterial).opacity = item.life / 0.16;
      }
    }
  }
}
