ads.formats.videobanner = function (t) { 

  t.videobannerMsg = function(p) {
    //console.log("-----videoBannerMsg",p,t.divId);
    t.set("videoBannerScrollEnabled",true);

    t.get("window").postMessage({ videoButtons: ads.styles.videoButtons } , "*");

    if(!ads.get("scrollEnabled")) {
      ads.enableScroll();
    } else {
      ads.scroll();
    }
  }

  t.videoBannerScroll = function() {

    if (t.elementInViewport()) {
//      console.log("play");
      t.play();
    } else if(!t.elementInViewport()) {
//      console.log("pause");
      t.pause();
    }
  }



  t.elementInViewport = function() {
    var rect = t.slot.getBoundingClientRect();

    var wh = (window.innerHeight || document.documentElement.clientHeight);
    var rt = Math.ceil(rect.top);

    var view = false;
    if(rt<=wh-(t.height*0.75) && rt>-(t.height*0.25)) {
      view = true;
    }

    return view;
  }

  t.play = function() {
    //console.log(t.divId+"PLAY");
    t.set("playing",true);
    t.get("window").postMessage({ action:"play" } , "*");
  }
  t.pause = function() {
    //console.log(t.divId+"PAUSE");
    t.set("playing",false);
    t.get("window").postMessage({ action:"pause" } , "*");
  }
}



/*
var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
    gotVAST(this);
    }
};
xhttp.open("GET", "https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=", true);
xhttp.send();
var url = null;
var h = null;

function gotVAST(xml) {
    var xmlDoc = xml.responseXML;
//    console.log(xmlDoc.childNodes);
   console.log(xmlDoc.getElementsByTagName("MediaFile")[0]);
   h = xmlDoc.getElementsByTagName("MediaFile")[0];
//    document.getElementById("demo").innerHTML =
//    xmlDoc.getElementsByTagName("MediaFiles")[0].childNodes[0].nodeValue;
 var video = {};
 video.url = h.innerHTML.replace("<![CDATA[", "").replace("]]>", "");

  runVideo(video);

}
*/
