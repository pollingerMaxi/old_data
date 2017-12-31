ads.formats.push = {};

ads.formats.push.msg = function(params, slotWindow) {
  var adSlot = params.adSlot;
  if(params.action == "pushLoaded") {
  	ads.adTexts.push({text:params.text, slotWindow: slotWindow});
    ads.matchAds();
  } 
  if(adSlot) {
	if(params.transition) {
	  adSlot.parentElement.style.transition = "height "+(params.transition/1000)+"s ease-in";	
	}
	if(params.action == "collapse") {
	  adSlot.parentElement.style.height = "90px";	
    } else if(params.action == "expand") {
	  adSlot.parentElement.style.height = "250px"; 
	}
  }	  
}