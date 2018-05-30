//
// AdCase.js JavaScript Library v2.1.50. 5/Mar/2018
// Copyright 2018 adcase.io
// https://adcase.io
// https://adcase.io/license
// AdCase.js simplifies the use of both Rich Media and display creatives in Double Click for Publishers (DFP).
// This is not an official Google product, and it is also not officially supported by Google.
//
//
var googletag = googletag || { cmd: [] };
var adcase = adcase || ads;
adcase.version = (adcase.light?"adcase.js light":"adcase.js full")+" v2.1.50";
adcase.logData = (adcase.light?"L":"F")+".50";

adcase.log = function() {
    if(!localStorage.getItem("adcase.debug")) {
        return (function() {})
    }
    return Function.prototype.bind.call(console.log);
}();

adcase.set = function(k, v) {
    adcase.values[k] = v;
}
adcase.get = function(k) {
    return adcase.values[k] || null;
}

adcase.openDebug = function() {
    if(adcase.d &&adcase.d.clickButton) {
        adcase.d.clickButton();
    } else {
        var s = document.createElement("script");
        s.src = "https://builder.adcase.io/demo/lib/debug.js?"+Math.random();
        document.head.appendChild(s);
    }
}

adcase.debugButton = function() {
    var d = document.createElement("link");
    d.href = 'https://fonts.googleapis.com/css?family=Poppins';
    d.rel='stylesheet';
    d.type='text/css';
    document.head.appendChild(d);

    d = document.createElement("div");
    d.innerHTML='<meta name="viewport" content="width=device-width, initial-scale=1.0">'
        +'<style>'
        +'.adcase-button button {font-weight:bold;border-width:0;outline: none;border-radius: 2px;box-shadow: 0 1px 4px rgba(0, 0, 0, .6);background-color: #3498db;color: white;transition: background-color .3s;padding:0;}'
        +'.adcase-button button:hover, .adsbtn:focus { background-color: #2980b9; }'
        +'.adcase-button span { display: block;padding: 12px 24px;font-size:14px;font-family:Arial}'
        +'</style>'
        +"<a href='javascript:adcase.openDebug()' class='adcase-button' style='position:fixed;bottom:25px;left:15px;z-index:10000000'><button id='adcase-button-button'><span id='adcase-button-text'>Ads</span></button></a>";
    document.body.appendChild(d);
}


adcase.runDebug = function() {
  if(document.location.href.indexOf("adcase.debug=false")>0) {
    localStorage.removeItem("adcase.debug");
    localStorage.removeItem("adcase-debug-mode");
  } else {
    localStorage.setItem("adcase.debug",true);
    localStorage.setItem("adcase-debug-mode",0);
  } 

    adcase.values = adcase.values || {};
    adcase.adEvents = [];
    adcase.startTime = new Date().getTime();

    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagservices.com/tag/js/gpt.js?";
    document.head.appendChild(s);

    googletag.cmd.push(function() {
    googletag.pubads().addEventListener('slotRenderEnded',
      function(event) {
        adcase.adEvents.push(event);
      }
    );
    });
  
  console.log("create button");
  if(document.body) {
    adcase.debugButton(); 
  } else {
    window.setTimeout(adcase.debugButton, 3000);
  }
}

adcase.runDebug();
