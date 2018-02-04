ads.googleTagHook = false;

window.addEventListener("message", function(event){
  if(event.data.adcase && event.data.adcase=="modal") {
    ads.modal();
  } else if(event.data.adcaseIP) {
      if(!ads.ipInfo) {
        document.getElementById("ads-ipinfo").innerHTML = event.data.text;
        ads.ipInfo = event.data.text;
      } 
  }
 
}, false);

ads.debugErrors = {};
ads.pagekvHTML = "";

//ads.loadHandler();
ads.loadHandler = function(e) {
  if(document.getElementById("adcaseButton")) { return; }
/*
  var div = document.createElement("div");
  div.style.position = "fixed";
  div.style.top = "15px";
  div.style.right = "20px";
  div.style.zIndex = "1000000";
  div.style.border = "1px solid #FF5733";
  div.style.backgroundColor = "white";
  div.style.padding = "1px 4px 2px 4px";
  div.style.borderRadius = "2px";
  div.id = "adcaseButton";

  div.innerHTML = `<a style='color:#FF5733;font-family:Verdana,Arial;font-size:14px' HREF='javascript:ads.modal()'>ads</A>`;
  document.body.appendChild(div);

  var l = document.createElement("link");
  l.href='https://fonts.googleapis.com/css?family=Poppins';
  l.rel='stylesheet';
  l.type='text/css';
  document.head.appendChild(l);
*/
}

ads.updateModal = function() {
  ads.modalContent.innerHTML = ads.debugContent();
}

ads.configWindow = function() {
  var html = "<div id='configWindow' style='display:none;margin-bottom:100px'>Paste inventory CSV here (as plain text):<br><textarea id='configInventory' style='width:400px;height:100px'></textarea>"
  +"<br><a href='javascript:ads.saveConfig()'><button class='adsbtn' type=button'><span>Save</span></button></a></div>";
  return html;
}
ads.saveConfig = function() {
  var inv = document.getElementById("configInventory").value;
  document.getElementById("configInventory").value = "";
  if(inv && inv!="") {
    localStorage.setItem("ads.inventory",inv);
  }
  document.getElementById("configWindow").style.display="none";
  ads.modal();
}

var googleTagInterval = window.setInterval(function(){
  if(googletag && googletag.cmd) {
    window.clearInterval(googleTagInterval);
    ads.googleTagHook = true;
    googletag.cmd.push(function(){googletag.pubads().addEventListener('slotRenderEnded', function (event) { ads.updateModal(); }); });
  } else {
    console.log("****NOT YET");
  }
},500);

