//
// AdCase.js JavaScript Library v3.1.1 28/Jun/2018
// Copyright 2018 adcase.io.
// https://adcase.io
// https://adcase.io/license
// AdCase.js simplifies the use of both Rich Media and display creatives in
// Double Click for Publishers (DFP).
// This is not an official Google product, and it is not officially
// supported by Google in any way.
//
var ads = ads || {};
ads.version = (ads.light ? "adcase.js light" : "adcase.js full") + " v3.1.1";
ads.logData = (ads.light ? "L" : "F") + ".3.1.1";

if(ads.loadStyles !== false) {
  ads.loadStyles = true;
}

var googletag = googletag || {
  cmd: []
};

ads.values = ads.values || {};
ads.formats = {};
ads.setup = false;
ads.loaded = true;
ads.styles = ads.styles || {};
ads.kv = ads.kv || {};
ads.slotMsgCallback = ads.slotMsgCallback || {};


ads.resetValues = function() {
  "use strict";
  ads.scrollTimeout = true;
  ads.printedSlots = {}; // used by lazy loading
  ads.startDisplay = "";
  ads.adEvents = [];
  ads.adTexts = [];
  ads.id = {};
  ads.startTime = Date.now();
};

ads.run = function() {
  "use strict";
  var e = null;
  if(ads.lazy) {
    ads.enableScroll();
  }
  if(!ads.setup) {
    ads.setup = true;

    if(ads.slots) {
      Object.keys(ads.slots).forEach(function(i, index) {
        var s = ads.slots[i];
        if(s.id && s.adtype && !document.getElementById(s.id)) {
          var d = document.createElement("div");
          d.classList.add("ad-slot");
          d.id = s.id;
          d.dataset.adtype = s.adtype;
          if(s.position && s.position.in) {
            e = document.getElementById(s.position.in);
            if(s.position.in === "body") {
              e = document.body;
            }
            if(e && e.childNodes) {
              var c = 1;
              var created = false;
              var skip = false;
              Object.keys(e.childNodes).forEach(function(j, index) {
                if(s.position.findTag &&
                  e.childNodes[j].tagName.toLowerCase() !==
                  s.position.findTag.toLowerCase()) {
                  skip = true;
                }
                if(s.position.findClass && !e.childNodes[j].classList
                  .contains(
                    s.position.findClass)) {
                  skip = true;
                }
                if(!skip && c === s.position.beforePosition) {
                  e.insertBefore(d, e.childNodes[j]);
                  created = true;
                  skip = true;
                }
                c = c + 1;
              });
              if(!created) {
                e.insertBefore(d, null);
              }
            }

          } else if(s.position && s.position.after) {
            e = document.getElementById(s.position.after);
            //d.innerHTML="AFTER "+s.position.after;
            if(e && e.parentElement && e.nextSibling) {
              e.parentElement.insertBefore(
                d, e.nextSibling);
            }
          } else if(s.position && s.position.before) {
            e = document.getElementById(s.position.before);
            //d.innerHTML="BEFORE "+s.position.before;
            if(e && e.parentElement) {
              e.parentElement.insertBefore(d, e);
            }
          } else {
            document.body.appendChild(d);
          }
        }
      });
    }
    googletag.cmd.push(function() {
      googletag.destroySlots();

      ads.setTargeting();

      googletag.pubads().addEventListener("slotRenderEnded",
        function(event) {
          ads.adEvents.push(event);
          ads.slotRendered(event);
        }
      );
      if(ads.addPageURL || ads.page_url_domain) {
        googletag.pubads().set("page_url", window.location.origin || (
          window.location.protocol + "//" + window.location.hostname +
          (window.location.port ? ":" + window.location.port : "")));
      } else if(ads.page_url) {
        googletag.pubads().set("page_url", ads.page_url);
      }
      googletag.pubads().setCentering(true);
      googletag.pubads().collapseEmptyDivs();
      googletag.pubads().enableAsyncRendering();
      googletag.pubads().enableSingleRequest();
      if(ads.lazy) {
        googletag.pubads().disableInitialLoad();
      }
      googletag.enableServices();
    });

    ads.id = {};

    ads.setAdTypes();
    ads.adTexts = [];
    ads.printedSlots = {};
  }

  var cmd = ads.cmd;
  ads.cmd = [];

  Object.keys(cmd).forEach(function(c, index) {

    if(cmd[c].cmd === "run") {
      if(cmd[c].refresh) {
        googletag.cmd.push(function() {
          googletag.destroySlots();
          ads.setTargeting();
        });
        ads.resetValues();
      }
      ads.pageLoaded({
        path: "/" + ads.network + cmd[c].path,
        refresh: cmd[c].refresh
      });
    }
  });
};

