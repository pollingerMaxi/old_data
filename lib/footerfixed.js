ads.formats.footerFixed = function(t) {

  t.set("startDisplay", "none");

  t.rendered = function(params) {

  var div = t.slot;
  div.style.display = "inline-block";

  var containerDiv = t.parentSlot;
  containerDiv.style.zIndex = 9000;
  containerDiv.style.background = "none repeat scroll 0 0 transparent";
  containerDiv.style.position = "fixed";
  containerDiv.style.textAlign = "center";
  containerDiv.style.bottom = "0px";
  containerDiv.style.width = "100%";
  containerDiv.style.height = params.height;
  containerDiv.style.minHeight = "0px";
  containerDiv.style.minWidth = "0px";

  if(false && params.height == 250) {
    // Expanding mouseover footer
    var w = ads.formats.getWindow("footerFixed");
    div.addEventListener("mouseover", 
      function() { 
        document.getElementById("footerFixed-adText").style.display="none"; 
        containerDiv.style.height = "250px"; 

        let slotWindow = ads.getHandleWindowFromDivId("zocalo_desktop_ad");
        if(slotWindow) {
          slotWindow.postMessage({ msg: "expandSlot" }, "*");
        } else {
          console.log("**No slotWindow for div "+div.id,div);
        }
      }

      , false);
    div.addEventListener("mouseout", 
      function() { 
        document.getElementById("footerFixed-adText").style.display=""; 
        containerDiv.style.height = "90px"; }
      , false);
    containerDiv.style.height = "90px";
  }
  window.setTimeout(function() { document.getElementById("footerFixed-adText").style.display="";  }, 1);

  var iframe = containerDiv.getElementsByTagName("iframe")[0];
  iframe.style.background = "none repeat scroll 0 0 white";
  iframe.style.margin = "auto";
  iframe.style.height = params.height;
  iframe.style.width = params.width;

  var iconMarginRight = - (params.width / 2) + ads.styles.footerFixed.right;
  var newDiv = document.createElement("div");
  newDiv.innerHTML = "<div id='footerFixed-adText' style='position:absolute;display:none;right:50%;margin-right:"+iconMarginRight+"px;top:"+ads.styles.footerFixed.top+"px;cursor:pointer;' "
            + "onclick=\"document.getElementById('"+div.id+"').parentElement.style.display = 'none'\">"+ads.styles.footerFixed.img+"</div>"
  containerDiv.appendChild(newDiv);
  containerDiv.style.display = "block"
};

}