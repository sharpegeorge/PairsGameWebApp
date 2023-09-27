const skinVariants = ["green", "red", "yellow"];
const eyeVariants = ["closed", "laughing", "long", "normal", "rolling", "winking"];
const mouthVariants = ["open", "sad", "smiling", "straight", "surprise", "teeth"];
const filename = location.href.split("/").slice(-1)[0];
const winTimeoutMS = 3000;

var level = 0;
const maxLevel = 5;
var groupSize = 2;
const incremenetGroupSizeEveryXRounds = 2;
var numOfGroups = 3;

var flippedCards = [];
var completedCards = 0;

var timeTakenSeconds = 0;
var previousTime = 0;
var attempts = 0;
var points = 0;
var gamePoints = [];

var inputPaused = false;

const card = {
	solved: false,
	groupId: 0,
	skin: "green",
	eyes: "closed",
	mouth: "open",
	avatarElement: "",

	revealCard: function() {
		this.avatarElement.style.visibility = "visible";
	},

	hideCard: function() {
		this.avatarElement.style.visibility = "hidden";
	}
}

// Getting highscores so don't need to read multiple times
// only doing for certain pages to reduce load times
if (filename == "pairs.php" || filename == "leaderboard.php") {
	var levelHighscores = readFile("levelHighscores");
	var totalHighscores = readFile("totalHighscores");
}


// Called on click of card
function flipCard(card) {
	if (inputPaused) return;

	if (card.solved) return;

	card.revealCard();
	
	// Tracking cards that have been flipped
	flippedCards.push(card);

	// Removing input from flipped card
	card.solved = true;

	if (flippedCards.length != groupSize)
		return;


	// CHecking if every flipped card is from the same group or not
	for (const currentCard of flippedCards) {

		if (currentCard.groupId == card.groupId)
			continue;

		// Executes if one or more card is from a different group
		inputPaused = true;

		// Allowing input on cards against
		for (const flippedCard of flippedCards) {
			flippedCard.solved = false;
		}

		setTimeout(() => {
			hideFlippedCards();
			inputPaused = false;
		}, 500);
		return;
	}
		
	// Only runs if flipped cards are all from same group
	timeTakenSeconds = ((minutes * 60) + seconds) - previousTime;
	previousTime += timeTakenSeconds;

	points += calculatePoints(attempts, timeTakenSeconds);
	attempts = 0;

	// If points exceed the previous high score, the screen turns gold for the round
	const [previousHighscore, _] = getHighScoreAndName(level, levelHighscores);

	if (points > previousHighscore) {
		let background = document.getElementById("pairs");
		background.style.backgroundColor = "#FFD700";
	}
		
	let pointCounter = document.getElementById("points");
	pointCounter.textContent = "Points: " + points;

	flippedCards = [];
	completedCards += groupSize;


	if (!(gameWon()))
		return;

	// Displays level complete message
	let levelCompleteMessage = document.getElementById("levelCompleteMessage");
	levelCompleteMessage.style.display = "block";

	let background = document.getElementById("pairs");

	// Resetting for next level
	stopTimer();
	gamePoints.push(points);
	destroyCards();
	completedCards = 0;
	previousTime = 0;
	numOfGroups++

	if (level % incremenetGroupSizeEveryXRounds == 0) {
		// Incremeneting group size and displaying message
		groupSize++;
		let groupSizeMessage = document.getElementById("groupSizeMessage");
		groupSizeMessage.style.display = "block";
	}


	setTimeout(() => {
	
		// Resetting displays
		levelCompleteMessage.style.display = "none";
		groupSizeMessage.style.display = "none";
		pointCounter.textContent = "Points: 0";
		background.style.backgroundColor = "gray";
		playLevel();

	}, winTimeoutMS);
}

