<?php

class Config {
    public static function dbConnect() {
        $conn = new mysqli("[server]", "[user]", "[pwd]", "[db]");
        Db::initialize($conn);
		mysqli_set_charset ( $conn , "UTF-8" );
    }
}
