//
// AdCase.js DEBUG JavaScript Library v2.1.26. 2/Mar/2018
// Copyright 2018 adcase.io 
// https://adcase.io
// https://adcase.io/license 
// AdCase.js simplifies the use of both Rich Media and display creatives in Double Click for Publishers (DFP).
// This is not an official Google product, and it is also not officially supported by Google.
//

ads.d = ads.d || {};
ads.d.values = ads.d.values || {};
ads.d.s = function(k,v) { ads.d.values[k] = v; }
ads.d.g = function(k) { return ads.d.values[k] || null; }
ads.d.pagekvHTML = "";

ads.d.s("isMobile",/Mobi/.test(navigator.userAgent));

ads.d.updateModal = function() {
  if(ads.d.g("isMobile")) {
     ads.d.g("modalContent").innerHTML = ads.d.debugContentMobile();
  } else {
     ads.d.g("modalContent").innerHTML = ads.d.debugContent();
  } 
}

ads.d.configWindow = function() {
  var html = "<div id='configWindow' style='display:none;margin-bottom:100px'>Paste inventory CSV here (as plain text):<br><textarea id='configInventory' style='width:400px;height:100px'></textarea>"
  +"<br><a href='javascript:ads.d.saveConfig()'><button class='adsbtn' type=button'><span>Save</span></button></a></div>";
  return html;
}
ads.d.saveConfig = function() {
  var inv = document.getElementById("configInventory").value;
  document.getElementById("configInventory").value = "";
  if(inv && inv!="") {
    localStorage.setItem("ads.inventory",inv);
  }
  document.getElementById("configWindow").style.display="none";
  ads.d.run();
}

ads.d.s("googleTagInterval", window.setInterval(function(){
  if(googletag && googletag.cmd) {
    window.clearInterval(ads.d.g("googleTagInterval"));
    googletag.cmd.push(function(){googletag.pubads().addEventListener('slotRenderEnded', function (event) { ads.d.run(); }); });
  }
},100));

ads.d.clickButton = function() {
  if(!localStorage.getItem("adcase-debug-mode")) {
    localStorage.setItem("adcase-debug-mode",0);
  }
  var mode = (localStorage.getItem("adcase-debug-mode") * 1) + 1;
  if(mode==3) { mode = 0; }
  localStorage.setItem("adcase-debug-mode",mode);
  ads.d.s("mode",mode);
  ads.d.run();
}
ads.d.closeModal = function() {
  localStorage.setItem("adcase-debug-mode",0);
  //ads.d.g("modalContainer") && (ads.d.g("modalContainer").style.display="none");
  ads.d.s("mode",0);
  ads.d.run();
}
ads.d.run = function() {
  if(!ads.network && ads.adEvents && ads.adEvents[0] && ads.adEvents[0].slot) {
    ads.network = ads.d.strtoken(ads.adEvents[0].slot.getAdUnitPath(),2,"/");
  }

  var mode = ads.d.g("mode")*1;

  var button = document.getElementById("adcase-button-button");
  var text = document.getElementById("adcase-button-text");
  ads.d.g("modalContainer") && (ads.d.g("modalContainer").style.display="none");
  var d = document.getElementsByClassName("adcase-overlay");
  for (var i = 0; i < d.length; i++) {
    d.item(i).innerHTML = "";
  }

  if(mode==0) {
    text.innerHTML = "ads";
  } else if(mode==1) {
    text.innerHTML = "popup";
    ads.d.runModal();    
  } else if(mode==2) {
    text.innerHTML = "overlay";
    ads.d.runOverlay();
  }

}

