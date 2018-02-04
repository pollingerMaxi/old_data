<?php 
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0"); 
header("Cache-Control: post-check=0, pre-check=0", false); 
header("Pragma: no-cache"); 

error_reporting(E_ALL);
ini_set('display_errors', 1);

include("/home/sites/adcase.io/src/lib/lib.php");
$formatName = f::getParam("_url");
$formatId = getFormatId($formatName);
$formats = getFormatIds();

if(isset($formats[f::getParam("_url")])) {
  header("Location:/builder/".$formats[f::getParam("_url")]);
  die;
}

if(file_exists(__DIR__."/formats/{$formatId}-{$formatName}/{$formatName}-form.php")) {
  include("builder.php");

} else if(f::getParam("_url") == "build") {
  $formatName = f::getParam("format");
  $formatId = getFormatId($formatName);
  include("build.php");

} else if(file_exists(f::getParam("_url").".php")) {
  include(f::getParam("_url").".php");
} else {
  header("Location: /builder/html5");
}

function getFormatIds() {
return array(100 => "html5",
                  101 => "push",
                  102 => "push-tag",
                  103 => "interstitial",
                  104 => "interstitial-tag",
                  105 => "videobanner",
                  106 => "videobanner-vast",
                  107 => "videobanner-dfp",
                  108 => "footer",
                  109 => "footer-expand",
                  110 => "footer-expand-tag",
                  111 => "html5-tag",
                  112 => "interstitial-video",
                  113 => "interstitial-video-vast",
                  114 => "interstitial-video-dfp",
                  117 => "push-onclick",
                  118 => "push-onclick-tag"
                  );
}
function getFormatId($formatName) {
	$data = getFormatIds();
  foreach($data as $k => $v) {
  	if($formatName == $v) {
  		return $k;
  	} 
  }
  return "";
}