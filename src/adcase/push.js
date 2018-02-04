ads.formats.push = function(t) {

  t.msg = function(p) {

    p.expandedHeight && t.set("expandedHeight", p.expandedHeight);
    p.collapsedHeight && t.set("expandedHeight", p.collapsedHeight);

    t.parentSlot.style.overflow = "hidden";
	if(p.transition) {
	  t.parentSlot.style.transition = "height "+(p.transition/1000)+"s ease-in";	
	}

	if(p.action == "collapse") {
		var height = t.get("collapsedHeight") || 90;
	    t.parentSlot.style.height = height + "px";	
    } else if(p.action == "expand") {
		var height = t.get("expandedHeight") || 250;
		t.parentSlot.style.height = height + "px"; 
	}
  }

}