ads.d.runOverlay = function () {

  ads.d.prepareData();
  for(var i in ads.d.data) {
    var d = ads.d.data[i];

    var html = "<div style='width:100%;padding:10px;text-align:left; font-family:Arial;line-height:1.3;font-size:13px;opacity: 0.9;background-color:#eee'>"
             +"<div style='margin-bottom:4px;padding:8px 0 0 10px;height:26px;color:#fff;width:100%;text-align:left;background-color:#3498db;font-weight:bold;font-size:15px'>"
                 +d.parentId +" - "+ d.size+"</div>"
             +"<b>"+d.adUnit+"</b> "+d.errorTxt+"<br/>"
             +"<b>Requested:</b> "+d.sizes;
    if(d.size!="unfilled") {        
      html +="<br><b>Or: </b>"+d.orderID+"&nbsp;&nbsp;"
             +"<b>LI: </b>"+d.lineItemID+"&nbsp;&nbsp;"
             +"<br><b>Cr: </b>"+d.creativeID+"&nbsp;&nbsp;<br/>"
             +(d.slotKV!="" ?"KV: "+d.slotKV:"");
    }
    html += "</div>";

    var div = document.getElementById(d.divId);
    if(!div) { 
      ads.log("NOT DIV",d.divId); 
      continue;
    }
    div.style.position = "relative";    
    var newDiv = document.getElementById("adcase-overlay-"+d.divId);
    if(newDiv) {
      newDiv.innerHTML = html;
    } else {  
      newDiv=document.createElement("div");
      newDiv.id = "adcase-overlay-"+d.divId;
      newDiv.className = "adcase-overlay";
      newDiv.style.position="absolute";
      newDiv.style.top=0;
      newDiv.style.zIndex=10000;
      newDiv.style.opacity=0.9;
    //  newDiv.style.width="100%";
      newDiv.style.width="100%";
      newDiv.innerHTML = html;
      div.appendChild(newDiv);
    } 
  }

}

ads.d.runModal = function() {

ads.d.checkInventory();

if(ads.d.g("modalContainer")) { 
  ads.d.updateModal();
  ads.d.g("modalContainer").style.display = "block";
  return;
}

if( ads.d.g("isMobile") ) {
  ads.d.runModalMobile();
  return;
}

  var style =`

#adcaseContainer {
    position: fixed; /* Stay in place */
    z-index: 9999999; /* Sit on top */
    padding-top: 100px; /* Location of the box */
    left: 0;
    top: 0;
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    overflow: auto; /* Enable scroll if needed */
    background-color: rgb(0,0,0); /* Fallback color */
    background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
}

#adcaseContainer2 {
    font-family: Arial; 
    font-size:13px;
    background-color: #fefefe;
    margin: auto;
    padding: 10px 20px 40px 20px;
    border: 1px solid #888;
    width: 90%;
}
#adcaseContainer2 a { color:#0652DD  }
#adcaseContainer2 a:hover { color:#800040  }
 
.adcaseTable thead td { background-color:#ccc;font-weight:bold;padding:6px 20px 4px 20px }
.adcaseTable { border-collapse: collapse; }
.adcaseTable tr.adcaseRow:hover { background-color:#eee; cursor:pointer }
.adcaseTable td {
  font-family:Poppins;
  font-size:11px;
  padding:8px 20px 8px 20px;
  border-bottom:1px solid #ccc;
}
table#adcasekv td {padding:4px}
.adsIp { width:300px}
.adsIp td { font-size:12px;padding:2px 0px 2px 0px;border-bottom:0px; }

#adcase-ipinfo { padding-top:10px}
#adcase-ipinfo td { font-size:11px; padding:4px; }
`;

var s = document.createElement("style");
s.innerHTML = style;
document.head.appendChild(s);

  var d = document.createElement("div");
  d.id = "adcaseContainer";
  d.innerHTML = "<div id='adcaseContainer2'>"+ads.d.configWindow()+"<div id='adcaseContent'>"+ads.d.debugContent()+"</div></div>";
  document.body.appendChild(d);
  ads.d.s("modalContent", document.getElementById("adcaseContent"));
  ads.d.s("modalContainer", document.getElementById("adcaseContainer"));

  ads.d.setIpInfo();
}
ads.d.formatSizes = function (s) {
  var txt ="";
  for(var i in s) {
    var size = s[i];
    var line = "";
    for(var j in size) {
      if(line=="") {
        line = size[j];
      } else {
        line += "x"+size[j];
        break;
      }
    }
    txt += (txt==""?"":", ") + line;
  }
  return txt;
}

