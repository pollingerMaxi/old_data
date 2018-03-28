<?php
$count=0;
while($count++<10000) {
  $folder = "{$formatId}-{$formatName}-".rand(10000,99999);//f::conv(rand(1000000,2000000));
  $dir = "/home/sites/adcase.io/src/public/files/" . $folder; 
  if(!file_exists($dir)) {
  	break;
  }
}

mkdir ($dir);
chmod ($dir, 0777);
$errors = array();

if(file_exists(__DIR__."/formats/{$formatId}-{$formatName}/{$formatName}-build.php")) {
  include(__DIR__."/formats/{$formatId}-{$formatName}/{$formatName}-build.php");
} else {
	echo "template not found: /formats/{$formatId}-{$formatName}/{$formatName}-build.php";
}

if(!$errors) {
  zipFolder($folder);
  $adURL = "https://adcase.io/f/$folder";
  f::dbInsert("insert into creatives set user_id='".USER_ID."', code='$folder', filename='$folder', format='$formatId', url='$adURL'");

  f::setResponseJson(array("ad_id"=> $folder, "adURL"=> $adURL, "POST" => $_POST, "FILES" => $_FILES));
} else {
	http_response_code (400);
  f::setResponseJson(array("errors"=> $errors, "POST" => $_POST, "FILES" => $_FILES));
}


function replaceAll($vars, $indexHTML) {
	foreach ($vars as $key => $value) {
		$indexHTML = str_replace("[[".$key."]]", $value, $indexHTML);
	}
	return $indexHTML;
}

function zipFolder($folder) {
	shell_exec("/home/sites/adcase.io/src/scripts/zip.sh $folder");

}