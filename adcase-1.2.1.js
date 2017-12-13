
// Load googletag library
var googletag = { cmd:[] };
var script = document.createElement('script');
script.async = true;
script.src = "https://www.googletagservices.com/tag/js/gpt.js";
document.head.appendChild(script);

ads.formats = [];
ads.existingSlotIds = {}; // these should be destroyed before being called

var ev= null;
// SETUP PAGE PARAMETERS
googletag.cmd.push(function() {
  googletag.destroySlots();
  
  ads.setTargeting();

  googletag.pubads().addEventListener('slotRenderEnded', function(event) {
    var div = document.getElementById(event.slot.getSlotElementId());
    var adType = div.parentElement.dataset.adtype;  // zocalo_mobile
    var adFormat = "default";
    var params = { div: div, containerDiv: div.parentElement, adType: adType, width: event.size[0], height: event.size[1], event:event } 
    
    // in case there is a predefined format, like #7 footerFixed
    div.parentElement.style.display = 'block';
    div.parentElement.style.width = "100%";//event.size[0]+"px";

    if (!event.isEmpty) {
      if(ads.adTypes[adType] && ads.adTypes[adType].adFormat && ads.formats[ads.adTypes[adType].adFormat]) {
        adFormat = ads.adTypes[adType].adFormat;
        if(adFormat!="interstitial") {
          params.adFormat = adFormat;
          ads.formats[adFormat](params);
        }
    }
        //div.parentElement.style.height = event.size[1]+"px";
       


//console.log("call ads.slotRendered",event);
    ads.slotRendered(event);

    }
  //  console.log({action:"RenderAd", slotId:div.id, width:event.size[0], height:event.size[1], event:event })
  });
  googletag.pubads().setCentering(true);
  googletag.pubads().collapseEmptyDivs();
  googletag.pubads().enableAsyncRendering();
  googletag.pubads().enableSingleRequest(); 
  googletag.enableServices();
});

ads.run = function() {
  
  ads.adTexts = [];
  ads.adSlotHandles = [];
  //ads.adSlotList = [];
  ads.adEvents = [];
  ads.values = {};

	var cmd = ads.cmd;
	ads.cmd = [];
	for(var c in cmd) {
		if(cmd[c].cmd == "run") {
      ads.set("manualSlotList", cmd[c].manualSlotList);
      ads.pageLoaded( "/" + ads.network + cmd[c].path);
		}
	}
}

