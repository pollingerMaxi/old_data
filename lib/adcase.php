<?php
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0"); 
header("Cache-Control: post-check=0, pre-check=0", false); 
header("Pragma: no-cache"); 

header("Content-type:application/javascript");

echo "//\n";
echo "// AdCase.js JavaScript Library v8.1.5. 13/Jan/2018\n";
echo "// Copyright 2018 adcase.io \n";
echo "// https://adcase.io\n";
echo "// https://adcase.io/license \n";
echo "// AdCase.js simplifies the use of both Rich Media and display creatives in Double Click for Publishers (DFP).\n";
echo "// This is not an official Google product, and it is also not officially supported by Google.\n";
echo "//\n";


readfile("core.js"); echo "\n";
readfile("footerfixed.js"); echo "\n";
readfile("interstitial.js"); echo "\n";
readfile("push.js"); echo "\n";
readfile("videobanner.js"); echo "\n";
readfile("pushonclick.js"); echo "\n";
readfile("default.js"); echo "\n";

echo 'console.log("AdCase v8.1.5");';
echo "\n\nads.loaded = true;\nads.run();\n";