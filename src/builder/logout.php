<head>
<meta name="google-signin-client_id" content="628655424099-mt4mtcbcdjhba4e8pv1mperhtk9gvrdk.apps.googleusercontent.com">  
<script src="https://apis.google.com/js/platform.js" async defer></script>
<script>
window.setTimeout(logout,3000);

function logout() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    console.log('User signed out.');
    document.location.href= "login";
  });
}
</script>
</head>
<body>
Logging out...
</body>
</html>