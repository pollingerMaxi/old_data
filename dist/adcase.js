//
// AdCase.js JavaScript Library v3.0.20. 20/Jun/2018
// Copyright 2018 adcase.io
// https://adcase.io
// https://adcase.io/license
// AdCase.js simplifies the use of both Rich Media and display creatives in Double Click for Publishers (DFP).
// This is not an official Google product, and it is also not officially supported by Google.
//
//
ads.version = (ads.light?"adcase.js light":"adcase.js full")+" v3.0.20";
ads.logData = (ads.light?"L":"F")+".3.0.20";

ads.loaded = true;
var googletag = googletag || { cmd: [] };

ads.log = ads.log || (function() {
    if(!localStorage.getItem("ads.debug")) {
        return (function() {})
    }
    return Function.prototype.bind.call(console.log);
}());

ads.values = ads.values || {};
ads.formats = {};
ads.setup = false;


ads.resetValues = function() {
    ads.scrollTimeout = true;
    ads.printedSlots = {}; // used by lazy loading
    ads.startDisplay = "" || "";
    ads.adEvents = [];
    ads.adTexts = [];
    ads.id = {};
    ads.startTime = new Date().getTime();
}

ads.run = function() {
    if (ads.lazy) {
        ads.enableScroll();
    }
    if(!ads.setup) {
        if(ads.slots) {
            for(var i in ads.slots) { var s = ads.slots[i];  
                if(!s.id || !s.adtype || document.getElementById(s.id) || !(ads.slots.hasOwnProperty(i))) { continue; }
                var d = document.createElement("div");
                d.classList.add("ad-slot");
                d.id = s.id;
                d.dataset.adtype = s.adtype;
                s.position&&console.log("in:",s.position.in,"after:",s.position&&s.position.after,"before:",s.position&&s.position.before);
                if(s.position && s.position.in) {
                  //d.innerHTML="IN "+s.position.in +" - FINDTAG:"+s.position.findTag+" - FINDCLASS:"+s.position.findClass+" - beforePOSITION:"+s.position.beforePosition;
                  var e = document.getElementById(s.position.in);
                  if(s.position.in=='body') { e=document.body; }
                  if(e && e.childNodes) {
                    var c=1;
                    var created = false;
                    for(var j in e.childNodes) { if(e.childNodes[j].nodeType!=1 || !e.childNodes.hasOwnProperty(j)) { continue; }
                      if(s.position.findTag && e.childNodes[j].tagName.toLowerCase()!=s.position.findTag.toLowerCase()) { continue; }
                      if(s.position.findClass && !e.childNodes[j].classList.contains(s.position.findClass)) { continue; }
                      if(c==s.position.beforePosition) {
                        e.insertBefore(d, e.childNodes[j]);
                        created=true;
                        break;
                      }
                      c++;
                    }
                    if(!created) {
                        e.insertBefore(d, null);
                    }
                  }
                  
                } else if(s.position && s.position.after) {
                  var e = document.getElementById(s.position.after);
                  //d.innerHTML="AFTER "+s.position.after;
                  e && e.parentElement && e.nextSibling && e.parentElement.insertBefore(d, e.nextSibling);
                } else if(s.position && s.position.before) {
                  var e = document.getElementById(s.position.before);
                  //d.innerHTML="BEFORE "+s.position.before;
                  e && e.parentElement && e.parentElement.insertBefore(d, e);
                } else {
                  document.body.appendChild(d);
                }
            }
        }

        ads.setup = true;
        googletag.cmd.push(function() {
            googletag.destroySlots();

            ads.setTargeting();

            googletag.pubads().addEventListener('slotRenderEnded',
                function(event) {
                    ads.adEvents.push(event);
                    ads.slotRendered(event);
                }
            );
            if(ads.addPageURL || ads.page_url_domain) {
              googletag.pubads().set("page_url", window.location.origin || (window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '')));    
            } else if (ads.page_url) {
              googletag.pubads().set("page_url", ads.page_url);    
            }
            googletag.pubads().setCentering(true);
            googletag.pubads().collapseEmptyDivs();
            googletag.pubads().enableAsyncRendering();
            googletag.pubads().enableSingleRequest();
            if (ads.lazy) {
                googletag.pubads().disableInitialLoad();
            }
            googletag.enableServices();
            ads.log("enableServices");
        });

        ads.id = {};

        ads.setAdTypes();
        ads.adTexts = [];
        ads.printedSlots = {};
    }

    var cmd = ads.cmd;
    ads.cmd = [];
    
    for(var c in cmd) { if(!(cmd.hasOwnProperty(c))) { continue; }
        if (cmd[c].cmd == "run") {
            //cmd[c].refresh = true; // enable to test SPA
            if(cmd[c].refresh) {
              googletag.cmd.push(function() { googletag.destroySlots(); ads.setTargeting(); });
              ads.resetValues();
            }
            ads.pageLoaded({ path: "/" + ads.network + cmd[c].path, refresh: cmd[c].refresh});
        }
    }
}

