// Load googletag library
/* to enable logs:

javascript:sessionStorage.setItem('ads.showLog',true);
javascript:sessionStorage.setItem('ads.showAdDetails',true);

*/

var googletag = {
  cmd: []
};
var script = document.createElement('script');
script.async = true;
script.src = "https://www.googletagservices.com/tag/js/gpt.js";
document.head.appendChild(script);

ads.formats = [];
ads.existingSlotIds = {}; 
ads.scrollTimeout = true;
ads.printedSlots = {};
ads.showLog = sessionStorage.getItem('ads.showLog');
ads.showAdDetails = sessionStorage.getItem('ads.showAdDetails');

var ev = null;

ads.run = function() {

  ads.list = {};

  ads.setAdTypes();
  ads.adTexts = [];
  ads.adSlotHandles = {};
  ads.adSlotHandlesWindows = {};
  ads.adEvents = [];
  ads.values = {};


  var cmd = ads.cmd;
  ads.cmd = [];
  for (var c in cmd) {
    if (cmd[c].cmd == "run") {
      ads.set("manualSlotList", cmd[c].manualSlotList);
      ads.pageLoaded("/" + ads.network + cmd[c].path);
    }
  }
}

ads.checkDivList = function(divId, isManual) {
  var manualSlotList = ads.get("manualSlotList");
  if (manualSlotList) {
    // there is a list, check if divId is included
    for (var i = 0; i < manualSlotList.length; i++) {
      if (manualSlotList[i] == divId) {
        return true;
      }
    }
    return false;
  }
  if (isManual) {
    // there is no list and current slot is set as manual
    return false;
  }
  // default call: No list, item normal
  return true;

}

ads.setTargeting = function() {

  var kv = ads.kv;

  googletag.pubads().clearTargeting();
  if (ads.getDfpTestValue) {
    googletag.pubads().setTargeting("dfpTest", ads.getDfpTestValue);
  }
  if(Object.keys(ads.kv).length > 0) {
    ads.log("Page level Key-values", kv);
  }
  for (var i in kv) {
    googletag.pubads().setTargeting(i, kv[i].toString());
  }

}

ads.pageLoaded = function(path) {

  // PREPARE SLOTS
  ads.adSlotList = [];
  ads.googleTagSlots = {};
  var divs = document.getElementsByTagName("ad-slot");
  if (divs.length == 0) {
    divs = document.getElementsByClassName("ad-slot");
  }

  for (var i = 0; i < divs.length; i++) {
    var parent = divs.item(i);
    var adType = parent.dataset.adtype;
    if (!ads.adTypes[adType]) {
      ads.log("%c**ERROR** : COULD NOT FIND SIZE DEFINITION FOR " + adType, "color:red");
      continue;
    }

    if (!ads.checkDivList(parent.id, parent.dataset.manual)) {
      // if div is set as data-manual, and there is no specific slot list to run
      continue;
    }

    while (parent.firstChild) { // clean and reuse existing div
      parent.removeChild(parent.firstChild);
    }

    parent.style.overflow="hidden";
    parent.innerHTML = "<div id='" + parent.id + "_ad'></div>";

    if(ads.list[parent.id + "_ad"]) {
      ads.log("%cSlot id \"" + parent.id + "\" is duplicated. Cancelling ads!", "background:red; font-size:large");
      return false;
    }
    ads.list[parent.id + "_ad"] = {
      dfpPath: path + parent.id,
      sizes: ads.adTypes[adType].sizes,
      adFormat: ads.adTypes[adType].adFormat,
    };
    ads.adSlotList.push({
      divId: parent.id + "_ad",
      dfpPath: path + parent.id,
      sizes: ads.adTypes[adType].sizes,
      adFormat: ads.adTypes[adType].adFormat
    });
  }



  // Actual DFP slot creation
  googletag.cmd.push(function() {
    if (!ads.get("manualSlotList")) {
      googletag.destroySlots();
    }

    for (var i in ads.adSlotList) {
      var d = ads.adSlotList[i];
      ads.googleTagSlots[d.divId] = googletag.defineSlot(d.dfpPath, d.sizes, d.divId).addService(googletag.pubads());
    }

    for (var i in ads.adSlotList) {
      googletag.display(ads.adSlotList[i].divId);
    }
    if (ads.lazy) {
      ads.scroll();
    }

  });
}

