var ads = { cmd:[], 
  lib: "https://www.pwalab.com/adhelper/adhelper-latest.js?",
  
  // ad slot types. This must be the same as 'data-adtype' attributes
  adTypes: { 
              push: { sizes: [970,250] }, 
              box: { sizes: [300,250] },
              layer_desktop: { sizes: [1040,480], adFormat: "interstitial" }, 
              layer_mobile: { sizes: [320,480], adFormat: "interstitial" },
              header_mobile: { sizes: [320,50] },
              zocalo_desktop: { sizes: [[970,250]], adFormat: "footerFixed" }, 
              zocalo_mobile: { sizes: [320,50], adFormat: "footerFixed" },
              megalateral: { sizes: [260,600] }, 
              expandible: { sizes: [[970,250],[970,250]], adFormat: "expand970x250" },
              top: { sizes: [[970,250]], adFormat: "expand970x250" }, 
              fullbanner: { sizes: [300,600] }              
  },
  
  // dfp network id
  network: 21634433536, 

  // callback function, can be set for each ad slot
  slotRenderedCallback: {
    box1 : function(event) { console.log("slotID box1 has been rendered. Slot " + (event.isEmpty?"is":"is not") + " empty.") }
  },

  // page level key-values
  kv: { section:"sports", article:"1234" }

}; 


// another way to set set key values, i.e. after navigating a single page app
ads.kv = { test:"test-sb", programa:"333", nota:"444", otro: [1,2,3,4] };


// router may use if/case/regex to select the correct DFP path, depending on document url
// in this example it is fixed 
ads.router = function(url) {
  return = "/special/";
}



// no need to change anything from here to end of file
ads.ready = function(params) {
  params = params || {};
  var manualSlotList = params.slots || false;
  if(!ads.loaded) { var s = document.createElement('script');s.async = true; s.src = ads.src; document.head.appendChild(s); } 
  ads.cmd.push( {cmd:"run", path: ads.router(), manualSlotList: manualSlotList } ); 
  ads.run && ads.run();
}

ads.ready();