ads.checkDivList = function(divId, isManual) {
  var manualSlotList = ads.get("manualSlotList");
  //console.log("check:"+divId,isManual,ads.get("manualSlotList"));
  if(manualSlotList) {
    // there is a list, check if divId is included
    for(var i = 0; i < manualSlotList.length; i++) {
      if(manualSlotList[i] == divId) {
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
  if(ads.getDfpTestValue) {
    googletag.pubads().setTargeting("dfpTest", ads.getDfpTestValue);
  }
  for(var i in kv) {
    console.log("KV",i,kv[i].toString());
    googletag.pubads().setTargeting(i, kv[i].toString()); 
  }

}

ads.pageLoaded = function(path) {

  // PREPARE SLOTS
  ads.adSlotList = [];
  var divs = document.getElementsByTagName("ad-slot");
  if(divs.length == 0) {
    divs = document.getElementsByClassName("ad-slot");
  }

  for(var i = 0; i < divs.length; i++) { 
    var parent = divs.item(i);
    var adType = parent.dataset.adtype;

    if(!ads.checkDivList(parent.id, parent.dataset.manual)) {
      // if div is set as data-manual, and there is no specific slot list to run
      continue;
    }
  	//parent.style.display = "none";

    while (parent.firstChild) { // reuse existing div
      parent.removeChild(parent.firstChild);
    }
    if(adType == "interstitial") { // floating element
      var newDiv = document.createElement("div");
      newDiv.style.display = "none";
      newDiv.className = 'interstitial';
      newDiv.innerHTML = "<div id='"+parent.id+"_ad'></div>";  

      document.body.appendChild(newDiv);
    } else {
      parent.innerHTML = "<div id='"+parent.id+"_ad'></div>";  
    }
    
    //parent.style.display = "none";
  	ads.adSlotList.push( { divId: parent.id + "_ad", 
                           dfpPath: path + parent.id, 
                           sizes: ads.adTypes[adType].sizes,
                           adFormat: ads.adTypes[adType].adFormat });
  }
  


  // Actual DFP slot creation
  googletag.cmd.push(function() {
    if(!ads.get("manualSlotList")) {
      googletag.destroySlots();  
    }
    
    for (var i in ads.adSlotList) {
      var d = ads.adSlotList[i];
      googletag.defineSlot(d.dfpPath, d.sizes, d.divId).addService(googletag.pubads());
    }

    for (var i in ads.adSlotList) {
      googletag.display(ads.adSlotList[i].divId);
    }

  });
}

ads.set = function(k,v) { ads.values[k] = v; }
ads.get = function(k) { return ads.values[k] || null; }



window.addEventListener("message", _rm_Message, false);
function _rm_Message(e)
{

 //console.log("msg e.data:",e.data)
  // TODO: catch window.top.postMessage({type: "_rm_ad", adType:"interstitial_800x600", bgColor: "#cccccc"}, "*"); that comes from creative, and paint the background
  var eType = (e.data && e.data.type) ? e.data.type : "";
  var adType = (e.data && e.data.adType) ? e.data.adType : "";
//ads.lastEvent=e;
    if (e.data.msg && e.data.msg=="registerAd"){
      ads.formats.setWindow(e.data.format, e.source); 

    } else if (e.data.msg && e.data.msg=="interstitialAdLoaded"){
      if(e.data.params) {
        console.log("----interstitialAdLoaded");
        ads.formats.interstitial(e.data.params);
      } else {
        /*
        var params = { width: e.data.width,
                       height: e.data.height,
                       bgColor: e.data.bgColor,
                       autoclose: (e.data.autoclose || 8),
                       closeIconURL: (e.data.closeIconURL || "/close.png"),
                       windowSource: e.source
                      }
        ads.formats.interstitial(params);
        */
      }

    } else if (e.data.msg && e.data.msg=="pushAdLoaded" && e.data.text){
        console.log("msg e.data:",e.data);
        ads.adTexts.push({text:e.data.text, slotWindow:e.source});

        ads.matchAds();
    } else if (e.data.msg && e.data.msg=="expandSlot" && e.data.handle && (ads.adSlotHandles[e.data.handle] || e.data.handle==1)){
        console.log("msg e.data:",e.data);
        if(e.data.handle==1) {
          document.getElementById("adContent_ad").firstChild.style.height="250px";
          document.getElementById("adContent_ad").style.height="250px";
          console.log(250);
        } else {
          var slot = ads.adSlotHandles[e.data.handle];
          slot.style.height="250px";
        }
    } else if (e.data.msg && e.data.msg=="collapseSlot" && e.data.handle && (ads.adSlotHandles[e.data.handle] || e.data.handle==1)){
        console.log("msg e.data:",e.data);
        if(e.data.handle==1) {
          document.getElementById("adContent_ad").firstChild.style.height="90px";
          document.getElementById("adContent_ad").style.height="90px";
          console.log(90);
        } else {
          var slot = ads.adSlotHandles[e.data.handle];
          slot.style.height="90px";
        }
    }
}

ads.slotRendered = function (adEvent) {
	var id = adEvent.slot.getSlotElementId();

  // check if there is a custom event defined
  var parentId = document.getElementById(id).parentElement.id;
  if(ads.slotRenderedCallback[parentId]) {
    console.log("call SlotRendered de"+parentId);
    ads.slotRenderedCallback[parentId](adEvent);
  }
  if(ads.slotRenderedCallback["all-slots"]) {
    console.log("call SlotRendered de all-slots");
    ads.slotRenderedCallback["all-slots"](adEvent);
  }

  //console.log("SlotRendered Format",ads.getFormatFromDivId(id),id,adEvent);

	if(ads.getFormatFromDivId(id) == "expand970x250"){
		if(adEvent.size[1]==250) {
            //console.log("-------------push slot rendered");
            ads.adEvents.push(adEvent);
            ads.matchAds();
			ads.runPush_970x250(document.getElementById(id), {});

		}	
	} else {
//		console.log("slotRenderedEvent - unknown slot", id,adEvent);

	}
}


ads.matchAds = function() {
  console.log("matchads");
    for(var i in ads.adTexts) {
		var text = ads.adTexts[i].text;
		//console.log(text);
		for(var j in text.split(/\r\n|\r|\n/)) {
			j2 = text.split("\n")[j].split("=");
			if(j2[1] && j2[1]>10000) {
				ads.searchSlots(j2[1], ads.adTexts[i].slotWindow);
			}
		}

	}
}

ads.searchSlots = function(param, slotWindow) {
	for(var i in ads.adEvents) {
		var slot = ads.adEvents[i].slot;
		for(var j in slot) {
			if (slot[j] == param && !ads.adEvents[i].slotWindow) {
				ads.adEvents[i].slotWindow = slotWindow;
				var handle = Math.round(Math.random()*10000000) + 10000000;
				ads.adSlotHandles[handle] = document.getElementById(slot.getSlotElementId());
        var adParams = ads.styles.expand970x250;
        adParams.setSlotHandle = handle;
				slotWindow.postMessage(adParams, "*");
				return false;
			}
		}
	}
	return false;
}

ads.runPush_970x250 = function(containerDiv, data) {

	containerDiv.classList.remove("expandable");
	//containerDiv.addEventListener("mouseover", function(){ ads.set("push_mouseOver", containerDiv); });
//	containerDiv.style.height="250px";
	containerDiv.style.overflow="hidden";
	containerDiv.style.transition="height 0.25s ease-in";
	containerDiv.style.height="90px";

}
//// END PUSH CREATIVE /////
ads.getFormatFromDivId = function(divId) {
  var adFormat = null;
  for(var i in ads.adSlotList) {
    if(ads.adSlotList[i].divId == divId && ads.adSlotList[i].adFormat) {
      adFormat = ads.adSlotList[i].adFormat;
      break;
    }
  }
  return adFormat;
}
ads.getDivIdFromFormat = function (format) {
  var divId = null;
  console.log("ads.adSlotList", ads.adSlotList);

  for(var i in ads.adSlotList) {
    if(ads.adSlotList[i].adFormat == format) {
      console.log(ads.adSlotList[i].adFormat);
      divId = ads.adSlotList[i].divId;
      break;
    }
  }
  return divId;
}

ads.formats.interstitial = function(params) {


  var divId = ads.getDivIdFromFormat("interstitial");

  console.log("******interstitial divId:" + divId);
  console.log("params:" , params);


  var div = document.getElementById(divId);
  var parent = div.parentElement;
  div.style.position = "fixed";
  div.style.left = "0px";
  div.style.top = "0px";
  div.style.backgroundColor = params.backgroundColor;
  div.style.width = "100%";
  div.style.height = "100%";
  div.style.zIndex = "100000";

  var marginLeft = -(params.width/2)+"px";
  var marginTop = -(params.height/2)+"px";
  var iconRight = (params.width/2-53) + ads.styles.interstitial.right;
  var iconTop = -(params.height/2) + ads.styles.interstitial.top;

  var iframe = div.getElementsByTagName("iframe")[0];
  var iconDiv = document.createElement("div");

if(params.width == 9999) {
  // fullscreen
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
      //console.log("called windowSize");
      var w = window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth||0;
      var h = window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight||0;
      params.windowSource.postMessage({ msg: "setSize", width: w, height: h}, "*");
    }, 50);
  }, true);
  var w = window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth||0;
  var h = window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight||0;
  params.windowSource.postMessage({ msg: "setSize", width: w, height: h}, "*");

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
  +"right:" + iconRight + "px; top:" + iconTop + "px;z-index:10000;cursor:pointer' onclick='document.getElementById(\"" + div.id + '").style.display="none";document.body.style.overflow="";document.getElementById("' + div.id + "\").innerHTML=\"\"'>"
  + ads.styles.interstitial.img + "</div>";
  div.appendChild(iconDiv);
  console.log("iconDiv"+iconDiv);

  window.clearTimeout(ads.interstitialTimeout);
  console.log("autoclose",params.autoclose);
  if(params.autoclose > 0) {
    ads.interstitialTimeout = window.setTimeout(function() { 
     // parent.style.display = "none";
     // parent.innerHTML = ""
    }, params.autoclose * 1000);
  }
  window.setTimeout(function() { parent.style.display = "block"; document.body.style.overflow="hidden"; }, 1000); // show interstitial
  window.setTimeout(function() { document.getElementById("interstitialIconDiv") && (document.getElementById("interstitialIconDiv").style.display=""); }, 500); // show [X]
}