ads.setTargeting = function() {

    var kv = ads.kv || {};

    googletag.pubads().clearTargeting();

    var adsTest = localStorage.getItem("adcase-adstest");
    var saveAdstest=false;
    try {
        var url = new URL(document.location.href);
        if(url.searchParams.get("adstest") && url.searchParams.get("adstest")!="") { 
          adsTest = url.searchParams.get("adstest"); 
          saveAdstest = url.searchParams.get("save");
        }
    } catch(e) {}

    if(adsTest=="false") {
        localStorage.removeItem("adcase-adstest")
    } else {
        if (adsTest && adsTest!="") {
            if(saveAdstest=="0") {
                localStorage.removeItem("adcase-adstest");
            } else {
                localStorage.setItem("adcase-adstest", adsTest);
            }
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
    for(var i in kv) { if(!(kv.hasOwnProperty(i))) { continue; }
        googletag.pubads().setTargeting(i, kv[i]);
    }
}

ads.pageLoaded = function(params) {
    var path = params.path;

    ads.log("pageLoaded");
    ads.googleTagSlots = {};
    // PREPARE SLOTS

    var divs = {};
    // First target slots by slotOrder definition
    if(ads.slotOrder) {
        for(var i in ads.slotOrder) { if(!(ads.slotOrder.hasOwnProperty(i))) { continue; }
            document.getElementById(ads.slotOrder[i]) && (divs[ads.slotOrder[i]] = document.getElementById(ads.slotOrder[i]));
        }
    }

    // Then target remaining slots
    var d = document.getElementsByTagName("ad-slot");
    if (d.length == 0) {
        d = document.getElementsByClassName("ad-slot");
    }
    for(var i in d) { if(!(d.hasOwnProperty(i))) { continue; }
        var divId = d.item(i).id;
        if(divs[divId]) {
            ads.log("********Error! ExistingSlot: ",divId);
            continue;
        } else if(!ads.id[divId+"_ad"]) {
            divs[divId] = d.item(i);
        }
    }
    ads.log("target divs", divs);

    for(var i in divs) { if(!(divs.hasOwnProperty(i))) { continue; }
        var parent = divs[i];
        parent.style.height="0px";
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

        var format = ads.adTypes[adType].adFormat || "default";

        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
        
        if(format=="interstitial" || format=="footerFixed") {
            newParent = parent.cloneNode(true);
            parent.parentNode.removeChild(parent);
            parent = newParent;
            document.body.appendChild(parent);
        }

        parent.style.overflow="hidden";
        if(ads.startHeight) {
            parent.style.height=ads.startHeight;
        }
        parent.innerHTML = "<div id='" + parent.id + "_ad'></div>";

        var kv={};
        if(parent.dataset.kv) {
            try {
                kv = JSON.parse(parent.dataset.kv);
            } catch(e) { 
                ads.log("*** ERROR: wrong KV in "+parent.id,parent.dataset.kv); 
            }
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
        ads.id[d].kv = kv;
        ads.id[d].startDisplay();

        ads.adSlotList.push (ads.id[d]);

    }
    // Actual DFP slot creation
    googletag.cmd.push(function() {
        for(var i in divs) { if(!(divs.hasOwnProperty(i))) { continue; }
            if(!ads.id[i+"_ad"]){ continue; }
            var d = ads.id[i+"_ad"];
            d.startTime = new Date().getTime();
            if(d.divPosition) {
                ads.googleTagSlots[d.divId] = googletag.defineSlot(d.dfpPath, d.sizes, d.divId).setTargeting("divposition",d.divPosition).addService(googletag.pubads());
            } else {
                ads.googleTagSlots[d.divId] = googletag.defineSlot(d.dfpPath, d.sizes, d.divId).addService(googletag.pubads());
            }
            for(var j in d.kv) { if(!(d.kv.hasOwnProperty(j))) { continue; }
                ads.googleTagSlots[d.divId].setTargeting(j,d.kv[j]);
            }
            ads.id[i+"_ad"].requestedSizes = d.sizes;
        }

        for(var i in divs) { if(!(divs.hasOwnProperty(i))) { continue; }
            if(!ads.id[i+"_ad"]){ continue; }
            googletag.display(ads.id[i+"_ad"].divId);
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
        } else if (format && format=="push" && params.action && params.action=="pushSetup") {  // force a push buttons setup 
          e.source.postMessage(ads.styles.push, "*");
        } else if (format && format=="push") {  // it only gets here in special cases where handle has not been correctly set 
            for(var i in ads.id) { if(!(ads.id.hasOwnProperty(i))) { continue; }
              if(ads.id[i].format && ads.id[i].format=="push") {
                ads.id[i].msg(params);
              }
            }
        } else if (format) {
            ads.id[ads.getIdFromFormat(format)] && ads.id[ads.getIdFromFormat(format)].msg(params);
        }
    }
}

ads.slotRendered = function(event) {
    var divId = event.slot.getSlotElementId();
    var div = document.getElementById(divId);
    var parentId = document.getElementById(divId).parentElement.id;
    var adFormat = ads.id[divId].format;

    ads.id[divId].endTime = new Date().getTime();
    ads.id[divId].renderedTime = ads.id[divId].endTime - ads.id[divId].startTime;

    if (!event.isEmpty) {
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
        if(ads.id[divId].format=="footerFixed" && event.size[1]>110) {
            ads.id[divId].parentSlot.style.height = "0px";
        }
        //ads.id[divId].startDisplay();
        div.parentElement.style.display = "";

        if(adFormat == "default") {
            div.style.display = "";
        }

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
    for(var i in ads.adTexts) { if(!(ads.adTexts.hasOwnProperty(i))) { continue; }
        var text = ads.adTexts[i].text.split(/\r\n|\r|\n/);
        for(var j in text) { if(!(text.hasOwnProperty(j))) { continue; }
            j3 = text[j].split("=");
            if (j3[1] && j3[1] > 10000) {
                ads.searchSlots(j3[1], ads.adTexts[i].slotWindow);
            }
        }
    }
}

ads.searchSlots = function(param, slotWindow) {
    for(var i in ads.adEvents) { if(!(ads.adEvents.hasOwnProperty(i))) { continue; }
        var slot = ads.adEvents[i].slot;
        for(var j in slot) { if(!(slot.hasOwnProperty(j))) { continue; }
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
    for(var i in ads.id) { if(!(ads.id.hasOwnProperty(i))) { continue; }
        if(ads.id[i].get("handle") == handle) {
            return i;
        }
    }
}
ads.getIdFromFormat = function(format) {
    for(var i in ads.id) { if(!(ads.id.hasOwnProperty(i))) { continue; }
        if(ads.id[i].format == format) {
            return i;
        }
    }
}

ads.setAdTypes = function() {

    if (!ads.adTypesMap) {
        return;
    }
    ads.adTypes = {};

    for(var i in ads.adTypesMap) { if(!(ads.adTypesMap.hasOwnProperty(i))) { continue; }
        var t = ads.adTypesMap[i];
        t.minWidth = t.minWidth || 0;
        t.type = t.adtype || t.type || "";

        if (t.deviceType) {
            if (ads.device.isMobile && t.deviceType.toLowerCase().indexOf("mobile") < 0 ||
                ads.device.isDesktop && t.deviceType.toLowerCase().indexOf("desktop") < 0) {
                continue;
            }
        }

        var width = (ads.device.isMobile? screen.width : window.innerWidth);
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

    for(var i in ads.id) { if(!(ads.id.hasOwnProperty(i))) { continue; }
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

    var tooLeft = (rect.left < 0);
    var tooBottom = (rect.top - 300) > ( ads.device.isMobile ? screen.height : (window.innerHeight || document.documentElement.clientHeight));
    var tooTop = (rect.bottom < 0)

    var viewable = !tooLeft && !tooBottom && !tooTop;
    return viewable;
}

ads.refresh = function(divId) {
    ads.log("Refresh divId:" + divId);
    ads.id[divId].startTime = new Date().getTime();
    googletag.cmd.push(function() {
        ads.log("googletag.refresh"+divId);
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


ads.getVideoURL = ads.getVideoURL || function(output, vpos, slot) {

    slot = slot || "preroll";
    output = output || "vast";
    vpos = vpos || "preroll";
    var slotname = "/" + ads.network + ads.router() + slot;
    var url = document.location.href;
    var timestamp = new Date().getTime();
    var cust_params = ""; // set key values
    for(var key in ads.kv) { if(!(ads.kv.hasOwnProperty(key))) { continue; }
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
        s.src = "https://storage.googleapis.com/adcase.io/dist/3/debug.js?"+Math.random();
        document.head.appendChild(s);
    }
}

ads.debugButton = function() {
    var d = document.createElement("link");
    d.href = 'https://fonts.googleapis.com/css?family=Roboto%20Mono';
    d.rel='stylesheet';
    d.type='text/css';
    document.head.appendChild(d);

    d = document.createElement("div");
    d.innerHTML='<meta name="viewport" content="width=device-width, initial-scale=1.0">'
        +'<style>'
        +'.adcase-button button {font-weight:bold;border-width:0;outline: none;border-radius: 2px;box-shadow: 0 1px 4px rgba(0, 0, 0, .6);background-color: #3498db;color: white;transition: background-color .3s;padding:0;}'
        +'.adcase-button button:hover, .adsbtn:focus { background-color: #2980b9; }'
        +'.adcase-button span { display: block;padding: 12px 24px;}'
        +'</style>'
        +"<a href='javascript:ads.debug()' class='adcase-button' style='position:fixed;bottom:25px;left:15px;z-index:10000000'><button id='adcase-button-button'><span id='adcase-button-text' style='font-size:14px'></span></button></a>";
    document.body.appendChild(d);
}



ads.formats.footerFixed = function(t) {

    t.set("startDisplay", "none");

    t.msg = function(p) {
        p.expandedHeight && t.set("expandedHeight", p.expandedHeight);
        p.collapsedHeight && t.set("collapsedHeight", p.collapsedHeight);
        p.backgroundColor && t.set("backgroundColor", p.backgroundColor);
        p.expandOn && t.set("expandOn", p.expandOn);
        p.expandMS && t.set("expandMS", p.expandMS);

        if(p.expandTo=="layer") {
            t.prepareLayer(p);
            t.setExpanding(p);
        } else {
            if(p.expandedHeight && p.collapsedHeight && p.expandOn && p.expandOn=="click") {
                t.renderClick();
            }
            if((p.expand || p.collapse) && t.get("expandedHeight") && t.get("collapsedHeight") && t.get("expandOn")=="mouseover") {
                t.setExpanding(p);
            } else if(t.get("expandedHeight") && t.get("collapsedHeight") && t.get("expandOn")=="click") {

            }
        }
    }
    t.prepareLayer = function(p) {
        var containerDiv = t.parentSlot;
        var parent=document.createElement("div");
        parent.id = "ads-footerFixed-parent";
        var content = "";
        if(p.expandedImage) {
            content = "<img id='ads-footerFixed-iframe' src='"+p.expandedImage+"'>"
        } else {
            if(p.expandedURL.substring(0,7)!="http://" && p.expandedURL.substring(0,8)!="https://" ) {
                p.expandedURL = "";
            }
            content = "<iframe id='ads-footerFixed-iframe' src='"+p.expandedURL+"' style='width:100%;height:100%' frameborder=no></iframe>"
        }
        parent.innerHTML = "<div id = 'ads-footerFixed-div'>"+content+"</div>";
        parent.style.display = "none";
        t.parentSlot.appendChild(parent);
        var div = document.getElementById("ads-footerFixed-div");
        var iframe = document.getElementById("ads-footerFixed-iframe");
        params = {t:t,
            div: div,
            parent:parent,
            iframe:iframe,
            height: t.get("expandedHeight"),
            backgroundColor: t.get("backgroundColor")
        };
        ads.formats.createInterstitial(params);

        t.set("interstitialParent",parent);

        t.slot.onmouseout = function() { window.clearTimeout(t.get("layerTimeout")); }
        t.slot.onmouseover = function() {
            window.clearTimeout(t.get("layerTimeout"));

            t.set("layerTimeout", window.setTimeout(function() {
                t.get("interstitialParent").style.display = "block";
                document.body.style.overflow="hidden";  // show interstitial
            }, t.get("expandMS") ));

        };
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
        containerDiv.style.left = "0px";
        containerDiv.style.width = "100%";
        //containerDiv.style.height = "0px";
        containerDiv.style.minHeight = "0px";
        containerDiv.style.minWidth = "0px";

        var iframe = containerDiv.getElementsByTagName("iframe")[0];
        iframe.style.background = "none repeat scroll 0 0 white";
        iframe.style.margin = "auto";

        var iconMarginRight = - (t.width / 2);
        var newDiv = document.createElement("div");
        newDiv.id= "footerFixed-adText-container";
        newDiv.innerHTML = "<div id='footerFixed-adText' style='position:absolute;display:;right:50%;margin-right:"+iconMarginRight+"px;top:0px;cursor:pointer;' "
            + "onclick=\"document.getElementById('"+div.id+"').parentElement.style.display = 'none'\">"+ads.styles.footerFixed.closeImg+"</div>"
        containerDiv.appendChild(newDiv);
        
        div.style.marginTop = ads.styles.footerFixed.iconMarginTop + "px";
        containerDiv.style.display = "block"
    };

    t.renderClick = function() {
        var div = t.slot;
        var containerDiv = t.parentSlot;
        var iconMarginRight = - (t.width / 2);
        var html = "<div id='footerFixed-adText' style='position:absolute;display:;right:50%;margin-right:"+iconMarginRight+"px;top:0px;cursor:pointer;' "
            + "olick=\"document.getElementById('"+div.id+"').parentElement.style.display = 'none'\">"
            +"<div id='footerFixed-adText-close' style='float:right' onclick='ads.footerFixed.collapse("+t.get("handle")+")'>"+ads.styles.footerFixed.closeImg+"</div>"
            +"<div id='footerFixed-adText-open' style='float:right' onclick='ads.footerFixed.expand("+t.get("handle")+")'>"+ads.styles.footerFixed.openImg+"</div>"
            +"</div>";
        if(document.getElementById("footerFixed-adText-container")) {
            document.getElementById("footerFixed-adText-container").innerHTML = html;
        } else {
            var newDiv = document.createElement("div");
            newDiv.id = "footerFixed-adText-container";
            newDiv.innerHTML = html;
            containerDiv.appendChild(newDiv);
        }
        containerDiv.style.display = "block";
        containerDiv.style.height = t.get("collapsedHeight")+"px";

        ads.footerFixed = {};
        ads.footerFixed.expand = function(handle) {
            var t = ads.id[ads.getIdFromHandle(handle)];
            t.parentSlot.style.height = t.get("expandedHeight")+"px";
            t.get("window").postMessage( { expand:true }, "*");
            document.getElementById("footerFixed-adText-open").style.display="none";
        }
        ads.footerFixed.collapse = function(handle) {
            var t = ads.id[ads.getIdFromHandle(handle)];
            if(t.parentSlot.style.height == t.get("collapsedHeight")+"px") {
                t.parentSlot.style.display="none";
            }
            t.parentSlot.style.height = t.get("collapsedHeight")+"px";
            t.get("window").postMessage( { collapse:true }, "*");
            document.getElementById("footerFixed-adText-open").style.display="";
        }
    }

    t.setExpanding = function(p) {
        var div = t.slot;
        var containerDiv = t.parentSlot;

        if(p.expand) {
            document.getElementById("footerFixed-adText") && (document.getElementById("footerFixed-adText").style.display="none");
            containerDiv.style.height = t.get("expandedHeight")+"px";

        } else {
            containerDiv.style.height = t.get("collapsedHeight")+"px";
            document.getElementById("footerFixed-adText") && (document.getElementById("footerFixed-adText").style.display="");

        }
    }
}

ads.formats.createInterstitial = function (params) {
    var t = params.t;
    params.height = params.height || t.height;
    params.width = params.width || t.width;

    var div = params.div;
    var parent = params.parent;

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

    var iframe = params.iframe || div.getElementsByTagName("iframe")[0];
    var iconDiv = document.createElement("div");

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

    iframe.style.position = "absolute";
    iframe.style.marginTop = marginTop;
    iframe.style.marginLeft = marginLeft;
    iframe.style.position = "absolute";

    iconDiv.innerHTML = "<div id='interstitialIconDiv' style='position:absolute;display:;"
        +"right:" + iconRight + "px; top:" + iconTop + "px;z-index:10000;cursor:pointer' onclick='document.getElementById(\"" + parent.id + '").style.display="none";document.body.style.overflow=""\'>'
        + ads.styles.interstitial.img + "</div>";
    div.appendChild(iconDiv);


}

ads.ittonResize = function() {
  var myVideo=document.getElementById("adcase_itt_video");
  var w = window.innerHeight / window.innerWidth;
  var v = myVideo.clientHeight / myVideo.clientWidth;
  if (w<=v) {
  	myVideo.style.width=window.innerWidth+"px";
  	myVideo.style.height="";
    myVideo.style.marginTop = (- (myVideo.clientHeight - window.innerHeight) / 2)+"px";
    myVideo.style.marginLeft = "0px";

  } else {
  	myVideo.style.width="";
  	myVideo.style.height= window.innerHeight+"px";
    myVideo.style.marginLeft = (- (myVideo.clientWidth - window.innerWidth) / 2)+"px";
    myVideo.style.marginTop = "0px";

  }
}

ads.ittClose = function() {
  window.clearInterval(ads.get("ittInterval"));
  window.clearInterval(ads.get("ittCloseTimeout"));
  document.getElementById("adcase_itt_video").parentElement.innerHTML="";
  document.body.style.overflow=ads.get("previousOverflow");
}
ads.ittClick=function() {
    window.open(ads.get("ittClickTag"));
}
ads.formats.interstitial = function(t) {

    t.set("startDisplay", "none");
    //ads.addEvent(window, "resize", function(event) {ads.ittonResize();});

    t.videoFullscreen = function(params) { 
        console.log("PARAMS",params);
        ads.set("ittClickTag",params.clickTag);
        if(params.closeTimeout && params.closeTimeout>0) {
            ads.set("ittCloseTimeout", window.setTimeout(ads.ittClose, params.closeTimeout));
        }
        
        ads.set("previousOverflow",document.body.style.overflow);
        document.body.style.overflow="hidden";
        
        t.parentSlot.innerHTML = "<video onclick='ads.ittClick()' autoplay "+(params.muted&&params.muted=="muted"?"muted":"")+" src='"+params.videoSRC+"' id='adcase_itt_video' style='cursor:pointer;position:fixed;top:0px;left:0px;width:100%;height:100%;z-index:10000;'></video>";
       // window.setTimeout(function() { document.getElementById("adcase_itt_video").play(); },500);
        
        ads.set("ittInterval", window.setInterval(ads.ittonResize,50));
        
        var iconDiv = document.createElement("div");
        iconDiv.innerHTML = "<div id='interstitialIconDiv' style='position:fixed;right:10px;top:10px;z-index:10001;cursor:pointer' onclick='ads.ittClose()'>"
            + ads.styles.interstitial.img + "</div>";
        t.parentSlot.appendChild(iconDiv);
    }
    
    
    t.msg = function(params) {
        var div = t.slot;
        var iframe = div.getElementsByTagName("iframe")[0];
        var parent = t.parentSlot;
        if(params.videoSRC && params.videoSRC!="") {
            t.videoFullscreen(params);
            return;
        }
        if(params.runFormat=="footerFixed") {
            ads.formats.footerFixed(t);
            t.rendered();
            return;
        }
        
        if(params.ittType && params.ittType == "joining-divs") {
            t.createJoiningDivs(params);
            return;
        }

        params.height = params.height || t.height;
        params.width = params.width || t.width;

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

            iconDiv.style.height = "0px";
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

        var screenWidth = (ads.device.isMobile? screen.width : window.innerWidth);
        var screenHeight = (ads.device.isMobile? screen.height : window.innerHeight);
        if(params.width>(screenWidth-20) || params.height>(screenHeight-20)) {
            t.fixButtonTopRight();
        }

        window.clearTimeout(ads.interstitialTimeout);
        if(params.autoclose > 0) {
            ads.interstitialTimeout = window.setTimeout(function() {
                parent.style.display = "none";
                document.body.style.overflow="";
                // parent.innerHTML = ""
            }, params.autoclose * 1000);
        }
        window.setTimeout(function() { parent.style.display = "block"; document.body.style.overflow="hidden"; }, 1000); // show interstitial
        window.setTimeout(function() { document.getElementById("interstitialIconDiv") && (document.getElementById("interstitialIconDiv").style.display=""); }, 500); // show [X]
    }
    t.fixButtonTopRight = function() {
      var b = document.getElementById("interstitialIconDiv");
      b.style.top="10px";
      b.style.right="10px";
      b.style.position="fixed";
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

    t.createJoiningDivs = function(params) {
        ads.set("oldBodyOverflow", document.body.style.overflow);
        params.joinSeconds =0.5;
        console.log(params);
        if(ads.device.isDesktop) {
        	var layersTimeout = null;
        	var layer1 = document.createElement("div");
        	var layer2 = document.createElement("div");
        	var layer3 = document.createElement("div");

            ads.formats.joiningDivsEnd = function() {
        	    layer1.style.display="none";
        	    layer2.style.display="none";
        	    layer3.style.display="table";
        	}
        	ads.formats.joiningDivsStart = function(params) {
        	    layer1.style.marginLeft="calc(50% - "+params.leftWidth+"px)";
        	    layer2.style.marginRight="calc(50% - "+params.leftWidth+"px)";
        	    window.setTimeout(ads.formats.joiningDivsEnd,params.transitionTimeMs);
        	}
        	
            if(params.joinMethod == "M") {
            	layer1.onmouseover=function() { layersTimeout = window.setTimeout(function(){ads.formats.joiningDivsStart(params)},params.joinSeconds*1000) };
            	layer2.onmouseover=function() { layersTimeout = window.setTimeout(function(){ads.formats.joiningDivsStart(params)},params.joinSeconds*1000) };
            	layer1.onmouseout=function() { window.clearTimeout(layersTimeout) };
            	layer2.onmouseout=function() { window.clearTimeout(layersTimeout) };
            } else if(params.joinMethod == "A") {
            	window.setTimeout(function(){ads.formats.joiningDivsStart(params)},params.joinSeconds*1000);
            	window.setTimeout(function(){ads.formats.joiningDivsStart(params)},params.joinSeconds*1000);
            }

        	layer1.style="display:table;position:fixed;top:0px;left:0px;height:100%;width:"+params.leftWidth+"px;transition:margin-left "+(params.transitionTimeMs/1000)+"s ease-in;";
        	if(params.leftImage) {
            	layer1.innerHTML = "<div style='display:table-cell;vertical-align:middle'><img style='width:"+params.leftWidth+"px;height:"+params.leftHeight+"px;z-index:100;cursor:pointer' src='"+params.leftImage+"'></div>";
        	} else if(params.leftURL){
            	layer1.innerHTML = "<div style='display:table-cell;vertical-align:middle'><iframe style='width:"+params.leftWidth+"px;height:"+params.leftHeight+"px;z-index:100;cursor:pointer' src='"+params.leftImage+"'></iframe></div>";
        	}
        
        	layer2.style="display:table;position:fixed;top:0px;right:0px;height:100%;width:"+params.leftWidth+"px;transition:margin-right "+(params.transitionTimeMs/1000)+"s ease-in;";
        	if(params.rightImage) {
            	layer2.innerHTML = "<div style='display:table-cell;vertical-align:middle'><img style='width:"+params.leftWidth+"px;height:"+params.leftHeight+"px;z-index:100;cursor:pointer' src='"+params.rightImage+"'></div>";
        	} else if(params.rightURL){
            	layer2.innerHTML = "<div style='display:table-cell;vertical-align:middle'><iframe style='width:"+params.leftWidth+"px;height:"+params.leftHeight+"px;z-index:100;cursor:pointer' src='"+params.rightImage+"'></iframe></div>";
        	}
        	
        	layer3.style="display:none;position:fixed;top:0px;left:0px;height:100%;width:100%";
        	if(params.rightImage) {
            	layer3.innerHTML = "<div style='display:table-cell;vertical-align:middle;text-align:center'><img style='width:"+params.centerWidth+"px;height:"+params.centerHeight+"px;z-index:100;cursor:pointer;margin:0 auto' src='"+params.centerImage+"'></div>";
        	} else if(params.rightURL){
            	layer3.innerHTML = "<div style='display:table-cell;vertical-align:middle;text-align:center'><iframe style='width:"+params.centerWidth+"px;height:"+params.centerHeight+"px;z-index:100;cursor:pointer;margin:0 auto' src='"+params.centerImage+"'></iframe></div>";
        	}
        	
        	layer1.firstChild.firstChild.addEventListener("click", function() { t.get("window").postMessage( { msg:"click" }, "*"); }) ;
        	layer2.firstChild.firstChild.addEventListener("click", function() { t.get("window").postMessage( { msg:"click" }, "*"); }) ;
        	layer3.firstChild.firstChild.addEventListener("click", function() { t.get("window").postMessage( { msg:"click" }, "*"); }) ;

	        var iconDiv = document.createElement("div");
            iconDiv.style.height = "1px";
            iconDiv.style.width  = "1px";
            iconDiv.style.left   = "calc(50% + "+(params.centerWidth/2)+"px)";
            iconDiv.style.top    = "calc(50% - 1px - "+(params.centerHeight/2)+"px)";
            iconDiv.style.position = "absolute";
            iconDiv.style.marginLeft= "-55px";
            iconDiv.style.marginTop= "0";
    
            var iconRight = (params.width/2-53) + ads.styles.interstitial.right;
            var iconTop = -(params.height/2) + ads.styles.interstitial.top;

            iconDiv.innerHTML = "<div id='interstitialIconDiv' style='position:absolute;display:;"
                +"right:" + iconRight + "px; top:" + iconTop + "px;z-index:10000;cursor:pointer' onclick='this.parentElement.parentElement.parentElement.style.display=\"none\";document.body.style.overflow=\""+ads.get("oldBodyOverflow")+"\"'>"
                + ads.styles.interstitial.img + "</div>";
            layer3.firstChild.appendChild(iconDiv);


        	document.body.appendChild(layer1);
        	document.body.appendChild(layer2);
        	document.body.appendChild(layer3);
            
        }
        
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
            var height = false;
            if(ads.styles.push && ads.styles.push.collapsedHeight) {
                height = ads.styles.push.collapsedHeight;
            }
            if(t.get("collapsedHeight")) {
                height = t.get("collapsedHeight"); 
            }
            if(!height) {
                height = 90;
            }
            t.parentSlot.style.height = height + "px";
        } else if(p.action == "expand") {
            var height = false;
            if(ads.styles.push && ads.styles.push.expandedHeight) {
                height = ads.styles.push.expandedHeight;
            }
            if(t.get("expandedHeight")) {
                height = t.get("expandedHeight"); 
            }
            if(!height) {
                height = 250;
            }
            t.parentSlot.style.height = height + "px";
        }
    }

}

ads.formats.expandtovideo = function(t) {
    
    t.expandtovideoMsg = function(params) {
        console.log("expandToVideo MSG:",params);
        var d=params.expandDirection;
        var vh=params.expandedHeight;
        var vw=params.expandedWidth;
        var mt=0;
        var ml=0;
        var h=t.height
        var v = document.createElement("video");
        v.autoplay="true";
        v.muted="true";
        v.id='video1';
        v.style.left=0;
        v.style.backgroundColor="#eee";
        v.style.top=0;
        v.style.position="absolute";
        v.style.width=vw+"px";
        v.style.height=vh+"px";
        v.style.display="none";
        v.style.zIndex="100";
        v.style.cursor="pointer";
        v.innerHTML='<source type="video/mp4" src="'+params.video+'">'
        if(d=='NE') {
          mt=t.height-vh;
        } else if(d=='NW') {
          mt=t.height-vh;
          ml=t.width-vw;
        } else if(d=='SW') {
          ml=t.width-vw;
        }
        v.style.marginTop=mt+"px";
        v.style.marginLeft=ml+"px";
        v.addEventListener("click", function() { t.get("window").postMessage( { msg:"click" }, "*"); }) ;
        v.onmouseout=function() { window.clearTimeout(t.timeout); t.timeout = window.setTimeout(function(){ v.style.display='none'},1000) };
        v.onmouseover=function() { window.clearTimeout(t.timeout); }; 
        v.addEventListener("ended", function() { v.currentTime=0; v.play();} );
        t.parentSlot.style.overflow='';
        t.parentSlot.style.position='relative';
        t.parentSlot.appendChild(v);
        window.setTimeout(function(){ v.style.display=''},1000);
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

ads.styles.footerFixed = ads.styles.footerFixed || {};
ads.styles.footerFixed.closeImg = ads.styles.footerFixed.closeImg || "<img height=24 width=24 src='"+ads.styles.iconClose+"'>";
ads.styles.footerFixed.openImg = ads.styles.footerFixed.openImg || "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
ads.styles.footerFixed.iconMarginTop = ads.styles.footerFixed.iconMarginTop || 0;

ads.styles.interstitial = ads.styles.interstitial || { img:"<img src='"+ads.styles.iconClose+"' height=54 width=54 border=0>", top: -25, right:-25}
ads.styles.push = ads.styles.push || {
    iconsStyle : "width:45px;position:absolute;left:917px;top:0;border:1px solid #ccc;font-family:Arial;font-size:11px;padding:3px;background-color:white;text-align:center;",
    openIconHTML: "[OPEN]",
    closeIconHTML: "[CLOSE]"
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
    ads.formats.expandtovideo(t);
    ads.formats.parallax(t);
    t.set("startDisplay", ads.styles.default.startDisplay);

    t.msg = function(p) {
        if(p.action == "videobanner") {
            t.videobannerMsg(p);
        } else if(p.action == "parallax") {
            t.parallaxMsg(p);    
        } else if(p.action == "expandtovideo") {
            t.expandtovideoMsg(p);
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

ads.formats.parallax = function(t) {
    
    t.parallaxMsg = function(p) {
        window.addEventListener('scroll', function() { t.parallaxScroll(p)});
        t.parallaxScroll(p);
    }
    t.parallaxScroll = function(p){
        var i=t.parentSlot;
        var ih = t.height; 
        var w = i.contentWindow;
        var i2h=p.internalHeight;
        
        var topThresh = p.headerHeight;
        var bottomThresh = p.footerHeight;
        var wh=window.top.innerHeight;
        var deltaScroll = wh - topThresh - bottomThresh - ih;
        var iTop = i.getBoundingClientRect().top;
        var iBottom = i.getBoundingClientRect().bottom;
        var iScroll=0;
        
        wh=window.top.innerHeight;
         deltaScroll = wh - topThresh - bottomThresh - ih;
         iTop = i.getBoundingClientRect().top;
         iBottom = i.getBoundingClientRect().bottom;
         iScroll = 0;
        if(iTop<=topThresh) {
          iScroll = 0.001;
        } else if(iBottom>=wh-bottomThresh) {
          iScroll = 1;
        } else {
          scrolled = iTop - topThresh;
          iScroll = scrolled/deltaScroll;	
        }
        
        var s2 = wh-bottomThresh-i2h; // -300
        var s1 = topThresh; // 100
        var delta2 = s1-s2; // 400
        var pos2 = delta2*iScroll;
        var i2Top = topThresh-pos2;
        if(iTop<i2Top) {
        	i2Top=Math.max(0,iTop);
        } else if(iBottom>wh-bottomThresh) {
          i2Top = Math.min(iBottom-i2h,wh-i2h);
        }
//console.log("Parallax scroll:",t.divId,i2Top-iTop);
        t.get("window").postMessage({ msg:"scroll", scroll:i2Top-iTop },"*");

    }
    
}
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

ads.checkDebug = function() {
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
}

ads.resetValues();
ads.checkDebug();
ads.setDevice();

if(ads.light) {
    ads.slotRendered = function(event) {
        ads.adEvents.push(event);
        var d = event.slot.getSlotElementId();
        var slot = document.getElementById(d);
        var parent = slot.parentElement;
        parent.id = parent.id || d+"_parent";
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
            slot.style.display="";
            ads.id[d].width = event.size[0];
            ads.id[d].height = event.size[1];
        }

        if (ads.id[d].rendered) {
            var params = {
                width: event.size[0],
                height: event.size[1],
                event: event
            };
            ads.id[d].rendered(params);
        }
    }
    googletag.cmd.push(function() {
        googletag.pubads().addEventListener('slotRenderEnded', function(event) { 
            ads.slotRendered(event); 
            if(googletag.pubads().getTargeting('adcase').length==0) {
                ads.log("******   ERROR   ****   Please set adcase key   *******");
                ads.log("googletag.pubads().setTargeting('adcase', ads.logData);");
                var d = event.slot.getSlotElementId();
                var slot = document.getElementById(d);
                slot.style.display="none";
                slot.style.height="0px";
                slot.parentElement.style.display="none";
                slot.parentElement.style.height="0px";
            }
        });
    });
} else {
    ads.kv = ads.kv || {};
    ads.kv.adcase = ads.logData;
    ads.run();
}

window.addEventListener("message", ads.readMessage, false);

var script = document.createElement('script');
script.async = true;
script.src = "https://www.googletagservices.com/tag/js/gpt.js";
document.head.appendChild(script);
