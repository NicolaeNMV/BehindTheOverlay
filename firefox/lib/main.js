var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var data = require("sdk/self").data;

function actionClickHandler(state) {
  tabs.activeTab.attach({
    contentScriptFile: data.url("overlay_remover.js"),
    contentScript: "overlayRemoverRun();"
  });
}

var button = buttons.ActionButton({
  id: "behindtheoverlay-button",
  label: "Remove the overlay from this page.",
  icon: {
    "16": "./courtain_16.png",
    "32": "./courtain_32.png",
    "64": "./courtain_64.png"
  },
  onClick: actionClickHandler
});