ads.setTargeting = function() {
  "use strict";

  var kv = ads.kv || {};

  googletag.pubads().clearTargeting();

  var adsTest = localStorage.getItem("adcase-adstest");
  var saveAdstest = false;
  try {
    var url = new URL(document.location.href);
    if(url.searchParams.get("adstest") && url.searchParams.get("adstest") !==
      "") {
      adsTest = url.searchParams.get("adstest");
      saveAdstest = url.searchParams.get("save");
    }
  } catch(ex) {

  }

  if(adsTest === "false") {
    localStorage.removeItem("adcase-adstest");
  } else {
    if(adsTest && adsTest !== "") {
      if(saveAdstest === "0") {
        localStorage.removeItem("adcase-adstest");
      } else {
        localStorage.setItem("adcase-adstest", adsTest);
      }
      var d = document.createElement("div");
      d.style = "position:fixed;bottom:0;right:0;background-color:" +
        "#0984e3;color:white;font-weight:bold;font-family:Arial;" +
        "font-size:13px;padding:4px 10px 4px 10px;z-index:10000000";
      d.innerHTML = "adstest = " + adsTest;
      document.body.appendChild(d);
      googletag.pubads().setTargeting("adstest", adsTest);
    }
  }
  if(Object.keys(kv).length > 0) {
    ads.log("Page level Key-values", kv);
  }
  Object.keys(kv).forEach(function(i, index) {
    googletag.pubads().setTargeting(i, kv[i]);
  });
};

ads.pageLoaded = function(params) {
  "use strict";
  var path = params.path;

  ads.googleTagSlots = {};
  // PREPARE SLOTS

  var divs = {};
  // First target slots by slotOrder definition
  if(ads.slotOrder) {
    Object.keys(ads.slotOrder).forEach(function(i, index) {
      if(document.getElementById(ads.slotOrder[i])) {
        divs[ads.slotOrder[i]] = document.getElementById(ads.slotOrder[i]);
      }
    });
  }

  // Then target remaining slots
  var searchDivs = document.getElementsByTagName("ad-slot");
  if(searchDivs.length === 0) {
    searchDivs = document.getElementsByClassName("ad-slot");
  }
  Object.keys(searchDivs).forEach(function(i, index) {
    var divId = searchDivs.item(i).id;
    if(divs[divId]) {
      ads.log("********Error! ExistingSlot: ", divId);
    } else if(!ads.id[divId + "_ad"]) {
      divs[divId] = searchDivs.item(i);
    }
  });
  ads.log("target divs", divs);

  Object.keys(divs).forEach(function(i, index) {
    var parent = divs[i];
    parent.style.height = "0px";
    var adType = parent.dataset.adtype;
    if(!adType || adType === "") {
      adType = parent.id;
    }
    if(ads.adTypes[adType]) {

      var divPosition = null;
      var divDFPId = parent.id;
      if(parent.id.indexOf("#") > 0) {
        divPosition = parent.id.split("#")[1];
        divDFPId = parent.id.split("#")[0];
      }

      var format = ads.adTypes[adType].adFormat || "default";

      while(parent.firstChild) {
        parent.removeChild(parent.firstChild);
      }

      if(format === "interstitial" || format === "footerFixed") {
        var newParent = parent.cloneNode(true);
        parent.parentNode.removeChild(parent);
        parent = newParent;
        document.body.appendChild(parent);
      }

      parent.style.overflow = "hidden";
      if(ads.startHeight) {
        parent.style.height = ads.startHeight;
      }
      parent.innerHTML = "<div id='" + parent.id + "_ad'></div>";

      var kv = {};
      if(parent.dataset.kv) {
        try {
          kv = JSON.parse(parent.dataset.kv);
        } catch(ex) {
          ads.log("*** ERROR: wrong KV in " + parent.id, parent.dataset.kv);
        }
      }

      var d = parent.id + "_ad";
      ads.id[d] = new ads.instanceAd(format);
      ads.id[d].slot = document.getElementById(d);
      ads.id[d].oop = (ads.id[d].slot.parentElement.dataset.oop || false);
      ads.id[d].divPosition = divPosition;
      ads.id[d].divDFPId = divDFPId;
      ads.id[d].parentSlot = parent;
      ads.id[d].parentId = parent.id;
      ads.id[d].divId = d;
      ads.id[d].dfpPath = path + divDFPId;
      ads.id[d].sizes = ads.adTypes[adType].sizes;
      ads.id[d].format = format;
      ads.id[d].kv = kv;
      ads.id[d].startDisplay();
    }
  });
  // Actual DFP slot creation
  googletag.cmd.push(function() {
    Object.keys(divs).forEach(function(i, index) {
      if(ads.id[i + "_ad"]) {
        var d = ads.id[i + "_ad"];
        d.startTime = new Date().getTime();
        if(d.oop) {
          ads.googleTagSlots[d.divId] = googletag.defineOutOfPageSlot(
            d.dfpPath,
            d.divId).addService(googletag.pubads());
        } else {
          ads.googleTagSlots[d.divId] = googletag.defineSlot(d.dfpPath,
            d.sizes,
            d.divId).addService(googletag.pubads());
        }
        if(d.divPosition) {
          d.kv.divposition = d.divPosition;
        }
        Object.keys(d.kv).forEach(function(j, index) {
          if(d.kv.hasOwnProperty(j)) {
            ads.googleTagSlots[d.divId].setTargeting(j, d.kv[j]);
          }
        });
        ads.id[i + "_ad"].requestedSizes = d.sizes;
      }
    });

    Object.keys(divs).forEach(function(i, index) {
      if(ads.id[i + "_ad"]) {
        googletag.display(ads.id[i + "_ad"].divId);
      }
    });
    if(ads.lazy) {
      ads.scroll();
    }

  });
};

