var chrome = chrome || browser;

var checkbox = document.getElementById('autoActive');
var textarea = document.getElementById('excludedHosts');

function load() {
  chrome.storage.local.get({ autoActive: false, excludedHosts: [] }, function(items) {
    checkbox.checked = items.autoActive;
    textarea.value = items.excludedHosts.join('\n');
  });
}

checkbox.addEventListener('change', function() {
  chrome.storage.local.set({ autoActive: checkbox.checked });
});

textarea.addEventListener('change', function() {
  var excludedHosts = textarea.value
    .split('\n')
    .map(function(host) { return host.trim(); })
    .filter(Boolean);
  chrome.storage.local.set({ excludedHosts: excludedHosts });
});

load();