function generateCardElement(groupId, face) {

	// Instantiating a new card, setting attributes
	const newCard = Object.create(card);
	[newCard.skin, newCard.eyes, newCard.mouth] = face;

	newCard.groupId = groupId;

	// Creating html elements
	var newCardElement = document.createElement("div");
	newCardElement.className = "card";

	newCardElement.addEventListener("click", () => {
		flipCard(newCard);
	})

	// Creating the avatar element
	var avatarElement = document.createElement("div");
	avatarElement.className = "cardAvatar";
	newCard.avatarElement = avatarElement;
	
	// Creating elements with respetive images
	const skinImg = createImage(`emojis/skin/${newCard.skin}.png`);
	const eyesImg = createImage(`emojis/eyes/${newCard.eyes}.png`);
	const mouthImg = createImage(`emojis/mouth/${newCard.mouth}.png`);


	// Assigning to wrapper
	avatarElement.appendChild(skinImg);
	avatarElement.appendChild(eyesImg);
	avatarElement.appendChild(mouthImg);


	// Assigning respective classes
	skinImg.className = "skinLayer";
	eyesImg.className = "eyesLayer";
	mouthImg.className = "mouthLayer";

	// Adding to avatar to card
	newCardElement.appendChild(avatarElement);

	var cardsWrapper = document.getElementById("cardsWrapper");
	cardsWrapper.appendChild(newCardElement);

	return newCardElement;
}

function writeTotalHighscores(newHighscore, username) {
	const linePrefix = "#";
	const lineSuffix = "!";
	const maxRecords = 10;
	let highscores = [];

	// Extracting the highscores
	for (let level = 1; level <= maxRecords; level++) {

		const entryIndex = totalHighscores.indexOf("#" + level);

		const scoreStartIndex = totalHighscores.indexOf("Score:", entryIndex);
		const scoreEndIndex = totalHighscores.indexOf(",", scoreStartIndex);

		const currentHighscore = totalHighscores.substring(scoreStartIndex + "Score:".length, scoreEndIndex);
		highscores.push(currentHighscore);
	}

	// Checking if new high score is great enough
	if (newHighscore < highscores.slice(-1)[0])
		return;

	let rank = -1;

	// Finding the rank of the entry being replaces
	for (const [index, score] of highscores.entries()) {
		if (newHighscore > score) {
			rank = index + 1;
			break;
		}
	}

	// Finding where to insert the new entry
	const newEntryStartIndex = totalHighscores.indexOf(linePrefix + rank);

	const newEntry = "#" + rank + ",Username:" + username + ",Score:" + newHighscore + "," + rank + "!\n"

	// Inserting new entry
	let newFileContents = totalHighscores.slice(0, newEntryStartIndex) + newEntry + totalHighscores.slice(newEntryStartIndex);

	let newEntryEndIndex = newFileContents.indexOf(rank + lineSuffix);
	newEntryEndIndex = newFileContents.indexOf("\n", newEntryEndIndex);

	// Deleting last entry
	let lastEntryStartIndex = newFileContents.indexOf(linePrefix + maxRecords);
	newFileContents = newFileContents.slice(0, lastEntryStartIndex);

	// Adjusting ranks of existing entries
	for (let oldRank = maxRecords-1; oldRank >= rank; oldRank--) {
		newRank = oldRank + 1
		
		const entryStartIndex = newFileContents.indexOf(linePrefix + oldRank, newEntryEndIndex);
		newFileContents = newFileContents.slice(0, entryStartIndex+1) + newRank + newFileContents.slice(entryStartIndex+2);

		const entryEndIndex = newFileContents.indexOf(oldRank + lineSuffix, newEntryEndIndex);
		newFileContents = newFileContents.slice(0, entryEndIndex) + newRank + newFileContents.slice(entryEndIndex+1);
	}
	totalHighscores = newFileContents;
}

function writeLevelHighscores(level, newHighscore, username) {
	const filename = "levelHighscores";
	const linePrefix = "#";
	const lineSuffix = "!";

	// Getting previous highscore for given level
	let [currentHighscore, _] = getHighScoreAndName(level, levelHighscores);

	if (newHighscore <= currentHighscore)
		return;

	const previousEntry = getEntryByLevel(level);
	const newEntry = linePrefix + level + ",Username:" + username + ",Score:" + newHighscore + "," + level + lineSuffix;

	// Replacing the previous entry with the new entry for the level
	levelHighscores = levelHighscores.replace(previousEntry, newEntry);
}

function generateTotalScoresTable() {

	// Getting the element for the table
	table = document.getElementById("totalScoresTable");
	const maxRecords = 10;

	// Generates a new column in the table for each entry and fills it
	for (let rank = 1; rank <= maxRecords; rank++) {

		let [highscore, username] = getHighScoreAndName(rank, totalHighscores);

		if (highscore == null || username == null || highscore == 0) {
			highscore = "";
			username = "";
		}

		var row = table.insertRow(rank);

		// Generating cell elements
		let cell1 = row.insertCell(0);
		cell1.className = "numbering";
		let cell2 = row.insertCell(1);
		let cell3 = row.insertCell(2);

		// Setting cell contents
		cell1.innerHTML = "#" + rank;
		cell2.innerHTML = username;
		cell3.innerHTML = highscore;
	}
}

