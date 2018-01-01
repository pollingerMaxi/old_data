<?php 
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0"); 
header("Cache-Control: post-check=0, pre-check=0", false); 
header("Pragma: no-cache"); 

error_reporting(E_ALL);
ini_set('display_errors', 1);

include("/home/sites/adcase.io/src/lib/lib.php");
$url = f::getParam("_url");

if(file_exists(__DIR__."/formats/{$url}/{$url}-form.php")) {
	$_GET["format"] = $url;
	include("builder.php");
} else if(isset($_GET["_url"]) && file_exists("{$url}.php")) {
	include("{$url}.php");
} else {
	header("Location: /builder/interstitial");
}