<style>
td { font-family:Arial; font-size:11px; }
</style>
<?php


$ip = $_SERVER["REMOTE_ADDR"];

$data = json_decode(file_get_contents("http://freegeoip.net/json/$ip"),true);

echo "<table>
		<tr><td>IP</td><td>{$data["ip"]}</td></tr>
		<tr><td>Country</td><td><b>{$data["country_name"]}</b></td></tr>
		<tr><td>Region</td><td>{$data["region_name"]} ({$data["region_code"]})</td></tr>
		<tr><td>City</td><td>{$data["city"]}</td></tr>
		</table>";

