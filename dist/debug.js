//
// AdCase.js DEBUG JavaScript Library v3.0.11 18/Jun/2018
// Copyright 2018 adcase.io 
// https://adcase.io
// https://adcase.io/license 
// AdCase.js simplifies the use of both Rich Media and display creatives in Double Click for Publishers (DFP).
// This is not an official Google product, and it is also not officially supported by Google.
//
var ads = ads || adcase;
ads.version = ads.version || ""; // please update adcase.js

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
  var savedKey = localStorage.getItem("ads.debugKey")||""; 
  if(ads.debugKey && ads.debugKey!=savedKey) {
    ads.d.s("requestKey",true);
  } else {
    ads.d.s("requestKey",false);
  }
  
  if(!ads.network && ads.adEvents && ads.adEvents[0] && ads.adEvents[0].slot) {
    ads.network = ads.d.strtoken(ads.adEvents[0].slot.getAdUnitPath(),2,"/");
  }

  var mode = ads.d.g("mode")*1;

  var button = document.getElementById("adcase-button-button");
  var text = document.getElementById("adcase-button-text");
  ads.d.g("modalContainer") && (ads.d.g("modalContainer").style.display="none");
  var d = document.getElementsByClassName("adcase-overlay");
  for (var i = 0; i < d.length; i++) { if(!(d.hasOwnProperty(i))) { continue; }
    d.item(i).innerHTML = "";
  }

  if(mode==0) {
    text.innerHTML = "ads";
  } else if(mode==1) {
    text.innerHTML = "popup";
    ads.d.runModal();    
    if(localStorage.getItem("ads-debug-share-code")) {
      ads.d.sendShareData();
    }
  } else if(mode==2) {
    text.innerHTML = "overlay";
    ads.d.runOverlay();
  }

}

