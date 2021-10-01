<?
	$authHeader = 'Authorization: Bearer '.$_GET["access_token"];
	$headers = array(
		$authHeader
	);
	$url = $_GET["url"];
	$ch = curl_init($url);
	curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
	$data = curl_exec($ch);
	curl_close($ch);
?>