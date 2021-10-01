<?
	$_POST = json_decode(file_get_contents('php://input'), true);
	$authHeader = 'Authorization: Bearer '.$_POST["access_token"];
	$headers = array(
		$authHeader,
		"Content-type: application/json"
	);
	$url = $_POST["url"];
	
	$ch = curl_init($url);
	curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
	curl_setopt($ch, CURLOPT_POST, true);
	curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($_POST));
	$data = curl_exec($ch);
	curl_close($ch);
?>