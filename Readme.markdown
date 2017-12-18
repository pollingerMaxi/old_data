Adcase.js  - a DFP wrapper for Rich Media and PWA
======================================================

Adcase script simplifies the use of both Rich Media and display creatives in Double Click for Publishers (DFP). This is not an official Google product, and it is also not officially supported by Google.

It also provides a high performance solution for safeframe, single request, single page app HTML5 creatives. 

Some ideas were inspired from [jquery.dfp](https://github.com/coop182/jquery.dfp.js) library.


Demo / Ad unit tester
---------------------

You can use [this page](http://coop182.github.io/jquery.dfp.js/dfptests/test.html?google_console=1&networkID=15572793&adunitID=Leader&dimensions=728x90) to test your DFP ads using the adcase.js script. There is some debug code included to help debug the ad delivery.

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
The whole library resides inside the `window.ads` object. The configuration for it resides in `config.js` file.

The minimum configuration you need to set:
- Ad slot sizes
- DFP Network Id
- Ad unit path

Using the divs defined above, we'll set the `box` ad type to handle both 300x250 and 300x600 sizes, and then set serving from these ad units:

```html
/21634433536/sports/right1
/21634433536/sports/right2
/21634433536/sports/right3
```


```html
//config.js
var ads = { cmd:[], 
      loaded:false,
      adTypes: { 
                box: { sizes: [[300,250],[300,600]] } 
               },
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

box1 (type "box" [300,250])
<div id='box1' class='ad-slot' data-adtype='box'></div>

box2 (type "box" [300,250])
<div id='box2' class='ad-slot' data-adtype='box'></div>

box3 (type "box" [300,250])
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
  // change to your own js location
  lib: "https://adcase.io/adcase.js?",
  
  // ad slot types. This must be the same as 'data-adtype' attributes
  adTypes: { 
              box: { sizes: [300,250] },
              bigbox: { sizes: [[300,250],[300,600]] },
              "970x90x250": { sizes: [[970,250]], adFormat: "expand970x250" }, 
  },
  
  // dfp network id
  network: 21634433536, 

  // callback functions, can be set for each ad slot
  slotRenderedCallback: {
    box1 : function(event) { console.log("slotID box1 has been rendered. Slot " + (event.isEmpty?"is":"is not") + " empty.") }
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


ads.ready();
```



Using a bootstrap file (take a look at [example-bootstrap.js](https://github.com/coop182/jquery.dfp.js/blob/master/example-bootstrap.js)):

```html
<html>
<head>
    <title>DFP TEST</title>
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js"></script>
    <script src="example-bootstrap.js"></script>
</head>
<body>

    <div class="adunit" id="Middle_Feature" data-dimensions="393x176" data-targeting='{"city_id":"1"}'></div>

</body>
</html>
```

You can init the script in the following ways:

```javascript
$.dfp('xxxxxxxxx');
```
```javascript
$.dfp({
    dfpID:'xxxxxxxxx'
});
```
```javascript
$('selector').dfp({
    dfpID:'xxxxxxxxx'
});
```
```javascript
$('selector').dfp({
    dfpID:'xxxxxxxxx',
    setCategoryExclusion: 'firstcategory, secondcategory'
});
```
```javascript
$('selector').dfp({
    dfpID:'xxxxxxxxx',
    setLocation: { latitude: 34, longitude: -45.12, precision: 1000 }
});
```

```javascript
$('selector').dfp({
    dfpID:'xxxxxxxxx',
    sizeMapping: {
        'my-default': [
            {browser: [1024, 768], ad_sizes: [980, 185]},
            {browser: [ 980, 600], ad_sizes: [[728, 90], [640, 480]]},
            {browser: [   0,   0], ad_sizes: [88, 31]}
        ],
    }
});
```

Available Options
-----------------

<table>
    <tr>
        <th>Option</th>
        <th>Description</th>
    </tr>
    <tr>
        <td>dfpID</td>
        <td>This string is your unique DFP account ID.</td>
    </tr>
    <tr>
        <td>setTargeting</td>
        <td>This object is where you set custom targeting key value pairs. Also see the Default Targeting options that are set further down the page.</td>
    </tr>
    <tr>
        <td>url</td>
        <td>This string is the url used by the URL Targeting feature. The default value of this option is the value found by calling window.location.</td>
    </tr>
    <tr>
        <td>setUrlTargeting</td>
        <td>This boolean specifies whether the targeting should include information found in the url of the current page. The default value of this option is true.</td>
    </tr>
    <tr>
        <td>setCategoryExclusion</td>
        <td>This comma separated list sets category exclusions globally (page level).</td>
    </tr>
    <tr>
        <td>setLocation</td>
        <td>This object sets geolocalization. String values are not valid. </td>
    </tr>

    <tr>
        <td>enableSingleRequest</td>
        <td>This boolean sets whether the page ads are fetched with a single request or not, you will need to set this to false it you want to call $.dfp() more than once, typically you would do this if you are loading ad units into the page after the initial load.</td>
    </tr>
    <tr>
        <td>collapseEmptyDivs</td>
        <td>This can be set to true, false or 'original'. If its set to true the divs will be set to display:none if no line item is found. False means that the ad unit div will stay visible no matter what. Setting this to 'original' (the default option) means that the ad unit div will be hidden if no line items are found UNLESS there is some existing content inside the ad unit div tags. This allows you to have fall back content in the ad unit in the event that no ads are found.</td>
    </tr>
    <tr>
        <td>refreshExisting</td>
        <td>This boolean controls what happens when dfp is called multiple times on ad units. By default it is set to true which means that if an already initialised ad is initialised again it will instead be refreshed.</td>
    </tr>
    <tr>
        <td>sizeMapping</td>
        <td>Defines named size maps that can be used with in combination with the data-size-mapping attribute to enable responsive ad sizing (https://support.google.com/dfp_premium/answer/3423562?hl=en).</td>
    </tr>
    <tr>
        <td>companionAds</td>
        <td>If adding companion ads to accompany videos using the IMA SDK to serve video ads, then pass this parameter as true to identify the units being used for that purpose. (https://support.google.com/dfp_premium/answer/1191131)</td>
    </tr>
    <tr>
        <td>disableInitialLoad</td>
        <td>This allows for serving companion ad units when the video on the page auto plays.  You'll need to include this setting with companionAds as true to avoid possible double impressions. (https://support.google.com/dfp_premium/answer/1191131)</td>
    </tr>
    <tr>
        <td>setCentering</td>
        <td>Enables/disables centering of ads.</td>
    </tr>
    <tr>
        <td>afterEachAdLoaded</td>
        <td>This is a call back function, see below for more information.</td>
    </tr>
    <tr>
        <td>afterAllAdsLoaded</td>
        <td>This is a call back function, see below for more information.</td>
    </tr>
    <tr>
        <td>beforeEachAdLoaded</td>
        <td>This is a call back function, see below for more information.</td>
    </tr>
</table>

Callbacks
---------

This script provides two callbacks which you can use to make working with DFP a little easier.

<table>
    <tr>
        <th>Callback</th>
        <th>Parameters</th>
        <th>Description</th>
    </tr>
    <tr>
        <td>afterEachAdLoaded(adUnit)</td>
        <td>
            <ul>
                <li>adUnit - jQuery Object - the jQuery object</li>
            </ul>
        </td>
        <td>This is called after each ad unit has finished rendering.</td>
    </tr>
    <tr>
        <td>afterAllAdsLoaded(adUnits)</td>
        <td>
            <ul>
                <li>adUnits - jQuery Object - the jQuery object containing all selected ad units</li>
            </ul>
        </td>
        <td>This is called after all ad units have finished rendering.</td>
    </tr>
    <tr>
        <td>alterAdUnitName(adUnitName, adUnit)</td>
        <td>
            <ul>
                <li>adUnitName - String - the default ad unit name</li>
                <li>adUnit - jQuery Object - the jQuery object</li>
            </ul>
        </td>
        <td>Return the modified or overrided ad unit name.  This function is called once per ad unit.</td>
    </tr>
    <tr>
        <td>beforeEachAdLoaded(adUnit)</td>
        <td>
            <ul>
                <li>adUnit - jQuery Object - the jQuery object</li>
            </ul>
        </td>
        <td>This is called before each ad unit has started rendering.</td>
    </tr>
    <tr>
        <td>afterAdBlocked(adUnit)</td>
        <td>
            <ul>
                <li>adUnit - jQuery Object - the jQuery object</li>
            </ul>
        </td>
        <td>This is called after each AdUnit has been blocked.</td>
    </tr>   
</table>

Please see the [example-bootstrap.js](https://github.com/coop182/jquery.dfp.js/blob/master/example-bootstrap.js) file for an example of how to use these.

Default URL Targeting
---------------------

The following targeting options are built into this script and should be setup in your DFP account ([within Inventory/Custom Targeting](https://support.google.com/dfp_sb/bin/answer.py?hl=en&answer=2983838)) to make full use of them. These targeting-parameters can be turned on/off with the setUrlTargeting option.

**Beware: The Targeting string has a 40 character limit!**

<table>
    <tr>
        <th>Key</th>
        <th>Description</th>
    </tr>
    <tr>
        <td>UrlHost</td>
        <td>This allows you to target different host names, for example you could test your ads on your staging environment before pushing them live by specifying a host of staging.yourdomain.com within DFP, this script will take care of the rest.</td>
    </tr>
    <tr>
        <td>UrlPath</td>
        <td>This allows you to target the path of the users browser, for example if you set UrlPath to '/page1' on the targeting options of the DFP line item it would match http://www.yourdomain.com/page1 only and not http://www.yourdomain.com/page1/segment2.</td>
    </tr>
    <tr>
        <td>UrlQuery</td>
        <td>This allows you to target the query parameters of a page. For example if the URL was http://www.yourdomain.com/page1?param1=value1 you could target it with a DFP ad by specifying a UrlQuery targeting string of param1:value1</td>
    </tr>
</table>

DFP now supports both a "begins with" and a "contains" operator when specifying the custom criteria value. Furthermore the value when using free-form-key-value custom criterias, is no longer subject to a 40 character limit. Read more about custom criteria in the [DFP help](https://support.google.com/dfp_premium/answer/188092).

![URL Targeting](https://raw.github.com/coop182/jquery.dfp.js/master/img/url-targetting.png)

**IMPORTANT: Regarding user-identifiable information in url targeting**

If your url contains user-identifiable information you have to anonymize the url when using URL targeting.

From the [DFP docs](https://support.google.com/dfp_premium/answer/177383):

> You may not pass any user-identifiable data (including names, addresses, or user IDs) in the targeting. Please mask this information using the encoding of your choice, and ensure your ad trafficker knows how to decode the values when setting up a line item.

From the [DFP Terms & Conditions](http://www.google.dk/doubleclick/publishers/small-business/terms.html):

> **2.3 Prohibited Actions.** You will not, and will not allow any third party to: ... (h) utilize any feature or functionality of the Program, or include anything in Program Data or Program Ads, that could be so utilized, to personally identify and/or personally track individual end users or any other persons

Ignoring this rule can result in Google shutting down your network!

You can anonymize the url by providing an anonymized version in the 'url' option. This example shows how to replace email occurances in the url with an empty string:

```javascript
$('selector').dfp({
  dfpID: 'xxxxxxxxx',
  url: window.location.toString().replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/gi, '')
});
```

Contributing
------------

Any and all contributions will be greatly appreciated.

If you wish to you can use [Grunt](http://gruntjs.com/) to enable a smooth contributing and build process.

Install Node.js by running `sudo apt-get install nodejs`

Install Grunt using: `npm install -g grunt-cli`

Once installed run `npm install` from inside the cloned repo directory.

You should now be able to make your changes to `jquery.dfp.js` and once you are finished simply run `grunt` if there are no errors then you can commit your changes and make a pull request and your feature/bug fix will be merged as soon as possible.

Please feel free to write tests which will test your new code, [Travis CI](https://travis-ci.org/) is used to test the code automatically once a pull request is generated.

Thanks a lot to these [contributors](https://github.com/coop182/jquery.dfp.js/graphs/contributors).