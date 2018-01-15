ads.formats.interstitial = function(t) {
  
 
t.set("startDisplay", "none");

t.msg = function(params) {
  console.log("Interstitial msg:",params);
   // TODO: ignore messages if handle does not match
  //if(!params.handle || params.handle!=t.get("handle")) {
  //  return;
  //}
  params.height = params.height || t.height;
  params.width = params.width || t.width;

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
  if(params.videoURL) {
    if(!params.clicktagURL) {
      console.log("ERROR!. No clicktag URL");
      return;
    }
    iframe = t.createVideo(params);
  } 

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
        //params.windowSource.postMessage({ msg: "setSize", width: w, height: h}, "*");
      }, 50);
    }, true);
    var w = window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth||0;
    var h = window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight||0;
    //params.windowSource.postMessage({ msg: "setSize", width: w, height: h}, "*");

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
  +"right:" + iconRight + "px; top:" + iconTop + "px;z-index:10000;cursor:pointer' onclick='this.parentElement.innerHTML=\"\";document.getElementById(\"" + div.id + '").style.display="none";document.body.style.overflow="";document.getElementById("' + div.id + "\").innerHTML=\"\"'>"
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

t.createVideo = function(params) {
  var video = document.createElement("video");

  if(params.fullscreen) {
    t.width = "100%";
    t.height = "100%";
  }
  //console.log(t.width,t.height);
  //console.log(t.slot);
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
  console.log(video);
  window.setTimeout(function(){ video.play() },1000);
  //console.log("play Video");
  
  return video;

}

}