ads.instanceAd = function(format) {
  "use strict";
  this.values = {};
  this.set = function(name, value) {
    this.values[name] = value;
    return this;
  };
  this.get = function(name) {
    return(this.values[name] !== null ? this.values[name] : null);
  };
  this.msg = function() {
    "n";
  };
  if(ads.formats[format]) {
    ads.formats[format](this);
  }
  this.startDisplay = function() {
    var d = (this.get("startDisplay") || ads.startDisplay || "");
    this.parentSlot.style.display = d;
  };
};

ads.set = function(k, v) {
  "use strict";
  ads.values[k] = v;
};
ads.get = function(k) {
  "use strict";
  return ads.values[k] || null;
};

ads.slotRendered = function(event) {
  "use strict";

  var divId = event.slot.getSlotElementId();
  var div = document.getElementById(divId);
  var parentId = document.getElementById(divId).parentElement.id;
  var adFormat = ads.id[divId].format;

  ads.id[divId].endTime = new Date().getTime();
  ads.id[divId].renderedTime = ads.id[divId].endTime - ads.id[divId].startTime;

  if(!event.isEmpty) {
    div.parentElement.style.height = "";
    var params = {
      div: div,
      containerDiv: div.parentElement,
      width: event.size[0],
      height: event.size[1],
      event: event
    };

    ads.id[divId].width = event.size[0];
    ads.id[divId].height = event.size[1];
    if(ads.id[divId].format == "footerFixed" && event.size[1] > 110) {
      ads.id[divId].parentSlot.style.height = "0px";
    }
    //ads.id[divId].startDisplay();
    div.parentElement.style.display = "";

    if(adFormat == "default") {
      div.style.display = "";
    }

    if(ads.id[divId].rendered) {
      ads.id[divId].rendered(params);
    }

  }

  if(ads.allSlotsRenderedCallback) {
    ads.allSlotsRenderedCallback(event, divId);
  }

  if(ads.slotRenderedCallback[parentId]) {
    ads.slotRenderedCallback[parentId](event);
  }
};

ads.setAdTypes = function() {
  "use strict";
  if(!ads.adTypesMap) {
    return;
  }
  ads.adTypes = {};

  Object.keys(ads.adTypesMap).forEach(function(i, index) {
    var skip = false;
    var t = ads.adTypesMap[i];
    t.minWidth = t.minWidth || 0;
    t.type = t.adtype || t.type || "";

    if(t.deviceType) {
      if(ads.device.isMobile && t.deviceType.toLowerCase().indexOf(
          "mobile") <
        0 ||
        ads.device.isDesktop && t.deviceType.toLowerCase().indexOf(
          "desktop") <
        0) {
        skip = true;
      }
    }
    if(!skip) {
      //      var width = (ads.device.isMobile ? screen.width : window.innerWidth);
      if(t.minWidth && t.minWidth > window.innerWidth) {
        skip = true;
      }
    }

    if(!skip) {

      var prevMinWidth = (ads.adTypes[t.type] ? ads.adTypes[t.type].minWidth :
        0);
      if(t.minWidth >= prevMinWidth) {
        ads.adTypes[t.type] = {
          sizes: t.sizes,
          adFormat: (t.adFormat || false),
          minWidth: t.minWidth
        };
      }
    }
  });
};