ads.d.prepareData = function() {
  ads.d.data = {};
  for(var i in ads.adEvents) {
    ads.adEvents[i].slotKVHTML = ads.d.getSlotKV(ads.adEvents[i].slot);
  }
  var showFormat=false;
  var dfpPath = (ads.router ? ("DFP Path: /"+ads.network+ads.router()) : ""); 
  var printedSlots = {};
  for(var i in ads.adEvents) {
    var row = {};
    var e = ads.adEvents[i];
    if(!e || !e.slot) { ads.log("not found:",e,e.slot); continue; }
    row.divId = e.slot.getSlotElementId();
    row.div = document.getElementById(row.divId);
    row.parentId = row.divId.substring(0,e.slot.getSlotElementId().length-3);
    if(!ads.router) { // light version
      row.parentId = row.divId;
    }
    row.adUnit = e.slot.getAdUnitPath();

    row.network = ads.network || ads.d.strtoken(row.adUnit,2,"/");

    row.errorTxt = "";//(ads.d.g("debugErrors")[row.parentId] ? " <span style='color:red;font-weight:bold'>[WRONG ID]</span>" : "");
    printedSlots[row.parentId] = true;
    row.slotKV = e.slotKVHTML;
    row.sizes = ads.d.formatSizes(e.slot.getSizes());
    row.size = e.size ? (e.size[0]+"x"+e.size[1]) : "unfilled";
    row.format = (row.div && ads.id && ads.id[row.divId] && ads.id[row.divId].format) ? ads.id[row.divId].format :"";
    row.orderURL = e.campaignId ? ("<a target=_blank href='https://www.google.com/dfp/" + row.network + "?#delivery/OrderDetail/orderId=" + e.campaignId+"'>"+e.campaignId+"</a>") : "";
    row.lineItemURL = e.lineItemId ? ("<a target=_blank href='https://www.google.com/dfp/" + row.network + "?#delivery/LineItemDetail/lineItemId=" + e.lineItemId+"'>"+e.lineItemId+"</a>") : "";
    row.creativeURL = e.creativeId ? ("<a target=_blank href='https://www.google.com/dfp/" + row.network + "?#delivery/CreativeDetail/creativeId=" + e.creativeId+"'>"+e.creativeId+"</a>") : "";
    row.qid = e.slot.getEscapedQemQueryId();

    row.orderID = e.campaignId;
    row.lineItemID = e.lineItemId;
    row.creativeID = e.creativeId;
    
    row.slotTime = "";
    try {
      row.slotTime = Number.isInteger(ads.id[row.divId].renderedTime) ? Math.round(ads.id[row.divId].renderedTime) : "";
      var startTimeSec = ((ads.id[row.divId].startTime-ads.startTime)/1000).toFixed(1)+"s";
      if(row.slotTime!=""){ row.slotTime+=" ("+startTimeSec+"+"+row.slotTime+"ms)"; }
    } catch(e) {}
    ads.d.data[row.parentId] = row;
  }

}


