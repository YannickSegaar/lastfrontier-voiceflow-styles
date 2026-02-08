/**
 * LFH VoiceFlow Notification Sound + Proactive Message Badge
 * Plays a beep and shows a proactive "X new messages" notification bubble
 * above the launcher when the agent responds and the user isn't viewing the chat.
 *
 * Sound triggers when: widget is minimized OR browser tab is not visible.
 * Notification triggers when: widget is minimized (proactive bubble on launcher).
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

  // Track tab visibility via Page Visibility API (W3C standard, no permissions needed)
  document.addEventListener('visibilitychange', function () {
    tabVisible = document.visibilityState === 'visible';
  });

  // --- Proactive message notification ---

  function showNotification() {
    if (!window.voiceflow || !window.voiceflow.chat || !window.voiceflow.chat.proactive) return;
    window.voiceflow.chat.proactive.clear();
    var msg = unreadCount === 1 ? '1 new message' : unreadCount + ' new messages';
    window.voiceflow.chat.proactive.push({
      type: 'text',
      payload: { message: msg }
    });
  }

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
        // proactive messages auto-clear on open (VoiceFlow built-in)
        break;
      case 'voiceflow:close':
        widgetOpen = false;
        break;
      case 'voiceflow:interact':
        // Notification: only increment when widget is minimized
        if (!widgetOpen) {
          unreadCount++;
          showNotification();
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
