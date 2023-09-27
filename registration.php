<style>
	<?php include "style.css"; ?>
</style>

<?php

if(isset($_COOKIE["username"])) {
	header("Location: /index.php");
}

echo file_get_contents("html/navbar.html");
echo file_get_contents("html/registration.html");

?>
