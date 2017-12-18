
Adcase script simplifies the use of both Rich Media and display creatives in Double Click for Publishers (DFP). This is not an official Google product, and it is also not officially supported by Google.

It also provides a high performance solution for safeframe, single request, single page app HTML5 creatives. 

Some ideas were inspired from [jquery.dfp](https://github.com/coop182/jquery.dfp.js) library.


Demo Page
---------

You can use [this page](https://adcase.github.io/adcase.js/examples/simple.html) to test your DFP ads using the adcase.js script.

You can also use the [Google Console](https://support.google.com/dfp_sb/answer/181070?hl=en-GB) to debug your ad units. This is done by by adding a "google_console=1" or "google_debug=1" to the url, and toggling the console by pressing CTRL + F10. Subsequent pagerequests will not require the parameters, and the console can be toggled. Adding the querystring "googfc" to an url, will also load the console, but also show it, without having to press CTRL + F10.

Page Setup
----------

You can add ad units to your page in any location that you would like to display an ad.

This script will look for objects with class `ad-slot`. It will then use the data-adtype attribute to declare the detailed slot properties, i.e available sizes.

```html
<div id='box1' class='ad-slot' data-adtype='box'></div>
<div id='box2' class='ad-slot' data-adtype='box'></div>
<div id='box3' class='ad-slot' data-adtype='box'></div>
```

In the example above the ID of the div elements will be used to look up a corresponding ad units in DFP. The dimensions are shared, defined by the `box` properties.


Configuration Script
--------------------
The whole library resides inside the `window.ads` object. You should not have another `window.ads` in your application.

The configuration setup is made in `config.js` file.

The minimum configuration you need to set:
- Ad slot sizes
- DFP Network Id
- Ad unit path


Using the divs defined above, we'll set the `box` ad type to handle both 300x250, and `bigbox` both 300x250 and 300x600 sizes. We'll then serve ads from these ad units:


```html
/21634433536/sports/right1
/21634433536/sports/right2
/21634433536/sports/right3
```


```html
//config.js
var ads = { 
      adTypesMap: [ { type:"box",  sizes: [300,250] } ],
      network: 21634433536
      }; 
```

and then, set the ad unit path change the ads.router() method


```html
ads.router = function(url) {
  return "/sports/";
}
```





Usage
-----

An example html page:

```html
<!DOCTYPE HTML> 
<html lang="en-us">
<style>body { text-align:center;font-family:Verdana;}</style>
<body>

box1 (type "box", 300x250)
<div id='box1' class='ad-slot' data-adtype='box'></div>

box2 (type "box", 300x250)
<div id='box2' class='ad-slot' data-adtype='box'></div>

box3 (type "bigbox", 300x250 or 300x600)
<div id='box3' class='ad-slot' data-adtype='box'></div>

expanding 1
<div id='push_tag' class='ad-slot' data-adtype='970x90x250'></div>

<script>let s = document.createElement('script'); s.async = true; s.src = "https://adcase.io/demo/config.js"; document.head.appendChild(s);</script>
</body> 
</html>
``` 

With the corresponding config.js
```html
var ads = { cmd:[], 
  // please change to your own js location
  lib: "https://adcase.io/adcase.js?",
  
  // ad slot types. This must be the same as 'data-adtype' attributes
  adTypesMap: [
      { type:"box",  sizes: [300,250] },
      { type:"bigbox",  sizes: [300,600] }
    ],
  
  // dfp network ID
  network: 21634433536, 

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


ads.ready();
```


More configuration examples:
----------------------------

There are some more options that can be set in `config.js` file

```html

var ads = { 

  
  // set sizes depending on device Type and/or window width:

  adTypesMap: [
      { deviceType: "desktop", type:"box",  sizes: [300,250] },
      { deviceType: "desktop", type:"box",  sizes: [300,600] },
      { deviceType: "mobile", type:"box",  sizes: [[300,600]] },
      { deviceType: "desktop,mobile", type:"bigbox",  sizes: [[300,250],[300,600]] },
    ]
  ,


  adTypesMap: [
      { deviceType: "desktop", type:"box",  sizes: [300,250] },
      { deviceType: "desktop", minWidth:1024, type:"box",  sizes: [300,600] },
      { deviceType: "mobile", minWidth:640, type:"box",  sizes: [[300,600]] },
      { deviceType: "desktop,mobile", type:"bigbox",  sizes: [[300,250],[300,600]] },
    ]
  ,



  // callback functions, can be set for each ad slot. In this example, 'box1' is a slot ID
  slotRenderedCallback: {
    box1 : function(event) { console.log("slotID box1 has been rendered. Slot " + (event.isEmpty?"is":"is not") + " empty.") }
  },

  // page level key-values. These are sent to DFP for targeting.
  kv: { section:"sports", article:"1234" }
}
```


Contributing
------------

Any and all contributions will be greatly appreciated.

You can commit your changes and make a pull request and your feature/bug fix will be merged as soon as possible.

Please feel free to write tests which will test your new code.

Please take a look at CONTRIBUTING.md for more details.