function generateLevelScoresTable() {
		
	// Getting the element for the table
	table = document.getElementById("levelScoresTable");

	// Generates a new column the in the table for each entry and fills it
	for (let level = 1; level <= maxLevel; level++) {

		let [highscore, username] = getHighScoreAndName(level, levelHighscores);

		if (highscore == null || username == null || highscore == 0) {
			highscore = "";
			username = "";
		}

		var row = table.insertRow(level);

		// Generating cell elements
		let cell1 = row.insertCell(0);
		cell1.className = "numbering";
		let cell2 = row.insertCell(1);
		let cell3 = row.insertCell(2);

		// Setting cell contents
		cell1.innerHTML = level;
		cell2.innerHTML = username;
		cell3.innerHTML = highscore;
	}
}

function getHighScoreAndName(entryNum, highscores) {
	const linePrefix = "#";
	const lineSuffix = "!";
		
	// Finding the entry for the given level
	const lineStartIndex = highscores.indexOf(linePrefix + entryNum);
	const lineEndIndex = highscores.indexOf(entryNum + lineSuffix) +2;
	const entry = highscores.substring(lineStartIndex, lineEndIndex);

	// Getting highscore for that level
	const scoreStartIndex = entry.indexOf("Score:");
	const scoreEndIndex = entry.indexOf(",", scoreStartIndex);
	const highscore = entry.substring(scoreStartIndex + "Score:".length, scoreEndIndex);

	// Getting username for that level
	const usernameStartIndex = entry.indexOf("Username:");
	const usernameEndIndex = entry.indexOf(",", usernameStartIndex);
	const username = entry.substring(usernameStartIndex + "Username:".length, usernameEndIndex);

	return [highscore, username];
}

function saveNewHighscore() {
	// Getting users cookies
	const cookies = document.cookie;
	
	// Extracting username from cookie data
	const usernameStartIndex = cookies.indexOf("username=") + "username=".length;
	const usernameEndIndex = cookies.indexOf(";", usernameStartIndex);
	const username = cookies.slice(usernameStartIndex, usernameEndIndex);

	// Writing a highscore for each level
	for (let level = 1; level <= maxLevel; level++) {
		
		const pointsForLevel = gamePoints[level-1];

		writeLevelHighscores(level, pointsForLevel, username);
	}

	// Writing a total highscore
	const totalPoints = gamePoints.reduce((sum, element) => sum + element, 0);
	writeTotalHighscores(totalPoints, username);

	// Writing all highscores to text file
	writeFile("totalHighscores", totalHighscores);
	writeFile("levelHighscores", levelHighscores);

	// Changing to leaderboard page
	window.location = "/leaderboard.php";
}

function getEntryByLevel(level) {
	const linePrefix = "#";
	const lineSuffix = "!";

	// Finding the entry for the given level
	const lineStartIndex = levelHighscores.indexOf(linePrefix + level);
	const lineEndIndex = levelHighscores.indexOf(level + lineSuffix);
	const entry = levelHighscores.substring(lineStartIndex, lineEndIndex + (level + lineSuffix).length);

	return entry;
}

function playLevel() {

	hideEndScreen();
	startTimer();

	level++;

	if (level > maxLevel) {
		gameOver();
		return;
	}
	
	// Setting up elements
	var levelIndicator = document.getElementById("level");
	levelIndicator.textContent = "Level: " + level;

	let buttonElement = document.getElementById("startGameButton");
	buttonElement.style.display = "none";

	// Generating cards
	var groups = generateCardGroups(numOfGroups, groupSize);

	// Randomising order the cards appear
	let allCards = groups.flat();
	randomiseCardOrder(allCards);	
}

function gameOver() {
	stopTimer();
	level = 0;
	points = 0;
	groupSize = 2;
	numOfGroups = 3;

	// Displaying elements for the end screen
	showEndScreen();

	let	submitQuestion = document.getElementById("submitQuestion")
	let submitButton = document.getElementById("submitButton")

	// If registered, allows users to submit their score
	if (registered()) {
		submitQuestion.style.display = "inline";
		submitButton.style.display = "inline-block";
	}
}

