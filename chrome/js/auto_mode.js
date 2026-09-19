/**
 * Runs the overlay remover in the background, without user interaction,
 * whenever the "Always remove overlays automatically" toggle is on.
 */

(function() {
  var chrome = chrome || browser;
  var observer = null;
  var pendingTimer = null;
  var hostname = location.hostname;

  function scheduleRun() {
    if (pendingTimer)
      return;
    pendingTimer = setTimeout(function() {
      pendingTimer = null;
      try {
        overlayRemoverRun(true);
      } catch (e) {
        // Ignore errors from pages that mutate the DOM in ways we don't expect.
      }
    }, 400);
  }

  function startWatching() {
    if (observer)
      return;
    scheduleRun();
    observer = new MutationObserver(scheduleRun);
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  function stopWatching() {
    if (!observer)
      return;
    observer.disconnect();
    observer = null;
    if (pendingTimer) {
      clearTimeout(pendingTimer);
      pendingTimer = null;
    }
  }

  function isExcluded(excludedHosts) {
    return (excludedHosts || []).indexOf(hostname) !== -1;
  }

  function applyState(autoActive, excludedHosts) {
    if (autoActive && !isExcluded(excludedHosts))
      startWatching();
    else
      stopWatching();
  }

  function loadAndApply() {
    chrome.storage.local.get({ autoActive: false, excludedHosts: [] }, function(items) {
      applyState(items.autoActive, items.excludedHosts);
    });
  }

  function showToast(text) {
    var toast = document.createElement('div');
    toast.textContent = text;
    toast.style.cssText = 'position:fixed;bottom:16px;right:16px;background:#222;color:#fff;' +
      'padding:8px 14px;border-radius:4px;font:13px sans-serif;z-index:2147483647;opacity:0.95;';
    document.body.appendChild(toast);
    setTimeout(function() {
      toast.remove();
    }, 2500);
  }

  loadAndApply();

  chrome.storage.onChanged.addListener(function(changes, area) {
    if (area === 'local' && (changes.autoActive || changes.excludedHosts)) {
      loadAndApply();
    }
  });

  chrome.runtime.onMessage.addListener(function(message) {
    if (!message || message.type !== 'behindTheOverlay:autoExcludeToggled')
      return;
    showToast(message.excluded
      ? 'Auto-remove overlays disabled for this site'
      : 'Auto-remove overlays enabled for this site');
  });
})();