ads.d.debugContent = function() {

  ads.d.prepareData();

  var showFormat=false;
  var dfpPath = (ads.router ? "DFP Path: /"+ads.network+ads.router() : ""); 

  var html = "<table id='1' class='adcaseTable' width=100%>"
               + "<tr><td style='vertical-align:top'>"
                    +"<table id='2'>"
                      +"<tr><td style='width:300px'><b>"+dfpPath+"</b><br><div id='adcase-ipinfo'>"+(sessionStorage.getItem("adcase-ipinfo")||"")+"</div></td>"
                          +"<td style='vertical-align:top;padding-right:0px;word-break:break-all' colspan=10>"
                              +(ads.d.pagekvHTML!=""?"<b>Page Level key-values:</b><br><div style='margin-top:6px;font-family:Courier New'>" + ads.d.pagekvHTML +"</div>":"")+"<br><b>User Agent:</b> " + navigator.userAgent
                          +"</td></tr>"
                    +"</table></td>"
                    + "<td valign=top  style='padding:0;width:1px;'>"
                         +(ads.router?"<a class='adcase-button' onclick='javascript:document.getElementById(\"configWindow\").style.display=\"\"'><button><span>Config</span></button></a>":"")+"</td>"
                     +"<td valign=top style='padding:0;width:1px;'><A class='adcase-button' target=_blank HREF='https://www.google.com/dfp/"+ads.network+"#delivery/TroubleshootingTools/url="+document.location.href+"'><button><span>Troubleshoot</span></button></A></td>"
                     +"<td valign=top style='padding:0;width:1px;'><a class='adcase-button' href='javascript:ads.d.closeModal()'><button><span>X</span></button></a></td>"
             +"</tr></table>"

   + "<table class='adcaseTable'>"
   +"<thead><tr><td>Slot id / Time</td><td>Ad Unit / Query Id</td><td style='padding:6px 0 4px 0'></td><td>Req.Size</td><td>Ad Size</td>"+(showFormat?"<td>Format</td>":"")
   +"<td style='text-align:center'>Order</td><td style='text-align:center'>Line Item</td><td style='text-align:center'>Creative</td><td>Slot KV</td></tr></thead>";
var printedSlots = {};
  for(var i in ads.d.data) {
    var d = ads.d.data[i];
    printedSlots[d.parentId] = true;

    html += "<tr class='adcaseRow' style='background-color:"+(d.size=="unfilled"?"#ffd394":"")+"'><td><b>"+d.parentId+"</b></td>"
             +"<td>"+d.adUnit+"<br>"+d.qid+d.slotTime+"</td><td>"+d.errorTxt+"</td>"
             +"<td>"+d.sizes+"</td>"
             +(showFormat?"<td>"+d.format+"</td>":"")
             +"<td style='text-align:center'>"+d.size+"</td>"
             
             +"<td>"+d.orderURL+"</td>"
             +"<td>"+d.lineItemURL+"</td>"
             +"<td>"+d.creativeURL+"</td>"
             +"<td style='font-family:Courier New;word-break:break-all'>"+d.slotKV+"</td>"

             +"</tr>";
  }

  if(ads.id) {
    for(var i in ads.id) {
      if(ads.id[i].format && ads.id[i].format!="default") {
        showFormat=true;
      }
    }
    for(var i in ads.id) {
      if(printedSlots[ads.id[i].parentId] || printedSlots[ads.id[i].divId]) {
        continue;
      }
      var adUnit = "";
      if(ads.network && ads.router) {
        adUnit = "/" + ads.network + ads.router() + ads.id[i].parentId;
      } else {
        adUnit = ads.id[i].event.slot.getAdUnitPath();
      }
      var errorTxt = "";//(ads.d.g("debugErrors")[ads.id[i].parentId] ? " <span style='color:red;font-weight:bold'>[WRONG ID]</span>" : "");
      html += "<tr style='background-color:#e5e5e5'><td>"+ads.id[i].parentId+"</td><td>"+adUnit+"</td><td>"+errorTxt+"</td>"
               +"<td>"+(ads.id[i].sizes?JSON.stringify(ads.id[i].sizes):"")+"</td>"
               +(showFormat?"<td>"+ads.id[i].format+"</td>":"")
               +(ads.id[i].width?"<td style='text-align:center'>"+ads.id[i].width+"x"+ads.id[i].height+"</td>":"<td style='text-align:center'></td>")
               
               +"<td colspan=4>Pending request</td>"

               +"</tr>";
     }
   }

   html +="</table></td></tr></table>";

  return html;
}

