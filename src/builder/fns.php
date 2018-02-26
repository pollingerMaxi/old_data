<?php

function getFormatIds() {
return array(100 => "html5",
                  101 => "push",
                  102 => "push-tag",
                  103 => "interstitial",
                  104 => "interstitial-tag",
                  105 => "videobanner",
//                  106 => "videobanner-vast",
//                  107 => "videobanner-dfp",
                  108 => "footer",
                  109 => "footer-expand",
                  110 => "footer-expand-tag",
                  111 => "html5-tag",
                  112 => "interstitial-video",
                  113 => "interstitial-video-vast",
                  114 => "interstitial-video-dfp",
                  115 => "double-top-sticky",
                  117 => "push-onclick",
                  118 => "push-onclick-tag",
                  119 => "footer-to-layer"
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

function checkLogin($url) {
  
  session_start();
  if($url=="dologin" && !f::getSession("USER_ID")) {
    $token = f::getParam("token"); 
    $data = json_decode(file_get_contents("https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=$token"),true);
    if(isset($data["name"]) && isset($data["email"])) {
      $userId = f::dbRes("select id from users where email = '".$data["email"]."'");
      if(!$userId) {
        $userId = f::dbInsert("insert into users set valid_until='2100-01-01', status=1, email='".$data["email"]."', name='".$data["name"]."', short_name='".$data["given_name"]."'");
      } 
      $_SESSION["USER_ID"] = $userId;
      $_SESSION["USER_SHORT"] = $data["given_name"];
      $_SESSION["USER_NAME"] = $data["name"];
      $_SESSION["USER_EMAIL"] = $data["email"];
      defineUser();
      if(f::getSession("login_url")) {
        header("Location:".f::getSession("login_url"));
        die;
      }
      
      return true;
    } else {
      unset($_SESSION["USER_ID"]);
      include("logout.php");
      die;
    }
     
  } else if($url=="dologout") {
    unset($_SESSION["USER_ID"]);
    unset($_SESSION["USER_SHORT"]);
    unset($_SESSION["USER_NAME"]);
    unset($_SESSION["USER_EMAIL"]);
    header("Location:login");
    die;
  }

  if(f::getSession("USER_ID")) {
    defineUser();
    return true;
  } else {
    $_SESSION["login_url"] = f::getParam("_url");
    header("Location:login");
    die;
  } 
} 

function defineUser() {
  define("USER_ID", f::getSession("USER_ID"));
  define("USER_SHORT", f::getSession("USER_SHORT"));
  define("USER_NAME", f::getSession("USER_NAME"));
  define("USER_EMAIL", f::getSession("USER_EMAIL"));
}
function analytics($url) {
  $set = "user_id='".f::getSession("USER_ID")."' and year=".date("Y")." and month=".date("m")." and day=".date("d")." and dow=".date("w")." and action='".$url."' and date=curdate()";
  $id = f::dbRes("select id from analytics where $set");
  if($id) {
    f::dbQuery("update analytics set qty=qty+1 where id='$id'");
  } else {
    f::dbInsert("insert into analytics set qty=1, user_id='".f::getSession("USER_ID")."',year=".date("Y").",month=".date("m").",day=".date("d").",dow=".date("w").",action='".$url."', date=curdate()");
  }
}