function registered() {
	// Checking if the user is registered
	const cookies = document.cookie;
	const usernameIndex = cookies.indexOf("username=");

	if (usernameIndex == -1)
		return false;
	return true;
}

function generateCardGroups(numberOfGroups, sizeOfGroups=2) {
	let previousFaces = []

	if(!numberOfGroups || numberOfGroups === 0) return;

	let groups = []
	// Creates the groups of cards
	for (var groupId = 0; groupId < numberOfGroups; groupId++) {

		// Generating random unique face
		const newFace = generateRandomFace(previousFaces);
		previousFaces.push(newFace);

		// Generates cards for the current group (with the same face and groupId)
		let newGroup = []
		for (var cardCounter = 0; cardCounter < sizeOfGroups; cardCounter++) {
			
			const newCard = generateCardElement(groupId, newFace);
			newGroup.push(newCard);
		}
		groups.push(newGroup);
	}

	return groups;
}

function generateRandomFace(previousFaces) {
	
	// Generates a random face (combination of skin, eyes and mouths) until its unique
	while (true) {
		const skin = getRandomElementFromArray(skinVariants);
		const eyes = getRandomElementFromArray(eyeVariants);
		const mouth = getRandomElementFromArray(mouthVariants);

		const newFace = [skin, eyes, mouth];

		//Using JSON.stringify to compare arrays
		const isDuplicate = (face) => JSON.stringify(face) == JSON.stringify(newFace);
		if (!(previousFaces.some(isDuplicate))) return newFace;
	}
}

function receiveRegistrationForm(username, skin, eyes, mouth) {
	// Checks input for username meets the criteria
	valid = validateUsername(username);
	cookieDurationDays = 30;

	if (valid) {
		// Sets cookies for the user
		setCookie("username", username, cookieDurationDays);
		setCookie("avatarSkin", skin, cookieDurationDays);
		setCookie("avatarEyes", eyes, cookieDurationDays);
		setCookie("avatarMouth", mouth, cookieDurationDays);

		// Redirets to the pairs page
		window.location = "/pairs.php";

	} else {
		
		// Displays an error message if the input is not valid
		var errorMessageElement = document.getElementById("errorMessage");
		errorMessageElement.style.visibility = "visible";
	}
}

function validateUsername(username) {
	var invalidCharacters = `"!@#%&*()+={}[]-;:'<>?/`;	

	// Checks if the username contains any invalid characters and returns a boolean value
	for (const char1 of username) {
		for (const char2 of invalidCharacters) {
			if (char1 == char2) {
				return false;
			}
		}
	}

	return true;
}

function calculatePoints(attempts, timeTakenSeconds) {
	let points = Math.pow(groupSize, 4) - (groupSize * attempts) - timeTakenSeconds;

	if (points < Math.pow(groupSize, 2))
		points = Math.pow(groupSize, 2);

	return points;
}

function setSkinPreview(colour) {

	// Generating new img address
	var filename = `emojis/skin/${colour}.png`;

	// Setting image to new png
	var skinElement = document.getElementById("skinPreview");
	skinElement.src = filename;
}

function setEyesPreview(eyes) {

	// Generating new img address
	var filename = `emojis/eyes/${eyes}.png`;

	// Setting image to new png
	var eyesElement = document.getElementById("eyesPreview");
	eyesElement.src = filename;
}

function setMouthPreview(mouth) {

	// Generating new img address
	var filename = `emojis/mouth/${mouth}.png`;

	// Setting image to new png
	var mouthElement = document.getElementById("mouthPreview");
	mouthElement.src = filename;
}

function showLevelScoresTable() {
	// Displays the level score table and hides the total score table
	levelTable = document.getElementById("levelScoresTable");
	levelTable.style.display = "block";

	totalTable = document.getElementById("totalScoresTable");
	totalTable.style.display = "none";
}

function showTotalScoresTable() {
	// Displays the total score table and hides the level score table
	levelTable = document.getElementById("levelScoresTable");
	levelTable.style.display = "none";

	totalTable = document.getElementById("totalScoresTable");
	totalTable.style.display = "block";
}

