<?php

// inline FILE
$data["inline"]["ext"] = f::strtoken(strtolower($_FILES["inline_zip"]["name"]),-1,".");
$data["inline"]["file"] = $dir . "/inline." . $data["inline"]["ext"];
if(!move_uploaded_file($_FILES["inline_zip"]["tmp_name"], $data["inline"]["file"] )) {
	$errors[] = "No inline file";
}
if($data["inline"]["ext"] == "zip") {
	$zip = new ZipArchive;
	if ($zip->open($data["inline"]["file"]) === TRUE) {
	    $zip->extractTo($dir . "/inline/");
	    $zip->close();
	    unlink($data["inline"]["file"]);
	} else {
	    $errors[] = "Could not unzip inline file";
	}
	if(!@rename($dir . "/inline/index.html", $dir . "/inline/index2.html")) {
		$errors[] = "No index.html in inline file";
	} 
}

// sticky FILE
$data["sticky"]["ext"] = f::strtoken(strtolower($_FILES["sticky_zip"]["name"]),-1,".");
$data["sticky"]["file"] = $dir . "/sticky." . $data["sticky"]["ext"];
if(!move_uploaded_file($_FILES["sticky_zip"]["tmp_name"], $data["sticky"]["file"] )) {
	$errors[] = "No sticky file";
}
if($data["sticky"]["ext"] == "zip") {
	$zip = new ZipArchive;
	if ($zip->open($data["sticky"]["file"]) === TRUE) {
	    $zip->extractTo($dir . "/sticky/");
	    $zip->close();
	    unlink($data["sticky"]["file"]);
	} else {
	    $errors[] = "Could not unzip sticky file";
	}
	if(!@rename($dir . "/sticky/index.html", $dir . "/sticky/index2.html")) {
		$errors[] = "No index.html in sticky file";
	}

} 
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
$vars["width"] = f::getparam("width") * 1;

$vars["inlineHeight"] = f::getparam("inline_height") * 1;
$vars["stickyHeight"] = f::getparam("sticky_height") * 1;
$vars["maxHeight"] = max($vars["inlineHeight"],$vars["stickyHeight"]);
$vars["transitionTimeMs"] = f::getparam("animated_transition") * 250;

$vars["inlinePosition"] = f::getparam("inline_position");
$vars["inlinePositionDivId"] = f::getparam("inline_position_div_id");

//------------------------------------------------------------------------------
if(f::getparam("clicktag_layer")) {
	$vars["clicktagLayer"] = "<div style = 'position: fixed; width: 100%; height: 100%; top: 0px; overflow: hidden; "
		."z-index: 98;display: block; cursor:pointer' onclick=\"console.log(clickTag);window.open(clickTag, '_blank')\" ></div>";	
} else {
	$vars["clicktagLayer"] = "";
}

//------------------------------------------------------------------------------
if($data["inline"]["ext"] == "zip") {
	$vars["inlineContent"] = "<iframe src='inline/index2.html' frameborder=0 style='width:{$vars["width"]}px;height:{$vars["inlineHeight"]}px' scrolling='no'></iframe>";
} else {
	$vars["inlineContent"] = "<img src='inline.{$data["inline"]["ext"]}' style='border:0;width:{$vars["width"]}px;height:{$vars["inlineHeight"]}px' />";
}
//------------------------------------------------------------------------------
if($data["sticky"]["ext"] == "zip") {
	$vars["stickyContent"] = "<iframe src='sticky/index2.html' frameborder=0 style='width:{$vars["width"]}px;height:{$vars["stickyHeight"]}px' scrolling='no'></iframe>";
} else {
	$vars["stickyContent"] = "<img src='sticky.{$data["sticky"]["ext"]}' style='border:0;width:{$vars["width"]}px;height:{$vars["stickyHeight"]}px' />";
}
//------------------------------------------------------------------------------


if(!$errors) {
	$indexHTML = replaceAll($vars, $indexHTML);
	file_put_contents($dir . "/index.html", $indexHTML);
} 

