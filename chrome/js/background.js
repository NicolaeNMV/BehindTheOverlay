// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Called when the user clicks on the browser action.

var chrome = chrome || browser;

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