ads.d.debugKV = function() {
  var kv = ads.kv;
  var out = "<table id='adcasekv'>";
  for(var i in kv) {
    if(typeof(kv[i])=="string" && kv[i]=="") { continue; }
    out += "<tr><td><b>"+i+":</b></td><td>";
    if(typeof(kv[i])=="object") {
      var v="";
      for(var j in kv[i]) {
        v += (v==""?"":" | ") + kv[i][j];
      }
      out += v;
    } else {
      out += kv[i];
    }
    out += "</td></tr>";
  }
  out += "</table>";
  return out;
}

ads.d.checkInventory = function() {
  var debugErrors = {};
  var inv = localStorage.getItem("ads.inventory");
  if(!inv) return;
  for(var i in ads.id) {
    var parentId = ads.id[i].parentId;
    var path = ","+ads.router().substring(1)+parentId+",";
    if(inv.indexOf(path)<1) {
      debugErrors[parentId] = { missing: true }
    }
  }
  ads.d.s("debugErrors", debugErrors);
}

ads.d.strtoken = function(s,n,sep) {
  var out = "";
  var sp = s.split(sep); 
  try {
    if(n>0) {
      out = sp[n-1];
    } else {
      out = sp[sp.length+n];
    }
  } catch(e) {}
  return out;
}


ads.d.getSlotKV = function(slot) {

  var url = "";
  for(var i in slot) {
    try {
      if(typeof(slot[i])=="string" && slot[i].substring(0,49)=="https://securepubads.g.doubleclick.net/gampad/ads") {
        url = slot[i];
        break;
      }
    } catch (e) {}
  }

  var kv = {};  
  var url = new URL(url);
  var scp = decodeURIComponent(url.searchParams.get("scp")).split("&");
  for(var i in scp) {
    try {
      var k = scp[i].split("=")[0];
      var v = scp[i].split("=")[1];
      v && (kv[k] = v);
    } catch(e) {}
  }
  var custParams = decodeURIComponent(url.searchParams.get("cust_params")).split("&");
  var pageKV = {};
  for(var i in custParams) {
    try {
      var k = custParams[i].split("=")[0];
      var v = custParams[i].split("=")[1];
      v && (pageKV[k] = v);
    } catch(e) {}
  }

  ads.d.pagekvHTML = "";
  for(var i in pageKV) {
    ads.d.pagekvHTML += (ads.d.pagekvHTML==""?"":"&nbsp;&nbsp;&nbsp;") + "<b>" + i + "=</b>" + pageKV[i];
  }

  var kvHTML = "";
  for(var i in kv) {
    kvHTML += (kvHTML==""?"":"&nbsp;&nbsp;&nbsp;") + "<b>" + i + "=</b>" + kv[i];
  }
  return kvHTML;
}



ads.d.layerAdDetails = function () {
    var divId = event.slot.getSlotElementId();
    var div = document.getElementById(divId);
    var network = event.slot.getAdUnitPath().split("/")[1];
    var orderURL = "https://www.google.com/dfp/" + network + "?#delivery/OrderDetail/orderId=" + event.campaignId;
    var lineItemURL = "https://www.google.com/dfp/" + network + "?#delivery/LineItemDetail/lineItemId=" + event.lineItemId;
    var creativeURL = "https://www.google.com/dfp/" + network + "?#delivery/CreativeDetail/creativeId=" + event.creativeId;

    //params.adFormat = params.adFormat || "default";
    var logHTML = "<table style='margin:0 auto;background-color:white;'>"
        + "<tr><td style='text-align:left' colspan=2><b>" + div.parentElement.id + "</b>: " + event.slot.getAdUnitPath() + "</td></tr>"
        + "<tr><td width=10 style='text-align:left'>Size:</td><td style='text-align:left'>" + event.size[0] + " x " + event.size[1] + "</td></tr>"
        + "<tr><td style='text-align:left'>Advertiser: " + event.advertiserId + " Order: <a href='" + orderURL + "' target=_blank>" + event.campaignId 
        + "</a>LineItem: <a href='" + lineItemURL + "' target=_blank>" + event.lineItemId + "</a> Creative:</td><td style='text-align:left'><a href='" + creativeURL + "' target=_blank>" + event.creativeId + "</a></td></tr>"
        //+ "<tr><td style='text-align:left'>adFormat:</td><td style='text-align:left'>" + params.adFormat + "</td></tr>"
        //              +  +"<br>Targeting: " + event.slot.getTargetingKeys() 

        + "</table>"

    div.parentElement.style.position = "relative";
    newDiv = document.createElement("div");
    newDiv.style.position = "absolute";
    newDiv.style.top = 0;
    newDiv.style.fontSize = "11px";
    newDiv.style.textAlign = "center";
    newDiv.style.zIndex = 10000;
    newDiv.style.opacity = 0.9;
    //  newDiv.style.width="100%";
    newDiv.style.height = "100%";
    newDiv.innerHTML = logHTML;
    div.parentElement.appendChild(newDiv);
}

