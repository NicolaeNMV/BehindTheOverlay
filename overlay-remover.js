/**
 * This is a script that will remove overlay popups in the 99% of the cases.
 * It's doing that by detecting the overlay layer and removing everything
 * that has the same z-index stack order or greater.
 *
 * Test:
 * http://www.maddyness.com/accompagnement/formation-accompagnement/2014/05/05/subvention-startup-horizon-2020/
 * http://www.siteslike.com/similar/google.com
 * http://privesc.eu
 * http://www.facenews.ua/articles/2014/198055/
 * http://www.sitepoint.com/using-beacon-image-github-website-email-analytics/
 */

(function(autoInit) {

  var utils = (function() {
    function removeElement(element) {
      element.style.display = "none";
    }

    function isVisible(element) {
      return element.offsetWidth > 0 && element.offsetHeight > 0;
    }

    function getZIndex(element) {
      return parseInt(window.getComputedStyle(element).zIndex);
    }

    function forEachElement(nodeList, functionToApply) {
      for (var i = 0; i < nodeList.length; i++) {
        var node = nodeList[i];
        // Must be an element
        if (node.nodeType != 1) continue;
        functionToApply.call(this, node);
      }
    }

    function collectParrents(element, predicate) {
      var matchedElement = element && predicate(element) ? [element] : [];
      var parent = element.parentNode;

      if (parent && parent != document) {
        return matchedElement.concat(collectParrents(parent, predicate));
      } else {
        return matchedElement;
      }
    }

    return {
      removeElement: removeElement,
      isVisible: isVisible,
      getZIndex: getZIndex,
      forEachElement: forEachElement,
      collectParrents: collectParrents
    }
  })();

  function removeElementsAtZIndexNear(nearElement, thresholdZIndex) {
    var parent = nearElement.parentNode;
    // The case when nearElement is a document
    if (parent === null) {
      return;
    }
    var children = parent.childNodes;

    utils.forEachElement(children, function(child) {
      if (utils.getZIndex(child) >= thresholdZIndex) {
        utils.removeElement(child);
      }
    })
  }

  function methodOneElementTopLeft() {
    var overlay = document.elementFromPoint(0, 0);

    var zIndexThreshold = utils.getZIndex(overlay);

    if (isNaN(zIndexThreshold) || zIndexThreshold == 0) {
      return false;
    }
    // To keep things optimized, we assume that the elements we
    // need to chase are on the same level as our overlay
    removeElementsAtZIndexNear(overlay, zIndexThreshold);

    return true;
  }

  // Check the element in the middle of the screen
  // Search fo elements that has zIndex attribute
  function methodTwoElementMiddle() {
    var overlayPopup = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);

    var overlayFound = utils.collectParrents( overlayPopup, function(el) {
      return utils.getZIndex(el) > 0 && utils.isVisible(el);
    });

    if (overlayFound.length == 0)
      return false;

    var olderParent = overlayFound.pop();
    var zIndexThreshold = utils.getZIndex(olderParent);

    utils.removeElement(olderParent);
    return true;
  }

  function init() {
    for(var i = 0; i < 10; i++) {
      if (methodTwoElementMiddle() == false) {
        if (i == 0)
          alert("There appears to be no overlay");
        break;
      }
    }
  }

  if (autoInit)
    init();

  return {
    init: init
  };

})(true);