ads.modal = function() {

ads.checkInventory();
if(ads.modalContainer) { 
  console.log("REFRESH");
  ads.updateModal();
  ads.modalContainer.style.display = "block";
  return;
}
console.log("PRINT MODAL");
  var style =`

.adsbtn {
  overflow: hidden;
  font-weight:bold;

  border-width: 0;
  outline: none;
  border-radius: 2px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, .6);
  
  background-color: #2ecc71;
  color: #ecf0f1;
  
  transition: background-color .3s;
  padding:0;
  margin:10px;
  display:inline;
  float:right
}

.adsbtn:hover, .adsbtn:focus {
  background-color: #27ae60;
}

.adsbtn > * {
  position: relative;
}

.adsbtn span {
  display: block;
  padding: 12px 24px;
}
.adsbtn.adsblue {
  background-color: #0984e3;
}

.adsbtn.adsblue:hover, .adsbtn.adsblue:focus {
  background-color: #0652DD;
}
/* The Modal (background) */
#adcaseContainer {
//    display: none; /* Hidden by default */
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

/* Modal Content */
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

`;

var s = document.createElement("style");
s.innerHTML = style;
document.head.appendChild(s);

  var d = document.createElement("div");
  d.id = "adcaseContainer";
  d.innerHTML = "<div id='adcaseContainer2'>"+ads.configWindow()+"<div id='adcaseContent'>"+ads.debugContent()+"</div></div>";
  document.body.appendChild(d);
  ads.modalContent = document.getElementById("adcaseContent");
  ads.modalContainer = document.getElementById("adcaseContainer");


}
ads.closeModal = function() { ads.modalContainer.style.display="none"; }
ads.formatSizes = function (s) {
  var txt ="";
  try {
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
  } catch(e) {}
  return txt;
}
ads.debugContent = function() {

  for(var i in ads.adEvents) {
    ads.adEvents[i].slotKVHTML = ads.getSlotKV(ads.adEvents[i].slot);
  }
  var showFormat=false;

  var ipInfo = ads.ipInfo || "";
  
  var dfpPath = (ads.router ? "DFP Path: /"+ads.network+ads.router() : ""); 

  var html = "<table width=100% margin:10px><tr><td style='vertical-align:top'><table class='adcaseTable' >"
               +"<tr><td style='font-size:14px;width:300px'><b>"+dfpPath+"</b><br><div id='ads-ipinfo'>"+ipInfo+"</div></td>"
               +"<td style='vertical-align:top;padding-right:0px;border-bottom:0;word-break:break-all'>"
               +"<b>Page Level key-values:</b><br><div style='margin-top:6px;font-family:Courier New'>" + ads.pagekvHTML +"</div>"
               +"</td></tr>"
              +"</table></td>"
   +"<td valign=top >"
   +(ads.router?"<a style='' onclick='javascript:document.getElementById(\"configWindow\").style.display=\"\"'><button class='adsbtn' type=button'><span>Config</span></button></a>":"")
   +"<A style='' target=_blank HREF='https://www.google.com/dfp/"+ads.network+"#delivery/TroubleshootingTools/url="+document.location.href+"'><button class='adsbtn adsblue' type=button'><span>Troubleshoot</span></button></A>"
   +"</td>"
   +"<td valign=top width=10><a href='javascript:ads.closeModal()' style='vertical-align:top'><button class='adsbtn adsblue' type=button'><span>&times;</span></button></a>"
   +"</td></tr></table>"

   + "<table class='adcaseTable'>"
   +"<thead><tr><td>Slot id</td><td>Ad Unit</td><td style='padding:6px 0 4px 0'></td><td>Req.Size</td><td>Ad Size</td>"+(showFormat?"<td>Format</td>":"")
   +"<td style='text-align:center'>Order</td><td style='text-align:center'>Line Item</td><td style='text-align:center'>Creative</td><td>Slot KV</td></tr></thead>";
var printedSlots = {};
  for(var i in ads.adEvents) {
    var e = ads.adEvents[i];
    var div = document.getElementById(e.slot.getSlotElementId());
    var parentId = e.slot.getSlotElementId().substring(0,e.slot.getSlotElementId().length-3);
    if(!ads.router) {
      parentId = e.slot.getSlotElementId();
    }
    var adUnit = e.slot.Qa||e.slot.Ma || "";
    if(!ads.network) {
      ads.network = ads.strtoken(adUnit,2,"/");
    }
    var errorTxt = (ads.debugErrors[parentId] ? " <span style='color:red;font-weight:bold'>[WRONG ID]</span>" : "");

    printedSlots[parentId] = true;

    var slotKV = e.slotKVHTML;
    var sizes = ads.formatSizes(e.slot.getSizes());
    var format = (div && ads.id && ads.id[div.id] && ads.id[div.id].format) ? ads.id[div.id].format :"";
    var orderURL = e.campaignId ? ("<a target=_blank href='https://www.google.com/dfp/" + ads.network + "?#delivery/OrderDetail/orderId=" + e.campaignId+"'>"+e.campaignId+"</a>") : "";
    var lineItemURL = e.lineItemId ? ("<a target=_blank href='https://www.google.com/dfp/" + ads.network + "?#delivery/LineItemDetail/lineItemId=" + e.lineItemId+"'>"+e.lineItemId+"</a>") : "";
    var creativeURL = e.creativeId ? ("<a target=_blank href='https://www.google.com/dfp/" + ads.network + "?#delivery/CreativeDetail/creativeId=" + e.creativeId+"'>"+e.creativeId+"</a>") : "";

    html += "<tr style='background-color:"+(e.size?"":"#ffd394")+"'><td><b>"+parentId+"</b></td><td>"+adUnit+"</td><td>"+errorTxt+"</td>"
             +"<td>"+sizes+"</td>"
             +(showFormat?"<td>"+format+"</td>":"")
             +(e.size?"<td style='text-align:center'>"+e.size[0]+"x"+e.size[1]+"</td>":"<td style='text-align:center'><span style='font-weight:bold'>unfilled</span></td>")
             
             +"<td>"+orderURL+"</td>"
             +"<td>"+lineItemURL+"</td>"
             +"<td>"+creativeURL+"</td>"
             +"<td style='font-family:Courier New;word-break:break-all'>"+slotKV+"</td>"

             +"</tr>";
  }

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
      var errorTxt = (ads.debugErrors[ads.id[i].parentId] ? " <span style='color:red;font-weight:bold'>[WRONG ID]</span>" : "");
      html += "<tr style='background-color:#e5e5e5'><td>"+ads.id[i].parentId+"</td><td>"+adUnit+"</td><td>"+errorTxt+"</td>"
               +"<td>"+(ads.id[i].sizes?JSON.stringify(ads.id[i].sizes):"")+"</td>"
               +(showFormat?"<td>"+ads.id[i].format+"</td>":"")
               +(ads.id[i].width?"<td style='text-align:center'>"+ads.id[i].width+"x"+ads.id[i].height+"</td>":"<td style='text-align:center'></td>")
               
               +"<td colspan=4>Pending request</td>"

               +"</tr>";
     }
   }

