/**
 * LFH VoiceFlow Notification Sound + Badge
 * Plays a beep and shows a red unread-count badge on the launcher button
 * when the agent responds and the user isn't actively viewing the chat.
 *
 * Sound triggers when: widget is minimized OR browser tab is not visible.
 * Badge triggers when: widget is minimized (shows count on launcher bubble).
 *
 * Integration: Add <script src="path/to/notification-sound.js"></script> on the host page
 * alongside the VoiceFlow widget embed code.
 *
 * VoiceFlow postMessage events used:
 *   - voiceflow:open      widget opened
 *   - voiceflow:close     widget closed
 *   - voiceflow:interact  agent responded
 */
(function () {
  var beepAudio = new Audio('https://yannicksegaar.github.io/lastfrontier-voiceflow-styles/lfh_notification_beep.mp3');

  var widgetOpen = false;
  var tabVisible = document.visibilityState === 'visible';
  var unreadCount = 0;
  var badgeEl = null;

  // Track tab visibility via Page Visibility API (W3C standard, no permissions needed)
  document.addEventListener('visibilitychange', function () {
    tabVisible = document.visibilityState === 'visible';
  });

  // --- Badge setup (injected into VoiceFlow Shadow DOM) ---

  var BADGE_CSS =
    '.vfrc-launcher { position: relative !important; }' +
    '.lf-notification-badge {' +
    '  position: absolute;' +
    '  top: -4px;' +
    '  right: -4px;' +
    '  background: #e62b1e;' +
    '  color: #fff;' +
    '  border-radius: 50%;' +
    '  min-width: 20px;' +
    '  height: 20px;' +
    '  font-size: 12px;' +
    '  font-weight: bold;' +
    '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;' +
    '  display: none;' +
    '  align-items: center;' +
    '  justify-content: center;' +
    '  pointer-events: none;' +
    '  box-shadow: 0 2px 4px rgba(0,0,0,0.3);' +
    '  z-index: 9999;' +
    '  line-height: 1;' +
    '  padding: 0 4px;' +
    '}' +
    '.lf-notification-badge.lf-badge-visible {' +
    '  display: flex;' +
    '  animation: lf-badge-pop 0.3s ease;' +
    '}' +
    '@keyframes lf-badge-pop {' +
    '  0% { transform: scale(0); }' +
    '  70% { transform: scale(1.2); }' +
    '  100% { transform: scale(1); }' +
    '}';

  function setupBadge() {
    var shadowHost = document.getElementById('voiceflow-chat');
    if (!shadowHost || !shadowHost.shadowRoot) {
      setTimeout(setupBadge, 200);
      return;
    }
    var shadowRoot = shadowHost.shadowRoot;
    var launcher = shadowRoot.querySelector('.vfrc-launcher');
    if (!launcher) {
      setTimeout(setupBadge, 200);
      return;
    }

    // Inject CSS into shadow root
    var styleEl = document.createElement('style');
    styleEl.textContent = BADGE_CSS;
    shadowRoot.appendChild(styleEl);

    // Create badge element inside the launcher
    badgeEl = document.createElement('div');
    badgeEl.className = 'lf-notification-badge';
    badgeEl.textContent = '0';
    launcher.appendChild(badgeEl);
  }

  function updateBadge() {
    if (!badgeEl) return;
    if (unreadCount > 0) {
      badgeEl.textContent = unreadCount > 9 ? '9+' : String(unreadCount);
      badgeEl.classList.add('lf-badge-visible');
    } else {
      badgeEl.classList.remove('lf-badge-visible');
    }
  }

  // Start polling for the Shadow DOM
  setupBadge();

  // Track widget state + agent responses via VoiceFlow postMessage events
  window.addEventListener('message', function (event) {
    if (!event.data) return;

    var eventData;
    if (typeof event.data === 'string') {
      try {
        eventData = JSON.parse(event.data);
      } catch (e) {
        return;
      }
    } else if (typeof event.data === 'object') {
      eventData = event.data;
    } else {
      return;
    }

    if (!eventData || !eventData.type) return;

    switch (eventData.type) {
      case 'voiceflow:open':
        widgetOpen = true;
        unreadCount = 0;
        updateBadge();
        break;
      case 'voiceflow:close':
        widgetOpen = false;
        break;
      case 'voiceflow:interact':
        // Badge: only increment when widget is minimized
        if (!widgetOpen) {
          unreadCount++;
          updateBadge();
        }
        // Sound: beep if user isn't actively looking at the chat
        if (!widgetOpen || !tabVisible) {
          beepAudio.currentTime = 0;
          beepAudio.play().catch(function () {
            // Silently handle autoplay restrictions.
            // Sound will work after the user's first interaction with the page
            // (clicking the chat widget counts).
          });
        }
        break;
    }
  }, false);
})();
