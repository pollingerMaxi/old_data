<?php

//------------------------------------------------------------------------------
$indexHTML = file_get_contents(__DIR__ . "/index.html");
$vars = array();
$vars["htmlTag"] = f::getParam("html_tag");

//------------------------------------------------------------------------------
$clicktagURL = f::getParam("clicktag_url");
if(strtolower(substr($clicktagURL,0,4))!="http") {
	$clicktagURL = "http://" . $clicktagURL;
}
$vars["clicktagURL"] = $clicktagURL;
//------------------------------------------------------------------------------
if(f::getparam("clicktag_layer")) {
	$vars["clicktagLayer"] = "<div style = 'position: fixed; width: 100%; height: 100%; top: 0px; overflow: hidden; "
		."z-index: 98;display: block; cursor:pointer' onclick=\"console.log(clickTag);window.open(clickTag, '_blank')\" ></div>";	
} else {
	$vars["clicktagLayer"] = "";
}
//------------------------------------------------------------------------------

if(f::getparam("size")=="fullscreen") {
  $vars["width"] = 9999;
  $vars["height"] = 9999;
} else {
  $vars["width"] = f::strtoken(f::getparam("size"),1,"x") * 1;
  $vars["height"] = f::strtoken(f::getparam("size"),2,"x") * 1;
}

if(!$errors) {
	$indexHTML = replaceAll($vars, $indexHTML);
	file_put_contents($dir . "/index.html", $indexHTML);
//	zipFolder($folder);
//	$adURL = "https://adcase.io/files/$folder/index.html";
//	$adId = $folder;
} 

