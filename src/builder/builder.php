<?php

printHeader();
if(file_exists(__DIR__."/formats/{$formatId}-{$formatName}/{$formatName}-form.php")) {
	include(__DIR__."/formats/{$formatId}-{$formatName}/{$formatName}-form.php");
} else {
	echo "template not found";
}

printFooter();

function printHeader() {
?>
<!DOCTYPE html>
<html lang="en">

<head>
<style>
select {height:40px;}
</style>
<script
  src="https://code.jquery.com/jquery-2.2.4.min.js"
  integrity="sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44="
  crossorigin="anonymous"></script>
    <!-- Bootstrap core CSS -->

    <link href="/css/bootstrap.css" rel="stylesheet">
    <!-- Material Design Bootstrap -->
    <link href="/css/mdb.min.css" rel="stylesheet">
<script>
var w = { builder:{} };
w.builder.submit =function() {
	$("#downloadButton").html("");
		var form = new FormData($("#builderForm")[0]);
		console.log(form);
		form.t =  $("#t").val();

		$.ajax({
		        url: "/builder/build", // session_id="+w.sessionId
		        method: "POST",
		        dataType: 'json',
		        data: form,
		        processData: false,
		        contentType: false,
		        success: function(result){
		        	console.log("SUCCESS");
		        	
		        	w.builder.success(result.ad_id);

					$("#pageform").hide();
					$("#backButton").show();
					//$("#pagePreview").html(w.builder.showPreview(result.ad_id)).show();
					//$("#pagePreviewButtons").html(`<a href='javascript:w.builder.save()' class='btn btn-default left'>Save and get Download URL</a>`);

		        },
		        error: function(er){
		        	if(er && er.responseJSON && er.responseJSON.errors && er.responseJSON.errors[0]) {
		        	alert(er.responseJSON.errors[0]);
		        	} else {
		        		alert("Error in form. Please review all values");
		        	}
		        }
		});
	}
w.builder.success = function(adId) {

  var html = "<button onclick=\"document.location.href='/f/"+adId+"'\" class='btn btn-success'>Download Creative</button>";

  $("#downloadButton").html(html);

}
function go(url) {
	document.location.href="/builder/"+url;
}
</script>
<style>
.list-group li:hover {background-color:#f9f9f9;cursor:pointer;}
.list-group li.title {font-weight:bold;background-color:#eee; color:#627aac;}
.list-group li.title:hover {background-color:#eee;cursor:default;font-weight:bold;}
.list-group li span {color:#627aac;font-weight:bold;}
</style>



<meta name="google-signin-client_id" content="628655424099-mt4mtcbcdjhba4e8pv1mperhtk9gvrdk.apps.googleusercontent.com">  
<script src="https://apis.google.com/js/platform.js" async defer></script>
<link href='https://fonts.googleapis.com/css?family=Poppins' rel='stylesheet' type='text/css'>
<script>
function onSignIn(googleUser) {}
  function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      console.log('User signed out.');
      document.location.href="dologout";
    });
  }
</script>
<style>
body,div,td {font-family: 'Poppins', sans-serif;}
.signout {
  height:30px; cursor:pointer;text-align:center; padding:8px 10px 0px 10px;color:#eee;
}
.signout:hover {
  color:white;font-weight:bold;
}
main { float:left;}
</style>





</head>
<body>
<!--Main Navigation-->
<header>
<nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container">
        <span onclick='w.go("/")' style='color:white;cursor:pointer' class="navbar-brand">adcase.io - Ad builder</span>
        <span style='float:left;color:white;font-weight:bold' id='publisher_name'></span>
        <div style='float:right'>

<div id='signout' style='float:right;display:;white-space: nowrap;color:white'>
<?php echo USER_NAME ?>
<a href="#" onclick="signOut();" class='signout'>Sign out</a>
</div>
<div style='display:none'>
<div style='float:right' class="g-signin2" data-onsuccess="onSignIn"></div></div> 


            <div style='display:none;float:right' id="signin" class="g-signin2" data-prompt="select_account" data-onsuccess="signIn"></div>
            <span id='userName' style='color:white'></span>&nbsp;&nbsp;&nbsp;&nbsp;
            <span id='signout' style='float:right;display:none'><a  href='#' onclick='w.login.signOut();' style='color:white'>Sign out</a></span>
    </div></div>
</nav></header>
<table>
	<tr>
<td style="width:300px" valign="top">
<ul class="list-group">
  <li class="list-group-item title" style="background-color: white; color: black;">Rich Media Formats</li>
<?php
  $formatName = f::getParam("_url");
  $data = getFormatIds();
  foreach($data as $k => $v) {
    echo "<li onclick='go(\"{$v}\")' id='{$k}' class='list-group-item' style='background-color:".($formatName == $v?"#ddd":"")."'><span>{$k}</span> {$v}</li>";
  }
 
?>
<!--
  <li onclick='go("html5")' id="100" class="list-group-item"><span>100</span> HTML5</li>
  <li onclick='go("push")' id="101" class="list-group-item"><span>101</span> Expanding Push</li>
  <li onclick='go("push-tag")' id="102" class="list-group-item"><span>102</span> Expanding Push (tag)</li>
  <li onclick='go("interstitial")' id="103" class="list-group-item"><span>103</span> Interstitial</li>
  <li onclick='go("interstitial-tag")' id="104" class="list-group-item"><span>104</span> Interstitial (tag)</li>
  <li onclick='go("videobanner")' id="105" class="list-group-item"><span>105</span> MP4 Video Banner</li>
  <li onclick='go("videobanner-vast")' id="106" class="list-group-item"><span>106</span> VAST Video Banner</li>
  <li onclick='go("videobanner-dfp")' id="107" class="list-group-item"><span>107</span> DFP Video Banner</li>
  <li onclick='go("footer")' id="108" class="list-group-item"><span>108</span> Fixed Footer</li>
  <li onclick='go("footer-expand")' id="109" class="list-group-item"><span>109</span> Expandable Footer</li>
<!--
  <li id="104" class="list-group-item" style="background-color: white; color: black;"><span>104</span> Lateral banner</li>
  <li id="105" class="list-group-item" style="background-color: white; color: black;"><span>105</span> Lateral Fixed</li>
  <li id="106" class="list-group-item" style="background-color: white; color: black;"><span>106</span> Header Fixed</li>
  <li id="107" class="list-group-item" style="background-color: white; color: black;"><span>107</span> Footer Fixed</li>
  <li id="108" class="list-group-item" style="background-color: white; color: black;"><span>108</span> Inline parallax</li>

  <li class="list-group-item title" style="background-color: white; color: black;">Standard Banners</li>
  <li id="201" class="list-group-item" style="background-color: white; color: black;"><span>201</span> 300x250 Standard</li>
  <li id="202" class="list-group-item" style="background-color: white; color: black;"><span>202</span> 300x600 Standard</li>
  <li id="203" class="list-group-item" style="background-color: white; color: black;"><span>203</span> 160x600 Standard</li>
  <li class="list-group-item" onclick="config()" style="background-color: white; color: black;">Configuration</li>
-->
</ul>
<img src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' height=1 width=300>
</td>
	<td valign=top>
<!--Main Navigation-->

<?php
}

function printFooter() {
?>


<?php
	echo "</td></tr></table>";
}