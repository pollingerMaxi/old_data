# Adcase.io 
## Rich Media, Debug and Modern DFP Implementations

- Adcase.io script simplifies the use of both Rich Media and display creatives in Double Click for Publishers (DFP).
- It provides a builder application to help build rich media creatives that work seamlessly in DFP, with no technical coding knowledge needed.
- It is a high performance solution that uses secure safeframes, for standard websites as well as for single page apps and PWAs.
- It can create debug screens for both desktop and mobile web, that work on actual mobile devices and can be used by non technical users.
- Adcase.io can be implemented with standard DFP tags (light version), full new modern dfp tags (full version) or even **no tags** (for real).

&nbsp;
- This is not an official Google product, and it is also not officially supported by Google.

&nbsp;
### Adcase.io versions 
- [Light version](https://github.com/Adcase/adcase.js/wiki/Light-version)
- [Full Version](https://github.com/Adcase/adcase.js/wiki/Full-version)
- [Extreme Version](https://github.com/Adcase/adcase.js/wiki/extreme-version)
- [Debug only version](https://github.com/Adcase/adcase.js/wiki/Debug-only-version)

&nbsp;
## Features
### Declarative tagging 
Just add the divs to your page. It works with React and many other frameworks out of the box.

<div id='box1' class='ad-slot' data-adtype='box'></div>
<div id='box2' class='ad-slot' data-adtype='box'></div>
<div id='box3' class='ad-slot' data-adtype='box'></div>

&nbsp;
### Separate display logic from ad logic
adsconfig.js configuration file or GTM tag:
```js
var ads = { 
  adTypesMap: [
     { deviceType: "desktop", type:"box",  sizes: [300,250] },
     { deviceType: "desktop", minWidth:1024, type:"box",  sizes: [[300,250],[300,600]] },
     { deviceType: "mobile", type:"box",  sizes: [[300,250]] },
```

&nbsp;
### Declarative map for automatic device type and size detection 
```js
{ deviceType: "desktop", minWidth:1024, type:"box",  sizes: [[300,250],[300,600]] },
{ deviceType: "mobile", type:"box",  sizes: [[300,250]] },
```

&nbsp;
### PWA and SPA (Progressive Web Apps and Single Page Apps)
- adcase.io library is prepared to serve in single page and pwa environments, out of the box. Just call ads.ready();  any time a page is refreshed. Googletag library keeps resident. The cleanup of the previous slots is done automatically by adcase.io. This is necessary to prevent js errors and memory leaks.

&nbsp;
### Lazy loading
In adsconfig.js, just add the option: 
```js
ads.lazy = true;
```
adcase.io takes care of scroll positioning and calling gpt as necessary, as single request and keeping correlation for roadblocks. There is no need of extra code from the website.

&nbsp;
### Custom ad slot ordering
- In pages with many creatives, define a special order to render them.
- Instead of rendering first the lefts, then the mids and finally the rights, adcase.io allows to define a custom order, so unfilled slots remain all at bottom of page.

&nbsp;
### Infinite scrolling
On new pages, just call: 
ads.ready({slots: [“newSlotA”,”newSlotB”] });

&nbsp;
### VAST and VMAP url builder
Just call:
```js
ads.getVideoURL(“vmap”)
ads.getVideoURL(“vast”, “preroll”)
```

&nbsp;
### Light Version
- All features detailed below are available with both the full version library, and the light version that can be implemented in existing, (normal, with js) dfp implementations.

&nbsp;
### Safeframes
- All Rich Media formats are designed to run inside safeframes, to increase site security.

&nbsp;
### User created Rich Media formats:
- adcase.io is an open source library, enabling publishers to create their own ad formats.

&nbsp;
### Built in Rich Media formats with builders:
- Builders convert the creatives into a zip file, that can be trafficked as a standard HTML5 in DFP.

&nbsp;
## Working examples: 
Try the [Full Version](https://builder.adcase.io/demo/full) and [Light Version](https://builder.adcase.io/demo/light)

&nbsp;
## Support and new ideas: 
- Open a [Github issue](https://github.com/Adcase/adcase.js/issues), we'll do our best to solve your request asap.
- Please remember adcase.io is given for free as is, with no contractual support. As it is not a Google product, it has no Google official support.

&nbsp;
## Request for new creative types: 
- Open a [Github issue](https://github.com/Adcase/adcase.js/issues) with your request, adding a link to a plain no-dfp working example. We'll do our best to solve your request asap.

&nbsp;
```html
<!-- enjoy -->
```
