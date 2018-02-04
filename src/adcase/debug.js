

var ads = ads || {};

ads.router= function(){ return "/cnn/"; }
ads.network = null;
ads.kv = {a:1,b:2};
ads.id = ads.id || {};
ads.adEvents =  ads.adEvents || {};

ads.strtoken = function(s,n,sep) {
  var v = s.split(sep);
  var out = "";
  try{
    if(n<0) {
      out = v[v.length+n];
    } else {
      out = v[n-1];
    }
  } catch(e) {}
  return out;
}

var log = [];
ads.debugKV = function (kv) {
  try {
    for(var k in kv) {
      console.log("KV:",kv);
      ads.kv[k] = kv;
    }
  } catch(e) {}
}

ads.googleTagContent = function() {

  var events = googletag.getEventLog().j;

  for (var i in events) {
    var e = events[i];
    var aa = {};  
    if(e.u && e.u.aa) {
      console.log("HAY",e.u.aa);
      for(var j in e.u.aa) {
  //      console.log(j);
        if(j=="undefined") { console.log(e.u.aa);continue; }
        if(!ads.network) { ads.network = ads.strtoken(j,2,"/");}
        var requestSizes = (e.u.aa[j].Oa ? ads.formatSizes(e.u.aa[j].Oa) : "-");
        var divId = ads.strtoken(j,-1,"/");
        //e.u.aa[j].m && ads.debugKV(e.u.aa[j].m);
        
        console.log(divId);
        ads.adEvents[divId] = { 
          slot: { getSlotElementId: function(){ return divId; }}, 
          requestSizes : requestSizes,
          divId:divId
        }
       // ads.id[divId] = {};



//        aa[j] = { Qa: (e.u.aa[j].Qa?e.u.aa[j].Qa:null) };
      }
    }
  }
  //console.log(JSON.stringify(log));
}

googletag && googletag.pubads && googletag.pubads().addEventListener('slotRenderEnded', function (event) { ads.updateModal(); });

window.addEventListener("message", function(event){
  if(event.data.adcase && event.data.adcase=="modal") {
    ads.modal();
  }
}, false);

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

ads.modal = function() {

ads.googleTagContent();

if(ads.modalContainer) { 
  console.log("REFRESH");
  ads.updateModal();
  ads.modalContainer.style.display = "block";
  return;
}
console.log("PRINT MODAL");
  var style =`
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
`;

var s = document.createElement("style");
s.innerHTML = style;
document.head.appendChild(s);

  var d = document.createElement("div");
  d.id = "adcaseContainer";
  d.innerHTML = `<div id='adcaseContainer2'><div id='adcaseContent'>`+ads.debugContent()+`</div></div>`;
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
  var showFormat=false;

  var html = "<table width=100% margin:10px><tr><td style='vertical-align:top'><table class='adcaseTable'>"
               +"<tr><td colspan=2><b>/"+ads.network+ads.router()+"</b></td></tr>"
               +"<tr><td style='vertical-align:middle;width:100px;padding-right:0px'>Key-values:</td><td>"+ads.debugKV()+"</td></tr>"
              +"</table></td>"
   +"<td style='vertical-align:top;text-align:right;padding:10px 30px'><A target=_blank HREF='https://ics.corp.google.com/dfp/"+ads.network+"#delivery/TroubleshootingTools/url="+document.location.href+"'>Troubleshoot in DFP</A>"
   +"<br><iframe src='https://adcase.io/builder/ip-info.php' style='border:0;width:250px;height:90px;'></iframe>"
   +"</td><td><span id='adcaseClose' onclick='ads.closeModal()'>&times;</span></td></tr>"           
   + "<tr><td><table class='adcaseTable'>"
   +"<thead><tr><td>Slot</td><td>Req.Size</td><td>Ad Size</td>"+(showFormat?"<td>Format</td>":"")+"<td style='text-align:center'>Order</td><td style='text-align:center'>Line Item</td><td style='text-align:center'>Creative</td></tr></thead>";
var printedSlots = {};
  for(var i in ads.adEvents) {
    var e = ads.adEvents[i];
    var divId = e.divId ? e.divId : e.slot.getSlotElementId();  
    var parentId = (divId.substring(divId.length-3)=="_ad") ? divId.substring(0,divId.length-3) : divId;
    printedSlots[parentId] = true;

    var sizes = (e.requestSizes ? e.requestSizes : ads.formatSizes(e.slot.getSizes()));
    var format = (ads.id[divId] && ads.id[divId].format) ? ads.id[divId].format :"";
    var orderURL = e.campaignId ? ("<a target=_blank href='https://www.google.com/dfp/" + ads.network + "?#delivery/OrderDetail/orderId=" + e.campaignId+"'>"+e.campaignId+"</a>") : "";
    var lineItemURL = e.lineItemId ? ("<a target=_blank href='https://www.google.com/dfp/" + ads.network + "?#delivery/LineItemDetail/lineItemId=" + e.lineItemId+"'>"+e.lineItemId+"</a>") : "";
    var creativeURL = e.creativeId ? ("<a target=_blank href='https://www.google.com/dfp/" + ads.network + "?#delivery/CreativeDetail/creativeId=" + e.creativeId+"'>"+e.creativeId+"</a>") : "";

    html += "<tr style='background-color:"+(e.size?"":"#ffd394")+"'><td>XX<b>"+parentId+"</b></td>"
             +"<td>"+sizes+"</td>"
             +(showFormat?"<td>"+format+"</td>":"")
             +(e.size?"<td style='text-align:center'>"+e.size[0]+"x"+e.size[1]+"</td>":"<td style='text-align:center'><span style='font-weight:bold'>unfilled</span></td>")
             
             +"<td>"+orderURL+"</td>"
             +"<td>"+lineItemURL+"</td>"
             +"<td>"+creativeURL+"</td>"

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
      html += "<tr style='background-color:#e5e5e5'><td>"+ads.id[i].parentId+"</td>"
               +"<td>"+(ads.id[i].sizes?JSON.stringify(ads.id[i].sizes):"")+"</td>"
               +(showFormat?"<td>"+ads.id[i].format+"</td>":"")
               +(ads.id[i].width?"<td style='text-align:center'>"+ads.id[i].width+"x"+ads.id[i].height+"</td>":"<td style='text-align:center'></td>")
               
               +"<td colspan=3>Pending request</td>"

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
ads.loadHandler();

ads.modal();