ads.setDevice = function() {
  "use strict";

  ads.device = {
    isMobile: (/Mobi/.test(navigator.userAgent)),
    isTablet: (screen.width < 800 || screen.height < 800),
    isDesktop: !(/Mobi/.test(navigator.userAgent))
  };
};

ads.scroll = function() {
  "use strict";

  ads.scrollTimeout = false;
  setTimeout(function() {
    ads.scrollTimeout = true;
  }, 500);

  Object.keys(ads.id).forEach(function(i, index) {
    if(ads.id[i].onScroll) {
      ads.id[i].onScroll();
    }
    if(ads.lazy) {
      var d = ads.id[i];
      if(ads.elementInViewport(d.slot) && !ads.printedSlots[d.divId]) {
        ads.printedSlots[d.divId] = true;
        ads.refresh(d.divId, {
          changeCorrelator: false
        });
      }
    }
  });
};

ads.elementInViewport = function(el) {
  "use strict";

  var rect = el.getBoundingClientRect();

  var tooLeft = (rect.left < 0);
  var tooBottom = (rect.top - 300) > (ads.device.isMobile ? screen.height : (
    window.innerHeight || document.documentElement.clientHeight));
  var tooTop = (rect.bottom < 0);

  var viewable = !tooLeft && !tooBottom && !tooTop;
  return viewable;
};

ads.refresh = function(divId) {
  "use strict";

  ads.id[divId].startTime = new Date().getTime();
  googletag.cmd.push(function() {
    googletag.pubads().refresh([ads.googleTagSlots[divId]], {
      changeCorrelator: false
    });
  });
};

ads.enableScroll = function() {
  "use strict";

  ads.set("scrollEnabled", true);
  window.addEventListener("scroll", function() {
    if(ads.scrollTimeout) {
      ads.scroll();
    }
  });
};


ads.debug = function() {
  "use strict";

  if(ads.d && ads.d.clickButton) {
    ads.d.clickButton();
  } else {
    var s = document.createElement("script");
    s.src = "https://storage.googleapis.com/adcase.io/dist/3/debug.js?" +
      Math.random();
    document.head.appendChild(s);
  }
};

ads.debugButton = function() {
  "use strict";

  var d = document.createElement("link");
  d.href = "https://fonts.googleapis.com/css?family=Roboto%20Mono";
  d.rel = "stylesheet";
  d.type = "text/css";
  document.head.appendChild(d);

  d = document.createElement("div");
  d.innerHTML = "<meta name='viewport' content='width=device-width, " +
    "initial-scale=1.0'>" +
    "<style>.adcase-button button {font-weight:bold;border-width:0;" +
    "  outline: none;border-radius: 2px;box-shadow: 0 1px 4px rgba(0, 0, 0, .6);" +
    "  background-color: #3498db;color: white;transition: background-color .3s;" +
    "  padding:0;}" +
    ".adcase-button button:hover, .adsbtn:focus { background-color: #2980b9; }" +
    ".adcase-button span { display: block;padding: 12px 24px;}" +
    "</style>" +
    "<a href='javascript:ads.debug()' class='adcase-button' style='position:fixed;" +
    "bottom:25px;left:15px;z-index:10000000'><button id='adcase-button-button'>" +
    "<span id='adcase-button-text' style='font-size:14px'></span></button></a>";

  document.body.appendChild(d);
};

ads.checkDebug = function() {
  "use strict";

  if(document.location.href.indexOf("ads.debug=true") > 0) {
    localStorage.setItem("ads.debug", true);
    localStorage.setItem("adcase-debug-mode", 1);
  } else if(document.location.href.indexOf("ads.debug=false") > 0) {
    localStorage.removeItem("ads.debug");
    localStorage.removeItem("adcase-debug-mode");
  }

  if(localStorage.getItem("ads.debug")) {
    ads.debugButton();
    if(localStorage.getItem("adcase-debug-mode") * 1 == 2) {
      document.getElementById("adcase-button-text").innerHTML = "overlay";
      localStorage.setItem("adcase-debug-mode", 1);
      ads.debug();
    } else {
      localStorage.removeItem("adcase-debug-mode");
      document.getElementById("adcase-button-text").innerHTML = "ads";
    }
  }
};