ads.d.setIpInfo = function() {
  var html = "";
  try {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.ipify.org');
    xhr.onload = function() {
      if (xhr.status === 200) {
        var ip = xhr.responseText;

        var xhr2 = new XMLHttpRequest();
        xhr2.open('GET', 'https://freegeoip.net/json/'+ip);
        xhr2.onload = function() {
          if (xhr2.status === 200) {
            var data = JSON.parse(xhr2.responseText);
            html = data.ip+"<br>"+data.country_name+" - "+data.region_name+" ("+data.region_code+") - "+data.city;
            document.getElementById("adcase-ipinfo") && (document.getElementById("adcase-ipinfo").innerHTML=html);
            sessionStorage.setItem("adcase-ipinfo",html);
          }
        };
        xhr2.send();
      }
    };
    xhr.send();
  } catch(e) {

  }

}



ads.d.runModalMobile = function() {

  var style =`

#adcaseContainer {
    position: absolute; /* Stay in place */
    z-index: 9999999; /* Sit on top */
    padding-top: 50px; /* Location of the box */
    left: 0;
    top: 0;
    width: 100%; /* Full width */
    background-color: rgb(0,0,0); /* Fallback color */
    background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
}

#adcaseContainer2 {
    font-family: Arial; 
    font-size:13px;
    background-color: #fefefe;
    margin: auto;
    border: 1px solid #888;
    width: 90%;
}
#adcaseContainer2 a { color:#0652DD  }
#adcaseContainer2 a:hover { color:#800040  }
 
/* The Close Button */
#adcaseClose {
    color: #aaaaaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
}

#adcaseClose:hover,
#adcaseClose:focus {
    color: #000;
    text-decoration: none;
    cursor: pointer;
}
.adcaseTable thead td { background-color:#ccc;font-weight:bold;padding:6px 20px 4px 20px }
.adcaseTable { border-collapse: collapse; }
.adcaseTable tr:hover { background-color:#eee; cursor:pointer }
.adcaseTable td {
  padding:8px 20px 8px 20px;
  border-bottom:1px solid #ccc;
}
table#adcasekv td {padding:4px}
.adsIp { width:300px}
.adsIp td { font-size:12px;padding:2px 0px 2px 0px;border-bottom:0px; }

#adcase-ipinfo { padding-top:10px; width:100% }
#adcase-ipinfo td { font-size:11px; padding:4px; }

.adcase-title { font-size:14px;width:100%;background-color:#00a8ff;color:white; height:28px;text-align:center;padding-top:6px;font-weight:bold;}
.adcase-block { width:100%;padding:5px;font-family:Arial;font-size:12px;  font-family:Poppins }
.adcase-block .line { width:100%;margin-top:25px; line-height:1.3; }
.adcase-block .unfilled { background-color:#e67e22; }
.adcase-block .pending { background-color:#bdc3c7; color:black }

`;

var s = document.createElement("style");
s.innerHTML = style;
document.head.appendChild(s);

  var d = document.createElement("div");
  d.id = "adcaseContainer";
  d.innerHTML = "<div id='adcaseContainer2'>"+ads.d.configWindow()+"<div id='adcaseContent'>"+ads.d.debugContentMobile()+"</div></div>";
  document.body.appendChild(d);
  ads.d.s("modalContent", document.getElementById("adcaseContent"));
  ads.d.s("modalContainer", document.getElementById("adcaseContainer"));

  ads.d.setIpInfo();
}

