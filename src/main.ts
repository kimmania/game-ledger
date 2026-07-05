import './style.css';
import { LedgerApp } from './app.ts';
import { UIController } from './ui/ui.ts';
import { AudioController } from './ui/audio.ts';
import { Settings, loadSettings, saveSettings } from './engine/storage.ts';

function bootstrap(): void {
  const ui = new UIController();
  const audio = new AudioController();
  let settings: Settings = loadSettings();
  audio.enabled = settings.sound;

  const app = new LedgerApp({
    render: () => render(),
    play: (name) => audio.play(name),
    showToast: (text) => ui.showToast(text),
    announce: (text) => {
      const region = document.getElementById('aria-live');
      if (region) region.textContent = text;
    }
  });

  function render() {
    ui.renderGame(app.state, app.folio, {
      selectTube: (i) => app.selectTube(i),
      deal: () => app.deal(),
      setPending: (s) => app.setPending(s),
      undo: () => app.undo(),
      reset: () => app.resetFolio(),
      settings: () => openSettings(),
      help: () => openHelp(),
      nextFolio: () => {
        const nextId = nextFolioIdSafe(app.folio.id);
        if (nextId) app.startFolio(nextId);
      }
    });
  }

  function openHelp() {
    ui.renderHelp(() => render());
  }

  function openSettings() {
    ui.renderSettings(settings, (patch) => {
      settings = { ...settings, ...patch };
      saveSettings(settings);
      audio.enabled = settings.sound;
      document.body.classList.toggle('reduced-motion', settings.reducedMotion);
      document.body.classList.toggle('color-blind', settings.colorBlind);
    }, () => render());
  }

  function nextFolioIdSafe(currentId: string): string | null {
    const ids = ['coaling-1', 'teller-1', 'counting-1', 'vault-1', 'assayer-1', 'director-1', 'aetherium-1'];
    const idx = ids.indexOf(currentId);
    return idx >= 0 && idx < ids.length - 1 ? ids[idx + 1] : null;
  }

  // Accessibility live region
  const live = document.createElement('div');
  live.id = 'aria-live';
  live.setAttribute('aria-live', 'polite');
  live.setAttribute('aria-atomic', 'true');
  live.className = 'sr-only';
  live.style.position = 'absolute';
  live.style.left = '-9999px';
  document.body.appendChild(live);

  render();
}

bootstrap();
