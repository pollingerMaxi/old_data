<?php

// COLLAPSED FILE
$data["collapsed"]["ext"] = f::strtoken(strtolower($_FILES["collapsed_zip"]["name"]),-1,".");
$data["collapsed"]["file"] = $dir . "/collapsed." . $data["collapsed"]["ext"];
if(!move_uploaded_file($_FILES["collapsed_zip"]["tmp_name"], $data["collapsed"]["file"] )) {
	$errors[] = "No collapsed file";
}
if($data["collapsed"]["ext"] == "zip") {
	$zip = new ZipArchive;
	if ($zip->open($data["collapsed"]["file"]) === TRUE) {
	    $zip->extractTo($dir . "/collapsed/");
	    $zip->close();
	    unlink($data["collapsed"]["file"]);
	} else {
	    $errors[] = "Could not unzip collapsed file";
	}
	if(!rename($dir . "/collapsed/index.html", $dir . "/collapsed/index2.html")) {
		$errors[] = "No index.html in collapsed file";
	} 
}

// EXPANDED FILE
$data["expanded"]["ext"] = f::strtoken(strtolower($_FILES["expanded_zip"]["name"]),-1,".");
$data["expanded"]["file"] = $dir . "/expanded." . $data["expanded"]["ext"];
if(!move_uploaded_file($_FILES["expanded_zip"]["tmp_name"], $data["expanded"]["file"] )) {
	$errors[] = "No expanded file";
}
if($data["expanded"]["ext"] == "zip") {
	$zip = new ZipArchive;
	if ($zip->open($data["expanded"]["file"]) === TRUE) {
	    $zip->extractTo($dir . "/expanded/");
	    $zip->close();
	    unlink($data["expanded"]["file"]);
	} else {
	    $errors[] = "Could not unzip expanded file";
	}
	if(!rename($dir . "/expanded/index.html", $dir . "/expanded/index2.html")) {
		$errors[] = "No index.html in expanded file";
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
$vars["width"] = f::strtoken(f::getparam("collapsed_size"),1,"x") * 1;
$vars["expandedHeight"] = f::strtoken(f::getparam("expanded_size"),2,"x") * 1;
$vars["collapsedHeight"] = f::strtoken(f::getparam("collapsed_size"),2,"x") * 1;
$vars["animatedTransition"] = f::getparam("animatedTransition") * 250;

//------------------------------------------------------------------------------
if(f::getparam("clicktag_layer")) {
	$vars["clicktagLayer"] = "<div style = 'position: fixed; width: 100%; height: 0; top: 0px; overflow: hidden; "
		."z-index: 98;display: block; cursor:pointer' onclick=\"console.log(clickTag);window.open(clickTag, '_blank')\" ></div>";	
} else {
	$vars["clicktagLayer"] = "";
}

//------------------------------------------------------------------------------
if($data["collapsed"]["ext"] == "zip") {
	$vars["collapsedContent"] = "<iframe src='collapsed/index2.html' frameborder=0 style='width:{$vars["width"]}px;height:{$vars["collapsedHeight"]}px' scrolling='no'></iframe>";
} else {
	$vars["collapsedContent"] = "<img src='collapsed.{$data["collapsed"]["ext"]}' style='border:0;width:{$vars["width"]}px;height:{$vars["collapsedHeight"]}px' />";
}
//------------------------------------------------------------------------------
if($data["expanded"]["ext"] == "zip") {
	$vars["expandedContent"] = "<iframe src='expanded/index2.html' frameborder=0 style='width:{$vars["width"]}px;height:{$vars["expandedHeight"]}px' scrolling='no'></iframe>";
} else {
	$vars["expandedContent"] = "<img src='expanded.{$data["expanded"]["ext"]}' style='border:0;width:{$vars["width"]}px;height:{$vars["expandedHeight"]}px' />";
}
//------------------------------------------------------------------------------


if(!$errors) {
	$indexHTML = replaceAll($vars, $indexHTML);
	file_put_contents($dir . "/index.html", $indexHTML);
//	zipFolder($folder);
} 