/*
// HISTORY
  html += "<thead><tr><td colspan=10>History</td></tr></thead>";
  for(var i in ads.adOldEvents) {
    var e = ads.adOldEvents[i];
    var div = document.getElementById(e.slot.getSlotElementId());
    var parentId = e.slot.getSlotElementId().substring(0,e.slot.getSlotElementId().length-3);
    printedSlots[parentId] = true;

    var sizes = ads.formatSizes(e.slot.getSizes());
    var format = (div && ads.id[div.id] && ads.id[div.id].format) ? ads.id[div.id].format :"";
    var orderURL = e.campaignId ? ("<a target=_blank href='https://www.google.com/dfp/" + ads.network + "?#delivery/OrderDetail/orderId=" + e.campaignId+"'>"+e.campaignId+"</a>") : "";
    var lineItemURL = e.lineItemId ? ("<a target=_blank href='https://www.google.com/dfp/" + ads.network + "?#delivery/LineItemDetail/lineItemId=" + e.lineItemId+"'>"+e.lineItemId+"</a>") : "";
    var creativeURL = e.creativeId ? ("<a target=_blank href='https://www.google.com/dfp/" + ads.network + "?#delivery/CreativeDetail/creativeId=" + e.creativeId+"'>"+e.creativeId+"</a>") : "";

    html += "<tr style='background-color:"+(e.size?"":"#ffd394")+"'><td><b>"+parentId+"</b></td>"
             +"<td>"+sizes+"</td>"
             +(showFormat?"<td>"+format+"</td>":"")
             +(e.size?"<td style='text-align:center'>"+e.size[0]+"x"+e.size[1]+"</td>":"<td style='text-align:center'><span style='font-weight:bold'>unfilled</span></td>")
             
             +"<td>"+orderURL+"</td>"
             +"<td>"+lineItemURL+"</td>"
             +"<td>"+creativeURL+"</td>"

             +"</tr>";
  }
*/


   html +="</table></td></tr></table>";
  if(!ads.ipInfo) {
    html +="<iframe style='display:none' src='https://adcase.io/builder/ip2.php'></iframe>";
  }


  return html;
}

ads.debugKV = function() {
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

ads.checkInventory = function() {
  ads.debugErrors = {};
  var inv = localStorage.getItem("ads.inventory");
  if(!inv) return;
  for(var i in ads.id) {
    var parentId = ads.id[i].parentId;
    var path = ","+ads.router().substring(1)+parentId+",";
    if(inv.indexOf(path)<1) {
      ads.debugErrors[parentId] = { missing: true }
    }
  }

/*
  for(var i in ads.adEvents) {
    var e = ads.adEvents[i];
    if(!ads.router) {
        parentId = e.slot.getSlotElementId() +"&nbsp;&nbsp;&nbsp;&nbsp;"+ e.slot.Qa;
    }
    var path = ","+e.slot.Qa+",";
    if(inv.indexOf(path)<1) {
      ads.debugErrors[parentId] = { missing: true }
    }
  }
*/
  //console.log(ads.debugErrors);
}

ads.strtoken = function(s,n,sep) {
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


ads.getSlotKV = function(slot) {
  var url = "";
  for(var i in slot) {
    try {
      if(typeof(slot[i])=="string" && slot[i].substring(0,49)=="https://securepubads.g.doubleclick.net/gampad/ads") {
        url = slot[i];
        break;
      }
    } catch (e) {}
  }
  //console.log("URL",url);

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

  ads.pagekvHTML = "";
  for(var i in pageKV) {
    ads.pagekvHTML += (ads.pagekvHTML==""?"":"&nbsp;&nbsp;&nbsp;") + "<b>" + i + "=</b>" + pageKV[i];
  }
console.log(ads.pagekvHTML);
  var kvHTML = "";
  for(var i in kv) {
    kvHTML += (kvHTML==""?"":"&nbsp;&nbsp;&nbsp;") + "<b>" + i + "=</b>" + kv[i];
  }
  return kvHTML;
}

ads.modal();