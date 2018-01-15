ads.formats.push = function(t) {

  t.msg = function(p) {

    t.parentSlot.style.overflow = "hidden";
	if(p.transition) {
	  t.parentSlot.style.transition = "height "+(p.transition/1000)+"s ease-in";	
	}

	if(p.action == "collapse") {
	    t.parentSlot.style.height = "90px";	
    } else if(p.action == "expand") {
	    t.parentSlot.style.height = "250px"; 
	}
  }

}