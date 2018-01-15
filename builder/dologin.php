<?php
session_start();

include("/home/sites/adcase.io/vendor/autoload.php");

$client = new Google_Client();
$client->setAuthConfig('/home/sites/adcase.io/conf/client_secret.json');
$token = $_GET["code"];


  $ticket = $client->verifyIdToken($token);
  if ($ticket) {
    $data = $ticket->getAttributes();
    print_r($data);
  } else {
  	echo "error";
  }

/*


define('CLIENT_ID', '628655424099-mt4mtcbcdjhba4e8pv1mperhtk9gvrdk.apps.googleusercontent.com');
define('CLIENT_SECRET', 'r-p2TcYvOV5TsUKLI1LhnnLm');
define('CLIENT_REDIRECT_URL', 'https://adcase.io/builder/dologin');

// Holds the various APIs involved as a PHP class. Download this class at the end of the tutorial
require_once('google-login-api.php');

// Google passes a parameter 'code' in the Redirect Url
if(isset($_GET['code'])) {
	echo $_GET['code'];
	try {
		$gapi = new GoogleLoginApi();
		
		// Get the access token 
		$data = $gapi->GetAccessToken(CLIENT_ID, CLIENT_REDIRECT_URL, CLIENT_SECRET, $_GET['code']);

		// Access Tokem
		$access_token = $data['access_token'];
		
		// Get user information
		$user_info = $gapi->GetUserProfileInfo($access_token);

		echo '<pre>';print_r($user_info); echo '</pre>';

		// Now that the user is logged in you may want to start some session variables
		$_SESSION['logged_in'] = 1;

		// You may now want to redirect the user to the home page of your website
		// header('Location: home.php');
	}
	catch(Exception $e) {
		echo $e->getMessage();
		exit();
	}
}

/*/
