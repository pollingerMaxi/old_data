<head>
<meta name="google-signin-client_id" content="628655424099-mt4mtcbcdjhba4e8pv1mperhtk9gvrdk.apps.googleusercontent.com">  
<script src="https://apis.google.com/js/platform.js" async defer></script>
<link href='https://fonts.googleapis.com/css?family=Roboto' rel='stylesheet' type='text/css'>
<script>
var g = null;
var token = "";
function onSignIn(googleUser) {
  g = googleUser;
  var profile = googleUser.getBasicProfile();
  console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
  console.log('Name: ' + profile.getName());
  console.log('Image URL: ' + profile.getImageUrl());
  console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.

  if(g.getAuthResponse().id_token) {
<?php  if(!f::getSession("USER_EMAIL")) { echo 'document.location.href = "dologin?token="+g.getAuthResponse().id_token;'; } else { echo "document.getElementById('signout').style.display='';";}  ?>
  }
}
</script>
<style>
body,div,td {font-family: 'Roboto', sans-serif;}
.signout {
  height:30px; cursor:pointer;text-align:center; padding:10px 10px 0px 10px;
}
.signout:hover {
  background-color:#eee;
}

</style>
</head>
<body>
  <div style='height:40px;margin:10px auto 0 auto;width:120px'>
<a href="#" onclick="signOut();" ><div id='signout' style='float:right;display:none;white-space: nowrap;' nowrap class='signout'>Sign out <?php echo f::getSession('USER_SHORT')?></div></a>
<div style='float:right' class="g-signin2" data-onsuccess="onSignIn"></div> 
</div>

<script>
  function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      console.log('User signed out.');
      document.location.href="dologout";
    });
  }
</script>
</body>
