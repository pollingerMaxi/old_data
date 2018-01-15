<?php
include("/home/sites/adcase.io/vendor/autoload.php");

$client = new Google_Client();
$client->setAuthConfig('/home/sites/adcase.io/conf/client_secret.json');
$client->setAccessType("offline");        // offline access
$client->setIncludeGrantedScopes(true);   // incremental auth
$client->addScope(Google_Service_Drive::DRIVE_METADATA_READONLY);
$client->setRedirectUri('https://adcase.io/login');

function getUserFromToken($token) {
  $ticket = $client->verifyIdToken($token);
  if ($ticket) {
    $data = $ticket->getAttributes();
    return $data['payload']['sub']; // user ID
  }
  return false
}