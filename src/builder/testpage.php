<html>
<head>
<link href='https://fonts.googleapis.com/css?family=Poppins' rel='stylesheet' type='text/css'>
<style>
body,div,td {font-family: 'Poppins', sans-serif; font-size: 12px;}
</style>
</head>
<body>
<?php

//echo USER_ID;die;
//f::dbsetDebugLevel(1);
// select first level


$networkId = 2;
$dfpId = f::dbres("select dfp_id from networks where id = {n}",array("n"=>$networkId));
$adtypes = f::dbres("select adtypes from networks where id = {n}",array("n"=>$networkId));
$keyvalues = f::dbfullres("select k,kvalues from networks_kv where network_id = {n}",array("n"=>$networkId));


$fl = f::getParam("fl");
$sl = f::getParam("sl");
$flRows = f::dbFullRes("select distinct first_level from tree where network_id = {n} order by first_level",array("n"=>$networkId));
if(!$fl) {
	$fl = $flRows[0]["first_level"];
}
$slRows = f::dbFullRes("select distinct path from tree where network_id = {n} and first_level = {f}",array("n"=>$networkId, "f"=>$fl));

$out = "<table><tr><td><iframe src='ip-info' style='border:0;width:300px;height:90px'></iframe></td><td>";

$out .= "<form action='?' id='form1' method=get>";

// first Level
$out .= "<select name='fl' onchange='s()'>";
foreach($flRows as $r) {
  $out .= "<option ".($fl==$r["first_level"]?"selected":"").">{$r["first_level"]}</option>";
}
$out .= "</select>";

// section
$selectedSl = "";
$out .= "<select name='sl' onchange='s()'>";
foreach($slRows as $r) {
  $out .= "<option ".($sl==$r["path"]?"selected":"").">{$r["path"]}</option>";
  if($sl==$r["path"]) {
    $selectedSl = $sl;
  }
}
$out .= "</select>";
if(!$selectedSl) {
  $selectedSl = $slRows[0]["path"];
}

$kv = array();
foreach($keyvalues as $keyvalue) {
  $key = $keyvalue["k"];
  $values = $keyvalue["kvalues"];
  $out .= "<table><tr><td nowrap>$key: ";
  if($values) {
  	$values = explode(",",$values);
    $out .= "<select name='key_{$key}' onchange='s()'>";
    foreach($values as $v) {
      $selected = ($v == f::getParam("key_{$key}") ? "selected" : "");
      $out .= "<option $selected>$v</option>"; 
    }
    $out .= "</select>";
  } else {
    $out .= "<input name='key_{$key}' style='width:200px' onblur='s()'>";	
  }
  $out .= "</td></tr></table>";
  $kv[$key] = f::getParam("key_{$key}");
}

$out .= "</form></td></tr></table>"
      . "<div style='width:100%'><span>Key-values: </span><span>".json_encode($kv,JSON_PRETTY_PRINT)."</span></div>"
      . "<div id='unfilled'>Unfilled:</div>";

//f::dbsetdebuglevel(1);

$out .="<div style='width:100%;overflow:hidden'>";
$adRows = f::dbFullRes("select ad_unit from tree where network_id = {n} and path = {path}",array("n"=>$networkId, "path"=>$selectedSl));
foreach($adRows as $r) {
  $divId = f::strtoken($r["ad_unit"],-1,"/");
  $adType = f::dbRes("select adtype from networks_mapping where network_id = {n} and divid = {div}",array("n"=>$networkId, "div"=>$divId));	
  //if($adType=="") { $adType=$divId; }
  $out .= "<div id='{$divId}_container' style='float:left;margin:15px'><table><tr><td id='{$divId}_ad_txt'></td></tr><tr><td><div><div class='ad-slot' id='$divId' data-adtype='{$adType}'></div></td></tr></table></div>";
}
$out .="</div>";


echo $out;
echo "
<script>function s() { document.getElementById('form1').submit(); }

ads = { cmd:[], 
  loaded:false,
  adTypesMap: [ $adtypes ], 
  network: $dfpId,
  slotRenderedCallback: {},
  kv:".json_encode($kv)."
}; 

ads.ready = function(params) {
  params = params || {};
  var manualSlotList = params.slots || false;
  if(!ads.loaded) { var s = document.createElement('script');s.async = true;s.src = 'https://adcase.io/adcase.js'; var node = document.getElementsByTagName('script')[0]; node.parentNode.insertBefore(s, node); } 
  ads.cmd.push({cmd:'run', path: '/{$selectedSl}/', manualSlotList: manualSlotList }); 
  ads.run && ads.run();
}
";
?>
var dfp = localStorage.getItem("ics.corp") ? "ics.corp" : "www";
ads.allSlotsRenderedCallback = function(event) {

  //console.log(event.isEmpty, "EVENT", event, "SLOT", event.slot.getSlotElementId());
  var slotId = event.slot.getSlotElementId();
  var parentId = document.getElementById(slotId).parentElement.id;
  var requestedSizes = JSON.stringify(ads.id[slotId].requestedSizes);
  var containerDiv = document.getElementById(parentId+"_container");

  if(event.isEmpty) {
	document.getElementById(slotId+"_txt").innerHTML = "aaa";
    document.getElementById("unfilled").innerHTML += "<br>"+parentId;
  } else {
	var text = 
	    ( "<div style='background-color:#eee;width:100%;height:30px;padding-top:5px;text-align:center;font-size:14px'><b>"+parentId+"</b></div>"
      + "AvertiserId: " + (event.advertiserId || "")
	    + "<br>OrderId: <a target='_blank' href='https://"+dfp+".google.com/dfp/1058609#delivery/OrderDetail/orderId=" + (event.campaignId || "") + "'>" + (event.campaignId || "") + "</a>"
	    + "<br>LineItemId: <a target='_blank' href='https://"+dfp+".google.com/dfp/1058609#delivery/LineItemDetail/orderId=" 
	      + (event.campaignId || "") + "&lineItemId=" + (event.lineItemId || "") + "'>" + (event.lineItemId || "") + "</a>"

	    + "<br>CreativeId: <a target='_blank' href='https://"+dfp+".google.com/dfp/1058609#delivery/PreviewCreative/orderId=" 
	      + (event.campaignId || "") + "&lineItemId=" + (event.lineItemId || "") + "&creativeId=" + (event.creativeId || "")+ "'>" + (event.creativeId || "") + "</a>"

      + "<br>Req: " + requestedSizes
      + "&nbsp;&nbsp;Ad: " + ((event.size && event.size[1]) ? ("[" + event.size[0] + "," + event.size[1] + "]"): "")
	    );
	  document.getElementById(slotId+"_txt").innerHTML += text;

    if(event.size[0]>360) {
      containerDiv.style.clear = "both";
    }

  }



}

ads.ready();

</script>
</body></html>

