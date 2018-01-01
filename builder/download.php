<?php

$filename = f::getParam("_file");
$local = "/home/sites/adcase.io/src/public/files/{$filename}.zip";

if(file_exists($local)) {

	header("Pragma: public");
	header("Expires: 0");
	header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
	header("Cache-Control: public");
	header("Content-Description: File Transfer");
	header("Content-type: application/octet-stream");
	header("Content-Disposition: attachment; filename=\"".$filename.".zip\"");
	header("Content-Transfer-Encoding: binary");
	header("Content-Length: ".filesize($local));
	ob_end_flush();
	@readfile($local);
  die;
} else {
	echo "$local not found";
}