ads.d.runOverlay = function () {

  ads.d.prepareData();
  for(var i in ads.d.data.rows) { if(!(ads.d.data.rows.hasOwnProperty(i))) { continue; }
    var d = ads.d.data.rows[i];

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

if(!ads.d.g("requestKey",true)) {
  ads.d.checkInventory();

  if(ads.d.g("modalContainer")) { 
    ads.d.updateModal();
    ads.d.g("modalContainer").style.display = "block";
    return;
  }
}

if( ads.d.g("isMobile") ) {
  window.scrollTo(0,0);
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
    display: table
}
#adcaseContainer2 a { color:#0652DD  }
#adcaseContainer2 a:hover { color:#800040  }
 
.adcaseTable thead td { background-color:#ccc;font-weight:bold;padding:6px 20px 6px 20px; }
.adcaseTable { border-collapse: collapse; }
.adcaseTable tr.adcaseRow:hover { background-color:#eee; cursor:pointer }
.adcaseTable td {
  font-family:Poppins;
  font-size:11px;
  padding:5px 10px 5px 10px;
  border-bottom:1px solid #ccc;
  vertical-align:middle;
  line-height:16px;
}
table#adcasekv td {padding:4px}
.adsIp { width:300px}
.adsIp td { font-size:12px;padding:2px 0px 2px 0px;border-bottom:0px; }

#adcase-ipinfo { padding-top:10px}
#adcase-ipinfo td { font-size:11px; padding:4px; }

.adcase-block { width:100%;padding:5px;font-family:Arial;font-size:12px;  font-family:Poppins }

`;

var s = document.createElement("style");
s.innerHTML = style;
document.head.appendChild(s);

  var d = document.createElement("div");
  d.id = "adcaseContainer";
  if(ads.d.g("requestKey")) {
    d.innerHTML = "<div id='adcaseContainer2'><div id='adcaseContent'>"+ads.d.requestKeyHTML()+"</div></div>";
  } else {
    d.innerHTML = "<div id='adcaseContainer2'>"+ads.d.configWindow()+"<div id='adcaseContent'>"+ads.d.debugContent()+"</div></div>";
  }
  document.body.appendChild(d);
  ads.d.s("modalContent", document.getElementById("adcaseContent"));
  ads.d.s("modalContainer", document.getElementById("adcaseContainer"));

  ads.d.setIpInfo();
}

ads.d.requestKeyHTML = function() {
  var out = "<h1>Please enter Debug key:</h1><br><input size=20 id='adcase_debug_key'><br><br>"  
    + "<a class='adcase-button' href='javascript:ads.d.saveKey()'><button><span>Set Key</span></button></a>";
  return out; 
}
ads.d.saveKey = function() {
  var newKey = document.getElementById("adcase_debug_key").value;
  if(ads.md5(newKey)==ads.debugKey) {
    localStorage.setItem("ads.debugKey",ads.debugKey);
  }
  localStorage.setItem("adcase-debug-mode",0);
  ads.d.clickButton();
}


ads.d.formatSizes = function (s) {
  var txt ="";
  for(var i in s) {  if(!(s.hasOwnProperty(i))) { continue; }
    var size = s[i];
    var line = "";
    for(var j in size) { if(!(size.hasOwnProperty(j))) { continue; }
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

ads.d.formatJsSizes = function (s) {
  var txt ="[";
  for(var i in s) {  if(!(s.hasOwnProperty(i))) { continue; }
    var size = s[i];
    var line = "[";
    for(var j in size) { if(!(size.hasOwnProperty(j))) { continue; }
      if(line=="[") {
        line += size[j];
      } else {
        line += ","+size[j];
        break;
      }
    }
    line += "]";
    txt += (txt=="["?"":", ") + line;
  }
  txt += "]";
  return txt;
}

ads.d.prepareData = function() {
  ads.d.data = { rows:{} };
  for(var i in ads.adEvents) { if(!(ads.adEvents.hasOwnProperty(i))) { continue; }
    ads.adEvents[i].slotKVHTML = ads.d.getSlotKV(ads.adEvents[i].slot);
    ads.adEvents[i].slotKVArray = ads.d.getSlotKVArray(ads.adEvents[i].slot);
  }
  var showFormat=false;
  var dfpPath = (ads.router ? ("DFP Path: /"+ads.network+ads.router()) : ""); 
  var printedSlots = {};
  for(var i in ads.adEvents) { if(!(ads.adEvents.hasOwnProperty(i))) { continue; } 
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
    row.slotKVArray = e.slotKVArray;
    row.sizes = ads.d.formatSizes(e.slot.getSizes());
    row.jsSizes = ads.d.formatJsSizes(e.slot.getSizes());

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
      if(row.slotTime!=""){ row.slotTime =" ("+startTimeSec+"+"+row.slotTime+"ms)"; }
    } catch(e) {}
    ads.d.data.rows[row.parentId] = row;
  }
  
  ads.d.data.url = document.location.href;
  
  ads.set("ads.d.data",ads.d.data);
}

ads.d.testPage = function() {

  var dfpPath = "<div>"+(ads.router ? "/"+ads.network+ads.router() : "")+"</div>"; 
  var screenSize = "<b>Screen Size:</b> " + (ads.device.isMobile? (screen.width+"x"+screen.height) : (window.innerWidth+"x"+window.innerHeight));

  var logData = "\n\n\n\n<table width=100%><caption>USER PREVIOUS REQUEST LOG DATA</caption>"
               + "<tr><td style='vertical-align:top;'>"
                    +"<table id='2'>"
                      +"<tr><td style='width:300px;border:0'><b>"+dfpPath+"</b><br><div id='adcase-ipinfo'>"+(sessionStorage.getItem("adcase-ipinfo")||"")+"</div></td>"
                          +"<td style='vertical-align:top;padding-right:0px;word-break:break-all;border:0' colspan=10>"
                              +(ads.d.pagekvHTML!=""?"<b>Page Level key-values:</b><br><div style='margin-top:6px;font-family:Courier New'>" + ads.d.pagekvHTML +"</div>":"")+"<br><b>User Agent:</b> " + navigator.userAgent + "<br>" + screenSize
                          +"</td></tr>"
                    +"</table></td></tr>"

   + "<tr><td colspan=2 style='padding:0'><table width='100%'>"
   +"<thead><tr><td>Slot id / Time</td><td>Ad Unit / Query Id</td><td>Req.Size</td><td style='text-align:center'>Ad Size</td>"
   +"<td style='text-align:center'>Order</td><td style='text-align:center'>Line Item</td><td style='text-align:center'>Creative</td><td style='max-width:300px'>Slot KV</td></tr></thead>";

  for(var i in ads.d.data.rows) { if(!(ads.d.data.rows.hasOwnProperty(i))) { continue; }
    var d = ads.d.data.rows[i];
    
    logData += "<tr><td><b>"+d.parentId+"</b></td>"
             +"<td>"+d.adUnit+"<br>"+d.qid+d.slotTime+"</td>"
             +"<td>"+d.sizes+"</td>"
             +"<td style='text-align:center'>"+d.size+"</td>"
             +"<td style='text-align:center'>"+d.orderURL+"</td>"
             +"<td style='text-align:center'>"+d.lineItemURL+"</td>"
             +"<td style='text-align:center'>"+d.creativeURL+"</td>"
             +"<td style='font-family:Courier New;word-break:break-all'>"+d.slotKV+"</td>"
             +"</tr>";
  }
  logData +="</table></td></tr></table>";
    
    
    var html = `
<form action="//jsfiddle.net/api/post/library/pure/" method="post" target="_blank" id="adcase_jsfiddler" style="display:none">
  <input type="text" name="title" value="Test page" >
  <input type="text" name="description" value="Code generated by http://adcase.io">
  <input type="text" name="wrap" value="h">

<textarea id="jsFhtml" name="html">
<!DOCTYPE HTML> 
<html lang="en-us">
<head>
<meta http-equiv="Content-type" content="text/html; charset=utf-8"> 
<title>DFP Test Page</title> 
<link href='https://fonts.googleapis.com/css?family=Roboto Mono' rel='stylesheet' type='text/css'>
<style type="text/css" media="screen">
body,td { font-family:Roboto Mono;font-size:13px } 
table {border-collapse: collapse;}
td { border:1px solid #ccc; }
caption { padding:5px;vertical-align:middle;background-color:#ccc;font-weight:bold}
</style>

<script src='https://www.googletagservices.com/tag/js/gpt.js'></script>

<script>
  var googletag = googletag || {};
  googletag.cmd = googletag.cmd || [];
  
  googletag.cmd.push(function() {`;
  var count=0;
  var divs = "";
  var singleRequest=false;
  var singleRequestQId={};
  
  for(var i in ads.d.data.rows) { if(!(ads.d.data.rows.hasOwnProperty(i))) { continue; }
    var d = ads.d.data.rows[i];

    if(singleRequestQId[d.qid.substr(d.qid.length - 12)]){ singleRequest=true; }
    singleRequestQId[d.qid.substr(d.qid.length - 12)]=true;

    html +="\n\n  googletag.defineSlot('"+d.adUnit+"', "+d.jsSizes+", '"+d.parentId+"')";
    for(var j in d.slotKVArray) { if(!( d.slotKVArray.hasOwnProperty(j))) { continue; }
        html +=".setTargeting('"+j+"', "+JSON.stringify(d.slotKVArray[j])+")";    
    }
    html +=".addService(googletag.pubads());"

    divs +="\n\n  <hr><b>"+d.adUnit+" - "+d.sizes+"</b><br>\n  <div id='"+d.parentId+"'><script>googletag.cmd.push(function() { googletag.display('"+d.parentId+"'); });</script></div>";
    count++;
  }

html +=(singleRequest?"\n\n  googletag.pubads().enableSingleRequest();":"\n")
     +"\n  googletag.pubads().collapseEmptyDivs();";
    for(var i in ads.d.pagekvArray) { if(!(ads.d.pagekvArray.hasOwnProperty(i))) { continue; }
      html +="\n  googletag.pubads().setTargeting('"+i+"', "+JSON.stringify(ads.d.pagekvArray[i])+");"    
    }

html +=`    //googletag.pubads().enableSyncRendering();
  googletag.pubads().set("page_url", "`+document.location.href+`"); 
  googletag.enableServices();
  });
</script>
</head>
<body>
`+divs+`

<br><br>

`+logData+`
</body>
</html>
</textarea>
</form>`;

if(!document.getElementById("adcase_testpage")) {
  var div = document.createElement("div");
  div.id = "adcase_testpage";
  document.body.appendChild(div); 
}
document.getElementById("adcase_testpage").innerHTML = html;

console.log("SUBMIT");
document.getElementById("adcase_jsfiddler").submit();

}



ads.d.debugContent = function() {

  ads.d.prepareData();

  var showFormat=false;
  var dfpPath = "<div>"+(ads.router ? "/"+ads.network+ads.router() : "")+"</div>"; 
  var screenSize = "<b>Screen Size:</b> " + (ads.device.isMobile? (screen.width+"x"+screen.height) : (window.innerWidth+"x"+window.innerHeight));

  var html = "<table id='1' class='adcaseTable' width=100%>"
               + "<tr><td style='vertical-align:top;'>"
                    +"<table id='2'>"
                      +"<tr><td style='width:300px;border:0'><b>"+dfpPath+"</b><br><div id='adcase-ipinfo'>"+(sessionStorage.getItem("adcase-ipinfo")||"")+"</div></td>"
                          +"<td style='vertical-align:top;padding-right:0px;word-break:break-all;border:0' colspan=10>"
                              +(ads.d.pagekvHTML!=""?"<b>Page Level key-values:</b><br><div style='margin-top:6px;font-family:Courier New'>" + ads.d.pagekvHTML +"</div>":"")+"<br><b>User Agent:</b> " + navigator.userAgent + "<br>" + screenSize
                          +"</td></tr>"
                    +"</table></td>"
                     +"<td valign=middle style='padding:0;width:1px;'>"
                       //+"<a class='adcase-button' href='javascript:ads.d.closeModal()'><button style='width:100%;background-color:#ccc'><span style='padding:12px'>X</span></button></a>"
                       +"<a class='adcase-button' href='javascript:ads.d.testPage()'><button style='width:100%;background-color:#3498db;margin:4px 0 4px 0'><span style='padding:12px'>Test</span></button></a>"
                       +"<br><A class='adcase-button' target=_blank HREF='https://www.google.com/dfp/"+ads.network+"#delivery/TroubleshootingTools/url="+document.location.href+"'><button style='width:100%;background-color:#1abc9c;margin-bottom:4px'><span style='padding:12px'>DFP</span></button></A>"
                //     +(ads.router?"<a class='adcase-button' onclick='javascript:document.getElementById(\"configWindow\").style.display=\"\"'><button><span>Config</span></button></a>":"")
                     + "</td></tr>"

   + "<tr><td colspan=2 style='padding:0'><table class='adcaseTable' width='100%'>"
   +"<thead><tr><td>Slot id / Time</td><td>Ad Unit / Query Id</td><!--<td style='padding:6px 0 4px 0'></td>--><td>Req.Size</td><td>Ad Size</td>"+(showFormat?"<td>Format</td>":"")
   +"<td style='text-align:center'>Order</td><td style='text-align:center'>Line Item</td><td style='text-align:center'>Creative</td><td style='max-width:300px'>Slot KV</td></tr></thead>";
  var printedSlots = {};
  
  for(var i in ads.d.data.rows) { if(!(ads.d.data.rows.hasOwnProperty(i))) { continue; }
    var d = ads.d.data.rows[i];
    printedSlots[d.parentId] = true;

    html += "<tr class='adcaseRow' style='background-color:"+(d.size=="unfilled"?"#ffd394":"")+"'><td><b>"+d.parentId+"</b></td>"
             +"<td>"+d.adUnit+"<br>"+d.qid+d.slotTime+"</td><!--<td>"+d.errorTxt+"</td>-->"
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
    for(var i in ads.id) { if(!(ads.id.hasOwnProperty(i))) { continue; } 
      if(ads.id[i].format && ads.id[i].format!="default") {
        showFormat=true;
      }
    }
    for(var i in ads.id) { if(!(ads.id.hasOwnProperty(i))) { continue; }
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

   html +="</table>"
        +(ads.version!=""?"<div class='adcase-block' style='margin:10px'>"+ads.version+"</div>":"") 
        +"</td></tr></table></td></tr></table>";

  return html;
}

ads.d.debugKV = function() {
  var kv = ads.kv;
  var out = "<table id='adcasekv'>";
  for(var i in kv) { if(!(kv.hasOwnProperty(i))) { continue; }
    if(typeof(kv[i])=="string" && kv[i]=="") { continue; }
    out += "<tr><td><b>"+i+":</b></td><td>";
    if(typeof(kv[i])=="object") {
      var v="";
      for(var j in kv[i]) { if(!(kv[i].hasOwnProperty(j))) { continue; }
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
  for(var i in ads.id) { if(!(ads.id.hasOwnProperty(i))) { continue; }
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

ads.d.getSlotKVArray = function(slot) {

  var url = "";
  for(var i in slot) { if(!(slot.hasOwnProperty(i))) { continue; }
    try {
      if(typeof(slot[i])=="string" && slot[i].substring(0,49)=="https://securepubads.g.doubleclick.net/gampad/ads") {
        url = slot[i];
        break;
      }
    } catch (e) {}
  }

  var kv = {};  
  var pageKV = {};
  try {
    url = new URL(url);
    var scp = decodeURIComponent(url.searchParams.get("scp")).split("&");
    for(var i in scp) { if(!(scp.hasOwnProperty(i))) { continue; }
      try {
        var k = scp[i].split("=")[0];
        var v = scp[i].split("=")[1];
        v && (kv[k] = v);
      } catch(e) {}
    }

    var custParams = decodeURIComponent(url.searchParams.get("cust_params")).split("&");
    for(var i in custParams) { if(!(custParams.hasOwnProperty(i))) { continue; }
      try {
        var k = custParams[i].split("=")[0];
        var v = custParams[i].split("=")[1];
        v && (pageKV[k] = v);
      } catch(e) {}
    }
  } catch(e) {} 


  ads.d.pagekvArray = pageKV;
  
  return kv;
}

ads.d.getSlotKV = function(slot) {

  var url = "";
  for(var i in slot) { if(!(slot.hasOwnProperty(i))) { continue; }
    try {
      if(typeof(slot[i])=="string" && slot[i].substring(0,49)=="https://securepubads.g.doubleclick.net/gampad/ads") {
        url = slot[i];
        break;
      }
    } catch (e) {}
  }

  var kv = {};  
  var pageKV = {};
  try {
    url = new URL(url);
    var scp = decodeURIComponent(url.searchParams.get("scp")).split("&");
    for(var i in scp) { if(!(scp.hasOwnProperty(i))) { continue; }
      try {
        var k = scp[i].split("=")[0];
        var v = scp[i].split("=")[1];
        v && (kv[k] = v);
      } catch(e) {}
    }

    var custParams = decodeURIComponent(url.searchParams.get("cust_params")).split("&");
    for(var i in custParams) { if(!(custParams.hasOwnProperty(i))) { continue; }
      try {
        var k = custParams[i].split("=")[0];
        var v = custParams[i].split("=")[1];
        v && (pageKV[k] = v);
      } catch(e) {}
    }
  } catch(e) {} 


  ads.d.pagekvHTML = "";
  for(var i in pageKV) { if(i=="adcase" || !(pageKV.hasOwnProperty(i))) { continue; }
    ads.d.pagekvHTML += (ads.d.pagekvHTML==""?"":"&nbsp;&nbsp;&nbsp;") + "<b>" + i + "=</b>" + pageKV[i];
  }

  var kvHTML = "";
  for(var i in kv) { if(!(kv.hasOwnProperty(i))) { continue; }
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

        + "</table>";

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
#adcaseContent {
    padding:10px
} 
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
  if(ads.d.g("requestKey")) {
    d.innerHTML = "<div id='adcaseContainer2'><div id='adcaseContent'>"+ads.d.requestKeyHTML()+"</div></div>";
  } else {
    d.innerHTML = "<div id='adcaseContainer2'>"+ads.d.configWindow()+"<div id='adcaseContent'>"+ads.d.debugContentMobile()+"</div></div>";
  }

  document.body.appendChild(d);
  ads.d.s("modalContent", document.getElementById("adcaseContent"));
  ads.d.s("modalContainer", document.getElementById("adcaseContainer"));

  ads.d.setIpInfo();
}

ads.d.debugContentMobile = function() {

  ads.d.prepareData();

  var showFormat=false;
  var dfpPath = (ads.router ? "/"+ads.network+ads.router() : ""); 
  
  var screenSize = "<b>Screen Size:</b> " + (ads.device.isMobile? (screen.width+"x"+screen.height) : (window.innerWidth+"x"+window.innerHeight));

  var html = "<div class='adcase-title'>Debug</div>"
             +"<div class='adcase-block' style='display:block'><div id='adcase-debug-main' style='display:block;margin:20px'></div>"
              +"<div><b>"+dfpPath+"</b><div id='adcase-ipinfo' style='font-size:12px;margin-top:5px'>"+(sessionStorage.getItem("adcase-ipinfo")||"")+"</div></div>"
              +"<div style='font-size:12px;margin-top:5px'><b>User Agent:</b> " + navigator.userAgent + "<br>"+screenSize+"</div>"
              +"</div><div class='adcase-block'>";

  var printedSlots = {};
  for(var i in ads.d.data.rows) { if(!(ads.d.data.rows.hasOwnProperty(i))) { continue; }
    var d = ads.d.data.rows[i];
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
    for(var i in ads.id) { if(!(ads.id.hasOwnProperty(i))) { continue; }
      if(ads.id[i].format && ads.id[i].format!="default") {
        showFormat=true;
      }
    }
    for(var i in ads.id) { if(!(ads.id.hasOwnProperty(i))) { continue; }
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

  //html += //"<td valign=top style='padding:0;width:1px;'><center><a class='adcase-button' href='javascript:ads.d.shareSession()'><button><span>Share</span></button></a></center></td>"+
  html += "<td valign=top style='padding:0;width:1px;'><center><a class='adcase-button' href='javascript:ads.d.testPage()'><button style='width:100%;background-color:#3498db;margin:4px 0 4px 0'><span style='padding:12px'>Testpage</span></button></a></center></td>"
       + "<div class='adcase-block' style='margin:10px'>"+ads.version+"</div>";

  return html;
}

ads.d.shareStop = function() {
  localStorage.removeItem("ads-debug-share-code");
  ads.d.shareSession();
  
}

ads.d.shareSession = function() {
    return;
  window.scrollTo(0,0);
  d = document.getElementById("adcase-debug-main");
  if(localStorage.getItem("ads-debug-share-code")) {
    d.innerHTML = "<div>Share Code: <span style='font-weight:bold;font-size:18px;width:100%;text-align:center'>"+localStorage.getItem("ads-debug-share-code")+"</span><br><br>Use this code to share your session data with technical teams.<br><br>"
    +"<div>"
      +"<!--<a style='float:left' class='adcase-button' href='javascript:ads.d.sendShareData()'><button><span>Send again</span></button></a>-->"
      +"<center><a class='adcase-button' href='javascript:ads.d.shareStop()'><button><span>Stop Sharing</span></button></a></center>"
    +"</div></div>";
    
  } else {
    d.innerHTML = "<div>By clicking the button below you are accepting to share your IP address, current URL and current served ads information.<br><br>Sharing data will be sent again every time you open this debug window.<br><br>Sharing setup can be cancelled at any time and it will be cacelled automatically in 24 hs.<br><br>Sharing data will be available for every person holding the share url code.<br><br>"
                + "<br>"
                + "<center><a class='adcase-button' href='javascript:ads.d.getShareURL()'><button><span>Get Share Code</span></button></a></center></div><br><br>";
  }
  
}

ads.d.sendShareData = function() {
  ads.d.prepareData();
  var jsondata = {"code":localStorage.getItem("ads-debug-share-code"), "data": JSON.stringify(ads.get("ads.d.data"))};
  ads.d.postAjax("https://adcase.io/share/getid", jsondata, function(data){ 
    d = document.getElementById("adcase-debug-main");
    ads.d.shareSession();return;
    /*
    d.innerHTML = "<div style='border-bottom:1px solid #00a8ff'>Sharing code: <span style='font-weight:bold;font-size:18px;width:100%;text-align:center'>"+localStorage.getItem("ads-debug-share-code")+"</span></div><br>"
    +"<center><a style='float:left;background-color:red' class='adcase-button' href='javascript:ads.d.shareStop()'><button><span>Stop Sharing</span></button></a></center>"
    +d.innerHTML;
    */
  });
}

ads.d.getShareURL = function() {
    
    var jsondata = {"data": JSON.stringify(ads.get("ads.d.data"))};
    
    ads.d.postAjax("https://adcase.io/share/getid", jsondata, function(data){
        try {data = JSON.parse(data) } catch(e) { data = {error:data} }
        if(data.code) {
                data.code=(data.code+"").substring(0,3)+" - "+(data.code+"").substring(3,6);
                localStorage.setItem("ads-debug-share-code",data.code);
                ads.d.shareSession();
            } else {
                alert(data.error||"An error occurred. Please try again");
            }
    });

}

ads.d.postAjax = function (url, data, success) { 

    var params = typeof data == 'string' ? data : Object.keys(data).map(
            function(k){ return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) }
        ).join('&');

    var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    xhr.open('POST', url);
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState>3 && xhr.status==200) { success(xhr.responseText); }
    };
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(params);
    return xhr;
}

ads.md5= ads.md5 || (function(){for(var m=[],l=0;64>l;)m[l]=0|4294967296*Math.abs(Math.sin(++l));return function(c){var e,g,f,a,h=[];c=unescape(encodeURI(c));for(var b=c.length,k=[e=1732584193,g=-271733879,~e,~g],d=0;d<=b;)h[d>>2]|=(c.charCodeAt(d)||128)<<8*(d++%4);h[c=16*(b+8>>6)+14]=8*b;for(d=0;d<c;d+=16){b=k;for(a=0;64>a;)b=[f=b[3],(e=b[1]|0)+((f=b[0]+[e&(g=b[2])|~e&f,f&e|~f&g,e^g^f,g^(e|~f)][b=a>>4]+(m[a]+(h[[a,5*a+1,3*a+5,7*a][b]%16+d]|0)))<<(b=[7,12,17,22,5,9,14,20,4,11,16,23,6,10,15,21][4*b+a++%4])|f>>>32-b),e,g];for(a=4;a;)k[--a]=k[a]+b[a]}for(c="";32>a;)c+=(k[a>>3]>>4*(1^a++&7)&15).toString(16);return c}}());


ads.d.clickButton();
