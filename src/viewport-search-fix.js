// src/viewport-search-fix.js
// Lightweight safety: if the input's right padding is too small for the visible button,
// increase padding-right (with !important) so text won't collide with the magnifier button.

(function setupSearchViewportFix() {
    try {
      const capsuleSelector = '.bg-white.flex.items-center.rounded-full';
  
      function waitForCapsule(cb) {
        const capsule = document.querySelector(capsuleSelector);
        if (capsule) return cb(capsule);
        const obs = new MutationObserver(() => {
          const c = document.querySelector(capsuleSelector);
          if (c) {
            obs.disconnect();
            cb(c);
          }
        });
        obs.observe(document.body, { childList: true, subtree: true });
      }
  
      waitForCapsule((capsule) => {
        const input = capsule.querySelector('input');
        const btn = capsule.querySelector('button[type="submit"]');
        if (!input || !btn) return;
  
        // set padding-right using !important where supported
        function setPaddingImportant(el, value) {
          try {
            el.style.setProperty('padding-right', value, 'important');
          } catch (e) {
            el.style.paddingRight = value;
          }
        }
  
        function updatePadding() {
          try {
            const btnRect = btn.getBoundingClientRect();
            if (!btnRect.width) return;
            const rightEdgeGap = 12; // matches CSS right offset
            const buffer = 18;       // extra buffer for text breathing room
            const desired = Math.round(btnRect.width + rightEdgeGap + buffer);
            const minDefault = parseInt(window.getComputedStyle(input).getPropertyValue('padding-right')) || 0;
  
            // Only increase if desired is bigger than current computed padding (so we don't reduce)
            const currentComputed = Math.round(parseFloat(window.getComputedStyle(input).getPropertyValue('padding-right')) || 0);
            if (desired > currentComputed) {
              setPaddingImportant(input, desired + 'px');
            }
          } catch (err) {
            // silent
          }
        }
  
        // initial run + a few delayed runs (handle slow WebView reflows)
        updatePadding();
        setTimeout(updatePadding, 120);
        setTimeout(updatePadding, 400);
        setTimeout(updatePadding, 900);
  
        // while user typing (keyboard open) occasionally re-check
        let interval = null;
        input.addEventListener('focus', () => {
          updatePadding();
          if (interval) clearInterval(interval);
          interval = setInterval(updatePadding, 350);
        });
        input.addEventListener('blur', () => {
          if (interval) {
            clearInterval(interval);
            interval = null;
          }
          setTimeout(updatePadding, 200);
        });
  
        // also on resize/orientation change
        window.addEventListener('resize', updatePadding, { passive: true });
        window.addEventListener('orientationchange', updatePadding, { passive: true });
  
        // keep an eye on layout changes
        const mo = new MutationObserver(updatePadding);
        mo.observe(capsule, { childList: true, subtree: true, attributes: true });
      });
    } catch (err) {
      // silent
    }
  })();  