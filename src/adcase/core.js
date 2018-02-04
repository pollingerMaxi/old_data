
if(document.location.href.toLowerCase().indexOf("showdfpdebug")>0) {
  sessionStorage.setItem('ads.showAdDetails',1);  
  sessionStorage.setItem('ads.showLog',1);
} else if(document.location.href.toLowerCase().indexOf("hidedfpdebug")>0) {
  sessionStorage.removeItem('ads.showAdDetails');  
  sessionStorage.removeItem('ads.showLog');
}
var googletag = {
  cmd: []
};
var script = document.createElement('script');
script.async = true;
script.src = "https://www.googletagservices.com/tag/js/gpt.js";
document.head.appendChild(script);

ads.values = ads.values || {};
ads.formats = {};
ads.existingSlotIds = {}; 
ads.scrollTimeout = true;
ads.printedSlots = {};
ads.showLog = sessionStorage.getItem('ads.showLog');
ads.showAdDetails = sessionStorage.getItem('ads.showAdDetails');
ads.startDisplay = ads.startDisplay || "";
ads.adEvents = [];

var ev = null;

ads.run = function() {

  ads.id = {};

  ads.setAdTypes();
  ads.adTexts = [];
  ads.values = {};
  ads.printedSlots = {};

  var cmd = ads.cmd;
  ads.cmd = [];
  for (var c in cmd) {
    if (cmd[c].cmd == "run") {
      ads.set("manualSlotList", cmd[c].manualSlotList);
      if(!cmd[c].manualSlotList) { ads.adEvents = []; }
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

  var kv = ads.kv || {};

  googletag.pubads().clearTargeting();
  if (ads.getDfpTestValue) {
    googletag.pubads().setTargeting("dfpTest", ads.getDfpTestValue);
  }
  if(Object.keys(kv).length > 0) {
    ads.log("Page level Key-values", kv);
  }
  for (var i in kv) {
    googletag.pubads().setTargeting(i, kv[i].toString());
  }

}

ads.pageLoaded = function(path) {

  ads.googleTagSlots = {};
  // PREPARE SLOTS

  var divs = {};
  // First target slots by slotOrder definition
  if(ads.slotOrder) {
    for(var i in ads.slotOrder) {
      document.getElementById(ads.slotOrder[i]) && (divs[ads.slotOrder[i]] = document.getElementById(ads.slotOrder[i]));
    }
  }

  // Then target remaining slots
  var d = document.getElementsByTagName("ad-slot");
  if (d.length == 0) {
    d = document.getElementsByClassName("ad-slot");
  }
  var existingSlots = {};
  for (var i = 0; i < d.length; i++) {
    var divId = d.item(i).id;
    if(!divs[divId]) {
      divs[divId] = d.item(i);
    } 
    if(existingSlots[divId]) {
      console.log("%cSlot id \"" + divId + "\" is duplicated. Cancelling ads", "background:red; font-size:large"); 
      return;
    }
    existingSlots[divId] = true;

  }

  for (var i in divs) {
    var parent = divs[i];
    var adType = parent.dataset.adtype;
    if(!adType || adType=="") { adType = parent.id; }
    if (!ads.adTypes[adType]) {
      console.log("%c**ERROR** : COULD NOT FIND SIZE DEFINITION FOR " + adType, "color:red");
      continue;
    }
    
    var format = ads.adTypes[adType].adFormat || "default";

    if (!ads.checkDivList(parent.id, parent.dataset.manual)) {
      // if div is set as data-manual, and there is no specific slot list to run
      continue;
    }

    while (parent.firstChild) { // clean and reuse existing div
      parent.removeChild(parent.firstChild);
    }

    parent.style.overflow="hidden";
    parent.innerHTML = "<div id='" + parent.id + "_ad'></div>";

    if(ads.id[parent.id + "_ad"]) {
      console.log("%cSlot id \"" + parent.id + "\" is duplicated. Cancelling ads!", "background:red; font-size:large");
      return false;
    }
    
    var d = parent.id + "_ad";
    ads.id[d] = new ads.instanceAd(format);
    ads.id[d].slot = document.getElementById(d);
    ads.id[d].parentSlot = parent;
    ads.id[d].parentId = parent.id;
    ads.id[d].divId = d;
    ads.id[d].dfpPath = path + parent.id 
    ads.id[d].sizes = ads.adTypes[adType].sizes;
    ads.id[d].format = format;
    ads.id[d].startDisplay();
    
    ads.adSlotList.push (ads.id[d]);
  }



  // Actual DFP slot creation
  googletag.cmd.push(function() {
    if (!ads.get("manualSlotList")) {
      googletag.destroySlots();
    }

    for (var i in ads.id) {
      var d = ads.id[i];
      ads.googleTagSlots[d.divId] = googletag.defineSlot(d.dfpPath, d.sizes, d.divId).addService(googletag.pubads());
      ads.id[i].requestedSizes = d.sizes;
    }

    for (var i in ads.id) {
      googletag.display(ads.id[i].divId);
    }
    if (ads.lazy) {
      ads.scroll();
    }

  });
}
ads.adSlotList = [];

ads.formats.footerFixed = function (t) { };

ads.instanceAd = function(format) {
  //console.log("FORMAT: ",format);
  this.values={};
  this.set = function(name,value) { this.values[name]=value; return this; };
  this.get = function(name) { return (this.values[name]!=null?this.values[name]:null); }
  this.msg = function(){ console.log("msg not set for "+format); }
  ads.formats[format](this);
  this.startDisplay = function() { 
    var d = (this.get("startDisplay") || ads.startDisplay || "");
//    console.log("display:",format,this.get("startDisplay"), ".",ads.startDisplay, "..",d);
    this.parentSlot.style.display = d; 
  }
} 

ads.set = function(k, v) {
  ads.values[k] = v;
}
ads.get = function(k) {
  return ads.values[k] || null;
}

ads.readMessage = function(e) {
  var msg = (e.data && e.data.msg) ? e.data.msg : "";
  if (msg == "adcase") {
    var format = (e.data && e.data.format) ? e.data.format : false;
    var params = e.data.params || {};
    params.action = params.action || false;
    if(params.handle && params.handle > 1) {
//console.log("MSG Format 0   :",e.data)
      ads.id[ads.getIdFromHandle(params.handle)].msg(params);  
    } else if (params.text){
//console.log("MSG Format 1   :",e.data)
      console.log("e.data.params.text",e.data.params.text);
      console.log("**call MatchAds. text:",e.data.params.text, e.data);
      ads.adTexts.push({text:params.text, slotWindow: e.source});
      ads.matchAds();
    } else if (format) {
//console.log("MSG Format 2   :",format,ads.id[ads.getIdFromFormat(format)], e.data)
      ads.id[ads.getIdFromFormat(format)] && ads.id[ads.getIdFromFormat(format)].msg(params);  

    }
  }
}
window.addEventListener("message", ads.readMessage, false);

ads.slotRendered = function(event) {
  var divId = event.slot.getSlotElementId();
  var div = document.getElementById(divId);
  var parentId = document.getElementById(divId).parentElement.id;
  var adFormat = ads.id[divId].format;

  if (!event.isEmpty) {
    div.parentElement.style.height = "";
    var params = {
      div: div,
      containerDiv: div.parentElement,
      width: event.size[0],
      height: event.size[1],
      event: event
    };
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
    }

    ads.id[divId].width = event.size[0];
    ads.id[divId].height = event.size[1];
    //ads.id[divId].startDisplay();
    div.parentElement.style.display = "";

    
    if (ads.id[divId].rendered) {
      ads.id[divId].rendered(params);
    }

  }

  if (ads.allSlotsRenderedCallback) {
      ads.allSlotsRenderedCallback(event, divId);
  }

  if (ads.slotRenderedCallback[parentId]) {
    ads.slotRenderedCallback[parentId](event);
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
        ads.id[slot.getSlotElementId()].set("handle" ,handle);
        ads.id[slot.getSlotElementId()].set("window" ,slotWindow);

        var adParams = ads.styles.push || ads.styles.expand970x250;
        adParams.setSlotHandle = handle;
        slotWindow.postMessage(adParams, "*");
        return false;
      }
    }
  }
  return false;
}