ads.set = function(k, v) {
  ads.values[k] = v;
}
ads.get = function(k) {
  return ads.values[k] || null;
}

ads.setAdSlotWindow = function(divId, slotWindow) {
  for (var i in ads.adSlotList) {
    if (ads.adSlotList[i].divId == divId) {
      ads.adSlotList[i].slotWindow = slotWindow;
    }
  }
}

ads.readMessage = function(e) {
  var msg = (e.data && e.data.msg) ? e.data.msg : "";
  if (msg == "adcase") {
    var format = (e.data && e.data.format) ? e.data.format : false;
    if (format && ads.formats[format] && ads.formats[format].msg) {
      e.data.params = e.data.params || {};
      e.data.params.adSlot = false;
      if(e.data.params.handle && ads.adSlotHandles[e.data.params.handle]) {
        e.data.params.adSlot = ads.adSlotHandles[e.data.params.handle];
      }
      ads.formats[format].msg(e.data.params, e.source);
    }
  }
}
window.addEventListener("message", ads.readMessage, false);

ads.showAdDetails = function(event) {
  var divId = event.slot.getSlotElementId();
  var div = document.getElementById(divId);
  var network = event.slot.getAdUnitPath().split("/")[1];
  var orderURL = "https://www.google.com/dfp/"+network+"?#delivery/OrderDetail/orderId="+event.campaignId;
  var lineItemURL = "https://www.google.com/dfp/"+network+"?#delivery/LineItemDetail/lineItemId="+event.lineItemId;
  var creativeURL = "https://www.google.com/dfp/"+network+"?#delivery/CreativeDetail/creativeId="+event.creativeId;

  var logHTML = "<table style='margin:0 auto;background-color:white;'>" 
                +"<tr><td style='text-align:left' colspan=2><b>" + div.parentElement.id + "</b>: " + event.slot.getAdUnitPath() +"</td></tr>"
                +"<tr><td width=10 style='text-align:left'>Size:</td><td style='text-align:left'>" + event.size[0] + " x " + event.size[1] +"</td></tr>"
                +"<tr><td style='text-align:left'>Advertiser:</td><td style='text-align:left'>" + event.advertiserId +"</td></tr>"
                +"<tr><td style='text-align:left'>Order:</td><td style='text-align:left'><a href='"+orderURL+"' target=_blank>"+event.campaignId+"</a></td></tr>" 
                +"<tr><td style='text-align:left'>LineItem:</td><td style='text-align:left'><a href='"+lineItemURL+"' target=_blank>"+event.lineItemId+"</a></td></tr>" 
                +"<tr><td style='text-align:left'>Creative:</td><td style='text-align:left'><a href='"+creativeURL+"' target=_blank>"+event.creativeId+"</a></td></tr>" 
//                +"<br>Targeting: " + event.slot.getTargetingKeys() 

               +"</table>"

  div.parentElement.style.position = "relative";
  newDiv=document.createElement("div");
  newDiv.style.position="absolute";
  newDiv.style.top=0;
  newDiv.style.fontSize="11px";
  newDiv.style.textAlign="center";
  newDiv.style.zIndex=10000;
  newDiv.style.opacity=0.9;
  newDiv.style.width="100%";
  newDiv.style.height="100%";
  newDiv.innerHTML = logHTML;
  div.parentElement.appendChild(newDiv);
}
ads.slotRendered = function(event) {
  var divId = event.slot.getSlotElementId();
  var div = document.getElementById(divId);
  if(ads.showAdDetails) {
    ads.showAdDetails(event);
  }


  var parentId = document.getElementById(divId).parentElement.id;
  var adFormat = ads.list[divId].adFormat;
  var params = {
    div: div,
    containerDiv: div.parentElement,
    width: event.size[0],
    height: event.size[1],
    event: event
  };
  if (!event.isEmpty) {
    if(ads.showLog) {
      var logTxt = { " path": event.slot.getAdUnitPath(),
                     advertiserId: event.advertiserId, 
                     orderId: event.campaignId,
                     lineItemId: event.lineItemId,
                     creativeId: event.creativeId,
                     sizeWidth: event.size[0],
                     sizeHeight: event.size[1],
                     slotTargeting: event.slot.getTargetingKeys()
                    };
      ads.log(logTxt);
    }

    div.parentElement.style.display = 'block';
    div.parentElement.style.width = "100%"; 
    if (ads.formats[adFormat] && ads.formats[adFormat].rendered) {
      ads.formats[adFormat].rendered(params);
    }
  }

  if (ads.slotRenderedCallback[parentId]) {
    ads.slotRenderedCallback[parentId](adEvent);
  }
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

ads.getFormatFromDivId = function(divId) {
  var adFormat = null;
  for (var i in ads.adSlotList) {
    if (ads.adSlotList[i].divId == divId && ads.adSlotList[i].adFormat) {
      adFormat = ads.adSlotList[i].adFormat;
      break;
    }
  }
  return adFormat;
}
ads.getDivIdFromFormat = function(format) {
  var divId = null;

  for (var i in ads.adSlotList) {
    if (ads.adSlotList[i].adFormat == format) {
      divId = ads.adSlotList[i].divId;
      break;
    }
  }
  return divId;
}

/* convert adTypesMap into adTypes */
ads.setAdTypes = function() {
  ads.setDevice();

  if (!ads.adTypesMap) {
    return;
  }
  ads.adTypes = {};

  for (var i in ads.adTypesMap) {
    let t = ads.adTypesMap[i];
    t.minWidth = t.minWidth || 0;

    // check device type
    if (t.deviceType) {
      if (ads.device.isMobile && t.deviceType.toLowerCase().indexOf("mobile") < 0 ||
        ads.device.isDesktop && t.deviceType.toLowerCase().indexOf("desktop") < 0) {
        continue;
      }
    }

    // check screen size
    let width = window.innerWidth;
    if (t.minWidth && t.minWidth > window.innerWidth) {
      continue;
    }

    // add current config to adTypes. 
    if (t.minWidth == 0 || (ads.adTypes[t.type] && ads.adTypes[t.type].minWidth && ads.adTypes[t.type].minWidth < t.minWidth)) {
      // Replaces only if current minWith > last one
      ads.adTypes[t.type] = {
        sizes: t.sizes,
        adFormat: (t.adFormat || false),
        minWidth: t.minWidth
      }
    }
  }


}

ads.setDevice = function() {
  ads.device = {
    isMobile: (/Mobi/.test(navigator.userAgent)),
    isTablet: (screen.width < 800 || screen.height < 800),
    isDesktop: !(/Mobi/.test(navigator.userAgent))
  }
}

ads.scroll = function() {
  ads.scrollTimeout = false;
  setTimeout(function() {
    ads.scrollTimeout = true;
  }, 100);

  for (var i in ads.adSlotList) {
    var d = ads.adSlotList[i];
    if (ads.elementInViewport(document.getElementById(d.divId)) && !ads.printedSlots[d.divId]) {

      ads.printedSlots[d.divId] = true;
      ads.log(d.divId + " scroll");
      ads.refresh(d.divId);
    }
  }
}

ads.elementInViewport = function(el) {
  var rect = el.getBoundingClientRect()

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.top <= (window.innerHeight || document.documentElement.clientHeight)
  ) || (rect.top < 0 && rect.top > -300)
}

ads.refresh = function(divId) {
  ads.log("Refresh divId:" + divId);
  googletag.cmd.push(function() {
    googletag.pubads().refresh([ads.googleTagSlots[divId]])
  })
}

if (ads.lazy) {
  window.addEventListener("scroll", function() {
    if (ads.scrollTimeout) {
      ads.scroll()
    }
  });
}


googletag.cmd.push(function() {
  googletag.destroySlots();

  ads.setTargeting();

  googletag.pubads().addEventListener('slotRenderEnded',
    function(event) {
      ads.adEvents.push(event);
      ads.slotRendered(event);
    }
  );
  googletag.pubads().setCentering(true);
  googletag.pubads().collapseEmptyDivs();
  googletag.pubads().enableAsyncRendering();
  googletag.pubads().enableSingleRequest();
  if (ads.lazy) {
    googletag.pubads().disableInitialLoad();
  }
  googletag.enableServices();
});

ads.log = function() { 
  if(!ads.showLog) {
    return (function() {})
  } 
  return Function.prototype.bind.call(console.log);
}();