ads.d.debugContentMobile = function() {

  ads.d.prepareData();

  var showFormat=false;
  var dfpPath = (ads.router ? "/"+ads.network+ads.router() : ""); 

  var html = "<div class='adcase-title'>Debug</div>"
             +"<div class='adcase-block'>"
              +"<div ><b>"+dfpPath+"</b><div id='adcase-ipinfo' style='font-size:12px;margin-top:5px'>"+(sessionStorage.getItem("adcase-ipinfo")||"")+"</div></div>"
              +"<div style='font-size:12px;margin-top:5px'><b>User Agent:</b> " + navigator.userAgent + "</div>"
              +"</div><div class='adcase-block'>";

  var printedSlots = {};
  for(var i in ads.d.data) {
    var d = ads.d.data[i];
    d.errorTxt = "";
    printedSlots[d.parentId] = true;

    html += "<div class='line'></div>"
             +"<div style='margin-left:3px;width:100%;background-color:#eee;box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);border-radius:4px;'>"
             +"<div class='adcase-title "+(d.size=="unfilled"?"unfilled":"")+"' style='padding-top:4px;'>"+d.parentId+(d.size=="unfilled"?" [unfilled]":"")+"</div>"
             +"<div style='padding:5px;'>"
             +"<b>"+d.adUnit+"</b> "+d.errorTxt+"<br/>"
             +"<b>Requested:</b> "+d.sizes;
    if(d.size!="unfilled") {        
      html +="<br><b>Ad: "+d.size+"</b><br/>"
             +"<b>Or: </b>"+d.orderID
             +"<b>LI: </b>"+d.lineItemID
             +"<br><b>Cr: </b>"+d.creativeID
             +"<br><b>qID: </b>"+d.qid+d.slotTime
             +(d.slotKV!="" ?"KV: "+d.slotKV:"");
    } else {
      html +="<br><b>qID: </b>"+d.qid+d.slotTime
             +(d.slotKV!="" ?"KV: "+d.slotKV:"");
    }
    html += "</div></div>";
  }
  html += "</div>";


  html += "<div class='adcase-block'>"

  if(ads.id) {
    for(var i in ads.id) {
      if(ads.id[i].format && ads.id[i].format!="default") {
        showFormat=true;
      }
    }
    for(var i in ads.id) {
      if(printedSlots[ads.id[i].parentId]) {
        continue;
      }
      var adUnit = "/" + ads.network + ads.router() + ads.id[i].parentId;
      var errorTxt = "";//(ads.d.g("debugErrors")[ads.id[i].parentId] ? " <span style='color:red;font-weight:bold'>[WRONG ID]</span>" : "");
      var sizes = ""; try{ sizes = (ads.id[i].sizes?JSON.stringify(ads.id[i].sizes):"");} catch(e){}
      html += "<div class='line'>"
             +"<div class='adcase-title pending' style='padding-top:4px'>"+ads.id[i].parentId+" [Pending Request]</div>"
             +"<b>"+adUnit+"</b> "+errorTxt+"<br/>"
             +"<b>Requested:</b> "+sizes
             +"</div>";

     }
   }
  html += "</div>";

  if(ads.d.pagekvHTML != "") {
    html += "<div id='KVBlock' class='adcase-block'>"
               +"<div style='word-break:break-all;width:100%'>"
               +"<b>Page Level key-values:</b><div class='line' style='margin-top:6px;font-family:Courier New'>" + ads.d.pagekvHTML +"</div>"
               +"</div></div>";
  }

  return html;
}

ads.d.clickButton();
