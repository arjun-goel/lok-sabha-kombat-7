import { AIDifficulty, DummyBehavior, FighterId, GameMode, GameSettings, StageId } from '../types';
import { createMovelistForFighter, FIGHTER_PROFILES, STAGES } from '../data/fighters';
import { GameManager } from '../systems/GameManager';

export class UIManager {
  private game: GameManager;
  private selectedMode: GameMode = 'versus_cpu';
  private selectedP1: FighterId = 'modi';
  private selectedP2: FighterId = 'mamata';
  private selectedStage: StageId = 'sansad';

  private bannerTimeout: number | null = null;
  private p1BubbleTimeout: number | null = null;
  private p2BubbleTimeout: number | null = null;

  constructor(game: GameManager) {
    this.game = game;
    this.setupDialogFallbacks();
    this.bindMenuEvents();
    this.renderRosterSelection();
    this.renderStageSelection();
    this.renderMovelistModal('modi');
    this.syncSettingsControls();
  }

  private setupDialogFallbacks(): void {
    // Follow modern-web-guidance `light-dismiss-a-dialog`:
    // Use <dialog closedby="any"> opened via showModal() + mandatory backdrop click fallback
    const dialogs = document.querySelectorAll<HTMLDialogElement>('dialog[closedby="any"]');
    dialogs.forEach((dialog) => {
      if (!('closedBy' in HTMLDialogElement.prototype)) {
        dialog.addEventListener('click', (event) => {
          if (event.target !== dialog) return;
          const rect = dialog.getBoundingClientRect();
          const isDialogContent =
            rect.top <= event.clientY &&
            event.clientY <= rect.top + rect.height &&
            rect.left <= event.clientX &&
            event.clientX <= rect.left + rect.width;
          if (isDialogContent) return;
          dialog.close();
        });
      }
    });

    // Global Esc key handler to toggle Pause Menu during active match
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' && !this.game.isInMenu && this.game.roundPhase !== 'MATCH_OVER') {
        const movelistModal = document.getElementById('modal-movelist') as HTMLDialogElement | null;
        const settingsModal = document.getElementById('modal-settings') as HTMLDialogElement | null;
        if (movelistModal?.open || settingsModal?.open) {
          return;
        }
        e.preventDefault();
        this.togglePauseMenu();
      }
    });
  }

  private bindMenuEvents(): void {
    // Mode Buttons on Main Menu
    document.querySelectorAll<HTMLButtonElement>('[data-mode-btn]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.game.audio.playUIClick(680);
        const mode = btn.dataset.modeBtn as GameMode;
        this.selectedMode = mode;
        this.showCharacterSelectScreen();
      });
    });

    // Quick Instant Match: MODI vs MAMATA!
    document.getElementById('btn-instant-khela')?.addEventListener('click', () => {
      this.game.audio.playUIClick(840);
      this.selectedMode = 'versus_cpu';
      this.selectedP1 = 'modi';
      this.selectedP2 = 'mamata';
      this.selectedStage = 'sansad';
      this.launchMatch();
    });

    // Open Move List / Controls Modal
    document.querySelectorAll('[data-open-movelist]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.game.audio.playUIClick(640);
        const targetFighter = this.game.isInMenu ? this.selectedP1 : this.game.p1.id;
        this.renderMovelistModal(targetFighter);
        const modal = document.getElementById('modal-movelist') as HTMLDialogElement | null;
        if (modal && !modal.open) {
          modal.showModal();
        }
      });
    });

    // Open Settings Modal
    document.querySelectorAll('[data-open-settings]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.game.audio.playUIClick(640);
        this.syncSettingsControls();
        const modal = document.getElementById('modal-settings') as HTMLDialogElement | null;
        if (modal && !modal.open) {
          modal.showModal();
        }
      });
    });

    // Close Modal Buttons
    document.querySelectorAll<HTMLButtonElement>('[data-close-dialog]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.game.audio.playUIClick(520);
        const dialogId = btn.dataset.closeDialog!;
        const dialog = document.getElementById(dialogId) as HTMLDialogElement | null;
        dialog?.close();
      });
    });

    // Character Select Back & Start Fight buttons
    document.getElementById('btn-back-to-main')?.addEventListener('click', () => {
      this.game.audio.playUIClick(500);
      this.showMainMenuScreen();
    });

    document.getElementById('btn-start-battle')?.addEventListener('click', () => {
      this.game.audio.playUIClick(880);
      this.launchMatch();
    });

    // HUD Pause & Move List buttons
    document.getElementById('btn-hud-pause')?.addEventListener('click', () => {
      this.game.audio.playUIClick(600);
      this.togglePauseMenu(true);
    });

    // Practice Dummy Behavior Selector
    const dummySelect = document.getElementById('select-dummy-behavior') as HTMLSelectElement | null;
    dummySelect?.addEventListener('change', () => {
      this.game.dummyBehavior = dummySelect.value as DummyBehavior;
      this.game.audio.playUIClick(650);
    });

    // Pause Menu Buttons
    document.getElementById('btn-pause-resume')?.addEventListener('click', () => {
      this.game.audio.playUIClick(700);
      this.togglePauseMenu(false);
    });

    document.getElementById('btn-pause-restart')?.addEventListener('click', () => {
      this.game.audio.playUIClick(740);
      this.togglePauseMenu(false);
      this.game.restartCurrentMatch();
    });

    document.getElementById('btn-pause-charselect')?.addEventListener('click', () => {
      this.game.audio.playUIClick(560);
      this.togglePauseMenu(false);
      this.game.returnToMenu();
      this.showCharacterSelectScreen();
    });

    document.getElementById('btn-pause-mainmenu')?.addEventListener('click', () => {
      this.game.audio.playUIClick(520);
      this.togglePauseMenu(false);
      this.game.returnToMenu();
      this.showMainMenuScreen();
    });

    // Match Over Screen Buttons
    document.getElementById('btn-gameover-rematch')?.addEventListener('click', () => {
      this.game.audio.playUIClick(820);
      document.getElementById('screen-gameover')?.classList.add('hidden');
      if (this.game.mode === 'arcade' && this.game.p1RoundsWon >= this.game.settings.roundsToWin) {
        const nextBtn = document.getElementById('btn-gameover-rematch');
        if (nextBtn?.dataset.arcadeAction === 'next') {
          this.game.advanceArcadeStage();
          return;
        }
      }
      this.game.arcadeStageIndex = 0;
      this.game.restartCurrentMatch();
    });

    document.getElementById('btn-gameover-charselect')?.addEventListener('click', () => {
      this.game.audio.playUIClick(600);
      document.getElementById('screen-gameover')?.classList.add('hidden');
      this.game.returnToMenu();
      this.showCharacterSelectScreen();
    });

    document.getElementById('btn-gameover-mainmenu')?.addEventListener('click', () => {
      this.game.audio.playUIClick(540);
      document.getElementById('screen-gameover')?.classList.add('hidden');
      this.game.returnToMenu();
      this.showMainMenuScreen();
    });

    // Virtual On-Screen Arcade Controls (for Mouse / Touch / Quick Click Testing)
    document.querySelectorAll<HTMLElement>('[data-vbtn]').forEach((btn) => {
      const code = btn.dataset.vbtn!;
      const press = (e: Event) => {
        e.preventDefault();
        this.game.inputMgr.setVirtualButton(code, true);
        btn.classList.add('active-press');
      };
      const release = (e: Event) => {
        e.preventDefault();
        this.game.inputMgr.setVirtualButton(code, false);
        btn.classList.remove('active-press');
      };
      btn.addEventListener('pointerdown', press);
      btn.addEventListener('pointerup', release);
      btn.addEventListener('pointerleave', release);
      btn.addEventListener('pointercancel', release);
    });

    // Settings Form Controls
    this.bindSettingsInputs();
  }

  private bindSettingsInputs(): void {
    const masterSlider = document.getElementById('setting-master-vol') as HTMLInputElement | null;
    const sfxSlider = document.getElementById('setting-sfx-vol') as HTMLInputElement | null;
    const bgmSlider = document.getElementById('setting-bgm-vol') as HTMLInputElement | null;
    const announcerCheck = document.getElementById('setting-announcer') as HTMLInputElement | null;
    const roundsSelect = document.getElementById('setting-rounds') as HTMLSelectElement | null;
    const timerSelect = document.getElementById('setting-timer') as HTMLSelectElement | null;
    const diffSelect = document.getElementById('setting-difficulty') as HTMLSelectElement | null;
    const qualitySelect = document.getElementById('setting-quality') as HTMLSelectElement | null;

    const applyAndSave = () => {
      const s = this.game.settings;
      if (masterSlider) s.masterVolume = Number(masterSlider.value);
      if (sfxSlider) s.sfxVolume = Number(sfxSlider.value);
      if (bgmSlider) s.bgmVolume = Number(bgmSlider.value);
      if (announcerCheck) s.announcerEnabled = announcerCheck.checked;
      if (roundsSelect) s.roundsToWin = Number(roundsSelect.value);
      if (timerSelect) s.roundTimeSeconds = Number(timerSelect.value);
      if (diffSelect) s.aiDifficulty = diffSelect.value as AIDifficulty;
      if (qualitySelect) s.graphicsQuality = qualitySelect.value as 'high' | 'medium';

      const masterValEl = document.getElementById('val-master-vol');
      if (masterValEl) masterValEl.textContent = `${s.masterVolume}%`;
      const sfxValEl = document.getElementById('val-sfx-vol');
      if (sfxValEl) sfxValEl.textContent = `${s.sfxVolume}%`;
      const bgmValEl = document.getElementById('val-bgm-vol');
      if (bgmValEl) bgmValEl.textContent = `${s.bgmVolume}%`;

      this.game.audio.updateSettings(s);
      this.game.sceneMgr.setGraphicsQuality(s.graphicsQuality);
      try {
        localStorage.setItem('lok_sabha_tekken_settings', JSON.stringify(s));
      } catch {
        // Ignore storage quota errors
      }
    };

    [masterSlider, sfxSlider, bgmSlider, announcerCheck, roundsSelect, timerSelect, diffSelect, qualitySelect].forEach(
      (el) => {
        el?.addEventListener('input', applyAndSave);
        el?.addEventListener('change', applyAndSave);
      }
    );
  }

  private syncSettingsControls(): void {
    const s = this.game.settings;
    const setVal = (id: string, val: string) => {
      const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
      if (el) el.value = val;
    };
    setVal('setting-master-vol', String(s.masterVolume));
    setVal('setting-sfx-vol', String(s.sfxVolume));
    setVal('setting-bgm-vol', String(s.bgmVolume));
    setVal('setting-rounds', String(s.roundsToWin));
    setVal('setting-timer', String(s.roundTimeSeconds));
    setVal('setting-difficulty', s.aiDifficulty);
    setVal('setting-quality', s.graphicsQuality);

    const announcerCheck = document.getElementById('setting-announcer') as HTMLInputElement | null;
    if (announcerCheck) announcerCheck.checked = s.announcerEnabled;

    const masterValEl = document.getElementById('val-master-vol');
    if (masterValEl) masterValEl.textContent = `${s.masterVolume}%`;
    const sfxValEl = document.getElementById('val-sfx-vol');
    if (sfxValEl) sfxValEl.textContent = `${s.sfxVolume}%`;
    const bgmValEl = document.getElementById('val-bgm-vol');
    if (bgmValEl) bgmValEl.textContent = `${s.bgmVolume}%`;
  }

  private renderRosterSelection(): void {
    const p1Container = document.getElementById('roster-p1-cards');
    const p2Container = document.getElementById('roster-p2-cards');
    if (!p1Container || !p2Container) return;

    const fighterIds: FighterId[] = ['modi', 'mamata', 'kejriwal', 'rahul'];

    const buildCards = (playerNum: 1 | 2, container: HTMLElement) => {
      container.innerHTML = '';
      fighterIds.forEach((id) => {
        const prof = FIGHTER_PROFILES[id];
        const isSelected = (playerNum === 1 ? this.selectedP1 : this.selectedP2) === id;
        const card = document.createElement('button');
        card.type = 'button';
        card.className = `fighter-card ${isSelected ? 'selected' : ''}`;
        card.style.setProperty('--fighter-accent', prof.colors.uiHex);
        card.innerHTML = `
          <div class="fighter-card-badge" style="background:${prof.colors.uiHex}">${prof.shortName}</div>
          <div class="fighter-card-name">${prof.name}</div>
          <div class="fighter-card-title">${prof.title}</div>
          <div class="fighter-card-style">${prof.fightingStyle}</div>
          <div class="fighter-stats-row">
            <span>PWR ${prof.stats.power}</span>
            <span>SPD ${prof.stats.speed}</span>
            <span>DRAMA ${prof.stats.drama}</span>
          </div>
          <p class="fighter-card-desc">${prof.description}</p>
        `;
        card.addEventListener('click', () => {
          this.game.audio.playUIClick(720);
          if (playerNum === 1) {
            this.selectedP1 = id;
          } else {
            this.selectedP2 = id;
          }
          this.game.spawnFighters(this.selectedP1, this.selectedP2);
          this.game.audio.speakAnnouncer(prof.name, prof.voicePitch, prof.voiceRate);
          this.renderRosterSelection();
        });
        container.appendChild(card);
      });
    };

    buildCards(1, p1Container);
    buildCards(2, p2Container);
  }

  private renderStageSelection(): void {
    const container = document.getElementById('stage-select-cards');
    if (!container) return;
    container.innerHTML = '';

    STAGES.forEach((stage) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `stage-card ${this.selectedStage === stage.id ? 'selected' : ''}`;
      btn.style.setProperty('--stage-accent', stage.accentColor);
      btn.innerHTML = `
        <div class="stage-name">${stage.name}</div>
        <div class="stage-sub">${stage.subtitle}</div>
      `;
      btn.addEventListener('click', () => {
        this.game.audio.playUIClick(660);
        this.selectedStage = stage.id;
        this.game.sceneMgr.loadStage(stage.id);
        this.renderStageSelection();
      });
      container.appendChild(btn);
    });
  }

  public renderMovelistModal(fighterId: FighterId): void {
    const tabsContainer = document.getElementById('movelist-fighter-tabs');
    const listContainer = document.getElementById('movelist-table-body');
    if (!tabsContainer || !listContainer) return;

    const fighterIds: FighterId[] = ['modi', 'mamata', 'kejriwal', 'rahul'];
    tabsContainer.innerHTML = '';
    fighterIds.forEach((id) => {
      const prof = FIGHTER_PROFILES[id];
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = `movelist-tab ${id === fighterId ? 'active' : ''}`;
      tab.style.setProperty('--tab-color', prof.colors.uiHex);
      tab.textContent = prof.shortName;
      tab.addEventListener('click', () => {
        this.game.audio.playUIClick(640);
        this.renderMovelistModal(id);
      });
      tabsContainer.appendChild(tab);
    });

    const moves = Object.values(createMovelistForFighter(fighterId));
    listContainer.innerHTML = moves
      .map(
        (m) => `
      <tr>
        <td>
          <div class="move-row-name">${m.name}</div>
          ${m.battleCry ? `<div class="move-row-cry">"${m.battleCry}"</div>` : ''}
        </td>
        <td><kbd class="kbd-badge">${m.inputHint}</kbd></td>
        <td><span class="hit-badge hit-${m.hitLevel.toLowerCase()}">${m.hitLevel}</span></td>
        <td>${m.damage} DMG</td>
        <td>${m.startupFrames}f</td>
        <td>
          ${m.launches ? '<span class="prop-tag tag-launch">LAUNCHER</span>' : ''}
          ${m.tailspin ? '<span class="prop-tag tag-screw">TAILSPIN</span>' : ''}
          ${m.powerCrush ? '<span class="prop-tag tag-armor">POWER CRUSH</span>' : ''}
          ${m.rageArt ? '<span class="prop-tag tag-rage">RAGE ART</span>' : ''}
          ${m.homing ? '<span class="prop-tag tag-homing">HOMING</span>' : ''}
        </td>
      </tr>
    `
      )
      .join('');
  }

  public showMainMenuScreen(): void {
    document.getElementById('screen-main-menu')?.classList.remove('hidden');
    document.getElementById('screen-char-select')?.classList.add('hidden');
    document.getElementById('screen-hud')?.classList.add('hidden');
    document.getElementById('screen-gameover')?.classList.add('hidden');
  }

  public showCharacterSelectScreen(): void {
    document.getElementById('screen-main-menu')?.classList.add('hidden');
    document.getElementById('screen-char-select')?.classList.remove('hidden');
    document.getElementById('screen-hud')?.classList.add('hidden');
    document.getElementById('screen-gameover')?.classList.add('hidden');

    const modeBadge = document.getElementById('char-select-mode-title');
    if (modeBadge) {
      modeBadge.textContent =
        this.selectedMode === 'arcade'
          ? 'ARCADE LOK SABHA TOURNAMENT'
          : this.selectedMode === 'versus_pvp'
          ? 'LOCAL 2-PLAYER VERSUS'
          : this.selectedMode === 'practice'
          ? 'PRACTICE AKHADA & FRAME LAB'
          : '1P VS CPU — ELECTION CLASH';
    }
    this.renderRosterSelection();
    this.renderStageSelection();
  }

  public launchMatch(): void {
    document.getElementById('screen-main-menu')?.classList.add('hidden');
    document.getElementById('screen-char-select')?.classList.add('hidden');
    document.getElementById('screen-gameover')?.classList.add('hidden');
    document.getElementById('screen-hud')?.classList.remove('hidden');

    const practicePanel = document.getElementById('practice-telemetry-bar');
    if (practicePanel) {
      practicePanel.classList.toggle('hidden', this.selectedMode !== 'practice');
    }

    this.game.arcadeStageIndex = 0;
    this.game.startMatch(this.selectedMode, this.selectedP1, this.selectedP2, this.selectedStage);
    this.updateHUD();
  }

  public togglePauseMenu(forceState?: boolean): void {
    const dialog = document.getElementById('modal-pause') as HTMLDialogElement | null;
    if (!dialog) return;

    const nextPaused = forceState !== undefined ? forceState : !this.game.isPaused;
    this.game.isPaused = nextPaused;

    if (nextPaused) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }

  public updateHUD(): void {
    const p1 = this.game.p1;
    const p2 = this.game.p2;
    if (!p1 || !p2) return;

    const p1Name = document.getElementById('hud-p1-name');
    const p2Name = document.getElementById('hud-p2-name');
    if (p1Name) p1Name.textContent = p1.profile.name;
    if (p2Name) p2Name.textContent = p2.profile.name;

    const p1Sub = document.getElementById('hud-p1-title');
    const p2Sub = document.getElementById('hud-p2-title');
    if (p1Sub) p1Sub.textContent = p1.profile.title;
    if (p2Sub) p2Sub.textContent = p2.profile.title;

    const p1Pct = Math.max(0, Math.min(100, (p1.hp / p1.maxHp) * 100));
    const p2Pct = Math.max(0, Math.min(100, (p2.hp / p2.maxHp) * 100));

    const p1Bar = document.getElementById('hud-p1-hp-fill');
    const p2Bar = document.getElementById('hud-p2-hp-fill');
    if (p1Bar) {
      p1Bar.style.width = `${p1Pct}%`;
      p1Bar.classList.toggle('rage-glow', p1.isRage);
    }
    if (p2Bar) {
      p2Bar.style.width = `${p2Pct}%`;
      p2Bar.classList.toggle('rage-glow', p2.isRage);
    }

    const p1RageTag = document.getElementById('hud-p1-rage-tag');
    const p2RageTag = document.getElementById('hud-p2-rage-tag');
    p1RageTag?.classList.toggle('hidden', !p1.isRage);
    p2RageTag?.classList.toggle('hidden', !p2.isRage);

    // Round Win Orbs
    this.renderRoundOrbs('hud-p1-orbs', this.game.p1RoundsWon, this.game.settings.roundsToWin, p1.profile.colors.uiHex);
    this.renderRoundOrbs('hud-p2-orbs', this.game.p2RoundsWon, this.game.settings.roundsToWin, p2.profile.colors.uiHex);

    // Timer
    const timerEl = document.getElementById('hud-timer');
    if (timerEl) {
      timerEl.textContent =
        this.game.mode === 'practice' || this.game.settings.roundTimeSeconds === 0
          ? '∞'
          : String(Math.ceil(this.game.roundTimer)).padStart(2, '0');
    }

    const stageLabel = document.getElementById('hud-stage-label');
    if (stageLabel) {
      const st = STAGES.find((s) => s.id === this.game.stageId);
      stageLabel.textContent = st ? st.name : 'SANSAD AKHADA';
    }

    // Combo Counters
    const p1ComboEl = document.getElementById('hud-p1-combo');
    if (p1ComboEl) {
      if (p2.comboHitsTaken >= 2) {
        p1ComboEl.classList.remove('hidden');
        p1ComboEl.innerHTML = `<div class="combo-num">${p2.comboHitsTaken} HITS!</div><div class="combo-dmg">${p2.comboDamageTaken} DAMAGE</div>`;
      } else {
        p1ComboEl.classList.add('hidden');
      }
    }

    const p2ComboEl = document.getElementById('hud-p2-combo');
    if (p2ComboEl) {
      if (p1.comboHitsTaken >= 2) {
        p2ComboEl.classList.remove('hidden');
        p2ComboEl.innerHTML = `<div class="combo-num">${p1.comboHitsTaken} HITS!</div><div class="combo-dmg">${p1.comboDamageTaken} DAMAGE</div>`;
      } else {
        p2ComboEl.classList.add('hidden');
      }
    }

    // Practice Mode Live Frame Telemetry
    if (this.game.mode === 'practice') {
      const moveEl = document.getElementById('practice-last-move');
      const frameEl = document.getElementById('practice-frame-adv');
      if (moveEl) moveEl.textContent = this.game.lastMoveUsedText;
      if (frameEl) frameEl.textContent = this.game.lastFrameAdvantageText;
    }
  }

  private renderRoundOrbs(containerId: string, won: number, total: number, colorHex: string): void {
    const el = document.getElementById(containerId);
    if (!el) return;
    let html = '';
    for (let i = 0; i < total; i++) {
      const active = i < won;
      html += `<span class="round-orb ${active ? 'won' : ''}" style="${active ? `background:${colorHex};box-shadow:0 0 10px ${colorHex}` : ''}"></span>`;
    }
    if (el.innerHTML !== html) {
      el.innerHTML = html;
    }
  }

  public showAnnounceBanner(title: string, subtitle = '', color = '#ff8800', durationMs = 1500): void {
    const banner = document.getElementById('hud-center-banner');
    const titleEl = document.getElementById('banner-title');
    const subEl = document.getElementById('banner-subtitle');
    if (!banner || !titleEl || !subEl) return;

    titleEl.textContent = title;
    titleEl.style.color = color;
    subEl.textContent = subtitle;
    banner.classList.remove('hidden');

    if (this.bannerTimeout) window.clearTimeout(this.bannerTimeout);
    this.bannerTimeout = window.setTimeout(() => {
      banner.classList.add('hidden');
    }, durationMs);
  }

  public showCalloutBubble(playerIndex: 1 | 2, text: string, subText = ''): void {
    const id = playerIndex === 1 ? 'hud-p1-callout' : 'hud-p2-callout';
    const el = document.getElementById(id);
    if (!el) return;

    el.innerHTML = `<div class="callout-main">${text}</div>${subText ? `<div class="callout-sub">${subText}</div>` : ''}`;
    el.classList.remove('hidden');

    if (playerIndex === 1) {
      if (this.p1BubbleTimeout) window.clearTimeout(this.p1BubbleTimeout);
      this.p1BubbleTimeout = window.setTimeout(() => el.classList.add('hidden'), 1800);
    } else {
      if (this.p2BubbleTimeout) window.clearTimeout(this.p2BubbleTimeout);
      this.p2BubbleTimeout = window.setTimeout(() => el.classList.add('hidden'), 1800);
    }
  }

  public showMatchEndScreen(winnerIndex: 1 | 2, isArcadeComplete: boolean): void {
    const winner = winnerIndex === 1 ? this.game.p1 : this.game.p2;
    const screen = document.getElementById('screen-gameover');
    const titleEl = document.getElementById('gameover-title');
    const quoteEl = document.getElementById('gameover-quote');
    const rematchBtn = document.getElementById('btn-gameover-rematch');

    if (!screen || !titleEl || !quoteEl || !rematchBtn) return;

    if (isArcadeComplete) {
      titleEl.textContent = `🏆 PRIME MINISTER OF IRON FIST: ${winner.profile.name}!`;
      quoteEl.textContent = `"${winner.profile.catchphrases.win}" — You conquered the entire Lok Sabha Tournament!`;
      rematchBtn.textContent = 'PLAY ARCADE AGAIN';
      rematchBtn.dataset.arcadeAction = 'restart';
    } else if (this.game.mode === 'arcade' && winnerIndex === 1) {
      titleEl.textContent = `${winner.profile.name} WINS STAGE ${this.game.arcadeStageIndex + 1}!`;
      quoteEl.textContent = `"${winner.profile.catchphrases.win}"`;
      rematchBtn.textContent = 'NEXT CHALLENGER ➔';
      rematchBtn.dataset.arcadeAction = 'next';
    } else {
      titleEl.textContent = `${winner.profile.name} WINS THE ELECTION CLASH!`;
      quoteEl.textContent = `"${winner.profile.catchphrases.win}"`;
      rematchBtn.textContent = 'REMATCH (PLAY AGAIN)';
      rematchBtn.dataset.arcadeAction = 'restart';
    }

    screen.classList.remove('hidden');
  }
}
