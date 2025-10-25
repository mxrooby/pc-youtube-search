// Prevents the magnifying glass button from getting squished
// when typing in Unity WebView or small-screen keyboards.
(function setupSearchViewportFix() {
    try {
      const capsuleSelector = '.bg-white.flex.items-center.rounded-full';
  
      // Wait until capsule exists
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
  
        function updatePadding() {
          try {
            const btnRect = btn.getBoundingClientRect();
            if (!btnRect.width) return;
            const buffer = 16;
            const desired = Math.max(54, Math.round(btnRect.width + buffer));
            if (input.style.paddingRight !== desired + 'px') {
              input.style.paddingRight = desired + 'px';
            }
          } catch (err) {
            console.warn('padding calc failed', err);
          }
        }
  
        // --- Initial and delayed checks ---
        updatePadding();
        setTimeout(updatePadding, 100);
        setTimeout(updatePadding, 300);
        setTimeout(updatePadding, 800);
  
        // --- Keep updating as user types / resizes ---
        window.addEventListener('resize', updatePadding, { passive: true });
        window.addEventListener('orientationchange', updatePadding, { passive: true });
        input.addEventListener('focus', () => {
          updatePadding();
          // repeated fix to handle Unity WebView keyboard reflow
          const interval = setInterval(updatePadding, 300);
          input.addEventListener('blur', () => clearInterval(interval), { once: true });
        });
  
        // --- Observe for layout or style changes ---
        const mo = new MutationObserver(updatePadding);
        mo.observe(capsule, { childList: true, subtree: true, attributes: true });
  
        console.log('[viewport-fix] active');
      });
    } catch (err) {
      console.warn('[viewport-fix] failed', err);
    }
  })();  