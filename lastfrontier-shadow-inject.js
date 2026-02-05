// === Last Frontier Voiceflow Styles - Shadow DOM Injection ===
// This script injects CSS directly into the Voiceflow widget's Shadow DOM
// where external stylesheets cannot reach (especially for ::after pseudo-elements).
//
// Usage: Add this script AFTER the Voiceflow widget embed code on your page.

(function() {
  const injectStyles = () => {
    const shadowHost = document.getElementById('voiceflow-chat');

    if (!shadowHost || !shadowHost.shadowRoot) {
      // Widget not ready yet, retry
      setTimeout(injectStyles, 100);
      return;
    }

    const shadowRoot = shadowHost.shadowRoot;

    // Remove existing style if already injected (avoid duplicates)
    const existing = shadowRoot.getElementById('lf-custom-styles');
    if (existing) existing.remove();

    // Create and inject the style
    const style = document.createElement('style');
    style.id = 'lf-custom-styles';
    style.textContent = `
/* ===========================================
   Last Frontier Voiceflow Styles
   Shadow DOM Injection Version
   =========================================== */

/* Header title - 15px font size, no truncation */
.vfrc-header--title,
[class*="vfrc-header"] [class*="title"] {
  font-family: 'Nexa Rust Sans Black 2', sans-serif !important;

  /* Prevent truncation */
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: clip !important;

  /* Header title font size */
  font-size: 15px !important;
  line-height: 1.3 !important;

  /* Word wrapping for long text */
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
}

/* Assistant info title - 20px font size, no truncation */
.vfrc-assistant-info--title,
[class*="assistant-info"] [class*="title"] {
  font-family: 'Nexa Rust Sans Black 2', sans-serif !important;

  /* Prevent truncation */
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: clip !important;

  /* Assistant info title font size */
  font-size: 20px !important;
  line-height: 1.3 !important;

  /* Word wrapping for long text */
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
}

/* Apply Nexa Rust Sans Black 2 to launcher widget text */
.vfrc-launcher,
.vfrc-launcher * {
  font-family: 'Nexa Rust Sans Black 2', sans-serif !important;
}

/* Apply Nexa Rust Sans Black 2 to "Start new chat" button */
.vfrc-prompt button,
.vfrc-prompt-button,
[class*="prompt"] button,
[class*="start-new"] button,
.vfrc-footer__start-button,
.vfrc-confirm button,
.vfrc-confirmation button,
[class*="confirmation"] button:first-child,
.vfrc-widget button[class*="primary"],
.vfrc-modal button[class*="primary"] {
  font-family: 'Nexa Rust Sans Black 2', sans-serif !important;
}

/* Background image on main chat container ONLY */
.vfrc-chat {
  background-image: url('https://yannicksegaar.github.io/lastfrontier-voiceflow-styles/images/LFH_chatinterface_background_map.jpg') !important;
  background-size: cover !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
}

/* Reset background for all inner elements */
.vfrc-chat * {
  background-image: none;
}

/* Rugged edge pattern on header bottom */
.vfrc-header {
  position: relative !important;
  overflow: visible !important;
  z-index: 1 !important;
}

.vfrc-header::after {
  content: '' !important;
  position: absolute !important;
  left: 0 !important;
  right: 0 !important;
  bottom: -18px !important;
  height: 20px !important;
  background-image: url('https://www.lastfrontierheli.com/wp-content/themes/lastfrontier/dist/images/top-section-pattern.png') !important;
  background-size: 100% 100% !important;
  background-repeat: no-repeat !important;
  pointer-events: none !important;
  z-index: 10 !important;
  transform: scaleY(-1) !important;
}

/* Transparent footer */
.vfrc-footer,
[class*="vfrc-footer"] {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
}

/* Fix send button area - ensure clean background */
.vfrc-footer button,
.vfrc-footer [class*="button"],
[class*="vfrc-footer"] button,
[class*="vfrc-footer"] [class*="button"] {
  background-image: none !important;
}
    `;

    shadowRoot.appendChild(style);
    console.log('✅ Last Frontier custom styles injected into Shadow DOM');
  };

  // Start injection when ready
  if (document.readyState === 'complete') {
    injectStyles();
  } else {
    window.addEventListener('load', injectStyles);
  }
})();
