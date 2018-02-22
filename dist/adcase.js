//
// AdCase.js JavaScript Library v2.1.11. 22/Feb/2018
// Copyright 2018 adcase.io 
// https://adcase.io
// https://adcase.io/license 
// AdCase.js simplifies the use of both Rich Media and display creatives in Double Click for Publishers (DFP).
// This is not an official Google product, and it is also not officially supported by Google.
//

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

  var adsTest = localStorage.getItem("adcase-adstest");
  try {
    var url = new URL(document.location.href);
    if(url.searchParams.get("adstest") && url.searchParams.get("adstest")!="") { adsTest = url.searchParams.get("adstest"); }
  } catch(e) {}

  if(adsTest=="false") {
    localStorage.removeItem("adcase-adstest")
  } else {  
    if (adsTest && adsTest!="") {
      localStorage.setItem("adcase-adstest", adsTest);
      var d = document.createElement("div");
      d.style="position:fixed;bottom:0;right:0;background-color:#0984e3;color:white;font-weight:bold;font-family:Arial;font-size:13px;padding:4px 10px 4px 10px;z-index:10000000";
      d.innerHTML = "adstest = "+adsTest;
      document.body.appendChild(d);
      googletag.pubads().setTargeting("adstest", adsTest);
    }
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
      return;
    }
    existingSlots[divId] = true;

  }

  for (var i in divs) {
    var parent = divs[i];
    var adType = parent.dataset.adtype;
    if(!adType || adType=="") { adType = parent.id; }
    if (!ads.adTypes[adType]) {
      continue;
    }
    
    var divPosition = null; 
    var divDFPId = parent.id;
    if(parent.id.indexOf("#")>0) {
      divPosition = parent.id.split("#")[1];   
      divDFPId = parent.id.split("#")[0];   
    }
    console.log("divPosition",divPosition, divDFPId);

    
    var format = ads.adTypes[adType].adFormat || "default";

    if (!ads.checkDivList(parent.id, parent.dataset.manual)) {
      continue;
    }

    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }

    parent.style.overflow="hidden";
    parent.innerHTML = "<div id='" + parent.id + "_ad'></div>";

    if(ads.id[parent.id + "_ad"]) {
      return false;
    }
    
    var d = parent.id + "_ad";
    ads.id[d] = new ads.instanceAd(format);
    ads.id[d].slot = document.getElementById(d);
    ads.id[d].divPosition = divPosition;
    ads.id[d].divDFPId = divDFPId;
    ads.id[d].parentSlot = parent;
    ads.id[d].parentId = parent.id;
    ads.id[d].divId = d;
    ads.id[d].dfpPath = path + divDFPId;
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
      if(d.divPosition) {
        ads.googleTagSlots[d.divId] = googletag.defineSlot(d.dfpPath, d.sizes, d.divId).setTargeting("divposition",d.divPosition).addService(googletag.pubads());    
      } else {
        ads.googleTagSlots[d.divId] = googletag.defineSlot(d.dfpPath, d.sizes, d.divId).addService(googletag.pubads());    
      }
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
  this.values={};
  this.set = function(name,value) { this.values[name]=value; return this; };
  this.get = function(name) { return (this.values[name]!=null?this.values[name]:null); }
  this.msg = function(){ }
  ads.formats[format](this);
  this.startDisplay = function() { 
    var d = (this.get("startDisplay") || ads.startDisplay || "");
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
      ads.id[ads.getIdFromHandle(params.handle)].msg(params);  
    } else if (params.text){
      ads.adTexts.push({text:params.text, slotWindow: e.source});
      ads.matchAds();
    } else if (format) {
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

ads.setAdTypes = function() {
  ads.setDevice();

  if (!ads.adTypesMap) {
    return;
  }
  ads.adTypes = {};

  for (var i in ads.adTypesMap) {
    let t = ads.adTypesMap[i];
    t.minWidth = t.minWidth || 0;

    if (t.deviceType) {
      if (ads.device.isMobile && t.deviceType.toLowerCase().indexOf("mobile") < 0 ||
        ads.device.isDesktop && t.deviceType.toLowerCase().indexOf("desktop") < 0) {
        continue;
      }
    }

    let width = window.innerWidth;
    if (t.minWidth && t.minWidth > window.innerWidth) {
      continue;
    }

    var prevMinWidth = ( ads.adTypes[t.type] ? ads.adTypes[t.type].minWidth : 0 );
    if (t.minWidth >= prevMinWidth) {
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
    s.src = "https://cdn.jsdelivr.net/gh/adcase/adcase.js@2/dist/debug.js?"+Math.random();
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


ads.formats.footerFixed = function(t) {

  t.set("startDisplay", "");

  t.msg = function(p) {
    p.expandedHeight && t.set("expandedHeight", p.expandedHeight);
    p.collapsedHeight && t.set("expandedHeight", p.collapsedHeight);
    p.expandedHeight && p.collapsedHeight && t.setExpanding(p);
  }
  t.rendered = function(params) {

  var div = t.slot;
  div.style.display = "inline-block";

  var containerDiv = t.parentSlot;
  containerDiv.style.zIndex = 9000;
  containerDiv.style.background = "none repeat scroll 0 0 transparent";
  containerDiv.style.position = "fixed";
  containerDiv.style.textAlign = "center";
  containerDiv.style.bottom = "0px";
  containerDiv.style.width = "100%";
  containerDiv.style.height = params.height;
  containerDiv.style.minHeight = "0px";
  containerDiv.style.minWidth = "0px";
  
  window.setTimeout(function() { document.getElementById("footerFixed-adText").style.display="";  }, 1);

  var iframe = containerDiv.getElementsByTagName("iframe")[0];
  iframe.style.background = "none repeat scroll 0 0 white";
  iframe.style.margin = "auto";
  iframe.style.height = params.height;
  iframe.style.width = params.width;

  var iconMarginRight = - (params.width / 2) + ads.styles.footerFixed.right;
  var newDiv = document.createElement("div");
  newDiv.innerHTML = "<div id='footerFixed-adText' style='position:absolute;display:none;right:50%;margin-right:"+iconMarginRight+"px;top:"+ads.styles.footerFixed.top+"px;cursor:pointer;' "
            + "onclick=\"document.getElementById('"+div.id+"').parentElement.style.display = 'none'\">"+ads.styles.footerFixed.img+"</div>"
  containerDiv.appendChild(newDiv);
  containerDiv.style.display = "block"
};

  t.setExpanding = function(p) {
    var div = t.slot;
    var containerDiv = t.parentSlot;
    div.addEventListener("mouseover", 
      function() { 
        document.getElementById("footerFixed-adText").style.display="none"; 
        containerDiv.style.height = p.expandedHeight+"px"; 
      }
      , false);
    div.addEventListener("mouseout", 
      function() { 
        document.getElementById("footerFixed-adText").style.display=""; 
        containerDiv.style.height = p.collapsedHeight+"px"; }
      , false);
    containerDiv.style.height = p.collapsedHeight+"px";
  }
}
ads.formats.interstitial = function(t) {
  
 
t.set("startDisplay", "none");

t.msg = function(params) {
  params.height = params.height || t.height;
  params.width = params.width || t.width;

  var div = t.slot;
  var parent = t.parentSlot;
  div.style.position = "fixed";
  div.style.left = "0px";
  div.style.top = "0px";
  if(!params.backgroundColor || params.backgroundColor=="") { params.backgroundColor = "white"; }
  div.style.backgroundColor = params.backgroundColor;
  div.style.width = "100%";
  div.style.height = "100%";
  div.style.zIndex = "100000";

  var marginLeft = -(params.width/2)+"px";
  var marginTop = -(params.height/2)+"px";
  var iconRight = (params.width/2-53) + ads.styles.interstitial.right;
  var iconTop = -(params.height/2) + ads.styles.interstitial.top;

  var iframe = div.getElementsByTagName("iframe")[0];
  if(params.videoURL) {
    if(!params.clicktagURL) {
      return;
    }
    iframe = t.createVideo(params);
  } 

  var iconDiv = document.createElement("div");

  if(params.width == 9999) {
    marginLeft = 0;
    marginTop = 0;
    iconRight = 5;
    iconTop = 5;

    iframe.style.height = "100%";
    iframe.style.width = "100%";
    iframe.style.left = "0";
    iframe.style.top = "0";

    window.addEventListener("resize", function(){ 
      ads.resizeEventTimeout = ads.resizeEventTimeout || false;
      window.clearTimeout(ads.resizeEventTimeout);
      ads.resizeEventTimeout = window.setTimeout(function() { 

        var w = window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth||0;
        var h = window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight||0;
      }, 50);
    }, true);
    var w = window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth||0;
    var h = window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight||0;

  } else {

    iframe.style.height = params.height+"px";
    iframe.style.width = params.width+"px";
    iframe.style.left = "50%";
    iframe.style.top = "50%";

    iconDiv.style.height = params.height+"px";
    iconDiv.style.width  = params.width+"px";
    iconDiv.style.left   = "50%";
    iconDiv.style.top    = "50%";
    iconDiv.style.position = "absolute";
    iconDiv.style.marginLeft= "-55px";
    iconDiv.style.marginTop= "5px";
  }

  iframe.style.position = "absolute";
  iframe.style.marginTop = marginTop;
  iframe.style.marginLeft = marginLeft;
  iframe.style.position = "absolute";

  iconDiv.innerHTML = "<div id='interstitialIconDiv' style='position:absolute;display:none;"
  +"right:" + iconRight + "px; top:" + iconTop + "px;z-index:10000;cursor:pointer' onclick='this.parentElement.innerHTML=\"\";document.getElementById(\"" + div.id + '").style.display="none";document.body.style.overflow="";document.getElementById("' + div.id + "\").innerHTML=\"\"'>"
  + ads.styles.interstitial.img + "</div>";
  div.appendChild(iconDiv);

  window.clearTimeout(ads.interstitialTimeout);
  if(params.autoclose > 0) {
    ads.interstitialTimeout = window.setTimeout(function() { 
     parent.style.display = "none";
     // parent.innerHTML = ""
    }, params.autoclose * 1000);
  }
  window.setTimeout(function() { parent.style.display = "block"; document.body.style.overflow="hidden"; }, 1000); // show interstitial
  window.setTimeout(function() { document.getElementById("interstitialIconDiv") && (document.getElementById("interstitialIconDiv").style.display=""); }, 500); // show [X]
}

t.createVideo = function(params) {
  var video = document.createElement("video");

  if(params.fullscreen) {
    t.width = "100%";
    t.height = "100%";
  }
  video.width = t.width;
  video.height = t.height;
  video.style.margin = "auto";
  video.src = params.videoURL;
  
  t.slot.innerHTML = "";
  t.slot.appendChild(video);
  t.slot.style.display = "";
  t.parentSlot.style.display = "";

  var c = document.createElement("div");
  c.style.width="100%";
  c.style.height="100%";
  c.style.position="fixed";
  c.style.zIndex="10000";
  c.style.top="0px";
  c.style.cursor="pointer";
  c.setAttribute("onclick",  "window.open('"+params.clicktagURL+"', '_blank')" );
  t.slot.appendChild(c);
  video.play();
  window.setTimeout(function(){ video.play() },1000);
  
  return video;

}

}

ads.formats.push = function(t) {

  t.msg = function(p) {

    p.expandedHeight && t.set("expandedHeight", p.expandedHeight);
    p.collapsedHeight && t.set("collapsedHeight", p.collapsedHeight);

    t.parentSlot.style.overflow = "hidden";
  if(p.transition) {
    t.parentSlot.style.transition = "height "+(p.transition/1000)+"s ease-in";  
  }

  if(p.action == "collapse") {
    var height = t.get("collapsedHeight") || 90;
      t.parentSlot.style.height = height + "px";  
    } else if(p.action == "expand") {
    var height = t.get("expandedHeight") || 250;
    t.parentSlot.style.height = height + "px"; 
  }
  }

}


ads.formats.videobanner = function (t) { 

  t.videobannerMsg = function(p) {
    t.set("videoBannerScrollEnabled",true);

    t.get("window").postMessage({ videoButtons: ads.styles.videoButtons } , "*");

    if(!ads.get("scrollEnabled")) {
      ads.enableScroll();
    } else {
      ads.scroll();
    }
  }

  t.videoBannerScroll = function() {

    if (t.elementInViewport()) {
      t.play();
    } else if(!t.elementInViewport()) {
      t.pause();
    }
  }



  t.elementInViewport = function() {
    var rect = t.slot.getBoundingClientRect();

    var wh = (window.innerHeight || document.documentElement.clientHeight);
    var rt = Math.ceil(rect.top);

    var view = false;
    if(rt<=wh-(t.height*0.75) && rt>-(t.height*0.25)) {
      view = true;
    }

    return view;
  }

  t.play = function() {
    t.set("playing",true);
    t.get("window").postMessage({ action:"play" } , "*");
  }
  t.pause = function() {
    t.set("playing",false);
    t.get("window").postMessage({ action:"pause" } , "*");
  }
}


ads.formats.pushonclick = function (t) { 

  t.set("startDisplay", "none");

  t.pushonclickMsg = function(p) {
    p.expandedHeight && t.set("expandedHeight",p.expandedHeight);    
    p.collapsedHeight && t.set("collapsedHeight",p.collapsedHeight);    

    t.parentSlot.style.display = ads.startDisplay;

    if(p.expand) {
        t.parentSlot.style.height = t.get("expandedHeight")+"px"; 
    } else {
        t.parentSlot.style.height = t.get("collapsedHeight")+"px"; 
    }


  }
}



ads.styles = ads.styles || {};
ads.styles.iconClose = ads.styles.iconClose || "data:image/png;base64,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";
ads.styles.footerFixed = ads.styles.footerFixed || { img: "<img height=24 width=24 src='"+ads.styles.iconClose+"'>", top: 0, right:0 };
ads.styles.interstitial = ads.styles.interstitial || { img:"<img src='"+ads.styles.iconClose+"' height=54 width=54 border=0>", top: -25, right:-25}
ads.styles.push = ads.styles.push || {iconsStyle : "width:45px;position:absolute;left:917px;top:0;border:1px solid #ccc;font-family:Arial;font-size:11px;padding:3px;background-color:white;text-align:center;",
                            openIconHTML: "Abrir",
                            closeIconHTML: "Cerrar"
                          }
ads.styles.videoButtons = ads.styles.videoButtons || "<div id='overlay' style='width:100%;height:60px;background-color:white;opacity:0.9;position:absolute;bottom:0px ;z-index:5;display:none'></div>"
         +"<div id='overlay-txt' style='width:100%;height:50px;position:absolute;bottom:0px;z-index:6;display:none'>"
         +  "<div style='float:left;cursor:pointer;margin:0px 0 4px 40px' onclick='replay()'><img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAAAeCAYAAADTsBuJAAAEsUlEQVRoge2aTWhcVRTHfxlSVLow4kJcqIOKFWLJ1ELFhXRSXOhCzmTjQk2agKWKCzPoQqSaCVLcNWYl2kUnZtwomHdxoYI0U10ZWg0l6sKiU8EPEGEWKuLC5+Kc59y+zsebiZln4P1hmHvP133vnHvPPe++BxkyZMiQGkYSyBwCngAeBm4G9hr9d+An4AOgBmx0MxKG4eBXmTJGRpK4aUDbXXgPAK8D48DfwMfAFnDJ+HcC9wAPAjngS+Bp4NN2xrIA9IcVIAQuojM/10U2ZzIXTWelnVAYhrv2N0zsAc6bI+cG0J8z3fNm61+k7cTdEoAtc+D+bdjYbza2fGLaTtwNAaiZ48bb8K4DngHq6Mb7I/CJ0a5tIz9utmoRIW0n/l8DEO0uh4DPgBlgNSYzDbxl7a+BTdM7AOzzZGod9O4DNjrdSKlUKvp951y9v1vYHsIwpFQqVYCJIAim2sns5CY8av/vAN9ytfNfAU6gzn0B+CHGvxV41fTuAl72eKtAxWznu1zDut8RkSYw6ZzbTHgPfUNEZoGGF+wJoLhT43VDDigAtwHHYrzHUOc/h87muPMBvgceN5mXrO3jmNku9LiORefcCDAFjAHPJr+FgXAGz+FBEEwFQXDDDo/ZFqPAcbTOP+vR9wBvA+8BpxLYOYU+N9SAd4G/jH7WbB9HnxG6wjkXiAh4K0ZEKsBh6y475wKP3jTeGNAAys65pvELwEKcZ3oAh61dsTRYDIKgUiqV8sBsJIOW1dUEPhgIOeARYmmA1mqY7sNWJPtkjL5uY/SEOQ3UYYjIEurEhtHXPJkFYImWg2etj4jkbdwCumeV0FkPrWDmvXbR7EX0BXQVRuPuGHLAjcCFGH0G3XD/6MPWb6YzE6NfsDG64aiIrANfoA4ri8gYMI+mpznn3CQ640ueXt05N+mcmwNeozVzoxR2wDlXBhYjPbMDsOK122E5CIK5IAiqPa59W8ihZWQjRt8HfD6AvU3gjhitQftSNS7TtLazNBLNdBGRdQsQtGYtwDmv7Uy44Omumd5R4xUT3YWi3ofswBjtQB+0+B0h2QFfHOeccxURWQMWRKTq8TaBy5EcvdNC0/uPB6iX7tAxCvzJ1WXiJeDeAewVgG9itLyNkQRlNFUsoGkDNDjVDvLXe20BcM41RKQB5J1zlYTjpoZR4FfgYIxeA5bR1NHLeTehKesr4G7gqRj/oI3RE+a8KprLV9DZv2SVEWhuL3v1+7yIRKtjnla14oBZW1HLaHAKsZw/ISLz6N6RGnLA+0B8M3rT/uMPZu1wP1pufogu8Tdi/EkboxPqXJkaFo1WRA/3NtEK5gyaVnzZBlr5LJlOGbScNTtFtBqaxfYIb4xopUV26tZuWrvJkFBAc/6RGH3a6L0eih4yuRB4EbjG4x0xeuG/PmcRkdCr6QdG2mdBOVqb3OkYbxU4iS7RALilgw2/VD0JPO/1T5vtHTtW2O2IqqBH0cO4aa5MOyfQTbWK5tGfgY/QfBst0Q10ieeAX9BaHrN1O3oYlyEBuh1H70VT0QbwHfpuuBuy4+gBkb2QSTkA2SvJlAMQIXspP6QAZJ+lJEBa3wVFyD7MSuG7oAxDwj+s7wq9L116HwAAAABJRU5ErkJggg=='></div>"
         +  "<div style='float:right;cursor:pointer;margin:0px 40px 4px 0px' onclick='goClick()'><img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAAAeCAYAAADTsBuJAAACQ0lEQVRoge2X0ZHaMBCGv2RSgNOBr4KQCvBVsFABUEGOCsAV3HVwoQK8FWAqwB3gdEAJedBqUC4cl9wY+x72m/HYWsvalbT6JYPjOI7jOI7jOI7TK5+GciwiGTACWlVtX7wbAZmq1j3HlANH4ElVl334/NyHkyvsgNUF+xZ47DkWgGeg6WvwYcAJUNUTUAGT1G7ZnwObPuOx7N8D0z79DiZBACIyJ2TdVFUrsz0CD8AdcCKshNyeS1VtrN7abMKFrBWRAiisOAZaoCSsuNzKS1U9mRzOrS2AvaqurZ3M4hnbu7JLaRxagiq7S2KbEAa0JUjUBGgI+8UuqbciTE77StuF1ZnZ93OCvhdJOcrcyOq2hEldichD4ueHfRPb7YwvXTb2v1j2RRlaJPKzFJEJYWDuVbUWkQ1wEJEiycBaVRdvuLlX1TbJ8qmqNlYurE4DfI+HARE5AN/s3Ygb7gtDrwAABTIb8JnZKkLHIWTjjnO2Fsm3+zcbP5+wflm5Scq52U7ARER2InI033nioxCRZ9snOuUjTEAqQ6n8RPbJVQJ11wHYfhLlbMNZbrC9oLTYjpYonTGoBMFfMpQBcam3dv/58j/hBoxJ5ExEZoS9IMa4FpEn4EBYpdXFVt7B4BNgKOfjaOxcTRiErYiUBElYqerXG/g/EWQmymCOJYDJ356wKjJe3/TfxUeQIAiDXpNku90XhE7HH7M082quD0bLn3J1rVxik03Q/4qzDDWEk9DWnst/6I/jOI7jOI7jOI7jOBf5DbA458r1td3dAAAAAElFTkSuQmCC'></div>"
         +"</div>";
ads.styles.default = ads.styles.default || { startDisplay: "none" };

ads.formats.default = function (t) { 
  ads.formats.videobanner(t);
  ads.formats.pushonclick(t);
  t.set("startDisplay", ads.styles.default.startDisplay );

  t.msg = function(p) {
    if(p.action == "videobanner") {
      t.videobannerMsg(p);
    } else if(p.action == "pushonclick") {
      t.pushonclickMsg(p);
    }
  }

  t.onScroll = function() {
    if(t.get("videoBannerScrollEnabled")) {
      t.videoBannerScroll();
    } else {
    }
  }
};

ads.formats.doubletopsticky = function(t) {

  t.msg = function(p) {

    if(p.width && p.width>0) {
    t.set("transition", p.transition);
    t.set("inlineHeight", p.inlineHeight);
    t.set("stickyHeight", p.stickyHeight);
    t.set("maxHeight", Math.max(p.inlineHeight,p.stickyHeight));
      t.set("width",p.width);
      t.slot.parentElement.style.height=t.get("inlineHeight")+"px";
  }
  } 

  t.lastScrollTop = 0;

  window.addEventListener("scroll", function(){
    t.doScroll();
  }, false);

  t.doScroll = function() {
    var offsets = document.getElementById(t.parentSlot.id).getBoundingClientRect();
    var inlineBottom = offsets.top + (t.get("inlineHeight")*1);

    var st = window.pageYOffset || document.documentElement.scrollTop; 
    if (st > t.lastScrollTop){
      if(inlineBottom<0) {
      t.get("window") && !t.get("stickyOn") && t.showSticky(true);
      } else {
        t.get("window") && t.get("stickyOn") && t.showSticky(false);
      }
    } else if (st <= t.lastScrollTop) {
      t.get("window") && t.get("stickyOn") && t.showSticky(false);
   }
   t.lastScrollTop = st;
}
  
  t.showSticky = function(stickyOn) {
    if(stickyOn) {
      t.slot.style.transition = "top 0s ease-in-out";
      t.slot.style.position="fixed";
      t.slot.style.left="50%";
      t.slot.style.marginLeft="-"+(t.get("width")/2)+"px";
      t.slot.style.height = t.get("stickyHeight")+"px";
      t.slot.style.top = '-'+(t.get("stickyHeight")*2)+'px';
      window.setTimeout(function(){ t.slot.style.zIndex=1200; t.slot.style.transition = "top "+(t.get("transition")/1000)+"s ease-in-out"; t.slot.style.top = '45px'; },10);
      t.get("window").postMessage({ sticky:"on" },"*");
    } else {
      t.slot.style.top = '-'+(t.get("stickyHeight")*2)+'px';
      window.setTimeout(function(){ 
        t.slot.style.position="";
        t.slot.style.left="";
        t.slot.style.marginLeft="";
        t.slot.style.height= t.get("inlineHeight")+"px";

        t.slot.style.top="";
        t.get("window").postMessage({ sticky:"off"},"*"); 
      } ,t.get("transition")); 
      
    }
    
    t.set("stickyOn",stickyOn);
  }
  t.fn = function() { 
t.slot.classList.remove("adcase-doubletopsticky");
        t.get("window").postMessage({ sticky:"off"},"*");
    t.slot.style.display="block"; 
    t.slot.style.position="relative"; 
    t.slot.style.top="";
    t.slot.innerHTML=""; 
  }

}

ads.loaded = true;
ads.run();
