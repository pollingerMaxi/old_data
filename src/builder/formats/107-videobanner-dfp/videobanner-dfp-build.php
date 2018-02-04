<?php

$indexHTML = file_get_contents(__DIR__ . "/index.html");
//------------------------------------------------------------------------------
$vars["adunit"] = f::getParam("adunit");
$vars["videoid"] = f::getParam("videoid");


$ext = f::strtoken(strtolower($_FILES["backgroundimage"]["name"]),-1,".");
$data["backgroundimage"]["file"] = $dir . "/bg." .$ext;
if($ext!="jpg" && $ext!="png" && $ext!="gif") {
	$errors[] = "Background image must be jpg, png or gif.";
} else if(!move_uploaded_file($_FILES["backgroundimage"]["tmp_name"], $data["backgroundimage"]["file"] )) {
	$errors[] = "No background image";
} else {
	$vars["backgroundimage"] = "bg." .$ext;
}


$selectedWidth = f::strtoken(f::getparam("size"),1,"x");
$selectedHeight = f::strtoken(f::getparam("size"),2,"x");

// only for zip or direct html


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
$vars["width"] = f::strtoken(f::getparam("size"),1,"x") * 1;
$vars["height"] = f::strtoken(f::getparam("size"),2,"x") * 1;

if(!$errors) {
	$indexHTML = replaceAll($vars, $indexHTML);
	file_put_contents($dir . "/index.html", $indexHTML);
//	zipFolder($folder);
//	$adURL = "https://adcase.io/files/$folder/index.html";
//	$adId = $folder;
} 
