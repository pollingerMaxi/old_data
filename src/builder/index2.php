<?php 

f::dbsetDebugLevel(true);
checkLogin2();
echo 3;
print_r($_SESSION);
echo f::getSession("USER_ID");


function checkLogin2($url="") {
  
  if($url=="dologin") {
    $_SESSION["USER_TOKEN"] = f::getParam("token"); 
    header("Location:html5");
    die;   
  } else if($url=="dologout") {
    unset($_SESSION["USER_TOKEN"]);
    unset($_SESSION["USER_SHORT"]);
    unset($_SESSION["USER_NAME"]);
    unset($_SESSION["USER_EMAIL"]);
    header("Location:login");
    die;
  }


  $token = f::getSession("USER_TOKEN");
  if($token) {
    $data = json_decode(file_get_contents("https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=$token"),true);
    if(isset($data["name"]) && isset($data["email"])) {
      $_SESSION["USER_SHORT"] = $data["given_name"];
      $_SESSION["USER_NAME"] = $data["name"];
      $_SESSION["USER_EMAIL"] = $data["email"];
echo 1111;
$userId = f::dbRes("select id from users where email = '".f::getSession("USER_EMAIL")."'");
if(!$userId) {
  $userId = f::dbInsert("insert into users set valid_until='2100-01-01', status=1, email='".f::getSession("USER_EMAIL")."', name='".f::getSession("USER_NAME")."', short_name='".f::getSession("USER_SHORT")."'");
} 
$_SESSION["USER_ID"] = $userId;
      //print_r($data);


echo 22222;
     // echo "TOKEN OK!<br>"."https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=$token";
      return;
    } else {
      unset($_SESSION["USER_TOKEN"]);
      include("logout.php");
      die;
    }
  } else {
    header("Location:login");
    die;
  }
  
  die;

}