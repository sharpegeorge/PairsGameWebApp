<?php

$operation = $_POST['operation'];
$input = $_POST['inputData'];
$filePath = $_POST['path'];

if ($operation == "write") {
	$file = fopen($filePath, "w");
	fwrite($file, $input);
	fclose($file);
	echo "success";
}
else if ($operation == "read") {
	$file = fopen($filePath, "r");
	$output = fread($file,filesize($filePath));
	fclose($file);
	echo $output;
}
else {
	echo "Invalid operation";
}

?>