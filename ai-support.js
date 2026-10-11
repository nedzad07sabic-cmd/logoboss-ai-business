// Public LogoBoss information only. Account data and private tickets stay in Support.
const endpoint = 'https://ppmefffjhqpmrjnlewoq.supabase.co/functions/v1/ai-chat?scope=logoboss-support';
const maxMessageLength = 1500;
const allowedHashes = new Set([
  '#services', '#support', '#account',
  ...['digital-start', 'web-business', 'web-pro', 'ai-business', 'ai-pro',
    'automation-start', 'automation-business', 'company-os-start', 'hosting-web',
    'hosting-wordpress', 'hosting-apps', 'hosting-domains', 'hosting-email'].map(id => '#offer-' + id)
]);
let instance;

export function initAiSupport({ beforeOpen = () => {}, openSupport = () => {} } = {}) {
  if (instance) return instance;

  const dialog = document.createElement('dialog');
  dialog.id = 'lbAiChatDialog';
  dialog.setAttribute('aria-labelledby', 'lbAiChatTitle');
  dialog.setAttribute('aria-describedby', 'lbAiChatIntro');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('dir', 'ltr');
  // This template is static; all user content, responses and labels use textContent.
  dialog.innerHTML = `
    <div class="lb-ai-top">
      <div class="lb-ai-brand">LogoBoss <span class="lb-ai-badge">AI</span></div>
      <button type="button" class="lb-ai-close" data-ai-action="close">×</button>
    </div>
    <div class="lb-ai-body">
      <h2 id="lbAiChatTitle"></h2>
      <p id="lbAiChatIntro" class="lb-ai-intro"></p>
      <fieldset class="lb-ai-languages">
        <legend id="lbAiLanguageLabel"></legend>
        <button type="button" data-ai-language="de" lang="de" aria-pressed="false">Deutsch</button>
        <button type="button" data-ai-language="en" lang="en" aria-pressed="false">English</button>
      </fieldset>
      <div class="lb-ai-status-row">
        <p id="lbAiChatStatus" class="lb-ai-status" role="status" aria-live="polite" aria-atomic="true"></p>
        <button type="button" class="lb-ai-button lb-ai-recheck" data-ai-action="check"></button>
      </div>
      <div id="lbAiChatLog" class="lb-ai-log" role="log" aria-live="polite" aria-relevant="additions" tabindex="0" hidden></div>
      <form id="lbAiChatForm" class="lb-ai-form">
        <label for="lbAiChatMessage" id="lbAiMessageLabel"></label>
        <textarea id="lbAiChatMessage" name="message" rows="3" maxlength="1500" autocomplete="off" aria-describedby="lbAiChatPrivacy lbAiChatCount" required disabled></textarea>
        <div class="lb-ai-compose-actions">
          <span id="lbAiChatCount" class="lb-ai-count">0 / 1500</span>
          <button type="submit" class="lb-ai-button lb-ai-send" disabled></button>
        </div>
      </form>
      <p id="lbAiChatPrivacy" class="lb-ai-privacy"></p>
      <div class="lb-ai-footer">
        <div><p id="lbAiSupportHint"></p><a class="lb-ai-button" href="/#support" data-ai-action="support"></a></div>
        <a href="/datenschutz.html" class="lb-ai-privacy-link" data-ai-action="leave"></a>
      </div>
    </div>`;
  document.body.append(dialog);

  const find = selector => dialog.querySelector(selector);
  const input = find('#lbAiChatMessage');
  const sendButton = find('.lb-ai-send');
  const checkButton = find('[data-ai-action="check"]');
  const status = find('#lbAiChatStatus');
  const log = find('#lbAiChatLog');
  const languageButtons = [...dialog.querySelectorAll('[data-ai-language]')];
  let language = null;
  let available = null;
  let state = 'choose';
  let operation = '';
  let activeRequest = null;
  let version = 0;
  let active = false;
  let returnFocus = null;
  let previousOverflow = '';
  let conversation = [];

  const text = (de, en) => language === 'de' ? de : language === 'en' ? en : de + ' / ' + en;
  const statusText = () => ({
    choose: text('Bitte zuerst Deutsch oder English wählen.', 'Choose Deutsch or English first.'),
    checking: text('Verfügbarkeit wird geprüft …', 'Checking availability …'),
    ready: language
      ? text('Bereit für Ihre Frage.', 'Ready for your question.')
      : text('Bitte zuerst Deutsch oder English wählen.', 'Choose Deutsch or English first.'),
    disabled: text('Der AI-Chat ist derzeit nicht verfügbar. Unser Support ist weiterhin erreichbar.', 'AI chat is currently unavailable. Our Support is still available.'),
    sending: text('Die AI erstellt eine Antwort …', 'The AI is preparing a reply …'),
    timeout: text('Keine Antwort innerhalb von 25 Sekunden. Ihr Text bleibt erhalten. Bitte später erneut versuchen oder Support öffnen.', 'No reply within 25 seconds. Your text is still here. Try again later or open Support.'),
    rate: text('Zu viele Anfragen. Ihr Text bleibt erhalten. Bitte etwas warten und die Verfügbarkeit erneut prüfen.', 'Too many requests. Your text is still here. Please wait a little, then check availability again.'),
    error: text('Der AI-Chat ist momentan nicht erreichbar. Ihr Text bleibt erhalten. Sie können erneut prüfen oder Support öffnen.', 'AI chat cannot be reached right now. Your text is still here. You can check again or open Support.'),
    sensitive: text('Bitte entfernen Sie Zugangsschlüssel oder andere vertrauliche Daten. Dieser Text wurde nicht an das AI-Modell gesendet.', 'Please remove access keys or other sensitive data. This text was not sent to the AI model.'),
    length: text('Bitte höchstens 1.500 Zeichen eingeben.', 'Please enter no more than 1,500 characters.')
  })[state];

  function updateControls() {
    const canCompose = !!language && available === true && !operation;
    input.disabled = !canCompose;
    sendButton.disabled = !canCompose || !input.value.trim() || input.value.length > maxMessageLength;
    checkButton.disabled = !!operation;
    checkButton.hidden = available === true && !['error', 'timeout', 'rate'].includes(state);
    languageButtons.forEach(button => {
      button.disabled = operation === 'send';
      button.setAttribute('aria-pressed', String(button.dataset.aiLanguage === language));
    });
    find('#lbAiChatCount').textContent = input.value.length + ' / ' + maxMessageLength;
    find('#lbAiChatForm').setAttribute('aria-busy', String(operation === 'send'));
    status.textContent = statusText();
    status.classList.toggle('lb-ai-status-error', ['error', 'timeout', 'rate'].includes(state));
  }

  function updateLanguage() {
    dialog.lang = language || 'de';
    find('#lbAiChatTitle').textContent = text('Fragen zu LogoBoss?', 'Questions about LogoBoss?');
    find('#lbAiChatIntro').textContent = text(
      'Wählen Sie eine Sprache für Fragen zu unseren Leistungen und Paketen. Für persönliche Konto- oder Bestellanfragen nutzen Sie Support.',
      'Choose a language to ask about our services and packages. For private account or order questions, use Support.'
    );
    find('#lbAiLanguageLabel').textContent = text('Chat-Sprache wählen', 'Choose chat language');
    find('[data-ai-action="close"]').setAttribute('aria-label', text('Schließen', 'Close'));
    find('#lbAiMessageLabel').textContent = text('Ihre Frage', 'Your question');
    input.placeholder = language
      ? text('Wie kann LogoBoss meinem Unternehmen helfen?', 'How can LogoBoss help my business?')
      : 'Bitte Sprache wählen / Please choose a language';
    sendButton.textContent = operation === 'send' ? text('Wird gesendet …', 'Sending …') : text('Senden', 'Send');
    checkButton.textContent = text('Erneut prüfen', 'Check again');
    find('#lbAiChatPrivacy').textContent = text(
      'AI-Antworten können Fehler enthalten. Keine Passwörter, API-Schlüssel oder Kartendaten eingeben. Diese Seite hält den Chat nur im Arbeitsspeicher. Beim Senden werden Ihre Frage und ein gekürzter Verlauf über unseren Server an OpenAI übermittelt.',
      'AI replies can contain mistakes. Do not enter passwords, API keys or card details. This page keeps the chat only in memory. Sending passes your question and a shortened history through our server to OpenAI.'
    );
    find('#lbAiSupportHint').textContent = text('Persönliche Frage zu Ihrem Konto oder Auftrag?', 'A private question about your account or order?');
    find('[data-ai-action="support"]').textContent = text('Support öffnen', 'Open Support');
    find('.lb-ai-privacy-link').textContent = text('Datenschutz', 'Privacy');
    log.setAttribute('aria-label', text('AI-Chatverlauf', 'AI chat history'));
    updateControls();
  }

  function beginRequest(kind) {
    if (operation || !active) return null;
    const request = { token: ++version, controller: new AbortController(), timedOut: false, timer: null };
    request.timer = window.setTimeout(() => {
      request.timedOut = true;
      request.controller.abort();
    }, 25000);
    activeRequest = request;
    operation = kind;
    return request;
  }
  const isCurrent = request => active && request.token === version;
  function finishRequest(request) {
    window.clearTimeout(request.timer);
    if (request.token !== version) return;
    activeRequest = null;
    operation = '';
    updateLanguage();
  }
  async function fetchData(request, options = {}) {
    const response = await fetch(endpoint, {
      ...options, credentials: 'omit', cache: 'no-store', signal: request.controller.signal
    });
    if (!response.ok) {
      const error = new Error('AI request failed');
      error.status = response.status;
      error.code = (await response.json().catch(() => ({}))).error;
      throw error;
    }
    return response.json();
  }
  async function fetchAvailability(request) {
    const data = await fetchData(request, { method: 'GET' });
    if (typeof data.enabled !== 'boolean' || !Array.isArray(data.languages) ||
        !data.languages.includes('de') || !data.languages.includes('en')) {
      throw new Error('Invalid AI availability response');
    }
    return data.enabled;
  }
  function showRequestError(error, request) {
    if (!isCurrent(request)) return;
    if (error.code === 'sensitive_data') { available = true; state = 'sensitive'; return; }
    available = null;
    state = request.timedOut ? 'timeout' : error.status === 429 ? 'rate' : 'error';
  }
  async function checkAvailability() {
    const request = beginRequest('check');
    if (!request) return;
    available = null;
    state = 'checking';
    updateLanguage();
    try {
      const enabled = await fetchAvailability(request);
      if (!isCurrent(request)) return;
      available = enabled;
      state = enabled ? 'ready' : 'disabled';
    } catch (error) {
      showRequestError(error, request);
    } finally {
      finishRequest(request);
    }
  }

  function verifiedLink(value) {
    if (!value || typeof value.label !== 'string' || !value.label.trim() || typeof value.url !== 'string') return null;
    try {
      const url = new URL(value.url, location.origin);
      if (!['https://logobossweb-ai.eu', 'https://www.logobossweb-ai.eu'].includes(url.origin) || url.username || url.password || url.search) return null;
      if (!((url.pathname === '/' && allowedHashes.has(url.hash)) ||
          (url.pathname === '/datenschutz.html' && !url.hash))) return null;
      return { label: value.label.trim().slice(0, 100), url };
    } catch { return null; }
  }
  function appendMessage(role, content, messageLanguage, links = []) {
    const article = document.createElement('article');
    article.className = 'lb-ai-message ' + (role === 'user' ? 'lb-ai-user' : 'lb-ai-assistant');
    article.lang = messageLanguage;
    const name = document.createElement('strong');
    name.className = 'lb-ai-message-name';
    name.textContent = role === 'assistant' ? 'LogoBoss AI' : messageLanguage === 'de' ? 'Sie' : 'You';
    const body = document.createElement('p');
    body.textContent = content;
    article.append(name, body);
    const safeLinks = Array.isArray(links) ? links.map(verifiedLink).filter(Boolean).slice(0, 8) : [];
    if (safeLinks.length) {
      const list = document.createElement('ul');
      list.className = 'lb-ai-message-links';
      safeLinks.forEach(({ label, url }) => {
        const item = document.createElement('li');
        const anchor = document.createElement('a');
        anchor.textContent = label;
        anchor.href = url.href;
        anchor.dataset.aiAction = url.hash === '#support' ? 'support' : 'leave';
        item.append(anchor);
        list.append(item);
      });
      article.append(list);
    }
    log.hidden = false;
    log.append(article);
    log.scrollTop = log.scrollHeight;
  }

  async function sendMessage() {
    const message = input.value.trim();
    if (!active || operation || !language || available !== true || !message) return;
    if (input.value.length > maxMessageLength) { state = 'length'; updateControls(); return; }
    const request = beginRequest('send');
    if (!request) return;
    const messageLanguage = language;
    state = 'checking';
    updateLanguage();
    try {
      // Every send checks the server switch first. A disabled AI never receives a POST.
      const enabled = await fetchAvailability(request);
      if (!isCurrent(request)) return;
      available = enabled;
      if (!enabled) { state = 'disabled'; return; }
      state = 'sending';
      updateControls();
      const history = conversation.slice(-8);
      while (history.reduce((total, item) => total + item.content.length, 0) > 6000) history.shift();
      const data = await fetchData(request, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope: 'logoboss-support', message, language: messageLanguage, history })
      });
      if (!isCurrent(request)) return;
      // Never present a demo response or an error body as a live AI answer.
      if (data.demo !== false || typeof data.reply !== 'string' || !data.reply.trim() || data.reply.length > 4000) {
        throw new Error('Invalid AI reply');
      }
      const reply = data.reply.trim();
      appendMessage('user', message, messageLanguage);
      appendMessage('assistant', reply, messageLanguage, data.links);
      conversation = [...conversation, { role: 'user', content: message }, { role: 'assistant', content: reply }].slice(-8);
      input.value = '';
      state = 'ready';
    } catch (error) {
      showRequestError(error, request);
    } finally {
      finishRequest(request);
      if (isCurrent(request) && !input.disabled) input.focus({ preventScroll: true });
    }
  }

  function restoreAfterClose() {
    if (!active) return;
    active = false;
    version++;
    if (activeRequest) {
      window.clearTimeout(activeRequest.timer);
      activeRequest.controller.abort();
    }
    activeRequest = null;
    operation = '';
    document.body.style.overflow = previousOverflow;
    if (location.hash === '#ai-support') history.replaceState(null, '', location.pathname + location.search);
    const focusTarget = returnFocus?.isConnected && returnFocus.getClientRects().length
      ? returnFocus : document.getElementById('lbAiChatOpen');
    focusTarget?.focus({ preventScroll: true });
  }
  function close() {
    if (!active) return;
    dialog.close();
    restoreAfterClose();
  }
  function open() {
    if (active) { find('[data-ai-action="close"]').focus(); return; }
    beforeOpen();
    returnFocus = document.activeElement;
    previousOverflow = document.body.style.overflow;
    dialog.showModal();
    active = true;
    document.body.style.overflow = 'hidden';
    updateLanguage();
    (language ? find('[data-ai-action="close"]') : languageButtons[0]).focus();
    void checkAvailability();
  }

  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  dialog.addEventListener('close', () => { if (!dialog.open) restoreAfterClose(); });
  dialog.addEventListener('click', event => {
    const button = event.target.closest('[data-ai-language]');
    if (button && operation !== 'send') {
      language = button.dataset.aiLanguage;
      updateLanguage();
      if (!input.disabled) input.focus();
      return;
    }
    const action = event.target.closest('[data-ai-action]')?.dataset.aiAction;
    if (action === 'close') close();
    else if (action === 'check') void checkAvailability();
    else if (action === 'support') { event.preventDefault(); close(); openSupport(); }
    else if (action === 'leave') close();
    else if (event.target === dialog) {
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
    }
  });
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = [...dialog.querySelectorAll('a[href],button:not(:disabled),textarea:not(:disabled),[tabindex="0"]')]
      .filter(element => !element.hidden && element.getClientRects().length);
    const first = controls[0], last = controls[controls.length - 1];
    if (!first) { event.preventDefault(); return; }
    if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
      event.preventDefault(); first.focus();
    }
  });
  find('#lbAiChatForm').addEventListener('submit', event => { event.preventDefault(); void sendMessage(); });
  input.addEventListener('input', updateControls);
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault(); void sendMessage();
    }
  });
  document.addEventListener('click', event => {
    if (event.target.closest('#lbAiChatOpen')) { event.preventDefault(); open(); }
  });
  const fromHash = () => { if (location.hash === '#ai-support') open(); };
  window.addEventListener('hashchange', fromHash);
  instance = { open, close };
  updateLanguage();
  fromHash();
  return instance;
}
