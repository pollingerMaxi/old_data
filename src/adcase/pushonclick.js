ads.formats.pushonclick = function (t) { 

  t.set("startDisplay", "none");

  t.pushonclickMsg = function(p) {
    p.expandedHeight && t.set("expandedHeight",p.expandedHeight);    
    p.collapsedHeight && t.set("collapsedHeight",p.collapsedHeight);    
    console.log("t.pushonclickMsg",p);

    t.parentSlot.style.display = ads.startDisplay;

    if(p.expand) {
        t.parentSlot.style.height = t.get("expandedHeight")+"px"; 
    } else {
        t.parentSlot.style.height = t.get("collapsedHeight")+"px"; 
    }


  }
}

