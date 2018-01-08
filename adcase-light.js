//
// Adcase.js JavaScript Library v8.1.4.light 2/Jan/2018
// Copyright 2018 adcase.io 
// https://adcase.io
// https://jquery.io/license 
// Adcase.js simplifies the use of both Rich Media and display creatives in Double Click for Publishers (DFP).
// This is not an official Google product, and it is also not officially supported by Google.
//

var ads = ads || {};
ads.formats = {};
ads.adTexts = [];
ads.id = {};
ads.adEvents = [];


ads.slotRendered = function(event) {
  ads.adEvents.push(event);
  var d = event.slot.getSlotElementId();
  var slot = document.getElementById(d);
  var parent = slot.parentElement;
  parent.id = parent.id || ("ads_"+Math.floor(Math.random()*100000)); 
  var format = slot.dataset.format || "default";
  console.log("SLOTRENDERED",d,format);
  if(format) {

    ads.id[d] = new ads.instanceAd(format);
console.log("SETUP",ads.id);
    ads.id[d].slot = slot;
    ads.id[d].parentSlot = parent;
    ads.id[d].parentId = parent.id;
    ads.id[d].divId = d;
    //ads.id[d].dfpPath = path + parent.id 
    //ads.id[d].sizes = ads.adTypes[adType].sizes;
    ads.id[d].format = format;
    ads.id[d].startDisplay();

    if (ads.id[d].rendered) {
      var params = {
        width: event.size[0],
        height: event.size[1],
        event: event
      };
      ads.id[d].rendered(params);
    }
  }
}

ads.instanceAd = function(format) {
  console.log("FORMAT2: ",format, ads.id);
  this.values={};
  this.set = function(name,value) { this.values[name]=value; return this; };
  this.get = function(name) { return (this.values[name]!=null?this.values[name]:null); }
  this.msg = function(){ console.log("msg not set for "+format); }
  ads.formats[format] && ads.formats[format](this);
  this.startDisplay = function() { this.parentSlot.style.display = (this.get("startDisplay") || ""); }
} 

ads.readMessage = function(e) {
//console.log("message",e,e.data,e.data.msg);
  var msg = (e.data && e.data.msg) ? e.data.msg : "";
  if (msg == "adcase") {
    var format = (e.data && e.data.format) ? e.data.format : false;
    e.data.params = e.data.params || {};
    if(e.data.params.handle && e.data.params.handle > 1) {
console.log("MSG Format 0   :",e.data)
      ads.id[ads.getIdFromHandle(e.data.params.handle)].msg(e.data.params);  
    } else if (e.data.params.text){
console.log("MSG Format 1   :",e.data)
      console.log("e.data.params.text",e.data.params.text);
      ads.adTexts.push({text:e.data.params.text, slotWindow: e.source});
      ads.matchAds();
    } else if (format) {
console.log("format:",format);
console.log("MSG Format 2   :",format,ads.id[ads.getIdFromFormat(format)], e.data)
      ads.id[ads.getIdFromFormat(format)].msg(e.data.params);  

    }
  }
}

window.addEventListener("message", ads.readMessage, false);

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

        var adParams = ads.styles.expand970x250;
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
  console.log("ads.id",ads.id);
  for(var i in ads.id) {
    if(ads.id[i].format == format) {
      return i;
    }
  }
}

console.log(3);
ads.formats.footerFixed = function(t) {

  t.set("startDisplay", "none");

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

  if(false && params.height == 250) {
    // Expanding mouseover footer
    var w = ads.formats.getWindow("footerFixed");
    div.addEventListener("mouseover", 
      function() { 
        document.getElementById("footerFixed-adText").style.display="none"; 
        containerDiv.style.height = "250px"; 

        let slotWindow = ads.getHandleWindowFromDivId("zocalo_desktop_ad");
        if(slotWindow) {
          slotWindow.postMessage({ msg: "expandSlot" }, "*");
        } else {
          console.log("**No slotWindow for div "+div.id,div);
        }
      }

      , false);
    div.addEventListener("mouseout", 
      function() { 
        document.getElementById("footerFixed-adText").style.display=""; 
        containerDiv.style.height = "90px"; }
      , false);
    containerDiv.style.height = "90px";
  }
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

}
ads.formats.interstitial = function(t) {
  

  t.set("startDisplay", "none");

  t.msg = function(params) {

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

  window.clearTimeout(ads.interstitialTimeout);
  if(params.autoclose > 0) {
    ads.interstitialTimeout = window.setTimeout(function() { 
     // parent.style.display = "none";
     // parent.innerHTML = ""
    }, params.autoclose * 1000);
  }
  window.setTimeout(function() { parent.style.display = "block"; document.body.style.overflow="hidden"; }, 1000); // show interstitial
  window.setTimeout(function() { document.getElementById("interstitialIconDiv") && (document.getElementById("interstitialIconDiv").style.display=""); }, 500); // show [X]
}

}

ads.formats.push = function(t) {

  t.msg = function(p) {

    t.parentSlot.style.overflow = "hidden";
  if(p.transition) {
    t.parentSlot.style.transition = "height "+(p.transition/1000)+"s ease-in;"; 
  }

  if(p.action == "collapse") {
      t.parentSlot.style.height = "90px"; 
    } else if(p.action == "expand") {
      t.parentSlot.style.height = "250px"; 
  }
  }

}

ads.styles = ads.styles || {};
ads.styles.iconClose = ads.styles.iconClose || "data:image/png;base64,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";
ads.styles.footerFixed = ads.styles.footerFixed || { img: "<img height=24 width=24 src='"+ads.styles.iconClose+"'>", top: 0, right:0 };
ads.styles.interstitial = ads.styles.interstitial || { img:"<img src='"+ads.styles.iconClose+"' height=54 width=54 border=0>", top: -25, right:-25}
ads.styles.expand970x250 = ads.styles.expand970x250 || {iconsStyle : "width:45px;position:absolute;left:917px;top:0;border:1px solid #ccc;font-family:Arial;font-size:11px;padding:3px;background-color:white;text-align:center;",
                            openIconHTML: "Abrir",
                            closeIconHTML: "Cerrar"
                          }
