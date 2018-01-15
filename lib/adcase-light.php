<?php
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0"); 
header("Cache-Control: post-check=0, pre-check=0", false); 
header("Pragma: no-cache"); 

header("Content-type:application/javascript");

echo "//\n";
echo "// Adcase.js JavaScript Library v8.1.1.light 2/Jan/2018\n";
echo "// Copyright 2018 adcase.io \n";
echo "// https://adcase.io\n";
echo "// https://jquery.io/license \n";
echo "// Adcase.js simplifies the use of both Rich Media and display creatives in Double Click for Publishers (DFP).\n";
echo "// This is not an official Google product, and it is also not officially supported by Google.\n";
echo "//\n";

readfile("core-light.js"); echo "\n";
readfile("footerfixed.js"); echo "\n";
readfile("interstitial.js"); echo "\n";
readfile("push.js"); echo "\n";
readfile("default.js"); echo "\n";