ads.formats.setWindow = function(format, windowHandle) { 
  console.log("setWindow", format, windowHandle);
  ads.set("window-"+format, windowHandle);
}

ads.formats.getWindow = function(format) { 
  console.log("getWindow", format);
  ads.get("window-"+format);
}


ads.formats.footerFixed = function(params) {
  console.log("This is footerFixed",params);

  var div = params.div;
  div.style.display = "inline-block";

  var containerDiv = params.containerDiv;
  containerDiv.style.zIndex = 9000;
  containerDiv.style.background = "none repeat scroll 0 0 transparent";
  containerDiv.style.position = "fixed";
  containerDiv.style.textAlign = "center";
  containerDiv.style.bottom = "0px";
  containerDiv.style.width = "100%";
  containerDiv.style.height = params.height;
  containerDiv.style.minHeight = "0px";
  containerDiv.style.minWidth = "0px";

  if(params.height == 250) {
    // Expanding mouseover footer
    var w = ads.formats.getWindow("footerFixed");
    div.addEventListener("mouseover", function() { document.getElementById("footerFixed-adText").style.display="none"; containerDiv.style.height = "250px"; }, false);
    div.addEventListener("mouseout", function() { document.getElementById("footerFixed-adText").style.display=""; containerDiv.style.height = "90px"; }, false);
    containerDiv.style.height = "90px";
  }
  window.setTimeout(function() { document.getElementById("footerFixed-adText").style.display="";  }, 3000);

  var iframe = containerDiv.getElementsByTagName("iframe")[0];
  iframe.style.background = "none repeat scroll 0 0 white";
  iframe.style.margin = "auto";
  iframe.style.height = params.height;
  iframe.style.width = params.width;

  var iconMarginRight = - (params.width / 2) + ads.styles.footerFixed.right;
  var div = document.createElement("div");
  div.innerHTML = "<div id='footerFixed-adText' style='position:absolute;display:none;right:50%;margin-right:"+iconMarginRight+"px;top:"+ads.styles.footerFixed.top+"px;cursor:pointer;' "
            + "onclick=\"document.getElementById('"+containerDiv.id+"').style.display = 'none'\">"+ads.styles.footerFixed.img+"</div>"
  containerDiv.appendChild(div);
  containerDiv.style.display = "block"
};

ads.styles = ads.styles || {};
ads.styles.iconClose = "data:image/png;base64,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";
ads.styles.footerFixed = { img: "<img height=24 width=24 src='"+ads.styles.iconClose+"'>", top: -12, right:-12 };
ads.styles.interstitial = { img:"<img src='"+ads.styles.iconClose+"' height=54 width=54 border=0>", top: -25, right:-25}
ads.styles.expand970x250 = ads.styles.expand970x250 || {iconsStyle : "width:45px;position:absolute;left:917px;top:0;border:1px solid #ccc;font-family:Arial;font-size:11px;padding:3px;background-color:white;text-align:center;",
                            openIconHTML: "Abrir",
                            closeIconHTML: "Cerrar"
                          }

ads.loaded = true;
ads.run();
