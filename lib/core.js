
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
  console.log("check:"+divId,isManual,ads.get("manualSlotList"));
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

ads.formats.setWindow = function(format, windowHandle) { 
  console.log("setWindow", format, windowHandle);
  ads.set("window-"+format, windowHandle);
}

ads.formats.getWindow = function(format) { 
  console.log("getWindow", format);
  ads.get("window-"+format);
}
