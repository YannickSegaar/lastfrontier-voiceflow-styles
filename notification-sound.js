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
  // --- Generate a short beep as a data URL ---
  // 880Hz sine wave, 200ms, with 10ms fade in/out. No external file dependency.
  // To use a custom sound instead, replace beepAudio with:
  //   var beepAudio = new Audio('https://yannicksegaar.github.io/.../notification.mp3');
  var beepAudio = new Audio(generateBeepDataURL());

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

  /**
   * Generates a short 880Hz sine wave beep as a data:audio/wav URL.
   * Duration: 200ms, Sample rate: 44100Hz, 16-bit mono, ~17KB.
   */
  function generateBeepDataURL() {
    var sampleRate = 44100;
    var duration = 0.2;
    var frequency = 880;
    var volume = 0.3;
    var numSamples = Math.floor(sampleRate * duration);
    var fadeLen = Math.floor(sampleRate * 0.01);

    var bufferSize = 44 + numSamples * 2;
    var buffer = new ArrayBuffer(bufferSize);
    var view = new DataView(buffer);

    // WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, bufferSize - 8, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, numSamples * 2, true);

    // Sine wave with fade in/out to avoid click artifacts
    for (var i = 0; i < numSamples; i++) {
      var t = i / sampleRate;
      var sample = Math.sin(2 * Math.PI * frequency * t) * volume;
      if (i < fadeLen) sample *= i / fadeLen;
      if (i > numSamples - fadeLen) sample *= (numSamples - i) / fadeLen;
      view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, sample)) * 0x7FFF, true);
    }

    // Convert ArrayBuffer to base64 data URL
    var bytes = new Uint8Array(buffer);
    var binary = '';
    for (var j = 0; j < bytes.length; j++) {
      binary += String.fromCharCode(bytes[j]);
    }
    return 'data:audio/wav;base64,' + btoa(binary);
  }

  function writeString(view, offset, str) {
    for (var i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }
})();
