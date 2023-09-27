<style>
	<?php include "style.css"; ?>
</style>

<?php 

if(isset($_COOKIE["username"])) {
	$username = $_COOKIE["username"];
	$avatarSkin = $_COOKIE["avatarSkin"];
	$avatarEyes = $_COOKIE["avatarEyes"];
	$avatarMouth = $_COOKIE["avatarMouth"];

	// Loading early so we can edit contents
	echo file_get_contents("html/navbar.html");

	// Setting navbar for a registered user
	echo "<script>
	var navbarLeaderboard = document.getElementById('navbarLeaderboard');
	navbarLeaderboard.style.display = 'inline';

	var navbarRegister = document.getElementById('navbarRegister');
	navbarRegister.style.display = 'none';

	var navbarAvatar = document.getElementById('navbarAvatar');
	navbarAvatar.style.display = 'block';

	var navbarSkin = document.getElementById('navbarSkin');
	navbarSkin.src = 'emojis/skin/$avatarSkin.png';

	var navbarEyes = document.getElementById('navbarEyes');
	navbarEyes.src = 'emojis/eyes/$avatarEyes.png';

	var navbarMouth = document.getElementById('navbarMouth');
	navbarMouth.src = 'emojis/mouth/$avatarMouth.png'
	</script>";

	echo file_get_contents("html/index.html");

	// Setting appropriate text
	echo "<script>
	var unregisteredText = document.getElementById('unregistered');
	unregisteredText.style.display = 'none';

	var registeredText = document.getElementById('registered');
	registeredText.style.display = 'block';
	</script>";
}

else {
	echo file_get_contents("html/navbar.html");
	echo file_get_contents("html/index.html");
}

?>