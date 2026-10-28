import * as THREE from 'three';
import { StageId } from '../types';
import { ArenaBuilder } from './ArenaBuilder';

export class SceneManager {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public arenaBuilder: ArenaBuilder;

  private shakeIntensity = 0;
  private shakeTimer = 0;
  private targetCameraPos = new THREE.Vector3(0, 2.3, 6.2);
  private targetLookAt = new THREE.Vector3(0, 1.35, 0);
  private currentLookAt = new THREE.Vector3(0, 1.35, 0);
  private zoomBoost = 0;

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 120);
    this.camera.position.set(0, 2.3, 6.2);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;

    container.appendChild(this.renderer.domElement);

    this.setupLighting();
    this.arenaBuilder = new ArenaBuilder(this.scene);
    this.arenaBuilder.buildStage('sansad');

    window.addEventListener('resize', () => this.onResize());
  }

  private setupLighting(): void {
    const hemi = new THREE.HemisphereLight(0xfff7ed, 0x1e293b, 1.15);
    this.scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfff1e6, 2.2);
    keyLight.position.set(5, 11, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 30;
    const d = 8.5;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    this.scene.add(keyLight);

    // Dramatic Tekken Rim Lights (Saffron Left Rim + Bengal Cyan Right Rim)
    const leftRim = new THREE.PointLight(0xff7700, 4.5, 16);
    leftRim.position.set(-6, 3.8, -2.5);
    this.scene.add(leftRim);

    const rightRim = new THREE.PointLight(0x00e5ff, 4.5, 16);
    rightRim.position.set(6, 3.8, -2.5);
    this.scene.add(rightRim);
  }

  public setGraphicsQuality(quality: 'high' | 'medium'): void {
    this.renderer.setPixelRatio(quality === 'high' ? Math.min(window.devicePixelRatio, 2) : 1);
    this.renderer.shadowMap.enabled = quality === 'high';
  }

  public loadStage(stageId: StageId): void {
    this.arenaBuilder.buildStage(stageId);
  }

  public triggerCameraShake(intensity: number, durationSeconds = 0.22): void {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    this.shakeTimer = Math.max(this.shakeTimer, durationSeconds);
  }

  public triggerDramaticZoom(amount = 1.45): void {
    this.zoomBoost = amount;
  }

  public updateCamera(p1Pos: THREE.Vector3, p2Pos: THREE.Vector3, dt: number, time: number, isMenuMode: boolean): void {
    this.arenaBuilder.update(time);

    if (isMenuMode) {
      // Showcase cinematic orbit around the fighters on the main menu!
      const aspect = window.innerWidth / Math.max(1, window.innerHeight);
      const portraitPullback = aspect < 1.0 ? (1.0 - aspect) * 4.5 : 0;
      const orbitAngle = Math.sin(time * 0.35) * 0.32;
      this.targetCameraPos.set(Math.sin(orbitAngle) * 5.4, 2.05, Math.cos(orbitAngle) * 5.2 + portraitPullback);
      this.targetLookAt.set(0, 1.32, 0);
    } else {
      const midX = (p1Pos.x + p2Pos.x) * 0.5;
      const midY = Math.max(1.25, (p1Pos.y + p2Pos.y) * 0.5 + 1.22);
      const dist = Math.abs(p1Pos.x - p2Pos.x);

      // Automatically widen Z distance on narrow mobile/portrait screens so neither fighter goes off-screen
      const aspect = window.innerWidth / Math.max(1, window.innerHeight);
      const aspectMultiplier = aspect < 1.35 ? 1.35 / Math.max(0.48, aspect) : 1.0;

      this.zoomBoost = THREE.MathUtils.lerp(this.zoomBoost, 0, dt * 4.5);
      const baseZ = THREE.MathUtils.clamp(3.8 + dist * 0.62 - this.zoomBoost, 3.1, 7.6);
      const desiredZ = THREE.MathUtils.clamp(baseZ * aspectMultiplier, 3.1, 13.5);

      this.targetCameraPos.set(midX, midY + 0.55, desiredZ);
      this.targetLookAt.set(midX, midY - (aspect < 1.0 ? 0.25 : 0), 0);
    }

    this.camera.position.lerp(this.targetCameraPos, Math.min(1, dt * 8.5));
    this.currentLookAt.lerp(this.targetLookAt, Math.min(1, dt * 10.0));

    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      const ox = (Math.random() - 0.5) * this.shakeIntensity;
      const oy = (Math.random() - 0.5) * this.shakeIntensity;
      this.camera.position.x += ox;
      this.camera.position.y += oy;
      if (this.shakeTimer <= 0) {
        this.shakeIntensity = 0;
      }
    }

    this.camera.lookAt(this.currentLookAt);
  }

  public render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  private onResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
