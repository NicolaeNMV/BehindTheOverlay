// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Called when the user clicks on the browser action.

var chrome = chrome || browser;

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'toggle-auto-exclude',
    title: 'Toggle auto-remove for this site',
    contexts: ['action']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== 'toggle-auto-exclude' || !tab || !tab.url)
    return;

  var hostname;
  try {
    hostname = new URL(tab.url).hostname;
  } catch (e) {
    return;
  }

  chrome.storage.local.get({ excludedHosts: [] }, (items) => {
    var excludedHosts = items.excludedHosts;
    var index = excludedHosts.indexOf(hostname);
    var nowExcluded = index === -1;

    if (nowExcluded) {
      excludedHosts.push(hostname);
    } else {
      excludedHosts.splice(index, 1);
    }

    chrome.storage.local.set({ excludedHosts: excludedHosts }, () => {
      chrome.tabs.sendMessage(tab.id, {
        type: 'behindTheOverlay:autoExcludeToggled',
        hostname: hostname,
        excluded: nowExcluded
      });
    });
  });
});

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    files: ['/js/overlay_remover.js']
  }, () => {

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        overlayRemoverRun();
      },
    });

  });


});
