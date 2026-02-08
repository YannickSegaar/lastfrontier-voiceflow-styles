/**
 * LFH VoiceFlow Notification Sound
 * Plays a beep when the agent responds and the user isn't actively viewing the chat.
 * Triggers when: widget is minimized OR browser tab is not visible.
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

  // Track tab visibility via Page Visibility API (W3C standard, no permissions needed)
  document.addEventListener('visibilitychange', function () {
    tabVisible = document.visibilityState === 'visible';
  });

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
        break;
      case 'voiceflow:close':
        widgetOpen = false;
        break;
      case 'voiceflow:interact':
        // Only beep if user isn't actively looking at the chat
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
