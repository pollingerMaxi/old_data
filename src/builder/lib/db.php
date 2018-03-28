<?php

trait dbTrait 
{
	static $dbDebugLevel = false;

	public static function dbFullRes($sql, $params=array(), $option1=null, $option2=null, $option3=null) 
	{ 
		$result = self::dbFetchAll($sql, $params, $option1, $option2, $option3);
        return $result; 
	}
	
	public static function dbFirstRow($sql, $params=array(), $option1=null, $option2=null, $option3=null) 
	{ 
		$result = self::dbFetch($sql, $params, $option1, $option2, $option3);
        return $result; 
	}
	
	public static function dbRes($sql, $params=array(), $option1=null, $option2=null, $option3=null) 
	{
		$result = self::dbFetch($sql, $params, $option1, $option2, $option3);
		if(is_array($result)) {
			foreach($result as $k=>$v) {
				return $v;
			}
		}
	}
	
	public static function dbJson($sql, $params=array(), $option1=null, $option2=null, $option3=null) 
	{ 
		$result = self::dbFetch($sql, $params, $option1, $option2, $option3);
		if(is_array($result)) {
			foreach($result as $k=>$v) {
				return json_decode($v,true);
			}
		}
	}
	
	public static function dbQuery($sql, $params=array(), $option1=null, $option2=null, $option3=null) 
	{ 
		self::dbFetch($sql, $params, $option1, $option2, $option3);
	}
	
	public static function dbInsert($sql, $params=array(), $option1=null, $option2=null, $option3=null)  { 
		self::dbFetch($sql, $params, $option1, $option2, $option3);
		return Db::$dbo->insert_id;
	}
	
	public static function dbInsertId() 
	{ 
		return Db::$dbo->insert_id;
	}
	
	public static function dbEscape($string) 
	{ 
		return substr(Db::$dbo->quote($string),1,-1);
	}

	public static function dbSetDebugLevel($debug = 1) {
		self::$dbDebugLevel = $debug;
	}

	public static function dbGetDebugLevel() {
		return (self::$dbDebugLevel);
	}
	
	private static function dbPrepareSql($sql, $params) {
		if(!is_array($params)) {
			return $sql;
		}
		$sql .= " ";
		foreach ($params as $k => $v) {
			$params[strtolower($k)] = $v;
		}

		$pos = mb_strpos($sql, "{", 0, "UTF-8");
		$i=0;
		$replacements = array();
		while($pos and $i++<1000) {
			
			$pos2 = mb_strpos($sql, "}", $pos, "UTF-8"); 
			$var = mb_substr($sql, $pos+1, $pos2 - $pos - 1, "UTF-8");
			$type = strtolower(self::strtoken($var, 1, ":"));
			$name = strtolower(self::strtoken($var, -1, ":"));
			$value = '';
			if($type == "p") {
				// quoted from page parameter
				$value = self::getParam($name);
				if(is_null($value)) {
					$value = "null";
				} else if(!is_numeric($value)) {
					$value = "'".Db::$dbo->real_escape_string($value)."'";
				}

			} else if($type == "d") {
				// direct, no quotes. This is for table names or special structures
				$value = $params[$name];
				$value = substr(substr(Db::$dbo->quote($value),1),0,-1);
			} else if($type == "n") {
				// direct, no quotes & no encoding. This is for table names or special structures. Try to avoid this one!
				$value = $params[$name];
			} else if (isset($params[$name])){
				// quoted from query parameter
				if(is_array($params[$name])) {
					// if an array, convert to json string
					$value = json_encode($params[$name], JSON_UNESCAPED_UNICODE);
				} else {
					$value = $params[$name];
				}
				if(is_null($value)) {
					$value = "null";
				} else if(!is_numeric($value)) {
					$value = "'".Db::$dbo->real_escape_string($value)."'";
				}
			} else {
				$value = "null";
			}

			$replacements["{".$var."}"] = $value;

			if ($pos2 + 1 >= mb_strlen($sql, "UTF-8")) {
				break;
			}
			$pos = mb_strpos($sql, "{", $pos2, "UTF-8");
		}
		
		foreach ($replacements as $var => $value) {
			$sql = str_replace($var,$value,$sql);
		}

		if(self::dbGetDebugLevel()) {
			echo "\n".$sql."\n";
		}
		return $sql;
	}
	
	private static function dbFetchAll($sql, $params=array(), $option1=null, $option2=null, $option3=null) 
	{
		$convert = defined("SQL_ESCAPE") && ($option1 == SQL_ESCAPE or $option2 == SQL_ESCAPE or $option3 == SQL_ESCAPE);
		if($convert) {}

		$sql = self::dbPrepareSql($sql, $params);

		$result = array();
		$res = Db::$dbo->query($sql);
		while ($row = $res->fetch_array(MYSQLI_ASSOC)) { 
			$result[] = $row;
		};
		return $result;
	}
	
	private static function dbFetch($sql, $params=array(), $option1=null, $option2=null, $option3=null) 
	{
		$convert = defined("SQL_ESCAPE") && ($option1 == SQL_ESCAPE or $option2 == SQL_ESCAPE or $option3 == SQL_ESCAPE);
		if($convert) {}
		
		$sql = self::dbPrepareSql($sql, $params);

		$res = Db::$dbo->query($sql);
		if(substr($sql,0,6)=="select") {
			$result = $res->fetch_array(MYSQLI_ASSOC);
			return $result;
		}
	}
}


class Db {
    public static $dbo=null;

    public static function initialize($dbo) 
    {
        self::$dbo = $dbo;
    }
}

