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
  
        // ensure button can't shrink via flexbox; also ensure fixed size
        btn.style.boxSizing = 'border-box';
        btn.style.flex = '0 0 auto';
        btn.style.minWidth = '44px';
        btn.style.width = '44px';
        btn.style.height = '44px';
        btn.style.display = 'inline-flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
  
        // small helper to set padding-right with !important
        function setPaddingImportant(el, value) {
          try {
            el.style.setProperty('padding-right', value, 'important');
          } catch (e) {
            // fallback
            el.style.paddingRight = value;
          }
        }
  
        function updatePadding() {
          try {
            const btnRect = btn.getBoundingClientRect();
            if (!btnRect.width) return;
            const buffer = 18; // spacing between input text and button
            const desired = Math.round(btnRect.width + buffer);
            const pad = Math.max(desired, 54); // enforce minimum
            const padVal = pad + 'px';
            // only update if different
            if ((input.style.getPropertyValue('padding-right') || '') !== padVal) {
              setPaddingImportant(input, padVal);
            }
          } catch (err) {
            // silent
          }
        }
  
        // initial and delayed updates
        updatePadding();
        setTimeout(updatePadding, 80);
        setTimeout(updatePadding, 250);
        setTimeout(updatePadding, 700);
  
        // strong repeated check while input has focus (handles WebView keyboard reflow)
        let focusInterval = null;
        input.addEventListener('focus', () => {
          updatePadding();
          if (focusInterval) clearInterval(focusInterval);
          focusInterval = setInterval(updatePadding, 300); // update every 300ms while typing
        });
        input.addEventListener('blur', () => {
          if (focusInterval) {
            clearInterval(focusInterval);
            focusInterval = null;
          }
          // final correction after blur
          setTimeout(updatePadding, 120);
        });
  
        // listen to window changes too
        window.addEventListener('resize', updatePadding, { passive: true });
        window.addEventListener('orientationchange', updatePadding, { passive: true });
  
        // also update on visualViewport changes if available
        if (window.visualViewport) {
          window.visualViewport.addEventListener('resize', updatePadding, { passive: true });
          window.visualViewport.addEventListener('scroll', updatePadding, { passive: true });
        }
  
        // MutationObserver in case layout or styles change
        const mo = new MutationObserver(updatePadding);
        mo.observe(capsule, { childList: true, subtree: true, attributes: true });
  
        // debug (will appear in console if accessible)
        try { console.log('[viewport-search-fix] active'); } catch (e) {}
      });
    } catch (err) {
      try { console.warn('[viewport-search-fix] failed', err); } catch (e) {}
    }
  })();  