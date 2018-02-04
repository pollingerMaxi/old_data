<?php

//------------------------------------------------------------------------------

$indexHTML = file_get_contents(__DIR__ . "/index.html");
$vars = array();

//------------------------------------------------------------------------------
$clicktagURL = f::getParam("clicktag_url");
if(strtolower(substr($clicktagURL,0,4))!="http") {
	$clicktagURL = "http://" . $clicktagURL;
}
$vars["clicktagURL"] = $clicktagURL;
$vars["htmlTag"] = f::getParam("html_tag");
//------------------------------------------------------------------------------
$vars["width"] = f::getparam("width") * 1;
$vars["collapsedHeight"] = f::getparam("collapsed_height") * 1;
$vars["expandedHeight"] = f::getparam("expanded_height") * 1;
$vars["transitionTimeMs"] = f::getparam("animated_transition") * 250;
//------------------------------------------------------------------------------
if(f::getparam("clicktag_layer")) {
	$vars["clicktagLayer"] = "<div style = 'position: fixed; width: 100%; height: 100%; top: 0px; overflow: hidden; "
		."z-index: 98;display: block; cursor:pointer' onclick=\"console.log(clickTag);window.open(clickTag, '_blank')\" ></div>";	
} else {
	$vars["clicktagLayer"] = "";
}


if(!$errors) {
	$indexHTML = replaceAll($vars, $indexHTML);
	file_put_contents($dir . "/index.html", $indexHTML);
//	zipFolder($folder);
} 