ads.getIdFromHandle = function(handle) {
  for(var i in ads.id) {
    if(ads.id[i].get("handle") == handle) {
      return i;
    }
  }
}
ads.getIdFromFormat = function(format) {
  for(var i in ads.id) {
    if(ads.id[i].format == format) {
      return i;
    }
  }
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

    var prevMinWidth = ( ads.adTypes[t.type] ? ads.adTypes[t.type].minWidth : 0 );
    // add current config to adTypes. 
    if (t.minWidth >= prevMinWidth) {
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
  }, 500);

  //console.log(ads.id );
  for (var i in ads.id) {
    ads.id[i].onScroll && ads.id[i].onScroll();
    if (ads.lazy) {
      var d = ads.id[i];
      if (ads.elementInViewport(d.slot) && !ads.printedSlots[d.divId]) {
        ads.printedSlots[d.divId] = true;
        ads.log(d.divId + " scroll");
        ads.refresh(d.divId, {changeCorrelator: false});
      }
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
    googletag.pubads().refresh([ads.googleTagSlots[divId]], {changeCorrelator: false});
  })
}

ads.enableScroll = function() {
  //console.log("scrollEnabled",true);
  ads.set("scrollEnabled",true);
  window.addEventListener("scroll", function() {
    if (ads.scrollTimeout) {
      ads.scroll()
    }
  });
}

