
ads.formats.interstitial = {};//ads.defaultFormat;

ads.formats.interstitial.config = { startHidden: true }

ads.formats.interstitial.msg = function(params) {
console.log("INTERSTITIAL MSG");
  var divId = ads.getDivIdFromFormat("interstitial");

  var div = document.getElementById(divId);
  var parent = div.parentElement;
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