function showEndScreen() {
	// Shows and hides elements to display the end screen	

	let headerElement = document.getElementById("pairsHeader");
	headerElement.style.display = "none";

	let endScreen = document.getElementById("endGameScreen");
	endScreen.style.display = "block";

	let victoryMessage = document.getElementById("victoryMessage");
	const totalPoints = gamePoints.reduce((sum, element) => sum + element, 0);
	victoryMessage.textContent = "You Win! Score: " + totalPoints;
	victoryMessage.style.display = "inline";

	let playAgainButton = document.getElementById("playAgainButton");
	playAgainButton.style.display = "inline-block";
}

function hideEndScreen() {
	// Shows and hides elements to remove the end screen

	let headerElement = document.getElementById("pairsHeader");
	headerElement.style.display = "block";

	let	endScreen = document.getElementById("endGameScreen");
	endScreen.style.display = "none";

	let victoryMessage = document.getElementById("victoryMessage");
	victoryMessage.style.display = "none";

	let playAgainButton = document.getElementById("playAgainButton");
	playAgainButton.style.display = "none";
}

function destroyCards() {
	// Destroys every card

	const cards = document.getElementsByClassName("card");
	
	while (cards.length > 0) {
		cards[0].parentNode.removeChild(cards[0]);
	}
}

function hideFlippedCards() {
	// Hides the avatar for all flipped cards (does not include completed groups)

	for (let i = 0; i < flippedCards.length; i++) {
		flippedCards[i].hideCard();
	}
	flippedCards = [];
}

//// Timer code
let seconds = 0;
let minutes = 0;
let timer = null;
let timerActive = false;
let stringSeconds = "";
let stringMinutes = "";

function stopwatch() {
	
	if (timerActive == false) return;

	seconds++;

	if(seconds == 60) {
		seconds = 0;
		minutes++;
	}

	if(minutes >= 60) {
		stopTimer();
	}


	if (seconds < 10) {
		stringSeconds = "0" + seconds;
	}
	else {
		stringSeconds = seconds;
	}


	if (minutes < 10) {
		stringMinutes = "0" + minutes;
	}
	else {
		stringMinutes = minutes;
	}

	let timerElement = document.getElementById("timer");
	timerElement.textContent = stringMinutes + ":" + stringSeconds;
}

function startTimer() {
	// Starts the timer and resets values

	if (!(timer==null)) {
		clearInterval(timer);
	}
	minutes = 0;
	seconds = 0;
	
	let timerElement = document.getElementById("timer");
	timerElement.textContent = "00:00";

	timerActive = true;
	timer = setInterval(stopwatch, 1000)
}

function stopTimer() {
	timerActive = false;
}
//// End of timer code

function readFile(filename) {
	// Reads a highscore fils via a POST request with the server

	const filePath = "highscores/" + filename + ".txt";

	return $.ajax({
		type: 'POST',
		url: 'readWrite.php',
		async: false,
		data: { operation:"read", inputData: "", path: filePath },
		success:function(result){
			return result;
		}
	}).responseText;
}

function writeFile(filename, input) {
	// Writes a highscore file via a POST request with the server

	const filePath = "highscores/" + filename + ".txt";
	
	$.ajax({
		type: 'POST',
		url: 'readWrite.php',
		data: { operation:"write", inputData: input, path: filePath }
	});
}

function getRandomElementFromArray(array) {
	if (!array) return;
	return array[Math.floor(Math.random() * array.length)];
}

function randomiseCardOrder(cards) {
	// Randomises card order and sets it to each element
	cards = shuffle(cards);

	for (const [index, card] of cards.entries()) {
		card.style.order = index;	
	}
}

function shuffle(array) {
	//Fisher-yates shuffle algorithm

	let currentIndex = array.length, randomIndex;

	while (currentIndex != 0) {

		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// Swapping elements
		let temp = 0;
		temp = array[randomIndex];
		array[randomIndex] = array[currentIndex];
		array[currentIndex] = temp;
	}

	return array;
}

function setCookie(name, value, days) {
	// Sets a cookie using the parameters passed

	var date = new Date();
	date.setTime(date.getTime() + (days * 86400));
	document.cookie = name + "=" + value + "; expires=" + date.toGMTString();
}

function createImage(source) {
	// Creates a new image element with the source set
	const newImg = new Image();
	newImg.src = source;

	return newImg
}

function gameWon() {
	// Checks if the game is run and returns a boolean value

	let numCards = groupSize * numOfGroups;
	return (numCards == completedCards);
}