if (ads.lazy) {
   ads.enableScroll();
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

ads.getVideoURL = ads.getVideoURL || function(output, vpos, slot) {

  slot = slot || "preroll";
  output = output || "vast";
  vpos = vpos || "preroll";
  var slotname = "/" + ads.network + ads.router() + slot; 
  //slotname = slotname.substring(0, slotname.length - 1);
  var url = document.location.href;
  var timestamp = new Date().getTime();
  var cust_params = ""; // set key values
  for(var key in ads.kv) {
    value = ads.kv[key] || "";
    cust_params += key+"%3D"+value+"%26";
  }

var url = null;

if(output=="vast") {
  url ="https://pubads.g.doubleclick.net/gampad/ads?"
      +"slotname=" + slotname
      +"&sz=640x480|400x300&ciu_szs=300x250&unviewed_position_start=1"
      +"&output=vast&impl=s&env=vp&gdfp_req=1&ad_rule=0&vad_type=linear&vpos="+vpos
      +"&pod=3&ppos=1&lip=true&min_ad_duration=0&max_ad_duration=30000&vrid=6256"
      +"&cust_params="+cust_params
      +"&url="+url
      +"&video_doc_id=short_onecue&cmsid=496&kfa=0&tfcd=0&correlator="+timestamp;
} else if(output=="vmap") {
  url ="https://pubads.g.doubleclick.net/gampad/ads?"
      +"sz=640x480|400x300&iu="+slotname
      +"&ciu_szs=300x250&ad_rule=1&impl=s&gdfp_req=1&env=vp&output=vmap"
      +"&unviewed_position_start=1"
      +"&cust_params="+cust_params
      +"&cmsid=496&vid=short_onecue&correlator="+timestamp

} 

  return url;
}


ads.debug = function() {
  if(ads.d &&ads.d.clickButton) { 
    ads.d.clickButton();
  } else { 
    var s = document.createElement("script");
    s.src = "https://adcase.io/lib/extension2.js?"+Math.random();
    document.head.appendChild(s);
  }
}

ads.debugButton = function() {
var d = document.createElement("div");
d.innerHTML = `<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
.adcase-button button {font-weight:bold;border-width:0;outline: none;border-radius: 2px;box-shadow: 0 1px 4px rgba(0, 0, 0, .6);background-color: #3498db;color: white;transition: background-color .3s;padding:0;}
.adcase-button button:hover, .adsbtn:focus { background-color: #2980b9; }
.adcase-button span { display: block;padding: 12px 24px;}
</style>
<a href='javascript:ads.debug()' class='adcase-button' style='position:fixed;bottom:25px;left:15px;z-index:10000000'><button id='adcase-button-button'><span id='adcase-button-text'></span></button></a>`;
  document.body.appendChild(d);
}


if(document.location.href.indexOf("ads.debug=true")>0) {
  localStorage.setItem("ads.debug",true);
  localStorage.setItem("adcase-debug-mode",1);
} else if(document.location.href.indexOf("ads.debug=false")>0) {
  localStorage.removeItem("ads.debug");
  localStorage.removeItem("adcase-debug-mode");
}

if(localStorage.getItem("ads.debug")) {
  ads.debugButton();
  if(localStorage.getItem("adcase-debug-mode")*1==2) {
    document.getElementById("adcase-button-text").innerHTML = "overlay";
    localStorage.setItem("adcase-debug-mode",1);
    ads.debug();
  } else {
    localStorage.removeItem("adcase-debug-mode");
    document.getElementById("adcase-button-text").innerHTML = "ads";
  }
}

