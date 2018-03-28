<?php
include("db.php");
include("/home/sites/adcase.io/conf/adcase_conf.php");

class f 
{
    use dbTrait;
    public static function getSession($p) 
    {
        return (isset($_SESSION[$p])?$_SESSION[$p]:"");
    }
    public static function getParam($p) 
    {
        $out = "";
        if(isset($_GET[$p])) {
            $out = $_GET[$p];
        } else if(isset($_POST[$p])) {
            $out = $_POST[$p];
        }
        return $out;
    }
    
    public static function strtoken($string, $pos, $token)
    {
        $explode = explode($token, $string);
        if (abs($pos) > sizeof($explode) || $pos == 0) {
                $out = '';
        } else if ($pos > 0) {
                $out = $explode [$pos-1];
        } else if ($pos < 0) {
                $out = $explode [sizeof($explode) + $pos];
        }
        return trim($out);
    }

public static function conv($n) {
  return convBase($n, "01234567890", "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
}
    
    public static function setResponseJson($r) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($r,JSON_UNESCAPED_UNICODE);
    }
}


function convBase($numberInput, $fromBaseInput, $toBaseInput)
{
    if ($fromBaseInput==$toBaseInput) return $numberInput;
    $fromBase = str_split($fromBaseInput,1);
    $toBase = str_split($toBaseInput,1);
    $number = str_split($numberInput,1);
    $fromLen=strlen($fromBaseInput);
    $toLen=strlen($toBaseInput);
    $numberLen=strlen($numberInput);
    $retval='';
    if ($toBaseInput == '0123456789')
    {
        $retval=0;
        for ($i = 1;$i <= $numberLen; $i++)
            $retval = bcadd($retval, bcmul(array_search($number[$i-1], $fromBase),bcpow($fromLen,$numberLen-$i)));
        return $retval;
    }
    if ($fromBaseInput != '0123456789')
        $base10=convBase($numberInput, $fromBaseInput, '0123456789');
    else
        $base10 = $numberInput;
    if ($base10<strlen($toBaseInput))
        return $toBase[$base10];
    while($base10 != '0')
    {
        $retval = $toBase[bcmod($base10,$toLen)].$retval;
        $base10 = bcdiv($base10,$toLen,0);
    }
    return $retval;
}

//f::dbSetDebugLevel(0);

Config::dbConnect();
