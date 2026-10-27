import { GameSettings } from './types';
import { SceneManager } from './scene/SceneManager';
import { AudioEngine } from './audio/AudioEngine';
import { InputManager } from './systems/InputManager';
import { GameManager } from './systems/GameManager';
import { UIManager } from './ui/UIManager';

const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 85,
  sfxVolume: 90,
  bgmVolume: 55,
  announcerEnabled: true,
  roundsToWin: 2,
  roundTimeSeconds: 60,
  aiDifficulty: 'medium',
  graphicsQuality: 'high',
  showFrameData: true
};

function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem('lok_sabha_tekken_settings');
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // Fallback to defaults
  }
  return { ...DEFAULT_SETTINGS };
}

function bootstrap(): void {
  const container = document.getElementById('webgl-container');
  if (!container) {
    throw new Error('Missing #webgl-container element');
  }

  const settings = loadSettings();
  const sceneMgr = new SceneManager(container);
  sceneMgr.setGraphicsQuality(settings.graphicsQuality);

  const audio = new AudioEngine(settings);
  const inputMgr = new InputManager();

  let uiMgr!: UIManager;

  const gameMgr = new GameManager(sceneMgr, audio, inputMgr, settings, {
    onHudUpdate: () => uiMgr?.updateHUD(),
    onAnnounceBanner: (title, sub, color, dur) => uiMgr?.showAnnounceBanner(title, sub, color, dur),
    onCalloutBubble: (playerIdx, text, sub) => uiMgr?.showCalloutBubble(playerIdx, text, sub),
    onMatchEnd: (winnerIdx, isArcadeComplete) => uiMgr?.showMatchEndScreen(winnerIdx, isArcadeComplete)
  });

  uiMgr = new UIManager(gameMgr);

  // Sync modal-pause close event (e.g. when dismissed via Esc or clicking backdrop) with game pause state
  const pauseModal = document.getElementById('modal-pause') as HTMLDialogElement | null;
  pauseModal?.addEventListener('close', () => {
    gameMgr.isPaused = false;
  });

  let lastTime = performance.now();
  function animate(now: number): void {
    const dt = (now - lastTime) / 1000;
    lastTime = now;
    gameMgr.update(dt);
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

bootstrap();
