/* Installation UI only. Customer accounts and support use the existing website. */
(() => {
  'use strict';
  if (!document.getElementById('lbAppInstall')) return;
  const button = document.getElementById('appInstallButton');
  const state = document.getElementById('appInstallState');
  const openLink = document.getElementById('appOpenLink');
  const manual = document.getElementById('appManualGuide');
  const displayMode = window.matchMedia('(display-mode: standalone)');
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  let language = 'de', installPrompt = null, busy = false, installed = false, note = '';
  try { if (localStorage.getItem('lb_lang') === 'en') language = 'en'; } catch (_) {}
  const messages = {
    ready: ['Ihr Browser bietet die Installation an. Fügen Sie LogoBoss jetzt zu Ihrem Gerät hinzu.', 'Your browser is ready to install LogoBoss. Add it to your device now.'],
    ios: ['Fügen Sie LogoBoss in Safari über Teilen zu Ihrem Home-Bildschirm hinzu.', 'In Safari, use Share to add LogoBoss to your Home Screen.'],
    manual: ['Nutzen Sie die Installationsoption Ihres Browsers. Die passenden Schritte finden Sie unten.', 'Use your browser’s installation option. The steps are below.'],
    busy: ['Bestätigen Sie die Installation im Browserfenster.', 'Confirm installation in your browser’s prompt.'],
    accepted: ['Die Installation wurde angenommen. Folgen Sie den weiteren Hinweisen Ihres Browsers.', 'Installation was accepted. Follow any remaining instructions from your browser.'],
    dismissed: ['Sie können LogoBoss später installieren oder den Support direkt öffnen.', 'You can install LogoBoss later or open support directly.'],
    failed: ['Die Installation wurde nicht abgeschlossen. Nutzen Sie bei Bedarf Ihr Browsermenü.', 'Installation did not complete. You can use your browser menu instead.'],
    installed: ['Installation abgeschlossen. Öffnen Sie LogoBoss über Ihr neues App-Symbol.', 'Installation complete. Open LogoBoss from your new app icon.'],
    standalone: ['Sie verwenden LogoBoss bereits als App auf diesem Gerät.', 'You are already using LogoBoss as an app on this device.']
  };
  const standalone = () => displayMode.matches || navigator.standalone === true;
  function updateInstallState() {
    const inApp = standalone(), done = inApp || installed;
    button.hidden = done || !installPrompt;
    button.disabled = busy || !installPrompt;
    button.setAttribute('aria-busy', String(busy));
    openLink.hidden = !done;
    manual.hidden = done || Boolean(installPrompt) || busy;
    document.getElementById('appIosGuide').hidden = !isIOS;
    document.getElementById('appBrowserGuide').hidden = isIOS;
    const key = inApp ? 'standalone' : installed ? 'installed' : busy ? 'busy' : installPrompt ? 'ready' : note || (isIOS ? 'ios' : 'manual');
    state.textContent = messages[key][language === 'en' ? 1 : 0];
  }
  function setLanguage(next, persist = false) {
    language = next === 'en' ? 'en' : 'de';
    if (persist) {
      try {
        localStorage.setItem('lb_lang', language);
        // Keep the existing site's language picker aligned when returning to support.
        localStorage.setItem('lb_site_lang', language);
      } catch (_) {}
    }
    document.documentElement.lang = language;
    document.title = language === 'en' ? 'LogoBoss AI · Install app' : 'LogoBoss AI · App installieren';
    document.querySelectorAll('[data-app-de][data-app-en]').forEach(element => {
      element.textContent = language === 'en' ? element.dataset.appEn : element.dataset.appDe;
    });
    document.querySelectorAll('[data-app-language]').forEach(element => element.setAttribute('aria-pressed', String(element.dataset.appLanguage === language)));
    updateInstallState();
  }
  document.querySelectorAll('[data-app-language]').forEach(element => element.addEventListener('click', () => setLanguage(element.dataset.appLanguage, true)));
  window.addEventListener('beforeinstallprompt', event => {
    if (standalone()) return;
    event.preventDefault();
    installPrompt = event;
    note = '';
    updateInstallState();
  });
  button.addEventListener('click', async () => {
    if (!installPrompt || busy || standalone()) return;
    const prompt = installPrompt;
    installPrompt = null;
    busy = true;
    updateInstallState();
    try {
      const result = await prompt.prompt();
      const choice = result?.outcome ? result : await prompt.userChoice;
      note = choice?.outcome === 'accepted' ? 'accepted' : 'dismissed';
    } catch (_) { note = 'failed'; }
    finally { busy = false; updateInstallState(); }
  });
  window.addEventListener('appinstalled', () => {
    installed = true;
    installPrompt = null;
    busy = false;
    updateInstallState();
  });
  if (displayMode.addEventListener) displayMode.addEventListener('change', updateInstallState);
  else if (displayMode.addListener) displayMode.addListener(updateInstallState);
  window.addEventListener('pageshow', updateInstallState);
  window.addEventListener('storage', event => {
    if (event.key === 'lb_lang') setLanguage(event.newValue);
  });
  setLanguage(language);
  // Register only from this installation page; no account or callback URL is changed.
  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('/app-sw.js', { scope: '/', updateViaCache: 'none' }).catch(() => {
      if (!installPrompt && !installed && !standalone()) {
        note = 'manual';
        updateInstallState();
      }
    });
  }
})();
