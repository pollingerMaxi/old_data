<?php


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
$vars["initExpanded"] = (f::getparam("initial_state")=="E"?"true":"false");
$vars["autocloseSeconds"] = f::getparam("initial_state")=="E" ? f::getparam("autoclose_seconds") * 1 : 0;
$vars["width"] = f::strtoken(f::getparam("collapsed_size"),1,"x") * 1;
$vars["collapsedHeight"] = f::strtoken(f::getparam("collapsed_size"),2,"x") * 1;
$vars["expandedHeight"] = f::strtoken(f::getparam("expanded_size"),2,"x") * 1;
$vars["transitionTimeMs"] = f::getparam("animated_transition") * 250;
//------------------------------------------------------------------------------
if(f::getparam("clicktag_layer")) {
	$vars["clicktagLayer"] = "<div style = 'position: fixed; width: 100%; height: 100%; top: 0px; overflow: hidden; "
		."z-index: 98;display: block; cursor:pointer' onclick=\"console.log(clickTag);window.open(clickTag, '_blank')\" ></div>";	
} else {
	$vars["clicktagLayer"] = "";
}
//------------------------------------------------------------------------------
if(strtolower(substr(f::getparam("expand_button"),0,4)) == "http") {
	$expandButtonText = "<img src='".f::getparam("expand_button")."' border=0 >";
} else {
	$expandButtonText = f::getparam("expand_button");
}
if(strtolower(substr(f::getparam("collapse_button"),0,4)) == "http") {
	$collapseButtonText = "<img src='".f::getparam("collapse_button")."' border=0 >";
} else {
	$collapseButtonText = f::getparam("collapse_button");
}

$expandButton = "<div id='expandButton' style='display:;min-width:45px;position:absolute;
right:0px;top:0px;z-index:99;border:1px solid #999;cursor:pointer;
font-family:Arial;font-size:11px;padding:3px;background-color:white;
text-align:center' \t id='ad_text' onclick='tpl.toggleAd()'>
{$expandButtonText}</div>";
$collapseButton = "<div id='collapseButton' style='display:;min-width:45px;position:absolute;
right:0px;top:0px;z-index:99;border:1px solid #999;cursor:pointer;
font-family:Arial;font-size:11px;padding:3px;background-color:white;
text-align:center' \t id='ad_text' onclick='tpl.toggleAd()'>
{$collapseButtonText}</div>";

if(f::getparam("create_button")) {
	$vars["expandButton"] = $expandButton;
	$vars["collapseButton"] = $collapseButton;
} else {
	$vars["expandButton"] = "";
	$vars["collapseButton"] = "";
}

if(!$errors) {
	$indexHTML = replaceAll($vars, $indexHTML);
	file_put_contents($dir . "/index.html", $indexHTML);
//	zipFolder($folder);
} 

