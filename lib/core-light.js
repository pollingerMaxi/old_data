ads.formats = {};
ads.adTexts = [];
ads.adSlotHandles = {};
ads.adSlotHandlesWindows = {};
ads.adEvents = [];

ads.readMessage = function(e) {
  var msg = (e.data && e.data.msg) ? e.data.msg : "";
  if (msg == "adcase") {
    var format = (e.data && e.data.format) ? e.data.format : false;
    if (format && ads.formats[format] && ads.formats[format].msg) {
      e.data.params = e.data.params || {};
      e.data.params.adSlot = false;
      if(e.data.params.handle && e.data.params.handle > 1 && ads.adSlotHandles[e.data.params.handle]) {
        e.data.params.adSlot = ads.adSlotHandles[e.data.params.handle];
      }
      ads.formats[format].msg(e.data.params, e.source);
    }
  }
}
window.addEventListener("message", ads.readMessage, false);

ads.getDivIdFromFormat = function(format) {
  if(ads.slotIds && ads.slotIds[format]) {
    return ads.slotIds[format];
  }
  return false;
}

ads.matchAds = function() {
  for (var i in ads.adTexts) {
    var text = ads.adTexts[i].text;
    for (var j in text.split(/\r\n|\r|\n/)) {
      j2 = text.split("\n")[j].split("=");
      if (j2[1] && j2[1] > 10000) {
        ads.searchSlots(j2[1], ads.adTexts[i].slotWindow);
      }
    }

  }
}

ads.searchSlots = function(param, slotWindow) {
  for (var i in ads.adEvents) {
    var slot = ads.adEvents[i].slot;
    for (var j in slot) {
      if (slot[j] == param && !ads.adEvents[i].slotWindow) {
        ads.adEvents[i].slotWindow = slotWindow;
        var handle = Math.round(Math.random() * 10000000) + 10000000;
        ads.adSlotHandles[handle] = document.getElementById(slot.getSlotElementId());
        ads.adSlotHandlesWindows[handle] = slotWindow;
        var adParams = ads.styles.expand970x250;
        adParams.setSlotHandle = handle;
        slotWindow.postMessage(adParams, "*");
        return false;
      }
    }
  }
  return false;
}

ads.defaultFormat = {
  msg: function(){ },
  config: { startHidden: false }
}