http://ml-lab-4d78f073-aa49-4f0e-bce2-31e5254052c7.ukwest.cloudapp.azure.com:64700

-navigation bar with user's custom avatar and buttons for pages
-background image

index:
-button and text to register/play (dependent on if user is already registered)

register:
-username input with validation
-text-shadow for better readability
-select avatar skin, eyes, mouth
-get a preview of avatar in real time
-saves username and avatar in cookies

pairs:
-boxshadow
-level system, timer, point system
-start game button
-randomly generated faces on cards
-random order of cards
-pauses after and incorrect set of flips so user can see card faces easily
-increases number of card groups per level
-increase size of card groups every 2 levels
-total of 5 levels, but can be changed easily at the top of script.js
-background turns gold for the level if current score beats highscore
-level complete text displayed every time a level is complete
-on completion of level 5, displays score and buttons to play again, or submit to leaderboard (if registered)
-clicking play again resets everything

leaderboard:
-displays rank/level, username, scores per entry
-buttons to switch between level highscores and total
-leaderboard data is persistent (is the same between users and sessions)
-total highscores sorted in descending order (capped at 10)
-level highscores capped at 5 (number of levels)