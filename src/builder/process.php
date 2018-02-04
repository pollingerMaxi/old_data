<?php

if(!defined("USER_EMAIL") || USER_EMAIL!="guillef@google.com") { die; };

$uploadId=1;
$networkId = f::dbres("select network_id from uploads where id = {u}",array("u"=>$uploadId));
$c = explode("\n",f::dbRes("select content from uploads where id = {u}",array("u"=>$uploadId)));
//f::dbsetdebuglevel(1);
f::dbQuery("delete from uploads_process where upload_id = {u}",array("u"=>$uploadId));
f::dbQuery("delete from tree where network_id = {n}",array("n"=>$networkId));
$ignoreList = explode(",", f::dbRes("select ignore_first_level from networks where id = {n}", array("n"=>$networkId)));
foreach ($c as $l) {
  $f = explode(",",$l);
  if(substr($l,0,1)=="#" or !isset($f[2])) { continue; }
  $adUnit = $f[2];
  $path = getPath($adUnit);
  $firstLevel = getFirstLevel($adUnit);
  
  $insert=true;
  foreach($ignoreList as $ignore) {
	if(trim($firstLevel) == trim($ignore)) {
		$insert = false;
	}
  }
  if($insert) {
    f::dbInsert("insert into uploads_process set upload_id = {u}, ad_unit = {adUnit}, is_last = 1, path = {path}, first_level = {f}",
    	array("u"=>$uploadId, "adUnit"=>$adUnit, "path"=>$path, "f"=>$firstLevel));
  }
}

f::dbQuery("drop table if exists t");
f::dbQuery("create temporary table t as (select path from uploads_process where upload_id = {u})",array("u"=>$uploadId));
f::dbQuery("delete from uploads_process where upload_id = {u} and ad_unit in (select path from t)",array("u"=>$uploadId));
f::dbQuery("insert into tree (network_id, path, ad_unit, first_level) (select {n}, path, ad_unit,first_level from uploads_process where upload_id = {u} order by path)",array("n"=>$networkId,"u"=>$uploadId));
f::dbQuery("delete from uploads_process where upload_id = {u}",array("u"=>$uploadId));



$n = f::dbRes("select name from networks where id = {n}", array("n"=>$networkId));
$c = f::dbRes("select count(1) from tree where network_id = {n}", array("n"=>$networkId));
$s = f::dbRes("select count(distinct path) from tree where network_id = {n}", array("n"=>$networkId));
echo "Processed $n. Total: $c ad units in $s sections";

function getfirstLevel($adUnit) {
  $t = explode("/",$adUnit);
  return $t[0];	
}	
function getPath($adUnit) {
  $t = explode("/",$adUnit);
  $out = "";
  for($i=0; $i<(sizeof($t)-1); $i++) {
  	$out .= ($out==""?"":"/") . $t[$i];
  }
  return $out;
}
