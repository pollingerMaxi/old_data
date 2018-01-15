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
//------------------------------------------------------------------------------
$vars["width"] = f::strtoken(f::getparam("collapsed_size"),1,"x") * 1;
$vars["expandedHeight"] = f::strtoken(f::getparam("expanded_size"),2,"x") * 1;
$vars["collapsedHeight"] = f::strtoken(f::getparam("collapsed_size"),2,"x") * 1;
$vars["animatedTransition"] = f::getparam("animatedTransition") * 250;
$vars["htmlTag"] = f::getparam("html_tag");

//------------------------------------------------------------------------------
if(f::getparam("clicktag_layer")) {
	$vars["clicktagLayer"] = "<div id='clickTagLayer' style = 'position: fixed; width: 100%; height: 0; top: 0px; overflow: hidden; "
		."z-index: 98;display: block; cursor:pointer' onclick=\"console.log(clickTag);window.open(clickTag, '_blank')\" ></div>";	
} else {
	$vars["clicktagLayer"] = "";
}


if(!$errors) {
	$indexHTML = replaceAll($vars, $indexHTML);
	file_put_contents($dir . "/index.html", $indexHTML);
//	zipFolder($folder);
} 

