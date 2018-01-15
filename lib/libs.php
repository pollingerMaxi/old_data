 <?php
class f 
{
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

    
}