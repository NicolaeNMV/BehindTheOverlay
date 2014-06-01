/**
 * This is a script that will remove overlay popups in the 99% of the cases.
 * It's doing that by detecting DOM elements.
 *
 */

var debug = true;

var utils = (function() {
  function hideElement(element) {
    element.style.display = '';
    var cssText = element.style.cssText || '';
    if (cssText.length > 0 && cssText.slice(-1) != ";")
      cssText += ";";
    // Some pages are using !important on elements, so we must use it too
    element.style.cssText = cssText + 'display: none !important;';
  }

  function isVisible(element) {
    return element.offsetWidth > 0 && element.offsetHeight > 0;
  }

  function getZIndex(element) {
    return parseInt(window.getComputedStyle(element).zIndex);
  }

  function isAnElement(node) {
    return node.nodeType == 1; // nodeType 1 is element
  }

  function nodeListToArray(nodeList) {
    return Array.prototype.slice.call(nodeList);
  }

  function forEachElement(nodeList, functionToApply) {
    nodeListToArray(nodeList).filter(isAnElement).forEach(function(element) {
      functionToApply.call(this, element);
    });
  }

  function collectParrents(element, predicate) {
    var matchedElement = element && predicate(element) ? [element] : [];
    var parent = element.parentNode;

    if (parent && parent != document && parent != document.body) {
      return matchedElement.concat(collectParrents(parent, predicate));
    } else {
      return matchedElement;
    }
  }

  // Calculate the number of DOM elements inside an element
  function elementWeight(element, maxThreshold) {
    var grandTotal = 0;
    var nextElement = element;
    var nextGrandChildNodes = [];

    function calculateBreathFirst(element) {
      var total = 0;
      var nextChildElements = [];

      var childNodes = element.childNodes;
      total = childNodes.length;

      forEachElement(childNodes, function(childNode) {
        var grandChildNodes = nodeListToArray(childNode.childNodes);
        total += grandChildNodes.length;
        nextChildElements = nextChildElements.concat(grandChildNodes.filter(isAnElement));
      });
      return [total, nextChildElements];
    }

    while (nextElement) {
      var tuple_total_nextChildElements = calculateBreathFirst(nextElement);
      var total = tuple_total_nextChildElements[0];

      grandTotal += total;
      nextGrandChildNodes = nextGrandChildNodes.concat(tuple_total_nextChildElements[1]);

      if (grandTotal >= maxThreshold) {
        break;
      } else {
        nextElement = nextGrandChildNodes.pop();
      }
    }

    return grandTotal;
  }

  return {
    hideElement: hideElement,
    isVisible: isVisible,
    getZIndex: getZIndex,
    forEachElement: forEachElement,
    collectParrents: collectParrents,
    elementWeight: elementWeight
  }
})();

var overlayRemover = function(debug, utils) {
  function hideElementsAtZIndexNear(nearElement, thresholdZIndex) {
    var parent = nearElement.parentNode;
    // The case when nearElement is a document
    if (parent === null) {
      return;
    }
    var children = parent.childNodes;

    utils.forEachElement(children, function(child) {
      if (utils.getZIndex(child) >= thresholdZIndex) {
        utils.hideElement(child);
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
    hideElementsAtZIndexNear(overlay, zIndexThreshold);

    return true;
  }

  // Check the element in the middle of the screen
  // Search fo elements that has zIndex attribute
  function methodTwoHideElementMiddle() {
    var overlayPopup = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);

    var overlayFound = utils.collectParrents( overlayPopup, function(el) {
      return utils.getZIndex(el) > 0 && utils.isVisible(el);
    });

    if (debug)
      console.debug("Overlay found: ", overlayFound);

    if (overlayFound.length == 0)
      return false;

    var olderParent = overlayFound.pop();

    if (debug)
      console.debug("Hide parrent: ", olderParent);

    return olderParent;
  }

  function bodyOverflowAuto() {
    var body = document.body;
    if (window.getComputedStyle(body).overflow == "hidden") {
      body.style.overflow = "auto";
    }
  }

  function run() {
    for (var i = 0; i < 10; i++) {
      var candidate = methodTwoHideElementMiddle();
      var first = i == 0;
      if (candidate === false) {
        if (first)
          alert("No overlay has been found on this website.");
        break;
      } else {
        if (!first) {
          // Prevent to hide the actual content
          var weightThreshold = 100;
          var candidateWeight = utils.elementWeight(candidate, weightThreshold)
          if (candidateWeight < weightThreshold) {
            if (debug)
              console.log("Element is too lightweigh, hide it", candidate);
            utils.hideElement(candidate);
          } else {
            if (debug)
              console.log("Element is too heavy, don't hide it", candidate);
          }
        } else {
          utils.hideElement(candidate);
          bodyOverflowAuto();
        }
      }
    }
  }

  return {
    run: run
  };

};

overlayRemoverInstance = overlayRemover(debug, utils);

function overlayRemoverRun() {
  overlayRemoverInstance.run();
}