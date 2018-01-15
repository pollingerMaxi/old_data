console.log("DEV core-light.js");

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