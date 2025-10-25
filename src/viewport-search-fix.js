(function setupSearchViewportFix() {
    try {
      const capsuleSelector = '.bg-white.flex.items-center.rounded-full';
      function findElements() {
        const capsule = document.querySelector(capsuleSelector);
        if (!capsule) return null;
        const input = capsule.querySelector('input');
        const btn = capsule.querySelector('button[type="submit"]');
        if (!input || !btn) return null;
        return { capsule, input, btn };
      }
  
      const els = findElements();
      if (!els) {
        document.addEventListener('DOMContentLoaded', () => {
          const e2 = findElements();
          if (e2) init(e2);
        });
      } else {
        init(els);
      }
  
      function init({ capsule, input, btn }) {
        if (!input || !btn) return;
  
        function updatePadding() {
          try {
            const btnRect = btn.getBoundingClientRect();
            const buffer = 18; // space between text and button
            const desired = Math.round(btnRect.width + buffer);
            const pad = Math.max(desired, 54);
            input.style.paddingRight = pad + 'px';
          } catch {}
        }
  
        updatePadding();
        setTimeout(updatePadding, 120);
        setTimeout(updatePadding, 600);
  
        if (window.visualViewport) {
          window.visualViewport.addEventListener('resize', updatePadding, { passive: true });
          window.visualViewport.addEventListener('scroll', updatePadding, { passive: true });
        }
        window.addEventListener('resize', updatePadding, { passive: true });
  
        const mo = new MutationObserver(() => updatePadding());
        mo.observe(capsule, { childList: true, subtree: true, attributes: true });
      }
    } catch (err) {
      console.warn('viewport-search-fix failed', err);
    }
  })();  