var ads = { cmd:[], 
  // change to your own js location
  lib: "https://adcase.io/adcase.js?",
  
  // ad slot types. This must be the same as 'data-adtype' attributes
  adTypesMap: [
      { deviceType: "desktop", minWidth:0, type:"box",  sizes: [300,250] },
      { deviceType: "desktop", minWidth:1024, type:"box",  sizes: [300,600] },
      { deviceType: "mobile", minWidth:0, type:"box",  sizes: [[300,600]] },
      { deviceType: "desktop,mobile", minWidth:0, type:"bigbox",  sizes: [[300,250],[300,600]] },
    ]
  ,

  
  // dfp network id
  network: 21634433536, 

  // callback functions, can be set for each ad slot
  slotRenderedCallback: {
    // example:
    box1 : function(event) { console.log("This is a callback function. slotID box1 has been rendered. Slot " + (event.isEmpty?"is":"is not") + " empty.") }
  },

  // page level key-values
  kv: { section:"sports", article:"1234" }

}; 


// router may use if/case/regex to select the correct DFP path, depending on document url
// in this example it is fixed 
ads.router = function(url) {
  return "/special/";
}


// no need to change anything from here to end of file
ads.ready = function(params) {
  params = params || {};
  if(!ads.loaded) { 
    var s = document.createElement('script');s.async = true; 
    s.src = ads.lib; document.head.appendChild(s); 
  } 
  ads.cmd.push( {cmd:"run", path: ads.router(), manualSlotList: (params.slots || false) } ); 
  ads.run && ads.run();
}


// another way to set set key values, i.e. after navigating a single page app
//ads.kv = { test:"test-sb", programa:"333", nota:"444", otro: [1,2,3,4] };
ads.ready();
