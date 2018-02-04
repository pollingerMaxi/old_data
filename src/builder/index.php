<?php 
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0"); 
header("Cache-Control: post-check=0, pre-check=0", false); 
header("Pragma: no-cache"); 

error_reporting(E_ALL);
ini_set('display_errors', 1);

include("fns.php");

include("/home/sites/adcase.io/src/lib/lib.php");
$formatName = f::getParam("_url");
$formatId = getFormatId($formatName);
$formats = getFormatIds();
$url = f::getParam("_url");

if($url!="login") {
  checkLogin($url);
}

if(isset($formats[$url])) {
  header("Location:/builder/".$formats[f::getParam("_url")]);
  die;
}


if(file_exists(__DIR__."/formats/{$formatId}-{$formatName}/{$formatName}-form.php")) {
  include("builder.php");

} else if(f::getParam("_url") == "build") {

  $formatName = f::getParam("format");
  $formatId = getFormatId($formatName);
  analytics("build:".$formatId.":".$formatName);
  include("build.php");

} else if(file_exists(f::getParam("_url").".php")) {
  include(f::getParam("_url").".php");
} else {
  header("Location: /builder/html5");
}