ads.log = ads.log || (function(a, b, c) {
  "use strict";

  if(localStorage.getItem("ads.debug")) {
    if(b === undefined) {
      console.log(a);
    } else if(c === undefined) {
      console.log(a, b);
    } else {
      console.log(a, b, c);
    }
  }
});

ads.startProcess = function() {
  "use strict";

  ads.resetValues();
  ads.checkDebug();
  ads.setDevice();

  if(ads.light) {
    ads.slotRendered = function(event) {
      ads.adEvents.push(event);
      var d = event.slot.getSlotElementId();
      var slot = document.getElementById(d);
      var parent = slot.parentElement;
      parent.id = parent.id || d + "_parent";
      var format = slot.dataset.format || "default";
      ads.id[d] = new ads.instanceAd(format);
      ads.id[d].slot = slot;
      ads.id[d].parentSlot = parent;
      ads.id[d].parentId = parent.id;
      ads.id[d].divId = d;
      ads.id[d].event = event;
      ads.id[d].format = format;
      if(event.isEmpty) {
        ads.id[d].width = 0;
        ads.id[d].height = 0;
      } else {
        slot.style.display = "";
        ads.id[d].width = event.size[0];
        ads.id[d].height = event.size[1];
      }

      if(ads.id[d].rendered) {
        var params = {
          width: event.size[0],
          height: event.size[1],
          event: event
        };
        ads.id[d].rendered(params);
      }
    };
    googletag.cmd.push(function() {
      googletag.pubads().addEventListener("slotRenderEnded", function(
        event) {
        ads.slotRendered(event);
        if(googletag.pubads().getTargeting("adcase").length === 0) {
          ads.log(
            "******   ERROR   ****   Please set adcase key   *******"
          );
          ads.log(
            "googletag.pubads().setTargeting('adcase', ads.logData);"
          );
          var d = event.slot.getSlotElementId();
          var slot = document.getElementById(d);
          slot.style.display = "none";
          slot.style.height = "0px";
          slot.parentElement.style.display = "none";
          slot.parentElement.style.height = "0px";
        }
      });
    });
  } else {
    ads.kv.adcase = ads.logData;
    ads.run();
  }

  var script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagservices.com/tag/js/gpt.js";
  document.head.appendChild(script);

};

ads.readMessage = function(e) {
  "use strict";

  var msg = (e.data && e.data.msg) ? e.data.msg : "";
  if(msg == "adcase") {
    //var format = (e.data && e.data.format) ? e.data.format : false;
    var params = e.data.params || {};
    var adId = ads.getIdFromMsg(e);
    if(adId && ads.id[adId]) {
      if(params.callback) {
        var slotId = ads.id[adId].slot.parentElement.id;
        if(ads.allSlotsMsgCallback) {
          ads.allSlotsMsgCallback(slotId, params);
        }
        if(ads.slotMsgCallback && ads.slotMsgCallback[slotId]) {
          ads.slotMsgCallback[slotId](params);
        }
      } else {
        if(ads.id[adId].msg) {
          ads.id[adId].msg(params);
        }
        ads.id[adId].set("window", e.source);
      }
    }
  }
};

ads.getIdFromMsg = function(e) {
  "use strict";
  var i = null;
  try {
    var messageOrigin = e.source;
    var sourceWin = null;
    var sourceFrame = null;
    for(i = 0; i < window.frames.length; ++i) {
      if(messageOrigin.parent == window.frames[i] || messageOrigin == window.frames[
          i]) {
        sourceWin = window.frames[i];
        break;
      }
    }
    if(sourceWin) {
      var iframes = document.getElementsByTagName('iframe');
      for(i = 0; i < iframes.length; ++i) {
        if(iframes[i].contentWindow == sourceWin) {
          sourceFrame = iframes[i];
          break;
        }
      }
      return sourceFrame.parentElement.parentElement.id;
    }
  } catch(ex) {}
};

window.addEventListener("message", ads.readMessage, false);

//
// In order to save one request, replace all code from here to EOF with
// https://storage.googleapis.com/adcase.io/dist/3/adcase-s.js
//
if(ads.loadStyles) {
  var script = document.createElement("script");
  script.async = true;
  script.src = "https://storage.googleapis.com/adcase.io/dist/3/adcase-s.js";
  document.head.appendChild(script);
} else {
  ads.startProcess();
}
